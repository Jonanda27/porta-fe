"use client";

import { Droplets, Zap, CheckCircle2, Clock, Coins, Printer } from "lucide-react";
import { UtilityMeterReading } from "@/types/cargo-utility.types";
import { OperationalPayModalState } from "./OperationalPaymentModal";
import { OperationalFilterBar, OperationalFilterType } from "./OperationalFilterBar";

export interface UtilityBillingSectionProps {
  utilities: UtilityMeterReading[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  operationalFilter: OperationalFilterType;
  onOperationalFilterChange: (filter: OperationalFilterType) => void;
  onOpenPayModal: (modalState: OperationalPayModalState) => void;
  onViewUtilityReceipt: (id: number) => void;
}

export function UtilityBillingSection({
  utilities,
  searchQuery,
  onSearchChange,
  operationalFilter,
  onOperationalFilterChange,
  onOpenPayModal,
  onViewUtilityReceipt,
}: UtilityBillingSectionProps) {
  const filteredUtilities = utilities.filter((u) => {
    const matchesSearch =
      u.readingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.utilityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.asset?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.visit?.vessel?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (operationalFilter === "UNPAID") return u.paymentStatus === "UNPAID";
    if (operationalFilter === "PAID") return u.paymentStatus === "PAID";
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
      <OperationalFilterBar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Cari nomor meteran, fasilitas, atau kapal..."
        filterLabel="Status Setoran:"
        totalCount={utilities.length}
        operationalFilter={operationalFilter}
        onOperationalFilterChange={onOperationalFilterChange}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAFBFB] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
            <tr>
              <th className="py-3 px-4">No. Bukti & Jenis</th>
              <th className="py-3 px-4">Fasilitas / Kapal Objek</th>
              <th className="py-3 px-4">Pencatatan Meteran</th>
              <th className="py-3 px-4">Volume Terpakai</th>
              <th className="py-3 px-4">Tarif Satuan</th>
              <th className="py-3 px-4">Total Tagihan</th>
              <th className="py-3 px-4">Status Kasda</th>
              <th className="py-3 px-4 text-center">Aksi Bendahara</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {filteredUtilities.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400">
                  Tidak ada pencatatan utilitas yang cocok dengan kriteria.
                </td>
              </tr>
            ) : (
              filteredUtilities.map((u) => {
                const isPaid = u.paymentStatus === "PAID";
                return (
                  <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0B241E] flex items-center gap-1.5 font-mono">
                        {u.utilityType === "AIR_BERSIH" ? (
                          <Droplets className="w-3.5 h-3.5 text-blue-500" />
                        ) : (
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        {u.readingNumber}
                      </div>
                      <div className="text-[11px] text-gray-500 font-semibold mt-0.5">
                        {u.utilityType === "AIR_BERSIH" ? "Air Bersih Kapal/Tenant" : "Energi Listrik Dermaga"}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">
                        {u.asset?.name || u.visit?.vessel?.name || "Fasilitas Pelabuhan Poumako"}
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                        {u.asset?.assetCode || u.visit?.visitNumber || "Umum"}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-gray-700">
                      <div>Awal: {Number(u.meterStart).toLocaleString("id-ID")}</div>
                      <div>Akhir: {Number(u.meterEnd).toLocaleString("id-ID")}</div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {Number(u.volumeConsumed).toLocaleString("id-ID")} {u.unitLabel}
                    </td>

                    <td className="py-3 px-4 font-mono text-gray-700">
                      Rp {Number(u.ratePerUnitIdr).toLocaleString("id-ID")} / {u.unitLabel}
                    </td>

                    <td className="py-3 px-4 font-mono font-black text-[#0B241E]">
                      Rp {Number(u.totalAmountIdr).toLocaleString("id-ID")}
                    </td>

                    <td className="py-3 px-4">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Lunas Kasda
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" />
                          Belum Bayar
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {!isPaid ? (
                          <button
                            onClick={() =>
                              onOpenPayModal({
                                isOpen: true,
                                type: "UTILITY",
                                id: u.id,
                                title: "Retribusi Utilitas Dermaga",
                                identifierNumber: u.readingNumber,
                                amountIdr: Number(u.totalAmountIdr),
                                payerLabel: u.asset?.name || u.visit?.vessel?.name || "Pemakai Jasa Dermaga",
                              })
                            }
                            className="px-3 py-1.5 bg-[#0B241E] hover:bg-[#133D31] text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <Coins className="w-3.5 h-3.5 text-[#D97706]" />
                            Setor Kasda
                          </button>
                        ) : (
                          <button
                            onClick={() => onViewUtilityReceipt(u.id)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                            title="Lihat Kuitansi e-SSRD"
                          >
                            <Printer className="w-3.5 h-3.5 text-gray-600" />
                            Cetak e-SSRD
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
