/**
 * One-time database provisioning for Roam Saathi (v3).
 *
 * Used by /api/setup (and test scripts) to:
 *   1. Create the Vehicle / Booking / Settings / Page tables if they do not
 *      exist (raw DDL — works on hosted Postgres like Neon, Supabase,
 *      Prisma Postgres; the same statements are also valid on SQLite).
 *   2. Upgrade older databases by adding the v3 columns (mileageKmpl,
 *      fuelNote) when missing — safe to re-run.
 *   3. Seed the 17-vehicle rate card, default settings AND the starter
 *      content pages (Rules & Policies + samples) — but ONLY when the
 *      tables are empty, so re-running never overwrites real data.
 *
 * The DDL mirrors what `prisma migrate diff` generates for
 * prisma/schema.postgres.prisma, so the Prisma client and the raw tables
 * are always in agreement.
 */

import { hashPassword, DEFAULT_PASSWORD } from "./auth";

export const VEHICLE_DDL = `
CREATE TABLE IF NOT EXISTS "Vehicle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "class" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "transmission" TEXT NOT NULL DEFAULT 'Manual',
    "fuelType" TEXT NOT NULL DEFAULT 'Petrol',
    "dailyRate" INTEGER NOT NULL,
    "withDriverPerDay" INTEGER,
    "withDriverAvailable" BOOLEAN NOT NULL DEFAULT true,
    "monthlyRate" INTEGER,
    "kmLimitPerDay" INTEGER,
    "extraKmRate" INTEGER,
    "securityDeposit" INTEGER,
    "driverBata" INTEGER,
    "mileageKmpl" INTEGER,
    "fuelNote" TEXT,
    "registrationNumber" TEXT,
    "imageUrl" TEXT,
    "features" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "available" BOOLEAN NOT NULL DEFAULT true,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
)`;

export const BOOKING_DDL = `
CREATE TABLE IF NOT EXISTS "Booking" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "pickupType" TEXT NOT NULL,
    "pickupLocation" TEXT,
    "pickupDate" TIMESTAMP(3) NOT NULL,
    "returnDate" TIMESTAMP(3) NOT NULL,
    "vehicleClass" TEXT NOT NULL,
    "vehicleName" TEXT,
    "destination" TEXT,
    "withDriver" BOOLEAN NOT NULL DEFAULT false,
    "estimatedTotal" INTEGER,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'New',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
)`;

export const SETTINGS_DDL = `
CREATE TABLE IF NOT EXISTS "Settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
)`;

export const PAGE_DDL = `
CREATE TABLE IF NOT EXISTS "Page" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'custom',
    "parentId" TEXT,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "coverImage" TEXT,
    "blocks" TEXT NOT NULL DEFAULT '[]',
    "visibleOnHome" BOOLEAN NOT NULL DEFAULT false,
    "showInMenu" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
)`;

export const HOTEL_DDL = `
CREATE TABLE IF NOT EXISTS "Hotel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Assam',
    "city" TEXT NOT NULL,
    "area" TEXT,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "priceFrom" INTEGER,
    "category" TEXT NOT NULL DEFAULT 'Standard',
    "description" TEXT NOT NULL DEFAULT '',
    "amenities" TEXT,
    "images" TEXT NOT NULL DEFAULT '[]',
    "bookingUrl" TEXT,
    "mapUrl" TEXT,
    "partner" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "showOnSite" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
)`;

// v6 — Customers (CRM + KYC) and one-time e-sign Agreements.
export const CUSTOMER_DDL = `
CREATE TABLE IF NOT EXISTS "Customer" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "altPhone" TEXT,
    "email" TEXT,
    "addressLine" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "dob" TEXT,
    "idProofType" TEXT,
    "idProofNumber" TEXT,
    "idProofDoc" TEXT,
    "addressProofType" TEXT,
    "addressProofNumber" TEXT,
    "addressProofDoc" TEXT,
    "dlNumber" TEXT,
    "dlExpiry" TEXT,
    "dlDoc" TEXT,
    "source" TEXT NOT NULL DEFAULT 'WhatsApp',
    "sourceNote" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
)`;

export const AGREEMENT_DDL = `
CREATE TABLE IF NOT EXISTS "Agreement" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT,
    "customerId" TEXT NOT NULL,
    "vehicleName" TEXT,
    "registrationNumber" TEXT,
    "rentalStart" TEXT,
    "rentalEnd" TEXT,
    "pickupPoint" TEXT,
    "dropPoint" TEXT,
    "rateSummary" TEXT,
    "depositAmount" TEXT,
    "extraTerms" TEXT,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "signedAt" TIMESTAMP(3),
    "signerName" TEXT,
    "signatureImage" TEXT,
    "signatureType" TEXT,
    "signerIp" TEXT,
    "signerUa" TEXT,
    "signedPdf" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Agreement_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Agreement_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE
)`;

export const INDEX_DDLS = [
  `CREATE UNIQUE INDEX IF NOT EXISTS "Settings_key_key" ON "Settings"("key")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Page_slug_key" ON "Page"("slug")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Agreement_tokenHash_key" ON "Agreement"("tokenHash")`,
  `CREATE INDEX IF NOT EXISTS "Agreement_customerId_idx" ON "Agreement"("customerId")`,
];

// v3 upgrade path for databases created before v3 (ALTERs are idempotent
// by try/catch — "duplicate column" errors are ignored). Also exported for
// sandbox patch scripts.
export const UPGRADE_DDLS = [
  PAGE_DDL,
  HOTEL_DDL,
  CUSTOMER_DDL,
  AGREEMENT_DDL,
  ...INDEX_DDLS,
  `ALTER TABLE "Vehicle" ADD COLUMN "mileageKmpl" INTEGER`,
  `ALTER TABLE "Vehicle" ADD COLUMN "fuelNote" TEXT`,
  `ALTER TABLE "Page" ADD COLUMN "seoTitle" TEXT`,
  `ALTER TABLE "Page" ADD COLUMN "seoKeywords" TEXT`,
];

// ---------------------------------------------------------------------------
// Seed data — identical to prisma/seed.ts (17 vehicles, full rate card).
// mileageKmpl powers the booking fuel estimator; fuelNote shows on cards.
// ---------------------------------------------------------------------------

type SeedVehicle = {
  name: string;
  brand: string;
  class: string;
  seats: number;
  transmission: string;
  fuelType: string;
  dailyRate: number;
  withDriverPerDay: number | null;
  withDriverAvailable: boolean;
  kmLimitPerDay: number | null;
  extraKmRate: number | null;
  securityDeposit: number;
  driverBata: number | null;
  mileageKmpl: number | null;
  fuelNote: string | null;
  // Optional in seed data — provisionDatabase applies IMG[class] at insert time.
  imageUrl?: string;
  features: string;
  description: string;
  popular: boolean;
  sortOrder: number;
};

export const IMG: Record<string, string> = {
  SUV: "/fleet-suv.png",
  HATCHBACK: "/fleet-hatchback.png",
  SEDAN: "/fleet-hatchback.png",
  SCOOTER: "/fleet-scooter.png",
  BIKE: "/fleet-scooter.png",
  VAN: "/fleet-van.png",
};

export const SEED_VEHICLES: SeedVehicle[] = [
  // ---------------- SUVs ----------------
  {
    name: "Mahindra Thar 4x4", brand: "Mahindra", class: "SUV", seats: 4,
    transmission: "Manual", fuelType: "Diesel",
    dailyRate: 3500, withDriverPerDay: 4500, withDriverAvailable: true,
    kmLimitPerDay: 150, extraKmRate: 12, securityDeposit: 5000, driverBata: null,
    mileageKmpl: 14, fuelNote: "High consumption on hills — plan fuel stops in advance.",
    features: "4x4, AC, Bluetooth, Roof rails, Rugged tyres",
    description: "Rugged 4x4 — the favourite for Tawang, Mechuka and off-road Northeast routes. Self-drive or chauffeur.",
    popular: true, sortOrder: 1,
  },
  {
    name: "Mahindra Scorpio N", brand: "Mahindra", class: "SUV", seats: 7,
    transmission: "Manual", fuelType: "Diesel",
    dailyRate: 3200, withDriverPerDay: 4200, withDriverAvailable: true,
    kmLimitPerDay: 150, extraKmRate: 12, securityDeposit: 5000, driverBata: null,
    mileageKmpl: 14, fuelNote: null,
    features: "7-seater, AC, Touchscreen, Cruise control, Big boot",
    description: "Spacious 7-seater SUV for family trips to Shillong, Cherrapunji and Kaziranga.",
    popular: true, sortOrder: 2,
  },
  {
    name: "Maruti Ertiga", brand: "Maruti Suzuki", class: "SUV", seats: 7,
    transmission: "Manual", fuelType: "Petrol",
    dailyRate: 2600, withDriverPerDay: 3400, withDriverAvailable: true,
    kmLimitPerDay: 150, extraKmRate: 10, securityDeposit: 4000, driverBata: null,
    mileageKmpl: 18, fuelNote: null,
    features: "7-seater, AC, Bluetooth, Mileage friendly",
    description: "Comfortable 7-seater MUV — great value for family tours and airport transfers.",
    popular: false, sortOrder: 3,
  },
  {
    name: "Hyundai Creta", brand: "Hyundai", class: "SUV", seats: 5,
    transmission: "Manual", fuelType: "Diesel",
    dailyRate: 3000, withDriverPerDay: 4000, withDriverAvailable: true,
    kmLimitPerDay: 150, extraKmRate: 12, securityDeposit: 5000, driverBata: null,
    mileageKmpl: 17, fuelNote: null,
    features: "AC, Touchscreen, Reverse camera, Sunroof",
    description: "Premium compact SUV — smooth highway cruiser for Shillong and Meghalaya circuits.",
    popular: false, sortOrder: 4,
  },
  // ---------------- Hatchbacks ----------------
  {
    name: "Maruti Swift", brand: "Maruti Suzuki", class: "HATCHBACK", seats: 5,
    transmission: "Manual", fuelType: "Petrol",
    dailyRate: 1700, withDriverPerDay: 2400, withDriverAvailable: true,
    kmLimitPerDay: 150, extraKmRate: 8, securityDeposit: 2000, driverBata: null,
    mileageKmpl: 20, fuelNote: null,
    features: "AC, Bluetooth, Power steering, Great mileage",
    description: "Zippy and fuel-efficient — ideal for Guwahati city tours and short airport runs.",
    popular: true, sortOrder: 5,
  },
  {
    name: "Hyundai i10 Nios", brand: "Hyundai", class: "HATCHBACK", seats: 5,
    transmission: "Manual", fuelType: "Petrol",
    dailyRate: 1500, withDriverPerDay: 2200, withDriverAvailable: true,
    kmLimitPerDay: 150, extraKmRate: 8, securityDeposit: 2000, driverBata: null,
    mileageKmpl: 19, fuelNote: null,
    features: "AC, Bluetooth, Compact, Easy parking",
    description: "Compact city car that is easy to park and light on fuel.",
    popular: false, sortOrder: 6,
  },
  {
    name: "Tata Tiago", brand: "Tata", class: "HATCHBACK", seats: 5,
    transmission: "Manual", fuelType: "Petrol",
    dailyRate: 1500, withDriverPerDay: 2100, withDriverAvailable: true,
    kmLimitPerDay: 150, extraKmRate: 8, securityDeposit: 2000, driverBata: null,
    mileageKmpl: 20, fuelNote: null,
    features: "AC, Bluetooth, 4-star safety, Harman audio",
    description: "Safe, solid city hatchback with a punchy audio system.",
    popular: false, sortOrder: 7,
  },
  {
    name: "Maruti Alto", brand: "Maruti Suzuki", class: "HATCHBACK", seats: 5,
    transmission: "Manual", fuelType: "Petrol",
    dailyRate: 1200, withDriverPerDay: 1800, withDriverAvailable: true,
    kmLimitPerDay: 120, extraKmRate: 7, securityDeposit: 1500, driverBata: null,
    mileageKmpl: 22, fuelNote: null,
    features: "AC, Budget friendly, Ultra mileage",
    description: "The most budget-friendly way to get around Guwahati.",
    popular: false, sortOrder: 8,
  },
  // ---------------- Sedans ----------------
  {
    name: "Maruti Swift Dzire", brand: "Maruti Suzuki", class: "SEDAN", seats: 5,
    transmission: "Manual", fuelType: "Petrol",
    dailyRate: 1900, withDriverPerDay: 2600, withDriverAvailable: true,
    kmLimitPerDay: 150, extraKmRate: 9, securityDeposit: 2500, driverBata: null,
    mileageKmpl: 21, fuelNote: null,
    features: "AC, Boot space, Bluetooth, Cruise-friendly",
    description: "Classic sedan with a roomy boot — perfect for airport pickups with luggage.",
    popular: true, sortOrder: 9,
  },
  {
    name: "Hyundai Aura", brand: "Hyundai", class: "SEDAN", seats: 5,
    transmission: "Manual", fuelType: "Petrol",
    dailyRate: 1800, withDriverPerDay: 2500, withDriverAvailable: true,
    kmLimitPerDay: 150, extraKmRate: 9, securityDeposit: 2500, driverBata: null,
    mileageKmpl: 20, fuelNote: null,
    features: "AC, Boot space, Touchscreen, Rear AC vents",
    description: "Comfortable compact sedan with rear AC vents for humid Guwahati days.",
    popular: false, sortOrder: 10,
  },
  // ---------------- Scooters ----------------
  {
    name: "Honda Activa 6G", brand: "Honda", class: "SCOOTER", seats: 2,
    transmission: "Automatic", fuelType: "Petrol",
    dailyRate: 500, withDriverPerDay: null, withDriverAvailable: false,
    kmLimitPerDay: 100, extraKmRate: 5, securityDeposit: 1000, driverBata: null,
    mileageKmpl: 45, fuelNote: null,
    features: "Automatic, 45 kmpl, Under-seat storage, Mobile charger",
    description: "The city classic — zip around Guwahati, Kamakhya and the riverfront with ease.",
    popular: true, sortOrder: 11,
  },
  {
    name: "TVS Ntorq 125", brand: "TVS", class: "SCOOTER", seats: 2,
    transmission: "Automatic", fuelType: "Petrol",
    dailyRate: 550, withDriverPerDay: null, withDriverAvailable: false,
    kmLimitPerDay: 100, extraKmRate: 5, securityDeposit: 1000, driverBata: null,
    mileageKmpl: 40, fuelNote: null,
    features: "Automatic, Sporty, Bluetooth dash, Boot light",
    description: "Sporty 125cc scooty with Bluetooth console — fun and quick around the city.",
    popular: false, sortOrder: 12,
  },
  {
    name: "Suzuki Access 125", brand: "Suzuki", class: "SCOOTER", seats: 2,
    transmission: "Automatic", fuelType: "Petrol",
    dailyRate: 500, withDriverPerDay: null, withDriverAvailable: false,
    kmLimitPerDay: 100, extraKmRate: 5, securityDeposit: 1000, driverBata: null,
    mileageKmpl: 45, fuelNote: null,
    features: "Automatic, Mileage king, Big boot",
    description: "Smooth, light and frugal — a favourite for daily exploration.",
    popular: false, sortOrder: 13,
  },
  // ---------------- Bikes ----------------
  {
    name: "Royal Enfield Himalayan 411", brand: "Royal Enfield", class: "BIKE", seats: 2,
    transmission: "Manual", fuelType: "Petrol",
    dailyRate: 1300, withDriverPerDay: null, withDriverAvailable: false,
    kmLimitPerDay: 200, extraKmRate: 8, securityDeposit: 2000, driverBata: null,
    mileageKmpl: 30, fuelNote: null,
    features: "Touring ready, Long-travel suspension, Luggage mounts",
    description: "Built for Northeast touring — Meghalaya ridges, Arunachal curves, Tawang climbs.",
    popular: true, sortOrder: 14,
  },
  {
    name: "Hero Xpulse 200", brand: "Hero", class: "BIKE", seats: 2,
    transmission: "Manual", fuelType: "Petrol",
    dailyRate: 1000, withDriverPerDay: null, withDriverAvailable: false,
    kmLimitPerDay: 200, extraKmRate: 7, securityDeposit: 1500, driverBata: null,
    mileageKmpl: 35, fuelNote: null,
    features: "Adventure touring, Navigation dash, Light & agile",
    description: "Light adventure bike for rough terrains and long rides through Meghalaya.",
    popular: false, sortOrder: 15,
  },
  // ---------------- Vans ----------------
  {
    name: "Toyota Innova Crysta", brand: "Toyota", class: "VAN", seats: 7,
    transmission: "Manual", fuelType: "Diesel",
    dailyRate: 4500, withDriverPerDay: 5500, withDriverAvailable: true,
    kmLimitPerDay: 200, extraKmRate: 15, securityDeposit: 5000, driverBata: null,
    mileageKmpl: 12, fuelNote: "Diesel — cheapest per km for long hill circuits.",
    features: "Captain seats, AC, Big boot, Highway comfort",
    description: "The group-travel gold standard — Shillong, Kaziranga or full Northeast circuits.",
    popular: true, sortOrder: 16,
  },
  {
    name: "Tempo Traveller 13-Seater", brand: "Force", class: "VAN", seats: 13,
    transmission: "Manual", fuelType: "Diesel",
    dailyRate: 5500, withDriverPerDay: 6500, withDriverAvailable: true,
    kmLimitPerDay: 200, extraKmRate: 18, securityDeposit: 5000, driverBata: null,
    mileageKmpl: 10, fuelNote: "Chauffeur only — fuel & toll included in the fare.",
    features: "13 push-back seats, AC, Luggage rack, Music system",
    description: "Group tours, wedding parties and corporate outings across Northeast India. Chauffeur only.",
    popular: false, sortOrder: 17,
  },
];

/* ------------------------------------------------------------------ */
/* Default settings (v3)                                              */
/* ------------------------------------------------------------------ */

import { DEFAULT_MAP_EMBED, DEFAULT_DESTINATIONS, DEFAULT_POLICY_WITH_DRIVER, DEFAULT_POLICY_SELF_DRIVE, DEFAULT_BOOKING_DISCLAIMER } from "./siteConfig";

export function buildDefaultSettings(): { key: string; value: string }[] {
  const { hash, salt } = hashPassword(DEFAULT_PASSWORD);
  return [
    { key: "businessPhone", value: "+919876543210" },
    { key: "whatsappNumber", value: "919876543210" },
    { key: "email", value: "saathiroam@gmail.com" },
    { key: "hours", value: "Open 24/7 · Airport pickup anytime" },
    {
      key: "address",
      value:
        "Near Lokpriya Gopinath Bordoloi International Airport, Borjhar, Guwahati, Assam 781015",
    },
    { key: "adminPasscode", value: DEFAULT_PASSWORD },
    { key: "adminPasswordHash", value: hash },
    { key: "adminPasswordSalt", value: salt },
    { key: "mapEmbedUrl", value: DEFAULT_MAP_EMBED },
    { key: "fuelPricePerLitre", value: "100" },
    { key: "destinationsJson", value: JSON.stringify(DEFAULT_DESTINATIONS) },
    { key: "policyFuelWithDriver", value: DEFAULT_POLICY_WITH_DRIVER },
    { key: "policyFuelSelfDrive", value: DEFAULT_POLICY_SELF_DRIVE },
    { key: "bookingDisclaimer", value: DEFAULT_BOOKING_DISCLAIMER },
    {
      key: "announcement",
      value: "Monsoon Special — 10% off on 3+ day Meghalaya trips. Mention MONSOON on WhatsApp!",
    },
    { key: "announcementEnabled", value: "true" },
    { key: "instagram", value: "" },
    { key: "facebook", value: "" },
    { key: "youtube", value: "" },
  ];
}

export const SEED_SETTINGS = buildDefaultSettings();

/* ------------------------------------------------------------------ */
/* Starter content pages (v3) — Rules & Policies + 3 samples          */
/* ------------------------------------------------------------------ */

type SeedPage = {
  title: string;
  slug: string;
  type: string;
  parentId?: string; // resolved to an id after first insert
  excerpt: string;
  coverImage: string | null;
  blocks: unknown[];
  visibleOnHome: boolean;
  showInMenu: boolean;
  published: boolean;
  sortOrder: number;
  seoDescription: string;
};

const POLICY_BLOCKS: unknown[] = [
  { type: "callout", tone: "green", title: "Two simple modes", text: "With driver: fuel, toll, parking and driver charges are included in your quoted fare. Self-drive: fuel, toll, parking, state permits and entry fees are paid by you at actuals. Everything below explains both modes in plain language." },
  { type: "heading", text: "1. Who can book", level: 2 },
  { type: "text", text: "Roam Saathi serves tourists and outstation travellers only. To rent you must be at least 18 years old for chauffeur-driven bookings and 21 years old for self-drive rentals. For self-drive cars you must have held a valid driving licence for at least one year. Scooters and bikes require a valid two-wheeler licence.\n\nWe may ask for one government photo ID (Aadhaar, Passport, or Voter ID) in original at the time of delivery, along with your driving licence for self-drive bookings. Copies are noted on the rental sheet and returned after the vehicle comes back in good condition." },
  { type: "heading", text: "2. Booking & confirmation", level: 2 },
  { type: "list", ordered: true, items: [
    "Send us your dates, destination and vehicle preference on WhatsApp or through the booking form on this website.",
    "We reply with availability and a final quote (including or excluding fuel, depending on the mode you choose).",
    "Your booking is confirmed only after we receive the advance — usually 20–30% of the estimated trip value, paid by UPI.",
    "The balance is payable at pickup (cash / UPI) before the journey starts.",
  ]},
  { type: "text", text: "Bookings are handled on a first-come, first-served basis. A date is blocked for you only after the advance is received — an enquiry on WhatsApp alone does not guarantee the vehicle." },
  { type: "heading", text: "3. Fuel, toll & permits — the golden rule", level: 2 },
  { type: "callout", tone: "amber", title: "Self-drive bookings", text: "Fuel, toll, parking, state permits and entry fees are NOT included. The vehicle is delivered with a full tank and must be returned with a full tank. Because every route burns a different amount of fuel — the climb to Shillong and Cherrapunji, the long haul to Tawang, or plains driving around Kaziranga — fuel is always billed at actuals, never as a flat rate." },
  { type: "callout", tone: "green", title: "With-driver bookings", text: "You pay one all-inclusive fare: the driver, fuel for the agreed route, tolls and parking are all provided by us. Nothing extra is collected on the road. If you change the route mid-trip, the fare is re-quoted fairly before continuing." },
  { type: "text", text: "The fuel estimator shown while booking is only an indicative guide calculated from distance, vehicle mileage and current pump prices. Actual consumption depends on traffic, road condition, AC use, passenger load and driving style — treat it as an estimate, not a quote." },
  { type: "heading", text: "4. Security deposit (self-drive)", level: 2 },
  { type: "text", text: "A refundable security deposit (shown on every vehicle card) is collected at pickup for self-drive rentals. It is returned at drop-off after a joint condition check of the vehicle, provided the fuel level matches and there is no new damage or missing equipment. For with-driver bookings no deposit is normally required, except for long multi-day tours where a small trip advance may apply." },
  { type: "heading", text: "5. Distance limits & extra kilometres", level: 2 },
  { type: "text", text: "Each vehicle includes a fixed number of kilometres per day (typically 100–200 km depending on the vehicle — see the fleet section). Kilometres driven beyond the included limit are charged at the extra-km rate shown on the vehicle card. For with-driver tours we agree the total route and days in writing on WhatsApp before departure; extra days and extra kilometres are charged as per the same rate card." },
  { type: "heading", text: "6. Usage rules", level: 2 },
  { type: "list", ordered: false, items: [
    "Only the drivers named in the rental agreement may drive a self-drive vehicle.",
    "No sub-renting, no racing, no rallies, no off-road abuse beyond the vehicle's design.",
    "No smoking, no alcohol consumption and no transport of prohibited goods inside our vehicles.",
    "Do not take the vehicle outside Assam & the Northeast without telling us — several states need permits and we must know for support.",
    "Pets are allowed only with prior approval and a cleaning fee.",
  ]},
  { type: "heading", text: "7. Late returns & extensions", level: 2 },
  { type: "text", text: "Rental days are counted in 24-hour blocks from the pickup time. Need more time? Message us before your slot ends — if the vehicle has no next booking we happily extend at the normal daily rate. Returns more than 3 hours late are charged an extra half-day; more than 6 hours late, a full day. Repeated late returns without intimation may affect future bookings." },
  { type: "heading", text: "8. Damage, accidents & traffic fines", level: 2 },
  { type: "text", text: "All our vehicles carry valid insurance. For self-drive rentals, the hirer is responsible for any new dents, scratches, glass, tyre or interior damage up to the insurance deductible / a maximum of Rs 50,000, whichever is lower. Damage caused while driving under the influence, racing, or in gross violation of the Motor Vehicles Act is billed in full to the hirer.\n\nAll traffic and parking fines incurred during the rental period are payable by the hirer (self-drive) or informed to us immediately (with-driver — the driver handles challans related to vehicle documents, but fines for rider behaviour remain the hirer's responsibility)." },
  { type: "heading", text: "9. Breakdowns & support", level: 2 },
  { type: "text", text: "Every booking includes roadside support on call during your trip. In the rare case of a mechanical failure not caused by misuse, we repair or swap the vehicle at no cost to you. Save our WhatsApp number — it is printed on the rental sheet and on the vehicle windscreen sticker." },
  { type: "heading", text: "10. Cancellation & refunds", level: 2 },
  { type: "list", ordered: true, items: [
    "Cancel 72 hours or more before pickup: full refund of the advance, or free date change.",
    "Cancel between 24–72 hours: 50% of the advance is retained.",
    "Cancel within 24 hours or no-show: advance is non-refundable.",
    "Mechanical breakdown on our side mid-trip: unused days are refunded or a replacement vehicle is provided, subject to availability.",
  ]},
  { type: "text", text: "Refunds are processed to the original UPI / bank account within 3–5 working days." },
  { type: "heading", text: "11. Airport pickup & home delivery", level: 2 },
  { type: "text", text: "We pick you up right outside LGBI Airport arrivals (Borjhar, Guwahati) at no extra charge — share your flight number and we track delays. Hotel / home delivery anywhere in Guwahati is available for a small fee based on distance. For airport self-drive handovers, the vehicle is handed over at the agreed parking bay with photos of fuel level and condition." },
  { type: "heading", text: "12. Right to refuse", level: 2 },
  { type: "text", text: "We may refuse or end a rental if the vehicle is being used dangerously, if documents turn out to be false, or if the hirer behaves abusively with our staff or drivers. In such cases the applicable charges till that point stand and the deposit is settled after the condition check." },
  { type: "heading", text: "13. Questions?", level: 2 },
  { type: "text", text: "Unsure about anything above? Message us on WhatsApp before booking — we would rather explain twice than surprise you once. These policies are part of every rental agreement signed or confirmed on WhatsApp with Roam Saathi." },
];

const BLOG_BLOCKS: unknown[] = [
  { type: "text", text: "Guwahati is the perfect base camp for the Northeast — within a few hours' drive you can be above the clouds in Meghalaya, beside rhinos in Kaziranga or on a river island in the Brahmaputra. Here are the five drives our customers book again and again." },
  { type: "heading", text: "1. Guwahati → Shillong → Cherrapunji (3–4 days)", level: 2 },
  { type: "text", text: "The classic Meghalaya loop. Umiam Lake appears barely an hour after Guwahati, Shillong adds cafes and colonial charm, and Sohra (Cherrapunji) hands you Nohkalikai Falls, the Seven Sisters and the famous double-decker root bridge at Nongriat. An SUV like the Scorpio N or Ertiga handles the wet roads comfortably, and with a driver you can simply stare out of the window." },
  { type: "image", src: "/fleet-suv.png", caption: "SUVs are the favourite for the Meghalaya plateau." },
  { type: "heading", text: "2. Guwahati → Kaziranga (2–3 days)", level: 2 },
  { type: "text", text: "Around 200 km of smooth highway. Leave early, catch the morning elephant safari, and spend the evening at the Orchid Park. The road is excellent, so even a hatchback or Dzire works for couples; families prefer the Innova Crysta." },
  { type: "heading", text: "3. The Tawang expedition (5–7 days)", level: 2 },
  { type: "text", text: "The big one — 450 km each way through Bomdila, Dirang, Sela Pass and finally Tawang. It demands a Thar or Scorpio with an experienced driver, ILP paperwork for Arunachal, and patience for the mountains. Our chauffeurs have done this route dozens of times; book it with driver and forget the fuel math entirely." },
  { type: "callout", tone: "amber", title: "Self-drive? Read this", text: "On Tawang's climbs even a frugal hatchback drinks far more fuel than the brochure says. Use the fuel estimator in our booking form to budget litres before you go." },
  { type: "heading", text: "4. Majuli & the Brahmaputra (3 days)", level: 2 },
  { type: "text", text: "Drive to Nimati Ghat near Jorhat, ferry across to the world's largest river island, and lose yourself among satras and mask-makers. Roads are decent; the last stretch is the adventure. Majuli pairs beautifully with Kaziranga in one loop." },
  { type: "heading", text: "5. City day: Guwahati in a scooter", level: 2 },
  { type: "text", text: "Kamakhya Temple at dawn, the riverfront at Umananda, a sunset cruise, and dinner in Fancy Bazaar — an Activa makes the whole city your playground. Helmets included, obviously." },
  { type: "cta", title: "Ready when you are", text: "Tell us your dates and we will suggest the right vehicle, route plan and an honest all-in quote.", buttonLabel: "Plan my trip on WhatsApp", action: "whatsapp" },
];

const DIARY_BLOCKS: unknown[] = [
  { type: "text", text: "The Sharma family from Bengaluru took our Innova Crysta with driver for 4 days across Meghalaya in July. Mrs Sharma kept a diary, and kindly let us publish it (with names shortened). This is what a Roam Saathi trip actually feels like." },
  { type: "heading", text: "Day 1 — Airport to Shillong", level: 2 },
  { type: "text", text: "Our flight landed at 11:30 and Dhananjoy bhai was holding a name plate right at arrivals, exactly as promised. The Innova smelled of fresh air freshener (small things!). We stopped at Umiam Lake for photos and reached Shillong by 4 pm. Zero stress about driving on the wrong side for the first time." },
  { type: "quote", text: "The driver knew exactly where the clean washrooms were. In the hills, that is worth its own review.", author: "Mrs. S, Bengaluru" },
  { type: "heading", text: "Day 2 — Sohra in the rain", level: 2 },
  { type: "text", text: "It rained the entire day, which is apparently the point of visiting Cherrapunji. Nohkalikai was full roar. The driver waited with hot chai at every stop and quietly recalculated our route when a landslide slowed the highway — no drama, no extra asking." },
  { type: "image", src: "/fleet-van.png", caption: "Our Innova Crysta — the family favourite." },
  { type: "heading", text: "Day 3 & 4 — Root bridges and the long way home", level: 2 },
  { type: "text", text: "The Nongriat trek destroyed our legs (3,500 steps each way — worth it), and the Innova's suspension carried us gently back to Guwahati airport with a stop at a Khasi lunch place we would never have found on Google. Fuel, tolls, parking — all inside the fare we were quoted on day one. No surprises, which is the whole point." },
  { type: "callout", tone: "green", title: "Their verdict", text: "Booked with driver for the hills and never looked back. The all-inclusive fare made budgeting trivial — the number told on WhatsApp was the number paid." },
];

const STORY_BLOCKS: unknown[] = [
  { type: "text", text: "Anirban and two college friends booked the Royal Enfield Himalayan pair for a 5-day Meghalaya riding loop — self-drive, full tank, GoPro ready. We asked him three questions." },
  { type: "heading", text: "Why self-drive instead of a chauffeur?", level: 2 },
  { type: "quote", text: "For us the ride IS the trip. We wanted to stop every twenty minutes for photos. But the fuel-toll math honestly scared us — the estimator on your booking form was why we trusted you guys.", author: "Anirban, Kolkata" },
  { type: "heading", text: "How did the fuel actually work out?", level: 2 },
  { type: "text", text: "We filled about 42 litres each over 900 km with luggage — the estimator had said roughly 38–45. Close enough to budget. Returned both bikes full, deposit back on UPI the same evening at drop-off." },
  { type: "heading", text: "Would you book again?", level: 2 },
  { type: "text", text: "Already planning Arunachal next spring — but that one we will take with a driver. Respect to anyone who rides to Tawang themselves!" },
];

export const SEED_PAGES: SeedPage[] = [
  {
    title: "Rules & Policies",
    slug: "rules-and-policies",
    type: "policy",
    excerpt: "Eligibility, booking & payment, the fuel–toll golden rule, deposits, usage rules, damage cover, cancellations — everything in plain language.",
    coverImage: null,
    blocks: POLICY_BLOCKS,
    visibleOnHome: false,
    showInMenu: true,
    published: true,
    sortOrder: 1,
    seoDescription: "Roam Saathi rental policies: booking, fuel & toll rules for self-drive vs with-driver, deposits, damage cover and cancellations — explained simply.",
  },
  {
    title: "Travel Diaries",
    slug: "travel-diaries",
    type: "travel-diary",
    excerpt: "Real trips from our customers — routes, costs, surprises and honest advice from the road.",
    coverImage: "/fleet-van.png",
    blocks: [
      { type: "text", text: "Welcome to our travel diary wall. Every story here is a real Roam Saathi trip — published with the customer's permission. Want yours featured? Send your photos and story on WhatsApp after your trip and get 5% off your next booking." },
    ],
    visibleOnHome: true,
    showInMenu: true,
    published: true,
    sortOrder: 2,
    seoDescription: "Customer travel diaries from Roam Saathi trips across Northeast India.",
  },
  {
    title: "3 Days in Meghalaya — A Customer Diary",
    slug: "3-days-in-meghalaya",
    type: "travel-diary",
    parentId: "travel-diaries",
    excerpt: "The Sharma family, one Innova Crysta with driver, four days of rain, root bridges and zero driving stress.",
    coverImage: "/fleet-van.png",
    blocks: DIARY_BLOCKS,
    visibleOnHome: true,
    showInMenu: false,
    published: true,
    sortOrder: 3,
    seoDescription: "A real customer diary of a 4-day Meghalaya trip with a Roam Saathi chauffeur-driven Innova Crysta.",
  },
  {
    title: "Top 5 Weekend Drives from Guwahati",
    slug: "top-5-weekend-drives-from-guwahati",
    type: "blog",
    excerpt: "Shillong in 3 hours, rhinos in 4, Tawang for the brave — five routes our customers keep coming back for, with vehicle advice for each.",
    coverImage: "/fleet-suv.png",
    blocks: BLOG_BLOCKS,
    visibleOnHome: true,
    showInMenu: true,
    published: true,
    sortOrder: 4,
    seoDescription: "The 5 best weekend road trips from Guwahati — Shillong, Kaziranga, Tawang, Majuli — with vehicle recommendations and fuel tips.",
  },
  {
    title: "Customer Story: Riding Meghalaya on Himalayans",
    slug: "riding-meghalaya-on-himalayans",
    type: "customer-story",
    parentId: "travel-diaries",
    excerpt: "Three friends, two Himalayan 411s, 900 km — how the fuel estimator made self-drive trust easier.",
    coverImage: "/fleet-scooter.png",
    blocks: STORY_BLOCKS,
    visibleOnHome: true,
    showInMenu: false,
    published: true,
    sortOrder: 5,
    seoDescription: "A customer story: self-drive Royal Enfield Himalayan tour of Meghalaya with Roam Saathi.",
  },
];

/* ------------------------------------------------------------------ */
/* Provisioning entry point                                           */
/* ------------------------------------------------------------------ */

export type ProvisionResult = {
  ok: true;
  tablesCreated: string[];
  columnsUpgraded: string[];
  vehiclesSeeded: number;
  settingsSeeded: number;
  pagesSeeded: number;
  hotelsSeeded: number;
  counts: {
    vehicles: number;
    bookings: number;
    settings: number;
    pages: number;
    hotels: number;
    customers: number;
    agreements: number;
  };
  message: string;
};

type ProvisionDb = {
  $executeRawUnsafe(q: string): Promise<number>;
  vehicle: {
    count(): Promise<number>;
    createMany(a: { data: unknown }): Promise<{ count: number }>;
  };
  booking: { count(): Promise<number> };
  settings: {
    count(): Promise<number>;
    createMany(a: { data: unknown }): Promise<{ count: number }>;
  };
  page: {
    count(): Promise<number>;
    createMany(a: { data: unknown }): Promise<{ count: number }>;
  };
  hotel: {
    count(): Promise<number>;
    createMany(a: { data: unknown }): Promise<{ count: number }>;
  };
  customer: { count(): Promise<number> };
  agreement: { count(): Promise<number> };
};

/**
 * Upgrade an EXISTING (pre-v3) database in place:
 *  - add missing v3 settings keys (map embed, fuel policy, destinations,
 *    announcement, password hash placeholders are NOT forced if a legacy
 *    passcode already works),
 *  - patch the seeded vehicles' mileage/fuel notes when still empty,
 *  - seed the starter content pages when the Page table is empty.
 * Never overwrites values the owner has already set.
 */
export async function ensureV3Defaults(db: ProvisionDb): Promise<{
  settingsAdded: string[];
  vehiclesPatched: number;
  pagesSeeded: number;
}> {
  // 1. Missing settings keys
  const settingsAdded: string[] = [];
  const defaults = buildDefaultSettings();
  const settingsModel = db.settings as unknown as {
    findMany: () => Promise<{ key: string; value: string }[]>;
    create: (a: object) => Promise<object>;
  };
  const existing = await settingsModel.findMany();
  const have = new Set(existing.map((r) => r.key));
  for (const d of defaults) {
    // Never overwrite an existing legacy passcode with the default hash
    if (
      (d.key === "adminPasswordHash" || d.key === "adminPasswordSalt") &&
      have.has("adminPasscode")
    ) {
      continue;
    }
    if (!have.has(d.key)) {
      await settingsModel.create({ data: { key: d.key, value: d.value } });
      settingsAdded.push(d.key);
    }
  }

  // 2. Patch seeded vehicles that have no mileage yet
  let vehiclesPatched = 0;
  const vehicleModel = db.vehicle as unknown as {
    findMany: (a: object) => Promise<{ id: string; name: string; mileageKmpl: number | null; fuelNote: string | null }[]>;
    update: (a: object) => Promise<object>;
  };
  const vehicles = await vehicleModel.findMany({ select: { id: true, name: true, mileageKmpl: true, fuelNote: true } });
  for (const v of vehicles) {
    const seed = SEED_VEHICLES.find((s) => s.name === v.name);
    if (seed && (v.mileageKmpl == null || v.fuelNote == null)) {
      await vehicleModel.update({
        where: { id: v.id },
        data: {
          ...(v.mileageKmpl == null ? { mileageKmpl: seed.mileageKmpl } : {}),
          ...(v.fuelNote == null ? { fuelNote: seed.fuelNote } : {}),
        },
      });
      vehiclesPatched++;
    }
  }

  // 3. Starter pages when the table is empty
  let pagesSeeded = 0;
  if ((await db.page.count()) === 0) {
    type PageWriter = {
      createMany: (a: object) => Promise<object>;
      findFirst: (a: object) => Promise<{ id: string } | null>;
    };
    const pageModel = db.page as unknown as PageWriter;
    const parents = SEED_PAGES.filter((p) => !p.parentId);
    const children = SEED_PAGES.filter((p) => p.parentId);
    for (const p of parents) {
      const { parentId: _o, ...row } = p;
      void _o;
      await pageModel.createMany({ data: [{ ...row, blocks: JSON.stringify(p.blocks) }] });
    }
    for (const c of children) {
      const parentSlug = c.parentId as string;
      const { parentId: _o2, ...row } = c;
      void _o2;
      const parent = await pageModel.findFirst({ where: { slug: parentSlug }, select: { id: true } });
      await pageModel.createMany({
        data: [{ ...row, blocks: JSON.stringify(c.blocks), parentId: parent?.id ?? null }],
      });
    }
    pagesSeeded = SEED_PAGES.length;
  }

  return { settingsAdded, vehiclesPatched, pagesSeeded };
}

/**
 * Create tables if missing, upgrade older tables, then seed when empty.
 * Safe to call multiple times — existing data is never touched.
 */
export async function provisionDatabase(db: ProvisionDb): Promise<ProvisionResult> {
  const tablesCreated: string[] = [];
  const columnsUpgraded: string[] = [];

  // 1. DDL — IF NOT EXISTS keeps this idempotent.
  await db.$executeRawUnsafe(VEHICLE_DDL);
  await db.$executeRawUnsafe(BOOKING_DDL);
  await db.$executeRawUnsafe(SETTINGS_DDL);
  await db.$executeRawUnsafe(PAGE_DDL);
  await db.$executeRawUnsafe(HOTEL_DDL);
  await db.$executeRawUnsafe(CUSTOMER_DDL);
  await db.$executeRawUnsafe(AGREEMENT_DDL);
  tablesCreated.push(
    "Vehicle",
    "Booking",
    "Settings",
    "Page",
    "Hotel",
    "Customer",
    "Agreement"
  );

  for (const idx of INDEX_DDLS) {
    await db.$executeRawUnsafe(idx);
  }

  // 2. Upgrade path — add v3 columns to pre-v3 databases.
  for (const ddl of UPGRADE_DDLS) {
    try {
      await db.$executeRawUnsafe(ddl);
      columnsUpgraded.push(ddl.split('"')[1]);
    } catch {
      /* column already exists — expected on fresh/updated databases */
    }
  }

  // 3. Seed only when empty (never overwrite owner's real data).
  let vehiclesSeeded = 0;
  let settingsSeeded = 0;
  let pagesSeeded = 0;
  let hotelsSeeded = 0;

  const vCount = await db.vehicle.count();
  if (vCount === 0) {
    const rows = SEED_VEHICLES.map((v) => ({ ...v, imageUrl: IMG[v.class] ?? null }));
    await db.vehicle.createMany({ data: rows });
    vehiclesSeeded = rows.length;
  }

  const sCount = await db.settings.count();
  if (sCount === 0) {
    await db.settings.createMany({ data: buildDefaultSettings() });
    settingsSeeded = SEED_SETTINGS.length;
  }

  const hCount = await db.hotel.count();
  if (hCount === 0) {
    const rows = SEED_HOTELS.map((h) => ({ ...h, images: JSON.stringify(h.images ?? []) }));
    await db.hotel.createMany({ data: rows });
    hotelsSeeded = rows.length;
  }

  const pCount = await db.page.count();
  if (pCount === 0) {
    type PageWriter = {
      createMany: (a: object) => Promise<object>;
      findFirst: (a: object) => Promise<{ id: string } | null>;
    };
    const pageModel = db.page as unknown as PageWriter;

    // Two-pass: insert parents first, resolve children parentId by slug.
    const parents = SEED_PAGES.filter((p) => !p.parentId);
    const children = SEED_PAGES.filter((p) => p.parentId);

    for (const p of parents) {
      const { parentId: _omit, ...row } = p;
      void _omit;
      await pageModel.createMany({
        data: [{ ...row, blocks: JSON.stringify(p.blocks) }],
      });
    }

    for (const c of children) {
      const parentSlug = c.parentId as string;
      const { parentId: _omit2, ...row } = c;
      void _omit2;
      const parent = await pageModel.findFirst({
        where: { slug: parentSlug },
        select: { id: true },
      });
      await pageModel.createMany({
        data: [
          {
            ...row,
            blocks: JSON.stringify(c.blocks),
            parentId: parent?.id ?? null,
          },
        ],
      });
    }
    pagesSeeded = SEED_PAGES.length;
  }

  const counts = {
    vehicles: await db.vehicle.count(),
    bookings: await db.booking.count(),
    settings: await db.settings.count(),
    pages: await db.page.count(),
    hotels: await db.hotel.count(),
    customers: await db.customer.count(),
    agreements: await db.agreement.count(),
  };

  const message =
    vehiclesSeeded > 0 || settingsSeeded > 0 || pagesSeeded > 0 || hotelsSeeded > 0
      ? "Database ready — tables created and starter data loaded."
      : "Database ready — tables already existed and data was left untouched.";

  return {
    ok: true,
    tablesCreated,
    columnsUpgraded,
    vehiclesSeeded,
    settingsSeeded,
    pagesSeeded,
    hotelsSeeded,
    counts,
    message,
  };
}

/* ------------------------------------------------------------------ */
/* v5 — Built-in fallbacks (used when the database is unreachable)      */
/* ------------------------------------------------------------------ */
// If the deployed database cannot be reached (missing DATABASE_URL,
// read-only serverless filesystem, network hiccup), the public site still
// shows the full starter fleet and partner stays instead of empty
// sections. Booking continues over WhatsApp; the admin portal simply
// asks for a working database. IDs are stable ("seed-*") so React keys
// and WhatsApp prefills behave exactly like real rows.

type SeedVehicleDTO = SeedVehicle & {
  monthlyRate?: number | null;
  registrationNumber?: string | null;
};

export function defaultFleetVehicles() {
  const rows: SeedVehicleDTO[] = SEED_VEHICLES;
  return rows.map((v, i) => ({
    id: `seed-${i + 1}-${v.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: v.name,
    brand: v.brand,
    class: v.class,
    seats: v.seats,
    transmission: v.transmission,
    fuelType: v.fuelType,
    dailyRate: v.dailyRate,
    withDriverPerDay: v.withDriverPerDay,
    withDriverAvailable: v.withDriverAvailable,
    monthlyRate: v.monthlyRate ?? null,
    kmLimitPerDay: v.kmLimitPerDay,
    extraKmRate: v.extraKmRate,
    securityDeposit: v.securityDeposit,
    driverBata: v.driverBata,
    mileageKmpl: v.mileageKmpl,
    fuelNote: v.fuelNote,
    registrationNumber: v.registrationNumber ?? null,
    imageUrl: IMG[v.class] ?? null,
    features: v.features,
    description: v.description,
    available: true,
    popular: v.popular,
    sortOrder: v.sortOrder,
  }));
}

type SeedHotel = {
  name: string;
  state: string;
  city: string;
  area: string;
  phone: string;
  whatsapp: string;
  priceFrom: number;
  category: string;
  description: string;
  amenities: string;
  images: string[];
  bookingUrl: string;
  mapUrl: string;
  partner: boolean;
  featured: boolean;
  showOnSite: boolean;
  sortOrder: number;
};

export const SEED_HOTELS: SeedHotel[] = [
  {
    name: "Novotel Guwahati LGBI Airport",
    state: "Assam",
    city: "Guwahati",
    area: "Borjhar, 5 min from the airport gate",
    phone: "+913612340000",
    whatsapp: "",
    priceFrom: 6500,
    category: "Premium",
    description:
      "Five-minute drive from the arrivals gate — the easiest first-night stop after a late landing. Pool, gym, multi-cuisine restaurant and airport shuttle.",
    amenities: "WiFi, Airport shuttle, Pool, Restaurant, Parking, Gym",
    images: [],
    bookingUrl: "",
    mapUrl: "",
    partner: false,
    featured: true,
    showOnSite: true,
    sortOrder: 1,
  },
  {
    name: "Ri Kynjai Serenity by the Lake",
    state: "Meghalaya",
    city: "Shillong",
    area: "Umiam Lake, Guwahati–Shillong Road",
    phone: "+919856000000",
    whatsapp: "9856000000",
    priceFrom: 4800,
    category: "Resort",
    description:
      "Khasi-style cottages on the shores of Umiam Lake, halfway between Guwahati and Shillong. Perfect first stop on a Meghalaya loop with one of our SUVs.",
    amenities: "Lake view, WiFi, Restaurant, Bonfire, Parking, Boat ride",
    images: [],
    bookingUrl: "",
    mapUrl: "",
    partner: true,
    featured: true,
    showOnSite: true,
    sortOrder: 2,
  },
  {
    name: "Hotel Polo Towers",
    state: "Meghalaya",
    city: "Shillong",
    area: "Police Bazar, city centre",
    phone: "+913642500000",
    whatsapp: "",
    priceFrom: 3200,
    category: "Standard",
    description:
      "Central Shillong stay walking distance from Police Bazar's cafés and market. Reliable base for Cherrapunji and Mawlynnong day drives.",
    amenities: "WiFi, Restaurant, Bar, Parking, Room service",
    images: [],
    bookingUrl: "",
    mapUrl: "",
    partner: false,
    featured: false,
    showOnSite: true,
    sortOrder: 3,
  },
  {
    name: "Tawang Holiday Home",
    state: "Arunachal Pradesh",
    city: "Tawang",
    area: "Near Tawang Monastery road",
    phone: "+919402000000",
    whatsapp: "9402000000",
    priceFrom: 2200,
    category: "Homestay",
    description:
      "Warm family homestay with mountain views and home-cooked Monpa food. Our Thar and Scorpio drivers know the Tawang route and ILP checkpoints well.",
    amenities: "Home food, Heating, Hot water, Parking, Monastery view",
    images: [],
    bookingUrl: "",
    mapUrl: "",
    partner: true,
    featured: true,
    showOnSite: true,
    sortOrder: 4,
  },
  {
    name: "Iora — The Kaziranga Retreat",
    state: "Assam",
    city: "Kaziranga",
    area: "Kohora, near Kaziranga National Park gate",
    phone: "+913766200000",
    whatsapp: "",
    priceFrom: 5200,
    category: "Resort",
    description:
      "Wind-down resort minutes from the park gate for early-morning jeep and elephant safaris. Jeep safari bookings can be arranged at the desk.",
    amenities: "WiFi, Restaurant, Garden, Safari desk, Parking, Cultural shows",
    images: [],
    bookingUrl: "",
    mapUrl: "",
    partner: false,
    featured: false,
    showOnSite: true,
    sortOrder: 5,
  },
];

export function defaultStays() {
  return SEED_HOTELS.map((h, i) => ({
    id: `seed-stay-${i + 1}-${h.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: h.name,
    state: h.state,
    city: h.city,
    area: h.area,
    phone: h.phone,
    whatsapp: h.whatsapp || null,
    priceFrom: h.priceFrom,
    category: h.category,
    description: h.description,
    amenities: h.amenities,
    images: JSON.stringify(h.images ?? []),
    bookingUrl: h.bookingUrl || null,
    mapUrl: h.mapUrl || null,
    partner: h.partner,
    featured: h.featured,
    showOnSite: h.showOnSite,
    sortOrder: h.sortOrder,
  }));
}
