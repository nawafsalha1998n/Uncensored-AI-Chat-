import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/clerk-prisma";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = "flux" } = await request.json();

    if (!prompt || prompt.trim() === "") {
      return NextResponse.json({ error: "الـ prompt مطلوب" }, { status: 400 });
    }

    const user = await getOrCreateUser();

    // 1. محاولة استخدام Together.ai إذا كان المفتاح موجوداً
    if (process.env.TOGETHER_API_KEY) {
      try {
        const response = await fetch("https://api.together.xyz/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
          },
          body: JSON.stringify({
            model: "black-forest-labs/FLUX.1-schnell",
            prompt,
            width: 1024,
            height: 1024,
            steps: 4,
            n: 1,
            response_format: "base64",
          }),
        });

        const data = await response.json();
        if (response.ok && data.data?.[0]?.b64_json) {
          const imageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
          
          // حفظ في قاعدة البيانات
          await prisma.message.create({
            data: {
              role: "assistant",
              content: "✅ تم توليد الصورة بنجاح عبر Together.ai",
              imageUrl,
              chatId: "", // يمكن تحديثه لاحقاً أو تركه فارغاً للصور العامة
            }
          });

          return NextResponse.json({ imageUrl });
        }
      } catch (err) {
        console.error("Together.ai failed, falling back to Pollinations", err);
      }
    }

    // 2. البديل المجاني تماماً: Pollinations.ai (لا يحتاج مفتاح)
    // نستخدم نموذج Flux عبر Pollinations
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux&seed=${Math.floor(Math.random() * 1000000)}`;

    // حفظ في قاعدة البيانات كرسالة
    // ملاحظة: في Pollinations الرابط مباشر، لذا نحفظ الرابط نفسه
    await prisma.message.create({
      data: {
        role: "assistant",
        content: "✅ تم توليد الصورة بنجاح عبر المحرك المجاني (Pollinations)",
        imageUrl: pollinationsUrl,
        chatId: "", 
      }
    });

    return NextResponse.json({ imageUrl: pollinationsUrl, isFallback: true });

  } catch (error: any) {
    console.error("🚨 Image Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "خطأ غير متوقع في توليد الصورة" },
      { status: 500 }
    );
  }
}
