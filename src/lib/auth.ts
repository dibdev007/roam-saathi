import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

/**
 * Server-side admin authentication for Roam Saathi (v6 security hardening).
 *
 * THREAT MODEL / DESIGN
 * ---------------------
 * 1. NO SECRETS IN THE REPO. The repo is public — anything committed is
 *    public. The HMAC key that signs admin session cookies is therefore
 *    generated randomly on first use and stored in the database
 *    (Settings.sessionSecret). An env override (ADMIN_SECRET) is supported
 *    for owners who prefer it. There is NO hardcoded fallback.
 * 2. REVOCABLE SESSIONS. Tokens carry a session "epoch". Bumping the epoch
 *    (done on every password change) instantly invalidates every existing
 *    cookie everywhere — stolen sessions die with the next password change.
 * 3. BRUTE FORCE. Failed logins are counted PERSISTENTLY in the database
 *    (works across serverless instances), locking the login out for 15
 *    minutes after 8 failures.
 * 4. CSRF. Admin mutations additionally verify that Origin/Referer match
 *    the site host; the session cookie is SameSite=Strict.
 * 5. NO SECRET EVER LEAVES THE SERVER. SECRET_SETTINGS_KEYS is the single
 *    allowlist of keys stripped from every settings map that flows to a
 *    client component, an API response or a backup file.
 *
 * - Passwords are stored as scrypt hashes (adminPasswordHash + Salt).
 * - The default starter password forces a one-time change in the portal
 *   (the login response returns mustChangePassword and the admin UI gates
 *   on the adminMustChangePassword setting until a real password is set).
 */

export const SESSION_COOKIE = "rs_admin";
export const SESSION_TTL_S = 60 * 60 * 24 * 7; // 7 days

export const DEFAULT_PASSWORD = "roam2024"; // starter only — portal forces a change

/* ------------------------------------------------------------------ */
/* Settings keys that must NEVER leave the server                      */
/* ------------------------------------------------------------------ */

export const SECRET_SETTINGS_KEYS = [
  "adminPasswordHash",
  "adminPasswordSalt",
  "adminPasscode", // legacy plaintext from v1–v5 — stripped wherever found
  "sessionSecret",
  "sessionEpoch",
  "loginFailCount",
  "loginFailCountAt",
  "loginLockUntil",
  "adminMustChangePassword",
] as const;

/** Return a copy of a settings map with every secret key removed. */
export function stripSecretSettings<T extends Record<string, unknown>>(
  map: T
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(map)) {
    if (!(SECRET_SETTINGS_KEYS as readonly string[]).includes(k)) out[k] = v;
  }
  return out;
}

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

/* ---------------- session signing secret (DB-backed) ---------------- */

type SettingsRW = {
  findUnique: (args: { where: { key: string } }) => Promise<{ key: string; value: string } | null>;
  upsert: (args: {
    where: { key: string };
    update: { value: string };
    create: { key: string; value: string };
  }) => Promise<unknown>;
};

const g = globalThis as unknown as {
  __rsSessionSecret?: string | null; // cached per instance (null = not loaded yet)
};

async function loadSessionSecret(): Promise<string> {
  // 1. Explicit env override wins — for owners who want full control.
  const env = process.env.ADMIN_SECRET;
  if (env && env.length >= 16) return env;

  // 2. Cached per-instance value.
  if (g.__rsSessionSecret) return g.__rsSessionSecret;

  // 3. Read from the database (or create it there on first use).
  const { db } = await import("./db");
  try {
    const row = await db.settings.findUnique({ where: { key: "sessionSecret" } });
    if (row?.value && row.value.length >= 32) {
      g.__rsSessionSecret = row.value;
      return row.value;
    }
    const fresh = randomBytes(32).toString("base64url");
    await db.settings.upsert({
      where: { key: "sessionSecret" },
      update: { value: fresh },
      create: { key: "sessionSecret", value: fresh },
    });
    g.__rsSessionSecret = fresh;
    return fresh;
  } catch {
    // DB unreachable — fall back to a per-instance ephemeral secret so the
    // portal still works, at the cost of sessions dying on restart.
    const ephemeral = randomBytes(32).toString("base64url");
    return ephemeral;
  }
}

/* ---------------- session tokens ---------------- */

async function currentEpoch(): Promise<number> {
  try {
    const { db } = await import("./db");
    const row = await db.settings.findUnique({ where: { key: "sessionEpoch" } });
    const n = Number(row?.value);
    return Number.isFinite(n) && n > 0 ? n : 1;
  } catch {
    return 1;
  }
}

/** Bump the epoch — instantly invalidates every issued session cookie. */
export async function bumpSessionEpoch(): Promise<void> {
  const next = String((await currentEpoch()) + 1);
  const { db } = await import("./db");
  await db.settings.upsert({
    where: { key: "sessionEpoch" },
    update: { value: next },
    create: { key: "sessionEpoch", value: next },
  });
}

export async function createSessionToken(): Promise<string> {
  const secret = await loadSessionSecret();
  const payload = Buffer.from(
    JSON.stringify({
      exp: Date.now() + SESSION_TTL_S * 1000,
      epoch: await currentEpoch(),
      jti: randomBytes(12).toString("base64url"),
    })
  ).toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const secret = await loadSessionSecret();
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as {
      exp?: number;
      epoch?: number;
    };
    if (typeof payload.exp !== "number" || payload.exp <= Date.now()) return false;
    if (payload.epoch !== (await currentEpoch())) return false; // revoked?
    return true;
  } catch {
    return false;
  }
}

/** Verify the caller's session cookie. Use for every admin API + page. */
export async function isAdmin(req: NextRequest): Promise<boolean> {
  return verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
}

/**
 * Admin guard for API routes WITH CSRF protection: mutating methods must
 * carry a same-origin Origin or Referer header (the portal's own fetches
 * always do; cross-site attackers cannot set them).
 */
export async function requireAdmin(req: NextRequest): Promise<boolean> {
  if (!(await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value))) {
    return false;
  }
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return true;

  const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  const originHeader = req.headers.get("origin") || req.headers.get("referer") || "";
  if (!originHeader) return false; // no origin context → reject mutations
  try {
    const origin = new URL(originHeader);
    const originHost = `${origin.hostname}${
      origin.port && origin.port !== "80" && origin.port !== "443" ? `:${origin.port}` : ""
    }`.toLowerCase();
    if (!host || originHost !== host) return false;
  } catch {
    return false;
  }
  return true;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_S,
  };
}

/* ---------------- credential resolution (DB-backed) ---------------- */

type CredReader = {
  findMany: () => Promise<{ key: string; value: string }[]>;
};

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

/** True when the credential still is the publicly-known starter password. */
export function isStarterPassword(
  cred:
    | { mode: "hash"; hash: string; salt: string }
    | { mode: "legacy"; passcode: string }
): boolean {
  return verifyAdminPassword(DEFAULT_PASSWORD, cred);
}

/* ---------------- persistent login throttle (DB-backed) ---------------- */

const LOCK_THRESHOLD = 8;
const LOCK_MS = 15 * 60 * 1000;
const RESET_MS = 10 * 60 * 1000;

async function getSetting(db: SettingsRW, key: string): Promise<string> {
  const row = await db.findUnique({ where: { key } });
  return row?.value ?? "";
}

async function putSetting(db: SettingsRW, key: string, value: string): Promise<void> {
  await db.upsert({ where: { key }, update: { value }, create: { key, value } });
}

/** Returns true while the login is locked out. */
export async function isLoginLocked(db: SettingsRW): Promise<boolean> {
  const until = Number(await getSetting(db, "loginLockUntil"));
  return Number.isFinite(until) && until > Date.now();
}

/** Record a failed attempt; locks the login after LOCK_THRESHOLD failures. */
export async function registerFailedLogin(db: SettingsRW): Promise<void> {
  const now = Date.now();
  const last = Number(await getSetting(db, "loginFailCountAt"));
  const prev = Number(await getSetting(db, "loginFailCount"));
  const count = Number.isFinite(last) && last > 0 && now - last < RESET_MS
    ? (Number.isFinite(prev) ? prev : 0) + 1
    : 1;
  await putSetting(db, "loginFailCount", String(count));
  await putSetting(db, "loginFailCountAt", String(now));
  if (count >= LOCK_THRESHOLD) {
    await putSetting(db, "loginLockUntil", String(now + LOCK_MS));
    await putSetting(db, "loginFailCount", "0");
  }
}

export async function clearLoginFailures(db: SettingsRW): Promise<void> {
  await putSetting(db, "loginFailCount", "0");
  await putSetting(db, "loginLockUntil", "");
}

export async function loginLockedUntil(db: SettingsRW): Promise<number> {
  const until = Number(await getSetting(db, "loginLockUntil"));
  return Number.isFinite(until) ? until : 0;
}
