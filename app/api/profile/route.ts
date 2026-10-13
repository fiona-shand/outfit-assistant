import { HttpError, route } from "@/lib/http";
import { loadProfile } from "@/lib/suggest";
import { db } from "@/lib/supabase";
import { CATEGORIES } from "@/lib/types";

export const GET = route(async () => {
  const p = await loadProfile();
  return { ...p, push_subscription: undefined, has_push: !!p.push_subscription };
});

export const PATCH = route(async (req: Request) => {
  const body = await req.json();
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.lat === "number" && typeof body.lon === "number") {
    update.lat = body.lat;
    update.lon = body.lon;
  }
  if (typeof body.timezone === "string") {
    try {
      new Intl.DateTimeFormat("en", { timeZone: body.timezone });
    } catch {
      throw new HttpError(400, "Unknown timezone");
    }
    update.timezone = body.timezone;
  }
  if (typeof body.style_profile === "string") update.style_profile = body.style_profile;
  if (body.rotation && typeof body.rotation === "object") {
    const rotation: Record<string, number> = {};
    for (const c of CATEGORIES) {
      const n = Number(body.rotation[c]);
      if (Number.isFinite(n) && n >= 0 && n <= 60) rotation[c] = Math.round(n);
    }
    update.rotation = rotation;
  }
  const { error } = await db().from("profile").update(update).eq("id", 1);
  if (error) throw error;
  return { ok: true };
});
