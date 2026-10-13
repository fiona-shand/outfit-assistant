import { useEffect } from "react";

// Browser-side helpers.

export async function api<T = unknown>(
  url: string,
  opts: { method?: string; body?: unknown } = {},
): Promise<T> {
  const res = await fetch(url, {
    method: opts.method ?? (opts.body ? "POST" : "GET"),
    headers: opts.body ? { "Content-Type": "application/json" } : undefined,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (res.status === 401 && !url.startsWith("/api/auth")) {
    window.location.href = "/login";
    throw new Error("Not signed in");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data as T;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Couldn't read that image"));
    img.src = src;
  });
}

/** Resize a photo to fit `max` px and re-encode as JPEG. Returns a data URL. */
export async function compressImage(file: File, max = 1280, quality = 0.82): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Crop a fractional bounding box (with a little padding) out of a data URL, as a square-ish thumbnail. */
export async function cropThumb(dataUrl: string, box: BBox, size = 360): Promise<string> {
  const img = await loadImage(dataUrl);
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const pad = 0.06;
  const x0 = Math.max(0, (box.x - pad) * W);
  const y0 = Math.max(0, (box.y - pad) * H);
  const x1 = Math.min(W, (box.x + box.w + pad) * W);
  const y1 = Math.min(H, (box.y + box.h + pad) * H);
  const w = Math.max(1, x1 - x0);
  const h = Math.max(1, y1 - y0);
  const scale = Math.min(1, size / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  canvas.getContext("2d")!.drawImage(img, x0, y0, w, h, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function todayLocal(): string {
  return new Intl.DateTimeFormat("en-CA").format(new Date());
}

export const CATEGORY_LABEL: Record<string, string> = {
  top: "Top",
  bottom: "Bottom",
  dress: "Dress",
  shoes: "Shoes",
  outerwear: "Outerwear",
  accessory: "Accessory",
};

/** Runs an async loader once after mount (keeps data fetching out of the effect body). */
export function useOnMount(fn: () => unknown) {
  useEffect(() => {
    fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
