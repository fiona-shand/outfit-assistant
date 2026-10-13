"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { api, WELCOMED_KEY } from "@/lib/client";

/** Registers the service worker and quietly refreshes location if already permitted. */
export default function ClientBoot() {
  const path = usePathname();
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
    }
    // First visit on this device: show the welcome page once.
    if (path === "/") {
      try {
        if (!localStorage.getItem(WELCOMED_KEY)) {
          window.location.replace("/welcome");
          return;
        }
      } catch {}
    }
    if (path === "/welcome" || path === "/login" || !("geolocation" in navigator) || !navigator.permissions) return;
    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        if (status.state !== "granted") return;
        navigator.geolocation.getCurrentPosition((pos) => {
          api("/api/profile", {
            method: "PATCH",
            body: {
              lat: Math.round(pos.coords.latitude * 100) / 100,
              lon: Math.round(pos.coords.longitude * 100) / 100,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
          }).catch(() => {});
        });
      })
      .catch(() => {});
    // Only once per app open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
