"use client";

import React, { useEffect } from "react";
import { Zap, Loader2, RefreshCw } from "lucide-react";
import { useTenantStore } from "@/store/tenant.store";
import { formatLabel } from "@/lib/format-labels";

export default function TenantUtilitasPage() {
  const { utilities, isLoading, error, fetchTenantData } = useTenantStore();

  useEffect(() => {
    fetchTenantData();
  }, [fetchTenantData]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0B241E]">
          <Zap className="w-4 h-4 text-[#D97706]" />
          Riwayat Pemakaian Listrik & Air Bersih ({utilities.length})
        </div>
        <button
          type="button"
          onClick={() => fetchTenantData()}
          disabled={isLoading}
          className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B] bg-[#F8FAFC]">
                <th className="py-3 px-4">No. Catatan</th>
                <th className="py-3 px-4">Unit Aset</th>
                <th className="py-3 px-4">Jenis</th>
                <th className="py-3 px-4">Meter Awal → Akhir</th>
                <th className="py-3 px-4">Konsumsi</th>
                <th className="py-3 px-4">Tagihan</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#64748B]">
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Memuat data utilitas...
                  </td>
                </tr>
              ) : utilities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#94A3B8]">
                    Belum ada pencatatan meteran utilitas pada unit sewa Anda.
                  </td>
                </tr>
              ) : (
                utilities.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                      {u.readingNumber}
                    </td>
                    <td className="py-3 px-4">
                      {u.asset?.name || `Aset #${u.assetId ?? "-"}`}
                    </td>
                    <td className="py-3 px-4 font-semibold">{formatLabel(u.utilityType)}</td>
                    <td className="py-3 px-4 font-mono">
                      {u.meterStart} → {u.meterEnd}
                    </td>
                    <td className="py-3 px-4">
                      {u.volumeConsumed} {u.unitLabel}
                    </td>
                    <td className="py-3 px-4 font-bold">
                      Rp {Number(u.totalAmountIdr).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          u.paymentStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {formatLabel(u.paymentStatus)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
