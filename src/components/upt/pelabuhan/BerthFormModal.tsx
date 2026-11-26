"use client";

import React from "react";
import { Loader2, X } from "lucide-react";
import { ModalPortal } from "@/components/ui/ModalPortal";
import {
  AuthorityType,
  BerthItem,
  BerthOperationalStatus,
  BerthServiceCategory,
  BerthType,
  BillingEligibility,
} from "@/types/port.types";

export interface BerthFormState {
  portId: number;
  code: string;
  name: string;
  berthType: BerthType;
  berthServiceCategory: BerthServiceCategory;
  operationalStatus: BerthOperationalStatus;
  authorityType: AuthorityType;
  billingEligibility: BillingEligibility;
  legalBasis: string;
  maxLengthMeters: string;
  maxDraftMeters: string;
}

export interface BerthFormModalProps {
  isOpen: boolean;
  editingBerth: BerthItem | null;
  form: BerthFormState;
  isSubmitting: boolean;
  onFormChange: React.Dispatch<React.SetStateAction<BerthFormState>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function BerthFormModal({
  isOpen,
  editingBerth,
  form,
  isSubmitting,
  onFormChange,
  onClose,
  onSubmit,
}: BerthFormModalProps) {
  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
        <form
          onSubmit={onSubmit}
          className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {editingBerth ? `Ubah Dermaga: ${editingBerth.name}` : "Tambah Dermaga Baru"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Atur spesifikasi teknis, kewenangan retribusi, dan status operasional dermaga.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode Dermaga
              </label>
              <input
                type="text"
                required
                disabled={Boolean(editingBerth)}
                maxLength={30}
                value={form.code}
                onChange={(e) =>
                  onFormChange((prev) => ({ ...prev, code: e.target.value }))
                }
                placeholder="DRM-PEMDA-02"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-mono disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Dermaga
              </label>
              <input
                type="text"
                required
                maxLength={150}
                value={form.name}
                onChange={(e) =>
                  onFormChange((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Contoh: Dermaga Beton Nusantara Pemda"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Layanan Dermaga
              </label>
              <select
                value={form.berthServiceCategory}
                onChange={(e) =>
                  onFormChange((prev) => ({
                    ...prev,
                    berthServiceCategory: e.target.value as BerthServiceCategory,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              >
                <option value="DERMAGA_BARANG">Dermaga Barang / Kargo</option>
                <option value="DERMAGA_PENUMPANG">Dermaga Penumpang &amp; Ro-Ro</option>
                <option value="DERMAGA_CAMPURAN">Dermaga Serbaguna (Campuran)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Operasional
              </label>
              <select
                value={form.operationalStatus}
                onChange={(e) =>
                  onFormChange((prev) => ({
                    ...prev,
                    operationalStatus: e.target.value as BerthOperationalStatus,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              >
                <option value="OPEN">Aktif</option>
                <option value="MAINTENANCE">Perbaikan</option>
                <option value="CLOSED">Tutup</option>
              </select>
            </div>

            {!editingBerth && (
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Tipe Konstruksi
                  </label>
                  <select
                    value={form.berthType}
                    onChange={(e) =>
                      onFormChange((prev) => ({
                        ...prev,
                        berthType: e.target.value as BerthType,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                  >
                    <option value="DERMAGA_BESI_BETON_KAYU">
                      Konstruksi Besi / Beton / Kayu
                    </option>
                    <option value="BRESSING_DOLPHIN_PELAMPUNG">
                      Bressing / Dolphin / Pelampung
                    </option>
                    <option value="PINGGIRAN_TALUD">Pinggiran / Talud Pantai</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Otoritas Pengelola
                  </label>
                  <select
                    value={form.authorityType}
                    onChange={(e) =>
                      onFormChange((prev) => ({
                        ...prev,
                        authorityType: e.target.value as AuthorityType,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                  >
                    <option value="PEMDA_DISHUB">Pemda / Dishub Kabupaten</option>
                    <option value="UPP_KEMENHUB">UPP Kementerian Perhubungan</option>
                    <option value="TUKS_TERSUS">TUKS / Terminal Khusus Swasta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Status Retribusi Pemda
                  </label>
                  <select
                    value={form.billingEligibility}
                    onChange={(e) =>
                      onFormChange((prev) => ({
                        ...prev,
                        billingEligibility: e.target.value as BillingEligibility,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                  >
                    <option value="BILLABLE">Objek Retribusi Pemda</option>
                    <option value="PENDING_VERIFICATION">
                      Menunggu Verifikasi Dasar Hukum
                    </option>
                    <option value="NOT_BILLABLE">Non-Retribusi Pemda</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Panjang Maksimal (Meter)
              </label>
              <input
                type="number"
                step="0.1"
                value={form.maxLengthMeters}
                onChange={(e) =>
                  onFormChange((prev) => ({
                    ...prev,
                    maxLengthMeters: e.target.value,
                  }))
                }
                placeholder="Contoh: 120"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kedalaman Maksimal / Draft (Meter)
              </label>
              <input
                type="number"
                step="0.1"
                value={form.maxDraftMeters}
                onChange={(e) =>
                  onFormChange((prev) => ({
                    ...prev,
                    maxDraftMeters: e.target.value,
                  }))
                }
                placeholder="Contoh: 8.5"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Simpan
            </button>
          </div>
        </form>
      </div>
    </ModalPortal>
  );
}
