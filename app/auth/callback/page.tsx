"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../../lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseClient();

    async function handle() {
      // Extract session from the URL (magic link or OAuth redirect)
      try {
        // @ts-ignore - supabase-js v2 method
        const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });

        if (error) {
          console.error("Auth callback error:", error);
          // Redirect to sign-in with error
          router.replace("/signin");
          return;
        }

        // On success, navigate to the generate page for officers
        router.replace("/generate");
      } catch (err) {
        console.error(err);
        router.replace("/signin");
      }
    }

    handle();
  }, [router]);

  return <div className="mx-auto max-w-md p-6">Signing you in...</div>;
}
