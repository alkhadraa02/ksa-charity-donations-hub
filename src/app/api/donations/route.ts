import { errorJson, json, parseBody, sameOrigin } from "@/lib/api";
import { createDonation } from "@/lib/donations";
import { getPaymentProvider } from "@/lib/payments";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { donationSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return errorJson("طلب غير مسموح", 403);
  if (!rateLimit(`donate:${getClientIp(request)}`, 20, 60_000)) {
    return errorJson("محاولات كثيرة، حاول بعد قليل", 429);
  }

  const { data, response } = await parseBody(request, donationSchema);
  if (response) return response;

  const result = await createDonation(data, getPaymentProvider());
  if (!result.ok) {
    const status = result.code === "CAMPAIGN_NOT_FOUND" ? 404 : result.code === "PAYMENT_FAILED" ? 402 : 409;
    return errorJson(result.message, status);
  }
  return json({ receiptNo: result.receiptNo, amount: result.amount, campaignTitle: result.campaignTitle }, 201);
}
