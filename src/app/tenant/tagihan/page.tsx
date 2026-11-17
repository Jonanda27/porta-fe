"use client";

import React, { useEffect } from "react";
import { Receipt, Loader2, RefreshCw } from "lucide-react";
import { useTenantStore } from "@/store/tenant.store";

export default function TenantTagihanPage() {
  const { leases, utilities, isLoading, error, fetchTenantData } =
    useTenantStore();

  useEffect(() => {
    fetchTenantData();
  }, [fetchTenantData]);

  const leasePayments = leases.flatMap((l) =>
    (l.payments || []).map((p) => ({
      ...p,
      contractNumber: l.contractNumber,
      assetName: l.asset?.name || `Aset #${l.assetId}`,
    }))
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0B241E]">
          <Receipt className="w-4 h-4 text-[#D97706]" />
          Tagihan Sewa PKS & Riwayat Pembayaran
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

      {isLoading ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 flex items-center justify-center gap-2 text-xs text-[#64748B]">
          <Loader2 className="w-4 h-4 animate-spin" />
          Memuat tagihan & bukti setor...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#0B241E]">
              Riwayat Pembayaran Sewa Aset Terverifikasi ({leasePayments.length})
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B]">
                  <th className="py-3 px-4">No. Kontrak</th>
                  <th className="py-3 px-4">Unit Aset</th>
                  <th className="py-3 px-4">Tahun Periode</th>
                  <th className="py-3 px-4">Nominal Dibayar</th>
                  <th className="py-3 px-4">Tanggal Bayar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {leasePayments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                      {p.contractNumber}
                    </td>
                    <td className="py-3 px-4">{p.assetName}</td>
                    <td className="py-3 px-4">{p.periodYear}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      Rp {Number(p.amountIdr).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4 text-[#475569]">
                      {new Date(p.paidAt).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))}
                {leasePayments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#94A3B8]">
                      Belum ada pembayaran sewa yang tercatat oleh Bendahara.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#0B241E]">
              Tagihan Utilitas Listrik & Air ({utilities.length})
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B]">
                  <th className="py-3 px-4">No. Catatan</th>
                  <th className="py-3 px-4">Jenis</th>
                  <th className="py-3 px-4">Tagihan</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {utilities.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 px-4 font-mono font-bold">
                      {u.readingNumber}
                    </td>
                    <td className="py-3 px-4">{u.utilityType}</td>
                    <td className="py-3 px-4 font-bold">
                      Rp {Number(u.totalAmountIdr).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.paymentStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {u.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
                {utilities.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#94A3B8]">
                      Belum ada tagihan utilitas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
