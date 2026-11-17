"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Anchor,
  Ship,
  Building2,
  QrCode,
  Wrench,
  Clock,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Radio,
  Search,
  Bell,
  FileCheck2,
  ShieldCheck,
  CalendarCheck2,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

export default function UptLayout({
  children,
}: {
  children: any;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Collapsible Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleLogout = () => {
    router.push("/");
  };

  const getPageTitle = () => {
    if (pathname.includes("/upt/alokasi")) return "Persetujuan Sandar & Alokasi Slot Dermaga";
    if (pathname.includes("/upt/verifikasi")) return "Verifikasi Pendaftaran Operator & Armada";
    if (pathname.includes("/upt/kapal")) return "Pencatatan Kapal & Validasi Manifes";
    if (pathname.includes("/upt/tiket")) return "Tiket & Kontrol Akses (Gerbang / Loket)";
    if (pathname.includes("/upt/pemeliharaan")) return "Pemeliharaan & Peta Aset Pelabuhan";
    if (pathname.includes("/upt/shift")) return "Laporan Sif & Tutup Buku Kasir";
    return "Pusat Komando Operasional Harian (Command Center)";
  };

  const getBreadcrumbLabel = () => {
    if (pathname.includes("/upt/alokasi")) return "Alokasi Dermaga";
    if (pathname.includes("/upt/verifikasi")) return "Verifikasi Operator";
    if (pathname.includes("/upt/kapal")) return "Log Kapal & Manifes";
    if (pathname.includes("/upt/tiket")) return "Gerbang & Kontrol Akses";
    if (pathname.includes("/upt/pemeliharaan")) return "Inspeksi Fasilitas & GIS";
    if (pathname.includes("/upt/shift")) return "Serah Terima Sif Jaga";
    return "Dashboard Operasional";
  };

  const getPageDescription = () => {
    if (pathname.includes("/upt/alokasi"))
      return "Pemeriksaan permohonan sandar kapal, deteksi bentrok slot otomatis, verifikasi utilitas pelabuhan, dan penetapan izin alokasi dermaga resmi.";
    if (pathname.includes("/upt/verifikasi"))
      return "Pemeriksaan keabsahan dokumen legalitas SIUPAL, NPWP, Surat Ukur GT kapal, serta pengesahan akun operator sebelum izin sandar online aktif.";
    if (pathname.includes("/upt/kapal"))
      return "Pencatatan waktu aktual kedatangan/sandar/keberangkatan kapal (ATA/ATB/ATD), verifikasi manifes SOLAS, dan penerbitan izin berlayar (SPB).";
    if (pathname.includes("/upt/tiket"))
      return "Pemindai tiket digital QR barcode, pencegahan tiket ganda, input golongan kendaraan manual, dan mode offline di blind spot sinyal dermaga.";
    if (pathname.includes("/upt/pemeliharaan"))
      return "Formulir pelaporan kerusakan fasilitas fisik, penentuan tingkat keparahan, serta peta spasial GIS aset pelabuhan dan utilitas tenant.";
    if (pathname.includes("/upt/shift"))
      return "Rekonsiliasi transaksi loket non-tunai & fisik tunai, maker-checker supervisor, dan penerbitan Berita Acara Serah Terima (BAST) Sif Jaga.";
    return "Command center operasional dermaga terintegrasi: jadwal sandar, antrean kendaraan, peringatan dini insiden, dan monitoring personil sif aktif.";
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#1E2922] font-sans flex antialiased selection:bg-[#D97706]/20 selection:text-[#0B241E]">
      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (Collapsible UPT Admin Navigation)        */}
      {/* ========================================================= */}
      <aside
        className={`${
          isSidebarCollapsed ? "w-20" : "w-72"
        } bg-white flex flex-col justify-between shrink-0 shadow-xs z-30 sticky top-0 h-screen transition-all duration-300 ease-in-out relative`}
      >
        {/* Sleek Floating Seam Toggle Button - Positioned safely at the dark header seam (top-8), avoiding card collision */}
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
                  alt="PORTA"
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
                      UPTD MERAK
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono bg-[#143E33] text-[#D97706] border border-[#1E5748] font-bold px-1.5 py-0.5 rounded">
                    UPT
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
            {/* Officer Profile Mini Card */}
            {isSidebarCollapsed ? (
              <div className="my-2 flex justify-center">
                <div
                  className="w-10 h-10 rounded-full bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-xs shadow-xs border border-[#164336] cursor-pointer"
                  title="Capt. Ridwan H. (Supervisor Jaga Sif 1)"
                  onClick={() => setIsSidebarCollapsed(false)}
                >
                  RH
                </div>
              </div>
            ) : (
              <div className="p-3.5 mx-3 my-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-sm shrink-0 shadow-xs border border-[#164336]">
                  RH
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#0B241E] truncate">
                    Capt. Ridwan Hakim
                  </p>
                  <p className="text-[10px] text-[#64748B] truncate mt-0.5">
                    Syahbandar & Supervisor Sif 1
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Menus with Real Next.js Links */}
            <div className={isSidebarCollapsed ? "px-2 space-y-4" : "px-3 space-y-5"}>
              {/* Group 1: Operasional & Dermaga */}
              <div>
                {!isSidebarCollapsed && (
                  <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                    Operasional Dermaga
                  </p>
                )}
                <div className="space-y-1">
                  {/* Link 1: Pusat Komando (/upt/dashboard) */}
                  <Link
                    href="/upt/dashboard"
                    title="Pusat Komando Operasional"
                    className={`transition-all flex items-center cursor-pointer ${
                      isSidebarCollapsed
                        ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                            pathname === "/upt/dashboard" || pathname === "/upt"
                              ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                        : `w-full text-left px-3 py-2 rounded-lg text-xs font-bold justify-between gap-2.5 flex-nowrap ${
                            pathname === "/upt/dashboard" || pathname === "/upt"
                              ? "bg-[#0B241E] text-white shadow-xs"
                              : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Radio
                        className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} shrink-0 ${
                          pathname === "/upt/dashboard" || pathname === "/upt"
                            ? "text-[#D97706]"
                            : "text-[#64748B]"
                        }`}
                      />
                      {!isSidebarCollapsed && <span className="truncate whitespace-nowrap">Pusat Komando</span>}
                    </div>
                    {!isSidebarCollapsed && (pathname === "/upt/dashboard" || pathname === "/upt") && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] shrink-0" />
                    )}
                  </Link>

                  {/* Link: Verifikasi Operator (/upt/verifikasi) */}
                  <Link
                    href="/upt/verifikasi"
                    title="Verifikasi Pendaftaran Operator & Kapal"
                    className={`transition-all flex items-center cursor-pointer relative ${
                      isSidebarCollapsed
                        ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                            pathname === "/upt/verifikasi"
                              ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                        : `w-full text-left px-3 py-2 rounded-lg text-xs font-bold justify-between gap-2.5 flex-nowrap ${
                            pathname === "/upt/verifikasi"
                              ? "bg-[#0B241E] text-white shadow-xs"
                              : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <ShieldCheck
                        className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} shrink-0 ${
                          pathname === "/upt/verifikasi" ? "text-[#D97706]" : "text-[#64748B]"
                        }`}
                      />
                      {!isSidebarCollapsed && <span className="truncate whitespace-nowrap">Verifikasi Operator</span>}
                    </div>
                    {isSidebarCollapsed ? (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold whitespace-nowrap shrink-0 inline-flex items-center justify-center leading-none">
                        3 Baru
                      </span>
                    )}
                  </Link>

                  {/* Link: Alokasi & Persetujuan Slot Dermaga (/upt/alokasi) */}
                  <Link
                    href="/upt/alokasi"
                    title="Persetujuan Sandar & Alokasi Slot Dermaga"
                    className={`transition-all flex items-center cursor-pointer relative ${
                      isSidebarCollapsed
                        ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                            pathname === "/upt/alokasi"
                              ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                        : `w-full text-left px-3 py-2 rounded-lg text-xs font-bold justify-between gap-2.5 flex-nowrap ${
                            pathname === "/upt/alokasi"
                              ? "bg-[#0B241E] text-white shadow-xs"
                              : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <CalendarCheck2
                        className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} shrink-0 ${
                          pathname === "/upt/alokasi" ? "text-[#D97706]" : "text-[#64748B]"
                        }`}
                      />
                      {!isSidebarCollapsed && <span className="truncate whitespace-nowrap">Alokasi Dermaga</span>}
                    </div>
                    {isSidebarCollapsed ? (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold whitespace-nowrap shrink-0 inline-flex items-center justify-center leading-none">
                        2 Menunggu
                      </span>
                    )}
                  </Link>

                  {/* Link 2: Pencatatan Kapal & Manifes (/upt/kapal) */}
                  <Link
                    href="/upt/kapal"
                    title="Pencatatan Kapal & Manifes"
                    className={`transition-all flex items-center cursor-pointer relative ${
                      isSidebarCollapsed
                        ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                            pathname === "/upt/kapal"
                              ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                        : `w-full text-left px-3 py-2 rounded-lg text-xs font-bold justify-between gap-2.5 flex-nowrap ${
                            pathname === "/upt/kapal"
                              ? "bg-[#0B241E] text-white shadow-xs"
                              : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Ship
                        className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} shrink-0 ${
                          pathname === "/upt/kapal" ? "text-[#D97706]" : "text-[#64748B]"
                        }`}
                      />
                      {!isSidebarCollapsed && <span className="truncate whitespace-nowrap">Log Kapal & Manifes</span>}
                    </div>
                    {isSidebarCollapsed ? (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500" />
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold whitespace-nowrap shrink-0 inline-flex items-center justify-center leading-none">
                        2 Pending
                      </span>
                    )}
                  </Link>

                  {/* Link 3: Tiket & Kontrol Akses (/upt/tiket) */}
                  <Link
                    href="/upt/tiket"
                    title="Tiket & Kontrol Akses (QR Scanner)"
                    className={`transition-all flex items-center cursor-pointer relative ${
                      isSidebarCollapsed
                        ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                            pathname === "/upt/tiket"
                              ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                        : `w-full text-left px-3 py-2 rounded-lg text-xs font-bold justify-between gap-2.5 flex-nowrap ${
                            pathname === "/upt/tiket"
                              ? "bg-[#0B241E] text-white shadow-xs"
                              : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <QrCode
                        className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} shrink-0 ${
                          pathname === "/upt/tiket" ? "text-[#D97706]" : "text-[#64748B]"
                        }`}
                      />
                      {!isSidebarCollapsed && <span className="truncate whitespace-nowrap">Gerbang & Tiket QR</span>}
                    </div>
                    {!isSidebarCollapsed && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold whitespace-nowrap shrink-0 inline-flex items-center justify-center leading-none">
                        Scanner
                      </span>
                    )}
                  </Link>
                </div>
              </div>

              {/* Group 2: Fasilitas & Administrasi Sif */}
              <div>
                {!isSidebarCollapsed ? (
                  <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                    Fasilitas & Penutupan Sif
                  </p>
                ) : (
                  <div className="my-2 border-t border-[#EDF2F7] mx-2" />
                )}
                <div className="space-y-1">
                  {/* Link 4: Pemeliharaan & Aset (/upt/pemeliharaan) */}
                  <Link
                    href="/upt/pemeliharaan"
                    title="Inspeksi Pemeliharaan & Aset GIS"
                    className={`transition-all flex items-center cursor-pointer ${
                      isSidebarCollapsed
                        ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                            pathname === "/upt/pemeliharaan"
                              ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                        : `w-full text-left px-3 py-2 rounded-lg text-xs font-bold justify-between gap-2.5 flex-nowrap ${
                            pathname === "/upt/pemeliharaan"
                              ? "bg-[#0B241E] text-white shadow-xs"
                              : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Wrench
                        className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} shrink-0 ${
                          pathname === "/upt/pemeliharaan" ? "text-[#D97706]" : "text-[#64748B]"
                        }`}
                      />
                      {!isSidebarCollapsed && <span className="truncate whitespace-nowrap">Inspeksi & Aset GIS</span>}
                    </div>
                  </Link>

                  {/* Link 5: Laporan Sif & Tutup Buku (/upt/shift) */}
                  <Link
                    href="/upt/shift"
                    title="Laporan Sif & Tutup Buku Kasir"
                    className={`transition-all flex items-center cursor-pointer relative ${
                      isSidebarCollapsed
                        ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                            pathname === "/upt/shift"
                              ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                        : `w-full text-left px-3 py-2 rounded-lg text-xs font-bold justify-between gap-2.5 flex-nowrap ${
                            pathname === "/upt/shift"
                              ? "bg-[#0B241E] text-white shadow-xs"
                              : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Clock
                        className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} shrink-0 ${
                          pathname === "/upt/shift" ? "text-[#D97706]" : "text-[#64748B]"
                        }`}
                      />
                      {!isSidebarCollapsed && <span className="truncate whitespace-nowrap">Tutup Sif & BAST</span>}
                    </div>
                    {isSidebarCollapsed ? (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500" />
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold whitespace-nowrap shrink-0 inline-flex items-center justify-center leading-none">
                        Sif 1 Aktif
                      </span>
                    )}
                  </Link>
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
      {/* 2. MAIN VIEW CANVAS                                       */}
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
                placeholder="Cari kapal, manifes, nomor polisi, atau tiket QR..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#12362C] border border-[#1C4D3F] rounded-lg text-white placeholder-[#85A69B] focus:outline-none focus:border-[#D97706] transition-colors"
              />
            </div>
          </div>

          {/* Right Header Status Actions */}
          <div className="flex items-center gap-3">
            {/* Harbor Operational Pill */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono bg-[#12362C] border border-[#1C4D3F] px-3 py-1 rounded-full text-[#BED2CA]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Status: Pelabuhan DIBUKA (Gelombang 1.1m)</span>
            </div>

            {/* Sif Jaga Badge */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono bg-[#12362C] border border-[#1C4D3F] px-2.5 py-1 rounded-lg text-amber-300">
              <Clock className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Sif 1: 07:00 - 15:00</span>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => alert("Notifikasi Lapangan: 1 KMP Dharma Rucitra meminta izin sandar Dermaga 2; 1 laporan gate barcode kotor.")}
              className="relative p-2 rounded-lg bg-[#12362C] hover:bg-[#1A493B] text-white transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E11D48] text-white text-[9px] font-bold flex items-center justify-center">
                2
              </span>
            </button>

            <div className="h-6 w-px bg-[#184438]" />

            {/* Officer Badge */}
            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full bg-[#D97706] text-[#0B241E] flex items-center justify-center font-black text-xs">
                UP
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold leading-tight">Admin UPT</span>
                <span className="block text-[10px] text-[#85A69B]">Pelabuhan Merak</span>
              </div>
            </div>
          </div>
        </header>

        {/* B. HERO BANNER (Top Colored Band) */}
        <section className="bg-[#0B241E] text-white pt-7 pb-28 sm:pb-32 px-6 sm:px-8 border-b border-[#143E33] relative overflow-hidden">
          {/* Subtle Nautical Coordinate Lines */}
          <div className="absolute right-0 top-0 translate-x-20 -translate-y-12 w-96 h-96 rounded-full border border-[#164336]/40 pointer-events-none" />
          <div className="absolute right-12 top-0 translate-x-32 -translate-y-8 w-[420px] h-[420px] rounded-full border border-[#164336]/20 pointer-events-none" />

          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-mono text-[#D97706] mb-1.5">
                <Link href="/" className="hover:underline">PORTA</Link>
                <span>/</span>
                <Link href="/upt/dashboard" className="hover:underline">Otoritas UPTD Merak</Link>
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

            {/* Quick Officer Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto pt-1">
              <div className="bg-[#12362C] border border-[#1C4D3F] rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
                <Anchor className="w-3.5 h-3.5 text-[#D97706]" />
                <span className="font-semibold text-white">Dermaga 1 - 4 Aktif</span>
              </div>

              <Link
                href="/upt/tiket"
                className="bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <QrCode className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Buka QR Scanner</span>
              </Link>
            </div>
          </div>
        </section>

        {/* C. SUBPAGE CHILDREN CONTAINER (Overlaps Hero Banner with luxurious breathing room) */}
        <main className="max-w-7xl mx-auto px-6 sm:px-8 -mt-10 sm:-mt-12 pb-16 w-full flex-1 z-10 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
