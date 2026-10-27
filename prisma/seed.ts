/**
 * Seed script for Roam Saathi.
 * Run with: `bun run prisma/seed.ts` (or `bun prisma/seed.ts`)
 *
 * Seeds:
 *   - 9 sample vehicles across the 4 classes
 *   - 4 sample bookings
 *   - default settings key-values (phone, whatsapp, hours, service_areas, admin_passcode)
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const vehicles = [
  {
    name: "Mahindra Thar",
    class: "SUV",
    seats: 4,
    transmission: "Manual",
    dailyRate: 3500,
    withDriverAvailable: true,
    imageUrl: "/fleet-suv.png",
    available: true,
    description:
      "Rugged 4x4 SUV — perfect for Tawang, Mechuka and off-road Northeast routes. Self-drive & chauffeur options.",
  },
  {
    name: "Mahindra Scorpio-N",
    class: "SUV",
    seats: 7,
    transmission: "Manual",
    dailyRate: 3500,
    withDriverAvailable: true,
    imageUrl: "/fleet-suv.png",
    available: true,
    description:
      "Spacious 7-seater SUV for family & group trips to Shillong, Cherrapunji and Kaziranga.",
  },
  {
    name: "Maruti Ertiga",
    class: "SUV",
    seats: 7,
    transmission: "Manual",
    dailyRate: 3000,
    withDriverAvailable: true,
    imageUrl: "/fleet-suv.png",
    available: true,
    description:
      "Comfortable and fuel-efficient 7-seater. Great value for Guwahati→Shillong runs.",
  },
  {
    name: "Maruti Swift",
    class: "HATCHBACK",
    seats: 5,
    transmission: "Manual",
    dailyRate: 1800,
    withDriverAvailable: true,
    imageUrl: "/fleet-hatchback.png",
    available: true,
    description:
      "Compact and easy to park. Ideal for Guwahati city tours and short airport transfers.",
  },
  {
    name: "Hyundai Grand i10 Nios",
    class: "HATCHBACK",
    seats: 5,
    transmission: "Manual",
    dailyRate: 1800,
    withDriverAvailable: true,
    imageUrl: "/fleet-hatchback.png",
    available: true,
    description:
      "Refined hatchback with great mileage. Perfect self-drive option for first-time visitors.",
  },
  {
    name: "Hyundai Aura",
    class: "HATCHBACK",
    seats: 5,
    transmission: "Manual",
    dailyRate: 1900,
    withDriverAvailable: true,
    imageUrl: "/fleet-hatchback.png",
    available: true,
    description:
      "Compact sedan-style hatchback with boot space for luggage. Good for couples & small families.",
  },
  {
    name: "Honda Activa 6G",
    class: "SCOOTER",
    seats: 2,
    transmission: "Automatic",
    dailyRate: 500,
    withDriverAvailable: false,
    imageUrl: "/fleet-scooter.png",
    available: true,
    description:
      "Self-drive scooter for Guwahati city hops, Umananda ferry and short rides around town.",
  },
  {
    name: "Yamaha FZ-S",
    class: "SCOOTER",
    seats: 2,
    transmission: "Manual",
    dailyRate: 700,
    withDriverAvailable: false,
    imageUrl: "/fleet-scooter.png",
    available: true,
    description:
      "Sturdy 150cc motorcycle for riders who want a bit more power on Northeast highways.",
  },
  {
    name: "Toyota Innova Crysta",
    class: "VAN",
    seats: 7,
    transmission: "Automatic",
    dailyRate: 4500,
    withDriverAvailable: true,
    imageUrl: "/fleet-van.png",
    available: true,
    description:
      "Premium 7-seater with chauffeur. The most popular choice for Shillong & Cherrapunji trips.",
  },
  {
    name: "Force Traveller (12-17 seater)",
    class: "VAN",
    seats: 17,
    transmission: "Manual",
    dailyRate: 5500,
    withDriverAvailable: true,
    imageUrl: "/fleet-van.png",
    available: true,
    description:
      "Group van for 12-17 passengers with driver. Perfect for college groups, family reunions & pilgrimages.",
  },
];

const now = new Date();
const daysFromNow = (d: number) => {
  const dt = new Date(now);
  dt.setDate(dt.getDate() + d);
  return dt;
};

const bookings = [
  {
    name: "Rohit Sharma",
    phone: "+919812345670",
    pickupType: "Airport counter",
    pickupLocation: "LGBI Airport, Borjhar",
    pickupDate: daysFromNow(2),
    returnDate: daysFromNow(5),
    vehicleClass: "SUV",
    withDriver: true,
    message: "Need a Thar for Shillong + Cherrapunji trip. Pickup at airport.",
    status: "New",
  },
  {
    name: "Priya Iyer",
    phone: "+919812345671",
    pickupType: "Hotel delivery",
    pickupLocation: "Hotel Brahmaputra Ashok, Guwahati",
    pickupDate: daysFromNow(4),
    returnDate: daysFromNow(6),
    vehicleClass: "HATCHBACK",
    withDriver: false,
    message: "Self-drive Swift for Kaziranga. Will return at airport.",
    status: "Contacted",
  },
  {
    name: "Arjun Mehta",
    phone: "+919812345672",
    pickupType: "Airport counter",
    pickupLocation: "LGBI Airport, Borjhar",
    pickupDate: daysFromNow(7),
    returnDate: daysFromNow(13),
    vehicleClass: "VAN",
    withDriver: true,
    message: "Innova for 6 people, Tawang trip 6N/7D. ILP already arranged.",
    status: "Confirmed",
  },
  {
    name: "Sneha Reddy",
    phone: "+919812345673",
    pickupType: "Other",
    pickupLocation: "Paltan Bazar, Guwahati",
    pickupDate: daysFromNow(-3),
    returnDate: daysFromNow(-1),
    vehicleClass: "SCOOTER",
    withDriver: false,
    message: "Activa for 2 days. Self-drive.",
    status: "Cancelled",
  },
];

const settings = [
  { key: "businessPhone", value: "+919876543210" },
  { key: "whatsappNumber", value: "919876543210" },
  { key: "hours", value: "Open 24/7 · Airport pickup anytime" },
  {
    key: "serviceAreas",
    value:
      '["Guwahati","LGBI Airport","Shillong","Kaziranga","Cherrapunji","Tawang","Majuli","All Northeast India"]',
  },
  { key: "adminPasscode", value: "roam2024" },
];

async function main() {
  console.log("🌱 Seeding Roam Saathi database...");

  // Vehicles — clear & recreate to keep seed idempotent
  await db.vehicle.deleteMany({});
  for (const v of vehicles) {
    await db.vehicle.create({ data: v });
  }

  // Bookings — clear & recreate
  await db.booking.deleteMany({});
  for (const b of bookings) {
    await db.booking.create({ data: b });
  }

  // Settings — upsert by key
  for (const s of settings) {
    const existing = await db.settings.findUnique({ where: { key: s.key } });
    if (existing) {
      await db.settings.update({ where: { key: s.key }, data: { value: s.value } });
    } else {
      await db.settings.create({ data: s });
    }
  }

  const counts = {
    vehicles: await db.vehicle.count(),
    bookings: await db.booking.count(),
    settings: await db.settings.count(),
  };
  console.log("✅ Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
