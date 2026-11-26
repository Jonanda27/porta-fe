"use client";

import { Boxes, CheckCircle2, Clock, Coins } from "lucide-react";
import { CargoHandlingRecord } from "@/types/cargo-utility.types";
import { OperationalPayModalState } from "./OperationalPaymentModal";
import { OperationalFilterBar, OperationalFilterType } from "./OperationalFilterBar";

export interface CargoRevenueSectionProps {
  cargoRecords: CargoHandlingRecord[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  operationalFilter: OperationalFilterType;
  onOperationalFilterChange: (filter: OperationalFilterType) => void;
  onOpenPayModal: (modalState: OperationalPayModalState) => void;
}

export function CargoRevenueSection({
  cargoRecords,
  searchQuery,
  onSearchChange,
  operationalFilter,
  onOperationalFilterChange,
  onOpenPayModal,
}: CargoRevenueSectionProps) {
  const filteredCargo = cargoRecords.filter((c) => {
    const matchesSearch =
      c.recordNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.cargoCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.visit?.vessel?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (operationalFilter === "UNPAID") return c.paymentStatus === "UNPAID";
    if (operationalFilter === "PAID") return c.paymentStatus === "PAID";
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
      <OperationalFilterBar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Cari nomor registrasi, kargo, atau kapal..."
        filterLabel="Status Kasda:"
        totalCount={cargoRecords.length}
        operationalFilter={operationalFilter}
        onOperationalFilterChange={onOperationalFilterChange}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAFBFB] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
            <tr>
              <th className="py-3 px-4">No. Registrasi Kargo</th>
              <th className="py-3 px-4">Kategori & Uraian Barang</th>
              <th className="py-3 px-4">Kapal Pengangkut</th>
              <th className="py-3 px-4">Kuantitas</th>
              <th className="py-3 px-4">Durasi Penumpukan</th>
              <th className="py-3 px-4">Total Retribusi</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Aksi Bendahara</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {filteredCargo.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400">
                  Tidak ada pencatatan kargo yang cocok dengan kriteria.
                </td>
              </tr>
            ) : (
              filteredCargo.map((c) => {
                const isPaid = c.paymentStatus === "PAID";
                return (
                  <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                      <div className="flex items-center gap-1.5">
                        <Boxes className="w-3.5 h-3.5 text-emerald-600" />
                        {c.recordNumber}
                      </div>
                      <div className="text-[10px] text-gray-400 font-sans mt-0.5">
                        {c.storageLocation ? c.storageLocation.replace("_", " ") : "Dermaga"}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900 block">
                        {c.cargoCategory.replace("_", " ")}
                      </span>
                      <span className="text-gray-500 text-[11px] block mt-0.5">
                        {c.description}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-800">
                        {c.visit?.vessel?.name || "Kapal Non-Reguler"}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {c.visit?.visitNumber || "-"}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {Number(c.quantity).toLocaleString("id-ID")} {c.unitLabel}
                    </td>

                    <td className="py-3 px-4 text-gray-700 font-medium">
                      {c.durationDays} Hari
                    </td>

                    <td className="py-3 px-4 font-mono font-black text-[#0B241E]">
                      Rp {Number(c.totalAmountIdr).toLocaleString("id-ID")}
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
                      {!isPaid ? (
                        <button
                          onClick={() =>
                            onOpenPayModal({
                              isOpen: true,
                              type: "CARGO",
                              id: c.id,
                              title: "Retribusi Pelayanan Kargo",
                              identifierNumber: c.recordNumber,
                              amountIdr: Number(c.totalAmountIdr),
                              payerLabel: c.visit?.vessel?.name || c.description,
                            })
                          }
                          className="px-3 py-1.5 bg-[#0B241E] hover:bg-[#133D31] text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer mx-auto"
                        >
                          <Coins className="w-3.5 h-3.5 text-[#D97706]" />
                          Setor Kasda
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400 font-mono">
                          {c.paidAt ? new Date(c.paidAt).toLocaleDateString("id-ID") : "Terverifikasi"}
                        </span>
                      )}
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
