import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteShell } from "./components/site-shell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GDAVS | Government Document Authentication & Verification System",
  description:
    "GDAVS provides secure document generation, barcode stamping, and public verification for government-issued records.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-screen bg-[#F8FAF9] font-sans text-[#1A1A1A]">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
