import type { Metadata } from "next";
import { EnquiryForm } from "@/components/EnquiryForm";
import { WhatsAppIcon } from "@/components/WhatsAppFab";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact our leasing team",
  description: "Tell MD Group what space you need — size, locality, budget — and we'll shortlist commercial properties for lease in Navi Mumbai.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.5fr]">
      <div>
        <p className="eyebrow text-copper">Contact</p>
        <h1 className="mt-3 text-3xl font-extrabold uppercase leading-tight tracking-wide text-navy sm:text-4xl">
          Tell us what you&apos;re looking for
        </h1>
        <p className="mt-4 text-ink-2">
          Share your size, preferred locality, budget and move-in date. We&apos;ll come back with a shortlist —
          including spaces that aren&apos;t listed yet.
        </p>

        <div className="mt-8 space-y-5 text-sm">
          {site.contacts.map((c) => (
            <div key={c.phone}>
              <p className="font-bold text-navy">{c.name}</p>
              <div className="mt-1 flex gap-4">
                <a href={`tel:+91${c.phone}`} className="text-ink-2 hover:text-copper">+91 {c.phone.replace(/(\d{5})(\d{5})/, "$1 $2")}</a>
                <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-semibold text-[#128C4B]">
                  <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                </a>
              </div>
            </div>
          ))}
          <div><p className="font-bold text-navy">Email</p><a href={`mailto:${site.email}`} className="text-ink-2 hover:text-copper">{site.email}</a></div>
          <div><p className="font-bold text-navy">Office</p><p className="text-ink-2">{site.address}</p></div>
        </div>
      </div>

      <div className="border-t-4 border-navy bg-ground p-6 sm:p-8">
        <h2 className="mb-6 text-lg font-extrabold uppercase tracking-wide text-navy">Send an enquiry</h2>
        <EnquiryForm />
      </div>
    </div>
  );
}
