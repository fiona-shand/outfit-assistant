"use client";

import { useCallback, useState } from "react";
import EditItemSheet from "@/components/EditItemSheet";
import { Alert, Brand, ItemThumb, TINT, UnderlineTabs } from "@/components/ui";
import { api, CATEGORY_PLURAL, useOnMount } from "@/lib/client";
import { CATEGORIES, type Item } from "@/lib/types";

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
        {tab === "items" && (
          <p className="mt-1 text-[14px] text-muted">Tap any piece to change its type, name or warmth.</p>
        )}
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
                  <h2 className="display text-[32px]">{CATEGORY_PLURAL[cat]}</h2>
                  <span className={`rounded-full px-2.5 py-0.5 text-[13px] text-tile-ink ${TINT[cat]}`}>{list.length}</span>
                </div>
                <ul className="grid grid-cols-3 gap-x-3 gap-y-4">
                  {list.map((item) => (
                    <li key={item.id}>
                      <button className="w-full space-y-1.5 text-left" onClick={() => setEditing(item)}>
                        <div className="relative">
                          <ItemThumb item={item} className={item.active ? "" : "opacity-40 grayscale"} />
                          <span className="absolute right-1.5 top-1.5 rounded-full bg-card/90 px-2 py-0.5 text-[11px] font-medium text-ink shadow-sm">
                            edit
                          </span>
                        </div>
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
        <EditItemSheet
          item={editing}
          others={(items ?? []).filter((i) => i.id !== editing.id && i.category === editing.category)}
          onClose={() => setEditing(null)}
          onChanged={load}
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
