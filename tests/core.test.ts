import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/csv";
import { dayEnd, dayStart, monthRange, riyadhParts } from "@/lib/dates";
import { generateReceiptNo, publicDonorName } from "@/lib/donations";
import { MockPaymentProvider } from "@/lib/payments";
import { rateLimit, resetRateLimits } from "@/lib/rate-limit";
import { calculateZakat, type ZakatInput } from "@/lib/zakat";
import { campaignSchema, donationSchema, volunteerSchema } from "@/lib/validation";

const baseZakat: ZakatInput = {
  cash: 0,
  goldGrams: 0,
  goldPricePerGram: 0,
  silverGrams: 0,
  silverPricePerGram: 0,
  tradeGoods: 0,
  receivables: 0,
  debts: 0,
  nisabBasis: "silver",
};

describe("zakat", () => {
  it("charges 2.5% when wealth reaches the silver nisab", () => {
    const r = calculateZakat({ ...baseZakat, cash: 100_000, silverPricePerGram: 3 });
    expect(r.nisab).toBe(1785);
    expect(r.nisabMet).toBe(true);
    expect(r.zakatDue).toBe(2500);
  });

  it("is zero below the nisab", () => {
    const r = calculateZakat({ ...baseZakat, cash: 1000, silverPricePerGram: 3 });
    expect(r.nisabMet).toBe(false);
    expect(r.zakatDue).toBe(0);
  });

  it("subtracts debts and never goes negative", () => {
    const r = calculateZakat({ ...baseZakat, cash: 5000, debts: 9000, silverPricePerGram: 3 });
    expect(r.netWealth).toBe(0);
    expect(r.zakatDue).toBe(0);
  });

  it("flags a missing price instead of guessing", () => {
    const r = calculateZakat({ ...baseZakat, cash: 100_000 });
    expect(r.missingPrice).toBe(true);
    expect(r.zakatDue).toBe(0);
  });

  it("values gold and silver holdings and supports the gold basis", () => {
    const r = calculateZakat({
      ...baseZakat,
      goldGrams: 100,
      goldPricePerGram: 300,
      nisabBasis: "gold",
    });
    expect(r.totalAssets).toBe(30_000);
    expect(r.nisab).toBe(25_500);
    expect(r.zakatDue).toBe(750);
  });
});

describe("csv", () => {
  it("adds a BOM, quotes special characters and neutralises formulas", () => {
    const csv = toCsv(
      [{ a: 'say "hi", ok', b: "=SUM(A1)", c: true }],
      [
        { header: "a", value: (r) => r.a },
        { header: "b", value: (r) => r.b },
        { header: "c", value: (r) => r.c },
      ],
    );
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"say ""hi"", ok"');
    expect(csv).toContain("'=SUM(A1)");
    expect(csv).toContain("نعم");
  });
});

describe("dates (Riyadh, UTC+3)", () => {
  it("computes month boundaries in Riyadh time", () => {
    const { start, end } = monthRange(2026, 10);
    expect(start.toISOString()).toBe("2026-09-30T21:00:00.000Z");
    expect(end.toISOString()).toBe("2026-10-31T21:00:00.000Z");
  });

  it("converts instants to Riyadh calendar parts", () => {
    expect(riyadhParts(new Date("2026-09-30T22:00:00Z"))).toEqual({ year: 2026, month: 10, day: 1 });
  });

  it("parses day strings and rejects garbage", () => {
    expect(dayStart("2026-10-17")?.toISOString()).toBe("2026-10-16T21:00:00.000Z");
    expect(dayEnd("2026-10-17")?.toISOString()).toBe("2026-10-17T21:00:00.000Z");
    expect(dayStart("not-a-date")).toBeNull();
    expect(dayStart("2026-13-01")).toBeNull();
  });
});

describe("validation", () => {
  it("requires a name unless the donation is anonymous", () => {
    const base = { campaignId: "c1", amount: 100, recurring: false };
    expect(donationSchema.safeParse({ ...base, anonymous: false }).success).toBe(false);
    expect(donationSchema.safeParse({ ...base, anonymous: true }).success).toBe(true);
    expect(donationSchema.safeParse({ ...base, anonymous: false, donorName: "خالد" }).success).toBe(true);
  });

  it("rejects non-integer, tiny and huge amounts", () => {
    const base = { campaignId: "c1", anonymous: true };
    expect(donationSchema.safeParse({ ...base, amount: 1 }).success).toBe(false);
    expect(donationSchema.safeParse({ ...base, amount: 10.5 }).success).toBe(false);
    expect(donationSchema.safeParse({ ...base, amount: 999_999_999 }).success).toBe(false);
  });

  it("validates Saudi mobile numbers for volunteers", () => {
    const base = {
      name: "سارة",
      email: "sara@example.com",
      city: "الرياض",
      interests: ["field"],
      availability: "weekends",
    };
    const ok = volunteerSchema.safeParse({ ...base, phone: "0501234567" });
    const bad = volunteerSchema.safeParse({ ...base, phone: "12345" });
    expect(ok.success).toBe(true);
    expect(bad.success).toBe(false);
  });

  it("only accepts lowercase latin slugs for campaigns", () => {
    const base = {
      title: "حملة جديدة",
      summary: "ملخص الحملة الجديدة",
      story: "قصة الحملة الجديدة بتفاصيلها الكاملة",
      category: "water",
      goalAmount: 1000,
      status: "ACTIVE",
      tone: "teal",
    };
    expect(campaignSchema.safeParse({ ...base, slug: "bad slug" }).success).toBe(false);
    expect(campaignSchema.safeParse({ ...base, slug: "حملة" }).success).toBe(false);
  });
});

describe("donation helpers", () => {
  it("generates unique, well-formed receipt numbers", () => {
    const a = generateReceiptNo(new Date("2026-10-17T00:00:00Z"));
    const b = generateReceiptNo(new Date("2026-10-17T00:00:00Z"));
    expect(a).toMatch(/^BD-202610-[A-Z2-9]{8}$/);
    expect(a).not.toBe(b);
  });

  it("never leaks the name of anonymous donors", () => {
    expect(publicDonorName({ anonymous: true, donorName: "سري" })).toBe("فاعل خير");
    expect(publicDonorName({ anonymous: false, donorName: null })).toBe("فاعل خير");
    expect(publicDonorName({ anonymous: false, donorName: "نورة" })).toBe("نورة");
  });
});

describe("mock payment provider", () => {
  it("approves valid charges and rejects invalid amounts", async () => {
    const p = new MockPaymentProvider();
    const ok = await p.charge({ amount: 50, currency: "SAR", recurring: false, description: "x", reference: "r" });
    expect(ok.ok).toBe(true);
    expect(ok.providerRef).toMatch(/^mock_/);
    const bad = await p.charge({ amount: 0, currency: "SAR", recurring: false, description: "x", reference: "r" });
    expect(bad.ok).toBe(false);
  });
});

describe("rate limiter", () => {
  it("blocks after the limit and recovers after the window", () => {
    resetRateLimits();
    expect(rateLimit("k", 2, 1000, 0)).toBe(true);
    expect(rateLimit("k", 2, 1000, 10)).toBe(true);
    expect(rateLimit("k", 2, 1000, 20)).toBe(false);
    expect(rateLimit("k", 2, 1000, 2000)).toBe(true);
  });
});
