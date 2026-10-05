"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SearchIcon } from "./Header";
import { localityCoords, spaceTypes } from "@/lib/site";

const LOCALITIES = ["Turbhe", "Kharghar", "Nerul", "Vashi", "Belapur", "Koparkhairane"].filter((l) => localityCoords[l]);

export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [locality, setLocality] = useState("");

  function go(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (type) p.set("type", type);
    if (locality) p.set("locality", locality);
    router.push(`/properties/lease${p.size ? `?${p}` : ""}`);
  }

  return (
    <form onSubmit={go} role="search" className="bg-white p-2 shadow-2xl">
      <div className="flex gap-1 px-2 pb-2 pt-1 text-[0.7rem] font-bold uppercase tracking-wider">
        <span className="border-b-2 border-copper pb-1 text-navy">For lease</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-[1.4fr_1fr_1fr_auto]">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Building, locality or keyword"
          aria-label="Keyword" className="field h-12 !border-0 !bg-ground" />
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Property type" className="field h-12 !border-0 !bg-ground">
          <option value="">All property types</option>
          {Object.entries(spaceTypes).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={locality} onChange={(e) => setLocality(e.target.value)} aria-label="Locality" className="field h-12 !border-0 !bg-ground">
          <option value="">All localities</option>
          {LOCALITIES.map((l) => <option key={l}>{l}</option>)}
        </select>
        <button className="btn btn-accent h-12"><SearchIcon /> Search</button>
      </div>
    </form>
  );
}
