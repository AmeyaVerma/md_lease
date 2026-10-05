import type { LeaseTerms, Listing } from "./types";

/* Static lease listings, copied from md-commercial/assets/js/data.js
   (MD-0001 … MD-0006). They keep the site populated while the shared
   database has no published lease rows; any database row with the same
   id replaces its seed record. Lease terms, unit numbers and parking
   are [SAMPLE] values in the source — replace before launch. */

function T(dep: number, term: number, lock: number, free: number, maint: number,
  paidBy: string, escM: number, escP: number): LeaseTerms {
  return {
    depositMonths: dep, leaseTermMonths: term, lockInMonths: lock, rentFreeDays: free,
    maintenancePsf: maint, maintenancePaidBy: paidBy, escalationMonths: escM, escalationPct: escP,
  };
}

const EMPTY_TERMS: LeaseTerms = T(0, 0, 0, 0, 0, "", 0, 0);

export function normalise(o: Partial<Listing> & { id: string }): Listing {
  return {
    ref: o.id, txn: "lease", spaceType: "", spaceCondition: "", name: "", wing: "",
    locality: "", city: "", address: "", description: "", photos: [], video: "",
    floorPlan: "", carpetArea: null, chargeableArea: null, areaBasis: "chargeable",
    price: null, pricePsf: null, priceVisible: true, isNegotiable: true,
    floorNumber: "", unitNumber: "", seatingCapacity: null, itOrNonIt: "",
    handoverDate: "", isReady: null, availability: "ready",
    carParkFree: null, carParkExtra: null, twoWheelerFree: null, twoWheelerExtra: null,
    listedBy: "", listedOn: "",
    ...o,
    terms: { ...EMPTY_TERMS, ...(o.terms ?? {}) },
  };
}

const BIZHUB_ADDR = "Thane–Belapur Road, adjacent to IKEA, Turbhe, Navi Mumbai";

export const seedListings: Listing[] = [
  normalise({ id: "MD-0001", txn: "lease", spaceType: "showroom", spaceCondition: "bare",
    name: "Goodwill BizHub", wing: "Ground Floor Showroom", locality: "Turbhe", city: "Navi Mumbai",
    address: BIZHUB_ADDR,
    description: "Double-height ground floor showroom on the Thane–Belapur Road frontage, five minutes from Turbhe station. Sixteen-foot ceiling, direct loading access.",
    photos: ["/img/retail-street-01.jpg", "/img/tower-front.jpg", "/img/office-bare-01.jpg"],
    video: "/video/bizhub-walkthrough.mp4",
    carpetArea: 1850, chargeableArea: 2960, areaBasis: "carpet",
    price: 536500, pricePsf: 290, floorNumber: "Ground", unitNumber: "G-04",
    itOrNonIt: "Non IT / Commercial", handoverDate: "Ready to move", isReady: true, availability: "ready",
    carParkFree: 2, carParkExtra: 4500, twoWheelerFree: 4, twoWheelerExtra: 1200,
    terms: T(6, 60, 36, 45, 12, "Tenant", 36, 15), listedOn: "12 Sep 2026" }),

  normalise({ id: "MD-0002", txn: "lease", spaceType: "retail", spaceCondition: "warm",
    name: "Goodwill BizHub", wing: "Ground Floor Retail", locality: "Turbhe", city: "Navi Mumbai",
    address: BIZHUB_ADDR,
    description: "Retail unit in the ground floor arcade, facing the internal driveway. Suited to a service brand or a specialty F&B format.",
    photos: ["/img/tower-green-01.jpg", "/img/retail-street-01.jpg"],
    carpetArea: 940, chargeableArea: 1500, areaBasis: "carpet",
    price: 178600, pricePsf: 190, floorNumber: "Ground", unitNumber: "G-11",
    itOrNonIt: "Non IT / Commercial", handoverDate: "Ready to move", isReady: true, availability: "ready",
    carParkFree: 1, carParkExtra: 4500, twoWheelerFree: 2, twoWheelerExtra: 1200,
    terms: T(6, 60, 36, 30, 12, "Tenant", 36, 15), listedOn: "12 Sep 2026" }),

  normalise({ id: "MD-0003", txn: "lease", spaceType: "msme", spaceCondition: "bare",
    name: "Goodwill BizHub", wing: "Tower A", locality: "Turbhe", city: "Navi Mumbai",
    address: BIZHUB_ADDR,
    description: "MSME unit on the third floor. Column-free floor plate, sixteen-foot clear height, 10 KVA connected load and a dedicated loading bay on the floor.",
    photos: ["/img/industrial-01.jpg", "/img/industrial-02.jpg"],
    carpetArea: 3400, chargeableArea: 5440, areaBasis: "carpet",
    price: 374000, pricePsf: 110, floorNumber: "3rd", unitNumber: "304", seatingCapacity: 85,
    itOrNonIt: "Non IT / Commercial", handoverDate: "Ready to move", isReady: true, availability: "ready",
    carParkFree: 3, carParkExtra: 4000, twoWheelerFree: 6, twoWheelerExtra: 1000,
    terms: T(6, 60, 36, 60, 10, "Tenant", 36, 15), listedOn: "10 Sep 2026" }),

  normalise({ id: "MD-0004", txn: "lease", spaceType: "office", spaceCondition: "plug",
    name: "Goodwill BizHub", wing: "Tower A", locality: "Turbhe", city: "Navi Mumbai",
    address: BIZHUB_ADDR,
    description: "Fitted office on the fifth floor with 60 workstations, three cabins and a boardroom in place. Available for immediate occupation.",
    photos: ["/img/office-fitted-01.jpg", "/img/office-fitted-02.jpg"],
    carpetArea: 2100, chargeableArea: 3360, areaBasis: "carpet",
    price: 252000, pricePsf: 120, floorNumber: "5th", unitNumber: "512", seatingCapacity: 60,
    itOrNonIt: "IT", handoverDate: "Ready to move", isReady: true, availability: "ready",
    carParkFree: 2, carParkExtra: 4000, twoWheelerFree: 4, twoWheelerExtra: 1000,
    terms: T(6, 36, 24, 30, 10, "Tenant", 12, 5), listedOn: "09 Sep 2026" }),

  normalise({ id: "MD-0005", txn: "lease", spaceType: "office", spaceCondition: "bare",
    name: "Meghna Commercial Tower", wing: "MIDC Nerul", locality: "Nerul", city: "Navi Mumbai",
    address: "MIDC Industrial Area, Nerul, Navi Mumbai 400705",
    description: "Bare shell office on a high floor of a G+21 tower with a 180-degree hill view. Private washroom in the unit, heat-protected glass, soundproof windows.",
    photos: ["/img/tower-angle.jpg", "/img/office-bare-02.jpg"],
    carpetArea: 1620, chargeableArea: 2590, areaBasis: "chargeable",
    price: 233100, pricePsf: 90, floorNumber: "14th", unitNumber: "1402", seatingCapacity: 40,
    itOrNonIt: "IT", handoverDate: "Mar 2027", isReady: false, availability: "6m",
    carParkFree: 2, carParkExtra: 5000, twoWheelerFree: 2, twoWheelerExtra: 1200,
    terms: T(9, 60, 36, 90, 14, "Tenant", 36, 15), listedOn: "08 Sep 2026" }),

  normalise({ id: "MD-0006", txn: "lease", spaceType: "fnb", spaceCondition: "warm",
    name: "Vihaan Atlantis", wing: "Retail Podium", locality: "Kharghar", city: "Navi Mumbai",
    address: "Plot 34, 35 & 36, Sector 14, Kharghar, Navi Mumbai",
    description: "Corner F&B unit on the retail podium with terrace rights, facing the sector road. Grease trap and exhaust shaft provided.",
    photos: ["/img/retail-street-01.jpg", "/img/rooftop-deck.jpg"],
    carpetArea: 1240, chargeableArea: 1980, areaBasis: "carpet",
    price: 223200, pricePsf: 180, floorNumber: "Ground", unitNumber: "S-02",
    itOrNonIt: "Non IT / Commercial", handoverDate: "Dec 2029", isReady: false, availability: "later",
    carParkFree: 2, carParkExtra: 5500, twoWheelerFree: 3, twoWheelerExtra: 1500,
    terms: T(6, 90, 60, 120, 15, "Tenant", 36, 15), listedOn: "11 Sep 2026" }),
];
