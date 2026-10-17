import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const campaigns = await prisma.campaign
    .findMany({ where: { status: { in: ["ACTIVE", "COMPLETED"] } }, select: { slug: true, updatedAt: true } })
    .catch(() => []);
  const fixed = ["", "/campaigns", "/donate", "/zakat", "/volunteer", "/transparency"];
  return [
    ...fixed.map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.7 })),
    ...campaigns.map((c) => ({
      url: `${SITE_URL}/campaigns/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
