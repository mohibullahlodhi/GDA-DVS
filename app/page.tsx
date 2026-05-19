"use client";

import Link from "next/link";
import {
  ArrowRight,
} from "lucide-react";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { Footer } from "@/components/ui/footer";
import { GetInTouch } from "@/components/ui/get-in-touch";

const workflowSteps = [
  {
    id: "01",
    title: "Upload Document",
    description: "Upload your official PDF or DOCX document to the system.",
  },
  {
    id: "02",
    title: "Barcode Generated",
    description:
      "A unique Code128 barcode and document ID are embedded into your document automatically.",
  },
  {
    id: "03",
    title: "Scan & Verify",
    description:
      "Anyone can scan the barcode or enter the document ID to instantly verify authenticity.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]" data-workflow-steps={workflowSteps.length}>
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes borderPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0); }
          50%      { box-shadow: 0 0 0 6px rgba(201,168,76,0.08); }
        }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }

        .animate-fade-in-up { opacity: 0; animation: fadeInUp 0.7s cubic-bezier(0.4,0,0.2,1) forwards; }
        .animate-scale-in { opacity: 0; animation: scaleIn 0.6s cubic-bezier(0.4,0,0.2,1) forwards; }
        .animate-shimmer { background: linear-gradient(90deg, var(--color-accent) 25%, #f0d080 50%, var(--color-accent) 75%); background-size: 200% auto; animation: shimmer 2.5s linear infinite; }
        .animate-border-pulse { animation: borderPulse 2.5s ease-in-out infinite; }
        .dot-pulse { animation: pulse 1.8s ease-in-out infinite; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }

        .playfair { font-family: 'Playfair Display', serif; }
        .dmsans { font-family: 'DM Sans', sans-serif; }

        .hero-grid-overlay {
          background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 24px);
        }

        .lift-hover {
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        }

        .lift-hover:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 18px 45px rgba(13, 43, 31, 0.18);
        }

        .tilt-3d {
          transform-style: preserve-3d;
          perspective: 1200px;
        }

        .tilt-3d:hover {
          transform: translateY(-4px) rotateX(5deg) rotateY(-6deg);
        }

        .glow-hover {
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        }

        .glow-hover:hover {
          box-shadow: 0 0 0 1px rgba(201,168,76,0.25), 0 14px 30px rgba(0,0,0,0.15);
        }
      `}</style>

      {/* HERO */}
      <section className="relative flex items-center justify-center overflow-hidden text-center" style={{ minHeight: '88vh', backgroundColor: '#2E7D32' }}>
        <BackgroundPaths mode="background" className="opacity-100" />

        <div className="relative z-10 mx-auto px-6" style={{ maxWidth: 720 }}>
          <h1 className="playfair text-white animate-fade-in-up" style={{ fontSize: 'clamp(3.25rem, 8vw, 4.5rem)', lineHeight: 1, marginBottom: 12 }}>
            <span className="block">Authenticate.</span>
            <span className="block">Verify.</span>
            <span className="block" style={{ color: 'var(--color-accent)' }}>Trust.</span>
            <span className="mx-auto mt-4 block h-[3px] w-[60px] animate-shimmer rounded-full" />
          </h1>

          <div className="mx-auto mt-6 animate-fade-in-up delay-100 dmsans" style={{ maxWidth: 560, color: 'rgba(255,255,255,0.78)', fontSize: 16, lineHeight: 1.8 }}>
            The Galiyat Development Authority Document Verification System ensures every official document is uniquely identified, barcode-authenticated, and instantly verifiable — protecting citizens and institutions alike.
          </div>

          <div className="mt-8 flex items-center justify-center gap-4 animate-fade-in-up delay-200">
            <Link href="/generate" className="group lift-hover tilt-3d inline-flex items-center gap-3 rounded-xl px-7 py-3.5 playfair" style={{ background: '#C9A84C', color: '#0B1F33', fontWeight: 600, transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)' }}>
              <span>Generate Document</span>
              <ArrowRight size={16} className="transition-colors duration-300 group-hover:text-white" />
            </Link>

            <Link href="/verify" className="group lift-hover tilt-3d inline-flex items-center gap-3 rounded-xl px-7 py-3.5 dmsans" style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,0.26)', color: '#fff', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)' }}>
              <span>Verify Document</span>
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-[13px] dmsans animate-fade-in-up delay-300" style={{ color: 'rgba(255,255,255,0.55)' }}>
            <span>No login required for public document verification</span>
          </div>
        </div>
      </section>

      {/* GET IN TOUCH */}
      <GetInTouch />

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

