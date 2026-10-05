/* The listing shape is owned by md-commercial: its admin panel writes
   these fields into listings.data (JSONB). Keep names identical so a
   row from Supabase and a seed record are interchangeable. */

export type LeaseTerms = {
  depositMonths: number | null;
  leaseTermMonths: number | null;
  lockInMonths: number | null;
  rentFreeDays: number | null;
  maintenancePsf: number | null;
  maintenancePaidBy: string;
  escalationMonths: number | null;
  escalationPct: number | null;
};

export type Listing = {
  id: string;
  ref: string;
  txn: "lease" | "sale" | "preleased" | string;
  spaceType: string;
  spaceCondition: string;
  name: string;
  wing: string;
  locality: string;
  city: string;
  address: string;
  description: string;
  highlights?: string[];
  photos: string[];
  mediaLabels?: string[];
  video: string;
  floorPlan: string;
  carpetArea: number | null;
  chargeableArea: number | null;
  areaBasis: "carpet" | "chargeable" | string;
  price: number | null;
  pricePsf: number | null;
  priceVisible: boolean;
  isNegotiable: boolean;
  floorNumber: string;
  unitNumber: string;
  seatingCapacity: number | null;
  itOrNonIt: string;
  handoverDate: string;
  isReady: boolean | null;
  availability: string;
  carParkFree: number | null;
  carParkExtra: number | null;
  twoWheelerFree: number | null;
  twoWheelerExtra: number | null;
  terms: LeaseTerms;
  listedBy: string;
  listedOn: string;
  lat?: number | null;
  lng?: number | null;
  updatedAt?: string;
};

export type Broker = {
  id: string;
  name: string;
  role: string;
  city: string;
  localities: string[];
  phone?: string;
  photo?: string;
};
