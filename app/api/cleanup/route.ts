import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    
    // حذف المحادثات المنتهية
    const deletedChats = await prisma.chat.deleteMany({
      where: {
        expiresAt: {
          lte: now,
        },
      },
    });

    console.log(`✅ Deleted ${deletedChats.count} expired chats`);

    return NextResponse.json({
      success: true,
      deletedCount: deletedChats.count,
    });
  } catch (error) {
    console.error("❌ Cleanup Error:", error);
    return NextResponse.json({ error: "Failed to cleanup" }, { status: 500 });
  }
}

// تشغيل تلقائي كل ساعة في Vercel
export const runtime = 'edge';
