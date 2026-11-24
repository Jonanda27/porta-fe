"use client";

import React from "react";
import { Coins, X, CheckCircle2, Ticket } from "lucide-react";
import {
  CreateGateTicketBookPayload,
  GateHandoverItem,
} from "@/types/field-ops.types";

export interface HandoverCloseFormState {
  lastReturnedSerial: number;
  actualCashSettledIdr: number;
  notes: string;
}

interface HandoverCloseModalProps {
  handover: GateHandoverItem | null;
  closeForm: HandoverCloseFormState;
  onChangeCloseForm: (form: HandoverCloseFormState) => void;
  modalCalculations: {
    soldQty: number;
    expectedAmount: number;
    diff: number;
  };
  actionSuccessMsg: string | null;
  actionErrorMsg: string | null;
  isSubmitting: boolean;
  onSave: () => void;
  onClose: () => void;
}

export function HandoverCloseModal({
  handover,
  closeForm,
  onChangeCloseForm,
  modalCalculations,
  actionSuccessMsg,
  actionErrorMsg,
  isSubmitting,
  onSave,
  onClose,
}: HandoverCloseModalProps) {
  if (!handover) return null;

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
                Validasi Setoran Kasir Loket Gerbang
              </h3>
              <p className="text-xs text-gray-400">
                Penerimaan fisik uang kas dan pengesahan buku kasda
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

          <div className="p-3.5 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
            <div className="flex justify-between">
              <span className="text-gray-500">Petugas Juru Gerbang:</span>
              <span className="font-bold text-[#0B241E]">{handover.wardenName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Buku Karcis:</span>
              <span className="font-mono font-semibold text-gray-800">
                {handover.book?.bookCode} (
                {handover.book?.ticketCategory.replace(/_/g, " ")})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Seri Karcis Diberikan:</span>
              <span className="font-mono text-gray-700">
                No. {handover.dispatchedSerialStart} s.d. No.{" "}
                {handover.dispatchedSerialEnd}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-500">Tarif per Lembar:</span>
              <span className="font-mono font-bold text-gray-900">
                Rp {Number(handover.book?.nominalPerTicket || 0).toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-gray-600 font-semibold mb-1">
                Nomor Seri Terkecil yang Dikembalikan (Sisa Tiket):
              </label>
              <input
                type="number"
                min={handover.dispatchedSerialStart}
                max={handover.dispatchedSerialEnd + 1}
                value={closeForm.lastReturnedSerial}
                onChange={(e) =>
                  onChangeCloseForm({
                    ...closeForm,
                    lastReturnedSerial: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono font-bold text-[#0B241E] focus:outline-none focus:border-[#0B241E]"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                *Masukkan {handover.dispatchedSerialEnd + 1} jika buku karcis habis terjual
                seluruhnya.
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5 font-mono text-blue-900">
              <div className="flex justify-between">
                <span>Estimasi Karcis Terjual:</span>
                <span className="font-bold">{modalCalculations.soldQty} Lembar</span>
              </div>
              <div className="flex justify-between">
                <span>Target Setoran Kasda:</span>
                <span className="font-black text-sm">
                  Rp {modalCalculations.expectedAmount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-gray-600 font-semibold">
                  Uang Fisik Kasda Diterima (Rp):
                </label>
                <button
                  type="button"
                  onClick={() =>
                    onChangeCloseForm({
                      ...closeForm,
                      actualCashSettledIdr: modalCalculations.expectedAmount,
                    })
                  }
                  className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Samakan Target (Nihil Selisih)
                </button>
              </div>
              <input
                type="number"
                min={0}
                value={closeForm.actualCashSettledIdr}
                onChange={(e) =>
                  onChangeCloseForm({
                    ...closeForm,
                    actualCashSettledIdr: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono font-black text-emerald-800 text-sm focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-100 font-mono text-xs">
              <span>Status Selisih (Discrepancy):</span>
              {modalCalculations.diff === 0 ? (
                <span className="font-bold text-emerald-700">Nihil (Rp 0) — Sah</span>
              ) : (
                <span className="font-bold text-rose-600">
                  Selisih: Rp {modalCalculations.diff.toLocaleString("id-ID")}
                </span>
              )}
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">
                Catatan Rekonsiliasi Bendahara:
              </label>
              <input
                type="text"
                value={closeForm.notes}
                onChange={(e) =>
                  onChangeCloseForm({ ...closeForm, notes: e.target.value })
                }
                placeholder="Contoh: Shift 1 selesai, uang fisik sesuai lembar karcis"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0B241E]"
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
            disabled={isSubmitting || modalCalculations.diff !== 0}
            className="px-5 py-2 bg-[#0B241E] hover:bg-[#143E33] text-white font-semibold rounded-xl text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#D97706]" />
            {isSubmitting ? "Memproses..." : "Sahkan & Tutup Handover"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface CreateTicketBookModalProps {
  isOpen: boolean;
  isSaving: boolean;
  formError: string | null;
  newBookForm: CreateGateTicketBookPayload;
  onChangeBookForm: (form: CreateGateTicketBookPayload) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function CreateTicketBookModal({
  isOpen,
  isSaving,
  formError,
  newBookForm,
  onChangeBookForm,
  onSubmit,
  onClose,
}: CreateTicketBookModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-2xl max-w-lg w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#D97706]" />
            <h3 className="text-base font-extrabold text-[#0B241E]">
              Terbitkan Buku Bendel Karcis Baru
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {formError}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#334155] mb-1">
                Kode Buku Karcis
              </label>
              <input
                type="text"
                required
                value={newBookForm.bookCode}
                onChange={(e) =>
                  onChangeBookForm({ ...newBookForm, bookCode: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-[#334155] mb-1">
                Kategori Pas Masuk
              </label>
              <select
                value={newBookForm.ticketCategory}
                onChange={(e) =>
                  onChangeBookForm({ ...newBookForm, ticketCategory: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1]"
              >
                <option value="PAS_ORANG_DEWASA">Pas Orang Dewasa</option>
                <option value="PAS_KENDARAAN_RODA_2">Pas Kendaraan Roda 2</option>
                <option value="PAS_KENDARAAN_RODA_4">Pas Kendaraan Roda 4</option>
                <option value="MB_TRUCK_BUS_BESAR">Truk / Bus Besar</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[#334155] mb-1">Seri Awal</label>
              <input
                type="number"
                min={1}
                required
                value={newBookForm.serialStart}
                onChange={(e) =>
                  onChangeBookForm({
                    ...newBookForm,
                    serialStart: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-[#334155] mb-1">Seri Akhir</label>
              <input
                type="number"
                min={1}
                required
                value={newBookForm.serialEnd}
                onChange={(e) =>
                  onChangeBookForm({
                    ...newBookForm,
                    serialEnd: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-[#334155] mb-1">
                Tarif / Lembar (Rp)
              </label>
              <input
                type="number"
                min={0}
                required
                value={newBookForm.nominalPerTicket}
                onChange={(e) =>
                  onChangeBookForm({
                    ...newBookForm,
                    nominalPerTicket: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#334155] mb-1">
                No. Porporasi Bapenda (Opsional)
              </label>
              <input
                type="text"
                placeholder="PRP-BAPENDA-2026-..."
                value={newBookForm.porporasiNumber || ""}
                onChange={(e) =>
                  onChangeBookForm({ ...newBookForm, porporasiNumber: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-[#334155] mb-1">Dasar Hukum</label>
              <input
                type="text"
                value={newBookForm.legalBasis || ""}
                onChange={(e) =>
                  onChangeBookForm({ ...newBookForm, legalBasis: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-[#0B241E] hover:bg-[#143E33] text-white font-bold rounded-xl text-xs cursor-pointer disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "Terbitkan Buku Karcis"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
