"use client";

import { useCallback, useState } from "react";
import { api, CATEGORY_LABEL, useOnMount } from "@/lib/client";
import { CATEGORIES, SEASONS, type Item } from "@/lib/types";

type ItemWithThumb = Item & { thumb_url: string | null };
interface Log {
  id: string;
  worn_on: string;
  photo_url: string | null;
  items: { id: string; name: string; category: string }[];
}

export default function WardrobePage() {
  const [items, setItems] = useState<ItemWithThumb[] | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [tab, setTab] = useState<"items" | "history">("items");
  const [editing, setEditing] = useState<ItemWithThumb | null>(null);
  const [showRetired, setShowRetired] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [i, l] = await Promise.all([api<ItemWithThumb[]>("/api/items"), api<Log[]>("/api/outfits")]);
      setItems(i);
      setLogs(l);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useOnMount(load);

  const visible = (items ?? []).filter((i) => showRetired || i.active);

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between">
        <div>
          <p className="label">{items ? `${items.filter((i) => i.active).length} items` : " "}</p>
          <h1 className="mt-1 text-2xl font-semibold">Wardrobe</h1>
        </div>
        <div className="flex rounded-full border border-line bg-card p-0.5 text-sm">
          {(["items", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1 ${tab === t ? "bg-accent text-accent-ink" : "text-muted"}`}
            >
              {t === "items" ? "Items" : "History"}
            </button>
          ))}
        </div>
      </header>

      {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p>}

      {tab === "items" && (
        <>
          {items?.length === 0 && (
            <p className="rounded-xl bg-soft px-3 py-2.5 text-sm">
              Nothing here yet. Log an outfit photo and the pieces will show up here.
            </p>
          )}
          {CATEGORIES.map((cat) => {
            const list = visible.filter((i) => i.category === cat);
            if (!list.length) return null;
            return (
              <section key={cat} className="space-y-2">
                <h2 className="label">
                  {CATEGORY_LABEL[cat]} · {list.length}
                </h2>
                <ul className="grid grid-cols-3 gap-2">
                  {list.map((item) => (
                    <li key={item.id}>
                      <button className="w-full space-y-1 text-left" onClick={() => setEditing(item)}>
                        <div
                          className={`aspect-square overflow-hidden rounded-xl bg-soft ${item.active ? "" : "opacity-40 grayscale"}`}
                        >
                          {item.thumb_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.thumb_url} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-2xl">👕</div>
                          )}
                        </div>
                        <div className="truncate text-xs font-medium">{item.name}</div>
                        <div className="text-[11px] text-muted">
                          {item.wear_count}× · {item.last_worn_at ? `last ${shortDate(item.last_worn_at)}` : "not worn yet"}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
          {items?.some((i) => !i.active) && (
            <button className="text-sm text-muted underline" onClick={() => setShowRetired((s) => !s)}>
              {showRetired ? "Hide retired items" : "Show retired items"}
            </button>
          )}
        </>
      )}

      {tab === "history" && (
        <ul className="space-y-2">
          {logs.length === 0 && <p className="text-sm text-muted">No outfits logged yet.</p>}
          {logs.map((l) => (
            <li key={l.id} className="card flex gap-3 p-3">
              {l.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.photo_url} alt="" className="h-24 w-18 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="flex h-24 w-18 shrink-0 items-center justify-center rounded-lg bg-soft text-xl">✓</div>
              )}
              <div className="min-w-0 flex-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{shortDate(l.worn_on, true)}</span>
                  <button
                    className="text-xs text-muted underline"
                    onClick={async () => {
                      if (!confirm("Delete this outfit log?")) return;
                      await api(`/api/outfits/${l.id}`, { method: "DELETE" });
                      load();
                    }}
                  >
                    Delete
                  </button>
                </div>
                <p className="mt-1 text-muted">{l.items.map((i) => i.name).join(" · ")}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <EditSheet
          item={editing}
          others={(items ?? []).filter((i) => i.id !== editing.id && i.category === editing.category)}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function shortDate(d: string, weekday = false) {
  return new Date(`${d}T12:00:00`).toLocaleDateString(undefined, {
    ...(weekday ? { weekday: "short" } : {}),
    month: "short",
    day: "numeric",
  });
}

function EditSheet({
  item,
  others,
  onClose,
  onSaved,
}: {
  item: ItemWithThumb;
  others: ItemWithThumb[];
  onClose: () => void;
  onSaved: () => void;
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
    <div className="fixed inset-0 z-30 flex items-end bg-black/40 sm:items-center sm:justify-center" onClick={onClose}>
      <div
        className="max-h-[90dvh] w-full space-y-4 overflow-y-auto rounded-t-3xl bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:max-w-md sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-3">
          {item.thumb_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.thumb_url} alt="" className="h-20 w-20 rounded-xl object-cover" />
          )}
          <div className="text-sm text-muted">
            <p>{item.description}</p>
            <p className="mt-1">
              {[item.colors.join(", "), item.pattern, item.material].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>

        <label className="block space-y-1">
          <span className="label">Name</span>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="block space-y-1">
          <span className="label">Category</span>
          <select
            className="input"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as Item["category"] })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </label>
        <Scale label="Warmth" low="Light" high="Warm" value={form.warmth} onChange={(v) => setForm({ ...form, warmth: v })} />
        <Scale
          label="Formality"
          low="Casual"
          high="Formal"
          value={form.formality}
          onChange={(v) => setForm({ ...form, formality: v })}
        />
        <div className="space-y-1">
          <span className="label">Seasons</span>
          <div className="flex flex-wrap gap-1.5">
            {SEASONS.map((s) => {
              const on = form.seasons.includes(s);
              return (
                <button
                  key={s}
                  className={`rounded-full border px-3 py-1 text-sm capitalize ${on ? "border-accent bg-accent text-accent-ink" : "border-line"}`}
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
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!form.active} onChange={(e) => setForm({ ...form, active: !e.target.checked })} />
          Retired (don&apos;t suggest this any more)
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

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
          <div className="space-y-2 border-t border-line pt-4">
            <span className="label">Duplicate? Merge into…</span>
            <div className="flex gap-2">
              <select className="input" value={mergeInto} onChange={(e) => setMergeInto(e.target.value)}>
                <option value="">Choose item</option>
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
          className="text-sm text-red-600 underline"
          disabled={busy}
          onClick={() => {
            if (confirm(`Delete "${item.name}" and remove it from past outfits?`)) {
              act(() => api(`/api/items/${item.id}`, { method: "DELETE" }));
            }
          }}
        >
          Delete item
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
    <div className="space-y-1">
      <span className="label">{label}</span>
      <div className="flex items-center gap-2 text-xs text-muted">
        <span className="w-12">{low}</span>
        <div className="flex flex-1 gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => onChange(n)}
              className={`h-8 flex-1 rounded-lg border text-sm ${n === value ? "border-accent bg-accent text-accent-ink" : "border-line text-ink"}`}
            >
              {n}
            </button>
          ))}
        </div>
        <span className="w-12 text-right">{high}</span>
      </div>
    </div>
  );
}
