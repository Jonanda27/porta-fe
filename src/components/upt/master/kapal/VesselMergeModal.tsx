"use client";

import React from "react";
import { GitMerge, Loader2, X } from "lucide-react";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { VesselItem } from "@/types/upt.types";

export interface VesselMergeModalProps {
  mergeSource: VesselItem | null;
  mergeTargetId: string;
  onMergeTargetIdChange: (value: string) => void;
  vessels: VesselItem[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function VesselMergeModal({
  mergeSource,
  mergeTargetId,
  onMergeTargetIdChange,
  vessels,
  isSubmitting,
  onClose,
  onSubmit,
}: VesselMergeModalProps) {
  if (!mergeSource) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
        <form
          onSubmit={onSubmit}
          className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-[#E2E8F0]"
        >
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <GitMerge className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#0B241E]">
                  Gabungkan Kapal Duplikat (Merge)
                </h3>
                <p className="text-xs text-[#64748B]">
                  Sumber duplikat: <strong>{mergeSource.name}</strong> ({mergeSource.registrationNumber})
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
            Seluruh riwayat kunjungan, dokumen, sertifikat, dan klaim operator dari{" "}
            <strong>{mergeSource.name}</strong> akan dipindahkan secara atomik ke kapal target, lalu entri duplikat ini akan dinonaktifkan.
          </div>

          <div>
            <label className="block text-xs font-bold text-[#334155] mb-1.5">
              Pilih Master Kapal Target (Utama)
            </label>
            <select
              required
              value={mergeTargetId}
              onChange={(e) => onMergeTargetIdChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
            >
              <option value="">-- Pilih Kapal Target --</option>
              {vessels
                .filter((v) => v.id !== mergeSource.id && v.isActive)
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} — {v.registrationNumber} ({Number(v.grossTonnage)} GT)
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !mergeTargetId}
              className="px-5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Gabungkan Sekarang
            </button>
          </div>
        </form>
      </div>
    </ModalPortal>
  );
}
