"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  
  // 📚 قوائم النماذج المحدثة
  const chatModels = [
    { id: "llama3", name: "🦙 Llama 3.3 (Groq)" },
    { id: "mixtral", name: "🌪️ Mixtral 8x7B (Groq)" },
    { id: "gpt4", name: "🤖 GPT-4o (OpenAI)" },
    { id: "qwen3.6-plus", name: "🇨🇳 Qwen 3.6 Plus (عربي ممتاز)" },
    { id: "qwen-flash", name: "⚡ Qwen Flash (سريع ورخيص)" },
  ];

  const imageModels = [
    { id: "nano-banana", name: "🍌 Nano Banana 2" },
    { id: "perchance", name: "✨ Perchance" },
    { id: "fal-flux-realism", name: "🔥 Fal Flux Realism" },
    { id: "flux-pro", name: "💎 Flux.1 Pro" },
    { id: "qwen-image", name: "🖼️ Qwen Image (علي بابا)" },
  ];

  const videoModels = [
    { id: "zsky-video", name: "🎬 Zsky AI (مجاني)" },
    { id: "veo-3-1-fast", name: "🎥 Veo 3.1 Fast" },
    { id: "fal-fast-video", name: "⚡ Fal Fast Video" },
    { id: "wan2.7-t2v", name: "🎞️ Wan 2.7 (نص→فيديو)" },
    { id: "wan2.7-i2v", name: "📷 Wan 2.7 (صورة→فيديو)" },
  ];

  const currentModels = category === "chat" ? chatModels : category === "image" ? imageModels : videoModels;

  return (
    <div className="space-y-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
      <Label className="text-gray-300">🔹 اختر النموذج</Label>
      
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white">
          <SelectValue placeholder="اختر نموذجًا..." />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600 text-white max-h-60">
          {currentModels.map((m) => (
            <SelectItem key={m.id} value={m.id} className="hover:bg-gray-700 focus:bg-gray-700">
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* ⏱️ خيار المدة (يظهر فقط لنماذج الفيديو) */}
      {category === "video" && selectedModel.startsWith("wan2.7") && onDurationChange && (
        <div className="mt-3">
          <Label className="text-gray-300 text-sm">🕒 مدة الفيديو</Label>
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
