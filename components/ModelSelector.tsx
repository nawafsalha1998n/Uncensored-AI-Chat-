"use client";

type ModelCategory = "chat" | "image" | "video";

interface ModelSelectorProps {
  category: ModelCategory;
  selectedModel: string;
  onModelChange: (model: string) => void;
  duration?: number;
  onDurationChange?: (duration: number) => void;
}

export default function ModelSelector({
  category,
  selectedModel,
  onModelChange,
  duration = 5,
  onDurationChange
}: ModelSelectorProps) {

  // ✅ نماذج الدردشة - محدثة
  const chatModels = [
    { id: "llama3", name: "🦙 Llama 3.3 (Groq)" },
    { id: "mixtral", name: "🌪️ Mixtral 8x7B" },
    { id: "gpt4", name: "🤖 GPT-4o" },
    { id: "qwen3.6-plus", name: "🇨🇳 Qwen 3.6 Plus (عربي)" },
    { id: "qwen-flash", name: "⚡ Qwen Flash (سريع)" },
  ];

  // ✅ نماذج الصور - محدثة
  const imageModels = [
    { id: "nano-banana", name: "🍌 Nano Banana 2" },
    { id: "perchance", name: "✨ Perchance" },
    { id: "fal-flux-realism", name: "🔥 Fal Flux Realism" },
    { id: "flux-pro", name: "💎 Flux Pro" },
    { id: "qwen-image", name: "🖼️ Qwen Image (علي بابا)" },
  ];

  // ✅ نماذج الفيديو - محدثة
  const videoModels = [
    { id: "zsky-video", name: "🎬 Zsky AI (Free)" },
    { id: "veo-3-1-fast", name: "🎥 Veo 3.1 Fast" },
    { id: "fal-fast-video", name: "⚡ Fal Fast Video" },
    { id: "wan2.7-t2v", name: "🎞️ Wan 2.7 (نص→فيديو)" },
    { id: "wan2.7-i2v", name: "📷 Wan 2.7 (صورة→فيديو)" },
  ];

  const currentModels = 
    category === "chat" ? chatModels : 
    category === "image" ? imageModels : 
    videoModels;

  return (
    <div className="space-y-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
      <label className="text-sm font-medium text-gray-300">🔹 اختر النموذج</label>
      
      <select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        {currentModels.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      {/* ⏱️ خيار المدة لـ Wan */}
      {category === "video" && selectedModel.startsWith("wan2.7") && onDurationChange && (
        <div className="mt-3">
          <label className="text-sm font-medium text-gray-300">🕒 مدة الفيديو</label>
          <div className="flex gap-2 mt-1">
            {[5, 10, 15].map((d) => (
              <button
                key={d}
                onClick={() => onDurationChange(d)}
                className={`px-3 py-1 rounded-md text-sm transition ${
                  duration === d
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {d} ثانية
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
