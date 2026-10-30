"use client";

// Booking modal — the WhatsApp-first booking flow with the v3 fuel & toll
// layer: mode-aware policy notices, a destination-based fuel estimator for
// self-drive bookings, and a mandatory policy acknowledgement.

import * as React from "react";
import {
  Fuel,
  ShieldCheck,
  CalendarDays,
  MapPin,
  User,
  Phone,
  Car,
  Info,
  Plane,
  Hotel,
  MapPinned,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getContact, getFuelPolicy } from "@/lib/contact";
import { inr, type SettingsMap, type VehicleDTO } from "@/lib/siteConfig";
import { cn } from "@/lib/utils";

export type BookingSeed = {
  vehicle?: VehicleDTO | null;
  mode?: "driver" | "self";
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings?: SettingsMap;
  vehicles: VehicleDTO[];
  seed?: BookingSeed | null;
};

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function nights(pickup: string, ret: string): number {
  const p = new Date(pickup).getTime();
  const r = new Date(ret).getTime();
  if (isNaN(p) || isNaN(r) || r <= p) return 1;
  return Math.max(1, Math.ceil((r - p) / 86_400_000));
}

/** Indicative litres + cost for a round trip. */
function estimateFuel(
  destKm: number | null,
  kmpl: number,
  pricePerLitre: number
): { roundTripKm: number; litres: number; cost: number } | null {
  if (destKm == null) return null;
  const roundTripKm = destKm * 2;
  const litres = Math.ceil(roundTripKm / kmpl);
  const cost = Math.round(litres * pricePerLitre);
  return { roundTripKm, litres, cost };
}

export function BookingModal({ open, onOpenChange, settings, vehicles, seed }: Props) {
  const contact = getContact(settings);
  const policy = getFuelPolicy(settings);
  const bookable = React.useMemo(
    () => vehicles.filter((v) => v.available),
    [vehicles]
  );

  const [vehicleId, setVehicleId] = React.useState<string>("");
  const [mode, setMode] = React.useState<"driver" | "self">("driver");
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [pickupType, setPickupType] = React.useState("Airport counter");
  const [pickupLocation, setPickupLocation] = React.useState("");
  const [pickupDate, setPickupDate] = React.useState(todayPlus(1));
  const [returnDate, setReturnDate] = React.useState(todayPlus(3));
  const [destination, setDestination] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [ack, setAck] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  // Apply seed when opened
  React.useEffect(() => {
    if (!open) return;
    setAck(false);
    if (seed?.vehicle) {
      setVehicleId(seed.vehicle.id);
      setMode(seed.mode ?? (seed.vehicle.withDriverAvailable ? "driver" : "self"));
    } else if (seed?.mode) {
      setMode(seed.mode);
    }
     
  }, [open, seed?.vehicle?.id, seed?.mode]);

  const vehicle = bookable.find((v) => v.id === vehicleId) ?? null;

  // Live quote
  const n = nights(pickupDate, returnDate);
  const rate =
    mode === "driver"
      ? (vehicle?.withDriverPerDay ?? vehicle?.dailyRate ?? 0)
      : (vehicle?.dailyRate ?? 0);
  const estimatedTotal = vehicle ? rate * n : 0;

  // Fuel estimate (self-drive only) — trivial math, no memoization needed
  const destKm = policy.destinations.find((d) => d.name === destination)?.km ?? null;
  const kmpl = vehicle?.mileageKmpl ?? 15;
  const fuel = estimateFuel(destKm, kmpl, policy.fuelPricePerLitre);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !vehicle) {
      toast.error("Please fill your name, phone and pick a vehicle.");
      return;
    }
    if (!ack) {
      toast.error("Please accept the fuel, toll & deposit policy to continue.");
      return;
    }

    const fuelNoteLine =
      mode === "self" && fuel
        ? `Est. fuel for ${destination}: ~${fuel.litres} L ≈ ${inr(fuel.cost)} (round trip, indicative only)`
        : mode === "driver"
          ? "Fuel, toll & parking included in the fare (with driver)"
          : "Self-drive: fuel & toll to be paid at actuals";

    const waText = [
      `*${"Roam Saathi"} — Booking Request*`,
      `Vehicle: ${vehicle.name} (${vehicle.class})`,
      `Mode: ${mode === "driver" ? "With driver — fuel & toll included" : "Self drive — fuel & toll at actuals"}`,
      `Pickup: ${pickupType}${pickupLocation ? ` — ${pickupLocation}` : ""}`,
      `Dates: ${pickupDate} to ${returnDate} (${n} day${n > 1 ? "s" : ""})`,
      destination ? `Destination: ${destination}` : null,
      vehicle ? `Est. rent: ${inr(estimatedTotal)}` : null,
      fuelNoteLine,
      `Name: ${name}`,
      `Phone: ${phone}`,
      message ? `Notes: ${message}` : null,
      `(Sent from the website — guest accepted the fuel/toll/deposit policy)`,
    ]
      .filter(Boolean)
      .join("\n");

    setSending(true);

    // Save to the database (so the enquiry appears in the admin portal)…
    let saved = false;
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          pickupType,
          pickupLocation,
          pickupDate,
          returnDate,
          vehicleClass: vehicle.class,
          vehicleName: vehicle.name,
          destination: destination || message?.slice(0, 120) || undefined,
          withDriver: mode === "driver",
          estimatedTotal,
          message: [message, fuelNoteLine].filter(Boolean).join(" | "),
        }),
      });
      saved = res.ok;
    } catch {
      saved = false;
    }

    // …then open WhatsApp either way — the customer never gets stuck.
    window.open(buildWhatsAppUrl(waText, contact.whatsapp), "_blank", "noopener");
    if (saved) {
      toast.success("Request saved! Opening WhatsApp to confirm with the owner…");
    } else {
      toast.info("Opening WhatsApp — we could not save the form but your message is ready.");
    }
    setSending(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rs-scroll">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-forest">
            Book your ride
          </DialogTitle>
          <DialogDescription>
            Fill this in — we confirm on WhatsApp within minutes, 24×7.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {/* Vehicle */}
          <div className="space-y-1.5">
            <Label htmlFor="bk-vehicle" className="flex items-center gap-1.5 text-sm">
              <Car className="h-3.5 w-3.5 text-saffron" /> Vehicle
            </Label>
            <Select value={vehicleId} onValueChange={setVehicleId} required>
              <SelectTrigger id="bk-vehicle" aria-label="Choose vehicle">
                <SelectValue placeholder="Choose a vehicle…" />
              </SelectTrigger>
              <SelectContent className="max-h-72 rs-scroll">
                {bookable.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name} — {inr(v.dailyRate)}/day self-drive
                    {v.withDriverAvailable && v.withDriverPerDay
                      ? ` · ${inr(v.withDriverPerDay)}/day with driver`
                      : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mode + policy notice */}
          <div className="space-y-2">
            <Label className="text-sm">Booking mode</Label>
            <RadioGroup
              value={mode}
              onValueChange={(v) => setMode(v as "driver" | "self")}
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            >
              <Label
                htmlFor="mode-driver"
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all",
                  mode === "driver"
                    ? "border-forest bg-forest/5 ring-2 ring-forest/30"
                    : "border-[#e6ddc8] hover:border-forest/40"
                )}
              >
                <RadioGroupItem id="mode-driver" value="driver" className="mt-0.5" />
                <span className="text-sm">
                  <span className="block font-bold text-forest">With driver</span>
                  <span className="block text-xs text-muted-foreground">
                    Fuel, toll &amp; parking included in the fare
                  </span>
                </span>
              </Label>
              <Label
                htmlFor="mode-self"
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all",
                  mode === "self"
                    ? "border-saffron bg-saffron/10 ring-2 ring-saffron/40"
                    : "border-[#e6ddc8] hover:border-saffron/40"
                )}
              >
                <RadioGroupItem id="mode-self" value="self" className="mt-0.5" />
                <span className="text-sm">
                  <span className="block font-bold text-saffron-deep">Self drive</span>
                  <span className="block text-xs text-muted-foreground">
                    Fuel, toll &amp; permits paid by you at actuals
                  </span>
                </span>
              </Label>
            </RadioGroup>

            {/* Mode-specific policy callout */}
            <div
              className={cn(
                "flex items-start gap-2.5 rounded-xl border p-3 text-[13px] leading-relaxed",
                mode === "driver"
                  ? "border-forest/25 bg-forest/5 text-forest/90"
                  : "border-saffron/50 bg-saffron/10 text-ink/90"
              )}
              role="note"
            >
              {mode === "driver" ? (
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-forest" />
              ) : (
                <Fuel className="mt-0.5 h-4 w-4 flex-none text-saffron-deep" />
              )}
              <p>{mode === "driver" ? policy.withDriver : policy.selfDrive}</p>
            </div>
          </div>

          {/* Fuel estimator (self-drive only) */}
          {mode === "self" && (
            <div className="rounded-xl border border-dashed border-saffron/60 bg-saffron/5 p-3">
              <div className="flex items-center gap-2 text-sm font-bold text-saffron-deep">
                <Fuel className="h-4 w-4" /> Fuel estimate for your route
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                <Select value={destination || "none"} onValueChange={(v) => setDestination(v === "none" ? "" : v)}>
                  <SelectTrigger aria-label="Choose destination">
                    <SelectValue placeholder="Where are you headed?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Not sure yet —</SelectItem>
                    {policy.destinations.map((d) => (
                      <SelectItem key={d.name} value={d.name}>
                        {d.name} ({d.km} km one-way)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fuel && (
                  <div className="rounded-lg bg-white px-3 py-2 text-center shadow-sm">
                    <p className="text-lg font-extrabold leading-none text-forest">
                      ≈ {fuel.litres} L
                    </p>
                    <p className="text-[11px] text-muted-foreground">≈ {inr(fuel.cost)} of fuel</p>
                  </div>
                )}
              </div>
              <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground">
                <Info className="mt-0.5 h-3 w-3 flex-none" />
                {fuel
                  ? `${fuel.roundTripKm} km round trip ÷ ~${kmpl} km/l at ${inr(policy.fuelPricePerLitre)}/L. Indicative only — hills, traffic, AC and driving style change the real number. Toll & parking extra.`
                  : "Pick a destination to estimate litres & cost for your round trip. Toll and parking are always extra."}
              </p>
            </div>
          )}

          {/* Contact + dates */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="bk-name" className="flex items-center gap-1.5 text-sm">
                <User className="h-3.5 w-3.5 text-saffron" /> Your name *
              </Label>
              <Input id="bk-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bk-phone" className="flex items-center gap-1.5 text-sm">
                <Phone className="h-3.5 w-3.5 text-saffron" /> Phone / WhatsApp *
              </Label>
              <Input
                id="bk-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+91 …"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bk-pickup-date" className="flex items-center gap-1.5 text-sm">
                <CalendarDays className="h-3.5 w-3.5 text-saffron" /> Pickup date
              </Label>
              <Input
                id="bk-pickup-date"
                type="date"
                value={pickupDate}
                min={todayPlus(0)}
                onChange={(e) => setPickupDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bk-return-date">Return date</Label>
              <Input
                id="bk-return-date"
                type="date"
                value={returnDate}
                min={pickupDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bk-pickup-type" className="flex items-center gap-1.5 text-sm">
                {pickupType === "Hotel delivery" ? (
                  <Hotel className="h-3.5 w-3.5 text-saffron" />
                ) : (
                  <Plane className="h-3.5 w-3.5 text-saffron" />
                )}
                Pickup type
              </Label>
              <Select value={pickupType} onValueChange={setPickupType}>
                <SelectTrigger id="bk-pickup-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Airport counter">Airport counter (free)</SelectItem>
                  <SelectItem value="Hotel delivery">Hotel delivery in Guwahati</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bk-pickup-loc" className="flex items-center gap-1.5 text-sm">
                <MapPin className="h-3.5 w-3.5 text-saffron" />
                {pickupType === "Hotel delivery" ? "Hotel name / area" : "Flight no. / notes (optional)"}
              </Label>
              <Input
                id="bk-pickup-loc"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder={pickupType === "Hotel delivery" ? "e.g. Hotel Brahmaputra, Maligaon" : "e.g. IndiGo 6E-264, lands 11:30"}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bk-msg" className="flex items-center gap-1.5 text-sm">
              <MapPinned className="h-3.5 w-3.5 text-saffron" /> Trip plan / anything else?
            </Label>
            <Textarea
              id="bk-msg"
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. 2 adults + 2 kids, Shillong & Cherrapunji, need roof carrier…"
            />
          </div>

          {/* Live quote */}
          {vehicle && (
            <div className="flex items-center justify-between rounded-xl bg-forest px-4 py-3 text-cream">
              <div className="text-sm">
                <p className="font-bold">{vehicle.name}</p>
                <p className="text-xs text-cream/70">
                  {n} day{n > 1 ? "s" : ""} × {inr(rate)} {mode === "driver" ? "(with driver)" : "(self-drive)"}
                </p>
              </div>
              <p className="font-display text-2xl font-bold">{inr(estimatedTotal)}</p>
            </div>
          )}

          {/* Disclaimer + ack */}
          <div className="rounded-xl border border-[#e6ddc8] bg-muted/60 p-3">
            <p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-ink/80">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-forest" />
              <span>
                <b>Before you book — fuel, toll &amp; deposits:</b> {policy.disclaimer}{" "}
                <a href="/p/rules-and-policies" target="_blank" className="font-semibold text-forest underline underline-offset-2">
                  Read the full policy
                </a>
                .
              </span>
            </p>
            <label className="mt-2.5 flex cursor-pointer items-start gap-2.5 text-sm font-medium text-ink">
              <Checkbox checked={ack} onCheckedChange={(v) => setAck(v === true)} className="mt-0.5" />
              <span>I understand the fuel, toll &amp; deposit policy for my booking mode.</span>
            </label>
          </div>

          <Button
            type="submit"
            disabled={sending || !vehicle || !ack}
            className="btn-sheen h-12 w-full rounded-full bg-saffron text-base font-extrabold text-saffron-foreground shadow-lg hover:brightness-105"
          >
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {sending ? "Opening WhatsApp…" : "Send booking on WhatsApp"}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            No advance payment on the website. We confirm availability on WhatsApp first.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default BookingModal;
