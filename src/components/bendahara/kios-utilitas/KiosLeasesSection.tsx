"use client";

import { Search, Store, CheckCircle2, Coins, Printer } from "lucide-react";
import { AssetLease } from "@/types/asset.types";
import { getDaysRemaining, getPaymentSummary } from "./lease-utils";

export type LeaseFilterType = "ALL" | "ACTIVE" | "EXPIRING" | "CRITICAL";

export interface KiosLeasesSectionProps {
  leases: AssetLease[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  leaseFilter: LeaseFilterType;
  onLeaseFilterChange: (filter: LeaseFilterType) => void;
  onOpenPaymentModal: (lease: AssetLease) => void;
  onViewLeaseReceipt: (paymentId: number) => void;
}

export function KiosLeasesSection({
  leases,
  searchQuery,
  onSearchChange,
  leaseFilter,
  onLeaseFilterChange,
  onOpenPaymentModal,
  onViewLeaseReceipt,
}: KiosLeasesSectionProps) {
  const filteredLeases = leases.filter((lease) => {
    const matchesSearch =
      lease.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lease.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lease.asset?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const days = getDaysRemaining(lease.endDate);
    const { remaining } = getPaymentSummary(lease);

    if (leaseFilter === "ACTIVE") return lease.status === "ACTIVE";
    if (leaseFilter === "EXPIRING") return days <= 45 && days > 0;
    if (leaseFilter === "CRITICAL") return days <= 0 || remaining > 0;
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor PKS, nama tenant, atau aset..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0B241E] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs text-gray-400 font-medium">Filter:</span>
          <button
            onClick={() => onLeaseFilterChange("ALL")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              leaseFilter === "ALL"
                ? "bg-[#0B241E] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Semua ({leases.length})
          </button>
          <button
            onClick={() => onLeaseFilterChange("ACTIVE")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              leaseFilter === "ACTIVE"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            Aktif
          </button>
          <button
            onClick={() => onLeaseFilterChange("EXPIRING")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              leaseFilter === "EXPIRING"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            Jatuh Tempo &lt; 45 Hari
          </button>
          <button
            onClick={() => onLeaseFilterChange("CRITICAL")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              leaseFilter === "CRITICAL"
                ? "bg-rose-600 text-white"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            Ada Piutang
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAFBFB] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
            <tr>
              <th className="py-3 px-4">Nomor PKS & Tenant</th>
              <th className="py-3 px-4">Objek Retribusi Aset</th>
              <th className="py-3 px-4">Masa Kontrak Sewa</th>
              <th className="py-3 px-4">Nilai Sewa (Tahun)</th>
              <th className="py-3 px-4">Realisasi Setoran</th>
              <th className="py-3 px-4">Status & Sisa</th>
              <th className="py-3 px-4 text-center">Aksi Bendahara</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {filteredLeases.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  Tidak ada kontrak sewa tenant yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              filteredLeases.map((lease) => {
                const daysRemaining = getDaysRemaining(lease.endDate);
                const { totalDue, totalPaid, remaining, isPaidOff } = getPaymentSummary(lease);

                return (
                  <tr key={lease.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0B241E] flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-[#D97706]" />
                        {lease.contractNumber}
                      </div>
                      <div className="font-medium text-gray-800 mt-0.5">
                        {lease.tenantName}
                      </div>
                      {lease.tenantPhone && (
                        <div className="text-[11px] text-gray-400">
                          Telp: {lease.tenantPhone}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">
                        {lease.asset?.name || "Aset Pelabuhan"}
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                          {lease.asset?.assetCode}
                        </span>
                        <span>Luas: {Number(lease.asset?.areaSqm || 0)} m²</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-gray-900 font-medium">
                        {lease.startDate} s.d. {lease.endDate}
                      </div>
                      <div className="mt-0.5">
                        {daysRemaining > 0 ? (
                          <span
                            className={`text-[11px] font-semibold ${
                              daysRemaining < 30
                                ? "text-rose-600"
                                : daysRemaining < 60
                                ? "text-amber-600"
                                : "text-emerald-600"
                            }`}
                          >
                            Sisa {daysRemaining} hari lagi
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-rose-600">
                            Sudah Habis Tempo
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      Rp {totalDue.toLocaleString("id-ID")}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-emerald-700">
                        Rp {totalPaid.toLocaleString("id-ID")}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {lease.payments?.length || 0} kali transaksi
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {isPaidOff ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Lunas 100%
                        </span>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Piutang Rp {remaining.toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => onOpenPaymentModal(lease)}
                          className="px-3 py-1.5 bg-[#0B241E] hover:bg-[#133D31] text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                          title="Catat Pembayaran Kasda"
                        >
                          <Coins className="w-3.5 h-3.5 text-[#D97706]" />
                          Bayar
                        </button>
                        {lease.payments && lease.payments.length > 0 && (
                          <button
                            onClick={() =>
                              onViewLeaseReceipt(
                                lease.payments![lease.payments!.length - 1].id
                              )
                            }
                            className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                            title={`Cetak Kuitansi e-SSRD Kasda (${lease.payments.length} transaksi)`}
                          >
                            <Printer className="w-3.5 h-3.5 text-gray-600" />
                            e-SSRD
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
