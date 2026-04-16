import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/clerk-prisma";
import { prisma } from "@/lib/db";

const VIDEO_MODELS = {
  fastVideo: "fal-ai/fast-video",
  minimax: "minimax/video-01",
  runway: "runway/gen-3",
};

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = "fastVideo", duration = 5 } = await request.json();

    if (!prompt || prompt.trim() === "") {
      return NextResponse.json({ error: "الـ prompt مطلوب" }, { status: 400 });
    }

    const user = await getOrCreateUser();

    // التحقق من الحد اليومي للفيديوهات
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailyUsage = await prisma.dailyUsage.findUnique({
      where: { userId: user.id },
    });

    if (!dailyUsage) {
      dailyUsage = await prisma.dailyUsage.create({
        data: { userId: user.id },
      });
    }

    // إعادة تعيين العداد إذا تجاوزت 24 ساعة
    if (new Date(dailyUsage.resetDate) < today) {
      dailyUsage = await prisma.dailyUsage.update({
        where: { userId: user.id },
        data: { videosUsed: 0, resetDate: new Date() },
      });
    }

    // التحقق من الحد اليومي (3 فيديوهات في اليوم)
    if (dailyUsage.videosUsed >= 3) {
      return NextResponse.json(
        { error: "لقد وصلت إلى الحد اليومي من الفيديوهات (3 فيديوهات). حاول غداً" },
        { status: 429 }
      );
    }

    console.log("🔑 Using Fal.ai Key:", process.env.FAL_AI_KEY ? "موجود" : "مفقود");
    console.log("🎬 Model:", model);

    // استخدام Fast Video من Fal.ai (الخيار المجاني الأساسي)
    const response = await fetch("https://fal.run/fal-ai/fast-video", {
      method: "POST",
      headers: {
        Authorization: `Key ${process.env.FAL_AI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        duration: Math.min(duration, 5), // الحد الأقصى 5 ثوان
        num_inference_steps: 20,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Fal.ai Error:", data);
      return NextResponse.json(
        { error: data.detail || "فشل توليد الفيديو" },
        { status: response.status }
      );
    }

    const videoUrl = data.video?.url || data.output?.url || data.urls?.[0];

    if (!videoUrl) {
      return NextResponse.json(
        { error: "لم يتمكن من الحصول على رابط الفيديو" },
        { status: 500 }
      );
    }

    // تحديث عداد الاستخدام
    await prisma.dailyUsage.update({
      where: { userId: user.id },
      data: { videosUsed: dailyUsage.videosUsed + 1 },
    });

    return NextResponse.json({
      videoUrl,
      model: "fal-ai/fast-video",
      duration,
      remaining: 3 - (dailyUsage.videosUsed + 1),
    });
  } catch (error: any) {
    console.error("🚨 Video Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "خطأ غير متوقع في توليد الفيديو" },
      { status: 500 }
    );
  }
}
