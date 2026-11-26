"use client";

import React from "react";
import { X, AlertCircle, FileText, ExternalLink, Loader2, Upload } from "lucide-react";
import {
  InspectDocsTarget,
  RejectVerifikasiTarget,
  ShipOperatorItem,
} from "@/types/upt.types";
import { formatLabel } from "@/lib/format-labels";
import { ModalPortal } from "@/components/ui/ModalPortal";

interface InspectDocumentsModalProps {
  target: InspectDocsTarget | null;
  getBackendFileUrl: (filePath?: string | null) => string | null;
  onClose: () => void;
}

export function InspectDocumentsModal({
  target,
  getBackendFileUrl,
  onClose,
}: InspectDocumentsModalProps) {
  if (!target) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-[#E2E8F0] w-full max-w-2xl p-6 sm:p-7 space-y-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-[#F1F5F9] pb-3.5">
          <div>
            <h3 className="text-base font-extrabold text-[#0B241E]">{target.title}</h3>
            <p className="text-xs text-[#64748B] mt-0.5">{target.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#64748B] hover:text-[#0B241E] hover:bg-[#F1F5F9] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {target.missingWarning && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Berkas Wajib Belum Lengkap</p>
              <p className="mt-0.5 text-amber-800">
                {target.missingWarning}. Tombol verifikasi akan terbuka otomatis setelah
                operator mengunggah berkas wajib tersebut.
              </p>
            </div>
          </div>
        )}

        {target.docs.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#64748B] space-y-2 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
            <FileText className="w-8 h-8 text-[#94A3B8] mx-auto" />
            <p className="font-bold text-[#0B241E]">Belum Ada Berkas Diunggah</p>
            <p>Operator kapal ini belum mengunggah dokumen legalitas apapun ke server.</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto divide-y divide-[#F1F5F9] border border-[#E2E8F0] rounded-2xl">
            {target.docs.map((doc) => {
              const fileUrl = getBackendFileUrl(doc.filePath);
              const cleanNotes = doc.notes?.replace(/^SLOT:[A-Z_]+\s*-\s*/, "");
              return (
                <div
                  key={doc.id}
                  className="p-3.5 px-4 flex items-center justify-between gap-3 text-xs hover:bg-[#F8FAFC]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[#0B241E] truncate">
                      {cleanNotes || formatLabel(doc.category)}
                    </p>
                    <p className="text-[11px] font-mono text-[#64748B] truncate mt-0.5">
                      File: {doc.fileName} • No: {doc.documentNumber || "-"} •{" "}
                      {new Date(doc.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  {fileUrl && (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-[11px] font-bold inline-flex items-center gap-1.5 shrink-0"
                    >
                      <span>Buka File</span>
                      <ExternalLink className="w-3 h-3 text-[#D97706]" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-xs font-bold text-[#0B241E] cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}

interface CreatePksContractModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  operators: ShipOperatorItem[];
  pksOperatorId: string;
  onChangeOperatorId: (val: string) => void;
  pksTitle: string;
  onChangeTitle: (val: string) => void;
  pksStartDate: string;
  onChangeStartDate: (val: string) => void;
  pksEndDate: string;
  onChangeEndDate: (val: string) => void;
  pksMonthlyQuota: string;
  onChangeMonthlyQuota: (val: string) => void;
  pksDockAllocation: string;
  onChangeDockAllocation: (val: string) => void;
  onChangeFile: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function CreatePksContractModal({
  isOpen,
  isSubmitting,
  operators,
  pksOperatorId,
  onChangeOperatorId,
  pksTitle,
  onChangeTitle,
  pksStartDate,
  onChangeStartDate,
  pksEndDate,
  onChangeEndDate,
  pksMonthlyQuota,
  onChangeMonthlyQuota,
  pksDockAllocation,
  onChangeDockAllocation,
  onChangeFile,
  onSubmit,
  onClose,
}: CreatePksContractModalProps) {
  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
        <form
          onSubmit={onSubmit}
          className="bg-white rounded-3xl border border-[#E2E8F0] w-full max-w-xl p-6 sm:p-7 space-y-4 shadow-2xl"
        >
        <div className="flex items-start justify-between gap-3 border-b border-[#F1F5F9] pb-3">
          <div>
            <h3 className="text-base font-extrabold text-[#0B241E]">
              Daftarkan Kontrak PKS Sandar Kapal
            </h3>
            <p className="text-xs text-[#64748B]">
              Buat dan unggah dokumen Perjanjian Kerja Sama (PKS) Sandar untuk perusahaan
              pelayaran.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#64748B] hover:text-[#0B241E] hover:bg-[#F1F5F9] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-bold text-[#334155] mb-1">
              Perusahaan Operator Kapal <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={pksOperatorId}
              onChange={(e) => onChangeOperatorId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] font-semibold"
            >
              <option value="">-- Pilih Perusahaan Operator --</option>
              {operators.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name} ({formatLabel(op.verificationStatus)})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-[#334155] mb-1">
              Judul Kontrak PKS <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={pksTitle}
              onChange={(e) => onChangeTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#334155] mb-1">
              Tanggal Mulai Berlaku <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={pksStartDate}
              onChange={(e) => onChangeStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#334155] mb-1">
              Tanggal Berakhir <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={pksEndDate}
              onChange={(e) => onChangeEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#334155] mb-1">
              Kuota Sandar Bulanan (Slot)
            </label>
            <input
              type="number"
              min={1}
              value={pksMonthlyQuota}
              onChange={(e) => onChangeMonthlyQuota(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#334155] mb-1">Alokasi Dermaga</label>
            <input
              type="text"
              value={pksDockAllocation}
              onChange={(e) => onChangeDockAllocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-[#334155] mb-1">
              Lampiran Dokumen PKS (PDF / Gambar)
            </label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => onChangeFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-[#64748B] file:mr-2.5 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#0B241E] file:text-white file:font-bold cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-[#D97706]" />
            )}
            <span>Simpan Kontrak PKS</span>
          </button>
        </div>
      </form>
    </div>
    </ModalPortal>
  );
}

interface RejectVerifikasiModalProps {
  target: RejectVerifikasiTarget | null;
  rejectionReason: string;
  onChangeReason: (val: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function RejectVerifikasiModal({
  target,
  rejectionReason,
  onChangeReason,
  isSubmitting,
  onSubmit,
  onClose,
}: RejectVerifikasiModalProps) {
  if (!target) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
        <form
          onSubmit={onSubmit}
          className="bg-white rounded-3xl border border-[#E2E8F0] w-full max-w-xl p-6 sm:p-8 space-y-5 shadow-2xl"
        >
        <h3 className="text-base font-extrabold text-[#0B241E]">
          Tolak Verifikasi: {target.name}
        </h3>
        <div>
          <label className="block text-xs font-bold text-[#334155] mb-1">
            Alasan Penolakan
          </label>
          <textarea
            required
            rows={3}
            value={rejectionReason}
            onChange={(e) => onChangeReason(e.target.value)}
            placeholder="Misal: Dokumen tidak valid, kuota penuh, atau ruangan tidak tersedia..."
            className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Tolak Verifikasi
          </button>
        </div>
      </form>
    </div>
    </ModalPortal>
  );
}
