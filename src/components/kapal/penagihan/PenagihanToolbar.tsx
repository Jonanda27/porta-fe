"use client";

import React from "react";
import {
  Receipt,
  CheckCircle2,
  Search,
  RefreshCw,
  Anchor,
  Building2,
} from "lucide-react";

export type PenagihanTab = "unpaid" | "history";
export type PenagihanCategoryFilter = "ALL" | "DERMAGA" | "RUANGAN";

export interface PenagihanToolbarProps {
  activeTab: PenagihanTab;
  onChangeTab: (tab: PenagihanTab) => void;
  categoryFilter: PenagihanCategoryFilter;
  onChangeCategoryFilter: (filter: PenagihanCategoryFilter) => void;
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  totalUnpaidCount: number;
  totalPaidCount: number;
  unpaidInvoicesCount: number;
  paidInvoicesCount: number;
  unpaidLeasesCount: number;
  paidLeasePaymentsCount: number;
  isLoading: boolean;
  onRefresh: () => void;
}

export function PenagihanToolbar({
  activeTab,
  onChangeTab,
  categoryFilter,
  onChangeCategoryFilter,
  searchQuery,
  onChangeSearchQuery,
  totalUnpaidCount,
  totalPaidCount,
  unpaidInvoicesCount,
  paidInvoicesCount,
  unpaidLeasesCount,
  paidLeasePaymentsCount,
  isLoading,
  onRefresh,
}: PenagihanToolbarProps) {
  return (
    <div className="space-y-3 border-b border-[#CBD5E1] pb-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onChangeTab("unpaid")}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "unpaid"
                ? "bg-[#0B241E] text-white shadow-xs"
                : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
            }`}
          >
            <Receipt className="w-4 h-4 text-[#D97706]" />
            <span>Tagihan e-SKRD Belum Dibayar ({totalUnpaidCount})</span>
          </button>

          <button
            onClick={() => onChangeTab("history")}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "history"
                ? "bg-[#0B241E] text-white shadow-xs"
                : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Riwayat Pelayanan & Kuitansi e-SSRD ({totalPaidCount})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onChangeSearchQuery(e.target.value)}
              placeholder="Cari e-SKRD, kapal, PKS, ruangan..."
              className="pl-8 pr-3 py-1.5 rounded-xl border border-[#CBD5E1] text-xs focus:outline-hidden focus:border-[#0B241E] bg-white w-60"
            />
          </div>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 border border-[#CBD5E1] bg-white rounded-xl hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0B241E] cursor-pointer disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter Kategori Pengajuan Dermaga vs Pengajuan Ruangan */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-bold text-[#64748B]">Jenis Tagihan:</span>
        <button
          type="button"
          onClick={() => onChangeCategoryFilter("ALL")}
          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
            categoryFilter === "ALL"
              ? "bg-[#0B241E] text-white"
              : "bg-white text-[#64748B] border border-[#CBD5E1] hover:text-[#0B241E]"
          }`}
        >
          Semua ({activeTab === "unpaid" ? totalUnpaidCount : totalPaidCount})
        </button>
        <button
          type="button"
          onClick={() => onChangeCategoryFilter("DERMAGA")}
          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
            categoryFilter === "DERMAGA"
              ? "bg-sky-700 text-white"
              : "bg-sky-50 text-sky-900 border border-sky-200 hover:bg-sky-100"
          }`}
        >
          <Anchor className="w-3 h-3" />
          <span>
            Pengajuan Dermaga ({activeTab === "unpaid" ? unpaidInvoicesCount : paidInvoicesCount})
          </span>
        </button>
        <button
          type="button"
          onClick={() => onChangeCategoryFilter("RUANGAN")}
          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
            categoryFilter === "RUANGAN"
              ? "bg-violet-700 text-white"
              : "bg-violet-50 text-violet-900 border border-violet-200 hover:bg-violet-100"
          }`}
        >
          <Building2 className="w-3 h-3" />
          <span>
            Pengajuan Ruangan (
            {activeTab === "unpaid" ? unpaidLeasesCount : paidLeasePaymentsCount})
          </span>
        </button>
      </div>
    </div>
  );
}
