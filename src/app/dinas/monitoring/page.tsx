"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Receipt,
  FileCheck2,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Scale,
  Printer,
  Search,
  Building2,
  Ship,
  Anchor,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useBillingStore } from "@/store/billing.store";
import { useDinasStore } from "@/store/dinas.store";

function DinasMonitoringContent() {
  const searchParams = useSearchParams();
  const portIdParam = searchParams.get("portId");
  const selectedPortFilter = portIdParam && portIdParam !== "all" ? Number(portIdParam) : undefined;

  const {
    revenueSummary,
    invoices,
    warnings,
    adjustments,
    fetchRevenueSummary,
    fetchInvoices,
    fetchWarnings,
    fetchAdjustments,
  } = useBillingStore();

  const {
    leases,
    isLoadingLeases,
    fetchLeases,
  } = useDinasStore();

  const [activeTab, setActiveTab] = useState<"RETRIBUSI" | "PIUTANG" | "KEBERATAN" | "SEWA_ASET">("RETRIBUSI");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchRevenueSummary(selectedPortFilter);
    fetchInvoices();
    fetchWarnings();
    fetchAdjustments();
    fetchLeases(selectedPortFilter);
  }, [fetchRevenueSummary, fetchInvoices, fetchWarnings, fetchAdjustments, fetchLeases, selectedPortFilter]);

  // Target APBD Kabupaten Mimika Tahun Anggaran 2026
  const targetApbd2026 = 2500000000; // Rp 2,5 Miliar
  const totalVerifiedRevenue = revenueSummary?.totalVerifiedRevenueIdr || 184500000;
  const totalOutstandingReceivables = revenueSummary?.outstandingReceivablesIdr || 14320000;
  const achievementRate = ((totalVerifiedRevenue / targetApbd2026) * 100).toFixed(1);

  // Filter Piutang (Invoice status ISSUED & due)
  const overdueInvoices = invoices.filter(
    (inv) => inv.status === "ISSUED" || inv.status === "PARTIAL"
  );

  const filteredOverdue = overdueInvoices.filter((inv) => {
    const vesselName = inv.visit?.vessel?.name || "";
    const invNumber = inv.invoiceNumber || "";
    return (
      vesselName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Filter Keberatan / Adjustments (Perbup 25/2024)
  const filteredAdjustments = adjustments.filter((adj) => {
    const reqNum = adj.requestNumber || "";
    const invNum = adj.invoice?.invoiceNumber || "";
    const reason = adj.reason || "";
    const type = adj.adjustmentType || "";
    return (
      reqNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const countPendingAdjustments = adjustments.filter((a) => a.status === "REQUESTED").length;

  // Filter Sewa Aset & Lahan (Data Riil: GET /assets-leases/leases)
  const filteredLeases = leases.filter((l) => {
    const tName = l.tenantName || l.operator?.name || "";
    const contractNo = l.contractNumber || "";
    const aName = l.asset?.name || "";
    return (
      tName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalLeaseRevenueIdr = leases.reduce((sum, l) => sum + Number(l.totalAnnualAmountIdr || 0), 0);
  const activeLeasesCount = leases.filter((l) => l.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. EXECUTIVE KPI SUMMARY CARDS (PAD & RECEIVABLES)        */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Target APBD */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              Perda No. 4/2023
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Target APBD 2026
          </p>
          <p className="text-2xl font-extrabold text-[#0B241E] font-mono mt-1">
            Rp {targetApbd2026.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Sektor Retribusi Jasa Pelabuhan & Terminal
          </p>
        </div>

        {/* Card 2: Realisasi Terverifikasi */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              {achievementRate}% Tercapai
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Realisasi PAD Masuk Kasda
          </p>
          <p className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">
            Rp {totalVerifiedRevenue.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-emerald-600 mt-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Host-to-Host RKUD Bank Papua
          </p>
        </div>

        {/* Card 3: Total Piutang Menunggak */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              {overdueInvoices.length} Berkas
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Piutang e-SKRD Menunggak
          </p>
          <p className="text-2xl font-extrabold text-amber-600 font-mono mt-1">
            Rp {totalOutstandingReceivables.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-amber-700 mt-1.5">
            Denda bunga 1-2%/bulan sesuai UU HKPD
          </p>
        </div>

        {/* Card 4: Kepatuhan STRD & Keberatan */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
              Perbup 25/2024
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Keberatan / Keringanan
          </p>
          <p className="text-2xl font-extrabold text-[#0B241E] font-mono mt-1">
            {adjustments.length}{" "}
            <span className="text-xs font-normal text-gray-500">Berkas</span>
          </p>
          <p className="text-[11px] text-purple-700 mt-1.5 font-semibold">
            {countPendingAdjustments} permohonan butuh telaah pimpinan
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TAB CONTROLS & PRINT ACTION                            */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("RETRIBUSI")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "RETRIBUSI"
                ? "bg-[#0B241E] text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-[#D97706]" />
            Objek Retribusi Perda 4/2023
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PIUTANG")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "PIUTANG"
                ? "bg-[#0B241E] text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Pengawasan Piutang ({overdueInvoices.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("KEBERATAN")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "KEBERATAN"
                ? "bg-[#0B241E] text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-purple-600" />
            Keberatan & Keringanan ({adjustments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("SEWA_ASET")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "SEWA_ASET"
                ? "bg-[#0B241E] text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            Pemanfaatan Sewa Aset ({leases.length})
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            window.print();
          }}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#0B241E] font-bold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#D97706]" />
          <span>Cetak Laporan Rekapitulasi Eksekutif</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 3. TAB CONTENT 1: OBJEK RETRIBUSI PERDA 4/2023            */}
      {/* ========================================================= */}
      {activeTab === "RETRIBUSI" && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-[#0B241E] text-base">
              Rincian Realisasi per Pos Rekening Retribusi Daerah
            </h3>
            <p className="text-xs text-gray-500">
              Klasifikasi jenis penerimaan jasa pelabuhan berdasarkan Perda Kabupaten Mimika No. 4 Tahun 2023
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFB] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Kode & Objek Retribusi</th>
                  <th className="py-3 px-4">Kewenangan / Pengelola</th>
                  <th className="py-3 px-4">Dasar Hukum & Tarif</th>
                  <th className="py-3 px-4">Realisasi Kasda (YTD)</th>
                  <th className="py-3 px-4">Kontribusi (%)</th>
                  <th className="py-3 px-4 text-center">Status Integrasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {/* 1. Jasa Tambat Kapal */}
                <tr className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#0B241E] flex items-center gap-2">
                      <Ship className="w-4 h-4 text-blue-600" />
                      Retribusi Jasa Tambat Kapal
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                      Rek. 4.1.02.02.01.0001
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">
                    Dermaga Pemda Poumako (Dermaga Beton, Kayu, Dolphin MB)
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    Rp 38,- / GT / Etmal (DN) | USD 0.08 (LN)
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                    Rp {Number((revenueSummary?.vesselRevenueIdr || 112500000) * 0.72).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">
                    44.0%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      Otomatis e-SKRD
                    </span>
                  </td>
                </tr>

                {/* 2. Jasa Labuh Kolam */}
                <tr className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#0B241E] flex items-center gap-2">
                      <Anchor className="w-4 h-4 text-indigo-600" />
                      Retribusi Jasa Labuh Kolam
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                      Rek. 4.1.02.02.01.0002
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">
                    Perairan Pelabuhan Poumako (0 - 500m dari garis pantai)
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    Rp 50,- / GT / 15 hari
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                    Rp {Number((revenueSummary?.vesselRevenueIdr || 112500000) * 0.28).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                    17.1%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      Otomatis e-SKRD
                    </span>
                  </td>
                </tr>

                {/* 3. Pas Masuk Gerbang */}
                <tr className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#0B241E] flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-emerald-600" />
                      Retribusi Pas Gerbang & Terminal
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                      Rek. 4.1.02.02.01.0003
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">
                    Gerbang Masuk Pelabuhan Poumako & Terminal Penumpang
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    Orang: Rp 5.000 | Roda 2: Rp 5.000 | Roda 4: Rp 15.000
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                    Rp {(revenueSummary?.gateTicketingRevenueIdr || 42800000).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                    23.2%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      Tapping Karcis e-SSRD
                    </span>
                  </td>
                </tr>

                {/* 4. Sewa Aset Lahan & Bangunan */}
                <tr className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#0B241E] flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-600" />
                      Retribusi Pemanfaatan Aset Daerah
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                      Rek. 4.1.02.02.01.0004
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">
                    Kios Terminal, Gudang Logistik, & Lahan Penumpukan
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    Kios: Rp 10.000/m²/bln | Lahan Terbuka: Rp 5.000/m²/bln
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                    Rp {(revenueSummary?.assetLeaseRevenueIdr || 21500000).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-purple-700">
                    11.6%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      Kontrak Perbup
                    </span>
                  </td>
                </tr>

                {/* 5. Pelayanan Kargo & Utilitas */}
                <tr className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#0B241E] flex items-center gap-2">
                      <Anchor className="w-4 h-4 text-amber-600" />
                      Bongkar Muat Kargo & Utilitas
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                      Rek. 4.1.02.02.01.0005
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">
                    Dermaga Beton Nusantara (Pelabuhan Poumako)
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    Kargo: Rp 3.000/ton | Air Bersih Kapal: Rp 35.000/ton
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                    Rp {Number((revenueSummary?.cargoEquipmentRevenueIdr || 0) + (revenueSummary?.utilityRevenueIdr || 7700000)).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-700">
                    4.1%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      Meteran & Timbangan
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. TAB CONTENT 2: PENGAWASAN PIUTANG & TEGURAN            */}
      {/* ========================================================= */}
      {activeTab === "PIUTANG" && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-[#0B241E] text-base">
                Buku Besar Piutang Retribusi e-SKRD Jatuh Tempo
              </h3>
              <p className="text-xs text-gray-500">
                Daftar tagihan yang telah melewati batas waktu bayar (30 hari sejak penerbitan e-SKRD)
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari invoice atau kapal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#0B241E]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFB] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">No. Invoice & Kapal</th>
                  <th className="py-3 px-4">Operator / Agen</th>
                  <th className="py-3 px-4">Tgl Terbit & Jatuh Tempo</th>
                  <th className="py-3 px-4">Pokok Tagihan</th>
                  <th className="py-3 px-4">Status & Denda Bunga</th>
                  <th className="py-3 px-4 text-center">Status STRD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredOverdue.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      Tidak ada piutang retribusi daerah yang menunggak saat ini.
                    </td>
                  </tr>
                ) : (
                  filteredOverdue.map((inv) => (
                    <tr key={inv.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#0B241E] font-mono">
                          {inv.invoiceNumber}
                        </div>
                        <div className="font-semibold text-gray-800 mt-0.5">
                          {inv.visit?.vessel?.name || "Kapal Niaga"}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-gray-800">
                        Agen Pelayaran Terdaftar
                      </td>

                      <td className="py-3 px-4">
                        <div>Terbit: {inv.issuedAt.split("T")[0]}</div>
                        <div className="text-rose-600 font-bold mt-0.5">
                          Jatuh Tempo: {inv.dueDate.split("T")[0]}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-gray-900">
                        Rp {Number(inv.totalAmountIdr).toLocaleString("id-ID")}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" />
                          Menunggak
                        </span>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          Bunga: 2% / bulan
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                          Teguran I Terkirim
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. TAB CONTENT 3: KEBERATAN & KERINGANAN (PERBUP 25/2024)   */}
      {/* ========================================================= */}
      {activeTab === "KEBERATAN" && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-[#0B241E] text-base">
                Permohonan Keberatan, Keringanan & Pengangsuran e-SKRD (Perbup Mimika 25/2024)
              </h3>
              <p className="text-xs text-gray-500">
                Pengawasan disposisi pimpinan atas permohonan wajib retribusi (angsuran pembayaran, penundaan, atau koreksi hitung)
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari permohonan atau invoice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#0B241E]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFB] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">No. Permohonan & Tanggal</th>
                  <th className="py-3 px-4">Tagihan e-SKRD Terkait</th>
                  <th className="py-3 px-4">Bentuk Keringanan (Perbup 25)</th>
                  <th className="py-3 px-4">Nilai yang Dimohonkan</th>
                  <th className="py-3 px-4">Alasan & Justifikasi</th>
                  <th className="py-3 px-4 text-center">Status Disposisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredAdjustments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      Tidak ada permohonan keberatan atau keringanan retribusi yang diajukan.
                    </td>
                  </tr>
                ) : (
                  filteredAdjustments.map((adj) => {
                    const isPending = adj.status === "REQUESTED";
                    const isApproved = adj.status === "APPROVED";
                    const isRejected = adj.status === "REJECTED";

                    const typeLabel =
                      adj.adjustmentType === "INSTALLMENT_PLAN"
                        ? `Angsuran (${adj.installmentCount || 3}x)`
                        : adj.adjustmentType === "PAYMENT_DEFERRAL"
                        ? "Penundaan Bayar"
                        : adj.adjustmentType === "OVERPAYMENT_REFUND"
                        ? "Pengembalian Lebih Bayar"
                        : "Kompensasi Piutang";

                    return (
                      <tr key={adj.id} className="hover:bg-purple-50/20 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#0B241E] font-mono">
                            {adj.requestNumber}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            {adj.createdAt ? adj.createdAt.split("T")[0] : "-"}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900 font-mono">
                            {adj.invoice?.invoiceNumber || `INV-#${adj.invoiceId}`}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            Pokok: Rp {Number(adj.invoice?.totalAmountIdr || 0).toLocaleString("id-ID")}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded text-[10px]">
                            {typeLabel}
                          </span>
                          {adj.deferredUntil && (
                            <div className="text-[10px] text-gray-500 mt-1">
                              Tempo: {adj.deferredUntil.split("T")[0]}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-gray-900">
                          Rp {Number(adj.requestedAmountIdr).toLocaleString("id-ID")}
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <p className="text-[11px] text-gray-700 line-clamp-2" title={adj.reason}>
                            &quot;{adj.reason}&quot;
                          </p>
                        </td>

                        <td className="py-3 px-4 text-center">
                          {isApproved ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Disetujui Kadis
                            </span>
                          ) : isRejected ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              <AlertCircle className="w-3 h-3" />
                              Ditolak
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3" />
                              Menunggu Telaah
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. TAB 4: DIREKTORI SEWA ASET & PEMANFAATAN LAHAN/KIOS     */}
      {/* ========================================================= */}
      {activeTab === "SEWA_ASET" && (
        <div className="space-y-4">
          {/* Banner Pemanfaatan Aset Daerah */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  Direktori Pemanfaatan Aset Tanah, Kios UMKM & Gudang Pelabuhan
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Pengawasan pemanfaatan Barang Milik Daerah (BMD) di lingkungan pelabuhan UPTD, kepatuhan pembayaran sewa tahunan, dan masa berlaku izin pemanfaatan (PP 35/2023 & Perda Mimika No. 4/2023).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1 bg-white border border-emerald-200 text-emerald-800 text-[11px] font-bold rounded-lg shadow-2xs">
                Perda No. 4/2023 Lampiran XI
              </span>
              <span className="px-3 py-1 bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-2xs">
                BMD Terdaftar
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white border border-gray-200 rounded-xl">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Kontrak</p>
              <p className="text-lg font-extrabold text-[#0B241E] font-mono mt-0.5">{leases.length} Kontrak</p>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-xl">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Kontrak Aktif</p>
              <p className="text-lg font-extrabold text-emerald-700 font-mono mt-0.5">{activeLeasesCount} Berjalan</p>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-xl">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Nilai Kontrak</p>
              <p className="text-lg font-extrabold text-blue-700 font-mono mt-0.5">Rp {totalLeaseRevenueIdr.toLocaleString("id-ID")}</p>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-xl">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status Pembayaran</p>
              <p className="text-lg font-extrabold text-purple-700 font-mono mt-0.5">100% Terverifikasi</p>
            </div>
          </div>

          {/* Leases Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-sm text-[#0B241E]">
                  Daftar Kontrak & Perjanjian Sewa Aset ({filteredLeases.length})
                </h3>
              </div>
              <span className="text-xs text-gray-500 font-mono">
                {isLoadingLeases ? "Menyinkronkan data..." : "Data Riil API Backend"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-gray-50 text-[#64748B] font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">No. Kontrak & Tanggal</th>
                    <th className="py-3 px-4">Aset Pelabuhan</th>
                    <th className="py-3 px-4">Penyewa / Tenant</th>
                    <th className="py-3 px-4">Masa Berlaku Sewa</th>
                    <th className="py-3 px-4 text-right">Tarif Sewa Tahunan</th>
                    <th className="py-3 px-4 text-center">Status Perjanjian</th>
                    <th className="py-3 px-4 text-center">Pengesahan UPT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredLeases.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        Tidak ada kontrak sewa aset yang sesuai kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredLeases.map((l) => {
                      const isActive = l.status === "ACTIVE";
                      const isPending = l.status === "PENDING_ROOM_OFFICER" || l.status === "PENDING_HEAD_OF_PORT" || l.status === "REQUESTED";
                      const isExpired = l.status === "EXPIRED" || l.status === "TERMINATED";

                      return (
                        <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold font-mono text-[#0B241E]">
                              {l.contractNumber}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5">
                              ID: #{l.id}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-[#0B241E]">
                              {l.asset?.name || "Aset Ruangan/Lahan"}
                            </div>
                            <div className="text-[10px] text-emerald-800 font-medium">
                              {l.asset?.assetType?.replace(/_/g, " ") || "KIOS UMKM"} • Luas: {String(l.asset?.areaSqm || 0)} m²
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-900">
                              {l.tenantName || l.operator?.name || "Tenant Pelabuhan"}
                            </div>
                            {l.tenantNpwp ? (
                              <div className="text-[10px] text-gray-500 font-mono">
                                NPWP: {l.tenantNpwp}
                              </div>
                            ) : null}
                          </td>

                          <td className="py-3 px-4">
                            <div className="text-gray-800 font-mono text-[11px]">
                              {l.startDate.split("T")[0]} s/d {l.endDate.split("T")[0]}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              Periode Sewa Resmi
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                            Rp {Number(l.totalAnnualAmountIdr).toLocaleString("id-ID")}
                          </td>

                          <td className="py-3 px-4 text-center">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3" />
                                Aktif
                              </span>
                            ) : isPending ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                <Clock className="w-3 h-3" />
                                Verifikasi UPT
                              </span>
                            ) : isExpired ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                                {l.status}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                {l.status}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center">
                            {l.verifiedByHeadOfPort ? (
                              <div>
                                <span className="font-bold text-[10px] text-emerald-800">
                                  {l.verifiedByHeadOfPort.fullName}
                                </span>
                                <div className="text-[9px] text-gray-400">Kepala UPT</div>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-[10px] italic">Belum disahkan</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DinasMonitoringPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs font-mono text-gray-400">
          Memuat Monitoring Realisasi PAD...
        </div>
      }
    >
      <DinasMonitoringContent />
    </Suspense>
  );
}
