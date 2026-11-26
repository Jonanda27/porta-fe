"use client";

import React from "react";
import { FileSignature, ShieldCheck, XCircle } from "lucide-react";
import { AssetLeaseItem, RejectVerifikasiTarget } from "@/types/upt.types";
import { VERIFIKASI_STATUS_BADGE } from "./verifikasiHelpers";

export interface RoomLeaseVerificationTabProps {
  leases: AssetLeaseItem[];
  userRole?: string;
  isSubmitting: boolean;
  onVerifyRoomLease: (leaseId: number, contractNumber: string) => void;
  onApproveHeadOfPort: (leaseId: number, contractNumber: string) => void;
  onReject: (target: RejectVerifikasiTarget) => void;
}

export function RoomLeaseVerificationTab({
  leases,
  userRole,
  isSubmitting,
  onVerifyRoomLease,
  onApproveHeadOfPort,
  onReject,
}: RoomLeaseVerificationTabProps) {
  return (
    <div className="w-full overflow-x-hidden">
      <table className="w-full text-left border-collapse table-fixed">
        <thead>
          <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] bg-[#F8FAFC]">
            <th className="py-3 px-3.5 w-[16%]">No. PKS / Pengajuan</th>
            <th className="py-3 px-3 w-[15%]">Penyewa / Pemohon</th>
            <th className="py-3 px-3 w-[16%]">Ruangan / Aset BMD</th>
            <th className="py-3 px-2.5 w-[14%]">Masa Sewa &amp; Nilai</th>
            <th className="py-3 px-2.5 w-[15%]">Verifikator (2-Tahap)</th>
            <th className="py-3 px-2 w-[8%]">Status</th>
            <th className="py-3 px-3.5 text-right w-[16%]">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F1F5F9] text-xs">
          {leases.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-10 text-center text-[#94A3B8]">
                Belum ada permohonan sewa ruangan/aset dalam antrean verifikasi.
              </td>
            </tr>
          ) : (
            leases.map((l) => (
              <tr key={l.id} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="py-3 px-3.5 align-middle">
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded inline-block truncate max-w-full ${
                      l.contractNumber.startsWith("PKS-SWA")
                        ? "text-emerald-900 bg-emerald-100"
                        : "text-amber-900 bg-amber-100"
                    }`}
                    title={l.contractNumber}
                  >
                    {l.contractNumber}
                  </span>
                  {l.rejectionReason && (
                    <p className="text-[11px] font-normal text-rose-600 mt-0.5 truncate">
                      Alasan: {l.rejectionReason}
                    </p>
                  )}
                </td>
                <td className="py-3 px-3 align-middle">
                  <div className="font-bold text-[#0B241E] truncate" title={l.tenantName}>
                    {l.tenantName}
                  </div>
                  <span className="text-[10px] text-[#64748B] block mt-0.5">
                    {l.operator ? "Operator Kapal" : "Tenant Mitra"}
                  </span>
                </td>
                <td className="py-3 px-3 text-[#475569] align-middle">
                  <div
                    className="font-semibold text-[#0B241E] truncate"
                    title={l.asset?.name || "Kios / Ruangan"}
                  >
                    {l.asset?.name || "Kios / Ruangan"}
                  </div>
                  <div className="text-[11px] text-[#64748B] font-mono truncate mt-0.5">
                    {l.asset?.assetCode} • {l.asset?.areaSqm || "-"} m²
                  </div>
                </td>
                <td className="py-3 px-2.5 text-[#475569] align-middle">
                  <div className="font-mono text-[10.5px] truncate">
                    {new Date(l.startDate).toLocaleDateString("id-ID")} -{" "}
                    {new Date(l.endDate).toLocaleDateString("id-ID")}
                  </div>
                  <div className="font-bold text-[#0B241E] mt-0.5 truncate">
                    Rp {Number(l.totalAnnualAmountIdr).toLocaleString("id-ID")}/thn
                  </div>
                </td>
                <td className="py-3 px-2.5 align-middle text-[11px]">
                  <div
                    className="truncate"
                    title={l.verifiedByRoomOfficer?.fullName || "Menunggu Tahap 1"}
                  >
                    <span className="text-[#64748B]">T1: </span>
                    {l.verifiedByRoomOfficer ? (
                      <span className="text-emerald-700 font-semibold">
                        {l.verifiedByRoomOfficer.fullName}
                      </span>
                    ) : (
                      <span className="text-amber-700 font-semibold">Menunggu</span>
                    )}
                  </div>
                  <div
                    className="truncate mt-0.5"
                    title={l.verifiedByHeadOfPort?.fullName || "Menunggu Tahap 2"}
                  >
                    <span className="text-[#64748B]">T2: </span>
                    {l.verifiedByHeadOfPort ? (
                      <span className="text-emerald-700 font-semibold">
                        {l.verifiedByHeadOfPort.fullName}
                      </span>
                    ) : (
                      <span className="text-blue-700 font-semibold">
                        {l.status === "PENDING_HEAD_OF_PORT" ? "Menunggu Ka.UPT" : "-"}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-2 align-middle">
                  <span
                    className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border inline-block whitespace-nowrap ${
                      VERIFIKASI_STATUS_BADGE[l.status] || "bg-slate-50 text-slate-700"
                    }`}
                  >
                    {l.status === "REQUESTED" || l.status === "PENDING_ROOM_OFFICER"
                      ? "Tahap 1"
                      : l.status === "PENDING_HEAD_OF_PORT"
                      ? "Tahap 2"
                      : l.status === "ACTIVE"
                      ? "Aktif"
                      : l.status === "REJECTED"
                      ? "Ditolak"
                      : l.status}
                  </span>
                </td>
                <td className="py-3 px-3.5 text-right align-middle whitespace-nowrap">
                  <div className="inline-flex items-center justify-end gap-1.5">
                    {(l.status === "REQUESTED" || l.status === "PENDING_ROOM_OFFICER") && (
                      <>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => onVerifyRoomLease(l.id, l.contractNumber)}
                          className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shadow-2xs transition-colors whitespace-nowrap"
                          title="Verifikasi ketersediaan ruangan & terbitkan draft PKS-SWA"
                        >
                          <ShieldCheck className="w-3 h-3 shrink-0" />
                          <span>Verifikasi</span>
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() =>
                            onReject({
                              type: "pks_ruangan",
                              id: l.id,
                              name: l.contractNumber,
                            })
                          }
                          className="px-2 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
                        >
                          <XCircle className="w-3 h-3 shrink-0" />
                          <span>Tolak</span>
                        </button>
                      </>
                    )}

                    {l.status === "PENDING_HEAD_OF_PORT" &&
                      userRole !== "PETUGAS_REGISTRASI_KONTRAK" &&
                      userRole !== "PETUGAS_RUANGAN" && (
                        <>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => onApproveHeadOfPort(l.id, l.contractNumber)}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shadow-2xs transition-colors whitespace-nowrap"
                            title="Pengesahan akhir kontrak PKS oleh Kepala Pelabuhan"
                          >
                            <FileSignature className="w-3 h-3 shrink-0" />
                            <span>Sahkan</span>
                          </button>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() =>
                              onReject({
                                type: "pks_ruangan",
                                id: l.id,
                                name: l.contractNumber,
                              })
                            }
                            className="px-2 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
                          >
                            <XCircle className="w-3 h-3 shrink-0" />
                            <span>Tolak</span>
                          </button>
                        </>
                      )}
                    {l.status === "PENDING_HEAD_OF_PORT" &&
                      (userRole === "PETUGAS_REGISTRASI_KONTRAK" ||
                        userRole === "PETUGAS_RUANGAN") && (
                        <span className="text-[11px] text-blue-700 font-bold">
                          Menunggu Ka. UPT
                        </span>
                      )}

                    {l.status === "ACTIVE" && (
                      <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Sewa Aktif
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
