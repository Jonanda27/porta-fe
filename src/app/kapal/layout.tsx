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
  Radio,
  FileCheck2,
  Clock,
  Layers,
  HelpCircle,
  Scale,
  LogOut,
} from "lucide-react";
import { LogoutConfirmModal } from "@/components/ui/LogoutConfirmModal";
import { useAuthStore } from "@/store/auth.store";
import { useKapalStore } from "@/store/kapal.store";
import { usePortStore } from "@/store/port.store";
import { useNotificationStore } from "@/store/notification.store";
import { AuthService } from "@/services/auth.service";

export default function KapalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, initialize: initAuth } = useAuthStore();
  const { operator, vessels, visits, fetchDashboardData } = useKapalStore();
  const { berths, fetchBerths } = usePortStore();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead: markNotifRead,
    markAllAsRead: markAllNotifsRead,
  } = useNotificationStore();

  useEffect(() => {
    initAuth();
    fetchDashboardData();
    fetchNotifications();
    fetchBerths(1);
  }, [initAuth, fetchDashboardData, fetchNotifications, fetchBerths]);

  // Collapsible Sidebar & Notification Dropdown State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  const handleConfirmLogout = () => {
    AuthService.logout();
    useAuthStore.getState().logout();
    setShowLogoutModal(false);
    router.replace("/login");
  };

  // Nama operator dinamis dari backend atau session login
  const operatorName =
    operator?.name ||
    (user?.fullName
      ? user.fullName.replace(/\(.*?\)/g, "").trim()
      : "Perusahaan Pelayaran");

  // Inisial perusahaan yang bersih dari prefiks badan hukum (PT, CV, PERUM, UD, PO) dan tanda baca
  const cleanedOperatorName = operatorName
    .replace(/^(PT|CV|PERUM|UD|PO)\.?\s+/i, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim();
  const nameWords = cleanedOperatorName.split(/\s+/).filter(Boolean);
  const operatorInitials =
    nameWords.length >= 2
      ? (nameWords[0][0] + nameWords[1][0]).toUpperCase()
      : nameWords.length === 1
      ? nameWords[0].slice(0, 2).toUpperCase()
      : "OP";

  // Status SIUPAL / Legalitas Operator Real
  const siupalDoc = operator?.documents?.find((d) => d.category === "SIUPAL_NIB");
  const isVerified = operator?.verificationStatus === "VERIFIED";
  const isPending =
    operator?.verificationStatus === "PENDING" ||
    user?.operatorVerificationStatus === "PENDING";

  const siupalDisplayText = siupalDoc?.documentNumber
    ? `SIUPAL: ${siupalDoc.documentNumber}`
    : isVerified
    ? "SIUPAL Terverifikasi"
    : isPending
    ? "Status: Verifikasi UPT"
    : operator?.npwp
    ? `NPWP: ${operator.npwp}`
    : "SIUPAL Belum Diunggah";

  // Statistik Real untuk Badge Menu Sidebar
  const vesselsCount = vessels.length;
  const berthsCount = berths.length > 0 ? berths.length : 6;
  const pendingVisitsCount = visits.filter((v) => v.status === "REQUESTED").length;
  const completedVisitsCount = visits.filter((v) => v.status === "DEPARTED").length;
  const unsubmittedManifestCount = visits.filter(
    (v) =>
      v.status === "SCHEDULED" ||
      v.status === "APPROVED" ||
      v.status === "BERTHED"
  ).length;

  const getPageTitle = () => {
    if (pathname.includes("/kapal/dermaga")) return "Fasilitas & Kesiapan Dermaga Fisik Pelabuhan Poumako";
    if (pathname.includes("/kapal/notifikasi")) return "Pusat Notifikasi Real-Time & Peringatan Sistem";
    if (pathname.includes("/kapal/keberatan")) return "Keberatan, Keringanan e-SKRD & Surat Teguran";
    if (pathname.includes("/kapal/riwayat")) return "Riwayat Pelayanan & Log Kunjungan Kapal";
    if (pathname.includes("/kapal/profil")) return "Profil Perusahaan & Master Data Armada";
    if (pathname.includes("/kapal/permohonan")) return "Siklus Permohonan Jadwal & Alokasi Dermaga";
    if (pathname.includes("/kapal/manifes")) return "Pelaporan Manifes (Daftar Penumpang & Muatan)";
    if (pathname.includes("/kapal/penagihan")) return "Penagihan Retribusi (e-SKRD) & Riwayat Transaksi";
    return "Pusat Kendali Operasional Perusahaan Kapal";
  };

  const getBreadcrumbLabel = () => {
    if (pathname.includes("/kapal/dermaga")) return "Fasilitas & Dermaga";
    if (pathname.includes("/kapal/notifikasi")) return "Pusat Notifikasi";
    if (pathname.includes("/kapal/keberatan")) return "Keberatan & Surat Teguran";
    if (pathname.includes("/kapal/riwayat")) return "Riwayat Kunjungan Kapal";
    if (pathname.includes("/kapal/profil")) return "Profil & Master Armada";
    if (pathname.includes("/kapal/permohonan")) return "Pengajuan Jadwal & Dermaga";
    if (pathname.includes("/kapal/manifes")) return "Pelaporan Manifes SOLAS";
    if (pathname.includes("/kapal/penagihan")) return "Tagihan e-SKRD & Pembayaran";
    return "Dashboard Armada";
  };

  const getPageDescription = () => {
    if (pathname.includes("/kapal/dermaga"))
      return "Direktori fisik fasilitas dermaga Pelabuhan Poumako: kapasitas panjang garis tambat, status operasional, tipe konstruksi, dan klasifikasi objek retribusi daerah sesuai Perda No. 4/2023.";
    if (pathname.includes("/kapal/notifikasi"))
      return "Pemberitahuan resmi mengenai persetujuan izin sandar armada, penerbitan tagihan e-SKRD, rekonsiliasi setoran e-SSRD, serta pemantauan surat teguran kepelabuhanan.";
    if (pathname.includes("/kapal/keberatan"))
      return "Permohonan keringanan, angsuran, atau penundaan waktu bayar e-SKRD sesuai Perbup Mimika No. 25/2024 serta pemantauan Surat Teguran piutang retribusi daerah.";
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
        {/* Floating Circular Sidebar Toggle Button (Gambar 2 Reference: Clean Circular Button on Seam) */}
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute right-0 top-[138px] translate-x-1/2 -translate-y-1/2 z-40 w-8 h-8 rounded-full bg-[#0B241E] hover:bg-[#133D31] text-white border border-[#235848] hover:border-[#D97706]/70 shadow-md flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 group focus:outline-none"
          title={isSidebarCollapsed ? "Buka Sidebar" : "Ciutkan Sidebar"}
          aria-label={isSidebarCollapsed ? "Buka Sidebar" : "Ciutkan Sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-[#D97706] group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
          ) : (
            <ChevronLeft className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
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
                  <p className="text-[10px] text-[#64748B] truncate mt-0.5 flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full inline-block shrink-0 ${
                        isVerified || siupalDoc?.documentNumber
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }`}
                    />
                    <span title={siupalDisplayText} className="truncate">
                      {siupalDisplayText}
                    </span>
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
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          vesselsCount > 0
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {vesselsCount} Kapal
                      </span>
                    )}
                  </Link>

                  {/* Link 3: Fasilitas & Dermaga (/kapal/dermaga) */}
                  <Link
                    href="/kapal/dermaga"
                    title="Fasilitas & Kesiapan Dermaga Fisik Pelabuhan Poumako"
                    className={`transition-all flex items-center cursor-pointer relative ${
                      isSidebarCollapsed
                        ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                            pathname === "/kapal/dermaga"
                              ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                        : `w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold justify-between ${
                            pathname === "/kapal/dermaga"
                              ? "bg-[#0B241E] text-white shadow-xs"
                              : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Anchor
                        className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} ${
                          pathname === "/kapal/dermaga" ? "text-[#D97706]" : "text-[#64748B]"
                        }`}
                      />
                      {!isSidebarCollapsed && <span>Fasilitas & Dermaga</span>}
                    </div>
                    {!isSidebarCollapsed && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                        {berthsCount} Dermaga
                      </span>
                    )}
                  </Link>

                  {/* Link 4: Permohonan Jadwal & Dermaga (/kapal/permohonan) */}
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
                    {pendingVisitsCount > 0 && (
                      isSidebarCollapsed ? (
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      ) : (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold animate-pulse">
                          {pendingVisitsCount} Proses
                        </span>
                      )
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
                        {completedVisitsCount > 0 ? `${completedVisitsCount} Selesai` : "Logs"}
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
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          unsubmittedManifestCount > 0
                            ? "bg-amber-100 text-amber-900 animate-pulse"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {unsubmittedManifestCount > 0 ? `${unsubmittedManifestCount} Wajib` : "SOLAS"}
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

                  {/* Link 6: Keberatan & Surat Teguran (/kapal/keberatan) */}
                  <Link
                    href="/kapal/keberatan"
                    title="Permohonan Keberatan e-SKRD & Surat Teguran"
                    className={`transition-all flex items-center cursor-pointer relative ${
                      isSidebarCollapsed
                        ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                            pathname === "/kapal/keberatan"
                              ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                        : `w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold justify-between ${
                            pathname === "/kapal/keberatan"
                              ? "bg-[#0B241E] text-white shadow-xs"
                              : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Scale
                        className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} ${
                          pathname === "/kapal/keberatan" ? "text-[#D97706]" : "text-[#64748B]"
                        }`}
                      />
                      {!isSidebarCollapsed && <span>Keberatan & Teguran</span>}
                    </div>
                    {!isSidebarCollapsed && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                        Perbup 25
                      </span>
                    )}
                  </Link>

                  {/* Link 7: Pusat Notifikasi Sistem (/kapal/notifikasi) */}
                  <Link
                    href="/kapal/notifikasi"
                    title="Pusat Notifikasi Sistem Real-Time"
                    className={`transition-all flex items-center cursor-pointer relative ${
                      isSidebarCollapsed
                        ? `w-11 h-11 mx-auto rounded-lg justify-center ${
                            pathname === "/kapal/notifikasi"
                              ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                        : `w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold justify-between ${
                            pathname === "/kapal/notifikasi"
                              ? "bg-[#0B241E] text-white shadow-xs"
                              : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Bell
                        className={`${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} ${
                          pathname === "/kapal/notifikasi" ? "text-[#D97706]" : "text-[#64748B]"
                        }`}
                      />
                      {!isSidebarCollapsed && <span>Pusat Notifikasi</span>}
                    </div>
                    {unreadCount > 0 && (
                      <span
                        className={`${
                          isSidebarCollapsed
                            ? "absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse"
                            : "text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-red-600 text-white font-extrabold shadow-2xs"
                        }`}
                      >
                        {!isSidebarCollapsed ? `${unreadCount} Baru` : ""}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC]">
            {isSidebarCollapsed ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="w-10 h-10 rounded-lg text-[#64748B] hover:text-red-700 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                  title="Keluar / Ganti Akun"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full py-2 px-3 text-xs font-semibold text-red-700 hover:bg-red-50 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer border border-transparent hover:border-red-200"
                >
                  <LogOut className="w-4 h-4" />
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
          {/* Search Input for Operator */}
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#85A69B] absolute left-3.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama kapal, nomor permohonan, atau kode e-SKRD..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-[#143E33]/60 border border-[#1E5748] rounded-xl pl-10 pr-4 py-2 text-white placeholder-[#85A69B] focus:outline-none focus:border-[#D97706] transition-colors"
              />
            </div>
          </div>

          {/* Right Header Status Badges & Notifications */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            {/* Interactive Notification Bell with Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                className="relative p-2 rounded-lg bg-[#143E33]/80 hover:bg-[#1C4E40] text-[#BED2CA] hover:text-white border border-[#1E5748] transition-colors cursor-pointer flex items-center justify-center shadow-xs"
                title="Pusat Notifikasi Sistem"
                aria-label="Buka Notifikasi Sistem"
              >
                <Bell className="w-4 h-4 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white font-mono text-[9px] font-black flex items-center justify-center border-2 border-[#0B241E] animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isNotifDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNotifDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] z-50 text-[#1E2922] overflow-hidden">
                    {/* Header Popover */}
                    <div className="bg-[#0B241E] text-white p-3.5 px-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#D97706]" />
                        <span className="text-xs font-bold tracking-wide">Notifikasi Sistem</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-mono font-bold bg-[#D97706] text-[#0B241E] px-1.5 py-0.2 rounded-full">
                            {unreadCount} Baru
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => markAllNotifsRead()}
                          className="text-[10px] text-[#85A69B] hover:text-white hover:underline cursor-pointer flex items-center gap-1 font-medium"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Tandai dibaca</span>
                        </button>
                      )}
                    </div>

                    {/* Notification List Scrollable */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-[#F1F5F9]">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[#64748B]">
                          <Bell className="w-6 h-6 text-[#94A3B8] mx-auto mb-2 opacity-50" />
                          <p>Belum ada notifikasi baru.</p>
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((item) => (
                          <div
                            key={item.id}
                            onClick={async () => {
                              if (!item.isRead) {
                                await markNotifRead(item.id);
                              }
                              setIsNotifDropdownOpen(false);
                              if (item.linkUrl) {
                                router.push(item.linkUrl);
                              } else {
                                router.push("/kapal/notifikasi");
                              }
                            }}
                            className={`p-3 px-4 hover:bg-[#F8FAFC] transition-colors cursor-pointer flex items-start gap-3 ${
                              !item.isRead ? "bg-amber-50/20" : ""
                            }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs mt-0.5 ${
                                item.type === "WARNING"
                                  ? "bg-red-100 text-red-600"
                                  : item.type === "VISIT_APPROVED"
                                  ? "bg-emerald-100 text-emerald-600"
                                  : item.type === "INVOICE_ISSUED"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-teal-100 text-teal-700"
                              }`}
                            >
                              <Bell className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <p className="text-xs font-bold text-[#0B241E] truncate">
                                  {item.title}
                                </p>
                                {!item.isRead && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-[#64748B] line-clamp-2 mt-0.5 leading-snug">
                                {item.message}
                              </p>
                              <span className="text-[9px] font-mono text-[#94A3B8] mt-1 block">
                                {new Date(item.createdAt).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Dropdown Footer Link */}
                    <div className="p-2.5 bg-[#F8FAFC] border-t border-[#E2E8F0] text-center">
                      <Link
                        href="/kapal/notifikasi"
                        onClick={() => setIsNotifDropdownOpen(false)}
                        className="text-xs font-bold text-[#0B241E] hover:text-[#D97706] transition-colors inline-flex items-center gap-1"
                      >
                        <span>Buka Semua Notifikasi ({notifications.length})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Logout Header Action */}
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="p-2 rounded-lg bg-[#143E33]/80 hover:bg-rose-950/80 hover:text-rose-400 text-[#BED2CA] border border-[#1E5748] hover:border-rose-900/50 transition-colors cursor-pointer flex items-center justify-center shadow-xs"
              title="Keluar / Akhiri Sesi Kerja Operator"
            >
              <LogOut className="w-4 h-4" />
            </button>
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
          </div>
        </div>

        {/* Page Children Content Area (Overlapping the Hero Banner with luxurious breathing room) */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-8 -mt-10 sm:-mt-12 pb-12">
          {children}
        </main>
      </div>

      {/* Modal Validasi Logout */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        userName={operatorName}
        userRole={user?.role || "OPERATOR_KAPAL"}
        userEmail={user?.email || "operator@pelayaran.co.id"}
      />
    </div>
  );
}
