import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/clerk-prisma";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const user = await getOrCreateUser();
    const { chatId } = await params;

    // التحقق من أن المحادثة تنتمي للمستخدم
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!chat || chat.userId !== user.id) {
      return NextResponse.json(
        { error: "المحادثة غير موجودة أو ليست لديك صلاحية الوصول إليها" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messages: chat.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        imageUrl: msg.imageUrl,
        videoUrl: msg.videoUrl,
        modelUsed: msg.modelUsed,
        isUncensored: msg.isUncensored,
        createdAt: msg.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("❌ Get Chat Error:", error);
    return NextResponse.json(
      { error: error.message || "خطأ في الحصول على المحادثة" },
      { status: 500 }
    );
  }
}
