import "server-only";
import webpush, { WebPushError } from "web-push";
import { db } from "./supabase";
import type { PushSubscriptionJSON } from "./types";

let configured = false;

function configure() {
  if (configured) return;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) throw new Error("VAPID keys are not configured");
  webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? "mailto:me@example.com", pub, priv);
  configured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/** Sends a push; clears the stored subscription if the browser has revoked it. */
export async function sendPush(sub: PushSubscriptionJSON, payload: PushPayload): Promise<boolean> {
  configure();
  try {
    await webpush.sendNotification(sub, JSON.stringify(payload));
    return true;
  } catch (err) {
    if (err instanceof WebPushError && (err.statusCode === 404 || err.statusCode === 410)) {
      await db().from("profile").update({ push_subscription: null }).eq("id", 1);
      return false;
    }
    throw err;
  }
}
