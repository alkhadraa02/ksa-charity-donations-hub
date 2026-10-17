"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { VOLUNTEER_STATUS_LABELS } from "@/lib/constants";

export function VolunteerStatusSelect({ id, status, name }: { id: string; status: string; name: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function change(next: string) {
    const previous = value;
    setValue(next);
    setBusy(true);
    setFailed(false);
    const res = await fetch(`/api/admin/volunteers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (!res.ok) {
      setValue(previous);
      setFailed(true);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <label htmlFor={`vs-${id}`} className="sr-only">
        حالة {name}
      </label>
      <select
        id={`vs-${id}`}
        className="field !min-h-9 !py-1"
        value={value}
        disabled={busy}
        onChange={(e) => change(e.target.value)}
      >
        {Object.entries(VOLUNTEER_STATUS_LABELS).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      {failed && (
        <p role="alert" className="error-text">
          تعذّر التحديث
        </p>
      )}
    </div>
  );
}
