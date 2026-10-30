import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureDatabaseReady } from "@/lib/dbReady";
import { BOOKING_STATUSES } from "@/lib/siteConfig";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/bookings — list bookings (?status=&q= filters). Admin only. */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  await ensureDatabaseReady();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.trim();

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { phone: { contains: q } },
      { vehicleName: { contains: q } },
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
    // Self-healing: even on a brand-new database the enquiry is saved —
    // tables are created on demand before the insert.
    await ensureDatabaseReady();
    const body = await req.json();

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
        vehicleName: body.vehicleName ? String(body.vehicleName).slice(0, 120) : null,
        destination: body.destination ? String(body.destination).slice(0, 300) : null,
        withDriver: Boolean(body.withDriver),
        estimatedTotal: body.estimatedTotal != null && Number(body.estimatedTotal) > 0
          ? Math.round(Number(body.estimatedTotal))
          : null,
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

/** PATCH /api/bookings — update status (admin). Body: { id, status } */
export async function PATCH(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }
    await ensureDatabaseReady();
    const body = await req.json();
    const { id, status } = body as { id?: string; status?: string };
    if (!id || !status) {
      return NextResponse.json({ error: "id and status required" }, { status: 400 });
    }
    if (!(BOOKING_STATUSES as readonly string[]).includes(status)) {
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
