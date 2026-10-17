import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { listDonations, publicDonorName } from "@/lib/donations";
import { DONATION_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime, formatNumber, formatSar } from "@/lib/format";
import { donationFilterSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "سجل التبرعات" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminDonations({ searchParams }: { searchParams: SP }) {
  const raw = await searchParams;
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    const value = Array.isArray(v) ? v[0] : v;
    if (value) flat[k] = value;
  }
  const parsed = donationFilterSchema.safeParse(flat);
  const filters = parsed.success ? parsed.data : {};
  const [data, campaigns] = await Promise.all([
    listDonations(filters),
    prisma.campaign.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) if (v && k !== "page") qs.set(k, String(v));
  const base = qs.toString();
  const pageHref = (p: number) => `/admin/donations?${base ? `${base}&` : ""}page=${p}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">سجل التبرعات</h1>
        <a href={`/api/admin/donations/export${base ? `?${base}` : ""}`} className="btn btn-secondary" download>
          تصدير CSV
        </a>
      </div>

      <form method="get" className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4" role="search" aria-label="تصفية التبرعات">
        <div>
          <label htmlFor="q" className="label">بحث</label>
          <input id="q" name="q" className="field" defaultValue={filters.q ?? ""} placeholder="رقم الإيصال أو الاسم" />
        </div>
        <div>
          <label htmlFor="campaignId" className="label">الحملة</label>
          <select id="campaignId" name="campaignId" className="field" defaultValue={filters.campaignId ?? ""}>
            <option value="">الكل</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="label">الحالة</label>
          <select id="status" name="status" className="field" defaultValue={filters.status ?? ""}>
            <option value="">الكل</option>
            {Object.entries(DONATION_STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="recurring" className="label">النوع</label>
          <select id="recurring" name="recurring" className="field" defaultValue={filters.recurring ?? ""}>
            <option value="">الكل</option>
            <option value="yes">شهري</option>
            <option value="no">لمرة واحدة</option>
          </select>
        </div>
        <div>
          <label htmlFor="from" className="label">من تاريخ</label>
          <input id="from" name="from" type="date" dir="ltr" className="field" defaultValue={filters.from ?? ""} />
        </div>
        <div>
          <label htmlFor="to" className="label">إلى تاريخ</label>
          <input id="to" name="to" type="date" dir="ltr" className="field" defaultValue={filters.to ?? ""} />
        </div>
        <div className="flex items-end gap-2 sm:col-span-2">
          <button type="submit" className="btn btn-primary">تطبيق</button>
          <Link href="/admin/donations" className="btn btn-secondary">مسح</Link>
        </div>
      </form>

      <p className="text-ink-soft" aria-live="polite">
        {formatNumber(data.total)} تبرعاً · إجمالي المدفوع في النتائج {formatSar(data.paidSum)}
      </p>

      {data.rows.length === 0 ? (
        <p className="card p-6 text-ink-soft">لا توجد تبرعات مطابقة.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>الإيصال</th>
                <th>التاريخ</th>
                <th>المتبرع</th>
                <th>الحملة</th>
                <th>المبلغ</th>
                <th>النوع</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((d) => (
                <tr key={d.id}>
                  <td dir="ltr">
                    <Link href={`/receipt/${d.receiptNo}`} className="text-brand underline">{d.receiptNo}</Link>
                  </td>
                  <td>{formatDateTime(d.createdAt)}</td>
                  <td>{d.donor?.name ?? publicDonorName(d)}</td>
                  <td>{d.campaign.title}</td>
                  <td>{formatSar(d.amount)}</td>
                  <td>{d.recurring ? "شهري" : "مرة واحدة"}</td>
                  <td>
                    <span className={`badge ${d.status === "PAID" ? "badge-ok" : d.status === "FAILED" ? "badge-danger" : "badge-accent"}`}>
                      {DONATION_STATUS_LABELS[d.status] ?? d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.pages > 1 && (
        <nav aria-label="الصفحات" className="flex items-center justify-between gap-3">
          {data.page > 1 ? (
            <Link href={pageHref(data.page - 1)} className="btn btn-secondary btn-sm">السابق</Link>
          ) : <span />}
          <span className="text-sm text-ink-soft">
            صفحة {formatNumber(data.page)} من {formatNumber(data.pages)}
          </span>
          {data.page < data.pages ? (
            <Link href={pageHref(data.page + 1)} className="btn btn-secondary btn-sm">التالي</Link>
          ) : <span />}
        </nav>
      )}
    </div>
  );
}
