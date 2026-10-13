"use client";

import { useCallback, useState } from "react";
import { Alert, Brand, ItemThumb, TINT, UnderlineTabs } from "@/components/ui";
import { api, CATEGORY_LABEL, useOnMount } from "@/lib/client";
import { CATEGORIES, SEASONS, type Item } from "@/lib/types";

type ItemWithThumb = Item & { thumb_url: string | null };
interface Log {
  id: string;
  worn_on: string;
  photo_url: string | null;
  items: { id: string; name: string; category: string }[];
}

const PLURAL: Record<string, string> = {
  top: "Tops",
  bottom: "Bottoms",
  dress: "Dresses",
  shoes: "Shoes",
  outerwear: "Layers",
  accessory: "Accessories",
};

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
  const activeCount = items?.filter((i) => i.active).length ?? 0;

  return (
    <div className="space-y-7">
      <Brand />
      <UnderlineTabs
        tabs={[
          { value: "items", label: "Pieces" },
          { value: "history", label: "Worn" },
        ]}
        value={tab}
        onChange={setTab}
      />
      <header>
        <h1 className="display text-[60px]">{tab === "items" ? "Wardrobe" : "Outfit diary"}</h1>
        <p className="mt-3 text-[18px]">
          {tab === "items" ? `${activeCount} pieces in rotation` : `${logs.length} outfits logged`}
        </p>
      </header>

      {error && <Alert>{error}</Alert>}

      {tab === "items" && (
        <>
          {items?.length === 0 && (
            <Alert kind="info">Nothing here yet. Log an outfit photo and the pieces will appear here.</Alert>
          )}
          {CATEGORIES.map((cat) => {
            const list = visible.filter((i) => i.category === cat);
            if (!list.length) return null;
            return (
              <section key={cat} className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <h2 className="display text-[32px]">{PLURAL[cat]}</h2>
                  <span className={`rounded-full px-2.5 py-0.5 text-[13px] text-tile-ink ${TINT[cat]}`}>{list.length}</span>
                </div>
                <ul className="grid grid-cols-3 gap-x-3 gap-y-4">
                  {list.map((item) => (
                    <li key={item.id}>
                      <button className="w-full space-y-1.5 text-left" onClick={() => setEditing(item)}>
                        <ItemThumb item={item} className={item.active ? "" : "opacity-40 grayscale"} />
                        <div className="truncate text-[13px] font-medium">{item.name}</div>
                        <div className="text-[12px] text-muted">
                          {item.last_worn_at ? `worn ${shortDate(item.last_worn_at)}` : "not worn yet"} · {item.wear_count}×
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
              {showRetired ? "Hide retired pieces" : "Show retired pieces"}
            </button>
          )}
        </>
      )}

      {tab === "history" && (
        <ul className="space-y-3">
          {logs.length === 0 && <Alert kind="info">No outfits logged yet.</Alert>}
          {logs.map((l, idx) => (
            <li key={l.id} className="card flex gap-4 p-3">
              {l.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.photo_url} alt="" className="h-28 w-20 shrink-0 rounded-[18px] object-cover" />
              ) : (
                <div
                  className={`flex h-28 w-20 shrink-0 items-center justify-center rounded-[18px] ${
                    ["bg-sky", "bg-mustard", "bg-pink", "bg-sage"][idx % 4]
                  }`}
                >
                  <span className="script text-[22px] text-tile-ink">worn!</span>
                </div>
              )}
              <div className="min-w-0 flex-1 py-1">
                <div className="flex items-center justify-between">
                  <span className="display text-[24px]">{shortDate(l.worn_on, true)}</span>
                  <button
                    className="text-[13px] text-muted underline"
                    onClick={async () => {
                      if (!confirm("Delete this outfit log?")) return;
                      await api(`/api/outfits/${l.id}`, { method: "DELETE" });
                      load();
                    }}
                  >
                    delete
                  </button>
                </div>
                <p className="mt-1 text-[14px] leading-snug text-muted">{l.items.map((i) => i.name).join(" · ")}</p>
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

        <label className="block space-y-1.5">
          <span className="label">Name</span>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="block space-y-1.5">
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
