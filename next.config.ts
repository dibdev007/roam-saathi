import type { NextConfig } from "next";

/**
 * v6 security hardening — HTTP response headers applied to every route.
 *
 * - HSTS + nosniff + frame protection + tight Referrer/Permissions policies.
 * - A pragmatic CSP: 'unsafe-inline' scripts/styles stay allowed because
 *   Next.js bootstrapping and the admin-configurable marketing tags (GA4,
 *   GTM, Meta Pixel) need them; everything else is locked to self plus the
 *   analytics/maps origins the site actually uses.
 * - /admin and /api/* additionally get X-Robots-Tag: noindex so even a
 *   misconfigured robots.txt can never put the portal in search results.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=(), usb=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // next/font inlines styles; marketing tags inject inline scripts
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://*.analytics.google.com https://connect.facebook.net https://pagead2.googlesyndication.com https://td.doubleclick.net",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "frame-src 'self' https://www.google.com https://maps.google.com https://www.googletagmanager.com https://www.youtube.com https://www.facebook.com",
      "connect-src 'self' https://www.google-analytics.com https://*.analytics.google.com https://stats.g.doubleclick.net https://www.googletagmanager.com https://connect.facebook.net https://www.facebook.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join("; "),
  },
];

const adminHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
  { key: "Cache-Control", value: "no-store, max-age=0" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin", headers: adminHeaders },
      { source: "/admin/:path*", headers: adminHeaders },
      { source: "/api/:path*", headers: adminHeaders },
    ];
  },
};

export default nextConfig;
