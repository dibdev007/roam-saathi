import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

/**
 * Server-side admin authentication for Roam Saathi.
 *
 * - Passwords are stored as scrypt hashes in the Settings table
 *   (keys: adminPasswordHash + adminPasswordSalt) — NEVER as plain text.
 * - A successful login sets an HMAC-signed, httpOnly session cookie
 *   (7-day sliding window). Every admin API route verifies this cookie.
 * - Legacy migration: databases created before v3 stored a plain
 *   `adminPasscode` setting. Login transparently verifies against it and
 *   upgrades the stored credential to a salted hash on first successful login.
 */

export const SESSION_COOKIE = "rs_admin";
export const SESSION_TTL_S = 60 * 60 * 24 * 7; // 7 days

const SECRET =
  process.env.ADMIN_SECRET || "roam-saathi-admin-secret-v3-change-me";

const DEFAULT_PASSWORD = "roam2024";

/* ---------------- password hashing ---------------- */

export function hashPassword(password: string, salt?: string) {
  const s = salt ?? randomBytes(16).toString("hex");
  const hash = scryptSync(password, s, 64).toString("hex");
  return { salt: s, hash };
}

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/* ---------------- session tokens ---------------- */

function sign(body: string): string {
  return createHmac("sha256", SECRET).update(body).digest("base64url");
}

export function createSessionToken(): string {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + SESSION_TTL_S * 1000 })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(
  token: string | undefined | null
): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

/** Fast guard for API routes — returns true when the caller is admin. */
export function isAdmin(req: NextRequest): boolean {
  return verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_S,
  };
}

/* ---------------- credential resolution (DB-backed) ---------------- */

type CredReader = {
  findMany: () => Promise<{ key: string; value: string }[]>;
};

/**
 * Load the admin password record from the Settings table.
 * Returns { mode: "hash", hash, salt } or { mode: "legacy", passcode }.
 */
export async function loadAdminCredentials(
  db: CredReader
): Promise<
  | { mode: "hash"; hash: string; salt: string }
  | { mode: "legacy"; passcode: string }
> {
  const rows = await db.findMany();
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;

  if (map.adminPasswordHash && map.adminPasswordSalt) {
    return { mode: "hash", hash: map.adminPasswordHash, salt: map.adminPasswordSalt };
  }
  // Legacy: plain passcode saved by older versions (or the v1 default)
  return { mode: "legacy", passcode: map.adminPasscode || DEFAULT_PASSWORD };
}

export function verifyAdminPassword(
  password: string,
  cred:
    | { mode: "hash"; hash: string; salt: string }
    | { mode: "legacy"; passcode: string }
): boolean {
  try {
    if (cred.mode === "hash") {
      const attempt = scryptSync(password, cred.salt, 64);
      const expected = Buffer.from(cred.hash, "hex");
      return attempt.length === expected.length && timingSafeEqual(attempt, expected);
    }
    return safeEqual(password, cred.passcode);
  } catch {
    return false;
  }
}

export { DEFAULT_PASSWORD };
