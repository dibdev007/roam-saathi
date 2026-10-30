import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { provisionDatabase, ensureV3Defaults } from "@/lib/setupData";

export const dynamic = "force-dynamic";

/**
 * Database provisioning + upgrade endpoint (v6, hardened).
 *
 * Since v5 the site provisions ITSELF: the first visit to any page creates
 * missing tables and seeds the starter data (see src/lib/dbReady.ts). This
 * endpoint is only a manual "repair" tool now, and it is locked down:
 *
 *   1. A logged-in admin (valid signed session cookie) can call it — the
 *      Database tab in the admin portal uses this path. No key in any URL.
 *   2. OR a request presenting the ADMIN_SETUP_KEY environment variable
 *      value (?key=…) — but ONLY if that variable was actually set in the
 *      hosting environment. The old hard-coded default ("roam2024") is gone;
 *      with no ADMIN_SETUP_KEY configured and no admin session, this
 *      endpoint returns 403 and never reveals whether a key would have fit.
 *
 * Old versions accepted a hard-coded passcode from a plain GET URL — that
 * hole is closed.
 */
async function handleSetup(req: NextRequest) {
  const url = new URL(req.url);
  const providedKey = url.searchParams.get("key") ?? "";

  const envKey = process.env.ADMIN_SETUP_KEY?.trim();
  const keyOk = Boolean(envKey) && providedKey !== "" && providedKey === envKey;
  const sessionOk = isAdmin(req); // signed httpOnly cookie — never in a URL

  if (!keyOk && !sessionOk) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "This provisioning endpoint is locked. Sign in to the admin portal and use Admin → Database → Repair, or set the ADMIN_SETUP_KEY environment variable if you need key-based access.",
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
        "Open your site home page — the fleet section shows your vehicles with live rates.",
        "Admin → Settings → replace the placeholder phone/WhatsApp numbers with your real numbers.",
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
