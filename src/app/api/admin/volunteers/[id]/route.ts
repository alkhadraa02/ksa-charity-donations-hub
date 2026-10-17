import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorJson, json, parseBody, requireAdminRequest, sameOrigin } from "@/lib/api";
import { volunteerStatusSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ status: volunteerStatusSchema });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return errorJson("طلب غير مسموح", 403);
  const auth = await requireAdminRequest(request);
  if (auth.response) return auth.response;
  const { id } = await params;

  const { data, response } = await parseBody(request, bodySchema);
  if (response) return response;

  const exists = await prisma.volunteer.findUnique({ where: { id } });
  if (!exists) return errorJson("المتطوع غير موجود", 404);

  await prisma.volunteer.update({ where: { id }, data: { status: data.status } });
  return json({ ok: true });
}
