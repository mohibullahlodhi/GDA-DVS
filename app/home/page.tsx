"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { OfficerAppbar } from "@/components/ui/officer-appbar";
import Link from "next/link";

type OfficerDashboardResponse = {
  officer: {
    userId: string;
    email: string;
    fullName: string;
    designation: string;
    department: string;
    role: string;
    approved: boolean;
    canGenerate: boolean;
  };
  metrics: {
    totalDocuments: number;
    todayDocuments: number;
    weekDocuments: number;
    monthDocuments: number;
    lastGeneratedAt: string | null;
  };
  recentDocuments: Array<{
    id: string;
    title: string;
    department: string;
    recipient_name: string | null;
    created_at: string;
  }>;
};

export default function OfficerHomePage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OfficerDashboardResponse | null>(null);

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
        if (!res.ok) throw new Error(body?.error ?? "Failed to load officer dashboard.");
        setData(body);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [router, supabase]);

  const cards = useMemo(
    () => [
      { label: "Total Barcodes", value: data?.metrics.totalDocuments ?? 0 },
      { label: "Today", value: data?.metrics.todayDocuments ?? 0 },
      { label: "This Week", value: data?.metrics.weekDocuments ?? 0 },
      { label: "This Month", value: data?.metrics.monthDocuments ?? 0 },
    ],
    [data],
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">Loading...</div>;
  }

  const email = data?.officer.email ?? "";

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <OfficerAppbar email={email} active="home" />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_60px_rgba(17,24,39,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">Home</p>
          <h1 className="mt-2 font-playfair text-4xl font-bold text-[var(--color-deep)]">Welcome, {data?.officer.fullName ?? "Officer"}</h1>
          <p className="mt-2 text-sm text-[var(--color-text-soft)]">Your recent barcode activity and summary are shown below.</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <div key={card.label} className="rounded-[1.5rem] border border-[var(--color-border)] bg-[#fbfcfb] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">{card.label}</p>
                <p className="mt-3 font-playfair text-3xl font-bold text-[var(--color-deep)]">{card.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_60px_rgba(17,24,39,0.08)]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">Recent Activity</p>
              <h2 className="mt-2 font-playfair text-2xl font-bold text-[var(--color-deep)]">Recent Barcode History</h2>
            </div>
            <Link href="/history" className="text-sm font-semibold text-[var(--color-primary)]">See all</Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
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
                {(data?.recentDocuments ?? []).length ? (
                  data!.recentDocuments.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4 font-mono text-xs text-[var(--color-primary)]">{item.id}</td>
                      <td className="px-4 py-4 font-semibold text-[var(--color-deep)]">{item.title}</td>
                      <td className="px-4 py-4">{item.department}</td>
                      <td className="px-4 py-4 text-[var(--color-text-soft)]">{new Date(item.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-[var(--color-text-soft)]">No barcode history yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
