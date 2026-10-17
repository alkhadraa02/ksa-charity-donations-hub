import type { Metadata } from "next";
import { ZakatForm } from "@/components/zakat-form";

export const metadata: Metadata = {
  title: "حاسبة الزكاة",
  description:
    "احسب زكاة مالك بسهولة: النقد والذهب والفضة وعروض التجارة والديون، مع تحديد النصاب ومقدار الزكاة الواجبة 2.5%.",
  alternates: { canonical: "/zakat" },
  openGraph: { url: "/zakat" },
};

export default function ZakatPage() {
  return (
    <div className="page py-10">
      <h1 className="text-3xl font-bold">حاسبة الزكاة</h1>
      <p className="mt-2 mb-6 max-w-2xl text-ink-soft">
        أدخل أموالك التي حال عليها الحول، وسنحسب لك الزكاة الواجبة. أسعار الذهب والفضة تُدخل يدوياً لضمان دقتها.
      </p>
      <ZakatForm />
    </div>
  );
}
