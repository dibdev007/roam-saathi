import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { provisionDatabase, ensureV3Defaults } from "@/lib/setupData";
import { safeEqual } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * OPTIONAL manual provisioning endpoint (v6 security rewrite).
 *
 * The site no longer NEEDS this endpoint: databases provision themselves
 * automatically on the first visit (see src/lib/dbReady.ts). It only exists
 * as a manual escape hatch for owners switching to a fresh cloud database.
 *
 * SECURITY MODEL
 *   - DISABLED (returns 404) unless the ADMIN_SETUP_KEY environment variable
 *     is set in the hosting dashboard. There is NO default key — the old
 *     "key=roam2024" behaviour is gone for good.
 *   - POST-only (a plain URL visit can never trigger anything).
 *   - Timing-safe key comparison, generic errors, no server detail leakage.
 *
 * To use it: set ADMIN_SETUP_KEY (20+ random characters) in Vercel →
 * Settings → Environment Variables, redeploy, then POST to /api/setup with
 * header "x-setup-key: <your key>". Delete the variable afterwards to
 * disable the endpoint again.
 */

/* Small per-instance throttle — provisioning is heavy, keep it rare. */
let lastAttempt = 0;
const MIN_INTERVAL_MS = 3000;

async function handleSetup(req: NextRequest) {
  const expected = process.env.ADMIN_SETUP_KEY || "";
  if (!expected) {
    // Endpoint intentionally disabled — do not even confirm it exists.
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (req.method !== "POST") {
    return NextResponse.json({ error: "Use POST" }, { status: 405 });
  }

  const now = Date.now();
  if (now - lastAttempt < MIN_INTERVAL_MS) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  lastAttempt = now;

  const provided =
    req.headers.get("x-setup-key") ||
    new URL(req.url).searchParams.get("key") ||
    "";
  if (!provided || !safeEqual(provided, expected)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 403 });
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
        "Open your site home page — the fleet section shows your vehicles with rates.",
        "Open /admin and sign in, then set your own password when prompted.",
        "Admin → Settings → replace the placeholder phone/WhatsApp numbers with your real numbers.",
        "Admin → Pages → edit the starter Rules & Policies page and publish your own blogs and travel diaries.",
      ],
    });
  } catch (e) {
    // Log the full error server-side; return ONLY a generic message so the
    // response can never leak DATABASE_URL fragments or schema details.
    console.error("[POST /api/setup] provisioning failed:", e);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Provisioning failed. Check the server logs — usually DATABASE_URL is wrong or unreachable.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return handleSetup(req);
}

export async function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
