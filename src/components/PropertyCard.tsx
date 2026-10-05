import Image from "next/image";
import Link from "next/link";
import { area, fmtNum, listingHref, listingTitle, rentLabel } from "@/lib/listings";
import { availabilityLabels, label, spaceTypes } from "@/lib/site";
import type { Listing } from "@/lib/types";

/* The C&W result row: photo left, status pill, "FOR LEASE • TYPE",
   bold title, address block, rent line. Stacks on phones. */
export function PropertyCard({ l, priority = false }: { l: Listing; priority?: boolean }) {
  const a = area(l);
  return (
    <Link href={listingHref(l)}
      className="group grid grid-cols-1 border-b border-line pb-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-5">
      <div className="relative aspect-[4/3] overflow-hidden bg-sunk">
        {l.photos[0] && (
          <Image src={l.photos[0]} alt={listingTitle(l)} fill priority={priority}
            sizes="(min-width: 1024px) 290px, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105" />
        )}
      </div>
      <div className="pt-4 sm:pt-1">
        <StatusPill availability={l.availability} />
        <p className="eyebrow mt-2.5 text-ink-2">For lease • {label(spaceTypes, l.spaceType)}</p>
        <h3 className="mt-1.5 text-[1.05rem] font-bold leading-snug text-navy group-hover:text-copper">
          {listingTitle(l)}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {l.locality}<br />{l.city}, Maharashtra
        </p>
        <dl className="mt-3 space-y-0.5 text-sm text-ink-2">
          {a != null && (
            <div><dt className="inline">Available space: </dt><dd className="inline font-semibold">{fmtNum(a)} sq ft</dd></div>
          )}
          <div><dt className="inline">Rental price: </dt><dd className="inline font-semibold">{rentLabel(l)}</dd></div>
        </dl>
      </div>
    </Link>
  );
}

export function StatusPill({ availability }: { availability: string }) {
  const ready = availability === "ready";
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-white ${ready ? "bg-navy" : "bg-copper"}`}>
      {label(availabilityLabels, availability)}
    </span>
  );
}
