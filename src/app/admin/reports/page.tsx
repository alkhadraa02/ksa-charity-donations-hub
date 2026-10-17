import type { Metadata } from "next";
import { PrintButton } from "@/components/print-button";
import { currentMonth, GREGORIAN_MONTHS } from "@/lib/dates";
import { formatNumber, formatSar } from "@/lib/format";
import { getMonthlyReport } from "@/lib/reports";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "التقرير الشهري" };

type SP = Promise<Record<string, string | string[] | undefined>>;

function pick(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-sm text-ink-soft">{label}</p>
      <p className="mt-1 text-xl font-bold text-brand">{value}</p>
    </div>
  );
}

export default async function AdminReports({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const now = currentMonth();
  const y = Number(pick(sp.year));
  const m = Number(pick(sp.month));
  const year = Number.isInteger(y) && y >= 2000 && y <= 2100 ? y : now.year;
  const month = Number.isInteger(m) && m >= 1 && m <= 12 ? m : now.month;

  const report = await getMonthlyReport(year, month);
  const maxDay = Math.max(1, ...report.byDay.map((d) => d.amount));
  const years = Array.from({ length: 4 }, (_, i) => now.year - i);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          التقرير الشهري — {GREGORIAN_MONTHS[month - 1]} {year}
        </h1>
        <PrintButton />
      </div>

      <form method="get" className="card flex flex-wrap items-end gap-3 p-4 print:hidden" aria-label="اختيار الشهر">
        <div>
          <label htmlFor="month" className="label">الشهر</label>
          <select id="month" name="month" className="field" defaultValue={month}>
            {GREGORIAN_MONTHS.map((name, i) => (
              <option key={name} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="year" className="label">السنة</label>
          <select id="year" name="year" className="field" defaultValue={year}>
            {years.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">عرض</button>
      </form>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="إجمالي التبرعات" value={formatSar(report.totalAmount)} />
        <Stat label="عدد التبرعات" value={formatNumber(report.count)} />
        <Stat label="متوسط التبرع" value={formatSar(report.average)} />
        <Stat label="المبالغ المستردة" value={formatSar(report.refunded)} />
        <Stat label="التبرعات الشهرية" value={`${formatNumber(report.recurringCount)} (${formatSar(report.recurringAmount)})`} />
        <Stat label="تبرعات مجهولة" value={formatNumber(report.anonymousCount)} />
        <Stat label="متبرعون جدد" value={formatNumber(report.newDonors)} />
        <Stat label="متطوعون جدد" value={formatNumber(report.newVolunteers)} />
      </div>

      <section aria-labelledby="by-campaign">
        <h2 id="by-campaign" className="mb-3 text-lg font-bold">حسب الحملة</h2>
        {report.byCampaign.length === 0 ? (
          <p className="card p-5 text-ink-soft">لا توجد تبرعات مدفوعة في هذا الشهر.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>الحملة</th>
                  <th>عدد التبرعات</th>
                  <th>المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {report.byCampaign.map((c) => (
                  <tr key={c.campaignId}>
                    <td>{c.title}</td>
                    <td>{formatNumber(c.count)}</td>
                    <td>{formatSar(c.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="top-donors">
        <h2 id="top-donors" className="mb-3 text-lg font-bold">أكبر المتبرعين المعلنين</h2>
        {report.topDonors.length === 0 ? (
          <p className="card p-5 text-ink-soft">لا يوجد متبرعون معلنون في هذا الشهر.</p>
        ) : (
          <ol className="card divide-y divide-line">
            {report.topDonors.map((d) => (
              <li key={d.name} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="min-w-0 truncate font-semibold">{d.name}</span>
                <span className="shrink-0 text-ink-soft">
                  {formatNumber(d.count)} · {formatSar(d.amount)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="by-day">
        <h2 id="by-day" className="mb-3 text-lg font-bold">التبرعات اليومية</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>اليوم</th>
                <th>المبلغ</th>
                <th>
                  <span className="sr-only">المقارنة</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {report.byDay
                .filter((d) => d.amount > 0)
                .map((d) => (
                  <tr key={d.day}>
                    <td>{formatNumber(d.day)}</td>
                    <td>{formatSar(d.amount)}</td>
                    <td className="w-1/2">
                      <div className="progress-track" aria-hidden="true">
                        <div className="progress-fill" style={{ width: `${Math.round((d.amount / maxDay) * 100)}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              {report.count === 0 && (
                <tr>
                  <td colSpan={3} className="text-ink-soft">لا توجد بيانات.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
