"use client";

import React from "react";
import Link from "next/link";
import { Anchor, CreditCard, QrCode, Scale, Ship } from "lucide-react";
import { BillingInvoice, InvoiceItem } from "@/types/billing.types";
import { formatRupiah } from "@/lib/kapal-billing";
import { formatLabel } from "@/lib/format-labels";

export interface UnpaidInvoiceCardProps {
  invoice: BillingInvoice;
  onOpenPayment: (invoice: BillingInvoice, defaultTab: "gateway" | "manual") => void;
}

export function UnpaidInvoiceCard({
  invoice: inv,
  onOpenPayment,
}: UnpaidInvoiceCardProps) {
  const vesselName = inv.visit?.vessel?.name || "Kapal Niaga";
  const grossTonnage = inv.visit?.vessel?.grossTonnage || 0;
  const dueDateFormatted = inv.dueDate
    ? new Date(inv.dueDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Segera";

  const isDraft = inv.status === "DRAFT";

  return (
    <div className="bg-white border border-[#CBD5E1] border-l-4 border-l-[#D97706] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#F1F5F9] pb-4">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-900 border border-sky-200">
              <Anchor className="w-3 h-3" />
              Pengajuan Dermaga
            </span>
            <span className="font-mono text-xs font-bold text-[#0B241E] bg-[#F8FAFC] border border-[#CBD5E1] px-2.5 py-0.5 rounded-md">
              {inv.invoiceNumber}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {inv.billingStage === "ADVANCE_SKRD"
                ? "Uang Muka"
                : "SKRD Rampung"}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {inv.status === "ISSUED"
                ? "Menunggu Pembayaran"
                : formatLabel(inv.status)}
            </span>
          </div>

          <h3 className="font-extrabold text-base text-[#0B241E] flex items-center gap-2">
            <Ship className="w-4 h-4 text-[#D97706] shrink-0" />
            <span>
              {vesselName}{" "}
              <span className="text-xs font-mono font-semibold text-[#64748B]">
                ({Number(grossTonnage).toLocaleString()} GT)
              </span>
            </span>
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#64748B]">
            <span>
              Kunjungan:{" "}
              <strong className="font-mono text-[#334155]">
                {inv.visit?.visitNumber || `VISIT-#${inv.visitId}`}
              </strong>
            </span>
            <span>
              Pelabuhan:{" "}
              <strong className="text-[#334155]">Pelabuhan Poumako</strong>
            </span>
            <span>
              Jatuh Tempo:{" "}
              <strong className="text-[#0B241E]">{dueDateFormatted}</strong>
            </span>
          </div>
        </div>

        <div className="sm:text-right shrink-0 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5">
          <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
            Total Tagihan
          </span>
          <p className="font-mono text-xl font-black text-[#0B241E] mt-0.5">
            {formatRupiah(inv.totalAmountIdr)}
          </p>
        </div>
      </div>

      {/* Rincian Komponen Biaya Berdasarkan Items Backend */}
      <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] space-y-2 text-xs">
        <p className="text-[11px] font-bold text-[#0B241E] uppercase tracking-wide flex items-center gap-1.5">
          <Anchor className="w-3.5 h-3.5 text-[#0B241E]" />
          <span>Rincian Pungutan Sesuai Perbup Mimika No. 25/2024 & Perda No. 4/2023:</span>
        </p>

        {inv.items && inv.items.length > 0 ? (
          <div className="space-y-1.5 divide-y divide-[#E2E8F0]/60">
            {inv.items.map((item: InvoiceItem) => (
              <div key={item.id} className="pt-1.5 flex justify-between text-[#64748B]">
                <div>
                  <span className="font-semibold text-[#0B241E]">{item.description}</span>
                  {item.formulaNote && (
                    <p className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                      {item.formulaNote}
                    </p>
                  )}
                </div>
                <span className="font-mono font-bold text-[#0B241E] shrink-0">
                  {formatRupiah(item.subtotalIdr)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="pt-1.5 flex justify-between text-xs text-[#64748B]">
            <span className="font-semibold text-[#0B241E]">
              Ketetapan Retribusi Kepelabuhanan
            </span>
            <span className="font-mono font-bold text-[#0B241E]">
              {formatRupiah(inv.totalAmountIdr)}
            </span>
          </div>
        )}
      </div>

      {/* Action CTA */}
      <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-end gap-2 flex-wrap">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href="/kapal/keberatan"
            className="w-full sm:w-auto px-4 py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0B241E] text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            title="Ajukan penundaan atau angsuran e-SKRD sesuai Perbup 25/2024"
          >
            <Scale className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Ajukan Keringanan</span>
          </Link>

          <button
            type="button"
            onClick={() => onOpenPayment(inv, "gateway")}
            disabled={isDraft}
            className={`w-full sm:w-auto px-5 py-2.5 text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 ${
              isDraft
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-[#0B241E] hover:bg-[#143E33] text-white cursor-pointer"
            }`}
            title={
              isDraft
                ? "e-SKRD masih berstatus Draf. Menunggu pengesahan Bendahara menjadi ISSUED sebelum dapat dibayar."
                : "Bayar tagihan e-SKRD melalui Midtrans atau Transfer RKUD"
            }
          >
            <CreditCard className={`w-4 h-4 ${isDraft ? "text-slate-400" : "text-[#D97706]"}`} />
            <span>{isDraft ? "Menunggu Terbit (Draf)" : "Bayar Tagihan"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
