"use client";

import Image from "next/image";
import Link from "next/link";
import { AuthButton } from "./auth-button";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[76px] border-b border-[rgba(201,168,76,0.18)] text-white backdrop-blur-md bg-[#0B1F33]/85">
      {/* Top micro-line accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[rgba(201,168,76,0.8)] to-transparent" />

      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* LOGO & BRANDING */}
        <Link href="/" className="flex min-w-0 items-center gap-3 transition-all duration-300 hover:opacity-90 hover:scale-[1.01]">
          <Image
            src="/gda_logo.png"
            alt="Galiyat Development Authority logo"
            width={42}
            height={42}
            className="h-10 w-10 shrink-0 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]"
            priority
          />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-xs font-bold text-white/95 sm:text-[13px] tracking-wide dmsans uppercase">
              Galiyat Development Authority
            </div>
            <div
              className="truncate text-[10px] font-medium tracking-wider sm:text-[11px] dmsans uppercase"
              style={{ color: "var(--color-accent)" }}
            >
              Document Verification
            </div>
          </div>
        </Link>

        {/* AUTHENTICATION ACTION */}
        <div className="shrink-0">
          <AuthButton />
        </div>

      </div>
    </header>
  );
}