import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="page grid min-h-screen place-items-center py-16 text-center">
      <div>
        <p className="text-6xl font-bold text-brand">404</p>
        <h1 className="mt-4 text-2xl font-bold">الصفحة غير موجودة</h1>
        <p className="mt-2 text-ink-soft">ربما نُقلت الصفحة أو أن الرابط غير صحيح.</p>
        <Link href="/" className="btn btn-primary mt-6">
          العودة إلى الرئيسية
        </Link>
      </div>
    </main>
  );
}
