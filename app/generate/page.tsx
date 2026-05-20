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
  Lock,
  Database,
  ShieldCheck,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Footer } from "@/components/ui/footer";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { OfficerAppbar } from "@/components/ui/officer-appbar";
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
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [authChecking, setAuthChecking] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<GeneratedDocument | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const barcodeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const previewDocumentId = generatedDocument?.id ?? "GDA-XXXX-XXXX";

  const previewSummary = useMemo(
    () => [
      { label: "Document ID", value: previewDocumentId, monospace: true },
      { label: "Department", value: form.department },
      { label: "Title", value: form.title || "Completion Certificate" },
      { label: "Recipient Name", value: form.recipientName || "Muhammad Ali Khan" },
      { label: "Issue Date", value: form.issueDate },
    ],
    [form.department, form.issueDate, form.recipientName, form.title, previewDocumentId],
  );

  useEffect(() => {
    // Check that the current user is an authenticated, approved officer or admin
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user ?? null;

        if (!user) {
          router.replace("/signin");
          return;
        }

        const res = await fetch(`/api/access/context?userId=${user.id}`);
        const body = await res.json();

        if (!body?.found) {
          router.replace("/signin");
          return;
        }

        if (!body.canGenerate && !body.isAdmin) {
          router.replace("/pending");
          return;
        }

        setUserEmail(user.email ?? "");
        setCurrentUserId(user.id);
      } catch (err) {
        router.replace("/signin");
        return;
      } finally {
        setAuthChecking(false);
      }
    })();

    if (!generatedDocument || !barcodeCanvasRef.current) {
      return;
    }

    try {
      JsBarcode(barcodeCanvasRef.current, generatedDocument.id, {
        format: "CODE128",
        displayValue: false,
        background: "#ffffff",
        lineColor: "#1b4332",
        margin: 0,
        width: 2,
        height: 90,
      });
    } catch {
      // Fail-safe check
    }
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
      if (currentUserId) {
        payload.append("processedBy", currentUserId);
      }

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

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-text-soft)] font-dm-sans">
        Checking access...
      </div>
    );
  }

  return (
    <>
      <OfficerAppbar email={userEmail} active="generate" />
      <div className="min-h-screen bg-[var(--color-bg)] pb-24 relative overflow-hidden">
        {/* PAGE HEADER */}
        <section className="bg-[#0B1F33] pb-28 pt-24 relative overflow-hidden">
          {/* Background paths */}
          <BackgroundPaths mode="background" className="opacity-70" />
          
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(27,67,50,0.25)_0%,transparent_75%)] z-5" />
          
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.12)] text-[var(--color-accent)] shadow-lg">
                  <Barcode className="h-5 w-5" />
                </div>
                <h1 className="playfair text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                  Generate Official Document
                </h1>
                <p className="text-xs sm:text-sm leading-relaxed text-white/70 dmsans font-light">
                  Establish verification credentials for GDA deeds, land certificates, and executive orders. Upload your document and stamp it with a registry-indexed barcode instantly.
                </p>
              </div>

              {/* Trust parameters */}
              <div className="flex flex-wrap justify-center sm:justify-end gap-2 self-center">
                {[
                  [Lock, "Secure Stamping"],
                  [Database, "Active Ledger Entry"],
                  [ShieldCheck, "Realtime Audits"],
                ].map(([Icon, label], idx) => {
                  const LucideIcon = Icon as React.ComponentType<{ className?: string }>;
                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] text-white/60 font-light dmsans"
                    >
                      <LucideIcon className="h-3 w-3 text-[var(--color-accent)]" />
                      <span>{label as string}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* MAIN WORKSPACE LAYOUT */}
        <div className="relative w-full -mt-16 z-25">
          {/* Background helper block */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-[#0B1F33]" />
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
            <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              
              {/* LEFT COLUMN: Input form & file upload */}
              <div className="space-y-8">
                
                {/* Document Information Card */}
                <section className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xl space-y-6">
                  <div className="border-b border-gray-100 pb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#0B1F33] dmsans">
                      Section 01
                    </span>
                    <h3 className="playfair text-lg sm:text-xl font-bold text-[#0B1F33] mt-1">
                      Document Registry Metadata
                    </h3>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="sm:col-span-2 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 pl-1 dmsans">
                        Document Title
                      </span>
                      <input
                        value={form.title}
                        onChange={(event) => updateField("title", event.target.value)}
                        placeholder="e.g. Land Certification Letter"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-[#0B1F33] outline-none transition focus:border-[var(--color-accent)] focus:bg-white"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 pl-1 dmsans">
                        Recipient Name
                      </span>
                      <input
                        value={form.recipientName}
                        onChange={(event) => updateField("recipientName", event.target.value)}
                        placeholder="e.g. Muhammad Ali Khan"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-[#0B1F33] outline-none transition focus:border-[var(--color-accent)] focus:bg-white"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 pl-1 dmsans">
                        Department
                      </span>
                      <select
                        value={form.department}
                        onChange={(event) => updateField("department", event.target.value as Department)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-[#0B1F33] outline-none transition focus:border-[var(--color-accent)] focus:bg-white"
                      >
                        {departments.map((department) => (
                          <option key={department} value={department}>
                            {department} Department
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 pl-1 dmsans">
                        Issue Date
                      </span>
                      <div className="relative">
                        <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          value={form.issueDate}
                          onChange={(event) => updateField("issueDate", event.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pl-11 text-sm text-[#0B1F33] outline-none transition focus:border-[var(--color-accent)] focus:bg-white"
                        />
                      </div>
                    </label>

                    <label className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 pl-1 dmsans">
                        Expiry Date (Optional)
                      </span>
                      <div className="relative">
                        <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          value={form.expiryDate}
                          onChange={(event) => updateField("expiryDate", event.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pl-11 text-sm text-[#0B1F33] outline-none transition focus:border-[var(--color-accent)] focus:bg-white"
                        />
                      </div>
                    </label>
                  </div>
                </section>

                {/* Upload File Card */}
                <section className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xl space-y-6">
                  <div className="border-b border-gray-100 pb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#0B1F33] dmsans">
                      Section 02
                    </span>
                    <h3 className="playfair text-lg sm:text-xl font-bold text-[#0B1F33] mt-1">
                      Upload Target File
                    </h3>
                  </div>

                  {selectedFile ? (
                    <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                          <CheckCircle2 className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-[#0B1F33] truncate max-w-[240px] sm:max-w-md">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500 dmsans font-light">
                            {formatBytes(selectedFile.size)} • {selectedFile.type || "Document file"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFile(null)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-[#0B1F33] transition-all duration-300"
                      >
                        <X className="h-4.5 w-4.5" />
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
                      className={`flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all duration-300 ${
                        isDragging
                          ? "border-[var(--color-accent)] bg-[rgba(201,168,76,0.06)]"
                          : "border-gray-200 bg-gray-50 hover:border-[var(--color-accent)] hover:bg-white"
                      }`}
                    >
                      <UploadCloud className="h-12 w-12 text-gray-400 animate-pulse" />
                      <p className="mt-4 text-base font-semibold text-[#0B1F33] playfair">
                        Drag and drop your document here
                      </p>
                      <p className="mt-1.5 text-xs text-gray-500 dmsans font-light">
                        Supported formats: PDF, DOCX • Max size 10MB
                      </p>
                      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[rgba(201,168,76,0.15)] bg-[rgba(201,168,76,0.06)] px-4 py-1.5 text-[10px] font-bold text-gray-600 tracking-wider dmsans uppercase">
                        Select File
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

                {/* Primary generate Button */}
                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#0B1F33] hover:bg-[#153454] px-6 py-4.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none playfair"
                  disabled={isGenerating}
                >
                  <Barcode className="h-4.5 w-4.5 text-[var(--color-accent)]" />
                  <span>Stamp Official Barcode Badge</span>
                  <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </button>

                {errorMessage && (
                  <div className="rounded-2xl border border-red-100 bg-red-50/20 p-4">
                    <div className="flex items-start gap-3 text-red-900">
                      <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-red-650" />
                      <p className="text-xs leading-relaxed dmsans font-light text-red-800">{errorMessage}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Live preview module */}
              <div className="relative">
                <section className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xl space-y-6 h-full flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#0B1F33] dmsans">
                          Live Monitor
                        </span>
                        <h3 className="playfair text-lg sm:text-xl font-bold text-[#0B1F33] mt-1">
                          Document Stamp Preview
                        </h3>
                      </div>
                      
                      {!generatedDocument ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10px] font-semibold text-orange-700">
                          <Clock3 className="h-3 w-3 animate-spin" />
                          <span>Pending Upload</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Signed / Active</span>
                        </span>
                      )}
                    </div>

                    {generatedDocument ? (
                      <div className="space-y-6 animate-check-pop">
                        <div className="flex items-center gap-3.5 rounded-2xl bg-gradient-to-br from-[#1b4332] to-[#081c15] p-5 text-white shadow-lg">
                          <CheckCircle2 className="h-8 w-8 text-[var(--color-accent)] shrink-0" />
                          <div>
                            <p className="text-base font-bold playfair">Registration Cleared</p>
                            <p className="text-xs text-white/60 dmsans font-light">Document barcode stamped successfully.</p>
                          </div>
                        </div>

                        {/* Stamping details card */}
                        <div className="rounded-2xl border border-gray-100 bg-[#F8FAF9]/50 p-4 space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200/50 pb-3">
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dmsans">
                                Generated ID
                              </p>
                              <p className="font-mono text-sm font-semibold tracking-wider text-[#1b4332] bg-emerald-50/50 border border-emerald-100 rounded px-2 py-0.5 mt-1 inline-block">
                                {generatedDocument.id}
                              </p>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-emerald-100/50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-800">
                              Verified Registry
                            </span>
                          </div>

                          {/* Barcode Output render */}
                          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-inner flex items-center justify-center">
                            <div className="w-full bg-white p-2">
                              <canvas ref={barcodeCanvasRef} className="w-full h-auto max-h-[80px] mx-auto" />
                            </div>
                          </div>
                        </div>

                        {/* Actions block */}
                        <div className="grid gap-3 sm:grid-cols-2 pt-2">
                          <a
                            href={downloadUrl ?? undefined}
                            download={downloadName || undefined}
                            className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B1F33] hover:bg-[#153454] px-5 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 shadow-md ${
                              downloadUrl ? "" : "pointer-events-none opacity-50 cursor-not-allowed"
                            }`}
                          >
                            <Download className="h-4.5 w-4.5" />
                            <span>Download File</span>
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
                            className="rounded-xl border border-[#0B1F33] hover:bg-gray-50 px-5 py-3.5 text-sm font-semibold text-[#0B1F33] transition-all duration-300 hover:-translate-y-0.5 dmsans"
                          >
                            Generate New
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Standby Preview Details */
                      <div className="space-y-6">
                        <div className="rounded-2xl border border-gray-150 bg-[#F8FAF9]/50 overflow-hidden">
                          {previewSummary.map((item, idx) => (
                            <div
                              key={item.label}
                              className={`grid grid-cols-[140px_1fr] items-center gap-2 border-b border-gray-100 px-4 py-3.5 last:border-b-0 ${
                                idx % 2 === 0 ? "bg-white" : "bg-[#F8FAF9]/30"
                              }`}
                            >
                              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dmsans">
                                {item.label}
                              </span>
                              <span className={`text-xs font-semibold text-[#0B1F33] truncate ${
                                item.monospace ? "font-mono tracking-wider text-gray-500" : ""
                              }`}>
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Mock document frame */}
                        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-center flex flex-col items-center justify-center space-y-3">
                          <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200/50 shadow-sm">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-[#0B1F33] playfair">
                              Stamped File Standby
                            </p>
                            <p className="text-[10px] text-gray-400 dmsans font-light">
                              Upload document files to preview the generated CODE128 barcode footprint.
                            </p>
                          </div>
                        </div>

                        {/* Connection status tag */}
                        <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3.5 text-xs text-gray-500 shadow-sm dmsans">
                          <span className="inline-flex items-center gap-2 font-light">
                            <Clock3 className="h-4 w-4 text-gray-400 shrink-0" />
                            <span>System State: Awaiting Input</span>
                          </span>
                          <span className="font-mono text-[10px] text-gray-400 tracking-wider">
                            {previewDocumentId}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Active Processing Loader Backdrop overlay */}
                  {isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm z-50 rounded-3xl">
                      <div className="flex flex-col items-center gap-4 text-center p-6 max-w-xs">
                        <Loader2 className="h-10 w-10 animate-spin text-[#0B1F33]" />
                        <div className="space-y-1">
                          <h4 className="font-bold text-[#0B1F33] playfair">Stamping Barcode</h4>
                          <p className="text-xs text-gray-500 dmsans font-light">
                            Compressing layout buffers, injecting vector stamp data, and indexing document metadata record...
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              </div>

            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}