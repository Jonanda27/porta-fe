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
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useTenantStore } from "@/store/tenant.store";
import { TenantDocumentCategory } from "@/types/tenant.types";

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
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchTenantData();
  }, [fetchTenantData]);

  const activeLeases = leases.filter((l) => l.status === "ACTIVE");
  const unpaidUtilities = utilities.filter((u) => u.paymentStatus === "UNPAID");
  const availableAssets = assets.filter(
    (a) => a.status === "AVAILABLE" && a.billingEligibility === "BILLABLE"
  );

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) return;
    setFeedback(null);
    clearError();
    await uploadDocument(
      docCategory,
      docFile,
      docNumber.trim() || undefined
    );
    setFeedback("Dokumen legalitas berhasil diunggah untuk verifikasi admin.");
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
                {profile.name} — Status Akun: {profile.verificationStatus}
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

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0B241E] text-white rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#85A69B] text-xs font-bold">
            <span>Kontrak PKS Aktif</span>
            <FileText className="w-4 h-4 text-[#D97706]" />
          </div>
          <p className="text-2xl font-extrabold mt-2">{activeLeases.length}</p>
          <p className="text-[11px] text-[#BED2CA] mt-1">
            Total {leases.length} riwayat pengajuan/kontrak
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-bold">
            <span>Unit Aset Tersedia</span>
            <Store className="w-4 h-4 text-[#0B241E]" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B241E] mt-2">
            {availableAssets.length}
          </p>
          <Link
            href="/tenant/sewa"
            className="text-[11px] text-[#D97706] font-bold mt-1 inline-flex items-center gap-1"
          >
            Lihat Katalog <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-bold">
            <span>Catatan Utilitas</span>
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B241E] mt-2">
            {utilities.length}
          </p>
          <p className="text-[11px] text-[#64748B] mt-1">
            {unpaidUtilities.length} tagihan utilitas belum lunas
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-bold">
            <span>Total Nilai Kontrak Aktif</span>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-extrabold text-[#0B241E] mt-2">
            Rp{" "}
            {activeLeases
              .reduce((sum, l) => sum + Number(l.totalAnnualAmountIdr), 0)
              .toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-[#64748B] mt-1">Per tahun berjalan</p>
        </div>
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
    </div>
  );
}
