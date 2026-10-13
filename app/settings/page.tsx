"use client";

import { useState } from "react";
import { api, CATEGORY_LABEL, urlBase64ToUint8Array, useOnMount } from "@/lib/client";
import { CATEGORIES, type Category } from "@/lib/types";

interface ProfileData {
  lat: number | null;
  lon: number | null;
  timezone: string | null;
  rotation: Record<Category, number>;
  has_push: boolean;
}

export default function SettingsPage() {
  const [p, setP] = useState<ProfileData | null>(null);
  const [rotation, setRotation] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [pushSupported, setPushSupported] = useState(true);

  async function load() {
    const data = await api<ProfileData>("/api/profile");
    setP(data);
    setRotation(data.rotation);
  }

  useOnMount(() => {
    load().catch((e) => setError(e.message));
    setPushSupported("serviceWorker" in navigator && "PushManager" in window && "Notification" in window);
  });

  async function run(label: string, fn: () => Promise<string | void>) {
    setBusy(label);
    setMsg(null);
    setError(null);
    try {
      const m = await fn();
      if (m) setMsg(m);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function saveLocation() {
    return run(
      "loc",
      () =>
        new Promise<string>((resolve, reject) => {
          if (!("geolocation" in navigator)) return reject(new Error("Location isn't available on this device"));
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              try {
                await api("/api/profile", {
                  method: "PATCH",
                  body: {
                    // ~1 km precision is plenty for weather.
                    lat: Math.round(pos.coords.latitude * 100) / 100,
                    lon: Math.round(pos.coords.longitude * 100) / 100,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  },
                });
                resolve("Location saved.");
              } catch (e) {
                reject(e);
              }
            },
            (err) => reject(new Error(err.message || "Couldn't get your location")),
            { timeout: 15000 },
          );
        }),
    );
  }

  function enablePush() {
    return run("push", async () => {
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!key) throw new Error("NEXT_PUBLIC_VAPID_PUBLIC_KEY isn't configured");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error("Notifications were blocked. Allow them in your phone settings.");
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
      await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      const sub =
        existing ??
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) }));
      await api("/api/push/subscribe", { body: sub.toJSON() });
      return "Notifications enabled on this device.";
    });
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold">Settings</h1>
      </header>

      {msg && <p className="rounded-xl bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">{msg}</p>}
      {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p>}

      <section className="card space-y-3 p-4">
        <h2 className="font-semibold">📍 Location</h2>
        <p className="text-sm text-muted">
          {p?.lat != null
            ? `Using ${p.lat.toFixed(2)}, ${p.lon?.toFixed(2)} · ${p.timezone}. Updates automatically when you open the app.`
            : "Needed for the weather forecast and to send your suggestion at 7 a.m. your time."}
        </p>
        <button className="btn-primary" disabled={!!busy} onClick={saveLocation}>
          {busy === "loc" ? "Locating…" : p?.lat != null ? "Update location" : "Use my location"}
        </button>
      </section>

      <section className="card space-y-3 p-4">
        <h2 className="font-semibold">🔔 7 a.m. notification</h2>
        {!pushSupported ? (
          <p className="text-sm text-muted">
            This browser can&apos;t receive notifications. On iPhone: tap Share → <b>Add to Home Screen</b>, open the
            app from your home screen, then come back here.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted">
              {p?.has_push ? "Enabled. You'll get your outfit every morning." : "Not enabled yet."}
            </p>
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary" disabled={!!busy} onClick={enablePush}>
                {p?.has_push ? "Re-enable on this device" : "Enable notifications"}
              </button>
              {p?.has_push && (
                <button
                  className="btn-ghost"
                  disabled={!!busy}
                  onClick={() => run("test", async () => (await api("/api/push/test", { body: {} }), "Test sent."))}
                >
                  {busy === "test" ? "Sending…" : "Send test"}
                </button>
              )}
            </div>
          </>
        )}
      </section>

      <section className="card space-y-3 p-4">
        <h2 className="font-semibold">🔁 Rotation</h2>
        <p className="text-sm text-muted">Minimum days before I suggest the same piece again.</p>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((c) => (
            <label key={c} className="flex items-center justify-between gap-2 rounded-xl bg-soft px-3 py-2 text-sm">
              {CATEGORY_LABEL[c]}
              <input
                type="number"
                min={0}
                max={60}
                className="w-14 rounded-md border border-line bg-card px-2 py-1 text-right"
                value={rotation[c] ?? 0}
                onChange={(e) => setRotation({ ...rotation, [c]: Number(e.target.value) })}
              />
            </label>
          ))}
        </div>
        <button
          className="btn-ghost"
          disabled={!!busy}
          onClick={() =>
            run("rot", async () => (await api("/api/profile", { method: "PATCH", body: { rotation } }), "Rotation saved."))
          }
        >
          Save rotation
        </button>
      </section>

      <button
        className="btn-ghost w-full"
        onClick={async () => {
          await api("/api/auth/logout", { body: {} });
          window.location.href = "/login";
        }}
      >
        Sign out
      </button>
    </div>
  );
}
