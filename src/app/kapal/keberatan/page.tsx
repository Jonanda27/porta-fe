"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  X,
  Send,
  Calendar,
  Receipt,
  Scale,
  ShieldAlert,
  ArrowRight,
  Info,
} from "lucide-react";
import { useBillingStore } from "@/store/billing.store";
import { useAuthStore } from "@/store/auth.store";
import {
  BillingAdjustment,
  BillingAdjustmentType,
  WarningRecord,
  BillingInvoice,
} from "@/types/billing.types";

export default function KapalKeberatanPage() {
  const { user } = useAuthStore();
  const {
    invoices,
    adjustments,
    warnings,
    isLoading,
    error,
    fetchInvoices,
    fetchAdjustments,
    fetchWarnings,
    requestAdjustment,
  } = useBillingStore();

  const [activeTab, setActiveTab] = useState<"adjustments" | "warnings">("adjustments");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | "">("");
  const [adjustmentType, setAdjustmentType] = useState<BillingAdjustmentType>("PAYMENT_DEFERRAL");
  const [requestedAmount, setRequestedAmount] = useState<number>(0);
  const [installmentCount, setInstallmentCount] = useState<number>(3);
  const [deferredDate, setDeferredDate] = useState<string>("");
  const [reasonText, setReasonText] = useState<string>("");

  useEffect(() => {
    fetchInvoices();
    fetchAdjustments();
    fetchWarnings();
  }, [fetchInvoices, fetchAdjustments, fetchWarnings]);

  // Invoice yang masih berstatus belum lunas / aktif
  const unpaidInvoices = useMemo(() => {
    return invoices.filter((inv) => inv.status === "ISSUED" || inv.status === "PARTIAL");
  }, [invoices]);

  const selectedInvoice = useMemo(() => {
    if (!selectedInvoiceId) return null;
    return invoices.find((inv) => inv.id === Number(selectedInvoiceId)) || null;
  }, [invoices, selectedInvoiceId]);

  const handleOpenModal = (invId?: number) => {
    const targetInvoice = invId
      ? invoices.find((i) => i.id === invId)
      : unpaidInvoices[0] || invoices[0] || null;

    setSelectedInvoiceId(targetInvoice?.id || "");
    setAdjustmentType("PAYMENT_DEFERRAL");
    setRequestedAmount(targetInvoice ? Number(targetInvoice.totalAmountIdr) : 0);
    setInstallmentCount(3);

    // Default 30 hari ke depan
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    setDeferredDate(futureDate.toISOString().split("T")[0]);

    setReasonText(
      "Permohonan penundaan pelunasan retribusi kapal akibat kendala operasional pasang surut muara Poumako sesuai ketentuan Perbup Mimika No. 25 Tahun 2024."
    );
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) {
      setErrorMessage("Silakan pilih nomor e-SKRD yang diajukan.");
      return;
    }
    if (!reasonText.trim()) {
      setErrorMessage("Alasan / justifikasi permohonan wajib diisi secara lengkap.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const created = await requestAdjustment(Number(selectedInvoiceId), {
        adjustmentType,
        requestedAmountIdr: Number(requestedAmount),
        installmentCount: adjustmentType === "INSTALLMENT_PLAN" ? installmentCount : undefined,
        deferredUntil: adjustmentType === "PAYMENT_DEFERRAL" ? deferredDate : undefined,
        reason: reasonText,
      });

      setIsModalOpen(false);
      setSuccessToast(
        `Permohonan penyesuaian ${created.requestNumber} berhasil diajukan ke UPTD Pelabuhan & Bapenda Mimika!`
      );
      setTimeout(() => setSuccessToast(null), 6000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengajukan permohonan.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (val?: number | string | null) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getAdjustmentTypeLabel = (type: BillingAdjustmentType) => {
    switch (type) {
      case "INSTALLMENT_PLAN":
        return {
          title: "Angsuran Pembayaran e-SKRD",
          basis: "Pasal 19 Perbup Mimika 25/2024",
          badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
        };
      case "PAYMENT_DEFERRAL":
        return {
          title: "Penundaan Waktu Pelunasan",
          basis: "Pasal 20 Perbup Mimika 25/2024",
          badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
        };
      case "OVERPAYMENT_REFUND":
        return {
          title: "Pengembalian Kelebihan Bayar",
          basis: "Pasal 23 Perbup Mimika 25/2024",
          badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
        };
      case "CREDIT_TRANSFER":
        return {
          title: "Pemindahbukuan / Kompensasi",
          basis: "Pasal 24 Perbup Mimika 25/2024",
          badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return {
          label: "Menunggu Persetujuan UPT",
          className: "bg-amber-100 text-amber-900 border-amber-300",
        };
      case "APPROVED":
        return {
          label: "Disetujui Bapenda",
          className: "bg-emerald-100 text-emerald-900 border-emerald-300",
        };
      case "REJECTED":
        return {
          label: "Ditolak",
          className: "bg-rose-100 text-rose-900 border-rose-300",
        };
      default:
        return {
          label: status,
          className: "bg-slate-100 text-slate-800 border-slate-300",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-fade-in border border-emerald-500">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-white hover:text-emerald-100 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => {
              fetchAdjustments();
              fetchWarnings();
            }}
            className="underline font-bold hover:text-rose-950 cursor-pointer"
          >
            Muat Ulang
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HEADER DECK & KONTROL REGULASI PERBUP MIMIKA 25/2024                    */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D97706] bg-[#0B241E] px-2.5 py-0.5 rounded">
              PERATURAN BUPATI MIMIKA NOMOR 25 TAHUN 2024 (PASAL 10, 14, 19, 20)
            </span>
            <h2 className="text-base sm:text-lg font-black text-[#0B241E] mt-1 flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#D97706]" />
              <span>Hak Keberatan, Keringanan Retribusi & Surat Teguran Piutang</span>
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Wajib Retribusi berhak mengajukan angsuran atau penundaan e-SKRD, serta memantau status surat peringatan kepatuhan pelabuhan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#D97706]" />
              <span>Ajukan Keringanan e-SKRD</span>
            </button>
            <button
              onClick={() => {
                fetchAdjustments();
                fetchWarnings();
              }}
              disabled={isLoading}
              className="p-2 border border-[#CBD5E1] bg-white rounded-xl hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0B241E] cursor-pointer disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Info Banner Regulasi */}
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-950">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Ketentuan Tata Cara Keberatan & Pembetulan SKRD:</p>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              Permohonan perpanjangan waktu atau angsuran dapat diajukan paling lambat <strong>sebelum tanggal jatuh tempo e-SKRD</strong>. Penundaan diberikan paling lama 3 bulan kalender, dan angsuran paling banyak 6 kali sesuai keputusan Kepala Bapenda/UPTD Pelabuhan Poumako.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TABS NAVIGATOR: PERMOHONAN PENYESUAIAN VS SURAT TEGURAN                 */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-[#CBD5E1] pb-2">
        <button
          onClick={() => setActiveTab("adjustments")}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "adjustments"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
          }`}
        >
          <Scale className="w-4 h-4 text-[#D97706]" />
          <span>Daftar Permohonan Keringanan & Angsuran ({adjustments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("warnings")}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "warnings"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>Surat Teguran Piutang (ST-1/2/3) ({warnings.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PERMOHONAN PENYESUAIAN e-SKRD (ADJUSTMENTS)                         */}
      {/* ========================================================================= */}
      {activeTab === "adjustments" && (
        <div className="space-y-4">
          {isLoading && adjustments.length === 0 ? (
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-10 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#0B241E] animate-spin mx-auto" />
              <p className="text-xs text-[#64748B]">Memuat daftar permohonan keringanan...</p>
            </div>
          ) : adjustments.length === 0 ? (
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-8 text-center text-xs text-[#64748B] space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="font-bold text-[#0B241E] text-sm">Tidak ada permohonan penyesuaian aktif.</p>
              <p>Seluruh invoice e-SKRD kapal Anda berjalan normal tanpa sengketa atau penundaan.</p>
            </div>
          ) : (
            adjustments.map((adj) => {
              const typeInfo = getAdjustmentTypeLabel(adj.adjustmentType);
              const statusInfo = getStatusBadge(adj.status);
              const invoiceNo = adj.invoice?.invoiceNumber || `INV-#${adj.invoiceId}`;
              const vesselName = adj.invoice?.visit?.vessel?.name || "Kapal Niaga";

              return (
                <div
                  key={adj.id}
                  className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                          {adj.requestNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeInfo.badgeColor}`}>
                          {typeInfo.title}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-1">
                        Invoice Terkait: <strong>{invoiceNo}</strong> • Kapal: {vesselName} • Rujukan: {typeInfo.basis}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-[#64748B] block">Nilai yang Dimohonkan</span>
                      <p className="font-mono text-base font-extrabold text-[#0B241E]">
                        {formatRupiah(adj.requestedAmountIdr)}
                      </p>
                    </div>
                  </div>

                  {/* Rincian Permohonan */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] text-xs">
                    <div>
                      <span className="text-[10px] text-[#94A3B8] font-bold block uppercase">Keringanan Yang Dimohon</span>
                      <p className="font-semibold text-[#0B241E] mt-0.5">
                        {adj.adjustmentType === "INSTALLMENT_PLAN"
                          ? `Rencana Angsuran ${adj.installmentCount || 3} Kali Pembayaran`
                          : adj.adjustmentType === "PAYMENT_DEFERRAL"
                          ? `Penundaan s/d ${adj.deferredUntil ? new Date(adj.deferredUntil).toLocaleDateString("id-ID") : "-"}`
                          : "Pengembalian / Kompensasi"}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#94A3B8] font-bold block uppercase">Tanggal Pengajuan</span>
                      <p className="font-mono text-[#0B241E] mt-0.5">
                        {new Date(adj.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#94A3B8] font-bold block uppercase">Petugas Verifikasi UPT</span>
                      <p className="text-[#0B241E] mt-0.5">
                        {adj.approvedAt ? "Disetujui Tim Bapenda" : "Dalam Telaah Syahbandar"}
                      </p>
                    </div>
                  </div>

                  {/* Justifikasi / Alasan */}
                  <div className="text-xs text-[#475569] bg-white p-3 rounded-xl border border-[#E2E8F0]">
                    <span className="text-[10px] uppercase font-bold text-[#94A3B8] block mb-1">
                      Alasan & Justifikasi Operasional:
                    </span>
                    <p className="italic">&quot;{adj.reason}&quot;</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SURAT TEGURAN RETRIBUSI (WARNINGS ST-1/2/3)                         */}
      {/* ========================================================================= */}
      {activeTab === "warnings" && (
        <div className="space-y-4">
          {isLoading && warnings.length === 0 ? (
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-10 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#0B241E] animate-spin mx-auto" />
              <p className="text-xs text-[#64748B]">Memuat daftar surat teguran...</p>
            </div>
          ) : warnings.length === 0 ? (
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-8 text-center text-xs text-[#64748B] space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="font-bold text-[#0B241E] text-sm">Tidak ada Surat Teguran aktif!</p>
              <p>Perusahaan Anda tertib dalam melunasi kewajiban retribusi kepelabuhanan.</p>
            </div>
          ) : (
            warnings.map((warn) => {
              const invoiceNo = warn.invoice?.invoiceNumber || `INV-#${warn.invoiceId}`;

              return (
                <div
                  key={warn.id}
                  className="bg-white border-2 border-rose-300 rounded-2xl p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-5 h-5 text-rose-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-rose-900 bg-rose-100 px-2 py-0.5 rounded">
                            {warn.warningNumber}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-700 text-white">
                            {warn.warningLevel.replace("_", " ")}
                          </span>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                            Status: {warn.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-1">
                          Nomor Tagihan Terkait: <strong>{invoiceNo}</strong> • Diterbitkan:{" "}
                          {new Date(warn.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/kapal/penagihan"
                      className="px-4 py-2 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Receipt className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>Buka Halaman Penagihan</span>
                    </Link>
                  </div>

                  {/* Pesan Resmi Surat Teguran */}
                  <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-950 space-y-1">
                    <span className="font-bold block uppercase tracking-wide text-rose-900 text-[10px]">
                      Isi Pemberitahuan Resmi Sesuai Perbup Mimika No. 25/2024:
                    </span>
                    <p className="leading-relaxed font-medium">{warn.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AJUKAN PERMOHONAN PENYESUAIAN e-SKRD BARU                          */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 border border-[#CBD5E1] shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-xs">
                  <Scale className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-[#0B241E]">
                  Formulir Permohonan Keringanan / Angsuran e-SKRD
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0B241E] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitAdjustment} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#0B241E] mb-1">
                  Pilih Nomor Tagihan e-SKRD Aktif: <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setSelectedInvoiceId(id);
                    const inv = invoices.find((i) => i.id === id);
                    if (inv) setRequestedAmount(Number(inv.totalAmountIdr));
                  }}
                  className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E]"
                  required
                >
                  <option value="">-- Pilih e-SKRD --</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} • {formatRupiah(inv.totalAmountIdr)} ({inv.status}) - {inv.visit?.vessel?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B241E] mb-1">
                  Bentuk Keringanan Yang Dimohon (Sesuai Perbup 25/2024):
                </label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value as BillingAdjustmentType)}
                  className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E]"
                >
                  <option value="PAYMENT_DEFERRAL">
                    Penundaan Waktu Pembayaran (Maks. 3 Bulan - Pasal 20)
                  </option>
                  <option value="INSTALLMENT_PLAN">
                    Angsuran Bertahap (Maks. 6 Kali - Pasal 19)
                  </option>
                  <option value="OVERPAYMENT_REFUND">
                    Pengembalian Kelebihan Bayar (Pasal 23)
                  </option>
                  <option value="CREDIT_TRANSFER">
                    Pemindahbukuan / Kompensasi Saldo Retribusi (Pasal 24)
                  </option>
                </select>
              </div>

              {adjustmentType === "INSTALLMENT_PLAN" && (
                <div>
                  <label className="block text-xs font-bold text-[#0B241E] mb-1">
                    Jumlah Periode Angsuran (Bulan):
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={6}
                    value={installmentCount}
                    onChange={(e) => setInstallmentCount(Number(e.target.value))}
                    className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-mono"
                  />
                  <p className="text-[10px] text-[#64748B] mt-0.5">
                    Angsuran: ~{formatRupiah(requestedAmount / (installmentCount || 1))} per bulan
                  </p>
                </div>
              )}

              {adjustmentType === "PAYMENT_DEFERRAL" && (
                <div>
                  <label className="block text-xs font-bold text-[#0B241E] mb-1">
                    Usulan Batas Tanggal Pelunasan Ditunda:
                  </label>
                  <input
                    type="date"
                    required
                    value={deferredDate}
                    onChange={(e) => setDeferredDate(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#0B241E] mb-1">
                  Nominal yang Dimohonkan (IDR):
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B241E] mb-1">
                  Alasan & Justifikasi Resmi: <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  placeholder="Jelaskan kendala operasional, pasang surut, cuaca buruk laut, atau perbaikan armada..."
                  className="w-full text-xs font-medium p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0B241E] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-extrabold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-[#D97706]" />
                  <span>{isSubmitting ? "Mengirimkan Permohonan..." : "Kirim Permohonan ke UPT"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
