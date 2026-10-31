import type { NextConfig } from "next";

/**
 * v6/v7/v8 security headers.
 *  - nosniff / frame / referrer / permissions policies apply site-wide.
 *  - HSTS tells browsers to always use HTTPS once on the domain.
 *    (Safe with Cloudflare/Vercel HTTPS — the site is fully https.)
 *  - /admin and /agreement get X-Robots-Tag noindex so search engines
 *    never list the portal or private signing links, even if linked.
 *  - /agreement responses are never cached (no-store).
 *  A strict Content-Security-Policy is intentionally NOT set because the
 *  owner configures GA4 / Meta Pixel / GTM scripts from the admin panel —
 *  a CSP would silently break those integrations.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/admin/:path*",
        headers: [
          ...securityHeaders,
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
      {
        source: "/agreement/:path*",
        headers: [
          ...securityHeaders,
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
