import Image from "next/image";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { HeroSearch } from "@/components/HeroSearch";
import { PropertyCard } from "@/components/PropertyCard";
import { getLeaseListings } from "@/lib/listings";
import { site, spaceTypes } from "@/lib/site";

export const revalidate = 60;

const LOCALITY_PHOTOS: Record<string, string> = {
  Turbhe: "/img/aerial-district-01.jpg",
  Kharghar: "/img/aerial-dusk-01.jpg",
  Nerul: "/img/aerial-district-02.jpg",
  Vashi: "/img/tower-dusk-01.jpg",
  Belapur: "/img/tower-lit-01.jpg",
};

const TYPE_PHOTOS: Record<string, string> = {
  office: "/img/office-fitted-01.jpg",
  retail: "/img/retail-street-01.jpg",
  showroom: "/img/tower-front.jpg",
  msme: "/img/industrial-01.jpg",
  fnb: "/img/rooftop-deck.jpg",
};

export default async function Home() {
  const all = await getLeaseListings();
  const latest = all.slice(0, 4);
  const byLocality = all.reduce<Record<string, number>>((a, l) => ({ ...a, [l.locality]: (a[l.locality] ?? 0) + 1 }), {});
  const byType = all.reduce<Record<string, number>>((a, l) => ({ ...a, [l.spaceType]: (a[l.spaceType] ?? 0) + 1 }), {});
  const localities = Object.keys(LOCALITY_PHOTOS);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-navy">
        <Image src="/img/hero-background.jpg" alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-45" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/80 to-navy/20" />
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28">
          <p className="eyebrow text-copper">MD Group · Commercial Leasing</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold uppercase leading-[1.05] tracking-wide text-white sm:text-6xl">
            Find your next commercial space in Navi Mumbai
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/75">{site.blurb}</p>
          <div className="mt-9 max-w-3xl"><HeroSearch /></div>
          {site.photoCredit && <p className="mt-10 text-[0.65rem] text-white/40">{site.photoCredit}</p>}
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-line">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-6 lg:grid-cols-4">
          {[{ value: String(all.length), label: "Spaces available now" }, ...site.stats.slice(1)].map((s) => (
            <div key={s.label} className="border-line py-8 odd:border-r lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0">
              <dd className="text-3xl font-extrabold text-navy">{s.value}</dd>
              <dt className="mt-1 text-sm text-muted">{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* Latest */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHead title="Latest properties for lease" href="/properties/lease" cta="View all properties" />
        <div className="mt-8 grid gap-x-8 gap-y-6 md:grid-cols-2">
          {latest.map((l) => <PropertyCard key={l.id} l={l} />)}
        </div>
      </section>

      {/* By type */}
      <section className="bg-ground">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHead title="Browse by property type" />
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {Object.entries(TYPE_PHOTOS).map(([id, img]) => (
              <Link key={id} href={`/properties/lease?type=${id}`} className="group relative aspect-[3/4] overflow-hidden bg-navy">
                <Image src={img} alt="" fill sizes="(min-width:1024px) 240px, 50vw" className="object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="font-extrabold uppercase tracking-wide">{spaceTypes[id]}</p>
                  <p className="text-xs text-white/70">{byType[id] ?? 0} available</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Localities */}
      <section id="localities" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6">
        <SectionHead title="Explore by locality" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] lg:grid-rows-2">
          {localities.map((loc, i) => (
            <Link key={loc} href={`/properties/lease?locality=${loc}`}
              className={`group relative min-h-[200px] overflow-hidden bg-navy ${i === 0 ? "lg:row-span-2" : ""}`}>
              <Image src={LOCALITY_PHOTOS[loc]} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover opacity-75 transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 text-white">
                <p className="text-xl font-extrabold uppercase tracking-wide">{loc}</p>
                <p className="text-sm text-white/75">{byLocality[loc] ? `${byLocality[loc]} ${byLocality[loc] === 1 ? "space" : "spaces"} for lease` : "Enquire for availability"} →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why MD */}
      <section className="bg-navy text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow text-copper">Why MD Group</p>
            <h2 className="mt-3 text-3xl font-extrabold uppercase leading-tight tracking-wide">{site.tagline}</h2>
            <p className="mt-4 text-white/70">
              We represent occupiers and landlords across Navi Mumbai&apos;s commercial corridors — from showroom frontage
              on the Thane–Belapur Road to IT floors in Nerul MIDC.
            </p>
            <Link href="/about" className="btn btn-accent mt-7">About MD Group</Link>
          </div>
          <div className="grid gap-px bg-white/10 sm:grid-cols-2">
            {[
              ["Verified inventory", "Every space is inspected and its area, rent and terms confirmed before it is listed."],
              ["Micro-market knowledge", "We work Turbhe, Kharghar, Nerul, Vashi and Belapur every day — rents, landlords and what's coming."],
              ["Negotiated terms", "Deposit, lock-in, rent-free and escalation — we negotiate the whole lease, not just the rent."],
              ["Off-market access", "Share a requirement and we'll shortlist spaces that never reach a portal."],
            ].map(([t, d]) => (
              <div key={t} className="bg-navy p-6">
                <h3 className="font-bold">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <p className="eyebrow text-center text-muted">Developers we work with</p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {site.partners.map((p) => (
            <li key={p} className="text-lg font-extrabold uppercase tracking-wider text-navy/45">{p}</li>
          ))}
        </ul>
      </section>

      <CtaBand />
    </>
  );
}

function SectionHead({ title, href, cta }: { title: string; href?: string; cta?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="text-2xl font-extrabold uppercase tracking-wide text-navy sm:text-[1.7rem]">{title}</h2>
      {href && <Link href={href} className="hidden shrink-0 text-sm font-bold text-copper hover:underline sm:block">{cta} →</Link>}
    </div>
  );
}
