"use client";

import Link from "next/link";
import Image from "next/image";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/gdaabbottabad/",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/gdaabbottabad?igsh=MWwyMjZrYzNvMWE3NQ==",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 11.37a4 4 0 1 1-7.914 1.173A4 4 0 0 1 16 11.37m1.5-4.87h.01"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "X",
    href: "https://x.com/gdaabbottabad",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const quickLinks = [
  { label: "Verify Document Portal", href: "/verify" },
  { label: "Generate & Stamp Barcode", href: "/generate" },
  { label: "Back to Home", href: "/" },
];

export function Footer() {
  return (
    <footer
      className="w-full relative overflow-hidden border-t border-[rgba(201,168,76,0.18)]"
      style={{
        background: "linear-gradient(180deg, #0B1F33 0%, #051115 100%)",
        color: "#fff",
      }}
    >
      {/* Top accent glow line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[rgba(201,168,76,0.5)] to-transparent" />
      
      {/* Main Footer Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10">
        <div className="grid gap-12 sm:grid-cols-3">
          
          {/* Brand/Official Section */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 transition-all duration-300 hover:opacity-90">
              <Image
                src="/gda_logo.png"
                alt="GDA Logo"
                width={44}
                height={44}
                className="h-11 w-11 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
              />
              <div className="leading-tight">
                <div
                  className="text-lg font-bold tracking-wider text-white"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  GDA-DVS
                </div>
                <div className="text-[10px] uppercase tracking-wider text-white/50 dmsans">
                  Document Verification System
                </div>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-white/70 max-w-sm font-light dmsans">
              Secure, transparent, and official document registry and barcode verification platform for the Galiyat Development Authority.
            </p>
          </div>

          {/* Quick Registry Links */}
          <div className="space-y-4">
            <h3
              className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] dmsans"
            >
              Registry Actions
            </h3>
            <nav className="flex flex-col gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group inline-flex items-center gap-1.5 text-sm text-white/70 transition-all duration-300 hover:text-[var(--color-accent)] hover:translate-x-0.5 dmsans font-light"
                >
                  <span className="opacity-0 transition-opacity duration-300 group-hover:opacity-100 text-[var(--color-accent)]">›</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Institutional Contact & Social Links */}
          <div className="space-y-4">
            <h3
              className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] dmsans"
            >
              Institutional Socials
            </h3>
            <p className="text-xs text-white/60 dmsans font-light leading-relaxed">
              Connect with us via our official government public media handles for news and updates.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(201,168,76,0.5)] hover:bg-[rgba(201,168,76,0.12)] hover:text-[var(--color-accent)]"
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
        </div>

        {/* Bottom Legal / Copyright Area */}
        <div className="mt-16 pt-8 border-t border-white/5">
          <div className="flex flex-col items-center justify-between gap-6 text-center text-xs text-white/50 sm:flex-row">
            <div className="dmsans font-light">
              © {new Date().getFullYear()} Galiyat Development Authority. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-6 dmsans font-light">
              <a href="#" className="hover:text-[var(--color-accent)] transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-[var(--color-accent)] transition-colors duration-300">
                Terms of Use
              </a>
              <a href="#" className="hover:text-[var(--color-accent)] transition-colors duration-300">
                Accessibility Audit
              </a>
            </div>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
