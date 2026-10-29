import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureDatabaseReady } from "@/lib/dbReady";
import {
  loadAdminCredentials,
  verifyAdminPassword,
  isStarterPassword,
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
  hashPassword,
  isLoginLocked,
  registerFailedLogin,
  clearLoginFailures,
  loginLockedUntil,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

/* Best-effort in-memory burst brake in front of the persistent DB lockout
   (stops obvious floods from even touching the database). Deliberately
   looser than the DB lockout so it can never mask or extend it. */
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 2 * 60 * 1000;
const MAX_ATTEMPTS = 20;

function throttle(ip: string): boolean {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || rec.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
}

/** POST /api/admin/login — { password } → sets the httpOnly session cookie. */
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (throttle(ip)) {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const password = typeof body?.password === "string" ? body.password : "";
    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    // Self-healing: on a fresh database this seeds the settings table
    // (including the default admin password hash) before we verify it.
    await ensureDatabaseReady();

    // Persistent brute-force lockout — survives restarts and spans all
    // serverless instances because it lives in the database.
    if (await isLoginLocked(db.settings)) {
      const until = await loginLockedUntil(db.settings);
      const mins = Math.max(1, Math.ceil((until - Date.now()) / 60000));
      attempts.delete(ip); // the DB lock is authoritative — don't double-punish
      return NextResponse.json(
        { error: `Locked after too many failed attempts. Try again in ~${mins} min.` },
        { status: 429 }
      );
    }

    const cred = await loadAdminCredentials(db.settings);
    if (!verifyAdminPassword(password, cred)) {
      await registerFailedLogin(db.settings);
      // Generic message — never hint what the password might be.
      return NextResponse.json({ error: "Wrong password." }, { status: 401 });
    }

    // Seamless upgrade: legacy plain passcode → salted hash after first login.
    if (cred.mode === "legacy") {
      const { hash, salt } = hashPassword(password);
      const upsert = (key: string, value: string) =>
        db.settings.upsert({ where: { key }, update: { value }, create: { key, value } });
      await upsert("adminPasswordHash", hash);
      await upsert("adminPasswordSalt", salt);
    }

    await clearLoginFailures(db.settings);
    attempts.delete(ip);

    // Force a one-time password change while the publicly-known starter
    // password is still in use. The portal gates on this flag.
    const mustChange = isStarterPassword(cred);
    if (mustChange) {
      await db.settings.upsert({
        where: { key: "adminMustChangePassword" },
        update: { value: "1" },
        create: { key: "adminMustChangePassword", value: "1" },
      });
    }

    const res = NextResponse.json({ ok: true, mustChangePassword: mustChange });
    res.cookies.set(SESSION_COOKIE, await createSessionToken(), sessionCookieOptions());
    return res;
  } catch (e) {
    console.error("[POST /api/admin/login] error:", e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
