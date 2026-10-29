import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureDatabaseReady } from "@/lib/dbReady";
import { requireAdmin, SECRET_SETTINGS_KEYS } from "@/lib/auth";
import { sanitizeMapEmbed } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";
/**
 * GET /api/settings — admin only. Returns all settings as a key-value map
 * with every secret key (credentials, session material, lockout counters)
 * stripped out — see SECRET_SETTINGS_KEYS in src/lib/auth.ts.
 */
export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  await ensureDatabaseReady();
  const rows = await db.settings.findMany();
  const map: Record<string, string> = {};
  for (const r of rows) {
    if (!SECRET_SETTINGS_KEYS.includes(r.key as never)) map[r.key] = r.value;
  }
  return NextResponse.json({ settings: map });
}

/**
 * PUT /api/settings — upsert settings (admin only).
 * Body: { key, value } | { updates: {key:value, ...} }
 * The map embed is sanitized (only Google Maps URLs survive).
 */
export async function PUT(req: NextRequest) {
  try {
    if (!(await requireAdmin(req))) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }
    await ensureDatabaseReady();

    const body = await req.json();
    const updates: Record<string, string> =
      body?.updates && typeof body.updates === "object"
        ? body.updates
        : body?.key && body?.value != null
          ? { [body.key]: String(body.value) }
          : {};

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    // Block direct writes to credential / security material — use the
    // password change form, and let the server manage session + lockout keys.
    for (const k of Object.keys(updates)) {
      if (
        SECRET_SETTINGS_KEYS.includes(k as never) ||
        k === "adminPasscode" ||
        k === "loginFailCountAt"
      ) {
        return NextResponse.json(
          { error: `"${k}" is managed automatically and cannot be edited here.` },
          { status: 400 }
        );
      }
    }

    // Sanitize the Google Maps embed if present
    if (updates.mapEmbedUrl != null) {
      if (updates.mapEmbedUrl.trim() === "") {
        updates.mapEmbedUrl = ""; // reset to default
      } else {
        const clean = sanitizeMapEmbed(updates.mapEmbedUrl);
        if (!clean) {
          return NextResponse.json(
            {
              error:
                "That doesn't look like a Google Maps embed. Paste the iframe code from Google Maps → Share → Embed a map, or a google.com/maps link.",
            },
            { status: 400 }
          );
        }
        updates.mapEmbedUrl = clean;
      }
    }

    for (const [key, value] of Object.entries(updates)) {
      await db.settings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    const rows = await db.settings.findMany();
    const map: Record<string, string> = {};
    for (const r of rows) {
      if (!SECRET_SETTINGS_KEYS.includes(r.key as never)) map[r.key] = r.value;
    }
    return NextResponse.json({ ok: true, settings: map });
  } catch (e) {
    console.error("[PUT /api/settings] error:", e);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
