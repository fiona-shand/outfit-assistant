"use client";

import { useCallback, useState } from "react";
import { api, compressImage, useOnMount } from "@/lib/client";

interface Inspo {
  id: string;
  summary: string | null;
  url: string;
}

export default function InspirationPage() {
  const [photos, setPhotos] = useState<Inspo[]>([]);
  const [profile, setProfile] = useState("");
  const [savedProfile, setSavedProfile] = useState("");
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Inspo | null>(null);

  const load = useCallback(async () => {
    const [p, prof] = await Promise.all([
      api<Inspo[]>("/api/inspiration"),
      api<{ style_profile: string | null }>("/api/profile"),
    ]);
    setPhotos(p);
    setProfile(prof.style_profile ?? "");
    setSavedProfile(prof.style_profile ?? "");
  }, []);

  useOnMount(() => load().catch((e) => setError(e.message)));

  async function regenerate() {
    setProgress("Writing your style profile…");
    const { style_profile } = await api<{ style_profile: string }>("/api/inspiration/profile", { body: {} });
    setProfile(style_profile);
    setSavedProfile(style_profile);
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const list = Array.from(files);
    let failed = 0;
    for (let i = 0; i < list.length; i++) {
      setProgress(`Studying photo ${i + 1} of ${list.length}…`);
      try {
        const image = await compressImage(list[i], 1024);
        await api("/api/inspiration", { body: { image } });
      } catch {
        failed++;
      }
    }
    try {
      await regenerate();
      await load();
      if (failed) setError(`${failed} photo(s) couldn't be processed.`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setProgress(null);
    }
  }

  async function run(fn: () => Promise<unknown>) {
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="label">{photos.length} inspiration photos</p>
        <h1 className="mt-1 text-2xl font-semibold">Your style</h1>
        <p className="mt-1 text-sm text-muted">
          Add looks you love. I distil them into a style profile that guides every suggestion.
        </p>
      </header>

      <label className={`btn-primary w-full cursor-pointer ${progress ? "pointer-events-none opacity-60" : ""}`}>
        ✨ Add inspiration photos
        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
      </label>

      {progress && <p className="animate-pulse text-center text-sm text-muted">{progress}</p>}
      {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p>}

      <section className="card space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Style profile</h2>
          {photos.length > 0 && (
            <button className="text-sm text-accent underline" disabled={!!progress} onClick={() => run(regenerate)}>
              Regenerate
            </button>
          )}
        </div>
        <textarea
          className="input min-h-64 font-normal leading-relaxed"
          placeholder="Upload some inspiration photos and your profile will appear here. You can also write or edit it yourself."
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
        />
        {profile !== savedProfile && (
          <button
            className="btn-primary"
            onClick={() =>
              run(async () => {
                await api("/api/profile", { method: "PATCH", body: { style_profile: profile } });
                setSavedProfile(profile);
              })
            }
          >
            Save edits
          </button>
        )}
      </section>

      {photos.length > 0 && (
        <ul className="grid grid-cols-3 gap-2">
          {photos.map((p) => (
            <li key={p.id}>
              <button className="block aspect-[3/4] w-full overflow-hidden rounded-xl bg-soft" onClick={() => setOpen(p)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div className="fixed inset-0 z-30 flex items-end bg-black/50 sm:items-center sm:justify-center" onClick={() => setOpen(null)}>
          <div
            className="max-h-[90dvh] w-full space-y-3 overflow-y-auto rounded-t-3xl bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:max-w-md sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={open.url} alt="" className="max-h-80 w-full rounded-xl object-contain" />
            <p className="whitespace-pre-line text-sm">{open.summary}</p>
            <div className="flex gap-2">
              <button
                className="btn-ghost text-red-600"
                onClick={() =>
                  run(async () => {
                    await api(`/api/inspiration/${open.id}`, { method: "DELETE" });
                    setOpen(null);
                    await load();
                  })
                }
              >
                Delete
              </button>
              <button className="btn-ghost" onClick={() => setOpen(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
