import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "AI Uncensored Chat",
  description: "شات بوت AI - صور وفيديوهات بموديلات متعددة + بدون رقابة (18+)",
};

// مهم جداً لـ Clerk v7 + Next.js 16
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="ar" dir="rtl">
        <body className="bg-zinc-950 text-white">
          {children}
          <Toaster position="top-center" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
