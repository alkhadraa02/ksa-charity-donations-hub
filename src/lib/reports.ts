import { prisma } from "./db";
import { daysInMonth, monthRange } from "./dates";
import { riyadhParts } from "./dates";

export interface MonthlyReport {
  year: number;
  month: number;
  totalAmount: number;
  count: number;
  average: number;
  recurringCount: number;
  recurringAmount: number;
  anonymousCount: number;
  newDonors: number;
  newVolunteers: number;
  refunded: number;
  byCampaign: { campaignId: string; title: string; amount: number; count: number }[];
  byDay: { day: number; amount: number }[];
  topDonors: { name: string; amount: number; count: number }[];
}

export async function getMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
  const { start, end } = monthRange(year, month);
  const range = { gte: start, lt: end };

  const [donations, newDonors, newVolunteers, refunded] = await Promise.all([
    prisma.donation.findMany({
      where: { status: "PAID", createdAt: range },
      select: {
        amount: true,
        recurring: true,
        anonymous: true,
        donorName: true,
        createdAt: true,
        campaignId: true,
        donor: { select: { name: true, email: true } },
        campaign: { select: { title: true } },
      },
    }),
    prisma.donor.count({ where: { createdAt: range } }),
    prisma.volunteer.count({ where: { createdAt: range } }),
    prisma.donation.aggregate({
      where: { status: "REFUNDED", createdAt: range },
      _sum: { amount: true },
    }),
  ]);

  const totalAmount = donations.reduce((s, d) => s + d.amount, 0);
  const recurring = donations.filter((d) => d.recurring);

  const campaigns = new Map<string, { campaignId: string; title: string; amount: number; count: number }>();
  const days = new Map<number, number>();
  const donors = new Map<string, { name: string; amount: number; count: number }>();

  for (const d of donations) {
    const c = campaigns.get(d.campaignId) ?? {
      campaignId: d.campaignId,
      title: d.campaign.title,
      amount: 0,
      count: 0,
    };
    c.amount += d.amount;
    c.count += 1;
    campaigns.set(d.campaignId, c);

    const day = riyadhParts(d.createdAt).day;
    days.set(day, (days.get(day) ?? 0) + d.amount);

    if (!d.anonymous) {
      const name = d.donor?.name ?? d.donorName;
      if (name) {
        const key = d.donor?.email ?? name;
        const row = donors.get(key) ?? { name, amount: 0, count: 0 };
        row.amount += d.amount;
        row.count += 1;
        donors.set(key, row);
      }
    }
  }

  const byDay = Array.from({ length: daysInMonth(year, month) }, (_, i) => ({
    day: i + 1,
    amount: days.get(i + 1) ?? 0,
  }));

  return {
    year,
    month,
    totalAmount,
    count: donations.length,
    average: donations.length ? Math.round(totalAmount / donations.length) : 0,
    recurringCount: recurring.length,
    recurringAmount: recurring.reduce((s, d) => s + d.amount, 0),
    anonymousCount: donations.filter((d) => d.anonymous).length,
    newDonors,
    newVolunteers,
    refunded: refunded._sum.amount ?? 0,
    byCampaign: [...campaigns.values()].sort((a, b) => b.amount - a.amount),
    byDay,
    topDonors: [...donors.values()].sort((a, b) => b.amount - a.amount).slice(0, 5),
  };
}
