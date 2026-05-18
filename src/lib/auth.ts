import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const cookieName = process.env.AUTH_COOKIE_NAME ?? "enhe_session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function signInUser(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(cookieName, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export async function signOutUser() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(cookieName)?.value;
  if (!userId) return null;

  return prisma.user.findFirst({
    where: { id: userId, status: "active" },
    select: {
      id: true,
      email: true,
      phone: true,
      nickname: true,
      avatar: true,
      role: true,
      status: true,
      createdAt: true
    }
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return user;
}
