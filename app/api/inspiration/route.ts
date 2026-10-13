import { hasClaude } from "@/lib/claude";
import { HttpError, route, stripDataUrl } from "@/lib/http";
import { summarizeInspiration } from "@/lib/inspiration";
import { db, signedUrls, uploadImage } from "@/lib/supabase";

export const maxDuration = 90;

export const GET = route(async () => {
  const { data, error } = await db().from("inspiration_images").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  const urls = await signedUrls(data.map((d) => d.path));
  return data.map((d) => ({ id: d.id, summary: d.summary, url: urls[d.path] }));
});

/** Adds one inspiration photo and stores Claude's notes on it. */
export const POST = route(async (req: Request) => {
  if (!hasClaude()) throw new HttpError(500, "ANTHROPIC_API_KEY is not set");
  const { image } = await req.json();
  if (typeof image !== "string") throw new HttpError(400, "Missing photo");
  const base64 = stripDataUrl(image);
  const summary = await summarizeInspiration(base64);
  const path = await uploadImage(`inspiration/${crypto.randomUUID()}.jpg`, base64);
  const { data, error } = await db().from("inspiration_images").insert({ path, summary }).select("id").single();
  if (error) throw error;
  return { id: data.id, summary };
});
