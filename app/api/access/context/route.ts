import { NextResponse } from "next/server";
import { getOfficerContextByUserId } from "@/lib/officer-access";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId")?.trim();

  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  const context = await getOfficerContextByUserId(userId);

  if (!context) {
    return NextResponse.json({ found: false }, { status: 404 });
  }

  return NextResponse.json({
    found: true,
    userId: context.user_id,
    email: context.email,
    fullName: context.full_name,
    designation: context.designation,
    department: context.department,
    role: context.role,
    confirmed: context.confirmed,
    approved: context.approved,
    isAdmin: context.isAdmin,
    canGenerate: context.canGenerate,
    isPending: context.isPending,
  });
}
