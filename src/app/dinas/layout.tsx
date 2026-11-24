"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Receipt,
  Calendar,
  Download,
  Search,
  Bell,
  Users,
  Anchor,
  Sliders,
  BarChart3,
  Wrench,
  LogOut,
  Check,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { LogoutConfirmModal } from "@/components/ui/LogoutConfirmModal";
import { AppSidebar, SidebarNavGroup } from "@/components/layout/AppSidebar";
import { useAuthStore } from "@/store/auth.store";
import { useNotificationStore } from "@/store/notification.store";
import { PortService } from "@/services/port.service";
import { PortItem } from "@/types/port.types";

function DinasHeaderFilters({
  ports,
  isLoadingPorts,
}: {
  ports: PortItem[];
  isLoadingPorts: boolean;
}) {
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
    <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto self-start lg:self-end">
      {/* Filter Pelabuhan Reaktif (Data Riil API Backend) */}
      <div className="bg-[#12362C] border border-[#1C4D3F] hover:border-[#2A6553] rounded-lg px-3 py-2 sm:py-1.5 flex items-center gap-2 text-xs transition-colors w-full sm:w-auto">
        <Anchor className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
        <select
          value={currentPort}
          onChange={(e) => handlePortChange(e.target.value)}
          className="bg-transparent text-white focus:outline-none cursor-pointer text-xs font-semibold w-full sm:w-auto sm:max-w-[240px] truncate"
          disabled={isLoadingPorts}
        >
          <option value="all" className="bg-[#0B241E] text-white">
            Semua Pelabuhan (Agregat UPTD)
          </option>
          {ports.map((port) => (
            <option key={port.id} value={port.id.toString()} className="bg-[#0B241E] text-white">
              {port.name} {port.code ? `(${port.code})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Filter Periode Reaktif */}
      <div className="bg-[#12362C] border border-[#1C4D3F] hover:border-[#2A6553] rounded-lg px-3 py-2 sm:py-1.5 flex items-center gap-2 text-xs transition-colors w-full sm:w-auto">
        <Calendar className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
        <select
          value={currentPeriod}
          onChange={(e) => handlePeriodChange(e.target.value)}
          className="bg-transparent text-white focus:outline-none cursor-pointer text-xs font-semibold w-full sm:w-auto"
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
        className="bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] font-bold px-3.5 py-2 sm:py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0 w-full sm:w-auto"
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
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Collapsible Sidebar State (Desktop) & Drawer State (Mobile/Tablet)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  // Dynamic Ports state
  const [ports, setPorts] = useState<PortItem[]>([]);
  const [isLoadingPorts, setIsLoadingPorts] = useState<boolean>(true);

  // Live Notification state
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuthStore();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAllAsRead,
    markAsRead,
  } = useNotificationStore();

  useEffect(() => {
    // 1. Fetch live ports
    let isMounted = true;
    PortService.getAllPorts()
      .then((data) => {
        if (isMounted) {
          setPorts(data);
          setIsLoadingPorts(false);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat master pelabuhan:", err);
        if (isMounted) setIsLoadingPorts(false);
      });

    // 2. Fetch live notifications
    fetchNotifications();

    return () => {
      isMounted = false;
    };
  }, [fetchNotifications]);

  // Click outside to close notification popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    }
    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen]);

  // Tutup mobile drawer otomatis saat berpindah halaman
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

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
    return "Dashboard Eksekutif";
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
          label: "Dashboard Eksekutif",
          href: "/dinas/dashboard",
          icon: BarChart3,
          exact: true,
        },
        {
          label: "Penerimaan & Piutang",
          href: "/dinas/monitoring",
          icon: Receipt,
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
          badge: "Live API",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#1E2922] font-sans flex antialiased selection:bg-[#D97706]/20 selection:text-[#0B241E]">
      {/* 1A. DESKTOP SIDEBAR (Hidden on Mobile/Tablet < lg) */}
      <div className="hidden lg:flex shrink-0">
        <AppSidebar
          portalTitle="Portal Eksekutif"
          portalSubtitle="Pengawasan & Kebijakan"
          portalBadge="EKSEKUTIF"
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
      </div>

      {/* 1B. MOBILE & TABLET DRAWER SIDEBAR (< lg) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-10 flex h-full shadow-2xl">
            <AppSidebar
              portalTitle="Portal Eksekutif"
              portalSubtitle="Pengawasan & Kebijakan"
              portalBadge="EKSEKUTIF"
              navGroups={navGroups}
              user={{
                name: user?.fullName || "Drs. H. Hendra G., M.Si.",
                roleOrStatus: "Kepala Dinas Perhubungan",
                initials: "HG",
                statusVariant: "emerald",
              }}
              isCollapsed={false}
              onToggleCollapse={() => setIsMobileSidebarOpen(false)}
              onLogout={() => {
                setIsMobileSidebarOpen(false);
                setShowLogoutModal(true);
              }}
            />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MAIN VIEW CANVAS (Able Pro Header & Overlapping Cards)  */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* A. TOP NAVIGATION BAR */}
        <header className="h-16 bg-[#0B241E] border-b border-[#143E33] flex items-center justify-between gap-3 px-4 sm:px-6 text-white sticky top-0 z-20 shadow-xs">
          {/* Mobile Menu Trigger + Left search bar */}
          <div className="flex items-center gap-2.5 flex-1 max-w-md min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-[#12362C] hover:bg-[#1A493B] text-white transition-colors cursor-pointer shrink-0"
              aria-label="Buka Menu Navigasi"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="relative w-full min-w-0">
              <Search className="w-4 h-4 text-[#85A69B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari UPTD, objek retribusi, invoice..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#12362C] border border-[#1C4D3F] rounded-lg text-white placeholder-[#85A69B] focus:outline-none focus:border-[#D97706] transition-colors"
              />
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Notification Bell with Live Dropdown */}
            <div className="relative" ref={notificationDropdownRef}>
              <button
                type="button"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 rounded-lg bg-[#12362C] hover:bg-[#1A493B] text-white transition-colors cursor-pointer"
                title="Notifikasi & Peringatan Operasional"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E11D48] text-white text-[10px] font-bold flex items-center justify-center font-mono">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Live Notifications Popover */}
              {isNotificationOpen && (
                <div className="absolute -right-12 sm:right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl text-[#0B241E] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-4 bg-[#0B241E] text-white flex items-center justify-between border-b border-[#143E33]">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#D97706]" />
                      <h4 className="text-xs font-extrabold uppercase tracking-wider">
                        Notifikasi Pimpinan
                      </h4>
                      {unreadCount > 0 && (
                        <span className="bg-[#E11D48] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono">
                          {unreadCount} Baru
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => markAllAsRead()}
                        className="text-[11px] text-[#BED2CA] hover:text-[#D97706] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        Tandai Semua
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-400">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto stroke-[1.5]" />
                        <p className="text-xs font-medium text-gray-600 mt-2">
                          Tidak ada peringatan baru
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Operasional pelabuhan berjalan normal.
                        </p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notif) => {
                        const isHighPriority =
                          notif.priority === "CRITICAL" ||
                          notif.priority === "URGENT" ||
                          notif.priority === "WARNING";
                        const timeStr = notif.createdAt
                          ? notif.createdAt.split("T")[0] + " " + (notif.createdAt.split("T")[1]?.slice(0, 5) || "")
                          : "";

                        return (
                          <div
                            key={notif.id}
                            onClick={() => {
                              if (!notif.isRead) markAsRead(notif.id);
                            }}
                            className={`p-3 text-xs transition-colors cursor-pointer flex gap-3 ${
                              notif.isRead ? "bg-white hover:bg-gray-50 text-gray-600" : "bg-emerald-50/50 hover:bg-emerald-50/80 text-gray-900"
                            }`}
                          >
                            <div className="pt-0.5 shrink-0">
                              {isHighPriority ? (
                                <AlertTriangle className="w-4 h-4 text-rose-600" />
                              ) : (
                                <Info className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-bold text-[11px] truncate">{notif.title}</p>
                                {!notif.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2">
                                {notif.message}
                              </p>
                              {timeStr && (
                                <p className="text-[9px] text-gray-400 font-mono mt-1">
                                  {timeStr} WIT
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-5 w-px bg-[#184438]" />

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
        <section className="bg-[#0B241E] text-white pt-5 pb-16 sm:pt-6 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-[#143E33] relative overflow-hidden">
          {/* Subtle Nautical Coordinate Lines */}
          <div className="absolute right-0 top-0 translate-x-20 -translate-y-12 w-96 h-96 rounded-full border border-[#164336]/40 pointer-events-none" />
          <div className="absolute right-12 top-0 translate-x-32 -translate-y-8 w-[420px] h-[420px] rounded-full border border-[#164336]/20 pointer-events-none" />

          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-5 relative z-10">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono text-[#D97706] mb-1.5">
                <Link href="/" className="hover:underline">PORTA</Link>
                <span>/</span>
                <Link href="/dinas/dashboard" className="hover:underline">Dinas Perhubungan</Link>
                <span>/</span>
                <span className="text-white font-semibold">{getBreadcrumbLabel()}</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {getPageTitle()}
              </h1>
              <p className="text-xs sm:text-sm text-[#BED2CA] mt-1.5 max-w-xl leading-relaxed">
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
              <DinasHeaderFilters ports={ports} isLoadingPorts={isLoadingPorts} />
            </Suspense>
          </div>
        </section>

        {/* C. SUBPAGE CHILDREN CONTAINER (Overlaps Hero Banner with luxurious breathing room) */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 pb-12 sm:pb-16 w-full flex-1 z-10 space-y-5 sm:space-y-6">
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
