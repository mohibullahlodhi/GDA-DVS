"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../../lib/supabaseClient";
import { AuthFeedback } from "@/components/ui/auth-feedback";

export default function AdminRequestsPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [officers, setOfficers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) return router.replace("/signin");

        const ctx = await fetch(`/api/access/context?userId=${user.id}`);
        const ctxt = await ctx.json();
        if (!ctxt?.isAdmin) return router.replace(ctxt?.canGenerate ? "/generate" : "/pending");

        const res = await fetch(`/api/admin/dashboard?userId=${user.id}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? "Failed");
        setOfficers(body.pendingOfficers ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [router, supabase]);

  async function approve(officerId: string) {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const adminUserId = userData?.user?.id;

      if (!adminUserId) {
        throw new Error("Admin session not found.");
      }

      const { data } = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ officerId, adminUserId }),
      }).then((r) => r.json());

      if (data?.error) throw new Error(data.error);
      setFeedback({ type: "success", message: "Officer approved" });
      // refresh
      const res = await fetch(`/api/admin/dashboard?userId=${adminUserId}`);
      const body = await res.json();
      setOfficers(body.pendingOfficers ?? []);
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message ?? "Failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-playfair text-3xl font-bold">Officer Requests</h1>
      <AuthFeedback message={feedback?.message ?? null} type={feedback?.type ?? "error"} onClose={() => setFeedback(null)} />

      <div className="mt-6 overflow-hidden rounded-2xl border bg-white p-4">
        <table className="min-w-full">
          <thead className="bg-[#f8faf9] text-xs font-semibold">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {officers.length ? (
              officers.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="px-4 py-3 font-semibold">{o.full_name}</td>
                  <td className="px-4 py-3">{o.designation}</td>
                  <td className="px-4 py-3">{o.department}</td>
                  <td className="px-4 py-3">{o.email}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => approve(o.id)} className="rounded bg-[var(--color-primary)] px-3 py-2 text-white">Approve</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--color-text-soft)]">No pending requests</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
