import { HttpError, route } from "@/lib/http";
import { sendPush } from "@/lib/push";
import { loadProfile } from "@/lib/suggest";

export const POST = route(async () => {
  const p = await loadProfile();
  if (!p.push_subscription) throw new HttpError(400, "Notifications aren't enabled on this device yet");
  const ok = await sendPush(p.push_subscription, {
    title: "Outfit Assistant",
    body: "Notifications are working. See you at 7 a.m. 👗",
    url: "/",
  });
  if (!ok) throw new HttpError(410, "This device's subscription expired - enable notifications again");
  return { ok: true };
});
