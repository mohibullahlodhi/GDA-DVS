"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "Generate Document", href: "/generate" },
  { label: "Verify Document", href: "/verify" },
];

const routeActions = [
  {
    matches: ["/generate"],
    label: "Verify Document",
    href: "/verify",
    style: "outline" as const,
  },
  {
    matches: ["/verify"],
    label: "Generate Document",
    href: "/generate",
    style: "outline" as const,
  },
  {
    matches: ["/"],
    label: "Login for Officers",
    href: "/generate",
    style: "outline" as const,
  },
];

function getActiveAction(pathname: string) {
  return (
    routeActions.find((action) =>
      action.matches.some(
        (match) => pathname === match || pathname.startsWith(`${match}/`),
      ),
    ) ?? routeActions[2]
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const action = getActiveAction(pathname);

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#1A1A1A]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 text-[#1B4332] transition-opacity hover:opacity-80"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D8F3DC] text-[#1B4332] shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <span className="text-xl font-bold tracking-tight">GDAVS</span>
          </Link>

          <nav className="mx-auto flex flex-1 items-center justify-center gap-4 overflow-x-auto whitespace-nowrap px-2 text-[12px] font-medium text-[#6B7280] sm:gap-6 sm:text-sm">
            {navigationLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors hover:text-[#1B4332] ${
                    isActive ? "text-[#1B4332]" : "text-[#6B7280]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href={action.href}
            className={`shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-all sm:px-5 sm:py-2.5 sm:text-sm ${
              action.style === "outline"
                ? "border border-[#1B4332] text-[#1B4332] hover:bg-[#1B4332] hover:text-white"
                : "bg-[#1B4332] text-white hover:bg-[#40916C]"
            }`}
          >
            {action.label}
          </Link>
        </div>
      </header>
      <main className="pt-24">{children}</main>
    </div>
  );
}