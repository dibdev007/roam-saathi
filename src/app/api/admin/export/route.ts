import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureDatabaseReady } from "@/lib/dbReady";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/export — full JSON backup of all data
 * (vehicles + bookings + settings). Used by Admin → Database → "Download backup".
 */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  try {
    await ensureDatabaseReady();
    const [vehicles, bookings, settingsRows, pages] = await Promise.all([
      db.vehicle.findMany({ orderBy: { sortOrder: "asc" } }),
      db.booking.findMany({ orderBy: { createdAt: "desc" } }),
      db.settings.findMany(),
      db.page.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);

    const settings: Record<string, string> = {};
    for (const r of settingsRows) {
      if (r.key !== "adminPasswordHash" && r.key !== "adminPasswordSalt") settings[r.key] = r.value;
    }

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
      settings, pages,
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
