"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
  Droplet,
  Clock,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Download,
  AlertCircle,
  Activity,
  ChevronRight,
  Upload,
  Camera,
  AlertTriangle,
  FileCheck2,
  Check,
  X,
  SlidersHorizontal,
  Gauge,
  HelpCircle,
  Sparkles,
  Info,
} from "lucide-react";

// =========================================================================
// TYPES & MOCK DATA (PP 35/2023 & SK TARIF UTILITAS PELABUHAN)
// =========================================================================

interface MonthlyUtilityLog {
  monthKey: string;
  monthLabel: string;
  elecStart: number;
  elecEnd: number;
  elecUsage: number;
  elecCost: number;
  waterStart: number;
  waterEnd: number;
  waterUsage: number;
  waterCost: number;
  totalCost: number;
  status: "LUNAS_SKRD" | "MENUNGGU_TAGIHAN" | "DIPERIKSA_UPTD";
  skrdNumber: string;
  hasPhotoProof: boolean;
}

const UTILITY_HISTORY: MonthlyUtilityLog[] = [
  {
    monthKey: "2026-11",
    monthLabel: "November 2026 (Sedang Berjalan)",
    elecStart: 14820,
    elecEnd: 15160,
    elecUsage: 340,
    elecCost: 490960,
    waterStart: 412,
    waterEnd: 426,
    waterUsage: 14,
    waterCost: 119000,
    totalCost: 609960,
    status: "MENUNGGU_TAGIHAN",
    skrdNumber: "Draft SKRD Des 2026",
    hasPhotoProof: true,
  },
  {
    monthKey: "2026-10",
    monthLabel: "Oktober 2026",
    elecStart: 14490,
    elecEnd: 14820,
    elecUsage: 330,
    elecCost: 476520,
    waterStart: 399,
    waterEnd: 412,
    waterUsage: 13,
    waterCost: 110500,
    totalCost: 587020,
    status: "LUNAS_SKRD",
    skrdNumber: "SKRD-AST/2026/0482",
    hasPhotoProof: true,
  },
  {
    monthKey: "2026-09",
    monthLabel: "September 2026",
    elecStart: 14145,
    elecEnd: 14490,
    elecUsage: 345,
    elecCost: 498180,
    waterStart: 384,
    waterEnd: 399,
    waterUsage: 15,
    waterCost: 127500,
    totalCost: 625680,
    status: "LUNAS_SKRD",
    skrdNumber: "SKRD-AST/2026/0431",
    hasPhotoProof: true,
  },
  {
    monthKey: "2026-08",
    monthLabel: "Agustus 2026",
    elecStart: 13835,
    elecEnd: 14145,
    elecUsage: 310,
    elecCost: 447640,
    waterStart: 372,
    waterEnd: 384,
    waterUsage: 12,
    waterCost: 102000,
    totalCost: 549640,
    status: "LUNAS_SKRD",
    skrdNumber: "SKRD-AST/2026/0388",
    hasPhotoProof: true,
  },
];

export default function TenantUtilitasPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "report" | "dispute">("overview");

  // Tariffs
  const ELEC_RATE_PER_KWH = 1444; // Golongan B-1 PLN Pelabuhan
  const WATER_RATE_PER_M3 = 8500; // PDAM / Suplai Pelabuhan

  // Self Report States
  const [reportElecEnd, setReportElecEnd] = useState<number>(15210);
  const [reportWaterEnd, setReportWaterEnd] = useState<number>(429);
  const [reportDate, setReportDate] = useState<string>("2026-11-16");
  const [reportPhotoUploaded, setReportPhotoUploaded] = useState<boolean>(true);
  const [reportSuccessModal, setReportSuccessModal] = useState<boolean>(false);

  // Dispute States
  const [disputeType, setDisputeType] = useState<"LISTRIK" | "AIR" | "AKURASI_METER">("AIR");
  const [disputeNotes, setDisputeNotes] = useState<string>(
    "Indikasi kebocoran pipa air bersih di belakang dinding kios Blok A-04, angka meter berputar lambat saat kran tertutup."
  );
  const [disputeSuccessModal, setDisputeSuccessModal] = useState<boolean>(false);

  // Format IDR
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Calculations for Self Report
  const lastElecEnd = UTILITY_HISTORY[0].elecEnd;
  const lastWaterEnd = UTILITY_HISTORY[0].waterEnd;
  const newElecUsage = Math.max(0, reportElecEnd - lastElecEnd);
  const newWaterUsage = Math.max(0, reportWaterEnd - lastWaterEnd);
  const estNewCost = newElecUsage * ELEC_RATE_PER_KWH + newWaterUsage * WATER_RATE_PER_M3;

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSuccessModal(true);
  };

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDisputeSuccessModal(true);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP BANNER & STATS                                                     */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-[#0B241E]">
                Pencatatan & Rekonsiliasi Utilitas Mandiri (Listrik & Air)
              </h2>
              <span className="text-[10px] font-mono bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                Meteran Terkalibrasi UPTD
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5 max-w-2xl">
              Unit: <strong>Kios Komersial Blok A-04 Terminal Penumpang</strong> • Tarif dasar listrik PLN & air bersih PDAM sesuai ketentuan retribusi daerah.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("dispute")}
            className="px-3.5 py-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Pengaduan Anomali Meter</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("report")}
            className="px-4 py-2 bg-[#0B241E] hover:bg-[#143E33] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Camera className="w-4 h-4 text-[#D97706]" />
            <span>Lapor Foto Meter Mandiri</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUB-NAVIGATION TABS                                                    */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "overview"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0B241E] hover:bg-white"
          }`}
        >
          <Activity className="w-4 h-4 text-[#D97706]" />
          <span>1. Monitoring & Riwayat Pemakaian Bulanan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("report")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "report"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0B241E] hover:bg-white"
          }`}
        >
          <Camera className="w-4 h-4 text-[#D97706]" />
          <span>2. Lapor Angka Meter Mandiri (Self Capture)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("dispute")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "dispute"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0B241E] hover:bg-white"
          }`}
        >
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>3. Sanggahan & Tiket Kalibrasi Teknisi UPTD</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & MONTHLY USAGE HISTORY                                   */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Dual Current Month Meter Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Listrik kWh */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <Zap className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0B241E]">Meteran Listrik PLN Kios</h3>
                    <p className="text-[11px] text-[#64748B] font-mono">No. Meter: 5210-9844-0129 (2.200 VA)</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  Rp 1.444 / kWh
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[#64748B] text-[10px]">Meter Awal</span>
                  <p className="font-mono font-extrabold text-[#0B241E] text-sm mt-0.5">14.820</p>
                </div>
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[#64748B] text-[10px]">Meter Akhir</span>
                  <p className="font-mono font-extrabold text-[#0B241E] text-sm mt-0.5">15.160</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-amber-800 font-bold text-[10px]">Konsumsi Bulan Ini</span>
                  <p className="font-mono font-extrabold text-amber-900 text-sm mt-0.5">340 kWh</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1 border-t border-[#F1F5F9]">
                <div>
                  <span className="text-[#64748B]">Subtotal Retribusi Listrik:</span>
                  <p className="font-mono font-extrabold text-base text-[#0B241E]">{formatRupiah(490960)}</p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Konsumsi Normal
                </span>
              </div>
            </div>

            {/* Air Bersih m3 */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Droplet className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0B241E]">Meteran Air Bersih PDAM</h3>
                    <p className="text-[11px] text-[#64748B] font-mono">No. Water Meter: WM-MRK-044</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  Rp 8.500 / m³
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[#64748B] text-[10px]">Meter Awal</span>
                  <p className="font-mono font-extrabold text-[#0B241E] text-sm mt-0.5">412 m³</p>
                </div>
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[#64748B] text-[10px]">Meter Akhir</span>
                  <p className="font-mono font-extrabold text-[#0B241E] text-sm mt-0.5">426 m³</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="text-blue-800 font-bold text-[10px]">Konsumsi Bulan Ini</span>
                  <p className="font-mono font-extrabold text-blue-900 text-sm mt-0.5">14 m³</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1 border-t border-[#F1F5F9]">
                <div>
                  <span className="text-[#64748B]">Subtotal Retribusi Air:</span>
                  <p className="font-mono font-extrabold text-base text-[#0B241E]">{formatRupiah(119000)}</p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Konsumsi Normal
                </span>
              </div>
            </div>
          </div>

          {/* Historical Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs space-y-4">
            <div className="p-4 border-b border-[#E2E8F0] bg-[#FAFCFB] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#0B241E]">
                  Riwayat Pembacaan Meter & Tagihan Utilitas (4 Bulan Terakhir)
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Pencatatan angka meter awal-akhir, verifikasi foto fisik display, dan integrasi penagihan e-SKRD
                </p>
              </div>

              <button
                type="button"
                onClick={() => alert("Mengekspor riwayat pembacaan meter utilitas ke CSV.")}
                className="px-3.5 py-1.5 text-xs font-bold text-[#0B241E] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-lg inline-flex items-center gap-1.5 cursor-pointer border border-[#CBD5E1]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    <th className="py-3 px-4">Bulan Periode</th>
                    <th className="py-3 px-4 text-center">Listrik (kWh)</th>
                    <th className="py-3 px-4 text-right">Biaya Listrik</th>
                    <th className="py-3 px-4 text-center">Air (m³)</th>
                    <th className="py-3 px-4 text-right">Biaya Air</th>
                    <th className="py-3 px-4 text-right">Total Utilitas</th>
                    <th className="py-3 px-4">No. SKRD</th>
                    <th className="py-3 px-4 text-center">Bukti Foto</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {UTILITY_HISTORY.map((log) => (
                    <tr key={log.monthKey} className="hover:bg-[#F8FAFC]/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#0B241E]">
                        {log.monthLabel}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[#0B241E]">
                        {log.elecUsage} kWh
                        <div className="text-[10px] text-[#94A3B8] font-normal">
                          {log.elecStart} → {log.elecEnd}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#0B241E]">
                        {formatRupiah(log.elecCost)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[#0B241E]">
                        {log.waterUsage} m³
                        <div className="text-[10px] text-[#94A3B8] font-normal">
                          {log.waterStart} → {log.waterEnd}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#0B241E]">
                        {formatRupiah(log.waterCost)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-extrabold text-emerald-800">
                        {formatRupiah(log.totalCost)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B]">
                        {log.skrdNumber}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Check className="w-3 h-3" /> Terverifikasi
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {log.status === "LUNAS_SKRD" ? (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Lunas SKRD
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            Menunggu SKRD
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LAPOR ANGKA METER MANDIRI (SELF-SERVICE CAPTURE)                   */}
      {/* ========================================================================= */}
      {activeTab === "report" && (
        <form onSubmit={handleReportSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-5">
            <div className="pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#D97706]" />
                <h3 className="text-sm font-extrabold text-[#0B241E]">
                  Pelaporan Mandiri Angka Meteran Akhir Bulan
                </h3>
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                Kirimkan foto dan angka meteran fisik kios Anda untuk divalidasi oleh petugas pencatat meteran UPTD Pelabuhan sebelum SKRD diterbitkan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#0B241E] mb-1">
                  Tanggal Pengambilan Foto Meter:
                </label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0B241E] font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0B241E] mb-1">
                  Lokasi Unit Kios:
                </label>
                <input
                  type="text"
                  value="Kios Komersial Blok A-04 (Terminal Penumpang)"
                  disabled
                  className="w-full p-2.5 bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg text-[#64748B] font-bold"
                />
              </div>
            </div>

            {/* Inputs Meter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-[#F1F5F9]">
              {/* Listrik */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1">
                    <Zap className="w-4 h-4 text-amber-700" /> Meteran Listrik PLN
                  </span>
                  <span className="font-mono text-[10px] text-amber-800 font-bold">Awal: {lastElecEnd}</span>
                </div>
                <div>
                  <label className="block text-[11px] text-[#64748B] mb-1">
                    Masukkan Angka Stand Meter Terkini (kWh):
                  </label>
                  <input
                    type="number"
                    value={reportElecEnd}
                    onChange={(e) => setReportElecEnd(Number(e.target.value))}
                    min={lastElecEnd}
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg text-right font-mono font-extrabold text-[#0B241E] text-base"
                  />
                </div>
                <div className="flex justify-between text-[11px] pt-1">
                  <span className="text-[#64748B]">Pemakaian Dihitung:</span>
                  <strong className="text-amber-900 font-mono">{newElecUsage} kWh</strong>
                </div>
              </div>

              {/* Air */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 flex items-center gap-1">
                    <Droplet className="w-4 h-4 text-blue-700" /> Meteran Air PDAM
                  </span>
                  <span className="font-mono text-[10px] text-blue-800 font-bold">Awal: {lastWaterEnd}</span>
                </div>
                <div>
                  <label className="block text-[11px] text-[#64748B] mb-1">
                    Masukkan Angka Stand Meter Terkini (m³):
                  </label>
                  <input
                    type="number"
                    value={reportWaterEnd}
                    onChange={(e) => setReportWaterEnd(Number(e.target.value))}
                    min={lastWaterEnd}
                    className="w-full p-2 bg-white border border-blue-300 rounded-lg text-right font-mono font-extrabold text-[#0B241E] text-base"
                  />
                </div>
                <div className="flex justify-between text-[11px] pt-1">
                  <span className="text-[#64748B]">Pemakaian Dihitung:</span>
                  <strong className="text-blue-900 font-mono">{newWaterUsage} m³</strong>
                </div>
              </div>
            </div>

            {/* Photo Upload Box */}
            <div className="space-y-2 pt-2 border-t border-[#F1F5F9]">
              <label className="block text-xs font-bold text-[#0B241E]">
                Unggah Foto Fisik Display Meteran (Wajib Lampirkan):
              </label>
              <div className="p-4 border-2 border-dashed border-[#CBD5E1] rounded-xl text-center bg-[#FAFAFA] hover:bg-[#F1F5F9] transition-colors cursor-pointer">
                <Camera className="w-8 h-8 text-[#64748B] mx-auto mb-1" />
                <p className="text-xs font-bold text-[#0B241E]">
                  {reportPhotoUploaded ? "Foto Fisik Meteran Terlampir: FOTO_METER_NOV2026.JPG" : "Klik untuk ambil foto / upload berkas"}
                </p>
                <p className="text-[10px] text-[#64748B]">
                  Pastikan angka digit meter terlihat jelas dan tidak buram untuk validasi petugas.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0B241E] hover:bg-[#143E33] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
              <span>Kirim Laporan Catat Meter Mandiri</span>
            </button>
          </div>

          {/* Right Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4 text-xs">
              <h4 className="font-extrabold text-[#0B241E] uppercase text-[11px] pb-2 border-b border-[#F1F5F9]">
                Estimasi Retribusi Utilitas Tambahan
              </h4>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Tambahan Listrik ({newElecUsage} kWh):</span>
                  <span className="font-mono text-[#0B241E] font-bold">{formatRupiah(newElecUsage * ELEC_RATE_PER_KWH)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Tambahan Air ({newWaterUsage} m³):</span>
                  <span className="font-mono text-[#0B241E] font-bold">{formatRupiah(newWaterUsage * WATER_RATE_PER_M3)}</span>
                </div>
                <div className="border-t border-[#E2E8F0] pt-2 flex justify-between items-center">
                  <span className="font-extrabold text-[#0B241E]">Subtotal Utilitas Baru:</span>
                  <strong className="text-base font-extrabold text-emerald-800 font-mono">
                    {formatRupiah(estNewCost)}
                  </strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Prosedur Validasi:
                </p>
                <p>
                  Data laporan mandiri ini akan dicocokkan dengan catatan survei bulanan petugas UPTD sebelum digabung ke dalam SKRD sewa bulan berikutnya.
                </p>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TIKET SANGGAHAN & KALIBRASI TEKNISI UPTD                           */}
      {/* ========================================================================= */}
      {activeTab === "dispute" && (
        <form onSubmit={handleDisputeSubmit} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-5 max-w-2xl">
          <div className="pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-extrabold text-[#0B241E]">
                Formulir Pengaduan Anomali & Permohonan Kalibrasi Meteran
              </h3>
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Gunakan formulir ini apabila Anda mendeteksi kebocoran pipa, korsleting meteran, atau lonjakan angka meter yang tidak wajar.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#0B241E] mb-1">
                Pilih Jenis Masalah Utilitas:
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { label: "Pipa Air / Kebocoran", key: "AIR" },
                  { label: "Meteran Listrik Korslet", key: "LISTRIK" },
                  { label: "Uji Tera / Kalibrasi", key: "AKURASI_METER" },
                ].map((type) => (
                  <button
                    key={type.key}
                    type="button"
                    onClick={() => setDisputeType(type.key as any)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                      disputeType === type.key
                        ? "bg-[#0B241E] text-white border-[#0B241E]"
                        : "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:bg-[#F1F5F9]"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#0B241E] mb-1">
                Uraian Kronologi / Gejala Kerusakan:
              </label>
              <textarea
                value={disputeNotes}
                onChange={(e) => setDisputeNotes(e.target.value)}
                rows={3}
                required
                className="w-full p-2.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0B241E] focus:outline-none focus:border-[#0B241E]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Kirim Tiket Pengaduan ke Teknisi Lapangan UPTD</span>
          </button>
        </form>
      )}

      {/* Modal Sukses Report */}
      {reportSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#CBD5E1] space-y-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-extrabold text-sm text-[#0B241E]">Laporan Catat Meter Diterima!</h3>
            <p className="text-xs text-[#64748B]">
              Data angka meter listrik ({reportElecEnd} kWh) dan air ({reportWaterEnd} m³) telah diteruskan ke Petugas Pencatat UPTD untuk verifikasi.
            </p>
            <button
              type="button"
              onClick={() => {
                setReportSuccessModal(false);
                setActiveTab("overview");
              }}
              className="w-full py-2 bg-[#0B241E] text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Kembali ke Ringkasan Utilitas
            </button>
          </div>
        </div>
      )}

      {/* Modal Sukses Dispute */}
      {disputeSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#CBD5E1] space-y-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-extrabold text-sm text-[#0B241E]">Tiket Kalibrasi Terdaftar!</h3>
            <p className="text-xs text-[#64748B]">
              Nomor Tiket: <strong className="font-mono text-[#0B241E]">TCK-UTIL-2026-004</strong>. Teknisi UPTD akan melakukan pemeriksaan fisik dalam 1x24 jam kerja.
            </p>
            <button
              type="button"
              onClick={() => {
                setDisputeSuccessModal(false);
                setActiveTab("overview");
              }}
              className="w-full py-2 bg-[#0B241E] text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
