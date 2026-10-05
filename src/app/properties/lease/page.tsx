import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { LeaseResults } from "@/components/LeaseResults";
import type { MapPin } from "@/components/ListingsMap";
import { SearchControls } from "@/components/SearchControls";
import {
  applyFilters, area, coords, facetCounts, fmtNum, getLeaseListings, listingHref, listingTitle,
  parseFilters, rentLabel,
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
  const results = applyFilters(all, parseFilters(sp));
  const mapOn = sp.view !== "list";

  const pins: MapPin[] = results.flatMap((l) => {
    const c = coords(l);
    if (!c) return [];
    const a = area(l);
    return [{
      id: l.id, title: listingTitle(l), href: listingHref(l), sub: `${l.locality}, ${l.city}`,
      photo: l.photos[0], meta: [a ? `${fmtNum(a)} sq ft` : "", rentLabel(l)].filter(Boolean).join(" · "),
      lat: c[0], lng: c[1],
    }];
  });

  return (
    <>
      <div className={`mx-auto px-4 pb-16 pt-6 sm:px-6 ${mapOn ? "max-w-[1600px]" : "max-w-7xl"}`}>
        <nav aria-label="Breadcrumb" className="text-xs text-muted">
          <span>Properties</span> <span className="mx-1.5">|</span>
          <span className="text-ink">For lease</span>
        </nav>

        <h1 className="mt-5 text-2xl font-extrabold uppercase tracking-wide text-navy sm:text-3xl">
          Available properties for lease
        </h1>

        <div className="mt-5">
          <SearchControls counts={facetCounts(all)} />
        </div>

        <div className="mt-6">
          <LeaseResults listings={results} pins={pins} mapOn={mapOn} />
        </div>
      </div>
      <CtaBand />
    </>
  );
}
