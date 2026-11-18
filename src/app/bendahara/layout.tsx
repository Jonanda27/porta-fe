"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Landmark,
  Receipt,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Scale,
  Building2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Layers,
  FileCheck2,
  Coins,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { LogoutConfirmModal } from "@/components/ui/LogoutConfirmModal";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  exact?: boolean;
  badge?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export default function BendaharaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

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
    return "Dashboard Finansial & Penerimaan Kas Daerah (PAD)";
  };

  const getBreadcrumbLabel = () => {
    if (pathname.includes("/bendahara/verifikasi")) return "Verifikasi & e-SSRD";
    if (pathname.includes("/bendahara/skrd")) return "Penetapan e-SKRD";
    if (pathname.includes("/bendahara/tunggakan")) return "Piutang & STPD";
    if (pathname.includes("/bendahara/rekonsiliasi")) return "Rekonsiliasi Kasda";
    if (pathname.includes("/bendahara/kios-utilitas")) return "Tenant & Utilitas";
    if (pathname.includes("/bendahara/keberatan")) return "Keberatan Tarif";
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
    return "Pusat monitoring pendapatan asli daerah (PAD), realisasi target APBD, status likuiditas kas pelabuhan, dan pengawasan anti-kebocoran retribusi.";
  };

  const navMenuItems: NavGroup[] = [
    {
      group: "Penerimaan & Kasda",
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
      group: "Pengawasan & Kepatuhan",
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
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#1E2922] font-sans flex antialiased selection:bg-[#D97706]/20 selection:text-[#0B241E]">
      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (Collapsible Bendahara Navigation)        */}
      {/* ========================================================= */}
      <aside
        className={`${
          isSidebarCollapsed ? "w-20" : "w-72"
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

        {/* Top Brand Identity */}
        <div>
          <div className="h-16 bg-[#0B241E] text-white px-5 flex items-center gap-3 border-b border-[#143E33]">
            <div className="w-9 h-9 rounded-xl bg-[#D97706] text-[#0B241E] flex items-center justify-center font-black text-lg shadow-sm shrink-0">
              <Landmark className="w-5 h-5 text-[#0B241E]" />
            </div>

            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-white">
                    PORTA
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#D97706]/20 text-[#D97706] border border-[#D97706]/30 uppercase tracking-wider">
                    BENDAHARA
                  </span>
                </div>
                <p className="text-[10px] text-[#A0C4B8] truncate leading-tight font-medium mt-0.5">
                  Kas Daerah & Penerimaan Retribusi
                </p>
              </div>
            )}
          </div>

          {/* Unit Pelaksana Teknis Context Badge */}
          {!isSidebarCollapsed && (
            <div className="p-4 border-b border-[#F1F5F9] bg-[#FAFCFB]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-[#0B241E] truncate">
                    BPKAD / Dishub Kab. Mimika
                  </h3>
                  <p className="text-[10px] text-[#64748B] truncate font-mono">
                    Rekening Kasda: Bank Papua RKUD
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Nav Links */}
          <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-270px)] scrollbar-none">
            {navMenuItems.map((grp, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {!isSidebarCollapsed && (
                  <p className="px-3 text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                    {grp.group}
                  </p>
                )}

                {grp.items.map((item, iIdx) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={iIdx}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? "bg-[#0B241E] text-white shadow-xs font-bold"
                          : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0B241E]"
                      }`}
                      title={isSidebarCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <item.icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? "text-[#D97706]"
                              : "text-[#64748B] group-hover:text-[#0B241E]"
                          }`}
                        />
                        {!isSidebarCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>

                      {!isSidebarCollapsed && item.badge && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${
                            isActive
                              ? "bg-[#D97706] text-[#0B241E] font-bold"
                              : "bg-[#F1F5F9] text-[#64748B]"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-3 border-t border-[#F1F5F9] bg-white">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                onClick={() => setShowLogoutModal(true)}
                className="w-8 h-8 rounded-lg bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer hover:ring-2 hover:ring-rose-400 transition-all"
                title="Klik untuk opsi keluar akun"
              >
                BK
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#0B241E] truncate">
                    {user?.fullName || "Bendahara Kasda"}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-mono truncate font-semibold">
                    BENDAHARA PENERIMAAN
                  </p>
                </div>
              )}
            </div>

            {!isSidebarCollapsed && (
              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="p-1.5 text-[#64748B] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Keluar dari sesi Bendahara"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

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
            {/* Host-to-Host RKUD Bank Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#12362C] text-emerald-300 border border-[#1C4D3F] text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>RKUD Bank Papua: Terhubung H2H</span>
            </div>

            {/* Quick Portal Jump */}
            <Link
              href="/"
              className="p-2 rounded-lg bg-[#12362C] hover:bg-[#1A493B] text-[#BED2CA] hover:text-white transition-colors"
              title="Ke Halaman Utama Portal"
            >
              <Building2 className="w-4 h-4" />
            </Link>

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
    </div>
  );
}
