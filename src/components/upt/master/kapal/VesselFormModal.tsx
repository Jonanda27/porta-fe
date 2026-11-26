"use client";

import React from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { ShipOperatorItem, VesselItem } from "@/types/upt.types";
import { VesselConflictErrorDetails } from "@/types/kapal.types";

export interface VesselFormState {
  operatorId: string;
  registrationNumber: string;
  imoNumber: string;
  name: string;
  flag: string;
  grossTonnage: string;
  shipType: "NIAGA" | "NON_NIAGA";
  vesselCategory: "BARANG" | "PENUMPANG" | "CAMPURAN";
  shippingCategory: "DALAM_NEGERI" | "LUAR_NEGERI" | "PELRA_PERINTIS";
  lengthMeters: string;
  draftMeters: string;
}

export interface VesselFormModalProps {
  isOpen: boolean;
  editingVessel: VesselItem | null;
  vesselForm: VesselFormState;
  setVesselForm: React.Dispatch<React.SetStateAction<VesselFormState>>;
  operators: ShipOperatorItem[];
  conflictWarning: VesselConflictErrorDetails | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onConfirmNotDuplicate: () => void;
}

export function VesselFormModal({
  isOpen,
  editingVessel,
  vesselForm,
  setVesselForm,
  operators,
  conflictWarning,
  isSubmitting,
  onClose,
  onSubmit,
  onConfirmNotDuplicate,
}: VesselFormModalProps) {
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
                {editingVessel
                  ? `Ubah Master Kapal: ${editingVessel.name}`
                  : "Tambah Master Kapal Global Baru"}
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Master kapal bersifat independen — tidak wajib terikat ke 1 perusahaan. Perusahaan dapat mengklaim kapal ini kapan saja.
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

          {conflictWarning && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-2.5">
              <div className="flex items-start gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>{conflictWarning.message}</span>
              </div>
              {conflictWarning.existingVessel && (
                <div className="p-2.5 rounded-xl bg-white border border-amber-200 font-mono text-[11px]">
                  Terdaftar: <strong>{conflictWarning.existingVessel.name}</strong> (Reg:{" "}
                  {conflictWarning.existingVessel.registrationNumber})
                </div>
              )}
              {conflictWarning.similarVessels && conflictWarning.similarVessels.length > 0 && (
                <div className="space-y-1.5">
                  <p className="font-semibold text-[11px]">Kapal dengan nama mirip di katalog:</p>
                  {conflictWarning.similarVessels.map((sv) => (
                    <div
                      key={sv.id}
                      className="p-2 rounded-lg bg-white border border-amber-200 flex items-center justify-between text-[11px]"
                    >
                      <span>
                        <strong>{sv.name}</strong> ({sv.registrationNumber})
                      </span>
                      {sv.similarity && (
                        <span className="font-mono text-amber-700 font-bold">
                          Kemiripan {Math.round(sv.similarity * 100)}%
                        </span>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={onConfirmNotDuplicate}
                    className="mt-2 px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs cursor-pointer"
                  >
                    Tetap Simpan (Konfirmasi Kapal Berbeda)
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Nama Kapal <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={vesselForm.name}
                onChange={(e) =>
                  setVesselForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Contoh: KM Poumako Jaya"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Nomor Registrasi Kapal <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={vesselForm.registrationNumber}
                onChange={(e) =>
                  setVesselForm((prev) => ({
                    ...prev,
                    registrationNumber: e.target.value,
                  }))
                }
                placeholder="Contoh: REG-PMK-021"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Nomor IMO (Opsional)
              </label>
              <input
                type="text"
                value={vesselForm.imoNumber}
                onChange={(e) =>
                  setVesselForm((prev) => ({ ...prev, imoNumber: e.target.value }))
                }
                placeholder="IMO9123456"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Bendera Kebangsaan
              </label>
              <input
                type="text"
                value={vesselForm.flag}
                onChange={(e) =>
                  setVesselForm((prev) => ({ ...prev, flag: e.target.value }))
                }
                placeholder="Indonesia"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Kategori Kapal
              </label>
              <select
                value={vesselForm.vesselCategory}
                onChange={(e) =>
                  setVesselForm((prev) => ({
                    ...prev,
                    vesselCategory: e.target.value as
                      | "BARANG"
                      | "PENUMPANG"
                      | "CAMPURAN",
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
              >
                <option value="PENUMPANG">Kapal Penumpang</option>
                <option value="BARANG">Kapal Barang</option>
                <option value="CAMPURAN">Kapal Campuran</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Trayek Pelayaran
              </label>
              <select
                value={vesselForm.shippingCategory}
                onChange={(e) =>
                  setVesselForm((prev) => ({
                    ...prev,
                    shippingCategory: e.target.value as
                      | "DALAM_NEGERI"
                      | "LUAR_NEGERI"
                      | "PELRA_PERINTIS",
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
              >
                <option value="DALAM_NEGERI">Dalam Negeri</option>
                <option value="LUAR_NEGERI">Luar Negeri</option>
                <option value="PELRA_PERINTIS">Pelayaran Rakyat / Perintis</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Jenis Kapal
              </label>
              <select
                value={vesselForm.shipType}
                onChange={(e) =>
                  setVesselForm((prev) => ({
                    ...prev,
                    shipType: e.target.value as "NIAGA" | "NON_NIAGA",
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
              >
                <option value="NIAGA">Kapal Niaga</option>
                <option value="NON_NIAGA">Kapal Non-Niaga</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Tonase Kotor (GT) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={vesselForm.grossTonnage}
                onChange={(e) =>
                  setVesselForm((prev) => ({ ...prev, grossTonnage: e.target.value }))
                }
                placeholder="500"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Panjang Kapal / LOA (Meter)
              </label>
              <input
                type="number"
                step="0.1"
                min={1}
                value={vesselForm.lengthMeters}
                onChange={(e) =>
                  setVesselForm((prev) => ({ ...prev, lengthMeters: e.target.value }))
                }
                placeholder="65"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Sarat Kapal / Draft (Meter)
              </label>
              <input
                type="number"
                step="0.1"
                min={0.5}
                value={vesselForm.draftMeters}
                onChange={(e) =>
                  setVesselForm((prev) => ({ ...prev, draftMeters: e.target.value }))
                }
                placeholder="4.5"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Operator Awal (Opsional — Biarkan Kosong untuk Master Global Independen)
              </label>
              <select
                value={vesselForm.operatorId}
                onChange={(e) =>
                  setVesselForm((prev) => ({ ...prev, operatorId: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-medium bg-[#F8FAFC]"
              >
                <option value="">-- Tanpa Ikatan Operator (Master Kapal Global Independen) --</option>
                {operators.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.name}
                  </option>
                ))}
              </select>
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
              Simpan Master Kapal
            </button>
          </div>
        </form>
      </div>
    </ModalPortal>
  );
}
