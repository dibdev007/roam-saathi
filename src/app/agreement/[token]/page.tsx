import type { Metadata } from "next";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/agreement";
import { AgreementSignClient, type PublicAgreement } from "@/components/site/AgreementSignClient";
import { InvalidLink } from "@/components/site/AgreementSignClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rental Agreement — secure signing | Roam Saathi",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * One-time agreement signing page — /agreement/<secret-token>.
 *
 * SECURITY
 *  - The token exists ONLY in the private link the owner sent on WhatsApp;
 *    the database stores just its SHA-256 hash.
 *  - Never indexed, never cached; once signed (or revoked/expired) the
 *    lookup below fails and this page shows a friendly dead-link screen.
 */
export default async function AgreementPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let agreement: PublicAgreement | null = null;
  let reason: "invalid" | "expired" = "invalid";

  try {
    if (token && token.length >= 20 && token.length <= 120) {
      const row = await db.agreement.findUnique({
        where: { tokenHash: hashToken(token) },
        include: { customer: true },
      });
      if (row && row.status === "pending") {
        if (new Date(row.expiresAt).getTime() > Date.now()) {
          agreement = {
            customerName: row.customer.fullName,
            customerPhone: row.customer.phone,
            vehicleName: row.vehicleName,
            registrationNumber: row.registrationNumber,
            rentalStart: row.rentalStart,
            rentalEnd: row.rentalEnd,
            pickupPoint: row.pickupPoint,
            dropPoint: row.dropPoint,
            rateSummary: row.rateSummary,
            depositAmount: row.depositAmount,
            body: row.body,
            expiresAt: row.expiresAt.toISOString(),
          };
        } else {
          reason = "expired";
        }
      }
    }
  } catch (e) {
    console.error("[/agreement/[token]] lookup failed:", e);
    reason = "invalid";
  }

  if (!agreement) return <InvalidLink reason={reason} />;
  return <AgreementSignClient token={token} agreement={agreement} />;
}
