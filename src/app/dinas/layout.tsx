"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  BarChart3,
  FileText,
  ShieldCheck,
  ExternalLink,
  Wrench,
  LogOut,
} from "lucide-react";
import { LogoutConfirmModal } from "@/components/ui/LogoutConfirmModal";
import { AppSidebar, SidebarNavGroup } from "@/components/layout/AppSidebar";
import { useAuthStore } from "@/store/auth.store";

function DinasHeaderFilters() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPort = searchParams.get("portId") || "all";
  const currentPeriod = searchParams.get("period") || "month";

  const handlePortChange = (portVal: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (portVal === "all") {
      params.delete("portId");
    } else {
      params.set("portId", portVal);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePeriodChange = (periodVal: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (periodVal === "month") {
      params.delete("period");
    } else {
      params.set("period", periodVal);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto pt-1">
      {/* Filter Pelabuhan Reaktif */}
      <div className="bg-[#12362C] border border-[#1C4D3F] rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
        <Anchor className="w-3.5 h-3.5 text-[#D97706]" />
        <select
          value={currentPort}
          onChange={(e) => handlePortChange(e.target.value)}
          className="bg-transparent text-white focus:outline-none cursor-pointer text-xs font-semibold"
        >
          <option value="all" className="bg-[#0B241E] text-white">Semua Pelabuhan (Kab. Mimika)</option>
          <option value="1" className="bg-[#0B241E] text-white">Pelabuhan Poumako (Utama)</option>
          <option value="2" className="bg-[#0B241E] text-white">Dolphin MB Ferry Penyeberangan</option>
          <option value="3" className="bg-[#0B241E] text-white">Dermaga Rakyat / PPI Poumako</option>
          <option value="4" className="bg-[#0B241E] text-white">Dermaga Perintis Kokonao</option>
        </select>
      </div>

      {/* Filter Periode Reaktif */}
      <div className="bg-[#12362C] border border-[#1C4D3F] rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
        <Calendar className="w-3.5 h-3.5 text-[#D97706]" />
        <select
          value={currentPeriod}
          onChange={(e) => handlePeriodChange(e.target.value)}
          className="bg-transparent text-white focus:outline-none cursor-pointer text-xs font-semibold"
        >
          <option value="today" className="bg-[#0B241E] text-white">Hari Ini (Real-time)</option>
          <option value="month" className="bg-[#0B241E] text-white">Bulan Berjalan</option>
          <option value="year" className="bg-[#0B241E] text-white">Tahun Anggaran 2026</option>
        </select>
      </div>

      {/* Export Button */}
      <button
        type="button"
        onClick={() => alert("Mengunduh Laporan Eksekutif PAD Pelabuhan Kab. Mimika (Format PDF Rekonsiliasi)...")}
        className="bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Unduh Laporan Eksekutif</span>
      </button>
    </div>
  );
}

export default function DinasLayout({
  children,
}: {
  children: any;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Collapsible Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  const { user, logout } = useAuthStore();

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    router.replace("/login");
  };

  // Determine Active Header Title & Breadcrumb based on URL
  const getPageTitle = () => {
    if (pathname.includes("/dinas/monitoring")) return "Monitoring Realisasi PAD & Piutang";
    if (pathname.includes("/dinas/operasional")) return "Pengawasan Operasional & Log Harian UPT";
    if (pathname.includes("/dinas/evaluasi")) return "Evaluasi Komparasi UPTD & Simulasi PAD";
    if (pathname.includes("/dinas/pengaduan")) return "Pemantauan Pelayanan Publik & SLA Pengaduan";
    return "Dashboard Eksekutif Dinas Perhubungan";
  };

  const getBreadcrumbLabel = () => {
    if (pathname.includes("/dinas/monitoring")) return "Penerimaan & Piutang Retribusi";
    if (pathname.includes("/dinas/operasional")) return "Operasional & Fasilitas";
    if (pathname.includes("/dinas/evaluasi")) return "Evaluasi Kinerja & Simulasi";
    if (pathname.includes("/dinas/pengaduan")) return "Kualitas Layanan & Pengaduan";
    return "Ringkasan Eksekutif";
  };

  const getPageDescription = () => {
    if (pathname.includes("/dinas/monitoring"))
      return "Monitoring rincian objek retribusi daerah, realisasi target APBD, status piutang, serta kepatuhan PP No. 35/2023.";
    if (pathname.includes("/dinas/operasional"))
      return "Pengawasan catatan shift harian perwira jaga UPT, armada kapal sandar, dan kelaikan fasilitas fisik dermaga Pelabuhan Poumako.";
    if (pathname.includes("/dinas/evaluasi"))
      return "Benchmarking efisiensi 4 UPTD, kalkulator simulasi penyesuaian tarif PAD, dan eksplorasi GIS peluang investasi.";
    if (pathname.includes("/dinas/pengaduan"))
      return "Log pelayanan publik terpadu, evaluasi kepatuhan SLA (< 24 Jam), dan monitoring disposisi laporan pimpinan.";
    return "Oversight makro real-time penerimaan PAD pelabuhan, operasional dermaga, kepatuhan regulasi, dan aset daerah.";
  };

  const navGroups: SidebarNavGroup[] = [
    {
      title: "Monitoring & Analitik",
      items: [
        {
          label: "Ringkasan Eksekutif",
          href: "/dinas/dashboard",
          icon: BarChart3,
          exact: true,
        },
        {
          label: "Penerimaan & Piutang",
          href: "/dinas/monitoring",
          icon: Receipt,
          badge: "3 Alert",
        },
        {
          label: "Operasional & Fasilitas",
          href: "/dinas/operasional",
          icon: Wrench,
          badge: "Log UPT",
        },
      ],
    },
    {
      title: "Strategi & Pelayanan",
      items: [
        {
          label: "Evaluasi & Simulasi",
          href: "/dinas/evaluasi",
          icon: Sliders,
          badge: "Kalkulator",
        },
        {
          label: "Layanan & Pengaduan",
          href: "/dinas/pengaduan",
          icon: Users,
          badge: "2 Aktif",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#1E2922] font-sans flex antialiased selection:bg-[#D97706]/20 selection:text-[#0B241E]">
      {/* 1. REUSABLE DINAS EKSEKUTIF SIDEBAR */}
      <AppSidebar
        portalTitle="Portal Eksekutif"
        portalSubtitle="Pengawasan & Kebijakan"
        portalBadge="DISHUB EKSEKUTIF"
        rightBadge="v2.4"
        navGroups={navGroups}
        user={{
          name: user?.fullName || "Drs. H. Hendra G., M.Si.",
          roleOrStatus: "Kepala Dinas Perhubungan",
          initials: "HG",
          statusVariant: "emerald",
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onLogout={() => setShowLogoutModal(true)}
      />

      {/* ========================================================= */}
      {/* 2. MAIN VIEW CANVAS (Able Pro Header & Overlapping Cards)  */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* A. TOP NAVIGATION BAR */}
        <header className="h-16 bg-[#0B241E] border-b border-[#143E33] flex items-center justify-between px-6 text-white sticky top-0 z-20 shadow-xs">
          {/* Left search bar */}
          <div className="flex items-center flex-1 max-w-md">
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
                <span className="block text-[10px] text-[#85A69B]">Dishub Kab. Mimika</span>
              </div>
            </div>

            {/* Quick Logout Header Action */}
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="p-2 rounded-lg bg-[#12362C] hover:bg-rose-950/80 hover:text-rose-400 text-slate-300 transition-colors cursor-pointer border border-transparent hover:border-rose-900/50"
              title="Keluar / Akhiri Sesi Kerja"
            >
              <LogOut className="w-4 h-4" />
            </button>
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

            {/* Global Filters on Header (Reaktif dengan Suspense Boundary) */}
            <Suspense
              fallback={
                <div className="text-xs text-emerald-400 font-mono py-1.5">
                  Memuat filter pelabuhan...
                </div>
              }
            >
              <DinasHeaderFilters />
            </Suspense>
          </div>
        </section>

        {/* C. SUBPAGE CHILDREN CONTAINER (Overlaps Hero Banner with luxurious breathing room) */}
        <main className="max-w-7xl mx-auto px-6 sm:px-8 -mt-10 sm:-mt-12 pb-16 w-full flex-1 z-10 space-y-6">
          {children}
        </main>
      </div>

      {/* Modal Validasi Logout */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        userName={user?.fullName || "Kepala Dinas Perhubungan"}
        userRole="DISHUB EKSEKUTIF"
        userEmail={user?.email || "kadis.dishub@porta.mimikakab.go.id"}
      />
    </div>
  );
}
