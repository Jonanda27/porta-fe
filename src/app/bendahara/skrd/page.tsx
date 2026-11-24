"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Receipt,
  Search,
  RefreshCw,
  Printer,
  CheckCircle2,
  AlertTriangle,
  X,
  Clock,
  Ship,
  FileCheck2,
  Calendar,
  Layers,
  Ban,
  ShieldCheck,
  Send,
  Eye,
  Coins,
} from "lucide-react";
import { useBillingStore } from "@/store/billing.store";
import { toast } from "@/store/toast.store";
import { formatRupiah } from "@/lib/kapal-billing";
import {
  OfficialRetribusiDocumentData,
  OfficialRetribusiDocumentModal,
} from "@/components/billing/OfficialRetribusiDocumentModal";
import { BillingInvoice, UnbilledVisit } from "@/types/billing.types";

export default function BendaharaSkrdPage() {
  const {
    invoices,
    unbilledVisits,
    isLoading,
    fetchInvoices,
    fetchUnbilledVisits,
    generateAdvanceSkrd,
    generateFinalSkrd,
    issueInvoice,
    voidInvoice,
    fetchPrintPayload,
  } = useBillingStore();

  const [activeTab, setActiveTab] = useState<"unbilled" | "invoices">("unbilled");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Modal Terbitkan SKRD (Rampung / Uang Muka)
  const [selectedVisitForSkrd, setSelectedVisitForSkrd] = useState<UnbilledVisit | null>(null);
  const [skrdType, setSkrdType] = useState<"FINAL" | "ADVANCE">("FINAL");
  const [skrdDueDate, setSkrdDueDate] = useState<string>("");
  const [skrdNotes, setSkrdNotes] = useState<string>("");

  // Modal Void / Batalkan SKRD
  const [selectedInvoiceForVoid, setSelectedInvoiceForVoid] = useState<BillingInvoice | null>(null);
  const [voidReason, setVoidReason] = useState<string>("");
  const [printableSkrdDoc, setPrintableSkrdDoc] = useState<OfficialRetribusiDocumentData | null>(null);

  useEffect(() => {
    fetchInvoices();
    fetchUnbilledVisits();
  }, [fetchInvoices, fetchUnbilledVisits]);


  // Filter Kunjungan Siap SKRD (kecualikan yang sudah memiliki FINAL_SKRD aktif)
  const availableUnbilledVisits = useMemo(() => {
    const billedVisitIds = new Set(
      invoices
        .filter(
          (inv) =>
            inv.billingStage === "FINAL_SKRD" && inv.status !== "VOID"
        )
        .map((inv) => inv.visitId)
    );
    return unbilledVisits.filter((vis) => !billedVisitIds.has(vis.id));
  }, [unbilledVisits, invoices]);

  const filteredUnbilled = useMemo(() => {
    return availableUnbilledVisits.filter((vis) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchNum = vis.visitNumber.toLowerCase().includes(q);
      const matchVessel = vis.vessel?.name.toLowerCase().includes(q);
      const matchBerth = vis.berth?.code.toLowerCase().includes(q);
      return matchNum || matchVessel || matchBerth;
    });
  }, [availableUnbilledVisits, searchQuery]);

  // Filter Dokumen e-SKRD
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (statusFilter !== "all" && inv.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchNum = inv.invoiceNumber.toLowerCase().includes(q);
      const matchVessel = inv.visit?.vessel?.name.toLowerCase().includes(q);
      return matchNum || matchVessel;
    });
  }, [invoices, statusFilter, searchQuery]);

  const handleGenerateSkrd = async () => {
    if (!selectedVisitForSkrd) return;
    setIsProcessing(true);
    try {
      let inv: BillingInvoice;
      if (skrdType === "ADVANCE") {
        inv = await generateAdvanceSkrd(selectedVisitForSkrd.id, {
          notes: skrdNotes || undefined,
        });
        toast.success(
          "e-SKRD Uang Muka Terbit",
          `e-SKRD Uang Muka (${inv.invoiceNumber}) berhasil diterbitkan untuk kapal ${selectedVisitForSkrd.vessel?.name}!`
        );
      } else {
        inv = await generateFinalSkrd(selectedVisitForSkrd.id, {
          notes: skrdNotes || undefined,
        });
        toast.success(
          "e-SKRD Rampung Terbit",
          `e-SKRD Rampung (${inv.invoiceNumber}) berhasil diterbitkan untuk kapal ${selectedVisitForSkrd.vessel?.name}!`
        );
      }
      setSelectedVisitForSkrd(null);
      setSkrdNotes("");
      setSkrdDueDate("");
      setSkrdType("FINAL");
      setActiveTab("invoices");
    } catch (err: unknown) {
      setErrorToast(err instanceof Error ? err.message : "Gagal menerbitkan e-SKRD.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoidInvoice = async () => {
    setErrorToast(null);
    if (!selectedInvoiceForVoid || !voidReason.trim()) {
      setErrorToast("Harap cantumkan alasan pembatalan / berita acara resmi.");
      return;
    }
    setIsProcessing(true);
    try {
      await voidInvoice(selectedInvoiceForVoid.id, voidReason);
      toast.success(
        "e-SKRD Dibatalkan",
        `Ketetapan e-SKRD ${selectedInvoiceForVoid.invoiceNumber} berhasil dibatalkan (VOID).`
      );
      setSelectedInvoiceForVoid(null);
      setVoidReason("");
    } catch (err: unknown) {
      setErrorToast(err instanceof Error ? err.message : "Gagal membatalkan e-SKRD.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIssueInvoice = async (invoiceId: number, num: string) => {
    setErrorToast(null);
    setIsProcessing(true);
    try {
      await issueInvoice(invoiceId);
      toast.success(
        "e-SKRD Ditetapkan",
        `Ketetapan e-SKRD ${num} resmi ditetapkan (ISSUED). Operator dapat melihat tagihan.`
      );
    } catch (err: unknown) {
      setErrorToast(err instanceof Error ? err.message : "Gagal menetapkan resmi e-SKRD.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Toast */}
      {errorToast && (
        <div className="bg-rose-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between border border-rose-500 text-xs font-semibold">
          <span>{errorToast}</span>
          <button
            type="button"
            onClick={() => setErrorToast(null)}
            className="text-rose-100 hover:text-white font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 1. Header Tab Switcher */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("unbilled")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "unbilled"
                ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                : "bg-[#F8FAFC] text-[#64748B] hover:text-[#0B241E] hover:bg-[#F1F5F9] border border-[#E2E8F0]"
            }`}
          >
            <Ship className={`w-4 h-4 ${activeTab === "unbilled" ? "text-[#D97706]" : "text-[#64748B]"}`} />
            <span>Kunjungan Siap Diterbitkan e-SKRD</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
              {availableUnbilledVisits.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("invoices")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "invoices"
                ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                : "bg-[#F8FAFC] text-[#64748B] hover:text-[#0B241E] hover:bg-[#F1F5F9] border border-[#E2E8F0]"
            }`}
          >
            <Receipt className={`w-4 h-4 ${activeTab === "invoices" ? "text-[#D97706]" : "text-[#64748B]"}`} />
            <span>Daftar Dokumen e-SKRD Resmi</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-800 font-bold">
              {invoices.length}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchInvoices();
            fetchUnbilledVisits();
          }}
          disabled={isLoading}
          className="p-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#0B241E] transition-colors self-end md:self-auto cursor-pointer"
          title="Segarkan data SKRD"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#D97706]" : ""}`} />
        </button>
      </div>

      {/* 2. TAB A: Kunjungan Selesai Butuh Penetapan e-SKRD */}
      {activeTab === "unbilled" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Cari nomor kunjungan, nama kapal, atau kode dermaga..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium pl-10 pr-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#D97706] text-[#0B241E]"
            />
          </div>

          {filteredUnbilled.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#64748B] bg-white rounded-2xl border border-[#CBD5E1] shadow-xs">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-base text-[#0B241E]">Semua Kunjungan Selesai Telah Ditagihkan</h3>
              <p className="mt-1">Tidak ada kapal yang selesai sandar yang tertunda pembuatan e-SKRD-nya.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUnbilled.map((vis) => (
                <div
                  key={vis.id}
                  className="bg-white border border-rose-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 bg-gradient-to-br from-white to-rose-50/20"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-black bg-rose-700 text-white px-2.5 py-1 rounded-lg">
                        {vis.visitNumber}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-rose-100 text-rose-800 border-rose-300">
                        {vis.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-black text-[#0B241E]">
                        {vis.vessel?.name || "Kapal Tanpa Nama"}
                      </h4>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Tonase: <strong>{vis.vessel?.grossTonnage} GT</strong> • Tipe: {vis.vessel?.shipType || "Kapal Motor"}
                      </p>
                    </div>

                    <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Dermaga Sandar:</span>
                        <strong className="text-[#0B241E]">
                          [{vis.berth?.code || "DRM-01"}] {vis.berth?.name || "Dermaga Poumako"}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Waktu Sandar (ATB):</span>
                        <span className="font-mono text-[#0B241E]">
                          {vis.actualBerthTime ? new Date(vis.actualBerthTime).toLocaleString("id-ID") : "Sesuai Jadwal"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Waktu Lepas (ATD):</span>
                        <span className="font-mono text-[#0B241E]">
                          {vis.actualDepartureTime ? new Date(vis.actualDepartureTime).toLocaleString("id-ID") : "Pelayanan Selesai"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                    <span className="text-[11px] text-[#64748B]">Tarif: Perda Mimika 4/2023</span>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVisitForSkrd(vis);
                        setSkrdType("FINAL");
                        const due = new Date();
                        due.setDate(due.getDate() + 30);
                        setSkrdDueDate(due.toISOString().split("T")[0]);
                      }}
                      className="px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] text-xs font-black rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Hitung & Terbitkan SKRD Rampung</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. TAB B: Daftar Dokumen e-SKRD Resmi */}
      {activeTab === "invoices" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Cari nomor e-SKRD atau nama kapal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-medium pl-10 pr-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#D97706] text-[#0B241E]"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              {["all", "ISSUED", "PAID", "VOID"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-[#0B241E] text-white shadow-xs"
                      : "bg-white text-[#64748B] hover:text-[#0B241E] border border-[#CBD5E1]"
                  }`}
                >
                  {st === "all" ? "Semua" : st}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-mono text-[11px] text-[#64748B] uppercase">
                  <tr>
                    <th className="p-3.5">Nomor e-SKRD</th>
                    <th className="p-3.5">Armada Kapal</th>
                    <th className="p-3.5">Tahap</th>
                    <th className="p-3.5">Total Ketetapan</th>
                    <th className="p-3.5">Jatuh Tempo</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#0B241E]">
                        {inv.invoiceNumber}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-[#0B241E]">{inv.visit?.vessel?.name}</div>
                        <div className="text-[11px] text-[#64748B] font-mono">
                          {inv.visit?.vessel?.grossTonnage} GT
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-[11px]">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                          {inv.billingStage}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-emerald-800">
                        {formatRupiah(inv.totalAmountIdr)}
                      </td>
                      <td className="p-3.5 text-[#64748B]">
                        {new Date(inv.dueDate).toLocaleDateString("id-ID")}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            inv.status === "PAID"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : inv.status === "VOID"
                              ? "bg-rose-50 text-rose-800 border-rose-300"
                              : "bg-amber-50 text-amber-800 border-amber-300"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              setErrorToast(null);
                              try {
                                const payload = await fetchPrintPayload(inv.id);
                                const totalIdr = Number(payload.totalAmountIdr || inv.totalAmountIdr) || 0;
                                const issuedDate = inv.issuedAt || inv.createdAt || new Date().toISOString();
                                setPrintableSkrdDoc({
                                  docType: "SKRD",
                                  documentNumber: payload.invoiceNumber || inv.invoiceNumber,
                                  issuedAt: issuedDate,
                                  dueDate: inv.dueDate,
                                  tahunRetribusi: new Date(issuedDate).getFullYear(),
                                  wajibRetribusiName:
                                    payload.operator?.name ||
                                    inv.visit?.vessel?.name ||
                                    `Operator #${inv.operatorId}`,
                                  wajibRetribusiAddress:
                                    payload.operator?.address ||
                                    "Jl. Pelabuhan Poumako, Kabupaten Mimika",
                                  npwrd: `NPWRD-PMK-${String(inv.operatorId || inv.id).padStart(5, "0")}`,
                                  retribusiTypeLabel: "Retribusi Jasa Kepelabuhanan",
                                  items: payload.items || inv.items,
                                  principalIdr: totalIdr,
                                  totalIdr,
                                  portName: payload.port?.name,
                                  visitNumber: inv.visit?.visitNumber,
                                  vesselSummary: `${payload.vessel?.name || inv.visit?.vessel?.name || "Kapal"} (${Number(
                                    inv.visit?.vessel?.grossTonnage || 0
                                  ).toLocaleString("id-ID")} GT)`,
                                });
                              } catch {
                                setErrorToast("Gagal mengambil rincian cetak.");
                              }
                            }}
                            className="p-1.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg text-[#0B241E] transition-colors cursor-pointer"
                            title="Cetak Salinan SKRD"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#64748B]" />
                          </button>

                          {inv.status === "DRAFT" && (
                            <button
                              type="button"
                              onClick={() => handleIssueInvoice(inv.id, inv.invoiceNumber)}
                              className="px-2.5 py-1 bg-[#0B241E] hover:bg-[#143E33] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              Issue
                            </button>
                          )}

                          {inv.status !== "VOID" && inv.status !== "PAID" && (
                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceForVoid(inv)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors cursor-pointer"
                              title="Batalkan (Void) SKRD"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal Konfirmasi Terbitkan e-SKRD (Rampung / Uang Muka) */}
      {selectedVisitForSkrd && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#CBD5E1] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0B241E] text-[#D97706] flex items-center justify-center shrink-0">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#0B241E]">
                    Penerbitan Ketetapan e-SKRD Pelabuhan
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    {selectedVisitForSkrd.status === "DEPARTED"
                      ? "e-SKRD Rampung (Final) setelah selesai sandar"
                      : "Pilih jenis ketetapan retribusi kepelabuhanan"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVisitForSkrd(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0B241E] hover:bg-[#F1F5F9] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pilihan Mode e-SKRD (hanya tampil jika belum DEPARTED) */}
            {selectedVisitForSkrd.status !== "DEPARTED" && (
              <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] p-1.5 rounded-xl border border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setSkrdType("FINAL")}
                  className={`p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                    skrdType === "FINAL"
                      ? "bg-[#0B241E] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#0B241E] hover:bg-white"
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${skrdType === "FINAL" ? "text-[#D97706]" : "text-[#94A3B8]"}`} />
                    e-SKRD Rampung (Final)
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    Setelah selesai sandar & utilitas aktual
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSkrdType("ADVANCE")}
                  className={`p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                    skrdType === "ADVANCE"
                      ? "bg-[#0B241E] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#0B241E] hover:bg-white"
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <Coins className={`w-3.5 h-3.5 ${skrdType === "ADVANCE" ? "text-[#D97706]" : "text-[#94A3B8]"}`} />
                    e-SKRD Uang Muka (Advance)
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    Deposit labuh/tambat saat warta kedatangan
                  </div>
                </button>
              </div>
            )}

            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs space-y-1.5 text-emerald-950">
              <div className="font-bold flex items-center justify-between gap-2">
                <span>Kapal: {selectedVisitForSkrd.vessel?.name}</span>
                <span className="font-mono text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                  {selectedVisitForSkrd.visitNumber}
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                {skrdType === "FINAL"
                  ? "Sistem menghitung tarif resmi jasa labuh, jasa tambat dermaga, dan utilitas berdasarkan durasi aktual sandar kapal."
                  : "Menerbitkan tagihan deposit uang muka tambat/labuh di awal kedatangan kapal sesuai ketentuan Perda Mimika No. 4/2023."}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                <span className="font-bold text-[#475569]">
                  Jatuh Tempo Pembayaran
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#0B241E]">
                    {skrdDueDate ? skrdDueDate.split("-").reverse().join("/") : "-"}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#475569] border border-[#CBD5E1]">
                    Otomatis +30 Hari
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0B241E] mb-1">
                  Catatan Tambahan Ketetapan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={skrdNotes}
                  onChange={(e) => setSkrdNotes(e.target.value)}
                  placeholder={
                    skrdType === "FINAL"
                      ? "Contoh: Penyesuaian shift sandar atau catatan verifikasi akhir..."
                      : "Contoh: Uang muka labuh tambat 3 hari kedepan..."
                  }
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <div className="pt-3.5 border-t border-[#E2E8F0] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedVisitForSkrd(null)}
                className="px-4 py-2 border border-[#CBD5E1] rounded-xl text-xs font-bold text-[#475569] hover:bg-[#F8FAFC] cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleGenerateSkrd}
                disabled={isProcessing}
                className="px-5 py-2 bg-[#0B241E] hover:bg-[#143E33] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
                <span>
                  {skrdType === "ADVANCE" ? "Terbitkan e-SKRD Uang Muka" : "Tetapkan & Terbitkan e-SKRD Rampung"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal Batalkan / Void SKRD */}
      {selectedInvoiceForVoid && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-rose-200 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <h3 className="font-black text-sm text-rose-700 flex items-center gap-2">
                <Ban className="w-4 h-4" />
                <span>Batalkan (Void) Ketetapan e-SKRD</span>
              </h3>
              <button
                onClick={() => setSelectedInvoiceForVoid(null)}
                className="p-1.5 text-[#64748B] hover:text-[#0B241E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#64748B]">
              Anda akan membatalkan nomor ketetapan <strong>{selectedInvoiceForVoid.invoiceNumber}</strong>. Tindakan ini memerlukan dasar berita acara pembatalan resmi.
            </p>

            <div className="text-xs space-y-1">
              <label className="block font-bold text-[#0B241E]">
                Alasan Pembatalan / No. Berita Acara <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Koreksi durasi sandar aktual oleh Syahbandar / Duplikasi ketetapan..."
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-medium"
                required
              />
            </div>

            <div className="pt-3 border-t border-[#F1F5F9] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedInvoiceForVoid(null)}
                className="px-4 py-2 border border-[#CBD5E1] rounded-xl text-xs font-bold text-[#64748B]"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleVoidInvoice}
                disabled={isProcessing}
                className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-extrabold cursor-pointer disabled:opacity-50"
              >
                Konfirmasi Pembatalan (Void)
              </button>
            </div>
          </div>
        </div>
      )}

      <OfficialRetribusiDocumentModal
        isOpen={Boolean(printableSkrdDoc)}
        data={printableSkrdDoc}
        onClose={() => setPrintableSkrdDoc(null)}
      />
    </div>
  );
}
