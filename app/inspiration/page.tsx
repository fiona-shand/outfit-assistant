"use client";

import { useCallback, useState } from "react";
import { Paperclip } from "@/components/Icons";
import { Alert, Brand } from "@/components/ui";
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
      setProgress(`Studying look ${i + 1} of ${list.length}…`);
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
    <div className="space-y-7">
      <Brand />
      <header>
        <h1 className="display text-[60px]">
          Your <em>style</em>
        </h1>
        <p className="mt-3 text-[17px] text-muted">
          Save looks you love. I&rsquo;ll learn what they have in common and dress you to match.
        </p>
      </header>

      <label className={`btn-accent w-full cursor-pointer ${progress ? "pointer-events-none opacity-60" : ""}`}>
        Add inspiration photos
        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
      </label>

      {progress && <p className="script animate-pulse text-center text-[26px]">{progress}</p>}
      {error && <Alert>{error}</Alert>}

      {/* Style profile: a clipped note on striped fabric. */}
      <section className="rounded-[28px] stripes-navy px-5 py-8">
        <div className="relative mx-auto max-w-md rotate-[-0.6deg] bg-[#f4ecdc] px-5 pb-6 pt-8 text-[#2a2118] shadow-[0_10px_30px_-10px_rgb(0_0_0/0.45)]">
          <Paperclip className="absolute -top-6 left-6 h-20 w-7 -rotate-6 text-[#3b3b3b]" />
          <div className="flex items-center justify-between">
            <h2 className="script pl-6 text-[34px] font-bold leading-none">my style notes</h2>
            {photos.length > 0 && (
              <button className="text-[13px] underline" disabled={!!progress} onClick={() => run(regenerate)}>
                rewrite
              </button>
            )}
          </div>
          <textarea
            rows={noteRows(profile)}
            className="mt-3 min-h-72 w-full resize-none [field-sizing:content] bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-[#2a2118]/50"
            placeholder="Add a few inspiration photos and I'll write your style notes here. You can also write or edit them yourself."
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
          />
          {profile !== savedProfile && (
            <button
              className="script rounded-[6px] border-[1.5px] border-[#2a2118] px-5 py-0.5 text-[22px] font-bold"
              onClick={() =>
                run(async () => {
                  await api("/api/profile", { method: "PATCH", body: { style_profile: profile } });
                  setSavedProfile(profile);
                })
              }
            >
              save notes
            </button>
          )}
        </div>
      </section>

      {photos.length > 0 && (
        <section className="space-y-3">
          <h2 className="display text-[32px]">Mood board</h2>
          <ul className="columns-2 gap-3">
            {photos.map((p) => (
              <li key={p.id} className="mb-3 break-inside-avoid">
                <button className="block w-full overflow-hidden rounded-[22px] bg-soft" onClick={() => setOpen(p)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" className="w-full" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {open && (
        <div className="fixed inset-0 z-30 flex items-end bg-ink/50 sm:items-center sm:justify-center" onClick={() => setOpen(null)}>
          <div
            className="max-h-[90dvh] w-full space-y-4 overflow-y-auto rounded-t-[32px] bg-bg p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-w-md sm:rounded-[32px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={open.url} alt="" className="max-h-80 w-full rounded-[22px] object-contain" />
            <p className="whitespace-pre-line text-[15px] leading-relaxed">{open.summary}</p>
            <div className="flex gap-2">
              <button
                className="btn-ghost text-accent"
                onClick={() =>
                  run(async () => {
                    await api(`/api/inspiration/${open.id}`, { method: "DELETE" });
                    setOpen(null);
                    await load();
                  })
                }
              >
                Remove
              </button>
              <button className="btn-primary" onClick={() => setOpen(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Enough rows to show the whole note without scrolling (fallback where field-sizing isn't supported). */
function noteRows(text: string) {
  return text.split("\n").reduce((n, line) => n + Math.max(1, Math.ceil(line.length / 42)), 2);
}
