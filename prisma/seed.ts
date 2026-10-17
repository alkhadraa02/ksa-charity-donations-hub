import { hashPassword } from "../src/lib/auth";
import { prisma } from "../src/lib/db";
import { generateReceiptNo } from "../src/lib/donations";

// Deterministic PRNG so every seed run produces the same shape of data.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(2026);
const pick = <T,>(items: readonly T[]): T => items[Math.floor(rand() * items.length)];
const DAY = 86_400_000;

const FIRST = ["محمد", "عبدالله", "فهد", "سلطان", "خالد", "نورة", "سارة", "ريم", "منيرة", "عبدالعزيز", "ماجد", "هند", "لطيفة", "تركي", "بدر", "أمل"];
const LAST = ["العتيبي", "القحطاني", "الدوسري", "الشمري", "الحربي", "الغامدي", "الزهراني", "المطيري", "السبيعي", "الشهري", "العنزي", "البقمي"];
const CITY = ["الرياض", "جدة", "الدمام", "المدينة المنورة", "مكة المكرمة", "الخبر", "أبها", "بريدة"];

const CAMPAIGNS = [
  {
    slug: "water-wells-villages",
    title: "سقيا الماء: آبار للقرى النائية",
    summary: "نحفر آباراً ونركّب محطات تحلية صغيرة لتوفير ماء نظيف لقرى تبعد ساعات عن أقرب مصدر.",
    story:
      "في عدد من القرى النائية تقطع الأسر مسافات طويلة كل يوم لجلب الماء، وكثيراً ما يكون غير صالح للشرب.\n\nتهدف هذه الحملة إلى حفر آبار ارتوازية وتركيب خزانات ومحطات تنقية صغيرة تخدم القرية كلها، مع تدريب لجنة محلية على الصيانة حتى يستمر المشروع سنوات طويلة.\n\nكل ريال يُسهم في وصول الماء النظيف إلى بيت محتاج.",
    category: "water", goal: 120000, pct: 0.68, tone: "sky", status: "ACTIVE", endsInDays: 75,
    updates: [
      ["اكتمال حفر البئر الأول", "تم بحمد الله حفر البئر الأول بعمق مناسب وبدأ ضخ الماء إلى الخزان الرئيسي للقرية."],
      ["بدء تركيب محطة التنقية", "وصلت معدات محطة التنقية إلى الموقع ويجري العمل على تركيبها وربطها بالشبكة."],
    ],
  },
  {
    slug: "orphans-sponsorship",
    title: "كفالة الأيتام للعام الدراسي",
    summary: "نكفل أيتاماً بالتعليم والرعاية الصحية والاحتياجات الشهرية طوال العام الدراسي.",
    story:
      "اليتيم يحتاج إلى من يقف معه في دراسته وصحته وكسوته.\n\nتغطي الكفالة الرسوم الدراسية والمستلزمات والرعاية الصحية الأساسية، ويتابع فريقنا كل حالة ميدانياً ويرفع تقريراً دورياً للكفلاء.\n\nيمكنك التبرع مرة واحدة أو شهرياً لتستمر الكفالة دون انقطاع.",
    category: "orphans", goal: 200000, pct: 0.52, tone: "rose", status: "ACTIVE", endsInDays: 120,
    updates: [["تسجيل الدفعة الأولى من الأيتام", "تم تسجيل أربعين يتيماً في المدارس وتسليم الحقائب واللوازم المدرسية."]],
  },
  {
    slug: "food-baskets",
    title: "سلال غذائية للأسر المتعففة",
    summary: "سلة غذائية متكاملة تكفي أسرة كاملة شهراً، تصل إلى باب البيت بكرامة وخصوصية.",
    story:
      "تحتوي السلة على الأرز والزيت والسكر والبقوليات والتمر وبعض المواد الأساسية الأخرى.\n\nنحدد الأسر المستحقة بالتعاون مع الجمعيات الحيّة وبعد بحث ميداني، ونوزع السلال بسرية تامة.",
    category: "food", goal: 80000, pct: 0.81, tone: "gold", status: "ACTIVE", endsInDays: 40,
    updates: [["توزيع 300 سلة", "وُزّعت ثلاثمئة سلة غذائية على أسر في أحياء مختلفة من الرياض وجدة."]],
  },
  {
    slug: "dialysis-support",
    title: "دعم مرضى الغسيل الكلوي",
    summary: "نغطي تكاليف جلسات الغسيل والمواصلات لمرضى الفشل الكلوي من ذوي الدخل المحدود.",
    story:
      "يحتاج مريض الفشل الكلوي إلى ثلاث جلسات أسبوعياً، وهو عبء ثقيل على الأسر محدودة الدخل.\n\nتسهم هذه الحملة في تغطية الجلسات والأدوية المرافقة وتأمين مواصلات آمنة إلى المراكز.",
    category: "health", goal: 150000, pct: 0.35, tone: "teal", status: "ACTIVE", endsInDays: 150,
    updates: [],
  },
  {
    slug: "school-bags",
    title: "حقيبة مدرسية لكل طالب",
    summary: "وفّرنا حقائب ومستلزمات مدرسية كاملة لطلاب من أسر محتاجة مع بداية العام الدراسي.",
    story:
      "اكتملت هذه الحملة بفضل الله ثم بدعمكم، وتم توزيع الحقائب على الطلاب قبل بدء الدراسة.\n\nشكراً لكل من أسهم في رسم الابتسامة على وجوه الطلاب.",
    category: "education", goal: 40000, pct: 1.05, tone: "olive", status: "COMPLETED", endsInDays: -20,
    updates: [["اكتمال الحملة", "اكتمل المبلغ المستهدف ووُزّعت الحقائب على جميع الطلاب المستفيدين."]],
  },
  {
    slug: "winter-warmth",
    title: "دفء الشتاء: بطانيات وكسوة",
    summary: "بطانيات وملابس شتوية للأسر المحتاجة قبل دخول موسم البرد.",
    story:
      "مع اقتراب الشتاء تزداد حاجة الأسر إلى التدفئة والملابس الثقيلة.\n\nنشتري البطانيات والكسوة بالجملة بأسعار مخفضة ونوزعها على الأسر الأشد حاجة في المناطق الباردة.",
    category: "relief", goal: 90000, pct: 0.22, tone: "gold", status: "ACTIVE", endsInDays: 60,
    updates: [],
  },
  {
    slug: "housing-repair",
    title: "ترميم منازل الأسر المتعففة",
    summary: "إصلاح الأسقف والكهرباء والسباكة في بيوت أسر لا تستطيع تحمل كلفة الترميم.",
    story:
      "كثير من الأسر تعيش في منازل متهالكة تهدد سلامتها.\n\nيعاين مهندسونا كل منزل ويضعون خطة ترميم محددة بكلفة واضحة، وننفذها عبر مقاولين معتمدين.",
    category: "housing", goal: 250000, pct: 0.41, tone: "teal", status: "ACTIVE", endsInDays: null as number | null,
    updates: [["معاينة 12 منزلاً", "أنهى الفريق الهندسي معاينة اثني عشر منزلاً وإعداد جداول الكميات."]],
  },
  {
    slug: "mobile-clinic-pilot",
    title: "عيادة متنقلة (مبادرة مؤقتة)",
    summary: "مبادرة تجريبية لعيادة متنقلة، متوقفة حالياً لحين استكمال التراخيص.",
    story: "توقفت المبادرة مؤقتاً لحين استكمال التراخيص اللازمة من الجهات الصحية، وستعود قريباً بإذن الله.",
    category: "health", goal: 100000, pct: 0.05, tone: "sky", status: "PAUSED", endsInDays: null as number | null,
    updates: [],
  },
] as const;

const REPORTS = [
  { title: "التقرير المالي السنوي 2024", period: "سنوي", year: 2024, summary: "ملخص الإيرادات والمصروفات للعام المالي 2024 وفق القوائم المدققة.", totalIncome: 4_850_000, programSpend: 4_020_000, adminSpend: 410_000, fundraisingSpend: 220_000 },
  { title: "التقرير المالي السنوي 2025", period: "سنوي", year: 2025, summary: "ملخص الإيرادات والمصروفات للعام المالي 2025 مع مقارنة بالعام السابق.", totalIncome: 6_120_000, programSpend: 5_150_000, adminSpend: 480_000, fundraisingSpend: 260_000 },
  { title: "التقرير الربع سنوي: الربع الثاني 2026", period: "الربع الثاني", year: 2026, summary: "إيرادات ومصروفات الأشهر أبريل ومايو ويونيو 2026.", totalIncome: 1_740_000, programSpend: 1_390_000, adminSpend: 120_000, fundraisingSpend: 70_000 },
];

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set (copy .env.example to .env).");
  }

  await prisma.donation.deleteMany();
  await prisma.donor.deleteMany();
  await prisma.campaignUpdate.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.volunteer.deleteMany();
  await prisma.transparencyReport.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: { email, name: "مدير النظام", passwordHash: await hashPassword(password), role: "ADMIN" },
  });

  const now = Date.now();
  const donors = [];
  for (let i = 0; i < 40; i++) {
    const name = `${pick(FIRST)} ${pick(LAST)}`;
    donors.push(
      await prisma.donor.create({
        data: {
          name,
          email: `donor${i + 1}@example.com`,
          phone: `05${Math.floor(10_000_000 + rand() * 89_999_999)}`,
          city: pick(CITY),
          createdAt: new Date(now - Math.floor(rand() * 85) * DAY),
        },
      }),
    );
  }

  const usedReceipts = new Set<string>();
  const amounts = [25, 50, 50, 100, 100, 100, 200, 200, 300, 500, 1000];

  for (const c of CAMPAIGNS) {
    const created = await prisma.campaign.create({
      data: {
        slug: c.slug,
        title: c.title,
        summary: c.summary,
        story: c.story,
        category: c.category,
        goalAmount: c.goal,
        status: c.status,
        tone: c.tone,
        endsAt: c.endsInDays === null ? null : new Date(now + c.endsInDays * DAY),
        createdAt: new Date(now - 95 * DAY),
      },
    });

    let i = 0;
    for (const [title, body] of c.updates) {
      i++;
      await prisma.campaignUpdate.create({
        data: { campaignId: created.id, title, body, createdAt: new Date(now - (i * 14 + 3) * DAY) },
      });
    }

    const target = c.goal * c.pct;
    let raised = 0;
    const rows = [];
    while (raised < target) {
      const amount = pick(amounts);
      const when = new Date(now - Math.floor(rand() * rand() * 90 * DAY) - 60_000 * Math.floor(rand() * 600));
      let receiptNo = generateReceiptNo(when);
      while (usedReceipts.has(receiptNo)) receiptNo = generateReceiptNo(when);
      usedReceipts.add(receiptNo);
      const anonymous = rand() < 0.25;
      const donor = !anonymous && rand() < 0.7 ? pick(donors) : null;
      const failed = rand() < 0.03;
      rows.push({
        receiptNo,
        campaignId: created.id,
        donorId: donor?.id,
        donorName: anonymous ? null : (donor?.name ?? `${pick(FIRST)} ${pick(LAST)}`),
        anonymous,
        amount,
        recurring: rand() < 0.2,
        status: failed ? "FAILED" : "PAID",
        provider: "mock",
        providerRef: `mock_seed_${rows.length}`,
        createdAt: when,
      });
      if (!failed) raised += amount;
    }
    await prisma.donation.createMany({ data: rows });
  }

  const volunteers = [
    ["أحمد الغامدي", "0551234501", "ahmad@example.com", "جدة", "field,logistics", "weekends", "NEW"],
    ["لمى العتيبي", "0551234502", "lama@example.com", "الرياض", "media,tech", "flexible", "CONTACTED"],
    ["يوسف الدوسري", "0551234503", "yousef@example.com", "الدمام", "logistics", "events", "ACTIVE"],
    ["شهد القحطاني", "0551234504", "shahd@example.com", "أبها", "medical", "weekdays", "NEW"],
    ["عمر الحربي", "0551234505", "omar@example.com", "المدينة المنورة", "fundraising,field", "weekends", "ACTIVE"],
    ["جود الشمري", "0551234506", "jood@example.com", "حائل", "tech", "flexible", "DECLINED"],
  ] as const;
  for (const [i, v] of volunteers.entries()) {
    await prisma.volunteer.create({
      data: {
        name: v[0], phone: v[1], email: v[2], city: v[3], interests: v[4], availability: v[5], status: v[6],
        createdAt: new Date(now - (i * 6 + 1) * DAY),
      },
    });
  }

  for (const r of REPORTS) await prisma.transparencyReport.create({ data: r });

  const [campaigns, donations, vols] = await Promise.all([
    prisma.campaign.count(),
    prisma.donation.count(),
    prisma.volunteer.count(),
  ]);
  console.log(`Seeded: 1 admin (${email}), ${campaigns} campaigns, ${donations} donations, ${vols} volunteers.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
