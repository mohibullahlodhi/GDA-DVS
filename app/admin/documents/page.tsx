"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../../lib/supabaseClient";

export default function AdminDocumentsPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [query, setQuery] = useState("");

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
        setDocuments(body.documentHistory ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [router, supabase]);

  const filteredDocuments = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return documents;
    }

    return documents.filter((item) =>
      [item.id, item.officerName, item.title, item.department].some((field) => String(field ?? "").toLowerCase().includes(term)),
    );
  }, [documents, query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-playfair text-3xl font-bold">Barcode History</h1>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search barcode id, title, officer..."
          className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none sm:max-w-md"
        />
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border bg-white p-4">
        <table className="min-w-full">
          <thead className="bg-[#f8faf9] text-xs font-semibold">
            <tr>
              <th className="px-4 py-3">Officer</th>
              <th className="px-4 py-3">Barcode ID</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.length ? (
              filteredDocuments.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3 font-semibold">{item.officerName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--color-primary)]">{item.id}</td>
                  <td className="px-4 py-3">{item.title}</td>
                  <td className="px-4 py-3">{item.department}</td>
                  <td className="px-4 py-3 text-[var(--color-text-soft)]">{new Date(item.created_at).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--color-text-soft)]">No barcode history yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
