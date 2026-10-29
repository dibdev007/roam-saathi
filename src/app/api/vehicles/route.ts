import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureDatabaseReady } from "@/lib/dbReady";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/vehicles — list all vehicles (?available=true filters bookable ones). */
export async function GET(req: NextRequest) {
  // Self-healing: a fresh/unprovisioned database gets its tables + starter
  // fleet on the first call, so the admin fleet manager and any client
  // fetches never see an empty list on a new deployment.
  await ensureDatabaseReady();

  const { searchParams } = new URL(req.url);
  const onlyAvailable = searchParams.get("available") === "true";

  try {
    const vehicles = await db.vehicle.findMany({
      where: onlyAvailable ? { available: true } : undefined,
      orderBy: [{ sortOrder: "asc" }, { dailyRate: "asc" }],
    });
    return NextResponse.json({ vehicles });
  } catch (e) {
    console.error("[GET /api/vehicles] database unreachable:", e);
    // Degrade gracefully — the public site renders the built-in fleet from
    // server props; the admin portal shows a "database unreachable" state
    // instead of a hard 500.
    return NextResponse.json(
      { vehicles: [], error: "Database unreachable — check DATABASE_URL in your hosting settings." },
      { status: 200 }
    );
  }
}

const numOrNull = (v: unknown): number | null => {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : null;
};

/** POST /api/vehicles — create a vehicle with full price details. Admin only. */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  try {
    const b = await req.json();
    if (!b?.name || !b?.class || b?.seats == null || b?.dailyRate == null) {
      return NextResponse.json(
        { error: "Name, class, seats and self-drive rate are required" },
        { status: 400 },
      );
    }
    const created = await db.vehicle.create({
      data: {
        name: String(b.name).trim().slice(0, 120),
        brand: b.brand ? String(b.brand).trim().slice(0, 60) : null,
        class: String(b.class),
        seats: Math.max(1, Number(b.seats) || 4),
        transmission: String(b.transmission ?? "Manual"),
        fuelType: String(b.fuelType ?? "Petrol"),
        dailyRate: Math.max(0, Number(b.dailyRate) || 0),
        withDriverPerDay: numOrNull(b.withDriverPerDay),
        withDriverAvailable: Boolean(b.withDriverAvailable ?? true),
        monthlyRate: numOrNull(b.monthlyRate),
        kmLimitPerDay: numOrNull(b.kmLimitPerDay),
        extraKmRate: numOrNull(b.extraKmRate),
        securityDeposit: numOrNull(b.securityDeposit),
        driverBata: numOrNull(b.driverBata),
        mileageKmpl: numOrNull(b.mileageKmpl),
        fuelNote: b.fuelNote ? String(b.fuelNote).trim().slice(0, 300) : null,
        registrationNumber: b.registrationNumber
          ? String(b.registrationNumber).trim().toUpperCase().slice(0, 20)
          : null,
        imageUrl: b.imageUrl ? String(b.imageUrl).trim() : null,
        features: b.features ? String(b.features).trim().slice(0, 500) : null,
        description: String(b.description ?? "").slice(0, 1000),
        available: b.available !== false,
        popular: Boolean(b.popular ?? false),
        sortOrder: Number(b.sortOrder ?? 100) || 100,
      },
    });
    return NextResponse.json({ ok: true, vehicle: created }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/vehicles] error:", e);
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}
