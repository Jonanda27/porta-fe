"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  DollarSign,
  CreditCard,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Printer,
  ShieldCheck,
  UserCheck,
  Building2,
  RefreshCw,
  FileText,
  Lock,
  Eye,
  X,
  ChevronRight,
  TrendingUp,
  Receipt,
  Download,
  Upload,
  Calendar,
  Check,
  Calculator,
  Coins,
  History,
  Info,
  BadgeAlert,
} from "lucide-react";

// =========================================================================
// TYPES & DATA STRUCTURES (PP 35/2023 & Perbup Mimika 25/2024)
// =========================================================================

interface CounterBreakdown {
  id: string;
  name: string;
  operator: string;
  transactions: number;
  nonCash: number;
  cashPhysical: number;
  systemTotal: number;
  discrepancy: number;
  status: "matched" | "discrepancy";
}

// Penatausahaan Dokumen yang Dipersamakan / Karcis Porporasi (Pasal 94 ayat 3)
interface KarcisStockBook {
  serviceName: string;
  nominalTarif: number;
  serialPrefix: string;
  startSerial: number;
  endSerial: number;
  usedCount: number;
  voidCount: number;
  remainingStock: number;
}

export default function UptShiftPage() {
  // Active Shift Selector
  const [activeShift, setActiveShift] = useState<"shift1" | "shift2" | "shift3">("shift1");
  const [activeViewTab, setActiveViewTab] = useState<"reconciliation" | "karcis" | "bank_deposit" | "history">("reconciliation");

  // Modals & States
  const [isBASTModalOpen, setIsBASTModalOpen] = useState<boolean>(false);
  const [isCashCalcModalOpen, setIsCashCalcModalOpen] = useState<boolean>(false);
  const [isBankDepositModalOpen, setIsBankDepositModalOpen] = useState<boolean>(false);

  // Maker-Checker Approvals
  const [isApprovedByChecker, setIsApprovedByChecker] = useState<boolean>(false);
  const [checkerNotes, setCheckerNotes] = useState<string>(
    "Seluruh fisik uang tunai di brankas telah dihitung bersama secara uji petik. Jumlah klop tanpa selisih, siap disetor ke Kas Daerah dalam 1x24 jam."
  );
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Countdown timer for 1x24 Jam Penyetoran ke RKUD (Pasal 18 huruf e)
  // Sif selesai jam 14:00, batas setor esok hari jam 14:00 (tersisa misal 18 jam 32 menit)
  const [depositCountdownHours, setDepositCountdownHours] = useState<number>(18);
  const [depositCountdownMinutes, setDepositCountdownMinutes] = useState<number>(32);

  // Bank Deposit State (Slip Setoran 1x24 Jam)
  const [bankDepositData, setBankDepositData] = useState<{
    bankName: string;
    rkudAccountNumber: string;
    ntpdNumber: string;
    depositAmount: number;
    depositDate: string;
    status: "MENUNGGU_SETOR" | "SUDAH_DISETOR" | "TERVERIFIKASI_BAPENDA";
    slipFileName?: string;
  }>({
    bankName: "PT Bank Papua (Perseroda) Cabang Timika",
    rkudAccountNumber: "100-01-02-00481-9 (RKUD Mimika Penerimaan Pelabuhan)",
    ntpdNumber: "NTPD-MMK-20261116-004812",
    depositAmount: 11430000,
    depositDate: "16 November 2026",
    status: "MENUNGGU_SETOR",
  });

  // Physical Cash Denomination Calculator
  const [denominations, setDenominations] = useState<{ [key: string]: number }>({
    "100k": 70, // 70 x 100,000 = 7,000,000
    "50k": 60,  // 60 x 50,000  = 3,000,000
    "20k": 50,  // 50 x 20,000  = 1,000,000
    "10k": 35,  // 35 x 10,000  = 350,000
    "5k": 12,   // 12 x 5,000   = 60,000
    "2k": 10,   // 10 x 2,000   = 20,000
    "koin": 0,  // 0
  });

  const calculatedCashTotal =
    (denominations["100k"] || 0) * 100000 +
    (denominations["50k"] || 0) * 50000 +
    (denominations["20k"] || 0) * 20000 +
    (denominations["10k"] || 0) * 10000 +
    (denominations["5k"] || 0) * 5000 +
    (denominations["2k"] || 0) * 2000 +
    (denominations["koin"] || 0);

  // Counter breakdown mock data for Shift 1
  const [counters, setCounters] = useState<CounterBreakdown[]>([
    {
      id: "LK-01",
      name: "Loket 1 - Pas Penumpang Pejalan Kaki",
      operator: "Ahmad Fadillah (NIP: 19890412 201503 1 002)",
      transactions: 412,
      nonCash: 3296000,
      cashPhysical: 1824000,
      systemTotal: 5120000,
      discrepancy: 0,
      status: "matched",
    },
    {
      id: "LK-02",
      name: "Loket 2 - Sepeda Motor & Gol II-III",
      operator: "Siti Nurhaliza (NIP: 19930819 201802 2 001)",
      transactions: 368,
      nonCash: 4416000,
      cashPhysical: 2944000,
      systemTotal: 7360000,
      discrepancy: 0,
      status: "matched",
    },
    {
      id: "LK-03",
      name: "Loket 3 - Mobil Pribadi & Gol IVA-IVB",
      operator: "Budi Prasetyo (NIP: 19861103 201201 1 003)",
      transactions: 245,
      nonCash: 17150000,
      cashPhysical: 4900000,
      systemTotal: 22050000,
      discrepancy: 0,
      status: "matched",
    },
    {
      id: "GT-04",
      name: "Gate 4 - Truk Logistik (Gol V - VIII)",
      operator: "Dedi Supriyadi (NIP: 19870514 201402 1 004)",
      transactions: 95,
      nonCash: 6558000,
      cashPhysical: 1762000,
      systemTotal: 8320000,
      discrepancy: 0,
      status: "matched",
    },
  ]);

  // Penatausahaan Stok Fisik Karcis Porporasi Bapenda Sif 1 (Pasal 94 ayat 3)
  const [karcisStock] = useState<KarcisStockBook[]>([
    {
      serviceName: "Pas Pejalan Kaki (Dewasa)",
      nominalTarif: 8000,
      serialPrefix: "KRC-MMK-2024-",
      startSerial: 42001,
      endSerial: 42412,
      usedCount: 412,
      voidCount: 1,
      remainingStock: 1587,
    },
    {
      serviceName: "Karcis Sepeda Motor (Gol II)",
      nominalTarif: 25000,
      serialPrefix: "KRC-MMK-2024-",
      startSerial: 51001,
      endSerial: 51368,
      usedCount: 368,
      voidCount: 0,
      remainingStock: 2132,
    },
    {
      serviceName: "Karcis Mobil Pribadi (Gol IVA)",
      nominalTarif: 120000,
      serialPrefix: "KRC-MMK-2024-",
      startSerial: 78001,
      endSerial: 78245,
      usedCount: 245,
      voidCount: 0,
      remainingStock: 1255,
    },
    {
      serviceName: "Karcis Truk Logistik (Gol V-VII)",
      nominalTarif: 410000,
      serialPrefix: "KRC-MMK-2024-",
      startSerial: 92001,
      endSerial: 92095,
      usedCount: 95,
      voidCount: 0,
      remainingStock: 905,
    },
  ]);

  const totalTransactions = counters.reduce((acc, c) => acc + c.transactions, 0);
  const totalNonCash = counters.reduce((acc, c) => acc + c.nonCash, 0);
  const totalCash = counters.reduce((acc, c) => acc + c.cashPhysical, 0);
  const grandTotal = counters.reduce((acc, c) => acc + c.systemTotal, 0);
  const totalDiscrepancy = calculatedCashTotal - totalCash;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleApproveChecker = () => {
    setIsApprovedByChecker(true);
    setSuccessToast("Laporan Sif 1 disahkan oleh Supervisor Syahbandar. Berita Acara Serah Terima (BAST) resmi diterbitkan!");
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const handleConfirmBankDeposit = () => {
    setBankDepositData((prev) => ({
      ...prev,
      status: "SUDAH_DISETOR",
      slipFileName: "SLIP_SETOR_BANK_PAPUA_16NOV2026.pdf",
    }));
    setIsBankDepositModalOpen(false);
    setSuccessToast("Setoran Bruto Rp 11.430.000 berhasil dicatat! Menunggu rekonsiliasi host-to-host Bapenda.");
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const handlePrintBAST = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-fade-in border border-emerald-500">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <p className="text-sm font-semibold">{successToast}</p>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-white hover:text-emerald-100 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP SHIFT CONTROL & COUNTDOWN BANNER (PASAL 18 HURUF E PERBUP 25/2024) */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-[#0B241E] tracking-tight">
                Rekonsiliasi Sif & Penutupan Buku Kasir
              </h2>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Sif 1 Aktif
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Senin, 16 November 2026 • Pelabuhan Penyeberangan Pomako / Merak • Berdasarkan Perbup Mimika 25/2024
            </p>
          </div>
        </div>

        {/* 1x24 Jam Deposit Alert Widget */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs">
            <BadgeAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-amber-900 uppercase">
                Batas Waktu Setor Kas Daerah (1x24 Jam):
              </p>
              <p className="font-mono font-extrabold text-amber-800">
                Tersisa {depositCountdownHours} Jam {depositCountdownMinutes} Menit{" "}
                <span className="text-[10px] font-normal font-sans">
                  ({bankDepositData.status === "SUDAH_DISETOR" ? "Disetor ke Bank" : "Wajib Sebelum Besok 14:00"})
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCashCalcModalOpen(true)}
              className="px-3 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0B241E] text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-[#CBD5E1]"
            >
              <Calculator className="w-3.5 h-3.5 text-[#0B241E]" />
              <span>Hitung Uang Fisik</span>
            </button>

            <button
              onClick={() => setIsBankDepositModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Slip Setor Bank (1x24 Jam)</span>
            </button>

            <button
              onClick={() => setIsBASTModalOpen(true)}
              className="px-3.5 py-2 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Dokumen BAST</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. OVERLAPPING SHIFT KPI SUMMARY CARDS                                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
              {totalTransactions} Karcis Terbit
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Total Retribusi Sif 1
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            {formatRupiah(grandTotal)}
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 inline" />
            <span className="text-emerald-700 font-bold">+12.4%</span>
            <span>vs target hari kerja</span>
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-full">
              73.3% Non-Tunai
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Penerimaan Non-Tunai (QRIS)
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            {formatRupiah(totalNonCash)}
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Langsung masuk RKUD Mimika otomatis
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Banknote className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full">
              Uang di Brankas
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Fisik Uang Tunai Bruto
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            {formatRupiah(totalCash)}
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Wajib disetor Bank Kasda $\le$ 24 jam (Pasal 18)
          </p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              {totalDiscrepancy === 0 ? "100% Klop" : "Ada Selisih"}
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Selisih Uji Petik Kasir
          </p>
          <p className={`text-xl font-mono mt-1 ${totalDiscrepancy === 0 ? "text-emerald-700 font-extrabold" : "text-rose-700 font-extrabold"}`}>
            {totalDiscrepancy === 0 ? "Rp 0 (Seimbang)" : formatRupiah(totalDiscrepancy)}
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
            <span>Fisik kas = Data sistem transaksi</span>
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SUB-VIEW TABS                                                          */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          type="button"
          onClick={() => setActiveViewTab("reconciliation")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeViewTab === "reconciliation"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0B241E] hover:bg-white"
          }`}
        >
          <Receipt className="w-4 h-4 text-[#D97706]" />
          <span>Rekonsiliasi Kasir & Pos Loket</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewTab("karcis")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeViewTab === "karcis"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0B241E] hover:bg-white"
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-[#D97706]" />
          <span>Buku Register Stok Karcis Porporasi (Pasal 94)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewTab("bank_deposit")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeViewTab === "bank_deposit"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0B241E] hover:bg-white"
          }`}
        >
          <Building2 className="w-4 h-4 text-[#D97706]" />
          <span>Penyetoran 1x24 Jam ke RKUD (Pasal 18)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW TAB 1: REKONSILIASI KASIR PER POS LOKET & GATE                       */}
      {/* ========================================================================= */}
      {activeViewTab === "reconciliation" && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFCFB]">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-[#0B241E]" />
                <div>
                  <h3 className="text-sm font-extrabold text-[#0B241E]">
                    Rincian Setoran Tiap Pos Loket & Gate Sif 1
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Pemisahan buku kas loket fisik vs penerimaan gate QRIS otomatis
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSuccessToast("Data transaksi loket telah disinkronkan ulang dengan sistem gate.");
                    setTimeout(() => setSuccessToast(null), 3000);
                  }}
                  className="text-xs text-[#0B241E] bg-[#F1F5F9] hover:bg-[#E2E8F0] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Transaksi</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    <th className="py-3 px-4">Pos Loket & Gate</th>
                    <th className="py-3 px-4">Petugas Kasir (Maker)</th>
                    <th className="py-3 px-4 text-center">Volume Karcis</th>
                    <th className="py-3 px-4 text-right">Non-Tunai (QRIS)</th>
                    <th className="py-3 px-4 text-right">Fisik Tunai</th>
                    <th className="py-3 px-4 text-right">Total Buku</th>
                    <th className="py-3 px-4 text-center">Selisih</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {counters.map((counter) => (
                    <tr key={counter.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#0B241E]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] bg-[#0B241E] text-white px-1.5 py-0.5 rounded">
                            {counter.id}
                          </span>
                          <span>{counter.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#475569]">
                        <p className="font-semibold text-[#0B241E]">{counter.operator.split("(")[0]}</p>
                        <p className="text-[10px] text-[#94A3B8] font-mono">
                          {counter.operator.includes("(") ? `(${counter.operator.split("(")[1]}` : ""}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[#0B241E]">
                        {counter.transactions}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-blue-700">
                        {formatRupiah(counter.nonCash)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-amber-700">
                        {formatRupiah(counter.cashPhysical)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#0B241E]">
                        {formatRupiah(counter.systemTotal)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-700">
                        {counter.discrepancy === 0 ? "Rp 0" : formatRupiah(counter.discrepancy)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Klop
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#F8FAFC] border-t-2 border-[#E2E8F0] font-extrabold text-[#0B241E]">
                    <td className="py-3.5 px-4" colSpan={2}>
                      TOTAL PENERIMAAN SIF 1 (06:00 - 14:00)
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-sm">
                      {totalTransactions}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-sm text-blue-800">
                      {formatRupiah(totalNonCash)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-sm text-amber-800">
                      {formatRupiah(totalCash)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-sm text-emerald-800">
                      {formatRupiah(grandTotal)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-emerald-800">
                      Rp 0
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        SEIMBANG
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Maker-Checker Workflow & Dual Signature Approval */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Step A: Maker */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0B241E]">
                      Pihak Pertama: Maker (Kasir Jaga Sif 1)
                    </h4>
                    <p className="text-[10px] text-[#64748B]">
                      Penyusun buku kas fisik & rekonsiliasi karcis porporasi
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Sudah Dibuat
                </span>
              </div>

              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Kasir Penanggung Jawab:</span>
                  <strong className="text-[#0B241E]">Ahmad Fadillah</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">NIP Pegawai:</span>
                  <span className="font-mono text-[#0B241E]">19890412 201503 1 002</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Waktu Perhitungan Fisik:</span>
                  <span className="font-mono text-[#0B241E]">Hari Ini, 13:45:10 WIB</span>
                </div>
                <div className="flex justify-between border-t border-[#E2E8F0] pt-2">
                  <span className="text-[#64748B]">Status Uang Fisik:</span>
                  <strong className="text-amber-700">Rp 11.430.000 (Tersimpan di Brankas Loket)</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#64748B] bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Tanda tangan digital Maker telah tercatat di audit log UPTD Pelabuhan.
                </span>
              </div>
            </div>

            {/* Step B: Checker */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0B241E]">
                      Pihak Kedua: Checker (Supervisor Syahbandar)
                    </h4>
                    <p className="text-[10px] text-[#64748B]">
                      Pemeriksa fisik, verifikasi rekening, dan pengesahan BAST
                    </p>
                  </div>
                </div>
                {isApprovedByChecker ? (
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Telah Disahkan
                  </span>
                ) : (
                  <span className="text-[10px] font-mono bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    Menunggu Persetujuan
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0B241E] mb-1">
                  Catatan Rekonsiliasi Supervisor:
                </label>
                <textarea
                  value={checkerNotes}
                  onChange={(e) => setCheckerNotes(e.target.value)}
                  disabled={isApprovedByChecker}
                  rows={2}
                  className="w-full text-xs p-2.5 border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#0B241E] disabled:bg-[#F1F5F9] text-[#0B241E]"
                  placeholder="Tuliskan catatan fisik uang atau kondisi serah terima..."
                />
              </div>

              <div className="pt-1 flex items-center justify-between gap-3">
                <div className="text-[11px] text-[#64748B]">
                  <span>Petugas: </span>
                  <strong className="text-[#0B241E]">Capt. Ridwan Hakim (Syahbandar)</strong>
                </div>

                {isApprovedByChecker ? (
                  <button
                    disabled
                    className="px-4 py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>BAST Sah & Tersimpan</span>
                  </button>
                ) : (
                  <button
                    onClick={handleApproveChecker}
                    className="px-4 py-2 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#D97706]" />
                    <span>Verifikasi & Sahkan Sif 1</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW TAB 2: PENATAUSAHAAN STOK KARCIS PORPORASI (PASAL 94 PERBUP 25/2024) */}
      {/* ========================================================================= */}
      {activeViewTab === "karcis" && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFCFB]">
              <div>
                <h3 className="text-sm font-extrabold text-[#0B241E]">
                  Buku Register Dokumen Dipersamakan (Karcis Porporasi Bapenda)
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Sesuai Pasal 94 ayat (3) Perbup Mimika 25/2024: pembukuan nomor seri, tanggal porporasi, jumlah terpakai, dan sisa stok fisik.
                </p>
              </div>

              <span className="text-[10px] font-mono bg-blue-50 text-blue-800 font-bold px-2.5 py-1 rounded-lg border border-blue-200">
                Porporasi Bapenda No: 974/PORP-BAP/XI/2026
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    <th className="py-3 px-4">Jenis Karcis Retribusi</th>
                    <th className="py-3 px-4 text-right">Tarif Karcis</th>
                    <th className="py-3 px-4">No. Seri Awal</th>
                    <th className="py-3 px-4">No. Seri Akhir</th>
                    <th className="py-3 px-4 text-center">Terpakai</th>
                    <th className="py-3 px-4 text-center">Rusak / Void</th>
                    <th className="py-3 px-4 text-center">Sisa Stok Diserahkan</th>
                    <th className="py-3 px-4 text-right">Total Nilai Terpakai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {karcisStock.map((stock, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC]/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#0B241E]">
                        {stock.serviceName}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-700">
                        {formatRupiah(stock.nominalTarif)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#475569]">
                        {stock.serialPrefix}{stock.startSerial}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#475569]">
                        {stock.serialPrefix}{stock.endSerial}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[#0B241E]">
                        {stock.usedCount} Lembar
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-rose-600 font-bold">
                        {stock.voidCount}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-extrabold text-blue-700">
                        {stock.remainingStock} Lembar
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#0B241E]">
                        {formatRupiah(stock.nominalTarif * stock.usedCount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#F8FAFC] border-t-2 border-[#E2E8F0] font-extrabold text-[#0B241E]">
                    <td className="py-3.5 px-4" colSpan={4}>
                      TOTAL KARCIS DIPERTANGGUNGJAWABKAN SIF 1
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-sm">
                      1.120 Lembar
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-sm text-rose-600">
                      1 Lembar
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-sm text-blue-800">
                      5.879 Lembar
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-sm text-emerald-800">
                      {formatRupiah(grandTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW TAB 3: PENYETORAN 1X24 JAM KE RKUD (PASAL 18 HURUF E)                 */}
      {/* ========================================================================= */}
      {activeViewTab === "bank_deposit" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Setoran Info & Countdown (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-5">
            <div className="pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-extrabold text-[#0B241E]">
                  Kepatuhan Penyetoran Bruto ke Kas Daerah (1 x 24 Jam)
                </h3>
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                Amanat <strong>Pasal 18 huruf e Perbup Mimika 25/2024</strong>: &quot;penyetoran hasil penerimaan retribusi... dilakukan oleh bendahara penerimaan pembantu paling lama 1 x 24 jam sejak saat diterimanya uang retribusi.&quot;
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Bank Rekening Kas Daerah (RKUD):</span>
                <strong className="text-[#0B241E]">{bankDepositData.bankName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Nomor Rekening Penerimaan:</span>
                <span className="font-mono font-bold text-emerald-800">{bankDepositData.rkudAccountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Nomor NTPD (Nomor Transaksi Bank):</span>
                <span className="font-mono text-[#0B241E] font-bold">{bankDepositData.ntpdNumber}</span>
              </div>
              <div className="flex justify-between border-t border-[#E2E8F0] pt-2">
                <span className="text-[#64748B]">Nominal Uang Tunai Bruto yang Disetor:</span>
                <strong className="text-base font-mono text-emerald-700">{formatRupiah(bankDepositData.depositAmount)}</strong>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-xs">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-950">Status Kepatuhan Hukum:</p>
                  <p className="text-[11px] text-emerald-800">
                    {bankDepositData.status === "SUDAH_DISETOR"
                      ? "Uang tunai bruto telah disetor ke teller bank persepsi dalam rentang waktu < 24 jam."
                      : "Uang tunai berada di brankas loket, siap diantar oleh Bendahara Pembantu ke Bank Papua."}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                bankDepositData.status === "SUDAH_DISETOR"
                  ? "bg-emerald-200 text-emerald-900"
                  : "bg-amber-200 text-amber-900"
              }`}>
                {bankDepositData.status === "SUDAH_DISETOR" ? "LUNAS DISETOR" : "SIAP DISETOR"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsBankDepositModalOpen(true)}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Unggah Bukti Slip Setoran Teller Bank & Input NTPD</span>
            </button>
          </div>

          {/* Right: Slip Setor Preview (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-extrabold text-[#0B241E] uppercase tracking-wider pb-2 border-b border-[#F1F5F9]">
              Bukti Slip Setoran Bank (SSRD)
            </h4>

            <div className="border border-dashed border-[#CBD5E1] rounded-xl p-5 bg-[#FAFAFA] text-center space-y-3">
              <FileCheck2 className="w-12 h-12 text-emerald-700 mx-auto" />
              <div>
                <p className="text-xs font-bold text-[#0B241E]">
                  {bankDepositData.slipFileName || "Belum ada berkas slip diunggah"}
                </p>
                <p className="text-[10px] text-[#64748B] mt-0.5">
                  Format PDF / Gambar Stempel Validasi Kasda Bank Persepsi
                </p>
              </div>

              <div className="p-3 bg-white border border-[#E2E8F0] rounded-lg text-left text-[11px] space-y-1.5 font-mono">
                <p>NTPD: {bankDepositData.ntpdNumber}</p>
                <p>Penyetor: Ahmad Fadillah (Bendahara Pembantu)</p>
                <p>Nominal: {formatRupiah(bankDepositData.depositAmount)}</p>
                <p>Tgl Setor: 16-11-2026 14:30 WIT</p>
              </div>

              <button
                type="button"
                onClick={() => alert("Mengunduh salinan Berita Acara Rekonsiliasi Bank Persepsi.")}
                className="px-3.5 py-1.5 text-xs font-bold text-[#0B241E] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Salinan SSRD</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: KALKULATOR PECAHAN FISIK UANG TUNAI LOKET                       */}
      {/* ========================================================================= */}
      {isCashCalcModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#CBD5E1] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#0B241E]" />
                <h3 className="text-sm font-extrabold text-[#0B241E]">
                  Kalkulator Uji Petik Pecahan Uang Fisik Kasir
                </h3>
              </div>
              <button
                onClick={() => setIsCashCalcModalOpen(false)}
                className="text-[#64748B] hover:text-[#0B241E] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Denomination Inputs */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { label: "Rp 100.000", key: "100k", mult: 100000 },
                { label: "Rp 50.000", key: "50k", mult: 50000 },
                { label: "Rp 20.000", key: "20k", mult: 20000 },
                { label: "Rp 10.000", key: "10k", mult: 10000 },
                { label: "Rp 5.000", key: "5k", mult: 5000 },
                { label: "Rp 2.000", key: "2k", mult: 2000 },
              ].map((item) => (
                <div key={item.key} className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-[#0B241E]">{item.label}</span>
                    <span className="text-[10px] text-[#64748B]">
                      = {formatRupiah((denominations[item.key] || 0) * item.mult)}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={denominations[item.key] || 0}
                    onChange={(e) =>
                      setDenominations({ ...denominations, [item.key]: Number(e.target.value) })
                    }
                    className="w-full p-1.5 bg-white border border-[#CBD5E1] rounded text-right font-mono font-bold text-[#0B241E]"
                  />
                </div>
              ))}
            </div>

            {/* Total Comparison */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Total Fisik Dihitung:</span>
                <strong className="text-base font-mono text-amber-700">{formatRupiah(calculatedCashTotal)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Target Transaksi Buku POS:</span>
                <span className="font-mono text-[#0B241E] font-bold">{formatRupiah(totalCash)}</span>
              </div>
              <div className="flex justify-between border-t border-[#E2E8F0] pt-2">
                <span className="font-bold text-[#0B241E]">Selisih Kas:</span>
                <strong className={`font-mono ${totalDiscrepancy === 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  {totalDiscrepancy === 0 ? "Rp 0 (KLOP SEIMBANG)" : formatRupiah(totalDiscrepancy)}
                </strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsCashCalcModalOpen(false);
                setSuccessToast("Penghitungan fisik uang kasir telah disimpan ke draft BAST.");
                setTimeout(() => setSuccessToast(null), 3000);
              }}
              className="w-full py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Simpan Hasil Uji Petik
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FORM BUKTI SETORAN BANK (SLIP 1X24 JAM KE RKUD)                  */}
      {/* ========================================================================= */}
      {isBankDepositModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#CBD5E1] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-extrabold text-[#0B241E]">
                  Konfirmasi Penyetoran Kas Daerah (Pasal 18)
                </h3>
              </div>
              <button
                onClick={() => setIsBankDepositModalOpen(false)}
                className="text-[#64748B] hover:text-[#0B241E] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#0B241E] mb-1">Bank Persepsi Kasda:</label>
                <input
                  type="text"
                  value={bankDepositData.bankName}
                  disabled
                  className="w-full p-2 bg-[#F1F5F9] border border-[#CBD5E1] rounded text-[#475569] font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0B241E] mb-1">Nomor Rekening RKUD Penerimaan:</label>
                <input
                  type="text"
                  value={bankDepositData.rkudAccountNumber}
                  disabled
                  className="w-full p-2 bg-[#F1F5F9] border border-[#CBD5E1] rounded text-[#475569] font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0B241E] mb-1">Nomor NTPD / Referensi Bank:</label>
                <input
                  type="text"
                  value={bankDepositData.ntpdNumber}
                  onChange={(e) => setBankDepositData({ ...bankDepositData, ntpdNumber: e.target.value })}
                  className="w-full p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded text-[#0B241E] font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0B241E] mb-1">Nominal Setoran Bruto:</label>
                <input
                  type="text"
                  value={formatRupiah(bankDepositData.depositAmount)}
                  disabled
                  className="w-full p-2 bg-[#F1F5F9] border border-[#CBD5E1] rounded text-emerald-800 font-mono font-extrabold text-sm"
                />
              </div>
            </div>

            <div className="p-3 border-2 border-dashed border-[#CBD5E1] rounded-xl text-center bg-[#FAFAFA]">
              <Upload className="w-8 h-8 text-[#64748B] mx-auto mb-1" />
              <p className="text-xs font-bold text-[#0B241E]">Klik untuk unggah Slip Setoran Teller</p>
              <p className="text-[10px] text-[#64748B]">Format file: JPG, PNG, atau PDF (Maks. 5 MB)</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmBankDeposit}
                className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Simpan & Sahkan Penyetoran
              </button>
              <button
                type="button"
                onClick={() => setIsBankDepositModalOpen(false)}
                className="px-4 py-2.5 bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PRATINJAU RESMI DOKUMEN BAST SESUAI PERBUP 25/2024               */}
      {/* ========================================================================= */}
      {isBASTModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#CBD5E1] overflow-hidden my-8">
            {/* Modal Header */}
            <div className="bg-[#0B241E] text-white p-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-[#D97706]" />
                <div>
                  <h3 className="font-bold text-sm">
                    Berita Acara Serah Terima (BAST) Sif Pelabuhan
                  </h3>
                  <p className="text-[11px] text-[#85A69B]">
                    Dokumen Resmi Penatausahaan Kas & Karcis (Perbup Mimika No. 25 Tahun 2024)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBASTModalOpen(false)}
                className="text-[#85A69B] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Government Official Document Template */}
            <div className="p-6 space-y-5 text-[#0B241E] bg-[#FAFAFA] max-h-[75vh] overflow-y-auto font-sans">
              {/* Document Header / Kop */}
              <div className="text-center border-b-2 border-[#0B241E] pb-3">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#475569]">
                  PEMERINTAH KABUPATEN MIMIKA • DINAS PERHUBUNGAN
                </p>
                <h4 className="text-sm font-extrabold tracking-tight uppercase mt-0.5">
                  UPTD PENGELOLAAN PELABUHAN REGIONAL POMAKO / MERAK
                </h4>
                <p className="text-[10px] text-[#64748B] mt-0.5">
                  Jl. Pelabuhan Pomako, Distrik Mimika Timur, Kabupaten Mimika, Papua Tengah
                </p>
                <div className="mt-2 inline-block px-3 py-0.5 bg-[#F1F5F9] rounded border border-[#CBD5E1] text-[10px] font-mono font-bold">
                  Nomor Register BAST: 552.1/BAST-SIF/UPTD-MMK/XI/2026/042
                </div>
              </div>

              {/* Body Statement */}
              <div className="text-xs leading-relaxed space-y-3">
                <p>
                  Pada hari ini, <strong>Senin</strong> tanggal <strong>16 November 2026</strong>, pukul <strong>14:00 WIT</strong> bertempat di Kantor Operasional UPTD Pelabuhan, kami yang bertanda tangan di bawah ini:
                </p>

                <div className="space-y-1.5 pl-3 border-l-2 border-[#CBD5E1] text-[11px]">
                  <p>
                    <strong>1. Pihak Pertama (Menyerahkan):</strong> Ahmad Fadillah (NIP: 19890412 201503 1 002) selaku Kasir Utama Sif 1 (06:00 - 14:00 WIT).
                  </p>
                  <p>
                    <strong>2. Pihak Kedua (Menerima):</strong> Hendra Saputra (NIP: 19910214 201602 1 003) selaku Kasir Utama Sif 2 (14:00 - 22:00 WIT).
                  </p>
                  <p>
                    <strong>3. Mengetahui / Checker:</strong> Capt. Ridwan Hakim (NIP: 19780521 200212 1 001) selaku Supervisor / Syahbandar UPTD.
                  </p>
                </div>

                <p>
                  Telah melakukan pemeriksaan fisik uang tunai, stok dokumen karcis porporasi (Pasal 94), dan rekonsiliasi data transaksi sistem PORTA dengan rincian sebagai berikut:
                </p>

                {/* Table Summary in BAST */}
                <table className="w-full text-left border-collapse border border-[#CBD5E1] text-[11px]">
                  <tbody>
                    <tr className="border-b border-[#CBD5E1] bg-[#F1F5F9]">
                      <td className="p-2 font-bold">Uraian Transaksi Rekonsiliasi</td>
                      <td className="p-2 text-right font-bold">Nilai / Jumlah</td>
                    </tr>
                    <tr className="border-b border-[#CBD5E1]">
                      <td className="p-2">Volume Karcis Porporasi Terbit (Sif 1)</td>
                      <td className="p-2 text-right font-mono font-bold">{totalTransactions} Lembar</td>
                    </tr>
                    <tr className="border-b border-[#CBD5E1]">
                      <td className="p-2">Sisa Karcis Diserahterimakan ke Sif 2</td>
                      <td className="p-2 text-right font-mono font-bold text-blue-700">5.879 Lembar</td>
                    </tr>
                    <tr className="border-b border-[#CBD5E1]">
                      <td className="p-2">Penerimaan Non-Tunai (QRIS Host-to-Host)</td>
                      <td className="p-2 text-right font-mono font-bold text-blue-700">{formatRupiah(totalNonCash)}</td>
                    </tr>
                    <tr className="border-b border-[#CBD5E1]">
                      <td className="p-2">Fisik Uang Tunai Bruto di Brankas (Wajib Setor 1x24 Jam)</td>
                      <td className="p-2 text-right font-mono font-bold text-amber-700">{formatRupiah(totalCash)}</td>
                    </tr>
                    <tr className="border-b border-[#CBD5E1] bg-emerald-50">
                      <td className="p-2 font-bold">Total Pendapatan Retribusi Sif 1</td>
                      <td className="p-2 text-right font-mono font-extrabold text-emerald-800">{formatRupiah(grandTotal)}</td>
                    </tr>
                    <tr>
                      <td className="p-2">Selisih Fisik vs Data Sistem POS</td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-700">Rp 0 (SEIMBANG / NIHIL)</td>
                    </tr>
                  </tbody>
                </table>

                {/* Signatures Row */}
                <div className="grid grid-cols-3 gap-2 pt-4 text-center text-[10px]">
                  <div className="border border-[#CBD5E1] p-2 rounded bg-white">
                    <p className="text-[#64748B]">Pihak Pertama (Menyerahkan)</p>
                    <div className="h-10 flex items-center justify-center font-serif italic text-emerald-700 font-bold">
                      [Ttd Digital: Ahmad F.]
                    </div>
                    <p className="font-bold border-t border-[#E2E8F0] pt-1">Ahmad Fadillah</p>
                    <p className="text-[#94A3B8]">Kasir Sif 1</p>
                  </div>

                  <div className="border border-[#CBD5E1] p-2 rounded bg-white">
                    <p className="text-[#64748B]">Pihak Kedua (Menerima)</p>
                    <div className="h-10 flex items-center justify-center font-serif italic text-blue-700 font-bold">
                      [Ttd Digital: Hendra S.]
                    </div>
                    <p className="font-bold border-t border-[#E2E8F0] pt-1">Hendra Saputra</p>
                    <p className="text-[#94A3B8]">Kasir Sif 2</p>
                  </div>

                  <div className="border border-[#CBD5E1] p-2 rounded bg-white">
                    <p className="text-[#64748B]">Mengetahui (Checker)</p>
                    <div className="h-10 flex items-center justify-center font-serif italic text-[#0B241E] font-bold">
                      {isApprovedByChecker ? "[Ttd Digital: Capt. Ridwan]" : "(Menunggu Approval)"}
                    </div>
                    <p className="font-bold border-t border-[#E2E8F0] pt-1">Capt. Ridwan Hakim</p>
                    <p className="text-[#94A3B8]">Supervisor Syahbandar</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-[#F1F5F9] border-t border-[#E2E8F0] p-4 px-6 flex items-center justify-between">
              <span className="text-xs text-[#64748B] flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Dokumen ini berstatus sah dan terenkripsi digital (Perbup Mimika 25/2024).</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintBAST}
                  className="px-3.5 py-2 bg-white hover:bg-[#E2E8F0] text-[#0B241E] border border-[#CBD5E1] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Dokumen BAST</span>
                </button>
                <button
                  onClick={() => setIsBASTModalOpen(false)}
                  className="px-4 py-2 bg-[#0B241E] hover:bg-[#143E33] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
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
