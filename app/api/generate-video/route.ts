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

    // 1. محاولة استخدام Veo 3.1 Fast عبر Gemini API (Google Cloud)
    if (model === "veo-3-1-fast" && process.env.GEMINI_API_KEY) {
      try {
        // استخدام Google Generative AI SDK
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // استخدام Vertex AI SDK للفيديو (الطريقة الصحيحة)
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-fast:generateVideo?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              displayName: "AI Generated Video",
              model: "veo-3.1-fast",
              generationConfig: {
                duration: "5s",
                resolution: "720p",
              },
              textToVideoConfig: {
                text: prompt,
              },
            }),
          }
        );

        const data = await response.json();

        // معالجة الرد
        if (response.ok && data.video?.uri) {
          const videoUrl = data.video.uri;
          
          await prisma.message.create({
            data: {
              role: "assistant",
              content: "✅ تم توليد الفيديو بنجاح عبر Veo 3.1 Fast!",
              videoUrl,
              chatId: "",
            }
          });

          return NextResponse.json({ videoUrl, success: true });
        }

        // إذا كان هناك خطأ في الرد
        if (!response.ok) {
          console.error("Veo 3.1 API Error:", data);
          throw new Error(data.error?.message || "فشل طلب Veo 3.1");
        }
      } catch (err: any) {
        console.error("Veo 3.1 Error:", err.message);
      }
    }

    // 2. البديل: Qwen Video (إذا توفر المفتاح)
    if (model === "qwen-video" && process.env.QWEN_API_KEY) {
      try {
        const response = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/text2video/generation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.QWEN_API_KEY}`,
          },
          body: JSON.stringify({
            model: "qwen-video-generation",
            input: { prompt },
            parameters: { duration: 5 },
          }),
        });

        const data = await response.json();
        if (response.ok && data.output?.video_url) {
          return NextResponse.json({ videoUrl: data.output.video_url });
        }
      } catch (err) {
        console.error("Qwen Video failed", err);
      }
    }

    // 3. البديل الأخير: Fal.ai
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
        error: "فشل توليد الفيديو. تأكد من إضافة GEMINI_API_KEY أو FAL_AI_KEY في Vercel.",
        suggestion: "جرب إعادة المحاولة أو استخدم موديل صور بدلاً من الفيديو.",
      },
      { status: 503 }
    );

  } catch (error: any) {
    console.error("🚨 Video Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "خطأ في توليد الفيديو" },
      { status: 500 }
    );
  }
}
