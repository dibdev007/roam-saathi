"use client";

// Settings tab — business contact details that feed the LIVE site.
// Saved values are stored in the database and override siteConfig defaults.

import * as React from "react";
import { Save, RefreshCw, Eye, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { BUSINESS_NAME } from "@/lib/siteConfig";
import { getContact } from "@/components/site/CustomerView";

type Props = {
  settings: Record<string, string>;
  onSaved: (s: Record<string, string>) => void;
};

const FIELDS: {
  key: string;
  label: string;
  placeholder: string;
  hint?: string;
  type?: string;
}[] = [
  {
    key: "businessPhone",
    label: "Business phone (with country code)",
    placeholder: "+919876543210",
    hint: "Shown on the site's Call buttons. Replace the placeholder with your real number!",
  },
  {
    key: "whatsappNumber",
    label: "WhatsApp number (digits only)",
    placeholder: "919876543210",
    hint: "All Book on WhatsApp buttons open chats with this number.",
  },
  {
    key: "email",
    label: "Email",
    placeholder: "saathiroam@gmail.com",
  },
  {
    key: "hours",
    label: "Business hours",
    placeholder: "Open 24/7 · Airport pickup anytime",
  },
  {
    key: "address",
    label: "Pickup address",
    placeholder: "Near LGBI Airport, Borjhar, Guwahati, Assam 781015",
  },
  {
    key: "adminPasscode",
    label: "Admin portal passcode",
    placeholder: "roam2024",
    hint: "You'll use this to open the Admin portal next time.",
  },
];

export function SettingsTab({ settings, onSaved }: Props) {
  const [form, setForm] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setForm({ ...settings });
  }, [settings]);

  async function save() {
    setSaving(true);
    try {
      const updates: Record<string, string> = {};
      for (const f of FIELDS) {
        if (form[f.key] != null && form[f.key] !== (settings[f.key] ?? "")) {
          updates[f.key] = form[f.key].trim();
        }
      }
      if (Object.keys(updates).length === 0) {
        toast.info("Nothing changed yet.");
        return;
      }
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error ?? "Save failed");
      }
      const j = await res.json();
      onSaved(j.settings);
      toast.success("Settings saved — the live site is updated!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save settings");
    } finally {
      setSaving(false);
    }
  }

  const contact = getContact({ ...settings, ...form });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-forest">Business settings</h2>
        <p className="text-sm text-muted-foreground">
          These details feed the customer site directly — no redeploys needed.
        </p>
      </div>

      <Card className="border-[#e6ddc8]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-forest">Contact & operations</CardTitle>
          <CardDescription>
            Update your phone number here once your SIM is active — every button on the website
            switches to it instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
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
            <Button
              onClick={save}
              disabled={saving}
              className="bg-forest text-cream hover:bg-forest/90"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving…" : "Save settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

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
          Tip: the passcode gate is a soft lock for {BUSINESS_NAME}&apos;s launch phase. When you
          deploy publicly, keep the passcode private and change it here — or ask the assistant to
          add proper staff accounts with NextAuth later.
        </p>
      </div>
    </div>
  );
}

export default SettingsTab;
