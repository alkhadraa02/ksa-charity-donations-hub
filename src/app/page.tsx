import type { Metadata } from "next";
import { HomeContent } from "@/components/home-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ORG_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `${ORG_NAME} | حملات وتبرعات شفافة` },
  description:
    "تبرع بأمان لحملات سقيا الماء وكفالة الأيتام والإطعام والرعاية الصحية، وتابع أثر تبرعك وتقارير الإنفاق بشفافية.",
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="min-h-[60vh]">
        <HomeContent />
      </main>
      <SiteFooter />
    </>
  );
}
