import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/clerk-prisma";

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = "zsky-video" } = await request.json();

    if (!prompt || prompt.trim() === "") {
      return NextResponse.json({ error: "الـ prompt مطلوب" }, { status: 400 });
    }

    await getOrCreateUser();

    // 1. Zsky AI (مجاني تماماً - 2026)
    if (model === "zsky-video") {
      try {
        // Zsky AI يستخدم نظام الـ URL المباشر للتوليد المجاني كما في توثيقهم لعام 2026
        // ملاحظة: بما أنه لا يحتاج API Key، نستخدم الـ endpoint المخصص للـ agents
        const response = await fetch("https://zsky.ai/api/generate-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            prompt,
            quality: "1080p",
            audio: true
          }),
        });

        const data = await response.json();
        if (response.ok && (data.video_url || data.url)) {
          return NextResponse.json({ videoUrl: data.video_url || data.url, success: true });
        }
        
        // Fallback: استخدام الرابط المباشر للمتصفح إذا فشل الـ API
        const fallbackUrl = `https://zsky.ai/create?prompt=${encodeURIComponent(prompt)}&type=video`;
        return NextResponse.json({ 
          videoUrl: null, 
          redirectUrl: fallbackUrl,
          message: "يرجى إكمال توليد الفيديو عبر Zsky AI (مجاني)" 
        });
      } catch (err) {
        console.error("Zsky AI Video failed", err);
      }
    }

    // 2. Veo 3.1 Fast (Google Gemini المدفوع)
    if (model === "veo-3-1-fast" && process.env.GEMINI_API_KEY) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-fast:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        const data = await response.json();
        const videoUrl = data.candidates?.[0]?.content?.parts?.[0]?.videoValue?.uri;
        
        if (videoUrl) {
          return NextResponse.json({ videoUrl, success: true });
        }
      } catch (err) {
        console.error("Veo 3.1 failed", err);
      }
    }

    // 3. Fal.ai Fast Video (الخيار الاحترافي)
    if (model === "fal-fast-video" && process.env.FAL_AI_KEY) {
      try {
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
          return NextResponse.json({ videoUrl, success: true });
        }
      } catch (err) {
        console.error("Fal Fast Video failed", err);
      }
    }

    return NextResponse.json(
      { error: "فشل توليد الفيديو. جرب استخدام Zsky AI أو تحقق من مفاتيح API." },
      { status: 503 }
    );

  } catch (error: any) {
    console.error("🚨 Video Generation Error:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
