"use client";

import React, { useEffect, useState } from "react";
import { Zap, Loader2, RefreshCw, Wrench, Droplet, AlertCircle } from "lucide-react";
import { useTenantStore } from "@/store/tenant.store";
import { formatLabel } from "@/lib/format-labels";
import { ReportFacilityIssueModal } from "@/components/tenant/ReportFacilityIssueModal";
import { FacilityIssueCategory } from "@/types/complaint.types";

export default function TenantUtilitasPage() {
  const { utilities, isLoading, error, fetchTenantData } = useTenantStore();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState<FacilityIssueCategory>("AIR_BERSIH");

  useEffect(() => {
    fetchTenantData();
  }, [fetchTenantData]);

  const handleOpenReport = (cat: FacilityIssueCategory) => {
    setReportCategory(cat);
    setIsReportModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0B241E]">
          <Zap className="w-4 h-4 text-[#D97706]" />
          Riwayat Pemakaian Listrik & Air Bersih ({utilities.length})
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenReport("AIR_BERSIH")}
            className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-900 border border-amber-200 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Wrench className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Lapor Kendala Air / Listrik</span>
          </button>
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
      </div>

      {/* Info Banner Pemeliharaan */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0B241E] to-[#143E33] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Droplet className="w-4 h-4 text-[#D97706]" />
          </div>
          <div>
            <h3 className="text-xs font-bold">
              Gangguan Aliran Air atau Korsleting Listrik Kios?
            </h3>
            <p className="text-[11px] text-[#BED2CA]">
              Petugas UPTD siap melakukan perbaikan pipa dan meteran listrik kios dalam 1x24 jam kerja.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleOpenReport("AIR_BERSIH")}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/20 cursor-pointer"
          >
            Pipa Air Bocor
          </button>
          <button
            type="button"
            onClick={() => handleOpenReport("LISTRIK")}
            className="px-3 py-1.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-xs font-bold text-white cursor-pointer shadow-2xs"
          >
            Listrik Padam
          </button>
        </div>
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

      {/* Modal Lapor Kendala Fasilitas */}
      <ReportFacilityIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        defaultCategory={reportCategory}
      />
    </div>
  );
}
