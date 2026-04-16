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
    <div className="flex gap-1 bg-zinc-900 p-1 rounded-3xl border border-zinc-700 shadow-inner">
      <button
        onClick={() => onSelect("chat")}
        className={cn(
          "flex items-center gap-2 px-6 py-3 rounded-3xl text-sm font-medium transition-all",
          selected === "chat"
            ? "bg-white text-black shadow-md"
            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
        )}
      >
        <Bot className="w-5 h-5" />
        دردشة
      </button>
      <button
        onClick={() => onSelect("image")}
        className={cn(
          "flex items-center gap-2 px-6 py-3 rounded-3xl text-sm font-medium transition-all",
          selected === "image"
            ? "bg-white text-black shadow-md"
            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
        )}
      >
        <Image className="w-5 h-5" />
        صورة
      </button>
      <button
        onClick={() => onSelect("video")}
        className={cn(
          "flex items-center gap-2 px-6 py-3 rounded-3xl text-sm font-medium transition-all",
          selected === "video"
            ? "bg-white text-black shadow-md"
            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
        )}
      >
        <Video className="w-5 h-5" />
        فيديو
      </button>
    </div>
  );
}
