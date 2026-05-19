"use client";

import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <SiteHeader />
      <main className="pt-[72px]">{children}</main>
    </div>
  );
}