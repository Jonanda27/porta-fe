"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AccountSettingsModal } from "@/components/ui/account-settings-modal";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { UserRole } from "@/types/auth.types";
import {
  Landmark,
  Receipt,
  Calendar,
  Download,
  Search,
  Bell,
  MessageSquare,
  Users,
  Anchor,
  Sliders,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FileText,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

const ALLOWED_DINAS_ROLES: UserRole[] = [
  "SUPERADMIN",
  "KEPALA_DINAS",
  "DISHUB_EKSEKUTIF",
  "KEPALA_BIDANG",
  "KEPALA_UPTD",
];

export default function DinasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, initialize: initAuth, logout: storeLogout } = useAuthStore();

  useEffect(() => {
    initAuth();
    const storedUser = AuthService.getStoredUser();
    const token = AuthService.getStoredToken();
    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }
    if (!ALLOWED_DINAS_ROLES.includes(storedUser.role)) {
      router.replace(AuthService.getRedirectRouteByRole(storedUser.role));
    }
  }, [initAuth, router]);

  // Collapsible Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Global Filter State
  const [selectedPort, setSelectedPort] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleLogout = () => {
    AuthService.logout();
    storeLogout();
    router.push("/login");
  };

  // Determine Active Header Title & Breadcrumb based on URL
  const getPageTitle = () => {
    if (pathname.includes("/dinas/monitoring")) return "Monitoring Realisasi PAD & Piutang";
    if (pathname.includes("/dinas/evaluasi")) return "Evaluasi Komparasi UPTD & Simulasi PAD";
    if (pathname.includes("/dinas/pengaduan")) return "Pemantauan Pelayanan Publik & SLA Pengaduan";
    return "Dashboard Eksekutif Dinas Perhubungan";
  };

  const getBreadcrumbLabel = () => {
    if (pathname.includes("/dinas/monitoring")) return "Penerimaan & Piutang Retribusi";
    if (pathname.includes("/dinas/evaluasi")) return "Evaluasi Kinerja & Simulasi";
    if (pathname.includes("/dinas/pengaduan")) return "Kualitas Layanan & Pengaduan";
    return "Ringkasan Eksekutif";
  };

  const getPageDescription = () => {
    if (pathname.includes("/dinas/monitoring"))
      return "Monitoring rincian objek retribusi daerah, realisasi target APBD, status piutang, serta kepatuhan PP No. 35/2023.";
    if (pathname.includes("/dinas/evaluasi"))
      return "Benchmarking efisiensi 4 UPTD, kalkulator simulasi penyesuaian tarif PAD, dan eksplorasi GIS peluang investasi.";
    if (pathname.includes("/dinas/pengaduan"))
      return "Log pelayanan publik terpadu, evaluasi kepatuhan SLA (< 24 Jam), dan monitoring disposisi laporan pimpinan.";
    return "Oversight makro real-time penerimaan PAD pelabuhan, operasional dermaga, kepatuhan regulasi, dan aset daerah.";
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#1E2922] font-sans flex antialiased selection:bg-[#D97706]/20 selection:text-[#0B241E]">
      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (Collapsible with URL-based Active State) */}
      {/* ========================================================= */}
      <aside
        className={`${
          isSidebarCollapsed ? "w-20" : "w-64"
        } bg-white flex flex-col justify-between shrink-0 shadow-xs z-30 sticky top-0 h-screen transition-all duration-300 ease-in-out relative`}
      >
        {/* Sleek Floating Seam Toggle Button - Positioned safely at the dark header seam (top-8) */}
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3.5 top-8 -translate-y-1/2 z-40 w-7 h-7 rounded-full bg-[#0B241E] hover:bg-[#133D31] text-white border border-[#235848] hover:border-[#D97706]/70 shadow-md flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 group focus:outline-none"
          title={isSidebarCollapsed ? "Buka Sidebar" : "Ciutkan Sidebar"}
          aria-label={isSidebarCollapsed ? "Buka Sidebar" : "Ciutkan Sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-[#D97706] group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 text-white group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
          )}
        </button>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Brand Logo Header (100% Seamless with Top Header Green - ZERO divider line) */}
          <div
            className={`h-16 bg-[#0B241E] border-b border-[#143E33] flex items-center ${
              isSidebarCollapsed ? "justify-center px-2" : "justify-between px-5"
            } text-white shrink-0 transition-all duration-300`}
          >
            {isSidebarCollapsed ? (
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(false)}
                className="w-10 h-10 rounded-lg bg-[#143E33] hover:bg-[#1E5748] p-1.5 flex items-center justify-center shadow-xs border border-[#1E5748] transition-colors cursor-pointer group"
                title="Buka Sidebar"
              >
                <img
                  src="/brand/symbol-white.svg"
                  alt="PORTA Dishub Eksekutif"
                  className="w-full h-full object-contain group-hover:scale-95 transition-transform"
                />
              </button>
            ) : (
              <>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#143E33] p-1 flex items-center justify-center shadow-xs border border-[#1E5748] shrink-0">
                    <img
                      src="/brand/symbol-white.svg"
                      alt="PORTA"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="truncate">
                    <span className="font-extrabold text-base tracking-wider text-white">
                      PORTA
                    </span>
                    <span className="block text-[9px] font-mono tracking-widest text-[#85A69B] uppercase -mt-0.5 truncate">
                      DISHUB EKSEKUTIF
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono bg-[#143E33] text-[#D97706] border border-[#1E5748] font-bold px-1.5 py-0.5 rounded">
                    v2.4
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSidebarCollapsed(true)}
                    className="w-7 h-7 rounded-lg bg-[#143E33] hover:bg-[#1E5748] text-[#BED2CA] hover:text-white border border-[#1E5748] flex items-center justify-center transition-colors cursor-pointer"
                    title="Ciutkan Sidebar"
                    aria-label="Ciutkan Sidebar"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Sidebar Body with border-r (Starts only below the green header) */}
          <div className="flex-1 overflow-y-auto border-r border-[#E2E8F0] py-2">
            {/* User Profile Mini Card */}
            {isSidebarCollapsed ? (
              <div className="my-2 flex justify-center">
                <div
                  className="w-10 h-10 rounded-full bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-xs shadow-xs border border-[#164336] cursor-pointer"
                  title="Drs. H. Hendra G., M.Si. (Kepala Dinas Perhubungan)"
                  onClick={() => setIsSidebarCollapsed(false)}
                >
                  HG
                </div>
              </div>
            ) : (
              <div className="p-3.5 mx-3 my-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-sm shrink-0 shadow-xs border border-[#164336]">
                  HG
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#0B241E] truncate">
                    Drs. H. Hendra G., M.Si.
                  </p>
                  <p className="text-[10px] text-[#64748B] truncate mt-0.5">
                    Kepala Dinas Perhubungan
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Menus with Real Next.js Links */}
            <div className={isSidebarCollapsed ? "px-2 space-y-4" : "px-3 space-y-6"}>
              {/* Group 1: Monitoring & Analitik */}
              <div>
                {!isSidebarCollapsed && (
                  <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    Monitoring & Analitik
                  </p>
                )}
                <div className="mt-1 space-y-1">
                  {/* Link 1: Ringkasan Eksekutif (/dinas/dashboard) */}
                  <Link
                    href="/dinas/dashboard"
                    title="Ringkasan Eksekutif"
                    className={`transition-all flex items-center cursor-pointer ${
                      isSidebarCollapsed
                        ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                            pathname === "/dinas/dashboard" || pathname === "/dinas"
                              ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                        : `w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold justify-between ${
                            pathname === "/dinas/dashboard" || pathname === "/dinas"
                              ? "bg-[#0B241E] text-white shadow-xs"
                              : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BarChart3
                        className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} ${
                          pathname === "/dinas/dashboard" || pathname === "/dinas"
                            ? "text-[#D97706]"
                            : "text-[#64748B]"
                        }`}
                      />
                      {!isSidebarCollapsed && <span>Ringkasan Eksekutif</span>}
                    </div>
                    {!isSidebarCollapsed && (pathname === "/dinas/dashboard" || pathname === "/dinas") && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                    )}
                  </Link>

                  {/* Link 2: Penerimaan & Piutang (/dinas/monitoring) */}
                  <Link
                    href="/dinas/monitoring"
                    title="Penerimaan & Piutang (3 Alert)"
                    className={`transition-all flex items-center cursor-pointer relative ${
                      isSidebarCollapsed
                        ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                            pathname === "/dinas/monitoring"
                              ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                        : `w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold justify-between ${
                            pathname === "/dinas/monitoring"
                              ? "bg-[#0B241E] text-white shadow-xs"
                              : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Receipt
                        className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} ${
                          pathname === "/dinas/monitoring" ? "text-[#D97706]" : "text-[#64748B]"
                        }`}
                      />
                      {!isSidebarCollapsed && <span>Penerimaan & Piutang</span>}
                    </div>
                    {isSidebarCollapsed ? (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500" />
                    ) : (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                        3 Alert
                      </span>
                    )}
                  </Link>
                </div>
              </div>

              {/* Group 2: Strategi & Pelayanan */}
              <div>
                {!isSidebarCollapsed ? (
                  <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    Strategi & Pelayanan
                  </p>
                ) : (
                  <div className="my-2 border-t border-[#EDF2F7] mx-2" />
                )}
                <div className="mt-1 space-y-1">
                  {/* Link 3: Evaluasi & Simulasi (/dinas/evaluasi) */}
                  <Link
                    href="/dinas/evaluasi"
                    title="Evaluasi & Simulasi (Kalkulator)"
                    className={`transition-all flex items-center cursor-pointer ${
                      isSidebarCollapsed
                        ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                            pathname === "/dinas/evaluasi"
                              ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                        : `w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold justify-between ${
                            pathname === "/dinas/evaluasi"
                              ? "bg-[#0B241E] text-white shadow-xs"
                              : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sliders
                        className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} ${
                          pathname === "/dinas/evaluasi" ? "text-[#D97706]" : "text-[#64748B]"
                        }`}
                      />
                      {!isSidebarCollapsed && <span>Evaluasi & Simulasi</span>}
                    </div>
                    {!isSidebarCollapsed && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        Kalkulator
                      </span>
                    )}
                  </Link>

                  {/* Link 4: Layanan & Pengaduan (/dinas/pengaduan) */}
                  <Link
                    href="/dinas/pengaduan"
                    title="Layanan & Pengaduan (2 Aktif)"
                    className={`transition-all flex items-center cursor-pointer relative ${
                      isSidebarCollapsed
                        ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                            pathname === "/dinas/pengaduan"
                              ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                        : `w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold justify-between ${
                            pathname === "/dinas/pengaduan"
                              ? "bg-[#0B241E] text-white shadow-xs"
                              : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users
                        className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} ${
                          pathname === "/dinas/pengaduan" ? "text-[#D97706]" : "text-[#64748B]"
                        }`}
                      />
                      {!isSidebarCollapsed && <span>Layanan & Pengaduan</span>}
                    </div>
                    {isSidebarCollapsed ? (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
                    ) : (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                        2 Aktif
                      </span>
                    )}
                  </Link>
                </div>
              </div>

              {/* Group 3: Regulasi & Dokumen */}
              <div>
                {!isSidebarCollapsed ? (
                  <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    Regulasi & Audit
                  </p>
                ) : (
                  <div className="my-2 border-t border-[#EDF2F7] mx-2" />
                )}
                <div className="mt-1 space-y-1 text-xs text-[#475569]">
                  {isSidebarCollapsed ? (
                    <>
                      <a
                        href="#pp35"
                        title="Salinan Resmi PP No. 35/2023"
                        onClick={(e) => {
                          e.preventDefault();
                          alert("Membuka salinan resmi PP No. 35/2023 tentang Ketentuan Umum Pajak Daerah dan Retribusi Daerah.");
                        }}
                        className="w-11 h-11 mx-auto rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E] cursor-pointer"
                      >
                        <FileText className="w-5 h-5" />
                      </a>

                      <a
                        href="#bapenda"
                        title="Status Integrasi Host-to-Host Kas Daerah (Bapenda): AKTIF"
                        onClick={(e) => {
                          e.preventDefault();
                          alert("Status Integrasi Host-to-Host Kas Daerah (Bapenda): AKTIF (Latency: 42ms).");
                        }}
                        className="w-11 h-11 mx-auto rounded-lg flex items-center justify-center relative text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E] cursor-pointer"
                      >
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </a>
                    </>
                  ) : (
                    <>
                      <a
                        href="#pp35"
                        onClick={(e) => {
                          e.preventDefault();
                          alert("Membuka salinan resmi PP No. 35/2023 tentang Ketentuan Umum Pajak Daerah dan Retribusi Daerah.");
                        }}
                        className="px-3.5 py-2 rounded-lg flex items-center justify-between hover:bg-[#F1F5F9] hover:text-[#0B241E] cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>PP No. 35/2023</span>
                        </span>
                        <ExternalLink className="w-3 h-3 text-[#94A3B8]" />
                      </a>

                      <a
                        href="#bapenda"
                        onClick={(e) => {
                          e.preventDefault();
                          alert("Status Integrasi Host-to-Host Kas Daerah (Bapenda): AKTIF (Latency: 42ms).");
                        }}
                        className="px-3.5 py-2 rounded-lg flex items-center justify-between hover:bg-[#F1F5F9] hover:text-[#0B241E] cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Koneksi Bapenda</span>
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer Logout Button */}
        <div
          className={`p-3 border-t border-[#EDF2F7] border-r border-[#E2E8F0] bg-white shrink-0 flex ${
            isSidebarCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          <button
            type="button"
            onClick={handleLogout}
            className={`rounded-lg text-xs font-bold text-[#E11D48] hover:bg-[#FFF1F2] border border-[#FECDD3] transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              isSidebarCollapsed ? "w-11 h-11 p-0" : "w-full py-2.5 px-3"
            }`}
            title="Keluar / Ganti Akun"
          >
            <ArrowLeft className="w-4 h-4" />
            {!isSidebarCollapsed && <span>Keluar / Ganti Akun</span>}
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN VIEW CANVAS (Able Pro Header & Overlapping Cards)  */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* A. TOP NAVIGATION BAR */}
        <header className="h-16 bg-[#0B241E] border-b border-[#143E33] flex items-center justify-between px-6 text-white sticky top-0 z-20 shadow-xs">
          {/* Left search bar with Sidebar Toggle */}
          <div className="flex items-center flex-1 max-w-md gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-lg bg-[#12362C] hover:bg-[#1A493B] text-[#BED2CA] hover:text-white border border-[#1C4D3F] transition-colors cursor-pointer shrink-0"
              title={isSidebarCollapsed ? "Buka Sidebar" : "Ciutkan Sidebar"}
              aria-label="Toggle Sidebar"
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 text-[#D97706]" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#85A69B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari UPTD, objek retribusi, invoice, atau laporan..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#12362C] border border-[#1C4D3F] rounded-lg text-white placeholder-[#85A69B] focus:outline-none focus:border-[#D97706] transition-colors"
              />
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Port Status Pill */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono bg-[#12362C] border border-[#1C4D3F] px-3 py-1 rounded-full text-[#BED2CA]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>4 UPTD Terhubung</span>
            </div>

            {/* Notification Bell with Badge */}
            <button
              type="button"
              onClick={() => alert("3 Notifikasi Eksekutif: 1 Kunjungan Kapal Melebihi Jadwal, 2 Tagihan Jatuh Tempo.")}
              className="relative p-2 rounded-lg bg-[#12362C] hover:bg-[#1A493B] text-white transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E11D48] text-white text-[9px] font-bold flex items-center justify-center">
                3
              </span>
            </button>

            {/* Chat/Inquiry Support */}
            <button
              type="button"
              onClick={() => alert("Menghubungkan ke Saluran Koordinasi Radio & Chat UPTD.")}
              className="p-2 rounded-lg bg-[#12362C] hover:bg-[#1A493B] text-white transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <div className="h-6 w-px bg-[#184438]" />

            {/* Executive Badge */}
            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full bg-[#D97706] text-[#0B241E] flex items-center justify-center font-black text-xs">
                KD
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold leading-tight">Kepala Dinas</span>
                <span className="block text-[10px] text-[#85A69B]">Provinsi Banten</span>
              </div>
            </div>
          </div>
        </header>

        {/* B. HERO BANNER (Top Colored Band from Able Pro) */}
        <section className="bg-[#0B241E] text-white pt-7 pb-28 sm:pb-32 px-6 sm:px-8 border-b border-[#143E33] relative overflow-hidden">
          {/* Subtle Nautical Coordinate Lines */}
          <div className="absolute right-0 top-0 translate-x-20 -translate-y-12 w-96 h-96 rounded-full border border-[#164336]/40 pointer-events-none" />
          <div className="absolute right-12 top-0 translate-x-32 -translate-y-8 w-[420px] h-[420px] rounded-full border border-[#164336]/20 pointer-events-none" />

          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-mono text-[#D97706] mb-1.5">
                <Link href="/" className="hover:underline">PORTA</Link>
                <span>/</span>
                <Link href="/dinas/dashboard" className="hover:underline">Dinas Perhubungan</Link>
                <span>/</span>
                <span className="text-white font-semibold">{getBreadcrumbLabel()}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {getPageTitle()}
              </h1>
              <p className="text-xs sm:text-sm text-[#BED2CA] mt-2 max-w-2xl leading-relaxed">
                {getPageDescription()}
              </p>
            </div>

            {/* Global Filters on Header */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto pt-1">
              {/* Filter Pelabuhan */}
              <div className="bg-[#12362C] border border-[#1C4D3F] rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
                <Anchor className="w-3.5 h-3.5 text-[#D97706]" />
                <select
                  value={selectedPort}
                  onChange={(e) => setSelectedPort(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer text-xs font-semibold"
                >
                  <option value="all" className="bg-[#0B241E] text-white">Semua Pelabuhan (4 UPTD)</option>
                  <option value="merak" className="bg-[#0B241E] text-white">UPTD Pelabuhan Merak</option>
                  <option value="bakauheni" className="bg-[#0B241E] text-white">UPTD Pelabuhan Bakauheni</option>
                  <option value="ketapang" className="bg-[#0B241E] text-white">UPTD Pelabuhan Ketapang</option>
                  <option value="gilimanuk" className="bg-[#0B241E] text-white">UPTD Pelabuhan Gilimanuk</option>
                </select>
              </div>

              {/* Filter Periode */}
              <div className="bg-[#12362C] border border-[#1C4D3F] rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
                <Calendar className="w-3.5 h-3.5 text-[#D97706]" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer text-xs font-semibold"
                >
                  <option value="today" className="bg-[#0B241E] text-white">Hari Ini (Real-time)</option>
                  <option value="month" className="bg-[#0B241E] text-white">Bulan Berjalan (Nov 2026)</option>
                  <option value="year" className="bg-[#0B241E] text-white">Tahun Anggaran 2026</option>
                </select>
              </div>

              {/* Export Button */}
              <button
                type="button"
                onClick={() => alert("Mengunduh Laporan Eksekutif PAD Pelabuhan (Format PDF / Excel Rekonsiliasi)...")}
                className="bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Unduh Laporan</span>
              </button>
            </div>
          </div>
        </section>

        {/* C. SUBPAGE CHILDREN CONTAINER (Overlaps Hero Banner with luxurious breathing room) */}
        <main className="max-w-7xl mx-auto px-6 sm:px-8 -mt-10 sm:-mt-12 pb-16 w-full flex-1 z-10 space-y-6">
          {children}
        </main>
      </div>

      <AccountSettingsModal
        isOpen={Boolean(user?.mustChangePassword)}
        onClose={() => {}}
        forcePasswordChange={Boolean(user?.mustChangePassword)}
        onLogout={handleLogout}
      />
    </div>
  );
}
