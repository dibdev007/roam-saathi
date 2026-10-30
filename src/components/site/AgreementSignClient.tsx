"use client";

// Public, token-gated agreement signing experience.
// The customer reads the full agreement, then signs by drawing on the
// screen (like a pen) or uploading a scanned signature photo. The PNG is
// normalised client-side, sent to the one-time signing endpoint, merged
// into the official PDF on the server, and the link dies instantly.

import * as React from "react";
import {
  CheckCircle2,
  Eraser,
  FileSignature,
  Loader2,
  Lock,
  PenLine,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RhinoLogo } from "@/components/brand/RhinoLogo";
import { cn } from "@/lib/utils";

export type PublicAgreement = {
  customerName: string;
  customerPhone: string;
  vehicleName: string | null;
  registrationNumber: string | null;
  rentalStart: string | null;
  rentalEnd: string | null;
  pickupPoint: string | null;
  dropPoint: string | null;
  rateSummary: string | null;
  depositAmount: string | null;
  body: string;
  expiresAt: string;
};

/* ------------------------------------------------------------------ */
/* Dead / consumed link screen                                         */
/* ------------------------------------------------------------------ */

export function InvalidLink({ reason }: { reason: "invalid" | "expired" }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md rounded-2xl border border-forest/15 bg-white p-8 text-center shadow-xl">
        <RhinoLogo className="mx-auto h-12 w-12" />
        <div className="mx-auto mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-saffron/15">
          <Lock className="h-6 w-6 text-saffron-deep" />
        </div>
        <h1 className="mt-4 font-display text-xl font-extrabold text-forest">
          {reason === "expired" ? "This link has expired" : "This link is no longer active"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-forest/70">
          {reason === "expired"
            ? "Signing links stay live for a limited time. Please ask the Roam Saathi team for a fresh agreement link on WhatsApp."
            : "Every signing link works exactly once and is destroyed immediately after it is used. If you have not signed yet, please ask the Roam Saathi team for a new link."}
        </p>
        <p className="mt-4 text-xs text-forest/50">
          Roam Saathi · Tourist car rental · Guwahati, Assam
        </p>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function fmt(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (!isNaN(d.getTime())) {
    return (
      d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
      ", " +
      d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    );
  }
  return value;
}

/** Downscale any image to a PNG data URL (max 900px wide, transparent-safe). */
async function imageFileToPng(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("decode failed"));
    el.src = dataUrl;
  });
  const maxW = 900;
  const scale = Math.min(1, maxW / img.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const out = canvas.toDataURL("image/png");
  if (out.length > 1_200_000) throw new Error("Image too large — please use a smaller scan.");
  return out;
}

/* ------------------------------------------------------------------ */
/* Signature pad                                                       */
/* ------------------------------------------------------------------ */

function SignaturePad({
  onChange,
}: {
  onChange: (dataUrl: string | null) => void;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const drawing = React.useRef(false);
  const [hasInk, setHasInk] = React.useState(false);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * c.width) / r.width,
      y: ((e.clientY - r.top) * c.height) / r.height,
    };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    const p = pos(e);
    drawing.current = true;
    c.setPointerCapture(e.pointerId);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.strokeStyle = "#17202a";
    ctx.lineWidth = 3.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    if (!hasInk) setHasInk(true);
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const c = canvasRef.current!;
    onChange(c.toDataURL("image/png"));
  };

  const clear = () => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    setHasInk(false);
    onChange(null);
  };

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-forest/30 bg-white">
        <canvas
          ref={canvasRef}
          width={800}
          height={260}
          className="block h-40 w-full touch-none sm:h-48"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          onPointerCancel={end}
          aria-label="Draw your signature here"
        />
        {!hasInk && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="flex items-center gap-2 text-sm text-forest/40">
              <PenLine className="h-4 w-4" /> Sign here with your finger, stylus or mouse
            </p>
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={clear} className="border-forest/20 text-forest">
          <Eraser className="h-3.5 w-3.5" /> Clear
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main signing client                                                 */
/* ------------------------------------------------------------------ */

export function AgreementSignClient({
  token,
  agreement,
}: {
  token: string;
  agreement: PublicAgreement;
}) {
  const [mode, setMode] = React.useState<"draw" | "upload">("draw");
  const [drawn, setDrawn] = React.useState<string | null>(null);
  const [uploaded, setUploaded] = React.useState<string | null>(null);
  const [signerName, setSignerName] = React.useState("");
  const [consent, setConsent] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [signedAt, setSignedAt] = React.useState<string | null>(null);
  const [showFullDoc, setShowFullDoc] = React.useState(false);

  const signature = mode === "draw" ? drawn : uploaded;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a photo or scan of your signature (JPG/PNG).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("That image is too large. Please use one under 8 MB.");
      return;
    }
    try {
      const png = await imageFileToPng(file);
      setUploaded(png);
      toast.success("Signature image ready");
    } catch {
      toast.error("Could not read that image. Try another scan or photo.");
    }
  }

  async function submit() {
    if (submitting) return;
    if (!signature) {
      toast.error(mode === "draw" ? "Please draw your signature first." : "Please upload your signature first.");
      return;
    }
    if (!signerName.trim()) {
      toast.error("Please type your full name to confirm.");
      return;
    }
    if (!consent) {
      toast.error("Please tick the acceptance box to sign.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/agreement/${encodeURIComponent(token)}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureImage: signature,
          signatureType: mode === "draw" ? "drawn" : "uploaded",
          signerName: signerName.trim(),
          consent: true,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(j?.error ?? "Signing failed. Please try again.");
        if (res.status === 404 || res.status === 409 || res.status === 410) {
          // Link consumed / revoked / expired — reload to show the dead-link screen.
          setTimeout(() => window.location.reload(), 1600);
        }
        return;
      }
      setSignedAt(j?.signedAt ?? new Date().toISOString());
      toast.success("Agreement signed successfully");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Network problem. Please check your internet and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------- success screen ---------- */
  if (signedAt) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
        <div className="w-full max-w-lg rounded-2xl border border-forest/15 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest/10">
            <CheckCircle2 className="h-9 w-9 text-forest" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-extrabold text-forest">
            Agreement signed!
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-forest/70">
            Thank you, <strong>{agreement.customerName}</strong>. Your signed rental agreement
            has been saved by Roam Saathi and a copy can be shared with you on WhatsApp.
          </p>
          <p className="mt-3 rounded-lg bg-forest/5 p-3 text-xs text-forest/70">
            Signed on {fmt(signedAt)} (IST). This signing link is now permanently closed — nobody
            can open it again, not even by accident.
          </p>
          <p className="mt-6 text-xs text-forest/50">
            You can safely close this page now.
          </p>
        </div>
      </main>
    );
  }

  /* ---------- signing screen ---------- */
  const details: [string, string][] = [
    ["Prepared for", `${agreement.customerName} · ${agreement.customerPhone}`],
    ["Vehicle", agreement.vehicleName ?? "—"],
    ["Registration no.", agreement.registrationNumber ?? "—"],
    ["Rental period", `${fmt(agreement.rentalStart)}  →  ${fmt(agreement.rentalEnd)}`],
    ["Pickup / drop", `${agreement.pickupPoint ?? "—"}  /  ${agreement.dropPoint ?? "—"}`],
    ["Charges", agreement.rateSummary ?? "—"],
    ["Security deposit", agreement.depositAmount ?? "—"],
    ["Link valid until", fmt(agreement.expiresAt)],
  ];

  return (
    <main className="min-h-screen bg-cream pb-16">
      {/* letterhead */}
      <div className="grain relative bg-forest text-cream">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <RhinoLogo light className="h-10 w-10" />
            <div>
              <p className="font-display text-base font-extrabold tracking-wide">ROAM SAATHI</p>
              <p className="text-[11px] text-cream/70">Your Northeast Road Companion · Guwahati, Assam</p>
            </div>
          </div>
          <div className="hidden items-center gap-1.5 rounded-full bg-cream/10 px-3 py-1.5 text-[11px] font-semibold text-cream sm:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-saffron" /> Secure one-time signing link
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mt-6 rounded-2xl border border-forest/15 bg-white shadow-sm">
          <div className="border-b border-forest/10 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-saffron/15">
                <FileSignature className="h-5 w-5 text-saffron-deep" />
              </div>
              <div>
                <h1 className="font-display text-lg font-extrabold text-forest sm:text-xl">
                  Rental agreement for {agreement.customerName}
                </h1>
                <p className="mt-1 text-sm text-forest/70">
                  Please read the agreement below carefully. When you are ready, sign at the
                  bottom — draw your signature like a pen, or upload a photo of your signature.
                </p>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2.5 rounded-xl bg-cream/70 p-4 text-sm sm:grid-cols-2">
              {details.map(([k, v]) => (
                <div key={k} className="flex flex-col">
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-forest/50">{k}</dt>
                  <dd className="font-semibold text-forest">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* agreement text */}
          <div className="p-5 sm:p-6">
            <div
              className={cn(
                "relative overflow-hidden rounded-xl border border-forest/10 bg-[#fffdf7]",
                showFullDoc ? "max-h-none" : "max-h-[420px]"
              )}
            >
              <pre className="whitespace-pre-wrap px-4 py-4 font-serif text-[13.5px] leading-relaxed text-ink sm:px-6 sm:text-sm">
                {agreement.body}
              </pre>
              {!showFullDoc && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#fffdf7] to-transparent" />
              )}
            </div>
            <div className="mt-3 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullDoc((s) => !s)}
                className="border-forest/25 text-forest"
              >
                {showFullDoc ? "Show less" : "Read the full agreement"}
              </Button>
            </div>
          </div>

          {/* signature */}
          <div className="border-t border-forest/10 bg-cream/50 p-5 sm:p-6">
            <h2 className="font-display text-base font-extrabold text-forest">Sign the agreement</h2>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:max-w-xs">
              {(
                [
                  { key: "draw", label: "Draw signature", icon: PenLine },
                  { key: "upload", label: "Upload scan", icon: Upload },
                ] as const
              ).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMode(key)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all",
                    mode === key
                      ? "border-forest bg-forest text-cream shadow"
                      : "border-forest/20 bg-white text-forest hover:border-forest/40"
                  )}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>

            <div className="mt-4">
              {mode === "draw" ? (
                <SignaturePad onChange={setDrawn} />
              ) : (
                <div>
                  <label
                    htmlFor="sig-upload"
                    className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-forest/30 bg-white p-6 text-center transition-colors hover:border-forest/50 sm:min-h-48"
                  >
                    {uploaded ? (
                      <img
                        src={uploaded}
                        alt="Your uploaded signature"
                        className="max-h-36 rounded-lg bg-white object-contain p-2"
                      />
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-forest/50" />
                        <p className="text-sm font-semibold text-forest">
                          Tap to upload a photo of your signature
                        </p>
                        <p className="text-xs text-forest/50">
                          Sign on white paper, photograph it, upload here — it merges into the document
                        </p>
                      </>
                    )}
                    <input
                      id="sig-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUpload}
                    />
                  </label>
                  {uploaded && (
                    <div className="mt-2 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setUploaded(null)}
                        className="border-forest/20 text-forest"
                      >
                        <Eraser className="h-3.5 w-3.5" /> Remove
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-5 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="signer-name" className="text-forest">
                  Type your full name (as the signature confirmation) *
                </Label>
                <Input
                  id="signer-name"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder={agreement.customerName}
                  className="max-w-md border-forest/20 bg-white"
                  maxLength={80}
                />
              </div>

              <label className="flex max-w-xl cursor-pointer items-start gap-2.5 rounded-xl border border-forest/15 bg-white p-3.5">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#14532D]"
                />
                <span className="text-[13px] leading-relaxed text-forest/80">
                  I have <strong>read and accept all clauses</strong> of this rental agreement,
                  including the charges, fuel policy, damage liability and the Guwahati (Assam)
                  jurisdiction. I understand my electronic signature is legally valid under the
                  Information Technology Act, 2000.
                </span>
              </label>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  onClick={submit}
                  disabled={submitting}
                  className="btn-sheen h-12 rounded-full bg-forest px-6 text-sm font-bold text-cream shadow-lg hover:bg-forest/90"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Recording your signature…
                    </>
                  ) : (
                    <>
                      <FileSignature className="h-4 w-4" /> Sign &amp; submit agreement
                    </>
                  )}
                </Button>
                <p className="flex items-center gap-1.5 text-xs text-forest/50">
                  <Lock className="h-3.5 w-3.5" /> This link works only once and closes automatically
                  after signing.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-forest/40">
          Roam Saathi · Tourist vehicle rental beside LGBI Airport, Borjhar, Guwahati · Agreements
          executed under Indian law, jurisdiction: Guwahati, Assam
        </p>
      </div>
    </main>
  );
}
