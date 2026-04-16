import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/clerk-prisma";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || prompt.trim() === "") {
      return NextResponse.json({ error: "الـ prompt مطلوب" }, { status: 400 });
    }

    await getOrCreateUser();

    const response = await fetch("https://fal.run/fal-ai/fast-video", {  // يمكنك تغيير الموديل حسب احتياجك
      method: "POST",
      headers: {
        Authorization: `Key ${process.env.FAL_AI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        duration: 5,        // ثواني
        num_inference_steps: 20,
      }),
    });

    if (!response.ok) throw new Error("فشل توليد الفيديو");

    const data = await response.json();
    const videoUrl = data.video?.url || data.output?.url || data.urls?.[0];

    return NextResponse.json({ videoUrl });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "خطأ في توليد الفيديو" }, { status: 500 });
  }
}
