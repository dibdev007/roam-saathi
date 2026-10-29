import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const numOrNull = (v: unknown): number | null => {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : null;
};

/** PATCH /api/vehicles/[id] — update any vehicle field. Admin only. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const b = await req.json();
    const updated = await db.vehicle.update({
      where: { id },
      data: {
        ...(b.name != null ? { name: String(b.name).trim().slice(0, 120) } : {}),
        ...(b.brand !== undefined
          ? { brand: b.brand ? String(b.brand).trim().slice(0, 60) : null }
          : {}),
        ...(b.class != null ? { class: String(b.class) } : {}),
        ...(b.seats != null ? { seats: Math.max(1, Number(b.seats) || 4) } : {}),
        ...(b.transmission != null ? { transmission: String(b.transmission) } : {}),
        ...(b.fuelType != null ? { fuelType: String(b.fuelType) } : {}),
        ...(b.dailyRate != null ? { dailyRate: Math.max(0, Number(b.dailyRate) || 0) } : {}),
        ...(b.withDriverPerDay !== undefined
          ? { withDriverPerDay: numOrNull(b.withDriverPerDay) }
          : {}),
        ...(b.withDriverAvailable != null
          ? { withDriverAvailable: Boolean(b.withDriverAvailable) }
          : {}),
        ...(b.monthlyRate !== undefined ? { monthlyRate: numOrNull(b.monthlyRate) } : {}),
        ...(b.kmLimitPerDay !== undefined ? { kmLimitPerDay: numOrNull(b.kmLimitPerDay) } : {}),
        ...(b.extraKmRate !== undefined ? { extraKmRate: numOrNull(b.extraKmRate) } : {}),
        ...(b.securityDeposit !== undefined
          ? { securityDeposit: numOrNull(b.securityDeposit) }
          : {}),
        ...(b.driverBata !== undefined ? { driverBata: numOrNull(b.driverBata) } : {}),
        ...(b.mileageKmpl !== undefined ? { mileageKmpl: numOrNull(b.mileageKmpl) } : {}),
        ...(b.fuelNote !== undefined
          ? { fuelNote: b.fuelNote ? String(b.fuelNote).trim().slice(0, 300) : null }
          : {}),
        ...(b.registrationNumber !== undefined
          ? {
              registrationNumber: b.registrationNumber
                ? String(b.registrationNumber).trim().toUpperCase().slice(0, 20)
                : null,
            }
          : {}),
        ...(b.imageUrl !== undefined
          ? { imageUrl: b.imageUrl ? String(b.imageUrl).trim() : null }
          : {}),
        ...(b.features !== undefined
          ? { features: b.features ? String(b.features).trim().slice(0, 500) : null }
          : {}),
        ...(b.description != null ? { description: String(b.description).slice(0, 1000) } : {}),
        ...(b.available != null ? { available: Boolean(b.available) } : {}),
        ...(b.popular != null ? { popular: Boolean(b.popular) } : {}),
        ...(b.sortOrder != null ? { sortOrder: Number(b.sortOrder) || 100 } : {}),
      },
    });
    return NextResponse.json({ ok: true, vehicle: updated });
  } catch (e) {
    console.error("[PATCH /api/vehicles/[id]] error:", e);
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 });
  }
}

/** DELETE /api/vehicles/[id] — remove a vehicle. Admin only. */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    await db.vehicle.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[DELETE /api/vehicles/[id]] error:", e);
    return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 });
  }
}
