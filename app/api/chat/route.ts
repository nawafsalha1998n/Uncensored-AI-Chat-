import { NextRequest, NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai";
import { getOrCreateUser } from "@/lib/clerk-prisma";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { messages, isUncensored = true, chatId } = await request.json();

    const user = await getOrCreateUser();

    let currentChatId = chatId;

    // إنشاء محادثة جديدة لو مفيش chatId
    if (!currentChatId) {
      const chat = await prisma.chat.create({
        data: {
          userId: user.id,
          title: messages[0]?.content?.slice(0, 60) || "محادثة جديدة",
        },
      });
      currentChatId = chat.id;
    }

    // حفظ رسالة المستخدم الأخيرة
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "user") {
      await prisma.message.create({
        data: {
          role: "user",
          content: lastMessage.content,
          chatId: currentChatId,
          isUncensored,
        },
      });
    }

    // توليد الرد من Groq
    const aiResponse = await generateAIResponse(messages, user.id, isUncensored);

    // حفظ رد الـ AI
    await prisma.message.create({
      data: {
        role: "assistant",
        content: aiResponse,
        chatId: currentChatId,
        isUncensored,
        modelUsed: "llama-3.3-70b-versatile",
      },
    });

    return NextResponse.json({
      content: aiResponse,
      chatId: currentChatId,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ في الرد" },
      { status: 500 }
    );
  }
}
