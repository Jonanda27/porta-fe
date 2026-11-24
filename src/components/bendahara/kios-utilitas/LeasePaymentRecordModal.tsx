"use client";

import React from "react";
import { Coins, X, CheckCircle2 } from "lucide-react";
import { AssetLease } from "@/types/asset.types";

export interface LeasePaymentFormState {
  periodYear: number;
  amountIdr: number;
  paidAt: string;
  referenceNo: string;
}

interface LeasePaymentRecordModalProps {
  selectedLease: AssetLease | null;
  paymentForm: LeasePaymentFormState;
  onChangePaymentForm: (form: LeasePaymentFormState) => void;
  actionSuccessMsg: string | null;
  actionErrorMsg: string | null;
  isSubmitting: boolean;
  onSave: () => void;
  onClose: () => void;
}

export function LeasePaymentRecordModal({
  selectedLease,
  paymentForm,
  onChangePaymentForm,
  actionSuccessMsg,
  actionErrorMsg,
  isSubmitting,
  onSave,
  onClose,
}: LeasePaymentRecordModalProps) {
  if (!selectedLease) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0B241E] text-white flex items-center justify-center">
              <Coins className="w-4 h-4 text-[#D97706]" />
            </div>
            <div>
              <h3 className="font-bold text-[#0B241E] text-base">
                Catat Pembayaran Sewa Kasda
              </h3>
              <p className="text-xs text-gray-400">
                Pencatatan penerimaan kasda pemanfaatan aset daerah
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

        <div className="py-4 space-y-4 text-xs">
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

          <div className="p-3 bg-gray-50 rounded-xl space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-500">Nomor PKS:</span>
              <span className="font-bold text-[#0B241E]">
                {selectedLease.contractNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Nama Tenant:</span>
              <span className="font-semibold text-gray-800">
                {selectedLease.tenantName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Objek Fasilitas:</span>
              <span className="text-gray-700">
                {selectedLease.asset?.name} ({Number(selectedLease.asset?.areaSqm || 0)} m²)
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-gray-200">
              <span className="text-gray-500 font-semibold">Total Nilai Sewa:</span>
              <span className="font-mono font-bold text-gray-900">
                Rp {Number(selectedLease.totalAnnualAmountIdr || 0).toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-gray-600 font-semibold mb-1">
                Tahun Periode Sewa
              </label>
              <input
                type="number"
                min={2024}
                max={2030}
                value={paymentForm.periodYear}
                onChange={(e) =>
                  onChangePaymentForm({
                    ...paymentForm,
                    periodYear: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">
                Nominal Disetor ke Kasda (Rp)
              </label>
              <input
                type="number"
                min={1}
                value={paymentForm.amountIdr}
                onChange={(e) =>
                  onChangePaymentForm({
                    ...paymentForm,
                    amountIdr: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono font-bold text-[#0B241E] focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">
                Tanggal Setor / Penerimaan Kasda
              </label>
              <input
                type="date"
                value={paymentForm.paidAt}
                onChange={(e) =>
                  onChangePaymentForm({ ...paymentForm, paidAt: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">
                No. Bukti Transaksi Kasda / Bank RKUD
              </label>
              <input
                type="text"
                value={paymentForm.referenceNo}
                onChange={(e) =>
                  onChangePaymentForm({ ...paymentForm, referenceNo: e.target.value })
                }
                placeholder="Contoh: BKU-TENANT-004 / TRF-BP-9921"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:border-[#0B241E]"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSubmitting}
            className="px-5 py-2 bg-[#0B241E] hover:bg-[#133D31] text-white font-semibold rounded-xl text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#D97706]" />
            {isSubmitting ? "Menyimpan..." : "Simpan & Bukukan Kasda"}
          </button>
        </div>
      </div>
    </div>
  );
}
