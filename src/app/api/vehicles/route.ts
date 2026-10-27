import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/vehicles — list all vehicles. */
export async function GET() {
  const vehicles = await db.vehicle.findMany({
    orderBy: [{ class: "asc" }, { dailyRate: "asc" }],
  });
  return NextResponse.json({ vehicles });
}

/** POST /api/vehicles — create a vehicle. */
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b?.name || !b?.class || b?.seats == null || b?.dailyRate == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const created = await db.vehicle.create({
      data: {
        name: String(b.name),
        class: String(b.class),
        seats: Number(b.seats),
        transmission: String(b.transmission ?? "Manual"),
        dailyRate: Number(b.dailyRate),
        withDriverAvailable: Boolean(b.withDriverAvailable ?? true),
        imageUrl: b.imageUrl ? String(b.imageUrl) : null,
        available: b.available !== false,
        description: String(b.description ?? ""),
      },
    });
    return NextResponse.json({ ok: true, vehicle: created }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/vehicles] error:", e);
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}
