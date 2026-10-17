import Link from "next/link";
import { ORG_NAME } from "@/lib/constants";
import { SiteNav, type NavItem } from "./site-nav";

export const PUBLIC_NAV: NavItem[] = [
  { href: "/campaigns", label: "الحملات" },
  { href: "/zakat", label: "حاسبة الزكاة" },
  { href: "/volunteer", label: "التطوع" },
  { href: "/transparency", label: "الشفافية" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="page flex h-16 items-center justify-between gap-3">
        <Link href="/" className="flex min-w-0 items-center gap-2 font-bold text-brand">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-lg text-white"
          >
            ♥
          </span>
          <span className="truncate">{ORG_NAME}</span>
        </Link>
        <SiteNav items={PUBLIC_NAV} cta={{ href: "/donate", label: "تبرع الآن" }} />
      </div>
    </header>
  );
}
