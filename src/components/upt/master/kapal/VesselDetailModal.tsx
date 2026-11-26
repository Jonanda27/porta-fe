"use client";

import React from "react";
import {
  Building2,
  ExternalLink,
  FileText,
  GitMerge,
  Loader2,
  Ship,
  Upload,
  X,
} from "lucide-react";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { getBackendFileUrl } from "@/lib/file-url";
import { formatLabel } from "@/lib/format-labels";
import { OperatorVesselLinkItem, VesselItem } from "@/types/upt.types";

export interface RejectClaimTarget {
  operatorId: number;
  vesselId: number;
  operatorName: string;
}

export interface VesselDetailModalProps {
  vessel: VesselItem | null;
  linkedOperators: OperatorVesselLinkItem[];
  isSuperadmin: boolean;
  isSubmitting: boolean;
  vesselDocCategory: "SURAT_UKUR" | "PAS_BESAR_KECIL" | "LAINNYA";
  onVesselDocCategoryChange: (
    value: "SURAT_UKUR" | "PAS_BESAR_KECIL" | "LAINNYA"
  ) => void;
  vesselDocNumber: string;
  onVesselDocNumberChange: (value: string) => void;
  vesselDocFile: File | null;
  onVesselDocFileChange: (file: File | null) => void;
  isUploadingVesselDoc: boolean;
  onUploadDoc: (e: React.FormEvent) => void;
  onApproveClaim: (operatorId: number, vesselId: number) => void;
  onRejectClaim: (target: RejectClaimTarget) => void;
  onOpenMerge: (vessel: VesselItem) => void;
  onClose: () => void;
}

export function VesselDetailModal({
  vessel,
  linkedOperators,
  isSuperadmin,
  isSubmitting,
  vesselDocCategory,
  onVesselDocCategoryChange,
  vesselDocNumber,
  onVesselDocNumberChange,
  vesselDocFile,
  onVesselDocFileChange,
  isUploadingVesselDoc,
  onUploadDoc,
  onApproveClaim,
  onRejectClaim,
  onOpenMerge,
  onClose,
}: VesselDetailModalProps) {
  if (!vessel) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-[#E2E8F0]">
          <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#133D31]/10 flex items-center justify-center text-[#133D31]">
                <Ship className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0B241E]">{vessel.name}</h3>
                <p className="text-xs text-[#64748B]">
                  Registrasi: {vessel.registrationNumber}
                  {vessel.imoNumber ? ` • IMO: ${vessel.imoNumber}` : ""}
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
                <span className="text-[#64748B]">Bendera Kebangsaan:</span>
                <p className="text-sm font-bold text-[#0B241E] mt-0.5">{vessel.flag}</p>
              </div>
              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <span className="text-[#64748B]">Kategori & Trayek:</span>
                <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                  {formatLabel(vessel.vesselCategory)} •{" "}
                  {formatLabel(vessel.shippingCategory)}
                </p>
              </div>
              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <span className="text-[#64748B]">Tonase Kotor (GT):</span>
                <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                  {Number(vessel.grossTonnage).toLocaleString("id-ID")} GT
                </p>
              </div>
              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <span className="text-[#64748B]">LOA / Draft:</span>
                <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                  {vessel.lengthMeters ? `${vessel.lengthMeters} m` : "-"} /{" "}
                  {vessel.draftMeters ? `${vessel.draftMeters} m` : "-"}
                </p>
              </div>
            </div>

            {/* Perusahaan Terhubung (Many-to-Many OperatorVessel) */}
            <div>
              <h4 className="text-xs font-bold text-[#0B241E] mb-2.5 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#133D31]" />
                Perusahaan Pelayaran / Agen Terhubung
              </h4>
              {linkedOperators.length === 0 ? (
                <p className="text-[#94A3B8] italic p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  Belum diklaim oleh perusahaan pelayaran mana pun (Master Global).
                </p>
              ) : (
                <div className="space-y-2">
                  {linkedOperators.map((link) => (
                    <div
                      key={`${vessel.id}-${link.operatorId}`}
                      className="flex items-center justify-between gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]"
                    >
                      <div>
                        <div className="font-bold text-[#0B241E]">
                          {link.operator?.name || `Operator #${link.operatorId}`}
                        </div>
                        <div className="text-[11px] text-[#64748B] mt-0.5 flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                            {formatLabel(link.relationshipType)}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded font-semibold border ${
                              link.verificationStatus === "VERIFIED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : link.verificationStatus === "REJECTED"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}
                          >
                            {formatLabel(link.verificationStatus)}
                          </span>
                        </div>
                      </div>

                      {link.verificationStatus === "PENDING" && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => onApproveClaim(link.operatorId, vessel.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                          >
                            Setujui Klaim
                          </button>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() =>
                              onRejectClaim({
                                operatorId: link.operatorId,
                                vesselId: vessel.id,
                                operatorName:
                                  link.operator?.name || `Operator #${link.operatorId}`,
                              })
                            }
                            className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold cursor-pointer"
                          >
                            Tolak
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dokumen Kapal */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#0B241E] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#133D31]" />
                Dokumen Legalitas &amp; Sertifikasi Kapal
              </h4>
              {!vessel.documents || vessel.documents.length === 0 ? (
                <p className="text-[#94A3B8] italic p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  Belum ada dokumen yang diunggah.
                </p>
              ) : (
                <div className="space-y-2">
                  {vessel.documents.map((doc) => {
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

              {/* Form Unggah Dokumen Kapal oleh Petugas (POST /vessels/:id/documents) */}
              <form
                onSubmit={onUploadDoc}
                className="p-4 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-3"
              >
                <p className="text-xs font-extrabold text-[#0B241E] flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Unggah Dokumen Surat Ukur / Pas Kapal (Oleh Petugas)</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#334155] mb-1">
                      Kategori Dokumen Kapal
                    </label>
                    <select
                      value={vesselDocCategory}
                      onChange={(e) =>
                        onVesselDocCategoryChange(
                          e.target.value as "SURAT_UKUR" | "PAS_BESAR_KECIL" | "LAINNYA"
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-xs font-semibold"
                    >
                      <option value="SURAT_UKUR">Surat Ukur Kapal (Tonnage Certificate)</option>
                      <option value="PAS_BESAR_KECIL">Pas Besar / Pas Kecil / Surat Laut</option>
                      <option value="LAINNYA">Sertifikat Keselamatan / Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#334155] mb-1">
                      Nomor Dokumen / Surat Ukur
                    </label>
                    <input
                      type="text"
                      value={vesselDocNumber}
                      onChange={(e) => onVesselDocNumberChange(e.target.value)}
                      placeholder="Contoh: SU-KEMENHUB-2026"
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-xs font-mono"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <input
                    type="file"
                    required
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => onVesselDocFileChange(e.target.files?.[0] || null)}
                    className="text-xs text-[#64748B] file:mr-2.5 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#0B241E] file:text-white file:font-bold cursor-pointer"
                  />
                  <button
                    type="submit"
                    disabled={isUploadingVesselDoc || !vesselDocFile}
                    className="px-3.5 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {isUploadingVesselDoc ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-[#D97706]" />
                    )}
                    <span>Unggah Dokumen Kapal</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
            {isSuperadmin ? (
              <button
                type="button"
                onClick={() => onOpenMerge(vessel)}
                className="text-xs font-medium text-slate-500 hover:text-indigo-700 inline-flex items-center gap-1.5 cursor-pointer"
                title="Gunakan hanya jika data kapal ini ternyata dobel/typo dari kapal lain"
              >
                <GitMerge className="w-3.5 h-3.5" />
                <span>Gabungkan jika data ini dobel (typo)</span>
              </button>
            ) : (
              <div />
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
