// Saudi Arabia is UTC+3 all year (no daylight saving).
const RIYADH_OFFSET_MS = 3 * 60 * 60 * 1000;

export const GREGORIAN_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
] as const;

export function monthRange(year: number, month: number): { start: Date; end: Date } {
  return {
    start: new Date(Date.UTC(year, month - 1, 1) - RIYADH_OFFSET_MS),
    end: new Date(Date.UTC(year, month, 1) - RIYADH_OFFSET_MS),
  };
}

export function riyadhParts(date: Date): { year: number; month: number; day: number } {
  const shifted = new Date(date.getTime() + RIYADH_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

export function currentMonth(now: Date = new Date()): { year: number; month: number } {
  const p = riyadhParts(now);
  return { year: p.year, month: p.month };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function parseDay(value: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return { y, m, d };
}

/** Start of a YYYY-MM-DD day in Riyadh time, as a UTC Date. */
export function dayStart(value: string): Date | null {
  const p = parseDay(value);
  if (!p) return null;
  return new Date(Date.UTC(p.y, p.m - 1, p.d) - RIYADH_OFFSET_MS);
}

/** Exclusive end (start of next day) of a YYYY-MM-DD day in Riyadh time. */
export function dayEnd(value: string): Date | null {
  const start = dayStart(value);
  return start ? new Date(start.getTime() + 86_400_000) : null;
}
