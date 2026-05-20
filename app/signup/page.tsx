"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { Footer } from "@/components/ui/footer";
import { AuthFeedback } from "@/components/ui/auth-feedback";

export default function SignUpPage() {
  const supabase: any = getSupabaseClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("BCA");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timer = window.setTimeout(() => setFeedback(null), 5500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;

      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            full_name: fullName,
            designation,
            department,
            role: "officer",
          },
        },
      });

      if (result.error) {
        setFeedback({ type: "error", message: result.error.message });
      } else {
        try {
          await fetch("/api/officers/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              fullName,
              designation,
              department,
              userId: result.data?.user?.id ?? null,
              role: "officer",
            }),
          });
        } catch {
          // ignore request creation failures for now; auth user still exists
        }

        setFeedback({
          type: "success",
          message: "Your request has been sent to admin for approval.",
        });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message ?? "Sign-up failed." });
    }

    setLoading(false);
  }

  return (
    <>
      <div className="relative overflow-hidden bg-[var(--color-bg)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(11,31,51,0.08)_0%,rgba(11,31,51,0)_100%)]" />
        <div className="pointer-events-none absolute left-0 top-1/4 h-80 w-80 rounded-full bg-[rgba(201,168,76,0.12)] blur-3xl" />
        <div className="pointer-events-none absolute right-0 bottom-10 h-96 w-96 rounded-full bg-[rgba(27,67,50,0.08)] blur-3xl" />
        <div className="mx-auto grid min-h-[calc(100vh-0px)] max-w-6xl items-center px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <section className="relative order-2 mt-8 overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-8 shadow-[0_18px_60px_rgba(17,24,39,0.08)] sm:px-8 lg:order-1 lg:mt-0">
            <div className="mb-6">
              <p className="font-dm-sans text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                Create Account
              </p>
              <h1 className="mt-2 font-playfair text-3xl font-bold text-[var(--color-deep)] sm:text-4xl">
                Officer Registration
              </h1>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)] font-dm-sans">
                Enter your official details to create a verified officer account.
              </p>
            </div>

            <AuthFeedback
              message={feedback?.message ?? null}
              type={feedback?.type ?? "error"}
              onClose={() => setFeedback(null)}
            />

            <form className="space-y-5" onSubmit={handleSignUp}>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <label className="block text-sm font-semibold text-[var(--color-charcoal)]">Full name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-[var(--color-border)] bg-[#fbfcfb] px-4 py-3 text-[var(--color-text)] outline-none transition focus:border-[var(--color-accent)] focus:bg-white"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="block text-sm font-semibold text-[var(--color-charcoal)]">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-[var(--color-border)] bg-[#fbfcfb] px-4 py-3 text-[var(--color-text)] outline-none transition focus:border-[var(--color-accent)] focus:bg-white"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="block text-sm font-semibold text-[var(--color-charcoal)]">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-2xl border border-[var(--color-border)] bg-[#fbfcfb] px-4 py-3 text-[var(--color-text)] outline-none transition focus:border-[var(--color-accent)] focus:bg-white"
                  >
                    <option value="BCA">BCA</option>
                    <option value="Education">Education</option>
                    <option value="Health">Health</option>
                    <option value="Police">Police</option>
                    <option value="Revenue">Revenue</option>
                    <option value="Transport">Transport</option>
                  </select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="block text-sm font-semibold text-[var(--color-charcoal)]">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-[var(--color-border)] bg-[#fbfcfb] px-4 py-3 text-[var(--color-text)] outline-none transition focus:border-[var(--color-accent)] focus:bg-white"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="block text-sm font-semibold text-[var(--color-charcoal)]">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-[var(--color-border)] bg-[#fbfcfb] px-4 py-3 text-[var(--color-text)] outline-none transition focus:border-[var(--color-accent)] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-[var(--color-primary)] px-5 py-3 font-semibold text-white shadow-[0_14px_30px_rgba(27,67,50,0.18)] transition hover:bg-[#143527] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/signin")}
                  disabled={loading}
                  className="rounded-2xl border border-[var(--color-border)] bg-white px-5 py-3 font-semibold text-[var(--color-deep)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Back to sign in
                </button>
              </div>
            </form>
          </section>

          <section className="relative order-1 overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-deep)] px-8 py-10 text-white shadow-[0_24px_80px_rgba(11,31,51,0.18)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,168,76,0.16)_0%,transparent_45%),radial-gradient(circle_at_bottom_right,rgba(27,67,50,0.35)_0%,transparent_42%)]" />
            <div className="relative max-w-xl space-y-5">
              <p className="font-dm-sans text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                New Officer Account
              </p>
              <h2 className="font-playfair text-4xl font-bold leading-tight sm:text-5xl">
                Register with your official role details.
              </h2>
              <p className="max-w-lg text-sm leading-6 text-white/70 font-dm-sans">
                After signup, a confirmation email will be sent. Once verified, the account can access the document generation page.
              </p>
              <div className="grid gap-3 pt-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50 font-dm-sans">Step 1</p>
                  <p className="mt-1 text-sm text-white/90">Fill officer details</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50 font-dm-sans">Step 2</p>
                  <p className="mt-1 text-sm text-white/90">Verify email, then sign in</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}



