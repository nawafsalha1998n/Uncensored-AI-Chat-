import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, model } = await req.json();
    
    if (!prompt) {
      return NextResponse.json({ error: "الوصف مطلوب" }, { status: 400 });
    }

    let imageUrl: string;

    // 🎨 جميع النماذج تستخدم Pollinations (مجاني وموثوق)
    if (model === "flux-pro" || model === "nano-banana" || model === "perchance" || !model) {
      const seed = Math.floor(Math.random() * 1000000);
      const width = 1024;
      const height = 1024;
      
      // استخدام نموذج Flux (الأفضل حالياً)
      const modelName = model === 'perchance' ? 'flux' : 'flux';
      
      imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${modelName}&seed=${seed}&width=${width}&height=${height}&nologo=true&enhance=true`;
      
      // التحقق من أن الرابط صالح (اختياري)
      try {
        const testResponse = await fetch(imageUrl, { method: 'HEAD', cache: 'no-store' });
        if (!testResponse.ok) {
          // محاولة ثانية بدون enhance
          imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&width=${width}&height=${height}&nologo=true`;
        }
      } catch (e) {
        console.log("Pollinations fallback applied");
      }
    }

    if (!imageUrl) {
      return NextResponse.json({ error: "فشل في توليد الصورة" }, { status: 500 });
    }

    console.log("✅ Image URL generated:", imageUrl);
    
    return NextResponse.json({ 
      imageUrl,
      content: "✅ تم توليد الصورة بنجاح"
    });

  } catch (error: any) {
    console.error("❌ Image Generation Error:", error);
    return NextResponse.json({ 
      error: error.message || "خطأ غير معروف في توليد الصورة" 
    }, { status: 500 });
  }
}
