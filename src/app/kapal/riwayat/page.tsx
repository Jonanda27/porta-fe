"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Ship,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Download,
  Printer,
  ChevronRight,
  Eye,
  ExternalLink,
  Droplets,
  Zap,
  Anchor,
  TrendingUp,
  Receipt,
  X,
  Building2,
  ShieldCheck,
  Check,
} from "lucide-react";

interface ShipCallRecord {
  id: string; // Call ID
  vesselName: string;
  callSign: string;
  gt: number;
  dock: string;
  dockType: "Reguler" | "Eksekutif";
  route: string;
  captain: string;
  scheduledEta: string;
  scheduledEtd: string;
  ata: string; // Actual Time of Arrival
  atb: string; // Actual Time of Berthing
  atd: string; // Actual Time of Departure
  dwellTimeMinutes: number;
  otpStatus: "on_time" | "slight_delay" | "delayed";
  otpLabel: string;
  waterConsumedM3: number;
  powerConsumedKwh: number;
  paxTotal: number;
  vehicleTotal: number;
  skrdNumber: string;
  paymentStatus: "paid" | "unpaid";
  officerName: string;
  notes: string;
}

const INITIAL_CALL_HISTORY: ShipCallRecord[] = [
  {
    id: "CALL-MRK-2026-1048",
    vesselName: "KMP Baruna Jaya",
    callSign: "PK-BJ92",
    gt: 1250,
    dock: "Dermaga 1",
    dockType: "Reguler",
    route: "Merak ➔ Bakauheni",
    captain: "Capt. Hendra Gunawan",
    scheduledEta: "16 Nov 2026, 08:00 WIB",
    scheduledEtd: "16 Nov 2026, 09:30 WIB",
    ata: "16 Nov 2026, 07:55 WIB",
    atb: "16 Nov 2026, 08:02 WIB",
    atd: "16 Nov 2026, 09:35 WIB",
    dwellTimeMinutes: 93,
    otpStatus: "on_time",
    otpLabel: "Tepat Waktu (OTP 100%)",
    waterConsumedM3: 25,
    powerConsumedKwh: 0,
    paxTotal: 342,
    vehicleTotal: 58,
    skrdNumber: "SKRD-KPL-MRK-2026-0419",
    paymentStatus: "unpaid",
    officerName: "Bripka Agus W. (Supervisor Dermaga 1)",
    notes: "Proses bongkar muat lancar. Cuaca cerah, pasang surut air laut normal 1.4 meter.",
  },
  {
    id: "CALL-MRK-2026-1045",
    vesselName: "KMP Mutiara Persada",
    callSign: "PK-MP44",
    gt: 1800,
    dock: "Dermaga 2",
    dockType: "Reguler",
    route: "Bakauheni ➔ Merak",
    captain: "Capt. Aris Munandar",
    scheduledEta: "15 Nov 2026, 14:00 WIB",
    scheduledEtd: "15 Nov 2026, 15:30 WIB",
    ata: "15 Nov 2026, 14:05 WIB",
    atb: "15 Nov 2026, 14:12 WIB",
    atd: "15 Nov 2026, 15:38 WIB",
    dwellTimeMinutes: 86,
    otpStatus: "on_time",
    otpLabel: "Tepat Waktu",
    waterConsumedM3: 35,
    powerConsumedKwh: 0,
    paxTotal: 480,
    vehicleTotal: 76,
    skrdNumber: "SKRD-KPL-MRK-2026-0398",
    paymentStatus: "paid",
    officerName: "Hadi Purnomo (Pengawas Alur Sif 2)",
    notes: "Air bersih disalurkan melalui hydrant dermaga 2. Meter awal 1.240 m³, meter akhir 1.275 m³.",
  },
  {
    id: "CALL-MRK-2026-1041",
    vesselName: "KMP Nusantara Express",
    callSign: "PK-NE11",
    gt: 2100,
    dock: "Dermaga Eksekutif 1",
    dockType: "Eksekutif",
    route: "Merak ➔ Bakauheni",
    captain: "Capt. Bambang Tri",
    scheduledEta: "15 Nov 2026, 09:30 WIB",
    scheduledEtd: "15 Nov 2026, 11:00 WIB",
    ata: "15 Nov 2026, 09:42 WIB",
    atb: "15 Nov 2026, 09:50 WIB",
    atd: "15 Nov 2026, 11:15 WIB",
    dwellTimeMinutes: 85,
    otpStatus: "slight_delay",
    otpLabel: "Deviasi 12 Menit (Arus Selat)",
    waterConsumedM3: 0,
    powerConsumedKwh: 120,
    paxTotal: 590,
    vehicleTotal: 102,
    skrdNumber: "SKRD-KPL-MRK-2026-0382",
    paymentStatus: "paid",
    officerName: "Dedi Supriyadi (Petugas Garbarata)",
    notes: "Kapal menggunakan fasilitas shore power darat selama tambat. Kecepatan angin 18 knot.",
  },
  {
    id: "CALL-MRK-2026-1036",
    vesselName: "KMP Portlink III",
    callSign: "PK-PL03",
    gt: 5200,
    dock: "Dermaga Eksekutif 1",
    dockType: "Eksekutif",
    route: "Bakauheni ➔ Merak",
    captain: "Capt. M. Farhan Hidayat",
    scheduledEta: "14 Nov 2026, 19:00 WIB",
    scheduledEtd: "14 Nov 2026, 21:00 WIB",
    ata: "14 Nov 2026, 18:55 WIB",
    atb: "14 Nov 2026, 19:08 WIB",
    atd: "14 Nov 2026, 21:02 WIB",
    dwellTimeMinutes: 114,
    otpStatus: "on_time",
    otpLabel: "Tepat Waktu (Super Ro-Ro)",
    waterConsumedM3: 50,
    powerConsumedKwh: 180,
    paxTotal: 890,
    vehicleTotal: 165,
    skrdNumber: "SKRD-KPL-MRK-2026-0365",
    paymentStatus: "paid",
    officerName: "Capt. Ridwan Hakim (Supervisor Sif 3)",
    notes: "Pengisian air 50 m³ selesai 30 menit sebelum bertolak. Manifes SOLAS lengkap 100%.",
  },
  {
    id: "CALL-MRK-2026-1029",
    vesselName: "KMP Samudra Raya",
    callSign: "PK-SR88",
    gt: 950,
    dock: "Dermaga 3",
    dockType: "Reguler",
    route: "Merak ➔ Bakauheni",
    captain: "Capt. Dedi Mulyadi",
    scheduledEta: "14 Nov 2026, 11:00 WIB",
    scheduledEtd: "14 Nov 2026, 12:30 WIB",
    ata: "14 Nov 2026, 11:28 WIB",
    atb: "14 Nov 2026, 11:35 WIB",
    atd: "14 Nov 2026, 13:00 WIB",
    dwellTimeMinutes: 85,
    otpStatus: "delayed",
    otpLabel: "Terlambat 28m (Antrean Dermaga)",
    waterConsumedM3: 20,
    powerConsumedKwh: 0,
    paxTotal: 260,
    vehicleTotal: 42,
    skrdNumber: "SKRD-KPL-MRK-2026-0348",
    paymentStatus: "paid",
    officerName: "Hadi Purnomo (Pengawas Alur Sif 1)",
    notes: "Menunggu selesainya olah gerak kapal sebelumnya di Dermaga 3. Ramp door beroperasi aman.",
  },
];

export default function KapalRiwayatPage() {
  const [records] = useState<ShipCallRecord[]>(INITIAL_CALL_HISTORY);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedVessel, setSelectedVessel] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDetail, setSelectedDetail] = useState<ShipCallRecord | null>(null);

  // Filter
  const filteredRecords = records.filter((item) => {
    const matchSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vesselName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.skrdNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.captain.toLowerCase().includes(searchQuery.toLowerCase());

    const matchVessel = selectedVessel === "all" || item.vesselName === selectedVessel;
    const matchStatus = selectedStatus === "all" || item.otpStatus === selectedStatus;

    return matchSearch && matchVessel && matchStatus;
  });

  // KPI Calculations
  const totalCalls = records.length;
  const onTimeCalls = records.filter((r) => r.otpStatus === "on_time").length;
  const otpRate = ((onTimeCalls / totalCalls) * 100).toFixed(1);

  const avgDwell = Math.round(
    records.reduce((acc, r) => acc + r.dwellTimeMinutes, 0) / totalCalls
  );

  const totalWater = records.reduce((acc, r) => acc + r.waterConsumedM3, 0);
  const totalPower = records.reduce((acc, r) => acc + r.powerConsumedKwh, 0);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP KPI SUMMARY DECK (Clean elevated card separated from banner)       */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D97706] bg-[#0B241E] px-2.5 py-0.5 rounded">
              LOG KUNJUNGAN REALISASI PELABUHAN
            </span>
            <h2 className="text-base sm:text-lg font-black text-[#0B241E] mt-1">
              Buku Catatan Riwayat Pelayanan Sandar Armada Kapal
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert("Mengekspor laporan realisasi kunjungan kapal bulanan (CSV/Excel)...")}
              className="px-3.5 py-2 bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#0B241E] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#64748B]" />
              <span>Ekspor Log Realisasi</span>
            </button>
            <button
              onClick={() => alert("Mencetak Berita Acara Rekapitulasi Pelayanan Sandar (PDF)...")}
              className="px-3.5 py-2 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#D97706]" />
              <span>Cetak Rekap Bulanan</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Grid Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* KPI 1: Total Kunjungan */}
          <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span className="font-bold uppercase tracking-wider text-[10px]">Total Kunjungan</span>
              <Ship className="w-4 h-4 text-[#0B241E]" />
            </div>
            <p className="text-2xl font-black text-[#0B241E] mt-1 font-mono">{totalCalls} Call</p>
            <span className="text-[10px] text-emerald-700 font-semibold">100% Tercatat ATA/ATD</span>
          </div>

          {/* KPI 2: On-Time Performance (OTP) */}
          <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span className="font-bold uppercase tracking-wider text-[10px]">Ketepatan Jadwal (OTP)</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">{otpRate}%</p>
            <span className="text-[10px] text-[#64748B]">{onTimeCalls} dari {totalCalls} tepat jadwal</span>
          </div>

          {/* KPI 3: Rata-Rata Dwell Time */}
          <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span className="font-bold uppercase tracking-wider text-[10px]">Rata-Rata Dwell Time</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-[#0B241E] mt-1 font-mono">{avgDwell} Menit</p>
            <span className="text-[10px] text-[#64748B]">Waktu tambat efektif</span>
          </div>

          {/* KPI 4: Utilitas Terpakai */}
          <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span className="font-bold uppercase tracking-wider text-[10px]">Utilitas Riil Terpakai</span>
              <Droplets className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div>
                <p className="text-base font-black text-[#0B241E] font-mono">{totalWater} m³</p>
                <span className="text-[9px] text-[#64748B]">Air Tawar</span>
              </div>
              <div className="w-px h-6 bg-[#CBD5E1]" />
              <div>
                <p className="text-base font-black text-[#0B241E] font-mono">{totalPower} kWh</p>
                <span className="text-[9px] text-[#64748B]">Listrik Darat</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FILTER & SEARCH CONTROL BAR                                           */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Cari Call ID, nama kapal, nakhoda, atau nomor e-SKRD..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold pl-9 pr-4 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Vessel Selector */}
          <select
            value={selectedVessel}
            onChange={(e) => setSelectedVessel(e.target.value)}
            className="text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
          >
            <option value="all">Semua Armada Kapal</option>
            <option value="KMP Baruna Jaya">KMP Baruna Jaya (1.250 GT)</option>
            <option value="KMP Mutiara Persada">KMP Mutiara Persada (1.800 GT)</option>
            <option value="KMP Nusantara Express">KMP Nusantara Express (2.100 GT)</option>
            <option value="KMP Portlink III">KMP Portlink III (5.200 GT)</option>
            <option value="KMP Samudra Raya">KMP Samudra Raya (950 GT)</option>
          </select>

          {/* OTP Status Selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
          >
            <option value="all">Semua Status Jadwal</option>
            <option value="on_time">Tepat Waktu (On-Time)</option>
            <option value="slight_delay">Deviasi Kecil (&lt; 15m)</option>
            <option value="delayed">Terlambat (&gt; 15m)</option>
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SHIP CALL HISTORY TABLE                                               */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0B241E] text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">No. Kunjungan / Kapal</th>
                <th className="py-3 px-4">Dermaga & Rute</th>
                <th className="py-3 px-4">Waktu Rencana (ETA/ETD)</th>
                <th className="py-3 px-4">Waktu Aktual (ATA/ATB/ATD)</th>
                <th className="py-3 px-4 text-center">Dwell Time</th>
                <th className="py-3 px-4">Utilitas Riil</th>
                <th className="py-3 px-4">Tagihan e-SKRD</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#64748B]">
                    Tidak ditemukan data riwayat kunjungan yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((call) => (
                  <tr key={call.id} className="hover:bg-[#F8FAFC] transition-colors">
                    {/* Col 1: ID & Kapal */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] font-bold text-[#D97706] bg-[#0B241E] px-2 py-0.5 rounded">
                        {call.id}
                      </span>
                      <p className="font-bold text-[#0B241E] text-xs mt-1">{call.vesselName}</p>
                      <span className="text-[10px] text-[#64748B] font-mono">
                        {call.gt.toLocaleString()} GT • {call.callSign}
                      </span>
                    </td>

                    {/* Col 2: Dermaga & Rute */}
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-[#0B241E] block">{call.dock}</span>
                      <span className="text-[10px] text-[#64748B] block mt-0.5">{call.route}</span>
                      <span className="text-[9px] font-mono bg-slate-100 text-[#475569] px-1.5 py-0.2 rounded inline-block mt-1">
                        {call.dockType}
                      </span>
                    </td>

                    {/* Col 3: Waktu Rencana */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <span className="text-[#64748B] block text-[10px] font-sans uppercase">ETA: {call.scheduledEta}</span>
                      <span className="text-[#64748B] block text-[10px] font-sans uppercase mt-0.5">ETD: {call.scheduledEtd}</span>
                    </td>

                    {/* Col 4: Waktu Aktual (ATA / ATB / ATD) */}
                    <td className="py-3.5 px-4 text-[11px]">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold">ATA</span>
                          <span className="text-[#0B241E]">{call.ata.split(",")[1]}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-[9px] bg-blue-100 text-blue-800 px-1 rounded font-bold">ATB</span>
                          <span className="text-[#0B241E] font-bold">{call.atb.split(",")[1]}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-bold">ATD</span>
                          <span className="text-[#0B241E]">{call.atd.split(",")[1]}</span>
                        </div>
                      </div>
                    </td>

                    {/* Col 5: Dwell Time & OTP Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-extrabold text-[#0B241E] text-xs block">
                        {call.dwellTimeMinutes} Menit
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                          call.otpStatus === "on_time"
                            ? "bg-emerald-100 text-emerald-800"
                            : call.otpStatus === "slight_delay"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {call.otpLabel}
                      </span>
                    </td>

                    {/* Col 6: Utilitas Riil */}
                    <td className="py-3.5 px-4 text-[11px]">
                      {call.waterConsumedM3 > 0 && (
                        <div className="flex items-center gap-1 text-blue-800 font-bold">
                          <Droplets className="w-3.5 h-3.5 text-blue-600" />
                          <span>{call.waterConsumedM3} m³</span>
                        </div>
                      )}
                      {call.powerConsumedKwh > 0 && (
                        <div className="flex items-center gap-1 text-amber-900 font-bold mt-0.5">
                          <Zap className="w-3.5 h-3.5 text-amber-600" />
                          <span>{call.powerConsumedKwh} kWh</span>
                        </div>
                      )}
                      {call.waterConsumedM3 === 0 && call.powerConsumedKwh === 0 && (
                        <span className="text-[#94A3B8] font-mono text-[10px]">-</span>
                      )}
                    </td>

                    {/* Col 7: SKRD & Payment Status */}
                    <td className="py-3.5 px-4 text-xs">
                      <Link
                        href="/kapal/penagihan"
                        className="font-mono text-[11px] text-[#0284C7] hover:underline font-bold block"
                      >
                        {call.skrdNumber}
                      </Link>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                          call.paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800 animate-pulse"
                        }`}
                      >
                        {call.paymentStatus === "paid" ? "LUNAS (SSRD)" : "BELUM BAYAR"}
                      </span>
                    </td>

                    {/* Col 8: Aksi */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedDetail(call)}
                        className="p-1.5 rounded-lg border border-[#CBD5E1] text-[#64748B] hover:text-[#0B241E] hover:bg-slate-100 cursor-pointer"
                        title="Lihat Berita Acara Sandar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL DETAIL BERITA ACARA KUNJUNGAN KAPAL (CALL REALIZATION SHEET)      */}
      {/* ========================================================================= */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 border border-[#CBD5E1] shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-xs">
                  <Ship className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#0B241E]">
                    Berita Acara Realisasi Pelayanan Kapal (Ship Call Log)
                  </h3>
                  <span className="font-mono text-xs text-[#64748B]">{selectedDetail.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0B241E] hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vessel & Master Info */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Nama Armada & GT</span>
                <p className="font-extrabold text-[#0B241E] text-sm mt-0.5">{selectedDetail.vesselName}</p>
                <span className="font-mono text-[#64748B]">{selectedDetail.gt.toLocaleString()} GT • {selectedDetail.callSign}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Nakhoda Penanggung Jawab</span>
                <p className="font-bold text-[#0B241E] mt-0.5">{selectedDetail.captain}</p>
                <span className="text-[#64748B]">Sertifikat Kelaiklautan Lengkap</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Alokasi Dermaga Sandar</span>
                <p className="font-bold text-[#0284C7] mt-0.5">{selectedDetail.dock} ({selectedDetail.dockType})</p>
                <span className="text-[#64748B]">{selectedDetail.route}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Muatan Terangkut (SOLAS)</span>
                <p className="font-bold text-[#0B241E] mt-0.5">{selectedDetail.paxTotal} Penumpang</p>
                <span className="text-[#64748B]">{selectedDetail.vehicleTotal} Kendaraan Campuran</span>
              </div>
            </div>

            {/* Waktu Pelayanan Rinci */}
            <div className="border border-[#CBD5E1] rounded-xl p-4 space-y-3 text-xs">
              <span className="font-bold text-[#0B241E] block">Pencatatan Waktu Aktual Layanan Sandar:</span>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="text-[10px] font-mono text-emerald-800 font-bold block">ATA (Kedatangan)</span>
                  <p className="font-mono font-black text-xs text-[#0B241E] mt-0.5">{selectedDetail.ata}</p>
                </div>
                <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-[10px] font-mono text-blue-800 font-bold block">ATB (Merapat)</span>
                  <p className="font-mono font-black text-xs text-[#0B241E] mt-0.5">{selectedDetail.atb}</p>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-[10px] font-mono text-amber-800 font-bold block">ATD (Bertolak)</span>
                  <p className="font-mono font-black text-xs text-[#0B241E] mt-0.5">{selectedDetail.atd}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E2E8F0]">
                <span className="text-[#64748B]">Durasi Tambat Efektif (Dwell Time):</span>
                <span className="font-mono font-extrabold text-[#0B241E]">{selectedDetail.dwellTimeMinutes} Menit</span>
              </div>
            </div>

            {/* Meteran Utilitas */}
            <div className="border border-[#CBD5E1] rounded-xl p-4 space-y-2 text-xs bg-slate-50">
              <span className="font-bold text-[#0B241E] block">Realisasi Pemakaian Utilitas Dermaga:</span>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B] flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  <span>Bunkering Air Tawar:</span>
                </span>
                <span className="font-mono font-bold text-[#0B241E]">{selectedDetail.waterConsumedM3} m³ (Ton)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B] flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>Listrik Darat Shore Power:</span>
                </span>
                <span className="font-mono font-bold text-[#0B241E]">{selectedDetail.powerConsumedKwh} kWh</span>
              </div>
            </div>

            {/* Officer Notes */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 space-y-1">
              <div className="flex items-center justify-between">
                <strong className="block font-bold">Catatan Pengawas Lapangan UPT Pelabuhan:</strong>
                <span className="font-mono text-[10px] text-[#0284C7]">{selectedDetail.officerName}</span>
              </div>
              <p className="text-[#334155] leading-relaxed">{selectedDetail.notes}</p>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9]">
              <Link
                href="/kapal/penagihan"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <Receipt className="w-4 h-4" />
                <span>Buka Invoice e-SKRD ({selectedDetail.skrdNumber})</span>
              </Link>

              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="px-5 py-2 bg-[#0B241E] text-white text-xs font-bold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
