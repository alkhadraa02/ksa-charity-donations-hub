import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProgressBar } from "@/components/progress-bar";
import { getCampaignBySlug } from "@/lib/campaigns";
import { ORG_NAME, SITE_URL, categoryLabel } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { publicDonorName } from "@/lib/donations";
import { daysLeft, formatDate, formatNumber, formatSar } from "@/lib/format";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

function clip(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) return { title: "حملة غير موجودة", robots: { index: false } };
  const description = campaign.summary.length >= 50 ? clip(campaign.summary, 160) : clip(`${campaign.summary} ساهم في هذه الحملة الخيرية الآن.`, 160);
  return {
    title: clip(campaign.title, 55),
    description,
    alternates: { canonical: `/campaigns/${campaign.slug}` },
    openGraph: { url: `/campaigns/${campaign.slug}`, title: campaign.title, description, type: "article" },
  };
}

export default async function CampaignPage({ params }: Params) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) notFound();

  const recent = await prisma.donation.findMany({
    where: { campaignId: campaign.id, status: "PAID" },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: { id: true, amount: true, anonymous: true, donorName: true, createdAt: true },
  });
  const left = daysLeft(campaign.endsAt);
  const open = campaign.status === "ACTIVE";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DonateAction",
    name: campaign.title,
    description: campaign.summary,
    url: `${SITE_URL}/campaigns/${campaign.slug}`,
    recipient: { "@type": "NonprofitOrganization", name: ORG_NAME },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className={`tone-hero tone-${campaign.tone}`}>
        <div className="page py-12">
          <nav aria-label="مسار التنقل" className="text-sm opacity-90">
            <Link href="/campaigns" className="underline">الحملات</Link> / {categoryLabel(campaign.category)}
          </nav>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight md:text-4xl">{campaign.title}</h1>
          <p className="mt-3 max-w-2xl opacity-95">{campaign.summary}</p>
        </div>
      </header>

      <div className="page mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 grid gap-8">
          <section aria-labelledby="story-title" className="card p-6">
            <h2 id="story-title" className="text-xl font-bold">قصة الحملة</h2>
            <div className="prose-ar mt-3">
              {campaign.story.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          <section aria-labelledby="updates-title" className="card p-6">
            <h2 id="updates-title" className="text-xl font-bold">آخر التحديثات</h2>
            {campaign.updates.length === 0 ? (
              <p className="mt-3 text-ink-soft">لا توجد تحديثات بعد، سننشر المستجدات هنا.</p>
            ) : (
              <ol className="mt-4 grid gap-4 border-s-2 border-line ps-4">
                {campaign.updates.map((u) => (
                  <li key={u.id}>
                    <p className="text-xs text-ink-soft">{formatDate(u.createdAt)}</p>
                    <h3 className="font-bold">{u.title}</h3>
                    <p className="text-ink-soft">{u.body}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="grid h-fit gap-4 lg:sticky lg:top-24">
          <div className="card p-5">
            <p className="text-3xl font-bold text-brand">{formatSar(campaign.raised)}</p>
            <p className="text-sm text-ink-soft">تم جمعها من هدف {formatSar(campaign.goalAmount)}</p>
            <div className="mt-3">
              <ProgressBar percent={campaign.percent} label="نسبة تحقق الهدف" />
            </div>
            <p className="mt-2 text-sm text-ink-soft">
              {campaign.percent}% · {formatNumber(campaign.donorCount)} تبرعاً
              {left !== null && open ? ` · متبقي ${formatNumber(left)} يوماً` : ""}
            </p>
            {open ? (
              <Link href={`/donate?campaign=${campaign.slug}`} className="btn btn-primary mt-4 w-full">تبرع لهذه الحملة</Link>
            ) : (
              <p className="alert alert-ok mt-4">اكتملت هذه الحملة، شكراً لكل المتبرعين.</p>
            )}
          </div>
          <div className="card p-5">
            <h2 className="font-bold">أحدث المتبرعين</h2>
            {recent.length === 0 ? (
              <p className="mt-2 text-sm text-ink-soft">كن أول المتبرعين.</p>
            ) : (
              <ul className="mt-3 grid gap-2 text-sm">
                {recent.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate">{publicDonorName(d)}</span>
                    <span className="shrink-0 font-semibold text-brand">{formatSar(d.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </article>
  );
}
