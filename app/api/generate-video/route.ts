import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/clerk-prisma";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = "veo-3-1-fast" } = await request.json();

    if (!prompt || prompt.trim() === "") {
      return NextResponse.json({ error: "الـ prompt مطلوب" }, { status: 400 });
    }

    const user = await getOrCreateUser();

    // 1. استخدام Veo 3.1 Fast عبر Gemini API (Google AI Studio)
    if (model === "veo-3-1-fast" && process.env.GEMINI_API_KEY) {
      try {
        // ملاحظة: تطبيق Veo 3.1 الفعلي عبر API يتطلب استخدام SDK الخاص بـ Google Generative AI
        // هنا نقوم بمحاكاة الطلب أو استخدام fetch إذا كان الـ endpoint متاحاً مباشرة
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-fast:generateVideo?key=${process.env.GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: prompt,
            videoOptions: { durationSeconds: 5 }
          })
        });

        const data = await response.json();
        
        // في حال نجاح الطلب (هذا هيكل تقريبي للرد)
        if (response.ok && data.videoUrl) {
           await prisma.message.create({
            data: {
              role: "assistant",
              content: "✅ تم توليد الفيديو بنجاح عبر Veo 3.1 Fast",
              videoUrl: data.videoUrl,
              chatId: "", 
            }
          });
          return NextResponse.json({ videoUrl: data.videoUrl });
        }
      } catch (err) {
        console.error("Veo 3.1 failed", err);
      }
    }

    // 2. البديل: Fal.ai
    if (process.env.FAL_AI_KEY) {
      const response = await fetch("https://fal.run/fal-ai/fast-video", {
        method: "POST",
        headers: {
          Authorization: `Key ${process.env.FAL_AI_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, duration: 5 }),
      });

      const data = await response.json();
      const videoUrl = data.video?.url || data.output?.url || data.urls?.[0];

      if (response.ok && videoUrl) {
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

    return NextResponse.json(
      { 
        error: "توليد الفيديو يتطلب مفتاح API صحيح (GEMINI_API_KEY أو FAL_AI_KEY).",
        suggestion: "تأكد من إدراج المفاتيح في Vercel." 
      }, 
      { status: 403 }
    );

  } catch (error: any) {
    console.error("🚨 Video Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
