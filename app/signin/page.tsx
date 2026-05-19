"use client";

import { useState } from "react";
import { getSupabaseClient } from "../../lib/supabaseClient";

export default function SignInPage() {
  const supabase = getSupabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setMessage(result.error.message);
    } else {
      setMessage("Signed in successfully.");
    }

    setLoading(false);
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await supabase.auth.signUp({ email, password });

    if (result.error) {
      setMessage(result.error.message);
    } else {
      setMessage("Sign-up successful. Check your email if confirmation is required.");
    }

    setLoading(false);
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await supabase.auth.signInWithOtp({ email });

    if (result.error) {
      setMessage(result.error.message);
    } else {
      setMessage("Magic link sent to your email.");
    }

    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-bold">Officer Login</h1>

      <form className="space-y-4" onSubmit={signInWithPassword}>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-200 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-200 px-3 py-2"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#1B4332] px-4 py-2 text-white disabled:opacity-60"
          >
            Sign in
          </button>

          <button
            type="button"
            onClick={signUp}
            disabled={loading}
            className="rounded-xl border border-gray-200 px-4 py-2"
          >
            Sign up
          </button>
        </div>
      </form>

      <div className="mt-6">
        <p className="mb-2 text-sm text-gray-600">Or send a magic link</p>
        <div className="flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2"
          />
          <button
            onClick={sendMagicLink}
            disabled={loading}
            className="rounded-xl bg-[#1B4332] px-4 py-2 text-white disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </div>

      {message && <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm">{message}</div>}
    </div>
  );
}
