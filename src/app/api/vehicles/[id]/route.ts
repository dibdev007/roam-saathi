import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/vehicles/[id] — update a vehicle. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const b = await req.json();
    const updated = await db.vehicle.update({
      where: { id },
      data: {
        ...(b.name != null ? { name: String(b.name) } : {}),
        ...(b.class != null ? { class: String(b.class) } : {}),
        ...(b.seats != null ? { seats: Number(b.seats) } : {}),
        ...(b.transmission != null ? { transmission: String(b.transmission) } : {}),
        ...(b.dailyRate != null ? { dailyRate: Number(b.dailyRate) } : {}),
        ...(b.withDriverAvailable != null ? { withDriverAvailable: Boolean(b.withDriverAvailable) } : {}),
        ...(b.imageUrl != null ? { imageUrl: b.imageUrl ? String(b.imageUrl) : null } : {}),
        ...(b.available != null ? { available: Boolean(b.available) } : {}),
        ...(b.description != null ? { description: String(b.description) } : {}),
      },
    });
    return NextResponse.json({ ok: true, vehicle: updated });
  } catch (e) {
    console.error("[PATCH /api/vehicles/[id]] error:", e);
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 });
  }
}

/** DELETE /api/vehicles/[id] — delete a vehicle. */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    await db.vehicle.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[DELETE /api/vehicles/[id]] error:", e);
    return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 });
  }
}
