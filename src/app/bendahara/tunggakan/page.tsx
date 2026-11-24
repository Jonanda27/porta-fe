"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  Receipt,
  Search,
  RefreshCw,
  Printer,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Send,
  X,
  FileText,
  Building2,
  Ship,
  TrendingDown,
  Download,
} from "lucide-react";
import { useBillingStore } from "@/store/billing.store";
import { toast } from "@/store/toast.store";
import { formatRupiah } from "@/lib/kapal-billing";
import {
  buildPasal26WriteOffReportCsv,
  classifyPasal21Collection,
  evaluatePasal22Receivables,
} from "@/lib/perbup-25-2024";
import {
  OfficialRetribusiDocumentData,
  OfficialRetribusiDocumentModal,
} from "@/components/billing/OfficialRetribusiDocumentModal";
import { BillingInvoice, WarningLevel } from "@/types/billing.types";

export default function BendaharaTunggakanPage() {
  const {
    invoices,
    warnings,
    isLoading,
    fetchInvoices,
    fetchWarnings,
    issueWarning,
  } = useBillingStore();

  const [activeTab, setActiveTab] = useState<"overdue" | "history" | "writeoff">("overdue");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedInvoice, setSelectedInvoice] = useState<BillingInvoice | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<WarningLevel>("TEGURAN_1");
  const [warningMessage, setWarningMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [printableStrdDoc, setPrintableStrdDoc] = useState<OfficialRetribusiDocumentData | null>(null);

  useEffect(() => {
    fetchInvoices();
    fetchWarnings();
  }, [fetchInvoices, fetchWarnings]);


  const today = new Date();

  // Daftar piutang yang menunggak atau melewati jatuh tempo
  const overdueInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (inv.status === "PAID" || inv.status === "VOID") return false;
      const due = new Date(inv.dueDate);
      const isPastDue = due.getTime() < today.getTime() || inv.status === "ISSUED" || inv.status === "PARTIAL";
      if (!isPastDue) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchInv = inv.invoiceNumber.toLowerCase().includes(q);
      const matchVessel = inv.visit?.vessel?.name.toLowerCase().includes(q);
      return matchInv || matchVessel;
    });
  }, [invoices, searchQuery, today]);

  // Hitung total nilai piutang macet/menunggak
  const totalOverdueAmount = useMemo(() => {
    return overdueInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmountIdr) || 0), 0);
  }, [overdueInvoices]);

  // Evaluasi piutang kedaluwarsa > 3 tahun (Pasal 22-26 Perbup Mimika 25/2024)
  const writeOffCandidates = useMemo(() => {
    return evaluatePasal22Receivables(invoices, today);
  }, [invoices, today]);

  const handleIssueWarning = async () => {
    if (!selectedInvoice) return;
    setIsProcessing(true);
    try {
      await issueWarning({
        invoiceId: selectedInvoice.id,
        warningLevel: selectedLevel,
        message: warningMessage || `Surat Teguran Resmi atas keterlambatan pelunasan e-SKRD ${selectedInvoice.invoiceNumber}. Harap segera disetorkan ke Kasda.`,
      });
      toast.success(
        "Surat Teguran Terbit",
        `Surat Teguran (${selectedLevel}) untuk e-SKRD ${selectedInvoice.invoiceNumber} berhasil diterbitkan dan dikirimkan ke operator!`
      );
      setSelectedInvoice(null);
      setWarningMessage("");
      setActiveTab("history");
    } catch (err: unknown) {
      toast.error(
        "Gagal Menerbitkan Surat",
        err instanceof Error ? err.message : "Gagal menerbitkan surat pemberitahuan / STRD."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner Piutang & Ringkasan Finansial */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-mono font-bold text-[#64748B] uppercase tracking-wider">
            Total Piutang e-SKRD Menunggak
          </span>
          <p className="text-2xl font-black text-rose-800 mt-1">
            {formatRupiah(totalOverdueAmount)}
          </p>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            {overdueInvoices.length} Dokumen e-SKRD Belum Lunas
          </p>
        </div>

        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-mono font-bold text-[#64748B] uppercase tracking-wider">
            Surat Teguran (STRD) Terbit
          </span>
          <p className="text-2xl font-black text-amber-900 mt-1">
            {warnings.length} Berkas Teguran
          </p>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Telah Diteruskan ke Operator Kapal
          </p>
        </div>

        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-mono font-bold text-[#64748B] uppercase tracking-wider">
            Sanksi Bunga Administrasi
          </span>
          <p className="text-2xl font-black text-[#0B241E] mt-1">
            1% / Bulan
          </p>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Maks. 24 bulan (Pasal 21 ayat 8 Perbup 25/2024)
          </p>
        </div>
      </div>

      {/* 2. Switcher Tab Mode */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("overdue")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "overdue"
                ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                : "bg-[#F8FAFC] text-[#64748B] hover:text-[#0B241E] hover:bg-[#F1F5F9] border border-[#E2E8F0]"
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${activeTab === "overdue" ? "text-rose-400" : "text-[#64748B]"}`} />
            <span>Daftar Piutang Menunggak</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 font-bold">
              {overdueInvoices.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "history"
                ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                : "bg-[#F8FAFC] text-[#64748B] hover:text-[#0B241E] hover:bg-[#F1F5F9] border border-[#E2E8F0]"
            }`}
          >
            <FileText className={`w-4 h-4 ${activeTab === "history" ? "text-[#D97706]" : "text-[#64748B]"}`} />
            <span>Riwayat Surat Teguran (STRD) Terbit</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-800 font-bold">
              {warnings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("writeoff")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "writeoff"
                ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                : "bg-[#F8FAFC] text-[#64748B] hover:text-[#0B241E] hover:bg-[#F1F5F9] border border-[#E2E8F0]"
            }`}
          >
            <TrendingDown className={`w-4 h-4 ${activeTab === "writeoff" ? "text-amber-400" : "text-[#64748B]"}`} />
            <span>Usulan Penghapusan (&gt; 3 Thn)</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
              {writeOffCandidates.length}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchInvoices();
            fetchWarnings();
          }}
          disabled={isLoading}
          className="p-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#0B241E] transition-colors self-end md:self-auto cursor-pointer"
          title="Segarkan data piutang"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#D97706]" : ""}`} />
        </button>
      </div>

      {/* 3. TAB A: Daftar Piutang Menunggak */}
      {activeTab === "overdue" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Cari nomor e-SKRD atau nama armada kapal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium pl-10 pr-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#D97706] text-[#0B241E]"
            />
          </div>

          <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-mono text-[11px] text-[#64748B] uppercase">
                  <tr>
                    <th className="p-3.5">Nomor e-SKRD</th>
                    <th className="p-3.5">Nama Kapal / Operator</th>
                    <th className="p-3.5">Jatuh Tempo &amp; Tahap Pasal 21</th>
                    <th className="p-3.5">Pokok Piutang</th>
                    <th className="p-3.5">Sanksi Bunga (1%/Bln)</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Tindakan Penagihan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {overdueInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#64748B]">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="font-bold text-[#0B241E]">Tidak Ada Piutang Menunggak</p>
                        <p className="text-[11px]">Seluruh tagihan e-SKRD telah lunas atau masih dalam periode jatuh tempo.</p>
                      </td>
                    </tr>
                  ) : (
                    overdueInvoices.map((inv) => {
                      const amount = Number(inv.totalAmountIdr) || 0;
                      const due = new Date(inv.dueDate);
                      const classification = classifyPasal21Collection(amount, inv.dueDate, today);
                      const interestEstimate = classification.estimatedInterestIdr;
                      const isOver = classification.daysDiffFromDue < 0;

                      const stageBadgeClass =
                        classification.stage === "STRD_FINAL"
                          ? "bg-rose-100 text-rose-800 border-rose-200"
                          : classification.stage === "TEGURAN_H7"
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : classification.stage === "PEMBERITAHUAN_H7"
                          ? "bg-sky-100 text-sky-800 border-sky-200"
                          : "bg-slate-100 text-slate-700 border-slate-200";

                      const defaultMsg =
                        classification.stage === "PEMBERITAHUAN_H7"
                          ? `Surat Pemberitahuan (Pasal 21 ayat 3): Tagihan e-SKRD ${inv.invoiceNumber} sebesar ${formatRupiah(amount)} akan jatuh tempo pada ${due.toLocaleDateString("id-ID")}. Mohon segera disetorkan ke Rekening Kasda Bank Papua.`
                          : classification.stage === "TEGURAN_H7"
                          ? `Surat Teguran (Pasal 21 ayat 4 & 6): Tagihan e-SKRD ${inv.invoiceNumber} sebesar ${formatRupiah(amount)} telah melewati jatuh tempo. Wajib dilunasi paling lama 7 hari sejak surat ini diterbitkan.`
                          : `STRD Resmi (Pasal 21 ayat 7 & 8): Penagihan pokok ${formatRupiah(amount)} ditambah sanksi bunga 1%/bulan (${classification.monthsOverdue} bulan = ${formatRupiah(interestEstimate)}) atas e-SKRD ${inv.invoiceNumber}.`;

                      return (
                        <tr key={inv.id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="p-3.5 font-mono font-bold text-[#0B241E]">
                            {inv.invoiceNumber}
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-[#0B241E]">{inv.visit?.vessel?.name}</div>
                            <div className="text-[11px] text-[#64748B]">{inv.visit?.vessel?.grossTonnage} GT</div>
                          </td>
                          <td className="p-3.5">
                            <div className={`font-semibold ${isOver ? "text-rose-700 font-bold" : "text-[#64748B]"}`}>
                              {due.toLocaleDateString("id-ID")}
                            </div>
                            <span
                              className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${stageBadgeClass}`}
                            >
                              {classification.label}
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-rose-800">
                            {formatRupiah(amount)}
                          </td>
                          <td className="p-3.5 font-mono text-amber-900 font-bold">
                            + {formatRupiah(interestEstimate)}
                            {classification.monthsOverdue > 0 && (
                              <span className="block text-[10px] font-normal text-[#64748B]">
                                ({classification.monthsOverdue} bln × 1%)
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-300">
                              {inv.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setSelectedLevel(classification.defaultWarningLevel);
                                setWarningMessage(defaultMsg);
                              }}
                              className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <Send className="w-3.5 h-3.5 text-rose-200" />
                              <span>
                                {classification.stage === "PEMBERITAHUAN_H7"
                                  ? "Kirim Pemberitahuan"
                                  : classification.stage === "TEGURAN_H7"
                                  ? "Kirim Teguran"
                                  : "Terbitkan STRD"}
                              </span>
                            </button>
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

      {/* 4. TAB B: Riwayat Surat Teguran (STRD) Terbit */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#F1F5F9] bg-[#FAFCFB] flex items-center justify-between text-xs font-bold text-[#64748B]">
              <span>Arsip Surat Tagihan Retribusi Daerah (STRD) Resmi</span>
              <span>Total: {warnings.length} Surat</span>
            </div>

            <div className="divide-y divide-[#F1F5F9]">
              {warnings.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#64748B]">
                  <FileText className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                  <p className="font-bold text-[#0B241E]">Belum Ada Surat Teguran Diterbitkan</p>
                  <p className="mt-0.5">Semua kepatuhan pembayaran operator kapal berjalan tertib.</p>
                </div>
              ) : (
                warnings.map((w) => (
                  <div key={w.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold bg-[#0B241E] text-white px-2 py-0.5 rounded text-[11px]">
                          {w.warningNumber}
                        </span>
                        <span className="font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-[10px]">
                          {w.warningLevel}
                        </span>
                        <span className="text-[#64748B] text-[11px]">
                          Terbit: {new Date(w.createdAt).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                      <p className="text-xs text-[#0B241E] font-medium mt-1">
                        {w.message}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const matchedInv = invoices.find((i) => i.id === w.invoiceId);
                        const principalIdr = Number(matchedInv?.totalAmountIdr || w.invoice?.totalAmountIdr || 0);
                        const penaltyIdr = matchedInv?.dueDate
                          ? classifyPasal21Collection(principalIdr, matchedInv.dueDate).estimatedInterestIdr
                          : 0;
                        setPrintableStrdDoc({
                          docType: "STRD",
                          documentNumber: w.warningNumber,
                          referenceSkrdNumber: w.invoice?.invoiceNumber,
                          issuedAt: w.createdAt,
                          dueDate: matchedInv?.dueDate,
                          tahunRetribusi: new Date(w.createdAt).getFullYear(),
                          wajibRetribusiName:
                            matchedInv?.visit?.vessel?.name ||
                            `Wajib Retribusi (${w.invoice?.invoiceNumber || `#${w.invoiceId}`})`,
                          npwrd: `NPWRD-PMK-${String(matchedInv?.operatorId || w.invoiceId).padStart(5, "0")}`,
                          retribusiTypeLabel: "Retribusi Jasa Kepelabuhanan",
                          principalIdr,
                          penaltyIdr,
                          totalIdr: principalIdr + penaltyIdr,
                          visitNumber: matchedInv?.visit?.visitNumber,
                        });
                      }}
                      className="px-3 py-1.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#0B241E] font-bold rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Cetak STRD</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4B. TAB C: Usulan Penghapusan Piutang Kedaluwarsa > 3 Tahun (Pasal 22-26) */}
      {activeTab === "writeoff" && (
        <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-extrabold text-[#0B241E]">
                Daftar Usulan Penghapusan Piutang Retribusi Kedaluwarsa (&gt; 3 Tahun)
              </h3>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Pasal 22 &amp; 25 Perbup Mimika No. 25/2024: Kepala PD (&le; Rp 100 Juta) / Bupati Mimika (&gt; Rp 100 Juta).
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const year = new Date().getFullYear();
                const csv = buildPasal26WriteOffReportCsv(year, writeOffCandidates);
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Daftar-Usulan-Penghapusan-Piutang-${year}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                toast.success(
                  "Daftar Usulan Diunduh",
                  "Daftar Usulan Penghapusan Piutang (Pasal 26) berhasil diekspor ke CSV."
                );
              }}
              className="px-3.5 py-2 rounded-xl bg-[#0B241E] hover:bg-[#13382F] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Unduh Usulan Pasal 26 (CSV)</span>
            </button>
          </div>

          {writeOffCandidates.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#64748B]">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-[#0B241E]">
                Tidak Ada Piutang Kedaluwarsa (&gt; 3 Tahun)
              </p>
              <p className="text-[11px] mt-0.5">
                Seluruh piutang aktif masih berada dalam masa hak penagihan 3 tahun (Pasal 22).
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-mono text-[11px] text-[#64748B] uppercase">
                  <tr>
                    <th className="p-3.5">Nomor SKRD</th>
                    <th className="p-3.5">Wajib Retribusi / Kapal</th>
                    <th className="p-3.5">Lama Kedaluwarsa</th>
                    <th className="p-3.5">Nilai Piutang</th>
                    <th className="p-3.5">Kewenangan Penetapan (Pasal 25)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {writeOffCandidates.map((item) => (
                    <tr key={item.invoice.id} className="hover:bg-[#F8FAFC]">
                      <td className="p-3.5 font-mono font-bold text-[#0B241E]">
                        {item.invoice.invoiceNumber}
                      </td>
                      <td className="p-3.5 font-semibold text-[#0B241E]">
                        {item.invoice.visit?.vessel?.name || `Operator #${item.invoice.operatorId}`}
                      </td>
                      <td className="p-3.5 font-mono text-rose-700 font-bold">
                        {item.yearsOverdue} Tahun
                      </td>
                      <td className="p-3.5 font-mono font-bold text-[#0B241E]">
                        {formatRupiah(item.principalIdr)}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-slate-100 text-[#334155] border border-[#CBD5E1]">
                          {item.authorityLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. Modal Penerbitan Surat Teguran (STRD) */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-rose-200 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <h3 className="font-black text-sm text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Penerbitan Surat Tagihan Retribusi Daerah (STRD)</span>
              </h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 text-[#64748B] hover:text-[#0B241E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Nomor e-SKRD:</span>
                <strong className="font-mono text-[#0B241E]">{selectedInvoice.invoiceNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Kapal Pemohon:</span>
                <strong className="text-[#0B241E]">{selectedInvoice.visit?.vessel?.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Total Pokok Piutang:</span>
                <strong className="text-rose-800">{formatRupiah(selectedInvoice.totalAmountIdr)}</strong>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#0B241E] mb-1">
                  Tingkat Surat Teguran (STRD) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value as WarningLevel)}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-bold text-xs"
                >
                  <option value="TEGURAN_1">
                    Tahap 1 — Surat Pemberitahuan (H-7 Sebelum Jatuh Tempo • Pasal 21 ayat 3)
                  </option>
                  <option value="TEGURAN_2">
                    Tahap 2 — Surat Teguran (H+7 Setelah Jatuh Tempo, Batas 7 Hari • Pasal 21 ayat 4 &amp; 6)
                  </option>
                  <option value="TEGURAN_3">
                    Tahap 3 — STRD Resmi (+ Sanksi Bunga 1%/Bulan Maks. 24 Bln • Pasal 21 ayat 7 &amp; 8)
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#0B241E] mb-1">
                  Pesan Teguran Resmi & Dasar Hukum <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-medium text-xs"
                  required
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#F1F5F9] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 border border-[#CBD5E1] rounded-xl text-xs font-bold text-[#64748B]"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleIssueWarning}
                disabled={isProcessing}
                className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-rose-200" />
                <span>Terbitkan & Kirimkan STRD</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <OfficialRetribusiDocumentModal
        isOpen={Boolean(printableStrdDoc)}
        data={printableStrdDoc}
        onClose={() => setPrintableStrdDoc(null)}
      />
    </div>
  );
}
