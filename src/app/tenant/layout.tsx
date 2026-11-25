"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Store,
  Zap,
  Receipt,
  FileCheck2,
  KeyRound,
  LogOut,
  UserCog,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { AccountSettingsModal } from "@/components/ui/account-settings-modal";
import { LogoutConfirmModal } from "@/components/ui/LogoutConfirmModal";
import { ApplyLeaseModal } from "@/components/tenant/ApplyLeaseModal";
import { AppSidebar, SidebarNavGroup } from "@/components/layout/AppSidebar";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useTenantStore } from "@/store/tenant.store";
import { useNotificationStore } from "@/store/notification.store";
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
  const { profile, openApplyModal, fetchTenantData } = useTenantStore();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead: markNotifRead,
    markAllAsRead: markAllNotifsRead,
  } = useNotificationStore();

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
      return;
    }

    fetchTenantData();
    fetchNotifications();
  }, [initAuth, router, fetchTenantData, fetchNotifications]);

  const [mounted, setMounted] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConfirmLogout = () => {
    AuthService.logout();
    storeLogout();
    setShowLogoutModal(false);
    router.replace("/login");
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
    if (pathname.includes("/tenant/notifikasi")) return "Pusat Notifikasi & Peringatan";
    return "Beranda Penyewa";
  };

  const getBreadcrumbLabel = () => {
    if (pathname.includes("/tenant/sewa")) return "Sewa Tempat";
    if (pathname.includes("/tenant/kontrak")) return "Kontrak Sewa";
    if (pathname.includes("/tenant/utilitas")) return "Listrik & Air";
    if (pathname.includes("/tenant/tagihan")) return "Tagihan";
    if (pathname.includes("/tenant/notifikasi")) return "Notifikasi";
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
    if (pathname.includes("/tenant/notifikasi"))
      return "Pemberitahuan resmi terkait verifikasi sewa, tagihan e-SKRD, dan pengingat operasional.";
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

  const navGroups: SidebarNavGroup[] = [
    {
      title: "Menu Utama",
      items: [
        { href: "/tenant", label: "Beranda", icon: Store, exact: true },
        { href: "/tenant/sewa", label: "Sewa Tempat", icon: KeyRound },
        { href: "/tenant/kontrak", label: "Kontrak Sewa", icon: FileCheck2 },
        { href: "/tenant/utilitas", label: "Listrik & Air", icon: Zap },
        { href: "/tenant/tagihan", label: "Tagihan", icon: Receipt },
        {
          href: "/tenant/notifikasi",
          label: "Pusat Notifikasi",
          icon: Bell,
          badge: unreadCount > 0 ? `${unreadCount} Baru` : undefined,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#1E2922] font-sans flex antialiased">
      {/* 1. REUSABLE SIDEBAR */}
      <AppSidebar
        portalTitle="Portal Penyewa"
        portalSubtitle="Fasilitas & Ruang Usaha"
        portalBadge="TENANT"
        navGroups={navGroups}
        user={{
          name: displayName,
          roleOrStatus: profile?.verificationStatus
            ? formatLabel(profile.verificationStatus)
            : "Penyewa (Tenant)",
          initials,
          statusVariant:
            profile?.verificationStatus === "VERIFIED"
              ? "emerald"
              : profile?.verificationStatus === "REJECTED"
              ? "amber"
              : "slate",
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenAccountSettings={() => setIsAccountModalOpen(true)}
        onLogout={() => setShowLogoutModal(true)}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#0B241E] text-white flex items-center justify-between px-6 shrink-0 border-b border-[#143E33] z-20">
          <div className="flex items-center gap-2 text-xs text-[#85A69B]">
            <span>PORTA</span>
            <span>/</span>
            <span>Penyewa (Tenant)</span>
            <span>/</span>
            <span className="text-white font-semibold">{getBreadcrumbLabel()}</span>
          </div>

          <div className="flex items-center gap-2.5">
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
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] z-50 text-[#1E2922] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    {/* Header Popover */}
                    <div className="bg-[#0B241E] text-white p-3.5 px-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#D97706]" />
                        <span className="text-xs font-bold tracking-wide">Notifikasi Penyewa</span>
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
                                router.push("/tenant/notifikasi");
                              }
                            }}
                            className={`p-3 px-4 hover:bg-[#F8FAFC] transition-colors cursor-pointer flex items-start gap-3 ${
                              !item.isRead ? "bg-amber-50/25" : ""
                            }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs mt-0.5 ${
                                item.type === "LEASE_APPROVED" || item.type === "PAYMENT_VERIFIED" || item.type === "PAYMENT_SUCCESS"
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                  : item.type === "WARNING" || item.type === "LEASE_REJECTED"
                                  ? "bg-rose-50 text-rose-600 border border-rose-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {item.type === "LEASE_APPROVED" || item.type === "PAYMENT_VERIFIED" || item.type === "PAYMENT_SUCCESS" ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : item.type === "WARNING" || item.type === "LEASE_REJECTED" ? (
                                <AlertTriangle className="w-3.5 h-3.5" />
                              ) : (
                                <Bell className="w-3.5 h-3.5" />
                              )}
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
                              <p className="text-[11px] text-[#64748B] line-clamp-2 mt-0.5 leading-relaxed">
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

                    {/* Popover Footer */}
                    <div className="p-2.5 bg-[#F8FAFC] border-t border-[#E2E8F0] text-center">
                      <Link
                        href="/tenant/notifikasi"
                        onClick={() => setIsNotifDropdownOpen(false)}
                        className="text-[11px] font-bold text-[#0B241E] hover:text-[#D97706] inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Buka Semua Notifikasi</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

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

            {/* Quick Logout Header Action */}
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="p-2 rounded-lg bg-[#143E33] hover:bg-rose-950/80 hover:text-rose-400 text-slate-300 transition-colors cursor-pointer border border-[#1E5748] hover:border-rose-900/50"
              title="Keluar / Akhiri Sesi Mitra Tenant"
            >
              <LogOut className="w-4 h-4" />
            </button>
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
              <button
                type="button"
                onClick={() => openApplyModal()}
                className="px-4 py-2 bg-[#D97706] hover:bg-[#B45309] active:bg-[#92400E] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow"
              >
                <KeyRound className="w-4 h-4" />
                <span>Ajukan Sewa Tempat</span>
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 px-6 sm:px-8 pb-12 -mt-10 sm:-mt-12 max-w-7xl w-full mx-auto z-10">
          {children}
        </main>
      </div>

      {/* Modal Pengajuan Sewa Fasilitas */}
      <ApplyLeaseModal />

      {/* Modal Pengaturan Akun & Sandi */}
      <AccountSettingsModal
        isOpen={isAccountModalOpen || Boolean(user?.mustChangePassword)}
        onClose={() => setIsAccountModalOpen(false)}
        forcePasswordChange={Boolean(user?.mustChangePassword)}
        onLogout={handleConfirmLogout}
      />

      {/* Modal Validasi Logout */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        userName={displayName}
        userRole="PENYEWA / TENANT"
        userEmail={user?.email || "tenant@porta.mimikakab.go.id"}
      />
    </div>
  );
}
