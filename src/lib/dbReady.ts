/**
 * Self-healing database readiness for Roam Saathi (v8 fix).
 *
 * WHY THIS EXISTS
 * ---------------
 * On the deployed site the fleet / rates / booking form showed nothing
 * because the database had no tables or no rows (fresh Postgres that was
 * never provisioned, or an ephemeral SQLite on serverless). Previously the
 * ONLY way to provision was visiting /api/setup manually — easy to miss.
 *
 * THE v8 BUG THIS FILE FIXES
 * --------------------------
 * The v5 logic treated "Vehicle or Hotel table is empty" as "database is
 * brand new" and re-seeded the starter fleet/stays on the next cold start.
 * So when the owner deleted ALL demo vehicles (or all demo stays) from the
 * admin panel, the initial 17 vehicles + 5 stays silently came back —
 * deletions were never permanent.
 *
 * WHAT THIS DOES NOW
 * ------------------
 * `ensureDatabaseReady()` runs before important DB reads. It:
 *   1. Seed-marker fast path — looks for a Settings row `seed_version`.
 *      If it exists the database has been provisioned before, so seeding
 *      NEVER runs again, even if the owner deleted every vehicle, stay,
 *      page and booking. Owner deletions are permanent.
 *   2. In-use detection — databases provisioned before v8 have no marker.
 *      If ANY table holds rows (even just the default settings), the
 *      database is clearly in use: write the marker and stand down. This
 *      makes already-deleted demo data permanent the moment v8 deploys.
 *   3. Fresh-database path — only when every table is empty (or missing)
 *      does it run provisionDatabase(): CREATE TABLE IF NOT EXISTS for all
 *      seven tables, adds missing upgrade columns, and seeds the starter
 *      fleet, settings, pages and stays. Then it writes the marker.
 *   4. If the database is truly unreachable (bad DATABASE_URL, read-only
 *      filesystem…), it fails SOFT: callers catch and the public UI falls
 *      back to the built-in fleet/stays so the site never looks broken.
 *
 * The promise is cached on globalThis per serverless instance, so the
 * overhead is one tiny SELECT per cold start — nothing more.
 */

import { db } from "./db";
import { provisionDatabase } from "./setupData";

type ReadyState = {
  ok: boolean;
  action: "ready" | "provisioned" | "failed";
  error?: string;
};

const g = globalThis as unknown as { __rsDbReady?: Promise<ReadyState> };

/** Settings row that proves "this database was provisioned — never seed again". */
const SEED_MARKER_KEY = "seed_version";
const SEED_MARKER_VALUE = "roam-saathi-v8";

async function markSeeded(): Promise<void> {
  try {
    await db.settings.upsert({
      where: { key: SEED_MARKER_KEY },
      update: { value: SEED_MARKER_VALUE },
      create: { key: SEED_MARKER_KEY, value: SEED_MARKER_VALUE },
    });
  } catch (e) {
    console.error("[dbReady] could not persist seed marker (will retry next request):", e);
  }
}

async function run(): Promise<ReadyState> {
  // 1. Fast path — provisioned before? Never seed again, whatever the counts.
  try {
    const marker = await db.settings.findUnique({ where: { key: SEED_MARKER_KEY } });
    if (marker) {
      return { ok: true, action: "ready" };
    }
  } catch {
    // Settings table missing or DB unreachable — continue below.
  }

  // 2. In-use detection — a pre-marker (v5–v7) database with ANY rows must
  //    never be touched. Note this also protects a database where the owner
  //    already deleted the entire fleet: the settings rows prove it is in use.
  try {
    const [v, h, b, s, p] = await Promise.all([
      db.vehicle.count(),
      db.hotel.count(),
      db.booking.count(),
      db.settings.count(),
      db.page.count(),
    ]);
    if (v + h + b + s + p > 0) {
      await markSeeded();
      return { ok: true, action: "ready" };
    }
    // Every table empty AND no marker → genuinely fresh database → seed below.
  } catch {
    // Tables missing or DB unreachable — try provisioning below.
  }

  // 3. Provision (idempotent: IF NOT EXISTS DDL + seed-only-when-empty).
  // The cast is safe: provisionDatabase duck-types the delegates it needs
  // (count / createMany / $executeRawUnsafe) and the Prisma client provides
  // exactly those — the structural mismatch is only in Prisma's generics.
  try {
    await provisionDatabase(db as unknown as Parameters<typeof provisionDatabase>[0]);
    await markSeeded();
    return { ok: true, action: "provisioned" };
  } catch (e) {
    console.error("[dbReady] auto-provision failed — site will use built-in fallbacks:", e);
    // Allow a retry on the NEXT request (transient network/DB errors).
    g.__rsDbReady = undefined;
    return { ok: false, action: "failed", error: String(e) };
  }
}

/**
 * Call before any important DB read. Never throws — always resolves.
 * Safe to call from every route; the work happens at most once per
 * serverless instance (and once more only if a later attempt failed).
 */
export function ensureDatabaseReady(): Promise<ReadyState> {
  if (!g.__rsDbReady) {
    g.__rsDbReady = run();
  }
  return g.__rsDbReady;
}
