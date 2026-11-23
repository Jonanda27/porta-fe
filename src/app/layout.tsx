import type { Metadata } from "next";
import "./globals.css";
import { RouteTransitionLoader } from "@/components/ui/RouteTransitionLoader";

export const metadata: Metadata = {
  title: "PORTA - Sistem Pengelolaan Pelabuhan dan Penerimaan Daerah",
  description: "Sistem Terintegrasi Tata Kelola Pelabuhan Penyeberangan dan Retribusi Daerah (PP No. 35/2023 & SOLAS)",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/web/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body className="antialiased h-full font-sans bg-slate-50 text-slate-900 selection:bg-[#D97706]/20 selection:text-[#0B241E]">
        <RouteTransitionLoader />
        {children}
      </body>
    </html>
  );
}
