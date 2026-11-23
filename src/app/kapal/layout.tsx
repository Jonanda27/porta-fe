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
  Store,
  ChevronRight,
  ArrowLeft,
  Search,
  Bell,
  CheckCircle2,
  LayoutDashboard,
  FileCheck2,
  FileSignature,
  Clock,
  Layers,
  HelpCircle,
  Scale,
  LogOut,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { LogoutConfirmModal } from "@/components/ui/LogoutConfirmModal";
import { AppSidebar, SidebarNavGroup } from "@/components/layout/AppSidebar";
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
  const { operator, vessels, visits, contracts, assetLeases, fetchDashboardData } = useKapalStore();
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
  const effectiveVerificationStatus =
    operator?.verificationStatus || user?.operatorVerificationStatus || "VERIFIED";
  const isVerified = effectiveVerificationStatus === "VERIFIED";
  const isPending = effectiveVerificationStatus === "PENDING";
  const isRejected = effectiveVerificationStatus === "REJECTED";
  const isUnverified = !isVerified;

  // Ketika masih menunggu verifikasi petugas (PETUGAS_REGISTRASI_KONTRAK), hanya Dashboard & Profil yang boleh diakses
  const isAllowedRouteWhenUnverified =
    pathname === "/kapal/dashboard" || pathname.startsWith("/kapal/profil");

  useEffect(() => {
    if (isUnverified && !isAllowedRouteWhenUnverified) {
      router.replace("/kapal/dashboard");
    }
  }, [isUnverified, isAllowedRouteWhenUnverified, router]);

  const siupalDisplayText = isPending
    ? "Menunggu Verifikasi Petugas"
    : isRejected
    ? "Verifikasi Ditolak Petugas"
    : siupalDoc?.documentNumber
    ? `SIUPAL: ${siupalDoc.documentNumber}`
    : isVerified
    ? "SIUPAL Terverifikasi"
    : operator?.npwp
    ? `NPWP: ${operator.npwp}`
    : "SIUPAL Belum Diunggah";

  // Statistik Real untuk Badge Menu Sidebar
  const vesselsCount = operator?.fleetSummary?.totalVessels ?? vessels.length;
  const berthsCount = berths.length > 0 ? berths.length : 6;
  const pendingVisitsCount = visits.filter((v) => v.status === "REQUESTED").length;
  const completedVisitsCount = visits.filter((v) => v.status === "DEPARTED").length;
  const unsubmittedManifestCount = visits.filter(
    (v) =>
      v.status === "SCHEDULED" ||
      v.status === "APPROVED" ||
      v.status === "BERTHED"
  ).length;
  const pendingLeasesCount = assetLeases.filter(
    (l) =>
      l.status === "REQUESTED" ||
      l.status === "PENDING_ROOM_OFFICER" ||
      l.status === "PENDING_HEAD_OF_PORT"
  ).length;
  const activeLeasesCount = assetLeases.filter((l) => l.status === "ACTIVE").length;
  const pendingPksCount = contracts.filter(
    (c) => c.status === "PENDING_VERIFICATION"
  ).length;
  const activePksCount = contracts.filter((c) => c.status === "ACTIVE").length;

  const getPageTitle = () => {
    if (pathname.includes("/kapal/pks-sandar")) return "Kontrak PKS Sandar & Kuota Dermaga";
    if (pathname.includes("/kapal/sewa-ruangan")) return "Katalog Ruangan, Kantor, Gudang & Aset Pelabuhan";
    if (pathname.includes("/kapal/kontrak-sewa")) return "Pengajuan & Kontrak Sewa Ruangan (PKS)";
    if (pathname.includes("/kapal/dermaga")) return "Fasilitas & Kesiapan Dermaga Fisik Pelabuhan Poumako";
    if (pathname.includes("/kapal/notifikasi")) return "Pusat Notifikasi Real-Time & Peringatan Sistem";
    if (pathname.includes("/kapal/keberatan")) return "Keberatan, Keringanan e-SKRD & Surat Teguran";
    if (pathname.includes("/kapal/riwayat")) return "Riwayat Pelayanan & Log Kunjungan Kapal";
    if (pathname.includes("/kapal/profil")) return "Profil Perusahaan & Master Data Armada";
    if (pathname.includes("/kapal/permohonan")) return "Siklus Permohonan Jadwal & Alokasi Dermaga";
    if (pathname.includes("/kapal/manifes")) return "Pelaporan Manifes (Daftar Penumpang & Muatan)";
    if (pathname.includes("/kapal/penagihan")) return "Penagihan Retribusi (e-SKRD) Dermaga & Sewa Ruangan";
    return "Dashboard Operator Kapal";
  };

  const getBreadcrumbLabel = () => {
    if (pathname.includes("/kapal/pks-sandar")) return "Kontrak PKS Sandar";
    if (pathname.includes("/kapal/sewa-ruangan")) return "Katalog Ruangan & Aset";
    if (pathname.includes("/kapal/kontrak-sewa")) return "Kontrak Sewa (PKS)";
    if (pathname.includes("/kapal/dermaga")) return "Fasilitas & Dermaga";
    if (pathname.includes("/kapal/notifikasi")) return "Pusat Notifikasi";
    if (pathname.includes("/kapal/keberatan")) return "Keberatan & Surat Teguran";
    if (pathname.includes("/kapal/riwayat")) return "Riwayat Kunjungan Kapal";
    if (pathname.includes("/kapal/profil")) return "Profil & Master Armada";
    if (pathname.includes("/kapal/permohonan")) return "Pengajuan Jadwal & Dermaga";
    if (pathname.includes("/kapal/manifes")) return "Pelaporan Manifes SOLAS";
    if (pathname.includes("/kapal/penagihan")) return "Tagihan e-SKRD & Pembayaran";
    return "Dashboard Operator";
  };

  const getPageDescription = () => {
    if (pathname.includes("/kapal/pks-sandar"))
      return "Pengelolaan Perjanjian Kerja Sama (PKS) Sandar, alokasi kuota slot dermaga bulanan, dan status pengesahan Kepala Pelabuhan sebagai prasyarat pengajuan warta sandar.";
    if (pathname.includes("/kapal/sewa-ruangan"))
      return "Pilih dan ajukan sewa ruangan kantor, loket, gudang, kios, atau aset pelabuhan lainnya yang berstatus tersedia sesuai Perda Kab. Mimika No. 4/2023.";
    if (pathname.includes("/kapal/kontrak-sewa"))
      return "Pantau progres persetujuan 2-tahap (Petugas Ruangan → Kepala Pelabuhan), masa berlaku PKS sewa ruangan, serta pengajuan perpanjangan kontrak.";
    if (pathname.includes("/kapal/dermaga"))
      return "Direktori fisik fasilitas dermaga Pelabuhan Poumako: kapasitas panjang garis tambat, status operasional, tipe konstruksi, dan klasifikasi objek retribusi daerah sesuai Perda No. 4/2023.";
    if (pathname.includes("/kapal/notifikasi"))
      return "Pemberitahuan resmi mengenai persetujuan izin sandar armada, pengesahan sewa ruangan, penerbitan tagihan e-SKRD, rekonsiliasi e-SSRD, serta surat teguran.";
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
      return "Tagihan terpadu e-SKRD untuk Pengajuan Dermaga (jasa labuh/tambat kapal) dan Pengajuan Ruangan (sewa aset/PKS) beserta pembayaran & cetak kuitansi e-SSRD.";
    return "Ringkasan operasional perusahaan pelayaran: pergerakan armada kapal, izin sandar, kontrak sewa ruangan, dan tagihan retribusi e-SKRD.";
  };

  const lockedTooltip =
    "Terkunci — Menunggu Verifikasi Petugas (Petugas Registrasi & Kontrak)";

  const navGroups: SidebarNavGroup[] = [
    {
      title: "Operasional Armada",
      items: [
        {
          label: "Dashboard Operator",
          href: "/kapal/dashboard",
          icon: LayoutDashboard,
          exact: true,
        },
        {
          label: "Profil & Master Kapal",
          href: "/kapal/profil",
          icon: Building2,
          badge: `${vesselsCount} Kapal`,
        },
        {
          label: "Fasilitas & Dermaga",
          href: "/kapal/dermaga",
          icon: Anchor,
          badge: `${berthsCount} Dermaga`,
          disabled: isUnverified,
          disabledTooltip: lockedTooltip,
        },
        {
          label: "Kontrak PKS Sandar",
          href: "/kapal/pks-sandar",
          icon: FileSignature,
          badge:
            pendingPksCount > 0
              ? `${pendingPksCount} Proses`
              : activePksCount > 0
              ? `${activePksCount} Aktif`
              : undefined,
          disabled: isUnverified,
          disabledTooltip: lockedTooltip,
        },
        {
          label: "Pengajuan Dermaga",
          href: "/kapal/permohonan",
          icon: Calendar,
          badge: pendingVisitsCount > 0 ? `${pendingVisitsCount} Proses` : undefined,
          disabled: isUnverified,
          disabledTooltip: lockedTooltip,
        },
        {
          label: "Riwayat Pelayanan",
          href: "/kapal/riwayat",
          icon: Clock,
          badge: completedVisitsCount > 0 ? `${completedVisitsCount} Selesai` : "Logs",
          disabled: isUnverified,
          disabledTooltip: lockedTooltip,
        },
      ],
    },
    {
      title: "Sewa Ruangan & Aset",
      items: [
        {
          label: "Katalog Ruangan & Aset",
          href: "/kapal/sewa-ruangan",
          icon: Store,
          disabled: isUnverified,
          disabledTooltip: lockedTooltip,
        },
        {
          label: "Kontrak Sewa (PKS)",
          href: "/kapal/kontrak-sewa",
          icon: FileText,
          badge:
            pendingLeasesCount > 0
              ? `${pendingLeasesCount} Proses`
              : activeLeasesCount > 0
              ? `${activeLeasesCount} Aktif`
              : undefined,
          disabled: isUnverified,
          disabledTooltip: lockedTooltip,
        },
      ],
    },
    {
      title: "Manifes & Tagihan Retribusi",
      items: [
        {
          label: "Pelaporan Manifes",
          href: "/kapal/manifes",
          icon: FileCheck2,
          badge: unsubmittedManifestCount > 0 ? `${unsubmittedManifestCount} Wajib` : "SOLAS",
          disabled: isUnverified,
          disabledTooltip: lockedTooltip,
        },
        {
          label: "Tagihan e-SKRD & Bayar",
          href: "/kapal/penagihan",
          icon: CreditCard,
          disabled: isUnverified,
          disabledTooltip: lockedTooltip,
        },
        {
          label: "Keberatan & Teguran",
          href: "/kapal/keberatan",
          icon: Scale,
          badge: "Perbup 25",
          disabled: isUnverified,
          disabledTooltip: lockedTooltip,
        },
        {
          label: "Pusat Notifikasi",
          href: "/kapal/notifikasi",
          icon: Bell,
          badge: unreadCount > 0 ? `${unreadCount} Baru` : undefined,
          disabled: isUnverified,
          disabledTooltip: lockedTooltip,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#1E2922] font-sans flex antialiased selection:bg-[#D97706]/20 selection:text-[#0B241E]">
      {/* 1. REUSABLE OPERATOR SIDEBAR */}
      <AppSidebar
        portalTitle="Portal Operator"
        portalSubtitle="Armada & Pelayaran"
        portalBadge="OPERATOR KAPAL"
        navGroups={navGroups}
        user={{
          name: operatorName,
          roleOrStatus: siupalDisplayText,
          initials: operatorInitials,
          statusVariant: isVerified ? "emerald" : "amber",
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onLogout={() => setShowLogoutModal(true)}
      />

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
                              if (isUnverified) {
                                router.push("/kapal/profil");
                                return;
                              }
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
                      {isUnverified ? (
                        <span className="text-[11px] font-medium text-[#64748B] inline-flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-amber-600" />
                          <span>Menu Notifikasi aktif setelah akun diverifikasi petugas</span>
                        </span>
                      ) : (
                        <Link
                          href="/kapal/notifikasi"
                          onClick={() => setIsNotifDropdownOpen(false)}
                          className="text-xs font-bold text-[#0B241E] hover:text-[#D97706] transition-colors inline-flex items-center gap-1"
                        >
                          <span>Buka Semua Notifikasi ({notifications.length})</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
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

        {/* Hero Section Banner (Maritime Background Image ONLY on /kapal/dashboard) */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0B241E] via-[#10382D] to-[#16493B] text-white pt-7 pb-28 sm:pb-32 px-6 lg:px-8 border-b border-[#1E5748] shrink-0">
          {pathname === "/kapal/dashboard" && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-[1.01]"
                style={{ backgroundImage: "url('/images/register-maritime-bg.jpg')" }}
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 bg-gradient-to-r from-[#0B241E]/95 via-[#0B241E]/85 to-[#0B241E]/40"
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#0B241E]/90 via-transparent to-[#0B241E]/40"
                aria-hidden="true"
              />
            </>
          )}

          <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-mono text-[#FBBF24] font-semibold mb-1.5 drop-shadow-2xs">
                <Link href="/kapal/dashboard" className="hover:underline">
                  PORTA OPERATOR
                </Link>
                <span>/</span>
                <span className="text-white font-bold">{getBreadcrumbLabel()}</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white leading-tight drop-shadow-xs">
                {getPageTitle()}
              </h1>
              <p className="text-xs text-[#D1E3DD] mt-2 max-w-2xl leading-relaxed drop-shadow-2xs">
                {getPageDescription()}
              </p>
            </div>
          </div>
        </div>

        {/* Page Children Content Area (Overlapping the Hero Banner with luxurious breathing room) */}
        <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 lg:px-8 -mt-10 sm:-mt-12 pb-12">
          {isUnverified && !isAllowedRouteWhenUnverified ? (
            <div className="bg-white border border-amber-200 rounded-2xl p-8 sm:p-10 shadow-sm text-center max-w-2xl mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <Lock className="w-3 h-3" />
                  <span>MENUNGGU VERIFIKASI PETUGAS</span>
                </span>
                <h2 className="text-lg font-extrabold text-[#0B241E] pt-1">
                  Akses Menu Dikunci Sementara
                </h2>
                <p className="text-xs text-[#64748B] leading-relaxed max-w-lg mx-auto">
                  Akun operator kapal Anda saat ini sedang menunggu verifikasi dari{" "}
                  <strong className="text-[#0B241E]">
                    Petugas Registrasi &amp; Kontrak
                  </strong>
                  . Selama menunggu verifikasi petugas, Anda hanya dapat mengakses halaman{" "}
                  <strong className="text-[#0B241E]">Dashboard Operator</strong> dan{" "}
                  <strong className="text-[#0B241E]">Profil &amp; Master Kapal</strong>.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href="/kapal/dashboard"
                  className="px-4 py-2.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0B241E] text-xs font-bold transition-colors"
                >
                  Kembali ke Dashboard Operator
                </Link>
                <Link
                  href="/kapal/profil"
                  className="px-4 py-2.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold transition-colors"
                >
                  Buka Profil &amp; Lengkapi Berkas
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
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
