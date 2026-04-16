import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "AI Uncensored Chat",
  description: "شات بوت AI - صور وفيديوهات بموديلات متعددة + بدون رقابة (18+)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased">
        <ClerkProvider>
          {children}
          <Toaster position="top-center" richColors />
        </ClerkProvider>
      </body>
    </html>
  );
}
