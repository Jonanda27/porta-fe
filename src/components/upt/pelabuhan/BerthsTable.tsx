"use client";

import React from "react";
import { Anchor, Edit3, MapPin, Plus, Search } from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";
import { StatusDot } from "@/components/ui/status-indicator";
import { formatLabel } from "@/lib/format-labels";
import { BerthItem, PortItem } from "@/types/port.types";

export interface BerthsTableProps {
  selectedPort: PortItem | null;
  pagedBerths: BerthItem[];
  totalFilteredBerths: number;
  searchBerthQuery: string;
  berthCategoryFilter: string;
  berthPage: number;
  totalBerthPages: number;
  berthItemsPerPage: number;
  isSuperadmin: boolean;
  onSearchBerthChange: (value: string) => void;
  onBerthCategoryFilterChange: (value: string) => void;
  onBerthPageChange: (page: number) => void;
  onBerthItemsPerPageChange: (itemsPerPage: number) => void;
  onEditPort: (port: PortItem) => void;
  onCreateBerth: (portId: number) => void;
  onEditBerth: (berth: BerthItem) => void;
}

export function BerthsTable({
  selectedPort,
  pagedBerths,
  totalFilteredBerths,
  searchBerthQuery,
  berthCategoryFilter,
  berthPage,
  totalBerthPages,
  berthItemsPerPage,
  isSuperadmin,
  onSearchBerthChange,
  onBerthCategoryFilterChange,
  onBerthPageChange,
  onBerthItemsPerPageChange,
  onEditPort,
  onCreateBerth,
  onEditBerth,
}: BerthsTableProps) {
  if (!selectedPort) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
        <Anchor className="w-8 h-8 mb-2 text-slate-300" />
        <p className="text-xs font-medium">Pilih pelabuhan di atas untuk melihat daftar dermaga.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Selected Port Header + Berth Filters */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/40">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-bold text-slate-900">{selectedPort.name}</h2>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-600">
              {formatLabel(selectedPort.portCategory)}
            </span>
          </div>
          {selectedPort.location && (
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{selectedPort.location}</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="relative w-full sm:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchBerthQuery}
              onChange={(e) => onSearchBerthChange(e.target.value)}
              placeholder="Cari dermaga..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B241E]"
            />
          </div>
          <select
            value={berthCategoryFilter}
            onChange={(e) => onBerthCategoryFilterChange(e.target.value)}
            className="py-1.5 px-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="">Semua Jenis</option>
            <option value="DERMAGA_BARANG">Dermaga Barang</option>
            <option value="DERMAGA_PENUMPANG">Dermaga Penumpang</option>
            <option value="DERMAGA_CAMPURAN">Dermaga Campuran</option>
          </select>
          {isSuperadmin && (
            <button
              type="button"
              onClick={() => onEditPort(selectedPort)}
              title="Ubah Info Pelabuhan"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onCreateBerth(selectedPort.id)}
            className="px-3.5 py-1.5 rounded-lg bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Tambah Dermaga</span>
          </button>
        </div>
      </div>

      {/* Full-Width Spacious Berths Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-white">
              <th className="py-3 px-5">Dermaga</th>
              <th className="py-3 px-4">Jenis &amp; Konstruksi</th>
              <th className="py-3 px-4 hidden md:table-cell">Pengelola</th>
              <th className="py-3 px-4 hidden sm:table-cell">Ukuran Maksimal</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-5 text-right w-16">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {pagedBerths.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  Belum ada dermaga pada pelabuhan ini.
                </td>
              </tr>
            ) : (
              pagedBerths.map((berth) => (
                <tr key={berth.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-slate-900">{berth.name}</div>
                    <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                      {berth.code}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800">
                      {formatLabel(berth.berthServiceCategory)}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {formatLabel(berth.berthType)}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 hidden md:table-cell">
                    <div className="font-medium text-slate-800">
                      {formatLabel(berth.authorityType)}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {formatLabel(berth.billingEligibility)}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 hidden sm:table-cell whitespace-nowrap">
                    <div className="font-medium text-slate-800">
                      Panjang {berth.maxLengthMeters ?? "-"} m
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Kedalaman {berth.maxDraftMeters ?? "-"} m
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusDot status={berth.operationalStatus} />
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => onEditBerth(berth)}
                      title="Ubah Dermaga"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        currentPage={berthPage}
        totalPages={totalBerthPages}
        totalItems={totalFilteredBerths}
        itemsPerPage={berthItemsPerPage}
        onPageChange={onBerthPageChange}
        onItemsPerPageChange={onBerthItemsPerPageChange}
      />
    </div>
  );
}
