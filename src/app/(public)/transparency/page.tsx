import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatNumber, formatSar } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تقارير الشفافية",
  description:
    "اطّلع على تقاريرنا المالية الدورية: إجمالي الإيرادات ونسبة الإنفاق على البرامج والمصروفات الإدارية وتكاليف جمع التبرعات.",
  alternates: { canonical: "/transparency" },
  openGraph: { url: "/transparency" },
};

function pct(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 1000) / 10 : 0;
}

export default async function TransparencyPage() {
  const reports = await prisma.transparencyReport.findMany({ orderBy: [{ year: "desc" }, { createdAt: "desc" }] });

  return (
    <div className="page py-10">
      <h1 className="text-3xl font-bold">تقارير الشفافية</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        نؤمن بأن الثقة تُبنى بالوضوح؛ هنا تجد كيف جُمعت الأموال وكيف أُنفقت.
      </p>

      {reports.length === 0 ? (
        <p className="card mt-8 p-10 text-center text-ink-soft">لم تُنشر تقارير بعد.</p>
      ) : (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {reports.map((r) => {
            const total = r.programSpend + r.adminSpend + r.fundraisingSpend;
            const program = pct(r.programSpend, total);
            return (
              <article key={r.id} className="card min-w-0 p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge badge-brand">{r.period}</span>
                  <span className="badge">{r.year}</span>
                </div>
                <h2 className="mt-3 text-xl font-bold">{r.title}</h2>
                <p className="mt-1 text-sm text-ink-soft">{r.summary}</p>
                <dl className="mt-4 grid gap-2 text-sm">
                  <div className="flex justify-between gap-2"><dt className="text-ink-soft">إجمالي الإيرادات</dt><dd className="font-semibold">{formatSar(r.totalIncome)}</dd></div>
                  <div className="flex justify-between gap-2"><dt className="text-ink-soft">برامج ومشاريع</dt><dd className="font-semibold">{formatSar(r.programSpend)} ({formatNumber(program)}%)</dd></div>
                  <div className="flex justify-between gap-2"><dt className="text-ink-soft">مصروفات إدارية</dt><dd className="font-semibold">{formatSar(r.adminSpend)} ({formatNumber(pct(r.adminSpend, total))}%)</dd></div>
                  <div className="flex justify-between gap-2"><dt className="text-ink-soft">جمع التبرعات</dt><dd className="font-semibold">{formatSar(r.fundraisingSpend)} ({formatNumber(pct(r.fundraisingSpend, total))}%)</dd></div>
                </dl>
                <div
                  className="mt-4 flex h-3 overflow-hidden rounded-full bg-surface-2"
                  role="img"
                  aria-label={`${program}% من الإنفاق على البرامج`}
                >
                  <div className="bg-brand" style={{ width: `${pct(r.programSpend, total)}%` }} />
                  <div className="bg-accent" style={{ width: `${pct(r.adminSpend, total)}%` }} />
                  <div className="bg-ink-soft" style={{ width: `${pct(r.fundraisingSpend, total)}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
