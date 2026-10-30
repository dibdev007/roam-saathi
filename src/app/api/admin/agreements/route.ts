import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureDatabaseReady } from "@/lib/dbReady";
import { isAdmin } from "@/lib/auth";
import { generateToken, hashToken, buildAgreementBody } from "@/lib/agreement";

export const dynamic = "force-dynamic";

const ACTIVE_WINDOW_MS = 60 * 60 * 24 * 7; // a pending agreement expires after 7 days

/**
 * GET /api/admin/agreements — every agreement with customer name/phone.
 * Heavy fields (body text, signature image, PDF bytes) are excluded so the
 * list stays fast. Admin only.
 */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  await ensureDatabaseReady();

  const rows = await db.agreement.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      tokenHash: true,
      customerId: true,
      vehicleName: true,
      registrationNumber: true,
      rentalStart: true,
      rentalEnd: true,
      pickupPoint: true,
      dropPoint: true,
      rateSummary: true,
      depositAmount: true,
      status: true,
      expiresAt: true,
      signedAt: true,
      signedPdf: true,
      createdAt: true,
      customer: { select: { fullName: true, phone: true } },
    },
  });

  const now = Date.now();
  const agreements = rows.map((r) => ({
    id: r.id,
    customerId: r.customerId,
    customerName: r.customer?.fullName ?? "—",
    customerPhone: r.customer?.phone ?? "",
    vehicleName: r.vehicleName,
    registrationNumber: r.registrationNumber,
    rentalStart: r.rentalStart,
    rentalEnd: r.rentalEnd,
    pickupPoint: r.pickupPoint,
    dropPoint: r.dropPoint,
    rateSummary: r.rateSummary,
    depositAmount: r.depositAmount,
    status: r.status,
    hasLink: Boolean(r.tokenHash) && new Date(r.expiresAt).getTime() > now,
    linkExpiresAt: r.expiresAt ? new Date(r.expiresAt).toISOString() : null,
    signedAt: r.signedAt ? new Date(r.signedAt).toISOString() : null,
    hasSignedPdf: Boolean(r.signedPdf),
    createdAt: new Date(r.createdAt).toISOString(),
  }));

  return NextResponse.json({ agreements });
}

/**
 * POST /api/admin/agreements — create an agreement + one-time signing link.
 * Body: { customerId, vehicleName?, registrationNumber?, rentalStart?,
 *         rentalEnd?, pickupPoint?, dropPoint?, rateSummary?, depositAmount?,
 *         extraTerms?, expiresInDays? }
 * Returns { token } — the admin UI builds the full URL from its own origin.
 * The token is NOT stored anywhere server-side (only its SHA-256 hash).
 */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  await ensureDatabaseReady();
  try {
    const b = await req.json();
    const customerId = String(b?.customerId ?? "");
    if (!customerId) {
      return NextResponse.json({ error: "Customer is required" }, { status: 400 });
    }
    const customer = await db.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const str = (v: unknown, max: number): string | null => {
      const s = typeof v === "string" ? v.trim() : "";
      return s === "" ? null : s.slice(0, max);
    };

    const trip = {
      vehicleName: str(b.vehicleName, 120),
      registrationNumber: str(b.registrationNumber, 40),
      rentalStart: str(b.rentalStart, 40),
      rentalEnd: str(b.rentalEnd, 40),
      pickupPoint: str(b.pickupPoint, 200),
      dropPoint: str(b.dropPoint, 200),
      rateSummary: str(b.rateSummary, 300),
      depositAmount: str(b.depositAmount, 100),
      extraTerms: str(b.extraTerms, 4000),
    };

    const days = Math.min(Math.max(Number(b?.expiresInDays) || 7, 1), 30);
    const expiresAt = new Date(Date.now() + days * ACTIVE_WINDOW_MS);

    const body = buildAgreementBody(
      {
        fullName: customer.fullName,
        phone: customer.phone,
        altPhone: customer.altPhone,
        email: customer.email,
        addressLine: customer.addressLine,
        city: customer.city,
        state: customer.state,
        pincode: customer.pincode,
        idProofType: customer.idProofType,
        idProofNumber: customer.idProofNumber,
        dlNumber: customer.dlNumber,
      },
      trip
    );

    const token = generateToken();

    const created = await db.agreement.create({
      data: {
        tokenHash: hashToken(token),
        customerId,
        ...trip,
        body,
        status: "pending",
        expiresAt,
      },
    });

    return NextResponse.json(
      { ok: true, id: created.id, token, expiresAt: expiresAt.toISOString() },
      { status: 201 }
    );
  } catch (e) {
    console.error("[POST /api/admin/agreements] error:", e);
    return NextResponse.json({ error: "Failed to create agreement" }, { status: 500 });
  }
}
