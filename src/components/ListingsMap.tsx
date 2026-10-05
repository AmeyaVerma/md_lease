"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export type MapPin = {
  id: string; title: string; href: string; sub: string; photo?: string; meta: string;
  lat: number; lng: number;
};

type Props = {
  pins: MapPin[];
  activeId?: string | null;
  onHover?: (id: string | null) => void;
  /** Called after every pan/zoom with the ids of pins inside the view. */
  onBoundsChange?: (ids: string[]) => void;
  className?: string;
};

/* Google Maps when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set (as on C&W);
   otherwise Leaflet on OpenStreetMap tiles, which needs no key or
   billing account. */
const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const GOOGLE_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "DEMO_MAP_ID";

const PIN = (fill: string, scale = 1) =>
  `<svg width="${28 * scale}" height="${38 * scale}" viewBox="0 0 28 38" style="display:block;filter:drop-shadow(0 2px 2px rgba(0,0,0,.3))"><path d="M14 0C6.3 0 0 6.2 0 13.9 0 24.3 14 38 14 38s14-13.7 14-24.1C28 6.2 21.7 0 14 0z" fill="${fill}"/><circle cx="14" cy="14" r="5.5" fill="#fff"/></svg>`;
const COPPER = "#e0632a";
const NAVY = "#10263a";

/* Several units can share one building's coordinates; fan them out so
   every pin can be clicked. */
function spread(pins: MapPin[]) {
  const seen = new Map<string, number>();
  return pins.map((p) => {
    const key = `${p.lat},${p.lng}`;
    const n = seen.get(key) ?? 0;
    seen.set(key, n + 1);
    return { ...p, lat: p.lat + n * 0.0012 * Math.cos(n * 2.4), lng: p.lng + n * 0.0012 * Math.sin(n * 2.4) };
  });
}

function popupNode(p: MapPin) {
  const a = document.createElement("a");
  a.href = p.href;
  a.style.cssText = "display:block;width:220px;color:#1a1715;text-decoration:none;font-family:inherit";
  if (p.photo) {
    const img = document.createElement("img");
    img.src = p.photo;
    img.alt = "";
    img.style.cssText = "width:100%;height:120px;object-fit:cover;display:block;margin-bottom:8px";
    a.append(img);
  }
  const t = document.createElement("strong");
  t.textContent = p.title;
  t.style.cssText = `display:block;color:${NAVY};font-size:13px;line-height:1.3`;
  const s = document.createElement("span");
  s.textContent = p.sub;
  s.style.cssText = "display:block;color:#736b64;font-size:12px;margin-top:2px";
  const m = document.createElement("span");
  m.textContent = p.meta;
  m.style.cssText = "display:block;font-size:12px;font-weight:600;margin-top:4px";
  a.append(t, s, m);
  return a;
}

type Engine = {
  setActive: (id: string | null | undefined) => void;
  destroy: () => void;
};

export function ListingsMap({ pins, activeId, onHover, onBoundsChange, className = "" }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const engine = useRef<Engine | null>(null);
  const cb = useRef({ onHover, onBoundsChange });
  useEffect(() => { cb.current = { onHover, onBoundsChange }; });

  useEffect(() => {
    let cancelled = false;
    const placed = spread(pins);
    const start = GOOGLE_KEY ? startGoogle : startLeaflet;
    start(el.current!, placed, cb, () => !cancelled).then((e) => {
      if (cancelled) e.destroy();
      else engine.current = e;
    });
    return () => { cancelled = true; engine.current?.destroy(); engine.current = null; };
  }, [pins]);

  useEffect(() => { engine.current?.setActive(activeId); }, [activeId]);

  return <div ref={el} className={`z-0 bg-sunk ${className}`} role="region" aria-label="Map of listings" />;
}

type Cb = React.RefObject<{ onHover?: Props["onHover"]; onBoundsChange?: Props["onBoundsChange"] }>;

/* ---------------- Leaflet (no key) ---------------- */

const NOOP: Engine = { setActive() {}, destroy() {} };

async function startLeaflet(node: HTMLElement, pins: MapPin[], cb: Cb, alive: () => boolean): Promise<Engine> {
  const L = await import("leaflet");
  // A newer effect run owns the container now (Strict Mode, fast nav).
  if (!alive()) return NOOP;
  const map = L.map(node, { scrollWheelZoom: true, fadeAnimation: false, zoomControl: false })
    .setView([19.06, 73.02], 12);
  L.control.zoom({ position: "topright" }).addTo(map);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const icon = (fill: string, s = 1) => L.divIcon({
    className: "", html: PIN(fill, s), iconSize: [28 * s, 38 * s], iconAnchor: [14 * s, 38 * s], popupAnchor: [0, -34 * s],
  });
  const markers = new Map<string, import("leaflet").Marker>();
  for (const p of pins) {
    const m = L.marker([p.lat, p.lng], { icon: icon(COPPER), title: p.title, riseOnHover: true })
      .addTo(map).bindPopup(popupNode(p), { minWidth: 220, closeButton: false });
    m.on("mouseover", () => cb.current?.onHover?.(p.id));
    m.on("mouseout", () => cb.current?.onHover?.(null));
    markers.set(p.id, m);
  }

  const report = () => {
    const b = map.getBounds();
    cb.current?.onBoundsChange?.(pins.filter((p) => b.contains([p.lat, p.lng])).map((p) => p.id));
  };
  map.on("moveend", report);

  if (pins.length > 1) map.fitBounds(pins.map((p) => [p.lat, p.lng] as [number, number]), { padding: [50, 50], maxZoom: 14, animate: false });
  else if (pins.length === 1) map.setView([pins[0].lat, pins[0].lng], 15);
  // The container may have just been laid out; make sure tiles fill it.
  setTimeout(() => map.invalidateSize(), 0);

  return {
    setActive(id) {
      markers.forEach((m, k) => {
        m.setIcon(k === id ? icon(NAVY, 1.25) : icon(COPPER));
        m.setZIndexOffset(k === id ? 1000 : 0);
      });
    },
    destroy: () => map.remove(),
  };
}

/* ---------------- Google Maps (with key) ---------------- */

let googleLoading: Promise<void> | null = null;
function loadGoogle() {
  if (typeof google !== "undefined" && "importLibrary" in (google.maps ?? {})) return Promise.resolve();
  googleLoading ??= new Promise<void>((resolve, reject) => {
    const w = window as unknown as Record<string, unknown>;
    w.__mdMapsReady = () => resolve();
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_KEY)}&loading=async&callback=__mdMapsReady&v=weekly`;
    s.async = true;
    s.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.append(s);
  });
  return googleLoading;
}

async function startGoogle(node: HTMLElement, pins: MapPin[], cb: Cb, alive: () => boolean): Promise<Engine> {
  try {
    await loadGoogle();
  } catch {
    return startLeaflet(node, pins, cb, alive);
  }
  const { Map, InfoWindow } = (await google.maps.importLibrary("maps")) as google.maps.MapsLibrary;
  const { AdvancedMarkerElement } = (await google.maps.importLibrary("marker")) as google.maps.MarkerLibrary;
  if (!alive()) return NOOP;

  const map = new Map(node, {
    center: { lat: 19.06, lng: 73.02 }, zoom: 12, mapId: GOOGLE_MAP_ID,
    mapTypeControl: true, streetViewControl: false, fullscreenControl: true, gestureHandling: "greedy",
  });
  const info = new InfoWindow();
  const markers = new globalThis.Map<string, google.maps.marker.AdvancedMarkerElement>();

  for (const p of pins) {
    const content = document.createElement("div");
    content.innerHTML = PIN(COPPER);
    const m = new AdvancedMarkerElement({ map, position: { lat: p.lat, lng: p.lng }, title: p.title, content, gmpClickable: true });
    m.addListener("click", () => { info.setContent(popupNode(p)); info.open({ map, anchor: m }); });
    content.addEventListener("mouseenter", () => cb.current?.onHover?.(p.id));
    content.addEventListener("mouseleave", () => cb.current?.onHover?.(null));
    markers.set(p.id, m);
  }

  map.addListener("idle", () => {
    const b = map.getBounds();
    if (b) cb.current?.onBoundsChange?.(pins.filter((p) => b.contains({ lat: p.lat, lng: p.lng })).map((p) => p.id));
  });

  if (pins.length > 1) {
    const b = new google.maps.LatLngBounds();
    pins.forEach((p) => b.extend({ lat: p.lat, lng: p.lng }));
    map.fitBounds(b, 50);
  } else if (pins.length === 1) {
    map.setCenter({ lat: pins[0].lat, lng: pins[0].lng });
    map.setZoom(15);
  }

  return {
    setActive(id) {
      markers.forEach((m, k) => {
        (m.content as HTMLElement).innerHTML = k === id ? PIN(NAVY, 1.25) : PIN(COPPER);
        m.zIndex = k === id ? 1000 : 0;
      });
    },
    destroy() {
      markers.forEach((m) => (m.map = null));
      google.maps.event.clearInstanceListeners(map);
    },
  };
}
