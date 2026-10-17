"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CAMPAIGN_STATUS_LABELS, CATEGORIES, TONES } from "@/lib/constants";

export interface CampaignFormValues {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  story: string;
  category: string;
  goalAmount: number | "";
  status: string;
  tone: string;
  endsAt: string;
}

const TONE_LABELS: Record<string, string> = {
  teal: "أخضر مزرق",
  gold: "ذهبي",
  rose: "وردي",
  sky: "أزرق",
  olive: "زيتوني",
};

export function CampaignForm({ initial }: { initial: CampaignFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const editing = Boolean(initial.id);

  function set<K extends keyof CampaignFormValues>(key: K, value: CampaignFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    setMessage(null);
    const res = await fetch(editing ? `/api/admin/campaigns/${initial.id}` : "/api/admin/campaigns", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, goalAmount: Number(values.goalAmount) }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string; errors?: Record<string, string> };
    setBusy(false);
    if (!res.ok) {
      setErrors(body.errors ?? {});
      setMessage(body.error ?? "تعذّر الحفظ");
      return;
    }
    router.push("/admin/campaigns");
    router.refresh();
  }

  async function remove() {
    if (!initial.id || !window.confirm("هل أنت متأكد من حذف هذه الحملة؟")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/campaigns/${initial.id}`, { method: "DELETE" });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setMessage(body.error ?? "تعذّر الحذف");
      return;
    }
    router.push("/admin/campaigns");
    router.refresh();
  }

  const err = (k: string) =>
    errors[k] ? (
      <p id={`${k}-err`} className="error-text">
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: string) => ({ "aria-invalid": errors[k] ? true : undefined, "aria-describedby": errors[k] ? `${k}-err` : undefined });

  return (
    <form onSubmit={submit} className="card flex flex-col gap-4 p-5" noValidate>
      {message && (
        <p role="alert" className="alert alert-error">
          {message}
        </p>
      )}
      <div>
        <label htmlFor="title" className="label">العنوان</label>
        <input id="title" className="field" value={values.title} onChange={(e) => set("title", e.target.value)} {...aria("title")} />
        {err("title")}
      </div>
      <div>
        <label htmlFor="slug" className="label">الرابط (لاتيني)</label>
        <input id="slug" dir="ltr" className="field" value={values.slug} onChange={(e) => set("slug", e.target.value)} {...aria("slug")} />
        <p className="hint">مثال: clean-water-2026</p>
        {err("slug")}
      </div>
      <div>
        <label htmlFor="summary" className="label">الملخص</label>
        <textarea id="summary" rows={2} className="field" value={values.summary} onChange={(e) => set("summary", e.target.value)} {...aria("summary")} />
        {err("summary")}
      </div>
      <div>
        <label htmlFor="story" className="label">القصة</label>
        <textarea id="story" rows={8} className="field" value={values.story} onChange={(e) => set("story", e.target.value)} {...aria("story")} />
        {err("story")}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="label">التصنيف</label>
          <select id="category" className="field" value={values.category} onChange={(e) => set("category", e.target.value)} {...aria("category")}>
            <option value="">اختر…</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          {err("category")}
        </div>
        <div>
          <label htmlFor="goalAmount" className="label">المبلغ المستهدف (ريال)</label>
          <input id="goalAmount" type="number" inputMode="numeric" min={100} className="field" value={values.goalAmount} onChange={(e) => set("goalAmount", e.target.value === "" ? "" : Number(e.target.value))} {...aria("goalAmount")} />
          {err("goalAmount")}
        </div>
        <div>
          <label htmlFor="status" className="label">الحالة</label>
          <select id="status" className="field" value={values.status} onChange={(e) => set("status", e.target.value)}>
            {Object.entries(CAMPAIGN_STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tone" className="label">لون البطاقة</label>
          <select id="tone" className="field" value={values.tone} onChange={(e) => set("tone", e.target.value)}>
            {TONES.map((t) => (
              <option key={t} value={t}>{TONE_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="endsAt" className="label">تاريخ الانتهاء (اختياري)</label>
          <input id="endsAt" type="date" dir="ltr" className="field" value={values.endsAt} onChange={(e) => set("endsAt", e.target.value)} {...aria("endsAt")} />
          {err("endsAt")}
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "جارٍ الحفظ…" : editing ? "حفظ التعديلات" : "إنشاء الحملة"}
        </button>
        {editing && (
          <button type="button" className="btn btn-danger" onClick={remove} disabled={busy}>
            حذف الحملة
          </button>
        )}
      </div>
    </form>
  );
}
