import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { provisionDatabase, ensureV3Defaults } from "@/lib/setupData";

export const dynamic = "force-dynamic";

/**
 * ONE-TIME database provisioning + upgrade endpoint.
 *
 * Visit once after deploying to a fresh cloud database (or after updating
 * to v3 on an existing one):
 *   https://your-site.vercel.app/api/setup?key=roam2024
 *
 * What it does:
 *   1. Creates the Vehicle / Booking / Settings / Page tables (if missing).
 *   2. Upgrades older databases — adds the v3 columns when missing.
 *   3. Loads the 17-vehicle starter rate card, default settings and the
 *      starter content pages — only when tables are empty, so real data
 *      is never overwritten. Missing v3 settings keys are added.
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
    // Cast documented in setupData.ts — Prisma's generic delegates match
    // the duck-typed ProvisionDb at runtime, only not structurally.
    const result = await provisionDatabase(
      db as unknown as Parameters<typeof provisionDatabase>[0]
    );
    const upgraded = await ensureV3Defaults(
      db as unknown as Parameters<typeof ensureV3Defaults>[0]
    );
    return NextResponse.json({
      ...result,
      upgrade: upgraded,
      nextSteps: [
        "Open your site home page — the fleet section shows your vehicles with the new Fuel & Toll column.",
        "Open /admin (passcode roam2024) → Settings → replace the placeholder phone/WhatsApp numbers with your real numbers.",
        "Admin → Pages → edit the starter Rules & Policies page and publish your own blogs and travel diaries.",
        "Admin → Fleet → set or correct each vehicle's mileage (kmpl) to make the booking fuel estimator accurate.",
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
          "If your provider blocks raw SQL, create the tables with: npx prisma db push",
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
