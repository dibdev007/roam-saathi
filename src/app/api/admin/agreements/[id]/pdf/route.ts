import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { renderAgreementPdf } from "@/lib/agreementPdf";
import { getContact } from "@/lib/contact";
import { BUSINESS_NAME, TAGLINE } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/agreements/[id]/pdf — download the agreement as PDF.
 * - Signed agreements stream the stored PDF (identical bytes every time).
 * - Pending agreements get a freshly rendered preview marked "PENDING".
 * Admin only.
 */
export async function GET(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const { id } = await params;
  const a = await db.agreement.findUnique({
    where: { id },
    include: { customer: true },
  });
  if (!a) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // 1. Already signed — return the stored PDF.
  if (a.signedPdf) {
    const bytes = Buffer.from(a.signedPdf, "base64");
    return new Response(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="roam-saathi-agreement-signed-${a.id.slice(-8)}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  }

  // 2. Pending / revoked — render a preview on the fly.
  const settingsRows = await db.settings.findMany();
  const settings: Record<string, string> = {};
  for (const r of settingsRows) settings[r.key] = r.value;
  const contact = getContact(settings);

  const reference = `Agreement No. RSA-${a.createdAt.getFullYear()}-${a.id.slice(-6).toUpperCase()}`;
  const statusLabel =
    a.status === "revoked"
      ? "REVOKED"
      : a.status === "signed"
        ? "SIGNED"
        : "PENDING CUSTOMER SIGNATURE";

  const tripRows: [string, string][] = [
    ["Hirer", `${a.customer.fullName} (${a.customer.phone})`],
    ["Hirer address", [a.customer.addressLine, a.customer.city, a.customer.state, a.customer.pincode].filter(Boolean).join(", ") || "-"],
    ["ID on file", a.customer.idProofType ? `${a.customer.idProofType} ${a.customer.idProofNumber ?? ""}` : "To be collected"],
    ["Driving licence", a.customer.dlNumber ?? "To be collected"],
    ["Vehicle", a.vehicleName ?? "-"],
    ["Registration no.", a.registrationNumber ?? "-"],
    ["Rental period", `${a.rentalStart ?? "-"}  to  ${a.rentalEnd ?? "-"}`],
    ["Pickup / drop", `${a.pickupPoint ?? "-"}  /  ${a.dropPoint ?? "-"}`],
    ["Charges", a.rateSummary ?? "-"],
    ["Security deposit", a.depositAmount ?? "-"],
  ];

  const pdfBytes = await renderAgreementPdf({
    businessName: BUSINESS_NAME,
    tagline: TAGLINE,
    contactLine: `${contact.phoneDisplay}  |  ${contact.email}  |  roamsaathi.in`,
    reference,
    statusLabel,
    tripRows,
    body: a.body,
    signature: null,
  });

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="roam-saathi-agreement-${a.status}-${a.id.slice(-8)}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
