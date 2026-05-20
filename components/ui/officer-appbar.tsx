"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabaseClient";

type OfficerAppbarProps = {
  email: string;
  active: "home" | "generate" | "history";
};

const navItems = [
  { href: "/home", label: "Home", key: "home" as const },
  { href: "/generate", label: "Generate Bar Code", key: "generate" as const },
  { href: "/history", label: "Bar Code History", key: "history" as const },
];

export function OfficerAppbar({ email, active }: OfficerAppbarProps) {
  const router = useRouter();
  const supabase = getSupabaseClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/signin");
  }

  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-deep)] text-white shadow-[0_18px_60px_rgba(11,31,51,0.18)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-[rgba(201,168,76,0.14)]" />
            <div>
              <p className="font-semibold leading-tight">GALIYAT DEVELOPMENT AUTHORITY</p>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">Officer Portal</p>
            </div>
          </div>

          <div className="hidden flex-1 justify-center md:flex">
            <nav className="rounded-full border border-white/10 bg-white/5 px-2 py-2 backdrop-blur">
              <ul className="flex items-center gap-2">
                {navItems.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        active === item.key ? "bg-[var(--color-accent)] text-[var(--color-deep)]" : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 lg:block">
              {email}
            </div>
            <button
              type="button"
              onClick={signOut}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="pb-4 md:hidden">
          <nav className="rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur">
            <ul className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={`block rounded-xl px-2 py-2 transition ${
                      active === item.key ? "bg-[var(--color-accent)] text-[var(--color-deep)]" : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
