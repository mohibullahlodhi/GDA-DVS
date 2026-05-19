"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, User } from "lucide-react";
import { getSupabaseClient } from "../../lib/supabaseClient";

export function AuthButton() {
  const supabase = getSupabaseClient();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setEmail(data?.session?.user?.email ?? null);
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, [supabase]);

  async function signOut() {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    router.replace("/");
  }

  if (email) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1.5">
          <User size={13} className="text-[var(--color-accent)]" />
          <span className="text-[11px] font-medium text-white/90 dmsans max-w-[120px] sm:max-w-[180px] truncate">
            {email}
          </span>
        </div>
        <button
          onClick={signOut}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-medium text-white/95 transition-all duration-300 hover:scale-[1.02] dmsans"
        >
          <LogOut size={12} />
          <span>Sign out</span>
        </button>
      </div>
    );
  }

  return (
    <a
      href="/signin"
      className="flex items-center gap-1.5 rounded-lg border border-[rgba(201,168,76,0.5)] bg-[rgba(201,168,76,0.06)] hover:bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold text-[var(--color-accent)] hover:text-[var(--color-deep)] transition-all duration-300 hover:-translate-y-0.5 dmsans"
    >
      <LogIn size={12} />
      <span>Portal Sign In</span>
    </a>
  );
}
