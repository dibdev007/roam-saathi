import * as fs from "node:fs";
import * as path from "node:path";
import { RoamSaathiApp } from "@/components/site/RoamSaathiApp";
import { db } from "@/lib/db";
import { ensureDatabaseReady } from "@/lib/dbReady";
import { stripSecretSettings } from "@/lib/auth";
import { defaultFleetVehicles } from "@/lib/setupData";
import type {
  VehicleDTO,
  SettingsMap,
  PageDTO,
  HotelDTO,
} from "@/lib/siteConfig";

export const dynamic = "force-dynamic";

// Brand images we want to detect. Key = filename in /public.
const WANTED_IMAGES = [
  "hero.png",
  "fleet-suv.png",
  "fleet-hatchback.png",
  "fleet-scooter.png",
  "fleet-van.png",
  "logo_1.png",
  "logo_2.png",
  "logo_3.png",
  "logo_4.png",
];

const PUBLIC_DIR = path.join(process.cwd(), "public");
const BRAND_DIR = path.join(process.cwd(), "download", "brand");

/**
 * Build a map of {filename: exists} for the WANTED_IMAGES list.
 *
 * Sandbox: checks /public first, then copies from /download/brand if present.
 * Production (Vercel & co.): the serverless filesystem is read-only and
 * /public may not be visible from this function — but every shipped image IS
 * served by the platform from /public. So we only report an image as missing
 * when we can positively see the public directory AND the file is absent in
 * it. If the directory itself cannot be found or fs errors out, we assume the
 * shipped images exist (the deployed site always has them).
 */
function detectImages(): Record<string, boolean> {
  const allShipped = (): Record<string, boolean> =>
    Object.fromEntries(WANTED_IMAGES.map((n) => [n, true]));

  const map: Record<string, boolean> = {};
  try {
    // Public dir not visible (typical on serverless) -> shipped assets are
    // still served by the platform, so treat them as present.
    if (!fs.existsSync(PUBLIC_DIR)) return allShipped();

    let brandFiles: string[] = [];
    try {
      brandFiles = fs.existsSync(BRAND_DIR) ? fs.readdirSync(BRAND_DIR) : [];
    } catch {
      brandFiles = [];
    }

    for (const name of WANTED_IMAGES) {
      const pubPath = path.join(PUBLIC_DIR, name);
      let exists = false;
      try {
        exists = fs.existsSync(pubPath);
      } catch {
        exists = false;
      }

      if (!exists) {
        // Try to copy from /download/brand if present (sandbox convenience)
        const brandPath = path.join(BRAND_DIR, name);
        try {
          if (brandFiles.includes(name) && fs.existsSync(brandPath)) {
            fs.copyFileSync(brandPath, pubPath);
            exists = true;
          }
        } catch {
          /* read-only fs — ignore copy errors */
        }
      }
      map[name] = exists;
    }
    return map;
  } catch {
    // fs unavailable or unexpected error -> assume the shipped images exist.
    return allShipped();
  }
}

/**
 * Load live data from the database (vehicles + settings + owner pages).
 *
 * v5 fix: before reading we run ensureDatabaseReady() — on a fresh or
 * never-provisioned database it creates the tables and seeds the starter
 * fleet/stays/pages automatically, so a new deployment shows real data on
 * the very first visit (this was the "fleet & rates show nothing" bug).
 * If the database is truly unreachable we degrade gracefully to empty
 * values — the UI falls back to the built-in fleet and siteConfig defaults.
 */
async function loadSiteData(): Promise<{
  vehicles: VehicleDTO[];
  settings: SettingsMap;
  menuPages: PageDTO[];
  homePages: PageDTO[];
  hotels: HotelDTO[];
}> {
  try {
    await ensureDatabaseReady();

    const [vehicleRows, settingsRows, menuRows, homeRows, hotelRows] = await Promise.all([
      db.vehicle.findMany({
        where: { available: true },
        orderBy: [{ sortOrder: "asc" }, { dailyRate: "asc" }],
      }),
      db.settings.findMany(),
      db.page.findMany({
        where: { showInMenu: true, published: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      db.page.findMany({
        where: { visibleOnHome: true, published: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      }),
      db.hotel.findMany({
        where: { showOnSite: true, featured: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
    ]);

    const settings = stripSecretSettings(
      Object.fromEntries(settingsRows.map((r) => [r.key, r.value]))
    ) as SettingsMap;

    // Serialize dates -> strings for the client components
    const vehicles: VehicleDTO[] = vehicleRows.map((v) => ({
      id: v.id,
      name: v.name,
      brand: v.brand,
      class: v.class,
      seats: v.seats,
      transmission: v.transmission,
      fuelType: v.fuelType,
      dailyRate: v.dailyRate,
      withDriverPerDay: v.withDriverPerDay,
      withDriverAvailable: v.withDriverAvailable,
      monthlyRate: v.monthlyRate,
      kmLimitPerDay: v.kmLimitPerDay,
      extraKmRate: v.extraKmRate,
      securityDeposit: v.securityDeposit,
      driverBata: v.driverBata,
      mileageKmpl: v.mileageKmpl,
      fuelNote: v.fuelNote,
      registrationNumber: v.registrationNumber,
      imageUrl: v.imageUrl,
      features: v.features,
      description: v.description,
      available: v.available,
      popular: v.popular,
      sortOrder: v.sortOrder,
    }));

    const toDTO = (p: (typeof menuRows)[number]): PageDTO => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    });

    const hotels: HotelDTO[] = hotelRows.map((h) => ({ ...h }));

    return {
      vehicles,
      settings,
      menuPages: menuRows.map(toDTO),
      homePages: homeRows.map(toDTO),
      hotels,
    };
  } catch (e) {
    console.error("[page] Failed to load site data from DB:", e);
    return { vehicles: [], settings: {}, menuPages: [], homePages: [], hotels: [] };
  }
}

export default async function Page() {
  const images = detectImages();
  const { vehicles, settings, menuPages, homePages, hotels } = await loadSiteData();
  return (
    <RoamSaathiApp
      images={images}
      // v5: never show an empty fleet — if the DB has no vehicles (or is
      // unreachable) render the built-in starter fleet so rates and the
      // booking form always work.
      vehicles={vehicles.length > 0 ? vehicles : defaultFleetVehicles()}
      settings={settings}
      menuPages={menuPages}
      homePages={homePages}
      hotels={hotels}
    />
  );
}
