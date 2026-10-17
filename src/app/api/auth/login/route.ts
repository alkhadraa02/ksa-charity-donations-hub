import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { errorJson, json, parseBody, sameOrigin } from "@/lib/api";
import { SESSION_COOKIE, createSession, sessionCookieOptions, verifyPassword } from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

// Real bcrypt hash of a random value: keeps timing similar when the user does not exist.
const DUMMY_HASH = bcrypt.hashSync(randomBytes(16).toString("hex"), 12);

export async function POST(request: Request) {
  if (!sameOrigin(request)) return errorJson("طلب غير مسموح", 403);
  if (!rateLimit(`login:${getClientIp(request)}`, 10, 5 * 60_000)) {
    return errorJson("محاولات كثيرة، حاول بعد قليل", 429);
  }

  const { data, response } = await parseBody(request, loginSchema);
  if (response) return response;

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  const valid = await verifyPassword(data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) return errorJson("البريد الإلكتروني أو كلمة المرور غير صحيحة", 401);

  const token = await createSession(user.id);
  const res = json({ ok: true, user: { name: user.name, email: user.email } });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
