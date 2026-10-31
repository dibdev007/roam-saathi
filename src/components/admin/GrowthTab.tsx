"use client";

// Growth & SEO tab (v4) — the owner's zero-code marketing cockpit.
//
// SEO panel   : site URL, meta title/description/keywords, OG image and
//               Search Console verification — applied to the whole site on
//               save, plus a live checklist that scores the current setup.
// Marketing   : paste a GA4 ID, GTM container, Meta Pixel or ANY tracking
//               snippet — injected site-wide with zero code changes.

import * as React from "react";
import {
  Save,
  RefreshCw,
  Search,
  BarChart3,
  CheckCircle2,
  XCircle,
  Code2,
  Info,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { DEFAULT_SEO_TITLE, DEFAULT_SEO_DESCRIPTION } from "@/lib/seo";

type Props = {
  settings: Record<string, string>;
  onSaved: (s: Record<string, string>) => void;
};

const SEO_FIELDS: { key: string; label: string; placeholder: string; hint?: string; area?: boolean }[] = [
  {
    key: "seoSiteUrl",
    label: "Your live site URL",
    placeholder: "https://roamsaathi.vercel.app  or  https://roamsaathi.in",
    hint: "Used for canonical links, Open Graph tags, the sitemap and robots.txt. Change it here once your domain is live.",
  },
  {
    key: "seoMetaTitle",
    label: "Homepage meta title (50–60 characters is ideal)",
    placeholder: DEFAULT_SEO_TITLE,
    hint: "The big blue link on Google. Include your main keyword: car rental Guwahati.",
  },
  {
    key: "seoMetaDescription",
    label: "Homepage meta description (120–160 characters)",
    placeholder: DEFAULT_SEO_DESCRIPTION,
    hint: "The two-line pitch under your Google link. Sell the click: airport pickup, self-drive, Northeast.",
  },
  {
    key: "seoMetaKeywords",
    label: "Focus keywords (comma separated)",
    placeholder: "car rental Guwahati, self drive car Guwahati, Shillong taxi, Tawang cab",
  },
  {
    key: "seoOgImage",
    label: "Social share image (URL or /path)",
    placeholder: "/hero.png",
    hint: "Shown when someone shares your site on WhatsApp, Facebook or X. 1200×630px works best.",
  },
  {
    key: "seoVerification",
    label: "Google Search Console verification code (optional)",
    placeholder: "Paste the google-site-verification value",
    hint: "Search Console → verify by HTML tag → copy only the long code string.",
  },
  {
    key: "socialFacebookUrl",
    label: "Facebook page URL (once you create it)",
    placeholder: "https://facebook.com/roamsaathi",
    hint: "Links your Facebook page to the site's structured data — Google uses it to connect your business profiles.",
  },
  {
    key: "socialInstagramUrl",
    label: "Instagram profile URL (once you create it)",
    placeholder: "https://instagram.com/roamsaathi",
    hint: "Same as above: pasted here, your Instagram becomes part of your Google business entity.",
  },
];

function Check({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      {ok ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-600" />
      ) : (
        <XCircle className="mt-0.5 h-4 w-4 flex-none text-amber-600" />
      )}
      <span className={ok ? "text-ink/80" : "text-ink/70"}>{children}</span>
    </li>
  );
}

export function GrowthTab({ settings, onSaved }: Props) {
  const [form, setForm] = React.useState<Record<string, string>>({});
  const [savingSeo, setSavingSeo] = React.useState(false);
  const [savingMkt, setSavingMkt] = React.useState(false);

  React.useEffect(() => {
    setForm({ ...settings });
  }, [settings]);

  async function save(fields: string[], okMsg: string) {
    const updates: Record<string, string> = {};
    for (const k of fields) {
      if (form[k] != null && form[k] !== (settings[k] ?? "")) {
        updates[k] = form[k].trim();
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
    const j = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(j?.error ?? "Save failed");
      return;
    }
    onSaved(j.settings);
    toast.success(okMsg);
  }

  /* ---------------- SEO live checklist ---------------- */
  const title = (form.seoMetaTitle ?? "").trim();
  const desc = (form.seoMetaDescription ?? "").trim();
  const siteUrl = (form.seoSiteUrl ?? "").trim();
  const ogImage = (form.seoOgImage ?? "").trim();
  const gaConnected = Boolean(
    (form.ga4Id ?? "").trim() || (form.gtmId ?? "").trim() || (form.metaPixelId ?? "").trim()
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-forest">
          <Sparkles className="h-5 w-5 text-saffron" /> Growth &amp; SEO
        </h2>
        <p className="text-sm text-muted-foreground">
          Be found on Google and measure every visitor — all from this page, zero code.
        </p>
      </div>

      {/* ---------------- SEO settings ---------------- */}
      <Card className="border-[#e6ddc8]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-forest">
            <Search className="h-4 w-4 text-saffron" /> Search engine appearance
          </CardTitle>
          <CardDescription>
            These settings drive the title, description, share previews, sitemap and
            canonical tags for the entire website — including every page you create in
            the Website Pages builder.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {SEO_FIELDS.map((f) => (
              <div key={f.key} className="space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                  <Label htmlFor={`seo-${f.key}`}>{f.label}</Label>
                  {(f.key === "seoMetaTitle" || f.key === "seoMetaDescription") && (
                    <span
                      className={`text-[11px] font-semibold ${
                        f.key === "seoMetaTitle"
                          ? title.length >= 30 && title.length <= 60
                            ? "text-emerald-600"
                            : "text-amber-600"
                          : desc.length >= 120 && desc.length <= 160
                            ? "text-emerald-600"
                            : "text-amber-600"
                      }`}
                    >
                      {f.key === "seoMetaTitle" ? title.length : desc.length} chars
                    </span>
                  )}
                </div>
                {f.area ? (
                  <Textarea
                    id={`seo-${f.key}`}
                    rows={2}
                    placeholder={f.placeholder}
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                ) : (
                  <Input
                    id={`seo-${f.key}`}
                    placeholder={f.placeholder}
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                )}
                {f.hint && <p className="text-[11px] leading-tight text-muted-foreground">{f.hint}</p>}
              </div>
            ))}
          </div>
          <Button
            onClick={async () => {
              setSavingSeo(true);
              try {
                await save(SEO_FIELDS.map((f) => f.key), "SEO saved — Google sees it on the next crawl.");
              } finally {
                setSavingSeo(false);
              }
            }}
            disabled={savingSeo}
            className="bg-forest text-cream hover:bg-forest/90"
          >
            {savingSeo ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save SEO settings
          </Button>

          {/* Google result preview */}
          <div className="rounded-xl border border-[#e6ddc8] bg-white p-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              How your homepage can appear on Google
            </p>
            <p className="text-[15px] font-medium text-[#1a0dab]">
              {(title || DEFAULT_SEO_TITLE).slice(0, 60)}
              {(title || DEFAULT_SEO_TITLE).length > 60 ? "…" : ""} | Roam Saathi
            </p>
            <p className="text-[13px] text-[#006621]">
              {siteUrl ? siteUrl.replace(/^https?:\/\//, "") : "your-site-url.vercel.app"} › car-rental
            </p>
            <p className="mt-1 text-[13px] leading-snug text-[#4d5156]">
              {(desc || DEFAULT_SEO_DESCRIPTION).slice(0, 165)}
              {(desc || DEFAULT_SEO_DESCRIPTION).length > 165 ? "…" : ""}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ---------------- SEO checklist ---------------- */}
      <Card className="border-forest/25 bg-forest/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-forest">SEO health checklist</CardTitle>
          <CardDescription>Live score of your current setup — fix the amber items.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Check ok={title.length >= 30 && title.length <= 60}>
              Meta title is 30–60 characters <b>({title.length})</b>
            </Check>
            <Check ok={desc.length >= 120 && desc.length <= 160}>
              Meta description is 120–160 characters <b>({desc.length})</b>
            </Check>
            <Check ok={Boolean(siteUrl)}>
              Live site URL saved (canonical + sitemap work correctly)
            </Check>
            <Check ok={Boolean(ogImage)}>
              Social share image set
            </Check>
            <Check ok={gaConnected}>
              Analytics or pixel connected (visitor tracking works)
            </Check>
            <Check ok={Boolean((settings.announcementEnabled === "true"))}>
              Bonus: announcement bar can carry offers Google picks up fast
            </Check>
          </ul>
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-white/70 p-3 text-xs text-ink/75">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-forest" />
            <p>
              After your site is live: open <b>Google Search Console</b> → add your domain →
              paste the verification code above → then submit{" "}
              <code className="rounded bg-cream px-1 font-mono">your-site-url/sitemap.xml</code>{" "}
              under Sitemaps. New pages you publish also enter the sitemap automatically.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ---------------- Marketing integrations ---------------- */}
      <Card className="border-[#e6ddc8]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-forest">
            <BarChart3 className="h-4 w-4 text-saffron" /> Marketing tools — connect without code
          </CardTitle>
          <CardDescription>
            Paste an ID or a full snippet. It is injected on every page of the site
            automatically — no developer, no redeploy. Leave a field empty to disable it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="mkt-ga4">Google Analytics 4 ID</Label>
              <Input id="mkt-ga4" value={form.ga4Id ?? ""} onChange={(e) => setForm({ ...form, ga4Id: e.target.value })} placeholder="G-XXXXXXXXXX" />
              <p className="text-[11px] text-muted-foreground">analytics.google.com → Admin → Data streams → your web stream.</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="mkt-gtm">Google Tag Manager ID</Label>
              <Input id="mkt-gtm" value={form.gtmId ?? ""} onChange={(e) => setForm({ ...form, gtmId: e.target.value })} placeholder="GTM-XXXXXXX" />
              <p className="text-[11px] text-muted-foreground">For advanced tag setups — GA4, Ads, Clarity in one place.</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="mkt-pixel">Meta (Facebook) Pixel ID</Label>
              <Input id="mkt-pixel" value={form.metaPixelId ?? ""} onChange={(e) => setForm({ ...form, metaPixelId: e.target.value })} placeholder="123456789012345" />
              <p className="text-[11px] text-muted-foreground">Events Manager → Data sources → your pixel's 15-digit ID.</p>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="mkt-head" className="flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5 text-saffron" /> Custom tracking snippets (any tool)
            </Label>
            <Textarea
              id="mkt-head"
              rows={3}
              className="font-mono text-xs"
              value={form.customHeadScripts ?? ""}
              onChange={(e) => setForm({ ...form, customHeadScripts: e.target.value })}
              placeholder={'<script src="https://example.com/analytics.js" async></script>'}
            />
            <p className="text-[11px] text-muted-foreground">
              Paste whatever a tool gives you — only the &lt;script&gt; tags are used, for
              safety. Examples: Microsoft Clarity, Hotjar, WhatsApp chat widgets, ad conversion tags.
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="mkt-body">End-of-page scripts (rare — for tools that ask for it)</Label>
            <Textarea
              id="mkt-body"
              rows={2}
              className="font-mono text-xs"
              value={form.customBodyScripts ?? ""}
              onChange={(e) => setForm({ ...form, customBodyScripts: e.target.value })}
              placeholder="<script>…</script>"
            />
          </div>

          <Button
            onClick={async () => {
              setSavingMkt(true);
              try {
                await save(
                  ["ga4Id", "gtmId", "metaPixelId", "customHeadScripts", "customBodyScripts"],
                  "Marketing tools saved — tracking is live on every page."
                );
              } finally {
                setSavingMkt(false);
              }
            }}
            disabled={savingMkt}
            className="bg-forest text-cream hover:bg-forest/90"
          >
            {savingMkt ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save marketing tools
          </Button>

          <div className="flex items-start gap-2 rounded-lg border border-saffron/40 bg-saffron/5 p-3 text-xs text-ink/80">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-saffron-deep" />
            <p>
              <b>Why this matters:</b> once GA4 is connected you can see how many people visit,
              where they come from and which cars they view — then boost the posts that work.
              It usually takes about 30 minutes for data to appear after saving.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default GrowthTab;
