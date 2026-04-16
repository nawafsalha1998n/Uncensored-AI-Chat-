import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, model } = await req.json();

    let imageUrl = "";

    if (model === "nano-banana" || model === "perchance") {
      // استخدام Pollinations كمحرك قوي ومجاني لـ Nano Banana
      const seed = Math.floor(Math.random() * 1000000);
      imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt )}?model=${model === 'nano-banana' ? 'flux' : 'any'}&seed=${seed}&width=1024&height=1024&nologo=true`;
    } else if (model === "flux-pro") {
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
        } ),
      });
      const data = await response.json();
      imageUrl = data.data[0].url;
    }

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
