import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/admin/agreements/[id] — full detail incl. agreement text. */
export async function GET(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const { id } = await params;
  const a = await db.agreement.findUnique({
    where: { id },
    include: { customer: { select: { fullName: true, phone: true } } },
  });
  if (!a) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    agreement: {
      id: a.id,
      customerId: a.customerId,
      customerName: a.customer?.fullName ?? "",
      customerPhone: a.customer?.phone ?? "",
      vehicleName: a.vehicleName,
      registrationNumber: a.registrationNumber,
      rentalStart: a.rentalStart,
      rentalEnd: a.rentalEnd,
      pickupPoint: a.pickupPoint,
      dropPoint: a.dropPoint,
      rateSummary: a.rateSummary,
      depositAmount: a.depositAmount,
      extraTerms: a.extraTerms,
      body: a.body,
      status: a.status,
      hasLink: Boolean(a.tokenHash),
      expiresAt: a.expiresAt.toISOString(),
      signedAt: a.signedAt?.toISOString() ?? null,
      hasSignedPdf: Boolean(a.signedPdf),
    },
  });
}

/** DELETE /api/admin/agreements/[id] — revoke a pending link instantly. */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const a = await db.agreement.findUnique({ where: { id } });
    if (!a) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (a.status === "signed") {
      return NextResponse.json(
        { error: "This agreement is already signed and cannot be revoked." },
        { status: 409 }
      );
    }
    await db.agreement.update({
      where: { id },
      data: { status: "revoked", tokenHash: null },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[DELETE /api/admin/agreements/[id]] error:", e);
    return NextResponse.json({ error: "Failed to revoke agreement" }, { status: 500 });
  }
}
