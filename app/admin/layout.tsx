"use client";

import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <header className="bg-[var(--color-deep)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="text-white font-bold">GALIYAT DEVELOPMENT AUTHORITY</div>
            <nav className="mx-auto">
              <ul className="flex gap-4 text-sm text-white">
                <li>
                  <Link href="/admin" className="px-3 py-2 rounded-md hover:bg-white/10">Home</Link>
                </li>
                <li>
                  <Link href="/admin/requests" className="px-3 py-2 rounded-md hover:bg-white/10">Officer Requests</Link>
                </li>
                <li>
                  <Link href="/admin/logins" className="px-3 py-2 rounded-md hover:bg-white/10">Login Details</Link>
                </li>
                <li>
                  <Link href="/admin/documents" className="px-3 py-2 rounded-md hover:bg-white/10">Barcode History</Link>
                </li>
                <li>
                  <Link href="/admin/generate" className="px-3 py-2 rounded-md hover:bg-white/10">Generate Bar Code</Link>
                </li>
              </ul>
            </nav>
            <div />
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
