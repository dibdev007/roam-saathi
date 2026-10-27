import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { provisionDatabase, SEED_VEHICLES, SEED_SETTINGS } from "@/lib/setupData";

export const dynamic = "force-dynamic";

/**
 * ONE-TIME database provisioning endpoint.
 *
 * Visit once after deploying to a fresh cloud database:
 *   https://your-site.vercel.app/api/setup?key=roam2024
 *
 * What it does:
 *   1. Creates the Vehicle / Booking / Settings tables (if missing).
 *   2. Loads the 17-vehicle starter rate card + default settings
 *      (only when the tables are empty — real data is never overwritten).
 *
 * Protected by the admin passcode (?key=...). Change it any time from
 * Admin → Settings afterwards, or set ADMIN_SETUP_KEY in the environment.
 */
async function handleSetup(req: NextRequest) {
  const url = new URL(req.url);
  let key = url.searchParams.get("key") ?? "";
  if (req.method === "POST" && !key) {
    try {
      const body = await req.json();
      key = typeof body?.key === "string" ? body.key : "";
    } catch {
      /* ignore malformed body */
    }
  }

  const expected = process.env.ADMIN_SETUP_KEY || "roam2024";
  if (key !== expected) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Invalid or missing key. Add ?key=<your admin passcode> to the URL (default: roam2024).",
      },
      { status: 403 }
    );
  }

  try {
    const result = await provisionDatabase(db);
    return NextResponse.json({
      ...result,
      nextSteps: [
        "Open your site home page — the fleet section now shows the 17 starter vehicles.",
        "Go to / (switch to Admin, passcode roam2024) → Settings → replace the placeholder phone/WhatsApp numbers with your real numbers.",
        "Admin → Fleet → edit rates, add or remove vehicles — everything saves permanently to your cloud database now.",
        "Admin → Database → download a JSON backup once a week.",
      ],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        ok: false,
        error: "Provisioning failed.",
        detail: msg,
        hints: [
          "Check that DATABASE_URL points to your cloud Postgres (Neon / Supabase / Prisma Postgres) and ends with ?sslmode=require for Neon.",
          "If your provider blocks raw SQL (some Prisma Postgres plans), create the tables with: npx prisma db push",
          "Make sure the tables were not created with a different schema earlier.",
        ],
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleSetup(req);
}

export async function POST(req: NextRequest) {
  return handleSetup(req);
}

// Keep references so tree-shaking never drops the seed metadata (used in the response hints).
void SEED_VEHICLES;
void SEED_SETTINGS;
