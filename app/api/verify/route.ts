import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const documentId = url.searchParams.get("id")?.trim().toUpperCase();

  if (!documentId) {
    return NextResponse.json({ error: "Document ID is required." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("documents")
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
    .createSignedUrl(data.storage_path, 60);

  return NextResponse.json({
    status: "authentic",
    documentId: data.id,
    title: data.title,
    department: data.department,
    recipient: data.recipient_name,
    issueDate: data.issue_date,
    expiryDate: data.expiry_date ?? "No Expiry",
    fileName: data.processed_file_name,
    storagePath: data.storage_path,
    fileUrl: signedUrlError ? null : signedUrlData?.signedUrl ?? null,
  });
}