import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/agreement";
import { renderAgreementPdf } from "@/lib/agreementPdf";
import { getContact } from "@/lib/contact";
import { BUSINESS_NAME, TAGLINE } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";

/* In-memory throttle: max 8 sign attempts per IP per 10 minutes. */
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function throttle(ip: string): boolean {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || rec.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
}

const MAX_SIG_BYTES = 1_600_000; // ~1.2 MB PNG signature
const PNG_DATA_URL = /^data:image\/png;base64,[A-Za-z0-9+/=]+$/;

/**
 * POST /api/agreement/[token]/sign
 * Public but token-gated: the caller must present the exact one-time token
 * whose SHA-256 hash is stored on a PENDING, unexpired agreement.
 * On success: signature is merged into a PDF, the PDF is stored, the token
 * hash is DELETED (the link dies instantly) and the agreement is locked.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (throttle(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in 10 minutes." },
      { status: 429 }
    );
  }

  try {
    const { token } = await params;
    if (!token || token.length < 20 || token.length > 120) {
      return NextResponse.json({ error: "Invalid link." }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    const signatureImage = typeof body?.signatureImage === "string" ? body.signatureImage : "";
    const signatureType = body?.signatureType === "uploaded" ? "uploaded" : "drawn";
    const signerName = typeof body?.signerName === "string" ? body.signerName.trim().slice(0, 80) : "";
    const consent = body?.consent === true;

    if (!signerName) {
      return NextResponse.json({ error: "Please type your full name to confirm." }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json({ error: "Please tick the acceptance box." }, { status: 400 });
    }
    if (!PNG_DATA_URL.test(signatureImage) || signatureImage.length > MAX_SIG_BYTES) {
      return NextResponse.json(
        { error: "Signature missing or invalid. Draw your signature or upload a PNG/JPG image." },
        { status: 400 }
      );
    }

    const tokenHash = hashToken(token);
    const agreement = await db.agreement.findUnique({
      where: { tokenHash },
      include: { customer: true },
    });

    if (!agreement || agreement.status !== "pending") {
      return NextResponse.json(
        { error: "This signing link is no longer valid." },
        { status: 404 }
      );
    }
    if (new Date(agreement.expiresAt).getTime() < Date.now()) {
      return NextResponse.json(
        { error: "This signing link has expired. Please ask Roam Saathi for a fresh link." },
        { status: 410 }
      );
    }

    // Render the final PDF with the merged signature + evidence block.
    const settingsRows = await db.settings.findMany();
    const settings: Record<string, string> = {};
    for (const r of settingsRows) settings[r.key] = r.value;
    const contact = getContact(settings);

    const reference = `Agreement No. RSA-${agreement.createdAt.getFullYear()}-${agreement.id
      .slice(-6)
      .toUpperCase()}`;

    const tripRows: [string, string][] = [
      ["Hirer", `${agreement.customer.fullName} (${agreement.customer.phone})`],
      [
        "Hirer address",
        [agreement.customer.addressLine, agreement.customer.city, agreement.customer.state, agreement.customer.pincode]
          .filter(Boolean)
          .join(", ") || "-",
      ],
      [
        "ID on file",
        agreement.customer.idProofType
          ? `${agreement.customer.idProofType} ${agreement.customer.idProofNumber ?? ""}`
          : "To be collected",
      ],
      ["Driving licence", agreement.customer.dlNumber ?? "To be collected"],
      ["Vehicle", agreement.vehicleName ?? "-"],
      ["Registration no.", agreement.registrationNumber ?? "-"],
      ["Rental period", `${agreement.rentalStart ?? "-"}  to  ${agreement.rentalEnd ?? "-"}`],
      ["Pickup / drop", `${agreement.pickupPoint ?? "-"}  /  ${agreement.dropPoint ?? "-"}`],
      ["Charges", agreement.rateSummary ?? "-"],
      ["Security deposit", agreement.depositAmount ?? "-"],
    ];

    const signedAt = new Date();
    const ua = req.headers.get("user-agent") ?? "";

    const pdfBytes = await renderAgreementPdf({
      businessName: BUSINESS_NAME,
      tagline: TAGLINE,
      contactLine: `${contact.phoneDisplay}  |  ${contact.email}  |  roamsaathi.in`,
      reference,
      statusLabel: "SIGNED",
      tripRows,
      body: agreement.body,
      signature: { imageDataUrl: signatureImage, signerName, signedAt, signerIp: ip, signerUa: ua },
    });

    // Atomic single-use guard: update ONLY while the token hash still matches.
    const result = await db.agreement.updateMany({
      where: { id: agreement.id, tokenHash, status: "pending" },
      data: {
        status: "signed",
        tokenHash: null, // <-- the link dies here, permanently
        signedAt,
        signerName,
        signatureImage,
        signatureType,
        signerIp: ip,
        signerUa: ua.slice(0, 300),
        signedPdf: Buffer.from(pdfBytes).toString("base64"),
      },
    });

    if (result.count === 0) {
      // Someone else signed in a parallel request — link already consumed.
      return NextResponse.json({ error: "This link has already been used." }, { status: 409 });
    }

    return NextResponse.json({ ok: true, signedAt: signedAt.toISOString() });
  } catch (e) {
    console.error("[POST /api/agreement/[token]/sign] error:", e);
    return NextResponse.json(
      { error: "Could not record your signature. Please try once more." },
      { status: 500 }
    );
  }
}
