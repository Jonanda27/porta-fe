"use client";

import React from "react";
import { Eye, FileText, Lock, ShieldCheck, XCircle } from "lucide-react";
import {
  InspectDocsTarget,
  RejectVerifikasiTarget,
  ShipOperatorItem,
} from "@/types/upt.types";
import { formatLabel } from "@/lib/format-labels";
import {
  checkOperatorMandatoryDocs,
  VERIFIKASI_STATUS_BADGE,
} from "./verifikasiHelpers";

export interface OperatorVerificationTabProps {
  operators: ShipOperatorItem[];
  isSubmitting: boolean;
  onInspectDocs: (target: InspectDocsTarget) => void;
  onApprove: (id: number, name: string) => void;
  onReject: (target: RejectVerifikasiTarget) => void;
}

export function OperatorVerificationTab({
  operators,
  isSubmitting,
  onInspectDocs,
  onApprove,
  onReject,
}: OperatorVerificationTabProps) {
  return (
    <div className="w-full overflow-x-hidden">
      <table className="w-full text-left border-collapse table-fixed">
        <thead>
          <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] bg-[#F8FAFC]">
            <th className="py-3 px-3.5 w-[22%]">Perusahaan / Operator</th>
            <th className="py-3 px-3 w-[23%]">NPWP &amp; Kontak</th>
            <th className="py-3 px-2.5 w-[13%]">Profil</th>
            <th className="py-3 px-2.5 w-[15%]">Dokumen</th>
            <th className="py-3 px-2.5 w-[10%]">Status</th>
            <th className="py-3 px-3.5 text-right w-[17%]">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F1F5F9] text-xs">
          {operators.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-10 text-center text-[#94A3B8]">
                Tidak ada data operator untuk filter ini.
              </td>
            </tr>
          ) : (
            operators.map((op) => {
              const docCheck = checkOperatorMandatoryDocs(op.documents);
              return (
                <tr key={op.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-3.5 font-bold text-[#0B241E] align-middle">
                    <div className="leading-snug truncate" title={op.name}>
                      {op.name}
                    </div>
                    {op.rejectionReason && (
                      <p
                        className="text-[11px] font-normal text-rose-600 mt-0.5 truncate"
                        title={op.rejectionReason}
                      >
                        Alasan: {op.rejectionReason}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-3 text-[#475569] align-middle">
                    <div className="font-mono text-[11px] font-semibold text-[#0B241E] truncate">
                      NPWP: {op.npwp || "-"}
                    </div>
                    <div
                      className="text-[11px] text-[#64748B] mt-0.5 truncate"
                      title={`${op.email || "-"} • ${op.phone || "-"}`}
                    >
                      {op.email || "-"} • {op.phone || "-"}
                    </div>
                  </td>
                  <td className="py-3 px-2.5 align-middle">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[#F1F5F9] text-[#334155] font-semibold text-[11px] whitespace-nowrap">
                      {op.operatorProfile === "REGULAR_SCHEDULED"
                        ? "Rutin Terjadwal"
                        : "Insidental"}
                    </span>
                  </td>
                  <td className="py-3 px-2.5 align-middle">
                    <div className="flex flex-col items-start gap-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          onInspectDocs({
                            title: `Berkas Legalitas — ${op.name}`,
                            subtitle: `NPWP: ${op.npwp || "-"} • ${op.email || "-"}`,
                            docs: docCheck.companyDocs,
                            missingWarning: docCheck.missingText,
                          })
                        }
                        title={docCheck.missingText || "Klik untuk melihat berkas"}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                          docCheck.companyDocs.length > 0
                            ? "bg-[#F8FAFC] hover:bg-[#0B241E] text-[#0B241E] hover:text-white border-[#CBD5E1]"
                            : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                        }`}
                      >
                        <FileText className="w-3 h-3 text-[#D97706] shrink-0" />
                        <span>{docCheck.companyDocs.length} Berkas</span>
                        {docCheck.companyDocs.length > 0 && (
                          <Eye className="w-3 h-3 opacity-75 shrink-0" />
                        )}
                      </button>
                      {!docCheck.isReadyToVerify && op.verificationStatus !== "VERIFIED" && (
                        <span
                          className="text-[10px] font-medium text-rose-600 truncate max-w-full"
                          title={docCheck.missingText || undefined}
                        >
                          Belum unggah wajib
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2.5 align-middle">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border inline-block whitespace-nowrap ${
                        VERIFIKASI_STATUS_BADGE[op.verificationStatus] ||
                        "bg-slate-50 text-slate-700"
                      }`}
                    >
                      {formatLabel(op.verificationStatus)}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-right align-middle">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      {op.verificationStatus !== "VERIFIED" && (
                        <button
                          type="button"
                          disabled={isSubmitting || !docCheck.isReadyToVerify}
                          title={
                            docCheck.isReadyToVerify
                              ? `Verifikasi & aktifkan akun ${op.name}`
                              : `Tidak dapat diverifikasi: ${docCheck.missingText}`
                          }
                          onClick={() => onApprove(op.id, op.name)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-colors whitespace-nowrap ${
                            docCheck.isReadyToVerify
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-2xs"
                              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                          }`}
                        >
                          {docCheck.isReadyToVerify ? (
                            <ShieldCheck className="w-3 h-3 shrink-0" />
                          ) : (
                            <Lock className="w-3 h-3 shrink-0" />
                          )}
                          <span>Verifikasi</span>
                        </button>
                      )}
                      {op.verificationStatus !== "REJECTED" && (
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() =>
                            onReject({ type: "operators", id: op.id, name: op.name })
                          }
                          className="px-2 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <XCircle className="w-3 h-3 shrink-0" />
                          <span>Tolak</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
