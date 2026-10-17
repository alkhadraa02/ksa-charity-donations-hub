"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { DONATION_PRESETS, MAX_DONATION, MIN_DONATION } from "@/lib/constants";
import { formatNumber } from "@/lib/format";

export interface CampaignOption {
  id: string;
  title: string;
}

export function DonateForm({
  campaigns,
  defaultCampaignId,
}: {
  campaigns: CampaignOption[];
  defaultCampaignId?: string;
}) {
  const router = useRouter();
  const [campaignId, setCampaignId] = useState(defaultCampaignId ?? campaigns[0]?.id ?? "");
  const [amount, setAmount] = useState<string>("100");
  const [recurring, setRecurring] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    setFormError("");
    const numeric = Number(amount);
    if (!amount || !Number.isFinite(numeric)) {
      setErrors({ amount: "أدخل مبلغ التبرع" });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          amount: numeric,
          recurring,
          anonymous,
          donorName: anonymous ? undefined : donorName,
          email: anonymous ? undefined : email || undefined,
          phone: anonymous ? undefined : phone || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.push(`/receipt/${data.receiptNo}`);
        return;
      }
      if (data.errors) setErrors(data.errors);
      setFormError(data.errors ? "تحقق من الحقول المظللة" : (data.error ?? "تعذّرت العملية"));
    } catch {
      setFormError("تعذّر الاتصال بالخادم، حاول مرة أخرى");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card grid gap-6 p-5 md:p-8" noValidate>
      {formError && (
        <div role="alert" className="alert alert-error">
          {formError}
        </div>
      )}

      <div>
        <label htmlFor="campaignId" className="label">الحملة</label>
        <select
          id="campaignId"
          className="field"
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          aria-invalid={Boolean(errors.campaignId)}
        >
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        {errors.campaignId && <p className="error-text">{errors.campaignId}</p>}
      </div>

      <fieldset>
        <legend className="label">مبلغ التبرع (ريال سعودي)</legend>
        <div className="flex flex-wrap gap-2">
          {DONATION_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              className={`btn btn-sm ${Number(amount) === preset ? "btn-primary" : "btn-secondary"}`}
              aria-pressed={Number(amount) === preset}
              onClick={() => setAmount(String(preset))}
            >
              {formatNumber(preset)}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <label htmlFor="amount" className="label">مبلغ آخر</label>
          <input
            id="amount"
            className="field"
            type="number"
            inputMode="numeric"
            min={MIN_DONATION}
            max={MAX_DONATION}
            step={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-invalid={Boolean(errors.amount)}
            aria-describedby="amount-hint"
          />
          <p id="amount-hint" className="hint">الحد الأدنى {MIN_DONATION} ريال.</p>
          {errors.amount && <p className="error-text">{errors.amount}</p>}
        </div>
      </fieldset>

      <label className="flex min-h-11 cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-1.5 size-5 accent-[var(--brand)]"
          checked={recurring}
          onChange={(e) => setRecurring(e.target.checked)}
        />
        <span>
          <span className="font-semibold">اجعله تبرعاً شهرياً متكرراً</span>
          <span className="hint block">يستمر الأجر ويدوم أثر التبرع. يمكنك الإيقاف في أي وقت.</span>
        </span>
      </label>

      <label className="flex min-h-11 cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-1.5 size-5 accent-[var(--brand)]"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
        />
        <span>
          <span className="font-semibold">أتبرع بدون ذكر اسمي</span>
          <span className="hint block">سيظهر تبرعك باسم «فاعل خير».</span>
        </span>
      </label>

      {!anonymous && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="donorName" className="label">اسم المتبرع</label>
            <input
              id="donorName"
              className="field"
              autoComplete="name"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              aria-invalid={Boolean(errors.donorName)}
            />
            {errors.donorName && <p className="error-text">{errors.donorName}</p>}
          </div>
          <div>
            <label htmlFor="email" className="label">البريد الإلكتروني (اختياري)</label>
            <input
              id="email"
              className="field"
              type="email"
              autoComplete="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="phone" className="label">رقم الجوال (اختياري)</label>
            <input
              id="phone"
              className="field"
              type="tel"
              autoComplete="tel"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-invalid={Boolean(errors.phone)}
            />
            {errors.phone && <p className="error-text">{errors.phone}</p>}
          </div>
        </div>
      )}

      <div className="alert alert-info">
        الدفع عبر بوابة تجريبية (Mock): لا يتم خصم أي مبلغ حقيقي.
      </div>

      <button type="submit" className="btn btn-primary" disabled={busy || !campaignId}>
        {busy ? "جارٍ إتمام التبرع..." : "إتمام التبرع"}
      </button>
    </form>
  );
}
