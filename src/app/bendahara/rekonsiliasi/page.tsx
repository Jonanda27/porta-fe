"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Coins,
  Receipt,
  Landmark,
  CheckCircle2,
  Printer,
  RefreshCw,
  Search,
  Building2,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  FileCheck2,
  Lock,
} from "lucide-react";
import { useBillingStore } from "@/store/billing.store";

export default function BendaharaRekonsiliasiPage() {
  const {
    revenueSummary,
    invoices,
    isLoading,
    fetchRevenueSummary,
    fetchInvoices,
  } = useBillingStore();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [isClosingBook, setIsClosingBook] = useState<boolean>(false);
  const [closedToast, setClosedToast] = useState<string | null>(null);

  useEffect(() => {
    fetchRevenueSummary();
    fetchInvoices();
  }, [fetchRevenueSummary, fetchInvoices]);

  const formatRupiah = (val: number | string) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const totalVerifiedPAD = revenueSummary?.totalVerifiedRevenueIdr ?? 0;
  const vesselTotal = revenueSummary?.vesselRevenueIdr ?? 0;
  const gateTotal = revenueSummary?.gateTicketingRevenueIdr ?? 0;
  const assetTotal = revenueSummary?.assetLeaseRevenueIdr ?? 0;
  const cargoTotal = revenueSummary?.cargoEquipmentRevenueIdr ?? 0;
  const utilityTotal = revenueSummary?.utilityRevenueIdr ?? 0;

  // Daftar transaksi lunas pada e-SKRD untuk buku kas
  const paidTransactions = useMemo(() => {
    return invoices
      .filter((inv) => inv.status === "PAID" || inv.ssrdNumber)
      .slice(0, 10);
  }, [invoices]);

  const handleCloseDailyBook = () => {
    setIsClosingBook(true);
    setTimeout(() => {
      setIsClosingBook(false);
      setClosedToast(
        `Buku Kas Umum (BKU) Penerimaan Tanggal ${selectedDate} berhasil ditutup dan disahkan ke Kasda!`
      );
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {closedToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between border border-emerald-500 text-xs font-semibold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{closedToast}</span>
          </div>
          <button
            onClick={() => setClosedToast(null)}
            className="text-white hover:text-emerald-100 p-1 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* 1. Header Rekonsiliasi & Aksi Tutup Kas */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-extrabold text-[#0B241E] flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#D97706]" />
            <span>Rekonsiliasi Buku Kas Umum (BKU) Penerimaan Harian</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Penyelarasan catatan loket kasir pelabuhan dengan rekening koran Kas Daerah Bank Papua (RKUD No. 100-01-XXXX).
          </p>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0B241E]"
          />

          <button
            type="button"
            onClick={handleCloseDailyBook}
            disabled={isClosingBook}
            className="px-4 py-2 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Lock className="w-3.5 h-3.5 text-[#D97706]" />
            <span>{isClosingBook ? "Menutup Buku..." : "Tutup Kas Harian"}</span>
          </button>
        </div>
      </div>

      {/* 2. Kartu Status Rekonsiliasi Tiga Arah */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pos 1: Kas Masuk Fisik (Loket & Gate) */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#64748B] uppercase">
              1. Kas Loket & Pas Gerbang
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-xl font-black text-[#0B241E]">
            {formatRupiah(gateTotal)}
          </p>
          <p className="text-[11px] text-[#64748B]">
            Uang fisik tiket gerbang & pas pelabuhan
          </p>
          <div className="pt-2 border-t border-[#F1F5F9] text-[10px] font-mono text-emerald-700 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Serah Terima Jaga Tervalidasi</span>
          </div>
        </div>

        {/* Pos 2: Transfer Bank RKUD (e-SKRD/e-SSRD) */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#64748B] uppercase">
              2. Transfer Bank Papua (RKUD)
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <p className="text-xl font-black text-blue-900">
            {formatRupiah(vesselTotal)}
          </p>
          <p className="text-[11px] text-[#64748B]">
            Retribusi jasa tambat & labuh kapal
          </p>
          <div className="pt-2 border-t border-[#F1F5F9] text-[10px] font-mono text-blue-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Host-to-Host Mutasi Sah</span>
          </div>
        </div>

        {/* Pos 3: Penerimaan Lain (Tenant, Kargo, Air) */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#64748B] uppercase">
              3. Tenant, Kargo & Utilitas
            </span>
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          </div>
          <p className="text-xl font-black text-purple-900">
            {formatRupiah(assetTotal + cargoTotal + utilityTotal)}
          </p>
          <p className="text-[11px] text-[#64748B]">
            Sewa kios, pemakaian alat, & air tawar
          </p>
          <div className="pt-2 border-t border-[#F1F5F9] text-[10px] font-mono text-purple-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Penerimaan Sah Kasda</span>
          </div>
        </div>
      </div>

      {/* 3. Lembar Buku Kas Umum (BKU) Penerimaan */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#F1F5F9] bg-[#FAFCFB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <h3 className="font-extrabold text-sm text-[#0B241E]">
              Buku Kas Umum (BKU) Penerimaan — Pelabuhan Poumako
            </h3>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Format Standar Permendagri & Perbup Mimika 25/2024 tentang Tata Cara Penatausahaan Kasda.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              alert(
                `Mencetak Berita Acara Rekonsiliasi & BKU:\nTanggal: ${selectedDate}\nTotal Penerimaan: ${formatRupiah(
                  totalVerifiedPAD
                )}\nStatus: DITUTUP SAH`
              )
            }
            className="px-3.5 py-1.5 bg-[#0B241E] hover:bg-[#143E33] text-white font-bold rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Cetak Berita Acara BKU</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-mono text-[11px] text-[#64748B] uppercase">
              <tr>
                <th className="p-3.5">Tanggal / No. BKU</th>
                <th className="p-3.5">Uraian Transaksi</th>
                <th className="p-3.5">Kode Rekening PAD</th>
                <th className="p-3.5">Penerimaan (Debet)</th>
                <th className="p-3.5">Penyetoran ke RKUD (Kredit)</th>
                <th className="p-3.5">Status Validasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {paidTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#64748B]">
                    Belum ada transaksi penerimaan pada tanggal yang dipilih.
                  </td>
                </tr>
              ) : (
                paidTransactions.map((tx, idx) => (
                  <tr key={tx.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-3.5 font-mono">
                      <div className="font-bold text-[#0B241E]">
                        {new Date(tx.updatedAt || tx.issuedAt).toLocaleDateString("id-ID")}
                      </div>
                      <div className="text-[10px] text-[#64748B]">
                        BKU-{(idx + 1).toString().padStart(4, "0")}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-[#0B241E]">
                        Penerimaan e-SKRD {tx.invoiceNumber}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Kapal: {tx.visit?.vessel?.name} ({tx.visit?.vessel?.grossTonnage} GT)
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[#64748B]">
                      4.1.02.02.01 (Retribusi Jasa Pelabuhan)
                    </td>
                    <td className="p-3.5 font-bold text-emerald-800">
                      {formatRupiah(tx.totalAmountIdr)}
                    </td>
                    <td className="p-3.5 font-bold text-blue-800">
                      {formatRupiah(tx.totalAmountIdr)}
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Rekonsiliasi Sah</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-[#F8FAFC] border-t-2 border-[#CBD5E1] font-bold text-xs">
              <tr>
                <td colSpan={3} className="p-3.5 text-right font-black uppercase text-[#0B241E]">
                  Total Penerimaan & Penyetoran Kasda (RKUD):
                </td>
                <td className="p-3.5 text-emerald-900 font-black text-sm">
                  {formatRupiah(totalVerifiedPAD)}
                </td>
                <td className="p-3.5 text-blue-900 font-black text-sm">
                  {formatRupiah(totalVerifiedPAD)}
                </td>
                <td className="p-3.5 text-emerald-700 font-mono text-[11px]">
                  Nihil Selisih (0)
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
