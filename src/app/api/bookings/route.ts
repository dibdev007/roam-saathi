import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/bookings — list all bookings (admin). */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.trim();

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;
  if (q) {
    // SQLite doesn't support mode: 'insensitive' — use contains with default.
    where.OR = [
      { name: { contains: q } },
      { phone: { contains: q } },
    ];
  }

  const bookings = await db.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return NextResponse.json({ bookings });
}

/** POST /api/bookings — create a new booking enquiry (public). */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Basic server-side validation
    const required = ["name", "phone", "pickupType", "pickupDate", "returnDate", "vehicleClass"];
    for (const f of required) {
      if (!body?.[f] || String(body[f]).trim() === "") {
        return NextResponse.json(
          { error: `Missing required field: ${f}` },
          { status: 400 },
        );
      }
    }

    const pickupDate = new Date(body.pickupDate);
    const returnDate = new Date(body.returnDate);
    if (isNaN(pickupDate.getTime()) || isNaN(returnDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid pickup or return date" },
        { status: 400 },
      );
    }

    const created = await db.booking.create({
      data: {
        name: String(body.name).trim().slice(0, 120),
        phone: String(body.phone).trim().slice(0, 30),
        pickupType: String(body.pickupType),
        pickupLocation: body.pickupLocation ? String(body.pickupLocation).slice(0, 300) : null,
        pickupDate,
        returnDate,
        vehicleClass: String(body.vehicleClass),
        withDriver: Boolean(body.withDriver),
        message: body.message ? String(body.message).slice(0, 2000) : null,
        status: "New",
      },
    });

    return NextResponse.json({ ok: true, booking: created }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/bookings] error:", e);
    return NextResponse.json(
      { error: "Failed to save enquiry" },
      { status: 500 },
    );
  }
}

/** PATCH /api/bookings — update status (admin). */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body as { id?: string; status?: string };
    if (!id || !status) {
      return NextResponse.json({ error: "id and status required" }, { status: 400 });
    }
    const allowed = ["New", "Contacted", "Confirmed", "Cancelled"];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: "invalid status" }, { status: 400 });
    }
    const updated = await db.booking.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ ok: true, booking: updated });
  } catch (e) {
    console.error("[PATCH /api/bookings] error:", e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
