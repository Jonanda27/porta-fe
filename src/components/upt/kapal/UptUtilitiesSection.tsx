"use client";

import React, { useEffect, useMemo, useState } from "react";
import { TablePagination } from "@/components/ui/table-pagination";
import { formatLabel } from "@/lib/format-labels";
import {
  CreateUtilityReadingPayload,
  UtilityReadingItem,
  UtilityType,
} from "@/types/field-ops.types";
import { ShipVisitItem } from "@/types/upt.types";

export interface UptUtilitiesSectionProps {
  visits: ShipVisitItem[];
  utilities: UtilityReadingItem[];
  activePortId: number;
  numericPortId?: number;
  isSubmitting: boolean;
  onCreateUtility: (payload: CreateUtilityReadingPayload) => Promise<void>;
}

export function UptUtilitiesSection({
  visits,
  utilities,
  activePortId,
  numericPortId,
  isSubmitting,
  onCreateUtility,
}: UptUtilitiesSectionProps) {
  const [utilType, setUtilType] = useState<UtilityType>("AIR_BERSIH");
  const [utilVisitId, setUtilVisitId] = useState<string>("");
  const [meterStart, setMeterStart] = useState("");
  const [meterEnd, setMeterEnd] = useState("");
  const [utilUnit, setUtilUnit] = useState("liter");
  const [utilPage, setUtilPage] = useState(1);
  const [utilItemsPerPage, setUtilItemsPerPage] = useState(10);

  useEffect(() => {
    setUtilPage(1);
  }, [numericPortId]);

  const totalUtilPages = Math.max(
    1,
    Math.ceil(utilities.length / utilItemsPerPage)
  );
  const paginatedUtilities = useMemo(() => {
    const safePage = Math.min(utilPage, totalUtilPages);
    const start = (safePage - 1) * utilItemsPerPage;
    return utilities.slice(start, start + utilItemsPerPage);
  }, [utilities, utilPage, totalUtilPages, utilItemsPerPage]);

  const handleSubmitUtility = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateUtility({
      portId: activePortId,
      visitId: utilVisitId ? Number(utilVisitId) : undefined,
      utilityType: utilType,
      meterStart: Number(meterStart),
      meterEnd: Number(meterEnd),
      unitLabel: utilUnit.trim(),
    });
    setMeterStart("");
    setMeterEnd("");
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmitUtility}
        className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-2xs"
      >
        <h3 className="text-sm font-extrabold text-[#0B241E]">
          Catat Meteran Air Bersih / Listrik
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <select
            value={utilType}
            onChange={(e) => setUtilType(e.target.value as UtilityType)}
            className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
          >
            <option value="AIR_BERSIH">Air Bersih Kapal / Kios</option>
            <option value="LISTRIK">Aliran Listrik (kWh)</option>
          </select>
          <select
            value={utilVisitId}
            onChange={(e) => setUtilVisitId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
          >
            <option value="">Kunjungan (Opsional)</option>
            {visits.map((v) => (
              <option key={v.id} value={v.id}>
                {v.visitNumber}
              </option>
            ))}
          </select>
          <input
            type="number"
            required
            min={0}
            value={meterStart}
            onChange={(e) => setMeterStart(e.target.value)}
            placeholder="Meter Awal"
            className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
          />
          <input
            type="number"
            required
            min={0}
            value={meterEnd}
            onChange={(e) => setMeterEnd(e.target.value)}
            placeholder="Meter Akhir"
            className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
          />
          <input
            type="text"
            required
            value={utilUnit}
            onChange={(e) => setUtilUnit(e.target.value)}
            placeholder="Satuan (liter / kWh)"
            className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-xl bg-[#0B241E] text-white text-xs font-bold cursor-pointer"
        >
          Simpan Meteran
        </button>
      </form>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B] bg-[#F8FAFC]">
              <th className="py-3 px-4">No. Catatan</th>
              <th className="py-3 px-4">Utilitas</th>
              <th className="py-3 px-4">Meter Awal → Akhir</th>
              <th className="py-3 px-4">Volume</th>
              <th className="py-3 px-4">Tagihan</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9] text-xs">
            {paginatedUtilities.map((u) => (
              <tr key={u.id}>
                <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                  {u.readingNumber}
                </td>
                <td className="py-3 px-4">{formatLabel(u.utilityType)}</td>
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
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100">
                    {formatLabel(u.paymentStatus)}
                  </span>
                </td>
              </tr>
            ))}
            {utilities.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#94A3B8]">
                  Belum ada catatan meteran utilitas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <TablePagination
          currentPage={Math.min(utilPage, totalUtilPages)}
          totalPages={totalUtilPages}
          totalItems={utilities.length}
          itemsPerPage={utilItemsPerPage}
          onPageChange={setUtilPage}
          onItemsPerPageChange={(items) => {
            setUtilItemsPerPage(items);
            setUtilPage(1);
          }}
          itemsPerPageOptions={[10, 25, 50]}
          className="px-4"
        />
      </div>
    </div>
  );
}
