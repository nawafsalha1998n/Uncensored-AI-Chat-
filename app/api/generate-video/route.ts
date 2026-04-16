import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateWanVideo } from "@/lib/ai";

export const maxDuration = 120; // مهم جداً لـ Vercel (2 دقيقة)

export async function POST(req: Request) {
  try {
    const { prompt, model, duration = 5, resolution = "720p" } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "الوصف مطلوب" }, { status: 400 });
    }

    // 1. Zsky AI (الخيار المجاني)
    if (model === "zsky-video") {
      const redirectUrl = `https://zsky.ai/generate?prompt=${encodeURIComponent(prompt)}&type=video`;
      return NextResponse.json({
        content: "✅ تم تجهيز الطلب لـ Zsky AI",
        redirectUrl
      });
    }

    // 2. Veo 3.1 Fast (باستخدام مفتاح Google Studio)
    if (model === "veo-3-1" || model === "veo-3-1-fast") {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const videoModel = genAI.getGenerativeModel({ model: "veo-3.1-fast" });

      const result = await videoModel.generateContent(prompt);
      const response = await result.response;

      return NextResponse.json({
        videoUrl: response.text()
      });
    }

    // 3. Fal.ai (الخيار الاحترافي السريع)
    if (model === "fal-fast-video") {
      const response = await fetch("https://queue.fal.run/fal-ai/fast-video", {
        method: "POST",
        headers: {
          "Authorization": `Key ${process.env.FAL_AI_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      return NextResponse.json({ videoUrl: data.video?.url || data.url });
    }

    // 👤 4. Wan 2.7 من علي بابا (نص → فيديو)
    if (model === "wan2.7-t2v" || model === "wan2.7-i2v") {
      const result = await generateWanVideo(prompt, duration, resolution, true);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "الموديل غير مدعوم" }, { status: 400 });

  } catch (error: any) {
    console.error("Video Generation Error:", error);
    return NextResponse.json(
      { error: "فشل في توليد الفيديو: " + (error.message || "خطأ غير معروف") },
      { status: 500 }
    );
  }
}
