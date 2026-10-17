import { errorJson, json, sameOrigin } from "@/lib/api";
import { SESSION_COOKIE, destroySession, tokenFromCookieHeader } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return errorJson("طلب غير مسموح", 403);
  await destroySession(tokenFromCookieHeader(request.headers.get("cookie")));
  const res = json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
