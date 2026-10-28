import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  isAdmin,
  loadAdminCredentials,
  verifyAdminPassword,
  hashPassword,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/password — change the admin portal password.
 * Requires a valid admin session AND the current password.
 * Body: { currentPassword, newPassword }
 *
 * This is the v3 fix: the password is stored as a salted scrypt hash in the
 * cloud database (Settings keys adminPasswordHash / adminPasswordSalt), so
 * the change persists everywhere — including on Vercel + Postgres.
 */
export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const currentPassword =
      typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const newPassword =
      typeof body?.newPassword === "string" ? body.newPassword : "";

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters." },
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

    return NextResponse.json({
      ok: true,
      message: "Password changed. Use the new password from next login.",
    });
  } catch (e) {
    console.error("[POST /api/admin/password] error:", e);
    return NextResponse.json({ error: "Could not change password" }, { status: 500 });
  }
}
