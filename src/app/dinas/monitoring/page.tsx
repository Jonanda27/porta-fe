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
  Filter,
  Download,
  Building2,
  Ship,
  Anchor,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useBillingStore } from "@/store/billing.store";

function DinasMonitoringContent() {
  const searchParams = useSearchParams();
  const portIdParam = searchParams.get("portId");
  const selectedPortFilter = portIdParam && portIdParam !== "all" ? Number(portIdParam) : undefined;

  const {
    revenueSummary,
    invoices,
    warnings,
    fetchRevenueSummary,
    fetchInvoices,
    fetchWarnings,
  } = useBillingStore();

  const [activeTab, setActiveTab] = useState<"RETRIBUSI" | "PIUTANG">("RETRIBUSI");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchRevenueSummary(selectedPortFilter);
    fetchInvoices();
    fetchWarnings();
  }, [fetchRevenueSummary, fetchInvoices, fetchWarnings, selectedPortFilter]);

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

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. EXECUTIVE KPI SUMMARY CARDS (PAD & RECEIVABLES)        */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Target APBD */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
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
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
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
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
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

        {/* Card 4: Kepatuhan STPD */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
              Perbup 25/2024
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Surat Teguran Resmi (STPD)
          </p>
          <p className="text-2xl font-extrabold text-[#0B241E] font-mono mt-1">
            {warnings.length}{" "}
            <span className="text-xs font-normal text-gray-500">Surat</span>
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Teguran I, II & III ke Agen Pelayaran
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TAB CONTROLS & PRINT ACTION                            */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-2">
          <button
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
        </div>

        <button
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
                  <td className="py-3 px-4 font-mono font-semibold text-blue-700">
                    {(((revenueSummary?.vesselRevenueIdr || 112500000) * 0.72 / totalVerifiedRevenue) * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      e-SKRD Online
                    </span>
                  </td>
                </tr>

                {/* 2. Jasa Labuh Kapal */}
                <tr className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#0B241E] flex items-center gap-2">
                      <Anchor className="w-4 h-4 text-teal-600" />
                      Retribusi Jasa Labuh Kapal
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                      Rek. 4.1.02.02.01.0002
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">
                    Kolam Alur Pelabuhan Muara Poumako
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    Rp 50,- / GT / Kunjungan (15 Hari)
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                    Rp {Number((revenueSummary?.vesselRevenueIdr || 112500000) * 0.28).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-teal-700">
                    {(((revenueSummary?.vesselRevenueIdr || 112500000) * 0.28 / totalVerifiedRevenue) * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      e-SKRD Online
                    </span>
                  </td>
                </tr>

                {/* 3. Pas Masuk Gerbang & Terminal */}
                <tr className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#0B241E] flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600" />
                      Pas Pelabuhan & Terminal Penumpang
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                      Rek. 4.1.02.02.01.0003
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">
                    Gerbang Utama & Terminal Penumpang Poumako
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    Orang: Rp 5.000 | R2: Rp 5.000 | R4: Rp 10.000 | Truk: Rp 25.000
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                    Rp {(revenueSummary?.gateTicketingRevenueIdr || 42800000).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-emerald-700">
                    {(((revenueSummary?.gateTicketingRevenueIdr || 42800000) / totalVerifiedRevenue) * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      Loket Gerbang
                    </span>
                  </td>
                </tr>

                {/* 4. Sewa Aset Lahan & Kios */}
                <tr className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#0B241E] flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-600" />
                      Sewa Aset Kios, Gudang & Tanah
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                      Rek. 4.1.02.02.01.0004
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">
                    Kawasan Terbuka & Tertutup Pelabuhan Poumako
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    Rp 180.000 s.d. Rp 600.000 / m² / Tahun
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                    Rp {(revenueSummary?.assetLeaseRevenueIdr || 21500000).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-purple-700">
                    {(((revenueSummary?.assetLeaseRevenueIdr || 21500000) / totalVerifiedRevenue) * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      PKS Kasda
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. TAB CONTENT 2: PENGAWASAN PIUTANG OPERATOR             */}
      {/* ========================================================= */}
      {activeTab === "PIUTANG" && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-[#0B241E] text-base">
                Daftar Tagihan e-SKRD Menunggak (Piutang Daerah)
              </h3>
              <p className="text-xs text-gray-500">
                Pengawasan tagihan yang telah melewati batas tanggal jatuh tempo pembayaran
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kapal atau invoice..."
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
                  <th className="py-3 px-4 text-center">Status STPD</th>
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
