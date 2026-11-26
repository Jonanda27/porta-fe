"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Anchor,
  Ship,
  QrCode,
  Wrench,
  Clock,
  Radio,
  Search,
  ShieldCheck,
  CalendarCheck2,
  Users,
  Receipt,
  Building2,
  Warehouse,
  Store,
  UserCog,
  LogOut,
  FileSignature,
  ClipboardList,
  ClipboardCheck,
  FileCheck2,
  Bell,
  CheckCircle2,
  MapPin,
  Video,
} from "lucide-react";
import { AccountSettingsModal } from "@/components/ui/account-settings-modal";
import { LogoutConfirmModal } from "@/components/ui/LogoutConfirmModal";
import {
  AppSidebar,
  SidebarNavGroup as NavGroup,
  SidebarNavItem as NavItem,
} from "@/components/layout/AppSidebar";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useNotificationStore } from "@/store/notification.store";
import { UserRole } from "@/types/auth.types";
import { formatLabel } from "@/lib/format-labels";

const ALLOWED_UPT_ROLES: UserRole[] = [
  "SUPERADMIN",
  "KEPALA_PELABUHAN",
  "ADMIN_PELABUHAN",
  "PETUGAS_REGISTRASI_KONTRAK",
  "PETUGAS_DERMAGA",
  "PETUGAS_DERMAGA_BARANG",
  "PETUGAS_DERMAGA_PENUMPANG",
  "PETUGAS_RUANGAN",
  "PETUGAS_TAGIHAN",
  "PETUGAS_PELABUHAN",
  "BENDAHARA",
];
export default function UptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    user,
    initialize: initAuth,
    logout: storeLogout,
  } = useAuthStore();

  const [mounted, setMounted] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead: markNotifRead,
    markAllAsRead: markAllNotifsRead,
  } = useNotificationStore();

  useEffect(() => {
    setMounted(true);
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    initAuth();
    const storedUser = AuthService.getStoredUser();
    const token = AuthService.getStoredToken();

    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    if (!ALLOWED_UPT_ROLES.includes(storedUser.role)) {
      router.replace(AuthService.getRedirectRouteByRole(storedUser.role));
      return;
    }

    if (
      storedUser.role === "SUPERADMIN" &&
      !pathname.startsWith("/upt/pelabuhan") &&
      !pathname.startsWith("/upt/users") &&
      !pathname.startsWith("/upt/tarif") &&
      !pathname.startsWith("/upt/master")
    ) {
      router.replace("/upt/pelabuhan");
      return;
    }

    if (
      storedUser.role === "ADMIN_PELABUHAN" &&
      !pathname.startsWith("/upt/checker") &&
      !pathname.startsWith("/upt/users")
    ) {
      router.replace("/upt/checker/tugas");
    }
  }, [initAuth, pathname, router]);

  const handleConfirmLogout = () => {
    AuthService.logout();
    storeLogout();
    setShowLogoutModal(false);
    router.replace("/login");
  };

  const role = user?.role;
  const isSuperadmin = role === "SUPERADMIN";
  const isKepalaPelabuhan = role === "KEPALA_PELABUHAN";
  const isAdminPelabuhan = role === "ADMIN_PELABUHAN";
  const isPetugasRegistrasiKontrak = role === "PETUGAS_REGISTRASI_KONTRAK";
  const isPetugasDermaga =
    role === "PETUGAS_DERMAGA" ||
    role === "PETUGAS_DERMAGA_BARANG" ||
    role === "PETUGAS_DERMAGA_PENUMPANG";
  const isPetugasRuangan = role === "PETUGAS_RUANGAN";

  const rawDisplayName = user?.fullName || "Pengguna PORTA";
  const displayName = rawDisplayName.replace(/\s*\([^)]*\)/g, "").trim() || rawDisplayName;
  const displayRole = formatLabel(role);
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "PT";

  const portScopeLabel = isSuperadmin
    ? "Admin Pusat Mimika"
    : !user?.portId
    ? "UPTD Semua Pelabuhan"
    : "Pelabuhan Poumako";

  const navGroups: NavGroup[] = useMemo(() => {
    if (isSuperadmin) {
      return [
        {
          title: "Master Data",
          items: [
            { href: "/upt/pelabuhan", label: "Pelabuhan & Dermaga", icon: Anchor, keywords: "port berth dermaga" },
            { href: "/upt/master/kapal", label: "Master Kapal", icon: Ship, keywords: "vessel armada kapal merge" },
            { href: "/upt/master/operator", label: "Operator Kapal", icon: Building2, keywords: "perusahaan pelayaran agen" },
            { href: "/upt/master/tenant", label: "Tenant & Mitra", icon: Store, keywords: "penyewa kios" },
            { href: "/upt/master/aset", label: "Aset & Fasilitas", icon: Warehouse, keywords: "gudang lahan" },
            { href: "/upt/tarif", label: "Tarif & Gateway", icon: Receipt, keywords: "perda usd midtrans" },
          ],
        },
        {
          title: "Tata Kelola",
          items: [
            { href: "/upt/users", label: "Pengguna & RBAC", icon: Users, keywords: "akun password role permission audit" },
          ],
        },
      ];
    }

    if (isAdminPelabuhan) {
      return [
        {
          title: "Checker Pelabuhan",
          items: [
            {
              href: "/upt/checker/tugas",
              label: "Checker Tugas Petugas",
              icon: ClipboardCheck,
              keywords: "tugas checker petugas overdue",
            },
            {
              href: "/upt/checker/laporan",
              label: "Rekap Laporan Harian",
              icon: FileCheck2,
              keywords: "laporan harian shift kepala pelabuhan",
            },
          ],
        },
        {
          title: "Tim Pelabuhan",
          items: [
            {
              href: "/upt/users",
              label: "Akun Petugas Pelabuhan",
              icon: Users,
              keywords: "akun petugas reset password",
            },
          ],
        },
      ];
    }

    if (isKepalaPelabuhan) {
      return [
        {
          title: "Utama & Persetujuan",
          items: [
            { href: "/upt/dashboard", label: "Dashboard", icon: Radio },
            { href: "/upt/head/bottlenecks", label: "Radar Bottleneck", icon: ShieldCheck, keywords: "bottleneck macet keterlambatan petugas" },
            { href: "/upt/checker/tugas", label: "Verifikasi Tugas", icon: ClipboardCheck },
            { href: "/upt/checker/laporan", label: "Laporan Harian", icon: FileCheck2 },
            { href: "/upt/verifikasi", label: "Verifikasi Mitra", icon: ShieldCheck },
            { href: "/upt/alokasi", label: "Izin Sandar & Sewa", icon: CalendarCheck2 },
          ],
        },
        {
          title: "Pengawasan Lapangan",
          items: [
            { href: "/upt/kapal", label: "Operasional Kapal", icon: Ship },
            { href: "/upt/gis", label: "Peta GIS Pelabuhan", icon: MapPin },
            { href: "/upt/cctv", label: "Monitoring CCTV", icon: Video },
            { href: "/upt/tiket", label: "Tiket & Manifes", icon: QrCode },
            { href: "/upt/pemeliharaan", label: "Pemeliharaan", icon: Wrench },
            { href: "/upt/shift", label: "Laporan Sif", icon: Clock },
          ],
        },
        {
          title: "Administrasi & Tarif",
          items: [
            { href: "/upt/pelabuhan", label: "Data Dermaga", icon: Anchor },
            { href: "/upt/users", label: "Tim Pelabuhan", icon: Users },
            { href: "/upt/tarif", label: "Daftar Tarif", icon: Receipt },
          ],
        },
      ];
    }

    if (isPetugasRegistrasiKontrak) {
      return [
        {
          title: "Ringkasan & Tugas",
          items: [
            { href: "/upt/dashboard", label: "Dashboard Registrasi", icon: Radio },
            { href: "/upt/tugas-saya", label: "Tugas & Penugasan Saya", icon: ClipboardList },
          ],
        },
        {
          title: "Verifikasi & Kontrak Mitra",
          items: [
            {
              href: "/upt/verifikasi",
              label: "Verifikasi Operator Kapal",
              icon: Building2,
              exact: true,
            },
            {
              href: "/upt/verifikasi/kapal",
              label: "Verifikasi Armada Kapal",
              icon: Ship,
            },
            {
              href: "/upt/verifikasi/tenant",
              label: "Verifikasi Tenant Mitra",
              icon: Store,
            },
            {
              href: "/upt/verifikasi/pks-sandar",
              label: "Verifikasi PKS Sandar",
              icon: FileSignature,
            },
            {
              href: "/upt/verifikasi/pks-ruangan",
              label: "Verifikasi PKS Ruangan",
              icon: Warehouse,
            },
            {
              href: "/upt/alokasi",
              label: "Alokasi & Penetapan Dermaga",
              icon: CalendarCheck2,
            },
          ],
        },
        {
          title: "Data Master Mitra",
          items: [
            { href: "/upt/master/operator", label: "Master Operator Kapal", icon: Building2 },
            { href: "/upt/master/kapal", label: "Master Kapal", icon: Ship },
            { href: "/upt/master/tenant", label: "Master Tenant & Mitra", icon: Store },
          ],
        },
      ];
    }

    if (isPetugasDermaga) {
      return [
        {
          title: "Tugas Lapangan",
          items: [
            { href: "/upt/tugas-saya", label: "Tugas Saya", icon: ClipboardCheck, keywords: "tugas checklist bukti dokumen" },
            { href: "/upt/kapal", label: "Operasional Kapal", icon: Ship },
            { href: "/upt/cctv", label: "Monitoring CCTV", icon: Video },
            { href: "/upt/tiket", label: "Tiket & Manifes", icon: QrCode },
            { href: "/upt/pemeliharaan", label: "Pemeliharaan", icon: Wrench },
            { href: "/upt/shift", label: "Laporan Sif", icon: Clock },
          ],
        },
      ];
    }

    // BENDAHARA
    return [
      {
        title: "Keuangan & Sif",
        items: [
          { href: "/upt/tugas-saya", label: "Tugas Saya", icon: ClipboardCheck, keywords: "tugas checklist bukti" },
          { href: "/upt/dashboard", label: "Ringkasan", icon: Radio },
          { href: "/upt/tarif", label: "Daftar Tarif", icon: Receipt },
          { href: "/upt/tiket", label: "Tiket & Manifes", icon: QrCode },
          { href: "/upt/shift", label: "Laporan Sif", icon: Clock },
        ],
      },
    ];
  }, [isSuperadmin, isAdminPelabuhan, isKepalaPelabuhan, isPetugasDermaga]);

  const quickJumpResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return navGroups
      .flatMap((g) => g.items)
      .filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.href.toLowerCase().includes(q)
      );
  }, [navGroups, searchQuery]);

  const getPageTitle = () => {
    if (pathname.includes("/upt/checker/tugas")) return "Checker Tugas Petugas";
    if (pathname.includes("/upt/checker/laporan")) return "Rekap Laporan Harian";
    if (pathname.includes("/upt/tugas-saya")) return "Tugas & Penugasan Saya";
    if (pathname.includes("/upt/master/kapal")) return "Master Kapal & Armada";
    if (pathname.includes("/upt/master/operator")) return "Master Operator Kapal";
    if (pathname.includes("/upt/master/tenant")) return "Master Tenant & Mitra Usaha";
    if (pathname.includes("/upt/master/aset")) return "Master Aset & Fasilitas Pelabuhan";
    if (pathname.includes("/upt/pelabuhan"))
      return isSuperadmin ? "Master Pelabuhan & Dermaga" : "Data Dermaga Pelabuhan";
    if (pathname.includes("/upt/users"))
      return isSuperadmin ? "Organisasi & Petugas Sistem" : "Tim Petugas Pelabuhan";
    if (pathname.includes("/upt/tarif"))
      return isSuperadmin ? "Tarif, Dasar Hukum & Gateway" : "Daftar Tarif Layanan";
    if (pathname.includes("/upt/alokasi")) return "Izin Sandar & Sewa Aset";
    if (pathname.includes("/upt/verifikasi/kapal")) return "Verifikasi Armada Kapal";
    if (pathname.includes("/upt/verifikasi/tenant")) return "Verifikasi Tenant & Mitra Usaha";
    if (pathname.includes("/upt/verifikasi/pks-sandar")) return "Verifikasi Kontrak PKS Sandar";
    if (pathname.includes("/upt/verifikasi/pks-ruangan")) return "Verifikasi PKS Sewa Ruangan";
    if (pathname.includes("/upt/verifikasi"))
      return isPetugasRegistrasiKontrak
        ? "Verifikasi Operator Kapal"
        : "Verifikasi Mitra & Kapal";
    if (pathname.includes("/upt/kapal")) return "Operasional Kapal & Utilitas";
    if (pathname.includes("/upt/cctv")) return "Monitoring CCTV Pelabuhan";
    if (pathname.includes("/upt/tiket")) return "Tiket & Manifes Penumpang";
    if (pathname.includes("/upt/pemeliharaan")) return "Pemeliharaan & Aset";
    if (pathname.includes("/upt/shift")) return "Laporan Sif Harian";
    if (pathname.includes("/upt/gis")) return "Peta GIS Pelabuhan Poumako";
    if (pathname.includes("/upt/pengaturan")) return "Pengaturan Akun & Keamanan Petugas";
    return isPetugasRegistrasiKontrak
      ? "Dashboard Registrasi & Kontrak Mitra"
      : "Dashboard Operasional Pelabuhan";
  };

  const getBreadcrumbLabel = () => {
    if (pathname.includes("/upt/checker/tugas")) return "Checker Tugas Petugas";
    if (pathname.includes("/upt/checker/laporan")) return "Rekap Laporan Harian";
    if (pathname.includes("/upt/tugas-saya")) return "Tugas & Penugasan Saya";
    if (pathname.includes("/upt/master/kapal")) return "Master Kapal";
    if (pathname.includes("/upt/master/operator")) return "Operator Kapal";
    if (pathname.includes("/upt/master/tenant")) return "Tenant & Mitra Usaha";
    if (pathname.includes("/upt/master/aset")) return "Aset & Fasilitas";
    if (pathname.includes("/upt/pelabuhan"))
      return isSuperadmin ? "Pelabuhan & Dermaga" : "Data Dermaga";
    if (pathname.includes("/upt/users"))
      return isSuperadmin ? "Pengguna & RBAC" : "Tim Pelabuhan";
    if (pathname.includes("/upt/tarif"))
      return isSuperadmin ? "Tarif & Payment Gateway" : "Daftar Tarif";
    if (pathname.includes("/upt/alokasi")) return "Izin Sandar & Sewa";
    if (pathname.includes("/upt/verifikasi/kapal")) return "Verifikasi Armada Kapal";
    if (pathname.includes("/upt/verifikasi/tenant")) return "Verifikasi Tenant Mitra";
    if (pathname.includes("/upt/verifikasi/pks-sandar")) return "Verifikasi PKS Sandar";
    if (pathname.includes("/upt/verifikasi/pks-ruangan")) return "Verifikasi PKS Ruangan";
    if (pathname.includes("/upt/verifikasi"))
      return isPetugasRegistrasiKontrak ? "Verifikasi Operator Kapal" : "Verifikasi Mitra";
    if (pathname.includes("/upt/kapal")) return "Operasional Kapal";
    if (pathname.includes("/upt/cctv")) return "Monitoring CCTV";
    if (pathname.includes("/upt/tiket")) return "Tiket & Manifes";
    if (pathname.includes("/upt/pemeliharaan")) return "Pemeliharaan & Aset";
    if (pathname.includes("/upt/shift")) return "Laporan Sif";
    if (pathname.includes("/upt/gis")) return "Peta GIS Pelabuhan";
    if (pathname.includes("/upt/pengaturan")) return "Pengaturan Akun";
    return isPetugasRegistrasiKontrak ? "Dashboard Registrasi" : "Dashboard";
  };

  const getPageDescription = () => {
    if (pathname.includes("/upt/checker/tugas"))
      return "Pastikan seluruh petugas menyelesaikan dan mengumpulkan bukti tugas sebelum diteruskan ke Kepala Pelabuhan.";
    if (pathname.includes("/upt/checker/laporan"))
      return "Pantau kepatuhan laporan harian petugas dan serahkan laporan lengkap ke Kepala Pelabuhan.";
    if (pathname.includes("/upt/tugas-saya"))
      return "Pelaksanaan lembar tugas pemeriksaan SOP, surat penugasan aktif, dan pelaporan harian petugas.";
    if (pathname.includes("/upt/gis"))
      return "Pemantauan geospasial kawasan Pelabuhan Umum Poumako dengan multi-layer peta (Google Satelit, Google Jalan, Esri HD, OpenStreetMap, Topografi, dan OpenSeaMap).";
    if (pathname.includes("/upt/pengaturan"))
      return "Kelola identitas profil kedinasan, email, username login, serta pembaruan kata sandi akun petugas UPT.";
    if (pathname.includes("/upt/master/kapal"))
      return "Registri kapal global independen, relasi operator, dan penggabungan duplikat.";
    if (pathname.includes("/upt/master/operator"))
      return "Daftar perusahaan pelayaran dan agen kapal terdaftar di Kabupaten Mimika.";
    if (pathname.includes("/upt/master/tenant"))
      return "Daftar penyewa kios, gudang, dan lahan komersial pelabuhan.";
    if (pathname.includes("/upt/master/aset"))
      return "Inventaris fasilitas, bangunan, dan tarif sewa aset pelabuhan.";
    if (pathname.includes("/upt/pelabuhan"))
      return "Pilih pelabuhan untuk mengelola daftar dermaga dan spesifikasi teknisnya.";
    if (pathname.includes("/upt/users"))
      return "Kelola akun lintas peran, kredensial sementara, dan matriks hak akses RBAC.";
    if (pathname.includes("/upt/tarif"))
      return isSuperadmin
        ? "Atur tarif resmi Perda No. 4/2023, kurs konversi USD, dan integrasi Payment Gateway Midtrans."
        : "Lihat daftar tarif resmi layanan pelabuhan dan nilai tukar USD yang berlaku.";
    if (pathname.includes("/upt/alokasi"))
      return "Setujui jadwal kedatangan kapal, permohonan tambat dermaga, dan pengajuan sewa tempat.";
    if (pathname.includes("/upt/verifikasi/kapal"))
      return "Pemeriksaan spesifikasi Gross Tonnage (GT), Surat Ukur, dan Pas Besar/Kecil armada kapal.";
    if (pathname.includes("/upt/verifikasi/tenant"))
      return "Validasi identitas badan usaha, NIB, dan NPWP penyewa kios, gudang, atau lahan pelabuhan.";
    if (pathname.includes("/upt/verifikasi/pks-sandar"))
      return "Pemeriksaan prasyarat legalitas dan pengesahan Perjanjian Kerja Sama (PKS) Sandar & Tambat.";
    if (pathname.includes("/upt/verifikasi/pks-ruangan"))
      return "Pemantauan dan verifikasi pengajuan kontrak sewa ruangan, kantor, gudang, dan aset pelabuhan.";
    if (pathname.includes("/upt/verifikasi"))
      return "Verifikasi kelengkapan dokumen legalitas SIUPAL, NIB, dan NPWP perusahaan operator kapal.";
    if (pathname.includes("/upt/kapal"))
      return "Catat waktu tiba, sandar, dan berangkat kapal, serta aktivitas bongkar muat dan utilitas.";
    if (pathname.includes("/upt/cctv"))
      return "Pemantauan kamera pengawas (CCTV) dermaga, alur masuk muara, terminal, dan fasilitas Pelabuhan Poumako (Mode Simulasi).";
    if (pathname.includes("/upt/tiket"))
      return "Kelola buku karcis masuk pelabuhan, rute penyeberangan, dan data manifes penumpang.";
    if (pathname.includes("/upt/pemeliharaan"))
      return "Laporkan kerusakan fasilitas dermaga dan pantau daftar aset pelabuhan.";
    if (pathname.includes("/upt/shift"))
      return "Catat serah terima karcis jaga gerbang dan kirim laporan harian pelabuhan.";
    return isPetugasRegistrasiKontrak
      ? "Ringkasan real-time antrean verifikasi legalitas mitra, armada kapal, pipeline kontrak PKS 2-tahap, dan pelaksanaan tugas SOP."
      : "Pantau aktivitas kapal, ketersediaan dermaga, pendapatan, dan tagihan pelabuhan.";
  };

  useEffect(() => {
    if (!mounted) return;
    navGroups.forEach((group) => {
      group.items.forEach((item) => {
        router.prefetch(item.href);
      });
    });
  }, [mounted, role, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600">
          <div className="w-4 h-4 border-2 border-[#0B241E] border-t-transparent rounded-full animate-spin" />
          <span>Memuat PORTA...</span>
        </div>
      </div>
    );
  }

  // Halaman GIS & CCTV memakai kanvas penuh layar (100vw x 100vh) tanpa sidebar dan header
  if (
    pathname === "/upt/gis" ||
    pathname.startsWith("/upt/gis/") ||
    pathname === "/upt/cctv" ||
    pathname.startsWith("/upt/cctv/")
  ) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#1E2922] font-sans flex antialiased selection:bg-[#D97706]/20 selection:text-[#0B241E]">
      {/* REUSABLE APP SIDEBAR */}
      <AppSidebar
        portalTitle={portScopeLabel}
        portalSubtitle={isSuperadmin ? "Admin Pusat Mimika" : "Operasional UPTD"}
        portalBadge={isSuperadmin ? "SUPERADMIN" : displayRole.toUpperCase()}
        navGroups={navGroups}
        user={{
          name: displayName,
          roleOrStatus: displayRole,
          initials,
          statusVariant: "emerald",
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenAccountSettings={() => router.push("/upt/pengaturan")}
        onLogout={() => setShowLogoutModal(true)}
      />

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Bar */}
        <header className="h-16 bg-[#0B241E] border-b border-[#143E33] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 gap-3 text-white">
          <div className="flex items-center gap-3 flex-1 min-w-0 max-w-md">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-[#85A69B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Lompat cepat ke menu (mis. kapal, tarif, rbac)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#12362C] border border-[#1C4D3F] rounded-lg text-white placeholder-[#85A69B] focus:outline-none focus:border-[#D97706]"
              />
              {quickJumpResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 text-slate-800">
                  {quickJumpResults.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.href}
                        type="button"
                        onMouseDown={() => {
                          router.push(item.href);
                          setSearchQuery("");
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                      >
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Interactive Notification Bell Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                className="relative p-2 rounded-lg bg-[#12362C] hover:bg-[#1C4E40] text-[#BED2CA] hover:text-white border border-[#1C4D3F] transition-colors cursor-pointer flex items-center justify-center"
                title="Notifikasi Sistem"
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
                        <span className="text-xs font-bold">Notifikasi Petugas</span>
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

            {/* Context Badge in Topbar (No redundant profile/logout since Sidebar already has them) */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#1C4D3F]">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#12362C] text-[#BED2CA] border border-[#1C4D3F]">
                {portScopeLabel}
              </span>
            </div>
          </div>
        </header>

        {/* HERO BANNER (Maritime Background Image ONLY on /upt/dashboard) */}
        <section className="relative overflow-hidden bg-[#0B241E] text-white pt-7 pb-28 sm:pb-32 px-6 lg:px-8 border-b border-[#143E33]">
          {pathname === "/upt/dashboard" && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-[1.01]"
                style={{
                  backgroundImage: isKepalaPelabuhan
                    ? "url('/images/kepala-pelabuhan-hero.jpg')"
                    : "url('/port-hero.jpg')",
                }}
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 bg-gradient-to-r from-[#0B241E]/95 via-[#0B241E]/85 to-[#0B241E]/45"
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#0B241E]/90 via-transparent to-[#0B241E]/40"
                aria-hidden="true"
              />
            </>
          )}

          <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs text-[#FBBF24] font-semibold mb-1 drop-shadow-2xs">
                <span>PORTA</span>
                <span>/</span>
                <span>{displayRole}</span>
                <span>/</span>
                <span className="text-white font-bold">
                  {getBreadcrumbLabel()}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white leading-tight drop-shadow-xs">
                {getPageTitle()}
              </h1>
              <p className="text-xs sm:text-sm text-[#D1E3DD] mt-1.5 max-w-2xl leading-relaxed drop-shadow-2xs">
                {getPageDescription()}
              </p>
            </div>
          </div>
        </section>

        {/* Main Content (Overlapping Hero Banner like Operator Portal) */}
        <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 lg:px-8 -mt-10 sm:-mt-12 pb-12">
          {children}
        </main>
      </div>

      {/* Modal Validasi Logout */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        userName={user?.fullName || "Petugas Operasional UPT"}
        userRole={user?.role || "ADMIN_PELABUHAN"}
        userEmail={user?.email || "upt.pomako@porta.mimikakab.go.id"}
      />

      <AccountSettingsModal
        isOpen={Boolean(user?.mustChangePassword)}
        onClose={() => {}}
        forcePasswordChange={Boolean(user?.mustChangePassword)}
        onLogout={handleConfirmLogout}
      />
    </div>
  );
}
