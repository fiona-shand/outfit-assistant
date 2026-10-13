export const CATEGORIES = [
  "top",
  "bottom",
  "dress",
  "shoes",
  "outerwear",
  "accessory",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const SEASONS = ["spring", "summer", "autumn", "winter"] as const;
export type Season = (typeof SEASONS)[number];

export interface Item {
  id: string;
  category: Category;
  name: string;
  colors: string[];
  pattern: string | null;
  material: string | null;
  formality: number;
  warmth: number;
  seasons: string[];
  description: string | null;
  thumb_path: string | null;
  active: boolean;
  wear_count: number;
  last_worn_at: string | null;
  created_at: string;
}

export interface Profile {
  id: number;
  lat: number | null;
  lon: number | null;
  timezone: string | null;
  push_subscription: PushSubscriptionJSON | null;
  style_profile: string | null;
  rotation: Record<Category, number>;
  last_daily_run: string | null;
}

export interface PushSubscriptionJSON {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface Weather {
  date: string;
  tempMax: number;
  tempMin: number;
  feelsMax: number;
  feelsMin: number;
  precipProbability: number;
  precipSum: number;
  windMax: number;
  code: number;
  summary: string;
  emoji: string;
  season: Season;
}

/** One past outfit: which items were worn on which date (YYYY-MM-DD). */
export interface WearEntry {
  date: string;
  itemIds: string[];
}

export interface Suggestion {
  id: string;
  for_date: string;
  item_ids: string[];
  backup_item_ids: string[];
  headline: string | null;
  reasoning: string | null;
  weather: Weather | null;
  status: "suggested" | "worn" | "skipped";
  created_at: string;
}
