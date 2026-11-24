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
  LogOut,
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
  Menu,
  X,
  ClipboardCheck,
  FileCheck2,
  LucideIcon,
} from "lucide-react";
import { AccountSettingsModal } from "@/components/ui/account-settings-modal";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { UserRole } from "@/types/auth.types";
import { formatLabel } from "@/lib/format-labels";

const ALLOWED_UPT_ROLES: UserRole[] = [
  "SUPERADMIN",
  "KEPALA_PELABUHAN",
  "ADMIN_PELABUHAN",
  "PETUGAS_REGISTRASI_KONTRAK",
  "PETUGAS_DERMAGA_BARANG",
  "PETUGAS_DERMAGA_PENUMPANG",
  "PETUGAS_RUANGAN",
  "PETUGAS_TAGIHAN",
  "PETUGAS_DERMAGA",
  "BENDAHARA",
];

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  keywords?: string;
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
    initialize: initAuth,
    logout: storeLogout,
  } = useAuthStore();

  const [mounted, setMounted] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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

  const handleLogout = () => {
    AuthService.logout();
    storeLogout();
    router.push("/login");
  };

  const role = user?.role;
  const isSuperadmin = role === "SUPERADMIN";
  const isKepalaPelabuhan = role === "KEPALA_PELABUHAN";
  const isAdminPelabuhan = role === "ADMIN_PELABUHAN";
  const isPetugasDermaga =
    role === "PETUGAS_DERMAGA" ||
    role === "PETUGAS_DERMAGA_BARANG" ||
    role === "PETUGAS_DERMAGA_PENUMPANG" ||
    role === "PETUGAS_REGISTRASI_KONTRAK" ||
    role === "PETUGAS_RUANGAN" ||
    role === "PETUGAS_TAGIHAN";

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
          title: "Manajemen Pelabuhan",
          items: [
            { href: "/upt/dashboard", label: "Ringkasan", icon: Radio },
            { href: "/upt/checker/tugas", label: "Verifikasi Tugas", icon: ClipboardCheck },
            { href: "/upt/checker/laporan", label: "Laporan Harian", icon: FileCheck2 },
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
            { href: "/upt/pemeliharaan", label: "Pemeliharaan", icon: Wrench },
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
            { href: "/upt/pemeliharaan", label: "Pemeliharaan", icon: Wrench },
            { href: "/upt/shift", label: "Laporan Sif", icon: Clock },
          ],
        },
      ];
    }

    return [
      {
        title: "Keuangan & Sif",
        items: [
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
          (item.keywords && item.keywords.toLowerCase().includes(q))
      );
  }, [navGroups, searchQuery]);

  const getPageTitle = () => {
    if (pathname.includes("/upt/checker/tugas")) return "Checker Tugas Petugas";
    if (pathname.includes("/upt/checker/laporan")) return "Rekap Laporan Harian";
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
    if (pathname.includes("/upt/verifikasi")) return "Verifikasi Mitra";
    if (pathname.includes("/upt/kapal")) return "Operasional Kapal";
    if (pathname.includes("/upt/tiket")) return "Tiket & Manifes";
    if (pathname.includes("/upt/pemeliharaan")) return "Pemeliharaan & Aset";
    if (pathname.includes("/upt/shift")) return "Laporan Sif";
    return "Ringkasan Operasional";
  };

  const getPageSubtitle = () => {
    if (pathname.includes("/upt/checker/tugas"))
      return "Pastikan seluruh petugas menyelesaikan dan mengumpulkan bukti tugas sebelum diteruskan ke Kepala Pelabuhan.";
    if (pathname.includes("/upt/checker/laporan"))
      return "Pantau kepatuhan laporan harian petugas dan serahkan laporan lengkap ke Kepala Pelabuhan.";
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
      return "Tarif retribusi Perda No. 4/2023, kurs USD, dan konfigurasi Midtrans.";
    return "Sistem Informasi Manajemen Pelabuhan & Retribusi Daerah Kabupaten Mimika.";
  };

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

  const renderSidebarContent = (collapsed: boolean) => (
    <>
      <div className="flex-1 flex flex-col min-h-0">
        {/* Brand */}
        <div
          className={`h-14 bg-[#0B241E] flex items-center ${
            collapsed ? "justify-center px-2" : "justify-between px-4"
          } text-white shrink-0`}
        >
          {collapsed ? (
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(false)}
              className="w-9 h-9 rounded-lg bg-[#143E33] hover:bg-[#1E5748] p-1.5 flex items-center justify-center cursor-pointer"
              title="Buka Menu"
            >
              <img src="/brand/symbol-white.svg" alt="PORTA" className="w-full h-full object-contain" />
            </button>
          ) : (
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#143E33] p-1 flex items-center justify-center shrink-0">
                  <img src="/brand/symbol-white.svg" alt="PORTA" className="w-full h-full object-contain" />
                </div>
                <div className="truncate">
                  <span className="font-bold text-sm tracking-wide text-white block leading-none">
                    PORTA
                  </span>
                  <span className="block text-[10px] text-[#85A69B] mt-0.5 truncate">
                    {portScopeLabel}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-[#85A69B] hover:text-white hover:bg-[#143E33] cursor-pointer"
                aria-label="Tutup Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-5">
          {navGroups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <p className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  {group.title}
                </p>
              )}
              <div className="space-y-0.5">
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
                      className={`transition-colors flex items-center cursor-pointer ${
                        collapsed
                          ? `w-10 h-10 mx-auto rounded-lg justify-center ${
                              isActive
                                ? "bg-[#0B241E] text-[#D97706]"
                                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            }`
                          : `w-full px-2.5 py-2 rounded-lg text-xs font-medium gap-2.5 ${
                              isActive
                                ? "bg-[#0B241E] text-white font-semibold"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            }`
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-[#D97706]" : "text-slate-400"
                        }`}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Account Controls */}
      <div className="p-2.5 border-t border-slate-200 bg-white shrink-0 space-y-1">
        <button
          type="button"
          onClick={() => setIsAccountModalOpen(true)}
          title="Pengaturan Akun & Sandi"
          className={`rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center cursor-pointer ${
            collapsed ? "w-10 h-10 mx-auto justify-center" : "w-full px-2.5 py-2 gap-2.5"
          }`}
        >
          <UserCog className="w-4 h-4 text-slate-400 shrink-0" />
          {!collapsed && <span>Pengaturan Akun</span>}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          title="Keluar Akun"
          className={`rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors flex items-center cursor-pointer ${
            collapsed ? "w-10 h-10 mx-auto justify-center" : "w-full px-2.5 py-2 gap-2.5"
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex antialiased">
      {/* MOBILE / TABLET SLIDE-OVER DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative w-64 max-w-[80vw] bg-white h-full flex flex-col justify-between shadow-2xl z-10">
            {renderSidebarContent(false)}
          </aside>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside
        className={`hidden lg:flex flex-col justify-between shrink-0 bg-white border-r border-slate-200 sticky top-0 h-screen transition-all duration-200 relative z-30 ${
          isSidebarCollapsed ? "w-16" : "w-60"
        }`}
      >
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-14 -translate-y-1/2 z-40 w-6 h-6 rounded-full bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 shadow-xs flex items-center justify-center cursor-pointer"
          title={isSidebarCollapsed ? "Buka Sidebar" : "Ciutkan Sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
        {renderSidebarContent(isSidebarCollapsed)}
      </aside>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0 max-w-md">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label="Buka Menu Navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 180)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Lompat cepat ke menu (mis. kapal, tarif, rbac)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0B241E]"
              />
              {isSearchFocused && quickJumpResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
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

          <button
            type="button"
            onClick={() => setIsAccountModalOpen(true)}
            className="flex items-center gap-2.5 py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
            title="Pengaturan Akun"
          >
            <div className="w-7 h-7 rounded-full bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-[11px]">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-semibold text-slate-800 leading-tight">
                {displayName}
              </span>
              <span className="block text-[10px] text-slate-500">
                {displayRole}
              </span>
            </div>
          </button>
        </header>

        {/* Clean Compact Page Header */}
        <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-4 max-w-[1440px] w-full mx-auto">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            {getPageTitle()}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{getPageSubtitle()}</p>
        </div>

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 pb-12 max-w-[1440px] w-full mx-auto flex-1">
          {children}
        </main>
      </div>

      <AccountSettingsModal
        isOpen={isAccountModalOpen || Boolean(user?.mustChangePassword)}
        onClose={() => setIsAccountModalOpen(false)}
        forcePasswordChange={Boolean(user?.mustChangePassword)}
        onLogout={handleLogout}
      />
    </div>
  );
}
