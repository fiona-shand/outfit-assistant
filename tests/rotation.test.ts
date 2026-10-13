import { describe, expect, it } from "vitest";
import { localDate, localHour } from "@/lib/dates";
import {
  comboKey,
  fallbackOutfit,
  fitsWeather,
  isCompleteOutfit,
  itemStats,
  rankCandidates,
  recentCombos,
  targetWarmth,
} from "@/lib/rotation";
import type { Category, Item, Weather, WearEntry } from "@/lib/types";
import { seasonFor } from "@/lib/weather";

let n = 0;
function item(category: Category, overrides: Partial<Item> = {}): Item {
  n++;
  return {
    id: `${category}-${n}`,
    category,
    name: `${category} ${n}`,
    colors: [],
    pattern: null,
    material: null,
    formality: 3,
    warmth: 3,
    seasons: [],
    description: null,
    thumb_path: null,
    active: true,
    wear_count: 0,
    last_worn_at: null,
    created_at: "2026-01-01",
    ...overrides,
  };
}

const mild: Weather = {
  date: "2026-10-13",
  tempMax: 17,
  tempMin: 11,
  feelsMax: 17,
  feelsMin: 11,
  precipProbability: 10,
  precipSum: 0,
  windMax: 10,
  code: 1,
  summary: "Partly cloudy",
  emoji: "⛅",
  season: "autumn",
};
const today = "2026-10-13";

describe("weather fit", () => {
  it("maps temperature to a warmth target", () => {
    expect(targetWarmth(mild)).toBe(3);
    expect(targetWarmth({ ...mild, feelsMax: 30, feelsMin: 22 })).toBe(1);
    expect(targetWarmth({ ...mild, feelsMax: 3, feelsMin: -4 })).toBe(5);
  });

  it("rejects out-of-season and too-warm items", () => {
    expect(fitsWeather(item("top", { seasons: ["summer"] }), mild)).toBe(false);
    expect(fitsWeather(item("top", { warmth: 5 }), { ...mild, feelsMax: 30, feelsMin: 24 })).toBe(false);
    expect(fitsWeather(item("top", { warmth: 3, seasons: ["autumn"] }), mild)).toBe(true);
  });

  it("keeps suede shoes out of the rain", () => {
    const wet = { ...mild, precipProbability: 80 };
    expect(fitsWeather(item("shoes", { material: "suede" }), wet)).toBe(false);
    expect(fitsWeather(item("shoes", { material: "leather" }), wet)).toBe(true);
  });

  it("flips seasons in the southern hemisphere", () => {
    expect(seasonFor("2026-07-01", 51)).toBe("summer");
    expect(seasonFor("2026-07-01", -33)).toBe("winter");
  });
});

describe("rotation", () => {
  it("tracks days since last wear and recent wear counts", () => {
    const history: WearEntry[] = [
      { date: "2026-10-12", itemIds: ["a"] },
      { date: "2026-10-01", itemIds: ["a", "b"] },
      { date: "2026-08-01", itemIds: ["b"] },
    ];
    const s = itemStats(history, today);
    expect(s.get("a")).toEqual({ daysSince: 1, recentCount: 2 });
    expect(s.get("b")).toEqual({ daysSince: 12, recentCount: 1 });
  });

  it("excludes items worn inside their window and prefers the least recently worn", () => {
    const fresh = item("top");
    const lastWeek = item("top");
    const yesterday = item("top");
    const history: WearEntry[] = [
      { date: "2026-10-12", itemIds: [yesterday.id] },
      { date: "2026-10-06", itemIds: [lastWeek.id] },
    ];
    const ranked = rankCandidates([yesterday, lastWeek, fresh], history, today, mild, { top: 5 });
    expect(ranked.top.map((s) => s.item.id)).toEqual([fresh.id, lastWeek.id]);
  });

  it("falls back to recently worn items rather than leaving a category empty", () => {
    const only = item("shoes");
    const ranked = rankCandidates([only], [{ date: "2026-10-12", itemIds: [only.id] }], today, mild);
    expect(ranked.shoes.map((s) => s.item.id)).toEqual([only.id]);
  });

  it("ignores retired items", () => {
    const retired = item("top", { active: false });
    expect(rankCandidates([retired], [], today, mild).top).toEqual([]);
  });
});

describe("combos", () => {
  const top1 = item("top");
  const top2 = item("top");
  const bottom = item("bottom");
  const shoes = item("shoes");
  const watch = item("accessory");
  const all = [top1, top2, bottom, shoes, watch];
  const byId = new Map(all.map((i) => [i.id, i]));

  it("ignores accessories when comparing outfits", () => {
    expect(comboKey([top1.id, bottom.id, shoes.id, watch.id], byId)).toBe(
      comboKey([shoes.id, bottom.id, top1.id], byId),
    );
  });

  it("validates complete outfits", () => {
    expect(isCompleteOutfit([top1.id, bottom.id, shoes.id], byId)).toBe(true);
    expect(isCompleteOutfit([top1.id, shoes.id], byId)).toBe(false);
    expect(isCompleteOutfit([top1.id, bottom.id, shoes.id, "missing"], byId)).toBe(false);
  });

  it("allows two layered tops but never three", () => {
    const top3 = item("top");
    const map = new Map([...all, top3].map((i) => [i.id, i]));
    expect(isCompleteOutfit([top1.id, top2.id, bottom.id, shoes.id], map)).toBe(true);
    expect(isCompleteOutfit([top1.id, top2.id, top3.id, bottom.id, shoes.id], map)).toBe(false);
  });

  it("rejects two pairs of shoes or a dress with a bottom", () => {
    const shoes2 = item("shoes");
    const dress = item("dress");
    const map = new Map([...all, shoes2, dress].map((i) => [i.id, i]));
    expect(isCompleteOutfit([top1.id, bottom.id, shoes.id, shoes2.id], map)).toBe(false);
    expect(isCompleteOutfit([dress.id, bottom.id, shoes.id], map)).toBe(false);
    expect(isCompleteOutfit([dress.id, shoes.id, watch.id], map)).toBe(true);
  });

  it("fallback avoids repeating a recent combination", () => {
    const history: WearEntry[] = [{ date: "2026-09-20", itemIds: [top1.id, bottom.id, shoes.id] }];
    const combos = recentCombos(history, byId, today);
    const ranked = rankCandidates(all, [], today, mild);
    // Force top1 to rank first so the fallback must skip it.
    ranked.top.sort((a) => (a.item.id === top1.id ? -1 : 1));
    const pick = fallbackOutfit(ranked, mild, combos, byId);
    expect(pick).toContain(top2.id);
    expect(isCompleteOutfit(pick, byId)).toBe(true);
  });
});

describe("dates", () => {
  it("computes local date and hour in a timezone", () => {
    const t = new Date("2026-10-13T21:30:00Z");
    expect(localDate("Australia/Sydney", t)).toBe("2026-10-14");
    expect(localHour("Australia/Sydney", t)).toBe(8);
    expect(localHour("America/New_York", t)).toBe(17);
  });
});
