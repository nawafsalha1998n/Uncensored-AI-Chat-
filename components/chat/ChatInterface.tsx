"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Image, Video, Bot, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import ModelSelector from "@/components/ModelSelector";
import { toast } from "sonner";

type Mode = "chat" | "image" | "video";

export default function ChatInterface() {
  const [messages, setMessages] = useState<{
    role: "user" | "assistant";
    content: string;
    imageUrl?: string;
    videoUrl?: string;
  }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<Mode>("chat");
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    const prompt = input;
    setInput("");
    setIsLoading(true);

    try {
      if (selectedMode === "chat") {
        // === دردشة نصية ===
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            isUncensored: true,
            chatId: currentChatId,
          }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "خطأ في الرد");

        setMessages((prev) => [
          ...prev,
          { role: "assistant" as const, content: data.content },
        ]);

        if (data.chatId) setCurrentChatId(data.chatId);
      } 
      else if (selectedMode === "image") {
        // === توليد صورة ===
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "خطأ في توليد الصورة");

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant" as const,
            content: "✅ تم توليد الصورة بنجاح:",
            imageUrl: data.imageUrl,
          },
        ]);
      } 
      else if (selectedMode === "video") {
        // === توليد فيديو ===
        const res = await fetch("/api/generate-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "خطأ في توليد الفيديو");

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant" as const,
            content: "✅ تم توليد الفيديو بنجاح:",
            videoUrl: data.videoUrl,
          },
        ]);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "حدث خطأ غير متوقع");
      // إعادة الرسالة الأخيرة في حالة الخطأ
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900 px-6 py-4 flex items-center gap-3">
        <Bot className="w-8 h-8 text-purple-400" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">AI Uncensored Chat</h1>
          <p className="text-sm text-zinc-400">Groq • Together.ai • Fal.ai • 18+</p>
        </div>

        {/* Model Selector */}
        <ModelSelector selected={selectedMode} onSelect={setSelectedMode} />

        <button
          onClick={() => {
            setMessages([]);
            setCurrentChatId(null);
            toast.success("تم بدء محادثة جديدة");
          }}
          className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-2xl flex items-center justify-center transition"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full" style={{ scrollbarWidth: "thin" }}>
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mb-6 text-5xl">🤖</div>
            <h2 className="text-3xl font-semibold mb-2">ابدأ محادثتك الآن</h2>
            <p className="text-zinc-400 max-w-md">
              {selectedMode === "chat" && "اكتب رسالة نصية..."}
              {selectedMode === "image" && "اكتب وصف الصورة التي تريدها (Flux.1)"}
              {selectedMode === "video" && "اكتب وصف الفيديو القصير الذي تريده"}
            </p>
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
            {msg.role === "assistant" && (
              <div className="w-8 h-8 bg-purple-600 rounded-2xl flex-shrink-0 flex items-center justify-center">🤖</div>
            )}

            <div
              className={cn(
                "rounded-3xl px-5 py-4 text-lg",
                msg.role === "user"
                  ? "bg-white text-black"
                  : "glass text-white"
              )}
            >
              <p>{msg.content}</p>
              {msg.imageUrl && (
                <img
                  src={msg.imageUrl}
                  alt="generated image"
                  className="mt-3 rounded-2xl max-w-full shadow-2xl"
                />
              )}
              {msg.videoUrl && (
                <video
                  src={msg.videoUrl}
                  controls
                  className="mt-3 rounded-2xl max-w-full shadow-2xl"
                />
              )}
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
              placeholder={
                selectedMode === "chat"
                  ? "اكتب رسالتك هنا..."
                  : selectedMode === "image"
                  ? "وصف الصورة بالتفصيل..."
                  : "وصف الفيديو القصير..."
              }
              className="w-full bg-zinc-800 border border-zinc-700 rounded-3xl px-7 py-5 text-lg focus:outline-none focus:border-purple-500 transition"
              disabled={isLoading}
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="w-14 h-14 bg-purple-600 hover:bg-purple-500 rounded-3xl flex items-center justify-center transition disabled:opacity-50"
          >
            <Send className="w-7 h-7" />
          </button>
        </div>

        <p className="text-center text-xs text-zinc-500 mt-4">
          {selectedMode === "chat" && "مدعوم بـ Llama-3.3-70b • Groq"}
          {selectedMode === "image" && "مدعوم بـ FLUX.1-schnell • Together.ai"}
          {selectedMode === "video" && "مدعوم بـ Fast Video • Fal.ai"}
        </p>
      </div>
    </div>
  );
}
