"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { Footer } from "@/components/ui/footer";
import { GetInTouch } from "@/components/ui/get-in-touch";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Custom premium styles */}
      <style jsx global>{`
        .playfair {
          font-family: 'Playfair Display', serif;
        }
        .dmsans {
          font-family: 'DM Sans', sans-serif;
        }
        .text-glow {
          text-shadow: 0 0 40px rgba(201, 168, 76, 0.25);
        }
        .button-gold {
          background: #C9A84C;
          color: #0B1F33;
          box-shadow: 0 10px 30px rgba(201, 168, 76, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .button-gold:hover {
          background: #dfba5f;
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(201, 168, 76, 0.35);
        }
        .button-outline {
          border: 1.5px solid rgba(255, 255, 255, 0.25);
          color: #ffffff;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .button-outline:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
        }
        .shimmer-line {
          background: linear-gradient(90deg, rgba(201,168,76,0.1) 0%, rgba(201,168,76,1) 50%, rgba(201,168,76,0.1) 100%);
          background-size: 200% auto;
          animation: shimmer-flow 3s linear infinite;
        }
        @keyframes shimmer-flow {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* HERO SECTION */}
      <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden py-24 text-center">
        {/* Dynamic moving lines background */}
        <BackgroundPaths mode="background" className="opacity-100" />
        
        {/* Radial brand blending overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(27,67,50,0.22)_0%,transparent_75%)]" />

        <div className="relative z-10 mx-auto w-full max-w-4xl px-6">
          
          {/* Main Title Group */}
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="playfair text-white text-glow leading-[1.1] font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
            >
              <span className="block">Authenticate.</span>
              <span className="block">Verify.</span>
              <span className="block text-[var(--color-accent)]">Trust.</span>
            </motion.h1>
            
            {/* Shimmer Accent Separator Line */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 80, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="mx-auto h-[3px] shimmer-line rounded-full"
            />
          </div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="dmsans mx-auto mt-8 max-w-xl text-base sm:text-lg leading-relaxed text-white/80 font-light"
          >
            The Galiyat Development Authority Document Verification System ensures every official document is uniquely identified, barcode-authenticated, and instantly verifiable — protecting citizens and institutions alike.
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/generate" 
              className="group button-gold flex w-full sm:w-auto items-center justify-center gap-3 rounded-xl px-8 py-4 text-sm font-semibold playfair"
            >
              <span>Generate Document</span>
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link 
              href="/verify" 
              className="button-outline flex w-full sm:w-auto items-center justify-center gap-3 rounded-xl px-8 py-4 text-sm font-medium dmsans"
            >
              <span>Verify Document</span>
            </Link>
          </motion.div>

          {/* Verification Subtext */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-6 text-xs text-white/50 dmsans tracking-wide"
          >
            No login required for public document verification
          </motion.p>

        </div>
      </section>

      {/* GET IN TOUCH SECTION */}
      <GetInTouch />

      {/* FOOTER SECTION */}
      <Footer />
    </div>
  );
}
