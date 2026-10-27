import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/export — full JSON backup of all data
 * (vehicles + bookings + settings). Used by Admin → Database → "Download backup".
 */
export async function GET() {
  try {
    const [vehicles, bookings, settingsRows] = await Promise.all([
      db.vehicle.findMany({ orderBy: { sortOrder: "asc" } }),
      db.booking.findMany({ orderBy: { createdAt: "desc" } }),
      db.settings.findMany(),
    ]);

    const settings: Record<string, string> = {};
    for (const r of settingsRows) settings[r.key] = r.value;

    const payload = {
      exportedAt: new Date().toISOString(),
      business: "Roam Saathi",
      counts: {
        vehicles: vehicles.length,
        bookings: bookings.length,
        settings: settingsRows.length,
      },
      vehicles,
      bookings,
      settings,
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="roam-saathi-backup-${new Date()
          .toISOString()
          .slice(0, 10)}.json"`,
      },
    });
  } catch (e) {
    console.error("[GET /api/admin/export] error:", e);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
