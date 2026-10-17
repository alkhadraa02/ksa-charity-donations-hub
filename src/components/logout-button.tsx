"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <button type="button" className="btn btn-secondary btn-sm" onClick={logout} disabled={busy}>
      {busy ? "جارٍ الخروج…" : "تسجيل الخروج"}
    </button>
  );
}
