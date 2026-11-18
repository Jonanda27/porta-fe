"use client";

import React, { useEffect, useState } from "react";
import {
  Receipt,
  Loader2,
  RefreshCw,
  CreditCard,
  AlertCircle,
  Search,
} from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";
import { useTenantStore } from "@/store/tenant.store";
import { usePaymentStore } from "@/store/payment.store";
import { formatLabel } from "@/lib/format-labels";

export default function TenantTagihanPage() {
  const { leases, utilities, isLoading, error, fetchTenantData } =
    useTenantStore();
  const {
    config: paymentConfig,
    isUpdating: isPaying,
    error: paymentError,
    fetchConfig: fetchPaymentConfig,
    checkout,
  } = usePaymentStore();

  const [checkoutInfo, setCheckoutInfo] = useState<string | null>(null);
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentItemsPerPage, setPaymentItemsPerPage] = useState(5);
  const [utilityPage, setUtilityPage] = useState(1);
  const [utilityItemsPerPage, setUtilityItemsPerPage] = useState(5);

  useEffect(() => {
    fetchTenantData();
    fetchPaymentConfig();
  }, [fetchTenantData, fetchPaymentConfig]);

  const showMidtransButton =
    Boolean(paymentConfig?.gatewayEnabled) &&
    paymentConfig?.provider === "MIDTRANS";

  const handlePayOnline = async (
    targetType: "ASSET_LEASE" | "UTILITY_READING",
    targetId: number
  ) => {
    setCheckoutInfo(null);
    const res = await checkout({ targetType, targetId });
    setCheckoutInfo(
      `Sesi pembayaran ${res.orderId} siap (Rp ${res.amountIdr.toLocaleString("id-ID")}).`
    );
    if (res.redirectUrl) {
      window.open(res.redirectUrl, "_blank", "noopener,noreferrer");
    }
  };

  const activeUnpaidLeases = leases.filter((l) => {
    if (l.status !== "ACTIVE") return false;
    const paid = (l.payments || []).reduce(
      (s, p) => s + Number(p.amountIdr),
      0
    );
    return Number(l.totalAnnualAmountIdr) - paid > 0;
  });

  const leasePayments = leases.flatMap((l) =>
    (l.payments || []).map((p) => ({
      ...p,
      contractNumber: l.contractNumber,
      assetName: l.asset?.name || `Aset #${l.assetId}`,
    }))
  );

  const totalPaymentPages = Math.ceil(leasePayments.length / paymentItemsPerPage) || 1;
  const pagedLeasePayments = leasePayments.slice(
    (paymentPage - 1) * paymentItemsPerPage,
    paymentPage * paymentItemsPerPage
  );

  const totalUtilityPages = Math.ceil(utilities.length / utilityItemsPerPage) || 1;
  const pagedUtilities = utilities.slice(
    (utilityPage - 1) * utilityItemsPerPage,
    utilityPage * utilityItemsPerPage
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
          onClick={() => {
            fetchTenantData();
            fetchPaymentConfig();
          }}
          disabled={isLoading}
          className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {paymentConfig && !showMidtransButton && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold">
          Pembayaran dilakukan melalui transfer resmi Bank Papua (RKUD) atau loket Bendahara Pelabuhan.
        </div>
      )}

      {checkoutInfo && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          {checkoutInfo}
        </div>
      )}

      {(error || paymentError) && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error || paymentError}</span>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 flex items-center justify-center gap-2 text-xs text-[#64748B]">
          <Loader2 className="w-4 h-4 animate-spin" />
          Memuat tagihan & bukti setor...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Lease Bills */}
          {activeUnpaidLeases.length > 0 && (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
              <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#0B241E]">
                Tagihan Kontrak Sewa Aktif ({activeUnpaidLeases.length})
              </div>
              <div className="divide-y divide-[#F1F5F9]">
                {activeUnpaidLeases.map((l) => (
                  <div
                    key={l.id}
                    className="p-4 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-[#0B241E]">
                        {l.contractNumber} — {l.asset?.name}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Total Tahunan: Rp{" "}
                        {Number(l.totalAnnualAmountIdr).toLocaleString("id-ID")}
                      </div>
                    </div>
                    {showMidtransButton && (
                      <button
                        type="button"
                        disabled={isPaying}
                        onClick={() => handlePayOnline("ASSET_LEASE", l.id)}
                        className="px-3.5 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-[#D97706]" />
                        Bayar Online (Midtrans)
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified Payments */}
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
                {pagedLeasePayments.map((p) => (
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
                {pagedLeasePayments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#94A3B8]">
                      Belum ada pembayaran sewa yang tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <TablePagination
              currentPage={paymentPage}
              totalPages={totalPaymentPages}
              totalItems={leasePayments.length}
              itemsPerPage={paymentItemsPerPage}
              onPageChange={setPaymentPage}
              onItemsPerPageChange={setPaymentItemsPerPage}
              itemsPerPageOptions={[5, 10, 20]}
            />
          </div>

          {/* Utility Bills */}
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
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {pagedUtilities.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 px-4 font-mono font-bold">
                      {u.readingNumber}
                    </td>
                    <td className="py-3 px-4">{formatLabel(u.utilityType)}</td>
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
                    <td className="py-3 px-4 text-right">
                      {u.paymentStatus === "UNPAID" && showMidtransButton ? (
                        <button
                          type="button"
                          disabled={isPaying}
                          onClick={() => handlePayOnline("UTILITY_READING", u.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#0B241E] text-white text-[11px] font-bold cursor-pointer"
                        >
                          Bayar Online
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#94A3B8]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {pagedUtilities.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#94A3B8]">
                      Belum ada tagihan utilitas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <TablePagination
              currentPage={utilityPage}
              totalPages={totalUtilityPages}
              totalItems={utilities.length}
              itemsPerPage={utilityItemsPerPage}
              onPageChange={setUtilityPage}
              onItemsPerPageChange={setUtilityItemsPerPage}
              itemsPerPageOptions={[5, 10, 20]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
