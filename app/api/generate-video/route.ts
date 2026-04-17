import { NextResponse } from "next/server";
import { generateZskyVideo } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { prompt, model } = await req.json();
    
    if (model === "zsky-video") {
      const redirectUrl = generateZskyVideo(prompt);
      return NextResponse.json({ redirectUrl, content: "✅ تم التوجيه لـ Zsky AI" });
    }
    
    return NextResponse.json({ error: "الموديل غير مدعوم" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "فشل في توليد الفيديو" }, { status: 500 });
  }
}
