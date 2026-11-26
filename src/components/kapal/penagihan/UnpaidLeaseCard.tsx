"use client";

import React from "react";
import Link from "next/link";
import { Building2, CreditCard, FileText, QrCode, Store } from "lucide-react";
import { UnpaidLeaseSummary } from "@/types/billing.types";
import { formatRupiah } from "@/lib/kapal-billing";
import { formatLabel } from "@/lib/format-labels";

export interface UnpaidLeaseCardProps {
  item: UnpaidLeaseSummary;
  onOpenLeasePayment: (
    item: UnpaidLeaseSummary,
    defaultTab: "gateway" | "manual"
  ) => void;
}

export function UnpaidLeaseCard({
  item,
  onOpenLeasePayment,
}: UnpaidLeaseCardProps) {
  const { lease, totalDue, totalPaid, remaining } = item;
  const areaSqm = Number(lease.asset?.areaSqm || 0);
  const ratePerSqm = Number(lease.asset?.annualRatePerSqmIdr || 0);

  return (
    <div className="bg-white border-2 border-violet-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-900 border border-violet-200">
              <Building2 className="w-3 h-3" />
              Pengajuan Ruangan
            </span>
            <span className="font-mono text-xs font-bold text-violet-900 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded">
              {lease.contractNumber}
            </span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              PKS {lease.status}
            </span>
            <h3 className="font-extrabold text-sm text-[#0B241E] flex items-center gap-1.5">
              <Store className="w-4 h-4 text-[#D97706]" />
              <span>{lease.asset?.name || `Aset #${lease.assetId}`}</span>
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#64748B] mt-1.5">
            <span>
              Kode Aset:{" "}
              <strong className="font-mono text-[#334155]">
                {lease.asset?.assetCode || "-"}
              </strong>
            </span>
            <span>
              Tipe:{" "}
              <strong className="text-[#334155]">
                {lease.asset?.assetType ? formatLabel(lease.asset.assetType) : "Aset"}
              </strong>
            </span>
            <span>
              Masa Sewa:{" "}
              <strong className="text-[#334155]">
                {new Date(lease.startDate).toLocaleDateString("id-ID")} s.d.{" "}
                {new Date(lease.endDate).toLocaleDateString("id-ID")}
              </strong>
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-[#64748B] block">
            Sisa Tagihan Sewa (e-SKRD)
          </span>
          <p className="font-mono text-xl font-black text-[#0B241E]">
            {formatRupiah(remaining)}
          </p>
          {totalPaid > 0 && (
            <span className="text-[10px] text-emerald-700 font-semibold">
              Terbayar: {formatRupiah(totalPaid)} dari {formatRupiah(totalDue)}
            </span>
          )}
        </div>
      </div>

      {/* Rincian Tarif Retribusi Kekayaan Daerah */}
      <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] space-y-2 text-xs">
        <p className="text-[11px] font-bold text-[#0B241E] uppercase tracking-wide flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-violet-700" />
          <span>Rincian Retribusi Pemanfaatan Kekayaan Daerah (Perda Mimika No. 4/2023):</span>
        </p>
        <div className="space-y-1.5 divide-y divide-[#E2E8F0]/60">
          <div className="pt-1.5 flex justify-between text-[#64748B]">
            <div>
              <span className="font-semibold text-[#0B241E]">
                Sewa {lease.asset?.name || "Ruangan / Aset Pelabuhan"}
              </span>
              <p className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                {areaSqm} m² × {formatRupiah(ratePerSqm)} / m² / tahun (Rekening PAD 4.1.02.02.01)
              </p>
            </div>
            <span className="font-mono font-bold text-[#0B241E] shrink-0">
              {formatRupiah(totalDue)}
            </span>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-end gap-2 flex-wrap">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href="/kapal/kontrak-sewa"
            className="w-full sm:w-auto px-4 py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0B241E] text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-violet-700" />
            <span>Detail PKS</span>
          </Link>

          <button
            type="button"
            onClick={() => onOpenLeasePayment(item, "gateway")}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            title="Bayar tagihan sewa melalui Midtrans atau Setor RKUD / Loket"
          >
            <CreditCard className="w-4 h-4 text-[#D97706]" />
            <span>Bayar Tagihan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
