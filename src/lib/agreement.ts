/**
 * Roam Saathi v6 — rental agreement engine.
 *
 * SECURITY MODEL
 * --------------
 * 1. When the admin generates a signing link we mint a 256-bit random
 *    token. ONLY the raw token is ever put in the URL the customer opens.
 * 2. The database stores nothing but the SHA-256 hash of that token —
 *    a stolen database backup can NOT be used to open signing links.
 * 3. The link is single-use: the moment the customer signs, the stored
 *    hash is deleted, so the same URL can never be opened again.
 * 4. Links expire (default 7 days) and the signing endpoint is throttled.
 */

import { createHash, randomBytes } from "node:crypto";
import { BUSINESS_NAME, EMAIL, ADDRESS_LINE } from "./siteConfig";

/* ------------------------------------------------------------------ */
/* Token helpers                                                       */
/* ------------------------------------------------------------------ */

/** 256-bit URL-safe token that goes into the signing link. */
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

/** We store only this hash — never the token itself. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/* ------------------------------------------------------------------ */
/* Shared types                                                        */
/* ------------------------------------------------------------------ */

export type AgreementParty = {
  fullName: string;
  phone: string;
  altPhone?: string | null;
  email?: string | null;
  addressLine?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  idProofType?: string | null;
  idProofNumber?: string | null;
  dlNumber?: string | null;
};

export type AgreementTrip = {
  vehicleName?: string | null;
  registrationNumber?: string | null;
  rentalStart?: string | null;
  rentalEnd?: string | null;
  pickupPoint?: string | null;
  dropPoint?: string | null;
  rateSummary?: string | null;
  depositAmount?: string | null;
  extraTerms?: string | null;
};

/* ------------------------------------------------------------------ */
/* Text helpers                                                        */
/* ------------------------------------------------------------------ */

function dash(v?: string | null, fallback = "—"): string {
  const t = (v ?? "").toString().trim();
  return t === "" ? fallback : t;
}

function fmtDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return dash(iso);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function fmtDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return dash(iso);
  return (
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) +
    " at " +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
  );
}

export function fullAddress(p: AgreementParty): string {
  return [p.addressLine, p.city, p.state, p.pincode]
    .map((x) => (x ?? "").toString().trim())
    .filter(Boolean)
    .join(", ");
}

/* ------------------------------------------------------------------ */
/* Agreement template                                                  */
/* ------------------------------------------------------------------ */

/**
 * Builds the complete rental agreement text with every customer and trip
 * detail merged in. The result is plain text (blank line = paragraph)
 * so the same string renders on the signing page AND inside the PDF.
 *
 * Drafted for a tourist-only car rental in Assam: governed by Indian law,
 * referencing the Indian Contract Act 1872 / Motor Vehicles Act 1988 (and
 * the Assam Motor Vehicles Rules), with exclusive jurisdiction at the
 * competent courts of Guwahati (Gauhati High Court).
 */
export function buildAgreementBody(
  customer: AgreementParty,
  trip: AgreementTrip,
  agreementDate: Date = new Date()
): string {
  const today = fmtDate(agreementDate.toISOString());
  const idLine =
    customer.idProofType || customer.idProofNumber
      ? `${dash(customer.idProofType, "ID")} No. ${dash(customer.idProofNumber, "—")}`
      : "ID documents verified at handover";
  const dlLine = customer.dlNumber
    ? `Driving Licence No. ${customer.dlNumber} (copy retained by the Owner)`
    : "Driving Licence verified and copy retained by the Owner";

  const extra = (trip.extraTerms ?? "").trim();

  return `RENTAL AGREEMENT (TOURIST VEHICLE — SELF-DRIVE / WITH DRIVER)

This Rental Agreement ("Agreement") is executed on ${today} at Guwahati, Assam, India, between the OWNER and the HIRER whose details are recorded below. By electronically signing this Agreement the Hirer confirms that he/she has read, understood and accepted every clause printed on this page.

1. THE PARTIES

OWNER: ${BUSINESS_NAME} — tourist vehicle rental, ${ADDRESS_LINE} (email: ${EMAIL}), hereinafter the "Owner".

HIRER: ${dash(customer.fullName)}, phone ${dash(customer.phone)}${customer.altPhone ? `, alternate phone ${customer.altPhone}` : ""}${customer.email ? `, email ${customer.email}` : ""}, resident of ${fullAddress(customer) || "address on record with the Owner"}, identified by ${idLine} and ${dlLine}, hereinafter the "Hirer". The Hirer affirms that he/she is at least 21 years of age (25 for select premium vehicles) and holds a valid driving licence issued by a competent authority in India, or — for foreign nationals — a passport with a valid Indian visa and an International Driving Permit.

2. VEHICLE AND TRIP PARTICULARS

Vehicle: ${dash(trip.vehicleName)}
Registration No.: ${dash(trip.registrationNumber)}
Rental period: from ${fmtDateTime(trip.rentalStart)} to ${fmtDateTime(trip.rentalEnd)}
Pickup point: ${dash(trip.pickupPoint)}    Drop point: ${dash(trip.dropPoint)}
Charges: ${dash(trip.rateSummary)}
Refundable security deposit: ${dash(trip.depositAmount)}

3. DOCUMENTS AND VERIFICATION

3.1 Before handover the Hirer must submit originals for verification and self-attested copies (or scans) of: photo ID proof, address proof and a valid driving licence. The Owner retains copies strictly for legal, insurance and record-keeping purposes.
3.2 The Hirer declares that all documents furnished are genuine and that any misrepresentation voids this Agreement and forfeits the security deposit.

4. USE OF THE VEHICLE

4.1 The vehicle is let out for TOURIST PURPOSES ONLY, for the use of the Hirer and the accompanying persons declared at handover. Commercial carriage of passengers or goods for hire is strictly prohibited.
4.2 The Hirer shall not: drive under the influence of alcohol, narcotics or sedatives; race or test the vehicle; tow or push other vehicles; sub-let, lend or part with possession of the vehicle; carry more persons than the registered seating capacity; or take the vehicle outside the permitted territory (Assam and the North-Eastern states) without the Owner's prior written consent. Protected/restricted areas (e.g. certain Arunachal Pradesh circuits) require inner-line permits that are the Hirer's responsibility.
4.3 Smoking, gutka/paan and carriage of contraband, arms or animals inside the vehicle are prohibited; deep-cleaning charges will be deducted from the deposit if breached.
4.4 Only the Hirer or a licensed driver declared to and accepted by the Owner may drive.

5. FUEL, TOLL AND RUNNING CHARGES

5.1 With-driver rentals: fuel, toll, parking and driver allowance are included in the quoted fare.
5.2 Self-drive rentals: fuel, toll, parking, state permits and entry fees are payable by the Hirer at actuals. The vehicle is delivered with a full/quoted tank and must be returned in the same condition, failing which refuelling plus a service charge will be deducted.
5.3 The Hirer remains liable for all traffic and toll violations, challans, fines and court proceedings arising during the rental period, irrespective of who was driving.

6. RENT, DEPOSIT AND PAYMENT

6.1 The Hirer shall pay the full rental in advance (or as otherwise agreed in writing) and a refundable security deposit. The deposit is refunded after the vehicle is returned on time, undamaged, with all documents, fittings and a full tank, and after settlement of fuel, fines and tolls (which may take 7–21 working days while challans are pending).
6.2 Late return is charged at 1.5x the daily rate for every commenced hour/day beyond the agreed time. Early return does not entitle the Hirer to any refund.
6.3 Extension is possible only with the Owner's prior consent and subject to availability.

7. DAMAGE, ACCIDENT AND THEFT

7.1 Any damage to the vehicle — including tyres, rims, glass, underbody, interior and clutches/burnt components — is recoverable from the Hirer to the extent not covered by insurance, together with the insurance excess/compulsory deductible, towing, and loss-of-use charges at the daily rate.
7.2 In case of accident, theft, fire or malicious damage the Hirer must inform the Owner immediately by phone, lodge an FIR at the nearest police station within 24 hours, and cooperate with the Owner and the insurer. Insurance claims that fail because of the Hirer's negligence, delay or breach of this Agreement shall be borne entirely by the Hirer.
7.3 The Hirer must not effect repairs or settlement with third parties without the Owner's written consent.

8. OWNER'S RIGHTS

8.1 The Owner may repossess the vehicle at the Hirer's cost, without notice, if it is used in breach of this Agreement, appears abandoned, or rent remains unpaid.
8.2 The Owner is not responsible for the Hirer's belongings, delays arising from breakdowns, road closures, weather or other events beyond the Owner's control; a comparable replacement vehicle will be attempted where reasonably possible.

9. PERSONAL DATA

9.1 The Hirer consents to the Owner collecting and storing the KYC documents, trip details and the electronic signature given on the signing page, for the purposes of this rental, statutory compliance, insurance and dispute resolution, in line with the Information Technology Act, 2000 and applicable Indian data practices. Records are not sold or used for unrelated marketing without consent.

10. ELECTRONIC SIGNATURE

10.1 The parties agree that this Agreement may be executed electronically. The Hirer's signature — drawn on screen or uploaded as a scanned image — merged into this document, together with the recorded date, time and device details, constitutes a valid and binding signature under the Information Technology Act, 2000 (Sections 3 & 3A) and evidences acceptance of every clause.

11. GOVERNING LAW AND JURISDICTION

11.1 This Agreement is governed by the laws of India, including the Indian Contract Act, 1872, the Motor Vehicles Act, 1988 and the Assam Motor Vehicles Rules, 2003 (as amended).
11.2 Subject to arbitration by mutual consent, any dispute arising out of or in connection with this Agreement shall be subject to the EXCLUSIVE JURISDICTION OF THE COMPETENT COURTS AT GUWAHATI, ASSAM, INDIA (Gauhati High Court and courts subordinate thereto), to the exclusion of all other courts.

12. ENTIRE AGREEMENT

12.1 This document (together with the trip particulars in clause 2${extra ? " and the special conditions in clause 13" : ""}) constitutes the entire understanding between the parties and supersedes all prior chats, quotes or oral promises. No waiver by the Owner is valid unless in writing.

${extra ? `13. SPECIAL CONDITIONS (OWNER)\n\n${extra}\n\n14. ENTIRE AGREEMENT REFERENCE\n\nClause 12 above includes these special conditions.\n` : ""}
ACCEPTANCE

By signing below (on screen or by uploaded scanned signature) I, ${dash(customer.fullName)}, confirm that I have read and accepted all clauses of this Agreement, that the particulars in clause 2 are correct, and that the vehicle was handed over to me in good condition with the listed documents and fittings.

Hirer's signature: ....................................    Date & time: ${fmtDateTime(new Date().toISOString())}
Signed for and on behalf of ${BUSINESS_NAME}: ....................................

This electronically signed document is maintained in the records of ${BUSINESS_NAME}, Guwahati, Assam.`;
}

/** Small helper shared by the signing page for footer timestamps. */
export { fmtDate, fmtDateTime };
