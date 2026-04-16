"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 to-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl">🤖</div>
            <h1 className="text-3xl font-bold tracking-tight">AI Uncensored</h1>
          </div>
          <div className="flex items-center gap-4">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-6 py-2.5 bg-white text-black font-medium rounded-2xl hover:bg-white/90 transition">
                  تسجيل الدخول
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>

        {/* Glass Card */}
        <div className="glass rounded-3xl p-10 text-center">
          <h2 className="text-5xl font-bold mb-4">مرحباً بك في شات الذكاء الاصطناعي</h2>
          <p className="text-xl text-zinc-400 mb-8">
            دردشة • توليد صور • توليد فيديوهات<br />
            <span className="text-purple-400">بدون رقابة للأعمار 18+</span>
          </p>

          <SignedIn>
            <Link
              href="/chat"
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-black font-semibold text-lg rounded-3xl hover:scale-105 transition"
            >
              ابدأ الدردشة الآن →
            </Link>
          </SignedIn>

          <SignedOut>
            <p className="text-sm text-zinc-500">سجل دخول لتجربة الميزات كاملة</p>
          </SignedOut>
        </div>

        <p className="text-center text-xs text-zinc-500 mt-8">
          مدعوم بـ Groq + Together.ai + Vercel
        </p>
      </div>
    </main>
  );
}
