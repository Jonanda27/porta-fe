"use client";

import React from "react";
import { ModalPortal } from "@/components/ui/ModalPortal";

interface IssueWarningModalProps {
  warningInvoiceId: number | null;
  warningLevel: "TEGURAN_1" | "TEGURAN_2" | "TEGURAN_3";
  onChangeWarningLevel: (level: "TEGURAN_1" | "TEGURAN_2" | "TEGURAN_3") => void;
  warningMessage: string;
  onChangeWarningMessage: (msg: string) => void;
  isSubmitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function IssueWarningModal({
  warningInvoiceId,
  warningLevel,
  onChangeWarningLevel,
  warningMessage,
  onChangeWarningMessage,
  isSubmitting,
  onConfirm,
  onClose,
}: IssueWarningModalProps) {
  if (warningInvoiceId === null) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-extrabold text-[#0B241E]">
          Terbitkan Surat Teguran Retribusi (SKRD #{warningInvoiceId})
        </h3>
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-[#334155] mb-1">
              Tingkat Teguran
            </label>
            <select
              value={warningLevel}
              onChange={(e) =>
                onChangeWarningLevel(
                  e.target.value as "TEGURAN_1" | "TEGURAN_2" | "TEGURAN_3"
                )
              }
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1]"
            >
              <option value="TEGURAN_1">Teguran I (7 Hari Setelah Jatuh Tempo)</option>
              <option value="TEGURAN_2">Teguran II (14 Hari Setelah Teguran I)</option>
              <option value="TEGURAN_3">
                Teguran III / Peringatan Penahanan Layanan
              </option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-[#334155] mb-1">
              Pesan / Catatan Resmi
            </label>
            <textarea
              rows={3}
              value={warningMessage}
              onChange={(e) => onChangeWarningMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1]"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-[#0B241E] text-white text-xs font-bold cursor-pointer"
          >
            {isSubmitting ? "Memproses..." : "Kirim Teguran"}
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
