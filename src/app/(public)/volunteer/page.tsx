import type { Metadata } from "next";
import { VolunteerForm } from "@/components/volunteer-form";

export const metadata: Metadata = {
  title: "التسجيل كمتطوع",
  description:
    "انضم إلى فريق المتطوعين: اختر مجالات تطوعك ووقت تفرغك وسيتواصل معك فريقنا لتنسيق المشاركة في الحملات الميدانية.",
  alternates: { canonical: "/volunteer" },
  openGraph: { url: "/volunteer" },
};

export default function VolunteerPage() {
  return (
    <div className="page max-w-3xl py-10">
      <h1 className="text-3xl font-bold">التسجيل كمتطوع</h1>
      <p className="mt-2 mb-6 text-ink-soft">شاركنا وقتك وخبرتك، وسنتواصل معك لتنسيق المشاركة.</p>
      <VolunteerForm />
    </div>
  );
}
