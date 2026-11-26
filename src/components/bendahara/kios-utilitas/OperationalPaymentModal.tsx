"use client";

import React from "react";
import { Coins, X, ShieldCheck, CheckCircle2 } from "lucide-react";
import { ModalPortal } from "@/components/ui/ModalPortal";

export interface OperationalPayModalState {
  isOpen: boolean;
  type: "UTILITY" | "CARGO" | "EQUIPMENT";
  id: number;
  title: string;
  identifierNumber: string;
  amountIdr: number;
  payerLabel: string;
}

interface OperationalPaymentModalProps {
  modal: OperationalPayModalState | null;
  actionSuccessMsg: string | null;
  actionErrorMsg: string | null;
  isSubmitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function OperationalPaymentModal({
  modal,
  actionSuccessMsg,
  actionErrorMsg,
  isSubmitting,
  onConfirm,
  onClose,
}: OperationalPaymentModalProps) {
  if (!modal) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0B241E] text-white flex items-center justify-center">
              <Coins className="w-4 h-4 text-[#D97706]" />
            </div>
            <div>
              <h3 className="font-bold text-[#0B241E] text-sm">
                Konfirmasi Setoran Kasda
              </h3>
              <p className="text-[11px] text-gray-400">
                Pengesahan penerimaan retribusi ke RKUD
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3 text-xs">
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

          <div className="p-3.5 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
            <div className="flex justify-between">
              <span className="text-gray-500">Jenis Layanan:</span>
              <span className="font-semibold text-gray-800">{modal.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Nomor Registrasi:</span>
              <span className="font-mono font-bold text-[#0B241E]">
                {modal.identifierNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Objek / Pemohon:</span>
              <span className="font-medium text-gray-700">{modal.payerLabel}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-700 font-bold">Total Retribusi:</span>
              <span className="font-mono font-black text-base text-[#0B241E]">
                Rp {modal.amountIdr.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-amber-700" />
            Tindakan ini akan mengesahkan pembayaran dan menerbitkan nomor transaksi
            idempotency resmi ke rekening kas daerah (RKUD).
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-5 py-2 bg-[#0B241E] hover:bg-[#133D31] text-white font-semibold rounded-xl text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#D97706]" />
            {isSubmitting ? "Memproses..." : "Sahkan Penerimaan Kasda"}
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
