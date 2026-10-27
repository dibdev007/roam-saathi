/**
 * One-time database provisioning for Roam Saathi.
 *
 * Used by /api/setup (and test scripts) to:
 *   1. Create the Vehicle / Booking / Settings tables if they do not exist
 *      (raw DDL — works on hosted Postgres like Neon, Supabase, Prisma
 *      Postgres; the same statements are also valid on SQLite for local dev).
 *   2. Seed the full 17-vehicle rate card + default settings — but ONLY if
 *      the tables are empty, so re-running never overwrites real data.
 *
 * The DDL mirrors exactly what `prisma migrate diff` generates for
 * prisma/schema.postgres.prisma, so the Prisma client and the raw tables
 * are always in agreement.
 */

const VEHICLE_DDL = `
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

const BOOKING_DDL = `
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

const SETTINGS_DDL = `
CREATE TABLE IF NOT EXISTS "Settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
)`;

const SETTINGS_INDEX_DDL = `CREATE UNIQUE INDEX IF NOT EXISTS "Settings_key_key" ON "Settings"("key")`;

// ---------------------------------------------------------------------------
// Seed data — identical to prisma/seed.ts (17 vehicles, full rate card).
// Rates are editable market-indicative placeholders; the owner can change
// every number from Admin → Fleet at any time.
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
  imageUrl: string;
  features: string;
  description: string;
  popular: boolean;
  sortOrder: number;
};

const IMG: Record<string, string> = {
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
    features: "4x4, AC, Bluetooth, Roof rails, Rugged tyres",
    description: "Rugged 4x4 — the favourite for Tawang, Mechuka and off-road Northeast routes. Self-drive or chauffeur.",
    popular: true, sortOrder: 1,
  },
  {
    name: "Mahindra Scorpio N", brand: "Mahindra", class: "SUV", seats: 7,
    transmission: "Manual", fuelType: "Diesel",
    dailyRate: 3200, withDriverPerDay: 4200, withDriverAvailable: true,
    kmLimitPerDay: 150, extraKmRate: 12, securityDeposit: 5000, driverBata: null,
    features: "7-seater, AC, Touchscreen, Cruise control, Big boot",
    description: "Spacious 7-seater SUV for family trips to Shillong, Cherrapunji and Kaziranga.",
    popular: true, sortOrder: 2,
  },
  {
    name: "Maruti Ertiga", brand: "Maruti Suzuki", class: "SUV", seats: 7,
    transmission: "Manual", fuelType: "Petrol",
    dailyRate: 2600, withDriverPerDay: 3400, withDriverAvailable: true,
    kmLimitPerDay: 150, extraKmRate: 10, securityDeposit: 4000, driverBata: null,
    features: "7-seater, AC, Bluetooth, Mileage friendly",
    description: "Comfortable 7-seater MUV — great value for family tours and airport transfers.",
    popular: false, sortOrder: 3,
  },
  {
    name: "Hyundai Creta", brand: "Hyundai", class: "SUV", seats: 5,
    transmission: "Manual", fuelType: "Diesel",
    dailyRate: 3000, withDriverPerDay: 4000, withDriverAvailable: true,
    kmLimitPerDay: 150, extraKmRate: 12, securityDeposit: 5000, driverBata: null,
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
    features: "AC, Bluetooth, Power steering, Great mileage",
    description: "Zippy and fuel-efficient — ideal for Guwahati city tours and short airport runs.",
    popular: true, sortOrder: 5,
  },
  {
    name: "Hyundai i10 Nios", brand: "Hyundai", class: "HATCHBACK", seats: 5,
    transmission: "Manual", fuelType: "Petrol",
    dailyRate: 1500, withDriverPerDay: 2200, withDriverAvailable: true,
    kmLimitPerDay: 150, extraKmRate: 8, securityDeposit: 2000, driverBata: null,
    features: "AC, Bluetooth, Compact, Easy parking",
    description: "Compact city car that is easy to park and light on fuel.",
    popular: false, sortOrder: 6,
  },
  {
    name: "Tata Tiago", brand: "Tata", class: "HATCHBACK", seats: 5,
    transmission: "Manual", fuelType: "Petrol",
    dailyRate: 1500, withDriverPerDay: 2100, withDriverAvailable: true,
    kmLimitPerDay: 150, extraKmRate: 8, securityDeposit: 2000, driverBata: null,
    features: "AC, Bluetooth, 4-star safety, Harman audio",
    description: "Safe, solid city hatchback with a punchy audio system.",
    popular: false, sortOrder: 7,
  },
  {
    name: "Maruti Alto", brand: "Maruti Suzuki", class: "HATCHBACK", seats: 5,
    transmission: "Manual", fuelType: "Petrol",
    dailyRate: 1200, withDriverPerDay: 1800, withDriverAvailable: true,
    kmLimitPerDay: 120, extraKmRate: 7, securityDeposit: 1500, driverBata: null,
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
    features: "AC, Boot space, Bluetooth, Cruise-friendly",
    description: "Classic sedan with a roomy boot — perfect for airport pickups with luggage.",
    popular: true, sortOrder: 9,
  },
  {
    name: "Hyundai Aura", brand: "Hyundai", class: "SEDAN", seats: 5,
    transmission: "Manual", fuelType: "Petrol",
    dailyRate: 1800, withDriverPerDay: 2500, withDriverAvailable: true,
    kmLimitPerDay: 150, extraKmRate: 9, securityDeposit: 2500, driverBata: null,
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
    features: "Automatic, 25 kmpl+, Under-seat storage, Mobile charger",
    description: "The city classic — zip around Guwahati, Kamakhya and the riverfront with ease.",
    popular: true, sortOrder: 11,
  },
  {
    name: "TVS Ntorq 125", brand: "TVS", class: "SCOOTER", seats: 2,
    transmission: "Automatic", fuelType: "Petrol",
    dailyRate: 550, withDriverPerDay: null, withDriverAvailable: false,
    kmLimitPerDay: 100, extraKmRate: 5, securityDeposit: 1000, driverBata: null,
    features: "Automatic, Sporty, Bluetooth dash, Boot light",
    description: "Sporty 125cc scooty with Bluetooth console — fun and quick around the city.",
    popular: false, sortOrder: 12,
  },
  {
    name: "Suzuki Access 125", brand: "Suzuki", class: "SCOOTER", seats: 2,
    transmission: "Automatic", fuelType: "Petrol",
    dailyRate: 500, withDriverPerDay: null, withDriverAvailable: false,
    kmLimitPerDay: 100, extraKmRate: 5, securityDeposit: 1000, driverBata: null,
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
    features: "Touring ready, Long-travel suspension, Luggage mounts",
    description: "Built for Northeast touring — Meghalaya ridges, Arunachal curves, Tawang climbs.",
    popular: true, sortOrder: 14,
  },
  {
    name: "Hero Xpulse 200", brand: "Hero", class: "BIKE", seats: 2,
    transmission: "Manual", fuelType: "Petrol",
    dailyRate: 1000, withDriverPerDay: null, withDriverAvailable: false,
    kmLimitPerDay: 200, extraKmRate: 7, securityDeposit: 1500, driverBata: null,
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
    features: "Captain seats, AC, Big boot, Highway comfort",
    description: "The group-travel gold standard — Shillong, Kaziranga or full Northeast circuits.",
    popular: true, sortOrder: 16,
  },
  {
    name: "Tempo Traveller 13-Seater", brand: "Force", class: "VAN", seats: 13,
    transmission: "Manual", fuelType: "Diesel",
    dailyRate: 5500, withDriverPerDay: 6500, withDriverAvailable: true,
    kmLimitPerDay: 200, extraKmRate: 18, securityDeposit: 5000, driverBata: null,
    features: "13 push-back seats, AC, Luggage rack, Music system",
    description: "Group tours, wedding parties and corporate outings across Northeast India. Chauffeur only.",
    popular: false, sortOrder: 17,
  },
];

export const SEED_SETTINGS: { key: string; value: string }[] = [
  { key: "businessPhone", value: "+919876543210" },
  { key: "whatsappNumber", value: "919876543210" },
  { key: "email", value: "saathiroam@gmail.com" },
  { key: "hours", value: "Open 24/7 · Airport pickup anytime" },
  {
    key: "address",
    value:
      "Near Lokpriya Gopinath Bordoloi International Airport, Borjhar, Guwahati, Assam 781015",
  },
  { key: "adminPasscode", value: "roam2024" },
];

/**
 * Provision result — returned as JSON by /api/setup.
 */
export type ProvisionResult = {
  ok: true;
  tablesCreated: string[];
  vehiclesSeeded: number;
  settingsSeeded: number;
  counts: { vehicles: number; bookings: number; settings: number };
  message: string;
};

/**
 * Create tables if missing, then seed vehicles + settings if empty.
 * Safe to call multiple times — existing data is never touched.
 */
export async function provisionDatabase(db: {
  $executeRawUnsafe: (q: string) => Promise<number>;
  vehicle: { count: () => Promise<number>; createMany: (a: object) => Promise<object> };
  booking: { count: () => Promise<number> };
  settings: { count: () => Promise<number>; createMany: (a: object) => Promise<object> };
}): Promise<ProvisionResult> {
  const tablesCreated: string[] = [];

  // 1. DDL — IF NOT EXISTS keeps this idempotent.
  await db.$executeRawUnsafe(VEHICLE_DDL);
  await db.$executeRawUnsafe(BOOKING_DDL);
  await db.$executeRawUnsafe(SETTINGS_DDL);
  await db.$executeRawUnsafe(SETTINGS_INDEX_DDL);

  // 2. Seed only when empty (never overwrite owner's real data).
  let vehiclesSeeded = 0;
  let settingsSeeded = 0;

  const vCount = await db.vehicle.count();
  if (vCount === 0) {
    const rows = SEED_VEHICLES.map((v) => ({ ...v, imageUrl: IMG[v.class] ?? null }));
    await db.vehicle.createMany({ data: rows });
    vehiclesSeeded = rows.length;
  }

  const sCount = await db.settings.count();
  if (sCount === 0) {
    await db.settings.createMany({ data: SEED_SETTINGS });
    settingsSeeded = SEED_SETTINGS.length;
  }

  const counts = {
    vehicles: await db.vehicle.count(),
    bookings: await db.booking.count(),
    settings: await db.settings.count(),
  };

  const message =
    vehiclesSeeded > 0 || settingsSeeded > 0
      ? "Database ready — tables created and starter data loaded."
      : "Database ready — tables already existed and data was left untouched.";

  return { ok: true, tablesCreated, vehiclesSeeded, settingsSeeded, counts, message };
}
