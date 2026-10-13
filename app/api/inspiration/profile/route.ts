import { HttpError, route } from "@/lib/http";
import { buildStyleProfile } from "@/lib/inspiration";
import { db } from "@/lib/supabase";

export const maxDuration = 120;

/** Rebuilds the style profile from every inspiration photo's notes. */
export const POST = route(async () => {
  const { data, error } = await db().from("inspiration_images").select("summary").order("created_at");
  if (error) throw error;
  const summaries = data.map((d) => d.summary).filter((s): s is string => !!s);
  if (summaries.length === 0) throw new HttpError(400, "Add some inspiration photos first");
  const style_profile = await buildStyleProfile(summaries);
  await db().from("profile").update({ style_profile, updated_at: new Date().toISOString() }).eq("id", 1);
  return { style_profile };
});
