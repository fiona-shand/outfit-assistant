import { route } from "@/lib/http";
import { db, removeImages } from "@/lib/supabase";

export const DELETE = route(async (_req: Request, ctx: RouteContext<"/api/inspiration/[id]">) => {
  const { id } = await ctx.params;
  const { data } = await db().from("inspiration_images").select("path").eq("id", id).single();
  await db().from("inspiration_images").delete().eq("id", id);
  if (data?.path) await removeImages([data.path]);
  return { ok: true };
});
