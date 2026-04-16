"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Image, Video, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatInterface() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string; imageUrl?: string; videoUrl?: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // TODO: استدعاء API الدردشة (سنضيفه في الخطوة القادمة)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant" as const, content: "مرحبا! كيف يمكنني مساعدتك اليوم؟ 😊" },
      ]);
      setIsLoading(false);
    }, 800);
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900 px-6 py-4 flex items-center gap-3">
        <Bot className="w-8 h-8 text-purple-400" />
        <div>
          <h1 className="text-2xl font-bold">AI Uncensored Chat</h1>
          <p className="text-sm text-zinc-400">Groq • Together.ai • 18+</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full" style={{ scrollbarWidth: "thin" }}>
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mb-6 text-5xl">🤖</div>
            <h2 className="text-3xl font-semibold mb-2">ابدأ محادثتك الآن</h2>
            <p className="text-zinc-400 max-w-md">اكتب رسالة أو اطلب صورة أو فيديو... بدون أي قيود (للأعمار 18+)</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-4 max-w-[80%]",
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            {msg.role === "assistant" && <div className="w-8 h-8 bg-purple-600 rounded-2xl flex-shrink-0 flex items-center justify-center">🤖</div>}
            <div
              className={cn(
                "rounded-3xl px-5 py-4 text-lg",
                msg.role === "user"
                  ? "bg-white text-black"
                  : "glass text-white"
              )}
            >
              {msg.content}
              {msg.imageUrl && <img src={msg.imageUrl} alt="generated" className="mt-3 rounded-2xl max-w-full" />}
              {msg.videoUrl && <video src={msg.videoUrl} controls className="mt-3 rounded-2xl max-w-full" />}
            </div>
          </div>
        ))}

        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-zinc-800 bg-zinc-900 p-6">
        <div className="max-w-4xl mx-auto flex gap-3">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="اكتب رسالتك هنا... (صورة، فيديو، أي شيء)"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-3xl px-7 py-5 text-lg focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="w-14 h-14 bg-purple-600 hover:bg-purple-500 rounded-3xl flex items-center justify-center transition disabled:opacity-50"
          >
            <Send className="w-7 h-7" />
          </button>

          <button className="w-14 h-14 bg-zinc-800 hover:bg-zinc-700 rounded-3xl flex items-center justify-center transition">
            <Image className="w-7 h-7" />
          </button>

          <button className="w-14 h-14 bg-zinc-800 hover:bg-zinc-700 rounded-3xl flex items-center justify-center transition">
            <Video className="w-7 h-7" />
          </button>
        </div>
        <p className="text-center text-xs text-zinc-500 mt-4">مدعوم بـ Groq + Flux.1 • Daily limits</p>
      </div>
    </div>
  );
}
