import Link from "next/link";

/* Text mark until MD supplies logo artwork. The stepped bars echo a
   skyline without borrowing anyone else's mark. */
export function Logo({ light = false }: { light?: boolean }) {
  const ink = light ? "text-white" : "text-navy";
  return (
    <Link href="/properties/lease" className={`flex items-center gap-2.5 ${ink}`} aria-label="MD Group home">
      <svg width="30" height="26" viewBox="0 0 30 26" aria-hidden="true">
        <rect x="0" y="12" width="5" height="14" className="fill-copper" />
        <rect x="8" y="6" width="5" height="20" className="fill-copper" />
        <rect x="16" y="0" width="5" height="26" className="fill-copper" />
        <rect x="24" y="9" width="5" height="17" className="fill-copper" />
      </svg>
      <span className="leading-none">
        <span className="block text-[1.15rem] font-extrabold tracking-[0.14em]">MD GROUP</span>
        <span className={`block text-[0.58rem] font-semibold tracking-[0.2em] uppercase ${light ? "text-white/60" : "text-muted"}`}>
          Commercial Leasing
        </span>
      </span>
    </Link>
  );
}
