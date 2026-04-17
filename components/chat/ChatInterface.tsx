"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon, Video as VideoIcon, Bot, Plus, Trash2, History, Download, Maximize2, Paperclip, User, ShieldCheck, Copy, Check, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Mode = "chat" | "image" | "video"; 

export default function ChatInterface() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<Mode>("chat");
  const [selectedImageModel, setSelectedImageModel] = useState("nano-banana");
  const [selectedVideoModel, setSelectedVideoModel] = useState("zsky-video");
  const [selectedChatModel, setSelectedChatModel] = useState("llama3");
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: "image" | "video" } | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = // fileName: temporarily removed
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("بدأ التحميل...");
    } catch (error) {
      window.open(url, '_blank');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const prompt = input;
    setInput("");
    setIsLoading(true);

    try {
      const endpoint = selectedMode === "chat" ? "/api/chat" : selectedMode === "image" ? "/api/generate-image" : "/api/generate-video";
      const body = { prompt, messages: [...messages, userMessage], model: selectedMode === "chat" ? selectedChatModel : selectedMode === "image" ? selectedImageModel : selectedVideoModel };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");

      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: data.content || (selectedMode === "image" ? "✅ تم توليد الصورة:" : "✅ تم توليد الفيديو:"),
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        redirectUrl: data.redirectUrl
      }]);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden text-zinc-100">
      {/* Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <button onClick={() => setPreviewMedia(null)} className="absolute top-6 right-6 text-white p-2 bg-zinc-800 rounded-full"><X /></button>
          {previewMedia.type === "image" ? (
            <img src={previewMedia.url} className="max-h-[85vh] rounded-xl shadow-2xl border border-zinc-800" />
          ) : (
            <video src={previewMedia.url} controls autoPlay className="max-h-[85vh] rounded-xl shadow-2xl border border-zinc-800" />
          )}
        </div>
      )}

      {/* Header - Sticky */}
      <header className="flex-none border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">🚀</div>
          <h1 className="text-lg font-black tracking-tighter bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">AI UNCENSORED</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <select value={selectedMode} onChange={(e) => setSelectedMode(e.target.value as Mode)} className="bg-zinc-800 border-none rounded-lg text-xs px-3 py-2 outline-none cursor-pointer hover:bg-zinc-700 transition">
            <option value="chat">💬 محادثة</option>
            <option value="image">🎨 صور</option>
            <option value="video">🎬 فيديو</option>
          </select>
          
         <select 
  value={selectedMode === "chat" ? selectedChatModel : selectedMode === "image" ? selectedImageModel : selectedVideoModel} 
  onChange={(e) => selectedMode === "chat" ? setSelectedChatModel(e.target.value) : selectedMode === "image" ? setSelectedImageModel(e.target.value) : setSelectedVideoModel(e.target.value)}
  className="bg-zinc-800 border-none rounded-lg text-xs px-3 py-2 outline-none cursor-pointer hover:bg-zinc-700 transition"
>
  {/* 💬 نماذج الدردشة */}
  {selectedMode === "chat" && (
    <>
      <option value="llama3">🦙 Llama 3.3 (Groq)</option>
      <option value="mixtral">🌪️ Mixtral 8x7B</option>
      <option value="gpt4">🤖 GPT-4o</option>
      <option value="qwen3.6-plus">🇨🇳 Qwen 3.6 Plus (عربي ممتاز)</option>
      <option value="qwen-flash">⚡ Qwen Flash (سريع ورخيص)</option>
    </>
  )}
  
  {/* 🎨 نماذج الصور */}
  {selectedMode === "image" && (
    <>
      <option value="nano-banana">🍌 Nano Banana 2</option>
      <option value="perchance">✨ Perchance</option>
      <option value="fal-flux-realism">🔥 Fal Flux Realism</option>
      <option value="flux-pro">💎 Flux Pro</option>
      <option value="qwen-image">🖼️ Qwen Image (علي بابا)</option>
    </>
  )}
  
  {/* 🎬 نماذج الفيديو */}
  {selectedMode === "video" && (
    <>
      <option value="zsky-video">🎬 Zsky AI (Free)</option>
      <option value="veo-3-1-fast">🎥 Veo 3.1 Fast</option>
      <option value="fal-fast-video">⚡ Fal Fast Video</option>
      <option value="wan2.7-t2v">🎞️ Wan 2.7 (نص→فيديو)</option>
      <option value="wan2.7-i2v">📷 Wan 2.7 (صورة→فيديو)</option>
    </>
  )}
</select>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[80%] p-4 rounded-2xl shadow-xl", msg.role === "user" ? "bg-purple-600 text-white rounded-tr-none" : "bg-zinc-900 border border-zinc-800 rounded-tl-none")}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
              {msg.imageUrl && (
                <div className="mt-4 relative group">
                  <img src={msg.imageUrl} className="rounded-xl border border-zinc-800 cursor-zoom-in" onClick={() => setPreviewMedia({ url: msg.imageUrl, type: "image" })} />
                  <button onClick={() => handleDownload(msg.imageUrl, "ai-image.png")} className="absolute top-2 right-2 p-2 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition"><Download className="w-4 h-4" /></button>
                </div>
              )}
              {msg.videoUrl && (
                <div className="mt-4 relative group">
                  <video src={msg.videoUrl} controls className="rounded-xl border border-zinc-800" />
                  <button onClick={() => handleDownload(msg.videoUrl, "ai-video.mp4")} className="absolute top-2 right-2 p-2 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition"><Download className="w-4 h-4" /></button>
                </div>
              )}
              {msg.redirectUrl && (
                <a href={msg.redirectUrl} target="_blank" className="mt-4 flex items-center gap-2 p-3 bg-zinc-800 rounded-xl text-purple-400 hover:bg-zinc-700 transition">
                  <ExternalLink className="w-4 h-4" /> إكمال التوليد في Zsky AI
                </a>
              )}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input - Sticky */}
      <div className="flex-none p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
        <div className="max-w-4xl mx-auto flex items-center gap-3 bg-zinc-900 p-2 rounded-3xl border border-zinc-800 shadow-2xl focus-within:border-purple-500/50 transition">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 bg-transparent border-none outline-none p-3 text-sm resize-none max-h-32 min-h-[44px]"
            rows={1}
          />
          <button onClick={sendMessage} disabled={isLoading || !input.trim()} className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition disabled:opacity-50">
            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
