"use client";

import React, { useEffect, useState } from "react";
import {
  Store,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  Wrench,
} from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";
import { useTenantStore } from "@/store/tenant.store";
import { formatLabel } from "@/lib/format-labels";
import { PortAssetCatalogItem } from "@/types/tenant.types";
import { ReportFacilityIssueModal } from "@/components/tenant/ReportFacilityIssueModal";

export default function TenantSewaPage() {
  const {
    profile,
    assets,
    isLoading,
    error,
    fetchTenantData,
    openApplyModal,
  } = useTenantStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    fetchTenantData();
  }, [fetchTenantData]);

  const isVerified = profile?.verificationStatus === "VERIFIED";

  const filteredAssets = assets.filter((a) => {
    const matchSearch =
      !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assetCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = !typeFilter || a.assetType === typeFilter;
    return matchSearch && matchType;
  });

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage) || 1;
  const pagedAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div>
          <h2 className="text-sm font-extrabold text-[#0B241E]">
            Katalog Fasilitas & Ruang Usaha Pelabuhan
          </h2>
          <p className="text-xs text-[#64748B]">
            Pilih unit kios, gudang, atau lahan berstatus AVAILABLE & BILLABLE untuk mengajukan kontrak PKS.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama aset, kode..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#CBD5E1] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#133D31]"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-900 border border-amber-200 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Wrench className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Lapor Kerusakan Kios</span>
          </button>

          <button
            type="button"
            onClick={() => fetchTenantData()}
            disabled={isLoading}
            className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {!isVerified && profile && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
          Status akun usaha Anda saat ini <strong>{profile.verificationStatus}</strong>. Pengajuan sewa baru dapat dikirim setelah akun diverifikasi oleh Admin Pelabuhan.
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 flex items-center justify-center gap-2 text-xs text-[#64748B]">
          <Loader2 className="w-4 h-4 animate-spin" />
          Memuat katalog aset...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagedAssets.map((asset) => {
              const estimatedAnnual =
                Number(asset.areaSqm) * Number(asset.annualRatePerSqmIdr);
              const canApply =
                asset.status === "AVAILABLE" &&
                asset.billingEligibility === "BILLABLE" &&
                isVerified;

              return (
                <div
                  key={asset.id}
                  className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#0B241E] text-white">
                        {asset.assetCode}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          asset.status === "AVAILABLE"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {asset.status === "AVAILABLE" ? "Tersedia" : formatLabel(asset.status)}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-[#0B241E] flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-[#D97706] shrink-0" />
                      {asset.name}
                    </h3>
                    <p className="text-xs text-[#475569]">
                      Tipe: <strong>{asset.assetType}</strong> • Luas:{" "}
                      <strong>{asset.areaSqm} m²</strong>
                    </p>
                    {asset.gisCoordinates && (
                      <p className="text-[11px] text-[#64748B] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {asset.gisCoordinates}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#F1F5F9] space-y-3">
                    <div>
                      <p className="text-[10px] text-[#64748B] uppercase font-mono">
                        Estimasi Tarif Tahunan
                      </p>
                      <p className="text-base font-extrabold text-[#0B241E]">
                        Rp {estimatedAnnual.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={!canApply}
                      onClick={() => openApplyModal(asset)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-colors ${
                        canApply
                          ? "bg-[#0B241E] hover:bg-[#143E33] text-white cursor-pointer"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {asset.status !== "AVAILABLE"
                        ? "Sudah Disewa / Tidak Tersedia"
                        : !isVerified
                        ? "Menunggu Verifikasi Akun"
                        : "Ajukan Sewa Unit"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAssets.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              itemsPerPageOptions={[3, 6, 9, 15]}
            />
          </div>
        </>
      )}

      {/* Modal Lapor Kendala Fisik Kios */}
      <ReportFacilityIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        defaultCategory="FISIK_BANGUNAN"
      />
    </div>
  );
}
