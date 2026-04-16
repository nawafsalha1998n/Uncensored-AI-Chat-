"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Image, Video, Bot, Plus, Trash2, History } from "lucide-react";
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
  const [chats, setChats] = useState<{ id: string; title: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // جلب سجل المحادثات عند التحميل
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

        if (data.chatId && data.chatId !== currentChatId) {
          setCurrentChatId(data.chatId);
          fetchChats();
        }
      } 
      else if (selectedMode === "image") {
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        const data = await res.ok ? await res.json() : { error: "فشل توليد الصورة" };
        
        // استخدام Pollinations كبديل مجاني إذا فشل الأساسي
        if (!res.ok || !data.imageUrl) {
          const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant" as const,
              content: "✅ تم توليد الصورة (باستخدام محرك احتياطي مجاني):",
              imageUrl: pollinationsUrl,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant" as const,
              content: "✅ تم توليد الصورة بنجاح:",
              imageUrl: data.imageUrl,
            },
          ]);
        }
      } 
      else if (selectedMode === "video") {
        const res = await fetch("/api/generate-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "فشل توليد الفيديو");

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
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <header className="flex-none border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md px-6 py-4 flex items-center gap-3 z-20">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-purple-500/20">🤖</div>
        <div className="flex-1 hidden sm:block">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Uncensored Chat
          </h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Premium AI Experience • 18+</p>
        </div>

        <div className="flex items-center gap-2">
          <ModelSelector selected={selectedMode} onSelect={setSelectedMode} />
          
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center transition-all border border-zinc-800",
              showHistory ? "bg-purple-600 text-white border-purple-500" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
          >
            <History className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              setMessages([]);
              setCurrentChatId(null);
              toast.success("محادثة جديدة");
            }}
            className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-2xl flex items-center justify-center transition border border-zinc-800"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar History - Overlays on mobile, fixed on desktop if wanted */}
        {showHistory && (
          <div className="absolute inset-y-0 right-0 w-72 bg-zinc-900 border-l border-zinc-800 z-30 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="font-bold text-zinc-200">سجل المحادثات</h2>
              <button onClick={() => setShowHistory(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>
            <div className="overflow-y-auto h-full pb-20 p-2 space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => loadChat(chat.id)}
                  className={cn(
                    "group p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between",
                    currentChatId === chat.id ? "bg-purple-600/20 text-purple-400 border border-purple-500/30" : "hover:bg-zinc-800 text-zinc-400"
                  )}
                >
                  <span className="truncate text-sm flex-1">{chat.title || "محادثة جديدة"}</span>
                  <button 
                    onClick={(e) => deleteChat(chat.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {chats.length === 0 && (
                <div className="text-center py-10 text-zinc-600 text-sm">لا يوجد سجل حالياً</div>
              )}
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth" style={{ scrollbarWidth: "none" }}>
          <div className="max-w-4xl mx-auto w-full p-6 space-y-8 pb-32">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-50">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-6 text-6xl">✨</div>
                <h2 className="text-2xl font-bold text-zinc-300 mb-2">كيف يمكنني مساعدتك اليوم؟</h2>
                <p className="text-zinc-500 max-w-xs text-sm">ابدأ دردشة غير مقيدة، أو اطلب إنشاء صور وفيديوهات خيالية.</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-4 group",
                  msg.role === "user" ? "flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold shadow-lg",
                  msg.role === "user" ? "bg-zinc-700 text-white" : "bg-gradient-to-br from-purple-600 to-pink-600 text-white"
                )}>
                  {msg.role === "user" ? "U" : "AI"}
                </div>

                <div className={cn(
                  "max-w-[85%] sm:max-w-[70%] rounded-2xl px-5 py-3.5 shadow-sm transition-all",
                  msg.role === "user" 
                    ? "bg-zinc-800 text-zinc-100 rounded-tr-none border border-zinc-700" 
                    : "bg-zinc-900/50 text-zinc-200 rounded-tl-none border border-zinc-800 backdrop-blur-sm"
                )}>
                  <div className="prose prose-invert max-w-none text-base leading-relaxed">
                    {msg.content}
                  </div>
                  
                  {msg.imageUrl && (
                    <div className="mt-4 relative group/img">
                      <img
                        src={msg.imageUrl}
                        alt="AI generated"
                        className="rounded-xl w-full border border-zinc-800 shadow-2xl hover:scale-[1.01] transition-transform duration-500"
                        loading="lazy"
                      />
                      <a 
                        href={msg.imageUrl} 
                        target="_blank" 
                        className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity"
                      >
                        عرض الحجم الكامل
                      </a>
                    </div>
                  )}
                  
                  {msg.videoUrl && (
                    <div className="mt-4">
                      <video
                        src={msg.videoUrl}
                        controls
                        className="rounded-xl w-full border border-zinc-800 shadow-2xl"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={scrollRef} className="h-4" />
          </div>
        </main>
      </div>

      {/* Input Area - Fixed at Bottom */}
      <footer className="flex-none p-4 sm:p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent z-10">
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-2 pl-4 shadow-2xl">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder={
                  selectedMode === "chat" ? "اسأل عن أي شيء..." : 
                  selectedMode === "image" ? "صف الصورة التي تتخيلها..." : "صف الفيديو الذي تريده..."
                }
                className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-100 py-3 text-sm sm:text-base placeholder:text-zinc-600"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                  isLoading || !input.trim() 
                    ? "bg-zinc-800 text-zinc-600" 
                    : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-105 active:scale-95 shadow-purple-500/20"
                )}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </button>
            </div>
          </div>
          <div className="mt-3 flex justify-center gap-4">
             <p className="text-[10px] text-zinc-600 flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
               النظام نشط وجاهز
             </p>
             <p className="text-[10px] text-zinc-600">
               {selectedMode === "chat" ? "Llama 3.3 70B" : selectedMode === "image" ? "Flux / Pollinations" : "Fal AI Video"}
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
