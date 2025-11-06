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
        {/* HEADER s logom */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/epex-logo.png"         // <- súbor v /public
                alt="EPEX Logistics™"
                width={160}
                height={44}
                priority
                className="h-10 w-auto"
              />
              <span className="sr-only">EPEX Logistics™ – kalkulačka</span>
            </Link>
            <span className="text-xs text-slate-500">beta</span>
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
