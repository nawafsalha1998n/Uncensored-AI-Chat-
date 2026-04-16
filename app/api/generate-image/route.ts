import { NextResponse } from "next/server";
import { generateQwenImage } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { prompt, model } = await req.json();
    let imageUrl: string | undefined;

    if (model === "nano-banana" || model === "perchance") {
      const seed = Math.floor(Math.random() * 1000000);
      imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${model === 'nano-banana' ? 'flux' : 'any'}&seed=${seed}&width=1024&height=1024&nologo=true`;
    } 
    else if (model === "flux-pro") {
      const response = await fetch("https://api.together.xyz/v1/images/generations", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.TOGETHER_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model: "black-forest-labs/FLUX.1-pro", steps: 25, n: 1 }),
      });
      const data = await response.json();
      imageUrl = data.data?.[0]?.url;
    }
    else if (model === "fal-flux-realism") {
      const response = await fetch("https://fal.run/fal-ai/flux-realism", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.FAL_AI_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, image_size: "square_hd" }),
      });
      const data = await response.json();
      imageUrl = data.images?.[0]?.url || data.image?.url;
    }
    // 👤 علي بابا - Qwen Image
    else if (model === "qwen-image") {
      const result = await generateQwenImage(prompt, "1024x1024");
      imageUrl = result.url;
    }

    if (!imageUrl) return NextResponse.json({ error: "فشل في توليد الصورة" }, { status: 500 });
    return NextResponse.json({ imageUrl });

  } catch (error: any) {
    console.error("Image Error:", error);
    return NextResponse.json({ error: error.message || "خطأ غير معروف" }, { status: 500 });
  }
}
