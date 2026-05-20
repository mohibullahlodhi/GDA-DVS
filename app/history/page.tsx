"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { OfficerAppbar } from "@/components/ui/officer-appbar";

type HistoryItem = {
  id: string;
  title: string;
  department: string;
  recipient_name: string | null;
  created_at: string;
};

export default function OfficerHistoryPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) return router.replace("/signin");

        const ctxRes = await fetch(`/api/access/context?userId=${user.id}`);
        const ctx = await ctxRes.json();
        if (!ctx?.found) return router.replace("/signin");
        if (ctx?.isAdmin) return router.replace("/admin");
        if (!ctx?.canGenerate) return router.replace("/pending");

        const res = await fetch(`/api/officer/dashboard?userId=${user.id}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? "Failed to load history.");

        setEmail(body?.officer?.email ?? user.email ?? "");
        setItems(body?.documents ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [router, supabase]);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return items;
    return items.filter((item) =>
      [item.id, item.title, item.department, item.recipient_name ?? ""].some((field) => field.toLowerCase().includes(value)),
    );
  }, [items, query]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <OfficerAppbar email={email} active="history" />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">Bar Code History</p>
            <h1 className="mt-2 font-playfair text-4xl font-bold text-[var(--color-deep)]">My barcode records</h1>
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search barcode id, title, department..."
            className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none sm:max-w-md"
          />
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-white shadow-[0_18px_60px_rgba(17,24,39,0.08)]">
          <table className="min-w-full text-left">
            <thead className="bg-[#f8faf9] text-xs uppercase tracking-[0.18em] text-[var(--color-text-soft)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Barcode ID</th>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-sm text-[var(--color-text)]">
              {filtered.length ? (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4 font-mono text-xs text-[var(--color-primary)]">{item.id}</td>
                    <td className="px-4 py-4 font-semibold text-[var(--color-deep)]">{item.title}</td>
                    <td className="px-4 py-4">{item.department}</td>
                    <td className="px-4 py-4 text-[var(--color-text-soft)]">{new Date(item.created_at).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-[var(--color-text-soft)]">No matching barcode history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
