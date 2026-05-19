"use client";

import {
  AlertCircle,
  AlertTriangle,
  Camera,
  Database,
  Info,
  Keyboard,
  Lock,
  SearchCheck,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Footer } from "@/components/ui/footer";

type VerificationMode = "manual" | "scan";

type VerificationStatus = "authentic" | "invalid" | "revoked";

type VerificationResult = {
  status: VerificationStatus;
  documentId?: string;
  title?: string;
  department?: string;
  recipient?: string;
  issueDate?: string;
  expiryDate?: string;
};

type ResultRow = {
  label: string;
  value: string | undefined;
  monospace?: boolean;
};

const formatResult = (value: string) => value.trim().toUpperCase();

export default function VerifyDocumentPage() {
  const [mode, setMode] = useState<VerificationMode>("manual");
  const [documentId, setDocumentId] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const verifyDocument = useCallback(async (rawDocumentId: string): Promise<VerificationResult> => {
    const normalized = formatResult(rawDocumentId);

    if (!normalized) {
      return { status: "invalid" };
    }

    setIsChecking(true);

    try {
      const response = await fetch(`/api/verify?id=${encodeURIComponent(normalized)}`);
      const payload = (await response.json().catch(() => null)) as
        | VerificationResult
        | { error?: string }
        | null;

      if (!response.ok || !payload || !("status" in payload)) {
        return { status: "invalid" };
      }

      return payload as VerificationResult;
    } catch {
      return { status: "invalid" };
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    if (!scanning || !videoRef.current) {
      return;
    }

    let cancelled = false;

    const detectorClass =
      typeof window !== "undefined" && "BarcodeDetector" in window
        ? (window as Window & {
            BarcodeDetector: new (options?: { formats?: string[] }) => {
              detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>>;
            };
          }).BarcodeDetector
        : null;

    if (!detectorClass) {
      return () => {
        cancelled = true;
      };
    }

    const detector = new detectorClass({ formats: ["code_128", "code_39", "qr_code"] });

    const tick = async () => {
      if (cancelled || !scanning || !videoRef.current) {
        return;
      }

      try {
        const codes = await detector.detect(videoRef.current);
        const detectedValue = codes[0]?.rawValue;

        if (detectedValue) {
          const verificationResult = await verifyDocument(detectedValue);
          setResult(verificationResult);
          setScanning(false);
          streamRef.current?.getTracks().forEach((track) => track.stop());
          return;
        }
      } catch {
        // Best-effort camera demo only.
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);

    return () => {
      cancelled = true;
    };
  }, [scanning, verifyDocument]);

  const handleManualVerify = async () => {
    setResult(await verifyDocument(documentId));
  };

  const startCamera = async () => {
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setMode("scan");
      setScanning(true);
    } catch {
      setCameraError("Camera access is unavailable in this browser or was denied.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScanning(false);
  };

  const resetVerification = () => {
    setResult(null);
    setDocumentId("");
    setMode("manual");
    stopCamera();
    setCameraError(null);
  };

  const renderRows = (rows: ResultRow[]) => (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[0_1px_0_rgba(255,255,255,0.8)]">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-1 gap-2 border-b border-[#F3F4F6] px-5 py-3.5 last:border-b-0 sm:grid-cols-[160px_1fr] sm:items-center"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#9CA3AF]">{row.label}</p>
          <div className="text-sm text-[#111827]">
            {row.label === "Status" ? (
              <span className="inline-flex items-center rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#065F46]">
                <span className="dot-pulse mr-2 h-2 w-2 rounded-full bg-[#10B981]" />
                Active
              </span>
            ) : row.monospace ? (
              <span className="font-mono font-semibold tracking-[0.02em] text-[#0D2B1F]">{row.value}</span>
            ) : (
              row.value
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderResult = () => {
    if (!result) {
      return null;
    }

    if (result.status === "authentic") {
      const rows: ResultRow[] = [
        { label: "Document ID", value: result.documentId, monospace: true },
        { label: "Title", value: result.title },
        { label: "Department", value: result.department },
        { label: "Recipient", value: result.recipient },
        { label: "Issue Date", value: result.issueDate },
        { label: "Expiry Date", value: result.expiryDate },
        { label: "Status", value: "Active" },
      ];

      return (
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-2xl border border-[rgba(201,168,76,0.3)] bg-[linear-gradient(135deg,#0D2B1F_0%,#1B4332_100%)] p-5 text-white shadow-[0_12px_30px_rgba(13,43,31,0.16)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(201,168,76,0.15)] text-[#C9A84C]">
                  <ShieldCheck className="h-[22px] w-[22px]" />
                </div>
                <div>
                  <p className="playfair text-[22px] font-bold leading-tight text-white">Document Authentic</p>
                  <p className="mt-1 text-[13px] leading-6 text-white/60">This document is verified in the GDA-DVS database.</p>
                </div>
              </div>
              <span className="rounded-full bg-[#C9A84C] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#0D2B1F]">
                Verified
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-white shadow-[0_4px_20px_rgba(13,43,31,0.04)]">
            {renderRows(rows)}

            <button
              type="button"
              onClick={resetVerification}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#0D2B1F] px-5 py-3.5 text-sm font-semibold text-[#0D2B1F] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0D2B1F] hover:text-white hover:shadow-[0_8px_24px_rgba(13,43,31,0.18)]"
            >
              Verify Another Document
            </button>
          </div>
        </div>
      );
    }

    if (result.status === "revoked") {
      return (
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-2xl border border-[rgba(251,146,60,0.3)] bg-[linear-gradient(135deg,#431407_0%,#7C2D12_100%)] p-5 text-white shadow-[0_12px_30px_rgba(67,20,7,0.16)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(251,146,60,0.15)] text-[#FB923C]">
                  <AlertCircle className="h-[22px] w-[22px]" />
                </div>
                <div>
                  <p className="playfair text-[22px] font-bold leading-tight text-white">Document Revoked</p>
                  <p className="mt-1 text-[13px] leading-6 text-white/60">This document has been officially revoked and is no longer valid.</p>
                </div>
              </div>
              <span className="rounded-full bg-[#F97316] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                Revoked
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] p-5 shadow-[0_4px_20px_rgba(13,43,31,0.04)]">
            <div className="flex items-start gap-3 text-[#92400E]">
              <AlertTriangle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#F97316]" />
              <p className="text-sm leading-7">This document exists in our system but has been officially revoked and is no longer valid. Contact the issuing department for further information.</p>
            </div>
            <button
              type="button"
              onClick={resetVerification}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#0D2B1F] px-5 py-3.5 text-sm font-semibold text-[#0D2B1F] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0D2B1F] hover:text-white hover:shadow-[0_8px_24px_rgba(13,43,31,0.18)]"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(239,68,68,0.3)] bg-[linear-gradient(135deg,#450A0A_0%,#7F1D1D_100%)] p-5 text-white shadow-[0_12px_30px_rgba(69,10,10,0.18)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(248,113,113,0.15)] text-[#F87171]">
                <XCircle className="h-[22px] w-[22px]" />
              </div>
              <div>
                <p className="playfair text-[22px] font-bold leading-tight text-white">Document Not Found</p>
                <p className="mt-1 text-[13px] leading-6 text-white/60">No matching record found in the GDA-DVS database.</p>
              </div>
            </div>
            <span className="rounded-full bg-[#EF4444] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
              Invalid
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[0_4px_20px_rgba(13,43,31,0.04)]">
          <div className="flex items-start gap-3 text-[#374151]">
            <XCircle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#EF4444]" />
            <p className="text-sm leading-7">No record was found matching this Document ID. The document may be fabricated or contain an error.</p>
          </div>

          <div className="mt-3 rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] p-4">
            <div className="flex items-start gap-3 text-[#991B1B]">
              <AlertTriangle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#DC2626]" />
              <p className="text-sm leading-7">If this document was presented to you in an official capacity, report it immediately to the relevant government department or law enforcement.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetVerification}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#0D2B1F] px-5 py-3.5 text-sm font-semibold text-[#0D2B1F] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0D2B1F] hover:text-white hover:shadow-[0_8px_24px_rgba(13,43,31,0.18)]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-[var(--color-bg)] pb-20">
        <section className="bg-[var(--color-deep)] pb-16 pt-14">
          <div className="mx-auto flex max-w-[640px] flex-col items-center px-4 text-center sm:px-6 lg:px-8">
            <div className="animate-fade-in-up flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.12)] text-[#C9A84C]">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="animate-fade-in-up delay-100 mt-5 playfair text-4xl font-bold tracking-tight text-white sm:text-[42px]">
              Verify Document Authenticity
            </h1>
            <p className="animate-fade-in-up delay-200 mt-3 max-w-xl text-sm leading-8 text-white/55 sm:text-[15px]">
              Enter the Document ID printed on your official document, or use your camera to scan the embedded barcode for instant verification.
            </p>
            <div className="animate-fade-in-up delay-300 mt-6 flex flex-wrap justify-center gap-2">
              {[
                [Lock, "Secure Verification"],
                [Database, "Real-time Database"],
                [ShieldCheck, "Government Certified"],
              ].map(([Icon, label]) => (
                <span
                  key={label as string}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] px-4 py-1.5 text-[11px] text-white/50"
                >
                  <Icon className="h-3.5 w-3.5 text-[#C9A84C]" />
                  {label as string}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto -mt-8 max-w-2xl px-4 sm:px-6 lg:px-8">
          <section className="animate-fade-in-up delay-200 rounded-3xl border border-[var(--color-border)] bg-white p-8 shadow-[0_4px_32px_rgba(13,43,31,0.08)]">
            {result ? (
              renderResult()
            ) : (
              <div className="space-y-6">
                <div className="mx-auto inline-flex rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-1.5">
                  <button
                    type="button"
                    onClick={() => setMode("manual")}
                    className={`relative inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                      mode === "manual"
                        ? "bg-[#0D2B1F] text-white shadow-sm"
                        : "text-[#6B7280] hover:bg-white hover:text-[#0D2B1F]"
                    }`}
                  >
                    {mode === "manual" ? (
                      <span className="absolute -top-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#C9A84C]" />
                    ) : null}
                    <Keyboard className="h-[15px] w-[15px]" />
                    Enter Document ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("scan")}
                    className={`relative inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                      mode === "scan"
                        ? "bg-[#0D2B1F] text-white shadow-sm"
                        : "text-[#6B7280] hover:bg-white hover:text-[#0D2B1F]"
                    }`}
                  >
                    {mode === "scan" ? (
                      <span className="absolute -top-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#C9A84C]" />
                    ) : null}
                    <Camera className="h-[15px] w-[15px]" />
                    Scan Barcode
                  </button>
                </div>

                {mode === "manual" ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Keyboard className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                      <input
                        value={documentId}
                        onChange={(event) => setDocumentId(event.target.value)}
                        placeholder="e.g. GDA-BCA-2026-A1B2C3D4"
                        className="w-full rounded-xl border-[1.5px] border-[var(--color-border)] bg-[#F9FAFB] px-5 py-3.5 pl-11 text-[15px] text-[#111827] outline-none transition-all duration-300 placeholder:text-[#9CA3AF] focus:border-[#C9A84C] focus:bg-white focus:ring-0"
                      />
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-xl border border-[rgba(201,168,76,0.15)] bg-[rgba(201,168,76,0.06)] px-4 py-2.5 text-[12px] text-[#9CA3AF]">
                      <Info className="h-3.5 w-3.5 text-[#C9A84C]" />
                      <span>Format: GDA-[DEPT]-[YEAR]-[ID]</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleManualVerify}
                      disabled={isChecking}
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D2B1F] px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1B4332] hover:shadow-[0_8px_24px_rgba(13,43,31,0.25)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#D1D5DB] disabled:shadow-none"
                    >
                      {isChecking ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                      ) : (
                        <SearchCheck className="h-[17px] w-[17px]" />
                      )}
                      <span>{isChecking ? "Verifying..." : "Verify Now"}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-[#0D2B1F] bg-transparent px-6 py-4 text-sm font-semibold text-[#0D2B1F] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0D2B1F] hover:text-white hover:shadow-[0_8px_24px_rgba(13,43,31,0.25)]"
                    >
                      <Camera className="h-[17px] w-[17px]" />
                      Start Camera
                    </button>

                    <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[#0D2B1F]">
                      <div className="relative aspect-[4/3] w-full">
                        <video
                          ref={videoRef}
                          playsInline
                          muted
                          className={`h-full w-full object-cover ${scanning ? "opacity-100" : "opacity-0"}`}
                        />
                        {!scanning ? (
                          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                            <Camera className="h-10 w-10 text-white/20" />
                            <p className="mt-3 text-[13px] text-white/30">Camera preview will appear here</p>
                          </div>
                        ) : null}

                        <span className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-[#C9A84C]" />
                        <span className="pointer-events-none absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-[#C9A84C]" />
                        <span className="pointer-events-none absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-[#C9A84C]" />
                        <span className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-[#C9A84C]" />

                        {scanning ? (
                          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                            <div className="animate-scan-line absolute inset-x-0 top-0 h-0.5 bg-[#C9A84C] shadow-[0_0_20px_rgba(201,168,76,0.8)]" />
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <p className="flex items-center justify-center gap-2 text-[12px] text-[#6B7280]">
                      <Camera className="h-3.5 w-3.5 text-[#C9A84C]" />
                      Point camera at the barcode printed on the document
                    </p>

                    {scanning ? (
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-[#DC2626] bg-transparent px-6 py-4 text-sm font-semibold text-[#DC2626] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#DC2626] hover:bg-[#FEF2F2] hover:shadow-[0_8px_24px_rgba(220,38,38,0.12)]"
                      >
                        <Camera className="h-[17px] w-[17px]" />
                        Stop Camera
                      </button>
                    ) : null}

                    {cameraError ? (
                      <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED] p-4">
                        <div className="flex items-start gap-3 text-[#9A3412]">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#F97316]" />
                          <p className="text-[13px] leading-6">{cameraError}</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}