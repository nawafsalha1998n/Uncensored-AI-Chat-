import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, model } = await req.json();
    
    // 1. التحقق من المدخلات
    if (!prompt) {
      return NextResponse.json({ error: "الوصف مطلوب" }, { status: 400 });
    }

    // ✅ الحل: تعريف المتغير بقيمة ابتدائية لتجنب خطأ TypeScript
    let imageUrl: string | undefined = undefined;

    // 🎨 توليد الصورة عبر Pollinations (مجاني وسريع)
    // استخدام نموذج Flux لجميع الخيارات لضمان أعلى جودة واستقرار
    if (model === "flux-pro" || model === "nano-banana" || model === "perchance" || !model) {
      const seed = Math.floor(Math.random() * 1000000);
      const width = 1024;
      const height = 1024;
      
      // رابط مباشر وسريع
      imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&seed=${seed}&width=${width}&height=${height}&nologo=true&enhance=true`;
    }

    // 2. التحقق من نجاح التوليد
    if (!imageUrl) {
      return NextResponse.json({ error: "فشل في توليد الصورة: نموذج غير مدعوم" }, { status: 500 });
    }

    // 3. إرجاع الرابط
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
