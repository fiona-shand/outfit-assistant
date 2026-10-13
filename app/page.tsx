"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { api, CATEGORY_LABEL, useOnMount } from "@/lib/client";
import type { Item, Suggestion } from "@/lib/types";

type ItemWithThumb = Item & { thumb_url: string | null };

interface TodayData {
  today: string;
  has_location: boolean;
  item_count: number;
  suggestion: Suggestion | null;
  items: ItemWithThumb[];
}

const ORDER = ["outerwear", "top", "dress", "bottom", "shoes", "accessory"];

export default function TodayPage() {
  const [data, setData] = useState<TodayData | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBackup, setShowBackup] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await api<TodayData>("/api/today"));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useOnMount(load);

  async function run(label: string, fn: () => Promise<unknown>) {
    setBusy(label);
    setError(null);
    try {
      await fn();
      setShowBackup(false);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const s = data?.suggestion;
  const byId = new Map(data?.items.map((i) => [i.id, i]));
  const ids = s ? (showBackup && s.backup_item_ids.length ? s.backup_item_ids : s.item_ids) : [];
  const outfit = ids
    .map((id) => byId.get(id))
    .filter((i): i is ItemWithThumb => !!i)
    .sort((a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category));
  const w = s?.weather;

  return (
    <div className="space-y-5">
      <header>
        <p className="label">
          {data
            ? new Date(`${data.today}T12:00:00`).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })
            : " "}
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Today&apos;s outfit</h1>
      </header>

      {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p>}

      {data && !data.has_location && (
        <Notice>
          Set your location in{" "}
          <Link className="underline" href="/settings">
            Settings
          </Link>{" "}
          so I can check the weather.
        </Notice>
      )}
      {data && data.item_count === 0 && (
        <Notice>
          Your wardrobe is empty.{" "}
          <Link className="underline" href="/upload">
            Log today&apos;s outfit
          </Link>{" "}
          to start building it, and add{" "}
          <Link className="underline" href="/inspiration">
            inspiration photos
          </Link>{" "}
          so I learn your style.
        </Notice>
      )}

      {w && (
        <div className="card flex items-center gap-3 px-4 py-3">
          <span className="text-3xl">{w.emoji}</span>
          <div className="text-sm">
            <div className="font-medium">
              {Math.round(w.tempMax)}° / {Math.round(w.tempMin)}°C · {w.summary}
            </div>
            <div className="text-muted">
              Feels {Math.round(w.feelsMin)}–{Math.round(w.feelsMax)}° · {w.precipProbability}% rain · {w.season}
            </div>
          </div>
        </div>
      )}

      {s ? (
        <section className="card overflow-hidden">
          <div className="border-b border-line px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">{showBackup ? "Backup option" : s.headline}</h2>
              {s.status === "worn" && <span className="rounded-full bg-soft px-2 py-0.5 text-xs">Worn ✓</span>}
            </div>
            {!showBackup && s.reasoning && <p className="mt-1 text-sm text-muted">{s.reasoning}</p>}
          </div>
          <ul className="grid grid-cols-3 gap-3 p-4">
            {outfit.map((item) => (
              <li key={item.id} className="space-y-1.5">
                <div className="aspect-square overflow-hidden rounded-xl bg-soft">
                  {item.thumb_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.thumb_url} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">👕</div>
                  )}
                </div>
                <div className="text-xs text-muted">{CATEGORY_LABEL[item.category]}</div>
                <div className="text-sm font-medium leading-tight">{item.name}</div>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 border-t border-line px-4 py-3">
            {s.status !== "worn" && (
              <button
                className="btn-primary"
                disabled={!!busy}
                onClick={() =>
                  run("wear", () =>
                    api("/api/suggest/wear", { body: { suggestion_id: s.id, use_backup: showBackup } }),
                  )
                }
              >
                {busy === "wear" ? "Saving…" : "I'm wearing this"}
              </button>
            )}
            <button
              className="btn-ghost"
              disabled={!!busy}
              onClick={() => run("shuffle", () => api("/api/suggest", { body: { avoid: s.item_ids } }))}
            >
              {busy === "shuffle" ? "Thinking…" : "Shuffle"}
            </button>
            {s.backup_item_ids.length > 0 && (
              <button className="btn-ghost" onClick={() => setShowBackup((b) => !b)}>
                {showBackup ? "Main pick" : "See backup"}
              </button>
            )}
          </div>
        </section>
      ) : (
        data?.has_location &&
        data.item_count > 0 && (
          <section className="card space-y-3 px-4 py-5 text-center">
            <p className="text-sm text-muted">No suggestion yet today. It arrives at 7 a.m., or get one now.</p>
            <button
              className="btn-primary"
              disabled={!!busy}
              onClick={() => run("gen", () => api("/api/suggest", { body: {} }))}
            >
              {busy === "gen" ? "Picking your outfit…" : "Suggest an outfit"}
            </button>
          </section>
        )
      )}

      <Link href="/upload" className="btn-ghost w-full">
        📸 Log what I&apos;m actually wearing
      </Link>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl bg-soft px-3 py-2.5 text-sm">{children}</p>;
}
