import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    
    // حذف المحادثات المنتهية الصلاحية
    const deleted = await prisma.chat.deleteMany({
      where: {
        expiresAt: { lte: now },
      },
    });

    console.log(`✅ تم حذف ${deleted.count} محادثة منتهية`);

    return NextResponse.json({
      success: true,
      deletedCount: deleted.count,
      message: "Cleanup completed successfully",
    });
  } catch (error: any) {
    console.error("❌ Cleanup Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ⚠️ تم إزالة: export const runtime = 'edge'; 
// ليعمل كـ Serverless ويدعم Prisma بدون تضخم الحجم
