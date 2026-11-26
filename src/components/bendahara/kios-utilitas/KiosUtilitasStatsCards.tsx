"use client";

import { Coins, TrendingUp, Zap, Clock, AlertTriangle } from "lucide-react";

export interface KiosUtilitasStatsCardsProps {
  totalLeaseRevenueIdr: number;
  totalOperationalRevenueIdr: number;
  totalOutstandingOperationalIdr: number;
  totalOutstandingLeaseIdr: number;
}

export function KiosUtilitasStatsCards({
  totalLeaseRevenueIdr,
  totalOperationalRevenueIdr,
  totalOutstandingOperationalIdr,
  totalOutstandingLeaseIdr,
}: KiosUtilitasStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Realisasi Kasda Sewa Kios */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Realisasi Sewa Kios BMD
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-[#0B241E]">
            Rp {totalLeaseRevenueIdr.toLocaleString("id-ID")}
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 inline" />
            Sewa lahan, kios & gedung pelabuhan
          </p>
        </div>
      </div>

      {/* Card 2: Realisasi Kasda Utilitas & Operasional */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Realisasi Utilitas & Operasional
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-blue-700">
            Rp {totalOperationalRevenueIdr.toLocaleString("id-ID")}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Air bersih, listrik, kargo & alat
          </p>
        </div>
      </div>

      {/* Card 3: Piutang Operasional (Belum Disetor) */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Piutang Operasional Berjalan
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-amber-600">
            Rp {totalOutstandingOperationalIdr.toLocaleString("id-ID")}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Menunggu pembayaran kasir/loket
          </p>
        </div>
      </div>

      {/* Card 4: Piutang Sewa Tenant */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Piutang Sewa Tenant
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-rose-600">
            Rp {totalOutstandingLeaseIdr.toLocaleString("id-ID")}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Kontrak sewa belum diselesaikan
          </p>
        </div>
      </div>
    </div>
  );
}
