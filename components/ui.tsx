import { CATEGORY_LABEL } from "@/lib/client";
import { Heart } from "./Icons";

export const TINT: Record<string, string> = {
  top: "bg-sky",
  bottom: "bg-mustard",
  dress: "bg-pink",
  shoes: "bg-sage",
  outerwear: "bg-pink",
  accessory: "bg-mustard",
};

/** Brand row shown at the top of each page. */
export function Brand({ right }: { right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Heart className="h-7 w-7 -rotate-6 text-ink" />
        <span className="display text-[28px]">Outfits</span>
      </div>
      {right}
    </div>
  );
}

export function PageTitle({ kicker, title, sub }: { kicker?: string; title: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <header className="pt-4">
      <h1 className="display text-[56px]">{title}</h1>
      {kicker && <p className="mt-2 text-[17px]">{kicker}</p>}
      {sub && <p className="mt-2 text-[15px] text-muted">{sub}</p>}
    </header>
  );
}

/** Text tabs with a thick underline on the active one. */
export function UnderlineTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { value: T; label: string; badge?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-7 border-b-[1.5px] border-line">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`-mb-[1.5px] flex items-center gap-2 border-b-[3px] pb-3 text-[18px] font-medium ${
            value === t.value ? "border-ink text-ink" : "border-transparent text-muted"
          }`}
        >
          {t.label}
          {t.badge ? (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-1.5 text-[13px] text-accent-ink">
              {t.badge}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export function Alert({ kind = "error", children }: { kind?: "error" | "ok" | "info"; children: React.ReactNode }) {
  const styles = {
    error: "bg-accent/12 text-accent",
    ok: "bg-sage/40 text-ink",
    info: "bg-soft text-ink",
  }[kind];
  return <div className={`rounded-2xl px-4 py-3 text-[15px] ${styles}`}>{children}</div>;
}

/** Square photo tile for a wardrobe item, tinted by category when there's no photo. */
export function ItemThumb({
  item,
  className = "",
}: {
  item: { name: string; category: string; thumb_url?: string | null };
  className?: string;
}) {
  return (
    <div className={`aspect-square overflow-hidden rounded-[22px] ${TINT[item.category] ?? "bg-soft"} ${className}`}>
      {item.thumb_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.thumb_url} alt={item.name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center px-2 text-center display text-xl text-tile-ink/70">
          {CATEGORY_LABEL[item.category]}
        </div>
      )}
    </div>
  );
}
