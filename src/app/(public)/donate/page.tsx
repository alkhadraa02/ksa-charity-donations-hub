import type { Metadata } from "next";
import Link from "next/link";
import { DonateForm } from "@/components/donate-form";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تبرع الآن",
  description:
    "أكمل تبرعك في دقيقة: اختر الحملة والمبلغ، وفعّل التبرع الشهري المتكرر أو تبرع دون ذكر اسمك، واستلم إيصالك فوراً.",
  alternates: { canonical: "/donate" },
  openGraph: { url: "/donate" },
};

export default async function DonatePage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string }>;
}) {
  const { campaign: slug } = await searchParams;
  const campaigns = await prisma.campaign.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    select: { id: true, slug: true, title: true },
  });
  const selected = campaigns.find((c) => c.slug === slug)?.id;

  return (
    <div className="page max-w-3xl py-10">
      <h1 className="text-3xl font-bold">تبرع الآن</h1>
      <p className="mt-2 text-ink-soft">كل تبرع يصل إلى مستحقيه، وتصلك إيصال بالمبلغ فور إتمام العملية.</p>
      <div className="mt-6">
        {campaigns.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="font-semibold">لا توجد حملات تستقبل التبرعات حالياً.</p>
            <Link href="/campaigns" className="btn btn-secondary mt-4">عرض الحملات</Link>
          </div>
        ) : (
          <DonateForm campaigns={campaigns.map((c) => ({ id: c.id, title: c.title }))} defaultCampaignId={selected} />
        )}
      </div>
    </div>
  );
}
