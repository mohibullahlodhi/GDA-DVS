import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ allowed: false }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ allowed: false }, { status: 500 });
    }

    const { data, error } = await (supabaseAdmin.from("officers") as any)
      .select("id")
      .eq("user_id", userId)
      .eq("confirmed", true)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ allowed: false }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ allowed: false });
    }

    return NextResponse.json({ allowed: true });
  } catch (err) {
    return NextResponse.json({ allowed: false }, { status: 500 });
  }
}
