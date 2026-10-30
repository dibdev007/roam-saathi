import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { CUSTOMER_SOURCES } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** Accepts an image/PDF data URL up to ~2.5 MB, otherwise null. */
function sanitizeDoc(v: unknown): string | null | undefined {
  if (v === undefined) return undefined; // field not touched
  const s = typeof v === "string" ? v : "";
  if (s === "" || s === null) return null; // explicitly cleared
  if (!s.startsWith("data:")) return undefined;
  if (s.length > 3_500_000) return undefined; // too large — ignore silently
  const head = s.slice(0, 120);
  if (!/^data:(image\/(png|jpe?g|webp)|application\/pdf);base64,/.test(head)) return undefined;
  if (!/^[A-Za-z0-9+/=\s]+$/.test(s.slice(head.length))) return undefined;
  return s;
}

/** GET /api/admin/customers/[id] — full record incl. documents. Admin only. */
export async function GET(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const { id } = await params;
  const customer = await db.customer.findUnique({ where: { id } });
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }
  return NextResponse.json({ customer });
}

/** PATCH /api/admin/customers/[id] — update any subset of fields. Admin only. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const b = await req.json();
    const updated = await db.customer.update({
      where: { id },
      data: {
        ...(b.fullName != null ? { fullName: String(b.fullName).trim().slice(0, 120) } : {}),
        ...(b.phone != null ? { phone: String(b.phone).replace(/[^\d+]/g, "").slice(0, 16) } : {}),
        ...(b.altPhone !== undefined
          ? { altPhone: b.altPhone ? String(b.altPhone).replace(/[^\d+]/g, "").slice(0, 16) : null }
          : {}),
        ...(b.email !== undefined
          ? { email: b.email ? String(b.email).trim().slice(0, 160) : null }
          : {}),
        ...(b.addressLine !== undefined
          ? { addressLine: b.addressLine ? String(b.addressLine).trim().slice(0, 300) : null }
          : {}),
        ...(b.city !== undefined ? { city: b.city ? String(b.city).trim().slice(0, 80) : null } : {}),
        ...(b.state !== undefined ? { state: b.state ? String(b.state).trim().slice(0, 80) : null } : {}),
        ...(b.pincode !== undefined
          ? { pincode: b.pincode ? String(b.pincode).trim().slice(0, 10) : null }
          : {}),
        ...(b.dob !== undefined ? { dob: b.dob ? String(b.dob).slice(0, 10) : null } : {}),
        ...(b.idProofType !== undefined
          ? { idProofType: b.idProofType ? String(b.idProofType).slice(0, 40) : null }
          : {}),
        ...(b.idProofNumber !== undefined
          ? { idProofNumber: b.idProofNumber ? String(b.idProofNumber).trim().slice(0, 60) : null }
          : {}),
        ...(b.idProofDoc !== undefined ? { idProofDoc: sanitizeDoc(b.idProofDoc) } : {}),
        ...(b.addressProofType !== undefined
          ? { addressProofType: b.addressProofType ? String(b.addressProofType).slice(0, 40) : null }
          : {}),
        ...(b.addressProofNumber !== undefined
          ? {
              addressProofNumber: b.addressProofNumber
                ? String(b.addressProofNumber).trim().slice(0, 60)
                : null,
            }
          : {}),
        ...(b.addressProofDoc !== undefined ? { addressProofDoc: sanitizeDoc(b.addressProofDoc) } : {}),
        ...(b.dlNumber !== undefined
          ? { dlNumber: b.dlNumber ? String(b.dlNumber).trim().slice(0, 60) : null }
          : {}),
        ...(b.dlExpiry !== undefined
          ? { dlExpiry: b.dlExpiry ? String(b.dlExpiry).slice(0, 10) : null }
          : {}),
        ...(b.dlDoc !== undefined ? { dlDoc: sanitizeDoc(b.dlDoc) } : {}),
        ...(b.source != null
          ? { source: CUSTOMER_SOURCES.includes(b.source) ? String(b.source) : "WhatsApp" }
          : {}),
        ...(b.sourceNote !== undefined
          ? { sourceNote: b.sourceNote ? String(b.sourceNote).slice(0, 200) : null }
          : {}),
        ...(b.notes !== undefined
          ? { notes: b.notes ? String(b.notes).slice(0, 2000) : null }
          : {}),
      },
    });
    return NextResponse.json({ ok: true, customer: { id: updated.id } });
  } catch (e) {
    console.error("[PATCH /api/admin/customers/[id]] error:", e);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

/** DELETE /api/admin/customers/[id] — removes the customer AND their agreements. */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await db.customer.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }
}
