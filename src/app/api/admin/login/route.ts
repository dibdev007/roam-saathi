import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureDatabaseReady } from "@/lib/dbReady";
import {
  loadAdminCredentials,
  verifyAdminPassword,
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
  hashPassword,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

/* Best-effort in-memory brute-force throttle (per serverless instance). */
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function throttle(ip: string): { blocked: boolean; remaining: number } {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || rec.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { blocked: false, remaining: MAX_ATTEMPTS - 1 };
  }
  rec.count += 1;
  return { blocked: rec.count > MAX_ATTEMPTS, remaining: Math.max(0, MAX_ATTEMPTS - rec.count) };
}

/** POST /api/admin/login — { password } → sets the httpOnly session cookie. */
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const t = throttle(ip);
    if (t.blocked) {
      return NextResponse.json(
        { error: "Too many failed attempts. Try again in 10 minutes." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const password = typeof body?.password === "string" ? body.password : "";
    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    // Self-healing: on a fresh database this seeds the settings table
    // (including the default admin password) before we verify it.
    await ensureDatabaseReady();
    const cred = await loadAdminCredentials(db.settings);
    if (!verifyAdminPassword(password, cred)) {
      return NextResponse.json(
        { error: "Wrong password. Default is roam2024 unless you changed it." },
        { status: 401 }
      );
    }

    // Seamless upgrade: legacy plain passcode → salted hash after first login
    if (cred.mode === "legacy") {
      const { hash, salt } = hashPassword(password);
      const upsert = (key: string, value: string) =>
        db.settings.upsert({ where: { key }, update: { value }, create: { key, value } });
      await upsert("adminPasswordHash", hash);
      await upsert("adminPasswordSalt", salt);
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions());
    attempts.delete(ip);
    return res;
  } catch (e) {
    console.error("[POST /api/admin/login] error:", e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
