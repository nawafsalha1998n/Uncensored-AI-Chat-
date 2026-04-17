import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, model } = await req.json();
    let imageUrl: string | undefined;

    // 1. Pollinations Flux (مجاني وممتاز)
    if (model === "nano-banana" || model === "flux-pro") {
      const seed = Math.floor(Math.random() * 1000000);
      // استخدام نموذج Flux عبر Pollinations
      const modelParam = model === 'flux-pro' ? 'flux' : 'flux'; 
      imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${modelParam}&seed=${seed}&width=1024&height=1024&nologo=true&enhance=true`;
    } 
    
    // 2. Perchance (للفن والأنمي)
    else if (model === "perchance") {
      const seed = Math.floor(Math.random() * 1000000);
      imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&seed=${seed}&width=1024&height=1024&nologo=true&enhance=true`;
    }

    if (!imageUrl) {
      return NextResponse.json({ error: "فشل في توليد الصورة" }, { status: 500 });
    }

    return NextResponse.json({ imageUrl });

  } catch (error: any) {
    console.error("Image Error:", error);
    return NextResponse.json({ error: error.message || "خطأ غير معروف" }, { status: 500 });
  }
}
