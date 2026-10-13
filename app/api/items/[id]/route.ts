import { route } from "@/lib/http";
import { db, removeImages } from "@/lib/supabase";
import { CATEGORIES, SEASONS } from "@/lib/types";

const clamp = (n: unknown) => Math.min(5, Math.max(1, Math.round(Number(n) || 3)));

export const PATCH = route(async (req: Request, ctx: RouteContext<"/api/items/[id]">) => {
  const { id } = await ctx.params;
  const b = await req.json();
  const update: Record<string, unknown> = {};
  if (typeof b.name === "string" && b.name.trim()) update.name = b.name.trim();
  if (CATEGORIES.includes(b.category)) update.category = b.category;
  if (b.formality !== undefined) update.formality = clamp(b.formality);
  if (b.warmth !== undefined) update.warmth = clamp(b.warmth);
  if (Array.isArray(b.seasons)) update.seasons = b.seasons.filter((s: string) => (SEASONS as readonly string[]).includes(s));
  if (Array.isArray(b.colors)) update.colors = b.colors.map(String);
  if (typeof b.description === "string") update.description = b.description;
  if (typeof b.active === "boolean") update.active = b.active;
  const { error } = await db().from("items").update(update).eq("id", id);
  if (error) throw error;
  return { ok: true };
});

export const DELETE = route(async (_req: Request, ctx: RouteContext<"/api/items/[id]">) => {
  const { id } = await ctx.params;
  const { data } = await db().from("items").select("thumb_path").eq("id", id).single();
  const { error } = await db().from("items").delete().eq("id", id);
  if (error) throw error;
  if (data?.thumb_path) await removeImages([data.thumb_path]);
  await db().rpc("refresh_item_wear");
  return { ok: true };
});
