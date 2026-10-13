"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Burst, WeatherIcon } from "@/components/Icons";
import { Alert, Brand, ItemThumb, UnderlineTabs } from "@/components/ui";
import { api, useOnMount } from "@/lib/client";
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
  const [tab, setTab] = useState<"main" | "backup">("main");

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
      setTab("main");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const s = data?.suggestion;
  const showBackup = tab === "backup" && !!s?.backup_item_ids.length;
  const byId = new Map(data?.items.map((i) => [i.id, i]));
  const ids = s ? (showBackup ? s.backup_item_ids : s.item_ids) : [];
  const outfit = ids
    .map((id) => byId.get(id))
    .filter((i): i is ItemWithThumb => !!i)
    .sort((a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category));
  const w = s?.weather;
  const dateLabel = data
    ? new Date(`${data.today}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
    : " ";

  return (
    <div className="space-y-7">
      <Brand />

      {s && (
        <UnderlineTabs
          tabs={[
            { value: "main", label: "Today's pick" },
            { value: "backup", label: "Backup", badge: s.backup_item_ids.length ? 1 : undefined },
          ]}
          value={tab}
          onChange={setTab}
        />
      )}

      <header>
        <h1 className="display text-[60px]">Today&rsquo;s look</h1>
        <p className="mt-3 text-[18px]">{dateLabel}</p>
      </header>

      {error && <Alert>{error}</Alert>}

      {data && !data.has_location && (
        <Alert kind="info">
          Set your location in{" "}
          <Link className="font-medium underline" href="/settings">
            Settings
          </Link>{" "}
          so I can check the weather.
        </Alert>
      )}

      {data && data.item_count === 0 && (
        <section className="overflow-hidden rounded-[28px] stripes-sky p-5">
          <div className="space-y-3 rounded-[6px] bg-[#fdf3d9] px-5 py-7 text-center text-[#2a2118] shadow-sm">
            <p className="script text-[34px] leading-none">let&rsquo;s get started!</p>
            <p className="text-[15px]">
              Log today&rsquo;s outfit to start your wardrobe, and add some inspiration so I learn your style.
            </p>
            <div className="flex justify-center gap-2 pt-1">
              <Link href="/upload" className="btn border-[1.5px] border-[#2a2118] px-4 py-2 text-sm">
                log outfit
              </Link>
              <Link href="/inspiration" className="btn border-[1.5px] border-[#2a2118] px-4 py-2 text-sm">
                add inspiration
              </Link>
            </div>
          </div>
        </section>
      )}

      {w && (
        <div className="grid grid-cols-2 gap-4">
          <div className="tile flex flex-col items-center gap-3 bg-sky px-3 py-6 text-center">
            <span className="text-[17px]">Weather</span>
            <WeatherIcon code={w.code} className="h-14 w-14" />
            <span className="display text-[34px]">{Math.round(w.tempMax)}° {shortSummary(w.summary)}</span>
            <span className="text-[13px] opacity-75">
              low {Math.round(w.tempMin)}° · {w.precipProbability}% rain
            </span>
          </div>
          <div className="tile flex flex-col items-center gap-3 bg-mustard px-3 py-6 text-center">
            <span className="text-[17px]">Season</span>
            <Burst className="h-14 w-14" />
            <span className="display text-[34px] capitalize">{w.season}</span>
            <span className="text-[13px] opacity-75">feels {Math.round(w.feelsMin)}–{Math.round(w.feelsMax)}°</span>
          </div>
        </div>
      )}

      {s ? (
        <section className="space-y-5">
          <h2 className="display text-[34px]">{showBackup ? "Plan B" : s.headline}</h2>

          <ul className="grid grid-cols-3 gap-x-3 gap-y-4">
            {outfit.map((item) => (
              <li key={item.id} className="space-y-1.5">
                <ItemThumb item={item} />
                <div className="text-[13px] font-medium leading-tight">{item.name}</div>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-2.5">
            {s.status === "worn" ? (
              <span className="btn bg-sage text-tile-ink">Worn today ✓</span>
            ) : (
              <button
                className="btn-primary"
                disabled={!!busy}
                onClick={() =>
                  run("wear", () => api("/api/suggest/wear", { body: { suggestion_id: s.id, use_backup: showBackup } }))
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
          </div>
        </section>
      ) : (
        data?.has_location &&
        data.item_count > 0 && (
          <section className="tile space-y-4 bg-pink px-5 py-7 text-center">
            <p className="script text-[30px] leading-none">nothing picked yet</p>
            <p className="text-[15px]">Your outfit arrives at 7 a.m., or I can pick one now.</p>
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
    </div>
  );
}

function shortSummary(s: string) {
  return { "Partly cloudy": "& mild", Overcast: "& grey", "Snow showers": "& snowy", Thunderstorm: "& stormy" }[s] ?? `& ${s.toLowerCase()}`;
}
