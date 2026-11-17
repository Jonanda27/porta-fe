"use client";

import React, { useState } from "react";
import {
  Anchor,
  Compass,
  Ship,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileText,
  UploadCloud,
  FileCheck2,
  Trash2,
  X,
  Lock,
  Search,
  Filter,
  ArrowUpRight,
  Receipt,
  Bell,
  ChevronDown,
  Layers,
  HelpCircle,
  Menu,
  Check,
  AlertCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface VesselSchedule {
  id: string;
  name: string;
  callSign: string;
  gt: string;
  type: string;
  eta: string;
  etd: string;
  dock: string;
  status: "active" | "pending_manifest" | "cleared";
  statusLabel: string;
  passengersEstimate: number;
  vehiclesEstimate: number;
  assignedCaptain: string;
}

interface OperatorPortalProps {
  onLogout?: () => void;
}

export default function OperatorPortal({ onLogout }: OperatorPortalProps) {
  // Navigation & Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "schedules" | "manifests" | "billing">(
    "overview"
  );
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Slide-over Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [selectedVessel, setSelectedVessel] = useState<VesselSchedule | null>(null);

  // Form Fields for Manifest
  const [adultPax, setAdultPax] = useState<number>(120);
  const [childPax, setChildPax] = useState<number>(15);
  const [vehicle4A, setVehicle4A] = useState<number>(10);
  const [vehicle5, setVehicle5] = useState<number>(4);

  // Uploaded PDF State
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: string;
    hash: string;
  } | null>({
    name: "Manifest_KMP_Mutiara_16Nov2026.pdf",
    size: "2.4 MB",
    hash: "SHA256: 8f4a...9b12",
  });

  // Toast State
  const [notification, setNotification] = useState<string | null>(null);

  // Live Schedules Dataset
  const [vessels, setVessels] = useState<VesselSchedule[]>([
    {
      id: "V-01",
      name: "KMP Baruna Jaya",
      callSign: "PK-BJ92",
      gt: "1.250 GT",
      type: "Ro-Ro Ferry Angkutan Massal",
      eta: "08:00 WIB",
      etd: "09:30 WIB",
      dock: "Dermaga 1",
      status: "active",
      statusLabel: "Sandar Aktif",
      passengersEstimate: 210,
      vehiclesEstimate: 42,
      assignedCaptain: "Capt. Hendra Gunawan",
    },
    {
      id: "V-02",
      name: "KMP Mutiara",
      callSign: "PK-MT88",
      gt: "2.100 GT",
      type: "Express Passenger Ro-Ro",
      eta: "14:00 WIB",
      etd: "15:30 WIB",
      dock: "Dermaga 2",
      status: "pending_manifest",
      statusLabel: "Butuh Manifes Segera",
      passengersEstimate: 135,
      vehiclesEstimate: 14,
      assignedCaptain: "Capt. Andi Pratama",
    },
    {
      id: "V-03",
      name: "KMP Dharma Rucitra",
      callSign: "PK-DR14",
      gt: "3.450 GT",
      type: "Heavy Cargo & Vehicle Carrier",
      eta: "18:30 WIB",
      etd: "20:00 WIB",
      dock: "Dermaga 3",
      status: "cleared",
      statusLabel: "Manifes Terverifikasi",
      passengersEstimate: 320,
      vehiclesEstimate: 68,
      assignedCaptain: "Capt. Bambang Sugianto",
    },
  ]);

  // Retribution calculation helpers (PP 35/2023)
  const tarifPasDewasa = 10000;
  const tarifPasAnak = 5000;
  const totalPasPenumpang = adultPax * tarifPasDewasa + childPax * tarifPasAnak;

  const handleOpenDrawer = (vessel: VesselSchedule) => {
    setSelectedVessel(vessel);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleManifestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachedFile) {
      alert("Harap sertakan berkas digital manifes resmi (PDF).");
      return;
    }

    setVessels((prev) =>
      prev.map((v) =>
        v.id === selectedVessel?.id
          ? {
              ...v,
              status: "cleared",
              statusLabel: "Menunggu Clearance UPT",
              passengersEstimate: adultPax + childPax,
              vehiclesEstimate: vehicle4A + vehicle5,
            }
          : v
      )
    );

    setIsDrawerOpen(false);
    setNotification(
      `Manifes ${selectedVessel?.name} berhasil dienkripsi dan diserahkan ke Otoritas UPT.`
    );
    setTimeout(() => setNotification(null), 5000);
  };

  const filteredVessels = vessels.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.dock.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.callSign.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === "pending") return matchesSearch && v.status === "pending_manifest";
    if (filterStatus === "active") return matchesSearch && v.status === "active";
    if (filterStatus === "cleared") return matchesSearch && v.status === "cleared";
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E2922] font-sans selection:bg-[#D97706]/20 selection:text-[#0F2E26]">
      {/* ========================================================= */}
      {/* 1. TOP MARITIME COMMAND BAR                               */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-30 bg-[#0F2E26] text-white border-b border-[#1A453A] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Authority Seal */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-[#143E33] p-1 flex items-center justify-center shadow-xs border border-[#1E5748]">
                  <img
                    src="/brand/symbol-white.svg"
                    alt="PORTA"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="font-black text-lg tracking-wider text-white">PORTA</span>
                  <span className="text-[#D97706] font-extrabold text-lg">.</span>
                  <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#174338] text-[#E3ECE8] border border-[#2B7A67]/40 tracking-wider uppercase">
                    Operator Kapal
                  </span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-[#1A453A]">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    activeTab === "overview"
                      ? "bg-[#174338] text-white shadow-xs"
                      : "text-[#E3ECE8]/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Dashboard Operasional
                </button>
                <button
                  onClick={() => setActiveTab("schedules")}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === "schedules"
                      ? "bg-[#174338] text-white shadow-xs"
                      : "text-[#E3ECE8]/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>Jadwal & Dermaga</span>
                  <span className="w-2 h-2 rounded-full bg-[#D97706]"></span>
                </button>
                <button
                  onClick={() => setActiveTab("billing")}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    activeTab === "billing"
                      ? "bg-[#174338] text-white shadow-xs"
                      : "text-[#E3ECE8]/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Billing Retribusi
                </button>
              </nav>
            </div>

            {/* Right Status Signals */}
            <div className="flex items-center gap-3">
              {/* Tidal & Meteorological telemetry */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0A1C17]/60 border border-[#1A453A] text-[11px] text-[#E3ECE8]">
                <Compass className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Merak Pier: Pasang +0.4m</span>
                <span className="text-[#1A453A]">•</span>
                <span className="text-emerald-400 font-medium">Alur Bersih</span>
              </div>

              {/* Notification */}
              <button
                className="relative p-2 rounded-md text-[#E3ECE8] hover:text-white hover:bg-[#174338] transition-colors cursor-pointer"
                aria-label="Lihat notifikasi"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D97706]" />
              </button>

              {/* Operator Badge & Logout */}
              <div className="flex items-center gap-2.5 pl-3 border-l border-[#1A453A]">
                <div className="w-8 h-8 rounded bg-[#174338] border border-[#2B7A67]/60 flex items-center justify-center font-bold text-xs text-[#E3ECE8]">
                  PN
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold leading-tight text-white">PT Pelayaran Nusantara</p>
                  <p className="text-[10px] text-[#D97706] font-mono">SIUPAL: 198/AL.001</p>
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="ml-2 px-2.5 py-1 text-[11px] font-semibold bg-[#174338] hover:bg-[#D97706] hover:text-[#0F2E26] text-[#E3ECE8] rounded transition-colors cursor-pointer"
                    title="Ganti akun / Keluar"
                  >
                    Keluar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. OPERATIONAL COCKPIT & METRICS STRIP                   */}
      {/* ========================================================= */}
      <section className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Headline and Terminal Briefing */}
            <div className="space-y-1.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F2E26]">
                Portal Pengendali Operasional Armada
              </h1>
              <p className="text-xs text-[#52635B] max-w-2xl leading-relaxed">
                Pengawasan alokasi sandar kapal, kepatuhan manifes muatan keselamatan pelayaran (SOLAS),
                serta pelunasan retribusi jasa kepelabuhanan (PP No. 35/2023).
              </p>
            </div>

            {/* Asymmetric Telemetry Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Telemetry 1: Active Docks */}
              <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[#E3ECE8] text-[#0F2E26] flex items-center justify-center shrink-0">
                  <Ship className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#52635B]">Sandar Hari Ini</p>
                  <p className="text-base font-bold text-[#0F2E26] tabular-nums font-mono">2 / 3 Armada</p>
                </div>
              </div>

              {/* Telemetry 2: Pending Manifest (Actionable Indicator) */}
              <div className="bg-[#FEF3C7]/40 border border-[#D97706]/40 rounded-lg p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[#D97706] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <AlertTriangle className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#B45309]">Manifes Tertunda</p>
                  <p className="text-base font-bold text-[#B45309] tabular-nums font-mono">1 Jadwal</p>
                </div>
              </div>

              {/* Telemetry 3: Unpaid Retribution */}
              <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[#E3ECE8] text-[#0F2E26] flex items-center justify-center shrink-0">
                  <Receipt className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#52635B]">Retribusi Terbit</p>
                  <p className="text-base font-bold text-[#0F2E26] tabular-nums font-mono">Rp 5.450.000</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. DUAL-PANE OPERATIONAL WORKSPACE                       */}
      {/* ========================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ======================================================= */}
          {/* LEFT COLUMN: LIVE VESSEL CLEARANCE DECK (68% / 8 Cols) */}
          {/* ======================================================= */}
          <div className="lg:col-span-8 space-y-4">
            {/* Filter and Command Strip */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
                    filterStatus === "all"
                      ? "bg-[#0F2E26] text-white"
                      : "text-[#52635B] hover:bg-[#F8F9FA]"
                  }`}
                >
                  Semua Armada ({vessels.length})
                </button>
                <button
                  onClick={() => setFilterStatus("pending")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    filterStatus === "pending"
                      ? "bg-[#D97706] text-white font-bold"
                      : "text-[#B45309] bg-[#FEF3C7]/60 hover:bg-[#FEF3C7]"
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>Perlu Tindakan (1)</span>
                </button>
                <button
                  onClick={() => setFilterStatus("active")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
                    filterStatus === "active"
                      ? "bg-[#0F2E26] text-white"
                      : "text-[#52635B] hover:bg-[#F8F9FA]"
                  }`}
                >
                  Sandar Aktif
                </button>
              </div>

              {/* Quick Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#52635B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari kapal / dermaga..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-[#F8F9FA] border border-[#E5E7EB] rounded w-full sm:w-48 focus:ring-1 focus:ring-[#0F2E26] focus:border-[#0F2E26] focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            {/* Vessel Operations List Deck */}
            <div className="space-y-3">
              {filteredVessels.map((vessel) => {
                const isPending = vessel.status === "pending_manifest";
                const isActive = vessel.status === "active";

                return (
                  <article
                    key={vessel.id}
                    className={`bg-white rounded-lg border transition-all ${
                      isPending
                        ? "border-[#D97706]/70 shadow-xs ring-1 ring-[#D97706]/20"
                        : "border-[#E5E7EB] hover:border-[#CBD5E1]"
                    }`}
                  >
                    <div className="p-5">
                      {/* Top Header of the Vessel Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#F1F3F5] gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded flex items-center justify-center font-bold text-sm ${
                              isPending
                                ? "bg-[#FEF3C7] text-[#B45309]"
                                : isActive
                                ? "bg-[#E3ECE8] text-[#0F2E26]"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            <Ship className="w-5 h-5 stroke-[1.8]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-base font-bold text-[#0F2E26]">{vessel.name}</h2>
                              <span className="text-[11px] font-mono text-[#52635B] px-1.5 py-0.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded">
                                {vessel.callSign}
                              </span>
                            </div>
                            <p className="text-xs text-[#52635B]">
                              {vessel.type} • <span className="font-mono">{vessel.gt}</span>
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold bg-[#FEF3C7] text-[#B45309] border border-[#D97706]/30">
                              <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
                              <span>Wajib Manifes Segera</span>
                            </span>
                          )}
                          {isActive && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-[#E3ECE8] text-[#0F2E26] border border-[#2B7A67]/30">
                              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                              <span>Sandar Aktif</span>
                            </span>
                          )}
                          {vessel.status === "cleared" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{vessel.statusLabel}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle Grid: Operational Telemetry */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs">
                        <div>
                          <p className="text-[#52635B] font-medium">Alokasi Dermaga</p>
                          <p className="text-[#0F2E26] font-bold mt-0.5">{vessel.dock}</p>
                        </div>

                        <div>
                          <p className="text-[#52635B] font-medium">Jadwal Tiba (ETA)</p>
                          <p className="text-[#0F2E26] font-bold font-mono mt-0.5">{vessel.eta}</p>
                        </div>

                        <div>
                          <p className="text-[#52635B] font-medium">Jadwal Berangkat (ETD)</p>
                          <p className="text-[#0F2E26] font-bold font-mono mt-0.5">{vessel.etd}</p>
                        </div>

                        <div>
                          <p className="text-[#52635B] font-medium">Nakhoda Bertugas</p>
                          <p className="text-[#0F2E26] font-bold mt-0.5 truncate">{vessel.assignedCaptain}</p>
                        </div>
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="pt-3 border-t border-[#F1F3F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-4 text-xs text-[#52635B]">
                          <span>
                            Estimasi Muatan: <strong className="text-[#0F2E26] font-mono">{vessel.passengersEstimate} Pax</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Kendaraan: <strong className="text-[#0F2E26] font-mono">{vessel.vehiclesEstimate} Unit</strong>
                          </span>
                        </div>

                        {/* Contextual Action Button */}
                        <div>
                          {isPending ? (
                            <button
                              onClick={() => handleOpenDrawer(vessel)}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded text-xs font-bold bg-[#D97706] hover:bg-[#B45309] text-white shadow-xs transition-all cursor-pointer focus:ring-2 focus:ring-[#D97706]/40 focus:outline-none"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Lengkapi & Kirim Manifes</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => alert(`Membuka rincian operasional untuk ${vessel.name}`)}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold text-[#0F2E26] bg-[#F8F9FA] hover:bg-[#E3ECE8] border border-[#CBD5E1] transition-colors cursor-pointer"
                            >
                              <span>Rincian Pelayanan</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* ======================================================= */}
          {/* RIGHT COLUMN: FINANCIAL & HARBOR MASTER PANEL (32%)     */}
          {/* ======================================================= */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Panel 1: Billing Retribusi Terpadu (PP No. 35/2023) */}
            <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-xs overflow-hidden">
              <div className="p-4 bg-[#0F2E26] text-white border-b border-[#1A453A] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#D97706]" />
                  <h3 className="text-xs font-bold tracking-wide uppercase">Kewajiban Retribusi Daerah</h3>
                </div>
                <span className="text-[10px] text-[#E3ECE8] font-mono">PP 35/2023</span>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#F1F3F5]">
                    <span className="text-[#52635B]">Jasa Labuh & Tambat (Dermaga 1)</span>
                    <span className="font-mono font-semibold text-[#0F2E26]">Rp 3.200.000</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F1F3F5]">
                    <span className="text-[#52635B]">Pas Masuk Penumpang Pemda</span>
                    <span className="font-mono font-semibold text-[#0F2E26]">Rp 1.650.000</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F1F3F5]">
                    <span className="text-[#52635B]">Jasa Kebersihan & Pengamanan</span>
                    <span className="font-mono font-semibold text-[#0F2E26]">Rp 600.000</span>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="pt-2 flex items-baseline justify-between">
                  <span className="text-xs font-bold text-[#0F2E26]">Total Tagihan e-SKRD</span>
                  <span className="text-lg font-extrabold text-[#D97706] font-mono">Rp 5.450.000</span>
                </div>

                <div className="text-[11px] text-[#52635B] leading-relaxed bg-[#F8F9FA] p-3 rounded border border-[#E5E7EB]">
                  Batas waktu penyetoran kas daerah: <strong className="text-[#0F2E26]">16 Nov, 17:00 WIB</strong>.
                  Keterlambatan dapat menunda izin clearance keberangkatan (SPB).
                </div>

                <button
                  onClick={() => alert("Membuka instruksi pembayaran Virtual Account Bank BUMD & QRIS Kas Daerah")}
                  className="w-full py-2.5 px-4 rounded text-xs font-bold bg-[#0F2E26] hover:bg-[#174338] text-white shadow-xs transition-colors cursor-pointer focus:ring-2 focus:ring-[#D97706]/50 focus:outline-none flex items-center justify-center gap-2"
                >
                  <Receipt className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Bayar e-SKRD Sekarang</span>
                </button>
              </div>
            </div>

            {/* Panel 2: Syahbandar & Terminal Advisory */}
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F2E26] pb-2 border-b border-[#F1F3F5]">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Instruksi Keselamatan Syahbandar</span>
              </div>

              <div className="space-y-2 text-xs leading-relaxed text-[#52635B]">
                <p>
                  <strong>1. Ambang Batas SOLAS:</strong> Kapal feri penyeberangan dilarang keras mengangkut
                  kendaraan logistik melebihi kapasitas tonase tertera pada sertifikat garis muat.
                </p>
                <p>
                  <strong>2. Prosedur Manifes Digital:</strong> Seluruh berkas PDF manifes wajib menyertakan
                  stempel basah/elektronik nakhoda sebelum diverifikasi petugas UPT.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-[#52635B] border-t border-[#F1F3F5]">
                <span>Pusat Bantuan UPT Wilayah I</span>
                <span className="font-mono text-[#0F2E26] font-semibold">Ext: 104 / 108</span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* ========================================================= */}
      {/* 4. SLIDE-OVER DRAWER: "ISI MANIFES" (NEW AESTHETIC)       */}
      {/* ========================================================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            onClick={handleCloseDrawer}
            className="fixed inset-0 bg-[#0A1C17]/60 backdrop-blur-xs transition-opacity duration-200"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col justify-between transform transition-transform duration-200 ease-in-out border-l border-[#E5E7EB]">
              {/* Drawer Header */}
              <div className="p-6 bg-[#0F2E26] text-white flex items-start justify-between border-b border-[#1A453A]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#D97706] text-[#0F2E26] flex items-center justify-center font-bold">
                      <FileCheck2 className="w-3.5 h-3.5" />
                    </span>
                    <h2 className="text-base font-bold text-white tracking-wide">
                      Pengajuan Manifes Muatan (SOLAS)
                    </h2>
                  </div>
                  <p className="text-xs text-[#E3ECE8]/80 mt-1 font-mono">
                    Armada: <strong className="text-white">{selectedVessel?.name}</strong> •{" "}
                    {selectedVessel?.dock} (Jadwal: {selectedVessel?.etd})
                  </p>
                </div>

                <button
                  onClick={handleCloseDrawer}
                  className="p-1 rounded text-[#E3ECE8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body Form */}
              <form
                id="manifest-submission-form"
                onSubmit={handleManifestSubmit}
                className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#1E2922]"
              >
                {/* Security Guarantee Box */}
                <div className="bg-[#F1F6F4] border border-[#2B7A67]/30 rounded-lg p-4 flex gap-3 text-xs leading-relaxed text-[#0F2E26]">
                  <Lock className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-sm mb-0.5">
                      Enkripsi End-to-End Dokumen Muatan
                    </span>
                    Berdasarkan UU Pelayaran & Standar SOLAS, manifes ini hanya dapat diakses oleh
                    Otoritas UPT Syahbandar untuk penerbitan Surat Persetujuan Berlayar (SPB) dan perhitungan
                    retribusi kas daerah.
                  </div>
                </div>

                {/* Section 1: Passenger Headcount */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#E5E7EB]">
                    <span className="font-bold uppercase tracking-wider text-[#0F2E26]">
                      1. Muatan Penumpang & Pas Masuk
                    </span>
                    <span className="text-[11px] text-[#52635B]">
                      Subtotal Pas: <strong className="text-[#0F2E26] font-mono">Rp {totalPasPenumpang.toLocaleString("id-ID")}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-[#52635B] mb-1">
                        Penumpang Dewasa (@ Rp 10.000)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={adultPax}
                        onChange={(e) => setAdultPax(parseInt(e.target.value) || 0)}
                        className="w-full px-3.5 py-2 text-sm bg-[#F8F9FA] border border-[#CBD5E1] rounded focus:ring-1 focus:ring-[#0F2E26] focus:border-[#0F2E26] focus:bg-white outline-none font-mono font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-[#52635B] mb-1">
                        Penumpang Anak/Bayi (@ Rp 5.000)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={childPax}
                        onChange={(e) => setChildPax(parseInt(e.target.value) || 0)}
                        className="w-full px-3.5 py-2 text-sm bg-[#F8F9FA] border border-[#CBD5E1] rounded focus:ring-1 focus:ring-[#0F2E26] focus:border-[#0F2E26] focus:bg-white outline-none font-mono font-bold"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Vehicle Manifest Count */}
                <div className="space-y-3">
                  <div className="pb-1.5 border-b border-[#E5E7EB]">
                    <span className="font-bold uppercase tracking-wider text-[#0F2E26]">
                      2. Komposisi Kendaraan di Geladak
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-[#52635B] mb-1">
                        Mobil Golongan IVA (&lt; 5 Meter)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={vehicle4A}
                        onChange={(e) => setVehicle4A(parseInt(e.target.value) || 0)}
                        className="w-full px-3.5 py-2 text-sm bg-[#F8F9FA] border border-[#CBD5E1] rounded focus:ring-1 focus:ring-[#0F2E26] focus:border-[#0F2E26] focus:bg-white outline-none font-mono font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-[#52635B] mb-1">
                        Truk Sedang Golongan V (&lt; 7 Meter)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={vehicle5}
                        onChange={(e) => setVehicle5(parseInt(e.target.value) || 0)}
                        className="w-full px-3.5 py-2 text-sm bg-[#F8F9FA] border border-[#CBD5E1] rounded focus:ring-1 focus:ring-[#0F2E26] focus:border-[#0F2E26] focus:bg-white outline-none font-mono font-bold"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Official PDF Manifest Attachment */}
                <div className="space-y-3">
                  <div className="pb-1.5 border-b border-[#E5E7EB]">
                    <span className="font-bold uppercase tracking-wider text-[#0F2E26]">
                      3. Lampiran Berkas Manifes Resmi
                    </span>
                  </div>

                  {/* Drag and Drop Box */}
                  <div
                    onClick={() => {
                      if (!attachedFile) {
                        setAttachedFile({
                          name: "Manifest_KMP_Mutiara_16Nov2026.pdf",
                          size: "2.4 MB",
                          hash: "SHA256: 8f4a...9b12",
                        });
                      }
                    }}
                    className="border-2 border-dashed border-[#CBD5E1] hover:border-[#D97706] bg-[#F8F9FA] hover:bg-[#FEF3C7]/20 rounded-lg p-5 text-center transition-colors cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded bg-white border border-[#E5E7EB] mx-auto flex items-center justify-center text-[#0F2E26] group-hover:text-[#D97706] transition-colors">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-[#0F2E26] mt-2">
                      Tarik & Lepas dokumen Manifes Resmi (PDF) di sini
                    </p>
                    <p className="text-[11px] text-[#52635B] mt-0.5">
                      Ukuran berkas maks. 10 MB. Wajib dibubuhi stempel & tanda tangan Nakhoda.
                    </p>
                  </div>

                  {/* Simulated Attached Card */}
                  {attachedFile ? (
                    <div className="bg-white rounded-lg border border-[#E5E7EB] p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-[#FEF3C7] text-[#B45309] font-bold text-xs flex items-center justify-center">
                          PDF
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#0F2E26]">{attachedFile.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-[#52635B] font-mono mt-0.5">
                            <span>{attachedFile.size}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold">{attachedFile.hash}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setAttachedFile(null)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Hapus berkas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-[#B45309] bg-[#FEF3C7]/50 border border-[#D97706]/40 p-2.5 rounded flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Belum ada dokumen PDF terunggah. Silakan klik area di atas.</span>
                    </div>
                  )}
                </div>
              </form>

              {/* Drawer Footer */}
              <div className="p-4 bg-[#F8F9FA] border-t border-[#E5E7EB] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="px-4 py-2 text-xs font-semibold text-[#52635B] hover:bg-[#E5E7EB] rounded transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="manifest-submission-form"
                  className="px-5 py-2 rounded text-xs font-bold bg-[#0F2E26] hover:bg-[#174338] text-white shadow-xs transition-all cursor-pointer flex items-center gap-2 focus:ring-2 focus:ring-[#D97706]/50 focus:outline-none"
                >
                  <Lock className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Kirim ke UPT & Kunci Manifes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. INTERACTIVE NOTIFICATION TOAST                        */}
      {/* ========================================================= */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F2E26] text-white text-xs px-5 py-3.5 rounded-lg shadow-2xl flex items-center gap-3 border border-[#2B7A67]/50 animate-fade-in">
          <div className="w-6 h-6 rounded bg-[#D97706] text-[#0F2E26] flex items-center justify-center font-bold">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <div>
            <span className="font-bold block text-sm">Dokumen Terkirim</span>
            <span className="text-[#E3ECE8]">{notification}</span>
          </div>
        </div>
      )}
    </div>
  );
}
