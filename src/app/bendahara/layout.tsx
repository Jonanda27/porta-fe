"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Landmark,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Building2,
  Search,
  Bell,
  Coins,
  LogOut,
  ClipboardCheck,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useNotificationStore } from "@/store/notification.store";
import { LogoutConfirmModal } from "@/components/ui/LogoutConfirmModal";
import { AccountSettingsModal } from "@/components/ui/account-settings-modal";
import { AppSidebar, SidebarNavGroup } from "@/components/layout/AppSidebar";

export default function BendaharaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, initialize, logout } = useAuthStore();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead: markNotifRead,
    markAllAsRead: markAllNotifsRead,
  } = useNotificationStore();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    initialize();
    fetchNotifications();
  }, [initialize, fetchNotifications]);

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    router.replace("/login");
  };

  const getPageTitle = () => {
    if (pathname.includes("/bendahara/verifikasi")) return "Loket Verifikasi Pembayaran & Penerbitan e-SSRD";
    if (pathname.includes("/bendahara/skrd")) return "Penetapan & Penerbitan Surat Ketetapan Retribusi (e-SKRD)";
    if (pathname.includes("/bendahara/tunggakan")) return "Pengawasan Piutang & Surat Tagihan Retribusi (STPD)";
    if (pathname.includes("/bendahara/rekonsiliasi")) return "Rekonsiliasi Kas Daerah & Tutup Buku Harian";
    if (pathname.includes("/bendahara/kios-utilitas")) return "Penerimaan Retribusi Sewa Tenant & Utilitas Kargo";
    if (pathname.includes("/bendahara/keberatan")) return "Telaah & Keputusan Keberatan Tarif Retribusi";
    if (pathname.includes("/bendahara/tugas-saya")) return "Tugas & Checklist Kebendaharaan";
    if (pathname.includes("/bendahara/tarif")) return "Referensi Master Tarif Retribusi Daerah (Perda 4/2023)";
    if (pathname.includes("/bendahara/proyeksi")) return "Simulasi Proyeksi PAD & Potensi Lahan (GIS)";
    return "Dashboard Finansial & Penerimaan Kas Daerah (PAD)";
  };

  const getBreadcrumbLabel = () => {
    if (pathname.includes("/bendahara/verifikasi")) return "Verifikasi & e-SSRD";
    if (pathname.includes("/bendahara/skrd")) return "Penetapan e-SKRD";
    if (pathname.includes("/bendahara/tunggakan")) return "Piutang & STPD";
    if (pathname.includes("/bendahara/rekonsiliasi")) return "Rekonsiliasi Kasda";
    if (pathname.includes("/bendahara/kios-utilitas")) return "Tenant & Utilitas";
    if (pathname.includes("/bendahara/keberatan")) return "Keberatan Tarif";
    if (pathname.includes("/bendahara/tugas-saya")) return "Tugas Saya";
    if (pathname.includes("/bendahara/tarif")) return "Referensi Tarif";
    if (pathname.includes("/bendahara/proyeksi")) return "Simulasi PAD & GIS";
    return "Dashboard Kasda";
  };

  const getPageDescription = () => {
    if (pathname.includes("/bendahara/verifikasi"))
      return "Pemeriksaan mutasi rekening koran Bank RKUD, validasi bukti transfer pembayaran operator kapal, dan pengesahan bukti lunas Surat Setoran Retribusi Daerah (e-SSRD).";
    if (pathname.includes("/bendahara/skrd"))
      return "Penerbitan surat ketetapan retribusi uang muka (Advance) dan rampung (Final) berdasarkan durasi sandar aktual kapal di dermaga aset Pemkab Mimika.";
    if (pathname.includes("/bendahara/tunggakan"))
      return "Monitoring piutang retribusi daerah yang melewati tanggal jatuh tempo, simulasi denda administratif 1-2%, dan penerbitan Surat Teguran resmi (STPD).";
    if (pathname.includes("/bendahara/rekonsiliasi"))
      return "Pencocokan penerimaan kas loket tiket gerbang, pendapatan sandar kapal, dan pembukuan Buku Kas Umum (BKU) Penerimaan Pelabuhan Poumako.";
    if (pathname.includes("/bendahara/kios-utilitas"))
      return "Pencatatan pembayaran sewa kios, lapak tenant, pemakaian alat kargo pelabuhan, dan penyaluran air bersih kapal.";
    if (pathname.includes("/bendahara/keberatan"))
      return "Penetapan keputusan persetujuan atau penolakan sengketa keberatan tarif dan permohonan keringanan force majeure dari operator kapal.";
    if (pathname.includes("/bendahara/tugas-saya"))
      return "Lembar tugas operasional kebendaharaan, pengisian checklist verifikasi kasda, unggah bukti kerja, dan pelaporan ke pimpinan.";
    if (pathname.includes("/bendahara/tarif"))
      return "Katalog resmi tarif retribusi jasa kepelabuhanan Perda Kab. Mimika No. 4/2023 beserta kurs referensi USD live untuk acuan verifikasi e-SKRD.";
    if (pathname.includes("/bendahara/proyeksi"))
      return "Kalkulator simulasi target Pendapatan Asli Daerah (PAD) tahunan dan pemetaan potensi monetisasi aset lahan serta dermaga pelabuhan.";
    return "Pusat monitoring pendapatan asli daerah (PAD), realisasi target APBD, status likuiditas kas pelabuhan, dan pengawasan anti-kebocoran retribusi.";
  };

  const navGroups: SidebarNavGroup[] = [
    {
      title: "Penerimaan & Kasda",
      items: [
        {
          label: "Dashboard Finansial",
          href: "/bendahara/dashboard",
          icon: Landmark,
          exact: true,
        },
        {
          label: "Verifikasi & e-SSRD",
          href: "/bendahara/verifikasi",
          icon: CheckCircle2,
          badge: "Antrean Kasir",
        },
        {
          label: "Penetapan e-SKRD",
          href: "/bendahara/skrd",
          icon: Receipt,
          badge: "Final Sandar",
        },
      ],
    },
    {
      title: "Pengawasan & Kepatuhan",
      items: [
        {
          label: "Pengawasan Piutang & STPD",
          href: "/bendahara/tunggakan",
          icon: AlertTriangle,
        },
        {
          label: "Rekonsiliasi Kasda",
          href: "/bendahara/rekonsiliasi",
          icon: Coins,
        },
        {
          label: "Tenant & Utilitas",
          href: "/bendahara/kios-utilitas",
          icon: Building2,
        },
        {
          label: "Keberatan Tarif",
          href: "/bendahara/keberatan",
          icon: Scale,
        },
        {
          label: "Tugas & Checklist Saya",
          href: "/bendahara/tugas-saya",
          icon: ClipboardCheck,
        },
        {
          label: "Referensi Tarif Perda",
          href: "/bendahara/tarif",
          icon: BookOpen,
        },
        {
          label: "Simulasi PAD & GIS",
          href: "/bendahara/proyeksi",
          icon: TrendingUp,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#1E2922] font-sans flex antialiased selection:bg-[#D97706]/20 selection:text-[#0B241E]">
      {/* 1. REUSABLE BENDAHARA SIDEBAR */}
      <AppSidebar
        portalTitle="Portal Bendahara"
        portalSubtitle="Kas Daerah & Retribusi"
        portalBadge="BENDAHARA"
        navGroups={navGroups}
        user={{
          name: user?.fullName || "Bendahara Kasda",
          roleOrStatus: "BENDAHARA PENERIMAAN",
          initials: "BK",
          statusVariant: "emerald",
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenAccountSettings={() => setIsAccountModalOpen(true)}
        onLogout={() => setShowLogoutModal(true)}
      />

      {/* ========================================================= */}
      {/* 2. MAIN APPLICATION CONTENT AREA                          */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar (100% Seamless Dark Green matching sidebar header) */}
        <header className="h-16 bg-[#0B241E] border-b border-[#143E33] text-white px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
          {/* Quick Context Search */}
          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search className="w-4 h-4 text-[#85A69B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nomor SKRD, SSRD, atau nama operator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-1.5 bg-[#12362C] border border-[#1C4D3F] rounded-lg focus:outline-none focus:border-[#D97706] text-white placeholder-[#85A69B] transition-colors"
            />
          </div>

          {/* Right Header Status Badges */}
          <div className="flex items-center gap-3">
            {/* Interactive Notification Bell Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                className="relative p-2 rounded-lg bg-[#12362C] hover:bg-[#1C4E40] text-[#BED2CA] hover:text-white border border-[#1C4D3F] transition-colors cursor-pointer flex items-center justify-center"
                title="Notifikasi Sistem Kasda"
              >
                <Bell className="w-4 h-4 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white font-mono text-[9px] font-black flex items-center justify-center border-2 border-[#0B241E]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {isNotifDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNotifDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] z-50 text-[#1E2922] overflow-hidden">
                    <div className="bg-[#0B241E] text-white p-3.5 px-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#D97706]" />
                        <span className="text-xs font-bold">Notifikasi Bendahara</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-mono font-bold bg-[#D97706] text-[#0B241E] px-1.5 py-0.5 rounded-full">
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

                    <div className="max-h-80 overflow-y-auto divide-y divide-[#F1F5F9]">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[#64748B]">
                          <Bell className="w-6 h-6 text-[#94A3B8] mx-auto mb-2 opacity-50" />
                          <p>Belum ada notifikasi baru.</p>
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((item) => (
                          <div
                            key={item.id}
                            onClick={async () => {
                              if (!item.isRead) {
                                await markNotifRead(item.id);
                              }
                              setIsNotifDropdownOpen(false);
                            }}
                            className={`p-3 px-4 hover:bg-[#F8FAFC] transition-colors cursor-pointer flex items-start gap-3 ${
                              !item.isRead ? "bg-amber-50/30" : ""
                            }`}
                          >
                            <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs mt-0.5 bg-teal-100 text-teal-700">
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
                              <p className="text-[11px] text-[#64748B] line-clamp-2 mt-0.5">
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
                  </div>
                </>
              )}
            </div>

            <div className="h-6 w-px bg-[#184438]" />

            {/* Quick Logout Header Action */}
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="p-2 rounded-lg bg-[#12362C] hover:bg-rose-950/80 hover:text-rose-400 text-slate-300 transition-colors cursor-pointer border border-transparent hover:border-rose-900/50"
              title="Keluar / Akhiri Sesi Bendahara"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Hero Section Banner */}
        <div className="bg-gradient-to-r from-[#0B241E] via-[#10382D] to-[#16493B] text-white pt-7 pb-24 sm:pb-28 px-6 lg:px-8 border-b border-[#1E5748] shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-mono text-[#D97706] mb-1.5">
                <Link href="/bendahara/dashboard" className="hover:underline">
                  PORTA BENDAHARA
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

        {/* Page Children Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-8 -mt-10 sm:-mt-12 pb-12">
          {children}
        </main>
      </div>

      {/* Modal Validasi Logout */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        userName={user?.fullName || "Bendahara Kasda"}
        userRole="BENDAHARA PENERIMAAN"
        userEmail={user?.email || "bendahara.pomako@porta.mimikakab.go.id"}
      />

      <AccountSettingsModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </div>
  );
}
