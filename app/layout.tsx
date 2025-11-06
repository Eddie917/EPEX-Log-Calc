// app/layout.tsx
import "../styles/globals.css";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "Kalkulačka nákladov na prepravu",
  description: "EPEX Logistics Calculator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <body className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
        {/* Uhladená hlavička bez „beta“ */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b shadow-sm">
          <div className="max-w-6xl mx-auto px-4">
            <div className="h-14 flex items-center">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/epex-logo.png"        // musí byť v /public/epex-logo.png
                  alt="EPEX Logistics™"
                  width={150}
                  height={40}
                  priority
                  className="h-8 md:h-9 w-auto object-contain select-none drop-shadow-[0_1px_0_rgba(0,0,0,0.05)]"
                />
                <span className="sr-only">EPEX Logistics™ – kalkulačka</span>
              </Link>
            </div>
          </div>
        </header>

        <main>{children}</main>

        <footer className="border-t mt-10">
          <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-slate-500">
            © {new Date().getFullYear()} EPEX Logistics™
          </div>
        </footer>
      </body>
    </html>
  );
}
