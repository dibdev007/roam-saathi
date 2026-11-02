"use client";

// Shared site chrome used by the homepage AND every published CMS page:
// announcement bar, glass navbar (with owner-managed menu pages), dark
// footer, floating WhatsApp button and the scroll-reveal wrapper.

import * as React from "react";
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Menu as MenuIcon,
  ChevronUp,
  ChevronRight,
  Instagram,
  Facebook,
  Youtube,
  Megaphone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RhinoLogo } from "@/components/brand/RhinoLogo";
import { cn } from "@/lib/utils";
import { buildTelUrl, buildWhatsAppUrl } from "@/lib/whatsapp";
import { getContact } from "@/lib/contact";
import { BUSINESS_NAME, type SettingsMap, type PageDTO } from "@/lib/siteConfig";

/* ------------------------------------------------------------------ */
/* Scroll reveal wrapper                                               */
/* ------------------------------------------------------------------ */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-visible");
            io.disconnect();
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -36px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", className)}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

const BASE_NAV = [
  { href: "/#fleet", label: "Fleet" },
  { href: "/#rates", label: "Rates" },
  { href: "/stays", label: "Stays" },
  { href: "/#routes", label: "Routes" },
  { href: "/#stories", label: "Stories" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader({
  settings,
  menuPages,
  onBook,
}: {
  settings?: SettingsMap;
  menuPages?: PageDTO[];
  onBook?: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const contact = getContact(settings);
  const waMsg = `Hello ${BUSINESS_NAME}! I'd like to enquire about a vehicle rental. Please share availability and quotes.`;
  const announcement = settings?.announcement?.trim();
  const showAnnouncement =
    settings?.announcementEnabled === "true" && Boolean(announcement);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const waBtn = (className?: string) => (
    <a
      href={buildWhatsAppUrl(waMsg, contact.whatsapp)}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "btn-sheen inline-flex h-10 items-center gap-2 rounded-full bg-saffron px-4 text-sm font-bold text-saffron-foreground shadow-md transition-all hover:shadow-lg hover:brightness-105",
        className
      )}
    >
      <MessageCircle className="h-4 w-4" />
      Book on WhatsApp
    </a>
  );

  return (
    <>
      {showAnnouncement && (
        <div className="relative z-50 bg-saffron-deep px-4 py-1.5 text-center text-[13px] font-semibold text-white">
          <span className="inline-flex items-center gap-2">
            <Megaphone className="h-3.5 w-3.5" />
            {announcement}
          </span>
        </div>
      )}
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          scrolled
            ? "glass border-b border-forest/10 shadow-[0_8px_30px_-12px_rgba(20,83,45,0.25)]"
            : "border-b border-transparent bg-cream"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/" aria-label={`${BUSINESS_NAME} — home`} className="flex items-center">
            <RhinoLogo withWordmark className="h-9 w-9 transition-transform duration-300 hover:scale-105" />
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
            {BASE_NAV.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="nav-link rounded-md px-3 py-2 text-sm font-semibold text-forest/80 transition-colors hover:text-forest"
              >
                {l.label}
              </a>
            ))}
            {/*
              Owner-created pages (Admin → Website Pages → "Show in menu").
              v6 fix: previously only the FIRST TWO menu pages were rendered
              here, so page #3+ never appeared in the navbar. Now the first
              three are links and the rest collapse into a "More" dropdown,
              so every menu page is always reachable.
            */}
            {(menuPages ?? []).slice(0, 3).map((p) => (
              <a
                key={p.id}
                href={`/p/${p.slug}`}
                className="nav-link rounded-md px-3 py-2 text-sm font-semibold text-forest/80 transition-colors hover:text-forest"
              >
                {p.title.length > 20 ? p.title.slice(0, 20) + "…" : p.title}
              </a>
            ))}
            {(menuPages?.length ?? 0) > 3 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="nav-link inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-forest/80 transition-colors hover:text-forest"
                    aria-label="More pages"
                  >
                    More
                    <ChevronUp className="h-3.5 w-3.5 rotate-180 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {(menuPages ?? []).slice(3).map((p) => (
                    <DropdownMenuItem key={p.id} asChild>
                      <a href={`/p/${p.slug}`} className="cursor-pointer">
                        {p.title}
                      </a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={buildTelUrl(contact.phone)}
              className="hidden h-10 w-10 items-center justify-center rounded-full text-forest transition-colors hover:bg-forest/5 sm:inline-flex"
              aria-label={`Call ${contact.phoneDisplay}`}
            >
              <Phone className="h-5 w-5" />
            </a>
            {onBook && (
              <Button
                onClick={onBook}
                className="btn-sheen hidden h-10 rounded-full bg-forest px-4 text-sm font-bold text-cream shadow-md hover:bg-forest/90 md:inline-flex"
              >
                Book a vehicle
              </Button>
            )}
            {waBtn("hidden sm:inline-flex")}

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-forest/20 text-forest lg:hidden"
                  aria-label="Open menu"
                >
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] overflow-y-auto bg-cream">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="mt-6 flex items-center gap-2">
                  <RhinoLogo withWordmark className="h-8 w-8" />
                </div>
                <nav aria-label="Mobile" className="mt-6 flex flex-col gap-1">
                  {BASE_NAV.map((l) => (
                    <SheetClose asChild key={l.href}>
                      <a
                        href={l.href}
                        className="flex items-center justify-between rounded-md px-3 py-3 text-base font-medium text-forest transition-colors hover:bg-forest/5"
                      >
                        {l.label}
                        <ChevronRight className="h-4 w-4 opacity-50" />
                      </a>
                    </SheetClose>
                  ))}
                  {(menuPages ?? []).map((p) => (
                    <SheetClose asChild key={p.id}>
                      <a
                        href={`/p/${p.slug}`}
                        className="flex items-center justify-between rounded-md px-3 py-3 text-base font-medium text-forest transition-colors hover:bg-forest/5"
                      >
                        {p.title}
                        <ChevronRight className="h-4 w-4 opacity-50" />
                      </a>
                    </SheetClose>
                  ))}
                </nav>
                <div className="mt-6 flex flex-col gap-2">
                  {onBook && (
                    <Button
                      onClick={() => {
                        setOpen(false);
                        onBook();
                      }}
                      className="bg-forest text-cream hover:bg-forest/90"
                    >
                      Book a vehicle
                    </Button>
                  )}
                  {waBtn()}
                  <SheetClose asChild>
                    <a href={buildTelUrl(contact.phone)}>
                      <Button variant="outline" className="w-full border-forest/20 text-forest">
                        <Phone className="h-4 w-4" /> Call {contact.phoneDisplay}
                      </Button>
                    </a>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */
export function SiteFooter({
  settings,
  menuPages,
}: {
  settings?: SettingsMap;
  menuPages?: PageDTO[];
}) {
  const contact = getContact(settings);
  const waMsg = `Hello ${BUSINESS_NAME}! I'd like to enquire about a vehicle rental.`;
  const socials = [
    { key: "instagram", label: "Instagram", icon: Instagram },
    { key: "facebook", label: "Facebook", icon: Facebook },
    { key: "youtube", label: "YouTube", icon: Youtube },
  ].filter((s) => (settings?.[s.key] ?? "").trim() !== "");

  return (
    <footer className="mt-auto grain relative overflow-hidden bg-forest-deep text-cream">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#16A34A]/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <RhinoLogo light withWordmark className="h-10 w-10" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/70">
              Tourist-only car rental beside LGBI Airport, Guwahati. Self-drive
              or chauffeur — covering every corner of Northeast India.
            </p>
            {socials.length > 0 && (
              <div className="mt-5 flex gap-2">
                {socials.map((s) => (
                  <a
                    key={s.key}
                    href={settings?.[s.key]}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 text-cream transition-all hover:bg-saffron hover:text-saffron-foreground"
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Explore */}
          <nav aria-label="Footer">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">Explore</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { href: "/#fleet", label: "Our fleet" },
                { href: "/#rates", label: "Rate card" },
                { href: "/stays", label: "Stays & partners" },
                { href: "/#routes", label: "Popular routes" },
                { href: "/#stories", label: "Stories & guides" },
                { href: "/#reviews", label: "Reviews" },
                { href: "/#faq", label: "FAQ" },
              ].map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-cream/70 transition-colors hover:text-saffron">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Owner pages */}
          <nav aria-label="Pages">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">Pages</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {(menuPages ?? []).map((p) => (
                <li key={p.id}>
                  <a href={`/p/${p.slug}`} className="text-cream/70 transition-colors hover:text-saffron">
                    {p.title}
                  </a>
                </li>
              ))}
              <li>
                <a href="/p/rules-and-policies" className="text-cream/70 transition-colors hover:text-saffron">
                  Rules &amp; Policies
                </a>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">Reach us</p>
            <ul className="mt-4 space-y-3 text-sm text-cream/70">
              <li>
                <a
                  href={buildWhatsAppUrl(waMsg, contact.whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-2.5 transition-colors hover:text-saffron"
                >
                  <MessageCircle className="mt-0.5 h-4 w-4 flex-none" />
                  WhatsApp +{contact.whatsapp}
                </a>
              </li>
              <li>
                <a
                  href={buildTelUrl(contact.phone)}
                  className="flex items-start gap-2.5 transition-colors hover:text-saffron"
                >
                  <Phone className="mt-0.5 h-4 w-4 flex-none" />
                  {contact.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-start gap-2.5 transition-colors hover:text-saffron"
                >
                  <Mail className="mt-0.5 h-4 w-4 flex-none" />
                  {contact.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 flex-none" />
                {contact.hours}
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 flex-none" />
                {contact.address}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-cream/15 pt-6 text-xs text-cream/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {BUSINESS_NAME}. Made with pride in Assam.</p>
          <p>With driver: fuel &amp; toll included · Self-drive: fuel &amp; toll at actuals</p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Floating action buttons (WhatsApp + back to top)                    */
/* ------------------------------------------------------------------ */
export function FloatingButtons({ settings }: { settings?: SettingsMap }) {
  const [showTop, setShowTop] = React.useState(false);
  const contact = getContact(settings);
  const waMsg = `Hello ${BUSINESS_NAME}! I'd like to enquire about a vehicle rental. Please share availability and quotes.`;

  React.useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full border border-forest/15 bg-white text-forest shadow-lg transition-all duration-300 hover:-translate-y-0.5",
          showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        )}
      >
        <ChevronUp className="h-5 w-5" />
      </button>
      <a
        href={buildWhatsAppUrl(waMsg, contact.whatsapp)}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="animate-pulse-ring flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform duration-300 hover:scale-110"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}
