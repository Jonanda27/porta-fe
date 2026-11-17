"use client";

import React, { useState } from "react";
import {
  Landmark,
  Building2,
  Ship,
  Receipt,
  FileCheck2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  Search,
  Bell,
  MessageSquare,
  Users,
  Anchor,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ArrowUpRight,
  ShieldCheck,
  MapPin,
  Sliders,
  DollarSign,
  Compass,
  Layers,
  ArrowLeft,
  ChevronDown,
  BarChart3,
  PieChart,
  FileText,
  AlertCircle,
  BadgePercent,
  Sparkles,
  ExternalLink,
  Ticket,
} from "lucide-react";

interface DinasPortalProps {
  onLogout: () => void;
}

export default function DinasPortal({ onLogout }: DinasPortalProps) {
  // Sidebar Collapsible State (Icon-only vs Full)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<
    "overview" | "monitoring" | "evaluation" | "complaints"
  >("overview");

  // Global Filter State
  const [selectedPort, setSelectedPort] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Simulation Calculator State (Tab 3)
  const [simVolumeGrowth, setSimVolumeGrowth] = useState<number>(10); // +10%
  const [simTarifIncrease, setSimTarifIncrease] = useState<number>(2000); // +Rp 2.000 pas masuk
  const [simKiosOccupancy, setSimKiosOccupancy] = useState<number>(85); // 85%

  // Complaints Filter (Tab 4)
  const [complaintFilter, setComplaintFilter] = useState<string>("all");

  // Calculation for Simulation
  const baseMonthlyRevenue = 148850000;
  const simulatedVolumeGain = (baseMonthlyRevenue * 0.42 * (simVolumeGrowth / 100));
  const simulatedTarifGain = 12000 * simTarifIncrease; // 12,000 monthly passengers * increase
  const simulatedKiosGain = (simKiosOccupancy - 70) * 450000; // incremental kiosk revenue
  const totalSimulatedRevenue =
    baseMonthlyRevenue + simulatedVolumeGain + simulatedTarifGain + Math.max(0, simulatedKiosGain);
  const revenueDelta = totalSimulatedRevenue - baseMonthlyRevenue;

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#1E2922] font-sans flex antialiased selection:bg-[#D97706]/20 selection:text-[#0B241E]">
      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (Able Pro Inspired Collapsible Navigation)*/}
      {/* ========================================================= */}
      <aside
        className={`${
          isSidebarCollapsed ? "w-20" : "w-64"
        } bg-white flex flex-col justify-between shrink-0 shadow-xs z-30 sticky top-0 h-screen transition-all duration-300 ease-in-out relative`}
      >
        {/* Floating Circular Sidebar Toggle Button (Image 2 Matched: Aligned at Section Header / Menu Start) */}
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute right-0 top-[138px] translate-x-1/2 -translate-y-1/2 z-40 w-8 h-8 rounded-full bg-[#0B241E] hover:bg-[#133D31] text-white border border-[#235848] hover:border-[#D97706]/70 shadow-md flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 group focus:outline-none"
          title={isSidebarCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
          aria-label={isSidebarCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-[#D97706] group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
          ) : (
            <ChevronLeft className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
          )}
        </button>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Brand Logo Header (100% Seamless with Top Header Green - ZERO divider line) */}
          <div
            className={`h-16 bg-[#0B241E] border-b border-[#143E33] flex items-center ${
              isSidebarCollapsed ? "justify-center px-2" : "justify-between px-5"
            } text-white shrink-0 transition-all duration-300`}
          >
            {isSidebarCollapsed ? (
              <div
                className="w-10 h-10 rounded-lg bg-[#143E33] p-1.5 flex items-center justify-center shadow-xs border border-[#1E5748]"
                title="PORTA Dishub Eksekutif"
              >
                <img
                  src="/brand/symbol-white.svg"
                  alt="PORTA"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#143E33] p-1 flex items-center justify-center shadow-xs border border-[#1E5748] shrink-0">
                    <img
                      src="/brand/symbol-white.svg"
                      alt="PORTA"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="truncate">
                    <span className="font-extrabold text-base tracking-wider text-white">
                      PORTA
                    </span>
                    <span className="block text-[9px] font-mono tracking-widest text-[#85A69B] uppercase -mt-0.5 truncate">
                      DISHUB EKSEKUTIF
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono bg-[#143E33] text-[#D97706] border border-[#1E5748] font-bold px-1.5 py-0.5 rounded">
                    v2.4
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Sidebar Body with border-r (Starts only below the green header) */}
          <div className="flex-1 overflow-y-auto border-r border-[#E2E8F0] py-2">
            {/* User Profile Mini Card */}
            {isSidebarCollapsed ? (
              <div className="my-2 flex justify-center">
                <div
                  className="w-10 h-10 rounded-full bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-xs shadow-xs border border-[#164336] cursor-pointer"
                  title="Drs. H. Hendra G., M.Si. (Kepala Dinas Perhubungan)"
                  onClick={() => setIsSidebarCollapsed(false)}
                >
                  HG
                </div>
              </div>
            ) : (
              <div className="p-3.5 mx-3 my-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-sm shrink-0 shadow-xs border border-[#164336]">
                  HG
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#0B241E] truncate">
                    Drs. H. Hendra G., M.Si.
                  </p>
                  <p className="text-[10px] text-[#64748B] truncate mt-0.5">
                    Kepala Dinas Perhubungan
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Menus */}
            <div className={isSidebarCollapsed ? "px-2 space-y-4" : "px-3 space-y-6"}>
              {/* Group 1: Monitoring & Analitik */}
              <div>
                {!isSidebarCollapsed && (
                  <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    Monitoring & Analitik
                  </p>
                )}
                <div className="mt-1 space-y-1">
                  {isSidebarCollapsed ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveTab("overview")}
                        title="Ringkasan Eksekutif"
                        className={`w-11 h-11 mx-auto rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          activeTab === "overview"
                            ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                            : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                        }`}
                      >
                        <BarChart3 className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("monitoring")}
                        title="Penerimaan & Piutang (3 Alert)"
                        className={`w-11 h-11 mx-auto rounded-lg flex items-center justify-center transition-all cursor-pointer relative ${
                          activeTab === "monitoring"
                            ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                            : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                        }`}
                      >
                        <Receipt className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveTab("overview")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          activeTab === "overview"
                            ? "bg-[#0B241E] text-white shadow-xs"
                            : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <BarChart3
                            className={`w-4 h-4 ${
                              activeTab === "overview" ? "text-[#D97706]" : "text-[#64748B]"
                            }`}
                          />
                          <span>Ringkasan Eksekutif</span>
                        </div>
                        {activeTab === "overview" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("monitoring")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          activeTab === "monitoring"
                            ? "bg-[#0B241E] text-white shadow-xs"
                            : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Receipt
                            className={`w-4 h-4 ${
                              activeTab === "monitoring" ? "text-[#D97706]" : "text-[#64748B]"
                            }`}
                          />
                          <span>Penerimaan & Piutang</span>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                          3 Alert
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Group 2: Strategi & Pelayanan */}
              <div>
                {!isSidebarCollapsed ? (
                  <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    Strategi & Pelayanan
                  </p>
                ) : (
                  <div className="my-2 border-t border-[#EDF2F7] mx-2" />
                )}
                <div className="mt-1 space-y-1">
                  {isSidebarCollapsed ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveTab("evaluation")}
                        title="Evaluasi & Simulasi (Kalkulator)"
                        className={`w-11 h-11 mx-auto rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          activeTab === "evaluation"
                            ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                            : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                        }`}
                      >
                        <Sliders className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("complaints")}
                        title="Layanan & Pengaduan (2 Aktif)"
                        className={`w-11 h-11 mx-auto rounded-lg flex items-center justify-center transition-all cursor-pointer relative ${
                          activeTab === "complaints"
                            ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                            : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                        }`}
                      >
                        <Users className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveTab("evaluation")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          activeTab === "evaluation"
                            ? "bg-[#0B241E] text-white shadow-xs"
                            : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Sliders
                            className={`w-4 h-4 ${
                              activeTab === "evaluation" ? "text-[#D97706]" : "text-[#64748B]"
                            }`}
                          />
                          <span>Evaluasi & Simulasi</span>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          Kalkulator
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("complaints")}
                        className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          activeTab === "complaints"
                            ? "bg-[#0B241E] text-white shadow-xs"
                            : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Users
                            className={`w-4 h-4 ${
                              activeTab === "complaints" ? "text-[#D97706]" : "text-[#64748B]"
                            }`}
                          />
                          <span>Layanan & Pengaduan</span>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                          2 Aktif
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Group 3: Regulasi & Dokumen */}
              <div>
                {!isSidebarCollapsed ? (
                  <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    Regulasi & Audit
                  </p>
                ) : (
                  <div className="my-2 border-t border-[#EDF2F7] mx-2" />
                )}
                <div className="mt-1 space-y-1 text-xs text-[#475569]">
                  {isSidebarCollapsed ? (
                    <>
                      <a
                        href="#pp35"
                        title="Salinan Resmi PP No. 35/2023"
                        onClick={(e) => {
                          e.preventDefault();
                          alert("Membuka salinan resmi PP No. 35/2023 tentang Ketentuan Umum Pajak Daerah dan Retribusi Daerah.");
                        }}
                        className="w-11 h-11 mx-auto rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E] cursor-pointer"
                      >
                        <FileText className="w-5 h-5" />
                      </a>

                      <a
                        href="#bapenda"
                        title="Status Integrasi Host-to-Host Kas Daerah (Bapenda): AKTIF"
                        onClick={(e) => {
                          e.preventDefault();
                          alert("Status Integrasi Host-to-Host Kas Daerah (Bapenda): AKTIF (Latency: 42ms).");
                        }}
                        className="w-11 h-11 mx-auto rounded-lg flex items-center justify-center relative text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E] cursor-pointer"
                      >
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </a>
                    </>
                  ) : (
                    <>
                      <a
                        href="#pp35"
                        onClick={(e) => {
                          e.preventDefault();
                          alert("Membuka salinan resmi PP No. 35/2023 tentang Ketentuan Umum Pajak Daerah dan Retribusi Daerah.");
                        }}
                        className="px-3.5 py-2 rounded-lg flex items-center justify-between hover:bg-[#F1F5F9] hover:text-[#0B241E] cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>PP No. 35/2023</span>
                        </span>
                        <ExternalLink className="w-3 h-3 text-[#94A3B8]" />
                      </a>

                      <a
                        href="#bapenda"
                        onClick={(e) => {
                          e.preventDefault();
                          alert("Status Integrasi Host-to-Host Kas Daerah (Bapenda): AKTIF (Latency: 42ms).");
                        }}
                        className="px-3.5 py-2 rounded-lg flex items-center justify-between hover:bg-[#F1F5F9] hover:text-[#0B241E] cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Koneksi Bapenda</span>
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer Logout Button (With Right Border) */}
        <div
          className={`p-3 border-t border-[#EDF2F7] border-r border-[#E2E8F0] bg-white shrink-0 flex ${
            isSidebarCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          <button
            type="button"
            onClick={onLogout}
            className={`rounded-lg text-xs font-bold text-[#E11D48] hover:bg-[#FFF1F2] border border-[#FECDD3] transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              isSidebarCollapsed ? "w-11 h-11 p-0" : "w-full py-2.5 px-3"
            }`}
            title="Keluar / Ganti Akun"
          >
            <ArrowLeft className="w-4 h-4" />
            {!isSidebarCollapsed && <span>Keluar / Ganti Akun</span>}
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN VIEW CANVAS (Able Pro Inspired Header & Card Deck)*/}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* ========================================================= */}
        {/* A. TOP NAVIGATION BAR                                     */}
        {/* ========================================================= */}
        <header className="h-16 bg-[#0B241E] border-b border-[#143E33] flex items-center justify-between px-6 pl-8 text-white sticky top-0 z-20 shadow-xs">
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
                <span className="block text-[10px] text-[#85A69B]">Provinsi Banten</span>
              </div>
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* B. HERO BANNER (Top Colored Band from Able Pro)           */}
        {/* ========================================================= */}
        <section className="bg-[#0B241E] text-white pt-6 pb-20 px-6 sm:px-8 border-b border-[#143E33] relative overflow-hidden">
          {/* Subtle Nautical Coordinate Lines */}
          <div className="absolute right-0 top-0 translate-x-20 -translate-y-12 w-96 h-96 rounded-full border border-[#164336]/40 pointer-events-none" />
          <div className="absolute right-12 top-0 translate-x-32 -translate-y-8 w-[420px] h-[420px] rounded-full border border-[#164336]/20 pointer-events-none" />

          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#D97706] mb-1">
                <span>PORTA</span>
                <span>/</span>
                <span>Dinas Perhubungan</span>
                <span>/</span>
                <span className="text-white">
                  {activeTab === "overview" && "Ringkasan Eksekutif"}
                  {activeTab === "monitoring" && "Penerimaan & Piutang Retribusi"}
                  {activeTab === "evaluation" && "Evaluasi Kinerja & Simulasi"}
                  {activeTab === "complaints" && "Kualitas Layanan & Pengaduan"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {activeTab === "overview" && "Dashboard Eksekutif Dinas Perhubungan"}
                {activeTab === "monitoring" && "Monitoring Realisasi PAD & Piutang"}
                {activeTab === "evaluation" && "Evaluasi Komparasi UPTD & Simulasi PAD"}
                {activeTab === "complaints" && "Pemantauan Pelayanan Publik & SLA Pengaduan"}
              </h1>
              <p className="text-xs sm:text-sm text-[#BED2CA] mt-1 max-w-2xl">
                Oversight terpadu penerimaan daerah, kepatuhan PP No. 35/2023, serta optimalisasi aset pelabuhan penyeberangan.
              </p>
            </div>

            {/* Global Filters on Header */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Filter Pelabuhan */}
              <div className="bg-[#12362C] border border-[#1C4D3F] rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
                <Anchor className="w-3.5 h-3.5 text-[#D97706]" />
                <select
                  value={selectedPort}
                  onChange={(e) => setSelectedPort(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer text-xs font-semibold"
                >
                  <option value="all" className="bg-[#0B241E] text-white">Semua Pelabuhan (4 UPTD)</option>
                  <option value="merak" className="bg-[#0B241E] text-white">UPTD Pelabuhan Merak</option>
                  <option value="bakauheni" className="bg-[#0B241E] text-white">UPTD Pelabuhan Bakauheni</option>
                  <option value="ketapang" className="bg-[#0B241E] text-white">UPTD Pelabuhan Ketapang</option>
                  <option value="gilimanuk" className="bg-[#0B241E] text-white">UPTD Pelabuhan Gilimanuk</option>
                </select>
              </div>

              {/* Filter Periode */}
              <div className="bg-[#12362C] border border-[#1C4D3F] rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
                <Calendar className="w-3.5 h-3.5 text-[#D97706]" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer text-xs font-semibold"
                >
                  <option value="today" className="bg-[#0B241E] text-white">Hari Ini (Real-time)</option>
                  <option value="month" className="bg-[#0B241E] text-white">Bulan Berjalan (Nov 2026)</option>
                  <option value="year" className="bg-[#0B241E] text-white">Tahun Anggaran 2026</option>
                </select>
              </div>

              {/* Export Button */}
              <button
                type="button"
                onClick={() => alert("Mengunduh Laporan Eksekutif PAD Pelabuhan (Format PDF / Excel Rekonsiliasi)...")}
                className="bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Unduh Laporan</span>
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* C. OVERLAPPING KPI CARDS (Signature Able Pro Pattern)     */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 w-full -mt-12 z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* KPI 1: Penerimaan Periode Berjalan */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +18.4%
                </span>
              </div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
                Penerimaan PAD
              </p>
              <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
                Rp 148,85 Jt
              </p>
              <p className="text-[11px] text-[#64748B] mt-1.5 flex items-center gap-1">
                <span>Target APBD:</span>
                <strong className="text-emerald-700">88.2% Tercapai</strong>
              </p>
            </div>

            {/* KPI 2: Tagihan Belum Dibayar / Piutang */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Receipt className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <AlertTriangle className="w-3 h-3" />
                  3 Tagihan
                </span>
              </div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
                Piutang Retribusi
              </p>
              <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
                Rp 14,32 Jt
              </p>
              <p className="text-[11px] text-amber-700 font-semibold mt-1.5">
                Jatuh tempo dlm 7 hari
              </p>
            </div>

            {/* KPI 3: Kunjungan Kapal & Utilisasi Dermaga */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Ship className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-full">
                  86.4% Kapasitas
                </span>
              </div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
                Kunjungan Kapal
              </p>
              <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
                84 Kapal
              </p>
              <p className="text-[11px] text-[#64748B] mt-1.5">
                Rata-rata sandar: <strong>42 Menit</strong>
              </p>
            </div>

            {/* KPI 4: Kontrak Segera Berakhir */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Building2 className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded-full">
                  Sewa Aset
                </span>
              </div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
                Kontrak Aset Kios
              </p>
              <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
                4 Kontrak
              </p>
              <p className="text-[11px] text-purple-700 font-semibold mt-1.5">
                Masa tenggang &lt; 30 hari
              </p>
            </div>

            {/* KPI 5: Pengaduan Belum Selesai */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-100/60 px-2 py-0.5 rounded-full">
                  SLA 94.8%
                </span>
              </div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
                Pengaduan Aktif
              </p>
              <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
                2 Laporan
              </p>
              <p className="text-[11px] text-[#64748B] mt-1.5">
                Rata-rata respons: <strong>1.8 Jam</strong>
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* D. TAB CONTENT SECTION                                    */}
        {/* ========================================================= */}
        <main className="max-w-7xl mx-auto px-6 sm:px-8 py-8 w-full space-y-8 flex-1">
          {/* ======================================================= */}
          {/* TAB 1: RINGKASAN EKSEKUTIF (Overview)                   */}
          {/* ======================================================= */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Top Analytical Chart + Breakdown Deck */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. Large Analytics Visualizer (8 cols) */}
                <div className="lg:col-span-8 bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F5F9]">
                      <div>
                        <h2 className="text-base font-extrabold text-[#0B241E]">
                          Tren Penerimaan Daerah & Arus Penyeberangan
                        </h2>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          Komparasi realisasi penerimaan retribusi (PP 35/2023) selama 6 bulan terakhir.
                        </p>
                      </div>

                      {/* Legend Pills */}
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1.5 text-[#0B241E] font-medium">
                          <span className="w-3 h-3 rounded bg-[#0B241E]" />
                          <span>Penerimaan (Jt Rp)</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-[#D97706] font-medium">
                          <span className="w-3 h-3 rounded bg-[#D97706]" />
                          <span>Penumpang (Ribu Pax)</span>
                        </span>
                      </div>
                    </div>

                    {/* CSS/SVG Bar Chart Visualizer */}
                    <div className="mt-6 pt-2">
                      <div className="h-64 flex items-end justify-between gap-2 sm:gap-6 px-2 border-b border-[#CBD5E1] pb-2">
                        {/* Month 1: Jun */}
                        <div className="flex-1 flex flex-col items-center gap-2 group">
                          <div className="w-full flex items-end justify-center gap-1 h-48">
                            <div className="w-1/2 bg-[#0B241E] rounded-t hover:bg-[#164336] transition-all h-[58%]" title="Rp 118 Juta" />
                            <div className="w-1/2 bg-[#D97706] rounded-t hover:bg-[#B45309] transition-all h-[45%]" title="18.2k Pax" />
                          </div>
                          <span className="text-[11px] font-mono text-[#64748B]">Jun</span>
                        </div>

                        {/* Month 2: Jul (Peak Liburan) */}
                        <div className="flex-1 flex flex-col items-center gap-2 group">
                          <div className="w-full flex items-end justify-center gap-1 h-48">
                            <div className="w-1/2 bg-[#0B241E] rounded-t hover:bg-[#164336] transition-all h-[82%]" title="Rp 156 Juta" />
                            <div className="w-1/2 bg-[#D97706] rounded-t hover:bg-[#B45309] transition-all h-[76%]" title="28.4k Pax" />
                          </div>
                          <span className="text-[11px] font-mono text-[#64748B]">Jul</span>
                        </div>

                        {/* Month 3: Agu */}
                        <div className="flex-1 flex flex-col items-center gap-2 group">
                          <div className="w-full flex items-end justify-center gap-1 h-48">
                            <div className="w-1/2 bg-[#0B241E] rounded-t hover:bg-[#164336] transition-all h-[64%]" title="Rp 128 Juta" />
                            <div className="w-1/2 bg-[#D97706] rounded-t hover:bg-[#B45309] transition-all h-[52%]" title="20.1k Pax" />
                          </div>
                          <span className="text-[11px] font-mono text-[#64748B]">Agu</span>
                        </div>

                        {/* Month 4: Sep */}
                        <div className="flex-1 flex flex-col items-center gap-2 group">
                          <div className="w-full flex items-end justify-center gap-1 h-48">
                            <div className="w-1/2 bg-[#0B241E] rounded-t hover:bg-[#164336] transition-all h-[70%]" title="Rp 134 Juta" />
                            <div className="w-1/2 bg-[#D97706] rounded-t hover:bg-[#B45309] transition-all h-[58%]" title="22.5k Pax" />
                          </div>
                          <span className="text-[11px] font-mono text-[#64748B]">Sep</span>
                        </div>

                        {/* Month 5: Okt */}
                        <div className="flex-1 flex flex-col items-center gap-2 group">
                          <div className="w-full flex items-end justify-center gap-1 h-48">
                            <div className="w-1/2 bg-[#0B241E] rounded-t hover:bg-[#164336] transition-all h-[74%]" title="Rp 141 Juta" />
                            <div className="w-1/2 bg-[#D97706] rounded-t hover:bg-[#B45309] transition-all h-[62%]" title="24.8k Pax" />
                          </div>
                          <span className="text-[11px] font-mono text-[#64748B]">Okt</span>
                        </div>

                        {/* Month 6: Nov (Current) */}
                        <div className="flex-1 flex flex-col items-center gap-2 group">
                          <div className="w-full flex items-end justify-center gap-1 h-48">
                            <div className="w-1/2 bg-[#0B241E] rounded-t hover:bg-[#164336] transition-all h-[88%] relative" title="Rp 148.8 Juta">
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-white bg-[#0B241E] px-1 rounded">
                                148.8M
                              </span>
                            </div>
                            <div className="w-1/2 bg-[#D97706] rounded-t hover:bg-[#B45309] transition-all h-[70%]" title="27.1k Pax" />
                          </div>
                          <span className="text-[11px] font-mono font-bold text-[#0B241E]">Nov*</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Bar Below Chart */}
                  <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between text-xs text-[#64748B]">
                    <span>Rata-rata Penerimaan Bulanan: <strong className="text-[#0B241E]">Rp 137,6 Jt</strong></span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Proyeksi Akhir Tahun: Rp 1,74 Miliar (Surplus APBD)
                    </span>
                  </div>
                </div>

                {/* 2. Composition & Breakdown Widget (4 cols) */}
                <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0B241E] pb-3 border-b border-[#F1F5F9]">
                      Proporsi Objek Retribusi
                    </h3>

                    <div className="mt-5 space-y-4 text-xs">
                      {/* Category 1: Jasa Tambat Kapal */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-[#0B241E] flex items-center gap-1.5">
                            <Ship className="w-3.5 h-3.5 text-[#0B241E]" />
                            <span>Jasa Tambat & Labuh Kapal</span>
                          </span>
                          <span className="font-mono text-[#0B241E]">42% (Rp 62.5 Jt)</span>
                        </div>
                        <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                          <div className="bg-[#0B241E] h-full rounded-full" style={{ width: "42%" }} />
                        </div>
                      </div>

                      {/* Category 2: Pas Masuk Penumpang */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-[#0B241E] flex items-center gap-1.5">
                            <Ticket className="w-3.5 h-3.5 text-[#D97706]" />
                            <span>Pas Penumpang & Kendaraan</span>
                          </span>
                          <span className="font-mono text-[#0B241E]">36% (Rp 53.6 Jt)</span>
                        </div>
                        <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                          <div className="bg-[#D97706] h-full rounded-full" style={{ width: "36%" }} />
                        </div>
                      </div>

                      {/* Category 3: Pemanfaatan Lahan/Kios */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-[#0B241E] flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-purple-700" />
                            <span>Sewa Kios & Lahan Aset</span>
                          </span>
                          <span className="font-mono text-[#0B241E]">14% (Rp 20.8 Jt)</span>
                        </div>
                        <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                          <div className="bg-purple-700 h-full rounded-full" style={{ width: "14%" }} />
                        </div>
                      </div>

                      {/* Category 4: Utilitas */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-[#0B241E] flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-blue-700" />
                            <span>Utilitas Air & Listrik Sandar</span>
                          </span>
                          <span className="font-mono text-[#0B241E]">8% (Rp 11.9 Jt)</span>
                        </div>
                        <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-700 h-full rounded-full" style={{ width: "8%" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  <div className="mt-6 pt-4 border-t border-[#F1F5F9]">
                    <button
                      type="button"
                      onClick={() => setActiveTab("monitoring")}
                      className="w-full py-2.5 px-4 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#0B241E] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>Lihat Rincian Sumber Penerimaan</span>
                      <ChevronRight className="w-4 h-4 text-[#64748B]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Lower Section: Real-time Early Warnings & Recent Operational Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Sistem Peringatan Dini Anomali (Early Warning) */}
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                      <h3 className="text-sm font-extrabold text-[#0B241E]">
                        Peringatan Dini Anomali Penerimaan
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200">
                      Sistem Deteksi Otomatis
                    </span>
                  </div>

                  <div className="divide-y divide-[#F1F5F9] text-xs mt-2">
                    <div className="py-3 flex items-start gap-3">
                      <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                        !
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[#0B241E]">
                          Kunjungan Sandar Tanpa Penagihan Otomatis
                        </p>
                        <p className="text-[11px] text-[#64748B] mt-0.5">
                          KMP Dharma Rucitra (UPTD Merak, Dermaga 2) telah sandar 180 menit tanpa invoice tambat terbit.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => alert("Mengirimkan notifikasi penagihan e-SKRD ke Syahbandar UPTD Merak.")}
                        className="px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-100/60 hover:bg-amber-100 rounded cursor-pointer"
                      >
                        Tegur UPT
                      </button>
                    </div>

                    <div className="py-3 flex items-start gap-3">
                      <div className="w-7 h-7 rounded-md bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                        ⏳
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[#0B241E]">
                          Kontrak Sewa Kios Mendekati Jatuh Tempo
                        </p>
                        <p className="text-[11px] text-[#64748B] mt-0.5">
                          Kios Kuliner B-04 (Pujasera Bakauheni) berakhir dalam 14 hari. Surat perpanjangan belum dikonfirmasi.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => alert("Membuka draf Surat Pemberitahuan Jatuh Tempo Sewa Aset.")}
                        className="px-2.5 py-1 text-[11px] font-bold text-purple-800 bg-purple-100/60 hover:bg-purple-100 rounded cursor-pointer"
                      >
                        Kirim SP
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Audit Kepatuhan & Rekonsiliasi Kas Daerah */}
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm font-extrabold text-[#0B241E]">
                        Sinkronisasi Rekening Kas Umum Daerah (RKUD)
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Sinkron Real-time
                    </span>
                  </div>

                  <div className="mt-3 space-y-3 text-xs">
                    <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-[#64748B]">Bank Penampung Resmi Pemda</p>
                        <p className="font-bold text-[#0B241E] text-sm mt-0.5">Bank Banten (Rekening 010.298.001-9)</p>
                      </div>
                      <span className="text-emerald-700 font-bold bg-emerald-100/80 px-2.5 py-1 rounded-md text-[11px]">
                        Terverifikasi Bapenda
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 border border-[#E2E8F0] rounded-lg">
                        <span className="text-[#64748B] text-[10px] block">Transaksi Masuk Hari Ini</span>
                        <strong className="text-sm font-mono text-[#0B241E]">1.240 Transaksi</strong>
                      </div>
                      <div className="p-2.5 border border-[#E2E8F0] rounded-lg">
                        <span className="text-[#64748B] text-[10px] block">Nominal Hari Ini (WIB)</span>
                        <strong className="text-sm font-mono text-emerald-700">Rp 18.420.000</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 2: MONITORING PENERIMAAN & PIUTANG                  */}
          {/* ======================================================= */}
          {activeTab === "monitoring" && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-[#0B241E]">
                    Rekapitulasi Sumber Pendapatan Asli Daerah (PAD)
                  </h2>
                  <p className="text-xs text-[#64748B] mt-1">
                    Pengawasan rincian objek retribusi sesuai regulasi PP No. 35/2023 dan pemisahan hak bagi hasil pelabuhan.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alert("Mengekspor Berita Acara Rekonsiliasi Piutang Retribusi...")}
                    className="px-3.5 py-2 bg-[#0B241E] hover:bg-[#164336] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Rekapitulasi (Excel)</span>
                  </button>
                </div>
              </div>

              {/* Data Table: Rincian Objek Retribusi */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-[#0B241E]">
                    Matriks Objek Retribusi Pelabuhan (PP No. 35/2023)
                  </h3>
                  <span className="text-xs font-mono text-[#64748B]">Tahun Anggaran 2026</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] text-[#475569] font-bold border-b border-[#E2E8F0]">
                      <tr>
                        <th className="py-3 px-4">Objek Retribusi</th>
                        <th className="py-3 px-4">Dasar Regulasi</th>
                        <th className="py-3 px-4 text-right">Target APBD (Thn)</th>
                        <th className="py-3 px-4 text-right">Realisasi (YTD)</th>
                        <th className="py-3 px-4 text-center">Capaian</th>
                        <th className="py-3 px-4 text-right">Piutang Berjalan</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] text-[#1E2922]">
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="py-3.5 px-4 font-bold text-[#0B241E]">
                          Jasa Tambat Kapal (Dermaga Pelabuhan)
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B]">PP 35/2023 Ps. 88 (a)</td>
                        <td className="py-3.5 px-4 text-right font-mono">Rp 650.000.000</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">Rp 582.400.000</td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-700">89.6%</td>
                        <td className="py-3.5 px-4 text-right font-mono text-amber-700">Rp 5.450.000</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Sangat Baik
                          </span>
                        </td>
                      </tr>

                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="py-3.5 px-4 font-bold text-[#0B241E]">
                          Jasa Labuh & Pemanduan Perairan
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B]">PP 35/2023 Ps. 88 (b)</td>
                        <td className="py-3.5 px-4 text-right font-mono">Rp 220.000.000</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">Rp 195.800.000</td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-700">89.0%</td>
                        <td className="py-3.5 px-4 text-right font-mono text-[#64748B]">Rp 0</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Lunas
                          </span>
                        </td>
                      </tr>

                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="py-3.5 px-4 font-bold text-[#0B241E]">
                          Pas Masuk Pelabuhan (Penumpang Orang)
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B]">PP 35/2023 Ps. 91</td>
                        <td className="py-3.5 px-4 text-right font-mono">Rp 480.000.000</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">Rp 421.300.000</td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-700">87.7%</td>
                        <td className="py-3.5 px-4 text-right font-mono text-[#64748B]">Rp 0 (Cashless)</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Otomatis QR
                          </span>
                        </td>
                      </tr>

                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="py-3.5 px-4 font-bold text-[#0B241E]">
                          Pas Masuk Kendaraan (Gol IV - VIII)
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B]">PP 35/2023 Ps. 92</td>
                        <td className="py-3.5 px-4 text-right font-mono">Rp 340.000.000</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">Rp 298.600.000</td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-700">87.8%</td>
                        <td className="py-3.5 px-4 text-right font-mono text-amber-700">Rp 2.100.000</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            1 Truk Tertunda
                          </span>
                        </td>
                      </tr>

                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="py-3.5 px-4 font-bold text-[#0B241E]">
                          Pemanfaatan Kios Kuliner & Retail
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B]">PP 35/2023 Ps. 95 (Aset)</td>
                        <td className="py-3.5 px-4 text-right font-mono">Rp 120.000.000</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[#0B241E]">Rp 96.500.000</td>
                        <td className="py-3.5 px-4 text-center font-bold text-amber-700">80.4%</td>
                        <td className="py-3.5 px-4 text-right font-mono text-rose-700">Rp 6.770.000</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                            Butuh Teguran
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pemantauan Hak Penerimaan (PP 35/2023 Segregation) */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0B241E]">
                      Transparansi Pemisahan Hak Penerimaan (PP 35/2023)
                    </h3>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Pemisahan otomatis antara penerimaan kas daerah (Pemda), hak operator kapal, dan mitra perbankan.
                    </p>
                  </div>
                  <span className="text-xs font-mono bg-emerald-50 text-emerald-800 px-3 py-1 rounded-md font-bold">
                    Audit Clean (Zero Leakage)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                    <p className="text-xs font-bold text-[#0B241E]">1. Hak Kas Daerah (Pemda Banten)</p>
                    <p className="text-xl font-extrabold font-mono text-emerald-700 mt-2">100% Retribusi</p>
                    <p className="text-[11px] text-[#64748B] mt-1">
                      Pas masuk orang, pas kendaraan, dan jasa labuh/tambat langsung masuk ke RKUD.
                    </p>
                  </div>

                  <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                    <p className="text-xs font-bold text-[#0B241E]">2. Hak Operator Kapal (ASDP/Swasta)</p>
                    <p className="text-xl font-extrabold font-mono text-[#0B241E] mt-2">Tarif Angkutan</p>
                    <p className="text-[11px] text-[#64748B] mt-1">
                      Komponen tiket penyeberangan murni displit langsung ke escrow account perusahaan kapal.
                    </p>
                  </div>

                  <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                    <p className="text-xs font-bold text-[#0B241E]">3. Iuran Wajib Asuransi (Jasa Raharja)</p>
                    <p className="text-xl font-extrabold font-mono text-[#0B241E] mt-2">Premi Terlindungi</p>
                    <p className="text-[11px] text-[#64748B] mt-1">
                      Asuransi jiwa penumpang resmi disalurkan otomatis per manifes clearance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 3: EVALUASI KINERJA & SIMULASI                      */}
          {/* ======================================================= */}
          {activeTab === "evaluation" && (
            <div className="space-y-6">
              {/* 1. Evaluasi Komparasi Antar-UPTD */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#F1F5F9]">
                  <div>
                    <h2 className="text-base font-extrabold text-[#0B241E]">
                      Perbandingan Kinerja Antar-Pelabuhan (Benchmarking UPTD)
                    </h2>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Evaluasi efisiensi pendapatan, utilisasi dermaga, dan indeks kepuasan publik lintas 4 UPTD.
                    </p>
                  </div>
                  <span className="text-xs font-mono bg-blue-50 text-blue-800 font-bold px-3 py-1 rounded-md">
                    Evaluasi Semester II
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
                  {/* UPTD 1: Merak */}
                  <div className="p-4 bg-[#F8FAFC] border border-emerald-200 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl">
                      Kinerja Tertinggi
                    </div>
                    <p className="text-sm font-extrabold text-[#0B241E]">UPTD Merak</p>
                    <p className="text-xs text-[#64748B]">Dermaga 1 s/d 4</p>
                    <div className="mt-3 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Penerimaan:</span>
                        <strong className="font-mono text-[#0B241E]">Rp 78,4 Jt/bln</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Utilisasi:</span>
                        <strong className="text-emerald-700">92% (Tinggi)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Mutu Layanan:</span>
                        <strong className="text-[#0B241E]">Grade A (96.2)</strong>
                      </div>
                    </div>
                  </div>

                  {/* UPTD 2: Bakauheni */}
                  <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                    <p className="text-sm font-extrabold text-[#0B241E]">UPTD Bakauheni</p>
                    <p className="text-xs text-[#64748B]">Dermaga Reguler & Eks.</p>
                    <div className="mt-3 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Penerimaan:</span>
                        <strong className="font-mono text-[#0B241E]">Rp 51,2 Jt/bln</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Utilisasi:</span>
                        <strong className="text-emerald-700">84% (Stabil)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Mutu Layanan:</span>
                        <strong className="text-[#0B241E]">Grade A- (91.8)</strong>
                      </div>
                    </div>
                  </div>

                  {/* UPTD 3: Ketapang */}
                  <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                    <p className="text-sm font-extrabold text-[#0B241E]">UPTD Ketapang</p>
                    <p className="text-xs text-[#64748B]">Dermaga LCM & Ponton</p>
                    <div className="mt-3 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Penerimaan:</span>
                        <strong className="font-mono text-[#0B241E]">Rp 34,6 Jt/bln</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Utilisasi:</span>
                        <strong className="text-amber-700">78% (Menengah)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Mutu Layanan:</span>
                        <strong className="text-[#0B241E]">Grade B+ (88.4)</strong>
                      </div>
                    </div>
                  </div>

                  {/* UPTD 4: Gilimanuk */}
                  <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                    <p className="text-sm font-extrabold text-[#0B241E]">UPTD Gilimanuk</p>
                    <p className="text-xs text-[#64748B]">Dermaga Penyeberangan</p>
                    <div className="mt-3 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Penerimaan:</span>
                        <strong className="font-mono text-[#0B241E]">Rp 28,1 Jt/bln</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Utilisasi:</span>
                        <strong className="text-amber-700">72% (Waspada)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Mutu Layanan:</span>
                        <strong className="text-[#0B241E]">Grade B (84.1)</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Interactive Calculator: Simulasi Proyeksi Potensi Pendapatan */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#D97706]/10 text-[#D97706] flex items-center justify-center">
                      <Sliders className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-[#0B241E]">
                        Kalkulator Simulasi Kebijakan & Proyeksi Skenario PAD
                      </h2>
                      <p className="text-xs text-[#64748B]">
                        Uji coba dampak penyesuaian tarif, pertumbuhan arus mudik/libur, dan optimalisasi sewa kios pelabuhan.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSimVolumeGrowth(10);
                      setSimTarifIncrease(2000);
                      setSimKiosOccupancy(85);
                    }}
                    className="text-xs text-[#D97706] hover:underline cursor-pointer font-bold"
                  >
                    Reset Parameter
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Slider Controls (7 cols) */}
                  <div className="lg:col-span-7 space-y-5">
                    {/* Control 1: Volume Growth */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <label className="font-bold text-[#0B241E]">
                          1. Proyeksi Pertumbuhan Arus Penyeberangan (Nataru / Libur)
                        </label>
                        <span className="font-mono font-bold text-[#D97706]">+{simVolumeGrowth}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        step="5"
                        value={simVolumeGrowth}
                        onChange={(e) => setSimVolumeGrowth(Number(e.target.value))}
                        className="w-full accent-[#0B241E] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono">
                        <span>Normal (0%)</span>
                        <span>+20% (Sedang)</span>
                        <span>+40% (Peak Season)</span>
                      </div>
                    </div>

                    {/* Control 2: Penyesuaian Tarif Pas Masuk */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <label className="font-bold text-[#0B241E]">
                          2. Rencana Penyesuaian Tarif Pas Masuk Daerah (Perda)
                        </label>
                        <span className="font-mono font-bold text-[#D97706]">
                          +Rp {simTarifIncrease.toLocaleString("id-ID")} / Orang
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        step="500"
                        value={simTarifIncrease}
                        onChange={(e) => setSimTarifIncrease(Number(e.target.value))}
                        className="w-full accent-[#0B241E] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono">
                        <span>Rp 0 (Tetap)</span>
                        <span>+Rp 2.500</span>
                        <span>+Rp 5.000 (Maksimal)</span>
                      </div>
                    </div>

                    {/* Control 3: Okupansi Kios & Aset */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <label className="font-bold text-[#0B241E]">
                          3. Target Okupansi Kios Pujasera & Gudang Logistik
                        </label>
                        <span className="font-mono font-bold text-[#D97706]">{simKiosOccupancy}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        step="5"
                        value={simKiosOccupancy}
                        onChange={(e) => setSimKiosOccupancy(Number(e.target.value))}
                        className="w-full accent-[#0B241E] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono">
                        <span>50% (Rendah)</span>
                        <span>75% (Eksisting)</span>
                        <span>100% (Penuh)</span>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Calculation Result Box (5 cols) */}
                  <div className="lg:col-span-5 bg-[#0B241E] text-white rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs pb-3 border-b border-[#184438]">
                        <span className="text-[#85A69B]">Hasil Proyeksi Skenario</span>
                        <span className="font-mono text-[#D97706] font-bold">PP 35/2023 Sim</span>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div>
                          <span className="text-[11px] text-[#BED2CA]">Estimasi Penerimaan Bulanan Baru</span>
                          <p className="text-2xl font-extrabold font-mono text-emerald-400 mt-0.5">
                            Rp {(totalSimulatedRevenue / 1000000).toFixed(2)} Juta
                          </p>
                        </div>

                        <div className="p-3 bg-[#12362C] border border-[#1C4D3F] rounded-lg space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#85A69B]">Kenaikan Pendapatan:</span>
                            <span className="font-mono font-bold text-emerald-400">
                              +Rp {(revenueDelta / 1000000).toFixed(2)} Jt / bln
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#85A69B]">Persentase Lonjakan:</span>
                            <span className="font-mono font-bold text-[#D97706]">
                              +{((revenueDelta / baseMonthlyRevenue) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        <p className="text-[10px] text-[#85A69B] leading-relaxed pt-1">
                          *Proyeksi tahunan berpotensi menyentuh <strong>Rp {((totalSimulatedRevenue * 12) / 1000000000).toFixed(2)} Miliar</strong>, memperkuat ruang fiskal APBD untuk revitalisasi fasilitas sandar.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert("Menyimpan simulasi skenario ke Dokumen Rencana Kerja Anggaran (RKA) Dinas.")}
                      className="w-full mt-4 py-2 px-3 bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Simpan Rekomendasi Kebijakan
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Peta Peluang Usaha Pelabuhan (GIS Asset Explorer) */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0B241E]">
                      Peta Spasial Peluang Usaha & Investasi Aset Pelabuhan (GIS)
                    </h3>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Visualisasi lahan kosong, ruang komersial, dan fasilitas dermaga yang siap ditawarkan kepada investor/mitra.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md font-bold">
                    3 Lahan Siap Tender
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Asset 1 */}
                  <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl hover:border-[#0B241E] transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        SIAP SEWA
                      </span>
                      <span className="text-[11px] text-[#64748B] font-mono">Zona Komersial A</span>
                    </div>
                    <p className="font-extrabold text-[#0B241E] text-sm mt-2">
                      Gudang Logistik & Cold Storage
                    </p>
                    <p className="text-[#64748B] text-[11px] mt-1">
                      Luas: <strong>450 m²</strong> • Depan Dermaga 1 Merak. Cocok untuk rantai pasok ikan & sembako antar pulau.
                    </p>
                    <div className="mt-3 pt-2 border-t border-[#E2E8F0] flex justify-between items-center">
                      <span className="font-mono font-bold text-[#0B241E]">Rp 45 Jt / Thn</span>
                      <button
                        type="button"
                        onClick={() => alert("Membuka Dokumen Kerangka Investasi Gudang Logistik.")}
                        className="text-[11px] text-[#D97706] font-bold hover:underline cursor-pointer"
                      >
                        Detail Aset →
                      </button>
                    </div>
                  </div>

                  {/* Asset 2 */}
                  <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl hover:border-[#0B241E] transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        SIAP SEWA
                      </span>
                      <span className="text-[11px] text-[#64748B] font-mono">Ruang Tunggu Eksekutif</span>
                    </div>
                    <p className="font-extrabold text-[#0B241E] text-sm mt-2">
                      Kios F&B / Franchise Tenant
                    </p>
                    <p className="text-[#64748B] text-[11px] mt-1">
                      Luas: <strong>60 m²</strong> (2 Unit) • Foot-traffic 4.500 penumpang/hari. Listrik 3-fasa siap pakai.
                    </p>
                    <div className="mt-3 pt-2 border-t border-[#E2E8F0] flex justify-between items-center">
                      <span className="font-mono font-bold text-[#0B241E]">Rp 24 Jt / Thn</span>
                      <button
                        type="button"
                        onClick={() => alert("Membuka Dokumen Kerangka Investasi Kios F&B.")}
                        className="text-[11px] text-[#D97706] font-bold hover:underline cursor-pointer"
                      >
                        Detail Aset →
                      </button>
                    </div>
                  </div>

                  {/* Asset 3 */}
                  <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl hover:border-[#0B241E] transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                        PROSES TENDER
                      </span>
                      <span className="text-[11px] text-[#64748B] font-mono">Bunkering Dermaga 3</span>
                    </div>
                    <p className="font-extrabold text-[#0B241E] text-sm mt-2">
                      Instalasi Pengisian Air Tawar Kapal
                    </p>
                    <p className="text-[#64748B] text-[11px] mt-1">
                      Kapasitas: <strong>50 Ton/Hari</strong> • Sistem perpipaan terotomatisasi e-Meter host-to-host PORTA.
                    </p>
                    <div className="mt-3 pt-2 border-t border-[#E2E8F0] flex justify-between items-center">
                      <span className="font-mono font-bold text-[#0B241E]">Kerja Sama KSP</span>
                      <button
                        type="button"
                        onClick={() => alert("Membuka Dokumen Kerangka Kerjasama Bunkering.")}
                        className="text-[11px] text-[#D97706] font-bold hover:underline cursor-pointer"
                      >
                        Detail Aset →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 4: KUALITAS LAYANAN & PENGADUAN                     */}
          {/* ======================================================= */}
          {activeTab === "complaints" && (
            <div className="space-y-6">
              {/* Top Overview Cards for Complaints */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Total Laporan Bulan Ini</span>
                  <p className="text-2xl font-extrabold text-[#0B241E] font-mono mt-1">42 Laporan</p>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1">Turun 14% dari Okt</p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Selesai dalam SLA (&lt; 24 Jam)</span>
                  <p className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">39 Kasus</p>
                  <p className="text-[11px] text-[#64748B] mt-1">SLA Achievement: 92.8%</p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Sedang Ditindaklanjuti UPTD</span>
                  <p className="text-2xl font-extrabold text-amber-700 font-mono mt-1">2 Kasus</p>
                  <p className="text-[11px] text-[#64748B] mt-1">Batas respons tersisa 4 jam</p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Eskalasi Pimpinan Dinas</span>
                  <p className="text-2xl font-extrabold text-rose-700 font-mono mt-1">1 Kasus</p>
                  <p className="text-[11px] text-rose-700 font-semibold mt-1">Butuh Disposisi Kadis</p>
                </div>
              </div>

              {/* Complaints Log Table */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0B241E]">
                      Log Laporan & Pengaduan Pelayanan Publik
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Pengaduan yang masuk dari portal publik, gate ticketing, serta posko pengaduan fisik pelabuhan.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setComplaintFilter("all")}
                      className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                        complaintFilter === "all" ? "bg-[#0B241E] text-white" : "bg-[#F1F5F9] text-[#64748B]"
                      }`}
                    >
                      Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setComplaintFilter("active")}
                      className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                        complaintFilter === "active" ? "bg-[#0B241E] text-white" : "bg-[#F1F5F9] text-[#64748B]"
                      }`}
                    >
                      Perlu Tindakan
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] text-[#475569] font-bold border-b border-[#E2E8F0]">
                      <tr>
                        <th className="py-3 px-4">Tiket ID</th>
                        <th className="py-3 px-4">Waktu & Saluran</th>
                        <th className="py-3 px-4">Nama Pelapor</th>
                        <th className="py-3 px-4">Kategori Kendala</th>
                        <th className="py-3 px-4">UPTD Terkait</th>
                        <th className="py-3 px-4 text-center">Status SLA</th>
                        <th className="py-3 px-4 text-center">Aksi Disposisi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {/* Ticket 1 */}
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#0B241E]">
                          #PGD-2026-118
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#0B241E]">Hari Ini, 09:15</p>
                          <span className="text-[10px] text-[#64748B]">Portal Mobile QR</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium">Budi Santoso (Penumpang)</td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#0B241E]">Kendala Pindai QR Gate Dermaga 2</p>
                          <p className="text-[11px] text-[#64748B]">Barcode pas masuk tidak terbaca scanner gate otomatis.</p>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#0B241E]">UPTD Merak</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Sedang Dikerjakan (1 Jam)
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => alert("Status pengaduan diarahkan ke Teknisi IT UPTD Merak.")}
                            className="px-2.5 py-1 bg-[#0B241E] hover:bg-[#164336] text-white rounded text-[11px] font-bold cursor-pointer"
                          >
                            Pantau Solusi
                          </button>
                        </td>
                      </tr>

                      {/* Ticket 2 */}
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#0B241E]">
                          #PGD-2026-114
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#0B241E]">Hari Ini, 07:30</p>
                          <span className="text-[10px] text-[#64748B]">WhatsApp BOT Layanan</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium">PT Lintas Bahari (Operator)</td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#0B241E]">Keterlambatan Clearance SPB Dermaga 1</p>
                          <p className="text-[11px] text-[#64748B]">Petugas jaga verifikasi manifes terlambat 25 menit.</p>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#0B241E]">UPTD Bakauheni</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            Eskalasi Kadis
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => alert("Mengirimkan Nota Disposisi Pembinaan Disiplin Petugas ke Kepala UPTD Bakauheni.")}
                            className="px-2.5 py-1 bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] rounded text-[11px] font-bold cursor-pointer"
                          >
                            Beri Disposisi
                          </button>
                        </td>
                      </tr>

                      {/* Ticket 3 */}
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#0B241E]">
                          #PGD-2026-102
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#0B241E]">Kemarin, 16:40</p>
                          <span className="text-[10px] text-[#64748B]">Posko Layanan Fisik</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium">Siti Rahma (Supir Logistik)</td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#0B241E]">Klarifikasi Tarif Pas Masuk Truk Gol IVA</p>
                          <p className="text-[11px] text-[#64748B]">Sudah dijelaskan sesuai Perda tarif resmi PP No. 35/2023.</p>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#0B241E]">UPTD Merak</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Selesai (Ditutup)
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-[#64748B] text-[11px]">Tidak ada aksi</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
