import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CtaBand } from "@/components/CtaBand";
import { ListingsMap, type MapPin } from "@/components/ListingsMap";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchControls } from "@/components/SearchControls";
import {
  applyFilters, coords, facetCounts, getLeaseListings, listingHref, listingTitle,
  PAGE_SIZE, parseFilters,
} from "@/lib/listings";
import { label, spaceTypes } from "@/lib/site";

type SP = Record<string, string | string[] | undefined>;

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const f = parseFilters(await searchParams);
  const what = f.type?.length === 1 ? `${label(spaceTypes, f.type[0])} space` : "Commercial space";
  const where = f.locality ?? f.city ?? "Navi Mumbai";
  return {
    title: `${what} for lease in ${where}`,
    description: `Browse ${what.toLowerCase()} available for lease in ${where} — verified listings with area, rent and lease terms from MD Group.`,
    alternates: { canonical: "/properties/lease" },
  };
}

export default async function LeaseSearchPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const all = await getLeaseListings();
  const f = parseFilters(sp);
  const results = applyFilters(all, f);
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(f.page ?? 1, pages);
  const shown = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const mapOn = sp.view === "map";

  const pins: MapPin[] = results.flatMap((l) => {
    const c = coords(l);
    return c ? [{ id: l.id, title: listingTitle(l), href: listingHref(l), sub: `${l.locality}, ${l.city}`, lat: c[0], lng: c[1] }] : [];
  });

  const pageHref = (n: number) => {
    const q = new URLSearchParams(Object.entries(sp).flatMap(([k, v]) => (typeof v === "string" ? [[k, v]] : [])));
    q.set("page", String(n));
    return `/properties/lease?${q}`;
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-xs text-muted">
          <Link href="/" className="hover:text-navy">Home</Link> <span className="mx-1.5">|</span>
          <span>Properties</span> <span className="mx-1.5">|</span>
          <span className="text-ink">For lease</span>
        </nav>

        <h1 className="mt-6 text-2xl font-extrabold uppercase tracking-wide text-navy sm:text-3xl">
          Available properties for lease
        </h1>

        <div className="mt-6">
          <Suspense>
            <SearchControls counts={facetCounts(all)} total={results.length} />
          </Suspense>
        </div>

        <div className={`mt-6 ${mapOn ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" : ""}`}>
          {mapOn && (
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ListingsMap pins={pins} className="h-[360px] lg:h-[calc(100vh-8rem)]" />
            </div>
          )}

          {shown.length ? (
            <div className={`grid content-start gap-x-8 gap-y-6 ${mapOn ? "grid-cols-1" : "md:grid-cols-2"}`}>
              {shown.map((l, i) => <PropertyCard key={l.id} l={l} priority={i < 2} />)}
            </div>
          ) : (
            <div className="border border-dashed border-line px-6 py-16 text-center">
              <p className="text-lg font-bold text-navy">No properties match these filters.</p>
              <p className="mt-2 text-sm text-muted">Widen the search, or tell us your requirement and we&apos;ll find it off-market.</p>
              <div className="mt-5 flex justify-center gap-3">
                <Link href="/properties/lease" className="btn btn-outline">Clear filters</Link>
                <Link href="/contact" className="btn btn-primary">Share requirement</Link>
              </div>
            </div>
          )}
        </div>

        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-10 flex justify-center gap-1">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link key={n} href={pageHref(n)} aria-current={n === page ? "page" : undefined}
                className={`grid h-10 w-10 place-items-center text-sm font-semibold ${n === page ? "bg-navy text-white" : "text-navy hover:bg-ground"}`}>
                {n}
              </Link>
            ))}
          </nav>
        )}
      </div>
      <CtaBand />
    </>
  );
}
