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

    // 1. محاولة استخدام Veo 3.1 Fast عبر Gemini API (الطريقة الرسمية لعام 2026)
    if (model === "veo-3-1-fast" && process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // استخدام موديل Veo 3.1 Fast
        const veoModel = genAI.getGenerativeModel({ model: "veo-3.1-fast" });

        // بدء عملية التوليد
        const result = await veoModel.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            // @ts-ignore - خصائص محددة لـ Veo
            videoConfig: {
              durationSeconds: 5,
              fps: 24,
            }
          }
        });

        const response = await result.response;
        // في Veo 3.1، الرد يحتوي على رابط الفيديو المنشأ أو العملية
        // @ts-ignore
        const videoUrl = response.candidates?.[0]?.content?.parts?.[0]?.videoValue?.uri || 
                        // @ts-ignore
                        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (videoUrl) {
          // إذا كان الفيديو inline data (base64)
          const finalUrl = videoUrl.startsWith('http') ? videoUrl : `data:video/mp4;base64,${videoUrl}`;
          
          return NextResponse.json({ videoUrl: finalUrl, success: true });
        }
        
        // إذا لم ينجح الـ SDK، نستخدم fetch مع الـ Endpoint الصحيح والمحدث
        const rawResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-fast:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        const rawData = await rawResponse.json();
        const fallbackUrl = rawData.candidates?.[0]?.content?.parts?.[0]?.videoValue?.uri;
        
        if (fallbackUrl) {
          return NextResponse.json({ videoUrl: fallbackUrl, success: true });
        }

      } catch (err: any) {
        console.error("Veo 3.1 SDK Error:", err.message);
      }
    }

    // 2. البديل الأخير والموثوق: Fal.ai
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
        return NextResponse.json({ videoUrl });
      }
    }

    return NextResponse.json(
      {
        error: "فشل توليد الفيديو. تأكد من صلاحية GEMINI_API_KEY أو استخدم Fal.ai كبديل.",
        suggestion: "جرب طلب وصف مختلف أو تحقق من رصيد الحساب في Google AI Studio.",
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
