import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const detectBrowser = (userAgent: string) => {
  if (/Edg\//i.test(userAgent)) return "Edge";
  if (/Chrome\//i.test(userAgent)) return "Chrome";
  if (/Firefox\//i.test(userAgent)) return "Firefox";
  if (/Safari\//i.test(userAgent)) return "Safari";
  return "Unknown";
};

const detectOS = (userAgent: string) => {
  if (/Windows NT/i.test(userAgent)) return "Windows";
  if (/Mac OS X/i.test(userAgent)) return "macOS";
  if (/Android/i.test(userAgent)) return "Android";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
  if (/Linux/i.test(userAgent)) return "Linux";
  return "Unknown";
};

const detectDeviceType = (userAgent: string) =>
  /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent) ? "Mobile" : "Desktop";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = String(body.userId ?? "").trim();

    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Missing Supabase admin client." }, { status: 500 });
    }

    const { data: officer } = await (supabaseAdmin.from("officers") as any)
      .select("user_id, email, full_name, role")
      .eq("user_id", userId)
      .maybeSingle();

    if (!officer) {
      return NextResponse.json({ error: "Officer not found." }, { status: 404 });
    }

    const userAgent = String(body.userAgent ?? request.headers.get("user-agent") ?? "");
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-real-ip") ??
      null;

    const { error } = await (supabaseAdmin.from("officer_logins") as any).insert({
      user_id: officer.user_id,
      email: officer.email,
      full_name: officer.full_name,
      role: officer.role ?? "officer",
      login_status: String(body.status ?? body.loginStatus ?? "approved"),
      ip_address: ipAddress,
      browser: String(body.browser ?? detectBrowser(userAgent)),
      operating_system: String(body.operatingSystem ?? detectOS(userAgent)),
      device_type: String(body.deviceType ?? detectDeviceType(userAgent)),
      user_agent: userAgent,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to log login.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
