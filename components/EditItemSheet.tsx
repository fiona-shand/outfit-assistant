"use client";

import { useState } from "react";
import { Alert, ItemThumb, TINT } from "@/components/ui";
import { api, CATEGORY_HINT, CATEGORY_LABEL, CATEGORY_PLURAL } from "@/lib/client";
import { CATEGORIES, SEASONS, type Category, type Item } from "@/lib/types";

type ItemWithThumb = Item & { thumb_url: string | null };

/** Bottom sheet for editing one wardrobe piece: category, name, warmth, seasons, merge, delete. */
export default function EditItemSheet({
  item,
  others = [],
  onClose,
  onSaved,
  onChanged,
}: {
  item: ItemWithThumb;
  /** Same-category pieces this one could be merged into (omit to hide merging). */
  others?: ItemWithThumb[];
  onClose: () => void;
  onSaved: () => void;
  /** Called after an instant change (category) so the page behind can refresh. */
  onChanged?: () => void;
}) {
  const [form, setForm] = useState({
    name: item.name,
    category: item.category,
    warmth: item.warmth,
    formality: item.formality,
    seasons: item.seasons,
    active: item.active,
  });
  const [mergeInto, setMergeInto] = useState("");
  const [movedTo, setMovedTo] = useState<Category | null>(null);

  /** Category changes save straight away - no Save tap needed. */
  async function changeCategory(category: Category) {
    if (category === form.category) return;
    const previous = form.category;
    setForm((f) => ({ ...f, category }));
    setError(null);
    try {
      await api(`/api/items/${item.id}`, { method: "PATCH", body: { category } });
      setMovedTo(category);
      onChanged?.();
    } catch (e) {
      setForm((f) => ({ ...f, category: previous }));
      setError((e as Error).message);
    }
  }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      onSaved();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-ink/40 sm:items-center sm:justify-center" onClick={onClose}>
      <div
        className="max-h-[90dvh] w-full space-y-5 overflow-y-auto rounded-t-[32px] bg-bg p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-w-md sm:rounded-[32px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto h-1.5 w-10 rounded-full bg-line sm:hidden" />
        <div className="flex gap-4">
          <ItemThumb item={item} className="w-24 shrink-0" />
          <div className="min-w-0">
            <h2 className="display text-[30px]">{item.name}</h2>
            <p className="mt-1 text-[14px] text-muted">
              {[item.colors.join(", "), item.pattern, item.material].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
        {item.description && <p className="script text-[22px] leading-tight">&ldquo;{item.description}&rdquo;</p>}

        <div className="space-y-2">
          <span className="label">What kind of piece is this?</span>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => {
              const on = form.category === c;
              return (
                <button
                  key={c}
                  onClick={() => changeCategory(c)}
                  className={`rounded-2xl border-[1.5px] px-3 py-2.5 text-left transition ${
                    on ? `border-ink ${TINT[c]} text-tile-ink` : "border-line bg-card"
                  }`}
                >
                  <span className="block text-[15px] font-medium">
                    {on ? "✓ " : ""}
                    {CATEGORY_LABEL[c]}
                  </span>
                  <span className={`block text-[12px] leading-snug ${on ? "opacity-75" : "text-muted"}`}>
                    {CATEGORY_HINT[c]}
                  </span>
                </button>
              );
            })}
          </div>
          {movedTo && <p className="text-[13px] text-muted">Saved: moved to {CATEGORY_PLURAL[movedTo]}.</p>}
        </div>

        <label className="block space-y-1.5">
          <span className="label">Name</span>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <Scale label="Warmth" low="Light" high="Toasty" value={form.warmth} onChange={(v) => setForm({ ...form, warmth: v })} />
        <Scale
          label="Formality"
          low="Casual"
          high="Formal"
          value={form.formality}
          onChange={(v) => setForm({ ...form, formality: v })}
        />
        <div className="space-y-1.5">
          <span className="label">Seasons</span>
          <div className="flex flex-wrap gap-2">
            {SEASONS.map((s) => {
              const on = form.seasons.includes(s);
              return (
                <button
                  key={s}
                  className={`rounded-full border-[1.5px] px-4 py-1.5 text-[14px] capitalize ${
                    on ? "border-ink bg-ink text-bg" : "border-line"
                  }`}
                  onClick={() =>
                    setForm({ ...form, seasons: on ? form.seasons.filter((x) => x !== s) : [...form.seasons, s] })
                  }
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
        <label className="flex items-center gap-2 text-[15px]">
          <input
            type="checkbox"
            className="h-5 w-5 accent-[var(--ink)]"
            checked={!form.active}
            onChange={(e) => setForm({ ...form, active: !e.target.checked })}
          />
          Retired (don&apos;t suggest this any more)
        </label>

        {error && <Alert>{error}</Alert>}

        <div className="flex gap-2">
          <button
            className="btn-primary flex-1"
            disabled={busy}
            onClick={() => act(() => api(`/api/items/${item.id}`, { method: "PATCH", body: form }))}
          >
            Save
          </button>
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
        </div>

        {others.length > 0 && (
          <div className="space-y-2 border-t-[1.5px] border-line pt-5">
            <span className="label">Duplicate? Merge into…</span>
            <div className="flex gap-2">
              <select className="input" value={mergeInto} onChange={(e) => setMergeInto(e.target.value)}>
                <option value="">Choose a piece</option>
                {others.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
              <button
                className="btn-ghost"
                disabled={!mergeInto || busy}
                onClick={() => act(() => api(`/api/items/${item.id}/merge`, { body: { into: mergeInto } }))}
              >
                Merge
              </button>
            </div>
          </div>
        )}
        <button
          className="text-[14px] text-accent underline"
          disabled={busy}
          onClick={() => {
            if (confirm(`Delete "${item.name}" and remove it from past outfits?`)) {
              act(() => api(`/api/items/${item.id}`, { method: "DELETE" }));
            }
          }}
        >
          Delete piece
        </button>
      </div>
    </div>
  );
}

function Scale({
  label,
  low,
  high,
  value,
  onChange,
}: {
  label: string;
  low: string;
  high: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <span className="label">{label}</span>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`h-10 flex-1 rounded-xl border-[1.5px] text-[15px] ${
              n === value ? "border-ink bg-ink text-bg" : "border-line"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[12px] text-muted">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}
