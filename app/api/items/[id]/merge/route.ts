import { HttpError, route } from "@/lib/http";
import { db, removeImages } from "@/lib/supabase";

/** Merge item `id` (a duplicate) into `into`: move its wear history, then delete it. */
export const POST = route(async (req: Request, ctx: RouteContext<"/api/items/[id]/merge">) => {
  const { id } = await ctx.params;
  const { into } = await req.json();
  if (typeof into !== "string" || into === id) throw new HttpError(400, "Choose a different item to merge into");

  const { data: links, error } = await db().from("outfit_log_items").select("log_id").eq("item_id", id);
  if (error) throw error;
  if (links.length) {
    const { error: upErr } = await db()
      .from("outfit_log_items")
      .upsert(links.map((l) => ({ log_id: l.log_id, item_id: into })), { ignoreDuplicates: true });
    if (upErr) throw upErr;
  }
  const { data: dup } = await db().from("items").select("thumb_path").eq("id", id).single();
  const { data: target } = await db().from("items").select("thumb_path").eq("id", into).single();
  if (!target) throw new HttpError(404, "Target item not found");
  if (!target.thumb_path && dup?.thumb_path) {
    await db().from("items").update({ thumb_path: dup.thumb_path }).eq("id", into);
  } else if (dup?.thumb_path) {
    await removeImages([dup.thumb_path]);
  }
  await db().from("items").delete().eq("id", id);
  await db().rpc("refresh_item_wear");
  return { ok: true };
});
