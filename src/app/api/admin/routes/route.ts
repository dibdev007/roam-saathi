import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureDatabaseReady } from "@/lib/dbReady";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/routes — all routes (including hidden ones). Admin only. */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  try {
    await ensureDatabaseReady();
    const routes = await db.routeOffer.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json({ routes });
  } catch (e) {
    console.error("[GET /api/admin/routes] error:", e);
    return NextResponse.json({ error: "Failed to load routes" }, { status: 500 });
  }
}

/** POST /api/admin/routes — create a route. Admin only. */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  try {
    const b = await req.json();
    if (!b?.title || !String(b.title).trim()) {
      return NextResponse.json({ error: "Route title is required" }, { status: 400 });
    }

    const highlights = Array.isArray(b.highlights)
      ? b.highlights.map((h: unknown) => String(h).trim().slice(0, 80)).filter(Boolean).slice(0, 8)
      : [];

    const created = await db.routeOffer.create({
      data: {
        title: String(b.title).trim().slice(0, 160),
        duration: b.duration ? String(b.duration).trim().slice(0, 40) : "",
        vehicle: b.vehicle ? String(b.vehicle).trim().slice(0, 160) : "",
        kmOneWay: Math.max(1, Math.round(Number(b.kmOneWay) || 100)),
        highlights: JSON.stringify(highlights),
        note: b.note ? String(b.note).trim().slice(0, 300) : null,
        showOnSite: Boolean(b.showOnSite ?? true),
        sortOrder: Number(b.sortOrder ?? 10) || 10,
      },
    });
    return NextResponse.json({ ok: true, route: created }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/admin/routes] error:", e);
    return NextResponse.json({ error: "Failed to create route" }, { status: 500 });
  }
}
