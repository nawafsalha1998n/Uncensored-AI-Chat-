// ✅ الاستيرادات
import { OpenAI } from "openai";
import { CohereClientV2 } from "cohere-ai";

// ✅ نماذج الدردشة - بأسماء صحيحة ومحدثة لـ OpenRouter
export const chatModels = {
  // 🆓 نماذج مجانية تماماً (تعمل حالياً على OpenRouter)
  "llama-3.2-1b": { 
    id: "meta-llama/llama-3.2-1b-instruct:free", 
    name: "🦙 Llama 3.2 1B (أسرع + مجاني)", 
    provider: "openrouter" 
  },
  "llama-3.2-3b": { 
    id: "meta-llama/llama-3.2-3b-instruct", 
    name: "🦙 Llama 3.2 3B (متوازن - حد يومي مجاني)", 
    provider: "openrouter" 
  },
  "qwen-2.5-7b": { 
    id: "qwen/qwen-2.5-7b-instruct", 
    name: "🇨🇳 Qwen 2.5 7B (عربي ممتاز - حد يومي)", 
    provider: "openrouter" 
  },
  "gemma-2-2b": { 
    id: "google/gemma-2-2b-it:free", 
    name: "✨ Gemma 2 2B (جوجل + مجاني)", 
    provider: "openrouter" 
  },
  
  // 💎 نماذج قوية بحدود يومية مجانية (تتطلب رصيد $0)
  "llama-3.3-70b": { 
    id: "meta-llama/llama-3.3-70b-instruct", 
    name: "🚀 Llama 3.3 70B (أقوى - حدود يومية)", 
    provider: "openrouter" 
  },
  "mistral-7b": {
    id: "mistralai/mistral-7b-instruct:free",
    name: "🌪️ Mistral 7B (مجاني)",
    provider: "openrouter"
  },
  "deepseek-chat": {
    id: "deepseek/deepseek-r1",
    name: "🧠 DeepSeek Chat (مجاني)",
    provider: "openrouter"
  },
  "cohere-command-r-plus": {
    id: "command-r-plus",
    name: "🤖 Cohere Command R+ (مجاني)",
    provider: "cohere"
  },
  "cohere-command-r": {
    id: "command-r",
    name: "🤖 Cohere Command R (مجاني)",
    provider: "cohere"
  },
  
  // 🔄 دعم جوجل كخيار احتياطي
  "gemini-1.5-flash": { 
    id: "google/gemini-1.5-flash-latest", 
    name: "✨ Gemini 1.5 Flash (جوجل)", 
    provider: "google" 
  },
};

// ✅ نماذج الصور (مجانية عبر Pollinations)
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

// ✅ عميل Cohere - الصحيح
export const cohereClient = process.env.COHERE_API_KEY
  ? new CohereClientV2({
      token: process.env.COHERE_API_KEY,
    })
  : null;

// ✅ دالة توليد الرد (دعم متعدد المزودين مع معالجة أخطاء 404)
export async function generateAIResponse(
  messages: any[],
  modelId: string = "llama-3.2-1b"
) {
  const model = chatModels[modelId as keyof typeof chatModels];
  if (!model) {
    throw new Error(`النموذج "${modelId}" غير مدعوم`);
  }

  try {
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

    if (model.provider === "cohere" && cohereClient) {
      const response = await cohereClient.chat.create({
        model: model.id,
        messages: messages.map((m: any) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        })),
      });
      return response.message.content[0]?.text || "";
    }

    throw new Error(`فشل في الاتصال بمزود "${model.provider}" (تأكد من وجود API KEY)`);
    
  } catch (error: any) {
    // ✅ معالجة أخطاء 404 الخاصة بالنماذج غير الموجودة
    if (error.status === 404 && error.message?.includes("No endpoints found")) {
      throw new Error(`النموذج "${model.name}" غير متاح حالياً. جرب نموذجاً آخر.`);
    }
    // ✅ إعادة رمي الأخطاء الأخرى
    throw error;
  }
}

// ✅ دوال الصور والفيديو (مجانية)
export async function generatePollinationsImage(prompt: string, model: string = "flux") {
  const seed = Math.floor(Math.random() * 1000000);
  const timestamp = Date.now();
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${model}&seed=${seed}&width=1024&height=1024&nologo=true&t=${timestamp}`;
}

export async function generateZskyVideo(prompt: string) {
  return `https://zsky.ai/generate?prompt=${encodeURIComponent(prompt)}&type=video`;
}
