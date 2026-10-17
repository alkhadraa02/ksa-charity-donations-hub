import type { Metadata } from "next";
import Link from "next/link";
import { CampaignForm } from "@/components/campaign-form";

export const metadata: Metadata = { title: "حملة جديدة" };

export default function NewCampaignPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <Link href="/admin/campaigns" className="text-sm text-brand underline">
          ← الحملات
        </Link>
        <h1 className="mt-2 text-2xl font-bold">حملة جديدة</h1>
      </div>
      <CampaignForm
        initial={{
          title: "",
          slug: "",
          summary: "",
          story: "",
          category: "",
          goalAmount: "",
          status: "ACTIVE",
          tone: "teal",
          endsAt: "",
        }}
      />
    </div>
  );
}
