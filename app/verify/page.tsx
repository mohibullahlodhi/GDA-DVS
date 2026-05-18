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
    <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[180px_1fr] sm:items-center"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{row.label}</p>
          <div className="text-sm text-[#1A1A1A]">
            {row.label === "Status" ? (
              <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                Active
              </span>
            ) : row.monospace ? (
              <span className="font-mono font-semibold text-[#1B4332]">{row.value}</span>
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
          <div className="flex items-center gap-3 rounded-xl bg-green-600 p-4 text-white">
            <ShieldCheck className="h-8 w-8" />
            <div>
              <p className="text-xl font-bold">Document Authentic</p>
              <p className="text-sm text-white/80">The document matched the GDAVS database.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            {renderRows(rows)}

            <button
              type="button"
              onClick={resetVerification}
              className="mt-5 w-full rounded-xl border border-[#1B4332] px-5 py-3 text-sm font-medium text-[#1B4332] transition-all hover:bg-[#D8F3DC]"
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
          <div className="flex items-center gap-3 rounded-xl bg-orange-600 p-4 text-white">
            <AlertCircle className="h-8 w-8" />
            <div>
              <p className="text-xl font-bold">Document Revoked</p>
              <p className="text-sm text-white/80">This record is no longer valid.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm leading-7 text-gray-600">
              This document exists in our system but has been officially revoked and is no longer valid.
            </p>
            <button
              type="button"
              onClick={resetVerification}
              className="mt-5 w-full rounded-xl border border-[#1B4332] px-5 py-3 text-sm font-medium text-[#1B4332] transition-all hover:bg-[#D8F3DC]"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-xl bg-red-600 p-4 text-white">
          <XCircle className="h-8 w-8" />
          <div>
            <p className="text-xl font-bold">Invalid Document</p>
            <p className="text-sm text-white/80">No record found in the GDAVS database.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm leading-7 text-gray-600">
            No record found in the GDAVS database. This document may be fabricated.
          </p>
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                If this document was presented to you officially, please report it to the relevant government department immediately.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetVerification}
            className="mt-5 w-full rounded-xl border border-[#1B4332] px-5 py-3 text-sm font-medium text-[#1B4332] transition-all hover:bg-[#D8F3DC]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 pb-16 sm:px-6 lg:px-8">
      <section className="flex flex-col items-center pt-10 text-center sm:pt-14">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-[#1B4332]">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#1A1A1A] sm:text-[28px]">
          Verify Document Authenticity
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
          Enter the document ID printed on the document, or scan the barcode using your camera.
        </p>
      </section>

      <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        {result ? (
          renderResult()
        ) : (
          <div className="space-y-6">
            <div className="inline-flex rounded-full bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  mode === "manual" ? "bg-[#1B4332] text-white" : "text-gray-600"
                }`}
              >
                <Keyboard className="h-4 w-4" />
                Enter Document ID
              </button>
              <button
                type="button"
                onClick={() => setMode("scan")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  mode === "scan" ? "bg-[#1B4332] text-white" : "text-gray-600"
                }`}
              >
                <Camera className="h-4 w-4" />
                Scan Barcode
              </button>
            </div>

            {mode === "manual" ? (
              <div className="space-y-4">
                <input
                  value={documentId}
                  onChange={(event) => setDocumentId(event.target.value)}
                  placeholder="e.g. GDA-BCA-2026-A1B2C3D4"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none transition focus:ring-2 focus:ring-[#40916C]"
                />
                <div className="flex items-start gap-2 text-sm text-gray-500">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Format: GDA-[DEPT]-[YEAR]-[ID]</span>
                </div>
                <button
                  type="button"
                  onClick={handleManualVerify}
                  disabled={isChecking}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B4332] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#40916C] disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  <SearchCheck className="h-4 w-4" />
                  {isChecking ? "Checking..." : "Verify Now"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={startCamera}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#1B4332] px-6 py-3 text-sm font-medium text-[#1B4332] transition-all hover:bg-[#D8F3DC]"
                >
                  <Camera className="h-4 w-4" />
                  Start Camera
                </button>

                <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                  <div className="aspect-4/3 w-full bg-[linear-gradient(180deg,rgba(27,67,50,0.08),rgba(255,255,255,0.92))]">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className={`h-full w-full object-cover ${scanning ? "opacity-100" : "opacity-0"}`}
                    />
                    {!scanning ? (
                      <div className="flex h-full flex-col items-center justify-center px-6 text-center text-gray-400">
                        <Camera className="h-12 w-12" />
                        <p className="mt-3 text-sm">Camera preview will appear here</p>
                      </div>
                    ) : null}
                  </div>

                  {scanning ? (
                    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-[#40916C] shadow-[0_0_18px_rgba(64,145,108,0.65)] animate-scan-line" />
                    </div>
                  ) : null}
                </div>

                <p className="text-sm text-gray-500">Point your camera at the barcode on the document</p>

                {scanning ? (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#1B4332] px-6 py-3 text-sm font-medium text-[#1B4332] transition-all hover:bg-[#D8F3DC]"
                  >
                    Stop Camera
                  </button>
                ) : null}

                {cameraError ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    {cameraError}
                  </div>
                ) : null}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400">
              {[
                [Lock, "Secure Verification"],
                [Database, "Real-time Database"],
                [ShieldCheck, "Government Certified"],
              ].map(([Icon, label]) => (
                <span
                  key={label as string}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-2"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label as string}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}