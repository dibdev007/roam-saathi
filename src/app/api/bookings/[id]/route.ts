import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { BOOKING_STATUSES } from "@/lib/siteConfig";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/bookings/[id] — update status and/or details. Admin only. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const b = await req.json();

    if (b.status != null && !(BOOKING_STATUSES as readonly string[]).includes(b.status)) {
      return NextResponse.json({ error: "invalid status" }, { status: 400 });
    }

    const updated = await db.booking.update({
      where: { id },
      data: {
        ...(b.status != null ? { status: String(b.status) } : {}),
        ...(b.vehicleName !== undefined
          ? { vehicleName: b.vehicleName ? String(b.vehicleName).slice(0, 120) : null }
          : {}),
        ...(b.destination !== undefined
          ? { destination: b.destination ? String(b.destination).slice(0, 300) : null }
          : {}),
        ...(b.estimatedTotal !== undefined
          ? { estimatedTotal: b.estimatedTotal != null && Number(b.estimatedTotal) > 0 ? Math.round(Number(b.estimatedTotal)) : null }
          : {}),
        ...(b.message !== undefined
          ? { message: b.message ? String(b.message).slice(0, 2000) : null }
          : {}),
      },
    });
    return NextResponse.json({ ok: true, booking: updated });
  } catch (e) {
    console.error("[PATCH /api/bookings/[id]] error:", e);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

/** DELETE /api/bookings/[id] — remove a booking (admin). */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    await db.booking.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[DELETE /api/bookings/[id]] error:", e);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
