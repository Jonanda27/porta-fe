"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Store,
  FileText,
  Zap,
  Receipt,
  ShieldCheck,
  Clock,
  Upload,
  AlertCircle,
  Loader2,
  ArrowRight,
  Wrench,
  Search,
} from "lucide-react";
import { useTenantStore } from "@/store/tenant.store";
import { toast } from "@/store/toast.store";
import { TenantDocumentCategory } from "@/types/tenant.types";
import { formatLabel } from "@/lib/format-labels";
import { ComplaintService } from "@/services/complaint.service";
import { ComplaintItem, ComplaintStatus } from "@/types/complaint.types";
import { ReportFacilityIssueModal } from "@/components/tenant/ReportFacilityIssueModal";
import { TrackComplaintModal } from "@/components/tenant/TrackComplaintModal";

export default function TenantDashboardPage() {
  const {
    profile,
    assets,
    leases,
    utilities,
    isLoading,
    isSubmitting,
    error,
    fetchTenantData,
    uploadDocument,
    clearError,
  } = useTenantStore();

  const [docCategory, setDocCategory] =
    useState<TenantDocumentCategory>("SIUPAL_NIB");
  const [docNumber, setDocNumber] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackingTicket, setTrackingTicket] = useState("");
  const [myComplaints, setMyComplaints] = useState<ComplaintItem[]>([]);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(false);

  const fetchComplaints = async () => {
    try {
      setIsLoadingComplaints(true);
      const data = await ComplaintService.getMyComplaints();
      setMyComplaints(data);
    } catch {
      // ignore
    } finally {
      setIsLoadingComplaints(false);
    }
  };

  useEffect(() => {
    fetchTenantData();
    fetchComplaints();
  }, [fetchTenantData]);

  const activeLeases = leases.filter((l) => l.status === "ACTIVE");
  const unpaidUtilities = utilities.filter((u) => u.paymentStatus === "UNPAID");
  const availableAssets = assets.filter(
    (a) => a.status === "AVAILABLE" && a.billingEligibility === "BILLABLE"
  );

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) return;
    clearError();
    await uploadDocument(
      docCategory,
      docFile,
      docNumber.trim() || undefined
    );
    toast.success("Dokumen legalitas berhasil diunggah untuk verifikasi admin.");
    setDocNumber("");
    setDocFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Verification Status Banner */}
      {profile && (
        <div
          className={`rounded-2xl p-5 border flex flex-wrap items-center justify-between gap-4 ${
            profile.verificationStatus === "VERIFIED"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : profile.verificationStatus === "REJECTED"
              ? "bg-rose-50 border-rose-200 text-rose-900"
              : "bg-amber-50 border-amber-200 text-amber-900"
          }`}
        >
          <div className="flex items-start gap-3">
            {profile.verificationStatus === "VERIFIED" ? (
              <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <Clock className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            )}
            <div>
              <h2 className="text-sm font-extrabold">
                {profile.name} — Status Akun: {formatLabel(profile.verificationStatus)}
              </h2>
              <p className="text-xs mt-0.5 opacity-90">
                {profile.verificationStatus === "VERIFIED"
                  ? "Akun usaha Anda telah terverifikasi. Anda dapat mengajukan sewa fasilitas pelabuhan."
                  : profile.verificationStatus === "REJECTED"
                  ? `Ditolak: ${
                      profile.rejectionReason || "Silakan unggah ulang dokumen legalitas."
                    }`
                  : "Menunggu verifikasi Admin Pelabuhan. Pastikan dokumen NIB/NPWP sudah diunggah."}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-white/70 border border-current/20">
            {profile.documents?.length ?? 0} Dokumen Terunggah
          </span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. OVERLAPPING OPERATIONAL KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/tenant/kontrak"
          className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <FileText className="w-4.5 h-4.5" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 truncate">
                {activeLeases.length > 0 ? "PKS Aktif" : "Belum Aktif"}
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-4">
              Kontrak PKS Aktif
            </p>
            <p className="text-2xl font-extrabold text-[#0B241E] mt-1 tracking-tight">
              {activeLeases.length} Kontrak
            </p>
          </div>
          <p className="text-xs text-[#64748B] mt-3 pt-2.5 border-t border-[#F1F5F9]">
            Total {leases.length} riwayat pengajuan/kontrak
          </p>
        </Link>

        <Link
          href="/tenant/sewa"
          className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Store className="w-4.5 h-4.5" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 truncate">
                Katalog Aset
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-4">
              Unit Aset Tersedia
            </p>
            <p className="text-2xl font-extrabold text-[#0B241E] mt-1 tracking-tight">
              {availableAssets.length} Unit
            </p>
          </div>
          <p className="text-xs text-[#D97706] font-semibold mt-3 pt-2.5 border-t border-[#F1F5F9] inline-flex items-center justify-between w-full">
            <span>Lihat Katalog Aset</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </Link>

        <Link
          href="/tenant/utilitas"
          className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Zap className="w-4.5 h-4.5" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 truncate">
                {unpaidUtilities.length} Belum Lunas
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-4">
              Catatan Utilitas
            </p>
            <p className="text-2xl font-extrabold text-[#0B241E] mt-1 tracking-tight">
              {utilities.length} Catatan
            </p>
          </div>
          <p className="text-xs text-[#64748B] mt-3 pt-2.5 border-t border-[#F1F5F9]">
            {unpaidUtilities.length} tagihan utilitas belum lunas
          </p>
        </Link>

        <Link
          href="/tenant/tagihan"
          className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Receipt className="w-4.5 h-4.5" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 truncate">
                Per Tahun Berjalan
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-4">
              Total Nilai Kontrak Aktif
            </p>
            <p className="text-2xl font-extrabold text-[#0B241E] mt-1 tracking-tight">
              Rp{" "}
              {activeLeases
                .reduce((sum, l) => sum + Number(l.totalAnnualAmountIdr), 0)
                .toLocaleString("id-ID")}
            </p>
          </div>
          <p className="text-xs text-[#64748B] mt-3 pt-2.5 border-t border-[#F1F5F9]">
            Akumulasi kontrak sewa aktif
          </p>
        </Link>
      </div>

      {/* Quick Action Header Bar: Layanan Terpadu & Kendala Fasilitas */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0B241E]/10 flex items-center justify-center text-[#0B241E]">
            <Wrench className="w-5 h-5 text-[#D97706]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0B241E]">
              Layanan Pelaporan & Pemeliharaan Fasilitas
            </h2>
            <p className="text-xs text-[#64748B]">
              Laporkan kerusakan air, listrik, rolling door, atau lacak tiket aduan UPTD Pelabuhan
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTrackModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-[#0B241E] flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Lacak Tiket Aduan</span>
          </button>
          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow transition-all"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Lapor Kendala Fasilitas</span>
          </button>
        </div>
      </div>

      {/* Riwayat Aduan & Pemeliharaan Fasilitas */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#0B241E] flex items-center gap-2">
            <Wrench className="w-4 h-4 text-[#D97706]" />
            Status Aduan & Perbaikan Fasilitas Kios ({myComplaints.length})
          </h3>
          <button
            type="button"
            onClick={() => fetchComplaints()}
            disabled={isLoadingComplaints}
            className="text-xs text-[#64748B] hover:text-[#0B241E] font-semibold cursor-pointer"
          >
            Refresh
          </button>
        </div>

        {myComplaints.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-[#64748B]">
            <p className="text-xs font-medium">
              Belum ada laporan kendala fasilitas yang diajukan.
            </p>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">
              Jika terdapat kendala kelistrikan, kebocoran pipa air bersih, atau kerusakan rolling door kios, silakan ajukan laporan melalui tombol di atas.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden">
            {myComplaints.slice(0, 5).map((comp) => (
              <div
                key={comp.ticketNumber}
                className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#0B241E]">
                      {comp.ticketNumber}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {comp.category}
                    </span>
                    {comp.status === "RESOLVED" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Selesai
                      </span>
                    ) : comp.status === "IN_PROGRESS" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Sedang Ditangani
                      </span>
                    ) : comp.status === "CLOSED" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        Ditutup
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                        Diterima
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#475569] mt-1 font-medium">
                    {comp.subject}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {new Date(comp.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTrackingTicket(comp.ticketNumber);
                    setIsTrackModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-[#0B241E] flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <span>Lacak Detail</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Legal Document Form */}
      <form
        onSubmit={handleUploadDoc}
        className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-2xs"
      >
        <h3 className="text-sm font-extrabold text-[#0B241E] flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#D97706]" />
          Unggah Dokumen Legalitas Usaha (NIB / NPWP)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={docCategory}
            onChange={(e) =>
              setDocCategory(e.target.value as TenantDocumentCategory)
            }
            className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
          >
            <option value="SIUPAL_NIB">NIB / Izin Usaha</option>
            <option value="NPWP">NPWP</option>
            <option value="LAINNYA">Dokumen Lainnya</option>
          </select>
          <input
            type="text"
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
            placeholder="Nomor Dokumen (Opsional)"
            className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
          />
          <input
            type="file"
            required
            onChange={(e) => setDocFile(e.target.files?.[0] || null)}
            className="text-xs"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="px-4 py-2 rounded-xl bg-[#0B241E] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
        >
          {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Unggah Dokumen
        </button>
      </form>

      {/* Modal Lapor Kendala Fasilitas */}
      <ReportFacilityIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccessSubmitted={(ticket) => {
          fetchComplaints();
          setTrackingTicket(ticket);
          setIsTrackModalOpen(true);
        }}
        onOpenTracker={(ticket) => {
          setTrackingTicket(ticket || "");
          setIsTrackModalOpen(true);
        }}
      />

      {/* Modal Lacak Aduan */}
      <TrackComplaintModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        initialTicketNumber={trackingTicket}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />
    </div>
  );
}
