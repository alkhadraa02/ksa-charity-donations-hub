import { z } from "zod";
import {
  CAMPAIGN_STATUSES,
  CATEGORIES,
  DONATION_STATUSES,
  MAX_DONATION,
  MIN_DONATION,
  TONES,
  VOLUNTEER_AVAILABILITY,
  VOLUNTEER_INTERESTS,
  VOLUNTEER_STATUSES,
} from "./constants";

const trimmed = (min: number, max: number, message: string) =>
  z.string().trim().min(min, message).max(max, message);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, "النص طويل جداً")
    .optional()
    .transform((v) => (v ? v : undefined));

export const donationSchema = z
  .object({
    campaignId: trimmed(1, 60, "الحملة مطلوبة"),
    amount: z
      .number({ error: "المبلغ مطلوب" })
      .int("المبلغ يجب أن يكون رقماً صحيحاً")
      .min(MIN_DONATION, `الحد الأدنى للتبرع ${MIN_DONATION} ريال`)
      .max(MAX_DONATION, "المبلغ أكبر من الحد المسموح"),
    recurring: z.boolean().default(false),
    anonymous: z.boolean().default(false),
    donorName: optionalText(80),
    email: z
      .string()
      .trim()
      .max(120)
      .optional()
      .transform((v) => (v ? v.toLowerCase() : undefined))
      .pipe(z.email("البريد الإلكتروني غير صالح").optional()),
    phone: optionalText(20),
  })
  .refine((d) => d.anonymous || (d.donorName && d.donorName.length >= 2), {
    message: "اسم المتبرع مطلوب أو اختر التبرع بدون اسم",
    path: ["donorName"],
  });
export type DonationInput = z.infer<typeof donationSchema>;

export const volunteerSchema = z.object({
  name: trimmed(2, 80, "الاسم مطلوب"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?966|0)?5\d{8}$/, "رقم الجوال السعودي غير صالح (مثال: 0501234567)"),
  email: z.string().trim().toLowerCase().pipe(z.email("البريد الإلكتروني غير صالح")),
  city: trimmed(2, 40, "المدينة مطلوبة"),
  interests: z
    .array(z.enum(VOLUNTEER_INTERESTS.map((i) => i.value) as [string, ...string[]]))
    .min(1, "اختر مجال تطوع واحداً على الأقل"),
  availability: z.enum(VOLUNTEER_AVAILABILITY.map((i) => i.value) as [string, ...string[]], {
    error: "اختر وقت التفرغ",
  }),
  message: optionalText(500),
});
export type VolunteerInput = z.infer<typeof volunteerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("البريد الإلكتروني غير صالح")),
  password: z.string().min(1, "كلمة المرور مطلوبة").max(200),
});

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const campaignSchema = z.object({
  title: trimmed(3, 120, "العنوان مطلوب (3 أحرف على الأقل)"),
  slug: z.string().trim().toLowerCase().max(80).regex(slugRegex, "الرابط يقبل أحرفاً لاتينية صغيرة وأرقاماً وشرطات فقط"),
  summary: trimmed(10, 300, "الملخص مطلوب (10 أحرف على الأقل)"),
  story: trimmed(20, 8000, "القصة مطلوبة (20 حرفاً على الأقل)"),
  category: z.enum(CATEGORIES.map((c) => c.value) as [string, ...string[]], { error: "اختر التصنيف" }),
  goalAmount: z.coerce
    .number({ error: "المبلغ المستهدف مطلوب" })
    .int("المبلغ المستهدف يجب أن يكون رقماً صحيحاً")
    .min(100, "المبلغ المستهدف لا يقل عن 100 ريال")
    .max(100_000_000, "المبلغ المستهدف كبير جداً"),
  status: z.enum(CAMPAIGN_STATUSES),
  tone: z.enum(TONES),
  endsAt: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || /^\d{4}-\d{2}-\d{2}$/.test(v), "تاريخ الانتهاء غير صالح"),
});
export type CampaignInput = z.infer<typeof campaignSchema>;

export const campaignUpdateSchema = z.object({
  campaignId: trimmed(1, 60, "الحملة مطلوبة"),
  title: trimmed(3, 120, "عنوان التحديث مطلوب"),
  body: trimmed(10, 3000, "نص التحديث مطلوب (10 أحرف على الأقل)"),
});

export const reportSchema = z.object({
  title: trimmed(3, 150, "العنوان مطلوب"),
  period: trimmed(2, 60, "الفترة مطلوبة"),
  year: z.coerce.number().int().min(2000).max(2100),
  summary: trimmed(10, 1000, "الملخص مطلوب"),
  totalIncome: z.coerce.number().int().min(0),
  programSpend: z.coerce.number().int().min(0),
  adminSpend: z.coerce.number().int().min(0),
  fundraisingSpend: z.coerce.number().int().min(0),
});

export const donationFilterSchema = z.object({
  q: z.string().trim().max(80).optional(),
  campaignId: z.string().trim().max(60).optional(),
  status: z.enum(DONATION_STATUSES).optional(),
  recurring: z.enum(["yes", "no"]).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().min(1).max(10_000).optional(),
});
export type DonationFilters = z.infer<typeof donationFilterSchema>;

export const volunteerStatusSchema = z.enum(VOLUNTEER_STATUSES);

/** Flatten zod issues into { field: firstMessage }. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? String(issue.path[0]) : "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
