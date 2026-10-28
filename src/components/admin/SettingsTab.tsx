"use client";

// Settings tab v3 — every lever that shapes the live site:
//  contact & phone (applies everywhere instantly), announcement bar,
//  Google Maps embed (paste-and-go), fuel & toll policy texts, destinations
//  for the fuel estimator, socials, and the admin password change (fixed).

import * as React from "react";
import {
  Save,
  RefreshCw,
  Eye,
  Info,
  Map as MapIcon,
  Fuel,
  Megaphone,
  KeyRound,
  Plus,
  Trash2,
  Share2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import { BUSINESS_NAME } from "@/lib/siteConfig";
import { getContact } from "@/lib/contact";

type Props = {
  settings: Record<string, string>;
  onSaved: (s: Record<string, string>) => void;
};

type Destination = { name: string; km: number };

const CONTACT_FIELDS: {
  key: string;
  label: string;
  placeholder: string;
  hint?: string;
}[] = [
  {
    key: "businessPhone",
    label: "Business phone (with country code)",
    placeholder: "+919876543210",
    hint: "Every Call button on the site uses this. Replace the placeholder with your real number!",
  },
  {
    key: "whatsappNumber",
    label: "WhatsApp number (digits only)",
    placeholder: "919876543210",
    hint: "All Book on WhatsApp buttons open chats with this number.",
  },
  { key: "email", label: "Email", placeholder: "saathiroam@gmail.com" },
  { key: "hours", label: "Business hours", placeholder: "Open 24/7 · Airport pickup anytime" },
  {
    key: "address",
    label: "Pickup address",
    placeholder: "Near LGBI Airport, Borjhar, Guwahati, Assam 781015",
  },
];

function parseDestinations(raw: string | undefined): Destination[] {
  try {
    const arr = JSON.parse(raw || "[]");
    if (Array.isArray(arr)) {
      return arr
        .filter((d) => d && typeof d.name === "string")
        .map((d) => ({ name: String(d.name), km: Number(d.km) || 0 }));
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function SettingsTab({ settings, onSaved }: Props) {
  const [form, setForm] = React.useState<Record<string, string>>({});
  const [destinations, setDestinations] = React.useState<Destination[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [savingFuel, setSavingFuel] = React.useState(false);
  const [savingMap, setSavingMap] = React.useState(false);
  const [savingAnn, setSavingAnn] = React.useState(false);

  // Password change
  const [pwCurrent, setPwCurrent] = React.useState("");
  const [pwNew, setPwNew] = React.useState("");
  const [pwConfirm, setPwConfirm] = React.useState("");
  const [pwBusy, setPwBusy] = React.useState(false);

  const [mapPreview, setMapPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    setForm({ ...settings });
    setDestinations(parseDestinations(settings.destinationsJson));
    setMapPreview(settings.mapEmbedUrl || null);
  }, [settings]);

  async function putUpdates(updates: Record<string, string>, okMsg: string) {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
    const j = await res.json().catch(() => null);
    if (!res.ok) throw new Error(j?.error ?? "Save failed");
    onSaved(j.settings);
    toast.success(okMsg);
  }

  /* ---------------- contact ---------------- */
  async function saveContact() {
    setSaving(true);
    try {
      const updates: Record<string, string> = {};
      for (const f of CONTACT_FIELDS) {
        if (form[f.key] != null && form[f.key] !== (settings[f.key] ?? "")) {
          updates[f.key] = form[f.key].trim();
        }
      }
      if (Object.keys(updates).length === 0) {
        toast.info("Nothing changed yet.");
        return;
      }
      await putUpdates(updates, "Contact saved — the whole site switched to it!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  /* ---------------- announcement ---------------- */
  async function saveAnnouncement() {
    setSavingAnn(true);
    try {
      await putUpdates(
        {
          announcement: (form.announcement ?? "").trim().slice(0, 200),
          announcementEnabled: form.announcementEnabled === "true" ? "true" : "false",
        },
        "Announcement bar updated."
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSavingAnn(false);
    }
  }

  /* ---------------- map embed ---------------- */
  async function saveMap() {
    setSavingMap(true);
    try {
      await putUpdates(
        { mapEmbedUrl: (form.mapEmbedUrl ?? "").trim() },
        "Map updated — the contact section now shows your map."
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save map");
    } finally {
      setSavingMap(false);
    }
  }

  /* ---------------- fuel policy + destinations ---------------- */
  async function saveFuel() {
    setSavingFuel(true);
    try {
      const cleaned = destinations
        .filter((d) => d.name.trim() && d.km > 0)
        .map((d) => ({ name: d.name.trim(), km: Math.round(d.km) }));
      await putUpdates(
        {
          fuelPricePerLitre: String(Number(form.fuelPricePerLitre ?? 100) || 100),
          policyFuelWithDriver: (form.policyFuelWithDriver ?? "").trim(),
          policyFuelSelfDrive: (form.policyFuelSelfDrive ?? "").trim(),
          bookingDisclaimer: (form.bookingDisclaimer ?? "").trim(),
          destinationsJson: JSON.stringify(cleaned),
        },
        "Fuel policy & destinations saved — booking estimates updated."
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSavingFuel(false);
    }
  }

  /* ---------------- password ---------------- */
  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwNew !== pwConfirm) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    setPwBusy(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(j?.error ?? "Could not change password");
        return;
      }
      toast.success(j?.message ?? "Password changed.");
      setPwCurrent("");
      setPwNew("");
      setPwConfirm("");
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setPwBusy(false);
    }
  }

  const contact = getContact({ ...settings, ...form });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-forest">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Everything you save here feeds the customer website instantly — no redeploy needed.
        </p>
      </div>

      {/* ---------- Contact ---------- */}
      <Card className="border-[#e6ddc8]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-forest">Contact & operations</CardTitle>
          <CardDescription>
            Change your number here once the SIM is active — every call, WhatsApp and booking
            button across the whole website switches to it at once.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CONTACT_FIELDS.map((f) => (
            <div key={f.key} className={`space-y-1 ${f.key === "address" ? "sm:col-span-2" : ""}`}>
              <Label htmlFor={`s-${f.key}`}>{f.label}</Label>
              <Input
                id={`s-${f.key}`}
                placeholder={f.placeholder}
                value={form[f.key] ?? ""}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
              {f.hint && <p className="text-[11px] leading-tight text-muted-foreground">{f.hint}</p>}
            </div>
          ))}
          <div className="sm:col-span-2">
            <Button onClick={saveContact} disabled={saving} className="bg-forest text-cream hover:bg-forest/90">
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving…" : "Save contact details"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ---------- Announcement bar ---------- */}
      <Card className="border-[#e6ddc8]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-forest">
            <Megaphone className="h-4 w-4 text-saffron" /> Announcement bar
          </CardTitle>
          <CardDescription>A slim scrolling message above the website menu — great for offers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-[#e6ddc8] px-3 py-2">
            <Label htmlFor="ann-enabled" className="text-sm">Show the announcement bar</Label>
            <Switch
              id="ann-enabled"
              checked={form.announcementEnabled === "true"}
              onCheckedChange={(v) => setForm({ ...form, announcementEnabled: v ? "true" : "false" })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ann-text">Text</Label>
            <Input
              id="ann-text"
              placeholder="Monsoon Special — 10% off on 3+ day Meghalaya trips!"
              value={form.announcement ?? ""}
              onChange={(e) => setForm({ ...form, announcement: e.target.value })}
            />
          </div>
          <Button onClick={saveAnnouncement} disabled={savingAnn} className="bg-forest text-cream hover:bg-forest/90">
            {savingAnn ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save announcement
          </Button>
        </CardContent>
      </Card>

      {/* ---------- Google Maps embed ---------- */}
      <Card className="border-[#e6ddc8]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-forest">
            <MapIcon className="h-4 w-4 text-saffron" /> Location map (paste from Google Maps)
          </CardTitle>
          <CardDescription>
            On Google Maps search your spot → <b>Share</b> → <b>Embed a map</b> → copy the code and
            paste it below. A plain google.com/maps link works too. We extract the safe parts
            automatically — anything that is not Google Maps is rejected.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            rows={3}
            placeholder={'<iframe src="https://www.google.com/maps/embed?pb=..." …></iframe>'}
            value={form.mapEmbedUrl ?? ""}
            onChange={(e) => setForm({ ...form, mapEmbedUrl: e.target.value })}
          />
          <Button onClick={saveMap} disabled={savingMap} className="bg-forest text-cream hover:bg-forest/90">
            {savingMap ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save map
          </Button>
          {mapPreview && (
            <div className="overflow-hidden rounded-xl border border-[#e6ddc8]">
              <iframe
                title="Map preview"
                src={mapPreview}
                className="h-56 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---------- Fuel & toll policy ---------- */}
      <Card className="border-[#e6ddc8]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-forest">
            <Fuel className="h-4 w-4 text-saffron" /> Fuel, toll & destinations
          </CardTitle>
          <CardDescription>
            With-driver bookings include fuel &amp; toll in the fare; self-drive pays at actuals.
            These texts and the destination distances below power the price cards, the booking
            disclaimer and the fuel estimator.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="fuel-price">Petrol price (Rs / litre)</Label>
              <Input
                id="fuel-price"
                type="number"
                min="50"
                step="1"
                value={form.fuelPricePerLitre ?? "100"}
                onChange={(e) => setForm({ ...form, fuelPricePerLitre: e.target.value })}
              />
              <p className="text-[11px] text-muted-foreground">Used by the booking fuel estimator.</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="pol-wd">With-driver policy (shown in green)</Label>
              <Textarea
                id="pol-wd"
                rows={3}
                value={form.policyFuelWithDriver ?? ""}
                onChange={(e) => setForm({ ...form, policyFuelWithDriver: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pol-sd">Self-drive policy (shown in amber)</Label>
              <Textarea
                id="pol-sd"
                rows={3}
                value={form.policyFuelSelfDrive ?? ""}
                onChange={(e) => setForm({ ...form, policyFuelSelfDrive: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pol-disc">Booking disclaimer</Label>
              <Textarea
                id="pol-disc"
                rows={3}
                value={form.bookingDisclaimer ?? ""}
                onChange={(e) => setForm({ ...form, bookingDisclaimer: e.target.value })}
              />
              <p className="text-[11px] text-muted-foreground">
                Customers must accept this before a booking is sent.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Destinations for the fuel estimator (one-way km from Guwahati)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDestinations([...destinations, { name: "", km: 100 }])}
                className="border-forest/25 text-forest"
              >
                <Plus className="h-3.5 w-3.5" /> Add destination
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {destinations.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder="Destination (e.g. Shillong)"
                    value={d.name}
                    onChange={(e) => {
                      const next = [...destinations];
                      next[i] = { ...d, name: e.target.value };
                      setDestinations(next);
                    }}
                  />
                  <Input
                    type="number"
                    min="1"
                    className="w-24"
                    value={d.km}
                    onChange={(e) => {
                      const next = [...destinations];
                      next[i] = { ...d, km: Number(e.target.value) || 0 };
                      setDestinations(next);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${d.name || "destination"}`}
                    onClick={() => setDestinations(destinations.filter((_, j) => j !== i))}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Distances are one-way from Guwahati; the estimator doubles them for the round trip.
            </p>
          </div>

          <Button onClick={saveFuel} disabled={savingFuel} className="bg-forest text-cream hover:bg-forest/90">
            {savingFuel ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save fuel policy & destinations
          </Button>
        </CardContent>
      </Card>

      {/* ---------- Socials ---------- */}
      <Card className="border-[#e6ddc8]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-forest">
            <Share2 className="h-4 w-4 text-saffron" /> Social links
          </CardTitle>
          <CardDescription>Empty fields are simply not shown in the footer.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { key: "instagram", label: "Instagram URL" },
            { key: "facebook", label: "Facebook URL" },
            { key: "youtube", label: "YouTube URL" },
          ].map((f) => (
            <div key={f.key} className="space-y-1">
              <Label htmlFor={`soc-${f.key}`}>{f.label}</Label>
              <Input
                id={`soc-${f.key}`}
                placeholder="https://…"
                value={form[f.key] ?? ""}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <div className="sm:col-span-3">
            <Button
              onClick={async () => {
                try {
                  await putUpdates(
                    {
                      instagram: (form.instagram ?? "").trim(),
                      facebook: (form.facebook ?? "").trim(),
                      youtube: (form.youtube ?? "").trim(),
                    },
                    "Social links saved."
                  );
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Could not save");
                }
              }}
              className="bg-forest text-cream hover:bg-forest/90"
            >
              <Save className="h-4 w-4" /> Save social links
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ---------- Password ---------- */}
      <Card className="border-[#e6ddc8]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-forest">
            <KeyRound className="h-4 w-4 text-saffron" /> Admin password
          </CardTitle>
          <CardDescription>
            The v3 fix: your password now lives as a salted hash in the cloud database, so changing
            it works everywhere — including on Vercel. Minimum 6 characters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="pw-current">Current password</Label>
              <Input
                id="pw-current"
                type="password"
                value={pwCurrent}
                onChange={(e) => setPwCurrent(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pw-new">New password</Label>
              <Input
                id="pw-new"
                type="password"
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pw-confirm">Confirm new password</Label>
              <Input
                id="pw-confirm"
                type="password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="sm:col-span-3">
              <Button type="submit" disabled={pwBusy} className="bg-forest text-cream hover:bg-forest/90">
                <KeyRound className="h-4 w-4" /> {pwBusy ? "Changing…" : "Change password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ---------- Live preview ---------- */}
      <Card className="border-saffron/40 bg-saffron/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-forest">
            <Eye className="h-4 w-4 text-saffron" /> What visitors see right now
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-foreground/85">
          <p><span className="font-semibold">Call:</span> {contact.phoneDisplay}</p>
          <p><span className="font-semibold">WhatsApp:</span> +{contact.whatsapp}</p>
          <p><span className="font-semibold">Email:</span> {contact.email}</p>
          <p><span className="font-semibold">Hours:</span> {contact.hours}</p>
          <p><span className="font-semibold">Address:</span> {contact.address}</p>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 rounded-lg border border-forest/20 bg-forest/5 p-3 text-xs text-forest/80">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <p>
          Every field above is stored in your cloud database. If a value looks empty on the site,
          open {BUSINESS_NAME} → Settings and save it once — the site picks it up on the next visit.
        </p>
      </div>
    </div>
  );
}

export default SettingsTab;
