/**
 * Self-healing database readiness for Roam Saathi (v5 fix).
 *
 * WHY THIS EXISTS
 * ---------------
 * On the deployed site the fleet / rates / booking form showed nothing
 * because the database had no tables or no rows (fresh Postgres that was
 * never provisioned, or an ephemeral SQLite on serverless). Previously the
 * ONLY way to provision was visiting /api/setup manually — easy to miss.
 *
 * WHAT THIS DOES
 * --------------
 * `ensureDatabaseReady()` runs before important DB reads. It:
 *   1. Fast path — counts vehicles & hotels; if both succeed AND are
 *      non-empty, the database is ready (2 cheap queries).
 *   2. Slow path — otherwise it runs provisionDatabase(): CREATE TABLE IF
 *      NOT EXISTS for Vehicle / Booking / Settings / Page / Hotel, adds
 *      missing upgrade columns, and seeds the 17-vehicle rate card,
 *      default settings, starter pages and 5 partner stays — but ONLY when
 *      the tables are empty. Owner data is never overwritten.
 *   3. If the database is truly unreachable (bad DATABASE_URL, read-only
 *      filesystem…), it fails SOFT: callers catch and the UI falls back to
 *      the built-in fleet/stays so the site never looks broken.
 *
 * The promise is cached on globalThis per serverless instance, so the
 * overhead is 2 COUNT queries per cold start — nothing more.
 */

import { db } from "./db";
import { provisionDatabase } from "./setupData";

type ReadyState = {
  ok: boolean;
  action: "ready" | "provisioned" | "failed";
  error?: string;
};

const g = globalThis as unknown as { __rsDbReady?: Promise<ReadyState> };

async function run(): Promise<ReadyState> {
  // 1. Fast path — already provisioned and populated?
  try {
    const [v, h] = await Promise.all([db.vehicle.count(), db.hotel.count()]);
    if (v > 0 && h > 0) {
      return { ok: true, action: "ready" };
    }
    // Tables exist but are empty → fall through and seed them.
  } catch {
    // Tables missing or DB unreachable → fall through and try provisioning.
  }

  // 2. Provision (idempotent: IF NOT EXISTS DDL + seed-only-when-empty).
  // The cast is safe: provisionDatabase duck-types the delegates it needs
  // (count / createMany / $executeRawUnsafe) and the Prisma client provides
  // exactly those — the structural mismatch is only in Prisma's generics.
  try {
    await provisionDatabase(db as unknown as Parameters<typeof provisionDatabase>[0]);
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
