// ✅ الاستيرادات
import { OpenAI } from "openai";

// ✅ نماذج الدردشة المجانية من OpenRouter
export const chatModels = {
  // 🆓 نماذج مجانية تماماً (بدون حد يومي صارم)
  "llama-3.2-3b": { 
    id: "meta-llama/llama-3.2-3b-instruct:free", 
    name: "🦙 Llama 3.2 3B (سريع + مجاني)", 
    provider: "openrouter" 
  },
  "llama-3.1-8b": { 
    id: "meta-llama/llama-3.1-8b-instruct:free", 
    name: "🦙 Llama 3.1 8B (متوازن + مجاني)", 
    provider: "openrouter" 
  },
  "qwen-2.5-7b": { 
    id: "qwen/qwen-2.5-7b-instruct:free", 
    name: "🇨🇳 Qwen 2.5 7B (عربي ممتاز + مجاني)", 
    provider: "openrouter" 
  },
  "gemma-2-9b": { 
    id: "google/gemma-2-9b-it:free", 
    name: "✨ Gemma 2 9B (جوجل + مجاني)", 
    provider: "openrouter" 
  },
  
  // 💎 نماذج مدفوعة (اختياري - لها حدود مجانية يومية)
  "llama-3.3-70b": { 
    id: "meta-llama/llama-3.3-70b-instruct", 
    name: "🚀 Llama 3.3 70B (أقوى)", 
    provider: "openrouter" 
  },
  
  // 🔄 دعم جوجل كخيار احتياطي
  "gemini-1.5-flash": { 
    id: "google/gemini-1.5-flash-latest", 
    name: "✨ Gemini 1.5 Flash", 
    provider: "google" 
  },
};

// ✅ نماذج الصور (مجانية)
export const imageModels = [
  { id: "flux-pro", name: "💎 Flux Pro (جودة عالية)", provider: "pollinations" },
  { id: "nano-banana", name: "🍌 Nano Banana 2 (سريع)", provider: "pollinations" },
  { id: "perchance", name: "✨ Perchance (فني)", provider: "pollinations" },
];

// ✅ نماذج الفيديو (مجانية)
export const videoModels = [
  { id: "zsky-video", name: "🎬 Zsky AI (مجاني تماماً)", provider: "zsky" },
  { id: "fal-fast-video", name: "⚡ Fal.ai Fast (يتطلب مفتاح)", provider: "fal" },
];

// ✅ عميل OpenRouter (متوافق مع OpenAI)
export const openrouterClient = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://uncensored-ai-chat.vercel.app",
    "X-Title": "Uncensored AI Chat",
  },
});

// ✅ عميل جوجل (احتياطي)
export const googleClient = process.env.GEMINI_API_KEY 
  ? new OpenAI({
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
      apiKey: process.env.GEMINI_API_KEY,
    })
  : null;

// ✅ دالة توليد الرد (دعم متعدد المزودين)
export async function generateAIResponse(
  messages: any[],
  modelId: string = "llama-3.2-3b"
) {
  const model = chatModels[modelId as keyof typeof chatModels];
  if (!model) {
    throw new Error(`النموذج "${modelId}" غير مدعوم`);
  }

  // 🔄 توجيه الطلب للمزود الصحيح
  if (model.provider === "openrouter") {
    const response = await openrouterClient.chat.completions.create({
      model: model.id,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.9,
      max_tokens: 4096,
    });
    return response.choices[0].message.content || "";
  }
  
  if (model.provider === "google" && googleClient) {
    const response = await googleClient.chat.completions.create({
      model: model.id,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.9,
      max_tokens: 4096,
    });
    return response.choices[0].message.content || "";
  }

  throw new Error(`فشل في الاتصال بمزود "${model.provider}"`);
}

// ✅ دوال الصور والفيديو (كما هي - تعمل جيداً)
export async function generatePollinationsImage(prompt: string, model: string = "flux") {
  const seed = Math.floor(Math.random() * 1000000);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${model}&seed=${seed}&width=1024&height=1024&nologo=true`;
}

export async function generateZskyVideo(prompt: string) {
  return `https://zsky.ai/generate?prompt=${encodeURIComponent(prompt)}&type=video`;
}
