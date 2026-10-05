"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { WhatsAppIcon } from "./WhatsAppFab";

/* Delivery: with NEXT_PUBLIC_WEB3FORMS_KEY set, enquiries post to
   web3forms and land in site.email silently. Without it the form opens
   the visitor's mail app pre-filled, so nothing is lost before setup. */
const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "";

export function EnquiryForm({ listing }: { listing?: { ref: string; title: string; url: string } }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const defaultMsg = listing
    ? `Please send me more information about ${listing.title} (${listing.ref}).`
    : "";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("botcheck")) return; // honeypot
    const fields = Object.fromEntries([...fd.entries()].filter(([k]) => k !== "botcheck")) as Record<string, string>;
    const subject = listing ? `Lease enquiry — ${listing.title} (${listing.ref})` : "Lease enquiry — website";
    const body = [
      ...Object.entries(fields).map(([k, v]) => `${k}: ${v}`),
      listing ? `Listing: ${listing.url}` : "",
    ].filter(Boolean).join("\n");

    if (!ACCESS_KEY) {
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setState("sent");
      return;
    }

    setState("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: ACCESS_KEY, subject, from_name: "MD Group lease site", ...fields, listing: listing?.url ?? "" }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="py-8 text-center">
        <p className="text-lg font-bold text-navy">Thank you — we&apos;ll be in touch shortly.</p>
        <p className="mt-2 text-sm text-muted">
          {ACCESS_KEY ? "Your enquiry has reached our leasing team." : "Please press send in your email app to complete the enquiry."}
        </p>
      </div>
    );
  }

  const wa = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(defaultMsg || "Hi MD Group, I'm looking for commercial space on lease.")}${listing ? encodeURIComponent(`\n${listing.url}`) : ""}`;

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Field name="First name" required />
      <Field name="Last name" required />
      <Field name="Email" type="email" required />
      <Field name="Phone" type="tel" required />
      <Field name="Company" />
      <label className="text-sm">
        <span className="mb-1.5 block font-semibold text-ink-2">Which best describes you?</span>
        <select name="Role" className="field" defaultValue="">
          <option value="" disabled>Select</option>
          <option>Occupier / tenant</option>
          <option>Broker</option>
          <option>Investor</option>
          <option>Other</option>
        </select>
      </label>
      <label className="text-sm sm:col-span-2">
        <span className="mb-1.5 block font-semibold text-ink-2">Requirement / comments</span>
        <textarea name="Message" rows={3} className="field" defaultValue={defaultMsg} />
      </label>
      <input type="text" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button className="btn btn-primary" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Submit"}
        </button>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="btn border border-[#25D366] text-[#128C4B] hover:bg-[#25D366]/10">
          <WhatsAppIcon className="h-4 w-4" /> WhatsApp instead
        </a>
        {state === "error" && <p className="text-sm text-copper-dk" role="alert">Couldn&apos;t send. Please try WhatsApp or call us.</p>}
      </div>
      <p className="text-xs text-muted sm:col-span-2">
        By submitting, you agree that MD Group may contact you about this enquiry. We don&apos;t share your details.
      </p>
    </form>
  );
}

function Field({ name, type = "text", required = false }: { name: string; type?: string; required?: boolean }) {
  return (
    <label className="text-sm">
      <span className="mb-1.5 block font-semibold text-ink-2">{name}{required && <span className="text-copper">*</span>}</span>
      <input name={name} type={type} required={required} className="field"
        autoComplete={{ "First name": "given-name", "Last name": "family-name", Email: "email", Phone: "tel", Company: "organization" }[name]} />
    </label>
  );
}

/* "Contact for details" button that opens the form in a dialog. */
export function EnquiryButton({ listing, className = "btn btn-primary w-full" }: {
  listing?: { ref: string; title: string; url: string }; className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (open) ref.current?.showModal(); }, [open]);

  return (
    <>
      <button className={className} onClick={() => setOpen(true)}>Contact for details</button>
      {open && (
        <dialog ref={ref} onClose={() => setOpen(false)}
          className="m-auto w-[min(720px,calc(100vw-2rem))] border-t-4 border-navy p-0 shadow-2xl backdrop:bg-black/50">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="text-lg font-extrabold uppercase tracking-wide text-navy">Contact for details</h2>
            <button onClick={() => ref.current?.close()} className="text-2xl leading-none text-ink-2" aria-label="Close">×</button>
          </div>
          <div className="max-h-[75vh] overflow-y-auto px-6 py-6">
            <EnquiryForm listing={listing} />
          </div>
        </dialog>
      )}
    </>
  );
}
