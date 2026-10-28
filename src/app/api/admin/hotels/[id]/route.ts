import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/admin/hotels/[id] — update a stay. Admin only. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const b = await req.json();

    const updated = await db.hotel.update({
      where: { id },
      data: {
        ...(b.name != null ? { name: String(b.name).trim().slice(0, 160) } : {}),
        ...(b.state != null ? { state: String(b.state).trim().slice(0, 80) || "Assam" } : {}),
        ...(b.city != null ? { city: String(b.city).trim().slice(0, 80) } : {}),
        ...(b.area !== undefined ? { area: b.area ? String(b.area).trim().slice(0, 200) : null } : {}),
        ...(b.phone != null ? { phone: String(b.phone).trim().slice(0, 24) } : {}),
        ...(b.whatsapp !== undefined
          ? { whatsapp: b.whatsapp ? String(b.whatsapp).replace(/\D/g, "").slice(0, 15) : null }
          : {}),
        ...(b.priceFrom !== undefined
          ? { priceFrom: b.priceFrom != null && Number(b.priceFrom) > 0 ? Math.round(Number(b.priceFrom)) : null }
          : {}),
        ...(b.category != null ? { category: String(b.category) } : {}),
        ...(b.description != null ? { description: String(b.description).slice(0, 1200) } : {}),
        ...(b.amenities !== undefined
          ? { amenities: b.amenities ? String(b.amenities).slice(0, 400) : null }
          : {}),
        ...(b.images != null
          ? {
              images:
                typeof b.images === "string"
                  ? b.images
                  : JSON.stringify(Array.isArray(b.images) ? b.images : []),
            }
          : {}),
        ...(b.bookingUrl !== undefined
          ? { bookingUrl: b.bookingUrl ? String(b.bookingUrl).trim().slice(0, 500) : null }
          : {}),
        ...(b.mapUrl !== undefined
          ? { mapUrl: b.mapUrl ? String(b.mapUrl).trim().slice(0, 500) : null }
          : {}),
        ...(b.partner != null ? { partner: Boolean(b.partner) } : {}),
        ...(b.featured != null ? { featured: Boolean(b.featured) } : {}),
        ...(b.showOnSite != null ? { showOnSite: Boolean(b.showOnSite) } : {}),
        ...(b.sortOrder != null ? { sortOrder: Number(b.sortOrder) || 10 } : {}),
      },
    });
    return NextResponse.json({ ok: true, hotel: updated });
  } catch (e) {
    console.error("[PATCH /api/admin/hotels/[id]] error:", e);
    return NextResponse.json({ error: "Failed to update stay" }, { status: 500 });
  }
}

/** DELETE /api/admin/hotels/[id] — remove a stay. Admin only. */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    await db.hotel.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[DELETE /api/admin/hotels/[id]] error:", e);
    return NextResponse.json({ error: "Failed to delete stay" }, { status: 500 });
  }
}
