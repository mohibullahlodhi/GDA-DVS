"use client";

import Link from "next/link";
import Image from "next/image";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/gdaabbottabad/",
    icon: (
      <svg
        width="24"
        height="24"
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
        width="24"
        height="24"
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
        width="24"
        height="24"
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
  { label: "Home", href: "/" },
  { label: "Generate Document", href: "/generate" },
  { label: "Verify Document", href: "/verify" },
  { label: "About", href: "/about" },
];

export function Footer() {
  return (
    <footer
      className="w-full"
      style={{
        background: "linear-gradient(180deg, #0B1F33 0%, #051115 100%)",
        color: "#fff",
      }}
    >
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-12 sm:grid-cols-3">
          {/* Brand Section */}
          <div>
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/gda_logo.png"
                alt="GDA Logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
              <div>
                <div
                  className="text-lg font-bold"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#FFFFFF",
                  }}
                >
                  GDA-DVS
                </div>
                <div className="text-[11px] text-white/60">
                  Document Verification System
                </div>
              </div>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Secure, transparent, and official document verification for the
              Galiyat Development Authority.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className="text-sm font-semibold uppercase tracking-widest text-white/90"
              style={{ color: "#C9A84C" }}
            >
              Quick Links
            </h3>
            <nav className="mt-4 space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-white/70 transition hover:text-[#C9A84C]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social Links */}
          <div>
            <h3
              className="text-sm font-semibold uppercase tracking-widest text-white/90"
              style={{ color: "#C9A84C" }}
            >
              Follow Us
            </h3>
            <div className="mt-4 flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(201,168,76,0.28)] text-white/70 transition hover:-translate-y-0.5 hover:border-[#C9A84C] hover:text-[#C9A84C]"
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="mt-8 border-t border-[rgba(201,168,76,0.15)] pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center text-xs text-white/60 sm:flex-row">
            <div>
              © 2026 Galiyat Development Authority. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#C9A84C] transition">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-[#C9A84C] transition">
                Terms of Use
              </a>
              <a href="#" className="hover:text-[#C9A84C] transition">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
