import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/clerk-prisma";
import { prisma } from "@/lib/db";
import { generateAIResponse, chatModels } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const { messages, chatId, model = "llama-3.2-3b" } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "الرسائل مطلوبة" }, { status: 400 });
    }

    const user = await getOrCreateUser();
    let currentChatId = chatId;

    if (!currentChatId) {
      const chat = await prisma.chat.create({
         {
          userId: user.id,
          title: messages[messages.length - 1]?.content?.slice(0, 60) || "محادثة جديدة",
        },
      });
      currentChatId = chat.id;
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "user") {
      await prisma.message.create({
         {
          role: "user",
          content: lastMessage.content,
          chatId: currentChatId,
          modelUsed: model,
          isUncensored: true,
        },
      });
    }

    // ✅ توليد الرد عبر الدالة الموحدة
    const aiResponse = await generateAIResponse(messages, model);

    await prisma.message.create({
       {
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
      model: model,
    });

  } catch (error: any) {
    console.error("❌ Chat Error:", error);
    
    let userMessage = error.message || "فشل في الرد";
    
    // رسائل خطأ مخصصة
    if (error.message?.includes("OpenRouter API key")) {
      userMessage = "مفتاح OpenRouter غير صحيح أو غير مفعل";
    }
    if (error.message?.includes("429") || error.message?.includes("rate limit")) {
      userMessage = "⚠️ تم تجاوز الحد المجاني. جرب بعد دقيقة، أو اختر نموذجاً أخف.";
    }
    if (error.message?.includes("model not found")) {
      userMessage = "هذا الموديل غير متاح حالياً. جرب: Llama 3.2 3B أو Qwen 2.5";
    }
    
    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
