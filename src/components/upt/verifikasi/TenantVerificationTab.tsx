"use client";

import React from "react";
import { FileText, ShieldCheck, XCircle } from "lucide-react";
import {
  InspectDocsTarget,
  RejectVerifikasiTarget,
  TenantItem,
} from "@/types/upt.types";
import { formatLabel } from "@/lib/format-labels";
import { VERIFIKASI_STATUS_BADGE } from "./verifikasiHelpers";

export interface TenantVerificationTabProps {
  tenants: TenantItem[];
  isSubmitting: boolean;
  onInspectDocs: (target: InspectDocsTarget) => void;
  onApprove: (id: number, name: string) => void;
  onReject: (target: RejectVerifikasiTarget) => void;
}

export function TenantVerificationTab({
  tenants,
  isSubmitting,
  onInspectDocs,
  onApprove,
  onReject,
}: TenantVerificationTabProps) {
  return (
    <div className="w-full overflow-x-hidden">
      <table className="w-full text-left border-collapse table-fixed">
        <thead>
          <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] bg-[#F8FAFC]">
            <th className="py-3 px-3.5 w-[22%]">Nama Usaha / Tenant</th>
            <th className="py-3 px-3 w-[19%]">NIB / NPWP</th>
            <th className="py-3 px-3 w-[18%]">Kontak</th>
            <th className="py-3 px-2.5 w-[12%]">Dokumen</th>
            <th className="py-3 px-2.5 w-[11%]">Status</th>
            <th className="py-3 px-3.5 text-right w-[18%]">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F1F5F9] text-xs">
          {tenants.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-10 text-center text-[#94A3B8]">
                Belum ada data tenant mitra untuk filter ini.
              </td>
            </tr>
          ) : (
            tenants.map((t) => {
              const hasTenantDocs = (t.documents?.length ?? 0) > 0;
              return (
                <tr key={t.id} className="hover:bg-[#F8FAFC]">
                  <td className="py-3 px-3.5 font-bold text-[#0B241E] align-middle">
                    <div className="truncate" title={t.name}>
                      {t.name}
                    </div>
                    {t.rejectionReason && (
                      <p className="text-[11px] font-normal text-rose-600 mt-0.5 truncate">
                        Alasan: {t.rejectionReason}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-3 text-[#475569] font-mono text-[11px] align-middle">
                    <div className="truncate">NIB: {t.nib || "-"}</div>
                    <div className="text-[#64748B] truncate">NPWP: {t.npwp || "-"}</div>
                  </td>
                  <td className="py-3 px-3 text-[#475569] align-middle">
                    <div className="truncate">{t.email || "-"}</div>
                    <div className="text-[11px] text-[#64748B] truncate">
                      {t.phone || "-"}
                    </div>
                  </td>
                  <td className="py-3 px-2.5 align-middle">
                    <button
                      type="button"
                      onClick={() =>
                        onInspectDocs({
                          title: `Dokumen Usaha Tenant — ${t.name}`,
                          subtitle: `NIB: ${t.nib || "-"} • NPWP: ${t.npwp || "-"}`,
                          docs: t.documents || [],
                        })
                      }
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                        hasTenantDocs
                          ? "border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#0B241E] text-[#0B241E] hover:text-white"
                          : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                      }`}
                    >
                      <FileText className="w-3 h-3 text-[#D97706] shrink-0" />
                      <span>{t.documents?.length ?? 0} Berkas</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-2.5 align-middle">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                        VERIFIKASI_STATUS_BADGE[t.verificationStatus] ||
                        "bg-slate-50 text-slate-700"
                      }`}
                    >
                      {formatLabel(t.verificationStatus)}
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 text-right align-middle whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      {t.verificationStatus !== "VERIFIED" && (
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => onApprove(t.id, t.name)}
                          className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <ShieldCheck className="w-3 h-3 shrink-0" />
                          <span>Verifikasi</span>
                        </button>
                      )}
                      {t.verificationStatus !== "REJECTED" && (
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() =>
                            onReject({ type: "tenants", id: t.id, name: t.name })
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
