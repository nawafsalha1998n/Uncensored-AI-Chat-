import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/clerk-prisma";
import { prisma } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const { messages, chatId, model = "gemini-2.0-flash" } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "الرسائل مطلوبة" }, { status: 400 });
    }

    const user = await getOrCreateUser();
    let currentChatId = chatId;

    if (!currentChatId) {
      const chat = await prisma.chat.create({
        data: {
          userId: user.id,
          title: messages[messages.length - 1]?.content?.slice(0, 60) || "محادثة جديدة",
        },
      });
      currentChatId = chat.id;
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "user") {
      await prisma.message.create({
        data: {
          role: "user",
          content: lastMessage.content,
          chatId: currentChatId,
          modelUsed: model,
          isUncensored: true,
        },
      });
    }

    // --- Google Gemini Logic ---
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const genModel = genAI.getGenerativeModel({ model: model });
    
    // تحويل الرسائل لتنسيق Gemini
    // Gemini لا يدعم system prompt مباشر في بعض الموديلات، لذا ندمجه
    const chatInstance = genModel.startChat({
      history: messages.slice(0, -1).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.9, // إبداع أعلى للدردشة
      },
    });

    const result = await chatInstance.sendMessage(lastMessage.content);
    const aiResponse = result.response.text();

    await prisma.message.create({
      data: {
        role: "assistant",
        content: aiResponse,
        chatId: currentChatId,
        modelUsed: model,
        isUncensored: true,
      },
    });

    return NextResponse.json({
      content: aiResponse,
      chatId: currentChatId,
    });

  } catch (error: any) {
    console.error("❌ Chat Error:", error);
    return NextResponse.json(
      { error: error.message || "فشل في الرد" },
      { status: 500 }
    );
  }
}
