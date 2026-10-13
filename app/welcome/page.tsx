"use client";

import { useState } from "react";
import { api, useOnMount, WELCOMED_KEY } from "@/lib/client";

export default function WelcomePage() {
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useOnMount(() =>
    api<{ password_required: boolean }>("/api/auth/status")
      .then((s) => setNeedsPassword(s.password_required))
      .catch(() => {}),
  );

  async function enter(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (needsPassword) await api("/api/auth/login", { body: { password } });
      try {
        localStorage.setItem(WELCOMED_KEY, "1");
      } catch {}
      window.location.href = "/";
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col stripes-sky">
      <div className="flex items-center justify-between bg-[#fdf3d9] px-5 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
        <span className="script text-[30px] font-bold text-[#b33a26]">outfits &amp; co.</span>
        <span className="text-[13px] text-[#2a2118]">your wardrobe, sorted</span>
      </div>
      <div className="h-2 scallop" />
      <div className="flex flex-1 items-center justify-center px-6">
        <form onSubmit={enter} className="w-full max-w-sm space-y-6 bg-[#fdf3d9] px-7 py-9 text-[#2a2118] shadow-lg">
          <h1 className="script text-center text-[44px] font-bold leading-none">hello, gorgeous!</h1>
          <ul className="space-y-2.5 text-[15px] leading-snug">
            <li>
              <span className="script text-[22px] font-bold">snap</span> your outfit each day and I&rsquo;ll learn your
              wardrobe, piece by piece.
            </li>
            <li>
              <span className="script text-[22px] font-bold">7 a.m.</span> every morning I&rsquo;ll pick a look for the
              weather and your style.
            </li>
            <li>
              <span className="script text-[22px] font-bold">rotate</span> &mdash; no more wearing the same thing on
              repeat.
            </li>
          </ul>
          {needsPassword && (
            <label className="block">
              <span className="text-[12px]">password</span>
              <input
                type="password"
                autoComplete="current-password"
                className="mt-1 w-full border-b-[1.5px] border-[#2a2118] bg-transparent py-2 text-[17px] outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          )}
          {error && <p className="text-center text-sm text-[#b33a26]">{error}</p>}
          <div className="text-center">
            <button
              className="script rounded-[6px] border-[1.5px] border-[#2a2118] px-6 py-1 text-[24px] font-bold disabled:opacity-50"
              disabled={busy || (needsPassword && !password)}
            >
              {busy ? "one sec…" : "let's get dressed"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
