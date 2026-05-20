"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/ui/footer";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { AuthFeedback } from "@/components/ui/auth-feedback";
import { BarChart3, Clock3, FileText, ShieldCheck, UserCheck } from "lucide-react";

type DashboardMetrics = {
  totalOfficers: number;
  pendingRequests: number;
  totalDocuments: number;
  totalLogins: number;
};

type PendingOfficer = {
  id: string;
  user_id: string | null;
  email: string;
  full_name: string;
  designation: string;
  department: string;
  role: "admin" | "officer";
  confirmed: boolean;
  approved: boolean;
  created_at: string;
};

type DocumentHistoryItem = {
  id: string;
  title: string;
  department: string;
  recipient_name: string | null;
  processed_by: string | null;
  created_at: string;
  officerName: string;
};

type LoginHistoryItem = {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  login_status: string;
  ip_address: string | null;
  browser: string | null;
  operating_system: string | null;
  device_type: string | null;
  created_at: string;
  officerName: string;
};

type DashboardResponse = {
  metrics: DashboardMetrics;
  pendingOfficers: PendingOfficer[];
  documentHistory: DocumentHistoryItem[];
  loginHistory: LoginHistoryItem[];
};

export default function AdminPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [selectedLogin, setSelectedLogin] = useState<LoginHistoryItem | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const timer = feedback ? window.setTimeout(() => setFeedback(null), 5000) : null;
    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [feedback]);

  useEffect(() => {
    (async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;

        if (!user) {
          router.replace("/signin");
          return;
        }

        const res = await fetch(`/api/access/context?userId=${user.id}`);
        const context = await res.json();

        if (!context?.isAdmin) {
          router.replace(context?.canGenerate ? "/generate" : "/pending");
          return;
        }

        setAdminUserId(user.id);

        const dashboardRes = await fetch(`/api/admin/dashboard?userId=${user.id}`);
        const dashboard = await dashboardRes.json();

        if (!dashboardRes.ok) {
          throw new Error(dashboard?.error ?? "Failed to load admin dashboard.");
        }

        // limit recent items to 6 for home view
        if (dashboard?.pendingOfficers) dashboard.pendingOfficers = dashboard.pendingOfficers.slice(0, 6);
        if (dashboard?.documentHistory) dashboard.documentHistory = dashboard.documentHistory.slice(0, 6);
        if (dashboard?.loginHistory) dashboard.loginHistory = dashboard.loginHistory.slice(0, 6);

        setData(dashboard);
        setSelectedLogin(dashboard.loginHistory?.[0] ?? null);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load admin dashboard.";
        setFeedback({ type: "error", message });
      } finally {
        setLoading(false);
      }
    })();
  }, [router, supabase]);

  const metrics = data?.metrics ?? {
    totalOfficers: 0,
    pendingRequests: 0,
    totalDocuments: 0,
    totalLogins: 0,
  };

  const quickStats = useMemo(
    () => [
      { label: "Total Officers", value: metrics.totalOfficers, icon: UserCheck },
      { label: "Pending Requests", value: metrics.pendingRequests, icon: Clock3 },
      { label: "Barcodes Generated", value: metrics.totalDocuments, icon: FileText },
      { label: "Login Events", value: metrics.totalLogins, icon: BarChart3 },
    ],
    [metrics],
  );

  async function approveOfficer(officerId: string) {
    if (!adminUserId) {
      return;
    }

    try {
      const response = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ officerId, adminUserId }),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body?.error ?? "Failed to approve officer.");
      }

      setFeedback({ type: "success", message: "Officer approved successfully." });
      const refresh = await fetch(`/api/admin/dashboard?userId=${adminUserId}`);
      const updated = await refresh.json();
      setData(updated);
      setSelectedLogin(updated.loginHistory?.[0] ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to approve officer.";
      setFeedback({ type: "error", message });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-text-soft)] font-dm-sans">
        Loading admin panel...
      </div>
    );
  }

  return (
    <>
      <div className="bg-[var(--color-bg)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-deep)] px-8 py-10 text-white shadow-[0_24px_80px_rgba(11,31,51,0.18)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,168,76,0.16)_0%,transparent_45%),radial-gradient(circle_at_bottom_right,rgba(27,67,50,0.32)_0%,transparent_42%)]" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <p className="font-dm-sans text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                  Admin Panel
                </p>
                <h1 className="font-playfair text-4xl font-bold leading-tight sm:text-5xl">
                  Officer approvals, barcode history, and login analytics.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-white/70 font-dm-sans">
                  Approve verified officers, review who generated each barcode, and inspect device details for every login event.
                </p>
              </div>

              <a
                href="/generate"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                <ShieldCheck className="h-4 w-4 text-[var(--color-accent)]" />
                Open Generate Page
              </a>
            </div>
          </div>

          <AuthFeedback
            message={feedback?.message ?? null}
            type={feedback?.type ?? "error"}
            onClose={() => setFeedback(null)}
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-[1.5rem] border border-[var(--color-border)] bg-white p-5 shadow-[0_18px_60px_rgba(17,24,39,0.08)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)] font-dm-sans">
                        {stat.label}
                      </p>
                      <p className="mt-3 font-playfair text-3xl font-bold text-[var(--color-deep)]">{stat.value}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(27,67,50,0.08)] text-[var(--color-primary)]">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-[1.75rem] border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_60px_rgba(17,24,39,0.08)]">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="font-dm-sans text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">Approval Queue</p>
                  <h2 className="mt-2 font-playfair text-2xl font-bold text-[var(--color-deep)]">Pending officer requests</h2>
                </div>
                <div>
                  <Link href="/admin/requests" className="text-sm font-semibold text-[var(--color-primary)]">See all</Link>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
                <table className="min-w-full divide-y divide-[var(--color-border)] text-left">
                  <thead className="bg-[#f8faf9] text-xs uppercase tracking-[0.18em] text-[var(--color-text-soft)]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold">Designation</th>
                      <th className="px-4 py-3 font-semibold">Department</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)] bg-white text-sm text-[var(--color-text)]">
                    {data?.pendingOfficers?.length ? (
                      data.pendingOfficers.map((officer) => (
                        <tr key={officer.id}>
                          <td className="px-4 py-4 font-semibold text-[var(--color-deep)]">{officer.full_name}</td>
                          <td className="px-4 py-4">{officer.designation}</td>
                          <td className="px-4 py-4">{officer.department}</td>
                          <td className="px-4 py-4">{officer.email}</td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => approveOfficer(officer.id)}
                              className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#143527]"
                            >
                              Approve
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-sm text-[var(--color-text-soft)]">
                          No pending requests right now.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_60px_rgba(17,24,39,0.08)]">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="font-dm-sans text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">Login Details</p>
                  <h2 className="mt-2 font-playfair text-2xl font-bold text-[var(--color-deep)]">Officer session info</h2>
                </div>
                <div>
                  <Link href="/admin/logins" className="text-sm font-semibold text-[var(--color-primary)]">See all</Link>
                </div>
              </div>

              <div className="space-y-3">
                {(data?.loginHistory ?? []).length ? (
                  data?.loginHistory?.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => setSelectedLogin(entry)}
                      className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                        selectedLogin?.id === entry.id
                          ? "border-[var(--color-accent)] bg-[rgba(201,168,76,0.08)]"
                          : "border-[var(--color-border)] bg-white hover:border-[var(--color-accent)]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[var(--color-deep)]">{entry.officerName}</p>
                          <p className="text-xs text-[var(--color-text-soft)] font-dm-sans">{entry.email}</p>
                        </div>
                        <span className="rounded-full bg-[rgba(27,67,50,0.08)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                          {entry.login_status}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[#f8faf9] px-4 py-10 text-center text-sm text-[var(--color-text-soft)]">
                    No login history yet.
                  </div>
                )}
              </div>

              {selectedLogin ? (
                <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[#fbfcfb] p-5">
                  <p className="font-dm-sans text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">Selected Login Detail</p>
                  <h3 className="mt-2 font-playfair text-xl font-bold text-[var(--color-deep)]">{selectedLogin.officerName}</h3>
                  <div className="mt-4 grid gap-3 text-sm text-[var(--color-text-soft)] sm:grid-cols-2">
                    <div><span className="font-semibold text-[var(--color-charcoal)]">User ID:</span> {selectedLogin.user_id}</div>
                    <div><span className="font-semibold text-[var(--color-charcoal)]">Email:</span> {selectedLogin.email}</div>
                    <div><span className="font-semibold text-[var(--color-charcoal)]">Browser:</span> {selectedLogin.browser ?? "Unknown"}</div>
                    <div><span className="font-semibold text-[var(--color-charcoal)]">OS:</span> {selectedLogin.operating_system ?? "Unknown"}</div>
                    <div><span className="font-semibold text-[var(--color-charcoal)]">Device:</span> {selectedLogin.device_type ?? "Unknown"}</div>
                    <div><span className="font-semibold text-[var(--color-charcoal)]">Login Time:</span> {new Date(selectedLogin.created_at).toLocaleString()}</div>
                    <div><span className="font-semibold text-[var(--color-charcoal)]">IP Address:</span> {selectedLogin.ip_address ?? "Unknown"}</div>
                    <div><span className="font-semibold text-[var(--color-charcoal)]">Status:</span> {selectedLogin.login_status}</div>
                  </div>
                </div>
              ) : null}
            </section>
          </div>

          <section className="rounded-[1.75rem] border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_60px_rgba(17,24,39,0.08)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="font-dm-sans text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">Barcode History</p>
                <h2 className="mt-2 font-playfair text-2xl font-bold text-[var(--color-deep)]">Who generated what</h2>
              </div>
              <div>
                <Link href="/admin/documents" className="text-sm font-semibold text-[var(--color-primary)]">See all</Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
              <table className="min-w-full divide-y divide-[var(--color-border)] text-left">
                <thead className="bg-[#f8faf9] text-xs uppercase tracking-[0.18em] text-[var(--color-text-soft)]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Officer</th>
                    <th className="px-4 py-3 font-semibold">Barcode ID</th>
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">Department</th>
                    <th className="px-4 py-3 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)] bg-white text-sm text-[var(--color-text)]">
                  {data?.documentHistory?.length ? (
                    data.documentHistory.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-4 font-semibold text-[var(--color-deep)]">{item.officerName}</td>
                        <td className="px-4 py-4 font-mono text-xs text-[var(--color-primary)]">{item.id}</td>
                        <td className="px-4 py-4">{item.title}</td>
                        <td className="px-4 py-4">{item.department}</td>
                        <td className="px-4 py-4 text-[var(--color-text-soft)]">{new Date(item.created_at).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-[var(--color-text-soft)]">
                        No barcode history yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
