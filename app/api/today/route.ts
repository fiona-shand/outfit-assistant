import { localDate } from "@/lib/dates";
import { route } from "@/lib/http";
import { loadProfile } from "@/lib/suggest";
import { db, signedUrls } from "@/lib/supabase";
import type { Item, Suggestion } from "@/lib/types";

/** Today's suggestion (if any) with its items and thumbnails. */
export const GET = route(async () => {
  const profile = await loadProfile();
  const today = localDate(profile.timezone ?? "UTC");
  const { data } = await db()
    .from("suggestions")
    .select("*")
    .eq("for_date", today)
    .order("created_at", { ascending: false })
    .limit(1);
  const suggestion = (data?.[0] as Suggestion | undefined) ?? null;

  const ids = suggestion ? [...suggestion.item_ids, ...suggestion.backup_item_ids] : [];
  let items: (Item & { thumb_url: string | null })[] = [];
  if (ids.length) {
    const { data: rows } = await db().from("items").select("*").in("id", ids);
    const urls = await signedUrls((rows ?? []).map((r) => r.thumb_path));
    items = (rows ?? []).map((r) => ({ ...r, thumb_url: r.thumb_path ? urls[r.thumb_path] : null }));
  }
  const { count } = await db().from("items").select("id", { count: "exact", head: true });
  return {
    today,
    has_location: profile.lat != null && !!profile.timezone,
    item_count: count ?? 0,
    suggestion,
    items,
  };
});
