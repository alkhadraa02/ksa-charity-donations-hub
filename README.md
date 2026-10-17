# منصة الحملات الخيرية · Charity Campaigns Platform

منصة متكاملة لجمعية خيرية: حملات تبرع بأهداف معلنة، تبرع آمن عبر مزوّد دفع تجريبي، إيصالات، حاسبة زكاة، تسجيل متطوعين، تقارير شفافية، ولوحة إدارة كاملة. واجهة عربية RTL أولاً.

A complete charity platform: campaigns with goal/raised progress, a donate flow behind a `PaymentProvider` interface (mock provider included), receipts, a zakat calculator, volunteer signup, transparency reports and a full admin dashboard. Arabic-first, RTL.

## المزايا · Features

**الموقع العام · Public site**
- الحملات مع شريط التقدم (المجموع المحصَّل مقابل الهدف) وصفحة حملة بالقصة والتحديثات.
- التبرع: مبالغ جاهزة، مبلغ مخصص، تبرع شهري متكرر، باسم المتبرع أو مجهولاً.
- مزوّد دفع خلف واجهة `PaymentProvider` (مزوّد وهمي بلا بوابة حقيقية ولا مفاتيح).
- صفحة إيصال التبرع قابلة للطباعة.
- حاسبة الزكاة (مال، ذهب، فضة، عروض تجارة) بالنصاب.
- تسجيل المتطوعين، وصفحة تقارير الشفافية.
- SEO: metadata، `sitemap.xml`، `robots.txt`، `llms.txt`، JSON-LD.

**لوحة الإدارة · Dashboard** (`/admin`)
- إدارة الحملات: إنشاء وتعديل وحذف وإضافة تحديثات.
- سجل التبرعات بمرشحات وتصدير CSV.
- المتبرعون، المتطوعون (مع تغيير الحالة)، والتقرير الشهري.

**الأمن · Security**: كلمات مرور مجزّأة بـ bcrypt، جلسة في كوكي httpOnly، تحقق zod لكل مدخل، حماية كل مسار يغيّر بيانات، تحديد معدل الطلبات، رؤوس أمان (CSP وغيرها).

## لقطات الشاشة · Screenshots

أضف لقطاتك هنا بعد تشغيل المشروع محلياً · Add your screenshots here after running locally.

| الصفحة الرئيسية | لوحة الإدارة |
| --- | --- |
| `docs/home.png` | `docs/admin.png` |

## التقنيات · Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Prisma + SQLite · zod · bcryptjs · Vitest · خط IBM Plex Sans Arabic.

## التشغيل في 5 أوامر · Setup in 5 commands

```bash
cp .env.example .env
npm install
npm run db:setup
npm run build
npm run start
```

للتطوير · For development: `npm run dev` (المنفذ 3110 · port 3110).

## الدخول الافتراضي للإدارة · Default admin login

يُنشأ الحساب من `ADMIN_EMAIL` و`ADMIN_PASSWORD` في `.env` عند تشغيل `npm run db:seed`. القيم الافتراضية في `.env.example` للتطوير المحلي فقط، غيّرها قبل أي نشر.

The account is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` by `npm run db:seed`. Defaults in `.env.example` are for local development only — change them before any deployment.

- الرابط · URL: `/login`
- البريد · Email: `admin@example.com`
- كلمة المرور · Password: `ChangeMe-Admin-2026`

## الأوامر · Scripts

| الأمر | الوظيفة |
| --- | --- |
| `npm run dev` | خادم التطوير على 3110 |
| `npm run build` | بناء الإنتاج |
| `npm run start` | تشغيل البناء |
| `npm test` | اختبارات Vitest (منطق + مسارات API) |
| `npm run db:setup` | إنشاء الجداول وبذر بيانات سعودية واقعية |
| `npm run db:seed` | البذر فقط |

## هيكل المشروع · Project structure

```
prisma/            schema.prisma + seed.ts (SQLite file is gitignored)
src/app/           pages: public site, /admin, /login, /api, sitemap, robots, llms.txt
src/components/    forms, cards, header/footer, progress bar
src/lib/           auth, db, validation (zod), donations, payments (PaymentProvider),
                   reports, zakat, csv, rate-limit, format, dates, api helpers
tests/             core logic tests + API route tests
```

## الترخيص · License

MIT © TechnologyKSA
