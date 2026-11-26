"use client";

import { Truck, CheckCircle2, Clock, Coins } from "lucide-react";
import { EquipmentRentalRecord } from "@/types/cargo-utility.types";
import { OperationalPayModalState } from "./OperationalPaymentModal";
import { OperationalFilterBar, OperationalFilterType } from "./OperationalFilterBar";

export interface EquipmentRentalSectionProps {
  equipmentRentals: EquipmentRentalRecord[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  operationalFilter: OperationalFilterType;
  onOperationalFilterChange: (filter: OperationalFilterType) => void;
  onOpenPayModal: (modalState: OperationalPayModalState) => void;
}

export function EquipmentRentalSection({
  equipmentRentals,
  searchQuery,
  onSearchChange,
  operationalFilter,
  onOperationalFilterChange,
  onOpenPayModal,
}: EquipmentRentalSectionProps) {
  const filteredEquipment = equipmentRentals.filter((e) => {
    const matchesSearch =
      e.rentalNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.equipmentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.capacityLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.visit?.vessel?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (operationalFilter === "UNPAID") return e.paymentStatus === "UNPAID";
    if (operationalFilter === "PAID") return e.paymentStatus === "PAID";
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
      <OperationalFilterBar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Cari nomor sewa alat, jenis unit, atau kapal..."
        filterLabel="Status Kasda:"
        totalCount={equipmentRentals.length}
        operationalFilter={operationalFilter}
        onOperationalFilterChange={onOperationalFilterChange}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAFBFB] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
            <tr>
              <th className="py-3 px-4">No. Registrasi Sewa</th>
              <th className="py-3 px-4">Jenis Unit Alat</th>
              <th className="py-3 px-4">Kapal / Pemakai Jasa</th>
              <th className="py-3 px-4">Jumlah Unit</th>
              <th className="py-3 px-4">Durasi Pemakaian</th>
              <th className="py-3 px-4">Tarif per Jam</th>
              <th className="py-3 px-4">Total Tagihan</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Aksi Bendahara</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {filteredEquipment.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-400">
                  Tidak ada sewa alat pelabuhan yang cocok dengan kriteria.
                </td>
              </tr>
            ) : (
              filteredEquipment.map((e) => {
                const isPaid = e.paymentStatus === "PAID";
                return (
                  <tr key={e.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-blue-600" />
                        {e.rentalNumber}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900 block">
                        {e.equipmentType.replace("_", " ")}
                      </span>
                      <span className="text-gray-500 text-[11px] block mt-0.5">
                        Kapasitas: {e.capacityLabel}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-800">
                        {e.visit?.vessel?.name || "Operasional Dermaga"}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {e.visit?.visitNumber || "-"}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-gray-800">
                      {e.unitCount} Unit
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-gray-800">
                      {Number(e.durationHours)} Jam
                    </td>

                    <td className="py-3 px-4 font-mono text-gray-700">
                      Rp {Number(e.ratePerHourIdr).toLocaleString("id-ID")}
                    </td>

                    <td className="py-3 px-4 font-mono font-black text-[#0B241E]">
                      Rp {Number(e.totalAmountIdr).toLocaleString("id-ID")}
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
                              type: "EQUIPMENT",
                              id: e.id,
                              title: "Retribusi Sewa Alat Pelabuhan",
                              identifierNumber: e.rentalNumber,
                              amountIdr: Number(e.totalAmountIdr),
                              payerLabel: e.visit?.vessel?.name || e.capacityLabel,
                            })
                          }
                          className="px-3 py-1.5 bg-[#0B241E] hover:bg-[#133D31] text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer mx-auto"
                        >
                          <Coins className="w-3.5 h-3.5 text-[#D97706]" />
                          Setor Kasda
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400 font-mono">
                          {e.paidAt ? new Date(e.paidAt).toLocaleDateString("id-ID") : "Terverifikasi"}
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
