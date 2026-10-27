-- ============================================================
-- Roam Saathi — one-time database setup (PostgreSQL)
-- Paste this ENTIRE file into your database console SQL editor
-- (Neon / Supabase / Prisma Postgres SQL console) and click Run.
-- Safe to re-run: it never deletes or overwrites existing data.
-- ============================================================

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Booking" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "pickupType" TEXT NOT NULL,
    "pickupLocation" TEXT,
    "pickupDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicleClass" TEXT NOT NULL,
    "vehicleName" TEXT,
    "destination" TEXT,
    "withDriver" BOOLEAN NOT NULL DEFAULT false,
    "estimatedTotal" INTEGER,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'New',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Settings_key_key" ON "Settings"("key");


-- ============================================================
-- Starter fleet: 17 vehicles with the full public rate card.
-- Skipped automatically if a row with the same id already exists.
-- ============================================================

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","registrationNumber","imageUrl","features","description","popular","sortOrder")
VALUES ('veh-thar', 'Mahindra Thar 4x4', 'Mahindra', 'SUV', 4, 'Manual', 'Diesel', 3500, 4500, true, NULL, 150, 12, 5000, NULL, NULL, '/fleet-suv.png', '4x4, AC, Bluetooth, Roof rails, Rugged tyres', 'Rugged 4x4 — the favourite for Tawang, Mechuka and off-road Northeast routes. Self-drive or chauffeur.', true, 1)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","registrationNumber","imageUrl","features","description","popular","sortOrder")
VALUES ('veh-scorpio', 'Mahindra Scorpio N', 'Mahindra', 'SUV', 7, 'Manual', 'Diesel', 3200, 4200, true, NULL, 150, 12, 5000, NULL, NULL, '/fleet-suv.png', '7-seater, AC, Touchscreen, Cruise control, Big boot', 'Spacious 7-seater SUV for family trips to Shillong, Cherrapunji and Kaziranga.', true, 2)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","registrationNumber","imageUrl","features","description","popular","sortOrder")
VALUES ('veh-ertiga', 'Maruti Ertiga', 'Maruti Suzuki', 'SUV', 7, 'Manual', 'Petrol', 2600, 3400, true, NULL, 150, 10, 4000, NULL, NULL, '/fleet-suv.png', '7-seater, AC, Bluetooth, Mileage friendly', 'Comfortable 7-seater MUV — great value for family tours and airport transfers.', false, 3)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","registrationNumber","imageUrl","features","description","popular","sortOrder")
VALUES ('veh-creta', 'Hyundai Creta', 'Hyundai', 'SUV', 5, 'Manual', 'Diesel', 3000, 4000, true, NULL, 150, 12, 5000, NULL, NULL, '/fleet-suv.png', 'AC, Touchscreen, Reverse camera, Sunroof', 'Premium compact SUV — smooth highway cruiser for Shillong and Meghalaya circuits.', false, 4)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","registrationNumber","imageUrl","features","description","popular","sortOrder")
VALUES ('veh-swift', 'Maruti Swift', 'Maruti Suzuki', 'HATCHBACK', 5, 'Manual', 'Petrol', 1700, 2400, true, NULL, 150, 8, 2000, NULL, NULL, '/fleet-hatchback.png', 'AC, Bluetooth, Power steering, Great mileage', 'Zippy and fuel-efficient — ideal for Guwahati city tours and short airport runs.', true, 5)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","registrationNumber","imageUrl","features","description","popular","sortOrder")
VALUES ('veh-i10', 'Hyundai i10 Nios', 'Hyundai', 'HATCHBACK', 5, 'Manual', 'Petrol', 1500, 2200, true, NULL, 150, 8, 2000, NULL, NULL, '/fleet-hatchback.png', 'AC, Bluetooth, Compact, Easy parking', 'Compact city car that is easy to park and light on fuel.', false, 6)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","registrationNumber","imageUrl","features","description","popular","sortOrder")
VALUES ('veh-tiago', 'Tata Tiago', 'Tata', 'HATCHBACK', 5, 'Manual', 'Petrol', 1500, 2100, true, NULL, 150, 8, 2000, NULL, NULL, '/fleet-hatchback.png', 'AC, Bluetooth, 4-star safety, Harman audio', 'Safe, solid city hatchback with a punchy audio system.', false, 7)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","registrationNumber","imageUrl","features","description","popular","sortOrder")
VALUES ('veh-alto', 'Maruti Alto', 'Maruti Suzuki', 'HATCHBACK', 5, 'Manual', 'Petrol', 1200, 1800, true, NULL, 120, 7, 1500, NULL, NULL, '/fleet-hatchback.png', 'AC, Budget friendly, Ultra mileage', 'The most budget-friendly way to get around Guwahati.', false, 8)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","registrationNumber","imageUrl","features","description","popular","sortOrder")
VALUES ('veh-dzire', 'Maruti Swift Dzire', 'Maruti Suzuki', 'SEDAN', 5, 'Manual', 'Petrol', 1900, 2600, true, NULL, 150, 9, 2500, NULL, NULL, '/fleet-hatchback.png', 'AC, Boot space, Bluetooth, Cruise-friendly', 'Classic sedan with a roomy boot — perfect for airport pickups with luggage.', true, 9)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","registrationNumber","imageUrl","features","description","popular","sortOrder")
VALUES ('veh-aura', 'Hyundai Aura', 'Hyundai', 'SEDAN', 5, 'Manual', 'Petrol', 1800, 2500, true, NULL, 150, 9, 2500, NULL, NULL, '/fleet-hatchback.png', 'AC, Boot space, Touchscreen, Rear AC vents', 'Comfortable compact sedan with rear AC vents for humid Guwahati days.', false, 10)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","registrationNumber","imageUrl","features","description","popular","sortOrder")
VALUES ('veh-activa', 'Honda Activa 6G', 'Honda', 'SCOOTER', 2, 'Automatic', 'Petrol', 500, NULL, false, NULL, 100, 5, 1000, NULL, NULL, '/fleet-scooter.png', 'Automatic, 25 kmpl+, Under-seat storage, Mobile charger', 'The city classic — zip around Guwahati, Kamakhya and the riverfront with ease.', true, 11)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","registrationNumber","imageUrl","features","description","popular","sortOrder")
VALUES ('veh-ntorq', 'TVS Ntorq 125', 'TVS', 'SCOOTER', 2, 'Automatic', 'Petrol', 550, NULL, false, NULL, 100, 5, 1000, NULL, NULL, '/fleet-scooter.png', 'Automatic, Sporty, Bluetooth dash, Boot light', 'Sporty 125cc scooty with Bluetooth console — fun and quick around the city.', false, 12)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","registrationNumber","imageUrl","features","description","popular","sortOrder")
VALUES ('veh-access', 'Suzuki Access 125', 'Suzuki', 'SCOOTER', 2, 'Automatic', 'Petrol', 500, NULL, false, NULL, 100, 5, 1000, NULL, NULL, '/fleet-scooter.png', 'Automatic, Mileage king, Big boot', 'Smooth, light and frugal — a favourite for daily exploration.', false, 13)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","registrationNumber","imageUrl","features","description","popular","sortOrder")
VALUES ('veh-himalayan', 'Royal Enfield Himalayan 411', 'Royal Enfield', 'BIKE', 2, 'Manual', 'Petrol', 1300, NULL, false, NULL, 200, 8, 2000, NULL, NULL, '/fleet-scooter.png', 'Touring ready, Long-travel suspension, Luggage mounts', 'Built for Northeast touring — Meghalaya ridges, Arunachal curves, Tawang climbs.', true, 14)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","registrationNumber","imageUrl","features","description","popular","sortOrder")
VALUES ('veh-xpulse', 'Hero Xpulse 200', 'Hero', 'BIKE', 2, 'Manual', 'Petrol', 1000, NULL, false, NULL, 200, 7, 1500, NULL, NULL, '/fleet-scooter.png', 'Adventure touring, Navigation dash, Light & agile', 'Light adventure bike for rough terrains and long rides through Meghalaya.', false, 15)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","registrationNumber","imageUrl","features","description","popular","sortOrder")
VALUES ('veh-innova', 'Toyota Innova Crysta', 'Toyota', 'VAN', 7, 'Manual', 'Diesel', 4500, 5500, true, NULL, 200, 15, 5000, NULL, NULL, '/fleet-van.png', 'Captain seats, AC, Big boot, Highway comfort', 'The group-travel gold standard — Shillong, Kaziranga or full Northeast circuits.', true, 16)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","registrationNumber","imageUrl","features","description","popular","sortOrder")
VALUES ('veh-tempo', 'Tempo Traveller 13-Seater', 'Force', 'VAN', 13, 'Manual', 'Diesel', 5500, 6500, true, NULL, 200, 18, 5000, NULL, NULL, '/fleet-van.png', '13 push-back seats, AC, Luggage rack, Music system', 'Group tours, wedding parties and corporate outings across Northeast India. Chauffeur only.', false, 17)
ON CONFLICT ("id") DO NOTHING;


-- Default settings (phone numbers are placeholders — change them
-- in Admin → Settings after logging in).

INSERT INTO "Settings" ("id","key","value")
VALUES ('set-phone', 'businessPhone', '+919876543210')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set-wa', 'whatsappNumber', '919876543210')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set-email', 'email', 'saathiroam@gmail.com')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set-hours', 'hours', 'Open 24/7 · Airport pickup anytime')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set-address', 'address', 'Near Lokpriya Gopinath Bordoloi International Airport, Borjhar, Guwahati, Assam 781015')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set-pass', 'adminPasscode', 'roam2024')
ON CONFLICT ("id") DO NOTHING;


-- Done! Open your site — the fleet section should now show 17 vehicles.
