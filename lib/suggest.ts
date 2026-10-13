import "server-only";
import { z } from "zod";
import { hasClaude, structured } from "./claude";
import { addDays, localDate } from "./dates";
import {
  comboKey,
  fallbackOutfit,
  isCompleteOutfit,
  needsOuterwear,
  rankCandidates,
  recentCombos,
  type ScoredItem,
} from "./rotation";
import { db } from "./supabase";
import type { Category, Item, Profile, Suggestion, Weather, WearEntry } from "./types";
import { fetchWeather, isWet } from "./weather";

export async function loadProfile(): Promise<Profile> {
  const { data, error } = await db().from("profile").select("*").eq("id", 1).single();
  if (error) throw error;
  return data as Profile;
}

export async function loadItems(): Promise<Item[]> {
  const { data, error } = await db().from("items").select("*").order("created_at");
  if (error) throw error;
  return data as Item[];
}

/** Confirmed outfits from the last `days` days, newest first. */
export async function loadHistory(today: string, days = 60): Promise<WearEntry[]> {
  const { data, error } = await db()
    .from("outfit_logs")
    .select("worn_on, outfit_log_items(item_id)")
    .eq("status", "confirmed")
    .gte("worn_on", addDays(today, -days))
    .order("worn_on", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((l) => ({
    date: l.worn_on as string,
    itemIds: (l.outfit_log_items as { item_id: string }[]).map((x) => x.item_id),
  }));
}

const Pick = z.object({
  headline: z.string().describe("Max ~8 words, e.g. 'Navy blazer + cream trousers'"),
  item_ids: z.array(z.string()),
  backup_item_ids: z.array(z.string()).describe("A clearly different second option"),
  reasoning: z.string().describe("2-3 friendly sentences: why this works for today's weather and style"),
});

const SYSTEM = `You are a personal stylist choosing today's work outfit from the client's own wardrobe.
Rules:
- Only use item ids from the candidate list.
- A complete outfit = one pair of shoes + (a dress OR one bottom + one top). Add outerwear only when the weather calls for it (at most one). Add 0-2 accessories that suit the look.
- Never stack more than two tops. Two tops is only for real layering: a knit or jumper worn over a collared shirt or tee, the way the client likes it. A cardigan counts as a top.
- Candidates are already filtered for weather and sorted freshest-first (least recently worn). Prefer fresher items unless a fresher one clashes.
- Never repeat any of the "recent outfits" combinations listed.
- Follow the client's style profile closely.`;

function candidateBlock(ranked: Record<Category, ScoredItem[]>): string {
  return (Object.entries(ranked) as [Category, ScoredItem[]][])
    .filter(([, list]) => list.length)
    .map(
      ([cat, list]) =>
        `${cat.toUpperCase()}:\n` +
        list
          .map(
            ({ item, daysSince }) =>
              `- ${item.id} | ${item.name} | ${item.colors.join("/")} | ${item.pattern ?? ""} | formality ${item.formality} | ${
                daysSince === Infinity ? "never logged" : `last worn ${daysSince}d ago`
              }`,
          )
          .join("\n"),
    )
    .join("\n\n");
}

function weatherBlock(w: Weather): string {
  return `${w.summary}, ${Math.round(w.tempMin)}-${Math.round(w.tempMax)}°C (feels ${Math.round(
    w.feelsMin,
  )}-${Math.round(w.feelsMax)}°C), rain chance ${w.precipProbability}%, wind up to ${Math.round(
    w.windMax,
  )} km/h. Season: ${w.season}.${needsOuterwear(w) ? " Outerwear recommended." : ""}${
    isWet(w) ? " Wet day - avoid delicate shoes." : ""
  }`;
}

export interface GenerateOptions {
  /** Item ids to steer away from (e.g. the current suggestion when shuffling). */
  avoid?: string[];
}

export async function generateSuggestion(opts: GenerateOptions = {}): Promise<Suggestion> {
  const profile = await loadProfile();
  if (profile.lat == null || profile.lon == null || !profile.timezone) {
    throw new Error("Set your location in Settings first.");
  }
  const today = localDate(profile.timezone);
  const [items, history, weather] = await Promise.all([
    loadItems(),
    loadHistory(today),
    fetchWeather(profile.lat, profile.lon, profile.timezone, today),
  ]);
  const itemsById = new Map(items.map((i) => [i.id, i]));
  const ranked = rankCandidates(
    items,
    history,
    today,
    weather,
    profile.rotation,
    new Set(opts.avoid ?? []),
  );
  const combos = recentCombos(history, itemsById, today);

  const hasBody = ranked.dress.length > 0 || (ranked.top.length > 0 && ranked.bottom.length > 0);
  if (!hasBody || ranked.shoes.length === 0) {
    throw new Error(
      "Not enough items yet - log a few outfits so I know your tops, bottoms (or dresses) and shoes.",
    );
  }

  const candidateIds = new Set(Object.values(ranked).flat().map((s) => s.item.id));
  const valid = (ids: string[]) =>
    ids.every((id) => candidateIds.has(id)) &&
    isCompleteOutfit(ids, itemsById) &&
    !combos.has(comboKey(ids, itemsById));

  let chosen: string[] | null = null;
  let backup: string[] = [];
  let headline: string | null = null;
  let reasoning: string | null = null;

  if (hasClaude()) {
    try {
      const recent = history
        .slice(0, 14)
        .map((h) => `${h.date}: ${h.itemIds.map((id) => itemsById.get(id)?.name ?? "?").join(", ")}`)
        .join("\n");
      const pick = await structured({
        schema: Pick,
        system: SYSTEM,
        effort: "medium",
        content: [
          {
            type: "text",
            text: `STYLE PROFILE:\n${profile.style_profile?.trim() || "(none yet - choose classic, polished work looks)"}\n\nTODAY (${today}): ${weatherBlock(
              weather,
            )}\n\nRECENT OUTFITS (do not repeat these combinations):\n${recent || "(none)"}\n\nCANDIDATES (id | name | colours | pattern | formality | freshness):\n${candidateBlock(
              ranked,
            )}${opts.avoid?.length ? "\n\nThe client asked for something different from their current suggestion - choose a noticeably different look." : ""}`,
          },
        ],
      });
      headline = pick.headline;
      reasoning = pick.reasoning;
      if (valid(pick.item_ids)) {
        chosen = pick.item_ids;
        backup = valid(pick.backup_item_ids) ? pick.backup_item_ids : [];
      } else if (valid(pick.backup_item_ids)) {
        chosen = pick.backup_item_ids;
        headline = null;
        reasoning = null;
      }
    } catch (err) {
      console.error("Claude suggestion failed, using fallback", err);
    }
  }

  if (!chosen) {
    chosen = fallbackOutfit(ranked, weather, combos, itemsById);
    headline = null;
    reasoning = "Picked your least-recently-worn pieces that suit today's weather.";
  }
  headline ||= chosen.map((id) => itemsById.get(id)?.name).filter(Boolean).slice(0, 3).join(" + ");
  reasoning ||= "A fresh combination of pieces you haven't worn lately that suits today's weather.";

  // Replace any earlier, unworn suggestion for today.
  await db().from("suggestions").delete().eq("for_date", today).eq("status", "suggested");
  const { data, error } = await db()
    .from("suggestions")
    .insert({
      for_date: today,
      item_ids: chosen,
      backup_item_ids: backup,
      headline,
      reasoning,
      weather,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Suggestion;
}
