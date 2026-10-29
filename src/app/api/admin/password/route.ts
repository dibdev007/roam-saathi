import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  requireAdmin,
  loadAdminCredentials,
  verifyAdminPassword,
  hashPassword,
  DEFAULT_PASSWORD,
  bumpSessionEpoch,
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/password — change the admin portal password.
 * Requires a valid admin session AND the current password.
 * Body: { currentPassword, newPassword }
 *
 * v6 security:
 *   - Origin-checked (CSRF) via requireAdmin.
 *   - Minimum 8 characters; the publicly-known starter password is rejected.
 *   - The session epoch is bumped, which instantly invalidates EVERY admin
 *     session everywhere (a stolen cookie becomes useless). A fresh cookie
 *     for the current browser is returned in the same response.
 *   - Clears the forced-change flag so the portal unlocks.
 */
export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin(req))) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const currentPassword =
      typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const newPassword =
      typeof body?.newPassword === "string" ? body.newPassword : "";

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters." },
        { status: 400 }
      );
    }
    if (newPassword === DEFAULT_PASSWORD) {
      return NextResponse.json(
        { error: "That password is publicly known — choose something unique." },
        { status: 400 }
      );
    }

    const cred = await loadAdminCredentials(db.settings);
    if (!verifyAdminPassword(currentPassword, cred)) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    const { hash, salt } = hashPassword(newPassword);
    const upsert = (key: string, value: string) =>
      db.settings.upsert({ where: { key }, update: { value }, create: { key, value } });
    await upsert("adminPasswordHash", hash);
    await upsert("adminPasswordSalt", salt);
    await upsert("adminMustChangePassword", "0");

    // Kill every existing admin session, then re-issue for THIS browser so
    // the owner stays signed in here while any stolen cookie dies.
    await bumpSessionEpoch();

    const res = NextResponse.json({
      ok: true,
      message: "Password changed. All other sessions were signed out.",
    });
    res.cookies.set(SESSION_COOKIE, await createSessionToken(), sessionCookieOptions());
    return res;
  } catch (e) {
    console.error("[POST /api/admin/password] error:", e);
    return NextResponse.json({ error: "Could not change password" }, { status: 500 });
  }
}
