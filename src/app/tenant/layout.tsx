"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Store,
  Building2,
  FileText,
  CreditCard,
  Zap,
  Droplet,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Search,
  Bell,
  CheckCircle2,
  ShieldCheck,
  Receipt,
  FileCheck2,
  Clock,
  Layers,
  HelpCircle,
  ExternalLink,
  MapPin,
  Sparkles,
  KeyRound,
  LogOut,
} from "lucide-react";

export default function TenantLayout({
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
    if (pathname.includes("/tenant/sewa")) return "Katalog Fasilitas & Pengajuan Sewa Aset";
    if (pathname.includes("/tenant/kontrak")) return "Perjanjian Kerja Sama (PKS) & Kontrak Sewa";
    if (pathname.includes("/tenant/utilitas")) return "Pencatatan & Monitoring Utilitas (Listrik & Air)";
    if (pathname.includes("/tenant/tagihan")) return "Tagihan Retribusi Daerah (e-SKRD) & Bukti Setor";
    return "Pusat Kendali Pengelolaan Tenant Pelabuhan";
  };

  const getBreadcrumbLabel = () => {
    if (pathname.includes("/tenant/sewa")) return "Katalog & Pengajuan Sewa";
    if (pathname.includes("/tenant/kontrak")) return "Buku Kontrak PKS";
    if (pathname.includes("/tenant/utilitas")) return "Konsumsi Utilitas";
    if (pathname.includes("/tenant/tagihan")) return "Tagihan e-SKRD";
    return "Dashboard Tenant";
  };

  const getPageSubtitle = () => {
    if (pathname.includes("/tenant/sewa"))
      return "Pilih unit kios, kantin, loket agen, atau gudang penumpukan, hitung estimasi retribusi BMD, dan ajukan permohonan sewa daring.";
    if (pathname.includes("/tenant/kontrak"))
      return "Daftar kontrak sewa PKS resmi, masa berlaku legalitas pemanfaatan aset daerah, dan pengingat perpanjangan kontrak berkala.";
    if (pathname.includes("/tenant/utilitas"))
      return "Pencatatan meteran awal-akhir listrik (kWh) dan air bersih (m³) per unit kios serta riwayat pemakaian bulanan.";
    if (pathname.includes("/tenant/tagihan"))
      return "Surat Ketetapan Retribusi Daerah (e-SKRD) pemanfaatan tempat usaha, pembayaran via VA Bank Kasda/QRIS, dan bukti setor SSRD sah.";
    return "Portal mandiri pelaku usaha kawasan pelabuhan: kelola unit sewa, pantau masa berlaku kontrak PKS, cek utilitas, dan bayar retribusi daerah.";
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#1E2922] font-sans flex antialiased selection:bg-[#D97706]/20 selection:text-[#0B241E]">
      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (Collapsible Tenant Navigation)           */}
      {/* ========================================================= */}
      <aside
        className={`${
          isSidebarCollapsed ? "w-20" : "w-72"
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
          {/* Brand Logo Header */}
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
                      MITRA TENANT
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono bg-[#143E33] text-[#D97706] border border-[#1E5748] font-bold px-1.5 py-0.5 rounded">
                    TENANT
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

          {/* Sidebar Body */}
          <div className="flex-1 overflow-y-auto border-r border-[#E2E8F0] py-2">
            {/* Tenant Profile Mini Card */}
            {isSidebarCollapsed ? (
              <div className="my-2 flex justify-center">
                <div
                  className="w-10 h-10 rounded-full bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-xs shadow-xs border border-[#164336] cursor-pointer"
                  title="Kios Cendrawasih Souvenir (Tenant Komersial)"
                  onClick={() => setIsSidebarCollapsed(false)}
                >
                  KC
                </div>
              </div>
            ) : (
              <div className="p-3.5 mx-3 my-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-sm shrink-0 shadow-xs border border-[#164336]">
                  KC
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#0B241E] truncate">
                    Kios Cendrawasih Souvenir
                  </p>
                  <p className="text-[10px] text-[#64748B] font-mono truncate">
                    NPWPD: 03.182.901.4-951.000
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      PKS Aktif (Blok A-04)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Menu Links */}
            <div className="px-3 space-y-1 mt-3">
              {/* Category Header */}
              {!isSidebarCollapsed && (
                <p className="px-3 text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider mb-1 mt-3">
                  MANAJEMEN TEMPAT USAHA
                </p>
              )}

              {/* Link 1: Dashboard Tenant */}
              <Link
                href="/tenant"
                title="Pusat Kendali Tenant"
                className={`transition-all flex items-center cursor-pointer relative ${
                  isSidebarCollapsed
                    ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                        pathname === "/tenant"
                          ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                          : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                      }`
                    : `w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold justify-between gap-2 ${
                        pathname === "/tenant"
                          ? "bg-[#0B241E] text-white shadow-xs"
                          : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                      }`
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Store
                    className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} shrink-0 ${
                      pathname === "/tenant" ? "text-[#D97706]" : "text-[#64748B]"
                    }`}
                  />
                  {!isSidebarCollapsed && <span className="whitespace-nowrap truncate">Dashboard Tenant</span>}
                </div>
                {!isSidebarCollapsed && pathname === "/tenant" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] shrink-0" />
                )}
              </Link>

              {/* Link 2: Katalog & Pengajuan Sewa (/tenant/sewa) */}
              <Link
                href="/tenant/sewa"
                title="Katalog Fasilitas & Pengajuan Sewa"
                className={`transition-all flex items-center cursor-pointer relative ${
                  isSidebarCollapsed
                    ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                        pathname.includes("/tenant/sewa")
                          ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                          : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                      }`
                    : `w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold justify-between gap-2 ${
                        pathname.includes("/tenant/sewa")
                          ? "bg-[#0B241E] text-white shadow-xs"
                          : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                      }`
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <KeyRound
                    className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} shrink-0 ${
                      pathname.includes("/tenant/sewa") ? "text-[#D97706]" : "text-[#64748B]"
                    }`}
                  />
                  {!isSidebarCollapsed && (
                    <span className="whitespace-nowrap truncate">Katalog & Sewa Aset</span>
                  )}
                </div>
                {isSidebarCollapsed ? (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold whitespace-nowrap shrink-0">
                    Katalog Aktif
                  </span>
                )}
              </Link>

              {/* Link 3: Kontrak & PKS Digital (/tenant/kontrak) */}
              <Link
                href="/tenant/kontrak"
                title="Buku Kontrak PKS Digital"
                className={`transition-all flex items-center cursor-pointer relative ${
                  isSidebarCollapsed
                    ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                        pathname.includes("/tenant/kontrak")
                          ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                          : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                      }`
                    : `w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold justify-between gap-2 ${
                        pathname.includes("/tenant/kontrak")
                          ? "bg-[#0B241E] text-white shadow-xs"
                          : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                      }`
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileCheck2
                    className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} shrink-0 ${
                      pathname.includes("/tenant/kontrak") ? "text-[#D97706]" : "text-[#64748B]"
                    }`}
                  />
                  {!isSidebarCollapsed && <span className="whitespace-nowrap truncate">Kontrak & PKS Digital</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold whitespace-nowrap shrink-0">
                    1 Aktif
                  </span>
                )}
              </Link>

              {/* Category Header */}
              {!isSidebarCollapsed && (
                <p className="px-3 text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider mb-1 mt-5">
                  UTILITAS & KEUANGAN DAERAH
                </p>
              )}

              {/* Link 4: Monitoring Utilitas (/tenant/utilitas) */}
              <Link
                href="/tenant/utilitas"
                title="Pencatatan Meteran Listrik & Air"
                className={`transition-all flex items-center cursor-pointer relative ${
                  isSidebarCollapsed
                    ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                        pathname.includes("/tenant/utilitas")
                          ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                          : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                      }`
                    : `w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold justify-between gap-2 ${
                        pathname.includes("/tenant/utilitas")
                          ? "bg-[#0B241E] text-white shadow-xs"
                          : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                      }`
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Zap
                    className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} shrink-0 ${
                      pathname.includes("/tenant/utilitas") ? "text-[#D97706]" : "text-[#64748B]"
                    }`}
                  />
                  {!isSidebarCollapsed && <span className="whitespace-nowrap truncate">Monitoring Utilitas</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold whitespace-nowrap shrink-0">
                    kWh & m³
                  </span>
                )}
              </Link>

              {/* Link 5: Tagihan & e-SKRD (/tenant/tagihan) */}
              <Link
                href="/tenant/tagihan"
                title="Tagihan Retribusi Daerah e-SKRD"
                className={`transition-all flex items-center cursor-pointer relative ${
                  isSidebarCollapsed
                    ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                        pathname.includes("/tenant/tagihan")
                          ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                          : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                      }`
                    : `w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold justify-between gap-2 ${
                        pathname.includes("/tenant/tagihan")
                          ? "bg-[#0B241E] text-white shadow-xs"
                          : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                      }`
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Receipt
                    className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} shrink-0 ${
                      pathname.includes("/tenant/tagihan") ? "text-[#D97706]" : "text-[#64748B]"
                    }`}
                  />
                  {!isSidebarCollapsed && <span className="whitespace-nowrap truncate">Tagihan & e-SKRD</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold whitespace-nowrap shrink-0">
                    Lunas
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Footer Area with Back to Home & Logout */}
          <div className="p-3 border-r border-[#E2E8F0] bg-[#F8FAFC]">
            <Link
              href="/"
              className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#64748B] hover:text-[#0B241E] hover:bg-[#E2E8F0] rounded-lg transition-colors cursor-pointer ${
                isSidebarCollapsed ? "justify-center" : ""
              }`}
              title="Kembali ke Portal Publik"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Portal Publik</span>}
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer mt-1 ${
                isSidebarCollapsed ? "justify-center" : ""
              }`}
              title="Keluar dari Akun Tenant"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Keluar</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. RIGHT MAIN CONTENT AREA                                */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#0B241E] text-white flex items-center justify-between px-6 shrink-0 border-b border-[#143E33] z-20">
          {/* Breadcrumb & Dynamic Title with Sidebar Toggle */}
          <div className="flex items-center gap-3 min-w-0">
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
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#85A69B]">
              <span>PORTA</span>
              <span>/</span>
              <span>Mitra Tenant</span>
              <span>/</span>
              <span className="text-white font-bold">{getBreadcrumbLabel()}</span>
            </div>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-3">
            {/* Quick Status Pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#143E33] border border-[#1E5748] text-xs">
              <MapPin className="w-3.5 h-3.5 text-[#D97706]" />
              <span className="text-[#85A69B]">Unit Sewa:</span>
              <strong className="text-white font-mono">Blok A-04 (Terminal)</strong>
            </div>

            {/* Notification Button */}
            <button
              type="button"
              className="relative p-2 rounded-lg text-[#85A69B] hover:text-white hover:bg-[#143E33] transition-colors cursor-pointer"
              title="Pemberitahuan Kontrak & Tagihan"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D97706]" />
            </button>

            {/* Tenant User Badge */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-[#143E33]">
              <div className="w-8 h-8 rounded-full bg-[#143E33] border border-[#1E5748] text-[#D97706] font-extrabold text-xs flex items-center justify-center">
                MK
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold leading-tight text-white">
                  Ny. Martha Kogoya
                </p>
                <p className="text-[10px] text-[#85A69B] leading-tight">
                  Pengelola Kios Cendrawasih
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Page Title Section (Consistent with UPT & Kapal layout) */}
        <div className="bg-[#0B241E] text-white px-6 sm:px-8 pt-7 pb-28 sm:pb-32 border-b border-[#143E33]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-mono text-[#D97706] mb-1.5">
                <Store className="w-4 h-4 inline" />
                <span>PORTAL MITRA USAHA & TENANT PELABUHAN REGIONAL</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
                {getPageTitle()}
              </h1>
              <p className="text-xs sm:text-sm text-[#BED2CA] mt-2 max-w-2xl leading-relaxed">
                {getPageSubtitle()}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start md:self-auto pt-1">
              <Link
                href="/tenant/sewa"
                className="px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <KeyRound className="w-4 h-4" />
                <span>Ajukan Sewa Unit Baru</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Dynamic Children Content (Offset over Hero background with ample breathing room) */}
        <main className="flex-1 px-6 sm:px-8 pb-12 -mt-10 sm:-mt-12 max-w-7xl w-full mx-auto z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
