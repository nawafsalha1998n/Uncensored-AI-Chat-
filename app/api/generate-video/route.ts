import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateWanVideo } from "@/lib/ai";

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const { prompt, model, duration = 5, resolution = "720p" } = await req.json();
    if (!prompt) return NextResponse.json({ error: "الوصف مطلوب" }, { status: 400 });

    // Zsky AI
    if (model === "zsky-video") {
      return NextResponse.json({
        content: "✅ تم تجهيز الطلب لـ Zsky AI",
        redirectUrl: `https://zsky.ai/generate?prompt=${encodeURIComponent(prompt)}&type=video`
      });
    }

    // Veo 3.1
    if (model === "veo-3-1" || model === "veo-3-1-fast") {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const videoModel = genAI.getGenerativeModel({ model: "veo-3.1-fast" });
      const result = await videoModel.generateContent(prompt);
      return NextResponse.json({ videoUrl: result.response.text() });
    }

    // Fal.ai
    if (model === "fal-fast-video") {
      const response = await fetch("https://queue.fal.run/fal-ai/fast-video", {
        method: "POST",
        headers: { "Authorization": `Key ${process.env.FAL_AI_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      return NextResponse.json({ videoUrl: data.video?.url || data.url });
    }

    // 👤 علي بابا - Wan 2.7
    if (model === "wan2.7-t2v" || model === "wan2.7-i2v") {
      const result = await generateWanVideo(prompt, duration, resolution, true);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "الموديل غير مدعوم" }, { status: 400 });

  } catch (error: any) {
    console.error("Video Error:", error);
    return NextResponse.json({ error: "فشل: " + (error.message || "خطأ") }, { status: 500 });
  }
}
