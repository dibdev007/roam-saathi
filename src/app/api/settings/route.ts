import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/settings — return all settings as a key-value map. */
export async function GET() {
  const rows = await db.settings.findMany();
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return NextResponse.json({ settings: map });
}

/** PUT /api/settings — upsert settings (admin). Body: { key, value } | { updates: {key:value, ...} } */
export async function PUT(req: NextRequest) {
  try {
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

    for (const [key, value] of Object.entries(updates)) {
      const existing = await db.settings.findUnique({ where: { key } });
      if (existing) {
        await db.settings.update({ where: { key }, data: { value: String(value) } });
      } else {
        await db.settings.create({ data: { key, value: String(value) } });
      }
    }

    const rows = await db.settings.findMany();
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return NextResponse.json({ ok: true, settings: map });
  } catch (e) {
    console.error("[PUT /api/settings] error:", e);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
