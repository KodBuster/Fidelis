"use client";
import { useState } from "react";
export function LogoutButton() {
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  return <div><button disabled={busy} className="text-sm text-brand-terracotta underline disabled:opacity-50" onClick={async () => {
    setBusy(true); setError(false);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      if (!response.ok) throw new Error();
      window.location.assign("/");
    } catch { setError(true); setBusy(false); }
  }}>Выйти</button>{error && <p role="alert">Не удалось выйти. Попробуйте ещё раз.</p>}</div>;
}
