"use client";

import React from "react";
import { AlertCircle, Anchor, Loader2, Upload, X } from "lucide-react";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { formatLabel } from "@/lib/format-labels";
import { BerthItem } from "@/types/port.types";
import { ShipVisitItem } from "@/types/upt.types";

export interface UptStartBerthingModalProps {
  berthingVisit: ShipVisitItem | null;
  activePortBerths: BerthItem[];
  berthId: string;
  onBerthIdChange: (id: string) => void;
  isBerthLocked: boolean;
  berthCategory: "UMUM" | "KHUSUS_TUKS";
  onBerthCategoryChange: (cat: "UMUM" | "KHUSUS_TUKS") => void;
  overrideReason: string;
  onOverrideReasonChange: (reason: string) => void;
  evidenceFile: File | null;
  onEvidenceFileChange: (file: File | null) => void;
  error: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function UptStartBerthingModal({
  berthingVisit,
  activePortBerths,
  berthId,
  onBerthIdChange,
  isBerthLocked,
  berthCategory,
  onBerthCategoryChange,
  overrideReason,
  onOverrideReasonChange,
  evidenceFile,
  onEvidenceFileChange,
  error,
  isSubmitting,
  onClose,
  onSubmit,
}: UptStartBerthingModalProps) {
  if (!berthingVisit) return null;

  const selectedBerthObj = activePortBerths.find(
    (b) => String(b.id) === berthId
  );
  const vesselCat = berthingVisit.vessel?.vesselCategory;
  const berthCat = selectedBerthObj?.berthServiceCategory;
  const isCategoryMismatch = Boolean(
    vesselCat &&
      berthCat &&
      berthCat !== "DERMAGA_CAMPURAN" &&
      !(vesselCat === "BARANG" && berthCat === "DERMAGA_BARANG") &&
      !(vesselCat === "PENUMPANG" && berthCat === "DERMAGA_PENUMPANG")
  );

  const allocBerth =
    berthingVisit.berthingRecords?.[0]?.berth ||
    berthingVisit.berthings?.[0]?.berth;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
        <form
          onSubmit={onSubmit}
          className="bg-white rounded-3xl border border-[#E2E8F0] w-full max-w-xl p-6 space-y-5 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center shrink-0">
                <Anchor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#0B241E]">
                  Mulai Sandar Kapal (ATB)
                </h3>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  {berthingVisit.vessel?.name ||
                    `Kapal #${berthingVisit.vesselId || ""}`}{" "}
                  <span className="font-mono text-[#94A3B8]">
                    ({berthingVisit.visitNumber || ""})
                  </span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
              aria-label="Tutup modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#334155]">
                Dermaga Sandar
              </label>
              {isBerthLocked && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Sesuai Alokasi UPT
                </span>
              )}
            </div>
            {isBerthLocked ? (
              <div className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#0B241E]">
                {selectedBerthObj
                  ? `${selectedBerthObj.code} - ${selectedBerthObj.name} (${formatLabel(
                      selectedBerthObj.berthServiceCategory
                    )})`
                  : allocBerth
                  ? `${allocBerth.code} - ${allocBerth.name}`
                  : `Dermaga #${berthId}`}
              </div>
            ) : (
              <select
                required
                value={berthId}
                onChange={(e) => onBerthIdChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
              >
                <option value="">-- Pilih Dermaga --</option>
                {activePortBerths.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} - {b.name} ({formatLabel(b.berthServiceCategory)})
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-[#334155] mb-1.5">
              Kategori Tambat
            </label>
            {isBerthLocked ? (
              <div className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#334155]">
                {berthCategory === "KHUSUS_TUKS"
                  ? "Tambat Khusus / TUKS"
                  : "Tambat Dermaga Umum"}
              </div>
            ) : (
              <select
                value={berthCategory}
                onChange={(e) =>
                  onBerthCategoryChange(
                    e.target.value as "UMUM" | "KHUSUS_TUKS"
                  )
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
              >
                <option value="UMUM">Tambat Dermaga Umum</option>
                <option value="KHUSUS_TUKS">Tambat Khusus / TUKS</option>
              </select>
            )}
          </div>
          {(isCategoryMismatch || !isBerthLocked) && (
            <div className="space-y-1.5">
              {isCategoryMismatch && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold">
                  Kategori kapal ({formatLabel(vesselCat || "")}) tidak sesuai
                  dengan peruntukan dermaga ({formatLabel(berthCat || "")}).
                  Wajib mengisi alasan override untuk pengajuan persetujuan.
                </div>
              )}
              <label className="block text-xs font-bold text-[#334155]">
                Alasan Override{" "}
                {isCategoryMismatch ? (
                  <span className="text-rose-500">*</span>
                ) : (
                  "(Opsional)"
                )}
              </label>
              <input
                type="text"
                required={isCategoryMismatch}
                value={overrideReason}
                onChange={(e) => onOverrideReasonChange(e.target.value)}
                placeholder={
                  isCategoryMismatch
                    ? "Contoh: Dermaga barang penuh, dialihkan sementara ke dermaga penumpang"
                    : "Opsional"
                }
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-[#334155] mb-1.5">
              Foto Bukti Sandar (Opsional)
            </label>
            {evidenceFile ? (
              <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0B241E] truncate">
                      {evidenceFile.name}
                    </p>
                    <p className="text-[10px] text-[#64748B]">
                      {(evidenceFile.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onEvidenceFileChange(null)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0"
                  title="Hapus foto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-xs font-semibold text-[#475569] cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-[#64748B]" />
                <span>Pilih Foto Bukti Sandar (JPG / PNG)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    onEvidenceFileChange(e.target.files?.[0] || null)
                  }
                  className="hidden"
                />
              </label>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] hover:bg-[#F8FAFC] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#0B241E] hover:bg-[#13382F] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              Simpan Sandar
            </button>
          </div>
        </form>
      </div>
    </ModalPortal>
  );
}
