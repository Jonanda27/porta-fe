"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Ship,
  Anchor,
  FileText,
  Calendar,
  CreditCard,
  Building2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Search,
  Bell,
  CheckCircle2,
  ShieldCheck,
  Radio,
  FileCheck2,
  Clock,
  Layers,
  HelpCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useKapalStore } from "@/store/kapal.store";
import { AuthService } from "@/services/auth.service";

export default function KapalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, initialize: initAuth } = useAuthStore();
  const { operator, fetchDashboardData } = useKapalStore();

  useEffect(() => {
    initAuth();
    fetchDashboardData();
  }, [initAuth, fetchDashboardData]);

  // Collapsible Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleLogout = () => {
    AuthService.logout();
    useAuthStore.getState().logout();
    router.push("/login");
  };

  // Nama operator dinamis dari backend atau session login
  const operatorName =
    operator?.name ||
    (user?.fullName
      ? user.fullName.replace(/\(.*?\)/g, "").trim()
      : "PT Pelayaran Mimika Sejahtera");

  const operatorInitials =
    operatorName
      .split(" ")
      .filter((word) => !["PT", "CV", "PERUM"].includes(word.toUpperCase()))
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "PM";

  const siupalDoc = operator?.documents?.find((d) => d.category === "SIUPAL_NIB");
  const siupalNumber = siupalDoc?.documentNumber || "SIUPAL-MMK-1-2023";

  const getPageTitle = () => {
    if (pathname.includes("/kapal/riwayat")) return "Riwayat Pelayanan & Log Kunjungan Kapal";
    if (pathname.includes("/kapal/profil")) return "Profil Perusahaan & Master Data Armada";
    if (pathname.includes("/kapal/permohonan")) return "Siklus Permohonan Jadwal & Alokasi Dermaga";
    if (pathname.includes("/kapal/manifes")) return "Pelaporan Manifes (Daftar Penumpang & Muatan)";
    if (pathname.includes("/kapal/penagihan")) return "Penagihan Retribusi (e-SKRD) & Riwayat Transaksi";
    return "Pusat Kendali Operasional Perusahaan Kapal";
  };

  const getBreadcrumbLabel = () => {
    if (pathname.includes("/kapal/riwayat")) return "Riwayat Kunjungan Kapal";
    if (pathname.includes("/kapal/profil")) return "Profil & Master Armada";
    if (pathname.includes("/kapal/permohonan")) return "Pengajuan Jadwal & Dermaga";
    if (pathname.includes("/kapal/manifes")) return "Pelaporan Manifes SOLAS";
    if (pathname.includes("/kapal/penagihan")) return "Tagihan e-SKRD & Pembayaran";
    return "Dashboard Armada";
  };

  const getPageDescription = () => {
    if (pathname.includes("/kapal/riwayat"))
      return "Buku log pencatatan waktu aktual kedatangan, sandar, dan bertolak (ATA/ATB/ATD), evaluasi dwell time, konsumsi utilitas riil, serta rekapitulasi penagihan retribusi.";
    if (pathname.includes("/kapal/profil"))
      return "Pusat pengelolaan dokumen legalitas SIUPAL, izin trayek, serta spesifikasi dimensi kapal (GT, LOA, Draft) sebagai dasar perhitungan retribusi.";
    if (pathname.includes("/kapal/permohonan"))
      return "Digitalisasi alur Permohonan ➔ Verifikasi ➔ Persetujuan jadwal sandar dan tambat dermaga beserta estimasi tarif resmi PP No. 35/2023.";
    if (pathname.includes("/kapal/manifes"))
      return "Pelaporan daftar muatan dan penumpang sebelum keberangkatan, rekonsiliasi kuota tiket pelabuhan, dan pemenuhan standar keselamatan SOLAS.";
    if (pathname.includes("/kapal/penagihan"))
      return "Daftar invoice e-SKRD retribusi jasa dermaga berdasarkan waktu aktual (ATA/ATB/ATD) dan pembayaran langsung ke Kas Daerah via VA/QRIS.";
    return "Pusat komando operasional armada kapal penyeberangan: monitoring pergerakan kapal, status izin clearance, dan notifikasi persetujuan.";
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#1E2922] font-sans flex antialiased selection:bg-[#D97706]/20 selection:text-[#0B241E]">
      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (Collapsible Operator Navigation)         */}
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
          {/* Brand Logo Header (100% Seamless with Top Header Green) */}
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
                  alt="PORTA Perusahaan Kapal"
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
                      OPERATOR KAPAL
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono bg-[#143E33] text-[#D97706] border border-[#1E5748] font-bold px-1.5 py-0.5 rounded">
                    ARMADA
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

          {/* Sidebar Body with border-r */}
          <div className="flex-1 overflow-y-auto border-r border-[#E2E8F0] py-2">
            {/* Company Profile Mini Card */}
            {isSidebarCollapsed ? (
              <div className="my-2 flex justify-center">
                <div
                  className="w-10 h-10 rounded-full bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-xs shadow-xs border border-[#164336] cursor-pointer"
                  title={operatorName}
                  onClick={() => setIsSidebarCollapsed(false)}
                >
                  {operatorInitials}
                </div>
              </div>
            ) : (
              <div className="p-3.5 mx-3 my-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-sm shrink-0 shadow-xs border border-[#164336]">
                  {operatorInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#0B241E] truncate" title={operatorName}>
                    {operatorName}
                  </p>
                  <p className="text-[10px] text-[#64748B] truncate mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    <span title={siupalNumber}>SIUPAL: {siupalNumber}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Menus with Real Next.js Links */}
            <div className={isSidebarCollapsed ? "px-2 space-y-4" : "px-3 space-y-6"}>
              {/* Group 1: Operasional & Armada */}
              <div>
                {!isSidebarCollapsed && (
                  <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    Operasional Armada
                  </p>
                )}
                <div className="mt-1 space-y-1">
                  {/* Link 1: Dashboard Armada (/kapal/dashboard) */}
                  <Link
                    href="/kapal/dashboard"
                    title="Pusat Kendali Armada"
                    className={`transition-all flex items-center cursor-pointer ${
                      isSidebarCollapsed
                        ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                            pathname === "/kapal/dashboard" || pathname === "/kapal"
                              ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                        : `w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold justify-between ${
                            pathname === "/kapal/dashboard" || pathname === "/kapal"
                              ? "bg-[#0B241E] text-white shadow-xs"
                              : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Radio
                        className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} ${
                          pathname === "/kapal/dashboard" || pathname === "/kapal"
                            ? "text-[#D97706]"
                            : "text-[#64748B]"
                        }`}
                      />
                      {!isSidebarCollapsed && <span>Pusat Kendali Armada</span>}
                    </div>
                    {!isSidebarCollapsed && (pathname === "/kapal/dashboard" || pathname === "/kapal") && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                    )}
                  </Link>

                  {/* Link 2: Profil & Master Data Armada (/kapal/profil) */}
                  <Link
                    href="/kapal/profil"
                    title="Profil Perusahaan & Master Data Armada"
                    className={`transition-all flex items-center cursor-pointer relative ${
                      isSidebarCollapsed
                        ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                            pathname === "/kapal/profil"
                              ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                        : `w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold justify-between ${
                            pathname === "/kapal/profil"
                              ? "bg-[#0B241E] text-white shadow-xs"
                              : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2
                        className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} ${
                          pathname === "/kapal/profil" ? "text-[#D97706]" : "text-[#64748B]"
                        }`}
                      />
                      {!isSidebarCollapsed && <span>Profil & Master Kapal</span>}
                    </div>
                    {!isSidebarCollapsed && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        6 Kapal
                      </span>
                    )}
                  </Link>

                  {/* Link 3: Permohonan Jadwal & Dermaga (/kapal/permohonan) */}
                  <Link
                    href="/kapal/permohonan"
                    title="Pengajuan Jadwal & Alokasi Dermaga"
                    className={`transition-all flex items-center cursor-pointer relative ${
                      isSidebarCollapsed
                        ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                            pathname === "/kapal/permohonan"
                              ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                        : `w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold justify-between ${
                            pathname === "/kapal/permohonan"
                              ? "bg-[#0B241E] text-white shadow-xs"
                              : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar
                        className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} ${
                          pathname === "/kapal/permohonan" ? "text-[#D97706]" : "text-[#64748B]"
                        }`}
                      />
                      {!isSidebarCollapsed && <span>Pengajuan Dermaga</span>}
                    </div>
                    {isSidebarCollapsed ? (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500" />
                    ) : (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                        1 Proses
                      </span>
                    )}
                  </Link>

                  {/* Link 4: Riwayat Pelayanan (/kapal/riwayat) */}
                  <Link
                    href="/kapal/riwayat"
                    title="Riwayat Pelayanan & Realisasi Kunjungan Kapal"
                    className={`transition-all flex items-center cursor-pointer relative ${
                      isSidebarCollapsed
                        ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                            pathname === "/kapal/riwayat"
                              ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                        : `w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold justify-between ${
                            pathname === "/kapal/riwayat"
                              ? "bg-[#0B241E] text-white shadow-xs"
                              : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock
                        className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} ${
                          pathname === "/kapal/riwayat" ? "text-[#D97706]" : "text-[#64748B]"
                        }`}
                      />
                      {!isSidebarCollapsed && <span>Riwayat Pelayanan</span>}
                    </div>
                    {!isSidebarCollapsed && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-[#475569] font-bold">
                        Logs
                      </span>
                    )}
                  </Link>
                </div>
              </div>

              {/* Group 2: Manifes & Keuangan */}
              <div>
                {!isSidebarCollapsed ? (
                  <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    Manifes & Tagihan Retribusi
                  </p>
                ) : (
                  <div className="my-2 border-t border-[#EDF2F7] mx-2" />
                )}
                <div className="mt-1 space-y-1">
                  {/* Link 4: Pelaporan Manifes (/kapal/manifes) */}
                  <Link
                    href="/kapal/manifes"
                    title="Pelaporan Manifes (Daftar Muatan & Penumpang)"
                    className={`transition-all flex items-center cursor-pointer ${
                      isSidebarCollapsed
                        ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                            pathname === "/kapal/manifes"
                              ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                        : `w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold justify-between ${
                            pathname === "/kapal/manifes"
                              ? "bg-[#0B241E] text-white shadow-xs"
                              : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCheck2
                        className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} ${
                          pathname === "/kapal/manifes" ? "text-[#D97706]" : "text-[#64748B]"
                        }`}
                      />
                      {!isSidebarCollapsed && <span>Pelaporan Manifes</span>}
                    </div>
                    {!isSidebarCollapsed && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                        SOLAS
                      </span>
                    )}
                  </Link>

                  {/* Link 5: Penagihan & Pembayaran (/kapal/penagihan) */}
                  <Link
                    href="/kapal/penagihan"
                    title="Tagihan e-SKRD & Pembayaran Retribusi"
                    className={`transition-all flex items-center cursor-pointer relative ${
                      isSidebarCollapsed
                        ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                            pathname === "/kapal/penagihan"
                              ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                        : `w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold justify-between ${
                            pathname === "/kapal/penagihan"
                              ? "bg-[#0B241E] text-white shadow-xs"
                              : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard
                        className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} ${
                          pathname === "/kapal/penagihan" ? "text-[#D97706]" : "text-[#64748B]"
                        }`}
                      />
                      {!isSidebarCollapsed && <span>Tagihan e-SKRD & Bayar</span>}
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Footer (Regulations & Compliance) */}
          <div className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC]">
            {isSidebarCollapsed ? (
              <div className="flex justify-center">
                <button
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-lg text-[#64748B] hover:text-red-700 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                  title="Keluar / Ganti Akun"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                  <span className="font-semibold text-[#0B241E]">Dasar Regulasi:</span>
                  <span className="font-mono text-[#D97706] font-bold">PP 35/2023</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Koneksi Host-to-Host Bank RKUD</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full mt-2 py-2 px-3 text-xs font-semibold text-red-700 hover:bg-red-50 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer border border-transparent hover:border-red-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Ganti Akun / Keluar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN CONTENT AREA (Header + Overlapping Banner + Body) */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#0B241E] text-white px-6 flex items-center justify-between border-b border-[#143E33] shrink-0 sticky top-0 z-20 shadow-xs">
          {/* Search Input for Operator with Sidebar Toggle */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-lg bg-[#143E33] hover:bg-[#1C4E40] text-[#BED2CA] hover:text-white border border-[#1E5748] transition-colors cursor-pointer shrink-0"
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
              <Search className="w-4 h-4 text-[#85A69B] absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama kapal, nomor permohonan, atau kode e-SKRD..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-[#143E33]/60 border border-[#1E5748] rounded-xl pl-9 pr-4 py-2 text-white placeholder-[#85A69B] focus:outline-none focus:border-[#D97706] transition-colors"
              />
            </div>
          </div>

          {/* Right Header Status Badges */}
          <div className="flex items-center gap-4 text-xs">
            {/* Active Port Indicator */}
            <div className="hidden md:flex items-center gap-2 bg-[#143E33]/70 px-3 py-1.5 rounded-lg border border-[#1E5748]">
              <Anchor className="w-3.5 h-3.5 text-[#D97706]" />
              <span className="text-[#E2E8F0] font-medium">Pangkalan: Pelabuhan Poumako, Mimika</span>
            </div>

            {/* Vessel Clearance Ready Indicator */}
            <div className="flex items-center gap-2 bg-[#143E33]/70 px-3 py-1.5 rounded-lg border border-[#1E5748]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[#85A69B] hidden sm:inline">Clearance:</span>
              <strong className="text-white font-mono">1 Siap Bertolak</strong>
            </div>
          </div>
        </header>

        {/* Hero Section Banner (Dark Green Brand Gradient with Ample Space) */}
        <div className="bg-gradient-to-r from-[#0B241E] via-[#10382D] to-[#16493B] text-white pt-7 pb-28 sm:pb-32 px-6 lg:px-8 border-b border-[#1E5748] shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-mono text-[#D97706] mb-1.5">
                <Link href="/kapal/dashboard" className="hover:underline">
                  PORTA OPERATOR
                </Link>
                <span>/</span>
                <span className="text-white">{getBreadcrumbLabel()}</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
                {getPageTitle()}
              </h1>
              <p className="text-xs text-[#A3BFB5] mt-2 max-w-2xl leading-relaxed">
                {getPageDescription()}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3 self-start md:self-auto pt-1">
              <Link
                href="/kapal/permohonan"
                className="px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>+ Ajukan Permohonan Dermaga</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Page Children Content Area (Overlapping the Hero Banner with luxurious breathing room) */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-8 -mt-10 sm:-mt-12 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
