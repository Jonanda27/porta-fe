"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Ship,
  Calendar,
  FileCheck2,
  CreditCard,
  Anchor,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  FileText,
  Radio,
} from "lucide-react";

export default function KapalDashboardPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const vessels = [
    {
      id: "V-01",
      name: "KMP Baruna Jaya",
      callSign: "PK-BJ92",
      gt: "1.250 GT",
      route: "Merak ➔ Bakauheni",
      eta: "08:00 WIB",
      etd: "09:30 WIB",
      dock: "Dermaga 1",
      status: "active",
      statusLabel: "Sandar Aktif",
      manifestStatus: "submitted",
      manifestLabel: "Manifes Terkirim",
      clearanceStatus: "ready",
      clearanceLabel: "SPB Siap Terbit",
      captain: "Capt. Hendra Gunawan",
    },
    {
      id: "V-02",
      name: "KMP Mutiara Persada",
      callSign: "PK-MP44",
      gt: "1.800 GT",
      route: "Merak ➔ Bakauheni",
      eta: "14:00 WIB",
      etd: "15:30 WIB",
      dock: "Dermaga 2 (Menunggu)",
      status: "scheduled",
      statusLabel: "Jadwal Terverifikasi",
      manifestStatus: "pending",
      manifestLabel: "Wajib Lapor Manifes",
      clearanceStatus: "waiting",
      clearanceLabel: "Menunggu Manifes",
      captain: "Capt. Aris Munandar",
    },
    {
      id: "V-03",
      name: "KMP Nusantara Express",
      callSign: "PK-NE11",
      gt: "2.100 GT",
      route: "Merak ➔ Bakauheni",
      eta: "18:30 WIB",
      etd: "20:00 WIB",
      dock: "Dermaga Eksekutif 1",
      status: "scheduled",
      statusLabel: "Permohonan Disetujui",
      manifestStatus: "pending",
      manifestLabel: "Belum Buka Manifes",
      clearanceStatus: "waiting",
      clearanceLabel: "Belum Diajukan",
      captain: "Capt. Bambang Tri",
    },
    {
      id: "V-04",
      name: "KMP Samudra Raya",
      callSign: "PK-SR88",
      gt: "950 GT",
      route: "Merak ➔ Bakauheni",
      eta: "Kemarin, 21:00 WIB",
      etd: "Kemarin, 22:30 WIB",
      dock: "Dermaga 3",
      status: "completed",
      statusLabel: "Selesai Pelayanan",
      manifestStatus: "verified",
      manifestLabel: "Arsip Manifes Lengkap",
      clearanceStatus: "completed",
      clearanceLabel: "Berlayar Selesai",
      captain: "Capt. Dedi Mulyadi",
    },
  ];

  const filteredVessels = vessels.filter((v) => {
    if (selectedStatus === "all") return true;
    return v.status === selectedStatus;
  });

  return (
    <div className="space-y-6">
      {/* 1. OVERLAPPING OPERATIONAL KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Armada Terdaftar */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Ship className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-full">
              SIUPAL Aktif
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Armada Kapal Terdaftar
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            6 Kapal
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5 flex items-center gap-1">
            <span className="text-emerald-700 font-bold">4 Operasional</span>
            <span>• 2 Standby / Perawatan</span>
          </p>
        </div>

        {/* KPI 2: Permohonan Dermaga */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
              Hari Ini
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Jadwal Sandar Disetujui
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            3 Pelayaran
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            1 Sandar Aktif • 2 Menunggu Giliran
          </p>
        </div>

        {/* KPI 3: Status Manifes */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full">
              1 Perlu Tindakan
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Pelaporan Manifes SOLAS
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            1 Pending
          </p>
          <p className="text-[11px] text-amber-800 font-semibold mt-1.5">
            KMP Mutiara (Jadwal 14:00 WIB)
          </p>
        </div>

        {/* KPI 4: Tagihan Retribusi e-SKRD */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded-full">
              PP 35/2023
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Tagihan Retribusi Jasa Kapal
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            Rp 1.480.000
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            1 Invoice Terbit • Jatuh tempo 3 hari
          </p>
        </div>
      </div>

      {/* 2. LIVE FLEET MOVEMENTS & CLEARANCE TABLE */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFCFB]">
          <div className="flex items-center gap-2.5">
            <Anchor className="w-5 h-5 text-[#0B241E]" />
            <div>
              <h3 className="text-sm font-extrabold text-[#0B241E]">
                Status Operasional Armada di Pelabuhan Merak
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Pantau proses sandar, kelengkapan manifes, dan izin berlayar (SPB) real-time
              </p>
            </div>
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setSelectedStatus("all")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                selectedStatus === "all"
                  ? "bg-white text-[#0B241E] shadow-xs"
                  : "text-[#64748B] hover:text-[#0B241E]"
              }`}
            >
              Semua ({vessels.length})
            </button>
            <button
              onClick={() => setSelectedStatus("active")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                selectedStatus === "active"
                  ? "bg-white text-[#0B241E] shadow-xs"
                  : "text-[#64748B] hover:text-[#0B241E]"
              }`}
            >
              Sandar Aktif
            </button>
            <button
              onClick={() => setSelectedStatus("scheduled")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                selectedStatus === "scheduled"
                  ? "bg-white text-[#0B241E] shadow-xs"
                  : "text-[#64748B] hover:text-[#0B241E]"
              }`}
            >
              Terjadwal
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                <th className="py-3 px-4">Nama Kapal & GT</th>
                <th className="py-3 px-4">Lintasan & Dermaga</th>
                <th className="py-3 px-4">Waktu (ETA / ETD)</th>
                <th className="py-3 px-4">Status Sandar</th>
                <th className="py-3 px-4">Pelaporan Manifes</th>
                <th className="py-3 px-4">Izin Berlayar (SPB)</th>
                <th className="py-3 px-4 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredVessels.map((v) => (
                <tr key={v.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                  {/* Vessel info */}
                  <td className="py-3.5 px-4 font-bold text-[#0B241E]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#E2E8F0] text-[#0B241E] flex items-center justify-center font-bold text-xs">
                        <Ship className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-extrabold text-xs text-[#0B241E]">{v.name}</p>
                        <p className="text-[10px] text-[#64748B] font-mono">
                          {v.callSign} • {v.gt}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Route & Dock */}
                  <td className="py-3.5 px-4 text-[#475569]">
                    <p className="font-semibold text-[#0B241E]">{v.route}</p>
                    <p className="text-[10px] text-[#0284C7] font-semibold">{v.dock}</p>
                  </td>

                  {/* Timing */}
                  <td className="py-3.5 px-4 text-[#475569] font-mono">
                    <p className="text-[11px]">ETA: <strong className="text-[#0B241E]">{v.eta}</strong></p>
                    <p className="text-[10px] text-[#64748B]">ETD: {v.etd}</p>
                  </td>

                  {/* Berth status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        v.status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : v.status === "scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {v.status === "active" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      <span>{v.statusLabel}</span>
                    </span>
                  </td>

                  {/* Manifest Status */}
                  <td className="py-3.5 px-4">
                    {v.manifestStatus === "submitted" || v.manifestStatus === "verified" ? (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{v.manifestLabel}</span>
                      </span>
                    ) : (
                      <Link
                        href={`/kapal/manifes?ship=${encodeURIComponent(v.name)}`}
                        className="text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1 w-fit transition-colors"
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>{v.manifestLabel} ➔</span>
                      </Link>
                    )}
                  </td>

                  {/* Clearance SPB Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        v.clearanceStatus === "ready"
                          ? "bg-emerald-100 text-emerald-800"
                          : v.clearanceStatus === "waiting"
                          ? "bg-slate-100 text-slate-700"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {v.clearanceLabel}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/kapal/manifes?ship=${encodeURIComponent(v.name)}`}
                        className="p-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#0B241E] hover:text-white text-[#475569] transition-colors"
                        title="Formulir Manifes"
                      >
                        <FileCheck2 className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/kapal/penagihan"
                        className="p-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#0B241E] hover:text-white text-[#475569] transition-colors"
                        title="Lihat Tagihan"
                      >
                        <CreditCard className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. ALERTS & REGULATORY SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
          <h4 className="text-xs font-extrabold text-[#0B241E] uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D97706]" />
            <span>Alur Pelayanan Dermaga Terjadwal</span>
          </h4>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Permohonan sandar/tambat dermaga wajib diajukan minimal 4 jam sebelum estimasi kedatangan (ETA) untuk diverifikasi oleh petugas UPT dan disahkan oleh Syahbandar.
          </p>
          <div className="pt-2">
            <Link
              href="/kapal/permohonan"
              className="text-xs font-bold text-[#0B241E] hover:text-[#D97706] flex items-center gap-1 group"
            >
              <span>Buka Formulir Pengajuan Jadwal</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
          <h4 className="text-xs font-extrabold text-[#0B241E] uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Kewajiban Retribusi Jasa Kapal (PP 35/2023)</span>
          </h4>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Perhitungan retribusi sandar dihitung berdasarkan waktu aktual pelayanan (ATA/ATB/ATD). Tagihan e-SKRD otomatis tersinkronisasi ke rekening kas daerah (RKUD) setelah proses sandar selesai.
          </p>
          <div className="pt-2">
            <Link
              href="/kapal/penagihan"
              className="text-xs font-bold text-[#0B241E] hover:text-[#D97706] flex items-center gap-1 group"
            >
              <span>Cek Tagihan e-SKRD & Rekening RKUD</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
