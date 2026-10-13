import { HttpError, route } from "@/lib/http";
import { db, removeImages } from "@/lib/supabase";

/** Log a suggestion as worn today (no photo). Body: { suggestion_id, use_backup? } */
export const POST = route(async (req: Request) => {
  const { suggestion_id, use_backup } = await req.json();
  const { data: s } = await db().from("suggestions").select("*").eq("id", suggestion_id).single();
  if (!s) throw new HttpError(404, "Suggestion not found");
  const ids: string[] = use_backup && s.backup_item_ids?.length ? s.backup_item_ids : s.item_ids;

  const { data: existing } = await db().from("outfit_logs").select("id, photo_path").eq("worn_on", s.for_date);
  if (existing?.length) {
    await db().from("outfit_logs").delete().in("id", existing.map((e) => e.id));
    await removeImages(existing.map((e) => e.photo_path).filter(Boolean));
  }
  const { data: log, error } = await db()
    .from("outfit_logs")
    .insert({ worn_on: s.for_date, status: "confirmed" })
    .select("id")
    .single();
  if (error) throw error;
  await db().from("outfit_log_items").insert(ids.map((item_id) => ({ log_id: log.id, item_id })));
  await db().from("suggestions").update({ status: "worn" }).eq("id", s.id);
  await db().rpc("refresh_item_wear");
  return { ok: true };
});
