"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CampaignUpdateForm({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    setMessage(null);
    const res = await fetch("/api/admin/campaign-updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId, title, body }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; errors?: Record<string, string> };
    setBusy(false);
    if (!res.ok) {
      setErrors(data.errors ?? {});
      setMessage({ kind: "error", text: data.error ?? "تعذّر النشر" });
      return;
    }
    setTitle("");
    setBody("");
    setMessage({ kind: "ok", text: "تم نشر التحديث" });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card flex flex-col gap-3 p-5" noValidate>
      <h2 className="text-lg font-bold">إضافة تحديث للحملة</h2>
      {message && (
        <p role={message.kind === "error" ? "alert" : "status"} className={`alert ${message.kind === "ok" ? "alert-ok" : "alert-error"}`}>
          {message.text}
        </p>
      )}
      <div>
        <label htmlFor="update-title" className="label">عنوان التحديث</label>
        <input id="update-title" className="field" value={title} onChange={(e) => setTitle(e.target.value)} aria-invalid={errors.title ? true : undefined} />
        {errors.title && <p className="error-text">{errors.title}</p>}
      </div>
      <div>
        <label htmlFor="update-body" className="label">النص</label>
        <textarea id="update-body" rows={4} className="field" value={body} onChange={(e) => setBody(e.target.value)} aria-invalid={errors.body ? true : undefined} />
        {errors.body && <p className="error-text">{errors.body}</p>}
      </div>
      <div>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "جارٍ النشر…" : "نشر التحديث"}
        </button>
      </div>
    </form>
  );
}
