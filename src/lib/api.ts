import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { getUserFromRequest, type AdminUser } from "./auth";
import { fieldErrors } from "./validation";

export function json(data: unknown, status = 200, headers?: Record<string, string>) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export function errorJson(message: string, status: number, errors?: Record<string, string>) {
  return json({ error: message, errors }, status);
}

/** Parses a JSON body and validates it with zod. Returns either data or a ready error response. */
export async function parseBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<{ data: T; response?: undefined } | { data?: undefined; response: NextResponse }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { response: errorJson("جسم الطلب غير صالح", 400) };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { response: errorJson("بيانات غير صالحة", 422, fieldErrors(parsed.error)) };
  }
  return { data: parsed.data };
}

/** Auth guard for admin route handlers. */
export async function requireAdminRequest(
  request: Request,
): Promise<{ user: AdminUser; response?: undefined } | { user?: undefined; response: NextResponse }> {
  const user = await getUserFromRequest(request);
  if (!user) return { response: errorJson("يلزم تسجيل الدخول", 401) };
  return { user };
}

/** Rejects cross-site state-changing requests (CSRF defence in depth on top of SameSite=Lax). */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
