import Link from "next/link";

export function CtaBand() {
  return (
    <section className="bg-ground">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-extrabold uppercase tracking-wide text-navy sm:text-[1.7rem]">
            Planning your next commercial move?
          </h2>
          <p className="mt-2 text-ink-2">Speak with our leasing team — we&apos;ll shortlist spaces that fit your brief.</p>
        </div>
        <Link href="/contact" className="btn btn-primary">Contact us</Link>
      </div>
    </section>
  );
}
