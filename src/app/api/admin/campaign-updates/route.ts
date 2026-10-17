import { prisma } from "@/lib/db";
import { errorJson, json, parseBody, requireAdminRequest, sameOrigin } from "@/lib/api";
import { campaignUpdateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return errorJson("طلب غير مسموح", 403);
  const auth = await requireAdminRequest(request);
  if (auth.response) return auth.response;

  const { data, response } = await parseBody(request, campaignUpdateSchema);
  if (response) return response;

  const campaign = await prisma.campaign.findUnique({ where: { id: data.campaignId } });
  if (!campaign) return errorJson("الحملة غير موجودة", 404);

  const update = await prisma.campaignUpdate.create({
    data: { campaignId: data.campaignId, title: data.title, body: data.body },
  });
  return json({ id: update.id }, 201);
}
