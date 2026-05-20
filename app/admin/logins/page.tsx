"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../../lib/supabaseClient";

export default function AdminLoginsPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [logins, setLogins] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

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
        setLogins(body.loginHistory ?? []);
        setSelected(body.loginHistory?.[0] ?? null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [router, supabase]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-playfair text-3xl font-bold">Login Details</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="col-span-1 space-y-3">
          {(logins ?? []).map((entry) => (
            <button key={entry.id} onClick={() => setSelected(entry)} className={`w-full rounded-2xl border px-4 py-3 text-left ${selected?.id === entry.id ? "border-[var(--color-accent)] bg-[rgba(201,168,76,0.08)]" : "bg-white"}`}>
              <div className="font-semibold">{entry.officerName ?? entry.full_name}</div>
              <div className="text-xs text-[var(--color-text-soft)]">{entry.email}</div>
            </button>
          ))}
        </div>

        <div className="col-span-2">
          {selected ? (
            <div className="rounded-2xl border bg-white p-5">
              <h2 className="font-bold text-xl">{selected.officerName ?? selected.full_name}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-[var(--color-text-soft)]">
                <div><span className="font-semibold">User ID:</span> {selected.user_id}</div>
                <div><span className="font-semibold">Email:</span> {selected.email}</div>
                <div><span className="font-semibold">Browser:</span> {selected.browser ?? 'Unknown'}</div>
                <div><span className="font-semibold">OS:</span> {selected.operating_system ?? 'Unknown'}</div>
                <div><span className="font-semibold">Device:</span> {selected.device_type ?? 'Unknown'}</div>
                <div><span className="font-semibold">Login Time:</span> {new Date(selected.created_at).toLocaleString()}</div>
                <div><span className="font-semibold">IP Address:</span> {selected.ip_address ?? 'Unknown'}</div>
                <div><span className="font-semibold">Status:</span> {selected.login_status}</div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed bg-[#f8faf9] p-6 text-center">Select a login entry to view details</div>
          )}
        </div>
      </div>
    </div>
  );
}
