import Link from "next/link";
import type { CampaignWithTotals } from "@/lib/campaigns";
import { categoryLabel } from "@/lib/constants";
import { daysLeft, formatNumber, formatSar } from "@/lib/format";
import { ProgressBar } from "./progress-bar";

export function CampaignCard({ campaign }: { campaign: CampaignWithTotals }) {
  const left = daysLeft(campaign.endsAt);
  const completed = campaign.status === "COMPLETED";
  return (
    <article className="card flex min-w-0 flex-col overflow-hidden">
      <div className={`tone-hero tone-${campaign.tone} flex aspect-[16/7] items-end p-4`}>
        <span className="rounded-full bg-black/25 px-3 py-0.5 text-xs font-semibold">
          {categoryLabel(campaign.category)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="text-lg font-bold leading-snug">
          <Link href={`/campaigns/${campaign.slug}`} className="hover:text-brand">
            {campaign.title}
          </Link>
        </h3>
        <p className="text-sm text-ink-soft">{campaign.summary}</p>
        <div className="mt-auto grid gap-2">
          <ProgressBar percent={campaign.percent} label={`نسبة تحقق هدف ${campaign.title}`} />
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="min-w-0 truncate font-bold text-brand">{formatSar(campaign.raised)}</span>
            <span className="shrink-0 text-ink-soft">من {formatSar(campaign.goalAmount)}</span>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs text-ink-soft">
            <span>{formatNumber(campaign.donorCount)} تبرعاً · {campaign.percent}%</span>
            {completed ? (
              <span className="badge badge-ok">مكتملة</span>
            ) : left !== null ? (
              <span>متبقي {formatNumber(left)} يوماً</span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
