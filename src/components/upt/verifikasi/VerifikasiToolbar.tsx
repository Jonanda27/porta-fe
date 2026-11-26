"use client";

import React from "react";
import {
  Building2,
  FileSignature,
  Plus,
  RefreshCw,
  Search,
  Ship,
  Store,
} from "lucide-react";
import { VerifikasiTabType } from "@/types/upt.types";

export interface VerifikasiToolbarProps {
  isSinglePageMode: boolean;
  activeTab: VerifikasiTabType;
  currentListLength: number;
  pendingOps: number;
  pendingVessels: number;
  pendingTenants: number;
  pendingBerthing: number;
  pendingRoomLeases: number;
  searchQuery: string;
  statusFilter: string;
  isLoading: boolean;
  onSelectTab: (tab: VerifikasiTabType) => void;
  onChangeSearch: (query: string) => void;
  onChangeStatusFilter: (status: string) => void;
  onRefresh: () => void;
  onOpenCreatePks: () => void;
}

const TAB_TITLES: Record<VerifikasiTabType, string> = {
  operators: "Daftar Verifikasi Operator Kapal",
  vessels: "Daftar Verifikasi Armada Kapal",
  tenants: "Daftar Verifikasi Tenant & Mitra Usaha",
  pks_sandar: "Daftar Verifikasi Kontrak PKS Sandar",
  pks_ruangan: "Daftar Verifikasi PKS Sewa Ruangan (2-Tahap)",
};

export function VerifikasiToolbar({
  isSinglePageMode,
  activeTab,
  currentListLength,
  pendingOps,
  pendingVessels,
  pendingTenants,
  pendingBerthing,
  pendingRoomLeases,
  searchQuery,
  statusFilter,
  isLoading,
  onSelectTab,
  onChangeSearch,
  onChangeStatusFilter,
  onRefresh,
  onOpenCreatePks,
}: VerifikasiToolbarProps) {
  const tabs: {
    id: VerifikasiTabType;
    label: string;
    count: number;
    icon: React.ReactNode;
  }[] = [
    {
      id: "operators",
      label: "Operator Kapal",
      count: pendingOps,
      icon: <Building2 className="w-4 h-4 text-[#D97706]" />,
    },
    {
      id: "vessels",
      label: "Armada Kapal",
      count: pendingVessels,
      icon: <Ship className="w-4 h-4 text-[#D97706]" />,
    },
    {
      id: "tenants",
      label: "Tenant Mitra",
      count: pendingTenants,
      icon: <Store className="w-4 h-4 text-[#D97706]" />,
    },
    {
      id: "pks_sandar",
      label: "PKS Sandar (Kepala Pelabuhan)",
      count: pendingBerthing,
      icon: <FileSignature className="w-4 h-4 text-[#D97706]" />,
    },
    {
      id: "pks_ruangan",
      label: "PKS Sewa Ruangan (2-Tahap)",
      count: pendingRoomLeases,
      icon: <Building2 className="w-4 h-4 text-[#D97706]" />,
    },
  ];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
      {isSinglePageMode ? (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center shrink-0">
            {activeTab === "vessels" ? (
              <Ship className="w-4 h-4" />
            ) : activeTab === "tenants" ? (
              <Store className="w-4 h-4" />
            ) : activeTab === "pks_sandar" ? (
              <FileSignature className="w-4 h-4" />
            ) : (
              <Building2 className="w-4 h-4" />
            )}
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-[#0B241E]">
              {TAB_TITLES[activeTab]}
            </h2>
            <p className="text-[11px] text-[#64748B]">
              Menampilkan{" "}
              <strong className="text-[#0B241E]">{currentListLength}</strong>{" "}
              data pada filter ini
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === tab.id
                  ? "bg-[#0B241E] text-white"
                  : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onChangeSearch(e.target.value)}
            placeholder="Cari nama, registrasi, nomor PKS..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs focus:outline-none focus:ring-1 focus:ring-[#133D31]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => onChangeStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0B241E]"
        >
          <option value="PENDING">Menunggu Verifikasi</option>
          <option value="VERIFIED">Terverifikasi / Aktif</option>
          <option value="REJECTED">Ditolak</option>
          <option value="">Semua Status</option>
        </select>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>

        {activeTab === "pks_sandar" && (
          <button
            type="button"
            onClick={onOpenCreatePks}
            className="px-3.5 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Daftarkan PKS Sandar</span>
          </button>
        )}
      </div>
    </div>
  );
}
