// نماذج الدردشة الموثوقة والفعالة
export const chatModels = {
  // Groq (مجاني وسريع جداً)
  llama3: { provider: "groq", id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B" },
  mixtral: { provider: "groq", id: "mixtral-8x7b-32768", name: "Mixtral 8x7B" },
  
  // 👤 علي بابا - Qwen (قوي جداً في العربية)
  qwen3plus: { provider: "alibaba", id: "qwen3.6-plus", name: "🇨🇳 Qwen 3.6 Plus (عربي ممتاز)" },
  qwenflash: { provider: "alibaba", id: "qwen-flash", name: "⚡ Qwen Flash (سريع ورخيص)" },
  
  // OpenAI (الخيار الاحترافي)
  gpt4: { provider: "openai", id: "gpt-4o", name: "GPT-4o" },
};

// موديلات الصور الفعالة فقط
export const imageModels = [
  { id: "nano-banana", name: "🍌 Nano Banana 2 (الأقوى)", provider: "Pollinations" },
  { id: "perchance", name: "✨ Perchance (عالي الجودة)", provider: "Pollinations" },
  { id: "fal-flux-realism", name: "🔥 Fal Flux Realism", provider: "Fal.ai" },
  { id: "flux-pro", name: "💎 Flux.1 Pro", provider: "Together.ai" },
  // 👤 علي بابا
  { id: "qwen-image", name: "🖼️ Qwen Image (علي بابا)", provider: "Alibaba" },
];

// موديلات الفيديو الفعالة فقط
export const videoModels = [
  { id: "zsky-video", name: "🎬 Zsky AI (مجاني تماماً)", provider: "Zsky.ai" },
  { id: "veo-3-1-fast", name: "🎥 Veo 3.1 Fast", provider: "Gemini API" },
  { id: "fal-fast-video", name: "⚡ Fal Fast Video", provider: "Fal.ai" },
  // 👤 علي بابا - Wan
  { id: "wan2.7-t2v", name: "🎞️ Wan 2.7 (نص→فيديو)", provider: "Alibaba", duration: [5, 10, 15] },
  { id: "wan2.7-i2v", name: "📷 Wan 2.7 (صورة→فيديو)", provider: "Alibaba", duration: [5, 10] },
];

// ✅ تصدير دوال المساعدة (موجودة في ملفك الحالي)
// تأكد من إضافة دوال generateWanVideo و generateQwenImage كما أرسلتها سابقاً
