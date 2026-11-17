"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Receipt,
  FileCheck2,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Download,
  Printer,
  X,
  ExternalLink,
  ShieldCheck,
  Ship,
  TrendingUp,
  FileText,
  Copy,
  QrCode,
} from "lucide-react";

interface SKRDInvoice {
  id: string;
  invoiceNo: string;
  vesselName: string;
  gt: number;
  dock: string;
  ata: string;
  atb: string;
  atd: string;
  actualHours: number;
  mooringFee: number;
  anchorageFee: number;
  utilityWaterFee: number;
  lineHandlingFee: number;
  totalAmount: number;
  dueDate: string;
  status: "unpaid" | "paid";
  ssrdNo?: string;
  paidAt?: string;
  bankVaNumber: string;
}

export default function KapalPenagihanPage() {
  const [activeTab, setActiveTab] = useState<"unpaid" | "history">("unpaid");
  const [selectedInvoice, setSelectedInvoice] = useState<SKRDInvoice | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isSSRDModalOpen, setIsSSRDModalOpen] = useState<boolean>(false);
  const [selectedBank, setSelectedBank] = useState<string>("bank_banten");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Invoices Dataset
  const [invoices, setInvoices] = useState<SKRDInvoice[]>([
    {
      id: "INV-01",
      invoiceNo: "SKRD-KPL-MRK-2026-0419",
      vesselName: "KMP Baruna Jaya",
      gt: 1250,
      dock: "Dermaga 1",
      ata: "16 Nov 2026, 07:55 WIB",
      atb: "16 Nov 2026, 08:02 WIB",
      atd: "16 Nov 2026, 09:35 WIB",
      actualHours: 2, // Rounded up as per PP 35/2023
      mooringFee: 300000, // 1250 * 2 * 120
      anchorageFee: 50000, // 1250 * 40
      lineHandlingFee: 150000,
      utilityWaterFee: 980000, // 35 m3 * 28.000
      totalAmount: 1480000,
      dueDate: "19 Nov 2026",
      status: "unpaid",
      bankVaNumber: "9920 1840 2910 4401",
    },
    {
      id: "INV-02",
      invoiceNo: "SKRD-KPL-MRK-2026-0398",
      vesselName: "KMP Mutiara Persada",
      gt: 1800,
      dock: "Dermaga 2",
      ata: "15 Nov 2026, 13:50 WIB",
      atb: "15 Nov 2026, 14:00 WIB",
      atd: "15 Nov 2026, 15:45 WIB",
      actualHours: 2,
      mooringFee: 432000,
      anchorageFee: 72000,
      lineHandlingFee: 150000,
      utilityWaterFee: 1400000,
      totalAmount: 2054000,
      dueDate: "18 Nov 2026",
      status: "paid",
      ssrdNo: "SSRD-MRK-2026-0398",
      paidAt: "15 Nov 2026, 17:22 WIB",
      bankVaNumber: "9920 1840 2910 3982",
    },
    {
      id: "INV-03",
      invoiceNo: "SKRD-KPL-MRK-2026-0365",
      vesselName: "KMP Nusantara Express",
      gt: 2100,
      dock: "Dermaga Eksekutif 1",
      ata: "14 Nov 2026, 18:20 WIB",
      atb: "14 Nov 2026, 18:30 WIB",
      atd: "14 Nov 2026, 20:10 WIB",
      actualHours: 2,
      mooringFee: 756000, // 2100 * 2 * 180 (Eksekutif)
      anchorageFee: 84000,
      lineHandlingFee: 150000,
      utilityWaterFee: 840000,
      totalAmount: 1830000,
      dueDate: "17 Nov 2026",
      status: "paid",
      ssrdNo: "SSRD-MRK-2026-0365",
      paidAt: "14 Nov 2026, 21:05 WIB",
      bankVaNumber: "9920 1840 2910 3651",
    },
  ]);

  const unpaidInvoices = invoices.filter((i) => i.status === "unpaid");
  const paidInvoices = invoices.filter((i) => i.status === "paid");

  const totalUnpaid = unpaidInvoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalPaid = paidInvoices.reduce((acc, i) => acc + i.totalAmount, 0);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleOpenPayment = (inv: SKRDInvoice) => {
    setSelectedInvoice(inv);
    setIsPaymentModalOpen(true);
  };

  const handleOpenSSRD = (inv: SKRDInvoice) => {
    setSelectedInvoice(inv);
    setIsSSRDModalOpen(true);
  };

  const handleConfirmHostToHostPayment = () => {
    if (!selectedInvoice) return;
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsPaymentModalOpen(false);

      // Update invoice to paid
      setInvoices((prev) =>
        prev.map((item) =>
          item.id === selectedInvoice.id
            ? {
                ...item,
                status: "paid",
                ssrdNo: `SSRD-MRK-2026-0${Math.floor(400 + Math.random() * 100)}`,
                paidAt: "Hari ini, 14:10 WIB",
              }
            : item
        )
      );

      setSuccessToast(`Pembayaran ${selectedInvoice.invoiceNo} telah direkonsiliasi otomatis oleh Bank Kas Daerah (RKUD). Bukti Setor e-SSRD terbit!`);
      setTimeout(() => setSuccessToast(null), 5000);
    }, 1200);
  };

  const handleCopyVA = () => {
    if (!selectedInvoice) return;
    navigator.clipboard?.writeText(selectedInvoice.bankVaNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-fade-in border border-emerald-500">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-white hover:text-emerald-100 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. FINANCIAL SUMMARY KPI DECK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tagihan Unpaid */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full">
              {unpaidInvoices.length} e-SKRD Aktif
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Tagihan e-SKRD Belum Bayar
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            {formatRupiah(totalUnpaid)}
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Jatuh tempo: 19 November 2026
          </p>
        </div>

        {/* KPI 2: Total Lunas Bulan Ini */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
              Lunas RKUD
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Retribusi Terbayar Bulan Ini
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            {formatRupiah(totalPaid)}
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 inline" />
            <span className="text-emerald-700 font-bold">100% Rekonsiliasi Otomatis</span>
          </p>
        </div>

        {/* KPI 3: Jam Layanan Sandar */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Clock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-full">
              Aktual Sandar
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Rata-rata Waktu Sandar
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            1 Jam 35 Mnt
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Waktu turn-around muat kapal efisien
          </p>
        </div>

        {/* KPI 4: Kepatuhan Pajak / Retribusi */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              Grade A
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Status Kepatuhan Bapenda
          </p>
          <p className="text-xl font-extrabold text-emerald-700 font-mono mt-1">
            Bebas Tunggakan
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Hak prioritas alokasi dermaga aktif
          </p>
        </div>
      </div>

      {/* 2. TABS NAVIGATOR: TAGIHAN AKTIF VS RIWAYAT TRANSAKSI */}
      <div className="flex items-center gap-2 border-b border-[#CBD5E1] pb-2">
        <button
          onClick={() => setActiveTab("unpaid")}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "unpaid"
              ? "bg-[#0B241E] text-white shadow-sm"
              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
          }`}
        >
          <Receipt className="w-4 h-4 text-[#D97706]" />
          <span>Tagihan e-SKRD Belum Dibayar ({unpaidInvoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "history"
              ? "bg-[#0B241E] text-white shadow-sm"
              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Riwayat Pelayanan & Kuitansi e-SSRD ({paidInvoices.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: DAFTAR TAGIHAN e-SKRD (UNPAID)                          */}
      {/* ============================================================== */}
      {activeTab === "unpaid" && (
        <div className="space-y-4">
          {unpaidInvoices.length === 0 ? (
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-8 text-center text-xs text-[#64748B] space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="font-bold text-[#0B241E] text-sm">Tidak ada tagihan tertunda!</p>
              <p>Seluruh kewajiban retribusi jasa kapal Anda telah lunas.</p>
            </div>
          ) : (
            unpaidInvoices.map((inv) => (
              <div
                key={inv.id}
                className="bg-white border-2 border-amber-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-5"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                        {inv.invoiceNo}
                      </span>
                      <h3 className="font-extrabold text-sm text-[#0B241E]">
                        {inv.vesselName} ({inv.gt.toLocaleString()} GT)
                      </h3>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Pelayanan di {inv.dock} • Jatuh Tempo: {inv.dueDate}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">Total Tagihan Retribusi</span>
                    <p className="font-mono text-xl font-black text-[#0B241E]">
                      {formatRupiah(inv.totalAmount)}
                    </p>
                  </div>
                </div>

                {/* Timestamps Waktu Pelayanan Aktual */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] text-xs">
                  <div>
                    <span className="text-[10px] text-[#94A3B8] font-bold block">WAKTU AKTUAL DATANG (ATA)</span>
                    <strong className="text-[#0B241E] font-mono">{inv.ata}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#94A3B8] font-bold block">WAKTU AKTUAL SANDAR (ATB)</span>
                    <strong className="text-[#0B241E] font-mono">{inv.atb}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#94A3B8] font-bold block">WAKTU BERTOLAK (ATD)</span>
                    <strong className="text-[#0B241E] font-mono">{inv.atd}</strong>
                  </div>
                </div>

                {/* Rincian Komponen Biaya Sesuai PP 35/2023 */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#64748B]">
                    <span>Jasa Tambat & Sandar ({inv.gt} GT × {inv.actualHours} Jam × Rp 120):</span>
                    <span className="font-mono text-[#0B241E]">{formatRupiah(inv.mooringFee)}</span>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>Jasa Labuh Kapal ({inv.gt} GT × Rp 40):</span>
                    <span className="font-mono text-[#0B241E]">{formatRupiah(inv.anchorageFee)}</span>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>Jasa Tali Kepil & Tambat:</span>
                    <span className="font-mono text-[#0B241E]">{formatRupiah(inv.lineHandlingFee)}</span>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>Penyaluran Air Bersih Pelabuhan (35 m³):</span>
                    <span className="font-mono text-[#0B241E]">{formatRupiah(inv.utilityWaterFee)}</span>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-3 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Terhubung ke Rekening Kas Umum Daerah (RKUD) Pemda Banten.</span>
                  </div>

                  <button
                    onClick={() => handleOpenPayment(inv)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-[#D97706]" />
                    <span>Bayar Tagihan e-SKRD Sekarang</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: RIWAYAT PELAYANAN & KUITANSI e-SSRD                     */}
      {/* ============================================================== */}
      {activeTab === "history" && (
        <div className="bg-white border border-[#CBD5E1] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3 px-4">No. Invoice & SSRD</th>
                  <th className="py-3 px-4">Armada Kapal</th>
                  <th className="py-3 px-4">Dermaga & Tanggal</th>
                  <th className="py-3 px-4 text-right">Nilai Retribusi</th>
                  <th className="py-3 px-4">Waktu Pelunasan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Kuitansi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {paidInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <p className="font-bold text-[#0B241E]">{inv.invoiceNo}</p>
                      <p className="text-[10px] text-emerald-700 font-semibold">{inv.ssrdNo}</p>
                    </td>

                    <td className="py-3 px-4 font-bold text-[#0B241E]">
                      {inv.vesselName} ({inv.gt} GT)
                    </td>

                    <td className="py-3 px-4 text-[#475569]">
                      <p>{inv.dock}</p>
                      <p className="text-[10px] text-[#94A3B8]">{inv.atb.split(",")[0]}</p>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-800">
                      {formatRupiah(inv.totalAmount)}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-[#64748B]">
                      {inv.paidAt}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Lunas RKUD
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenSSRD(inv)}
                        className="px-3 py-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#0B241E] hover:text-white text-[#0B241E] text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>e-SSRD</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. MODAL PEMBAYARAN DIGITAL (VA BANK RKUD & QRIS) */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#CBD5E1] overflow-hidden my-8">
            <div className="bg-[#0B241E] text-white p-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-[#D97706]" />
                <h3 className="font-bold text-sm">
                  Pembayaran Retribusi e-SKRD Jasa Kapal
                </h3>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-[#85A69B] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Summary */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Nomor e-SKRD:</span>
                  <span className="font-mono font-bold text-[#0B241E]">{selectedInvoice.invoiceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Armada:</span>
                  <strong className="text-[#0B241E]">{selectedInvoice.vesselName} ({selectedInvoice.gt} GT)</strong>
                </div>
                <div className="flex justify-between border-t border-[#E2E8F0] pt-2 text-sm font-extrabold text-[#0B241E]">
                  <span>Total Tagihan:</span>
                  <span className="font-mono text-[#D97706] text-base">{formatRupiah(selectedInvoice.totalAmount)}</span>
                </div>
              </div>

              {/* Bank Persepsi Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#0B241E]">
                  Pilih Bank Rekening Kas Umum Daerah (RKUD):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBank("bank_banten")}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                      selectedBank === "bank_banten"
                        ? "bg-[#0B241E] text-white border-[#0B241E]"
                        : "bg-white border-[#CBD5E1] text-[#64748B]"
                    }`}
                  >
                    Bank Banten (RKUD)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedBank("bank_mandiri")}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                      selectedBank === "bank_mandiri"
                        ? "bg-[#0B241E] text-white border-[#0B241E]"
                        : "bg-white border-[#CBD5E1] text-[#64748B]"
                    }`}
                  >
                    Bank Mandiri
                  </button>
                </div>
              </div>

              {/* Dynamic Virtual Account Box */}
              <div className="p-5 bg-[#FAFCFF] border-2 border-dashed border-[#0B241E]/40 rounded-xl text-center space-y-3">
                <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                  Nomor Virtual Account Host-to-Host:
                </span>
                <p className="font-mono text-xl font-black text-[#0B241E] tracking-wider">
                  {selectedInvoice.bankVaNumber}
                </p>
                <button
                  type="button"
                  onClick={handleCopyVA}
                  className="text-xs font-bold text-[#0284C7] hover:underline"
                >
                  {isCopied ? "✓ Nomor VA Berhasil Disalin!" : "Salin Nomor VA"}
                </button>
                <p className="text-[10px] text-[#64748B]">
                  Sistem otomatis mendeteksi pelunasan dari bank tanpa perlu upload struk transfer.
                </p>
              </div>

              {/* Confirm Host to Host Simulator Button */}
              <button
                type="button"
                onClick={handleConfirmHostToHostPayment}
                disabled={isProcessing}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Merekonsiliasi Status Pembayaran Bank...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simulasikan Pembayaran Berhasil (Konfirmasi Bank RKUD)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL BUKTI SETOR e-SSRD (Surat Setoran Retribusi Daerah) */}
      {isSSRDModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-[#CBD5E1] overflow-hidden my-8">
            <div className="bg-[#0B241E] text-white p-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#D97706]" />
                <h3 className="font-bold text-sm">
                  Kuitansi Resmi e-SSRD (Bukti Setor Retribusi Daerah)
                </h3>
              </div>
              <button
                onClick={() => setIsSSRDModalOpen(false)}
                className="text-[#85A69B] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs bg-[#FAFAFA]">
              {/* Document Kop */}
              <div className="text-center border-b-2 border-[#0B241E] pb-3">
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">
                  PEMERINTAH DAERAH PROVINSI BANTEN • BADAN PENDAPATAN DAERAH
                </p>
                <h4 className="text-sm font-extrabold text-[#0B241E] uppercase mt-0.5">
                  SURAT SETORAN RETRIBUSI DAERAH (e-SSRD)
                </h4>
                <p className="text-[10px] text-[#64748B]">
                  Penerimaan Jasa Pelabuhan Sesuai Amanat PP No. 35 Tahun 2023
                </p>
                <div className="mt-2 inline-block px-3 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-300 font-mono font-bold text-[10px]">
                  Nomor: {selectedInvoice.ssrdNo || "SSRD-MRK-2026-LUNAS"}
                </div>
              </div>

              {/* Rincian Setor */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Wajib Retribusi:</span>
                  <strong className="text-[#0B241E]">PT ASDP Indonesia Ferry (Persero)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Nama Armada:</span>
                  <strong className="text-[#0B241E]">{selectedInvoice.vesselName} ({selectedInvoice.gt} GT)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Pelayanan:</span>
                  <span className="text-[#0B241E]">Jasa Tambat & Sandar ({selectedInvoice.dock})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Waktu Pembayaran:</span>
                  <span className="font-mono text-[#0B241E]">{selectedInvoice.paidAt}</span>
                </div>
                <div className="flex justify-between border-t border-[#E2E8F0] pt-2 font-extrabold text-sm text-emerald-900">
                  <span>Jumlah Setor:</span>
                  <span className="font-mono">{formatRupiah(selectedInvoice.totalAmount)}</span>
                </div>
              </div>

              {/* Digital Stamp */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-[11px] text-emerald-950">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <div>
                    <p className="font-bold">STATUS: LUNAS DI REKENING KAS DAERAH</p>
                    <p className="text-[10px] text-emerald-800">NTEB: 9940182901192801 (Bank Banten)</p>
                  </div>
                </div>
                <QrCode className="w-8 h-8 text-emerald-900" />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white border border-[#CBD5E1] hover:bg-[#F1F5F9] text-[#0B241E] font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Dokumen e-SSRD</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSSRDModalOpen(false)}
                  className="px-4 py-2 bg-[#0B241E] text-white font-extrabold rounded-xl hover:bg-[#143E33] cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
