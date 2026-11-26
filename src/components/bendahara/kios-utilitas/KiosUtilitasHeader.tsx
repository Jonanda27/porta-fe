"use client";

import { Building2, Store, Zap, Boxes, Truck, Warehouse } from "lucide-react";

export type KiosUtilitasTab = "LEASES" | "ASSETS" | "UTILITIES" | "CARGO" | "EQUIPMENT";

export interface KiosUtilitasTabCounts {
  leases: number;
  utilities: number;
  cargo: number;
  equipment: number;
  assets: number;
}

export interface KiosUtilitasHeaderProps {
  activeTab: KiosUtilitasTab;
  onTabChange: (tab: KiosUtilitasTab) => void;
  counts: KiosUtilitasTabCounts;
}

export function KiosUtilitasHeader({
  activeTab,
  onTabChange,
  counts,
}: KiosUtilitasHeaderProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-white flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5 text-[#D97706]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0B241E]">
              Penerimaan Sewa Tenant, Kargo & Utilitas Pelabuhan
            </h1>
            <p className="text-sm text-gray-500">
              Penerimaan retribusi jasa usaha kekayaan daerah kawasan Pelabuhan Poumako sesuai{" "}
              <span className="font-semibold text-[#0B241E]">
                Perda Mimika No. 4/2023 & Perbup No. 25/2024
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
        <button
          onClick={() => onTabChange("LEASES")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "LEASES"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Store className="w-3.5 h-3.5 text-[#D97706]" />
          Sewa Kios ({counts.leases})
        </button>
        <button
          onClick={() => onTabChange("UTILITIES")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "UTILITIES"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          Utilitas Dermaga ({counts.utilities})
        </button>
        <button
          onClick={() => onTabChange("CARGO")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "CARGO"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Boxes className="w-3.5 h-3.5 text-emerald-500" />
          Kargo ({counts.cargo})
        </button>
        <button
          onClick={() => onTabChange("EQUIPMENT")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "EQUIPMENT"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Truck className="w-3.5 h-3.5 text-blue-500" />
          Alat Pelabuhan ({counts.equipment})
        </button>
        <button
          onClick={() => onTabChange("ASSETS")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "ASSETS"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Warehouse className="w-3.5 h-3.5 text-gray-400" />
          Master Aset ({counts.assets})
        </button>
      </div>
    </div>
  );
}
