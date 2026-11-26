"use client";

import React from "react";
import {
  ExternalLink,
  FileText,
  PenTool,
  Printer,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { getBackendFileUrl } from "@/lib/file-url";
import { OperatorBerthingContract } from "@/types/kapal.types";
import { RejectVerifikasiTarget } from "@/types/upt.types";
import { VERIFIKASI_STATUS_BADGE } from "./verifikasiHelpers";

export interface BerthingContractVerificationTabProps {
  contracts: OperatorBerthingContract[];
  userRole?: string;
  isSubmitting: boolean;
  onApproveStage1: (id: number, contractNumber: string) => void;
  onOpenTte: (contract: OperatorBerthingContract) => void;
  onOpenPrint: (contract: OperatorBerthingContract) => void;
  onReject: (target: RejectVerifikasiTarget) => void;
}

export function BerthingContractVerificationTab({
  contracts,
  userRole,
  isSubmitting,
  onApproveStage1,
  onOpenTte,
  onOpenPrint,
  onReject,
}: BerthingContractVerificationTabProps) {
  return (
    <div className="w-full overflow-x-hidden">
      <table className="w-full text-left border-collapse table-fixed">
        <thead>
          <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] bg-[#F8FAFC]">
            <th className="py-3 px-3.5 w-[22%]">No. PKS &amp; Judul</th>
            <th className="py-3 px-3 w-[17%]">Operator Kapal</th>
            <th className="py-3 px-3 w-[15%]">Pelabuhan &amp; Alokasi</th>
            <th className="py-3 px-2.5 w-[13%]">Masa Berlaku</th>
            <th className="py-3 px-2 w-[8%]">Kuota</th>
            <th className="py-3 px-2.5 w-[10%]">Status</th>
            <th className="py-3 px-3.5 text-right w-[15%]">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F1F5F9] text-xs">
          {contracts.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-10 text-center text-[#94A3B8]">
                Belum ada permohonan PKS Sandar Kapal dalam antrean verifikasi.
              </td>
            </tr>
          ) : (
            contracts.map((c) => (
              <tr key={c.id} className="hover:bg-[#F8FAFC]">
                <td className="py-3 px-3.5 align-middle">
                  <span className="font-mono text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded inline-block">
                    {c.contractNumber}
                  </span>
                  <p className="font-bold text-[#0B241E] mt-1 truncate" title={c.title}>
                    {c.title}
                  </p>
                  {c.filePath && (
                    <a
                      href={getBackendFileUrl(c.filePath) || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0284C7] hover:underline mt-0.5 mr-2"
                    >
                      <FileText className="w-3 h-3 shrink-0" />
                      <span className="truncate">Permohonan</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  )}
                  {c.signedFilePath && (
                    <a
                      href={getBackendFileUrl(c.signedFilePath) || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline mt-0.5"
                    >
                      <FileText className="w-3 h-3 shrink-0" />
                      <span className="truncate">Scan TTD Basah</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  )}
                  {c.rejectionReason && (
                    <p className="text-[11px] font-normal text-rose-600 mt-0.5 truncate">
                      Alasan: {c.rejectionReason}
                    </p>
                  )}
                </td>
                <td
                  className="py-3 px-3 font-semibold text-[#0B241E] align-middle truncate"
                  title={c.operator?.name || "-"}
                >
                  {c.operator?.name || "-"}
                </td>
                <td className="py-3 px-3 text-[#475569] align-middle">
                  <div className="font-medium text-[#0B241E] truncate">
                    {c.port?.name || "Pelabuhan Poumako"}
                  </div>
                  <div className="text-[11px] text-[#64748B] truncate">
                    {c.dockAllocation || "Dermaga Umum"}
                  </div>
                </td>
                <td className="py-3 px-2.5 font-mono text-[11px] text-[#475569] align-middle">
                  <div>{new Date(c.startDate).toLocaleDateString("id-ID")}</div>
                  <div className="text-[#64748B]">
                    s/d {new Date(c.endDate).toLocaleDateString("id-ID")}
                  </div>
                </td>
                <td className="py-3 px-2 font-bold text-[#0B241E] align-middle whitespace-nowrap">
                  {c.usedQuota} / {c.monthlyQuota || "-"}
                </td>
                <td className="py-3.5 px-2.5 align-middle">
                  <span
                    className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border inline-block whitespace-nowrap ${
                      VERIFIKASI_STATUS_BADGE[c.status] || "bg-slate-50 text-slate-700"
                    }`}
                  >
                    {c.status === "ACTIVE"
                      ? "Aktif (TTE)"
                      : c.status === "PENDING_HEAD_OF_PORT"
                      ? "Tahap 3 (TTE)"
                      : c.status === "WAITING_OPERATOR_SIGNATURE"
                      ? "Tahap 2 (TTD)"
                      : c.status === "PENDING_VERIFICATION"
                      ? "Tahap 1"
                      : c.status === "REJECTED"
                      ? "Ditolak"
                      : "Kedaluwarsa"}
                  </span>
                </td>
                <td className="py-3.5 px-3.5 text-right align-middle whitespace-nowrap">
                  <div className="inline-flex items-center justify-end gap-1.5">
                    {c.status === "PENDING_VERIFICATION" &&
                      userRole !== "KEPALA_PELABUHAN" && (
                        <>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => onApproveStage1(c.id, c.contractNumber)}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <ShieldCheck className="w-3 h-3 shrink-0" />
                            <span>Verifikasi</span>
                          </button>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() =>
                              onReject({
                                type: "pks_sandar",
                                id: c.id,
                                name: c.contractNumber,
                              })
                            }
                            className="px-2 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <XCircle className="w-3 h-3 shrink-0" />
                            <span>Tolak</span>
                          </button>
                        </>
                      )}
                    {c.status === "PENDING_HEAD_OF_PORT" &&
                      userRole !== "PETUGAS_REGISTRASI_KONTRAK" && (
                        <>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => onOpenTte(c)}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <PenTool className="w-3 h-3 shrink-0" />
                            <span>TTE &amp; Sahkan</span>
                          </button>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() =>
                              onReject({
                                type: "pks_sandar",
                                id: c.id,
                                name: c.contractNumber,
                              })
                            }
                            className="px-2 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <XCircle className="w-3 h-3 shrink-0" />
                            <span>Tolak</span>
                          </button>
                        </>
                      )}
                    {c.status === "PENDING_VERIFICATION" &&
                      userRole === "KEPALA_PELABUHAN" && (
                        <span className="text-[11px] text-amber-700 font-bold">
                          Menunggu Verifikasi Petugas
                        </span>
                      )}
                    {c.status === "WAITING_OPERATOR_SIGNATURE" && (
                      <span className="text-[11px] text-sky-700 font-bold">
                        Menunggu Upload TTD Operator
                      </span>
                    )}
                    {c.status === "PENDING_HEAD_OF_PORT" &&
                      userRole === "PETUGAS_REGISTRASI_KONTRAK" && (
                        <span className="text-[11px] text-blue-700 font-bold">
                          Menunggu TTE Ka. UPT
                        </span>
                      )}
                    {(c.status === "WAITING_OPERATOR_SIGNATURE" ||
                      c.status === "PENDING_HEAD_OF_PORT" ||
                      c.status === "ACTIVE") && (
                      <button
                        type="button"
                        onClick={() => onOpenPrint(c)}
                        title="Lihat / Cetak Surat Kontrak"
                        className="p-1 rounded-lg border border-slate-200 text-[#0B241E] hover:bg-slate-100 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {c.status === "ACTIVE" && (
                      <span className="text-[11px] text-emerald-700 font-bold">
                        ✓ Disahkan TTE
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
