import { cache } from "react";
import { localityCoords, sizeBands } from "./site";
import { normalise, seedListings } from "./seed";
import { publicMediaUrl, supabase } from "./supabase";
import type { Listing } from "./types";

type MediaRow = { listing_id: string; path: string; kind: string; label: string | null; sort: number };

/* Published lease listings: seed records merged with database rows.
   A database row wins over a seed record with the same id, and new
   rows go first. If Supabase is unreachable the seed still renders —
   the public site should never go blank because the database is down. */
async function fetchDbListings(): Promise<Listing[]> {
  try {
    const [rows, media] = await Promise.all([
      supabase.from("listings").select("id, data, updated_at")
        .eq("published", true).eq("txn", "lease").order("updated_at", { ascending: false }),
      supabase.from("listing_media").select("listing_id, path, kind, label, sort")
        .order("sort", { ascending: true }),
    ]);
    if (rows.error) throw rows.error;

    const byListing = new Map<string, MediaRow[]>();
    for (const m of (media.data ?? []) as MediaRow[]) {
      byListing.set(m.listing_id, [...(byListing.get(m.listing_id) ?? []), m]);
    }

    return rows.data.map((r) => {
      const p = normalise({ ...(r.data as Partial<Listing>), id: r.id, updatedAt: r.updated_at });
      const own = byListing.get(r.id) ?? [];
      const images = own.filter((m) => m.kind === "image");
      const video = own.find((m) => m.kind === "video");
      if (images.length) {
        p.photos = images.map((m) => publicMediaUrl(m.path));
        p.mediaLabels = images.map((m) => m.label ?? "");
      }
      if (video) p.video = publicMediaUrl(video.path);
      return p;
    });
  } catch (e) {
    console.error("Supabase read failed, showing seed listings only:", e);
    return [];
  }
}

export const getLeaseListings = cache(async (): Promise<Listing[]> => {
  const db = await fetchDbListings();
  const dbIds = new Set(db.map((l) => l.id));
  return [...db, ...seedListings.filter((s) => !dbIds.has(s.id))];
});

export async function getListing(id: string) {
  return (await getLeaseListings()).find((l) => l.id === id) ?? null;
}

/* ---------- URLs ---------- */

const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* /properties/lease/md-0004-goodwill-bizhub-tower-a-turbhe — the id leads
   so the record is found even if its name changes later. */
export const listingSlug = (l: Listing) =>
  `${l.id.toLowerCase()}-${slugify([l.name, l.wing, l.locality].filter(Boolean).join(" "))}`;

export const listingHref = (l: Listing) => `/properties/lease/${listingSlug(l)}`;

export function idFromSlug(slug: string, all: Listing[]) {
  const s = slug.toLowerCase();
  return all.find((l) => s === listingSlug(l) || s.startsWith(l.id.toLowerCase() + "-") || s === l.id.toLowerCase());
}

/* ---------- display helpers ---------- */

export const area = (l: Listing) => (l.areaBasis === "carpet" ? l.carpetArea : l.chargeableArea) ?? l.carpetArea ?? l.chargeableArea;

export const fmtNum = (n: number | null | undefined) => (n == null ? "" : n.toLocaleString("en-IN"));

export function fmtRupees(n: number | null | undefined) {
  if (n == null) return "";
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2).replace(/\.?0+$/, "")} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export function rentLabel(l: Listing) {
  if (!l.priceVisible || l.price == null) return "Negotiable";
  return `${fmtRupees(l.price)} / month`;
}

export const coords = (l: Listing): [number, number] | null =>
  l.lat != null && l.lng != null ? [l.lat, l.lng] : localityCoords[l.locality] ?? null;

export const listingTitle = (l: Listing) => [l.name, l.wing].filter(Boolean).join(" — ");

/* ---------- search ---------- */

export type Filters = {
  q?: string;
  type?: string[];
  condition?: string[];
  city?: string;
  locality?: string;
  min?: number;
  max?: number;
  sort?: "updated" | "size-asc" | "size-desc" | "rent-asc" | "name";
  page?: number;
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const many = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v : v ? v.split(",") : []).filter(Boolean);

export function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const num = (k: string) => {
    const n = Number(one(sp[k]));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  return {
    q: one(sp.q)?.trim() || undefined,
    type: many(sp.type),
    condition: many(sp.condition),
    city: one(sp.city) || undefined,
    locality: one(sp.locality) || undefined,
    min: num("min"),
    max: num("max"),
    sort: (one(sp.sort) as Filters["sort"]) || "updated",
    page: num("page") ?? 1,
  };
}

export function applyFilters(all: Listing[], f: Filters) {
  const q = f.q?.toLowerCase();
  const out = all.filter((l) => {
    if (q) {
      const hay = [l.name, l.wing, l.locality, l.city, l.address, l.description, l.ref, l.spaceType]
        .join(" ").toLowerCase();
      if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    if (f.type?.length && !f.type.includes(l.spaceType)) return false;
    if (f.condition?.length && !f.condition.includes(l.spaceCondition)) return false;
    if (f.city && l.city !== f.city) return false;
    if (f.locality && l.locality !== f.locality) return false;
    const a = area(l) ?? 0;
    if (f.min && a < f.min) return false;
    if (f.max && a > f.max) return false;
    return true;
  });

  const by: Record<string, (a: Listing, b: Listing) => number> = {
    "size-asc": (a, b) => (area(a) ?? 0) - (area(b) ?? 0),
    "size-desc": (a, b) => (area(b) ?? 0) - (area(a) ?? 0),
    "rent-asc": (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
    name: (a, b) => listingTitle(a).localeCompare(listingTitle(b)),
  };
  if (f.sort && by[f.sort]) out.sort(by[f.sort]);
  return out;
}

/* Counts per facet value, as C&W shows "Office (137)". */
export function facetCounts(all: Listing[]) {
  const count = (key: (l: Listing) => string) =>
    all.reduce<Record<string, number>>((acc, l) => {
      const k = key(l);
      if (k) acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});
  return {
    type: count((l) => l.spaceType),
    condition: count((l) => l.spaceCondition),
    city: count((l) => l.city),
    locality: count((l) => l.locality),
    size: sizeBands.map((b) => ({
      ...b,
      count: all.filter((l) => { const a = area(l) ?? 0; return a >= b.min && a < b.max; }).length,
    })),
  };
}

export const PAGE_SIZE = 12;
