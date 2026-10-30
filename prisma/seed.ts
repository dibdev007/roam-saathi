/**
 * Seed script for Roam Saathi — Fleet v2.
 * Run with: `bun prisma/seed.ts`
 *
 * Seeds:
 *   - 16 vehicles across 6 classes with FULL price details
 *     (self-drive/day, with-driver/day, deposit, km limit, extra km)
 *     — all rates are editable market-indicative placeholders the owner
 *       can change any time from Admin → Fleet.
 *   - 5 sample bookings across the pipeline
 *   - default settings key-values (contact, hours, admin passcode)
 *
 * Vehicle lineup mirrors the Guwahati rental market (incl. the models
 * advertised by garibhara.web.app) so the rate card feels familiar to
 * customers comparison-shopping.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

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
  imageUrl?: string; // optional — the fleet PNG per class is applied at insert time
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

const vehicles: SeedVehicle[] = [
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

const bookings = [
  {
    name: "Ankit Sharma", phone: "+919812345670",
    pickupType: "Airport counter", pickupLocation: "LGBI Airport arrival gate",
    pickupDate: daysFromNow(1), returnDate: daysFromNow(4),
    vehicleClass: "SUV", vehicleName: "Mahindra Thar 4x4",
    destination: "Shillong + Cherrapunji", withDriver: false, estimatedTotal: 10500,
    message: "Landing at 11:30 AM, need roof rack if possible.", status: "Confirmed",
  },
  {
    name: "Priya Das", phone: "+919812345671",
    pickupType: "Hotel delivery", pickupLocation: "Hotel Radisson Blu, Guwahati",
    pickupDate: daysFromNow(2), returnDate: daysFromNow(3),
    vehicleClass: "SCOOTER", vehicleName: "Honda Activa 6G",
    destination: "City sightseeing", withDriver: false, estimatedTotal: 500,
    message: "Two scooters if available.", status: "New",
  },
  {
    name: "Rohan Mehta", phone: "+919812345672",
    pickupType: "Airport counter", pickupLocation: "LGBI Airport",
    pickupDate: daysFromNow(6), returnDate: daysFromNow(10),
    vehicleClass: "VAN", vehicleName: "Toyota Innova Crysta",
    destination: "Kaziranga National Park", withDriver: true, estimatedTotal: 22000,
    message: "Family of 6 + luggage, driver who knows Kaziranga route.", status: "Contacted",
  },
  {
    name: "Fahim Rahman", phone: "+919812345673",
    pickupType: "Hotel delivery", pickupLocation: "Vivanta Guwahati",
    pickupDate: daysFromNow(-5), returnDate: daysFromNow(-1),
    vehicleClass: "BIKE", vehicleName: "Royal Enfield Himalayan 411",
    destination: "Meghalaya loop", withDriver: false, estimatedTotal: 6500,
    message: null, status: "Completed",
  },
  {
    name: "Neha Verma", phone: "+919812345674",
    pickupType: "Airport counter", pickupLocation: "LGBI Airport",
    pickupDate: daysFromNow(3), returnDate: daysFromNow(6),
    vehicleClass: "SEDAN", vehicleName: "Maruti Swift Dzire",
    destination: "Guwahati local", withDriver: false, estimatedTotal: 5700,
    message: "Flight may reach at 7 PM — is late pickup okay?", status: "New",
  },
];

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(10, 0, 0, 0);
  return d;
}

const settings = [
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

/* ------------------------------------------------------------------ */
/* v4 — sample Stays & Partners listings                                */
/* Real, well-known properties used as EDITABLE placeholders: the owner  */
/* should replace/extend them from Admin → Stays & Partners the moment   */
/* real collaborations are signed.                                       */
/* ------------------------------------------------------------------ */
const hotels = [
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

async function main() {
  console.log("Seeding Roam Saathi fleet v4…");

  await db.booking.deleteMany();
  await db.vehicle.deleteMany();
  await db.settings.deleteMany();
  await db.hotel.deleteMany();

  for (const v of vehicles) {
    await db.vehicle.create({
      data: { ...v, imageUrl: IMG[v.class] ?? null },
    });
  }
  for (const b of bookings) {
    await db.booking.create({ data: b });
  }
  for (const s of settings) {
    await db.settings.create({ data: s });
  }
  for (const h of hotels) {
    await db.hotel.create({
      data: { ...h, images: JSON.stringify(h.images ?? []) },
    });
  }

  const [vCount, bCount, hCount] = [
    await db.vehicle.count(),
    await db.booking.count(),
    await db.hotel.count(),
  ];
  console.log(
    `Done. ${vCount} vehicles, ${bCount} bookings, ${hCount} hotels, ${settings.length} settings keys.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
