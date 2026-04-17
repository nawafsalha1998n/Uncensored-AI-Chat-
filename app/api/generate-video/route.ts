import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt, model } = await req.json();
    if (!prompt) return NextResponse.json({ error: "الوصف مطلوب" }, { status: 400 });

    // Zsky AI (الخيار المجاني الموثوق)
    if (model === "zsky-video") {
      return NextResponse.json({
        content: "✅ تم تجهيز الطلب",
        redirectUrl: `https://zsky.ai/generate?prompt=${encodeURIComponent(prompt)}&type=video`
      });
    }

    // Fal.ai (إذا كان لديك مفتاح)
    if (model === "fal-fast-video") {
      // ملاحظة: هذا يتطلب مفتاح API صالح
      return NextResponse.json({ error: "Fal API Key required" }, { status: 400 });
    }

    return NextResponse.json({ error: "الموديل غير مدعوم" }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
