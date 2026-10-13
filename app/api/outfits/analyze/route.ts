import { analyzeOutfit } from "@/lib/analyze";
import { hasClaude } from "@/lib/claude";
import { localDate } from "@/lib/dates";
import { HttpError, route, stripDataUrl } from "@/lib/http";
import { loadItems, loadProfile } from "@/lib/suggest";
import { db, signedUrls, uploadImage } from "@/lib/supabase";

export const maxDuration = 120;

/** Stores the photo, asks Claude to catalog it, and returns a pending log for review. */
export const POST = route(async (req: Request) => {
  if (!hasClaude()) throw new HttpError(500, "ANTHROPIC_API_KEY is not set");
  const { image, worn_on } = await req.json();
  if (typeof image !== "string" || image.length < 100) throw new HttpError(400, "Missing photo");
  const base64 = stripDataUrl(image);

  const profile = await loadProfile();
  const date =
    typeof worn_on === "string" && /^\d{4}-\d{2}-\d{2}$/.test(worn_on)
      ? worn_on
      : localDate(profile.timezone ?? "UTC");

  const items = await loadItems();
  const analysis = await analyzeOutfit(base64, items);

  const path = `outfits/${date}-${crypto.randomUUID()}.jpg`;
  await uploadImage(path, base64);
  const { data: log, error } = await db()
    .from("outfit_logs")
    .insert({ worn_on: date, photo_path: path, analysis })
    .select("id")
    .single();
  if (error) throw error;

  const urls = await signedUrls([path]);
  return { log_id: log.id, worn_on: date, photo_url: urls[path], analysis };
});
