"use client";

import { chatModels, imageModels, videoModels } from "@/lib/ai";

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

  // ✅ تحويل الكائنات إلى مصفوفات قابلة للتكرار
  const chatList = Object.values(chatModels).map(m => ({
    id: m.id,
    name: m.name,
    provider: m.provider
  }));

  return (
    <div className="space-y-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
      <label className="text-sm font-medium text-gray-300">🔹 اختر النموذج</label>
      
      <select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        {/* ✅ عرض النماذج حسب الفئة */}
        {category === "chat" && chatList.map((m) => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
        
        {category === "image" && imageModels.map((m) => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
        
        {category === "video" && videoModels.map((m) => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>

      {/* ⏱️ خيار المدة لنماذج الفيديو من علي بابا */}
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
