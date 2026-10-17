import { randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { dayEnd, dayStart } from "./dates";
import type { PaymentProvider } from "./payments";
import type { DonationFilters, DonationInput } from "./validation";

export type DonationResult =
  | { ok: true; receiptNo: string; amount: number; campaignTitle: string }
  | { ok: false; code: "CAMPAIGN_NOT_FOUND" | "CAMPAIGN_CLOSED" | "PAYMENT_FAILED"; message: string };

const RECEIPT_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateReceiptNo(now: Date = new Date()): string {
  const bytes = randomBytes(8);
  let suffix = "";
  for (const b of bytes) suffix += RECEIPT_ALPHABET[b % RECEIPT_ALPHABET.length];
  const ym = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  return `BD-${ym}-${suffix}`;
}

export async function createDonation(
  input: DonationInput,
  provider: PaymentProvider,
): Promise<DonationResult> {
  const campaign = await prisma.campaign.findUnique({ where: { id: input.campaignId } });
  if (!campaign) {
    return { ok: false, code: "CAMPAIGN_NOT_FOUND", message: "الحملة غير موجودة" };
  }
  if (campaign.status !== "ACTIVE") {
    return { ok: false, code: "CAMPAIGN_CLOSED", message: "هذه الحملة لا تستقبل تبرعات حالياً" };
  }

  const receiptNo = generateReceiptNo();
  const charge = await provider.charge({
    amount: input.amount,
    currency: "SAR",
    recurring: input.recurring,
    description: `تبرع لحملة ${campaign.title}`,
    reference: receiptNo,
  });
  if (!charge.ok) {
    return { ok: false, code: "PAYMENT_FAILED", message: charge.error ?? "تعذّرت عملية الدفع" };
  }

  // Link to a donor record only when the donor gave an email and is not anonymous.
  let donorId: string | undefined;
  if (!input.anonymous && input.email) {
    const donor = await prisma.donor.upsert({
      where: { email: input.email },
      update: { name: input.donorName ?? undefined, phone: input.phone ?? undefined },
      create: { email: input.email, name: input.donorName ?? "متبرع", phone: input.phone },
    });
    donorId = donor.id;
  }

  await prisma.donation.create({
    data: {
      receiptNo,
      campaignId: campaign.id,
      donorId,
      donorName: input.anonymous ? null : (input.donorName ?? null),
      anonymous: input.anonymous,
      amount: input.amount,
      recurring: input.recurring,
      status: "PAID",
      provider: provider.name,
      providerRef: charge.providerRef,
    },
  });

  return { ok: true, receiptNo, amount: input.amount, campaignTitle: campaign.title };
}

export function buildDonationWhere(filters: DonationFilters): Prisma.DonationWhereInput {
  const where: Prisma.DonationWhereInput = {};
  if (filters.q) {
    where.OR = [
      { receiptNo: { contains: filters.q.toUpperCase() } },
      { donorName: { contains: filters.q } },
      { donor: { is: { name: { contains: filters.q } } } },
      { donor: { is: { email: { contains: filters.q.toLowerCase() } } } },
    ];
  }
  if (filters.campaignId) where.campaignId = filters.campaignId;
  if (filters.status) where.status = filters.status;
  if (filters.recurring) where.recurring = filters.recurring === "yes";
  const createdAt: Prisma.DateTimeFilter = {};
  const from = filters.from ? dayStart(filters.from) : null;
  const to = filters.to ? dayEnd(filters.to) : null;
  if (from) createdAt.gte = from;
  if (to) createdAt.lt = to;
  if (from || to) where.createdAt = createdAt;
  return where;
}

export const DONATIONS_PAGE_SIZE = 20;

export async function listDonations(filters: DonationFilters) {
  const where = buildDonationWhere(filters);
  const page = filters.page ?? 1;
  const [rows, total, sum] = await Promise.all([
    prisma.donation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * DONATIONS_PAGE_SIZE,
      take: DONATIONS_PAGE_SIZE,
      include: { campaign: { select: { title: true } }, donor: { select: { name: true, email: true } } },
    }),
    prisma.donation.count({ where }),
    prisma.donation.aggregate({ where: { ...where, status: "PAID" }, _sum: { amount: true } }),
  ]);
  return {
    rows,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / DONATIONS_PAGE_SIZE)),
    paidSum: sum._sum.amount ?? 0,
  };
}

/** The name shown publicly/on receipts: never leaks anonymous donors. */
export function publicDonorName(d: { anonymous: boolean; donorName: string | null }): string {
  return d.anonymous || !d.donorName ? "فاعل خير" : d.donorName;
}
