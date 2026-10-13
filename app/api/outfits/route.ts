import { route } from "@/lib/http";
import { db, signedUrls } from "@/lib/supabase";

/** Recent confirmed outfits, newest first. */
export const GET = route(async () => {
  const { data, error } = await db()
    .from("outfit_logs")
    .select("id, worn_on, photo_path, outfit_log_items(items(id, name, category))")
    .eq("status", "confirmed")
    .order("worn_on", { ascending: false })
    .limit(30);
  if (error) throw error;
  const urls = await signedUrls(data.map((l) => l.photo_path));
  return data.map((l) => ({
    id: l.id,
    worn_on: l.worn_on,
    photo_url: l.photo_path ? urls[l.photo_path] : null,
    items: (l.outfit_log_items as unknown as { items: { id: string; name: string; category: string } | null }[])
      .map((x) => x.items)
      .filter(Boolean),
  }));
});
