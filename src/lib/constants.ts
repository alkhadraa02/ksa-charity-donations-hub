export const ORG_NAME = process.env.NEXT_PUBLIC_ORG_NAME || "جمعية بذل الخيرية";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3110";

export const MIN_DONATION = 5;
export const MAX_DONATION = 1_000_000;
export const DONATION_PRESETS = [50, 100, 200, 500, 1000] as const;

export const CATEGORIES = [
  { value: "water", label: "سقيا الماء" },
  { value: "orphans", label: "كفالة الأيتام" },
  { value: "food", label: "إطعام وسلال غذائية" },
  { value: "health", label: "الرعاية الصحية" },
  { value: "education", label: "التعليم" },
  { value: "relief", label: "الإغاثة والطوارئ" },
  { value: "housing", label: "إسكان الأسر المحتاجة" },
] as const;

export const TONES = ["teal", "gold", "rose", "sky", "olive"] as const;
export type Tone = (typeof TONES)[number];

export const CAMPAIGN_STATUSES = ["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"] as const;
export const PUBLIC_CAMPAIGN_STATUSES = ["ACTIVE", "COMPLETED"];

export const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "جارية",
  PAUSED: "متوقفة مؤقتاً",
  COMPLETED: "مكتملة",
  ARCHIVED: "مؤرشفة",
};

export const DONATION_STATUSES = ["PAID", "FAILED", "REFUNDED"] as const;
export const DONATION_STATUS_LABELS: Record<string, string> = {
  PAID: "مدفوع",
  FAILED: "فاشل",
  REFUNDED: "مسترد",
};

export const VOLUNTEER_STATUSES = ["NEW", "CONTACTED", "ACTIVE", "DECLINED"] as const;
export const VOLUNTEER_STATUS_LABELS: Record<string, string> = {
  NEW: "جديد",
  CONTACTED: "تم التواصل",
  ACTIVE: "متطوع فعّال",
  DECLINED: "مرفوض",
};

export const CITIES = [
  "الرياض",
  "جدة",
  "مكة المكرمة",
  "المدينة المنورة",
  "الدمام",
  "الخبر",
  "الأحساء",
  "الطائف",
  "أبها",
  "تبوك",
  "بريدة",
  "حائل",
  "جازان",
  "نجران",
] as const;

export const VOLUNTEER_INTERESTS = [
  { value: "field", label: "العمل الميداني" },
  { value: "logistics", label: "التغليف والتوزيع" },
  { value: "fundraising", label: "جمع التبرعات" },
  { value: "media", label: "الإعلام والتصوير" },
  { value: "medical", label: "الخدمات الصحية" },
  { value: "tech", label: "التقنية والتصميم" },
] as const;

export const VOLUNTEER_AVAILABILITY = [
  { value: "weekdays", label: "أيام الأسبوع" },
  { value: "weekends", label: "نهاية الأسبوع" },
  { value: "events", label: "الفعاليات والمواسم" },
  { value: "flexible", label: "مرن" },
] as const;

export function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function interestLabel(value: string): string {
  return VOLUNTEER_INTERESTS.find((c) => c.value === value)?.label ?? value;
}

export function availabilityLabel(value: string): string {
  return VOLUNTEER_AVAILABILITY.find((c) => c.value === value)?.label ?? value;
}
