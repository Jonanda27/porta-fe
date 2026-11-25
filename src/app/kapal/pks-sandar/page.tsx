"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FileSignature,
  FileText,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  X,
  Send,
  Loader2,
  ExternalLink,
  Calendar,
  Anchor,
  Printer,
  Upload,
} from "lucide-react";
import { API_CONFIG } from "@/config/api.config";
import { BerthingContractPrintModal } from "@/components/contracts/BerthingContractPrintModal";
import { useKapalStore } from "@/store/kapal.store";
import { useAuthStore } from "@/store/auth.store";
import { usePortStore } from "@/store/port.store";
import { toast } from "@/store/toast.store";
import {
  BerthingContractFilter as ContractFilter,
  OperatorBerthingContract,
} from "@/types/kapal.types";

export default function KapalPksSandarPage() {
  const { user } = useAuthStore();
  const {
    operator,
    contracts,
    isLoading,
    error,
    fetchDashboardData,
    createContract,
    uploadSignedContract,
  } = useKapalStore();

  const { ports, berths, fetchPorts, fetchBerths } = usePortStore();

  const [statusFilter, setStatusFilter] = useState<ContractFilter>("ALL");
  const [isAddContractModalOpen, setIsAddContractModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadingContractId, setUploadingContractId] = useState<number | null>(null);
  const [previewContract, setPreviewContract] = useState<OperatorBerthingContract | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [contractFormData, setContractFormData] = useState({
    title: "Perjanjian Kerja Sama Pemanfaatan Fasilitas Sandar & Kolam Labuh",
    portId: 1,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split("T")[0],
    monthlyQuota: 30,
    dockAllocation: "Semua Fasilitas Dermaga (Umum)",
    file: null as File | null,
  });

  const backendOrigin = useMemo(
    () => API_CONFIG.BASE_URL.replace(/\/api\/v1\/?$/, ""),
    []
  );

  const getBackendFileUrl = (filePath?: string | null): string | null => {
    if (!filePath) return null;
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }
    return `${backendOrigin}/${filePath.replace(/^\/+/, "")}`;
  };

  useEffect(() => {
    fetchDashboardData();
    fetchPorts();
  }, [fetchDashboardData, fetchPorts]);

  useEffect(() => {
    if (ports && ports.length > 0) {
      const activePortId = contractFormData.portId || ports[0].id;
      fetchBerths(activePortId);
    }
  }, [ports, contractFormData.portId, fetchBerths]);

  const activeContractsCount = useMemo(
    () => contracts.filter((c) => c.status === "ACTIVE").length,
    [contracts]
  );

  const pendingContractsCount = useMemo(
    () =>
      contracts.filter(
        (c) =>
          c.status === "PENDING_VERIFICATION" ||
          c.status === "WAITING_OPERATOR_SIGNATURE" ||
          c.status === "PENDING_HEAD_OF_PORT"
      ).length,
    [contracts]
  );

  const waitingSignatureCount = useMemo(
    () => contracts.filter((c) => c.status === "WAITING_OPERATOR_SIGNATURE").length,
    [contracts]
  );

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      if (statusFilter === "ALL") return true;
      if (statusFilter === "ACTIVE") return c.status === "ACTIVE";
      if (statusFilter === "WAITING_OPERATOR_SIGNATURE") {
        return c.status === "WAITING_OPERATOR_SIGNATURE";
      }
      if (statusFilter === "PENDING_VERIFICATION") {
        return (
          c.status === "PENDING_VERIFICATION" ||
          c.status === "WAITING_OPERATOR_SIGNATURE" ||
          c.status === "PENDING_HEAD_OF_PORT"
        );
      }
      return c.status === "REJECTED" || c.status === "EXPIRED";
    });
  }, [contracts, statusFilter]);

  const handleUploadSignedScan = async (contractId: number, file?: File) => {
    if (!file) return;
    setUploadingContractId(contractId);
    try {
      await uploadSignedContract(contractId, file);
      toast.success(
        "Scan Kontrak Diunggah",
        "Scan kontrak bertanda tangan basah berhasil dikirim ke Kepala Pelabuhan untuk pengesahan TTE."
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal mengunggah scan kontrak bertanda tangan basah.";
      toast.error("Gagal Upload", msg);
    } finally {
      setUploadingContractId(null);
    }
  };

  const getDaysRemaining = (endDate: string): number => {
    const diffMs = new Date(endDate).getTime() - Date.now();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const handleOpenAddContract = (prefillFrom?: OperatorBerthingContract) => {
    const defaultPortId = prefillFrom?.portId || (ports.length > 0 ? ports[0].id : 1);
    const today = new Date();
    let start = today.toISOString().split("T")[0];
    let end = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split("T")[0];

    if (prefillFrom?.endDate) {
      const nextDay = new Date(prefillFrom.endDate);
      if (!Number.isNaN(nextDay.getTime()) && nextDay.getTime() > today.getTime()) {
        nextDay.setDate(nextDay.getDate() + 1);
        start = nextDay.toISOString().split("T")[0];
        const nextYear = new Date(nextDay);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        end = nextYear.toISOString().split("T")[0];
      }
    }

    setContractFormData({
      title:
        prefillFrom?.title ||
        "Perjanjian Kerja Sama Pemanfaatan Fasilitas Sandar & Kolam Labuh",
      portId: defaultPortId,
      startDate: start,
      endDate: end,
      monthlyQuota: prefillFrom?.monthlyQuota || 30,
      dockAllocation: prefillFrom?.dockAllocation || "Semua Fasilitas Dermaga (Umum)",
      file: null,
    });
    fetchBerths(defaultPortId);
    setErrorMessage(null);
    setIsAddContractModalOpen(true);
  };

  const handleSubmitAddContract = async (e: React.FormEvent) => {
    e.preventDefault();
    const opId = operator?.id || user?.operatorId;
    if (!opId) {
      setErrorMessage("Profil operator tidak ditemukan.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await createContract(
        opId,
        {
          title: contractFormData.title,
          portId: Number(contractFormData.portId),
          startDate: contractFormData.startDate,
          endDate: contractFormData.endDate,
          monthlyQuota: Number(contractFormData.monthlyQuota),
          dockAllocation: contractFormData.dockAllocation,
        },
        contractFormData.file || undefined
      );

      setIsAddContractModalOpen(false);
      toast.success(
        "Permohonan PKS Sandar Diajukan",
        "Permohonan PKS Sandar Kapal berhasil diajukan dan sedang menunggu verifikasi Kepala Pelabuhan."
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengajukan PKS Sandar Kapal.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Global Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchDashboardData()}
            className="underline font-bold hover:text-rose-950 cursor-pointer"
          >
            Muat Ulang
          </button>
        </div>
      )}

      {/* Control Deck: Filter Status + Ringkasan + Tombol Ajukan */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-3.5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "ALL", label: `Semua (${contracts.length})` },
            { id: "ACTIVE", label: `Aktif (${activeContractsCount})` },
            ...(waitingSignatureCount > 0
              ? [
                  {
                    id: "WAITING_OPERATOR_SIGNATURE",
                    label: `Perlu TTD Basah (${waitingSignatureCount})`,
                  },
                ]
              : []),
            { id: "PENDING_VERIFICATION", label: `Dalam Proses (${pendingContractsCount})` },
            { id: "INACTIVE", label: "Ditolak / Kedaluwarsa" },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as ContractFilter)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#0B241E] text-white shadow-xs"
                    : "bg-[#F8FAFC] text-[#64748B] hover:text-[#0B241E] border border-[#E2E8F0]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{activeContractsCount} PKS Aktif</span>
          </span>
          {pendingContractsCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{pendingContractsCount} Proses</span>
            </span>
          )}
          <button
            type="button"
            onClick={() => fetchDashboardData()}
            disabled={isLoading}
            className="p-2.5 border border-[#CBD5E1] bg-white rounded-xl hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0B241E] cursor-pointer disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => handleOpenAddContract()}
            className="px-4 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D97706]" />
            <span>Ajukan PKS Sandar Baru</span>
          </button>
        </div>
      </div>

      {/* Konten Daftar Kontrak PKS Sandar */}
      {isLoading && contracts.length === 0 ? (
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-10 text-center space-y-3">
          <RefreshCw className="w-7 h-7 text-[#0B241E] animate-spin mx-auto" />
          <p className="text-xs text-[#64748B]">Memuat daftar Kontrak PKS Sandar dari server...</p>
        </div>
      ) : contracts.length === 0 ? (
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-10 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-700 mx-auto flex items-center justify-center">
            <FileSignature className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-extrabold text-sm text-[#0B241E]">
              Belum Ada Kontrak Payung (PKS Sandar)
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Berdasarkan aturan operasional pelabuhan, operator kapal wajib memiliki PKS Sandar aktif yang disetujui Kepala Pelabuhan sebelum dapat mengajukan permohonan jadwal dan tambat dermaga.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenAddContract()}
            className="px-4 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#D97706]" />
            <span>Ajukan PKS Sandar Sekarang</span>
          </button>
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-8 text-center text-xs text-[#64748B] space-y-2">
          <FileSignature className="w-8 h-8 text-[#94A3B8] mx-auto" />
          <p className="font-bold text-[#0B241E]">Tidak ada kontrak PKS pada filter status ini.</p>
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className="text-xs font-bold text-[#0B241E] underline cursor-pointer"
          >
            Tampilkan Semua Kontrak
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContracts.map((contract) => {
            const daysRemaining = getDaysRemaining(contract.endDate);
            const quotaTotal = contract.monthlyQuota || 0;
            const quotaUsed = contract.usedQuota || 0;
            const quotaPercent =
              quotaTotal > 0 ? Math.min(100, Math.round((quotaUsed / quotaTotal) * 100)) : 0;
            const fileUrl = getBackendFileUrl(contract.filePath);

            return (
              <div
                key={contract.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4 ${
                  contract.status === "ACTIVE"
                    ? "border-emerald-300"
                    : contract.status === "PENDING_VERIFICATION"
                    ? "border-amber-300"
                    : contract.status === "REJECTED"
                    ? "border-rose-200"
                    : "border-[#CBD5E1]"
                }`}
              >
                <div className="space-y-4">
                  {/* Header Card */}
                  <div className="flex items-start justify-between gap-3 border-b border-[#F1F5F9] pb-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                          {contract.contractNumber}
                        </span>
                        {contract.status === "ACTIVE" && daysRemaining > 0 && (
                          <span
                            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                              daysRemaining <= 45
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            Sisa {daysRemaining} hari
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-sm text-[#0B241E] mt-1.5 leading-snug">
                        {contract.title}
                      </h4>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                        contract.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : contract.status === "WAITING_OPERATOR_SIGNATURE"
                          ? "bg-sky-100 text-sky-900 border border-sky-200"
                          : contract.status === "PENDING_HEAD_OF_PORT"
                          ? "bg-indigo-100 text-indigo-900 border border-indigo-200"
                          : contract.status === "PENDING_VERIFICATION"
                          ? "bg-amber-100 text-amber-900 border border-amber-200"
                          : contract.status === "REJECTED"
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {contract.status === "ACTIVE"
                        ? "Aktif & Disahkan TTE"
                        : contract.status === "WAITING_OPERATOR_SIGNATURE"
                        ? "Perlu TTD Basah"
                        : contract.status === "PENDING_HEAD_OF_PORT"
                        ? "Menunggu TTE Ka. Pelabuhan"
                        : contract.status === "PENDING_VERIFICATION"
                        ? "Verifikasi Petugas"
                        : contract.status === "REJECTED"
                        ? "Ditolak"
                        : "Kedaluwarsa"}
                    </span>
                  </div>

                  {/* Detail Metadata */}
                  <div className="space-y-2 text-xs text-[#64748B]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5">
                        <Anchor className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span>Pelabuhan</span>
                      </span>
                      <strong className="text-[#0B241E]">
                        {contract.port?.name || "Pelabuhan Poumako"}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span>Masa Berlaku</span>
                      </span>
                      <span className="font-mono text-[#0B241E] font-medium">
                        {new Date(contract.startDate).toLocaleDateString("id-ID")} s/d{" "}
                        {new Date(contract.endDate).toLocaleDateString("id-ID")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span>Alokasi Dermaga</span>
                      <span className="text-[#0B241E] font-medium text-right">
                        {contract.dockAllocation || "Semua Fasilitas Dermaga (Umum)"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span>Pengesahan Kepala Pelabuhan</span>
                      <span className="text-[#0B241E] font-medium text-right">
                        {contract.verifiedBy
                          ? `${contract.verifiedBy.fullName}`
                          : "Menunggu pengesahan"}
                      </span>
                    </div>
                  </div>

                  {/* Progress Kuota Slot Sandar Bulanan */}
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#334155]">Kuota Slot Sandar Bulanan</span>
                      <span className="font-mono font-bold text-[#0B241E]">
                        {quotaUsed} / {quotaTotal || "-"} Slot ({quotaPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          quotaPercent >= 90
                            ? "bg-rose-500"
                            : quotaPercent >= 70
                            ? "bg-amber-500"
                            : "bg-emerald-600"
                        }`}
                        style={{ width: `${quotaPercent}%` }}
                      />
                    </div>
                  </div>

                  {contract.status === "WAITING_OPERATOR_SIGNATURE" && (
                    <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 space-y-2.5">
                      <p className="text-[11px] font-semibold text-sky-950 leading-relaxed">
                        Permohonan lolos verifikasi petugas! Cetak surat kontrak PKS, bubuhkan{" "}
                        <strong>tanda tangan basah + materai</strong>, lalu scan &amp; upload ulang di sini.
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewContract(contract)}
                          className="px-3 py-1.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#F59E0B]" />
                          Cetak / Unduh Surat Kontrak
                        </button>
                        <label className="px-3 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer">
                          {uploadingContractId === contract.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {uploadingContractId === contract.id
                              ? "Mengunggah..."
                              : "Upload Scan TTD Basah"}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            disabled={uploadingContractId === contract.id}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              handleUploadSignedScan(contract.id, file);
                              e.target.value = "";
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {contract.status === "REJECTED" && contract.rejectionReason && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px]">
                      <strong>Alasan Penolakan:</strong> {contract.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Footer Aksi */}
                <div className="pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-2">
                  {fileUrl ? (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-[#0284C7] hover:text-[#0B241E] inline-flex items-center gap-1.5 truncate max-w-[200px]"
                      title={contract.fileName || "Dokumen PKS"}
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{contract.fileName || "PKS_Sandar.pdf"}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-[#64748B] inline-flex items-center gap-1.5 truncate max-w-[200px]">
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{contract.fileName || "Belum ada lampiran"}</span>
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    {(contract.status === "PENDING_HEAD_OF_PORT" ||
                      contract.status === "ACTIVE") && (
                      <button
                        type="button"
                        onClick={() => setPreviewContract(contract)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0B241E] text-[11px] font-bold rounded-xl inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Surat Kontrak
                      </button>
                    )}
                    {contract.status === "ACTIVE" && (
                      <Link
                        href="/kapal/permohonan"
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold rounded-xl transition-colors"
                      >
                        Ajukan Sandar
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenAddContract(contract)}
                      className="px-3.5 py-1.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-[11px] font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Perbarui / Ajukan Baru
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AJUKAN PERMOHONAN PKS SANDAR BARU (KONTRAK PAYUNG)                 */}
      {/* ========================================================================= */}
      {isAddContractModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 border border-[#CBD5E1] shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-xs">
                  <FileSignature className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#0B241E]">
                    Pengajuan Perjanjian Kerja Sama (PKS Sandar)
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Kontrak Payung Pelayanan Jasa Labuh &amp; Tambat Kapal (Verifikasi Kepala Pelabuhan)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddContractModalOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#0B241E] cursor-pointer"
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

            <form onSubmit={handleSubmitAddContract} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#0B241E] mb-1">
                  Judul Perjanjian Kerja Sama (PKS) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={contractFormData.title}
                  onChange={(e) =>
                    setContractFormData({ ...contractFormData, title: e.target.value })
                  }
                  className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0B241E] mb-1">
                    Pelabuhan Tujuan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={contractFormData.portId}
                    onChange={(e) => {
                      const pId = Number(e.target.value);
                      setContractFormData({
                        ...contractFormData,
                        portId: pId,
                        dockAllocation: "Semua Fasilitas Dermaga (Umum)",
                      });
                      fetchBerths(pId);
                    }}
                    className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E]"
                  >
                    {ports && ports.length > 0 ? (
                      ports.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code})
                        </option>
                      ))
                    ) : (
                      <option value={1}>Pelabuhan Umum Poumako (PMK)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B241E] mb-1">
                    Alokasi Dermaga
                  </label>
                  <select
                    value={contractFormData.dockAllocation}
                    onChange={(e) =>
                      setContractFormData({ ...contractFormData, dockAllocation: e.target.value })
                    }
                    className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E]"
                  >
                    <option value="Semua Fasilitas Dermaga (Umum)">
                      Semua Fasilitas Dermaga (Umum)
                    </option>
                    {berths &&
                      berths.length > 0 &&
                      berths.map((b) => (
                        <option key={b.id} value={`${b.name} (${b.code})`}>
                          {b.name} ({b.code})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0B241E] mb-1">
                    Tanggal Mulai Berlaku <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={contractFormData.startDate}
                    onChange={(e) =>
                      setContractFormData({ ...contractFormData, startDate: e.target.value })
                    }
                    className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B241E] mb-1">
                    Tanggal Berakhir <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={contractFormData.endDate}
                    onChange={(e) =>
                      setContractFormData({ ...contractFormData, endDate: e.target.value })
                    }
                    className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B241E] mb-1">
                  Estimasi Kuota Kunjungan Bulanan (Slot Sandar/Bulan)
                </label>
                <input
                  type="number"
                  min={1}
                  value={contractFormData.monthlyQuota}
                  onChange={(e) =>
                    setContractFormData({
                      ...contractFormData,
                      monthlyQuota: Number(e.target.value),
                    })
                  }
                  className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B241E] mb-1">
                  Upload Berkas Permohonan / Draft PKS (PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) =>
                    setContractFormData({
                      ...contractFormData,
                      file: e.target.files?.[0] || null,
                    })
                  }
                  className="w-full text-xs font-semibold p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E]"
                />
                <p className="text-[10px] text-[#64748B] mt-1">
                  Format disarankan PDF maks. 10MB. Dokumen akan diverifikasi dan disahkan Kepala Pelabuhan.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsAddContractModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0B241E] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-extrabold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#D97706]" />
                  ) : (
                    <Send className="w-4 h-4 text-[#D97706]" />
                  )}
                  <span>Kirim Permohonan PKS Sandar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BerthingContractPrintModal
        contract={previewContract}
        operatorNameFallback={operator?.name}
        onClose={() => setPreviewContract(null)}
      />
    </div>
  );
}
