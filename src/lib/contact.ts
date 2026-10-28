import { resolveSetting, type SettingsMap } from "@/lib/siteConfig";

/**
 * Live contact resolver — DB settings (Admin → Settings) win over the static
 * siteConfig defaults, so the owner can edit contact info from the admin
 * panel and the whole site updates instantly. Shared by the customer site,
 * the admin settings preview and the CMS pages.
 */
export type SiteContact = {
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  email: string;
  hours: string;
  address: string;
};

export function getContact(settings?: SettingsMap): SiteContact {
  const phone = resolveSetting("businessPhone", settings);
  const raw = phone.replace(/\D/g, "");
  const phoneDisplay = /^\d{10}$/.test(raw)
    ? `+91 ${raw.slice(0, 5)} ${raw.slice(5)}`
    : phone;
  return {
    phone,
    phoneDisplay,
    whatsapp: resolveSetting("whatsappNumber", settings).replace(/\D/g, ""),
    email: resolveSetting("email", settings),
    hours: resolveSetting("hours", settings),
    address: resolveSetting("address", settings),
  };
}

/**
 * Resolve the fuel/toll policy trio from settings with safe defaults.
 */
export function getFuelPolicy(settings?: SettingsMap) {
  const s = settings ?? {};
  const num = (raw: string | undefined, fallback: number) => {
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };
  return {
    fuelPricePerLitre: num(s.fuelPricePerLitre, 100),
    withDriver:
      s.policyFuelWithDriver?.trim() ||
      "Fuel, toll, parking and driver charges are fully included in the quoted fare — nothing extra to pay on the way.",
    selfDrive:
      s.policyFuelSelfDrive?.trim() ||
      "Fuel, toll, parking, state permits and entry fees are NOT included — you pay at actuals. The vehicle comes with a full tank and should be returned full. Hill routes (Shillong, Cherrapunji, Tawang) climb a lot, so expect noticeably higher consumption than city driving.",
    disclaimer:
      s.bookingDisclaimer?.trim() ||
      "With driver: fuel, toll & parking included in the fare. Self-drive: fuel, toll, permits & parking paid by you at actuals — hill and remote routes consume more fuel. Estimates shown are indicative only.",
    destinations: parseDestinations(s.destinationsJson),
  };
}

function parseDestinations(raw: string | undefined): { name: string; km: number }[] {
  try {
    const arr = JSON.parse(raw || "[]");
    if (Array.isArray(arr)) {
      const out = arr
        .filter((d) => d && typeof d.name === "string" && Number(d.km) > 0)
        .map((d) => ({ name: String(d.name), km: Number(d.km) }));
      if (out.length > 0) return out;
    }
  } catch {
    /* ignore */
  }
  return [
    { name: "Guwahati city", km: 25 },
    { name: "Shillong", km: 100 },
    { name: "Cherrapunji (Sohra)", km: 150 },
    { name: "Kaziranga National Park", km: 200 },
    { name: "Majuli", km: 350 },
    { name: "Dirang", km: 380 },
    { name: "Tawang", km: 450 },
  ];
}

/** Resolve the admin map embed with a sensible default. */
export function getMapEmbed(settings?: SettingsMap): string {
  return (
    settings?.mapEmbedUrl?.trim() ||
    "https://www.google.com/maps?q=Lokpriya+Gopinath+Bordoloi+International+Airport,+Borjhar,+Guwahati,+Assam&output=embed"
  );
}
