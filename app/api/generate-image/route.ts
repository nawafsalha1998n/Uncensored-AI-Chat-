import { NextResponse } from "next/server";
import { generatePollinationsImage } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { prompt, model } = await req.json();
    
    // جميع النماذج تستخدم Pollinations (مجاني)
    const modelName = model === "flux-pro" ? "flux" : model === "perchance" ? "flux" : "flux";
    const imageUrl = generatePollinationsImage(prompt, modelName);
    
    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "فشل في توليد الصورة" }, { status: 500 });
  }
}
