import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, model } = await req.json();
    
    if (!prompt) {
      return NextResponse.json({ error: "الوصف مطلوب" }, { status: 400 });
    }

    // ✅ توليد رابط الصورة مباشرة
    const seed = Math.floor(Math.random() * 1000000);
    const width = 1024;
    const height = 1024;
    
    // تحديد الموديل
    let modelName = "flux";
    if (model === "perchance") modelName = "flux";
    if (model === "nano-banana") modelName = "flux";
    if (model === "flux-pro") modelName = "flux";

    const timestamp = Date.now();
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${modelName}&seed=${seed}&width=${width}&height=${height}&nologo=true&enhance=true&t=${timestamp}`;

    return NextResponse.json({ 
      imageUrl,
      content: "✅ تم توليد الصورة بنجاح"
    });

  } catch (error: any) {
    console.error("❌ Image Error:", error);
    return NextResponse.json({ 
      error: error.message || "فشل في توليد الصورة" 
    }, { status: 500 });
  }
}
