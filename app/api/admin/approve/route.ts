import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const officerId = String(body.officerId ?? "").trim();
    const adminUserId = String(body.adminUserId ?? "").trim();

    if (!officerId || !adminUserId) {
      return NextResponse.json({ error: "officerId and adminUserId are required." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Missing Supabase admin client." }, { status: 500 });
    }

    const { data: adminOfficer } = await (supabaseAdmin.from("officers") as any)
      .select("user_id, role")
      .eq("user_id", adminUserId)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminOfficer) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const { error } = await (supabaseAdmin.from("officers") as any)
      .update({ approved: true, approved_at: new Date().toISOString(), approved_by: adminUserId })
      .eq("id", officerId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to approve officer.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
