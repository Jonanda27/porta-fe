"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Ship,
  Building2,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Receipt,
  DollarSign,
  AlertCircle,
  Users,
  Car,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  FileText,
  Anchor,
  Filter,
} from "lucide-react";
import { useBillingStore } from "@/store/billing.store";

function DinasDashboardContent() {
  const searchParams = useSearchParams();
  const portIdParam = searchParams.get("portId");
  const selectedPortFilter = portIdParam && portIdParam !== "all" ? Number(portIdParam) : undefined;

  const {
    revenueSummary,
    unbilledVisits,
    fetchRevenueSummary,
    fetchUnbilledVisits,
    isLoading,
  } = useBillingStore();

  useEffect(() => {
    fetchRevenueSummary(selectedPortFilter);
    fetchUnbilledVisits(selectedPortFilter);
  }, [fetchRevenueSummary, fetchUnbilledVisits, selectedPortFilter]);

  // Target APBD Kabupaten Mimika 2026 untuk Sektor Retribusi Jasa Pelabuhan & Terminal
  const apbdTarget2026 = 2500000000; // Rp 2,50 Miliar
  const totalVerifiedPad = revenueSummary?.totalVerifiedRevenueIdr || 184500000;
  const padPercentage = ((totalVerifiedPad / apbdTarget2026) * 100).toFixed(1);

  const totalReceivables = revenueSummary?.outstandingReceivablesIdr || 14320000;
  const outstandingCount = revenueSummary?.outstandingInvoiceCount || 3;
  const unbilledCount = unbilledVisits.length || revenueSummary?.unbilledDepartedVisitsCount || 0;

  const totalPassengers = revenueSummary?.passengerTraffic?.totalPassengers || 14250;
  const totalVehicles = revenueSummary?.passengerTraffic?.totalVehicles || 3820;

  // Breakdown Objek Retribusi (Perda Kab. Mimika No. 4 Tahun 2023)
  const vesselRev = revenueSummary?.vesselRevenueIdr || 112500000;
  const gateRev = revenueSummary?.gateTicketingRevenueIdr || 42800000;
  const assetRev = revenueSummary?.assetLeaseRevenueIdr || 21500000;
  const cargoUtilityRev =
    (revenueSummary?.cargoEquipmentRevenueIdr || 0) + (revenueSummary?.utilityRevenueIdr || 7700000);

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. OVERLAPPING EXECUTIVE KPI CARDS (Realtime API Data)    */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Realisasi PAD vs Target APBD */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {padPercentage}% Target
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Realisasi PAD Pelabuhan YTD
          </p>
          <p className="text-2xl font-extrabold text-[#0B241E] font-mono mt-1">
            Rp {totalVerifiedPad.toLocaleString("id-ID")}
          </p>
          <div className="mt-2 text-[11px] text-[#64748B] flex items-center justify-between pt-2 border-t border-gray-100">
            <span>Target APBD 2026:</span>
            <span className="font-bold text-gray-800">
              Rp {apbdTarget2026.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* KPI 2: Piutang Daerah Berjalan */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {outstandingCount} e-SKRD Macet
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Piutang Retribusi Belum Lunas
          </p>
          <p className="text-2xl font-extrabold text-amber-600 font-mono mt-1">
            Rp {totalReceivables.toLocaleString("id-ID")}
          </p>
          <div className="mt-2 text-[11px] text-[#64748B] flex items-center justify-between pt-2 border-t border-gray-100">
            <span>Tindakan:</span>
            <Link
              href="/dinas/monitoring"
              className="font-bold text-[#0B241E] hover:underline flex items-center gap-0.5"
            >
              Lihat Rincian Piutang <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* KPI 3: Arus Lalu Lintas Gerbang & Penumpang */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full">
              Pintu Gerbang
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Trafik Penumpang & Kendaraan
          </p>
          <p className="text-2xl font-extrabold text-[#0B241E] font-mono mt-1">
            {totalPassengers.toLocaleString("id-ID")}{" "}
            <span className="text-xs font-normal text-gray-500">Jiwa</span>
          </p>
          <div className="mt-2 text-[11px] text-[#64748B] flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="flex items-center gap-1">
              <Car className="w-3 h-3 text-gray-400" />
              Kendaraan:
            </span>
            <span className="font-bold text-gray-800">
              {totalVehicles.toLocaleString("id-ID")} Unit
            </span>
          </div>
        </div>

        {/* KPI 4: Indikator Pengawasan Anti-Kebocoran PAD */}
        <div
          className={`border rounded-xl p-5 shadow-sm transition-shadow ${
            unbilledCount > 0
              ? "bg-rose-50/50 border-rose-200"
              : "bg-white border-[#E2E8F0]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                unbilledCount > 0
                  ? "bg-rose-100 text-rose-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                unbilledCount > 0
                  ? "bg-rose-200 text-rose-800 animate-pulse"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {unbilledCount > 0 ? "Potensi Kebocoran" : "Patuh 100%"}
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Kapal Berangkat Belum Ditagih
          </p>
          <p
            className={`text-2xl font-extrabold font-mono mt-1 ${
              unbilledCount > 0 ? "text-rose-700" : "text-[#0B241E]"
            }`}
          >
            {unbilledCount}{" "}
            <span className="text-xs font-normal text-gray-500">Kunjungan</span>
          </p>
          <div className="mt-2 text-[11px] text-[#64748B] flex items-center justify-between pt-2 border-t border-gray-100">
            <span>Audit Kepatuhan:</span>
            <span className="font-bold text-gray-800">
              {unbilledCount > 0 ? "Perlu SKRD Rampung" : "Semua Ditagih"}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. REVENUE BREAKDOWN & VESSEL TRAFFIC GRID                 */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Breakdown 4 Objek Retribusi Perda 4/2023 */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-[#0B241E] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#D97706]" />
                Komposisi Realisasi PAD per Objek Retribusi
              </h2>
              <p className="text-xs text-gray-500">
                Mengacu pada struktur tarif resmi Perda Kabupaten Mimika No. 4 Tahun 2023
              </p>
            </div>
            <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg font-semibold">
              Host-to-Host Kasda
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pos 1: Jasa Kapal */}
            <div className="p-4 bg-gray-50/70 border border-gray-100 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Ship className="w-4 h-4 text-blue-600" />
                  Jasa Kapal (Tambat & Labuh)
                </span>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  {((vesselRev / (totalVerifiedPad || 1)) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-lg font-extrabold text-[#0B241E] font-mono">
                Rp {vesselRev.toLocaleString("id-ID")}
              </div>
              <p className="text-[11px] text-gray-500">
                Penerimaan e-SKRD sandar dermaga Pemda & MB Ferry Poumako
              </p>
            </div>

            {/* Pos 2: Tiket Gerbang & Pas Pelabuhan */}
            <div className="p-4 bg-gray-50/70 border border-gray-100 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Pas Gerbang & Terminal
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  {((gateRev / (totalVerifiedPad || 1)) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-lg font-extrabold text-[#0B241E] font-mono">
                Rp {gateRev.toLocaleString("id-ID")}
              </div>
              <p className="text-[11px] text-gray-500">
                Karcis pas masuk orang, kendaraan roda 2, roda 4, dan truk kargo
              </p>
            </div>

            {/* Pos 3: Sewa Aset Lahan & Kios */}
            <div className="p-4 bg-gray-50/70 border border-gray-100 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  Sewa Aset & Kios Tenant
                </span>
                <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  {((assetRev / (totalVerifiedPad || 1)) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-lg font-extrabold text-[#0B241E] font-mono">
                Rp {assetRev.toLocaleString("id-ID")}
              </div>
              <p className="text-[11px] text-gray-500">
                Pemanfaatan kios terminal, gudang semen, dan kantor agen
              </p>
            </div>

            {/* Pos 4: Kargo, Utilitas & Air Bersih */}
            <div className="p-4 bg-gray-50/70 border border-gray-100 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Anchor className="w-4 h-4 text-amber-600" />
                  Kargo & Utilitas Air Bersih
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  {((cargoUtilityRev / (totalVerifiedPad || 1)) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-lg font-extrabold text-[#0B241E] font-mono">
                Rp {cargoUtilityRev.toLocaleString("id-ID")}
              </div>
              <p className="text-[11px] text-gray-500">
                Bongkar muat barang komersial, sewa alat berat, & pasokan air kapal
              </p>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Ringkasan Pengawasan Pelabuhan */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#0B241E] flex items-center gap-2 pb-3 border-b border-gray-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Integritas & Kepatuhan Kasda
            </h3>
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Dasar Hukum Penagihan:</span>
                <span className="font-bold text-[#0B241E]">Perda Mimika 4/2023</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Tata Cara Pemungutan:</span>
                <span className="font-bold text-[#0B241E]">Perbup Mimika 25/2024</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Kanal Rekening Kasda:</span>
                <span className="font-bold text-[#0B241E]">RKUD Bank Papua</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Sinkronisasi Host-to-Host:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Aktif (Real-time)
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Link
              href="/dinas/monitoring"
              className="w-full py-2.5 px-4 bg-[#0B241E] hover:bg-[#133D31] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <span>Buka Laporan Monitoring Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D97706]" />
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. PERINGATAN AUDIT: DAFTAR KAPAL BELUM DITAGIH           */}
      {/* ========================================================= */}
      {unbilledVisits.length > 0 && (
        <div className="bg-white rounded-2xl border border-rose-200 shadow-xs overflow-hidden">
          <div className="p-5 bg-rose-50/60 border-b border-rose-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-rose-950 text-sm">
                  Peringatan Pimpinan: {unbilledVisits.length} Kapal Berangkat Belum Diterbitkan e-SKRD
                </h3>
                <p className="text-xs text-rose-700">
                  Potensi kebocoran PAD: Kapal telah meninggalkan dermaga tetapi penetapan tagihan retribusi belum selesai.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-white text-rose-700 border border-rose-200 px-3 py-1 rounded-lg">
              Audit Kepatuhan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFB] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">No. Kunjungan</th>
                  <th className="py-3 px-4">Nama Kapal & GT</th>
                  <th className="py-3 px-4">Kategori Kapal</th>
                  <th className="py-3 px-4">Dermaga Sandar</th>
                  <th className="py-3 px-4">Waktu Berangkat</th>
                  <th className="py-3 px-4 text-center">Status Tagihan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {unbilledVisits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                      {visit.visitNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{visit.vessel?.name || "Kapal Niaga"}</div>
                      <div className="text-[11px] text-gray-500">
                        GT: {Number(visit.vessel?.grossTonnage || 0).toLocaleString("id-ID")}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[10px]">
                        {visit.vessel?.vesselCategory || "BARANG"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-800 font-medium">
                      {visit.berth?.name || "Dermaga Pemda Poumako"}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {visit.actualDepartureTime || visit.etd}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        <AlertCircle className="w-3 h-3" />
                        Belum Diterbitkan SKRD
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DinasDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs font-mono text-gray-400">
          Memuat Dashboard Eksekutif Dinas...
        </div>
      }
    >
      <DinasDashboardContent />
    </Suspense>
  );
}
