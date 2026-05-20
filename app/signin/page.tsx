"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { Footer } from "@/components/ui/footer";
import { AuthFeedback } from "@/components/ui/auth-feedback";

export default function SignInPage() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timer = window.setTimeout(() => setFeedback(null), 5000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  async function logLogin(userId: string, status: string) {
    try {
      const userAgent = navigator.userAgent;
      const resp = await fetch("/api/access/login-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          status,
          userAgent,
          browser: userAgent.includes("Edg/")
            ? "Edge"
            : userAgent.includes("Chrome/")
              ? "Chrome"
              : userAgent.includes("Firefox/")
                ? "Firefox"
                : userAgent.includes("Safari/")
                  ? "Safari"
                  : "Unknown",
          operatingSystem: userAgent.includes("Windows NT")
            ? "Windows"
            : userAgent.includes("Mac OS X")
              ? "macOS"
              : userAgent.includes("Android")
                ? "Android"
                : userAgent.includes("iPhone")
                  ? "iOS"
                  : "Unknown",
          deviceType: /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent) ? "Mobile" : "Desktop",
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => null);
        console.error("login-log failed:", err ?? await resp.text());
      }
    } catch {
      // ignore logging errors but surface to console for debugging
      console.error("login-log request error");
    }
  }

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setFeedback({ type: "error", message: result.error.message });
      setLoading(false);
      return;
    }

    const user = result.data?.user ?? null;

    // Ensure the officers table is linked to this auth user (set user_id)
    try {
      if (user?.id && user?.email) {
        await fetch("/api/officers/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
            fullName: (user.user_metadata ?? {})?.full_name ?? (user.user_metadata ?? {})?.fullName ?? undefined,
          }),
        });
      }
    } catch (e) {
      // ignore linking failures; login flow continues
      console.error("officers.complete linking failed:", e);
    }

    const response = await fetch(`/api/access/context?userId=${user.id}`);
    const context = await response.json().catch(() => null);

    if (!context?.found) {
      setFeedback({
        type: "error",
        message: "Your account is not yet linked to the officer panel. Please contact the admin.",
      });
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    await logLogin(user.id, context.isAdmin ? "admin" : context.canGenerate ? "approved" : "pending");

    if (context.isAdmin) {
      router.replace("/admin");
    } else if (context.canGenerate) {
        router.replace("/home");
    } else {
      setFeedback({
        type: "success",
        message: "Your request is pending admin approval. You can check the pending page while waiting.",
      });
      router.replace("/pending");
    }

    setLoading(false);
  }

  function goToSignUp() {
    router.push("/signup");
  }

  return (
    <>
      <div className="relative overflow-hidden bg-[var(--color-bg)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(11,31,51,0.08)_0%,rgba(11,31,51,0)_100%)]" />
        <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[rgba(201,168,76,0.12)] blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full bg-[rgba(27,67,50,0.08)] blur-3xl" />
        <div className="mx-auto grid min-h-[calc(100vh-0px)] max-w-6xl items-center px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-deep)] px-8 py-10 text-white shadow-[0_24px_80px_rgba(11,31,51,0.18)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,168,76,0.18)_0%,transparent_45%),radial-gradient(circle_at_bottom_left,rgba(27,67,50,0.35)_0%,transparent_40%)]" />
            <div className="relative max-w-xl space-y-5">
              <p className="font-dm-sans text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                Officer Access Portal
              </p>
              <h1 className="font-playfair text-4xl font-bold leading-tight sm:text-5xl">
                Secure sign in for verified officers only.
              </h1>
              <p className="max-w-lg text-sm leading-6 text-white/70 font-dm-sans">
                Use your official email and password to access the document generation area.
                Only confirmed officer accounts can open the registry workspace.
              </p>
              <div className="grid gap-3 pt-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50 font-dm-sans">Protected area</p>
                  <p className="mt-1 text-sm text-white/90">Generate & stamp official documents</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50 font-dm-sans">Public area</p>
                  <p className="mt-1 text-sm text-white/90">Verification stays open for everyone</p>
                </div>
              </div>
            </div>
          </section>

          <section className="relative mt-8 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-8 shadow-[0_18px_60px_rgba(17,24,39,0.08)] sm:px-8 lg:mt-0">
            <div className="mb-6">
              <p className="font-dm-sans text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                Sign In
              </p>
              <h2 className="mt-2 font-playfair text-3xl font-bold text-[var(--color-deep)]">Officer Login</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)] font-dm-sans">
                Login only with a verified officer account.
              </p>
            </div>

            <AuthFeedback
              message={feedback?.message ?? null}
              type={feedback?.type ?? "error"}
              onClose={() => setFeedback(null)}
            />

            <form className="space-y-5" onSubmit={signInWithPassword}>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[var(--color-charcoal)]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[#fbfcfb] px-4 py-3 text-[var(--color-text)] outline-none transition placeholder:text-gray-400 focus:border-[var(--color-accent)] focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[var(--color-charcoal)]">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[#fbfcfb] px-4 py-3 text-[var(--color-text)] outline-none transition placeholder:text-gray-400 focus:border-[var(--color-accent)] focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-[var(--color-primary)] px-5 py-3 font-semibold text-white shadow-[0_14px_30px_rgba(27,67,50,0.18)] transition hover:bg-[#143527] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>

                <button
                  type="button"
                  onClick={goToSignUp}
                  disabled={loading}
                  className="rounded-2xl border border-[var(--color-border)] bg-white px-5 py-3 font-semibold text-[var(--color-deep)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Sign up
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
