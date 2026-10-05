"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { SearchIcon } from "./Header";
import { sizeBands, spaceConditions, spaceTypes } from "@/lib/site";

type Counts = {
  type: Record<string, number>;
  condition: Record<string, number>;
  city: Record<string, number>;
  locality: Record<string, number>;
  size: { label: string; min: number; max: number | null; count: number }[];
};

/* Every control writes to the URL, so a filtered view can be shared or
   bookmarked and the server renders the results. */
function useUrlPush() {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();

  function push(patch: Record<string, string | null>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    start(() => router.push(qs ? `${path}?${qs}` : path, { scroll: false }));
  }
  return { sp, push, pending };
}

/* Keyword bar, three quick dropdowns, the All Filters dialog and the
   map toggle. The map is on by default, as on C&W. */
export function SearchControls({ counts }: { counts: Counts }) {
  const { sp, push, pending } = useUrlPush();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [dialog, setDialog] = useState(false);

  const types = sp.get("type")?.split(",").filter(Boolean) ?? [];
  const mapOn = sp.get("view") !== "list";

  const sizeValue = `${sp.get("min") ?? ""}-${sp.get("max") ?? ""}`;

  return (
    <div className={pending ? "opacity-70 transition-opacity" : ""}>
      <div className="flex flex-col gap-3 lg:flex-row">
        <form className="flex flex-1" role="search"
          onSubmit={(e) => { e.preventDefault(); push({ q: q.trim() || null }); }}>
          <label htmlFor="kw" className="sr-only">Search by keyword</label>
          <input id="kw" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search by keyword — building, locality, type"
            className="field h-12 flex-1 !border-r-0" />
          <button className="grid h-12 w-12 shrink-0 place-items-center bg-navy text-white hover:bg-navy-2" aria-label="Search">
            <SearchIcon />
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          <Dropdown label="For lease" value="lease" options={[{ value: "lease", label: "For lease" }]} onChange={() => {}} />
          <Dropdown label="Property type" value={types.length === 1 ? types[0] : ""}
            options={[{ value: "", label: "Property type" },
              ...Object.entries(spaceTypes).map(([v, l]) => ({ value: v, label: `${l} (${counts.type[v] ?? 0})` }))]}
            onChange={(v) => push({ type: v || null })} />
          <Dropdown label="Available space" value={sizeValue === "-" ? "" : sizeValue}
            options={[{ value: "", label: "Available space" },
              ...sizeBands.map((b, i) => ({
                value: `${b.min || ""}-${Number.isFinite(b.max) ? b.max : ""}`,
                label: `${b.label} sq ft (${counts.size[i]?.count ?? 0})`,
              }))]}
            onChange={(v) => { const [mn, mx] = v.split("-"); push({ min: mn || null, max: mx || null }); }} />
          <button onClick={() => setDialog(true)} className="btn btn-outline h-12 !border-line !text-ink-2 hover:!bg-ground">
            <FilterIcon /> All filters
          </button>
          <button onClick={() => push({ view: mapOn ? "list" : null })}
            className="btn btn-primary h-12" aria-pressed={mapOn}>
            <MapIcon /> {mapOn ? "Hide map" : "Show map"}
          </button>
        </div>
      </div>

      <ActiveChips sp={sp} push={push} />

      {dialog && <FilterDialog counts={counts} onClose={() => setDialog(false)} onApply={(p) => { push(p); setDialog(false); }} />}
    </div>
  );
}

export function SortSelect() {
  const { sp, push } = useUrlPush();
  return (
    <label className="flex items-center gap-2">
      <span className="text-muted">Sort</span>
      <select value={sp.get("sort") ?? "updated"} onChange={(e) => push({ sort: e.target.value })}
        className="border-b border-navy bg-transparent py-1 pr-1 font-semibold text-navy outline-none">
        <option value="updated">Recently updated</option>
        <option value="size-asc">Available space: low to high</option>
        <option value="size-desc">Available space: high to low</option>
        <option value="rent-asc">Rent: low to high</option>
        <option value="name">Property A–Z</option>
      </select>
    </label>
  );
}

function Dropdown({ label, value, options, onChange }: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void;
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="h-12 appearance-none border border-line bg-white pl-4 pr-9 text-[0.72rem] font-bold uppercase tracking-wider text-ink-2 outline-none hover:bg-ground focus:border-navy">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <svg className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-2" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m2 4 4 4 4-4" /></svg>
    </label>
  );
}

function ActiveChips({ sp, push }: { sp: URLSearchParams; push: (p: Record<string, string | null>) => void }) {
  const chips: { key: string; text: string }[] = [];
  if (sp.get("q")) chips.push({ key: "q", text: `"${sp.get("q")}"` });
  sp.get("type")?.split(",").filter(Boolean).forEach((t) => chips.push({ key: "type", text: spaceTypes[t] ?? t }));
  sp.get("condition")?.split(",").filter(Boolean).forEach((c) => chips.push({ key: "condition", text: spaceConditions[c] ?? c }));
  if (sp.get("locality")) chips.push({ key: "locality", text: sp.get("locality")! });
  if (sp.get("city")) chips.push({ key: "city", text: sp.get("city")! });
  if (sp.get("min") || sp.get("max"))
    chips.push({ key: "size", text: `${sp.get("min") ?? 0} – ${sp.get("max") ?? "any"} sq ft` });
  if (!chips.length) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {chips.map((c, i) => (
        <button key={i} onClick={() => push(c.key === "size" ? { min: null, max: null } : { [c.key]: null })}
          className="flex items-center gap-1.5 bg-ground px-3 py-1.5 text-xs font-semibold text-navy hover:bg-sunk">
          {c.text} <span aria-hidden="true">×</span><span className="sr-only">Remove filter</span>
        </button>
      ))}
      <button onClick={() => push({ q: null, type: null, condition: null, locality: null, city: null, min: null, max: null })}
        className="text-xs font-semibold text-copper underline-offset-2 hover:underline">Clear all</button>
    </div>
  );
}

function FilterDialog({ counts, onClose, onApply }: {
  counts: Counts; onClose: () => void; onApply: (p: Record<string, string | null>) => void;
}) {
  const sp = useSearchParams();
  const ref = useRef<HTMLDialogElement>(null);
  const [types, setTypes] = useState(sp.get("type")?.split(",").filter(Boolean) ?? []);
  const [conds, setConds] = useState(sp.get("condition")?.split(",").filter(Boolean) ?? []);
  const [min, setMin] = useState(sp.get("min") ?? "");
  const [max, setMax] = useState(sp.get("max") ?? "");
  const [city, setCity] = useState(sp.get("city") ?? "");
  const [locality, setLocality] = useState(sp.get("locality") ?? "");

  useEffect(() => { ref.current?.showModal(); }, []);
  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <dialog ref={ref} onClose={onClose}
      className="m-auto w-[min(640px,calc(100vw-2rem))] border-t-4 border-navy p-0 shadow-2xl backdrop:bg-black/50">
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <h2 className="text-lg font-extrabold uppercase tracking-wide text-navy">All filters</h2>
        <button onClick={() => ref.current?.close()} className="text-2xl leading-none text-ink-2" aria-label="Close filters">×</button>
      </div>

      <div className="max-h-[60vh] space-y-7 overflow-y-auto px-6 py-6">
        <div className="grid grid-cols-2 text-center text-xs font-bold uppercase tracking-wider">
          <span className="bg-navy py-3 text-white">For lease</span>
          <span className="border border-line py-3 text-muted" title="This site lists lease properties only">For sale</span>
        </div>

        <Fieldset title="Property type">
          {Object.entries(spaceTypes).map(([v, l]) => (
            <Check key={v} label={`${l} (${counts.type[v] ?? 0})`} checked={types.includes(v)} onChange={() => toggle(types, setTypes, v)} />
          ))}
        </Fieldset>

        <Fieldset title="Space condition">
          {Object.entries(spaceConditions).map(([v, l]) => (
            <Check key={v} label={`${l} (${counts.condition[v] ?? 0})`} checked={conds.includes(v)} onChange={() => toggle(conds, setConds, v)} />
          ))}
        </Fieldset>

        <div>
          <h3 className="eyebrow mb-3 text-ink-2">Available space (sq ft)</h3>
          <div className="flex items-center gap-3">
            <input className="field" inputMode="numeric" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} aria-label="Minimum sq ft" />
            <span className="text-sm text-muted">to</span>
            <input className="field" inputMode="numeric" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} aria-label="Maximum sq ft" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="eyebrow mb-3 block text-ink-2">City</span>
            <select className="field" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">All cities</option>
              {Object.entries(counts.city).map(([c, n]) => <option key={c} value={c}>{c} ({n})</option>)}
            </select>
          </label>
          <label>
            <span className="eyebrow mb-3 block text-ink-2">Locality</span>
            <select className="field" value={locality} onChange={(e) => setLocality(e.target.value)}>
              <option value="">All localities</option>
              {Object.entries(counts.locality).map(([c, n]) => <option key={c} value={c}>{c} ({n})</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line px-6 py-4">
        <button className="text-sm font-semibold text-copper"
          onClick={() => { setTypes([]); setConds([]); setMin(""); setMax(""); setCity(""); setLocality(""); }}>
          Reset
        </button>
        <button className="btn btn-primary" onClick={() => onApply({
          type: types.join(",") || null, condition: conds.join(",") || null,
          min: min || null, max: max || null, city: city || null, locality: locality || null,
        })}>Apply</button>
      </div>
    </dialog>
  );
}

function Fieldset({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="eyebrow mb-3 text-ink-2">{title}</legend>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-2">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-navy" />
      {label}
    </label>
  );
}

function FilterIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 5h18l-7 8v6l-4 2v-8z" /></svg>;
}
function MapIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" /></svg>;
}
