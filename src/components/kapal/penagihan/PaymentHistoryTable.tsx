"use client";

import React from "react";
import {
  Anchor,
  Building2,
  CheckCircle2,
  FileText,
  Printer,
  RefreshCw,
} from "lucide-react";
import { BillingInvoice, UnifiedPaidRecord } from "@/types/billing.types";
import { formatRupiah } from "@/lib/kapal-billing";

export interface PaymentHistoryTableProps {
  isLoading: boolean;
  totalPaidCount: number;
  unifiedPaidRecords: UnifiedPaidRecord[];
  onOpenInvoiceSsrd: (invoice: BillingInvoice) => void;
  onOpenLeaseSsrd: (paymentId: number) => void;
}

export function PaymentHistoryTable({
  isLoading,
  totalPaidCount,
  unifiedPaidRecords,
  onOpenInvoiceSsrd,
  onOpenLeaseSsrd,
}: PaymentHistoryTableProps) {
  return (
    <div className="bg-white border border-[#CBD5E1] rounded-2xl overflow-hidden shadow-xs min-h-[280px] flex flex-col">
      {isLoading && totalPaidCount === 0 ? (
        <div className="p-10 text-center space-y-3 my-auto">
          <RefreshCw className="w-8 h-8 text-[#0B241E] animate-spin mx-auto" />
          <p className="text-xs text-[#64748B]">Memuat riwayat e-SSRD dari server...</p>
        </div>
      ) : unifiedPaidRecords.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#64748B] space-y-2 my-auto">
          <FileText className="w-10 h-10 text-[#94A3B8] mx-auto" />
          <p className="font-bold text-[#0B241E] text-sm">Belum ada riwayat transaksi lunas.</p>
          <p>
            Tagihan Pengajuan Dermaga maupun Pengajuan Ruangan yang telah lunas akan tercantum di
            sini.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                <th className="py-3.5 px-5">No. SKRD &amp; e-SSRD</th>
                <th className="py-3.5 px-4">Objek &amp; Referensi</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4 text-right">Nilai &amp; Status</th>
                <th className="py-3.5 px-5 text-right">Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {unifiedPaidRecords.map((record) => {
                if (record.kind === "DERMAGA") {
                  const inv = record.invoice;
                  const vesselName = inv.visit?.vessel?.name || "Kapal Niaga";
                  const gt = inv.visit?.vessel?.grossTonnage || 0;
                  const issuedDate = new Date(inv.issuedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <tr
                      key={`paid-dermaga-${inv.id}`}
                      className="hover:bg-[#F8FAFC]/80 transition-colors"
                    >
                      <td className="py-4 px-5 align-top">
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-50 text-sky-900 border border-sky-200 mb-1.5">
                          <Anchor className="w-3 h-3" />
                          Dermaga
                        </span>
                        <p className="font-mono font-bold text-[#0B241E] text-xs break-all">
                          {inv.invoiceNumber}
                        </p>
                        <p className="font-mono text-[10.5px] text-emerald-700 font-semibold mt-0.5 break-all">
                          {inv.ssrdNumber || `SSRD-PMK-${inv.id}`}
                        </p>
                      </td>

                      <td className="py-4 px-4 align-top">
                        <p className="font-extrabold text-[#0B241E] text-xs">
                          {vesselName}{" "}
                          <span className="font-mono font-semibold text-[#64748B] text-[11px]">
                            ({Number(gt).toLocaleString()} GT)
                          </span>
                        </p>
                        <p className="font-mono text-[11px] text-[#475569] mt-1 break-all">
                          {inv.visit?.visitNumber || `VISIT-#${inv.visitId}`}
                        </p>
                        <p className="text-[10.5px] text-[#94A3B8] mt-0.5">
                          Pelabuhan Poumako
                        </p>
                      </td>

                      <td className="py-4 px-4 align-top font-mono text-xs text-[#475569] whitespace-nowrap">
                        {issuedDate}
                      </td>

                      <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                        <p className="font-mono text-sm font-extrabold text-emerald-800">
                          {formatRupiah(inv.totalAmountIdr)}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 mt-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          Lunas RKUD
                        </span>
                      </td>

                      <td className="py-4 px-5 align-middle text-right whitespace-nowrap">
                        <button
                          onClick={() => onOpenInvoiceSsrd(inv)}
                          className="px-3.5 py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#0B241E] hover:text-white text-[#0B241E] text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 shrink-0" />
                          <span>e-SSRD</span>
                        </button>
                      </td>
                    </tr>
                  );
                }

                const { lease, payment } = record;
                const paidDate = new Date(payment.paidAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                const ssrdLabel = `SSRD-PKS-${payment.periodYear}-${String(payment.id).padStart(6, "0")}`;

                return (
                  <tr
                    key={`paid-ruangan-${payment.id}`}
                    className="hover:bg-[#F8FAFC]/80 transition-colors"
                  >
                    <td className="py-4 px-5 align-top">
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-violet-50 text-violet-900 border border-violet-200 mb-1.5">
                        <Building2 className="w-3 h-3" />
                        Ruangan
                      </span>
                      <p className="font-mono font-bold text-[#0B241E] text-xs break-all">
                        {lease.contractNumber}
                      </p>
                      <p className="font-mono text-[10.5px] text-emerald-700 font-semibold mt-0.5 break-all">
                        {ssrdLabel}
                      </p>
                    </td>

                    <td className="py-4 px-4 align-top">
                      <p className="font-extrabold text-[#0B241E] text-xs">
                        {lease.asset?.name || `Aset #${lease.assetId}`}
                      </p>
                      <p className="text-[11px] text-[#475569] font-mono mt-1">
                        {lease.asset?.assetCode} ({Number(lease.asset?.areaSqm || 0)} m²)
                      </p>
                      <p className="text-[10.5px] text-[#94A3B8] mt-0.5">
                        Sewa Aset BMD (Tahun {payment.periodYear})
                      </p>
                    </td>

                    <td className="py-4 px-4 align-top font-mono text-xs text-[#475569] whitespace-nowrap">
                      {paidDate}
                    </td>

                    <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                      <p className="font-mono text-sm font-extrabold text-emerald-800">
                        {formatRupiah(payment.amountIdr)}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 mt-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        Lunas RKUD
                      </span>
                    </td>

                    <td className="py-4 px-5 align-middle text-right whitespace-nowrap">
                      <button
                        onClick={() => onOpenLeaseSsrd(payment.id)}
                        className="px-3.5 py-2 rounded-xl bg-violet-50 hover:bg-[#0B241E] hover:text-white text-violet-900 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 shrink-0" />
                        <span>e-SSRD</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
