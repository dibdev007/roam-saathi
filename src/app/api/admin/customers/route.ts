import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureDatabaseReady } from "@/lib/dbReady";
import { isAdmin } from "@/lib/auth";
import { CUSTOMER_SOURCES } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/customers?q=… — CRM list. Documents (base64 scans) are
 * deliberately excluded; the list only reports whether each document is on
 * file, so the table loads fast. Admin only.
 */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  await ensureDatabaseReady();
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();

  const rows = await db.customer.findMany({
    where: q
      ? {
          OR: [
            { fullName: { contains: q } },
            { phone: { contains: q } },
            { email: { contains: q } },
            { city: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      phone: true,
      altPhone: true,
      email: true,
      addressLine: true,
      city: true,
      state: true,
      pincode: true,
      dob: true,
      idProofType: true,
      idProofNumber: true,
      addressProofType: true,
      addressProofNumber: true,
      dlNumber: true,
      dlExpiry: true,
      source: true,
      sourceNote: true,
      notes: true,
      createdAt: true,
      _count: { select: { agreements: true } },
    },
  });

  // Cheap boolean flags for "document on file" without hauling base64 data.
  const flagRows = await db.$queryRaw<
    { id: string; idDoc: number; addrDoc: number; dlDoc: number }[]
  >`SELECT "id",
       CASE WHEN "idProofDoc" IS NULL THEN 0 ELSE 1 END AS "idDoc",
       CASE WHEN "addressProofDoc" IS NULL THEN 0 ELSE 1 END AS "addrDoc",
       CASE WHEN "dlDoc" IS NULL THEN 0 ELSE 1 END AS "dlDoc"
     FROM "Customer"`;
  const flags = new Map(flagRows.map((f) => [f.id, f]));

  const customers = rows.map((r) => ({
    ...r,
    agreementCount: r._count?.agreements ?? 0,
    _count: undefined,
    hasIdDoc: Boolean(flags.get(r.id)?.idDoc),
    hasAddressDoc: Boolean(flags.get(r.id)?.addrDoc),
    hasDlDoc: Boolean(flags.get(r.id)?.dlDoc),
  }));

  return NextResponse.json({ customers });
}

/** Accepts an image/PDF data URL up to ~2.5 MB, otherwise null. */
function sanitizeDoc(v: unknown): string | null {
  const s = typeof v === "string" ? v : "";
  if (!s.startsWith("data:")) return null;
  if (s.length > 3_500_000) return null; // ~2.5 MB binary
  const head = s.slice(0, 120);
  if (!/^data:(image\/(png|jpe?g|webp)|application\/pdf);base64,/.test(head)) return null;
  if (!/^[A-Za-z0-9+/=\s]+$/.test(s.slice(head.length))) return null;
  return s;
}

/** POST /api/admin/customers — add a customer. Admin only. */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  await ensureDatabaseReady();
  try {
    const b = await req.json();
    const fullName = String(b?.fullName ?? "").trim().slice(0, 120);
    const phone = String(b?.phone ?? "").replace(/[^\d+]/g, "").slice(0, 16);
    if (!fullName || !phone) {
      return NextResponse.json(
        { error: "Name and phone number are required." },
        { status: 400 }
      );
    }

    const created = await db.customer.create({
      data: {
        fullName,
        phone,
        altPhone: b.altPhone ? String(b.altPhone).replace(/[^\d+]/g, "").slice(0, 16) : null,
        email: b.email ? String(b.email).trim().slice(0, 160) : null,
        addressLine: b.addressLine ? String(b.addressLine).trim().slice(0, 300) : null,
        city: b.city ? String(b.city).trim().slice(0, 80) : null,
        state: b.state ? String(b.state).trim().slice(0, 80) : null,
        pincode: b.pincode ? String(b.pincode).trim().slice(0, 10) : null,
        dob: b.dob ? String(b.dob).slice(0, 10) : null,
        idProofType: b.idProofType ? String(b.idProofType).slice(0, 40) : null,
        idProofNumber: b.idProofNumber ? String(b.idProofNumber).trim().slice(0, 60) : null,
        idProofDoc: sanitizeDoc(b.idProofDoc),
        addressProofType: b.addressProofType ? String(b.addressProofType).slice(0, 40) : null,
        addressProofNumber: b.addressProofNumber
          ? String(b.addressProofNumber).trim().slice(0, 60)
          : null,
        addressProofDoc: sanitizeDoc(b.addressProofDoc),
        dlNumber: b.dlNumber ? String(b.dlNumber).trim().slice(0, 60) : null,
        dlExpiry: b.dlExpiry ? String(b.dlExpiry).slice(0, 10) : null,
        dlDoc: sanitizeDoc(b.dlDoc),
        source: CUSTOMER_SOURCES.includes(b.source) ? String(b.source) : "WhatsApp",
        sourceNote: b.sourceNote ? String(b.sourceNote).slice(0, 200) : null,
        notes: b.notes ? String(b.notes).slice(0, 2000) : null,
      },
    });
    return NextResponse.json({ ok: true, customer: { id: created.id } }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/admin/customers] error:", e);
    return NextResponse.json({ error: "Failed to save customer" }, { status: 500 });
  }
}
