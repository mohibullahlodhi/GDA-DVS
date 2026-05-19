"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabaseClient";

export function AuthButton() {
  const supabase = getSupabaseClient();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // initial session
    let mounted = true;

    async function load() {
      // @ts-ignore
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
      // @ts-ignore
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
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">{email}</span>
        <button
          onClick={signOut}
          disabled={loading}
          className="rounded-xl border border-gray-200 px-3 py-1 text-sm"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <a href="/signin" className="rounded-xl border border-[#1B4332] px-3 py-2 text-xs font-medium text-[#1B4332] hover:bg-[#1B4332] hover:text-white">
      Officer Login
    </a>
  );
}
