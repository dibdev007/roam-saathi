import * as React from "react";
import { MessageCircle, Phone, ExternalLink, ArrowRight } from "lucide-react";

import {
  buildWhatsAppUrl,
  buildTelUrl,
} from "@/lib/whatsapp";
import type { PageBlock } from "@/lib/siteConfig";
import { cn } from "@/lib/utils";

/**
 * Renders the content blocks of a CMS page. Pure JSX — used by the public
 * /p/[slug] route and by the admin live preview.
 */
export function PageBlocks({
  blocks,
  whatsapp,
  phone,
}: {
  blocks: PageBlock[];
  whatsapp: string;
  phone: string;
}) {
  return (
    <div className="space-y-6">
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} whatsapp={whatsapp} phone={phone} />
      ))}
    </div>
  );
}

function BlockView({
  block: b,
  whatsapp,
  phone,
}: {
  block: PageBlock;
  whatsapp: string;
  phone: string;
}) {
  switch (b.type) {
    case "heading": {
      if (b.level === 3) {
        return (
          <h3 className="font-display text-xl font-bold text-forest sm:text-2xl">{b.text}</h3>
        );
      }
      return (
        <h2 className="font-display text-2xl font-bold text-forest sm:text-3xl">{b.text}</h2>
      );
    }

    case "text":
      return (
        <div className="space-y-4">
          {b.text
            .split(/\n\s*\n/)
            .filter((p) => p.trim())
            .map((p, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-ink/85">
                {p.trim()}
              </p>
            ))}
        </div>
      );

    case "image":
      return (
        <figure className="block w-full">
          { }
          <img
            src={b.src}
            alt={b.caption || "Page image"}
            loading="lazy"
            decoding="async"
            className="max-h-[520px] w-full rounded-2xl border border-forest/10 object-cover shadow-sm"
          />
          {b.caption && (
            <figcaption className="mt-2 text-center text-xs italic text-muted-foreground">
              {b.caption}
            </figcaption>
          )}
        </figure>
      );

    case "gallery":
      if (!b.images?.length) return null;
      return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {b.images.filter(Boolean).map((src, i) => (
             
            <img
              key={i}
              src={src}
              alt={`Gallery photo ${i + 1}`}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full rounded-xl border border-forest/10 object-cover transition-transform duration-300 hover:scale-[1.02]"
            />
          ))}
        </div>
      );

    case "list": {
      const items = (b.items ?? []).filter((i) => i.trim());
      if (!items.length) return null;
      const Tag = b.ordered ? "ol" : "ul";
      return (
        <Tag className={cn("space-y-2 pl-1", !b.ordered && "list-none")}>
          {items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink/85">
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full text-[11px] font-bold",
                  b.ordered ? "bg-forest text-cream" : "bg-forest/15 text-forest"
                )}
              >
                {b.ordered ? i + 1 : "•"}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </Tag>
      );
    }

    case "quote":
      return (
        <blockquote className="rounded-r-2xl border-l-4 border-saffron bg-saffron/5 px-5 py-4">
          <p className="font-display text-lg italic leading-relaxed text-ink/90">“{b.text}”</p>
          {b.author && (
            <cite className="mt-2 block text-sm font-medium not-italic text-forest">
              — {b.author}
            </cite>
          )}
        </blockquote>
      );

    case "callout": {
      const tones = {
        green: "border-forest/25 bg-forest/5 text-forest",
        amber: "border-saffron/40 bg-saffron/10 text-ink",
        cream: "border-[#e6ddc8] bg-muted text-ink",
      } as const;
      const tone = tones[b.tone ?? "green"];
      return (
        <div className={cn("rounded-2xl border p-4 sm:p-5", tone)}>
          {b.title && <p className="mb-1 font-bold">{b.title}</p>}
          <p className="text-[15px] leading-relaxed opacity-90">{b.text}</p>
        </div>
      );
    }

    case "cta": {
      const href =
        b.action === "whatsapp"
          ? buildWhatsAppUrl(
              `Hello! I read your page and I'd like to plan a trip.`,
              whatsapp
            )
          : b.action === "phone"
            ? buildTelUrl(phone)
            : b.url || "#";
      return (
        <div className="rounded-2xl bg-forest p-6 text-cream sm:p-8">
          {b.title && (
            <p className="font-display text-xl font-bold sm:text-2xl">{b.title}</p>
          )}
          {b.text && <p className="mt-1 text-sm text-cream/75">{b.text}</p>}
          <a
            href={href}
            target={b.action === "link" ? "_blank" : undefined}
            rel={b.action === "link" ? "noreferrer" : undefined}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-saffron px-5 py-2.5 text-sm font-bold text-saffron-foreground shadow-lg transition-transform hover:scale-[1.03]"
          >
            {b.action === "whatsapp" && <MessageCircle className="h-4 w-4" />}
            {b.action === "phone" && <Phone className="h-4 w-4" />}
            {b.action === "link" && <ExternalLink className="h-4 w-4" />}
            {b.buttonLabel || "Contact us"}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      );
    }

    case "divider":
      return <hr className="border-[#e6ddc8]" />;

    default:
      return null;
  }
}
