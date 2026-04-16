import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/clerk-prisma";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser();

    const chats = await prisma.chat.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          select: { id: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      chats: chats.map((chat) => ({
        id: chat.id,
        title: chat.title || "محادثة بدون عنوان",
        messageCount: chat.messages.length,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error("❌ Chats Error:", error);
    return NextResponse.json(
      { error: error.message || "خطأ في الحصول على المحادثات" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    const { chatId } = await request.json();

    if (!chatId) {
      return NextResponse.json(
        { error: "معرف المحادثة مطلوب" },
        { status: 400 }
      );
    }

    // التحقق من أن المحادثة تنتمي للمستخدم
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat || chat.userId !== user.id) {
      return NextResponse.json(
        { error: "المحادثة غير موجودة أو ليست لديك صلاحية حذفها" },
        { status: 403 }
      );
    }

    // حذف المحادثة والرسائل المرتبطة بها
    await prisma.chat.delete({
      where: { id: chatId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Delete Chat Error:", error);
    return NextResponse.json(
      { error: error.message || "خطأ في حذف المحادثة" },
      { status: 500 }
    );
  }
}
