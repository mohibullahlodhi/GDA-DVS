import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const officerSelect = "id, user_id, email, full_name, designation, department, role, confirmed, approved, approved_at, approved_by, created_at";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId")?.trim();

  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Missing Supabase admin client." }, { status: 500 });
  }

  const { data: adminOfficer } = await (supabaseAdmin.from("officers") as any)
    .select(officerSelect)
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (!adminOfficer) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const [{ count: totalOfficers }, { count: pendingRequests }, { count: totalDocuments }, { count: totalLogins }] = await Promise.all([
    (supabaseAdmin.from("officers") as any).select("id", { count: "exact", head: true }),
    (supabaseAdmin.from("officers") as any)
      .select("id", { count: "exact", head: true })
      .eq("role", "officer")
      .eq("approved", false),
    (supabaseAdmin.from("documents") as any).select("id", { count: "exact", head: true }),
    (supabaseAdmin.from("officer_logins") as any).select("id", { count: "exact", head: true }),
  ]);

  const { data: pendingOfficers } = await (supabaseAdmin.from("officers") as any)
    .select(officerSelect)
    .eq("role", "officer")
    .eq("approved", false)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: documents } = await (supabaseAdmin.from("documents") as any)
    .select("id, title, department, recipient_name, processed_by, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: loginLogs } = await (supabaseAdmin.from("officer_logins") as any)
    .select("id, user_id, email, full_name, role, login_status, ip_address, browser, operating_system, device_type, created_at")
    .order("created_at", { ascending: false })
    .limit(25);

  const userIds = Array.from(
    new Set([
      ...(documents ?? []).map((row: any) => row.processed_by).filter(Boolean),
      ...(loginLogs ?? []).map((row: any) => row.user_id).filter(Boolean),
      ...(pendingOfficers ?? []).map((row: any) => row.user_id).filter(Boolean),
    ]),
  );

  let officerNameMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: officersForNames } = await (supabaseAdmin.from("officers") as any)
      .select("user_id, full_name")
      .in("user_id", userIds);

    officerNameMap = (officersForNames ?? []).reduce((acc: Record<string, string>, row: any) => {
      if (row.user_id) {
        acc[row.user_id] = row.full_name;
      }
      return acc;
    }, {});
  }

  return NextResponse.json({
    metrics: {
      totalOfficers: totalOfficers ?? 0,
      pendingRequests: pendingRequests ?? 0,
      totalDocuments: totalDocuments ?? 0,
      totalLogins: totalLogins ?? 0,
    },
    pendingOfficers: (pendingOfficers ?? []).map((row: any) => ({
      ...row,
      name: row.full_name,
    })),
    documentHistory: (documents ?? []).map((row: any) => ({
      ...row,
      officerName: row.processed_by ? officerNameMap[row.processed_by] ?? "Unknown officer" : "Unknown officer",
    })),
    loginHistory: (loginLogs ?? []).map((row: any) => ({
      ...row,
      officerName: row.user_id ? officerNameMap[row.user_id] ?? row.full_name ?? "Unknown officer" : row.full_name ?? "Unknown officer",
    })),
  });
}
