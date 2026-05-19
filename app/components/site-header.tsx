"use client";

import Image from "next/image";
import Link from "next/link";
import { AuthButton } from "./auth-button";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[72px] border-b border-[rgba(201,168,76,0.28)] text-white backdrop-blur-md" style={{ backgroundColor: "#0B1F33" }}>
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-90">
          <Image
            src="/gda_logo.png"
            alt="Galiyat Development Authority logo"
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 object-contain"
            priority
          />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[11px] font-medium text-white/90 sm:text-[13px]">
              Galiyat Development Authority
            </div>
            <div
              className="truncate text-[10px] font-light sm:text-[11px]"
              style={{ color: "var(--color-accent)" }}
            >
              Document Verification System
            </div>
          </div>
        </Link>

        <div className="shrink-0">
          <AuthButton />
        </div>
      </div>
    </header>
  );
}