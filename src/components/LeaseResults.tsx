"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { ListingsMap, type MapPin } from "./ListingsMap";
import { PropertyCard } from "./PropertyCard";
import { SortSelect } from "./SearchControls";
import type { Listing } from "@/lib/types";

const PAGE_SIZE = 12;

/* The C&W split view: map on the left, the result column on the right.
   Hovering a card lifts its pin and hovering a pin outlines its card.
   With "Update results when map moves" ticked, the column shows only
   what is inside the visible map. */
export function LeaseResults({ listings, pins, mapOn }: { listings: Listing[]; pins: MapPin[]; mapOn: boolean }) {
  const [active, setActive] = useState<string | null>(null);
  const [followMap, setFollowMap] = useState(true);
  const [inView, setInView] = useState<string[] | null>(null);
  const [pageState, setPage] = useState(1);

  const visible = useMemo(() => {
    if (!mapOn || !followMap || !inView) return listings;
    const ids = new Set(inView);
    // Listings with no location can't be placed, so they always stay listed.
    const pinned = new Set(pins.map((p) => p.id));
    return listings.filter((l) => ids.has(l.id) || !pinned.has(l.id));
  }, [listings, pins, inView, followMap, mapOn]);

  const onBoundsChange = useCallback((ids: string[]) => { setInView(ids); setPage(1); }, []);

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const page = Math.min(pageState, pages);
  const from = (page - 1) * PAGE_SIZE;
  const shown = visible.slice(from, from + PAGE_SIZE);

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-ink-2" aria-live="polite">
        {visible.length ? `Results ${from + 1}–${from + shown.length} of ${visible.length}` : "No results"}
      </p>
      <SortSelect />
    </div>
  );

  const list = shown.length ? (
    <div className={`grid content-start gap-x-8 gap-y-6 ${mapOn ? "grid-cols-1" : "md:grid-cols-2"}`}>
      {shown.map((l, i) => (
        <div key={l.id} onMouseEnter={() => setActive(l.id)} onMouseLeave={() => setActive(null)}
          className={`transition-shadow ${active === l.id ? "shadow-[0_0_0_2px_var(--color-navy)] outline-offset-4" : ""}`}>
          <PropertyCard l={l} priority={i < 2} />
        </div>
      ))}
    </div>
  ) : (
    <div className="border border-dashed border-line px-6 py-16 text-center">
      <p className="text-lg font-bold text-navy">No properties {followMap && mapOn ? "in this map area" : "match these filters"}.</p>
      <p className="mt-2 text-sm text-muted">Zoom out, widen the search, or tell us your requirement and we&apos;ll find it off-market.</p>
      <div className="mt-5 flex justify-center gap-3">
        <Link href="/properties/lease" className="btn btn-outline">Clear filters</Link>
        <Link href="/contact" className="btn btn-primary">Share requirement</Link>
      </div>
    </div>
  );

  const pager = pages > 1 && (
    <nav aria-label="Pagination" className="mt-8 flex justify-center gap-1">
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button key={n} onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          aria-current={n === page ? "page" : undefined}
          className={`grid h-10 w-10 place-items-center text-sm font-semibold ${n === page ? "bg-navy text-white" : "text-navy hover:bg-ground"}`}>
          {n}
        </button>
      ))}
    </nav>
  );

  if (!mapOn) {
    return <div>{header}<div className="mt-5">{list}</div>{pager}</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <div className="relative lg:sticky lg:top-[88px] lg:self-start">
        <ListingsMap pins={pins} activeId={active} onHover={setActive} onBoundsChange={onBoundsChange}
          className="h-[380px] w-full lg:h-[calc(100vh-104px)]" />
        <label className="absolute left-3 top-3 z-[500] flex cursor-pointer items-center gap-2 bg-white px-3 py-2 text-xs font-semibold text-ink-2 shadow">
          <input type="checkbox" checked={followMap} onChange={(e) => { setFollowMap(e.target.checked); setPage(1); }} className="h-4 w-4 accent-navy" />
          Update results when map moves
        </label>
      </div>
      <div>
        {header}
        <div className="mt-5">{list}</div>
        {pager}
      </div>
    </div>
  );
}
