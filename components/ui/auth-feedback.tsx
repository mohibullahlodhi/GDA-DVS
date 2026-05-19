"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";

type AuthFeedbackProps = {
  message: string | null;
  type: "success" | "error";
  onClose: () => void;
};

export function AuthFeedback({ message, type, onClose }: AuthFeedbackProps) {
  if (!message) {
    return null;
  }

  const isSuccess = type === "success";

  return (
    <div
      className={`fixed left-1/2 top-6 z-50 w-[min(92vw,560px)] -translate-x-1/2 rounded-2xl border px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.18)] backdrop-blur ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50/95 text-emerald-950"
          : "border-rose-200 bg-rose-50/95 text-rose-950"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            isSuccess ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          }`}
        >
          {isSuccess ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{isSuccess ? "Success" : "Attention"}</p>
          <p className="mt-1 text-sm leading-5 opacity-90">{message}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 transition hover:bg-black/5"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
