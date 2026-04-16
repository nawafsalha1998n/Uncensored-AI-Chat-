import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/clerk-prisma";
import { getUserDailyUsage } from "@/lib/usage";

export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    const usage = await getUserDailyUsage(user.id);

    return NextResponse.json({
      images: {
        used: usage.images.used,
        limit: usage.images.limit,
        remaining: usage.images.remaining,
        percentage: Math.round((usage.images.used / usage.images.limit) * 100),
      },
      videos: {
        used: usage.videos.used,
        limit: usage.videos.limit,
        remaining: usage.videos.remaining,
        percentage: Math.round((usage.videos.used / usage.videos.limit) * 100),
      },
    });
  } catch (error: any) {
    console.error("❌ Usage Error:", error);
    return NextResponse.json(
      { error: error.message || "خطأ في الحصول على معلومات الاستخدام" },
      { status: 500 }
    );
  }
}
