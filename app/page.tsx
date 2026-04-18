import Link from "next/link";
import { MessageSquare, Image as ImageIcon, Video, History } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            AI Uncensored Pro
          </h1>
          <p className="text-zinc-400 text-lg">اختر نوع المحتوى للبدء</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* دردشة نصية */}
          <Link href="/chat" className="group">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-purple-500/50 hover:bg-zinc-900 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">دردشة نصية</h3>
              <p className="text-zinc-400 text-sm">تحدث مع AI بحرية تامة</p>
              <p className="text-zinc-500 text-xs mt-2">📅 تحفظ لمدة 15 يوم</p>
            </div>
          </Link>

          {/* توليد الصور */}
          <Link href="/images" className="group">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-purple-500/50 hover:bg-zinc-900 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">توليد الصور</h3>
              <p className="text-zinc-400 text-sm">أنشئ صوراً احترافية</p>
              <p className="text-zinc-500 text-xs mt-2">📅 تحفظ لمدة أسبوع</p>
            </div>
          </Link>

          {/* توليد الفيديو */}
          <Link href="/videos" className="group">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-purple-500/50 hover:bg-zinc-900 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Video className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">توليد الفيديو</h3>
              <p className="text-zinc-400 text-sm">فيديوهات AI مذهلة</p>
              <p className="text-zinc-500 text-xs mt-2">📅 تحفظ لمدة أسبوع</p>
            </div>
          </Link>
        </div>

        {/* سجل المحادثات */}
        <div className="mt-12">
          <Link href="/history" className="flex items-center gap-3 text-zinc-400 hover:text-white transition">
            <History className="w-5 h-5" />
            <span>سجل المحادثات</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
