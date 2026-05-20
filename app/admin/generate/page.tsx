"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../../lib/supabaseClient";

export default function AdminGeneratePage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return router.replace("/signin");

      const ctx = await fetch(`/api/access/context?userId=${user.id}`);
      const ctxt = await ctx.json();
      if (!ctxt?.isAdmin) return router.replace(ctxt?.canGenerate ? "/generate" : "/pending");

      // redirect to the main generate page in the app
      router.replace("/generate");
    })();
  }, [router, supabase]);

  return null;
}
