import { NextResponse } from "next/server";
import {
  stampUploadedDocument,
  type Department,
} from "@/lib/document-processing";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const defaultDepartment: Department = "BCA";
const bucketName = "documents";

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

    const result = await stampUploadedDocument(uploadedFile, department);

    const storagePath = buildStoragePath(result.documentId, result.fileName);
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(storagePath, Buffer.from(result.buffer), {
        contentType: result.contentType,
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

    const { error: insertError } = await supabaseAdmin.from("documents").insert({
      id: result.documentId,
      department,
      title,
      recipient_name: recipientName,
      issue_date: issueDate || null,
      expiry_date: expiryDate || null,
      storage_path: storagePath,
      mime_type: result.contentType,
      file_size: result.buffer.byteLength,
      original_file_name: originalFileName,
      processed_file_name: result.fileName,
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
        "X-Storage-Path": storagePath,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to stamp the document.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}