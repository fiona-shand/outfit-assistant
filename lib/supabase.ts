import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Server-side Supabase client using the service-role key (bypasses RLS). */
export function db(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

const BUCKET = "photos";

export async function uploadImage(path: string, base64: string, contentType = "image/jpeg") {
  const { error } = await db()
    .storage.from(BUCKET)
    .upload(path, Buffer.from(base64, "base64"), { contentType, upsert: true });
  if (error) throw error;
  return path;
}

export async function downloadImageBase64(path: string): Promise<string> {
  const { data, error } = await db().storage.from(BUCKET).download(path);
  if (error) throw error;
  return Buffer.from(await data.arrayBuffer()).toString("base64");
}

export async function removeImages(paths: string[]) {
  if (paths.length) await db().storage.from(BUCKET).remove(paths);
}

/** Signed URLs (1 hour) for a set of storage paths. */
export async function signedUrls(paths: (string | null | undefined)[]): Promise<Record<string, string>> {
  const unique = [...new Set(paths.filter((p): p is string => !!p))];
  if (unique.length === 0) return {};
  const { data, error } = await db().storage.from(BUCKET).createSignedUrls(unique, 3600);
  if (error) throw error;
  const out: Record<string, string> = {};
  for (const d of data) if (d.path && d.signedUrl) out[d.path] = d.signedUrl;
  return out;
}
