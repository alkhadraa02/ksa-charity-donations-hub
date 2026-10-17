const numberFormat = new Intl.NumberFormat("ar-SA-u-nu-latn", { maximumFractionDigits: 2 });
const dateFormat = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
  dateStyle: "medium",
  timeZone: "Asia/Riyadh",
});
const dateTimeFormat = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Riyadh",
});

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatSar(value: number): string {
  return `${numberFormat.format(value)} ر.س`;
}

export function formatDate(value: Date | string): string {
  return dateFormat.format(new Date(value));
}

export function formatDateTime(value: Date | string): string {
  return dateTimeFormat.format(new Date(value));
}

/** Progress toward a goal, whole number clamped to 0..100. */
export function progressPercent(raised: number, goal: number): number {
  if (!Number.isFinite(raised) || !Number.isFinite(goal) || goal <= 0 || raised <= 0) return 0;
  return Math.min(100, Math.floor((raised / goal) * 100));
}

/** Days left until a date (never negative); null when there is no end date. */
export function daysLeft(endsAt: Date | null | undefined, now: Date = new Date()): number | null {
  if (!endsAt) return null;
  const diff = new Date(endsAt).getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}
