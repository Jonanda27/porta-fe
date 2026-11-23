"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Store,
  Calendar,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building,
} from "lucide-react";
import { useTenantStore } from "@/store/tenant.store";

export function ApplyLeaseModal() {
  const {
    assets,
    profile,
    isApplyModalOpen,
    selectedAssetForApply,
    closeApplyModal,
    requestLease,
    isSubmitting,
    error,
    clearError,
  } = useTenantStore();

  const availableAssets = useMemo(() => {
    return assets.filter(
      (a) => a.status === "AVAILABLE" || a.id === selectedAssetForApply?.id
    );
  }, [assets, selectedAssetForApply]);

  const [selectedAssetId, setSelectedAssetId] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isApplyModalOpen) {
      clearError();
      setSuccessMessage(null);

      // Default start date: today
      const today = new Date();
      const startStr = today.toISOString().split("T")[0];
      setStartDate(startStr);

      // Default end date: 1 year later
      const nextYear = new Date(today);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setEndDate(nextYear.toISOString().split("T")[0]);

      if (selectedAssetForApply) {
        setSelectedAssetId(selectedAssetForApply.id);
      } else if (availableAssets.length > 0) {
        setSelectedAssetId(availableAssets[0].id);
      }
    }
  }, [isApplyModalOpen, selectedAssetForApply, availableAssets, clearError]);

  if (!isApplyModalOpen) return null;

  const currentAsset =
    availableAssets.find((a) => a.id === selectedAssetId) ||
    selectedAssetForApply ||
    availableAssets[0];

  const area = currentAsset ? Number(currentAsset.areaSqm) : 0;
  const rate = currentAsset ? Number(currentAsset.annualRatePerSqmIdr) : 0;
  const annualTotal = area * rate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAsset) return;

    try {
      await requestLease({
        assetId: currentAsset.id,
        startDate,
        endDate,
      });

      setSuccessMessage(
        `Permohonan sewa untuk ${currentAsset.name} berhasil diajukan! Menunggu verifikasi Petugas Ruangan & Kepala Pelabuhan.`
      );

      setTimeout(() => {
        closeApplyModal();
      }, 2500);
    } catch {
      // Error is handled in zustand store
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-[#E2E8F0] w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-[#D97706] flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0B241E]">
                Permohonan Sewa Fasilitas
              </h3>
              <p className="text-xs text-[#64748B]">
                Pilih unit kios/gudang/ruang usaha dan tentukan periode sewa.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeApplyModal}
            className="p-1.5 rounded-xl text-[#94A3B8] hover:text-[#0B241E] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Alert Banner */}
        {profile?.verificationStatus !== "VERIFIED" && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              Status akun usaha Anda saat ini{" "}
              <strong>{profile?.verificationStatus || "PENDING"}</strong>.
              Permohonan Anda akan diproses setelah kelengkapan berkas NIB/NPWP diverifikasi.
            </p>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#334155] mb-1">
              Pilih Unit Fasilitas / Ruang Usaha <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(Number(e.target.value))}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0B241E] focus:outline-none focus:border-[#0B241E] focus:bg-white transition-all cursor-pointer"
            >
              {availableAssets.length === 0 ? (
                <option value={0} disabled>
                  Tidak ada unit aset yang tersedia saat ini
                </option>
              ) : (
                availableAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.assetCode}) — {asset.areaSqm} m²
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Tanggal Mulai Sewa <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0B241E] focus:outline-none focus:border-[#0B241E] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Tanggal Selesai Sewa <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0B241E] focus:outline-none focus:border-[#0B241E] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Pricing Calculation Summary Box */}
          {currentAsset && (
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#64748B]">
                <span>Tipe & Luas Area:</span>
                <span className="font-semibold text-[#0B241E]">
                  {currentAsset.assetType} • {area} m²
                </span>
              </div>
              <div className="flex items-center justify-between text-[#64748B]">
                <span>Tarif Resmi (Perda 4/2023):</span>
                <span className="font-semibold text-[#0B241E]">
                  Rp {rate.toLocaleString("id-ID")} / m² / tahun
                </span>
              </div>
              <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-bold">
                <span className="text-[#0B241E]">Estimasi Biaya Sewa Tahunan:</span>
                <span className="text-[#D97706] font-extrabold text-sm font-mono">
                  Rp {annualTotal.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={closeApplyModal}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#64748B] hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting || availableAssets.length === 0}
              className="px-5 py-2.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] active:bg-[#071914] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <span>Kirim Permohonan Sewa</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
