"use client";

import Image from "next/image";
import { useState } from "react";

/* Carousel with prev/next arrows and an Images | Video switch, as on
   the C&W detail page. The video uses preload="none" so a walkthrough
   never downloads until someone presses play. */
export function Gallery({ photos, labels = [], video, title }: {
  photos: string[]; labels?: string[]; video?: string; title: string;
}) {
  const [i, setI] = useState(0);
  const [mode, setMode] = useState<"images" | "video">("images");
  const n = photos.length;
  const go = (d: number) => setI((x) => (x + d + n) % n);

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden bg-sunk"
        onKeyDown={(e) => { if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1); }}>
        {mode === "video" && video ? (
          <video src={video} controls preload="none" poster={photos[0]} className="h-full w-full bg-black object-contain" />
        ) : n ? (
          <>
            {photos.map((src, k) => (
              <Image key={src + k} src={src} alt={labels[k] || `${title} — photo ${k + 1}`} fill
                priority={k === 0} sizes="(min-width: 1024px) 760px, 100vw"
                className={`object-cover transition-opacity duration-500 ${k === i ? "opacity-100" : "opacity-0"}`} />
            ))}
            {n > 1 && (
              <>
                <Arrow dir="prev" onClick={() => go(-1)} />
                <Arrow dir="next" onClick={() => go(1)} />
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {photos.map((_, k) => (
                    <button key={k} onClick={() => setI(k)} aria-label={`Photo ${k + 1}`}
                      className={`h-2 w-2 rounded-full ${k === i ? "bg-white" : "bg-white/50"}`} />
                  ))}
                </div>
              </>
            )}
            {labels[i] && <span className="absolute left-3 top-3 bg-black/60 px-2 py-1 text-xs text-white">{labels[i]}</span>}
          </>
        ) : (
          <div className="grid h-full place-items-center text-sm text-muted">Photos coming soon</div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
        <Tab active={mode === "images"} onClick={() => setMode("images")}>Images ({n})</Tab>
        {video && <><span className="h-4 w-px bg-line" /><Tab active={mode === "video"} onClick={() => setMode("video")}>▶ Video</Tab></>}
      </div>
    </div>
  );
}

function Arrow({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={dir === "prev" ? "Previous photo" : "Next photo"}
      className={`absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center bg-white/90 text-navy shadow hover:bg-white ${dir === "prev" ? "left-3" : "right-3"}`}>
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
        <path d={dir === "prev" ? "M10 3 5 8l5 5" : "m6 3 5 5-5 5"} />
      </svg>
    </button>
  );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={active ? "text-navy" : "text-muted hover:text-navy"} aria-pressed={active}>
      {children}
    </button>
  );
}
