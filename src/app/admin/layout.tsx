import type { Metadata } from "next";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { requireAdmin } from "@/lib/auth";
import { ORG_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "لوحة التحكم", template: `%s | لوحة التحكم` },
  robots: { index: false, follow: false },
};

const LINKS = [
  { href: "/admin", label: "نظرة عامة" },
  { href: "/admin/campaigns", label: "الحملات" },
  { href: "/admin/donations", label: "التبرعات" },
  { href: "/admin/donors", label: "المتبرعون" },
  { href: "/admin/volunteers", label: "المتطوعون" },
  { href: "/admin/reports", label: "التقرير الشهري" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-surface">
        <div className="page flex h-16 items-center justify-between gap-3">
          <Link href="/admin" className="min-w-0 truncate font-bold text-brand">
            {ORG_NAME} · الإدارة
          </Link>
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden min-w-0 truncate text-sm text-ink-soft sm:inline">{user.name}</span>
            <Link href="/" className="btn btn-secondary btn-sm">الموقع</Link>
            <LogoutButton />
          </div>
        </div>
        <nav aria-label="أقسام لوحة التحكم" className="page flex gap-1 overflow-x-auto pb-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-surface-2"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <main id="main" className="page py-8">
        {children}
      </main>
    </div>
  );
}
