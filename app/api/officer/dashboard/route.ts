import { NextResponse } from "next/server";
import { getOfficerContextByUserId } from "@/lib/officer-access";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId")?.trim();

  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  const context = await getOfficerContextByUserId(userId);
  const supabaseAdmin = getSupabaseAdmin();

  if (!context || !supabaseAdmin) {
    return NextResponse.json({ error: "Officer not found." }, { status: 404 });
  }

  const { data: documents } = await (supabaseAdmin.from("documents") as any)
    .select("id, title, department, recipient_name, processed_by, created_at")
    .eq("processed_by", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  const items = documents ?? [];
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const metrics = {
    totalDocuments: items.length,
    todayDocuments: items.filter((item: any) => new Date(item.created_at) >= startOfToday).length,
    weekDocuments: items.filter((item: any) => new Date(item.created_at) >= startOfWeek).length,
    monthDocuments: items.filter((item: any) => new Date(item.created_at) >= startOfMonth).length,
    lastGeneratedAt: items[0]?.created_at ?? null,
  };

  return NextResponse.json({
    officer: {
      userId: context.user_id,
      email: context.email,
      fullName: context.full_name,
      designation: context.designation,
      department: context.department,
      role: context.role,
      approved: context.approved,
      canGenerate: context.canGenerate,
    },
    metrics,
    recentDocuments: items.slice(0, 6),
    documents: items,
  });
}
