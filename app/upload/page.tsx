"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Camera } from "@/components/Icons";
import { Alert, Brand, TINT } from "@/components/ui";
import { api, CATEGORY_LABEL, compressImage, cropThumb, todayLocal, type BBox } from "@/lib/client";
import type { Category, Item } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";

interface Detected {
  category: Category;
  match_item_id: string | null;
  match_confidence: number;
  name: string;
  colors: string[];
  pattern: string;
  material: string;
  formality: number;
  warmth: number;
  seasons: string[];
  description: string;
  bbox: BBox;
}

interface AnalyzeResult {
  log_id: string;
  worn_on: string;
  photo_url: string;
  analysis: { items: Detected[]; outfit_summary: string };
}

/** One review row: either link to an existing item ("existing") or create a new one. */
interface Row {
  key: number;
  detected: Detected;
  choice: string; // item id, or "new"
  name: string;
  category: Category;
  include: boolean;
  thumb: string | null;
}

type ItemWithThumb = Item & { thumb_url: string | null };

export default function UploadPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [date, setDate] = useState(todayLocal());
  const [photo, setPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [wardrobe, setWardrobe] = useState<ItemWithThumb[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<ItemWithThumb[]>("/api/items").then(setWardrobe).catch(() => {});
  }, []);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setResult(null);
    setRows([]);
    try {
      const dataUrl = await compressImage(file);
      setPhoto(dataUrl);
      setBusy("studying your outfit…");
      const res = await api<AnalyzeResult>("/api/outfits/analyze", { body: { image: dataUrl, worn_on: date } });
      setResult(res);
      const thumbs = await Promise.all(res.analysis.items.map((d) => cropThumb(dataUrl, d.bbox).catch(() => null)));
      setRows(
        res.analysis.items.map((d, i) => ({
          key: i,
          detected: d,
          choice: d.match_item_id ?? "new",
          name: d.name,
          category: d.category,
          include: true,
          thumb: thumbs[i],
        })),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function update(key: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  async function confirm() {
    if (!result) return;
    setBusy("Saving…");
    setError(null);
    try {
      const items = rows
        .filter((r) => r.include)
        .map((r) =>
          r.choice === "new"
            ? {
                thumb: r.thumb ?? undefined,
                new: { ...r.detected, name: r.name, category: r.category },
              }
            : { existing_id: r.choice, thumb: r.thumb ?? undefined },
        );
      await api("/api/outfits/confirm", { body: { log_id: result.log_id, items } });
      router.push("/wardrobe?saved=1");
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }

  return (
    <div className="space-y-7">
      <Brand />
      <header>
        <h1 className="display text-[60px]">
          What are you <em>wearing?</em>
        </h1>
        <p className="mt-3 text-[17px] text-muted">
          A full-length mirror photo works best, with your shoes and accessories in view.
        </p>
      </header>

      {!result && !busy && (
        <section className="overflow-hidden rounded-[28px] stripes-pink p-5">
          <div className="space-y-5 bg-[#fdf3d9] px-5 py-7 text-[#2a2118] shadow-sm">
            <p className="script text-center text-[38px] font-bold leading-none">snap today&rsquo;s fit!</p>
            <label className="block">
              <span className="text-[12px]">date worn</span>
              <input
                type="date"
                className="mt-1 w-full border-b-[1.5px] border-[#2a2118] bg-transparent py-2 text-[16px] outline-none"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <button className="btn bg-[#2a2118] text-[#fdf3d9]" onClick={() => fileRef.current?.click()}>
                <Camera className="h-5 w-5" /> Camera
              </button>
              <label className="btn cursor-pointer border-[1.5px] border-[#2a2118]">
                Library
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
              </label>
            </div>
          </div>
        </section>
      )}

      {photo && busy && (
        <div className="tile flex items-center gap-4 bg-sky p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" className="h-24 w-[72px] rounded-[16px] object-cover" />
          <p className="script animate-pulse text-[28px] leading-tight">{busy}</p>
        </div>
      )}

      {error && <Alert>{error}</Alert>}

      {result && (
        <section className="space-y-4">
          <div className="flex gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo ?? result.photo_url}
              alt="Your outfit"
              className="h-40 w-28 shrink-0 rounded-[22px] object-cover"
            />
            <div className="space-y-2">
              <p className="script text-[26px] leading-[1.1]">&ldquo;{result.analysis.outfit_summary}&rdquo;</p>
              <p className="text-[14px] text-muted">
                Check each piece: is it already in your wardrobe, or new? Tap to change.
              </p>
            </div>
          </div>

          {rows.map((r) => {
            const sameCat = wardrobe.filter((w) => w.category === r.category && w.active);
            const matched = wardrobe.find((w) => w.id === r.choice);
            return (
              <div key={r.key} className={`card flex gap-3 p-3 ${r.include ? "" : "opacity-40"}`}>
                <div className={`h-24 w-24 shrink-0 overflow-hidden rounded-[18px] ${TINT[r.category] ?? "bg-soft"}`}>
                  {r.thumb && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.thumb} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
                        r.choice === "new" ? "bg-accent text-accent-ink" : "bg-sage text-tile-ink"
                      }`}
                    >
                      {r.choice === "new"
                        ? "New"
                        : `Matched${r.detected.match_item_id === r.choice ? ` · ${Math.round(r.detected.match_confidence * 100)}%` : ""}`}
                    </span>
                    <select
                      className="rounded-lg border-[1.5px] border-line bg-card px-1.5 py-0.5 text-[12px]"
                      value={r.category}
                      onChange={(e) => update(r.key, { category: e.target.value as Category, choice: "new" })}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {CATEGORY_LABEL[c]}
                        </option>
                      ))}
                    </select>
                    <button
                      className="ml-auto text-[12px] text-muted underline"
                      onClick={() => update(r.key, { include: !r.include })}
                    >
                      {r.include ? "remove" : "undo"}
                    </button>
                  </div>
                  <select
                    className="input py-2 text-[14px]"
                    value={r.choice}
                    onChange={(e) => update(r.key, { choice: e.target.value })}
                  >
                    <option value="new">New piece</option>
                    {sameCat.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                  {r.choice === "new" ? (
                    <input
                      className="input py-2 text-[14px]"
                      value={r.name}
                      onChange={(e) => update(r.key, { name: e.target.value })}
                    />
                  ) : (
                    matched && <p className="truncate text-[12px] text-muted">{matched.description}</p>
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex gap-2.5">
            <button className="btn-primary flex-1" disabled={!!busy || !rows.some((r) => r.include)} onClick={confirm}>
              {busy ?? "Save outfit"}
            </button>
            <button
              className="btn-ghost"
              disabled={!!busy}
              onClick={() => {
                setResult(null);
                setPhoto(null);
                setRows([]);
              }}
            >
              Retake
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
