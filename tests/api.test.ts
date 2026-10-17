import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as createCampaign } from "@/app/api/admin/campaigns/route";
import { POST as donate } from "@/app/api/donations/route";
import { GET as exportCsv } from "@/app/api/admin/donations/export/route";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getMonthlyReport } from "@/lib/reports";
import { currentMonth } from "@/lib/dates";
import { resetRateLimits } from "@/lib/rate-limit";

const ORIGIN = "http://localhost:3110";
const ADMIN_EMAIL = "tester@example.com";
const ADMIN_PASSWORD = "Test-Password-2026";

function post(path: string, body: unknown, headers: Record<string, string> = {}) {
  return new Request(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", host: "localhost:3110", origin: ORIGIN, ...headers },
    body: JSON.stringify(body),
  });
}

let campaignId = "";
let closedId = "";
let cookie = "";

beforeAll(async () => {
  await prisma.donation.deleteMany();
  await prisma.donor.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: { email: ADMIN_EMAIL, name: "مدير الاختبار", role: "ADMIN", passwordHash: await hashPassword(ADMIN_PASSWORD) },
  });
  const active = await prisma.campaign.create({
    data: {
      slug: "test-active",
      title: "حملة اختبار",
      summary: "ملخص حملة الاختبار",
      story: "قصة حملة الاختبار بتفاصيلها الكاملة",
      category: "water",
      goalAmount: 10_000,
      status: "ACTIVE",
      tone: "teal",
    },
  });
  const closed = await prisma.campaign.create({
    data: {
      slug: "test-closed",
      title: "حملة متوقفة",
      summary: "ملخص حملة متوقفة",
      story: "قصة حملة متوقفة بتفاصيلها الكاملة",
      category: "food",
      goalAmount: 5000,
      status: "PAUSED",
      tone: "gold",
    },
  });
  campaignId = active.id;
  closedId = closed.id;
});

beforeEach(() => resetRateLimits());

describe("POST /api/auth/login", () => {
  it("rejects wrong credentials without revealing which part is wrong", async () => {
    const res = await login(post("/api/auth/login", { email: ADMIN_EMAIL, password: "wrong" }));
    expect(res.status).toBe(401);
  });

  it("rejects a cross-site origin", async () => {
    const res = await login(
      post("/api/auth/login", { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }, { origin: "https://evil.example" }),
    );
    expect(res.status).toBe(403);
  });

  it("logs in and sets an httpOnly session cookie", async () => {
    const res = await login(post("/api/auth/login", { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }));
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("charity_session=");
    expect(setCookie.toLowerCase()).toContain("httponly");
    cookie = setCookie.split(";")[0];
  });
});

describe("POST /api/donations", () => {
  it("records a donation, links the donor and returns a receipt", async () => {
    const res = await donate(
      post("/api/donations", {
        campaignId,
        amount: 250,
        recurring: true,
        anonymous: false,
        donorName: "عبدالله العتيبي",
        email: "Abdullah@Example.com",
      }),
    );
    expect(res.status).toBe(201);
    const body = (await res.json()) as { receiptNo: string; amount: number };
    expect(body.receiptNo).toMatch(/^BD-\d{6}-[A-Z2-9]{8}$/);

    const saved = await prisma.donation.findUnique({ where: { receiptNo: body.receiptNo }, include: { donor: true } });
    expect(saved?.status).toBe("PAID");
    expect(saved?.recurring).toBe(true);
    expect(saved?.provider).toBe("mock");
    expect(saved?.donor?.email).toBe("abdullah@example.com");
  });

  it("stores anonymous donations without a name or donor link", async () => {
    const res = await donate(
      post("/api/donations", { campaignId, amount: 100, anonymous: true, donorName: "لن يُحفظ", email: "x@example.com" }),
    );
    expect(res.status).toBe(201);
    const { receiptNo } = (await res.json()) as { receiptNo: string };
    const saved = await prisma.donation.findUnique({ where: { receiptNo } });
    expect(saved?.anonymous).toBe(true);
    expect(saved?.donorName).toBeNull();
    expect(saved?.donorId).toBeNull();
  });

  it("validates input with field errors", async () => {
    const res = await donate(post("/api/donations", { campaignId, amount: 1, anonymous: false }));
    expect(res.status).toBe(422);
    const body = (await res.json()) as { errors: Record<string, string> };
    expect(body.errors.amount).toBeTruthy();
    expect(body.errors.donorName).toBeTruthy();
  });

  it("refuses unknown and paused campaigns", async () => {
    const missing = await donate(post("/api/donations", { campaignId: "nope", amount: 100, anonymous: true }));
    expect(missing.status).toBe(404);
    const paused = await donate(post("/api/donations", { campaignId: closedId, amount: 100, anonymous: true }));
    expect(paused.status).toBe(409);
  });

  it("rate-limits abusive clients", async () => {
    let last = 0;
    for (let i = 0; i < 22; i++) {
      const res = await donate(post("/api/donations", { campaignId: "nope", amount: 100, anonymous: true }));
      last = res.status;
    }
    expect(last).toBe(429);
  });
});

describe("admin routes require authentication", () => {
  const campaign = {
    title: "حملة جديدة",
    slug: "new-campaign",
    summary: "ملخص الحملة الجديدة",
    story: "قصة الحملة الجديدة بتفاصيلها الكاملة",
    category: "health",
    goalAmount: 2000,
    status: "ACTIVE",
    tone: "sky",
  };

  it("returns 401 without a session", async () => {
    const res = await createCampaign(post("/api/admin/campaigns", campaign));
    expect(res.status).toBe(401);
    const exp = await exportCsv(new Request(`${ORIGIN}/api/admin/donations/export`));
    expect(exp.status).toBe(401);
  });

  it("creates a campaign for an admin and rejects duplicate slugs", async () => {
    const ok = await createCampaign(post("/api/admin/campaigns", campaign, { cookie }));
    expect(ok.status).toBe(201);
    const dup = await createCampaign(post("/api/admin/campaigns", campaign, { cookie }));
    expect(dup.status).toBe(409);
  });

  it("validates admin input", async () => {
    const res = await createCampaign(post("/api/admin/campaigns", { ...campaign, slug: "Bad Slug" }, { cookie }));
    expect(res.status).toBe(422);
  });

  it("exports donations as CSV for an admin", async () => {
    const res = await exportCsv(new Request(`${ORIGIN}/api/admin/donations/export?recurring=yes`, { headers: { cookie } }));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
    const bytes = new Uint8Array(await res.arrayBuffer());
    // UTF-8 BOM (EF BB BF) so Excel reads Arabic correctly; text() would strip it.
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    const text = new TextDecoder("utf-8", { ignoreBOM: true }).decode(bytes);
    expect(text).toContain("عبدالله العتيبي");
    expect(text).not.toContain("لن يُحفظ");
  });
});

describe("monthly report", () => {
  it("aggregates paid donations for the month", async () => {
    const { year, month } = currentMonth();
    const report = await getMonthlyReport(year, month);
    expect(report.count).toBe(2);
    expect(report.totalAmount).toBe(350);
    expect(report.recurringCount).toBe(1);
    expect(report.anonymousCount).toBe(1);
    expect(report.topDonors.map((d) => d.name)).toEqual(["عبدالله العتيبي"]);
    expect(report.byCampaign[0].amount).toBe(350);
  });
});
