"use client";

import { Ship, Package, Droplet, RefreshCw } from "lucide-react";
import { UptKapalTabType } from "@/types/upt.types";
import { PortItem } from "@/types/port.types";

export interface UptKapalToolbarProps {
  activeTab: UptKapalTabType;
  onTabChange: (tab: UptKapalTabType) => void;
  visitsCount: number;
  utilitiesCount: number;
  isSuperadmin: boolean;
  selectedPortId: string;
  onPortChange: (portId: string) => void;
  ports: PortItem[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function UptKapalToolbar({
  activeTab,
  onTabChange,
  visitsCount,
  utilitiesCount,
  isSuperadmin,
  selectedPortId,
  onPortChange,
  ports,
  isLoading,
  onRefresh,
}: UptKapalToolbarProps) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => onTabChange("visits")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
            activeTab === "visits"
              ? "bg-[#0B241E] text-white"
              : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
          }`}
        >
          <Ship className="w-4 h-4 text-[#D97706]" />
          Log Kunjungan &amp; Sandar ({visitsCount})
        </button>

        <button
          type="button"
          onClick={() => onTabChange("cargo")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
            activeTab === "cargo"
              ? "bg-[#0B241E] text-white"
              : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
          }`}
        >
          <Package className="w-4 h-4 text-[#D97706]" />
          Bongkar Muat &amp; Sewa Alat
        </button>

        <button
          type="button"
          onClick={() => onTabChange("utilities")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
            activeTab === "utilities"
              ? "bg-[#0B241E] text-white"
              : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
          }`}
        >
          <Droplet className="w-4 h-4 text-[#D97706]" />
          Utilitas Air &amp; Listrik ({utilitiesCount})
        </button>
      </div>

      <div className="flex items-center gap-2">
        {isSuperadmin && (
          <select
            value={selectedPortId}
            onChange={(e) => onPortChange(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0B241E]"
          >
            <option value="">Semua Pelabuhan</option>
            {ports.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
    </div>
  );
}
