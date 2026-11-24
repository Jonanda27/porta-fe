"use client";

import React from "react";
import { createPortal } from "react-dom";
import {
  Pencil,
  Ship,
  X,
  AlertTriangle,
  Image as ImageIcon,
  Trash2,
  Paperclip,
  ExternalLink,
  Plus,
  Loader2,
} from "lucide-react";
import { OperatorDocument, Vessel, VesselFormState } from "@/types/kapal.types";
import { formatDocCategory } from "@/lib/kapal-profil";

interface VesselFormModalProps {
  isOpen: boolean;
  editingVessel: Vessel | null;
  errorMessage: string | null;
  isSubmitting: boolean;
  vesselFormData: VesselFormState;
  onChangeVesselFormData: (data: VesselFormState) => void;
  vesselPhotoPreview: string | null;
  vesselPhotoFile: File | null;
  onSelectVesselPhoto: (file: File | null) => void;
  primaryDocCategory: "SURAT_UKUR" | "PAS_BESAR_KECIL" | "LAINNYA";
  onChangePrimaryDocCategory: (cat: "SURAT_UKUR" | "PAS_BESAR_KECIL" | "LAINNYA") => void;
  primaryDocNumber: string;
  onChangePrimaryDocNumber: (num: string) => void;
  onChangePrimaryDocFile: (file: File | null) => void;
  showSecondaryDocSlot: boolean;
  onToggleSecondaryDocSlot: (show: boolean) => void;
  secondaryDocCategory: "SURAT_UKUR" | "PAS_BESAR_KECIL" | "LAINNYA";
  onChangeSecondaryDocCategory: (cat: "SURAT_UKUR" | "PAS_BESAR_KECIL" | "LAINNYA") => void;
  secondaryDocNumber: string;
  onChangeSecondaryDocNumber: (num: string) => void;
  onChangeSecondaryDocFile: (file: File | null) => void;
  isVesselPhotoDoc: (doc: OperatorDocument) => boolean;
  getBackendFileUrl: (filePath?: string | null) => string | null;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function VesselFormModal({
  isOpen,
  editingVessel,
  errorMessage,
  isSubmitting,
  vesselFormData,
  onChangeVesselFormData,
  vesselPhotoPreview,
  vesselPhotoFile,
  onSelectVesselPhoto,
  primaryDocCategory,
  onChangePrimaryDocCategory,
  primaryDocNumber,
  onChangePrimaryDocNumber,
  onChangePrimaryDocFile,
  showSecondaryDocSlot,
  onToggleSecondaryDocSlot,
  secondaryDocCategory,
  onChangeSecondaryDocCategory,
  secondaryDocNumber,
  onChangeSecondaryDocNumber,
  onChangeSecondaryDocFile,
  isVesselPhotoDoc,
  getBackendFileUrl,
  onSubmit,
  onClose,
}: VesselFormModalProps) {
  if (!isOpen || typeof document === "undefined") return null;

  const existingPhotoDocs = (editingVessel?.documents || []).filter(isVesselPhotoDoc);
  const existingPhotoUrl = getBackendFileUrl(
    existingPhotoDocs.length > 0
      ? existingPhotoDocs[existingPhotoDocs.length - 1].filePath
      : null
  );

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden border border-[#CBD5E1] shadow-2xl">
        {/* Sticky Modal Header */}
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {editingVessel ? (
                <Pencil className="w-4 h-4" />
              ) : (
                <Ship className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base text-[#0B241E] truncate">
                {editingVessel
                  ? `Edit Data Armada Kapal: ${editingVessel.name}`
                  : "Registrasi Master Data Armada Kapal Baru"}
              </h3>
              <p className="text-[11px] text-[#64748B] truncate">
                {editingVessel
                  ? "Perbarui spesifikasi kapal, foto fisik kapal, atau dokumen kelayakan tambahan."
                  : "Lengkapi spesifikasi kapal, foto fisik kapal, dan dokumen kelayakan pendukung."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0B241E] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0 text-xs">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#0B241E] mb-1">
                Nama Kapal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: KM Mimika Bahari"
                value={vesselFormData.name}
                onChange={(e) =>
                  onChangeVesselFormData({ ...vesselFormData, name: e.target.value })
                }
                className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B241E] mb-1">
                Nomor Registrasi / Pas Tahunan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: REG-PMK-002"
                value={vesselFormData.registrationNumber}
                onChange={(e) =>
                  onChangeVesselFormData({
                    ...vesselFormData,
                    registrationNumber: e.target.value,
                  })
                }
                className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#0B241E] mb-1">
                Gross Tonnage (GT) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={vesselFormData.grossTonnage}
                onChange={(e) =>
                  onChangeVesselFormData({
                    ...vesselFormData,
                    grossTonnage: Number(e.target.value),
                  })
                }
                className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B241E] mb-1">
                Panjang LoA (Meter)
              </label>
              <input
                type="number"
                step="0.1"
                min={1}
                value={vesselFormData.lengthMeters}
                onChange={(e) =>
                  onChangeVesselFormData({
                    ...vesselFormData,
                    lengthMeters: Number(e.target.value),
                  })
                }
                className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B241E] mb-1">
                Sarat Draft (Meter)
              </label>
              <input
                type="number"
                step="0.1"
                min={0.5}
                value={vesselFormData.draftMeters}
                onChange={(e) =>
                  onChangeVesselFormData({
                    ...vesselFormData,
                    draftMeters: Number(e.target.value),
                  })
                }
                className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#0B241E] mb-1">
                Kategori Pelayaran Sesuai Tarif PP 35/2023
              </label>
              <select
                value={vesselFormData.shippingCategory}
                onChange={(e) =>
                  onChangeVesselFormData({
                    ...vesselFormData,
                    shippingCategory: e.target.value as
                      | "LUAR_NEGERI"
                      | "DALAM_NEGERI"
                      | "PELRA_PERINTIS",
                  })
                }
                className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E] focus:outline-hidden"
              >
                <option value="DALAM_NEGERI">
                  Pelayaran Dalam Negeri (Rp 100/GT/Etmal)
                </option>
                <option value="PELRA_PERINTIS">
                  Pelayaran Rakyat / Perintis (Rp 50/GT/Etmal)
                </option>
                <option value="LUAR_NEGERI">
                  Pelayaran Luar Negeri (USD Tariff Rate)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B241E] mb-1">
                Tipe Kapal &amp; Muatan
              </label>
              <select
                value={vesselFormData.vesselCategory}
                onChange={(e) =>
                  onChangeVesselFormData({
                    ...vesselFormData,
                    vesselCategory: e.target.value as
                      | "BARANG"
                      | "PENUMPANG"
                      | "CAMPURAN",
                  })
                }
                className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E] focus:outline-hidden"
              >
                <option value="BARANG">Kapal Kargo / Barang</option>
                <option value="PENUMPANG">Kapal Penumpang / Ferry</option>
                <option value="CAMPURAN">Campuran (Barang &amp; Penumpang)</option>
              </select>
            </div>
          </div>

          {/* BAGIAN A: LAMPIRAN GAMBAR / FOTO FISIK KAPAL */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-[#0B241E] flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#D97706]" />
                <span>
                  Foto Fisik Kapal{" "}
                  {!editingVessel && <span className="text-red-500">*</span>}
                </span>
              </label>
              <span className="text-[10px] font-mono text-[#64748B]">
                JPG / PNG / WEBP • Maks. 5 MB
              </span>
            </div>

            {vesselPhotoPreview && vesselPhotoFile ? (
              <div className="relative rounded-xl overflow-hidden border border-[#CBD5E1] bg-white">
                <img
                  src={vesselPhotoPreview}
                  alt="Pratinjau foto kapal baru"
                  className="w-full h-44 object-cover"
                />
                <div className="p-2.5 bg-white flex items-center justify-between gap-2 border-t border-[#E2E8F0]">
                  <div className="min-w-0">
                    <p className="font-bold text-[#0B241E] truncate text-[11px]">
                      {vesselPhotoFile.name}
                    </p>
                    <p className="text-[10px] text-[#64748B] font-mono">
                      {(vesselPhotoFile.size / 1024).toFixed(0)} KB (Baru)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectVesselPhoto(null)}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ) : existingPhotoUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-[#CBD5E1] bg-white">
                <img
                  src={existingPhotoUrl}
                  alt={`Foto ${editingVessel?.name}`}
                  className="w-full h-44 object-cover"
                />
                <div className="p-2.5 bg-white flex items-center justify-between gap-2 border-t border-[#E2E8F0]">
                  <span className="text-[11px] font-semibold text-emerald-700">
                    ✓ Foto kapal saat ini sudah terunggah
                  </span>
                  <label className="px-3 py-1.5 rounded-lg bg-[#0B241E] hover:bg-[#143E33] text-white text-[11px] font-bold cursor-pointer flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-[#D97706]" />
                    <span>Ganti Foto</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => onSelectVesselPhoto(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="flex items-center gap-3.5 p-3.5 border-2 border-dashed border-[#CBD5E1] hover:border-[#0B241E] rounded-xl bg-white cursor-pointer transition-colors">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#0B241E]">
                    Klik untuk pilih gambar tampak samping / badan kapal
                  </p>
                  <p className="text-[10.5px] text-[#64748B] mt-0.5">
                    Foto digunakan petugas UPT untuk identifikasi visual kapal saat sandar
                  </p>
                </div>
                <span className="hidden sm:inline-flex px-3 py-1.5 rounded-lg bg-slate-100 text-[#0B241E] font-bold text-[11px] shrink-0">
                  Pilih Foto
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => onSelectVesselPhoto(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* BAGIAN B: LAMPIRAN DOKUMEN PENDUKUNG KAPAL */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#0B241E] flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-[#D97706]" />
                <span>
                  Dokumen Pendukung Kelaiklautan Kapal{" "}
                  {!editingVessel && <span className="text-red-500">*</span>}
                </span>
              </span>
              <span className="text-[10px] font-mono text-[#64748B]">
                PDF / JPG / PNG • Maks. 10 MB
              </span>
            </div>

            {editingVessel &&
              (editingVessel.documents || []).filter((d) => !isVesselPhotoDoc(d)).length >
                0 && (
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                  <span className="text-[10.5px] font-bold text-emerald-900 block">
                    Dokumen Tersimpan Saat Ini:
                  </span>
                  {(editingVessel.documents || [])
                    .filter((d) => !isVesselPhotoDoc(d))
                    .map((doc) => {
                      const docUrl = getBackendFileUrl(doc.filePath);
                      return (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between gap-2 text-[11px] bg-white px-2.5 py-1.5 rounded-lg border border-emerald-200/80"
                        >
                          <span className="font-medium text-[#0B241E] truncate">
                            <strong className="text-[#334155]">
                              {formatDocCategory(doc.category)}:
                            </strong>{" "}
                            {doc.fileName}
                          </span>
                          {docUrl && (
                            <a
                              href={docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#0284C7] hover:underline font-bold flex items-center gap-1 shrink-0"
                            >
                              <span>Lihat</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}

            {/* Dokumen 1 */}
            <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#0B241E]">
                  {editingVessel
                    ? "1. Tambah / Perbarui Dokumen Pendukung"
                    : "1. Dokumen Legalitas Utama"}{" "}
                  {!editingVessel && <span className="text-red-500">*</span>}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    editingVessel
                      ? "bg-slate-100 text-slate-600"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {editingVessel ? "Opsional" : "Wajib"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <select
                  value={primaryDocCategory}
                  onChange={(e) =>
                    onChangePrimaryDocCategory(
                      e.target.value as "SURAT_UKUR" | "PAS_BESAR_KECIL" | "LAINNYA"
                    )
                  }
                  className="w-full p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-semibold"
                >
                  <option value="SURAT_UKUR">
                    Surat Ukur Kapal (Internasional/Nasional)
                  </option>
                  <option value="PAS_BESAR_KECIL">Pas Besar / Pas Kecil Tahunan</option>
                  <option value="LAINNYA">Sertifikat Keselamatan &amp; Konstruksi</option>
                </select>

                <input
                  type="text"
                  value={primaryDocNumber}
                  onChange={(e) => onChangePrimaryDocNumber(e.target.value)}
                  placeholder="No. Dokumen (Contoh: SU-9912/DJPL/2026)"
                  className="w-full p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-mono"
                />
              </div>

              <input
                type="file"
                required={!editingVessel}
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => onChangePrimaryDocFile(e.target.files?.[0] || null)}
                className="w-full text-[11px] text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-1.5 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-[#0B241E] file:text-white file:text-[11px] file:font-bold hover:file:bg-[#143E33] cursor-pointer"
              />
            </div>

            {/* Dokumen 2 */}
            {showSecondaryDocSlot ? (
              <div className="p-3 rounded-xl bg-white border border-dashed border-[#CBD5E1] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#334155]">
                    2. Dokumen Pendukung Tambahan (Pas Besar / Sertifikat Lain)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onToggleSecondaryDocSlot(false);
                      onChangeSecondaryDocNumber("");
                      onChangeSecondaryDocFile(null);
                    }}
                    className="text-[10.5px] font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <select
                    value={secondaryDocCategory}
                    onChange={(e) =>
                      onChangeSecondaryDocCategory(
                        e.target.value as "SURAT_UKUR" | "PAS_BESAR_KECIL" | "LAINNYA"
                      )
                    }
                    className="w-full p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-semibold"
                  >
                    <option value="PAS_BESAR_KECIL">Pas Besar / Pas Kecil Tahunan</option>
                    <option value="SURAT_UKUR">Surat Ukur Kapal</option>
                    <option value="LAINNYA">Sertifikat Keselamatan / Izin Trayek</option>
                  </select>

                  <input
                    type="text"
                    value={secondaryDocNumber}
                    onChange={(e) => onChangeSecondaryDocNumber(e.target.value)}
                    placeholder="No. Dokumen Tambahan (Opsional)"
                    className="w-full p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-mono"
                  />
                </div>

                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => onChangeSecondaryDocFile(e.target.files?.[0] || null)}
                  className="w-full text-[11px] text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-1.5 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-slate-700 file:text-white file:text-[11px] file:font-bold hover:file:bg-slate-800 cursor-pointer"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onToggleSecondaryDocSlot(true)}
                className="w-full py-2 px-3 rounded-xl border border-dashed border-[#CBD5E1] hover:border-[#0B241E] bg-white text-[11px] font-bold text-[#64748B] hover:text-[#0B241E] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Tambah Slot Dokumen Pendukung Tambahan (Opsional)</span>
              </button>
            )}
          </div>
          </div>

          {/* Sticky Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0B241E] rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-extrabold rounded-xl shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-2 transition-colors"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {isSubmitting
                  ? editingVessel
                    ? "Menyimpan Perubahan..."
                    : "Mendaftarkan & Mengunggah Berkas..."
                  : editingVessel
                  ? "Simpan Perubahan Kapal"
                  : "Simpan & Daftarkan Kapal"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
