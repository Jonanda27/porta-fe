"use client";

import { Search } from "lucide-react";

export type OperationalFilterType = "ALL" | "UNPAID" | "PAID";

export interface OperationalFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  filterLabel: string;
  totalCount: number;
  operationalFilter: OperationalFilterType;
  onOperationalFilterChange: (filter: OperationalFilterType) => void;
}

export function OperationalFilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  filterLabel,
  totalCount,
  operationalFilter,
  onOperationalFilterChange,
}: OperationalFilterBarProps) {
  return (
    <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0B241E] focus:bg-white"
        />
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
        <span className="text-xs text-gray-400 font-medium">{filterLabel}</span>
        <button
          onClick={() => onOperationalFilterChange("ALL")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            operationalFilter === "ALL"
              ? "bg-[#0B241E] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Semua ({totalCount})
        </button>
        <button
          onClick={() => onOperationalFilterChange("UNPAID")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            operationalFilter === "UNPAID"
              ? "bg-amber-600 text-white"
              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
          }`}
        >
          Menunggu Pembayaran
        </button>
        <button
          onClick={() => onOperationalFilterChange("PAID")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            operationalFilter === "PAID"
              ? "bg-emerald-600 text-white"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          }`}
        >
          Lunas Kasda
        </button>
      </div>
    </div>
  );
}
