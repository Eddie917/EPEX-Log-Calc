export const metadata = { title: "Kalkulačka nákladov na prepravu", description: "EPEX Logistics Calculator" };
import "./../styles/globals.css";
import React from "react";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="sk"><body className="min-h-screen bg-slate-50 text-slate-900">{children}</body></html>);
}
