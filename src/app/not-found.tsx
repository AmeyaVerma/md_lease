import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-28 text-center">
      <p className="eyebrow text-copper">404</p>
      <h1 className="mt-3 text-3xl font-extrabold uppercase tracking-wide text-navy">This space is no longer listed</h1>
      <p className="mt-4 text-ink-2">It may have been leased or taken off the market. Browse what&apos;s available now.</p>
      <Link href="/properties/lease" className="btn btn-primary mt-8">Properties for lease</Link>
    </div>
  );
}
