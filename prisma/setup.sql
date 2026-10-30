-- ============================================================
-- Roam Saathi v6 — one-time database setup (PostgreSQL)
-- Paste this ENTIRE file into your database SQL editor
-- (Neon / Supabase / Prisma Postgres console) and click Run.
--
-- NOTE: with the v5 website this file is OPTIONAL — the site now
-- provisions and seeds itself automatically on the first visit.
-- Keep it only if you prefer the manual SQL-editor route.
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
);

-- CreateTable
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
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
);

-- CreateTable
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
);

-- CreateTable
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
);

-- CreateTable
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
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Settings_key_key" ON "Settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Page_slug_key" ON "Page"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Agreement_tokenHash_key" ON "Agreement"("tokenHash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Agreement_customerId_idx" ON "Agreement"("customerId");


-- ============================================================
-- Starter fleet: 17 vehicles with the full public rate card
-- (self-drive, with-driver, deposit, km limit, mileage, fuel note).
-- ============================================================

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","mileageKmpl","fuelNote","registrationNumber","imageUrl","features","description","available","popular","sortOrder")
VALUES ('veh-mahindra-thar-4x4', 'Mahindra Thar 4x4', 'Mahindra', 'SUV', 4, 'Manual', 'Diesel', 3500, 4500, true, NULL, 150, 12, 5000, NULL, 14, 'High consumption on hills — plan fuel stops in advance.', NULL, '/fleet-suv.png', '4x4, AC, Bluetooth, Roof rails, Rugged tyres', 'Rugged 4x4 — the favourite for Tawang, Mechuka and off-road Northeast routes. Self-drive or chauffeur.', true, true, 1)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","mileageKmpl","fuelNote","registrationNumber","imageUrl","features","description","available","popular","sortOrder")
VALUES ('veh-mahindra-scorpio-n', 'Mahindra Scorpio N', 'Mahindra', 'SUV', 7, 'Manual', 'Diesel', 3200, 4200, true, NULL, 150, 12, 5000, NULL, 14, NULL, NULL, '/fleet-suv.png', '7-seater, AC, Touchscreen, Cruise control, Big boot', 'Spacious 7-seater SUV for family trips to Shillong, Cherrapunji and Kaziranga.', true, true, 2)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","mileageKmpl","fuelNote","registrationNumber","imageUrl","features","description","available","popular","sortOrder")
VALUES ('veh-maruti-ertiga', 'Maruti Ertiga', 'Maruti Suzuki', 'SUV', 7, 'Manual', 'Petrol', 2600, 3400, true, NULL, 150, 10, 4000, NULL, 18, NULL, NULL, '/fleet-suv.png', '7-seater, AC, Bluetooth, Mileage friendly', 'Comfortable 7-seater MUV — great value for family tours and airport transfers.', true, false, 3)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","mileageKmpl","fuelNote","registrationNumber","imageUrl","features","description","available","popular","sortOrder")
VALUES ('veh-hyundai-creta', 'Hyundai Creta', 'Hyundai', 'SUV', 5, 'Manual', 'Diesel', 3000, 4000, true, NULL, 150, 12, 5000, NULL, 17, NULL, NULL, '/fleet-suv.png', 'AC, Touchscreen, Reverse camera, Sunroof', 'Premium compact SUV — smooth highway cruiser for Shillong and Meghalaya circuits.', true, false, 4)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","mileageKmpl","fuelNote","registrationNumber","imageUrl","features","description","available","popular","sortOrder")
VALUES ('veh-maruti-swift', 'Maruti Swift', 'Maruti Suzuki', 'HATCHBACK', 5, 'Manual', 'Petrol', 1700, 2400, true, NULL, 150, 8, 2000, NULL, 20, NULL, NULL, '/fleet-hatchback.png', 'AC, Bluetooth, Power steering, Great mileage', 'Zippy and fuel-efficient — ideal for Guwahati city tours and short airport runs.', true, true, 5)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","mileageKmpl","fuelNote","registrationNumber","imageUrl","features","description","available","popular","sortOrder")
VALUES ('veh-hyundai-i10-nios', 'Hyundai i10 Nios', 'Hyundai', 'HATCHBACK', 5, 'Manual', 'Petrol', 1500, 2200, true, NULL, 150, 8, 2000, NULL, 19, NULL, NULL, '/fleet-hatchback.png', 'AC, Bluetooth, Compact, Easy parking', 'Compact city car that is easy to park and light on fuel.', true, false, 6)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","mileageKmpl","fuelNote","registrationNumber","imageUrl","features","description","available","popular","sortOrder")
VALUES ('veh-tata-tiago', 'Tata Tiago', 'Tata', 'HATCHBACK', 5, 'Manual', 'Petrol', 1500, 2100, true, NULL, 150, 8, 2000, NULL, 20, NULL, NULL, '/fleet-hatchback.png', 'AC, Bluetooth, 4-star safety, Harman audio', 'Safe, solid city hatchback with a punchy audio system.', true, false, 7)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","mileageKmpl","fuelNote","registrationNumber","imageUrl","features","description","available","popular","sortOrder")
VALUES ('veh-maruti-alto', 'Maruti Alto', 'Maruti Suzuki', 'HATCHBACK', 5, 'Manual', 'Petrol', 1200, 1800, true, NULL, 120, 7, 1500, NULL, 22, NULL, NULL, '/fleet-hatchback.png', 'AC, Budget friendly, Ultra mileage', 'The most budget-friendly way to get around Guwahati.', true, false, 8)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","mileageKmpl","fuelNote","registrationNumber","imageUrl","features","description","available","popular","sortOrder")
VALUES ('veh-maruti-swift-dzire', 'Maruti Swift Dzire', 'Maruti Suzuki', 'SEDAN', 5, 'Manual', 'Petrol', 1900, 2600, true, NULL, 150, 9, 2500, NULL, 21, NULL, NULL, '/fleet-hatchback.png', 'AC, Boot space, Bluetooth, Cruise-friendly', 'Classic sedan with a roomy boot — perfect for airport pickups with luggage.', true, true, 9)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","mileageKmpl","fuelNote","registrationNumber","imageUrl","features","description","available","popular","sortOrder")
VALUES ('veh-hyundai-aura', 'Hyundai Aura', 'Hyundai', 'SEDAN', 5, 'Manual', 'Petrol', 1800, 2500, true, NULL, 150, 9, 2500, NULL, 20, NULL, NULL, '/fleet-hatchback.png', 'AC, Boot space, Touchscreen, Rear AC vents', 'Comfortable compact sedan with rear AC vents for humid Guwahati days.', true, false, 10)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","mileageKmpl","fuelNote","registrationNumber","imageUrl","features","description","available","popular","sortOrder")
VALUES ('veh-honda-activa-6g', 'Honda Activa 6G', 'Honda', 'SCOOTER', 2, 'Automatic', 'Petrol', 500, NULL, false, NULL, 100, 5, 1000, NULL, 45, NULL, NULL, '/fleet-scooter.png', 'Automatic, 45 kmpl, Under-seat storage, Mobile charger', 'The city classic — zip around Guwahati, Kamakhya and the riverfront with ease.', true, true, 11)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","mileageKmpl","fuelNote","registrationNumber","imageUrl","features","description","available","popular","sortOrder")
VALUES ('veh-tvs-ntorq-125', 'TVS Ntorq 125', 'TVS', 'SCOOTER', 2, 'Automatic', 'Petrol', 550, NULL, false, NULL, 100, 5, 1000, NULL, 40, NULL, NULL, '/fleet-scooter.png', 'Automatic, Sporty, Bluetooth dash, Boot light', 'Sporty 125cc scooty with Bluetooth console — fun and quick around the city.', true, false, 12)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","mileageKmpl","fuelNote","registrationNumber","imageUrl","features","description","available","popular","sortOrder")
VALUES ('veh-suzuki-access-125', 'Suzuki Access 125', 'Suzuki', 'SCOOTER', 2, 'Automatic', 'Petrol', 500, NULL, false, NULL, 100, 5, 1000, NULL, 45, NULL, NULL, '/fleet-scooter.png', 'Automatic, Mileage king, Big boot', 'Smooth, light and frugal — a favourite for daily exploration.', true, false, 13)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","mileageKmpl","fuelNote","registrationNumber","imageUrl","features","description","available","popular","sortOrder")
VALUES ('veh-royal-enfield-himalayan-411', 'Royal Enfield Himalayan 411', 'Royal Enfield', 'BIKE', 2, 'Manual', 'Petrol', 1300, NULL, false, NULL, 200, 8, 2000, NULL, 30, NULL, NULL, '/fleet-scooter.png', 'Touring ready, Long-travel suspension, Luggage mounts', 'Built for Northeast touring — Meghalaya ridges, Arunachal curves, Tawang climbs.', true, true, 14)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","mileageKmpl","fuelNote","registrationNumber","imageUrl","features","description","available","popular","sortOrder")
VALUES ('veh-hero-xpulse-200', 'Hero Xpulse 200', 'Hero', 'BIKE', 2, 'Manual', 'Petrol', 1000, NULL, false, NULL, 200, 7, 1500, NULL, 35, NULL, NULL, '/fleet-scooter.png', 'Adventure touring, Navigation dash, Light & agile', 'Light adventure bike for rough terrains and long rides through Meghalaya.', true, false, 15)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","mileageKmpl","fuelNote","registrationNumber","imageUrl","features","description","available","popular","sortOrder")
VALUES ('veh-toyota-innova-crysta', 'Toyota Innova Crysta', 'Toyota', 'VAN', 7, 'Manual', 'Diesel', 4500, 5500, true, NULL, 200, 15, 5000, NULL, 12, 'Diesel — cheapest per km for long hill circuits.', NULL, '/fleet-van.png', 'Captain seats, AC, Big boot, Highway comfort', 'The group-travel gold standard — Shillong, Kaziranga or full Northeast circuits.', true, true, 16)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id","name","brand","class","seats","transmission","fuelType","dailyRate","withDriverPerDay","withDriverAvailable","monthlyRate","kmLimitPerDay","extraKmRate","securityDeposit","driverBata","mileageKmpl","fuelNote","registrationNumber","imageUrl","features","description","available","popular","sortOrder")
VALUES ('veh-tempo-traveller-13-seater', 'Tempo Traveller 13-Seater', 'Force', 'VAN', 13, 'Manual', 'Diesel', 5500, 6500, true, NULL, 200, 18, 5000, NULL, 10, 'Chauffeur only — fuel & toll included in the fare.', NULL, '/fleet-van.png', '13 push-back seats, AC, Luggage rack, Music system', 'Group tours, wedding parties and corporate outings across Northeast India. Chauffeur only.', true, false, 17)
ON CONFLICT ("id") DO NOTHING;


-- ============================================================
-- Default settings: contacts, fuel policy, destinations, map,
-- announcement + the default admin password (roam2024, hashed).
-- ============================================================

INSERT INTO "Settings" ("id","key","value")
VALUES ('set-businessphone', 'businessPhone', '+919876543210')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set-whatsappnumber', 'whatsappNumber', '919876543210')
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
VALUES ('set-adminpasscode', 'adminPasscode', 'roam2024')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set-adminpasswordhash', 'adminPasswordHash', '9400a21b9ae718919828ae4b17550a2e774ee0635171ec5386d2b216f3eb4fed64a4ecd795ec518ece80e998346f012a8db2005c9ab77c7cfee21710c8830375')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set-adminpasswordsalt', 'adminPasswordSalt', 'fbd80b6a48f744a71e1d167e4687e84f')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set-mapembedurl', 'mapEmbedUrl', 'https://www.google.com/maps?q=Lokpriya+Gopinath+Bordoloi+International+Airport,+Borjhar,+Guwahati,+Assam&output=embed')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set-fuelpriceperlitre', 'fuelPricePerLitre', '100')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set-destinationsjson', 'destinationsJson', '[{"name":"Guwahati city","km":25},{"name":"Shillong","km":100},{"name":"Cherrapunji (Sohra)","km":150},{"name":"Kaziranga National Park","km":200},{"name":"Majuli","km":350},{"name":"Dirang","km":380},{"name":"Tawang","km":450}]')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set-policyfuelwithdriver', 'policyFuelWithDriver', 'Fuel, toll, parking and driver charges are fully included in the quoted fare — nothing extra to pay on the way.')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set-policyfuelselfdrive', 'policyFuelSelfDrive', 'Fuel, toll, parking, state permits and entry fees are NOT included — you pay at actuals. The vehicle comes with a full tank and should be returned full. Hill routes (Shillong, Cherrapunji, Tawang) climb a lot, so expect noticeably higher consumption than city driving.')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set-bookingdisclaimer', 'bookingDisclaimer', 'With driver: fuel, toll & parking included in the fare. Self-drive: fuel, toll, permits & parking paid by you at actuals — hill and remote routes (Shillong, Cherrapunji, Tawang) consume more fuel. Estimates shown are indicative only.')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set-announcement', 'announcement', 'Monsoon Special — 10% off on 3+ day Meghalaya trips. Mention MONSOON on WhatsApp!')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set-announcementenabled', 'announcementEnabled', 'true')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set-instagram', 'instagram', '')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set-facebook', 'facebook', '')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set-youtube', 'youtube', '')
ON CONFLICT ("id") DO NOTHING;


-- Settings.key has a UNIQUE index — also protect by key:

INSERT INTO "Settings" ("id","key","value")
VALUES ('set2-businessphone', 'businessPhone', '+919876543210')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set2-whatsappnumber', 'whatsappNumber', '919876543210')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set2-email', 'email', 'saathiroam@gmail.com')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set2-hours', 'hours', 'Open 24/7 · Airport pickup anytime')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set2-address', 'address', 'Near Lokpriya Gopinath Bordoloi International Airport, Borjhar, Guwahati, Assam 781015')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set2-adminpasscode', 'adminPasscode', 'roam2024')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set2-adminpasswordhash', 'adminPasswordHash', 'a322905e8b3c9d6c14baf1b89bb3db0759c21f6d4d3276e2efb4e552f25a5a822a340805e5dbe25d45714379ec2bef85007e74da5a23f6feb45ca889be2ce13d')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set2-adminpasswordsalt', 'adminPasswordSalt', '0416607cc91f8b1b054e92af3b547d7a')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set2-mapembedurl', 'mapEmbedUrl', 'https://www.google.com/maps?q=Lokpriya+Gopinath+Bordoloi+International+Airport,+Borjhar,+Guwahati,+Assam&output=embed')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set2-fuelpriceperlitre', 'fuelPricePerLitre', '100')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set2-destinationsjson', 'destinationsJson', '[{"name":"Guwahati city","km":25},{"name":"Shillong","km":100},{"name":"Cherrapunji (Sohra)","km":150},{"name":"Kaziranga National Park","km":200},{"name":"Majuli","km":350},{"name":"Dirang","km":380},{"name":"Tawang","km":450}]')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set2-policyfuelwithdriver', 'policyFuelWithDriver', 'Fuel, toll, parking and driver charges are fully included in the quoted fare — nothing extra to pay on the way.')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set2-policyfuelselfdrive', 'policyFuelSelfDrive', 'Fuel, toll, parking, state permits and entry fees are NOT included — you pay at actuals. The vehicle comes with a full tank and should be returned full. Hill routes (Shillong, Cherrapunji, Tawang) climb a lot, so expect noticeably higher consumption than city driving.')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set2-bookingdisclaimer', 'bookingDisclaimer', 'With driver: fuel, toll & parking included in the fare. Self-drive: fuel, toll, permits & parking paid by you at actuals — hill and remote routes (Shillong, Cherrapunji, Tawang) consume more fuel. Estimates shown are indicative only.')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set2-announcement', 'announcement', 'Monsoon Special — 10% off on 3+ day Meghalaya trips. Mention MONSOON on WhatsApp!')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set2-announcementenabled', 'announcementEnabled', 'true')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set2-instagram', 'instagram', '')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set2-facebook', 'facebook', '')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Settings" ("id","key","value")
VALUES ('set2-youtube', 'youtube', '')
ON CONFLICT ("key") DO NOTHING;


-- ============================================================
-- Starter content pages: Rules & Policies, blog, travel diary,
-- customer story. Parents first, then sub-pages.
-- ============================================================

INSERT INTO "Page" ("id","title","slug","type","parentId","excerpt","coverImage","blocks","visibleOnHome","showInMenu","published","sortOrder","seoTitle","seoDescription","seoKeywords")
VALUES ('page-rules-and-policies', 'Rules & Policies', 'rules-and-policies', 'policy', NULL, 'Eligibility, booking & payment, the fuel–toll golden rule, deposits, usage rules, damage cover, cancellations — everything in plain language.', NULL, '[{"type":"callout","tone":"green","title":"Two simple modes","text":"With driver: fuel, toll, parking and driver charges are included in your quoted fare. Self-drive: fuel, toll, parking, state permits and entry fees are paid by you at actuals. Everything below explains both modes in plain language."},{"type":"heading","text":"1. Who can book","level":2},{"type":"text","text":"Roam Saathi serves tourists and outstation travellers only. To rent you must be at least 18 years old for chauffeur-driven bookings and 21 years old for self-drive rentals. For self-drive cars you must have held a valid driving licence for at least one year. Scooters and bikes require a valid two-wheeler licence.\n\nWe may ask for one government photo ID (Aadhaar, Passport, or Voter ID) in original at the time of delivery, along with your driving licence for self-drive bookings. Copies are noted on the rental sheet and returned after the vehicle comes back in good condition."},{"type":"heading","text":"2. Booking & confirmation","level":2},{"type":"list","ordered":true,"items":["Send us your dates, destination and vehicle preference on WhatsApp or through the booking form on this website.","We reply with availability and a final quote (including or excluding fuel, depending on the mode you choose).","Your booking is confirmed only after we receive the advance — usually 20–30% of the estimated trip value, paid by UPI.","The balance is payable at pickup (cash / UPI) before the journey starts."]},{"type":"text","text":"Bookings are handled on a first-come, first-served basis. A date is blocked for you only after the advance is received — an enquiry on WhatsApp alone does not guarantee the vehicle."},{"type":"heading","text":"3. Fuel, toll & permits — the golden rule","level":2},{"type":"callout","tone":"amber","title":"Self-drive bookings","text":"Fuel, toll, parking, state permits and entry fees are NOT included. The vehicle is delivered with a full tank and must be returned with a full tank. Because every route burns a different amount of fuel — the climb to Shillong and Cherrapunji, the long haul to Tawang, or plains driving around Kaziranga — fuel is always billed at actuals, never as a flat rate."},{"type":"callout","tone":"green","title":"With-driver bookings","text":"You pay one all-inclusive fare: the driver, fuel for the agreed route, tolls and parking are all provided by us. Nothing extra is collected on the road. If you change the route mid-trip, the fare is re-quoted fairly before continuing."},{"type":"text","text":"The fuel estimator shown while booking is only an indicative guide calculated from distance, vehicle mileage and current pump prices. Actual consumption depends on traffic, road condition, AC use, passenger load and driving style — treat it as an estimate, not a quote."},{"type":"heading","text":"4. Security deposit (self-drive)","level":2},{"type":"text","text":"A refundable security deposit (shown on every vehicle card) is collected at pickup for self-drive rentals. It is returned at drop-off after a joint condition check of the vehicle, provided the fuel level matches and there is no new damage or missing equipment. For with-driver bookings no deposit is normally required, except for long multi-day tours where a small trip advance may apply."},{"type":"heading","text":"5. Distance limits & extra kilometres","level":2},{"type":"text","text":"Each vehicle includes a fixed number of kilometres per day (typically 100–200 km depending on the vehicle — see the fleet section). Kilometres driven beyond the included limit are charged at the extra-km rate shown on the vehicle card. For with-driver tours we agree the total route and days in writing on WhatsApp before departure; extra days and extra kilometres are charged as per the same rate card."},{"type":"heading","text":"6. Usage rules","level":2},{"type":"list","ordered":false,"items":["Only the drivers named in the rental agreement may drive a self-drive vehicle.","No sub-renting, no racing, no rallies, no off-road abuse beyond the vehicle''s design.","No smoking, no alcohol consumption and no transport of prohibited goods inside our vehicles.","Do not take the vehicle outside Assam & the Northeast without telling us — several states need permits and we must know for support.","Pets are allowed only with prior approval and a cleaning fee."]},{"type":"heading","text":"7. Late returns & extensions","level":2},{"type":"text","text":"Rental days are counted in 24-hour blocks from the pickup time. Need more time? Message us before your slot ends — if the vehicle has no next booking we happily extend at the normal daily rate. Returns more than 3 hours late are charged an extra half-day; more than 6 hours late, a full day. Repeated late returns without intimation may affect future bookings."},{"type":"heading","text":"8. Damage, accidents & traffic fines","level":2},{"type":"text","text":"All our vehicles carry valid insurance. For self-drive rentals, the hirer is responsible for any new dents, scratches, glass, tyre or interior damage up to the insurance deductible / a maximum of Rs 50,000, whichever is lower. Damage caused while driving under the influence, racing, or in gross violation of the Motor Vehicles Act is billed in full to the hirer.\n\nAll traffic and parking fines incurred during the rental period are payable by the hirer (self-drive) or informed to us immediately (with-driver — the driver handles challans related to vehicle documents, but fines for rider behaviour remain the hirer''s responsibility)."},{"type":"heading","text":"9. Breakdowns & support","level":2},{"type":"text","text":"Every booking includes roadside support on call during your trip. In the rare case of a mechanical failure not caused by misuse, we repair or swap the vehicle at no cost to you. Save our WhatsApp number — it is printed on the rental sheet and on the vehicle windscreen sticker."},{"type":"heading","text":"10. Cancellation & refunds","level":2},{"type":"list","ordered":true,"items":["Cancel 72 hours or more before pickup: full refund of the advance, or free date change.","Cancel between 24–72 hours: 50% of the advance is retained.","Cancel within 24 hours or no-show: advance is non-refundable.","Mechanical breakdown on our side mid-trip: unused days are refunded or a replacement vehicle is provided, subject to availability."]},{"type":"text","text":"Refunds are processed to the original UPI / bank account within 3–5 working days."},{"type":"heading","text":"11. Airport pickup & home delivery","level":2},{"type":"text","text":"We pick you up right outside LGBI Airport arrivals (Borjhar, Guwahati) at no extra charge — share your flight number and we track delays. Hotel / home delivery anywhere in Guwahati is available for a small fee based on distance. For airport self-drive handovers, the vehicle is handed over at the agreed parking bay with photos of fuel level and condition."},{"type":"heading","text":"12. Right to refuse","level":2},{"type":"text","text":"We may refuse or end a rental if the vehicle is being used dangerously, if documents turn out to be false, or if the hirer behaves abusively with our staff or drivers. In such cases the applicable charges till that point stand and the deposit is settled after the condition check."},{"type":"heading","text":"13. Questions?","level":2},{"type":"text","text":"Unsure about anything above? Message us on WhatsApp before booking — we would rather explain twice than surprise you once. These policies are part of every rental agreement signed or confirmed on WhatsApp with Roam Saathi."}]', false, true, true, 1, NULL, 'Roam Saathi rental policies: booking, fuel & toll rules for self-drive vs with-driver, deposits, damage cover and cancellations — explained simply.', NULL)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Page" ("id","title","slug","type","parentId","excerpt","coverImage","blocks","visibleOnHome","showInMenu","published","sortOrder","seoTitle","seoDescription","seoKeywords")
VALUES ('page-travel-diaries', 'Travel Diaries', 'travel-diaries', 'travel-diary', NULL, 'Real trips from our customers — routes, costs, surprises and honest advice from the road.', '/fleet-van.png', '[{"type":"text","text":"Welcome to our travel diary wall. Every story here is a real Roam Saathi trip — published with the customer''s permission. Want yours featured? Send your photos and story on WhatsApp after your trip and get 5% off your next booking."}]', true, true, true, 2, NULL, 'Customer travel diaries from Roam Saathi trips across Northeast India.', NULL)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Page" ("id","title","slug","type","parentId","excerpt","coverImage","blocks","visibleOnHome","showInMenu","published","sortOrder","seoTitle","seoDescription","seoKeywords")
VALUES ('page-top-5-weekend-drives-from-guwahati', 'Top 5 Weekend Drives from Guwahati', 'top-5-weekend-drives-from-guwahati', 'blog', NULL, 'Shillong in 3 hours, rhinos in 4, Tawang for the brave — five routes our customers keep coming back for, with vehicle advice for each.', '/fleet-suv.png', '[{"type":"text","text":"Guwahati is the perfect base camp for the Northeast — within a few hours'' drive you can be above the clouds in Meghalaya, beside rhinos in Kaziranga or on a river island in the Brahmaputra. Here are the five drives our customers book again and again."},{"type":"heading","text":"1. Guwahati → Shillong → Cherrapunji (3–4 days)","level":2},{"type":"text","text":"The classic Meghalaya loop. Umiam Lake appears barely an hour after Guwahati, Shillong adds cafes and colonial charm, and Sohra (Cherrapunji) hands you Nohkalikai Falls, the Seven Sisters and the famous double-decker root bridge at Nongriat. An SUV like the Scorpio N or Ertiga handles the wet roads comfortably, and with a driver you can simply stare out of the window."},{"type":"image","src":"/fleet-suv.png","caption":"SUVs are the favourite for the Meghalaya plateau."},{"type":"heading","text":"2. Guwahati → Kaziranga (2–3 days)","level":2},{"type":"text","text":"Around 200 km of smooth highway. Leave early, catch the morning elephant safari, and spend the evening at the Orchid Park. The road is excellent, so even a hatchback or Dzire works for couples; families prefer the Innova Crysta."},{"type":"heading","text":"3. The Tawang expedition (5–7 days)","level":2},{"type":"text","text":"The big one — 450 km each way through Bomdila, Dirang, Sela Pass and finally Tawang. It demands a Thar or Scorpio with an experienced driver, ILP paperwork for Arunachal, and patience for the mountains. Our chauffeurs have done this route dozens of times; book it with driver and forget the fuel math entirely."},{"type":"callout","tone":"amber","title":"Self-drive? Read this","text":"On Tawang''s climbs even a frugal hatchback drinks far more fuel than the brochure says. Use the fuel estimator in our booking form to budget litres before you go."},{"type":"heading","text":"4. Majuli & the Brahmaputra (3 days)","level":2},{"type":"text","text":"Drive to Nimati Ghat near Jorhat, ferry across to the world''s largest river island, and lose yourself among satras and mask-makers. Roads are decent; the last stretch is the adventure. Majuli pairs beautifully with Kaziranga in one loop."},{"type":"heading","text":"5. City day: Guwahati in a scooter","level":2},{"type":"text","text":"Kamakhya Temple at dawn, the riverfront at Umananda, a sunset cruise, and dinner in Fancy Bazaar — an Activa makes the whole city your playground. Helmets included, obviously."},{"type":"cta","title":"Ready when you are","text":"Tell us your dates and we will suggest the right vehicle, route plan and an honest all-in quote.","buttonLabel":"Plan my trip on WhatsApp","action":"whatsapp"}]', true, true, true, 4, NULL, 'The 5 best weekend road trips from Guwahati — Shillong, Kaziranga, Tawang, Majuli — with vehicle recommendations and fuel tips.', NULL)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Page" ("id","title","slug","type","parentId","excerpt","coverImage","blocks","visibleOnHome","showInMenu","published","sortOrder","seoTitle","seoDescription","seoKeywords")
SELECT 'page-3-days-in-meghalaya', '3 Days in Meghalaya — A Customer Diary', '3-days-in-meghalaya', 'travel-diary', p."id", 'The Sharma family, one Innova Crysta with driver, four days of rain, root bridges and zero driving stress.', '/fleet-van.png', '[{"type":"text","text":"The Sharma family from Bengaluru took our Innova Crysta with driver for 4 days across Meghalaya in July. Mrs Sharma kept a diary, and kindly let us publish it (with names shortened). This is what a Roam Saathi trip actually feels like."},{"type":"heading","text":"Day 1 — Airport to Shillong","level":2},{"type":"text","text":"Our flight landed at 11:30 and Dhananjoy bhai was holding a name plate right at arrivals, exactly as promised. The Innova smelled of fresh air freshener (small things!). We stopped at Umiam Lake for photos and reached Shillong by 4 pm. Zero stress about driving on the wrong side for the first time."},{"type":"quote","text":"The driver knew exactly where the clean washrooms were. In the hills, that is worth its own review.","author":"Mrs. S, Bengaluru"},{"type":"heading","text":"Day 2 — Sohra in the rain","level":2},{"type":"text","text":"It rained the entire day, which is apparently the point of visiting Cherrapunji. Nohkalikai was full roar. The driver waited with hot chai at every stop and quietly recalculated our route when a landslide slowed the highway — no drama, no extra asking."},{"type":"image","src":"/fleet-van.png","caption":"Our Innova Crysta — the family favourite."},{"type":"heading","text":"Day 3 & 4 — Root bridges and the long way home","level":2},{"type":"text","text":"The Nongriat trek destroyed our legs (3,500 steps each way — worth it), and the Innova''s suspension carried us gently back to Guwahati airport with a stop at a Khasi lunch place we would never have found on Google. Fuel, tolls, parking — all inside the fare we were quoted on day one. No surprises, which is the whole point."},{"type":"callout","tone":"green","title":"Their verdict","text":"Booked with driver for the hills and never looked back. The all-inclusive fare made budgeting trivial — the number told on WhatsApp was the number paid."}]', true, false, true, 3, NULL, 'A real customer diary of a 4-day Meghalaya trip with a Roam Saathi chauffeur-driven Innova Crysta.', NULL
FROM "Page" p WHERE p."slug" = 'travel-diaries'
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Page" ("id","title","slug","type","parentId","excerpt","coverImage","blocks","visibleOnHome","showInMenu","published","sortOrder","seoTitle","seoDescription","seoKeywords")
SELECT 'page-riding-meghalaya-on-himalayans', 'Customer Story: Riding Meghalaya on Himalayans', 'riding-meghalaya-on-himalayans', 'customer-story', p."id", 'Three friends, two Himalayan 411s, 900 km — how the fuel estimator made self-drive trust easier.', '/fleet-scooter.png', '[{"type":"text","text":"Anirban and two college friends booked the Royal Enfield Himalayan pair for a 5-day Meghalaya riding loop — self-drive, full tank, GoPro ready. We asked him three questions."},{"type":"heading","text":"Why self-drive instead of a chauffeur?","level":2},{"type":"quote","text":"For us the ride IS the trip. We wanted to stop every twenty minutes for photos. But the fuel-toll math honestly scared us — the estimator on your booking form was why we trusted you guys.","author":"Anirban, Kolkata"},{"type":"heading","text":"How did the fuel actually work out?","level":2},{"type":"text","text":"We filled about 42 litres each over 900 km with luggage — the estimator had said roughly 38–45. Close enough to budget. Returned both bikes full, deposit back on UPI the same evening at drop-off."},{"type":"heading","text":"Would you book again?","level":2},{"type":"text","text":"Already planning Arunachal next spring — but that one we will take with a driver. Respect to anyone who rides to Tawang themselves!"}]', true, false, true, 5, NULL, 'A customer story: self-drive Royal Enfield Himalayan tour of Meghalaya with Roam Saathi.', NULL
FROM "Page" p WHERE p."slug" = 'travel-diaries'
ON CONFLICT ("id") DO NOTHING;


-- ============================================================
-- Starter Stays & Partners listings (edit from Admin → Stays).
-- ============================================================

INSERT INTO "Hotel" ("id","name","state","city","area","phone","whatsapp","priceFrom","category","description","amenities","images","bookingUrl","mapUrl","partner","featured","showOnSite","sortOrder")
VALUES ('stay-novotel-guwahati-lgbi-airport', 'Novotel Guwahati LGBI Airport', 'Assam', 'Guwahati', 'Borjhar, 5 min from the airport gate', '+913612340000', NULL, 6500, 'Premium', 'Five-minute drive from the arrivals gate — the easiest first-night stop after a late landing. Pool, gym, multi-cuisine restaurant and airport shuttle.', 'WiFi, Airport shuttle, Pool, Restaurant, Parking, Gym', '[]', NULL, NULL, false, true, true, 1)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Hotel" ("id","name","state","city","area","phone","whatsapp","priceFrom","category","description","amenities","images","bookingUrl","mapUrl","partner","featured","showOnSite","sortOrder")
VALUES ('stay-ri-kynjai-serenity-by-the-lake', 'Ri Kynjai Serenity by the Lake', 'Meghalaya', 'Shillong', 'Umiam Lake, Guwahati–Shillong Road', '+919856000000', '9856000000', 4800, 'Resort', 'Khasi-style cottages on the shores of Umiam Lake, halfway between Guwahati and Shillong. Perfect first stop on a Meghalaya loop with one of our SUVs.', 'Lake view, WiFi, Restaurant, Bonfire, Parking, Boat ride', '[]', NULL, NULL, true, true, true, 2)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Hotel" ("id","name","state","city","area","phone","whatsapp","priceFrom","category","description","amenities","images","bookingUrl","mapUrl","partner","featured","showOnSite","sortOrder")
VALUES ('stay-hotel-polo-towers', 'Hotel Polo Towers', 'Meghalaya', 'Shillong', 'Police Bazar, city centre', '+913642500000', NULL, 3200, 'Standard', 'Central Shillong stay walking distance from Police Bazar''s cafés and market. Reliable base for Cherrapunji and Mawlynnong day drives.', 'WiFi, Restaurant, Bar, Parking, Room service', '[]', NULL, NULL, false, false, true, 3)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Hotel" ("id","name","state","city","area","phone","whatsapp","priceFrom","category","description","amenities","images","bookingUrl","mapUrl","partner","featured","showOnSite","sortOrder")
VALUES ('stay-tawang-holiday-home', 'Tawang Holiday Home', 'Arunachal Pradesh', 'Tawang', 'Near Tawang Monastery road', '+919402000000', '9402000000', 2200, 'Homestay', 'Warm family homestay with mountain views and home-cooked Monpa food. Our Thar and Scorpio drivers know the Tawang route and ILP checkpoints well.', 'Home food, Heating, Hot water, Parking, Monastery view', '[]', NULL, NULL, true, true, true, 4)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Hotel" ("id","name","state","city","area","phone","whatsapp","priceFrom","category","description","amenities","images","bookingUrl","mapUrl","partner","featured","showOnSite","sortOrder")
VALUES ('stay-iora-the-kaziranga-retreat', 'Iora — The Kaziranga Retreat', 'Assam', 'Kaziranga', 'Kohora, near Kaziranga National Park gate', '+913766200000', NULL, 5200, 'Resort', 'Wind-down resort minutes from the park gate for early-morning jeep and elephant safaris. Jeep safari bookings can be arranged at the desk.', 'WiFi, Restaurant, Garden, Safari desk, Parking, Cultural shows', '[]', NULL, NULL, false, false, true, 5)
ON CONFLICT ("id") DO NOTHING;


-- Done! Open your site — the fleet section now shows 17 vehicles,
-- /stays shows 5 partner stays, the CRM (Admin → Customers) and
-- one-time e-sign agreements are ready, and Admin (/admin) is set up.
