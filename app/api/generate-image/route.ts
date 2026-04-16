import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/clerk-prisma";
import { prisma } from "@/lib/db";

const IMAGE_MODELS = {
  flux: "black-forest-labs/FLUX.1-schnell",
  fluxPro: "black-forest-labs/FLUX.1-pro",
  sd3: "stabilityai/stable-diffusion-3",
};

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = "flux", width = 1024, height = 1024 } = await request.json();

    if (!prompt || prompt.trim() === "") {
      return NextResponse.json({ error: "الـ prompt مطلوب" }, { status: 400 });
    }

    const user = await getOrCreateUser();

    // التحقق من الحد اليومي للصور
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
        data: { imagesUsed: 0, resetDate: new Date() },
      });
    }

    // التحقق من الحد اليومي (10 صور في اليوم)
    if (dailyUsage.imagesUsed >= 10) {
      return NextResponse.json(
        { error: "لقد وصلت إلى الحد اليومي من الصور (10 صور). حاول غداً" },
        { status: 429 }
      );
    }

    const selectedModel = IMAGE_MODELS[model as keyof typeof IMAGE_MODELS] || IMAGE_MODELS.flux;

    console.log("🔑 Using Together API Key:", process.env.TOGETHER_API_KEY ? "موجود" : "مفقود");
    console.log("🖼️ Model:", selectedModel);

    const response = await fetch("https://api.together.xyz/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        prompt,
        width,
        height,
        steps: model === "fluxPro" ? 20 : 4,
        n: 1,
        response_format: "base64",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Together Error:", data);
      return NextResponse.json(
        { error: data.error?.message || "فشل توليد الصورة" },
        { status: response.status }
      );
    }

    const base64 = data.data[0].b64_json;
    const imageUrl = `data:image/png;base64,${base64}`;

    // تحديث عداد الاستخدام
    await prisma.dailyUsage.update({
      where: { userId: user.id },
      data: { imagesUsed: dailyUsage.imagesUsed + 1 },
    });

    return NextResponse.json({
      imageUrl,
      model: selectedModel,
      remaining: 10 - (dailyUsage.imagesUsed + 1),
    });
  } catch (error: any) {
    console.error("🚨 Image Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "خطأ غير متوقع في توليد الصورة" },
      { status: 500 }
    );
  }
}
