import { NextResponse } from "next/server";
import {
  stampUploadedDocument,
  type Department,
} from "@/lib/document-processing";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getOfficerContextByUserId } from "@/lib/officer-access";

export const runtime = "nodejs";

const defaultDepartment: Department = "BCA";
const barcodeBucket = "documents";

const validDepartments: Record<Department, true> = {
  BCA: true,
  Education: true,
  Health: true,
  Police: true,
  Revenue: true,
  Transport: true,
};

const buildStoragePath = (documentId: string, fileName: string) => {
  const extension = fileName.toLowerCase().endsWith(".pdf") ? "pdf" : "docx";
  return `${documentId}/${fileName.replace(/\.[^.]+$/, "")}.${extension}`;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const uploadedFile = formData.get("file");

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json({ error: "Please upload a PDF or DOCX file." }, { status: 400 });
    }

    const departmentValue = formData.get("department");
    const department =
      typeof departmentValue === "string" && departmentValue in validDepartments
        ? (departmentValue as Department)
        : defaultDepartment;

    const processedBy = String(formData.get("processedBy") ?? "").trim();

    if (!processedBy) {
      return NextResponse.json({ error: "Officer authorization is required." }, { status: 401 });
    }

    const officerContext = await getOfficerContextByUserId(processedBy);

    if (!officerContext || (!officerContext.canGenerate && !officerContext.isAdmin)) {
      return NextResponse.json({ error: "You are not approved to generate documents yet." }, { status: 403 });
    }

    const result = await stampUploadedDocument(uploadedFile, department);
    const supabaseAdmin = getSupabaseAdmin();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Missing Supabase environment variables." },
        { status: 500 },
      );
    }

    // Instead of storing the full processed PDF/DOCX in Supabase storage,
    // only store the barcode PNG to reduce storage usage. The processed file
    // is still returned to the officer for download in the response.
    const barcodePath = `${result.documentId}/gdavs-barcode.png`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(barcodeBucket)
      .upload(barcodePath, Buffer.from(result.barcodeBuffer), {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const originalFileName = uploadedFile.name;
    const title = String(formData.get("title") ?? "");
    const recipientName = String(formData.get("recipientName") ?? "");
    const issueDate = String(formData.get("issueDate") ?? "");
    const expiryDate = String(formData.get("expiryDate") ?? "");


    const documentsTable = supabaseAdmin.from("documents") as any;

    const { error: insertError } = await documentsTable.insert({
      id: result.documentId,
      department,
      title,
      recipient_name: recipientName,
      issue_date: issueDate || null,
      expiry_date: expiryDate || null,
      // store the barcode image path (stored in `documents` bucket)
      storage_path: barcodePath,
      mime_type: "image/png",
      file_size: result.barcodeBuffer.byteLength,
      original_file_name: originalFileName,
      processed_file_name: result.fileName,
      processed_by: processedBy,
    });

    if (insertError) {
      throw insertError;
    }

    return new NextResponse(Buffer.from(result.buffer), {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": `attachment; filename="${result.fileName}"`,
        "X-Document-Id": result.documentId,
        "X-Output-Name": result.fileName,
        "X-Storage-Path": barcodePath,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to stamp the document.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
