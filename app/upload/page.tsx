"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
      setBusy("Looking at your outfit…");
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
    <div className="space-y-5">
      <header>
        <p className="label">Daily log</p>
        <h1 className="mt-1 text-2xl font-semibold">What are you wearing?</h1>
      </header>

      {!result && (
        <div className="card space-y-4 p-4">
          <label className="block space-y-1">
            <span className="label">Date worn</span>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <div className="grid grid-cols-2 gap-2">
            <button className="btn-primary" disabled={!!busy} onClick={() => fileRef.current?.click()}>
              📷 Take photo
            </button>
            <label className={`btn-ghost cursor-pointer ${busy ? "pointer-events-none opacity-50" : ""}`}>
              🖼️ Choose photo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
          </div>
          <p className="text-xs text-muted">
            Tip: a full-length mirror photo works best, with your shoes and accessories in view.
          </p>
        </div>
      )}

      {photo && busy && (
        <div className="card flex items-center gap-3 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" className="h-20 w-16 rounded-lg object-cover" />
          <p className="animate-pulse text-sm text-muted">{busy}</p>
        </div>
      )}

      {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p>}

      {result && (
        <section className="space-y-3">
          <div className="card flex gap-3 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo ?? result.photo_url} alt="Your outfit" className="h-32 w-24 rounded-lg object-cover" />
            <div className="text-sm">
              <p className="font-medium">{result.analysis.outfit_summary}</p>
              <p className="mt-1 text-muted">
                Check each piece: is it something already in your wardrobe, or new? Tap to change.
              </p>
            </div>
          </div>

          {rows.map((r) => {
            const sameCat = wardrobe.filter((w) => w.category === r.category && w.active);
            const matched = wardrobe.find((w) => w.id === r.choice);
            return (
              <div key={r.key} className={`card flex gap-3 p-3 ${r.include ? "" : "opacity-40"}`}>
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-soft">
                  {r.thumb && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.thumb} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        r.choice === "new" ? "bg-accent text-accent-ink" : "bg-soft"
                      }`}
                    >
                      {r.choice === "new"
                        ? "New"
                        : `Matched${r.detected.match_item_id === r.choice ? ` · ${Math.round(r.detected.match_confidence * 100)}%` : ""}`}
                    </span>
                    <select
                      className="rounded-md border border-line bg-card px-1 py-0.5 text-xs"
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
                      className="ml-auto text-xs text-muted underline"
                      onClick={() => update(r.key, { include: !r.include })}
                    >
                      {r.include ? "Remove" : "Undo"}
                    </button>
                  </div>
                  <select
                    className="input py-1.5"
                    value={r.choice}
                    onChange={(e) => update(r.key, { choice: e.target.value })}
                  >
                    <option value="new">➕ New item</option>
                    {sameCat.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                  {r.choice === "new" ? (
                    <input className="input py-1.5" value={r.name} onChange={(e) => update(r.key, { name: e.target.value })} />
                  ) : (
                    matched && <p className="truncate text-xs text-muted">{matched.description}</p>
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex gap-2">
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
