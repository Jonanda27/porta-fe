"use client";

import React from "react";
import { Loader2, X } from "lucide-react";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { PortCategory, PortItem } from "@/types/port.types";

export interface PortFormState {
  code: string;
  name: string;
  location: string;
  portCategory: PortCategory;
}

export interface PortFormModalProps {
  isOpen: boolean;
  editingPort: PortItem | null;
  form: PortFormState;
  isSubmitting: boolean;
  onFormChange: React.Dispatch<React.SetStateAction<PortFormState>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function PortFormModal({
  isOpen,
  editingPort,
  form,
  isSubmitting,
  onFormChange,
  onClose,
  onSubmit,
}: PortFormModalProps) {
  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
        <form
          onSubmit={onSubmit}
          className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 shadow-xl"
        >
          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {editingPort ? `Ubah Pelabuhan: ${editingPort.name}` : "Tambah Pelabuhan Baru"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Lengkapi kode, nama, lokasi, dan kategori layanan pelabuhan.
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
                Kode Pelabuhan
              </label>
              <input
                type="text"
                required
                disabled={Boolean(editingPort)}
                maxLength={20}
                value={form.code}
                onChange={(e) =>
                  onFormChange((prev) => ({ ...prev, code: e.target.value }))
                }
                placeholder="Contoh: PMK"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Pelabuhan
              </label>
              <select
                value={form.portCategory}
                onChange={(e) =>
                  onFormChange((prev) => ({
                    ...prev,
                    portCategory: e.target.value as PortCategory,
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
              >
                <option value="CAMPURAN">Campuran (Penumpang &amp; Barang)</option>
                <option value="BARANG">Khusus Barang / Kargo</option>
                <option value="PENUMPANG">Khusus Penumpang</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#334155] mb-1.5">
              Nama Resmi Pelabuhan
            </label>
            <input
              type="text"
              required
              maxLength={150}
              value={form.name}
              onChange={(e) =>
                onFormChange((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Contoh: Pelabuhan Poumako"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#334155] mb-1.5">
              Alamat / Lokasi Kawasan
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) =>
                onFormChange((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="Distrik Mimika Timur, Kabupaten Mimika, Papua Tengah"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F1F5F9]">
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
