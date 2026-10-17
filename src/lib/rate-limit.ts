const hits = new Map<string, number[]>();

/** Tiny in-memory sliding-window limiter. Returns false when the caller is over the limit. */
export function rateLimit(key: string, limit: number, windowMs: number, now: number = Date.now()): boolean {
  if (hits.size > 5000) hits.clear();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

export function resetRateLimits(): void {
  hits.clear();
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "local";
}
