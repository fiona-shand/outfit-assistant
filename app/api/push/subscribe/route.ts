import { HttpError, route } from "@/lib/http";
import { db } from "@/lib/supabase";

export const POST = route(async (req: Request) => {
  const sub = await req.json();
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) throw new HttpError(400, "Invalid subscription");
  await db().from("profile").update({ push_subscription: sub }).eq("id", 1);
  return { ok: true };
});

export const DELETE = route(async () => {
  await db().from("profile").update({ push_subscription: null }).eq("id", 1);
  return { ok: true };
});
