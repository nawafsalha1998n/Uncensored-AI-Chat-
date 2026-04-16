import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/clerk-prisma";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || prompt.trim() === "") {
      return NextResponse.json({ error: "الـ prompt مطلوب" }, { status: 400 });
    }

    const user = await getOrCreateUser();

    // حالياً لا يوجد API فيديو مجاني تماماً بدون مفتاح وبدون قيود صارمة مثل Pollinations للصور.
    // سنحاول استخدام Fal.ai إذا توفر المفتاح، وإلا سنخبر المستخدم بالمشكلة.
    
    if (process.env.FAL_AI_KEY) {
      const response = await fetch("https://fal.run/fal-ai/fast-video", {
        method: "POST",
        headers: {
          Authorization: `Key ${process.env.FAL_AI_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          duration: 5,
          num_inference_steps: 20,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const videoUrl = data.video?.url || data.output?.url || data.urls?.[0];
        if (videoUrl) {
          // حفظ في قاعدة البيانات
          await prisma.message.create({
            data: {
              role: "assistant",
              content: "✅ تم توليد الفيديو بنجاح عبر Fal.ai",
              videoUrl,
              chatId: "", 
            }
          });
          return NextResponse.json({ videoUrl });
        }
      }
    }

    // إذا لم يتوفر مفتاح أو فشل الطلب
    return NextResponse.json(
      { 
        error: "توليد الفيديو يتطلب مفتاح API من Fal.ai أو Kling AI. البدائل المجانية تماماً للفيديو نادرة حالياً.",
        suggestion: "يرجى إضافة FAL_AI_KEY في إعدادات Vercel لتفعيل هذه الميزة." 
      }, 
      { status: 403 }
    );

  } catch (error: any) {
    console.error("🚨 Video Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "خطأ غير متوقع في توليد الفيديو" },
      { status: 500 }
    );
  }
}
