import { localDate, localHour } from "@/lib/dates";
import { HttpError, route } from "@/lib/http";
import { sendPush } from "@/lib/push";
import { generateSuggestion, loadProfile } from "@/lib/suggest";
import { db } from "@/lib/supabase";
import { weatherLine } from "@/lib/weather";

export const maxDuration = 120;

const SEND_FROM_HOUR = 7;
const SEND_UNTIL_HOUR = 11; // catch up if earlier runs were missed

/**
 * Called every 15 minutes by Supabase pg_cron. Does the morning suggestion once per
 * local day, at the first call at or after 7 a.m. `?force=1` runs it immediately.
 */
const handler = route(async (req: Request) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    throw new HttpError(401, "Unauthorized");
  }
  const force = new URL(req.url).searchParams.get("force") === "1";
  const profile = await loadProfile();
  if (!profile.timezone || profile.lat == null) return { skipped: "no location set" };

  const today = localDate(profile.timezone);
  const hour = localHour(profile.timezone);
  if (!force) {
    if (hour < SEND_FROM_HOUR || hour >= SEND_UNTIL_HOUR) return { skipped: `local hour is ${hour}` };
    if (profile.last_daily_run === today) return { skipped: "already ran today" };
  }
  // Claim the day first so overlapping calls don't double-send.
  await db().from("profile").update({ last_daily_run: today }).eq("id", 1);

  let suggestion;
  try {
    suggestion = await generateSuggestion();
  } catch (err) {
    // Release the claim so the next 15-minute run retries.
    await db().from("profile").update({ last_daily_run: profile.last_daily_run }).eq("id", 1);
    throw err;
  }
  let pushed = false;
  if (profile.push_subscription) {
    pushed = await sendPush(profile.push_subscription, {
      title: suggestion.weather ? weatherLine(suggestion.weather) : "Today's outfit",
      body: suggestion.headline ?? "Your outfit for today is ready",
      url: "/",
    });
  }
  return { ok: true, suggestion_id: suggestion.id, pushed };
});

export const GET = handler;
export const POST = handler;
