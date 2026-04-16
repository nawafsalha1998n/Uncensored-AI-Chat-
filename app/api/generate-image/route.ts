import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/clerk-prisma";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = "nano-banana" } = await request.json();

    if (!prompt || prompt.trim() === "") {
      return NextResponse.json({ error: "الـ prompt مطلوب" }, { status: 400 });
    }

    const user = await getOrCreateUser();
    let imageUrl: string | null = null;

    // 1. Nano Banana 2 (الأقوى) - عبر Pollinations
    if (model === "nano-banana") {
      try {
        imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux-pro&seed=${Math.floor(Math.random() * 1000000)}`;
        
        // التحقق من أن الرابط يعمل
        const checkResponse = await fetch(imageUrl, { method: "HEAD" });
        if (checkResponse.ok) {
          return NextResponse.json({ imageUrl, model: "nano-banana" });
        }
      } catch (err) {
        console.error("Nano Banana failed", err);
      }
    }

    // 2. Perchance (عالي الجودة) - عبر Pollinations
    if (model === "perchance") {
      try {
        imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux-pro&enhance=true&seed=${Math.floor(Math.random() * 1000000)}`;
        return NextResponse.json({ imageUrl, model: "perchance" });
      } catch (err) {
        console.error("Perchance failed", err);
      }
    }

    // 3. Flux.1 Pro عبر Together.ai
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
            width: 1024,
            height: 1024,
            steps: 20,
            n: 1,
            response_format: "url", // استخدام URL بدلاً من base64
          }),
        });

        const data = await response.json();
        if (response.ok && data.data?.[0]?.url) {
          imageUrl = data.data[0].url;
          return NextResponse.json({ imageUrl, model: "flux-pro" });
        }
      } catch (err) {
        console.error("Flux.1 Pro failed", err);
      }
    }

    // 4. Flux.1 Dev عبر Together.ai
    if (model === "flux-dev" && process.env.TOGETHER_API_KEY) {
      try {
        const response = await fetch("https://api.together.xyz/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
          },
          body: JSON.stringify({
            model: "black-forest-labs/FLUX.1-dev",
            prompt,
            width: 1024,
            height: 1024,
            steps: 10,
            n: 1,
            response_format: "url",
          }),
        });

        const data = await response.json();
        if (response.ok && data.data?.[0]?.url) {
          imageUrl = data.data[0].url;
          return NextResponse.json({ imageUrl, model: "flux-dev" });
        }
      } catch (err) {
        console.error("Flux.1 Dev failed", err);
      }
    }

    // 5. Stable Diffusion 3 عبر Together.ai
    if (model === "sd3" && process.env.TOGETHER_API_KEY) {
      try {
        const response = await fetch("https://api.together.xyz/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
          },
          body: JSON.stringify({
            model: "stabilityai/stable-diffusion-3",
            prompt,
            width: 1024,
            height: 1024,
            steps: 15,
            n: 1,
            response_format: "url",
          }),
        });

        const data = await response.json();
        if (response.ok && data.data?.[0]?.url) {
          imageUrl = data.data[0].url;
          return NextResponse.json({ imageUrl, model: "sd3" });
        }
      } catch (err) {
        console.error("SD3 failed", err);
      }
    }

    // 6. Qwen Vision (قوي جداً)
    if (model === "qwen-vl" && process.env.QWEN_API_KEY) {
      try {
        const response = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/generation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.QWEN_API_KEY}`,
          },
          body: JSON.stringify({
            model: "qwen-vl-max",
            input: { prompt },
            parameters: { size: "1024*1024" },
          }),
        });

        const data = await response.json();
        if (response.ok && data.output?.image_url) {
          imageUrl = data.output.image_url;
          return NextResponse.json({ imageUrl, model: "qwen-vl" });
        }
      } catch (err) {
        console.error("Qwen Vision failed", err);
      }
    }

    // 7. البديل المجاني النهائي: Pollinations (مجاني تماماً)
    imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux&seed=${Math.floor(Math.random() * 1000000)}`;
    
    return NextResponse.json({ imageUrl, model: "pollinations-free", isFallback: true });

  } catch (error: any) {
    console.error("🚨 Image Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "خطأ في توليد الصورة" },
      { status: 500 }
    );
  }
}
