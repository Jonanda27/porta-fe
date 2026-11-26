"use client";

import React from "react";
import {
  CreditCard,
  Receipt,
  Clock,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { formatRupiah } from "@/lib/kapal-billing";

export interface PenagihanKpiDeckProps {
  totalUnpaidCount: number;
  totalPaidCount: number;
  totalUnpaid: number;
  totalPaid: number;
  operatorName?: string | null;
}

export function PenagihanKpiDeck({
  totalUnpaidCount,
  totalPaidCount,
  totalUnpaid,
  totalPaid,
  operatorName,
}: PenagihanKpiDeckProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Tagihan Unpaid */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <CreditCard className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full">
            {totalUnpaidCount} e-SKRD Aktif
          </span>
        </div>
        <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
          Tagihan e-SKRD Belum Bayar
        </p>
        <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
          {formatRupiah(totalUnpaid)}
        </p>
        <p className="text-[11px] text-[#64748B] mt-1.5 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Menunggu pelunasan ke RKUD</span>
        </p>
      </div>

      {/* KPI 2: Total Lunas Bulan Ini */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
            {totalPaidCount} Lunas RKUD
          </span>
        </div>
        <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
          Retribusi Terbayar (e-SSRD)
        </p>
        <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
          {formatRupiah(totalPaid)}
        </p>
        <p className="text-[11px] text-[#64748B] mt-1.5 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="text-emerald-700 font-semibold">Kuitansi sah terverifikasi</span>
        </p>
      </div>

      {/* KPI 3: Bank Persepsi Terdaftar */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <Receipt className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-full">
            Kasda Mimika
          </span>
        </div>
        <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
          Bank Persepsi Penerima
        </p>
        <p className="text-base font-extrabold text-[#0B241E] font-mono mt-1">
          Bank Papua (RKUD) & BNI
        </p>
        <p className="text-[11px] text-[#64748B] mt-1.5">
          Host-to-Host Virtual Account Aktif
        </p>
      </div>

      {/* KPI 4: Kepatuhan Retribusi */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            Prioritas Sandar
          </span>
        </div>
        <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
          Kepatuhan Pelabuhan
        </p>
        <p className="text-xl font-extrabold text-emerald-700 font-mono mt-1">
          {totalUnpaidCount === 0 ? "Bebas Tunggakan" : "Tertib Administrasi"}
        </p>
        <p className="text-[11px] text-[#64748B] mt-1.5">
          Operator: {operatorName || "PT Pelayaran Mimika Sejahtera"}
        </p>
      </div>
    </div>
  );
}
