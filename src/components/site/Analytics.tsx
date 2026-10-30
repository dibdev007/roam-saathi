// v4 — Marketing & analytics injector (server component).
//
// Everything here is configured by the owner from Admin → Growth & SEO →
// Marketing tools — ZERO code changes. Paste a GA4 ID, GTM container,
// Meta Pixel or any raw tracking snippet and it goes live site-wide on
// the next render. Empty settings inject nothing at all.

import Script from "next/script";
import { parseScriptTags } from "@/lib/seo";
import type { SettingsMap } from "@/lib/siteConfig";

function isId(value: string | undefined, prefix: RegExp): string | null {
  const t = (value ?? "").trim();
  if (!t) return null;
  // Accept either a bare ID (G-XXXX) or a full script/URL paste containing it.
  const match = t.match(new RegExp(prefix.source, "i"));
  return match ? match[0] : null;
}

export function MarketingScripts({ settings }: { settings?: SettingsMap }) {
  const s = settings ?? {};

  const ga4 = isId(s.ga4Id, /G-[A-Z0-9]{6,}/i);
  const gtm = isId(s.gtmId, /GTM-[A-Z0-9]{4,}/i);
  const pixel = (() => {
    const t = (s.metaPixelId ?? "").trim();
    if (!t) return null;
    const m = t.match(/\b\d{10,20}\b/);
    return m ? m[0] : null;
  })();

  const headScripts = parseScriptTags(s.customHeadScripts);
  const bodyScripts = parseScriptTags(s.customBodyScripts);

  const hasAnything = Boolean(ga4 || gtm || pixel || headScripts.length || bodyScripts.length);
  if (!hasAnything) return null;

  return (
    <>
      {/* ---- Google Tag Manager (noscript fallback right after <body>) ---- */}
      {gtm && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtm}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
      )}

      {/* ---- Google Analytics 4 ---- */}
      {ga4 && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`}
            strategy="afterInteractive"
          />
          <Script id="rs-ga4" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ga4}');`}
          </Script>
        </>
      )}

      {/* ---- Google Tag Manager ---- */}
      {gtm && (
        <Script id="rs-gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      )}

      {/* ---- Meta (Facebook) Pixel ---- */}
      {pixel && (
        <>
          <Script id="rs-meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
          </Script>
          <noscript>
            { }
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${pixel}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}

      {/* ---- Custom scripts pasted by the owner (head) ---- */}
      {headScripts.map((sc, i) =>
        sc.src ? (
          <Script key={`head-src-${i}`} src={sc.src} strategy="afterInteractive" {...sc.attrs} />
        ) : (
          <Script key={`head-inline-${i}`} id={`rs-head-${i}`} strategy="afterInteractive">
            {sc.inline ?? ""}
          </Script>
        )
      )}

      {/* ---- Custom scripts pasted by the owner (end of body) ---- */}
      {bodyScripts.map((sc, i) =>
        sc.src ? (
          <Script key={`body-src-${i}`} src={sc.src} strategy="afterInteractive" {...sc.attrs} />
        ) : (
          <Script key={`body-inline-${i}`} id={`rs-body-${i}`} strategy="afterInteractive">
            {sc.inline ?? ""}
          </Script>
        )
      )}
    </>
  );
}

export default MarketingScripts;
