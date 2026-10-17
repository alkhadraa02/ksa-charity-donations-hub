import type { Metadata, Viewport } from "next";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "./globals.css";
import { ORG_NAME, SITE_URL } from "@/lib/constants";

const DESCRIPTION =
  "منصة تبرعات وحملات خيرية شفافة: تبرع لسقيا الماء وكفالة الأيتام والإطعام والرعاية الصحية، واحسب زكاتك وتطوّع معنا.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${ORG_NAME} | حملات وتبرعات`, template: `%s | ${ORG_NAME}` },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: ORG_NAME,
    title: ORG_NAME,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f5e57",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <a href="#main" className="skip-link">
          تخطَّ إلى المحتوى
        </a>
        {children}
      </body>
    </html>
  );
}
