"use client";

import React, { useState, useEffect } from "react";
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
  ShieldCheck,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useKapalStore } from "@/store/kapal.store";
import { useAuthStore } from "@/store/auth.store";

export default function KapalDashboardPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { user, initialize: initAuth } = useAuthStore();
  const { operator, vessels, visits, isLoading, fetchDashboardData } = useKapalStore();

  useEffect(() => {
    initAuth();
    fetchDashboardData();
  }, [initAuth, fetchDashboardData]);

  // Nama operator dan dokumen legalitas
  const operatorName =
    operator?.name ||
    (user?.fullName
      ? user.fullName.replace(/\(.*?\)/g, "").trim()
      : "PT Pelayaran Mimika Sejahtera");

  const siupalDoc = operator?.documents?.find((d) => d.category === "SIUPAL_NIB");
  const siupalNumber = siupalDoc?.documentNumber || "SIUPAL Aktif";

  // Data kunjungan yang ditampilkan (jika backend telah memiliki visit)
  const displayVisits = visits.length > 0 ? visits : [];

  // Filter kunjungan kapal
  const filteredVisits = displayVisits.filter((v) => {
    if (selectedStatus === "all") return true;
    if (selectedStatus === "active") return v.status === "BERTHED" || v.status === "ARRIVED";
    if (selectedStatus === "scheduled") return v.status === "SCHEDULED";
    if (selectedStatus === "completed") return v.status === "DEPARTED";
    return true;
  });

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIT";
    } catch {
      return dateStr;
    }
  };

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
            <span
              className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-full truncate max-w-[130px]"
              title={siupalNumber}
            >
              {siupalNumber}
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Armada Kapal Terdaftar
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            {isLoading && vessels.length === 0 ? "..." : `${vessels.length} Kapal`}
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5 flex items-center gap-1">
            <span className="text-emerald-700 font-bold">
              {vessels.filter((v) => v.isActive).length} Terverifikasi
            </span>
            <span>• {operatorName}</span>
          </p>
        </div>

        {/* KPI 2: Kunjungan & Permohonan Dermaga */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
              Pelabuhan Poumako
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Total Riwayat Kunjungan
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            {isLoading && visits.length === 0 ? "..." : `${visits.length} Kunjungan`}
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            {visits.filter((v) => v.status === "BERTHED" || v.status === "ARRIVED").length} Sandar Aktif •{" "}
            {visits.filter((v) => v.status === "DEPARTED").length} Selesai Pelayanan
          </p>
        </div>

        {/* KPI 3: Status Manifes SOLAS */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
              SOLAS Compliance
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Pelaporan Manifes Kapal
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            Sesuai Standar
          </p>
          <p className="text-[11px] text-emerald-800 font-semibold mt-1.5">
            Dokumen Keselamatan Muatan Valid
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
            Status Retribusi Jasa Labuh & Tambat
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            Tertib Bayar
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Tersinkronisasi Host-to-Host Kas Daerah
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
                Status Operasional Armada di Pelabuhan Poumako, Mimika
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Data langsung dari server backend untuk akun operator: <strong className="text-[#0B241E]">{operatorName}</strong>
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
              Semua ({displayVisits.length})
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
            <button
              onClick={() => setSelectedStatus("completed")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                selectedStatus === "completed"
                  ? "bg-white text-[#0B241E] shadow-xs"
                  : "text-[#64748B] hover:text-[#0B241E]"
              }`}
            >
              Selesai
            </button>
          </div>
        </div>

        {isLoading && displayVisits.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-[#D97706]" />
            <p className="text-xs">Memuat data armada dan kunjungan dari backend...</p>
          </div>
        ) : filteredVisits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3 px-4">Nama Kapal & GT</th>
                  <th className="py-3 px-4">No. Kunjungan & Lintasan</th>
                  <th className="py-3 px-4">Estimasi / Waktu Sandar</th>
                  <th className="py-3 px-4">Status Pelayanan</th>
                  <th className="py-3 px-4">Alokasi Dermaga</th>
                  <th className="py-3 px-4 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredVisits.map((v) => {
                  const vesselName = v.vessel?.name || "Kapal Terdaftar";
                  const gt = v.vessel?.grossTonnage ? `${v.vessel.grossTonnage} GT` : "-";
                  const regNo = v.vessel?.registrationNumber || "-";
                  const berthName = v.berthingRecords?.[0]?.berth?.name || "Dermaga Umum Poumako";

                  return (
                    <tr key={v.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                      {/* Vessel info */}
                      <td className="py-3.5 px-4 font-bold text-[#0B241E]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#E2E8F0] text-[#0B241E] flex items-center justify-center font-bold text-xs shrink-0">
                            <Ship className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-extrabold text-xs text-[#0B241E]">{vesselName}</p>
                            <p className="text-[10px] text-[#64748B] font-mono">
                              {regNo} • {gt}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Route & Visit Number */}
                      <td className="py-3.5 px-4 text-[#475569]">
                        <p className="font-semibold text-[#0B241E]">
                          {v.originPort || "Pelabuhan Dobo"} ➔ {v.destinationPort || "Pelabuhan Poumako"}
                        </p>
                        <p className="text-[10px] text-[#0284C7] font-mono font-semibold">
                          {v.visitNumber}
                        </p>
                      </td>

                      {/* Timing */}
                      <td className="py-3.5 px-4 text-[#475569] font-mono">
                        <p className="text-[11px]">
                          ETA: <strong className="text-[#0B241E]">{formatDateTime(v.eta)}</strong>
                        </p>
                        <p className="text-[10px] text-[#64748B]">
                          ETD: {formatDateTime(v.etd)}
                        </p>
                      </td>

                      {/* Berth status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            v.status === "BERTHED" || v.status === "ARRIVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : v.status === "SCHEDULED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {(v.status === "BERTHED" || v.status === "ARRIVED") && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          )}
                          <span>
                            {v.status === "BERTHED"
                              ? "Sandar Aktif"
                              : v.status === "ARRIVED"
                              ? "Tiba di Kolam Labuh"
                              : v.status === "SCHEDULED"
                              ? "Jadwal Terverifikasi"
                              : "Selesai Pelayanan"}
                          </span>
                        </span>
                      </td>

                      {/* Dermaga */}
                      <td className="py-3.5 px-4 text-[#0B241E] font-medium">
                        <p className="truncate max-w-[180px]" title={berthName}>
                          {berthName}
                        </p>
                        <span className="text-[9.5px] text-emerald-700 font-mono">
                          {v.vessel?.vesselCategory || "Campuran"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/kapal/manifes?ship=${encodeURIComponent(vesselName)}`}
                            className="p-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#0B241E] hover:text-white text-[#475569] transition-colors"
                            title="Formulir Manifes"
                          >
                            <FileCheck2 className="w-4 h-4" />
                          </Link>
                          <Link
                            href="/kapal/penagihan"
                            className="p-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#0B241E] hover:text-white text-[#475569] transition-colors"
                            title="Lihat Tagihan e-SKRD"
                          >
                            <CreditCard className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center space-y-4">
            <p className="text-xs text-slate-600">
              Belum ada kunjungan kapal yang tercatat untuk filter ini.
            </p>
            {vessels.length > 0 && (
              <div className="max-w-md mx-auto p-4 bg-slate-50 border border-slate-200 rounded-xl text-left">
                <p className="text-xs font-bold text-[#0B241E] mb-2">
                  Daftar Kapal Terdaftar Milik Anda:
                </p>
                <ul className="text-xs space-y-1.5 text-slate-600 font-mono">
                  {vessels.map((v) => (
                    <li key={v.id} className="flex justify-between items-center py-1 border-b border-slate-200/60 last:border-0">
                      <span className="font-bold text-[#0B241E]">{v.name}</span>
                      <span className="text-[11px] text-slate-500">{v.grossTonnage} GT ({v.shipType})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link
              href="/kapal/permohonan"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>+ Ajukan Permohonan Sandar Baru</span>
            </Link>
          </div>
        )}
      </div>

      {/* 3. ALERTS & REGULATORY SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
          <h4 className="text-xs font-extrabold text-[#0B241E] uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D97706]" />
            <span>Alur Pelayanan Dermaga Terjadwal</span>
          </h4>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Permohonan sandar/tambat dermaga wajib diajukan minimal 4 jam sebelum estimasi kedatangan (ETA) untuk diverifikasi oleh petugas UPT Pelabuhan Poumako dan disahkan oleh Syahbandar.
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
            Perhitungan retribusi sandar dihitung berdasarkan waktu aktual pelayanan (ATA/ATB/ATD). Tagihan e-SKRD otomatis tersinkronisasi ke rekening kas daerah (RKUD) Kabupaten Mimika setelah proses sandar selesai.
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
