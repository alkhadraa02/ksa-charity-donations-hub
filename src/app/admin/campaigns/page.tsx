import type { Metadata } from "next";
import Link from "next/link";
import { listAllCampaigns } from "@/lib/campaigns";
import { CAMPAIGN_STATUS_LABELS, categoryLabel } from "@/lib/constants";
import { formatNumber, formatSar } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "الحملات" };

export default async function AdminCampaigns() {
  const campaigns = await listAllCampaigns();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">الحملات</h1>
        <Link href="/admin/campaigns/new" className="btn btn-primary">
          حملة جديدة
        </Link>
      </div>
      {campaigns.length === 0 ? (
        <p className="card p-6 text-ink-soft">لا توجد حملات بعد. ابدأ بإنشاء أول حملة.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>الحملة</th>
                <th>التصنيف</th>
                <th>الحالة</th>
                <th>المحصّل</th>
                <th>الهدف</th>
                <th>التقدم</th>
                <th>
                  <span className="sr-only">إجراءات</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td className="font-semibold">{c.title}</td>
                  <td>{categoryLabel(c.category)}</td>
                  <td>
                    <span className={`badge ${c.status === "ACTIVE" ? "badge-ok" : "badge-brand"}`}>
                      {CAMPAIGN_STATUS_LABELS[c.status] ?? c.status}
                    </span>
                  </td>
                  <td>{formatSar(c.raised)}</td>
                  <td>{formatSar(c.goalAmount)}</td>
                  <td>{formatNumber(c.percent)}%</td>
                  <td>
                    <Link href={`/admin/campaigns/${c.id}`} className="text-brand underline">
                      تعديل
                      <span className="sr-only"> {c.title}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
