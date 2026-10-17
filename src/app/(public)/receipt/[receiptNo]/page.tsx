import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/print-button";
import { prisma } from "@/lib/db";
import { publicDonorName } from "@/lib/donations";
import { formatDateTime, formatSar } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "إيصال التبرع",
  description: "إيصال تبرعك للحملة الخيرية: رقم الإيصال والمبلغ والتاريخ، ويمكنك طباعته أو حفظه.",
  robots: { index: false, follow: false },
};

export default async function ReceiptPage({ params }: { params: Promise<{ receiptNo: string }> }) {
  const { receiptNo } = await params;
  const donation = await prisma.donation.findUnique({
    where: { receiptNo: receiptNo.toUpperCase() },
    include: { campaign: { select: { title: true, slug: true } } },
  });
  if (!donation) notFound();

  const rows: [string, string][] = [
    ["رقم الإيصال", donation.receiptNo],
    ["الحملة", donation.campaign.title],
    ["المتبرع", publicDonorName(donation)],
    ["المبلغ", formatSar(donation.amount)],
    ["نوع التبرع", donation.recurring ? "شهري متكرر" : "مرة واحدة"],
    ["الحالة", donation.status === "PAID" ? "مدفوع" : donation.status === "REFUNDED" ? "مسترد" : "فاشل"],
    ["التاريخ", formatDateTime(donation.createdAt)],
  ];

  return (
    <div className="page max-w-2xl py-10">
      <div className="card p-6 md:p-8">
        <p className="text-center text-4xl" aria-hidden="true">♥</p>
        <h1 className="mt-2 text-center text-2xl font-bold text-brand">جزاك الله خيراً</h1>
        <p className="mt-1 text-center text-ink-soft">تم استلام تبرعك بنجاح، وهذا إيصالك.</p>
        <dl className="mt-6 divide-y divide-line">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4 py-3">
              <dt className="text-ink-soft">{k}</dt>
              <dd className="min-w-0 break-words font-semibold" dir={k === "رقم الإيصال" ? "ltr" : undefined}>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="no-print mt-6 flex flex-wrap justify-center gap-3">
          <PrintButton />
          <Link href={`/campaigns/${donation.campaign.slug}`} className="btn btn-secondary">العودة إلى الحملة</Link>
          <Link href="/" className="btn btn-secondary">الرئيسية</Link>
        </div>
        <p className="hint mt-4 text-center">هذا إيصال تجريبي: بوابة الدفع وهمية ولم يُخصم أي مبلغ.</p>
      </div>
    </div>
  );
}
