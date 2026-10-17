import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";

export const SESSION_COOKIE = "charity_session";
export const SESSION_MAX_AGE_S = 60 * 60 * 8;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    maxAge: SESSION_MAX_AGE_S,
  };
}

/** Creates a session row and returns the raw token to put in the cookie. */
export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_S * 1000),
    },
  });
  // Opportunistic cleanup of expired sessions.
  await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  return token;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function getUserByToken(token: string | undefined | null): Promise<AdminUser | null> {
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!session || session.expiresAt.getTime() < Date.now()) return null;
  const { id, email, name, role } = session.user;
  return { id, email, name, role };
}

export async function destroySession(token: string | undefined | null): Promise<void> {
  if (!token) return;
  await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
}

export function tokenFromCookieHeader(header: string | null): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === SESSION_COOKIE) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

/** For route handlers: authenticate straight from the request. */
export async function getUserFromRequest(request: Request): Promise<AdminUser | null> {
  return getUserByToken(tokenFromCookieHeader(request.headers.get("cookie")));
}

/** For Server Components / actions: current admin or null. */
export async function getCurrentUser(): Promise<AdminUser | null> {
  const store = await cookies();
  return getUserByToken(store.get(SESSION_COOKIE)?.value);
}

/** Redirects to the login page unless an admin session is present. */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
