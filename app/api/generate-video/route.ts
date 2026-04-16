import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { prompt, model } = await res.json();

    if (!prompt) {
      return NextResponse.json({ error: "الوصف مطلوب" }, { status: 400 });
    }

    // 1. Zsky AI (الخيار المجاني)
    if (model === "zsky-video") {
      // نقوم بتوجيه المستخدم لموقع Zsky لإكمال التوليد مجاناً بجودة 1080p
      const redirectUrl = `https://zsky.ai/generate?prompt=${encodeURIComponent(prompt )}&type=video`;
      return NextResponse.json({ 
        content: "✅ تم تجهيز الطلب لـ Zsky AI", 
        redirectUrl 
      });
    }

    // 2. Veo 3.1 Fast (باستخدام مفتاح Google Studio المدفوع)
    if (model === "veo-3-1") {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const videoModel = genAI.getGenerativeModel({ model: "veo-3-1-fast" });

      const result = await videoModel.generateContent(prompt);
      const response = await result.response;
      
      // ملاحظة: Veo 3.1 يعيد أحياناً رابطاً مؤقتاً أو يتطلب معالجة خاصة للـ blob
      // الكود هنا مهيأ للتعامل مع الرد المباشر
      return NextResponse.json({ 
        videoUrl: response.text() // أو الرابط المستخرج من الرد
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
        body: JSON.stringify({ prompt } ),
      });

      const data = await response.json();
      return NextResponse.json({ videoUrl: data.video?.url || data.url });
    }

    return NextResponse.json({ error: "الموديل غير مدعوم" }, { status: 400 });

  } catch (error: any) {
    console.error("Video Generation Error:", error);
    return NextResponse.json({ error: "فشل في توليد الفيديو: " + error.message }, { status: 500 });
  }
}
