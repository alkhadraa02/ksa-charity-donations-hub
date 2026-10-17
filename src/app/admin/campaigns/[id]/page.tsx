import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CampaignForm } from "@/components/campaign-form";
import { CampaignUpdateForm } from "@/components/campaign-update-form";
import { prisma } from "@/lib/db";
import { getCampaignById } from "@/lib/campaigns";
import { formatDate, formatSar } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "تعديل حملة" };

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await getCampaignById(id);
  if (!campaign) notFound();
  const updates = await prisma.campaignUpdate.findMany({
    where: { campaignId: id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <Link href="/admin/campaigns" className="text-sm text-brand underline">
          ← الحملات
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{campaign.title}</h1>
        <p className="text-ink-soft">
          المحصّل {formatSar(campaign.raised)} من {formatSar(campaign.goalAmount)} ({campaign.percent}%)
        </p>
      </div>
      <CampaignForm
        initial={{
          id: campaign.id,
          title: campaign.title,
          slug: campaign.slug,
          summary: campaign.summary,
          story: campaign.story,
          category: campaign.category,
          goalAmount: campaign.goalAmount,
          status: campaign.status,
          tone: campaign.tone,
          endsAt: campaign.endsAt ? campaign.endsAt.toISOString().slice(0, 10) : "",
        }}
      />
      <CampaignUpdateForm campaignId={campaign.id} />
      <section aria-labelledby="updates-h">
        <h2 id="updates-h" className="mb-3 text-lg font-bold">
          التحديثات المنشورة
        </h2>
        {updates.length === 0 ? (
          <p className="card p-5 text-ink-soft">لا توجد تحديثات بعد.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {updates.map((u) => (
              <li key={u.id} className="card p-4">
                <p className="font-semibold">{u.title}</p>
                <p className="text-sm text-ink-soft">{formatDate(u.createdAt)}</p>
                <p className="mt-2 whitespace-pre-line">{u.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
