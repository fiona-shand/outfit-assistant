import { NextResponse } from "next/server";
import { db, keyRole } from "@/lib/supabase";

/** Setup check: open /api/health in a browser to see what's configured. Reveals no secrets. */
export async function GET() {
  const url = process.env.SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const report: Record<string, unknown> = {
    supabase_url: url ? url.replace(/^https?:\/\//, "").split("/")[0] : "MISSING",
    supabase_key: key ? keyRole(key) : "MISSING",
    anthropic_key: process.env.ANTHROPIC_API_KEY ? "set" : "MISSING",
    push_keys: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY ? "set" : "missing",
    cron_secret: process.env.CRON_SECRET ? "set" : "missing",
  };
  try {
    const client = db();
    const [items, logs, profile] = await Promise.all([
      client.from("items").select("id", { count: "exact", head: true }),
      client.from("outfit_logs").select("id", { count: "exact", head: true }),
      client.from("profile").select("lat, timezone, style_profile").eq("id", 1).maybeSingle(),
    ]);
    for (const r of [items, logs, profile]) if (r.error) throw r.error;
    report.items = items.count;
    report.outfits = logs.count;
    report.location = profile.data?.timezone ? `set (${profile.data.timezone})` : "not set yet";
    report.style_notes = profile.data?.style_profile ? "loaded" : "empty";
    report.ok = true;
  } catch (e) {
    report.ok = false;
    report.error = e instanceof Error ? e.message : (e as { message?: string }).message ?? String(e);
  }
  return NextResponse.json(report);
}
