"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Store,
  Zap,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Receipt,
  FileCheck2,
  KeyRound,
  LogOut,
} from "lucide-react";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useTenantStore } from "@/store/tenant.store";
import { formatLabel } from "@/lib/format-labels";

export default function TenantLayout({
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
  const { profile } = useTenantStore();

  useEffect(() => {
    initAuth();
    const storedUser = AuthService.getStoredUser();
    const token = AuthService.getStoredToken();

    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    if (storedUser.role !== "TENANT" && storedUser.role !== "SUPERADMIN") {
      router.replace(AuthService.getRedirectRouteByRole(storedUser.role));
    }
  }, [initAuth, router]);

  const [mounted, setMounted] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    storeLogout();
    router.push("/login");
  };

  const displayName = profile?.name || user?.fullName || "Penyewa Pelabuhan";
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "TN";

  const getPageTitle = () => {
    if (pathname.includes("/tenant/sewa")) return "Katalog & Sewa Tempat";
    if (pathname.includes("/tenant/kontrak")) return "Kontrak Sewa";
    if (pathname.includes("/tenant/utilitas")) return "Pemakaian Listrik & Air";
    if (pathname.includes("/tenant/tagihan")) return "Tagihan & Pembayaran";
    return "Beranda Penyewa";
  };

  const getBreadcrumbLabel = () => {
    if (pathname.includes("/tenant/sewa")) return "Sewa Tempat";
    if (pathname.includes("/tenant/kontrak")) return "Kontrak Sewa";
    if (pathname.includes("/tenant/utilitas")) return "Listrik & Air";
    if (pathname.includes("/tenant/tagihan")) return "Tagihan";
    return "Beranda";
  };

  const getPageSubtitle = () => {
    if (pathname.includes("/tenant/sewa"))
      return "Pilih kios, gudang, atau lahan yang tersedia di pelabuhan dan ajukan sewa.";
    if (pathname.includes("/tenant/kontrak"))
      return "Pantau status pengajuan sewa, masa berlaku kontrak, dan perpanjangan.";
    if (pathname.includes("/tenant/utilitas"))
      return "Lihat riwayat pencatatan meteran listrik dan air bersih pada tempat usaha Anda.";
    if (pathname.includes("/tenant/tagihan"))
      return "Lihat rincian tagihan sewa dan utilitas beserta riwayat pembayarannya.";
    return "Kelola tempat usaha, kontrak sewa, pemakaian listrik/air, dan pembayaran Anda.";
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-medium text-[#133D31]">
          <div className="w-5 h-5 border-2 border-[#133D31] border-t-transparent rounded-full animate-spin" />
          <span>Memuat portal penyewa...</span>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/tenant", label: "Beranda", icon: Store },
    { href: "/tenant/sewa", label: "Sewa Tempat", icon: KeyRound },
    { href: "/tenant/kontrak", label: "Kontrak Sewa", icon: FileCheck2 },
    { href: "/tenant/utilitas", label: "Listrik & Air", icon: Zap },
    { href: "/tenant/tagihan", label: "Tagihan", icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#1E2922] font-sans flex antialiased selection:bg-[#D97706]/20 selection:text-[#0B241E]">
      {/* SIDEBAR */}
      <aside
        className={`${
          isSidebarCollapsed ? "w-20" : "w-68"
        } bg-white flex flex-col justify-between shrink-0 shadow-xs z-30 sticky top-0 h-screen transition-all duration-300 ease-in-out relative`}
      >
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3.5 top-8 -translate-y-1/2 z-40 w-7 h-7 rounded-full bg-[#0B241E] hover:bg-[#133D31] text-white border border-[#235848] shadow-md flex items-center justify-center cursor-pointer"
          title={isSidebarCollapsed ? "Buka Menu" : "Kecilkan Menu"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-[#D97706]" strokeWidth={2.5} />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          )}
        </button>

        <div className="flex-1 flex flex-col min-h-0">
          <div
            className={`h-16 bg-[#0B241E] border-b border-[#143E33] flex items-center ${
              isSidebarCollapsed ? "justify-center px-2" : "justify-between px-5"
            } text-white shrink-0`}
          >
            {isSidebarCollapsed ? (
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(false)}
                className="w-10 h-10 rounded-lg bg-[#143E33] p-1.5 flex items-center justify-center border border-[#1E5748] cursor-pointer"
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
                    Portal Penyewa
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto border-r border-[#E2E8F0] py-3">
            {isSidebarCollapsed ? (
              <div className="my-2 flex justify-center">
                <div
                  className="w-10 h-10 rounded-full bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-xs cursor-pointer"
                  title={displayName}
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
                    {profile?.verificationStatus
                      ? formatLabel(profile.verificationStatus)
                      : "Penyewa (Tenant)"}
                  </p>
                </div>
              </div>
            )}

            <div className="px-3 space-y-1">
              {!isSidebarCollapsed && (
                <p className="px-3 text-[11px] font-bold text-[#94A3B8] mb-1.5">
                  Menu Utama
                </p>
              )}
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/tenant"
                    ? pathname === "/tenant"
                    : pathname.includes(item.href);

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
                        : `w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold justify-between gap-2 ${
                            isActive
                              ? "bg-[#0B241E] text-white"
                              : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
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

          <div className="p-3 border-r border-[#E2E8F0] bg-[#F8FAFC]">
            <Link
              href="/"
              className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0B241E] hover:bg-[#E2E8F0] rounded-xl transition-colors ${
                isSidebarCollapsed ? "justify-center" : ""
              }`}
              title="Halaman Depan"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Halaman Depan</span>}
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer mt-1 ${
                isSidebarCollapsed ? "justify-center" : ""
              }`}
              title="Keluar Akun"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Keluar Akun</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#0B241E] text-white flex items-center justify-between px-6 shrink-0 border-b border-[#143E33] z-20">
          <div className="flex items-center gap-2 text-xs text-[#85A69B]">
            <span>PORTA</span>
            <span>/</span>
            <span>Penyewa</span>
            <span>/</span>
            <span className="text-white font-semibold">{getBreadcrumbLabel()}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#143E33] border border-[#1E5748] text-[#D97706] font-bold text-xs flex items-center justify-center">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold leading-tight text-white">
                {displayName}
              </p>
              <p className="text-[11px] text-[#85A69B] leading-tight">
                Penyewa (Tenant)
              </p>
            </div>
          </div>
        </header>

        <div className="bg-[#0B241E] text-white px-6 sm:px-8 pt-6 pb-24 sm:pb-28 border-b border-[#143E33]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-3xl">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {getPageTitle()}
              </h1>
              <p className="text-xs sm:text-sm text-[#BED2CA] mt-1.5 max-w-2xl leading-relaxed">
                {getPageSubtitle()}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/tenant/sewa"
                className="px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <KeyRound className="w-4 h-4" />
                <span>Ajukan Sewa Tempat</span>
              </Link>
            </div>
          </div>
        </div>

        <main className="flex-1 px-6 sm:px-8 pb-12 -mt-10 sm:-mt-12 max-w-7xl w-full mx-auto z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
