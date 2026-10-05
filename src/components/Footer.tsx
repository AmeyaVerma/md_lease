import Link from "next/link";
import { Logo } from "./Logo";
import { localityCoords, site, spaceTypes } from "@/lib/site";

const NAVI_MUMBAI = ["Turbhe", "Kharghar", "Nerul", "Vashi", "Belapur", "Koparkhairane"];

export function Footer() {
  return (
    <footer className="bg-navy text-white/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/65">{site.blurb}</p>
        </div>

        <FooterCol title="Space types">
          {Object.entries(spaceTypes).map(([id, label]) => (
            <Link key={id} href={`/properties/lease?type=${id}`} className="hover:text-white">{label} for lease</Link>
          ))}
        </FooterCol>

        <FooterCol title="Localities">
          {NAVI_MUMBAI.filter((l) => localityCoords[l]).map((l) => (
            <Link key={l} href={`/properties/lease?locality=${encodeURIComponent(l)}`} className="hover:text-white">
              Commercial space in {l}
            </Link>
          ))}
        </FooterCol>

        <FooterCol title="Contact">
          <span className="leading-relaxed">{site.address}</span>
          {site.contacts.map((c) => (
            <a key={c.phone} href={`tel:+91${c.phone}`} className="hover:text-white">
              {c.name} · +91 {c.phone.replace(/(\d{5})(\d{5})/, "$1 $2")}
            </a>
          ))}
          <a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a>
        </FooterCol>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/50 sm:flex-row sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} MD Group. {site.tagline}</span>
          <span>Listings, rates and terms are indicative and subject to confirmation.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="eyebrow mb-4 text-white">{title}</h2>
      <div className="flex flex-col gap-2.5 text-sm">{children}</div>
    </div>
  );
}
