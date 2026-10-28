// Central site configuration — single source of truth.
// Contact values here are FALLBACKS: the live site prefers values saved in
// Admin → Settings (stored in the database) whenever they exist.

export const BUSINESS_NAME = "Roam Saathi";
export const TAGLINE = "Your Northeast Road Companion";
export const EMAIL = "saathiroam@gmail.com";

// PLACEHOLDER — owner must replace with the actual personal mobile number.
export const BUSINESS_PHONE = "+919876543210";
export const BUSINESS_PHONE_DISPLAY = "+91 98XXX XXXXX";

// WhatsApp number — digits only, no plus sign, no spaces.
export const WHATSAPP_NUMBER = "919876543210";

export const ADDRESS_LINE =
  "Near Lokpriya Gopinath Bordoloi International Airport, Borjhar, Guwahati, Assam 781015";
export const HOURS = "Open 24/7 · Airport pickup anytime";

export const SERVICE_AREAS = [
  "Guwahati",
  "LGBI Airport",
  "Shillong",
  "Kaziranga",
  "Cherrapunji",
  "Tawang",
  "Majuli",
  "All Northeast India",
];

// Soft passcode gate for the admin portal (also stored in DB settings as
// adminPasscode — the portal checks the DB value first, then this fallback).
export const ADMIN_PASSCODE = "roam2024";

// LGBI Airport coordinates (Borjhar, Guwahati)
export const GEO_LAT = 26.1061;
export const GEO_LNG = 91.5869;

// Canonical site URL — update when the real domain is live.
export const SITE_URL = "https://roamsaathi.in";

// Vehicle classes offered (single source of truth for selects & filters).
export const VEHICLE_CLASSES = [
  "SUV",
  "HATCHBACK",
  "SEDAN",
  "SCOOTER",
  "BIKE",
  "VAN",
] as const;
export type VehicleClass = (typeof VEHICLE_CLASSES)[number];

// Booking pipeline statuses (single source of truth).
export const BOOKING_STATUSES = [
  "New",
  "Contacted",
  "Confirmed",
  "Ongoing",
  "Completed",
  "Cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

// Pickup types.
export const PICKUP_TYPES = [
  "Airport counter",
  "Hotel delivery",
  "Other",
] as const;

// Fuel & transmission options (admin fleet form).
export const FUEL_TYPES = ["Petrol", "Diesel", "Electric"] as const;
export const TRANSMISSIONS = ["Manual", "Automatic"] as const;

/* ------------------------------------------------------------------ */
/* v3 — Fuel & toll policy (the owner cannot quote one fuel price for  */
/* every route: Shillong, Cherrapunji, Tawang etc. burn very different */
/* amounts. So: WITH DRIVER = fuel/toll included; SELF-DRIVE = at      */
/* actuals. Both texts are admin-editable and shown at booking time.)  */
/* ------------------------------------------------------------------ */

export const DEFAULT_FUEL_PRICE_PER_LITRE = 100;

export const DEFAULT_POLICY_WITH_DRIVER =
  "Fuel, toll, parking and driver charges are fully included in the quoted fare — nothing extra to pay on the way.";

export const DEFAULT_POLICY_SELF_DRIVE =
  "Fuel, toll, parking, state permits and entry fees are NOT included — you pay at actuals. The vehicle comes with a full tank and should be returned full. Hill routes (Shillong, Cherrapunji, Tawang) climb a lot, so expect noticeably higher consumption than city driving.";

export const DEFAULT_BOOKING_DISCLAIMER =
  "With driver: fuel, toll & parking included in the fare. Self-drive: fuel, toll, permits & parking paid by you at actuals — hill and remote routes (Shillong, Cherrapunji, Tawang) consume more fuel. Estimates shown are indicative only.";

// One-way road distance from Guwahati (approx) — powers the fuel estimator.
// Fully editable from Admin → Settings → Destinations.
export type Destination = { name: string; km: number };

export const DEFAULT_DESTINATIONS: Destination[] = [
  { name: "Guwahati city", km: 25 },
  { name: "Shillong", km: 100 },
  { name: "Cherrapunji (Sohra)", km: 150 },
  { name: "Kaziranga National Park", km: 200 },
  { name: "Majuli", km: 350 },
  { name: "Dirang", km: 380 },
  { name: "Tawang", km: 450 },
];

// Default Google Maps embed (no API key needed). Admin can paste their own
// embed code / share link from Admin → Settings — it replaces this one.
export const DEFAULT_MAP_EMBED =
  "https://www.google.com/maps?q=Lokpriya+Gopinath+Bordoloi+International+Airport,+Borjhar,+Guwahati,+Assam&output=embed";

/** Extract a safe embeddable URL from a pasted iframe / share link / URL. */
export function sanitizeMapEmbed(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  // 1. If they pasted a full <iframe ...> snippet, pull out the src.
  const iframe = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  const candidate = (iframe ? iframe[1] : trimmed).trim();
  // 2. Only allow Google Maps URLs.
  if (!/^https:\/\/(www\.|maps\.)?google\.[a-z.]+\/maps/i.test(candidate) &&
      !/^https:\/\/maps\.google\.[a-z.]+/i.test(candidate) &&
      !/^https:\/\/www\.google\.[a-z.]+\/maps\/embed/i.test(candidate)) {
    return null;
  }
  return candidate;
}

/* ------------------------------------------------------------------ */
/* v3 — No-code page builder types (blogs, diaries, stories, policies) */
/* ------------------------------------------------------------------ */

export type PageBlock =
  | { type: "heading"; text: string; level?: 2 | 3 }
  | { type: "text"; text: string }
  | { type: "image"; src: string; caption?: string }
  | { type: "gallery"; images: string[] }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "quote"; text: string; author?: string }
  | { type: "callout"; title?: string; text: string; tone?: "green" | "amber" | "cream" }
  | { type: "cta"; title?: string; text?: string; buttonLabel: string; action: "whatsapp" | "phone" | "link"; url?: string }
  | { type: "divider" };

export const PAGE_TYPES = [
  { key: "blog", label: "Blog / Travel Guide" },
  { key: "travel-diary", label: "Travel Diary" },
  { key: "customer-story", label: "Customer Story / Review" },
  { key: "policy", label: "Policy / Rules" },
  { key: "custom", label: "Custom Page" },
] as const;

export const PAGE_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  PAGE_TYPES.map((t) => [t.key, t.label])
);

export type PageDTO = {
  id: string;
  title: string;
  slug: string;
  type: string;
  parentId: string | null;
  excerpt: string;
  coverImage: string | null;
  blocks: string; // JSON array of PageBlock
  visibleOnHome: boolean;
  showInMenu: boolean;
  published: boolean;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  createdAt: string;
  updatedAt: string;
};

/* ------------------------------------------------------------------ */
/* v4 — Stays & Partners (hotel directory)                              */
/* ------------------------------------------------------------------ */

export const HOTEL_CATEGORIES = [
  "Budget",
  "Standard",
  "Premium",
  "Resort",
  "Homestay",
] as const;

export const HOTEL_CATEGORY_STYLES: Record<string, string> = {
  Budget: "bg-stone-100 text-stone-700 border-stone-300",
  Standard: "bg-forest/10 text-forest border-forest/25",
  Premium: "bg-saffron/15 text-saffron-deep border-saffron/40",
  Resort: "bg-emerald-100/80 text-emerald-800 border-emerald-300/70",
  Homestay: "bg-amber-100/70 text-amber-800 border-amber-300/60",
};

export type HotelDTO = {
  id: string;
  name: string;
  state: string;
  city: string;
  area: string | null;
  phone: string;
  whatsapp: string | null;
  priceFrom: number | null;
  category: string;
  description: string;
  amenities: string | null;
  images: string; // JSON array of image URLs / data URLs
  bookingUrl: string | null;
  mapUrl: string | null;
  partner: boolean;
  featured: boolean;
  showOnSite: boolean;
  sortOrder: number;
};

/** Parse the JSON image array stored on a hotel row. */
export function hotelImages(h: Pick<HotelDTO, "images">): string[] {
  try {
    const arr = JSON.parse(h.images || "[]");
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string" && x) : [];
  } catch {
    return [];
  }
}

/** Parse the comma-separated amenity list. */
export function hotelAmenities(h: Pick<HotelDTO, "amenities">): string[] {
  if (!h.amenities) return [];
  return h.amenities
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
}

/** Format a hotel phone for display (+91 98XXX XXXXX when 10 digits). */
export function hotelPhoneDisplay(phone: string): string {
  const raw = phone.replace(/\D/g, "");
  if (/^91\d{10}$/.test(raw)) {
    const local = raw.slice(2);
    return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
  }
  if (/^\d{10}$/.test(raw)) {
    return `+91 ${raw.slice(0, 5)} ${raw.slice(5)}`;
  }
  return phone;
}

// Vehicle shape shared between server, customer view and admin portal.
export type VehicleDTO = {
  id: string;
  name: string;
  brand: string | null;
  class: string;
  seats: number;
  transmission: string;
  fuelType: string;
  dailyRate: number;
  withDriverPerDay: number | null;
  withDriverAvailable: boolean;
  monthlyRate: number | null;
  kmLimitPerDay: number | null;
  extraKmRate: number | null;
  securityDeposit: number | null;
  driverBata: number | null;
  mileageKmpl: number | null;
  fuelNote: string | null;
  registrationNumber: string | null;
  imageUrl: string | null;
  features: string | null;
  description: string;
  available: boolean;
  popular: boolean;
  sortOrder: number;
};

export type BookingDTO = {
  id: string;
  name: string;
  phone: string;
  pickupType: string;
  pickupLocation: string | null;
  pickupDate: string;
  returnDate: string;
  vehicleClass: string;
  vehicleName: string | null;
  destination: string | null;
  withDriver: boolean;
  estimatedTotal: number | null;
  message: string | null;
  status: string;
  createdAt: string;
};

export type SettingsMap = Record<string, string>;

/** Resolve a setting: DB value first, static fallback second. */
export function resolveSetting(
  key: "businessPhone" | "whatsappNumber" | "email" | "hours" | "address",
  settings: SettingsMap | undefined
): string {
  const dbVal = settings?.[key];
  if (dbVal && dbVal.trim() !== "") return dbVal.trim();
  switch (key) {
    case "businessPhone":
      return BUSINESS_PHONE;
    case "whatsappNumber":
      return WHATSAPP_NUMBER;
    case "email":
      return EMAIL;
    case "hours":
      return HOURS;
    case "address":
      return ADDRESS_LINE;
  }
}

/** Format INR compactly: 3500 -> "Rs 3,500". */
export function inr(n: number | null | undefined): string {
  if (n == null) return "—";
  return "Rs " + n.toLocaleString("en-IN");
}
