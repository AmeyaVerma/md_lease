"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export type MapPin = { id: string; title: string; href: string; sub: string; lat: number; lng: number };

/* OpenStreetMap via Leaflet: no API key, no billing. Leaflet touches
   `window` on import, so it is loaded inside the effect. */
export function ListingsMap({ pins, className = "" }: { pins: MapPin[]; className?: string }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !el.current) return;
      map = L.map(el.current, { scrollWheelZoom: false, fadeAnimation: false }).setView([19.06, 73.02], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const icon = L.divIcon({
        className: "",
        html: '<svg width="28" height="38" viewBox="0 0 28 38"><path d="M14 0C6.3 0 0 6.2 0 13.9 0 24.3 14 38 14 38s14-13.7 14-24.1C28 6.2 21.7 0 14 0z" fill="#e0632a"/><circle cx="14" cy="14" r="5.5" fill="#fff"/></svg>',
        iconSize: [28, 38],
        iconAnchor: [14, 38],
        popupAnchor: [0, -34],
      });

      // Listings in the same building share a locality centre; fan them
      // out slightly so every pin stays clickable.
      const seen = new Map<string, number>();
      const bounds: [number, number][] = [];
      for (const p of pins) {
        const key = `${p.lat},${p.lng}`;
        const n = seen.get(key) ?? 0;
        seen.set(key, n + 1);
        const pos: [number, number] = [p.lat + n * 0.0012 * Math.cos(n * 2.4), p.lng + n * 0.0012 * Math.sin(n * 2.4)];
        bounds.push(pos);
        const popup = document.createElement("div");
        const link = document.createElement("a");
        link.href = p.href;
        link.textContent = p.title;
        link.style.cssText = "font-weight:700;color:#10263a;display:block;margin-bottom:2px";
        const sub = document.createElement("span");
        sub.textContent = p.sub;
        sub.style.color = "#736b64";
        popup.append(link, sub);
        L.marker(pos, { icon, title: p.title }).addTo(map).bindPopup(popup);
      }
      if (bounds.length > 1) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      else if (bounds.length === 1) map.setView(bounds[0], 15);
    });

    return () => { cancelled = true; map?.remove(); };
  }, [pins]);

  return <div ref={el} className={`z-0 bg-sunk ${className}`} role="region" aria-label="Map of listings" />;
}
