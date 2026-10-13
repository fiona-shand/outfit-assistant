import { daysBetween } from "./dates";
import type { Category, Item, Weather, WearEntry } from "./types";
import { isWet } from "./weather";

/** Pure scoring/filtering logic for picking fresh, weather-appropriate items. */

export const DEFAULT_WINDOWS: Record<Category, number> = {
  top: 5,
  bottom: 3,
  dress: 5,
  shoes: 3,
  outerwear: 2,
  accessory: 2,
};

const CANDIDATES_PER_CATEGORY: Record<Category, number> = {
  top: 8,
  bottom: 6,
  dress: 5,
  shoes: 5,
  outerwear: 4,
  accessory: 8,
};

/** Items whose full core combo (top/bottom/dress/shoes) defines "the same outfit". */
const CORE: Category[] = ["top", "bottom", "dress", "shoes"];

const WET_UNFRIENDLY = /suede|sandal|open[- ]?toe|espadrille|canvas|satin|silk/i;

/** Ideal warmth (1 = lightest, 5 = warmest) for the day's average feels-like temperature. */
export function targetWarmth(w: Weather): number {
  const t = (w.feelsMax + w.feelsMin) / 2;
  if (t >= 24) return 1;
  if (t >= 18) return 2;
  if (t >= 12) return 3;
  if (t >= 5) return 4;
  return 5;
}

export function needsOuterwear(w: Weather): boolean {
  return (w.feelsMax + w.feelsMin) / 2 < 16 || isWet(w) || w.windMax >= 35;
}

export function fitsWeather(item: Item, w: Weather): boolean {
  const seasonOk =
    item.seasons.length === 0 ||
    item.seasons.includes(w.season) ||
    item.seasons.includes("all");
  if (!seasonOk) return false;

  const text = `${item.name} ${item.material ?? ""} ${item.description ?? ""}`;
  if (isWet(w) && (item.category === "shoes" || item.category === "outerwear") && WET_UNFRIENDLY.test(text)) {
    return false;
  }

  if (item.category === "accessory") return true;
  const tolerance = item.category === "shoes" ? 2 : 1;
  if (item.category === "outerwear") return item.warmth >= targetWarmth(w) - 1;
  return Math.abs(item.warmth - targetWarmth(w)) <= tolerance;
}

export interface ItemStats {
  daysSince: number; // Infinity if never worn
  recentCount: number; // wears in the last 30 days
}

export function itemStats(history: WearEntry[], today: string): Map<string, ItemStats> {
  const stats = new Map<string, ItemStats>();
  for (const entry of history) {
    const age = daysBetween(entry.date, today);
    if (age < 0) continue;
    for (const id of entry.itemIds) {
      const s = stats.get(id) ?? { daysSince: Infinity, recentCount: 0 };
      s.daysSince = Math.min(s.daysSince, age);
      if (age <= 30) s.recentCount += 1;
      stats.set(id, s);
    }
  }
  return stats;
}

/** Higher = fresher. Long-unworn items score high; frequently worn items are penalised. */
export function freshnessScore(s: ItemStats | undefined): number {
  if (!s) return 60;
  return Math.min(s.daysSince, 60) - 3 * s.recentCount;
}

export interface ScoredItem {
  item: Item;
  score: number;
  daysSince: number;
}

/**
 * Weather-appropriate, freshest candidates per category. Items worn within the
 * category's rotation window are excluded unless that would leave nothing.
 */
export function rankCandidates(
  items: Item[],
  history: WearEntry[],
  today: string,
  weather: Weather,
  windows: Partial<Record<Category, number>> = {},
  excludeIds: Set<string> = new Set(),
): Record<Category, ScoredItem[]> {
  const stats = itemStats(history, today);
  const result = {} as Record<Category, ScoredItem[]>;

  for (const category of Object.keys(CANDIDATES_PER_CATEGORY) as Category[]) {
    const window = windows[category] ?? DEFAULT_WINDOWS[category];
    const pool = items.filter((i) => i.active && i.category === category);
    let fitting = pool.filter((i) => fitsWeather(i, weather));
    // Never leave a category empty because of weather alone.
    if (fitting.length === 0) fitting = pool;

    const scored = fitting
      .map((item) => {
        const s = stats.get(item.id);
        return {
          item,
          score: freshnessScore(s) - (excludeIds.has(item.id) ? 100 : 0),
          daysSince: s?.daysSince ?? Infinity,
        };
      })
      .sort((a, b) => b.score - a.score);

    const rested = scored.filter((s) => s.daysSince >= window && !excludeIds.has(s.item.id));
    const chosen = rested.length > 0 ? rested : scored;
    result[category] = chosen.slice(0, CANDIDATES_PER_CATEGORY[category]);
  }
  return result;
}

export function comboKey(itemIds: string[], itemsById: Map<string, Item>): string {
  return itemIds
    .filter((id) => {
      const c = itemsById.get(id)?.category;
      return c !== undefined && CORE.includes(c);
    })
    .sort()
    .join("|");
}

export function recentCombos(
  history: WearEntry[],
  itemsById: Map<string, Item>,
  today: string,
  days = 30,
): Set<string> {
  const keys = new Set<string>();
  for (const entry of history) {
    const age = daysBetween(entry.date, today);
    if (age >= 0 && age <= days) keys.add(comboKey(entry.itemIds, itemsById));
  }
  keys.delete("");
  return keys;
}

/**
 * A wearable outfit: one pair of shoes and either a dress or a single bottom with
 * 1-2 tops (two only when layering, e.g. a knit over a collared shirt), at most one
 * outer layer and at most two accessories.
 */
export function isCompleteOutfit(itemIds: string[], itemsById: Map<string, Item>): boolean {
  const count: Partial<Record<Category, number>> = {};
  for (const id of itemIds) {
    const c = itemsById.get(id)?.category;
    if (!c) return false;
    count[c] = (count[c] ?? 0) + 1;
  }
  const n = (c: Category) => count[c] ?? 0;
  if (n("shoes") !== 1 || n("outerwear") > 1 || n("accessory") > 2 || n("top") > 2 || n("bottom") > 1) return false;
  return n("dress") === 1 ? n("bottom") === 0 : n("dress") === 0 && n("top") >= 1 && n("bottom") === 1;
}

/**
 * Deterministic fallback: freshest item in each needed category, trying lower-ranked
 * tops/bottoms until the combo isn't a recent repeat.
 */
export function fallbackOutfit(
  ranked: Record<Category, ScoredItem[]>,
  weather: Weather,
  combos: Set<string>,
  itemsById: Map<string, Item>,
): string[] {
  const shoes = ranked.shoes[0]?.item.id;
  const extras: string[] = [];
  if (needsOuterwear(weather) && ranked.outerwear[0]) extras.push(ranked.outerwear[0].item.id);
  if (ranked.accessory[0]) extras.push(ranked.accessory[0].item.id);

  const options: string[][] = [];
  for (const t of ranked.top) {
    for (const b of ranked.bottom) options.push([t.item.id, b.item.id]);
  }
  for (const d of ranked.dress) options.push([d.item.id]);

  for (const body of options) {
    const ids = [...body, ...(shoes ? [shoes] : [])];
    if (!combos.has(comboKey(ids, itemsById))) return [...ids, ...extras];
  }
  return options[0] ? [...options[0], ...(shoes ? [shoes] : []), ...extras] : extras;
}
