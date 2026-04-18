import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/clerk-prisma";
import { prisma } from "@/lib/db";
import { generateAIResponse } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const { messages, chatId, model = "llama-3.3-70b", chatType = "text" } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "الرسائل مطلوبة" }, { status: 400 });
    }

    const user = await getOrCreateUser();
    let currentChatId = chatId;

    // إنشاء محادثة جديدة مع تحديد النوع
    if (!currentChatId) {
      // حساب تاريخ الانتهاء حسب النوع
      const expiresAt = new Date();
      if (chatType === "image" || chatType === "video") {
        expiresAt.setDate(expiresAt.getDate() + 7); // أسبوع للصور والفيديو
      } else {
        expiresAt.setDate(expiresAt.getDate() + 15); // 15 يوم للدردشة
      }

      const chat = await prisma.chat.create({
        data: {
          userId: user.id,
          chatType: chatType,
          title: messages[messages.length - 1]?.content?.slice(0, 60) || "محادثة جديدة",
          expiresAt: expiresAt,
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

    // توليد الرد
    const aiResponse = await generateAIResponse(messages, model);

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
      model: model,
    });

  } catch (error: any) {
    console.error("❌ Chat Error:", error);
    
    let userMessage = error.message || "فشل في الرد";
    if (error.message?.includes("429") || error.message?.includes("rate limit")) {
      userMessage = "⚠️ تم تجاوز الحد المجاني. جرب بعد دقيقة.";
    }
    
    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
