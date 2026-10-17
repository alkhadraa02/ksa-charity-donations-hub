import Link from "next/link";
import { ORG_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="page grid gap-8 py-10 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-brand">{ORG_NAME}</p>
          <p className="mt-2 text-sm text-ink-soft">
            نجمع التبرعات للحملات الخيرية ونعرض تقارير الإنفاق بشفافية كاملة.
          </p>
        </div>
        <nav aria-label="روابط التذييل">
          <p className="font-bold">روابط سريعة</p>
          <ul className="mt-2 grid gap-1 text-sm">
            <li><Link href="/campaigns" className="text-ink-soft hover:text-brand">الحملات</Link></li>
            <li><Link href="/donate" className="text-ink-soft hover:text-brand">تبرع الآن</Link></li>
            <li><Link href="/zakat" className="text-ink-soft hover:text-brand">حاسبة الزكاة</Link></li>
            <li><Link href="/volunteer" className="text-ink-soft hover:text-brand">التسجيل كمتطوع</Link></li>
            <li><Link href="/transparency" className="text-ink-soft hover:text-brand">تقارير الشفافية</Link></li>
          </ul>
        </nav>
        <div>
          <p className="font-bold">ملاحظة</p>
          <p className="mt-2 text-sm text-ink-soft">
            هذه نسخة تجريبية: بوابة الدفع المرفقة وهمية ولا يُخصم أي مبلغ فعلي.
          </p>
          <Link href="/login" className="mt-3 inline-block text-sm font-semibold text-brand underline">
            دخول فريق الإدارة
          </Link>
        </div>
      </div>
    </footer>
  );
}
