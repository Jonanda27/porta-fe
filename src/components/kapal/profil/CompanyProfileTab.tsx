"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  ShieldCheck,
  AlertTriangle,
  X,
  FileCheck2,
  Paperclip,
  ExternalLink,
  Upload,
  Loader2,
} from "lucide-react";
import { getBackendFileUrl } from "@/lib/file-url";
import {
  COMPANY_LEGAL_DOC_SLOTS,
  computeMatchedSlotDocs,
} from "@/lib/kapal-profil";
import { toast } from "@/store/toast.store";
import {
  LegalDocSlotSpec,
  OperatorDocument,
  ShipOperator,
  UploadDocumentPayload,
} from "@/types/kapal.types";

export interface CompanyProfileTabProps {
  operator: ShipOperator | null;
  userOperatorId?: number | null;
  userEmail?: string | null;
  isOperatorVerified: boolean;
  isOperatorRejected: boolean;
  operatorStatusLabel: string;
  onUploadOperatorDocument: (
    operatorId: number | string,
    payload: UploadDocumentPayload,
    file: File | Blob
  ) => Promise<OperatorDocument>;
}

export function CompanyProfileTab({
  operator,
  userOperatorId,
  userEmail,
  isOperatorVerified,
  isOperatorRejected,
  operatorStatusLabel,
  onUploadOperatorDocument,
}: CompanyProfileTabProps) {
  const [slotDocNumbers, setSlotDocNumbers] = useState<Record<string, string>>({});
  const [slotSelectedFiles, setSlotSelectedFiles] = useState<Record<string, File | null>>({});
  const [uploadingSlotKey, setUploadingSlotKey] = useState<string | null>(null);
  const [editingSlotKey, setEditingSlotKey] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const matchedSlotDocs = useMemo(
    () => computeMatchedSlotDocs(operator?.documents),
    [operator?.documents]
  );

  const completedRequiredSlotsCount = useMemo(
    () =>
      COMPANY_LEGAL_DOC_SLOTS.filter(
        (s) => s.required && Boolean(matchedSlotDocs[s.slotKey])
      ).length,
    [matchedSlotDocs]
  );

  const totalRequiredSlotsCount = useMemo(
    () => COMPANY_LEGAL_DOC_SLOTS.filter((s) => s.required).length,
    []
  );

  const handleInlineSlotUpload = async (slot: LegalDocSlotSpec) => {
    const opId = operator?.id || userOperatorId || 1;
    const file = slotSelectedFiles[slot.slotKey];
    const docNum = (slotDocNumbers[slot.slotKey] || "").trim();

    if (!file) {
      setUploadError(`Silakan pilih file PDF atau Gambar untuk berkas "${slot.title}".`);
      return;
    }

    setUploadingSlotKey(slot.slotKey);
    setUploadError(null);

    try {
      await onUploadOperatorDocument(
        opId,
        {
          category: slot.category,
          documentNumber: docNum || `${slot.slotKey}-${new Date().getFullYear()}`,
          notes: `SLOT:${slot.slotKey} - ${slot.title}`,
        },
        file
      );

      setSlotSelectedFiles((prev) => ({ ...prev, [slot.slotKey]: null }));
      setEditingSlotKey(null);
      toast.success(
        "Berkas Diunggah",
        `Dokumen "${slot.title}" berhasil diunggah ke server PORTA.`
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : `Gagal mengunggah berkas ${slot.title}.`;
      setUploadError(msg);
    } finally {
      setUploadingSlotKey(null);
    }
  };

  return (
    <section className="space-y-5">
      {/* Card Info Perusahaan */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#0B241E] text-white flex items-center justify-center text-lg font-black shrink-0">
              <Building2 className="w-6 h-6 text-[#D97706]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-extrabold text-[#0B241E]">
                  {operator?.name || "PT Pelayaran Mimika Sejahtera"}
                </h2>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isOperatorVerified
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : isOperatorRejected
                      ? "bg-rose-100 text-rose-800 border-rose-300"
                      : "bg-amber-100 text-amber-900 border-amber-300"
                  }`}
                >
                  {operatorStatusLabel}
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Operator Angkutan Laut Terdaftar • Profil:{" "}
                <strong className="font-semibold text-[#334155]">
                  {operator?.operatorProfile === "INCIDENTAL"
                    ? "Insidental / Non-Reguler"
                    : "Rutin Terjadwal"}
                </strong>
              </p>
            </div>
          </div>
        </div>

        {/* Identitas Kontak & Lokasi */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <span className="text-[10px] text-[#94A3B8] font-bold block uppercase">
              Nomor Pokok Wajib Pajak (NPWP)
            </span>
            <p className="font-mono font-bold text-[#0B241E] mt-1 text-sm">
              {operator?.npwp || "01.234.567.8-954.000"}
            </p>
          </div>

          <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <span className="text-[10px] text-[#94A3B8] font-bold block uppercase">
              Kontak Operasional
            </span>
            <p className="font-bold text-[#0B241E] mt-1">
              {operator?.phone || "0811-4800-291"}
            </p>
            <p className="text-[#64748B] text-[11px]">
              {operator?.email || userEmail || "ops@mimika-shipping.co.id"}
            </p>
          </div>

          <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <span className="text-[10px] text-[#94A3B8] font-bold block uppercase">
              Alamat Kantor Pelabuhan
            </span>
            <p className="text-[#0B241E] font-medium mt-1">
              {operator?.address ||
                "Kawasan Pelabuhan Poumako, Distrik Mimika Timur, Kabupaten Mimika, Papua Tengah"}
            </p>
          </div>
        </div>
      </div>

      {/* Checklist & Upload Langsung Berkas Legalitas Badan Usaha (Tanpa Modal) */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#0B241E] flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
              <span>Kelengkapan Berkas Legalitas &amp; Perizinan Berusaha</span>
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              Masukkan nomor surat dan unggah file langsung pada masing-masing baris dokumen di
              bawah ini (format PDF, JPG, atau PNG).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border ${
                completedRequiredSlotsCount >= totalRequiredSlotsCount
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-900 border-amber-200"
              }`}
            >
              Wajib Terunggah: {completedRequiredSlotsCount}/{totalRequiredSlotsCount} Berkas
            </span>
          </div>
        </div>

        {uploadError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="text-rose-600 hover:text-rose-900 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="space-y-3.5">
          {COMPANY_LEGAL_DOC_SLOTS.map((slot, index) => {
            const uploadedDoc = matchedSlotDocs[slot.slotKey];
            const docUrl = getBackendFileUrl(uploadedDoc?.filePath);
            const isUploadingThisSlot = uploadingSlotKey === slot.slotKey;
            const isEditingThisSlot = !uploadedDoc || editingSlotKey === slot.slotKey;
            const selectedFile = slotSelectedFiles[slot.slotKey] || null;
            const docNumValue =
              slotDocNumbers[slot.slotKey] !== undefined
                ? slotDocNumbers[slot.slotKey]
                : uploadedDoc?.documentNumber || "";

            return (
              <div
                key={slot.slotKey}
                className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                  uploadedDoc
                    ? "bg-[#FAFCFB] border-emerald-200/90"
                    : "bg-white border-[#CBD5E1] hover:border-[#0B241E]/40"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-mono text-xs font-extrabold border ${
                        uploadedDoc
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-[#F1F5F9] text-[#0B241E] border-[#CBD5E1]"
                      }`}
                    >
                      {uploadedDoc ? (
                        <FileCheck2 className="w-4.5 h-4.5 text-emerald-700" />
                      ) : (
                        <span>0{index + 1}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-[13px] font-extrabold text-[#0B241E]">
                          {slot.title}
                        </h4>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            slot.required
                              ? "bg-amber-50 text-amber-900 border-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {slot.shortBadge}
                        </span>
                        {uploadedDoc ? (
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              isOperatorVerified
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : "bg-sky-50 text-sky-800 border-sky-200"
                            }`}
                          >
                            {isOperatorVerified
                              ? "Terverifikasi Petugas"
                              : "Terunggah • Menunggu Verifikasi Petugas"}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            Belum Diunggah
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#64748B] leading-relaxed">{slot.description}</p>

                      {uploadedDoc && (
                        <div className="pt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-mono text-[#334155]">
                          <span className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-[#E2E8F0]">
                            <Paperclip className="w-3 h-3 text-emerald-700" />
                            <strong className="text-[#0B241E]">{uploadedDoc.fileName}</strong>
                          </span>
                          <span>
                            No. Dokumen:{" "}
                            <strong className="text-[#0B241E]">
                              {uploadedDoc.documentNumber || "-"}
                            </strong>
                          </span>
                          <span className="text-[#64748B]">
                            Diunggah:{" "}
                            {new Date(uploadedDoc.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          {docUrl && (
                            <a
                              href={docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#0284C7] hover:text-[#0B241E] font-sans font-bold inline-flex items-center gap-1 underline"
                            >
                              <span>Lihat Berkas</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {uploadedDoc && !isEditingThisSlot && (
                    <div className="shrink-0 flex items-center gap-2 self-end lg:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSlotKey(slot.slotKey);
                          setSlotDocNumbers((prev) => ({
                            ...prev,
                            [slot.slotKey]: uploadedDoc.documentNumber || "",
                          }));
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F1F5F9] text-[#0B241E] border border-[#CBD5E1] text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#D97706]" />
                        <span>Perbarui Berkas</span>
                      </button>
                    </div>
                  )}
                </div>

                {isEditingThisSlot && (
                  <div className="mt-4 pt-3.5 border-t border-[#E2E8F0] grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-5">
                      <label className="block text-[11px] font-bold text-[#0B241E] mb-1">
                        Nomor Surat / SK / Identitas Dokumen
                      </label>
                      <input
                        type="text"
                        value={docNumValue}
                        onChange={(e) =>
                          setSlotDocNumbers((prev) => ({
                            ...prev,
                            [slot.slotKey]: e.target.value,
                          }))
                        }
                        placeholder={slot.placeholderNumber}
                        className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-mono text-[#0B241E] focus:border-[#0B241E] focus:outline-hidden"
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="block text-[11px] font-bold text-[#0B241E] mb-1">
                        Pilih File Berkas (PDF / JPG / PNG) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setSlotSelectedFiles((prev) => ({
                            ...prev,
                            [slot.slotKey]: file,
                          }));
                        }}
                        className="w-full text-xs text-[#64748B] file:mr-2.5 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#F1F5F9] hover:file:bg-[#E2E8F0] file:text-[#0B241E] file:font-bold file:text-xs cursor-pointer bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-1"
                      />
                    </div>

                    <div className="md:col-span-3 flex items-center justify-end gap-2">
                      {uploadedDoc && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSlotKey(null);
                            setSlotSelectedFiles((prev) => ({
                              ...prev,
                              [slot.slotKey]: null,
                            }));
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:text-[#0B241E] cursor-pointer"
                        >
                          Batal
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={isUploadingThisSlot || !selectedFile}
                        onClick={() => void handleInlineSlotUpload(slot)}
                        className="w-full md:w-auto px-4 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-extrabold transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                      >
                        {isUploadingThisSlot ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D97706]" />
                            <span>Mengunggah...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-[#D97706]" />
                            <span>{uploadedDoc ? "Simpan Berkas Baru" : "Unggah Berkas"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
