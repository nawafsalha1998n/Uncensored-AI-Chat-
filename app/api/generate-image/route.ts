import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/clerk-prisma";

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = "nano-banana" } = await request.json();

    if (!prompt || prompt.trim() === "") {
      return NextResponse.json({ error: "الـ prompt مطلوب" }, { status: 400 });
    }

    await getOrCreateUser();
    let imageUrl: string | null = null;

    // 1. Nano Banana 2 (الأقوى والمجاني)
    if (model === "nano-banana") {
      imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux-pro&seed=${Math.floor(Math.random() * 1000000)}`;
      return NextResponse.json({ imageUrl, success: true });
    }

    // 2. Perchance (عالي الجودة ومجاني)
    if (model === "perchance") {
      imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux-pro&enhance=true&seed=${Math.floor(Math.random() * 1000000)}`;
      return NextResponse.json({ imageUrl, success: true });
    }

    // 3. Fal.ai Flux Realism (مدفوع - جودة سينمائية)
    if (model === "fal-flux-realism" && process.env.FAL_AI_KEY) {
      try {
        const response = await fetch("https://fal.run/fal-ai/flux-realism", {
          method: "POST",
          headers: {
            Authorization: `Key ${process.env.FAL_AI_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt, image_size: { width: 1024, height: 1024 } }),
        });
        const data = await response.json();
        const url = data.image?.url || data.output?.image?.url;
        if (url) return NextResponse.json({ imageUrl: url, success: true });
      } catch (err) {
        console.error("Fal.ai failed", err);
      }
    }

    // 4. Flux.1 Pro (Together.ai)
    if (model === "flux-pro" && process.env.TOGETHER_API_KEY) {
      try {
        const response = await fetch("https://api.together.xyz/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
          },
          body: JSON.stringify({
            model: "black-forest-labs/FLUX.1-pro",
            prompt,
            response_format: "url",
          }),
        });
        const data = await response.json();
        if (data.data?.[0]?.url) return NextResponse.json({ imageUrl: data.data[0].url, success: true });
      } catch (err) {
        console.error("Together.ai failed", err);
      }
    }

    // Default Fallback
    imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux`;
    return NextResponse.json({ imageUrl, success: true, isFallback: true });

  } catch (error: any) {
    console.error("🚨 Image Generation Error:", error);
    return NextResponse.json({ error: "خطأ في توليد الصورة" }, { status: 500 });
  }
}
