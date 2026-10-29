import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureDatabaseReady } from "@/lib/dbReady";
import { BOOKING_STATUSES } from "@/lib/siteConfig";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/* Light per-instance throttle for the public enquiry form (spam brake). */
const postHits = new Map<string, { count: number; resetAt: number }>();
const POST_WINDOW_MS = 60 * 60 * 1000;
const POST_MAX = 10;

function postThrottled(ip: string): boolean {
  const now = Date.now();
  const rec = postHits.get(ip);
  if (!rec || rec.resetAt < now) {
    postHits.set(ip, { count: 1, resetAt: now + POST_WINDOW_MS });
    return false;
  }
  rec.count += 1;
  return rec.count > POST_MAX;
}

/** GET /api/bookings — list bookings (?status=&q= filters). Admin only. */
export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
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
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    if (postThrottled(ip)) {
      return NextResponse.json(
        { error: "Too many enquiries from this connection. Please try later or use WhatsApp." },
        { status: 429 }
      );
    }

    // Self-healing: even on a brand-new database the enquiry is saved —
    // tables are created on demand before the insert.
    await ensureDatabaseReady();
    const body = await req.json();

    // Honeypot: hidden field real users never fill. Bots that do are told
    // "ok" but nothing is stored.
    if (typeof body?.company === "string" && body.company.trim() !== "") {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    const required = ["name", "phone", "pickupType", "pickupDate", "returnDate", "vehicleClass"];
    for (const f of required) {
      if (!body?.[f] || String(body[f]).trim() === "") {
        return NextResponse.json(
          { error: `Missing required field: ${f}` },
          { status: 400 },
        );
      }
    }

    const digits = String(body.phone).replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) {
      return NextResponse.json(
        { error: "Please enter a valid phone number." },
        { status: 400 },
      );
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
    if (!(await requireAdmin(req))) {
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
