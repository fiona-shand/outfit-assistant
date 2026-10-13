import { HttpError, route, stripDataUrl } from "@/lib/http";
import { db, removeImages, uploadImage } from "@/lib/supabase";
import { CATEGORIES, SEASONS } from "@/lib/types";

export const maxDuration = 60;

interface NewItem {
  category: string;
  name: string;
  colors?: string[];
  pattern?: string;
  material?: string;
  formality?: number;
  warmth?: number;
  seasons?: string[];
  description?: string;
}

type Decision = { existing_id: string; thumb?: string } | { new: NewItem; thumb?: string };

const clamp = (n: unknown) => Math.min(5, Math.max(1, Math.round(Number(n) || 3)));

/**
 * Finalises a reviewed photo log: creates new items (with cropped thumbnails),
 * links all items to the log, and makes it the single log for that date.
 */
export const POST = route(async (req: Request) => {
  const { log_id, items } = (await req.json()) as { log_id: string; items: Decision[] };
  if (!log_id || !Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, "Nothing to save");
  }
  const { data: log, error: logErr } = await db().from("outfit_logs").select("*").eq("id", log_id).single();
  if (logErr || !log) throw new HttpError(404, "Outfit not found");

  const itemIds = new Set<string>();
  for (const d of items) {
    if ("existing_id" in d) {
      itemIds.add(d.existing_id);
      if (d.thumb) {
        // Give existing items a thumbnail from this photo if they have none, or only a seed image.
        const { data: existing } = await db().from("items").select("thumb_path").eq("id", d.existing_id).single();
        if (existing && (!existing.thumb_path || existing.thumb_path.startsWith("/"))) {
          const path = await uploadImage(`items/${d.existing_id}.jpg`, stripDataUrl(d.thumb));
          await db().from("items").update({ thumb_path: path }).eq("id", d.existing_id);
        }
      }
      continue;
    }
    const n = d.new;
    if (!CATEGORIES.includes(n.category as (typeof CATEGORIES)[number])) continue;
    const { data: created, error } = await db()
      .from("items")
      .insert({
        category: n.category,
        name: n.name?.trim() || n.category,
        colors: n.colors ?? [],
        pattern: n.pattern ?? null,
        material: n.material ?? null,
        formality: clamp(n.formality),
        warmth: clamp(n.warmth),
        seasons: (n.seasons ?? []).filter((s) => (SEASONS as readonly string[]).includes(s)),
        description: n.description ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;
    if (d.thumb) {
      const path = await uploadImage(`items/${created.id}.jpg`, stripDataUrl(d.thumb));
      await db().from("items").update({ thumb_path: path }).eq("id", created.id);
    }
    itemIds.add(created.id);
  }

  // One log per day: replace whatever was logged for this date before.
  const { data: others } = await db()
    .from("outfit_logs")
    .select("id, photo_path")
    .eq("worn_on", log.worn_on)
    .neq("id", log_id);
  if (others?.length) {
    await db().from("outfit_logs").delete().in("id", others.map((o) => o.id));
    await removeImages(others.map((o) => o.photo_path).filter(Boolean));
  }

  await db().from("outfit_log_items").delete().eq("log_id", log_id);
  const { error: linkErr } = await db()
    .from("outfit_log_items")
    .insert([...itemIds].map((item_id) => ({ log_id, item_id })));
  if (linkErr) throw linkErr;
  await db().from("outfit_logs").update({ status: "confirmed" }).eq("id", log_id);
  await db().from("suggestions").update({ status: "worn" }).eq("for_date", log.worn_on).eq("status", "suggested");
  await db().rpc("refresh_item_wear");
  return { ok: true, item_count: itemIds.size };
});
