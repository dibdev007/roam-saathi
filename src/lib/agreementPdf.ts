/**
 * Roam Saathi v6 — agreement PDF renderer (pdf-lib, no native deps).
 *
 * Draws the branded agreement: green letterhead band, trip-details table,
 * every clause of the stored agreement body, and — when the document has
 * been signed — the customer's signature merged at the foot together with
 * the signing timestamp, IP and device record kept for legal evidence.
 *
 * Standard PDF fonts use WinAnsi encoding, so text is sanitised first
 * (₹ → "Rs.", exotic characters → safe equivalents).
 */

import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";

// NOTE: we deliberately pass plain font-name strings instead of the
// StandardFonts enum — enum named-exports get tree-shaken to `undefined`
// inside the Next.js server bundle (verified on Next 16 + Turbopack),
// while the raw string names are exactly what pdf-lib stores internally.
const F_BODY = "Times-Roman";
const F_BODY_BOLD = "Times-Bold";
const F_UI = "Helvetica";
const F_UI_BOLD = "Helvetica-Bold";

const FOREST = rgb(20 / 255, 83 / 255, 45 / 255);
const FOREST_DEEP = rgb(12 / 255, 55 / 255, 30 / 255);
const SAFFRON = rgb(245 / 255, 158 / 255, 11 / 255);
const INK = rgb(0.13, 0.13, 0.13);
const GREY = rgb(0.42, 0.42, 0.42);

const PAGE_W = 595.28; // A4 pt
const PAGE_H = 841.89;
const M = 48; // margins
const CONTENT_W = PAGE_W - M * 2;

/* ------------------------------------------------------------------ */
/* Text sanitation (WinAnsi-safe)                                      */
/* ------------------------------------------------------------------ */

export function win(input: string): string {
  return (input ?? "")
    .replace(/₹/g, "Rs. ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, "...")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2022/g, "-")
    .replace(/\u00b7/g, "-")
    .replace(/\u2265/g, ">=")
    .replace(/\u2264/g, "<=")
    .replace(/[^\x00-\xFF]/g, "?");
}

/* ------------------------------------------------------------------ */
/* Layout helpers                                                      */
/* ------------------------------------------------------------------ */

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = win(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      // Very long single word — hard split.
      if (font.widthOfTextAtSize(w, size) > maxWidth) {
        let chunk = "";
        for (const ch of w) {
          if (font.widthOfTextAtSize(chunk + ch, size) > maxWidth) {
            lines.push(chunk);
            chunk = ch;
          } else chunk += ch;
        }
        line = chunk;
      } else {
        line = w;
      }
    }
  }
  if (line) lines.push(line);
  return lines;
}

const isHeading = (line: string): boolean => {
  const t = line.trim();
  if (t.length < 4 || t.length > 92) return false;
  if (!/[A-Z]/.test(t)) return false;
  // ALL-CAPS lines act as section headings in the template.
  return t === t.toUpperCase() && !t.endsWith(".");
};

export type PdfSignature = {
  imageDataUrl?: string | null; // PNG data URL
  signerName?: string | null;
  signedAt?: Date | null;
  signerIp?: string | null;
  signerUa?: string | null;
};

export type PdfOptions = {
  businessName: string;
  tagline: string;
  contactLine: string;
  reference: string; // e.g. "Agreement RSA-202601-XXXX"
  statusLabel: string; // "PENDING SIGNATURE" | "SIGNED" | ...
  tripRows: [string, string][]; // details table
  body: string;
  signature?: PdfSignature | null;
};

/* ------------------------------------------------------------------ */
/* Renderer                                                            */
/* ------------------------------------------------------------------ */

export async function renderAgreementPdf(opts: PdfOptions): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Rental Agreement - ${opts.reference}`);
  doc.setAuthor(opts.businessName);
  doc.setSubject("Tourist vehicle rental agreement");
  doc.setCreator("Roam Saathi secure agreements");

  const times = await doc.embedFont(F_BODY);
  const timesBold = await doc.embedFont(F_BODY_BOLD);
  const helv = await doc.embedFont(F_UI);
  const helvBold = await doc.embedFont(F_UI_BOLD);

  let page: PDFPage = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H;

  /* ---------- letterhead band ---------- */
  page.drawRectangle({ x: 0, y: PAGE_H - 86, width: PAGE_W, height: 86, color: FOREST });
  page.drawRectangle({ x: 0, y: PAGE_H - 92, width: PAGE_W, height: 6, color: SAFFRON });
  page.drawText(win(opts.businessName.toUpperCase()), {
    x: M,
    y: PAGE_H - 40,
    size: 21,
    font: helvBold,
    color: rgb(1, 1, 1),
  });
  page.drawText(win(opts.tagline), {
    x: M,
    y: PAGE_H - 56,
    size: 9.5,
    font: helv,
    color: rgb(0.85, 0.93, 0.87),
  });
  page.drawText(win(opts.contactLine), {
    x: M,
    y: PAGE_H - 72,
    size: 8.5,
    font: helv,
    color: rgb(0.85, 0.93, 0.87),
  });
  y = PAGE_H - 118;

  /* ---------- title ---------- */
  const title = "RENTAL AGREEMENT - TOURIST VEHICLE";
  const titleW = timesBold.widthOfTextAtSize(title, 15);
  page.drawText(title, { x: (PAGE_W - titleW) / 2, y, size: 15, font: timesBold, color: FOREST_DEEP });
  y -= 16;
  const refLine = `${opts.reference}  |  Status: ${opts.statusLabel}`;
  const refW = helv.widthOfTextAtSize(win(refLine), 8.5);
  page.drawText(win(refLine), { x: (PAGE_W - refW) / 2, y, size: 8.5, font: helv, color: GREY });
  y -= 20;

  const drawFooter = (p: PDFPage) => {
    p.drawLine({
      start: { x: M, y: 40 },
      end: { x: PAGE_W - M, y: 40 },
      thickness: 0.6,
      color: rgb(0.85, 0.85, 0.85),
    });
    p.drawText(win(`${opts.businessName} - rental agreement - subject to Guwahati (Assam) jurisdiction`), {
      x: M,
      y: 29,
      size: 7.5,
      font: helv,
      color: GREY,
    });
  };
  drawFooter(page);

  const newPage = () => {
    page = doc.addPage([PAGE_W, PAGE_H]);
    drawFooter(page);
    y = PAGE_H - M;
  };

  const ensure = (needed: number) => {
    if (y - needed < 58) newPage();
  };

  /* ---------- trip details table ---------- */
  const drawDetailRows = (rows: [string, string][]) => {
    const labelSize = 8.5;
    const valueSize = 9.5;
    const labelW = 128;
    ensure(rows.length * 15 + 8);
    for (const [label, value] of rows) {
      const lines = wrap(value || "-", helv, valueSize, CONTENT_W - labelW - 8);
      const rowH = Math.max(14, lines.length * (valueSize + 1.6) + 4);
      ensure(rowH);
      page.drawText(win(label.toUpperCase()), {
        x: M,
        y: y - 10,
        size: labelSize,
        font: helvBold,
        color: FOREST,
      });
      lines.forEach((ln, i) => {
        page.drawText(ln, {
          x: M + labelW,
          y: y - 10 - i * (valueSize + 1.6),
          size: valueSize,
          font: helv,
          color: INK,
        });
      });
      y -= rowH;
      page.drawLine({
        start: { x: M, y: y + 4 },
        end: { x: PAGE_W - M, y: y + 4 },
        thickness: 0.4,
        color: rgb(0.9, 0.88, 0.82),
      });
      y -= 2;
    }
    y -= 6;
  };

  drawDetailRows(opts.tripRows);

  /* ---------- body ---------- */
  const paragraphs = (opts.body ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  for (const para of paragraphs) {
    const lines = para.split("\n").filter((l) => l.trim() !== "");
    // A heading paragraph (ALL CAPS) renders bold with extra spacing.
    if (lines.length === 1 && isHeading(lines[0])) {
      const text = win(lines[0].trim());
      const size = text.length > 60 ? 11 : 11.5;
      ensure(30);
      y -= 8;
      page.drawText(text, { x: M, y: y - size, size, font: timesBold, color: FOREST_DEEP });
      y -= size + 7;
      page.drawLine({
        start: { x: M, y: y + 2 },
        end: { x: M + 56, y: y + 2 },
        thickness: 1.6,
        color: SAFFRON,
      });
      y -= 6;
      continue;
    }
    // Regular paragraph: merge soft-wrapped lines, re-wrap to page width.
    const merged = lines.join(" ");
    for (const ln of wrap(merged, times, 10, CONTENT_W)) {
      ensure(16);
      page.drawText(ln, { x: M, y: y - 10, size: 10, font: times, color: INK });
      y -= 13.2;
    }
    y -= 6;
  }

  /* ---------- signature block ---------- */
  ensure(150);
  y -= 4;
  page.drawText("SIGNATURE", { x: M, y: y - 11, size: 11.5, font: timesBold, color: FOREST_DEEP });
  y -= 20;
  page.drawLine({ start: { x: M, y: y + 2 }, end: { x: M + 56, y: y + 2 }, thickness: 1.6, color: SAFFRON });
  y -= 10;

  const sigBoxW = 200;
  const sigBoxH = 70;
  ensure(sigBoxH + 40);
  // box outline
  page.drawRectangle({
    x: M,
    y: y - sigBoxH,
    width: sigBoxW,
    height: sigBoxH,
    borderColor: rgb(0.75, 0.75, 0.75),
    borderWidth: 0.8,
    color: rgb(0.985, 0.975, 0.95),
  });

  let embedded = false;
  const dataUrl = opts.signature?.imageDataUrl;
  if (dataUrl && dataUrl.startsWith("data:image/png;base64,")) {
    try {
      const b64 = dataUrl.slice("data:image/png;base64,".length);
      const png = await doc.embedPng(Buffer.from(b64, "base64"));
      const scale = Math.min((sigBoxW - 14) / png.width, (sigBoxH - 14) / png.height);
      const w = png.width * scale;
      const h = png.height * scale;
      page.drawImage(png, { x: M + (sigBoxW - w) / 2, y: y - sigBoxH + (sigBoxH - h) / 2, width: w, height: h });
      embedded = true;
    } catch {
      embedded = false;
    }
  }
  if (!embedded) {
    page.drawText(win("Signature will appear here after the customer signs"), {
      x: M + 12,
      y: y - sigBoxH / 2 - 3,
      size: 8,
      font: helv,
      color: GREY,
    });
  }

  // caption inside / under the box
  page.drawText(win(opts.signature?.signerName ? `Signed by: ${opts.signature.signerName}` : "Hirer's signature"), {
    x: M + 8,
    y: y - sigBoxH + 6,
    size: 8,
    font: helvBold,
    color: FOREST,
  });

  const rightX = M + sigBoxW + 22;
  page.drawText(win("ELECTRONIC SIGNATURE RECORD"), { x: rightX, y: y - 12, size: 8.5, font: helvBold, color: FOREST });
  const sigLines: string[] = [];
  if (opts.signature?.signedAt) {
    sigLines.push(
      `Signed on: ${opts.signature.signedAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST`
    );
  }
  if (opts.signature?.signerIp) sigLines.push(`Signer IP: ${opts.signature.signerIp}`);
  if (opts.signature?.signerUa)
    sigLines.push(`Device: ${opts.signature.signerUa.slice(0, 90)}`);
  sigLines.push("Executed electronically under the Information Technology Act, 2000.");
  sigLines.push("This signed PDF is kept in the records of Roam Saathi, Guwahati.");
  let sy = y - 28;
  for (const ln of sigLines) {
    for (const wrapped of wrap(ln, helv, 7.5, PAGE_W - M - rightX)) {
      page.drawText(win(wrapped), { x: rightX, y: sy, size: 7.5, font: helv, color: GREY });
      sy -= 10.5;
    }
  }
  y -= sigBoxH + 18;

  /* ---------- page numbers ---------- */
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    const label = `Page ${i + 1} of ${pages.length}`;
    const w = helv.widthOfTextAtSize(label, 7.5);
    p.drawText(label, { x: PAGE_W - M - w, y: 29, size: 7.5, font: helv, color: GREY });
  });

  return doc.save();
}
