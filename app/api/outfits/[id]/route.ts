import { route } from "@/lib/http";
import { db, removeImages } from "@/lib/supabase";

export const DELETE = route(async (_req: Request, ctx: RouteContext<"/api/outfits/[id]">) => {
  const { id } = await ctx.params;
  const { data } = await db().from("outfit_logs").select("photo_path").eq("id", id).single();
  const { error } = await db().from("outfit_logs").delete().eq("id", id);
  if (error) throw error;
  if (data?.photo_path) await removeImages([data.photo_path]);
  await db().rpc("refresh_item_wear");
  return { ok: true };
});
