"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon, Video as VideoIcon, Bot, Sparkles, Copy, Check, ExternalLink, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Mode = "chat" | "image" | "video";

export default function ChatInterface() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<Mode>("chat");
  
  // ✅ تم تغيير القيمة الافتراضية إلى Llama 3.3 70B لأنه يعمل لديك
  const [selectedModel, setSelectedModel] = useState("llama-3.3-70b");
  
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: "image" | "video" } | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
    toast.success("تم نسخ النص");
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("تم بدء التحميل");
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

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const endpoint = selectedMode === "chat" 
        ? "/api/chat" 
        : selectedMode === "image" ? "/api/generate-image" 
        : "/api/generate-video";

      const body = { 
        prompt, 
        messages: selectedMode === "chat" ? [...messages, userMessage] : undefined, 
        model: selectedModel 
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ غير متوقع");

      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: data.content,
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden text-zinc-100 selection:bg-purple-500/30">
      
      {/* Header احترافي */}
      <header className="flex-none border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md px-4 py-3 flex items-center justify-between z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent hidden sm:block">
            AI Uncensored Pro
          </h1>
        </div>
        
        <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setSelectedMode("chat")}
            className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5", selectedMode === "chat" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50")}
          >
            <Bot className="w-3.5 h-3.5" /> دردشة
          </button>
          <button
            onClick={() => setSelectedMode("image")}
            className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5", selectedMode === "image" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50")}
          >
            <ImageIcon className="w-3.5 h-3.5" /> صور
          </button>
          <button
            onClick={() => setSelectedMode("video")}
            className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5", selectedMode === "video" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50")}
          >
            <VideoIcon className="w-3.5 h-3.5" /> فيديو
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth max-w-4xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-2">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-300">كيف يمكنني مساعدتك اليوم؟</h2>
            <p className="text-sm text-zinc-500 max-w-xs">يمكنك اختيار الوضع من الأعلى للبدء في الدردشة، أو توليد الصور والفيديو بجودة عالية.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[90%] sm:max-w-[80%] group relative",
              msg.role === "user" 
                ? "bg-zinc-800 text-zinc-100 rounded-2xl rounded-tr-sm" 
                : "bg-transparent text-zinc-300"
            )}>
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-medium text-zinc-500">AI Assistant</span>
                </div>
              )}
              
              <div className={cn("p-3 sm:p-4 text-sm leading-relaxed whitespace-pre-wrap", msg.role === "user" ? "" : "")}>
                {msg.content && <p>{msg.content}</p>}
                
                {msg.imageUrl && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-zinc-800/50 shadow-2xl relative group/img">
                    <img src={msg.imageUrl} className="w-full h-auto max-h-[500px] object-contain bg-zinc-900 cursor-pointer" onClick={() => setPreviewMedia({ url: msg.imageUrl, type: "image" })} />
                    <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
                      <button onClick={() => handleDownload(msg.imageUrl, `image-${Date.now()}.png`)} className="p-1.5 bg-black/60 backdrop-blur rounded-md hover:bg-black/80 text-white"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setPreviewMedia({ url: msg.imageUrl, type: "image" })} className="p-1.5 bg-black/60 backdrop-blur rounded-md hover:bg-black/80 text-white"><ExternalLink className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}

                {msg.videoUrl && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-zinc-800/50 shadow-2xl relative group/vid">
                    <video src={msg.videoUrl} controls className="w-full h-auto max-h-[400px] bg-black" />
                    <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover/vid:opacity-100 transition-opacity">
                      <button onClick={() => handleDownload(msg.videoUrl, `video-${Date.now()}.mp4`)} className="p-1.5 bg-black/60 backdrop-blur rounded-md hover:bg-black/80 text-white"><Check className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}

                {msg.redirectUrl && (
                  <a href={msg.redirectUrl} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:bg-zinc-800/50 transition group/link">
                    <div className="flex items-center gap-2 text-purple-400">
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-xs font-medium">توليد خارجي</span>
                    </div>
                    <span className="text-xs text-zinc-500 group-hover/link:text-zinc-300">اضغط للفتح</span>
                  </a>
                )}
              </div>

              {msg.role === "assistant" && msg.content && (
                <button onClick={() => handleCopy(msg.content)} className="absolute top-0 -left-8 p-1.5 text-zinc-600 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isCopying ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Area - Floating & Modern */}
      <div className="flex-none p-4 sm:p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent pt-12">
        <div className="max-w-3xl mx-auto relative">
          <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-2 shadow-2xl ring-1 ring-white/5 focus-within:ring-purple-500/30 focus-within:border-purple-500/30 transition-all">
            
            {/* Model Selector Pill */}
            <div className="px-2 pb-2 border-b border-zinc-800/50 mb-2">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent text-xs font-medium text-zinc-400 outline-none cursor-pointer hover:text-zinc-200 w-full"
              >
                {/* Chat Models - محدثة لتطابق lib/ai.ts */}
                {selectedMode === "chat" && (
                  <>
                    <option value="llama-3.2-1b">🦙 Llama 3.2 1B (أسرع + مجاني)</option>
                    <option value="gemma-2-2b">✨ Gemma 2 2B (جوجل + مجاني)</option>
                    <option value="mistral-7b">🌪️ Mistral 7B (مجاني)</option>
                    <option value="llama-3.2-3b">🦙 Llama 3.2 3B (متوازن - حد يومي)</option>
                    <option value="qwen-2.5-7b">🇨 Qwen 2.5 7B (عربي - حد يومي)</option>
                    <option value="llama-3.3-70b">🚀 Llama 3.3 70B (أقوى - حد يومي)</option>
                    <option value="gemini-1.5-flash">✨ Gemini 1.5 Flash (جوجل)</option>
                  </>
                )}
                {/* Image Models */}
                {selectedMode === "image" && (
                  <>
                    <option value="flux-pro">💎 Flux Pro (جودة عالية جداً)</option>
                    <option value="nano-banana">🍌 Nano Banana 2 (سريع)</option>
                    <option value="perchance">✨ Perchance (فني)</option>
                  </>
                )}
                {/* Video Models */}
                {selectedMode === "video" && (
                  <>
                    <option value="zsky-video">🎬 Zsky AI (مجاني)</option>
                    <option value="fal-fast-video">⚡ Fal.ai Fast Video</option>
                  </>
                )}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedMode === "chat" ? "اكتب رسالتك هنا..." : selectedMode === "image" ? "وصف الصورة..." : "وصف الفيديو..."}
                className="flex-1 bg-transparent border-none outline-none p-2 text-sm text-zinc-100 resize-none max-h-48 min-h-[44px] placeholder:text-zinc-600 scrollbar-hide"
                rows={1}
              />
              <button 
                onClick={sendMessage} 
                disabled={isLoading || !input.trim()} 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0",
                  isLoading ? "bg-zinc-800 text-zinc-500 cursor-wait" : input.trim() ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25 hover:bg-purple-500 hover:scale-105" : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                )}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] text-zinc-600 mt-2 font-medium">
            AI can make mistakes. Check important info.
          </p>
        </div>
      </div>

      {/* Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in duration-200">
          <button onClick={() => setPreviewMedia(null)} className="absolute top-6 right-6 p-2 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-full text-white transition">
            <X className="w-6 h-6" />
          </button>
          {previewMedia.type === "image" ? (
            <img src={previewMedia.url} className="max-h-[90vh] max-w-[95vw] rounded-xl shadow-2xl" />
          ) : (
            <video src={previewMedia.url} controls autoPlay className="max-h-[90vh] max-w-[95vw] rounded-xl shadow-2xl" />
          )}
        </div>
      )}
    </div>
  );
}
