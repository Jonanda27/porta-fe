"use client";

import React from "react";
import { Eye, FileText, Lock, ShieldCheck, XCircle } from "lucide-react";
import {
  InspectDocsTarget,
  RejectVerifikasiTarget,
  VesselItem,
} from "@/types/upt.types";
import { formatLabel } from "@/lib/format-labels";
import {
  checkVesselMandatoryDocs,
  VERIFIKASI_STATUS_BADGE,
} from "./verifikasiHelpers";

export interface VesselVerificationTabProps {
  vessels: VesselItem[];
  isSubmitting: boolean;
  onInspectDocs: (target: InspectDocsTarget) => void;
  onApprove: (id: number, name: string) => void;
  onReject: (target: RejectVerifikasiTarget) => void;
}

export function VesselVerificationTab({
  vessels,
  isSubmitting,
  onInspectDocs,
  onApprove,
  onReject,
}: VesselVerificationTabProps) {
  return (
    <div className="w-full overflow-x-hidden">
      <table className="w-full text-left border-collapse table-fixed">
        <thead>
          <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] bg-[#F8FAFC]">
            <th className="py-3 px-3.5 w-[19%]">Nama Kapal</th>
            <th className="py-3 px-3 w-[18%]">Operator</th>
            <th className="py-3 px-2.5 w-[14%]">No. Registrasi / IMO</th>
            <th className="py-3 px-2.5 w-[11%]">GT &amp; Kategori</th>
            <th className="py-3 px-2.5 w-[11%]">Dokumen</th>
            <th className="py-3 px-2.5 w-[10%]">Status</th>
            <th className="py-3 px-3.5 text-right w-[17%]">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F1F5F9] text-xs">
          {vessels.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-10 text-center text-[#94A3B8]">
                Tidak ada data armada kapal untuk filter ini.
              </td>
            </tr>
          ) : (
            vessels.map((v) => {
              const vDocCheck = checkVesselMandatoryDocs(v.documents);
              return (
                <tr key={v.id} className="hover:bg-[#F8FAFC]">
                  <td className="py-3 px-3.5 font-bold text-[#0B241E] align-middle">
                    <div className="truncate" title={v.name}>
                      {v.name}
                    </div>
                    {v.rejectionReason && (
                      <p className="text-[11px] font-normal text-rose-600 mt-0.5 truncate">
                        Alasan: {v.rejectionReason}
                      </p>
                    )}
                  </td>
                  <td
                    className="py-3 px-3 text-[#475569] align-middle truncate"
                    title={v.operator?.name || "-"}
                  >
                    {v.operator?.name || "-"}
                  </td>
                  <td className="py-3 px-2.5 text-[#475569] font-mono align-middle">
                    <div className="truncate">{v.registrationNumber}</div>
                    {v.imoNumber && (
                      <div className="text-[11px] text-[#94A3B8] truncate">
                        IMO: {v.imoNumber}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-2.5 text-[#475569] align-middle">
                    <div className="font-bold text-[#0B241E]">{v.grossTonnage} GT</div>
                    <div className="text-[11px] text-[#64748B] truncate">
                      {formatLabel(v.shippingCategory)}
                    </div>
                  </td>
                  <td className="py-3 px-2.5 align-middle">
                    <button
                      type="button"
                      onClick={() =>
                        onInspectDocs({
                          title: `Dokumen Teknis Kapal — ${v.name}`,
                          subtitle: `No. Registrasi: ${v.registrationNumber} • ${v.grossTonnage} GT`,
                          docs: v.documents || [],
                          missingWarning: vDocCheck.missingText,
                        })
                      }
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                        (v.documents?.length ?? 0) > 0
                          ? "bg-[#F8FAFC] hover:bg-[#0B241E] text-[#0B241E] hover:text-white border-[#CBD5E1]"
                          : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                      }`}
                    >
                      <FileText className="w-3 h-3 text-[#D97706] shrink-0" />
                      <span>{v.documents?.length ?? 0} Berkas</span>
                      {(v.documents?.length ?? 0) > 0 && (
                        <Eye className="w-3 h-3 opacity-75 shrink-0" />
                      )}
                    </button>
                  </td>
                  <td className="py-3.5 px-2 align-middle">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                        VERIFIKASI_STATUS_BADGE[v.verificationStatus] ||
                        "bg-slate-50 text-slate-700"
                      }`}
                    >
                      {formatLabel(v.verificationStatus)}
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 text-right align-middle whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      {v.verificationStatus !== "VERIFIED" && (
                        <button
                          type="button"
                          disabled={isSubmitting || !vDocCheck.isReadyToVerify}
                          title={
                            vDocCheck.isReadyToVerify
                              ? `Verifikasi GT & dokumen ${v.name}`
                              : `Tidak dapat diverifikasi: ${vDocCheck.missingText}`
                          }
                          onClick={() => onApprove(v.id, v.name)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-colors whitespace-nowrap ${
                            vDocCheck.isReadyToVerify
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                          }`}
                        >
                          {vDocCheck.isReadyToVerify ? (
                            <ShieldCheck className="w-3 h-3 shrink-0" />
                          ) : (
                            <Lock className="w-3 h-3 shrink-0" />
                          )}
                          <span>Verifikasi</span>
                        </button>
                      )}
                      {v.verificationStatus !== "REJECTED" && (
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() =>
                            onReject({ type: "vessels", id: v.id, name: v.name })
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
