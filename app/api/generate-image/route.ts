import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/clerk-prisma";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = "flux-schnell" } = await request.json();

    if (!prompt || prompt.trim() === "") {
      return NextResponse.json({ error: "الـ prompt مطلوب" }, { status: 400 });
    }

    const user = await getOrCreateUser();

    // 1. استخدام Together.ai للموديلات الاحترافية
    if (process.env.TOGETHER_API_KEY && model !== "pollinations") {
      let togetherModel = "black-forest-labs/FLUX.1-schnell";
      if (model === "flux-pro") togetherModel = "black-forest-labs/FLUX.1-pro";
      if (model === "sd3") togetherModel = "stabilityai/stable-diffusion-3";

      try {
        const response = await fetch("https://api.together.xyz/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
          },
          body: JSON.stringify({
            model: togetherModel,
            prompt,
            width: 1024,
            height: 1024,
            steps: model === "flux-pro" ? 20 : 4,
            n: 1,
            response_format: "base64",
          }),
        });

        const data = await response.json();
        if (response.ok && data.data?.[0]?.b64_json) {
          const imageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
          return NextResponse.json({ imageUrl });
        }
      } catch (err) {
        console.error("Together.ai failed", err);
      }
    }

    // 2. البديل المجاني: Pollinations.ai
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux&seed=${Math.floor(Math.random() * 1000000)}`;
    return NextResponse.json({ imageUrl: pollinationsUrl, isFallback: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
