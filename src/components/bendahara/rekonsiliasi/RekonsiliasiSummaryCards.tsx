"use client";

import { CheckCircle2, ShieldCheck } from "lucide-react";
import { formatRupiah } from "@/lib/kapal-billing";

export interface RekonsiliasiSummaryCardsProps {
  gateTotal: number;
  settledHandoversCount: number;
  vesselTotal: number;
  otherRevenueTotal: number;
}

export function RekonsiliasiSummaryCards({
  gateTotal,
  settledHandoversCount,
  vesselTotal,
  otherRevenueTotal,
}: RekonsiliasiSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Pos 1: Kas Loket & Pas Gerbang */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold text-[#64748B] uppercase">
            1. Kas Loket &amp; Pas Gerbang
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <p className="text-xl font-black text-[#0B241E]">
          {formatRupiah(gateTotal)}
        </p>
        <p className="text-[11px] text-[#64748B]">
          Uang fisik tiket gerbang &amp; pas pelabuhan
        </p>
        <div className="pt-2 border-t border-[#F1F5F9] text-[10px] font-mono text-emerald-700 font-bold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{settledHandoversCount} Sesi Terbuku Kasda</span>
        </div>
      </div>

      {/* Pos 2: Transfer Bank RKUD (e-SKRD/e-SSRD) */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold text-[#64748B] uppercase">
            2. Transfer Bank Papua (RKUD)
          </span>
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        </div>
        <p className="text-xl font-black text-blue-900">
          {formatRupiah(vesselTotal)}
        </p>
        <p className="text-[11px] text-[#64748B]">
          Retribusi jasa tambat &amp; labuh kapal
        </p>
        <div className="pt-2 border-t border-[#F1F5F9] text-[10px] font-mono text-blue-700 font-bold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Host-to-Host Mutasi Sah</span>
        </div>
      </div>

      {/* Pos 3: Penerimaan Lain (Tenant, Kargo, Air) */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold text-[#64748B] uppercase">
            3. Tenant, Kargo &amp; Utilitas
          </span>
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
        </div>
        <p className="text-xl font-black text-purple-900">
          {formatRupiah(otherRevenueTotal)}
        </p>
        <p className="text-[11px] text-[#64748B]">
          Sewa kios, pemakaian alat, &amp; air tawar
        </p>
        <div className="pt-2 border-t border-[#F1F5F9] text-[10px] font-mono text-purple-700 font-bold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Penerimaan Sah Kasda</span>
        </div>
      </div>
    </div>
  );
}
