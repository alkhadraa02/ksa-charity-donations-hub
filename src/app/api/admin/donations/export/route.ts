import { prisma } from "@/lib/db";
import { errorJson, requireAdminRequest } from "@/lib/api";
import { toCsv } from "@/lib/csv";
import { buildDonationWhere, publicDonorName } from "@/lib/donations";
import { DONATION_STATUS_LABELS } from "@/lib/constants";
import { donationFilterSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

const MAX_ROWS = 50_000;

export async function GET(request: Request) {
  const auth = await requireAdminRequest(request);
  if (auth.response) return auth.response;

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = donationFilterSchema.safeParse(params);
  if (!parsed.success) return errorJson("مرشحات غير صالحة", 422);

  const rows = await prisma.donation.findMany({
    where: buildDonationWhere(parsed.data),
    orderBy: { createdAt: "desc" },
    take: MAX_ROWS,
    include: { campaign: { select: { title: true } }, donor: { select: { name: true, email: true } } },
  });

  const csv = toCsv(rows, [
    { header: "رقم الإيصال", value: (d) => d.receiptNo },
    { header: "التاريخ", value: (d) => d.createdAt.toISOString() },
    { header: "الحملة", value: (d) => d.campaign.title },
    { header: "المتبرع", value: (d) => (d.donor?.name ?? publicDonorName(d)) },
    { header: "البريد الإلكتروني", value: (d) => (d.anonymous ? "" : d.donor?.email) },
    { header: "المبلغ (ريال)", value: (d) => d.amount },
    { header: "شهري", value: (d) => d.recurring },
    { header: "مجهول", value: (d) => d.anonymous },
    { header: "الحالة", value: (d) => DONATION_STATUS_LABELS[d.status] ?? d.status },
  ]);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="donations.csv"',
      "Cache-Control": "no-store",
    },
  });
}
