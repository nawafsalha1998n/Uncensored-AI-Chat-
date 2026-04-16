import { prisma } from "./db";

export interface DailyLimits {
  images: { used: number; limit: number; remaining: number };
  videos: { used: number; limit: number; remaining: number };
}

export async function getUserDailyUsage(userId: string): Promise<DailyLimits> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let dailyUsage = await prisma.dailyUsage.findUnique({
    where: { userId },
  });

  if (!dailyUsage) {
    dailyUsage = await prisma.dailyUsage.create({
      data: { userId },
    });
  }

  // إعادة تعيين العداد إذا تجاوزت 24 ساعة
  if (new Date(dailyUsage.resetDate) < today) {
    dailyUsage = await prisma.dailyUsage.update({
      where: { userId },
      data: {
        imagesUsed: 0,
        videosUsed: 0,
        resetDate: new Date(),
      },
    });
  }

  return {
    images: {
      used: dailyUsage.imagesUsed,
      limit: 10,
      remaining: 10 - dailyUsage.imagesUsed,
    },
    videos: {
      used: dailyUsage.videosUsed,
      limit: 3,
      remaining: 3 - dailyUsage.videosUsed,
    },
  };
}

export async function incrementImageUsage(userId: string): Promise<number> {
  const usage = await getUserDailyUsage(userId);

  if (usage.images.remaining <= 0) {
    throw new Error("لقد وصلت إلى الحد اليومي من الصور");
  }

  await prisma.dailyUsage.update({
    where: { userId },
    data: { imagesUsed: { increment: 1 } },
  });

  return usage.images.remaining - 1;
}

export async function incrementVideoUsage(userId: string): Promise<number> {
  const usage = await getUserDailyUsage(userId);

  if (usage.videos.remaining <= 0) {
    throw new Error("لقد وصلت إلى الحد اليومي من الفيديوهات");
  }

  await prisma.dailyUsage.update({
    where: { userId },
    data: { videosUsed: { increment: 1 } },
  });

  return usage.videos.remaining - 1;
}
