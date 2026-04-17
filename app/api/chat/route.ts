import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/clerk-prisma";
import { prisma } from "@/lib/db";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// ✅ قائمة الموديلات المجانية المدعومة من Google
const FREE_MODELS = {
  "gemini-1.5-flash": "gemini-1.5-flash",      // ✅ سريع ومجاني - الخيار الأفضل
  "gemini-1.5-pro": "gemini-1.5-pro",          // ✅ ذكي ومجاني (حد 2 طلب/دقيقة)
  "gemini-2.0-flash-exp": "gemini-2.0-flash-exp", // ⚠️ تجريبي، قد يتطلب تفعيل
};

export async function POST(request: NextRequest) {
  try {
    const { messages, chatId, model = "gemini-1.5-flash" } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY غير موجود");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // ✅ استخدام موديل مجاني مدعوم فقط
    const safeModel = FREE_MODELS[model as keyof typeof FREE_MODELS] || "gemini-1.5-flash";
    
    const genModel = genAI.getGenerativeModel({ 
      model: safeModel,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const chatHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const chat = genModel.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.9,
        topP: 0.95,
      },
    });

    const result = await chat.sendMessage(lastMessage.content);
    const aiResponse = result.response.text();

    await prisma.message.create({
      data: {
        role: "assistant",
        content: aiResponse,
        chatId: currentChatId,
        modelUsed: safeModel,
        isUncensored: true,
      },
    });

    return NextResponse.json({
      content: aiResponse,
      chatId: currentChatId,
      model: safeModel,
    });

  } catch (error: any) {
    console.error("❌ Chat Error:", error);
    
    let userMessage = error.message || "فشل في الرد";
    
    // ✅ معالجة أخطاء الحصة المجانية (429)
    if (error.status === 429 || error.message?.includes("Quota exceeded")) {
      userMessage = "⚠️ تم تجاوز الحد المجاني. جرب بعد دقيقة، أو استخدم نموذجاً أخف.";
    }
    if (error.message?.includes("API key not valid")) {
      userMessage = "مفتاح Google API غير صحيح";
    }
    if (error.message?.includes("model not found") || error.message?.includes("404")) {
      userMessage = "هذا الموديل غير متاح في خطتك المجانية. جرب: Gemini 1.5 Flash";
    }
    
    return NextResponse.json({ error: userMessage }, { status: error.status === 429 ? 429 : 500 });
  }
}
