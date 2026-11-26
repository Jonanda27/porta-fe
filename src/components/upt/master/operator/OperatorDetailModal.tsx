"use client";

import React, { useState } from "react";
import {
  Building2,
  FileText,
  X,
  Loader2,
  Upload,
  ExternalLink,
} from "lucide-react";
import { getBackendFileUrl } from "@/lib/file-url";
import { useUptStore } from "@/store/upt.store";
import { toast } from "@/store/toast.store";
import { UptService } from "@/services/upt.service";
import { formatLabel } from "@/lib/format-labels";
import { ShipOperatorItem } from "@/types/upt.types";
import { ModalPortal } from "@/components/ui/ModalPortal";

export interface OperatorDetailModalProps {
  operator: ShipOperatorItem | null;
  onClose: () => void;
  onOperatorUpdated: (updated: ShipOperatorItem) => void;
  onError: (message: string | null) => void;
}

export function OperatorDetailModal({
  operator,
  onClose,
  onOperatorUpdated,
  onError,
}: OperatorDetailModalProps) {
  const { uploadOperatorDocumentByOfficer } = useUptStore();

  const [docCategory, setDocCategory] = useState<"SIUPAL_NIB" | "NPWP" | "LAINNYA">("SIUPAL_NIB");
  const [docNumber, setDocNumber] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  if (!operator) return null;

  const handleUploadDocForOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) return;
    setIsUploadingDoc(true);
    onError(null);
    try {
      await uploadOperatorDocumentByOfficer(
        operator.id,
        {
          category: docCategory,
          documentNumber: docNumber.trim() || `${docCategory}-${new Date().getFullYear()}`,
          notes: "Diunggah oleh Petugas Registrasi & Kontrak",
        },
        docFile
      );
      const refreshed = await UptService.getOperatorById(operator.id);
      onOperatorUpdated(refreshed);
      setDocNumber("");
      setDocFile(null);
      toast.success(
        "Berkas Diunggah",
        `Berkas ${formatLabel(docCategory)} untuk ${operator.name} berhasil diunggah!`
      );
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Gagal mengunggah dokumen operator.");
    } finally {
      setIsUploadingDoc(false);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-[#E2E8F0]">
          <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#133D31]/10 flex items-center justify-center text-[#133D31]">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0B241E]">{operator.name}</h3>
                <p className="text-xs text-[#64748B]">
                  NPWP: {operator.npwp || "Belum diisi"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#94A3B8] hover:text-[#475569] rounded-lg hover:bg-[#F1F5F9]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <span className="text-[#64748B]">Profil Operasional:</span>
                <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                  {operator.operatorProfile === "REGULAR_SCHEDULED"
                    ? "Jadwal Reguler (Trayek Tetap)"
                    : "Insidental / Non-Reguler"}
                </p>
              </div>
              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <span className="text-[#64748B]">Status Verifikasi:</span>
                <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                  {formatLabel(operator.verificationStatus)}
                </p>
              </div>
              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <span className="text-[#64748B]">Nomor Telepon:</span>
                <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                  {operator.phone || "-"}
                </p>
              </div>
              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <span className="text-[#64748B]">Alamat Email:</span>
                <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                  {operator.email || "-"}
                </p>
              </div>
              <div className="col-span-2 p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <span className="text-[#64748B]">Alamat Kantor:</span>
                <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                  {operator.address || "Belum ada alamat terdaftar."}
                </p>
              </div>
            </div>

            {/* Dokumen Perusahaan */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#0B241E] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#133D31]" />
                Dokumen Legalitas &amp; SIUPAL Perusahaan
              </h4>
              {!operator.documents || operator.documents.length === 0 ? (
                <p className="text-[#94A3B8] italic p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  Belum ada dokumen legalitas terunggah.
                </p>
              ) : (
                <div className="space-y-2">
                  {operator.documents.map((doc) => {
                    const docUrl = getBackendFileUrl(doc.filePath);
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-[#1E293B] truncate">
                            {formatLabel(doc.category)}
                          </div>
                          <div className="text-[11px] text-[#64748B] truncate">
                            {doc.documentNumber || doc.fileName}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {docUrl && (
                            <a
                              href={docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-white border border-[#CBD5E1] text-[#0B241E] hover:bg-[#0B241E] hover:text-white text-[10.5px] font-bold inline-flex items-center gap-1"
                            >
                              <span>Buka</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <span
                            className={`inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              doc.verificationStatus === "VERIFIED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {formatLabel(doc.verificationStatus)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Form Unggah Berkas Legalitas oleh Petugas (POST /operators/:id/documents) */}
              <form
                onSubmit={handleUploadDocForOperator}
                className="p-4 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-3"
              >
                <p className="text-xs font-extrabold text-[#0B241E] flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Unggah Berkas Legalitas Perusahaan (Oleh Petugas)</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#334155] mb-1">
                      Kategori Berkas
                    </label>
                    <select
                      value={docCategory}
                      onChange={(e) =>
                        setDocCategory(
                          e.target.value as "SIUPAL_NIB" | "NPWP" | "LAINNYA"
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-xs font-semibold"
                    >
                      <option value="SIUPAL_NIB">SIUPAL / NIB</option>
                      <option value="NPWP">NPWP Badan Usaha</option>
                      <option value="LAINNYA">Akta / Domisili / Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#334155] mb-1">
                      Nomor Surat / Dokumen
                    </label>
                    <input
                      type="text"
                      value={docNumber}
                      onChange={(e) => setDocNumber(e.target.value)}
                      placeholder="Contoh: SIUPAL-042/2026"
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-xs font-mono"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <input
                    type="file"
                    required
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                    className="text-xs text-[#64748B] file:mr-2.5 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#0B241E] file:text-white file:font-bold cursor-pointer"
                  />
                  <button
                    type="submit"
                    disabled={isUploadingDoc || !docFile}
                    className="px-3.5 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {isUploadingDoc ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-[#D97706]" />
                    )}
                    <span>Unggah Berkas</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#1E293B] hover:bg-[#F1F5F9]"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
