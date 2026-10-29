import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/hotels — all stays (including hidden ones). Admin only. */
export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const hotels = await db.hotel.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ hotels });
}

/** POST /api/admin/hotels — create a stay. Admin only. */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  try {
    const b = await req.json();
    if (!b?.name || !b?.city || !b?.phone) {
      return NextResponse.json(
        { error: "Name, city and phone are required" },
        { status: 400 }
      );
    }

    const created = await db.hotel.create({
      data: {
        name: String(b.name).trim().slice(0, 160),
        state: String(b.state ?? "Assam").trim().slice(0, 80) || "Assam",
        city: String(b.city).trim().slice(0, 80),
        area: b.area ? String(b.area).trim().slice(0, 200) : null,
        phone: String(b.phone).trim().slice(0, 24),
        whatsapp: b.whatsapp ? String(b.whatsapp).replace(/\D/g, "").slice(0, 15) : null,
        priceFrom:
          b.priceFrom != null && Number(b.priceFrom) > 0 ? Math.round(Number(b.priceFrom)) : null,
        category: String(b.category ?? "Standard"),
        description: String(b.description ?? "").slice(0, 1200),
        amenities: b.amenities ? String(b.amenities).slice(0, 400) : null,
        images:
          typeof b.images === "string"
            ? b.images
            : JSON.stringify(Array.isArray(b.images) ? b.images : []),
        bookingUrl: b.bookingUrl ? String(b.bookingUrl).trim().slice(0, 500) : null,
        mapUrl: b.mapUrl ? String(b.mapUrl).trim().slice(0, 500) : null,
        partner: Boolean(b.partner ?? false),
        featured: Boolean(b.featured ?? false),
        showOnSite: Boolean(b.showOnSite ?? true),
        sortOrder: Number(b.sortOrder ?? 10) || 10,
      },
    });
    return NextResponse.json({ ok: true, hotel: created }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/admin/hotels] error:", e);
    return NextResponse.json({ error: "Failed to create stay" }, { status: 500 });
  }
}
