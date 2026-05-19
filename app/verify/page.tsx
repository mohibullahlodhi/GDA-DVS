"use client";

import React, { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
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
import { Footer } from "@/components/ui/footer";
import { BackgroundPaths } from "@/components/ui/background-paths";

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

// Subcomponent that uses useSearchParams inside a Suspense block
function VerifyContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<VerificationMode>("manual");
  const [documentId, setDocumentId] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  // Auto-verify on mount if "id" param exists in URL
  useEffect(() => {
    const idParam = searchParams.get("id");
    if (idParam) {
      const cleanId = idParam.trim();
      const autoVerify = async () => {
        await Promise.resolve(); // Defer state update asynchronously to avoid synchronous effect warnings
        setDocumentId(cleanId);
        const res = await verifyDocument(cleanId);
        setResult(res);
      };
      autoVerify();
    }
  }, [searchParams, verifyDocument]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Barcode Detection tick
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
        // Best-effort camera check
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);

    return () => {
      cancelled = true;
    };
  }, [scanning, verifyDocument]);

  const handleManualVerify = async () => {
    if (!documentId.trim()) return;
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
      setCameraError("Camera access is unavailable or permission was denied.");
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
    <div className="overflow-hidden rounded-2xl border border-gray-150 bg-white">
      {rows.map((row, idx) => (
        <div
          key={row.label}
          className={`grid grid-cols-1 gap-1 border-b border-gray-100 px-5 py-4 last:border-b-0 sm:grid-cols-[160px_1fr] sm:items-center ${
            idx % 2 === 0 ? "bg-white" : "bg-[#F8FAF9]/40"
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dmsans">
            {row.label}
          </p>
          <div className="text-sm text-[#0B1F33] font-medium dmsans">
            {row.label === "Status" ? (
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            ) : row.monospace ? (
              <span className="font-mono text-xs font-semibold tracking-wider bg-gray-50 border border-gray-100 rounded px-2 py-0.5 text-[#1b4332]">
                {row.value}
              </span>
            ) : (
              row.value
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderResult = () => {
    if (!result) return null;

    if (result.status === "authentic") {
      const rows: ResultRow[] = [
        { label: "Document ID", value: result.documentId, monospace: true },
        { label: "Title", value: result.title },
        { label: "Department", value: result.department },
        { label: "Recipient / Entity", value: result.recipient },
        { label: "Issue Date", value: result.issueDate },
        { label: "Expiry Date", value: result.expiryDate || "N/A" },
        { label: "Status", value: "Active" },
      ];

      return (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl border border-emerald-600/20 bg-gradient-to-br from-[#1b4332] to-[#081c15] p-6 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[var(--color-accent)] shadow-sm">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="playfair text-xl sm:text-2xl font-bold text-white">Document Authentic</h3>
                  <p className="mt-1 text-xs text-white/60 dmsans font-light">
                    This document is verified and officially registered in the GDA-DVS registry.
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-center rounded-full bg-[var(--color-accent)] px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#0B1F33] shadow-md dmsans">
                Verified System Lock
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
            {renderRows(rows)}

            <button
              type="button"
              onClick={resetVerification}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B1F33] hover:bg-[#153454] px-5 py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 shadow-md playfair"
            >
              Verify Another Document
            </button>
          </div>
        </div>
      );
    }

    if (result.status === "revoked") {
      return (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-[#7C2D12] to-[#431407] p-6 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-orange-400">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="playfair text-xl sm:text-2xl font-bold text-white">Document Revoked</h3>
                  <p className="mt-1 text-xs text-white/60 dmsans font-light">
                    This document has been officially cancelled and is no longer valid.
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-center rounded-full bg-orange-500 px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-widest text-white shadow-md dmsans">
                Revoked Status
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-orange-50/30 p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-3 text-orange-850">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
              <p className="text-sm leading-relaxed dmsans font-light text-orange-900">
                This document exists in the GDA archives but its verification status has been changed to **Revoked**. Institutional agents should reject this file. Contact GDA headquarters for clearance inquiries.
              </p>
            </div>
            <button
              type="button"
              onClick={resetVerification}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B1F33] hover:bg-[#153454] px-5 py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 shadow-md playfair"
            >
              Verify Another Document
            </button>
          </div>
        </div>
      );
    }

    // Invalid Status
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-[#7F1D1D] to-[#450A0A] p-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-red-400">
                <XCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="playfair text-xl sm:text-2xl font-bold text-white">Record Not Found</h3>
                <p className="mt-1 text-xs text-white/60 dmsans font-light">
                  No match was found in the official verification system.
                </p>
              </div>
            </div>
            <span className="self-start sm:self-center rounded-full bg-red-650 px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-widest text-white shadow-md dmsans">
              Invalid Entry
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50/20 p-6 space-y-4">
          <div className="flex items-start gap-3 text-red-900">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <p className="text-sm leading-relaxed dmsans font-light">
              We could not find any active registry records corresponding to the submitted Document ID. Please double check characters or spacing formats.
            </p>
          </div>

          <div className="rounded-xl border border-red-100 bg-red-50/50 p-4">
            <div className="flex items-start gap-3 text-red-950">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-650" />
              <p className="text-xs leading-relaxed dmsans font-light text-red-800">
                Warning: If this document has been presented to you as a certified original GDA certificate or land deed, it might be fabricated. Report suspicious documents to legal authorities immediately.
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={resetVerification}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B1F33] hover:bg-[#153454] px-5 py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 shadow-md playfair"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full -mt-16 z-25">
      {/* Background extension block to prevent layout cut-off on the sides of the negative margin container */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-[#0B1F33]" />
      
      <div className="relative mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 z-10">
        <section className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xl">
          {result ? (
            renderResult()
          ) : (
            <div className="space-y-6">
              {/* Mode selection tabs */}
              <div className="flex rounded-2xl border border-gray-150 bg-gray-50 p-1.5 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => setMode("manual")}
                  className={`group relative flex-1 flex items-center justify-center gap-2.5 rounded-xl py-3.5 text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                    mode === "manual"
                      ? "bg-[#0B1F33] text-white shadow-md"
                      : "text-gray-500 hover:text-[#0B1F33] hover:bg-white"
                  }`}
                >
                  <Keyboard
                    className={`h-4.5 w-4.5 transition-colors duration-300 ${
                      mode === "manual" ? "text-[var(--color-accent)]" : "text-gray-400 group-hover:text-[#0B1F33]"
                    }`}
                  />
                  <span>Manual Entry</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("scan")}
                  className={`group relative flex-1 flex items-center justify-center gap-2.5 rounded-xl py-3.5 text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                    mode === "scan"
                      ? "bg-[#0B1F33] text-white shadow-md"
                      : "text-gray-500 hover:text-[#0B1F33] hover:bg-white"
                  }`}
                >
                  <Camera
                    className={`h-4.5 w-4.5 transition-colors duration-300 ${
                      mode === "scan" ? "text-[var(--color-accent)]" : "text-gray-400 group-hover:text-[#0B1F33]"
                    }`}
                  />
                  <span>Scan Barcode</span>
                </button>
              </div>

            {/* MANUAL ENTRY MODE */}
            {mode === "manual" ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B1F33] pl-1 dmsans">
                    Document ID
                  </label>
                  <div className="relative focus-within:shadow-[0_0_20px_rgba(201,168,76,0.12)] rounded-xl transition-all duration-300">
                    <Keyboard className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
                    <input
                      value={documentId}
                      onChange={(event) => setDocumentId(event.target.value)}
                      placeholder="e.g. GDA-REV-2026-X8A2"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 pl-12 text-sm text-[#0B1F33] outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-[var(--color-accent)] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl border border-[rgba(201,168,76,0.15)] bg-[rgba(201,168,76,0.06)] px-4 py-3 text-xs text-gray-600 dmsans font-light">
                  <Info className="h-4.5 w-4.5 text-[rgba(201,168,76,0.95)] shrink-0" />
                  <span>Format requirement: GDA-[DEPT]-[YEAR]-[ID]</span>
                </div>

                <button
                  type="button"
                  onClick={handleManualVerify}
                  disabled={isChecking || !documentId.trim()}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B1F33] hover:bg-[#153454] px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none playfair"
                >
                  {isChecking ? (
                    <span className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-r-transparent" />
                  ) : (
                    <SearchCheck className="h-4.5 w-4.5" />
                  )}
                  <span>{isChecking ? "Accessing Registry..." : "Verify Credentials"}</span>
                </button>
              </div>
            ) : (
              /* SCANNING CAMERA MODE */
              <div className="space-y-5">
                {!scanning ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#0B1F33] bg-transparent hover:bg-gray-50 px-6 py-4 text-sm font-semibold text-[#0B1F33] transition-all duration-300 hover:-translate-y-0.5 shadow-sm playfair"
                  >
                    <Camera className="h-4.5 w-4.5" />
                    <span>Initialize Camera Scanner</span>
                  </button>
                ) : null}

                <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-[#0B1F33] shadow-inner">
                  <div className="relative aspect-[4/3] w-full">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className={`h-full w-full object-cover transition-opacity duration-300 ${
                        scanning ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    {!scanning && (
                      <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center space-y-2">
                        <Camera className="h-10 w-10 text-white/10" />
                        <p className="text-xs text-white/40 dmsans font-light">Camera feed standby</p>
                      </div>
                    )}

                    {/* Scanner bounds overlays */}
                    <span className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-[var(--color-accent)]" />
                    <span className="pointer-events-none absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-[var(--color-accent)]" />
                    <span className="pointer-events-none absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-[var(--color-accent)]" />
                    <span className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-[var(--color-accent)]" />

                    {scanning && (
                      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-[var(--color-accent)] shadow-[0_0_20px_rgba(201,168,76,1)] animation-scan" />
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-center text-xs text-gray-500 dmsans font-light">
                  Center the Code128 barcode or QR code badge within the camera brackets.
                </p>

                {scanning && (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-650 bg-transparent hover:bg-red-50/50 px-6 py-4 text-sm font-semibold text-red-600 transition-all duration-300 hover:-translate-y-0.5 dmsans"
                  >
                    <span>Terminate Scanner</span>
                  </button>
                )}

                {cameraError && (
                  <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4">
                    <div className="flex items-start gap-3 text-orange-950">
                      <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-orange-500" />
                      <p className="text-xs leading-relaxed dmsans font-light text-orange-900">{cameraError}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>
      </div>
    </div>
  );
}

export default function VerifyDocumentPage() {
  return (
    <>
      <div className="min-h-screen bg-[var(--color-bg)] pb-24 relative overflow-hidden">
        {/* Custom animations */}
        <style jsx global>{`
          .animation-scan {
            animation: scanner-sweep 2.8s infinite ease-in-out;
          }
          @keyframes scanner-sweep {
            0% { top: 0%; opacity: 0.1; }
            50% { top: 100%; opacity: 1; }
            100% { top: 0%; opacity: 0.1; }
          }
          .perspective-1000 {
            perspective: 1000px;
          }
          .preserve-3d {
            transform-style: preserve-3d;
          }
          .backface-hidden {
            backface-visibility: hidden;
          }
        `}</style>

        {/* PAGE HEADER SECTION */}
        <section className="bg-[#0B1F33] pb-28 pt-24 relative overflow-hidden">
          {/* Glowing background paths */}
          <BackgroundPaths mode="background" className="opacity-70" />
          
          {/* Radial overlays */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(27,67,50,0.25)_0%,transparent_75%)] z-5" />
          
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Heading and info */}
              <div className="md:col-span-7 text-left space-y-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.12)] text-[var(--color-accent)] shadow-lg">
                  <Lock className="h-5 w-5" />
                </div>
                
                <h1 className="playfair text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                  Verify Document Authenticity
                </h1>
                
                <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-white/70 dmsans font-light">
                  Authenticate government records, land titles, and GDA certificate stamps in real-time. Enter the printed Document ID below or initialize your camera scanner to instantly query the ledger.
                </p>
                
                {/* Quick Trust badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {[
                    [Lock, "End-to-End Encryption"],
                    [Database, "Decentralized Registry Lookup"],
                    [ShieldCheck, "Official GDA Seal"],
                  ].map(([Icon, label], idx) => {
                    const LucideIcon = Icon as React.ComponentType<{ className?: string }>;
                    return (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[10px] text-white/60 font-light dmsans"
                      >
                        <LucideIcon className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                        <span>{label as string}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: 3D Holographic Credential Badge */}
              <div className="md:col-span-5 flex justify-center md:justify-end">
                <div className="perspective-1000 w-[300px] h-[300px] relative hidden md:block select-none">
                  <motion.div
                    className="w-full h-full preserve-3d"
                    animate={{
                      rotateY: [-10, 10, -10],
                      rotateX: [6, -6, 6],
                      y: [-6, 6, -6]
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {/* Glassmorphic Holo Badge */}
                    <div className="absolute inset-0 rounded-3xl border border-white/20 bg-white/5 backdrop-blur-md p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
                      {/* Holographic glowing lines in bg */}
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(201,168,76,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-[pulse_4s_infinite]" />
                      
                      {/* Top bar */}
                      <div className="flex items-start justify-between relative z-10">
                        <div className="space-y-1">
                          <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--color-accent)] dmsans">
                            GDA Registry
                          </span>
                          <h4 className="text-xs font-bold text-white tracking-wider dmsans uppercase">
                            Secure Seal DVS
                          </h4>
                        </div>
                        {/* Rotating 3D Emblem */}
                        <motion.div
                          className="h-9 w-9 rounded-xl bg-[rgba(201,168,76,0.15)] flex items-center justify-center text-[var(--color-accent)] border border-[rgba(201,168,76,0.3)] shadow-inner"
                          animate={{ rotateY: 360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        >
                          <ShieldCheck size={18} />
                        </motion.div>
                      </div>

                      {/* Middle barcode representation */}
                      <div className="space-y-3 relative z-10">
                        <div className="h-6 w-full flex items-center justify-between opacity-60">
                          {Array.from({ length: 28 }).map((_, i) => (
                            <span
                              key={i}
                              className="bg-white rounded-sm"
                              style={{
                                width: i % 3 === 0 ? "2px" : i % 5 === 0 ? "4px" : "1px",
                                height: i % 2 === 0 ? "100%" : "70%",
                              }}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between text-[7px] text-white/50 font-mono tracking-widest uppercase">
                          <span>Verified Certificate</span>
                          <span>ID: 8A2-DVS</span>
                        </div>
                      </div>

                      {/* Bottom lock layer */}
                      <div className="flex items-center justify-between relative z-10 pt-2 border-t border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                          <span className="text-[9px] font-medium tracking-wider text-emerald-400 dmsans uppercase">
                            Registry Active
                          </span>
                        </div>
                        <Lock size={12} className="text-white/40" />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* MAIN LOOKUP CARD (Suspense wrapper to protect useSearchParams) */}
        <Suspense
          fallback={
            <div className="mx-auto -mt-16 max-w-2xl px-4 sm:px-6 lg:px-8 relative z-25">
              <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-xl flex flex-col items-center justify-center space-y-3">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--color-accent)] border-r-transparent" />
                <p className="text-xs text-gray-500 dmsans font-light">Preparing verification dashboard...</p>
              </div>
            </div>
          }
        >
          <VerifyContent />
        </Suspense>

      </div>
      <Footer />
    </>
  );
}