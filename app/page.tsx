import Link from "next/link";
import {
  ArrowRight,
  Barcode,
  FileUp,
  ScanLine,
  ShieldCheck,
} from "lucide-react";

const workflowSteps = [
  {
    id: "01",
    icon: FileUp,
    title: "Upload Document",
    description: "Upload your official PDF or DOCX document to the system.",
  },
  {
    id: "02",
    icon: Barcode,
    title: "Barcode Generated",
    description:
      "A unique Code128 barcode and document ID are embedded into your document automatically.",
  },
  {
    id: "03",
    icon: ScanLine,
    title: "Scan & Verify",
    description:
      "Anyone can scan the barcode or enter the document ID to instantly verify authenticity.",
  },
];

const stats = [
  { value: "10,000+", label: "Documents Authenticated" },
  { value: "15+", label: "Government Departments" },
  { value: "100%", label: "Verification Accuracy" },
];

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Verify Document", href: "/verify" },
  { label: "Contact", href: "#contact" },
];

export default function Home() {
  return (
    <div className="animate-fade-in-up">
      <section className="relative overflow-hidden bg-[#F8FAF9]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(27,67,50,0.08),_transparent_42%),linear-gradient(rgba(248,250,249,0.96),rgba(248,250,249,0.96))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(27,67,50,0.08)_1px,transparent_0)] [background-size:24px_24px] opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1 text-xs font-medium text-green-800 shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              Pakistan Government — Official System
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-extrabold tracking-tight text-[#1A1A1A] sm:text-6xl">
              Authenticate. Verify. Trust.
            </h1>
            <p className="mt-5 max-w-[520px] text-base leading-8 text-gray-500 sm:text-lg">
              GDAVS ensures every government-issued document is uniquely
              identified, barcode-stamped, and instantly verifiable by anyone.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/generate"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B4332] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#40916C]"
              >
                Generate Document
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/verify"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1B4332] px-6 py-3 text-sm font-medium text-[#1B4332] transition-all hover:bg-[#D8F3DC]"
              >
                <ScanLine className="h-4 w-4" />
                Verify Document
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              No login required for document verification
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1A] sm:text-[32px]">
            How It Works
          </h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {workflowSteps.map((step) => {
            const Icon = step.icon;

            return (
              <article
                key={step.id}
                className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <span className="absolute left-6 top-6 rounded-full bg-[#D8F3DC] px-3 py-1 text-xs font-semibold tracking-wide text-[#1B4332]">
                  {step.id}
                </span>
                <div className="mt-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-[#1B4332]">
                  <Icon className="h-10 w-10" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-[#1A1A1A]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-gray-500">
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-[#1B4332] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-5xl font-bold tracking-tight">{stat.value}</div>
              <div className="mt-2 text-sm opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="contact"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="grid gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Contact
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[#1A1A1A]">
              Government support and department onboarding
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500">
              GDAVS is designed for secure document issuance across ministries,
              departments, and public verification points.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-xl bg-[#F8FAF9] p-4">
              <p className="font-medium text-[#1A1A1A]">Support</p>
              <p className="mt-1">support@gdavs.gov.pk</p>
            </div>
            <div className="rounded-xl bg-[#F8FAF9] p-4">
              <p className="font-medium text-[#1A1A1A]">Government Helpdesk</p>
              <p className="mt-1">+92 51 0000000</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#1A1A1A] px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1B4332] text-white">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold tracking-tight">GDAVS</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/75">
              Official Document Authentication System — Government of Pakistan
            </p>
          </div>

          <div className="flex flex-col gap-3 text-sm text-white/80 md:items-end">
            {footerLinks.map((link) => (
              <Link key={link.label} href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 pt-6 text-sm text-white/60">
          © 2026 GDAVS. All rights reserved. | Government of Pakistan
        </div>
      </footer>
    </div>
  );
}
