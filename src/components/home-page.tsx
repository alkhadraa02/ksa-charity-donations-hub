import type { Metadata } from "next";
import Link from "next/link";
import { CampaignCard } from "@/components/campaign-card";
import { listPublicCampaigns } from "@/lib/campaigns";
import { ORG_NAME, SITE_URL } from "@/lib/constants";
import { formatNumber, formatSar } from "@/lib/format";
import { prisma } from "@/lib/db";

export async function HomeContent() {
  const [campaigns, paid, volunteers] = await Promise.all([
    listPublicCampaigns(),
    prisma.donation.aggregate({ where: { status: "PAID" }, _sum: { amount: true }, _count: { _all: true } }),
    prisma.volunteer.count(),
  ]);
  const featured = campaigns.filter((c) => c.status === "ACTIVE").slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NonprofitOrganization",
    name: ORG_NAME,
    url: SITE_URL,
    description: "جمعية خيرية تجمع التبرعات للحملات الخيرية وتنشر تقارير الإنفاق.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="tone-hero tone-teal">
        <div className="page grid gap-6 py-14 md:py-20">
          <h1 className="max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
            عطاؤك اليوم يصنع فرقاً حقيقياً في حياة محتاج
          </h1>
          <p className="max-w-2xl text-lg opacity-95">
            حملات موثّقة بأهداف واضحة، وتبرع آمن وسريع، وتقارير شفافة تُريك أين ذهب كل ريال.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/donate" className="btn bg-white text-brand hover:bg-brand-soft">تبرع الآن</Link>
            <Link href="/campaigns" className="btn border-white text-white hover:bg-white/10">تصفح الحملات</Link>
          </div>
        </div>
      </section>

      <section aria-label="إحصاءات" className="page -mt-8">
        <dl className="card grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:rtl:divide-x-reverse">
          <div className="p-5 text-center"><dt className="text-sm text-ink-soft">إجمالي التبرعات</dt><dd className="text-2xl font-bold text-brand">{formatSar(paid._sum.amount ?? 0)}</dd></div>
          <div className="p-5 text-center"><dt className="text-sm text-ink-soft">عدد التبرعات</dt><dd className="text-2xl font-bold text-brand">{formatNumber(paid._count._all)}</dd></div>
          <div className="p-5 text-center"><dt className="text-sm text-ink-soft">المتطوعون المسجلون</dt><dd className="text-2xl font-bold text-brand">{formatNumber(volunteers)}</dd></div>
        </dl>
      </section>

      <section className="page mt-14" aria-labelledby="featured-title">
        <div className="flex items-end justify-between gap-4">
          <h2 id="featured-title" className="text-2xl font-bold">حملات جارية</h2>
          <Link href="/campaigns" className="font-semibold text-brand underline">عرض كل الحملات</Link>
        </div>
        {featured.length === 0 ? (
          <p className="card mt-6 p-8 text-center text-ink-soft">لا توجد حملات جارية حالياً.</p>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        )}
      </section>

      <section className="page mt-14" aria-labelledby="how-title">
        <h2 id="how-title" className="text-2xl font-bold">كيف يصل تبرعك؟</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["١", "اختر حملة", "تصفح الحملات الموثقة واختر ما يلامس قلبك."],
            ["٢", "تبرع بأمان", "اختر المبلغ وأكمل التبرع، مرة واحدة أو شهرياً، باسمك أو دون اسم."],
            ["٣", "تابع الأثر", "نشر تحديثات الحملات وتقارير الشفافية الدورية."],
          ].map(([n, title, text]) => (
            <li key={n} className="card p-5">
              <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-brand-soft font-bold text-brand">{n}</span>
              <h3 className="mt-3 text-lg font-bold">{title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="page mt-14 grid gap-5 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-xl font-bold">احسب زكاتك</h2>
          <p className="mt-2 text-ink-soft">حاسبة سهلة تحسب نصاب زكاة المال والذهب والفضة وعروض التجارة.</p>
          <Link href="/zakat" className="btn btn-secondary mt-4">افتح الحاسبة</Link>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-bold">كن متطوعاً</h2>
          <p className="mt-2 text-ink-soft">وقتك وخبرتك عطاء لا يقل أثراً عن المال. سجّل وسنتواصل معك.</p>
          <Link href="/volunteer" className="btn btn-secondary mt-4">سجّل كمتطوع</Link>
        </div>
      </section>
    </>
  );
}
