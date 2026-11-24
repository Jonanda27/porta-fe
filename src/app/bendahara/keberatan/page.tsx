"use client";

import React, { useState, useEffect } from "react";
import {
  Scale,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Ship,
  Receipt,
  Coins,
  Calendar,
  X,
  ShieldCheck,
  ChevronRight,
  TrendingDown,
  FileCheck2,
} from "lucide-react";
import { useBillingStore } from "@/store/billing.store";
import {
  BillingAdjustment,
  BillingAdjustmentType,
  AdjustmentApprovalStatus,
  DecideBillingAdjustmentDto,
} from "@/types/billing.types";

export default function KeberatanTarifPage() {
  const {
    adjustments,
    isLoading,
    error,
    fetchAdjustments,
    decideAdjustment,
  } = useBillingStore();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Modal State for Decision
  const [selectedAdjustment, setSelectedAdjustment] = useState<BillingAdjustment | null>(null);
  const [decisionApproval, setDecisionApproval] = useState<boolean>(true);
  const [decisionNotes, setDecisionNotes] = useState<string>("");
  const [isSubmittingDecision, setIsSubmittingDecision] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchAdjustments();
  }, [fetchAdjustments]);

  // Filter adjustments (100% Data Riil dari API Backend)
  const filteredAdjustments = adjustments.filter((adj) => {
    const matchesSearch =
      adj.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (adj.invoice?.invoiceNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (adj.invoice?.visit?.vessel?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (adj.requestedBy?.fullName || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== "ALL" && adj.status !== statusFilter) return false;
    if (typeFilter !== "ALL" && adj.adjustmentType !== typeFilter) return false;
    return true;
  });

  // Metrik Statistik dari data riil API
  const countTotal = adjustments.length;
  const countRequested = adjustments.filter((a) => a.status === "REQUESTED").length;
  const countApproved = adjustments.filter((a) => a.status === "APPROVED").length;
  const countRejected = adjustments.filter((a) => a.status === "REJECTED").length;

  // Helper terjemahan tipe
  const getAdjustmentTypeLabel = (type: BillingAdjustmentType) => {
    switch (type) {
      case "INSTALLMENT_PLAN":
        return { label: "Angsuran (Cicilan)", color: "bg-blue-100 text-blue-800" };
      case "PAYMENT_DEFERRAL":
        return { label: "Penundaan Jatuh Tempo", color: "bg-amber-100 text-amber-800" };
      case "OVERPAYMENT_REFUND":
        return { label: "Kelebihan Setor", color: "bg-purple-100 text-purple-800" };
      case "CREDIT_TRANSFER":
        return { label: "Pemindahbukuan", color: "bg-emerald-100 text-emerald-800" };
      default:
        return { label: type, color: "bg-gray-100 text-gray-800" };
    }
  };

  // Handler Buka Modal Putusan
  const handleOpenDecisionModal = (adj: BillingAdjustment) => {
    setSelectedAdjustment(adj);
    setDecisionApproval(true);
    setDecisionNotes(
      "Berdasarkan verifikasi Berita Acara Syahbandar dan Pasal 20 Perbup Mimika No. 25/2024, permohonan dinilai memenuhi kriteria pertimbangan teknis."
    );
    setActionSuccessMsg(null);
    setActionErrorMsg(null);
  };

  // Handler Submit Keputusan
  const handleSubmitDecision = async () => {
    if (!selectedAdjustment) return;
    setIsSubmittingDecision(true);
    setActionErrorMsg(null);

    try {
      const dto: DecideBillingAdjustmentDto = {
        approved: decisionApproval,
        notes: decisionNotes,
      };

      await decideAdjustment(selectedAdjustment.id, dto);
      setActionSuccessMsg(
        `Keputusan permohonan ${selectedAdjustment.requestNumber} berhasil ditetapkan sebagai ${
          decisionApproval ? "DISETUJUI (APPROVED)" : "DITOLAK (REJECTED)"
        }!`
      );
      setTimeout(() => {
        setSelectedAdjustment(null);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menetapkan keputusan.";
      setActionErrorMsg(msg);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. HEADER SECTION & LEGAL CONTEXT                         */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-white flex items-center justify-center font-bold">
              <Scale className="w-5 h-5 text-[#D97706]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0B241E]">
                Telaah & Sidang Keputusan Keberatan Tarif Retribusi
              </h1>
              <p className="text-sm text-gray-500">
                Penyelesaian sengketa tarif, angsuran (SPARD maks. 6 bulan), penundaan (H-10 jatuh tempo), &amp; kondisi kahar sesuai{" "}
                <span className="font-semibold text-[#0B241E]">
                  Pasal 19, 20, 27, &amp; 29–32 Perbup Mimika No. 25 Tahun 2024
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Wewenang Pejabat Kasda & PPKD
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. STATISTIC METRIC CARDS                                 */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Total Permohonan */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Pengajuan
            </span>
            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-[#0B241E]">
              {countTotal}{" "}
              <span className="text-sm font-normal text-gray-500">Berkas</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Seluruh keberatan e-SKRD kapal & tenant
            </p>
          </div>
        </div>

        {/* Card 2: Menunggu Telaah Kasda */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Menunggu Keputusan
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-600">
              {countRequested}{" "}
              <span className="text-sm font-normal text-gray-500">Menunggu</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Perlu penetapan putusan Bendahara
            </p>
          </div>
        </div>

        {/* Card 3: Disetujui */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Dikabulkan (Approved)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-700">
              {countApproved}{" "}
              <span className="text-sm font-normal text-gray-500">Berkas</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Keringanan / angsuran diterbitkan
            </p>
          </div>
        </div>

        {/* Card 4: Ditolak */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Ditolak (Rejected)
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600">
              {countRejected}{" "}
              <span className="text-sm font-normal text-gray-500">Berkas</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tagihan e-SKRD tetap berlaku utuh
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. TABLE PERMOHONAN KEBERATAN                             */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari no. permohonan, kapal, atau operator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0B241E] focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <span className="text-xs text-gray-400 font-medium">Status:</span>
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-[#0B241E] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Semua ({adjustments.length})
            </button>
            <button
              onClick={() => setStatusFilter("REQUESTED")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                statusFilter === "REQUESTED"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
              }`}
            >
              Menunggu Telaah ({countRequested})
            </button>
            <button
              onClick={() => setStatusFilter("APPROVED")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                statusFilter === "APPROVED"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              Disetujui ({countApproved})
            </button>
            <button
              onClick={() => setStatusFilter("REJECTED")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                statusFilter === "REJECTED"
                  ? "bg-rose-600 text-white"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
            >
              Ditolak ({countRejected})
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFBFB] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">No. Pengajuan & Tanggal</th>
                <th className="py-3 px-4">Referensi e-SKRD & Kapal</th>
                <th className="py-3 px-4">Jenis Permohonan</th>
                <th className="py-3 px-4">Nilai Pokok vs Permohonan</th>
                <th className="py-3 px-4">Alasan & Pertimbangan Teknis</th>
                <th className="py-3 px-4">Status Putusan</th>
                <th className="py-3 px-4 text-center">Aksi Sidang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredAdjustments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    Tidak ada berkas permohonan keberatan yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredAdjustments.map((adj) => {
                  const typeMeta = getAdjustmentTypeLabel(adj.adjustmentType);
                  const isPending = adj.status === "REQUESTED";
                  const vesselName =
                    adj.invoice?.visit?.vessel?.name || "Kapal Niaga";
                  const invoiceNo = adj.invoice?.invoiceNumber || "-";
                  const invoiceTotal = Number(adj.invoice?.totalAmountIdr || 0);

                  return (
                    <tr key={adj.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#0B241E] flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5 text-[#D97706]" />
                          {adj.requestNumber}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(adj.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        {adj.requestedBy?.fullName && (
                          <div className="text-[10px] text-gray-500 mt-1 font-medium">
                            Oleh: {adj.requestedBy.fullName}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900 flex items-center gap-1">
                          <Ship className="w-3.5 h-3.5 text-blue-600" />
                          {vesselName}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                          <Receipt className="w-3 h-3 text-gray-400" />
                          {invoiceNo}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${typeMeta.color}`}
                        >
                          {typeMeta.label}
                        </span>
                        {adj.installmentCount && (
                          <div className="text-[10px] text-gray-500 mt-1">
                            Rencana: {adj.installmentCount} Kali Angsuran
                          </div>
                        )}
                        {adj.deferredUntil && (
                          <div className="text-[10px] text-gray-500 mt-1">
                            Tunda s.d.: {adj.deferredUntil}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-gray-500 text-[11px]">
                          Nilai e-SKRD:
                          <span className="font-mono font-medium text-gray-800 ml-1">
                            Rp {invoiceTotal.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="text-emerald-700 font-bold text-xs mt-0.5">
                          Dimohon:
                          <span className="font-mono ml-1">
                            Rp {Number(adj.requestedAmountIdr || 0).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-[11px] text-gray-600 line-clamp-2" title={adj.reason}>
                          {adj.reason}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        {adj.status === "APPROVED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Disetujui
                          </span>
                        ) : adj.status === "REJECTED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <XCircle className="w-3 h-3" />
                            Ditolak
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3" />
                            Menunggu Sidang
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isPending ? (
                          <button
                            onClick={() => handleOpenDecisionModal(adj)}
                            className="px-3 py-1.5 bg-[#0B241E] hover:bg-[#133D31] text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer mx-auto"
                            title="Telaah Permohonan"
                          >
                            <Scale className="w-3.5 h-3.5 text-[#D97706]" />
                            Putuskan
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              alert(
                                `Salinan Berita Acara Keputusan:\nNo: ${adj.requestNumber}\nStatus: ${adj.status}\nDisahkan Pejabat Kasda pada: ${adj.approvedAt || adj.updatedAt}`
                              );
                            }}
                            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer mx-auto flex items-center gap-1 text-[11px]"
                            title="Lihat Berita Acara"
                          >
                            <FileCheck2 className="w-3.5 h-3.5 text-gray-500" />
                            Berita Acara
                          </button>
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

      {/* ========================================================= */}
      {/* 4. MODAL: SIDANG PENETAPAN PUTUSAN KEBERATAN TARIF        */}
      {/* ========================================================= */}
      {selectedAdjustment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0B241E] text-white flex items-center justify-center">
                  <Scale className="w-4 h-4 text-[#D97706]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0B241E] text-base">
                    Sidang Penetapan Putusan Keberatan Retribusi
                  </h3>
                  <p className="text-xs text-gray-400">
                    Otoritas Pejabat Pengelola Keuangan Daerah (PPKD / Kasda)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAdjustment(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Alert Feedback */}
              {actionSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-medium">
                  {actionSuccessMsg}
                </div>
              )}
              {actionErrorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-medium">
                  {actionErrorMsg}
                </div>
              )}

              {/* Data Ringkas Permohonan */}
              <div className="p-3.5 bg-gray-50 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Nomor Berkas:</span>
                  <span className="font-mono font-bold text-[#0B241E]">
                    {selectedAdjustment.requestNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Kapal / Pemohon:</span>
                  <span className="font-semibold text-gray-800">
                    {selectedAdjustment.invoice?.visit?.vessel?.name} (
                    {selectedAdjustment.requestedBy?.fullName})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Tagihan e-SKRD Asal:</span>
                  <span className="font-mono font-semibold text-gray-900">
                    Rp{" "}
                    {Number(
                      selectedAdjustment.invoice?.totalAmountIdr || 0
                    ).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Nilai Dimohonkan:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    Rp{" "}
                    {Number(
                      selectedAdjustment.requestedAmountIdr || 0
                    ).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200 text-gray-600">
                  <span className="font-semibold block mb-0.5">Alasan Permohonan:</span>
                  <p className="italic bg-white p-2 rounded-lg border border-gray-200">
                    &quot;{selectedAdjustment.reason}&quot;
                  </p>
                </div>
              </div>

              {/* Pilihan Putusan (Approve / Reject) */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Ketetapan Keputusan Kasda:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecisionApproval(true)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      decisionApproval
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800 font-bold shadow-xs"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Kabulkan (DISETUJUI)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionApproval(false)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      !decisionApproval
                        ? "border-rose-600 bg-rose-50 text-rose-800 font-bold shadow-xs"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Tolak (REJECTED)
                  </button>
                </div>
              </div>

              {/* Catatan Berita Acara */}
              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Catatan Pertimbangan Hukum / Berita Acara Kasda:
                </label>
                <textarea
                  rows={3}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="Cantumkan dasar pertimbangan teknis, pasal Perbup 25/2024, atau alasan penolakan..."
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0B241E]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedAdjustment(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmitDecision}
                disabled={isSubmittingDecision}
                className="px-5 py-2 bg-[#0B241E] hover:bg-[#133D31] text-white font-semibold rounded-xl text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D97706]" />
                {isSubmittingDecision ? "Menyimpan Putusan..." : "Sahkan Keputusan Kasda"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
