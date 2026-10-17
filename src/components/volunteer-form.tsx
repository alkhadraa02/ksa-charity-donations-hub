"use client";

import { useState, type FormEvent } from "react";
import { CITIES, VOLUNTEER_AVAILABILITY, VOLUNTEER_INTERESTS } from "@/lib/constants";

export function VolunteerForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [availability, setAvailability] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  function toggle(value: string) {
    setInterests((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    setFormError("");
    setBusy(true);
    try {
      const res = await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          city,
          interests,
          availability: availability || undefined,
          message: message || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setDone(true);
        return;
      }
      if (data.errors) setErrors(data.errors);
      setFormError(data.errors ? "تحقق من الحقول المظللة" : (data.error ?? "تعذّر إرسال الطلب"));
    } catch {
      setFormError("تعذّر الاتصال بالخادم، حاول مرة أخرى");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div role="status" className="card p-8 text-center">
        <p className="text-2xl font-bold text-brand">جزاك الله خيراً</p>
        <p className="mt-2 text-ink-soft">استلمنا طلبك وسيتواصل معك فريق المتطوعين قريباً.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card grid gap-5 p-5 md:p-8" noValidate>
      {formError && (
        <div role="alert" className="alert alert-error">{formError}</div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="v-name" className="label">الاسم الكامل</label>
          <input id="v-name" className="field" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={Boolean(errors.name)} />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="v-phone" className="label">رقم الجوال</label>
          <input id="v-phone" className="field" type="tel" dir="ltr" autoComplete="tel" placeholder="05xxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={Boolean(errors.phone)} />
          {errors.phone && <p className="error-text">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="v-email" className="label">البريد الإلكتروني</label>
          <input id="v-email" className="field" type="email" dir="ltr" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={Boolean(errors.email)} />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="v-city" className="label">المدينة</label>
          <select id="v-city" className="field" value={city} onChange={(e) => setCity(e.target.value)} aria-invalid={Boolean(errors.city)}>
            <option value="">اختر المدينة</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.city && <p className="error-text">{errors.city}</p>}
        </div>
      </div>

      <fieldset>
        <legend className="label">مجالات التطوع</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {VOLUNTEER_INTERESTS.map((item) => (
            <label key={item.value} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-line p-2">
              <input type="checkbox" className="size-5 accent-[var(--brand)]" checked={interests.includes(item.value)} onChange={() => toggle(item.value)} />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
        {errors.interests && <p className="error-text">{errors.interests}</p>}
      </fieldset>

      <div>
        <label htmlFor="v-availability" className="label">وقت التفرغ</label>
        <select id="v-availability" className="field" value={availability} onChange={(e) => setAvailability(e.target.value)} aria-invalid={Boolean(errors.availability)}>
          <option value="">اختر وقت التفرغ</option>
          {VOLUNTEER_AVAILABILITY.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
        {errors.availability && <p className="error-text">{errors.availability}</p>}
      </div>

      <div>
        <label htmlFor="v-message" className="label">رسالة (اختياري)</label>
        <textarea id="v-message" className="field" maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>

      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "جارٍ الإرسال..." : "إرسال طلب التطوع"}
      </button>
    </form>
  );
}
