import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDateTime, formatNumber, formatSar } from "@/lib/format";
import { publicDonorName } from "@/lib/donations";

export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-sm text-ink-soft">{label}</p>
      <p className="mt-1 text-2xl font-bold text-brand">{value}</p>
    </div>
  );
}

export default async function AdminHome() {
  const [paid, donors, volunteers, newVolunteers, activeCampaigns, recent] = await Promise.all([
    prisma.donation.aggregate({ where: { status: "PAID" }, _sum: { amount: true }, _count: { _all: true } }),
    prisma.donor.count(),
    prisma.volunteer.count(),
    prisma.volunteer.count({ where: { status: "NEW" } }),
    prisma.campaign.count({ where: { status: "ACTIVE" } }),
    prisma.donation.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { campaign: { select: { title: true } } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">نظرة عامة</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="إجمالي التبرعات" value={formatSar(paid._sum.amount ?? 0)} />
        <Stat label="عدد التبرعات" value={formatNumber(paid._count._all)} />
        <Stat label="المتبرعون" value={formatNumber(donors)} />
        <Stat label="حملات جارية" value={formatNumber(activeCampaigns)} />
        <Stat label="متطوعون جدد" value={`${formatNumber(newVolunteers)} من ${formatNumber(volunteers)}`} />
      </div>

      <section aria-labelledby="recent">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="recent" className="text-lg font-bold">
            آخر التبرعات
          </h2>
          <Link href="/admin/donations" className="text-sm text-brand underline">
            كل التبرعات
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="card p-6 text-ink-soft">لا توجد تبرعات بعد.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>الإيصال</th>
                  <th>المتبرع</th>
                  <th>الحملة</th>
                  <th>المبلغ</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((d) => (
                  <tr key={d.id}>
                    <td dir="ltr">{d.receiptNo}</td>
                    <td>{publicDonorName(d)}</td>
                    <td>{d.campaign.title}</td>
                    <td>{formatSar(d.amount)}</td>
                    <td>{formatDateTime(d.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
