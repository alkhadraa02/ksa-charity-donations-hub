"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string; errors?: Record<string, string> };
        setError(body.errors ? Object.values(body.errors)[0] : (body.error ?? "تعذّر تسجيل الدخول"));
        setBusy(false);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("تعذّر الاتصال بالخادم");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {error && (
        <p role="alert" className="alert alert-error">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="email" className="label">
          البريد الإلكتروني
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required dir="ltr" className="field" />
      </div>
      <div>
        <label htmlFor="password" className="label">
          كلمة المرور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          dir="ltr"
          className="field"
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "جارٍ الدخول…" : "تسجيل الدخول"}
      </button>
    </form>
  );
}
