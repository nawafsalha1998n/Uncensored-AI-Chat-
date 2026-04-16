"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon, Video as VideoIcon, Bot, Plus, Trash2, History, Download, Maximize2, Paperclip, User, ShieldCheck, Copy, Check, ExternalLink } from "lucide-react";
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
    redirectUrl?: string;
  }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<Mode>("chat");
  const [selectedPersona, setSelectedPersona] = useState("uncensored");
  const [selectedImageModel, setSelectedImageModel] = useState("nano-banana");
  const [selectedVideoModel, setSelectedVideoModel] = useState("zsky-video");
  const [selectedChatModel, setSelectedChatModel] = useState("llama3");
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<{ id: string; title: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: "image" | "video" } | null>(null);
  const [copied, setCopied] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const res = await fetch("/api/chats");
      const data = await res.json();
      if (data.chats) setChats(data.chats);
    } catch (error) {
      console.error("Failed to fetch chats", error);
    }
  };

  const loadChat = async (chatId: string) => {
    setIsLoading(true);
    setShowHistory(false);
    try {
      const res = await fetch(`/api/chats/${chatId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
        setCurrentChatId(chatId);
      }
    } catch (error) {
      toast.error("فشل تحميل المحادثة");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("بدأ التحميل...");
    } catch (error) {
      window.open(url, '_blank');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    const prompt = input;
    setInput("");
    setIsLoading(true);

    try {
      if (selectedMode === "chat") {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            persona: selectedPersona,
            model: selectedChatModel,
            chatId: currentChatId,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "خطأ في الرد");

        setMessages((prev) => [
          ...prev,
          { role: "assistant" as const, content: data.content },
        ]);

        if (data.chatId && data.chatId !== currentChatId) {
          setCurrentChatId(data.chatId);
          fetchChats();
        }
      } 
      else if (selectedMode === "image") {
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, model: selectedImageModel }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "فشل توليد الصورة");

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant" as const,
            content: `✅ تم توليد الصورة بنجاح باستخدام ${selectedImageModel}:`,
            imageUrl: data.imageUrl,
          },
        ]);
        toast.success("تم توليد الصورة!");
      } 
      else if (selectedMode === "video") {
        const res = await fetch("/api/generate-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, model: selectedVideoModel }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "فشل توليد الفيديو");

        if (data.redirectUrl) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant" as const,
              content: `🎬 يرجى الضغط على الرابط أدناه لإكمال توليد الفيديو مجاناً عبر Zsky AI:`,
              redirectUrl: data.redirectUrl,
            },
          ]);
          toast.info("تم توجيهك لـ Zsky AI");
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant" as const,
              content: "✅ تم توليد الفيديو بنجاح:",
              videoUrl: data.videoUrl,
            },
          ]);
          toast.success("تم توليد الفيديو!");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ غير متوقع");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden text-zinc-100 font-sans">
      {/* Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-4 backdrop-blur-sm">
          <button onClick={() => setPreviewMedia(null)} className="absolute top-6 right-6 text-zinc-400 hover:text-white p-2 hover:bg-zinc-800 rounded-full transition">✕</button>
          <div className="max-w-5xl w-full flex flex-col items-center">
            {previewMedia.type === "image" ? (
              <img src={previewMedia.url} alt="Preview" className="max-h-[80vh] rounded-2xl shadow-2xl border border-zinc-800" />
            ) : (
              <video src={previewMedia.url} controls autoPlay className="max-h-[80vh] rounded-2xl shadow-2xl border border-zinc-800" />
            )}
            <div className="mt-6 flex gap-4">
              <button onClick={() => handleDownload(previewMedia.url, "ai-file")} className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl font-bold hover:scale-105 transition shadow-lg">
                <Download className="w-5 h-5" /> تحميل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex-none border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md px-4 py-4 flex items-center gap-3 z-20">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-xl shadow-lg">🚀</div>
        <div className="flex-1 hidden sm:block">
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">AI Uncensored Pro</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Zsky AI • Nano Banana • Llama 3.3</p>
        </div>

        <div className="flex items-center gap-2">
          {selectedMode === "chat" && (
            <select value={selectedChatModel} onChange={(e) => setSelectedChatModel(e.target.value)} className="bg-zinc-800 border-none rounded-lg text-xs px-3 py-1.5 outline-none">
              <option value="llama3">🦙 Llama 3.3</option>
              <option value="qwen">🧠 Qwen Max</option>
              <option value="gpt4">🤖 GPT-4o</option>
            </select>
          )}
          {selectedMode === "image" && (
            <select value={selectedImageModel} onChange={(e) => setSelectedImageModel(e.target.value)} className="bg-zinc-800 border-none rounded-lg text-xs px-3 py-1.5 outline-none">
              <option value="nano-banana">🍌 Nano Banana</option>
              <option value="perchance">✨ Perchance</option>
              <option value="fal-flux-realism">🔥 Fal Realism</option>
              <option value="flux-pro">💎 Flux Pro</option>
            </select>
          )}
          {selectedMode === "video" && (
            <select value={selectedVideoModel} onChange={(e) => setSelectedVideoModel(e.target.value)} className="bg-zinc-800 border-none rounded-lg text-xs px-3 py-1.5 outline-none">
              <option value="zsky-video">🎬 Zsky (مجاني)</option>
              <option value="veo-3-1-fast">🎥 Veo 3.1</option>
              <option value="fal-fast-video">⚡ Fal Fast</option>
            </select>
          )}
          <ModelSelector selected={selectedMode} onSelect={setSelectedMode} />
          <button onClick={() => setShowHistory(!showHistory)} className={cn("w-10 h-10 rounded-2xl flex items-center justify-center border border-zinc-800", showHistory ? "bg-purple-600" : "bg-zinc-800")}>
            <History className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-zinc-800 animate-bounce">👋</div>
                <h2 className="text-2xl font-bold text-white">كيف يمكنني مساعدتك اليوم؟</h2>
                <p className="text-zinc-500 max-w-md">أنا ذكاء اصطناعي بدون قيود، يمكنني الدردشة، توليد الصور، والفيديوهات الاحترافية.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%] p-4 rounded-3xl shadow-sm", msg.role === "user" ? "bg-purple-600 text-white rounded-tr-none" : "bg-zinc-900 text-zinc-200 rounded-tl-none border border-zinc-800")}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  {msg.imageUrl && (
                    <div className="mt-3 group relative">
                      <img src={msg.imageUrl} alt="Generated" className="rounded-2xl border border-zinc-700 max-w-full cursor-zoom-in hover:opacity-90 transition" onClick={() => setPreviewMedia({ url: msg.imageUrl!, type: "image" })} />
                      <button onClick={() => handleDownload(msg.imageUrl!, "ai-image.png")} className="absolute top-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition"><Download className="w-4 h-4" /></button>
                    </div>
                  )}
                  {msg.videoUrl && (
                    <div className="mt-3 group relative">
                      <video src={msg.videoUrl} controls className="rounded-2xl border border-zinc-700 max-w-full" />
                      <button onClick={() => handleDownload(msg.videoUrl!, "ai-video.mp4")} className="absolute top-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition"><Download className="w-4 h-4" /></button>
                    </div>
                  )}
                  {msg.redirectUrl && (
                    <a href={msg.redirectUrl} target="_blank" className="mt-3 flex items-center gap-2 p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition text-purple-400">
                      <ExternalLink className="w-4 h-4" /> فتح Zsky AI لإكمال التوليد
                    </a>
                  )}
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>

          {/* Input Bar */}
          <div className="p-4 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800">
            <div className="max-w-4xl mx-auto flex items-end gap-2 bg-zinc-900 p-2 rounded-[2rem] border border-zinc-800 shadow-2xl focus-within:border-purple-500/50 transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder={selectedMode === "chat" ? "اسألني أي شيء..." : `اكتب وصف ال${selectedMode === 'image' ? 'صورة' : 'فيديو'}...`}
                className="flex-1 bg-transparent border-none outline-none p-3 text-sm resize-none max-h-32 min-h-[44px] text-zinc-200"
                rows={1}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg",
                  isLoading || !input.trim() ? "bg-zinc-800 text-zinc-500" : "bg-purple-600 text-white hover:scale-105 active:scale-95 shadow-purple-500/20"
                )}
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
