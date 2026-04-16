"use client";

import { Bot, Image, Video } from "lucide-react";
import { cn } from "@/lib/utils";

type ModelType = "chat" | "image" | "video";

interface ModelSelectorProps {
  selected: ModelType;
  onSelect: (type: ModelType) => void;
}

export default function ModelSelector({ selected, onSelect }: ModelSelectorProps) {
  return (
    <div className="flex gap-1 bg-gradient-to-r from-zinc-900 to-zinc-800 p-1.5 rounded-3xl border border-zinc-700 shadow-lg">
      <button
        onClick={() => onSelect("chat")}
        className={cn(
          "flex items-center gap-2 px-6 py-3 rounded-3xl text-sm font-medium transition-all duration-200",
          selected === "chat"
            ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/50"
            : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
        )}
      >
        <Bot className="w-5 h-5" />
        دردشة
      </button>
      <button
        onClick={() => onSelect("image")}
        className={cn(
          "flex items-center gap-2 px-6 py-3 rounded-3xl text-sm font-medium transition-all duration-200",
          selected === "image"
            ? "bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg shadow-pink-500/50"
            : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
        )}
      >
        <Image className="w-5 h-5" />
        صورة
      </button>
      <button
        onClick={() => onSelect("video")}
        className={cn(
          "flex items-center gap-2 px-6 py-3 rounded-3xl text-sm font-medium transition-all duration-200",
          selected === "video"
            ? "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/50"
            : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
        )}
      >
        <Video className="w-5 h-5" />
        فيديو
      </button>
    </div>
  );
}
