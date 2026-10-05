import type { Broker } from "./types";

/* Brand, contact and taxonomy. Mirrors MD.config / MD.taxonomy in
   md-commercial/assets/js/data.js — change both together. */

export const site = {
  name: "MD Group",
  tagline: "Where Vision Meets Wealth.",
  blurb:
    "Commercial space for lease across Navi Mumbai — sourced, verified and negotiated by people who work these micro-markets every day.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  phoneDisplay: "+91 98201 00715 / +91 97691 43009",
  email: "mdgroup108@gmail.com",
  whatsapp: "919820100715",
  address:
    "810, Niharika Mirage, Plot No-274, Sector-10, Kharghar, Navi Mumbai, Maharashtra 410210",
  contacts: [
    { name: "Mukesh Vishwakarma", phone: "9820100715", whatsapp: "919820100715" },
    { name: "Deepak Sharma", phone: "9769143009", whatsapp: "919769143009" },
  ],
  /* Shown under the hero until the developers' own photography arrives. */
  photoCredit: "Stock photography — placeholder",
  stats: [
    { value: "5", label: "Projects represented" },
    { value: "1.4 mn", label: "Sq ft under mandate" },
    { value: "6", label: "Micro-markets covered" },
    { value: "4", label: "Developer partners" },
  ],
  partners: [
    "Goodwill Developers",
    "Vihaan Realty",
    "Dream Developers",
    "Meghna Builders",
    "CIDCO",
    "MIDC",
  ],
};

export const spaceTypes: Record<string, string> = {
  office: "Office",
  retail: "Retail",
  showroom: "Showroom",
  msme: "MSME / Industrial",
  fnb: "F&B",
  multi: "Multi Purpose",
};

export const spaceConditions: Record<string, string> = {
  bare: "Bare Shell",
  warm: "Warm Shell",
  semi: "Semi Fitted",
  fitted: "Fully Fitted",
  plug: "Plug & Play",
};

export const availabilityLabels: Record<string, string> = {
  ready: "Available",
  "3m": "Available in 3 months",
  "6m": "Available in 6 months",
  later: "Available in future",
};

export const sizeBands: { label: string; min: number; max: number }[] = [
  { label: "Under 1,000", min: 0, max: 1000 },
  { label: "1,000 – 2,500", min: 1000, max: 2500 },
  { label: "2,500 – 5,000", min: 2500, max: 5000 },
  { label: "5,000 – 10,000", min: 5000, max: 10000 },
  { label: "10,000+", min: 10000, max: Infinity },
];

/* Approximate locality centres. Used for the map when a listing has
   no lat/lng of its own — pins land on the locality, not the door. */
export const localityCoords: Record<string, [number, number]> = {
  Turbhe: [19.0745, 73.0169],
  Kharghar: [19.0473, 73.0699],
  Nerul: [19.0338, 73.0196],
  Vashi: [19.0771, 72.9986],
  Belapur: [19.0235, 73.0397],
  Koparkhairane: [19.1036, 73.0079],
  Panvel: [18.9894, 73.1175],
  "Wagle Estate": [19.2008, 72.9575],
  "Ghodbunder Road": [19.2522, 72.9757],
  Majiwada: [19.2183, 72.9781],
  "Andheri (E)": [19.1136, 72.8697],
  Powai: [19.1176, 72.906],
  BKC: [19.0662, 72.8677],
};

export const brokers: Broker[] = [
  { id: "TM-1", name: "Mukesh Vishwakarma", role: "Partner", city: "Navi Mumbai",
    localities: ["Turbhe", "Kharghar", "Nerul", "Vashi"], phone: "9820100715" },
  { id: "TM-2", name: "Deepak Sharma", role: "Partner", city: "Navi Mumbai",
    localities: ["Kharghar", "Belapur", "Nerul"], phone: "9769143009" },
];

export const label = (map: Record<string, string>, id: string) => map[id] ?? id;
