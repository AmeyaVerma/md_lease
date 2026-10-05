import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About MD Group",
  description: "MD Group is a Navi Mumbai commercial real estate firm leasing office, retail, showroom and industrial space.",
};

export default function AboutPage() {
  return (
    <>
      <section className="relative isolate bg-navy">
        <Image src="/img/aerial-dusk-01.jpg" alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-35" />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <p className="eyebrow text-copper">About us</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold uppercase leading-tight tracking-wide text-white sm:text-5xl">
            {site.tagline}
          </h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div className="space-y-4 text-[1.02rem] leading-relaxed text-ink-2">
          <p>
            MD Group is a commercial real estate firm based in Kharghar, Navi Mumbai. We lease office, retail,
            showroom, F&amp;B and MSME space for occupiers, and market completed and upcoming commercial
            projects for the developers we partner with.
          </p>
          <p>
            Our focus is narrow on purpose: the micro-markets of Navi Mumbai — Turbhe, Kharghar, Nerul, Vashi
            and Belapur — where we know the buildings, the landlords and the rents.
          </p>
          <Link href="/properties/lease" className="btn btn-primary mt-4">See available spaces</Link>
        </div>
        <dl className="grid grid-cols-2 gap-px self-start bg-line">
          {site.stats.map((s) => (
            <div key={s.label} className="bg-white p-6">
              <dd className="text-3xl font-extrabold text-navy">{s.value}</dd>
              <dt className="mt-1 text-sm text-muted">{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-ground">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-extrabold uppercase tracking-wide text-navy">Leadership</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {site.contacts.map((c) => (
              <div key={c.phone} className="flex items-center gap-4 bg-white p-6">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-navy font-bold text-white">
                  {c.name.split(" ").map((w) => w[0]).join("")}
                </span>
                <div>
                  <p className="font-bold text-navy">{c.name}</p>
                  <p className="text-sm text-muted">Partner</p>
                  <a href={`tel:+91${c.phone}`} className="text-sm font-semibold text-copper">Call</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
