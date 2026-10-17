import { prisma } from "@/lib/db";
import { errorJson, json, parseBody, requireAdminRequest, sameOrigin } from "@/lib/api";
import { dayStart } from "@/lib/dates";
import { campaignSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return errorJson("طلب غير مسموح", 403);
  const auth = await requireAdminRequest(request);
  if (auth.response) return auth.response;

  const { data, response } = await parseBody(request, campaignSchema);
  if (response) return response;

  const exists = await prisma.campaign.findUnique({ where: { slug: data.slug } });
  if (exists) return errorJson("الرابط مستخدم لحملة أخرى", 409, { slug: "الرابط مستخدم لحملة أخرى" });

  const campaign = await prisma.campaign.create({
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
  return json({ id: campaign.id, slug: campaign.slug }, 201);
}
