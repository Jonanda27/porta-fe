"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Anchor,
  Ship,
  QrCode,
  Wrench,
  Clock,
  ChevronLeft,
  ChevronRight,
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
  LucideIcon,
} from "lucide-react";
import { LogoutConfirmModal } from "@/components/ui/LogoutConfirmModal";
import { AccountSettingsModal } from "@/components/ui/account-settings-modal";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { UserRole } from "@/types/auth.types";
import { formatLabel } from "@/lib/format-labels";

const ALLOWED_UPT_ROLES: UserRole[] = [
  "SUPERADMIN",
  "ADMIN_PELABUHAN",
  "PETUGAS_DERMAGA",
  "BENDAHARA",
];

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function UptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    initialize: initAuth,
    logout: storeLogout,
  } = useAuthStore();

  const [mounted, setMounted] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  const isAdminPelabuhan = role === "ADMIN_PELABUHAN";
  const isPetugasDermaga = role === "PETUGAS_DERMAGA";

  const displayName = user?.fullName || "Pengguna PORTA";
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

  const getNavGroups = (): NavGroup[] => {
    if (isSuperadmin) {
      return [
        {
          title: "Master Data PORTA",
          items: [
            { href: "/upt/pelabuhan", label: "Pelabuhan & Dermaga", icon: Anchor },
            { href: "/upt/master/kapal", label: "Master Kapal", icon: Ship },
            { href: "/upt/master/operator", label: "Master Operator Kapal", icon: Building2 },
            { href: "/upt/master/tenant", label: "Master Tenant & Mitra", icon: Store },
            { href: "/upt/master/aset", label: "Master Aset & Fasilitas", icon: Warehouse },
            { href: "/upt/tarif", label: "Tarif & Dasar Hukum", icon: Receipt },
          ],
        },
        {
          title: "Manajemen Sistem",
          items: [
            { href: "/upt/users", label: "Organisasi & Petugas", icon: Users },
          ],
        },
      ];
    }

    if (isAdminPelabuhan) {
      return [
        {
          title: "Manajemen Pelabuhan",
          items: [
            { href: "/upt/dashboard", label: "Ringkasan Pelabuhan", icon: Radio },
            { href: "/upt/verifikasi", label: "Verifikasi Mitra", icon: ShieldCheck },
            { href: "/upt/alokasi", label: "Izin Sandar & Sewa", icon: CalendarCheck2 },
            { href: "/upt/pelabuhan", label: "Data Dermaga", icon: Anchor },
            { href: "/upt/users", label: "Tim Pelabuhan", icon: Users },
            { href: "/upt/tarif", label: "Daftar Tarif", icon: Receipt },
          ],
        },
        {
          title: "Pengawasan Lapangan",
          items: [
            { href: "/upt/kapal", label: "Operasional Kapal", icon: Ship },
            { href: "/upt/tiket", label: "Tiket & Manifes", icon: QrCode },
            { href: "/upt/pemeliharaan", label: "Pemeliharaan & Aset", icon: Wrench },
            { href: "/upt/shift", label: "Laporan Sif", icon: Clock },
          ],
        },
      ];
    }

    if (isPetugasDermaga) {
      return [
        {
          title: "Tugas Lapangan",
          items: [
            { href: "/upt/kapal", label: "Operasional Kapal", icon: Ship },
            { href: "/upt/tiket", label: "Tiket & Manifes", icon: QrCode },
            { href: "/upt/pemeliharaan", label: "Pemeliharaan & Aset", icon: Wrench },
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
          { href: "/upt/dashboard", label: "Ringkasan Pelabuhan", icon: Radio },
          { href: "/upt/tarif", label: "Daftar Tarif", icon: Receipt },
          { href: "/upt/tiket", label: "Tiket & Manifes", icon: QrCode },
          { href: "/upt/shift", label: "Laporan Sif", icon: Clock },
        ],
      },
    ];
  };

  const getPageTitle = () => {
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
    if (pathname.includes("/upt/verifikasi")) return "Verifikasi Mitra & Kapal";
    if (pathname.includes("/upt/kapal")) return "Operasional Kapal & Utilitas";
    if (pathname.includes("/upt/tiket")) return "Tiket & Manifes Penumpang";
    if (pathname.includes("/upt/pemeliharaan")) return "Pemeliharaan & Aset";
    if (pathname.includes("/upt/shift")) return "Laporan Sif Harian";
    return "Ringkasan Operasional Pelabuhan";
  };

  const getBreadcrumbLabel = () => {
    if (pathname.includes("/upt/master/kapal")) return "Master Kapal";
    if (pathname.includes("/upt/master/operator")) return "Master Operator";
    if (pathname.includes("/upt/master/tenant")) return "Master Tenant";
    if (pathname.includes("/upt/master/aset")) return "Master Aset";
    if (pathname.includes("/upt/pelabuhan"))
      return isSuperadmin ? "Master Pelabuhan" : "Data Dermaga";
    if (pathname.includes("/upt/users"))
      return isSuperadmin ? "Pengguna & Petugas" : "Tim Pelabuhan";
    if (pathname.includes("/upt/tarif"))
      return isSuperadmin ? "Tarif & Gateway" : "Daftar Tarif";
    if (pathname.includes("/upt/alokasi")) return "Izin Sandar & Sewa";
    if (pathname.includes("/upt/verifikasi")) return "Verifikasi Mitra";
    if (pathname.includes("/upt/kapal")) return "Operasional Kapal";
    if (pathname.includes("/upt/tiket")) return "Tiket & Manifes";
    if (pathname.includes("/upt/pemeliharaan")) return "Pemeliharaan & Aset";
    if (pathname.includes("/upt/shift")) return "Laporan Sif";
    return "Ringkasan";
  };

  const getPageDescription = () => {
    if (pathname.includes("/upt/master/kapal"))
      return "Data induk identitas seluruh kapal yang terdaftar di sistem PORTA Kabupaten Mimika.";
    if (pathname.includes("/upt/master/operator"))
      return "Data induk perusahaan pelayaran dan agen operator kapal resmi di PORTA.";
    if (pathname.includes("/upt/master/tenant"))
      return "Data induk penyewa tempat usaha, kios, gudang, dan lahan komersial pelabuhan.";
    if (pathname.includes("/upt/master/aset"))
      return "Data induk seluruh fasilitas, bangunan, kios, lahan, dan utilitas pelabuhan.";
    if (pathname.includes("/upt/pelabuhan"))
      return isSuperadmin
        ? "Kelola data pelabuhan di Kabupaten Mimika beserta daftar dermaga dan spesifikasinya."
        : "Kelola daftar dermaga, kapasitas sandar, dan kondisi operasional di pelabuhan Anda.";
    if (pathname.includes("/upt/users"))
      return isSuperadmin
        ? "Kelola akun pengguna lintas instansi, hak akses, dan pantau log aktivitas sistem."
        : "Kelola akun petugas dermaga dan bendahara yang bertugas di pelabuhan Anda.";
    if (pathname.includes("/upt/tarif"))
      return isSuperadmin
        ? "Atur tarif resmi Perda No. 4/2023, kurs konversi USD, dan integrasi Payment Gateway Midtrans."
        : "Lihat daftar tarif resmi layanan pelabuhan dan nilai tukar USD yang berlaku.";
    if (pathname.includes("/upt/alokasi"))
      return "Setujui jadwal kedatangan kapal, permohonan tambat dermaga, dan pengajuan sewa tempat.";
    if (pathname.includes("/upt/verifikasi"))
      return "Verifikasi kelengkapan dokumen legalitas operator kapal, armada, dan penyewa.";
    if (pathname.includes("/upt/kapal"))
      return "Catat waktu tiba, sandar, dan berangkat kapal, serta aktivitas bongkar muat dan utilitas.";
    if (pathname.includes("/upt/tiket"))
      return "Kelola buku karcis masuk pelabuhan, rute penyeberangan, dan data manifes penumpang.";
    if (pathname.includes("/upt/pemeliharaan"))
      return "Laporkan kerusakan fasilitas dermaga dan pantau daftar aset pelabuhan.";
    if (pathname.includes("/upt/shift"))
      return "Catat serah terima karcis jaga gerbang dan kirim laporan harian pelabuhan.";
    return "Pantau aktivitas kapal, ketersediaan dermaga, pendapatan, dan tagihan pelabuhan.";
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-medium text-[#133D31]">
          <div className="w-5 h-5 border-2 border-[#133D31] border-t-transparent rounded-full animate-spin" />
          <span>Memuat sistem PORTA...</span>
        </div>
      </div>
    );
  }

  const navGroups = getNavGroups();

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#1E2922] font-sans flex antialiased selection:bg-[#D97706]/20 selection:text-[#0B241E]">
      {/* SIDEBAR */}
      <aside
        className={`${
          isSidebarCollapsed ? "w-20" : "w-68"
        } bg-white flex flex-col justify-between shrink-0 shadow-xs z-30 sticky top-0 h-screen transition-all duration-300 ease-in-out relative`}
      >
        {/* Floating Circular Sidebar Toggle Button */}
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
          {/* Brand Header */}
          <div
            className={`h-16 bg-[#0B241E] border-b border-[#143E33] flex items-center ${
              isSidebarCollapsed ? "justify-center px-2" : "justify-between px-5"
            } text-white shrink-0`}
          >
            {isSidebarCollapsed ? (
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(false)}
                className="w-10 h-10 rounded-lg bg-[#143E33] hover:bg-[#1E5748] p-1.5 flex items-center justify-center border border-[#1E5748] cursor-pointer"
                title="Buka Menu"
              >
                <img
                  src="/brand/symbol-white.svg"
                  alt="PORTA"
                  className="w-full h-full object-contain"
                />
              </button>
            ) : (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#143E33] p-1 flex items-center justify-center border border-[#1E5748] shrink-0">
                  <img
                    src="/brand/symbol-white.svg"
                    alt="PORTA"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="truncate">
                  <span className="font-extrabold text-base tracking-wide text-white">
                    PORTA
                  </span>
                  <span className="block text-[11px] text-[#85A69B] -mt-0.5 truncate">
                    {portScopeLabel}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Menu */}
          <div className="flex-1 overflow-y-auto border-r border-[#E2E8F0] py-3">
            {isSidebarCollapsed ? (
              <div className="my-2 flex justify-center">
                <div
                  className="w-10 h-10 rounded-full bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-xs border border-[#164336] cursor-pointer"
                  title={`${displayName} (${displayRole})`}
                  onClick={() => setIsSidebarCollapsed(false)}
                >
                  {initials}
                </div>
              </div>
            ) : (
              <div className="p-3.5 mx-3 mb-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-sm shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#0B241E] truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                    {displayRole}
                  </p>
                </div>
              </div>
            )}

            <div className={isSidebarCollapsed ? "px-2 space-y-4" : "px-3 space-y-5"}>
              {navGroups.map((group) => (
                <div key={group.title}>
                  {!isSidebarCollapsed && (
                    <p className="px-3 text-[11px] font-bold text-[#94A3B8] mb-1.5">
                      {group.title}
                    </p>
                  )}
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href ||
                        (item.href === "/upt/dashboard" && pathname === "/upt");

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          title={item.label}
                          className={`transition-all flex items-center cursor-pointer ${
                            isSidebarCollapsed
                              ? `w-11 h-11 mx-auto rounded-xl justify-center ${
                                  isActive
                                    ? "bg-[#0B241E] text-[#D97706]"
                                    : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                                }`
                              : `w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold justify-between gap-2.5 ${
                                  isActive
                                    ? "bg-[#0B241E] text-white"
                                    : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                                }`
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <Icon
                              className={`${
                                isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"
                              } shrink-0 ${
                                isActive ? "text-[#D97706]" : "text-[#64748B]"
                              }`}
                            />
                            {!isSidebarCollapsed && (
                              <span className="truncate">{item.label}</span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Account & Logout */}
        <div
          className={`p-3 border-t border-[#EDF2F7] border-r border-[#E2E8F0] bg-white shrink-0 flex flex-col gap-2 ${
            isSidebarCollapsed ? "items-center" : ""
          }`}
        >
          <button
            type="button"
            onClick={() => setIsAccountModalOpen(true)}
            className={`rounded-xl text-xs font-bold text-[#0B241E] hover:bg-[#F1F5F9] border border-[#CBD5E1] transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              isSidebarCollapsed ? "w-11 h-11 p-0" : "w-full py-2 px-3"
            }`}
            title="Pengaturan Akun & Sandi"
          >
            <UserCog className="w-4 h-4 text-[#133D31]" />
            {!isSidebarCollapsed && <span>Pengaturan Akun</span>}
          </button>
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className={`rounded-xl text-xs font-bold text-[#E11D48] hover:bg-[#FFF1F2] border border-[#FECDD3] transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              isSidebarCollapsed ? "w-11 h-11 p-0" : "w-full py-2 px-3"
            }`}
            title="Keluar Akun"
          >
            <LogOut className="w-4 h-4" />
            {!isSidebarCollapsed && <span>Keluar / Ganti Akun</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 bg-[#0B241E] border-b border-[#143E33] flex items-center justify-between px-6 text-white sticky top-0 z-20">
          <div className="flex items-center flex-1 max-w-md gap-3">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#85A69B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari data pelabuhan, kapal, atau pengguna..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#12362C] border border-[#1C4D3F] rounded-lg text-white placeholder-[#85A69B] focus:outline-none focus:border-[#D97706]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 pl-2">
              <div className="w-8 h-8 rounded-full bg-[#D97706] text-[#0B241E] flex items-center justify-center font-bold text-xs">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold leading-tight">
                  {displayName}
                </span>
                <span className="block text-[11px] text-[#85A69B]">
                  {displayRole}
                </span>
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

        {/* HERO BANNER */}
        <section className="bg-[#0B241E] text-white pt-6 pb-24 sm:pb-28 px-6 sm:px-8 border-b border-[#143E33]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs text-[#D97706] mb-1">
                <span>PORTA</span>
                <span>/</span>
                <span>{displayRole}</span>
                <span>/</span>
                <span className="text-white font-semibold">
                  {getBreadcrumbLabel()}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {getPageTitle()}
              </h1>
              <p className="text-xs sm:text-sm text-[#BED2CA] mt-1.5 max-w-2xl leading-relaxed">
                {getPageDescription()}
              </p>
            </div>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-6 sm:px-8 -mt-10 sm:-mt-12 pb-16 w-full flex-1 z-10 space-y-6">
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
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </div>
  );
}
