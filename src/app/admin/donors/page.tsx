import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatDate, formatNumber, formatSar } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "المتبرعون" };

export default async function AdminDonors() {
  const donors = await prisma.donor.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: { donations: { where: { status: "PAID" }, select: { amount: true, createdAt: true } } },
  });

  const rows = donors
    .map((d) => ({
      id: d.id,
      name: d.name,
      email: d.email,
      phone: d.phone,
      since: d.createdAt,
      count: d.donations.length,
      total: d.donations.reduce((s, x) => s + x.amount, 0),
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">المتبرعون</h1>
      <p className="text-ink-soft">{formatNumber(rows.length)} متبرعاً مسجلاً (التبرعات المجهولة لا تُربط بسجل متبرع).</p>
      {rows.length === 0 ? (
        <p className="card p-6 text-ink-soft">لا يوجد متبرعون مسجلون بعد.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>البريد الإلكتروني</th>
                <th>الجوال</th>
                <th>عدد التبرعات</th>
                <th>الإجمالي</th>
                <th>منذ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="font-semibold">{r.name}</td>
                  <td dir="ltr">{r.email}</td>
                  <td dir="ltr">{r.phone ?? "—"}</td>
                  <td>{formatNumber(r.count)}</td>
                  <td>{formatSar(r.total)}</td>
                  <td>{formatDate(r.since)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
