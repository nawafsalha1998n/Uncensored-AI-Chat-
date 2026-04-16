"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon, Video as VideoIcon, Bot, Plus, Trash2, History, Download, Maximize2, Paperclip, User, ShieldCheck } from "lucide-react";
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
    fileName?: string;
  }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<Mode>("chat");
  const [selectedPersona, setSelectedPersona] = useState("uncensored");
  const [selectedImageModel, setSelectedImageModel] = useState("flux-schnell");
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<{ id: string; title: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: "image" | "video" } | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/chats", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId }),
      });
      if (res.ok) {
        setChats(prev => prev.filter(c => c.id !== chatId));
        if (currentChatId === chatId) {
          setMessages([]);
          setCurrentChatId(null);
        }
        toast.success("تم حذف المحادثة");
      }
    } catch (error) {
      toast.error("فشل حذف المحادثة");
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            content: "✅ تم توليد الصورة بنجاح:",
            imageUrl: data.imageUrl,
          },
        ]);
      } 
      else if (selectedMode === "video") {
        const res = await fetch("/api/generate-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, model: "veo-3-1-fast" }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "فشل توليد الفيديو");

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant" as const,
            content: "✅ تم توليد الفيديو بنجاح عبر Veo 3.1 Fast:",
            videoUrl: data.videoUrl,
          },
        ]);
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ غير متوقع");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden text-zinc-100">
      {/* Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-4">
          <button onClick={() => setPreviewMedia(null)} className="absolute top-6 right-6 text-zinc-400 hover:text-white p-2">✕</button>
          <div className="max-w-5xl w-full flex flex-col items-center">
            {previewMedia.type === "image" ? (
              <img src={previewMedia.url} alt="Preview" className="max-h-[80vh] rounded-2xl shadow-2xl border border-zinc-800" />
            ) : (
              <video src={previewMedia.url} controls autoPlay className="max-h-[80vh] rounded-2xl shadow-2xl border border-zinc-800" />
            )}
            <div className="mt-6 flex gap-4">
              <button 
                onClick={() => handleDownload(previewMedia.url, `ai-generated-${Date.now()}`)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl font-bold hover:scale-105 transition"
              >
                <Download className="w-5 h-5" /> تحميل الملف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex-none border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md px-6 py-4 flex items-center gap-3 z-20">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-purple-500/20">🤖</div>
        <div className="flex-1 hidden sm:block">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">AI Uncensored Pro</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Veo 3.1 • Flux.1 Pro • Uncensored</p>
        </div>

        <div className="flex items-center gap-2">
          {selectedMode === "chat" && (
            <select 
              value={selectedPersona} 
              onChange={(e) => setSelectedPersona(e.target.value)}
              className="bg-zinc-800 border-none rounded-xl text-xs px-3 py-2 outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="uncensored">👤 بدون قيود</option>
              <option value="thinker">🧠 المفكر</option>
              <option value="expert">🎓 الخبير</option>
              <option value="genius">💡 العبقري</option>
              <option value="funny">😂 المرح</option>
            </select>
          )}
          {selectedMode === "image" && (
            <select 
              value={selectedImageModel} 
              onChange={(e) => setSelectedImageModel(e.target.value)}
              className="bg-zinc-800 border-none rounded-xl text-xs px-3 py-2 outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="flux-pro">💎 Flux.1 Pro</option>
              <option value="flux-schnell">⚡ Flux.1 Schnell</option>
              <option value="sd3">🎨 SD 3</option>
              <option value="pollinations">🎁 مجاني</option>
            </select>
          )}
          
          <ModelSelector selected={selectedMode} onSelect={setSelectedMode} />
          
          <button onClick={() => setShowHistory(!showHistory)} className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all border border-zinc-800", showHistory ? "bg-purple-600 border-purple-500" : "bg-zinc-800 text-zinc-400")}>
            <History className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar History */}
        {showHistory && (
          <div className="absolute inset-y-0 right-0 w-72 bg-zinc-900 border-l border-zinc-800 z-30 shadow-2xl animate-in slide-in-from-right">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="font-bold">سجل المحادثات</h2>
              <button onClick={() => setShowHistory(false)}>✕</button>
            </div>
            <div className="overflow-y-auto h-full pb-20 p-2 space-y-1">
              {chats.map((chat) => (
                <div key={chat.id} onClick={() => loadChat(chat.id)} className={cn("group p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between", currentChatId === chat.id ? "bg-purple-600/20 text-purple-400" : "hover:bg-zinc-800 text-zinc-400")}>
                  <span className="truncate text-sm flex-1">{chat.title || "محادثة جديدة"}</span>
                  <button onClick={(e) => deleteChat(chat.id, e)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <div className="max-w-4xl mx-auto w-full p-6 space-y-8 pb-32">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-50">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-6 text-6xl">✨</div>
                <h2 className="text-2xl font-bold">مرحباً بك في النسخة الاحترافية</h2>
                <p className="text-sm">اختر الشخصية أو الموديل وابدأ الإبداع الآن.</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-4", msg.role === "user" ? "flex-row-reverse" : "")}>
                <div className={cn("w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold", msg.role === "user" ? "bg-zinc-700" : "bg-gradient-to-br from-purple-600 to-pink-600")}>
                  {msg.role === "user" ? <User className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </div>

                <div className={cn("max-w-[85%] sm:max-w-[70%] rounded-2xl px-5 py-3.5 border", msg.role === "user" ? "bg-zinc-800 border-zinc-700 rounded-tr-none" : "bg-zinc-900/50 border-zinc-800 rounded-tl-none")}>
                  <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  
                  {msg.imageUrl && (
                    <div className="mt-4 relative group/img overflow-hidden rounded-xl border border-zinc-800">
                      <img src={msg.imageUrl} alt="AI" className="w-full" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button onClick={() => setPreviewMedia({ url: msg.imageUrl!, type: "image" })} className="p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40"><Maximize2 className="w-6 h-6" /></button>
                        <button onClick={() => handleDownload(msg.imageUrl!, "image.png")} className="p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40"><Download className="w-6 h-6" /></button>
                      </div>
                    </div>
                  )}
                  
                  {msg.videoUrl && (
                    <div className="mt-4 relative group/vid overflow-hidden rounded-xl border border-zinc-800">
                      <video src={msg.videoUrl} className="w-full" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/vid:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button onClick={() => setPreviewMedia({ url: msg.videoUrl!, type: "video" })} className="p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40"><Maximize2 className="w-6 h-6" /></button>
                        <button onClick={() => handleDownload(msg.videoUrl!, "video.mp4")} className="p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40"><Download className="w-6 h-6" /></button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </main>
      </div>

      {/* Input Area */}
      <footer className="flex-none p-4 sm:p-6 bg-zinc-950">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-2 pl-4">
            <button onClick={() => fileInputRef.current?.click()} className="p-2 text-zinc-500 hover:text-white transition"><Paperclip className="w-5 h-5" /></button>
            <input type="file" ref={fileInputRef} className="hidden" onChange={() => toast.info("ميزة رفع الملفات قيد التفعيل...")} />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="اكتب رسالتك أو وصف الإبداع..."
              className="flex-1 bg-transparent border-none focus:ring-0 py-3 text-sm sm:text-base"
              disabled={isLoading}
            />
            <button onClick={sendMessage} disabled={isLoading || !input.trim()} className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all", isLoading || !input.trim() ? "bg-zinc-800 text-zinc-600" : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20")}>
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
          <p className="text-center text-[10px] text-zinc-600 mt-3 uppercase tracking-tighter">
            {selectedMode === "chat" ? `النموذج: Llama 3.3 • الشخصية: ${selectedPersona}` : selectedMode === "image" ? `الموديل: ${selectedImageModel}` : "الفيديو: Veo 3.1 Fast"}
          </p>
        </div>
      </footer>
    </div>
  );
}
