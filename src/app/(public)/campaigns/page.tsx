import type { Metadata } from "next";
import Link from "next/link";
import { CampaignCard } from "@/components/campaign-card";
import { listPublicCampaigns } from "@/lib/campaigns";
import { CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الحملات الخيرية",
  description:
    "تصفح الحملات الخيرية الجارية: سقيا الماء وكفالة الأيتام والإطعام والرعاية الصحية والتعليم، وتابع نسبة تحقق كل هدف.",
  alternates: { canonical: "/campaigns" },
  openGraph: { url: "/campaigns" },
};

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const valid = CATEGORIES.some((c) => c.value === category) ? category : undefined;
  const campaigns = await listPublicCampaigns(valid);

  return (
    <div className="page py-10">
      <h1 className="text-3xl font-bold">الحملات الخيرية</h1>
      <p className="mt-2 text-ink-soft">اختر حملة وأسهم في تحقيق هدفها.</p>

      <nav aria-label="تصنيفات الحملات" className="mt-6 flex flex-wrap gap-2">
        <Link href="/campaigns" aria-current={!valid ? "true" : undefined} className={`btn btn-sm ${!valid ? "btn-primary" : "btn-secondary"}`}>
          الكل
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={`/campaigns?category=${c.value}`}
            aria-current={valid === c.value ? "true" : undefined}
            className={`btn btn-sm ${valid === c.value ? "btn-primary" : "btn-secondary"}`}
          >
            {c.label}
          </Link>
        ))}
      </nav>

      {campaigns.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="text-lg font-semibold">لا توجد حملات في هذا التصنيف حالياً</p>
          <Link href="/campaigns" className="btn btn-secondary mt-4">عرض كل الحملات</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}
