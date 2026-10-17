import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getCurrentUser } from "@/lib/auth";
import { ORG_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تسجيل دخول الإدارة",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/admin");
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <h1 className="mb-1 text-2xl font-bold text-brand">تسجيل دخول الإدارة</h1>
        <p className="mb-6 text-ink-soft">{ORG_NAME}</p>
        <LoginForm />
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-brand underline">
            العودة إلى الموقع
          </Link>
        </p>
      </div>
    </main>
  );
}
