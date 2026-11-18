"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  Ship,
  Calendar,
  Ticket,
  DollarSign,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  Waves,
  Sun,
  ShieldCheck,
  PhoneCall,
  Menu,
  X,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { LogoutConfirmModal } from "@/components/ui/LogoutConfirmModal";

export default function PenumpangLayout({
  children,
}: {
  children: any;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { user, logout } = useAuthStore();

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    router.replace("/login");
  };

  const navItems = [
    {
      name: "Beranda",
      href: "/penumpang/beranda",
      icon: Compass,
      description: "Jadwal terdekat & pencarian",
    },
    {
      name: "Jadwal & Asisten",
      href: "/penumpang/jadwal",
      icon: Calendar,
      description: "Daftar lintasan & chatbot FAQ",
    },
    {
      name: "Beli Tiket & Pas",
      href: "/penumpang/tiket",
      icon: Ticket,
      description: "Pemesanan & E-Ticket QR",
    },
    {
      name: "Tarif & Fasilitas",
      href: "/penumpang/tarif",
      icon: DollarSign,
      description: "Katalog PP 35/2023 & Denah",
    },
    {
      name: "Pengaduan",
      href: "/penumpang/pengaduan",
      icon: AlertCircle,
      description: "Lapor kendala & tracking",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col antialiased selection:bg-[#06B6D4]/20 selection:text-[#0A2540]">
      {/* 1. TOP MARITIME WEATHER & ANNOUNCEMENT TICKER */}
      <div className="bg-[#0A2540] text-white text-xs border-b border-[#1E3A8A]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] text-[#93C5FD]">
            <Waves className="w-3.5 h-3.5 text-[#06B6D4] animate-pulse" />
            <span className="font-semibold text-white">Status Perairan Selat Sunda:</span>
            <span>Gelombang 0.75 - 1.25 m (Normal / Tenang)</span>
            <span className="hidden md:inline text-white/40">•</span>
            <span className="hidden md:inline">Kecepatan Angin: 12 Knot Barat Laut</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-[#67E8F9]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Portal Resmi Pemda & PP 35/2023</span>
            </span>
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="text-[#93C5FD] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Ganti Akun / Keluar</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN OCEAN-THEMED PUBLIC HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Portal Identity */}
            <Link
              href="/penumpang/beranda"
              className="flex items-center gap-3.5 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-[#0B241E] p-1.5 flex items-center justify-center shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform border border-[#143E33]">
                <img
                  src="/brand/symbol-white.svg"
                  alt="PORTA"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black tracking-wider text-[#0A2540]">
                    PORTA
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                    Masyarakat
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] font-medium tracking-tight">
                  Layanan Publik Penyeberangan &amp; Pas Pelabuhan Terpadu
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-[#0F3A5D] to-[#0369A1] text-white shadow-sm shadow-blue-900/10"
                        : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0A2540]"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-[#38BDF8]" : "text-[#64748B]"
                      }`}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Action: Call Center / Direct Fast Ticket CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/penumpang/tiket"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#06B6D4] hover:from-[#0369A1] hover:to-[#0891B2] text-white text-xs font-extrabold shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>Pesan Tiket Online</span>
              </Link>
            </div>

            {/* Mobile Menu Hamburger */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-[#475569] hover:text-[#0A2540] hover:bg-[#F1F5F9]"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E2E8F0] bg-white px-4 py-3 space-y-1 animate-fade-in shadow-xl">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#0A2540] text-white"
                      : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0A2540]"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-[#38BDF8]" : "text-[#64748B]"
                    }`}
                  />
                  <div>
                    <p>{item.name}</p>
                    <p className="text-[10px] font-normal text-current/70">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
            <div className="pt-2">
              <Link
                href="/penumpang/tiket"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <Ticket className="w-4 h-4" />
                <span>Pesan Tiket & Pas Masuk</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 3. DYNAMIC CONTENT AREA */}
      <main className="flex-1 pb-16">{children}</main>

      {/* 4. PUBLIC PORTAL FOOTER */}
      <footer className="bg-[#0A2540] text-white border-t border-[#1E3A8A]/40 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand & Gov Info */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0284C7] to-[#06B6D4] text-white flex items-center justify-center font-bold">
                  <Ship className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-extrabold text-lg tracking-wider text-white">
                    PORTA
                  </span>
                  <span className="block text-[9px] font-mono tracking-widest text-[#67E8F9] uppercase">
                    PEMDA REGIONAL
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Platform terintegrasi pengelolaan pelabuhan regional dan penerimaan retribusi daerah sesuai amanat PP No. 35 Tahun 2023.
              </p>
              <div className="flex items-center gap-2 text-xs text-[#E2E8F0]">
                <ShieldCheck className="w-4 h-4 text-[#06B6D4]" />
                <span className="font-semibold text-[11px]">Transparansi Retribusi Daerah 100%</span>
              </div>
            </div>

            {/* Col 2: Layanan Publik */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
                Layanan Penumpang
              </h4>
              <ul className="space-y-2 text-xs text-[#CBD5E1]">
                <li>
                  <Link href="/penumpang/beranda" className="hover:text-white transition-colors">
                    Pencarian Jadwal Kapal
                  </Link>
                </li>
                <li>
                  <Link href="/penumpang/tiket" className="hover:text-white transition-colors">
                    Pemesanan Pas Masuk & Tiket
                  </Link>
                </li>
                <li>
                  <Link href="/penumpang/jadwal" className="hover:text-white transition-colors">
                    Asisten Layanan Cerdas (FAQ)
                  </Link>
                </li>
                <li>
                  <Link href="/penumpang/tarif" className="hover:text-white transition-colors">
                    Daftar Tarif Resmi Pemda
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Regulasi & Pelabuhan */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
                Wilayah & Regulasi
              </h4>
              <ul className="space-y-2 text-xs text-[#CBD5E1]">
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#06B6D4]" />
                  <span>Pelabuhan Merak - Bakauheni</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#06B6D4]" />
                  <span>Pelabuhan Ketapang - Gilimanuk</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#06B6D4]" />
                  <span>Pelabuhan Padangbai - Lembar</span>
                </li>
                <li className="pt-1 text-[11px] text-[#94A3B8]">
                  Dasar Hukum: Perda Retribusi Jasa Kepelabuhanan & PP 35/2023
                </li>
              </ul>
            </div>

            {/* Col 4: Layanan Bantuan / Helpdesk */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
                Bantuan & Pengaduan
              </h4>
              <p className="text-xs text-[#94A3B8]">
                Butuh bantuan informasi jadwal, kendala pembayaran, atau pelaporan fasilitas?
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[#0F3A5D]/60 border border-[#1E3A8A] flex items-center gap-2.5">
                  <PhoneCall className="w-4 h-4 text-[#06B6D4]" />
                  <div>
                    <p className="text-[10px] text-[#94A3B8]">Call Center Pelabuhan:</p>
                    <p className="font-bold text-white font-mono">1500-112 / (021) 384-9000</p>
                  </div>
                </div>
                <Link
                  href="/penumpang/pengaduan"
                  className="inline-flex items-center gap-1.5 text-xs text-[#38BDF8] hover:text-[#67E8F9] font-bold"
                >
                  <span>Formulir Pengaduan Publik</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#1E3A8A]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
            <p>© 2026 PORTA • Sistem Pengelolaan Pelabuhan dan Penerimaan Daerah Terintegrasi.</p>
            <div className="flex items-center gap-4 text-[11px]">
              <span>Kebijakan Privasi</span>
              <span>•</span>
              <span>Syarat & Ketentuan</span>
              <span>•</span>
              <span>Standar Pelayanan Minimal (SPM)</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Validasi Logout */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        userName={user?.fullName || "Masyarakat / Penumpang"}
        userRole="PENGGUNA PUBLIK"
        userEmail={user?.email || "penumpang@portal.id"}
      />
    </div>
  );
}
