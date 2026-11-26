"use client";

import React from "react";
import { X, Loader2 } from "lucide-react";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { ShipOperatorItem } from "@/types/upt.types";

export interface OperatorFormValues {
  name: string;
  npwp: string;
  phone: string;
  email: string;
  address: string;
  operatorProfile: "REGULAR_SCHEDULED" | "INCIDENTAL";
}

export interface OperatorFormModalProps {
  isOpen: boolean;
  editingOperator: ShipOperatorItem | null;
  form: OperatorFormValues;
  isSubmitting: boolean;
  onChange: React.Dispatch<React.SetStateAction<OperatorFormValues>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function OperatorFormModal({
  isOpen,
  editingOperator,
  form,
  isSubmitting,
  onChange,
  onSubmit,
  onClose,
}: OperatorFormModalProps) {
  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <form
          onSubmit={onSubmit}
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E2E8F0] p-6 sm:p-8 space-y-5"
        >
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#F1F5F9]">
            <div>
              <h3 className="text-base font-extrabold text-[#0B241E]">
                {editingOperator
                  ? `Ubah Operator: ${editingOperator.name}`
                  : "Tambah Master Operator Kapal"}
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Data induk perusahaan pelayaran atau agen kapal resmi yang beroperasi di pelabuhan.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Nama Perusahaan Pelayaran / Operator
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Contoh: PT Pelayaran Mimika Sejahtera"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Profil Operasional
              </label>
              <select
                value={form.operatorProfile}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    operatorProfile: e.target.value as
                      | "REGULAR_SCHEDULED"
                      | "INCIDENTAL",
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
              >
                <option value="REGULAR_SCHEDULED">Jadwal Reguler (Trayek Tetap)</option>
                <option value="INCIDENTAL">Insidental / Non-Reguler</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                NPWP Perusahaan
              </label>
              <input
                type="text"
                value={form.npwp}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, npwp: e.target.value }))
                }
                placeholder="01.234.567.8-954.000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Nomor Telepon
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="08123456789"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Email Resmi
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="ops@mimika-shipping.co.id"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Alamat Kantor
              </label>
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, address: e.target.value }))
                }
                placeholder="Alamat lengkap kantor operasional"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Simpan Operator
            </button>
          </div>
        </form>
      </div>
    </ModalPortal>
  );
}
