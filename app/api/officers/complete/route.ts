import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, fullName, designation, department, role } = body as {
      userId?: string;
      email?: string;
      fullName?: string;
      designation?: string;
      department?: string;
      role?: string;
    };

    if (!userId || !email) {
      return NextResponse.json({ error: "userId and email are required." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Missing Supabase admin client." }, { status: 500 });
    }

    const { data: existingOfficer } = await (supabaseAdmin.from("officers") as any)
      .select("id, role, approved")
      .eq("email", email)
      .maybeSingle();

    if (existingOfficer) {
      const updatePayload: Record<string, unknown> = {
        user_id: userId,
        email,
        role: existingOfficer.role ?? role ?? "officer",
        confirmed: true,
        approved: existingOfficer.role === "admin" ? true : existingOfficer.approved ?? false,
      };

      if (fullName) updatePayload.full_name = fullName;
      if (designation) updatePayload.designation = designation;
      if (department) updatePayload.department = department;

      const { error } = await (supabaseAdmin.from("officers") as any)
        .update(updatePayload)
        .eq("email", email);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const { error } = await (supabaseAdmin.from("officers") as any).insert({
        user_id: userId,
        email,
        full_name: fullName ?? email,
        designation: designation ?? "Officer",
        department: department ?? "BCA",
        role: role === "admin" ? "admin" : "officer",
        confirmed: true,
        approved: role === "admin",
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to complete officer registration.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



