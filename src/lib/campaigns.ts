import type { Campaign } from "@prisma/client";
import { prisma } from "./db";
import { PUBLIC_CAMPAIGN_STATUSES } from "./constants";
import { progressPercent } from "./format";

export type CampaignWithTotals = Campaign & {
  raised: number;
  donorCount: number;
  percent: number;
};

async function totalsFor(ids: string[]) {
  if (ids.length === 0) return new Map<string, { raised: number; donorCount: number }>();
  const grouped = await prisma.donation.groupBy({
    by: ["campaignId"],
    where: { campaignId: { in: ids }, status: "PAID" },
    _sum: { amount: true },
    _count: { _all: true },
  });
  return new Map(
    grouped.map((g) => [g.campaignId, { raised: g._sum.amount ?? 0, donorCount: g._count._all }]),
  );
}

function withTotals(campaigns: Campaign[], totals: Awaited<ReturnType<typeof totalsFor>>): CampaignWithTotals[] {
  return campaigns.map((c) => {
    const t = totals.get(c.id) ?? { raised: 0, donorCount: 0 };
    return { ...c, ...t, percent: progressPercent(t.raised, c.goalAmount) };
  });
}

export async function listPublicCampaigns(category?: string): Promise<CampaignWithTotals[]> {
  const campaigns = await prisma.campaign.findMany({
    where: { status: { in: PUBLIC_CAMPAIGN_STATUSES }, ...(category ? { category } : {}) },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
  return withTotals(campaigns, await totalsFor(campaigns.map((c) => c.id)));
}

export async function listAllCampaigns(): Promise<CampaignWithTotals[]> {
  const campaigns = await prisma.campaign.findMany({ orderBy: { createdAt: "desc" } });
  return withTotals(campaigns, await totalsFor(campaigns.map((c) => c.id)));
}

export async function getCampaignBySlug(slug: string, publicOnly = true) {
  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    include: { updates: { orderBy: { createdAt: "desc" } } },
  });
  if (!campaign) return null;
  if (publicOnly && !PUBLIC_CAMPAIGN_STATUSES.includes(campaign.status)) return null;
  const totals = await totalsFor([campaign.id]);
  const [withT] = withTotals([campaign], totals);
  return { ...withT, updates: campaign.updates };
}

export async function getCampaignById(id: string) {
  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign) return null;
  const [withT] = withTotals([campaign], await totalsFor([id]));
  return withT;
}
