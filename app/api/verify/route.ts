import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const documentId = url.searchParams.get("id")?.trim().toUpperCase();
  const supabaseAdmin = getSupabaseAdmin();

  if (!documentId) {
    return NextResponse.json({ error: "Document ID is required." }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Missing Supabase environment variables." },
      { status: 500 },
    );
  }

  const documentsTable = supabaseAdmin.from("documents") as any;

  const { data, error } = await documentsTable
    .select(
      "id, department, title, recipient_name, issue_date, expiry_date, storage_path, mime_type, file_size, processed_file_name",
    )
    .eq("id", documentId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ status: "invalid" });
  }

  const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
    .from("documents")
    .createSignedUrl((data as any).storage_path, 60);

  return NextResponse.json({
    status: "authentic",
    documentId: (data as any).id,
    title: (data as any).title,
    department: (data as any).department,
    recipient: (data as any).recipient_name,
    issueDate: (data as any).issue_date,
    expiryDate: (data as any).expiry_date ?? "No Expiry",
    fileName: (data as any).processed_file_name,
    storagePath: (data as any).storage_path,
    fileUrl: signedUrlError ? null : signedUrlData?.signedUrl ?? null,
  });
}