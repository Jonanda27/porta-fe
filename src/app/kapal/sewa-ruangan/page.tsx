"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Store,
  Warehouse,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  Calendar,
  Receipt,
  X,
  ArrowRight,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";
import { useKapalStore } from "@/store/kapal.store";
import { formatLabel } from "@/lib/format-labels";
import { PortAsset, PortAssetType } from "@/types/asset.types";

const ASSET_TYPE_OPTIONS: { value: "" | PortAssetType; label: string }[] = [
  { value: "", label: "Semua Jenis Aset" },
  { value: "KANTOR", label: "Kantor / Loket" },
  { value: "GUDANG", label: "Gudang" },
  { value: "KIOS", label: "Kios" },
  { value: "LAPAK_TERBUKA", label: "Lapak Terbuka" },
  { value: "ALAT_BERAT", label: "Alat Berat" },
  { value: "UTILITAS", label: "Utilitas" },
];

function getAssetTypeLabel(type: PortAssetType): string {
  switch (type) {
    case "KANTOR":
      return "Kantor / Loket";
    case "GUDANG":
      return "Gudang";
    case "KIOS":
      return "Kios Usaha";
    case "LAPAK_TERBUKA":
      return "Lapak Terbuka";
    case "ALAT_BERAT":
      return "Alat Berat";
    case "UTILITAS":
      return "Utilitas";
    default:
      return formatLabel(type);
  }
}

export default function KapalSewaRuanganPage() {
  const {
    operator,
    portAssets,
    assetLeases,
    isLoading,
    isLeaseSubmitting,
    leaseError,
    fetchOperatorProfile,
    fetchPortAssets,
    fetchAssetLeases,
    requestAssetLease,
    clearLeaseError,
  } = useKapalStore();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<"" | PortAssetType>("");
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(6);

  // Modal Ajukan Sewa State
  const [selectedAsset, setSelectedAsset] = useState<PortAsset | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    fetchOperatorProfile();
    fetchPortAssets();
    fetchAssetLeases();
  }, [fetchOperatorProfile, fetchPortAssets, fetchAssetLeases]);

  const isVerified = operator?.verificationStatus === "VERIFIED";

  const stats = useMemo(() => {
    const total = portAssets.length;
    const available = portAssets.filter(
      (a) => a.status === "AVAILABLE" && a.billingEligibility === "BILLABLE"
    ).length;
    const activeMyLeases = assetLeases.filter((l) => l.status === "ACTIVE").length;
    const pendingMyLeases = assetLeases.filter(
      (l) =>
        l.status === "REQUESTED" ||
        l.status === "PENDING_ROOM_OFFICER" ||
        l.status === "PENDING_HEAD_OF_PORT"
    ).length;
    return { total, available, activeMyLeases, pendingMyLeases };
  }, [portAssets, assetLeases]);

  const filteredAssets = useMemo(() => {
    return portAssets.filter((a) => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.assetCode.toLowerCase().includes(q) ||
        a.assetType.toLowerCase().includes(q);
      const matchType = !typeFilter || a.assetType === typeFilter;
      const matchAvail =
        !onlyAvailable || (a.status === "AVAILABLE" && a.billingEligibility === "BILLABLE");
      return matchSearch && matchType && matchAvail;
    });
  }, [portAssets, searchQuery, typeFilter, onlyAvailable]);

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage) || 1;
  const pagedAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openApplyModal = (asset: PortAsset) => {
    const today = new Date();
    const startStr = today.toISOString().split("T")[0];
    const nextYear = new Date(today);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const endStr = nextYear.toISOString().split("T")[0];

    setStartDate(startStr);
    setEndDate(endStr);
    clearLeaseError();
    setSelectedAsset(asset);
  };

  const handleSubmitLeaseRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    try {
      const created = await requestAssetLease({
        assetId: selectedAsset.id,
        startDate,
        endDate,
      });
      setSuccessBanner(
        `Pengajuan sewa ruangan ${selectedAsset.name} (${created.contractNumber}) berhasil dikirim! Menunggu verifikasi Petugas Ruangan & persetujuan Kepala Pelabuhan.`
      );
      setSelectedAsset(null);
    } catch {
      // Error ditangani oleh zustand store (leaseError)
    }
  };

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-6">
      {/* 1. KPI SUMMARY DECK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-[#0B241E]/10 text-[#0B241E] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold text-[#64748B] bg-slate-100 px-2 py-0.5 rounded-full">
              BMD Pemkab
            </span>
          </div>
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Total Unit Aset Pelabuhan
          </p>
          <p className="text-2xl font-black text-[#0B241E] font-mono mt-0.5">{stats.total}</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
              Siap Ajukan
            </span>
          </div>
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Unit Tersedia (Billable)
          </p>
          <p className="text-2xl font-black text-emerald-700 font-mono mt-0.5">{stats.available}</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
              2-Tahap UPT
            </span>
          </div>
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Pengajuan Diproses
          </p>
          <p className="text-2xl font-black text-amber-700 font-mono mt-0.5">
            {stats.pendingMyLeases}
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Warehouse className="w-4 h-4" />
            </div>
            <Link
              href="/kapal/kontrak-sewa"
              className="text-[10px] font-bold text-[#0B241E] hover:text-[#D97706] flex items-center gap-0.5"
            >
              <span>Kelola PKS</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Kontrak Sewa Aktif Saya
          </p>
          <p className="text-2xl font-black text-[#0B241E] font-mono mt-0.5">
            {stats.activeMyLeases}
          </p>
        </div>
      </div>

      {/* 2. BANNER FEEDBACK / VERIFIKASI */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successBanner}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/kapal/kontrak-sewa"
              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center gap-1"
            >
              <span>Pantau Status PKS</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <button
              type="button"
              onClick={() => setSuccessBanner(null)}
              className="p-1 text-emerald-700 hover:text-emerald-950 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {!isVerified && operator && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            Status legalitas perusahaan pelayaran Anda saat ini{" "}
            <strong>{operator.verificationStatus}</strong>. Pengajuan sewa ruangan/aset baru dapat
            dikirim setelah akun operator diverifikasi (<strong>VERIFIED</strong>) oleh Admin
            Pelabuhan.
          </span>
        </div>
      )}

      {leaseError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{leaseError}</span>
          </div>
          <button
            type="button"
            onClick={clearLeaseError}
            className="text-rose-700 hover:text-rose-950 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. FILTER & TOOLBAR */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-3 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold text-[#0B241E]">
              Katalog Ruangan, Kantor, Gudang & Aset Pelabuhan
            </h2>
            <p className="text-xs text-[#64748B]">
              Operator Kapal dapat mengajukan sewa seluruh jenis aset berstatus{" "}
              <strong>Tersedia (AVAILABLE)</strong>. Setelah disetujui, tagihan retribusi masuk ke
              halaman{" "}
              <Link href="/kapal/penagihan" className="text-[#0B241E] font-bold underline">
                Tagihan e-SKRD
              </Link>
              .
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
                placeholder="Cari nama ruangan, kode aset..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#CBD5E1] rounded-xl bg-white focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#334155] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => {
                  setOnlyAvailable(e.target.checked);
                  setCurrentPage(1);
                }}
                className="accent-[#0B241E]"
              />
              <span>Hanya Tersedia</span>
            </label>

            <button
              type="button"
              onClick={() => {
                fetchPortAssets();
                fetchAssetLeases();
              }}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#F1F5F9]">
          {ASSET_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value || "ALL"}
              type="button"
              onClick={() => {
                setTypeFilter(opt.value);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                typeFilter === opt.value
                  ? "bg-[#0B241E] text-white"
                  : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E] border border-[#E2E8F0]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. ASSET CARDS GRID */}
      {isLoading && portAssets.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 flex items-center justify-center gap-2 text-xs text-[#64748B]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Memuat katalog ruangan & aset pelabuhan...</span>
        </div>
      ) : pagedAssets.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center space-y-2">
          <Building2 className="w-10 h-10 text-[#94A3B8] mx-auto" />
          <p className="text-sm font-bold text-[#0B241E]">Tidak ada unit aset yang sesuai filter</p>
          <p className="text-xs text-[#64748B]">
            Coba ubah kata kunci pencarian atau pilih kategori jenis aset lainnya.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagedAssets.map((asset) => {
              const area = Number(asset.areaSqm || 0);
              const rate = Number(asset.annualRatePerSqmIdr || 0);
              const estimatedAnnual = area * rate;
              const isBillable = asset.billingEligibility === "BILLABLE";
              const isAvailable = asset.status === "AVAILABLE";
              const canApply = isAvailable && isBillable && isVerified;

              const hasPendingForThisAsset = assetLeases.some(
                (l) =>
                  l.assetId === asset.id &&
                  (l.status === "REQUESTED" ||
                    l.status === "PENDING_ROOM_OFFICER" ||
                    l.status === "PENDING_HEAD_OF_PORT")
              );

              return (
                <div
                  key={asset.id}
                  className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-2xs hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#0B241E] text-white">
                        {asset.assetCode}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          {getAssetTypeLabel(asset.assetType)}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isAvailable
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isAvailable ? "Tersedia" : formatLabel(asset.status)}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-extrabold text-[#0B241E] flex items-start gap-2">
                      <Store className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                      <span>{asset.name}</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] rounded-xl p-2.5 border border-[#F1F5F9] text-[11px]">
                      <div>
                        <span className="text-[#64748B] block text-[10px]">Luas Unit</span>
                        <span className="font-bold text-[#0B241E]">{area} m²</span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block text-[10px]">Tarif / m² / Thn</span>
                        <span className="font-mono font-bold text-[#0B241E]">
                          {formatRupiah(rate)}
                        </span>
                      </div>
                    </div>

                    {asset.gisCoordinates && (
                      <p className="text-[11px] text-[#64748B] flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{asset.gisCoordinates}</span>
                      </p>
                    )}

                    {asset.legalBasis && (
                      <p className="text-[10px] text-[#94A3B8] line-clamp-1">
                        Dasar: {asset.legalBasis}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#F1F5F9] space-y-3">
                    <div>
                      <p className="text-[10px] text-[#64748B] uppercase font-mono">
                        Estimasi Retribusi Tahunan (e-SKRD)
                      </p>
                      <p className="text-base font-extrabold text-[#0B241E] font-mono">
                        {formatRupiah(estimatedAnnual)}
                      </p>
                    </div>

                    {hasPendingForThisAsset ? (
                      <Link
                        href="/kapal/kontrak-sewa"
                        className="w-full py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>Sedang Diverifikasi • Lihat Status</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled={!canApply}
                        onClick={() => openApplyModal(asset)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors ${
                          canApply
                            ? "bg-[#0B241E] hover:bg-[#143E33] text-white cursor-pointer shadow-xs"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {!isAvailable
                          ? "Sudah Disewa / Tidak Tersedia"
                          : !isBillable
                          ? "Belum Siap Tagih (Non-Billable)"
                          : !isVerified
                          ? "Menunggu Verifikasi Operator"
                          : "Ajukan Sewa Ruangan / Aset"}
                      </button>
                    )}
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
              itemsPerPageOptions={[6, 9, 12, 18]}
            />
          </div>
        </>
      )}

      {/* 5. MODAL PENGAJUAN SEWA RUANGAN / ASET */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-[#D97706] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0B241E]">
                    Ajukan Sewa Ruangan & Aset Pelabuhan
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Atas nama: <strong>{operator?.name || "Operator Kapal"}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAsset(null)}
                className="p-1.5 rounded-xl text-[#94A3B8] hover:text-[#0B241E] hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {leaseError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{leaseError}</span>
              </div>
            )}

            {/* Info Aset Terpilih */}
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#0B241E] text-white">
                  {selectedAsset.assetCode}
                </span>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {getAssetTypeLabel(selectedAsset.assetType)}
                </span>
              </div>
              <p className="font-extrabold text-[#0B241E] text-sm">{selectedAsset.name}</p>
              <div className="flex items-center justify-between text-[#475569] pt-1 border-t border-[#E2E8F0]">
                <span>
                  Luas: <strong>{Number(selectedAsset.areaSqm)} m²</strong> ×{" "}
                  {formatRupiah(Number(selectedAsset.annualRatePerSqmIdr))}/m²/thn
                </span>
                <span className="font-mono font-black text-[#0B241E] text-sm">
                  {formatRupiah(
                    Number(selectedAsset.areaSqm) * Number(selectedAsset.annualRatePerSqmIdr)
                  )}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitLeaseRequest} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">
                    Tanggal Mulai Sewa <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0B241E] focus:outline-none focus:border-[#0B241E] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">
                    Tanggal Selesai Sewa <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      required
                      min={startDate}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0B241E] focus:outline-none focus:border-[#0B241E] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Alur Persetujuan 2-Tahap & Pembayaran e-SKRD:
                </p>
                <p className="text-emerald-800 leading-relaxed">
                  1. Verifikasi ketersediaan fisik oleh <strong>Petugas Ruangan UPTD</strong>.<br />
                  2. Pengesahan PKS oleh <strong>Kepala Pelabuhan</strong>.<br />
                  3. Setelah disahkan (<strong>ACTIVE</strong>), tagihan retribusi otomatis muncul
                  di menu <strong>Tagihan e-SKRD & Bayar</strong> bertanda{" "}
                  <strong>Pengajuan Ruangan</strong>.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setSelectedAsset(null)}
                  className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLeaseSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isLeaseSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Receipt className="w-3.5 h-3.5 text-[#D97706]" />
                  )}
                  <span>Kirim Pengajuan Sewa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
