import { route } from "@/lib/http";
import { loadItems } from "@/lib/suggest";
import { signedUrls } from "@/lib/supabase";

export const GET = route(async () => {
  const items = await loadItems();
  const urls = await signedUrls(items.map((i) => i.thumb_path));
  return items.map((i) => ({ ...i, thumb_url: i.thumb_path ? urls[i.thumb_path] : null }));
});
