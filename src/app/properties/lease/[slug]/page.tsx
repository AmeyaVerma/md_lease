import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { CtaBand } from "@/components/CtaBand";
import { EnquiryButton } from "@/components/EnquiryForm";
import { Gallery } from "@/components/Gallery";
import { PropertyCard, StatusPill } from "@/components/PropertyCard";
import { ShareButton } from "@/components/ShareButton";
import { WhatsAppIcon } from "@/components/WhatsAppFab";
import {
  area, fmtNum, fmtRupees, getLeaseListings, idFromSlug, listingHref, listingSlug, listingTitle, rentLabel,
} from "@/lib/listings";
import { availabilityLabels, label, site, spaceConditions, spaceTypes } from "@/lib/site";
import type { Listing } from "@/lib/types";

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

async function load(slug: string) {
  const all = await getLeaseListings();
  return { l: idFromSlug(slug, all), all };
}

export async function generateStaticParams() {
  return (await getLeaseListings()).map((l) => ({ slug: listingSlug(l) }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { l } = await load((await params).slug);
  if (!l) return {};
  const t = `${listingTitle(l)} — ${label(spaceTypes, l.spaceType)} space for lease in ${l.locality}`;
  const a = area(l);
  return {
    title: t,
    description: `${a ? `${fmtNum(a)} sq ft ` : ""}${label(spaceTypes, l.spaceType).toLowerCase()} for lease at ${l.address}. ${l.description}`.slice(0, 160),
    alternates: { canonical: listingHref(l) },
    openGraph: { title: t, images: l.photos[0] ? [l.photos[0]] : [] },
  };
}

export default async function ListingPage({ params }: { params: Params }) {
  const { slug } = await params;
  const { l, all } = await load(slug);
  if (!l) notFound();
  if (slug !== listingSlug(l)) permanentRedirect(listingHref(l));

  const title = listingTitle(l);
  const url = `${site.url}${listingHref(l)}`;
  const similar = all
    .filter((x) => x.id !== l.id && (x.locality === l.locality || x.spaceType === l.spaceType))
    .slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: `${title} — for lease`,
    url,
    image: l.photos.map((p) => (p.startsWith("http") ? p : `${site.url}${p}`)),
    description: l.description,
    address: { "@type": "PostalAddress", streetAddress: l.address, addressLocality: l.locality, addressRegion: "Maharashtra", addressCountry: "IN" },
    ...(l.priceVisible && l.price ? { offers: { "@type": "Offer", price: l.price, priceCurrency: "INR", businessFunction: "http://purl.org/goodrelations/v1#LeaseOut" } } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6">
        <nav aria-label="Breadcrumb" className="truncate text-xs text-muted">
          <Link href="/" className="hover:text-navy">Home</Link> <span className="mx-1.5">|</span>
          <Link href="/properties/lease" className="hover:text-navy">Properties for lease</Link> <span className="mx-1.5">|</span>
          <span className="text-ink">{title}</span>
        </nav>

        <div className="mt-6 flex flex-col justify-between gap-4 border-b border-line pb-6 sm:flex-row sm:items-end">
          <div>
            <StatusPill availability={l.availability} />
            <p className="eyebrow mt-3 text-ink-2">For lease • {label(spaceTypes, l.spaceType)}</p>
            <h1 className="mt-2 max-w-3xl text-2xl font-extrabold uppercase leading-tight tracking-wide text-navy sm:text-[2.1rem]">
              {l.name} — {label(spaceTypes, l.spaceType)} space for lease in {l.locality}
            </h1>
            {l.wing && <p className="mt-3 font-semibold text-navy">{[l.wing, l.unitNumber && `Unit ${l.unitNumber}`].filter(Boolean).join(" · ")}</p>}
            <p className="mt-1 text-ink-2">{l.address}</p>
          </div>
          <ShareButton title={title} />
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <Gallery photos={l.photos} labels={l.mediaLabels} video={l.video} title={title} />

            <QuickFacts l={l} />

            <Section title="Overview">
              <p className="text-[0.98rem] leading-relaxed text-ink-2">{l.description}</p>
            </Section>

            <div className="mt-8 border-t-4 border-navy bg-ground px-6 py-6">
              <h2 className="eyebrow text-navy">Key features</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-2">
                {keyFeatures(l).map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>

            <Section title="Details">
              <DetailGrid rows={[
                ["Rental price", rentLabel(l)],
                ["Rate", l.priceVisible && l.pricePsf ? `₹${fmtNum(l.pricePsf)} / sq ft / month (${l.areaBasis} area)` : ""],
                ["Carpet area", l.carpetArea ? `${fmtNum(l.carpetArea)} sq ft` : ""],
                ["Chargeable area", l.chargeableArea ? `${fmtNum(l.chargeableArea)} sq ft` : ""],
                ["Space type", label(spaceTypes, l.spaceType)],
                ["Condition", label(spaceConditions, l.spaceCondition)],
                ["IT / Non-IT", l.itOrNonIt],
                ["Floor", l.floorNumber],
                ["Unit", l.unitNumber],
                ["Seating capacity", l.seatingCapacity ? `${l.seatingCapacity} seats` : ""],
                ["Possession", l.handoverDate || label(availabilityLabels, l.availability)],
                ["Car parking", parking(l.carParkFree, l.carParkExtra)],
                ["Two-wheeler parking", parking(l.twoWheelerFree, l.twoWheelerExtra)],
                ["Listing ref", l.ref],
              ]} />
            </Section>

            <Section title="Lease terms">
              <DetailGrid rows={[
                ["Security deposit", months(l.terms.depositMonths, "months' rent")],
                ["Lease term", months(l.terms.leaseTermMonths)],
                ["Lock-in", months(l.terms.lockInMonths)],
                ["Rent-free period", l.terms.rentFreeDays ? `${l.terms.rentFreeDays} days` : ""],
                ["Maintenance", l.terms.maintenancePsf ? `₹${l.terms.maintenancePsf} / sq ft${l.terms.maintenancePaidBy ? ` · paid by ${l.terms.maintenancePaidBy.toLowerCase()}` : ""}` : ""],
                ["Escalation", l.terms.escalationPct ? `${l.terms.escalationPct}% every ${l.terms.escalationMonths} months` : ""],
              ]} />
              <p className="mt-3 text-xs text-muted">Indicative terms. Final terms are agreed with the landlord.</p>
            </Section>

            <Section title="Location">
              <iframe title={`Map of ${l.address}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(l.address)}&output=embed`}
                className="h-[360px] w-full border-0 bg-sunk" />
            </Section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border-t-4 border-navy bg-ground p-6">
              <EnquiryButton listing={{ ref: l.ref, title, url }} />
              <ul className="mt-6 divide-y divide-line">
                {site.contacts.map((c) => (
                  <li key={c.phone} className="flex items-center gap-4 py-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-white">
                      {c.name.split(" ").map((w) => w[0]).join("")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-navy">{c.name}</span>
                      <span className="block text-xs text-muted">Partner · Navi Mumbai</span>
                      <span className="mt-1 flex gap-3 text-xs font-semibold">
                        <a href={`tel:+91${c.phone}`} className="text-navy hover:text-copper">Call</a>
                        <a href={`https://wa.me/${c.whatsapp}?text=${encodeURIComponent(`Hi, I'm interested in ${title} (${l.ref}): ${url}`)}`}
                          target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#128C4B]">
                          <WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp
                        </a>
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-px bg-line text-center">
              <div className="bg-white p-4"><dt className="eyebrow text-muted">Rent</dt><dd className="mt-1 font-bold text-navy">{l.priceVisible && l.price ? fmtRupees(l.price) : "On request"}</dd></div>
              <div className="bg-white p-4"><dt className="eyebrow text-muted">Area</dt><dd className="mt-1 font-bold text-navy">{fmtNum(area(l))} sq ft</dd></div>
            </dl>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-extrabold uppercase tracking-wide text-navy">Similar properties</h2>
            <div className="mt-6 grid gap-x-8 gap-y-6 md:grid-cols-2">
              {similar.map((s) => <PropertyCard key={s.id} l={s} />)}
            </div>
          </section>
        )}
      </div>
      <CtaBand />
    </>
  );
}

function QuickFacts({ l }: { l: Listing }) {
  const facts = [
    ["Available space", `${fmtNum(area(l))} sq ft`],
    ["Condition", label(spaceConditions, l.spaceCondition)],
    ["Possession", l.handoverDate || label(availabilityLabels, l.availability)],
  ];
  return (
    <dl className="mt-6 grid grid-cols-1 border-y border-line sm:grid-cols-3">
      {facts.map(([k, v]) => (
        <div key={k} className="py-4 sm:px-4 sm:first:pl-0">
          <dt className="eyebrow text-muted">{k}</dt>
          <dd className="mt-1 text-lg font-bold text-navy">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-5 flex items-center gap-4 text-sm font-bold uppercase tracking-[0.14em] text-navy">
        {title}<span className="h-px flex-1 bg-line" />
      </h2>
      {children}
    </section>
  );
}

function DetailGrid({ rows }: { rows: [string, string | null | undefined][] }) {
  return (
    <dl className="grid gap-x-10 sm:grid-cols-2">
      {rows.filter(([, v]) => v).map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 border-b border-line py-3 text-sm">
          <dt className="text-muted">{k}</dt>
          <dd className="text-right font-semibold text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

const months = (n: number | null, unit = "months") => (n ? `${n} ${unit}` : "");

function parking(free: number | null, extra: number | null) {
  if (!free && !extra) return "";
  return [free ? `${free} included` : "", extra ? `extra ₹${fmtNum(extra)}/month each` : ""].filter(Boolean).join(" · ");
}

/* Built from the record's own fields so nothing here is invented. */
function keyFeatures(l: Listing) {
  const f: string[] = [];
  const a = area(l);
  if (a) f.push(`${fmtNum(a)} sq ft ${l.areaBasis} area${l.floorNumber ? ` on the ${l.floorNumber.toLowerCase() === "ground" ? "ground" : l.floorNumber} floor` : ""}.`);
  if (l.spaceCondition) f.push(`Delivered as ${label(spaceConditions, l.spaceCondition).toLowerCase()}.`);
  if (l.seatingCapacity) f.push(`Seats up to ${l.seatingCapacity} people.`);
  if (l.itOrNonIt) f.push(`Approved for ${l.itOrNonIt} use.`);
  if (l.carParkFree || l.twoWheelerFree)
    f.push(`Parking: ${[l.carParkFree && `${l.carParkFree} car`, l.twoWheelerFree && `${l.twoWheelerFree} two-wheeler`].filter(Boolean).join(" and ")} slots included.`);
  if (l.terms.rentFreeDays) f.push(`${l.terms.rentFreeDays}-day rent-free fit-out period.`);
  f.push(`Located in ${l.locality}, ${l.city}.`);
  return f;
}
