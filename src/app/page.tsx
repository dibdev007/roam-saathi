import * as fs from "node:fs";
import * as path from "node:path";
import { RoamSaathiApp } from "@/components/site/RoamSaathiApp";

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
 * Build a map of {filename: exists} for the WANTED_IMAGES list, checking
 * /public first and then /download/brand (the directory the image-generation
 * agent writes to). If a brand image is in /download/brand but not /public,
 * we copy it across so next/image can serve it.
 */
function detectImages(): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  try {
    if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  } catch {
    /* ignore */
  }

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
      // Try to copy from /download/brand if present
      const brandPath = path.join(BRAND_DIR, name);
      try {
        if (fs.existsSync(brandPath)) {
          fs.copyFileSync(brandPath, pubPath);
          exists = true;
        }
      } catch {
        /* ignore copy errors */
      }
    }
    map[name] = exists;
  }
  return map;
}

export default function Page() {
  const images = detectImages();
  return <RoamSaathiApp images={images} />;
}
