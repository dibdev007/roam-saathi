"use client";

// v6 hardening: a thin client gate that code-splits the two real admin
// screens. The server-rendered /admin HTML (and its RSC flight payload)
// now contains only this generic "AdminGate" module — the words
// "AdminLogin" / "AdminApp" and their chunk paths are fetched lazily from
// separate JS files AFTER hydration, so the initial page source reveals
// nothing about the portal's internals.
//
// Auth still happens server-side: /admin/page.tsx verifies the signed
// session cookie and passes only "login" | "app" as a prop.

import * as React from "react";

const AdminLogin = React.lazy(() => import("./AdminLogin"));
const AdminApp = React.lazy(() => import("./AdminApp"));

export default function AdminGate({ mode }: { mode: "login" | "app" }) {
  return (
    <React.Suspense
      fallback={
        <div
          role="status"
          aria-label="Loading"
          className="flex min-h-screen items-center justify-center bg-cream"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-forest/20 border-t-forest" />
        </div>
      }
    >
      {mode === "app" ? <AdminApp /> : <AdminLogin />}
    </React.Suspense>
  );
}
