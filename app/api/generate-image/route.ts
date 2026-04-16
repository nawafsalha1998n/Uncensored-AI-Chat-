import { NextResponse } from "next/server";
import { OpenAI } from "openai";

export async function POST(req: Request) {
  try {
    const { prompt, model } = await req.json();
    let imageUrl: string | undefined;

    // 1️⃣ Pollinations (مجاني)
    if (model === "nano-banana" || model === "perchance") {
      const seed = Math.floor(Math.random() * 1000000);
      imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${model === 'nano-banana' ? 'flux' : 'any'}&seed=${seed}&width=1024&height=1024&nologo=true`;
    } 
    
    // 2️⃣ Together.ai (Flux Pro)
    else if (model === "flux-pro") {
      const response = await fetch("https://api.together.xyz/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          model: "black-forest-labs/FLUX.1-pro",
          steps: 25,
          n: 1,
        }),
      });
      const data = await response.json();
      imageUrl = data.data?.[0]?.url;
    }

    // 3️⃣ Fal.ai (Flux Realism)
    else if (model === "fal-flux-realism") {
      const response = await fetch("https://fal.run/fal-ai/flux-realism", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.FAL_AI_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, image_size: "square_hd" }),
      });
      const data = await response.json();
      imageUrl = data.images?.[0]?.url || data.image?.url;
    }

    // 👤 4️⃣ Alibaba Qwen Image
    else if (model === "qwen-image") {
      const client = new OpenAI({
        apiKey: process.env.DASHSCOPE_API_KEY,
        baseURL: process.env.DASHSCOPE_BASE_URL || "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
      });

      const response = await client.images.generate({
        model: "qwen3-image",
        prompt,
        size: "1024x1024",
        n: 1,
      });
      // ✅ الإصلاح: استخدام ?? "" لضمان أن تكون النصوص من نوع string
      imageUrl = response.data?.[0]?.url ?? undefined;
    }

    // ✅ التحقق النهائي: إذا لم يكن هناك صورة، نرجع خطأ
    if (!imageUrl) {
      return NextResponse.json({ error: "فشل في توليد الصورة" }, { status: 500 });
    }

    return NextResponse.json({ imageUrl });

  } catch (error: any) {
    console.error("Image Generation Error:", error);
    return NextResponse.json(
      { error: "فشل في توليد الصورة: " + (error.message || "خطأ غير معروف") },
      { status: 500 }
    );
  }
}
