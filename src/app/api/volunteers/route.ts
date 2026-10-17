import { prisma } from "@/lib/db";
import { errorJson, json, parseBody, sameOrigin } from "@/lib/api";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { volunteerSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return errorJson("طلب غير مسموح", 403);
  if (!rateLimit(`volunteer:${getClientIp(request)}`, 5, 60_000)) {
    return errorJson("محاولات كثيرة، حاول بعد قليل", 429);
  }

  const { data, response } = await parseBody(request, volunteerSchema);
  if (response) return response;

  const volunteer = await prisma.volunteer.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      city: data.city,
      interests: data.interests.join(","),
      availability: data.availability,
      message: data.message,
    },
  });
  return json({ id: volunteer.id }, 201);
}
