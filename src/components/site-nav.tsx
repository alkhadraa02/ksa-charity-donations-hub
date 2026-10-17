"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export interface NavItem {
  href: string;
  label: string;
}

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav({ items, cta }: { items: NavItem[]; cta: NavItem }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Close the drawer when the route changes (derived during render, no effect needed).
  const visible = open && openedAt === pathname;

  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const toggle = toggleRef.current;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [visible]);

  return (
    <>
      <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-1 lg:flex">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-surface-2 aria-[current=page]:bg-brand-soft aria-[current=page]:text-brand"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <Link href={cta.href} className="btn btn-primary btn-sm">
          {cta.label}
        </Link>
        <button
          ref={toggleRef}
          type="button"
          className="btn btn-secondary btn-sm lg:hidden"
          aria-label="فتح القائمة"
          aria-expanded={visible}
          aria-controls="mobile-drawer"
          onClick={() => {
            setOpenedAt(pathname);
            setOpen(true);
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {visible && (
        <>
          <div
            className="fixed inset-0 z-40 bg-[var(--overlay)] lg:hidden"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="القائمة"
            className="fixed inset-y-0 end-0 z-50 flex w-[min(20rem,86vw)] flex-col gap-2 bg-surface p-4 shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-brand">القائمة</span>
              <button
                ref={closeRef}
                type="button"
                className="btn btn-secondary btn-sm"
                aria-label="إغلاق القائمة"
                onClick={() => {
                  setOpen(false);
                  toggleRef.current?.focus();
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <nav aria-label="القائمة" className="mt-2 flex flex-col gap-1">
              {[{ href: "/", label: "الرئيسية" }, ...items].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className="rounded-lg px-3 py-3 font-semibold hover:bg-surface-2 aria-[current=page]:bg-brand-soft aria-[current=page]:text-brand"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
