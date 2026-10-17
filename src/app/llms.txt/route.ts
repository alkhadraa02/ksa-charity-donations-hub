import { ORG_NAME, SITE_URL } from "@/lib/constants";

export function GET() {
  const body = `# ${ORG_NAME}

> منصة حملات خيرية وتبرعات بشفافية كاملة: حملات بأهداف معلنة، تبرع آمن، حاسبة زكاة، تسجيل متطوعين، وتقارير مالية.

## صفحات رئيسية
- [الحملات](${SITE_URL}/campaigns): الحملات الجارية والمكتملة ونسبة تحقق كل هدف
- [تبرع الآن](${SITE_URL}/donate): نموذج التبرع (مرة واحدة أو شهرياً)
- [حاسبة الزكاة](${SITE_URL}/zakat): حساب النصاب والزكاة الواجبة
- [التطوع](${SITE_URL}/volunteer): التسجيل كمتطوع
- [الشفافية](${SITE_URL}/transparency): تقارير الإيرادات والمصروفات
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
