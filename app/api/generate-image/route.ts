import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/clerk-prisma";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || prompt.trim() === "") {
      return NextResponse.json({ error: "الـ prompt مطلوب" }, { status: 400 });
    }

    await getOrCreateUser(); // فقط للتحقق من المستخدم

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

    if (!response.ok) throw new Error("فشل توليد الصورة");

    const data = await response.json();
    const base64 = data.data[0].b64_json;
    const imageUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "خطأ في توليد الصورة" }, { status: 500 });
  }
}
