import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./db";

export async function getOrCreateUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    throw new Error("غير مصرح لك بالدخول");
  }

  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        name: clerkUser.fullName || clerkUser.firstName || "مستخدم جديد",
        email: clerkUser.emailAddresses[0]?.emailAddress || null,
        isAdult: clerkUser.unsafeMetadata?.isAdult === true,
      },
    });
  }

  return user;
}
