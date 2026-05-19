"use client";

import JsBarcode from "jsbarcode";
import {
  ArrowRight,
  Barcode,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Footer } from "@/components/ui/footer";
import type { ChangeEvent, DragEvent, FormEvent } from "react";

type Department = "BCA" | "Education" | "Health" | "Police" | "Revenue" | "Transport";

type GeneratedDocument = {
  id: string;
  department: Department;
  title: string;
  recipientName: string;
  issueDate: string;
  expiryDate: string;
};

const departments: Department[] = [
  "BCA",
  "Education",
  "Health",
  "Police",
  "Revenue",
  "Transport",
];

const initialIssueDate = () => {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
};

const formatBytes = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const defaultForm = {
  title: "",
  recipientName: "",
  department: "BCA" as Department,
  issueDate: initialIssueDate(),
  expiryDate: "",
};

export default function GenerateDocumentPage() {
  const [form, setForm] = useState(defaultForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<GeneratedDocument | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const barcodeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const previewDocumentId = generatedDocument?.id ?? "GDA-XXXX-XXXX";

  const previewSummary = useMemo(
    () => [
      { label: "Document ID", value: previewDocumentId },
      { label: "Department", value: form.department },
      { label: "Title", value: form.title || "Completion Certificate" },
      { label: "Recipient", value: form.recipientName || "Muhammad Ali Khan" },
      { label: "Issue Date", value: form.issueDate },
    ],
    [form.department, form.issueDate, form.recipientName, form.title, previewDocumentId],
  );

  useEffect(() => {
    if (!generatedDocument || !barcodeCanvasRef.current) {
      return;
    }

    JsBarcode(barcodeCanvasRef.current, generatedDocument.id, {
      format: "CODE128",
      displayValue: false,
      background: "#ffffff",
      lineColor: "#1B4332",
      margin: 0,
      width: 2,
      height: 90,
    });
  }, [generatedDocument]);

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const updateField = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleFile = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setDownloadUrl(null);
      setDownloadName("");
      setGeneratedDocument(null);
      setErrorMessage(null);
      return;
    }

    setSelectedFile(file);
    setDownloadUrl(null);
    setDownloadName("");
    setGeneratedDocument(null);
    setErrorMessage(null);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0] ?? null);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0] ?? null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setErrorMessage("Please upload a PDF or DOCX file first.");
      return;
    }

    if (!form.title.trim()) {
      setErrorMessage("Document title is required.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setGeneratedDocument(null);

    try {
      const payload = new FormData();
      payload.append("file", selectedFile);
      payload.append("department", form.department);
      payload.append("title", form.title);
      payload.append("recipientName", form.recipientName);
      payload.append("issueDate", form.issueDate);
      payload.append("expiryDate", form.expiryDate);

      const response = await fetch("/api/generate", {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Failed to stamp the document.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const documentId = response.headers.get("x-document-id") ?? previewDocumentId;
      const outputName = response.headers.get("x-output-name") ?? selectedFile.name;

      setDownloadUrl(url);
      setDownloadName(outputName);
      setGeneratedDocument({
        id: documentId,
        department: form.department,
        title: form.title,
        recipientName: form.recipientName || "Muhammad Ali Khan",
        issueDate: form.issueDate,
        expiryDate: form.expiryDate,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      setErrorMessage(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <section className="pt-10 sm:pt-14">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Home → Generate Document
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#1A1A1A] sm:text-4xl">
          Generate Official Document
        </h1>
      </section>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Document Information
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Document Title
                </span>
                <input
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  placeholder="e.g. Completion Certificate"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#40916C]"
                />
              </label>

              <label>
                <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Full Name
                </span>
                <input
                  value={form.recipientName}
                  onChange={(event) => updateField("recipientName", event.target.value)}
                  placeholder="e.g. Muhammad Ali Khan"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#40916C]"
                />
              </label>

              <label>
                <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Department
                </span>
                <select
                  value={form.department}
                  onChange={(event) => updateField("department", event.target.value as Department)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#40916C]"
                >
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </label>

              

              <label>
                <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Issue Date
                </span>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={(event) => updateField("issueDate", event.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pl-10 text-sm outline-none transition focus:ring-2 focus:ring-[#40916C]"
                  />
                </div>
              </label>

              <label>
                <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Expiry Date
                </span>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(event) => updateField("expiryDate", event.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pl-10 text-sm outline-none transition focus:ring-2 focus:ring-[#40916C]"
                  />
                </div>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="mb-5 text-xs font-medium uppercase tracking-wide text-gray-500">
              Upload Document
            </p>

            {selectedFile ? (
              <div className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 px-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#1B4332] shadow-sm">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatBytes(selectedFile.size)} • {selectedFile.type || "Document file"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleFile(null)}
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-white hover:text-[#1A1A1A]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                onDragEnter={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDrop={handleDrop}
                className={`flex cursor-pointer flex-col items-center rounded-2xl border border-dashed px-6 py-10 text-center transition-all ${
                  isDragging
                    ? "border-[#40916C] bg-green-50"
                    : "border-gray-300 bg-gray-50 hover:border-[#40916C] hover:bg-green-50"
                }`}
              >
                <UploadCloud className="h-12 w-12 text-gray-400" />
                <p className="mt-4 text-base font-medium text-[#1A1A1A]">
                  Drag and drop your PDF or DOCX file here
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  or click to browse — Max file size 10MB
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-1 text-xs font-medium text-[#1B4332] shadow-sm">
                  PDF • DOCX
                </div>
                <input
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </section>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#1B4332] px-6 py-3.5 text-sm font-medium text-white transition-all hover:bg-[#40916C] disabled:cursor-not-allowed disabled:bg-gray-400"
            disabled={isGenerating}
          >
            <Barcode className="h-4 w-4" />
            Stamp Barcode at Top
            <ArrowRight className="h-4 w-4" />
          </button>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}
        </div>

        <div className="relative">
          <section className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Document Preview
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#1A1A1A]">
                  Live-update preview
                </h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700">
                <Clock3 className="h-3.5 w-3.5" />
                Pending Generation
              </span>
            </div>

            {generatedDocument ? (
              <div className="animate-check-pop space-y-5">
                <div className="flex items-center gap-3 rounded-2xl bg-green-600 p-4 text-white">
                  <CheckCircle2 className="h-8 w-8" />
                  <div>
                    <p className="text-xl font-bold">Document Generated Successfully</p>
                    <p className="text-sm text-white/80">Ready for download and verification</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-[#F8FAF9] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Document ID
                      </p>
                      <p className="mt-1 font-mono text-lg font-semibold text-[#1B4332]">
                        {generatedDocument.id}
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                      Active
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="rounded-xl bg-white p-3">
                      <canvas ref={barcodeCanvasRef} className="w-full" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <a
                    href={downloadUrl ?? undefined}
                    download={downloadName || undefined}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B4332] px-5 py-3 text-sm font-medium text-white transition-all hover:bg-[#40916C] ${
                      downloadUrl ? "" : "pointer-events-none opacity-50"
                    }`}
                  >
                    <Download className="h-4 w-4" />
                    Download Processed File
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedDocument(null);
                      setDownloadUrl(null);
                      setDownloadName("");
                      setErrorMessage(null);
                      setIsGenerating(false);
                    }}
                    className="rounded-xl border border-[#1B4332] px-5 py-3 text-sm font-medium text-[#1B4332] transition-all hover:bg-[#D8F3DC]"
                  >
                    Generate Another
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-3 rounded-2xl border border-gray-100 bg-[#F8FAF9] p-4 sm:grid-cols-2">
                  {previewSummary.map((item) => (
                    <div key={item.label}>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#1A1A1A]">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                  <Barcode className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-sm font-medium text-[#1A1A1A]">
                    Barcode will appear here
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-gray-400" />
                    Status: Pending Generation
                  </span>
                  <span className="font-mono text-xs text-gray-400">{previewDocumentId}</span>
                </div>
              </div>
            )}

            {isGenerating ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white px-8 py-7 shadow-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-[#1B4332]" />
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    Stamping barcode at the top, please wait...
                  </p>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </form>
      </div>
      <Footer />
    </>
  );
}