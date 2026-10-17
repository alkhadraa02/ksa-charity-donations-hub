import { prisma } from "@/lib/db";
import { errorJson, json, parseBody, requireAdminRequest, sameOrigin } from "@/lib/api";
import { dayStart } from "@/lib/dates";
import { campaignSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Ctx) {
  if (!sameOrigin(request)) return errorJson("طلب غير مسموح", 403);
  const auth = await requireAdminRequest(request);
  if (auth.response) return auth.response;
  const { id } = await params;

  const current = await prisma.campaign.findUnique({ where: { id } });
  if (!current) return errorJson("الحملة غير موجودة", 404);

  const { data, response } = await parseBody(request, campaignSchema);
  if (response) return response;

  if (data.slug !== current.slug) {
    const taken = await prisma.campaign.findUnique({ where: { slug: data.slug } });
    if (taken) return errorJson("الرابط مستخدم لحملة أخرى", 409, { slug: "الرابط مستخدم لحملة أخرى" });
  }

  await prisma.campaign.update({
    where: { id },
    data: {
      slug: data.slug,
      title: data.title,
      summary: data.summary,
      story: data.story,
      category: data.category,
      goalAmount: data.goalAmount,
      status: data.status,
      tone: data.tone,
      endsAt: data.endsAt ? dayStart(data.endsAt) : null,
    },
  });
  return json({ ok: true });
}

export async function DELETE(request: Request, { params }: Ctx) {
  if (!sameOrigin(request)) return errorJson("طلب غير مسموح", 403);
  const auth = await requireAdminRequest(request);
  if (auth.response) return auth.response;
  const { id } = await params;

  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign) return errorJson("الحملة غير موجودة", 404);

  const donations = await prisma.donation.count({ where: { campaignId: id } });
  if (donations > 0) {
    return errorJson("لا يمكن حذف حملة لها تبرعات؛ أرشِفها بدلاً من ذلك", 409);
  }
  await prisma.campaign.delete({ where: { id } });
  return json({ ok: true });
}
