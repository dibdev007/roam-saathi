import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/admin/routes/[id] — update any route field. Admin only. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const b = await req.json();

    const updated = await db.routeOffer.update({
      where: { id },
      data: {
        ...(b.title != null ? { title: String(b.title).trim().slice(0, 160) } : {}),
        ...(b.duration !== undefined
          ? { duration: String(b.duration ?? "").trim().slice(0, 40) }
          : {}),
        ...(b.vehicle !== undefined
          ? { vehicle: String(b.vehicle ?? "").trim().slice(0, 160) }
          : {}),
        ...(b.kmOneWay != null
          ? { kmOneWay: Math.max(1, Math.round(Number(b.kmOneWay) || 100)) }
          : {}),
        ...(b.highlights !== undefined
          ? {
              highlights: JSON.stringify(
                Array.isArray(b.highlights)
                  ? b.highlights
                      .map((h: unknown) => String(h).trim().slice(0, 80))
                      .filter(Boolean)
                      .slice(0, 8)
                  : []
              ),
            }
          : {}),
        ...(b.note !== undefined
          ? { note: b.note ? String(b.note).trim().slice(0, 300) : null }
          : {}),
        ...(b.showOnSite != null ? { showOnSite: Boolean(b.showOnSite) } : {}),
        ...(b.sortOrder != null ? { sortOrder: Number(b.sortOrder) || 10 } : {}),
      },
    });
    return NextResponse.json({ ok: true, route: updated });
  } catch (e) {
    console.error("[PATCH /api/admin/routes/[id]] error:", e);
    return NextResponse.json({ error: "Failed to update route" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/routes/[id] — remove a route. Admin only.
 * Hard delete: the row is gone forever. The starter routes seed exactly
 * once (seed-once marker), so a deleted route NEVER comes back — same
 * permanent-deletion promise as the v8 fleet/stays fix.
 */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    await db.routeOffer.delete({ where: { id } });
    return NextResponse.json({ ok: true, deleted: id });
  } catch (e) {
    console.error("[DELETE /api/admin/routes/[id]] error:", e);
    return NextResponse.json({ error: "Failed to delete route" }, { status: 500 });
  }
}
