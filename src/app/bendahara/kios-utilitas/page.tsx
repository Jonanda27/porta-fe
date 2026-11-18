"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Store,
  Warehouse,
  Coins,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  PlusCircle,
  FileText,
  Printer,
  X,
  CreditCard,
  MapPin,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useBillingStore } from "@/store/billing.store";
import { AssetLease, PortAsset, RecordLeasePaymentDto } from "@/types/asset.types";

export default function KiosDanUtilitasPage() {
  const {
    leases,
    assets,
    revenueSummary,
    isLoading,
    error,
    fetchLeases,
    fetchAssets,
    fetchRevenueSummary,
    recordLeasePayment,
  } = useBillingStore();

  const [activeTab, setActiveTab] = useState<"LEASES" | "ASSETS">("LEASES");
  const [leaseFilter, setLeaseFilter] = useState<"ALL" | "ACTIVE" | "EXPIRING" | "CRITICAL">("ALL");
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State for Payment Recording
  const [selectedLeaseForPayment, setSelectedLeaseForPayment] = useState<AssetLease | null>(null);
  const [paymentForm, setPaymentForm] = useState<{
    periodYear: number;
    amountIdr: number;
    paidAt: string;
    referenceNo: string;
  }>({
    periodYear: new Date().getFullYear(),
    amountIdr: 0,
    paidAt: new Date().toISOString().split("T")[0],
    referenceNo: "",
  });
  const [isSubmittingPayment, setIsSubmittingPayment] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // Modal State for Asset Detail
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<PortAsset | null>(null);

  useEffect(() => {
    fetchLeases();
    fetchAssets();
    fetchRevenueSummary();
  }, [fetchLeases, fetchAssets, fetchRevenueSummary]);

  // Helper sisa hari sewa
  const getDaysRemaining = (endDateStr: string): number => {
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

  // Helper total bayar vs total tagihan
  const getPaymentSummary = (lease: AssetLease) => {
    const totalDue = Number(lease.totalAnnualAmountIdr || 0);
    const totalPaid = (lease.payments || []).reduce(
      (acc, p) => acc + Number(p.amountIdr || 0),
      0
    );
    const remaining = Math.max(0, totalDue - totalPaid);
    const isPaidOff = remaining === 0 && totalPaid > 0;
    return { totalDue, totalPaid, remaining, isPaidOff };
  };

  // Filter leases (100% Data Riil dari API Backend)
  const filteredLeases = leases.filter((lease) => {
    const matchesSearch =
      lease.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lease.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lease.asset?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const days = getDaysRemaining(lease.endDate);
    const { remaining } = getPaymentSummary(lease);

    if (leaseFilter === "ACTIVE") return lease.status === "ACTIVE";
    if (leaseFilter === "EXPIRING") return days <= 45 && days > 0;
    if (leaseFilter === "CRITICAL") return days <= 0 || remaining > 0;
    return true;
  });

  // Filter assets (100% Data Riil dari API Backend)
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (assetTypeFilter !== "ALL" && asset.assetType !== assetTypeFilter) return false;
    return true;
  });

  // Metrik statistik dari data API riil
  const totalLeaseRevenueIdr = leases.reduce((acc, l) => {
    const paid = (l.payments || []).reduce((pAcc, p) => pAcc + Number(p.amountIdr || 0), 0);
    return acc + paid;
  }, 0);

  const totalOutstandingLeaseIdr = leases.reduce((acc, l) => {
    const { remaining } = getPaymentSummary(l);
    return acc + remaining;
  }, 0);

  const activeLeaseCount = leases.filter((l) => l.status === "ACTIVE").length;
  const availableAssetCount = assets.filter((a) => a.status === "AVAILABLE").length;

  // Handler Buka Modal Bayar
  const handleOpenPaymentModal = (lease: AssetLease) => {
    const { remaining } = getPaymentSummary(lease);
    setSelectedLeaseForPayment(lease);
    setPaymentForm({
      periodYear: new Date().getFullYear(),
      amountIdr: remaining > 0 ? remaining : Number(lease.totalAnnualAmountIdr || 0),
      paidAt: new Date().toISOString().split("T")[0],
      referenceNo: `KASDA-TENANT-${Date.now().toString().slice(-6)}`,
    });
    setActionSuccessMsg(null);
    setActionErrorMsg(null);
  };

  // Handler Submit Pembayaran Sewa
  const handleSavePayment = async () => {
    if (!selectedLeaseForPayment) return;
    if (paymentForm.amountIdr <= 0) {
      setActionErrorMsg("Nominal pembayaran harus lebih besar dari Rp 0.");
      return;
    }

    setIsSubmittingPayment(true);
    setActionErrorMsg(null);
    try {
      const dto: RecordLeasePaymentDto = {
        idempotencyKey: `LEASE-PAY-${selectedLeaseForPayment.id}-${paymentForm.periodYear}-${Date.now()}`,
        periodYear: Number(paymentForm.periodYear),
        amountIdr: Number(paymentForm.amountIdr),
        paidAt: new Date(paymentForm.paidAt).toISOString(),
      };

      await recordLeasePayment(selectedLeaseForPayment.id, dto);
      setActionSuccessMsg(
        `Pembayaran sewa tenant ${selectedLeaseForPayment.tenantName} sebesar Rp ${Number(
          paymentForm.amountIdr
        ).toLocaleString("id-ID")} berhasil dibukukan ke Kasda!`
      );
      setTimeout(() => {
        setSelectedLeaseForPayment(null);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mencatat pembayaran sewa.";
      setActionErrorMsg(msg);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. HEADER SECTION & LEGAL CONTEXT                         */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-white flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5 text-[#D97706]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0B241E]">
                Penerimaan Sewa Tenant Kios & Utilitas Pelabuhan
              </h1>
              <p className="text-sm text-gray-500">
                Pemanfaatan kekayaan daerah kawasan Pelabuhan Poumako sesuai{" "}
                <span className="font-semibold text-[#0B241E]">
                  Perda Kab. Mimika No. 4 Tahun 2023 Lampiran XI
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("LEASES")}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "LEASES"
                ? "bg-[#0B241E] text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Store className="w-4 h-4 text-[#D97706]" />
            Kontrak Sewa Tenant ({leases.length})
          </button>
          <button
            onClick={() => setActiveTab("ASSETS")}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "ASSETS"
                ? "bg-[#0B241E] text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Warehouse className="w-4 h-4 text-[#D97706]" />
            Master Aset Pelabuhan ({assets.length})
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. STATISTIC METRIC CARDS                                 */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Realisasi Kasda Sewa */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Realisasi Sewa Kasda
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-[#0B241E]">
              Rp {totalLeaseRevenueIdr.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 inline" />
              Penerimaan resmi kas daerah Poumako
            </p>
          </div>
        </div>

        {/* Card 2: Piutang / Belum Lunas */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Piutang Sewa Berjalan
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-600">
              Rp {totalOutstandingLeaseIdr.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tagihan sewa tenant belum diselesaikan
            </p>
          </div>
        </div>

        {/* Card 3: Kontrak Aktif */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Kontrak Tenant Aktif
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-[#0B241E]">
              {activeLeaseCount}{" "}
              <span className="text-sm font-normal text-gray-500">PKS</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Kios, gudang semen & kantor agen
            </p>
          </div>
        </div>

        {/* Card 4: Kapasitas Lahan / Aset Kosong */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Aset Tersedia (Siap Sewa)
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-[#0B241E]">
              {availableAssetCount}{" "}
              <span className="text-sm font-normal text-gray-500">Unit</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Lahan & lapak belum terikat perjanjian
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. TAB 1: KONTRAK SEWA TENANT (LEASES)                    */}
      {/* ========================================================= */}
      {activeTab === "LEASES" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          {/* Controls Bar */}
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nomor PKS, nama tenant, atau aset..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0B241E] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <span className="text-xs text-gray-400 font-medium">Filter:</span>
              <button
                onClick={() => setLeaseFilter("ALL")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  leaseFilter === "ALL"
                    ? "bg-[#0B241E] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Semua ({leases.length})
              </button>
              <button
                onClick={() => setLeaseFilter("ACTIVE")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  leaseFilter === "ACTIVE"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                Aktif
              </button>
              <button
                onClick={() => setLeaseFilter("EXPIRING")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  leaseFilter === "EXPIRING"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                Jatuh Tempo &lt; 45 Hari
              </button>
              <button
                onClick={() => setLeaseFilter("CRITICAL")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  leaseFilter === "CRITICAL"
                    ? "bg-rose-600 text-white"
                    : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                }`}
              >
                Ada Piutang
              </button>
            </div>
          </div>

          {/* Table Leases */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFB] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Nomor PKS & Tenant</th>
                  <th className="py-3 px-4">Objek Retribusi Aset</th>
                  <th className="py-3 px-4">Masa Kontrak Sewa</th>
                  <th className="py-3 px-4">Nilai Sewa (Tahun)</th>
                  <th className="py-3 px-4">Realisasi Setoran</th>
                  <th className="py-3 px-4">Status & Sisa</th>
                  <th className="py-3 px-4 text-center">Aksi Bendahara</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredLeases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      Tidak ada kontrak sewa tenant yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredLeases.map((lease) => {
                    const daysRemaining = getDaysRemaining(lease.endDate);
                    const { totalDue, totalPaid, remaining, isPaidOff } = getPaymentSummary(lease);

                    return (
                      <tr key={lease.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#0B241E] flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-[#D97706]" />
                            {lease.contractNumber}
                          </div>
                          <div className="font-medium text-gray-800 mt-0.5">
                            {lease.tenantName}
                          </div>
                          {lease.tenantPhone && (
                            <div className="text-[11px] text-gray-400">
                              Telp: {lease.tenantPhone}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-900">
                            {lease.asset?.name || "Aset Pelabuhan"}
                          </div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                              {lease.asset?.assetCode}
                            </span>
                            <span>Luas: {Number(lease.asset?.areaSqm || 0)} m²</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-gray-900 font-medium">
                            {lease.startDate} s.d. {lease.endDate}
                          </div>
                          <div className="mt-0.5">
                            {daysRemaining > 0 ? (
                              <span
                                className={`text-[11px] font-semibold ${
                                  daysRemaining < 30
                                    ? "text-rose-600"
                                    : daysRemaining < 60
                                    ? "text-amber-600"
                                    : "text-emerald-600"
                                }`}
                              >
                                Sisa {daysRemaining} hari lagi
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-rose-600">
                                Sudah Habis Tempo
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-gray-900">
                          Rp {totalDue.toLocaleString("id-ID")}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-emerald-700">
                            Rp {totalPaid.toLocaleString("id-ID")}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {lease.payments?.length || 0} kali transaksi
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {isPaidOff ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Lunas 100%
                            </span>
                          ) : (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                Piutang Rp {remaining.toLocaleString("id-ID")}
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenPaymentModal(lease)}
                              className="px-3 py-1.5 bg-[#0B241E] hover:bg-[#133D31] text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                              title="Catat Pembayaran Kasda"
                            >
                              <Coins className="w-3.5 h-3.5 text-[#D97706]" />
                              Bayar
                            </button>
                            <button
                              onClick={() => {
                                alert(
                                  `Cetak salinan Kuitansi e-SSRD Resmi PKS: ${lease.contractNumber}\nTenant: ${lease.tenantName}\nTotal Terbayar: Rp ${totalPaid.toLocaleString("id-ID")}`
                                );
                              }}
                              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                              title="Cetak Kuitansi e-SSRD"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. TAB 2: MASTER ASET PELABUHAN (ASSETS)                  */}
      {/* ========================================================= */}
      {activeTab === "ASSETS" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          {/* Controls Bar */}
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kode aset atau nama fasilitas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0B241E] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <span className="text-xs text-gray-400 font-medium">Jenis Aset:</span>
              {["ALL", "KIOS", "GUDANG", "KANTOR", "LAPAK_TERBUKA"].map((type) => (
                <button
                  key={type}
                  onClick={() => setAssetTypeFilter(type)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    assetTypeFilter === type
                      ? "bg-[#0B241E] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {type === "ALL" ? "Semua Jenis" : type.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Table Assets */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFB] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Kode & Nama Aset</th>
                  <th className="py-3 px-4">Klasifikasi Fasilitas</th>
                  <th className="py-3 px-4">Luas Fisik (m²)</th>
                  <th className="py-3 px-4">Tarif Perda (Rp/m²/Tahun)</th>
                  <th className="py-3 px-4">Estimasi PAD (Per Tahun)</th>
                  <th className="py-3 px-4">Kelayakan Tagih</th>
                  <th className="py-3 px-4">Status Keterisian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      Tidak ada data aset pelabuhan yang cocok dengan kriteria.
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset) => {
                    const annualEstimatedPad =
                      Number(asset.areaSqm || 0) * Number(asset.annualRatePerSqmIdr || 0);

                    return (
                      <tr key={asset.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#0B241E] flex items-center gap-1.5">
                            <span className="font-mono bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-[11px]">
                              {asset.assetCode}
                            </span>
                          </div>
                          <div className="font-medium text-gray-800 mt-1">{asset.name}</div>
                          {asset.legalBasis && (
                            <div className="text-[10px] text-gray-400 mt-0.5">
                              {asset.legalBasis}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-800">
                            {asset.assetType.replace("_", " ")}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono font-medium text-gray-800">
                          {Number(asset.areaSqm).toLocaleString("id-ID")} m²
                        </td>

                        <td className="py-3 px-4 font-mono font-medium text-gray-800">
                          Rp {Number(asset.annualRatePerSqmIdr).toLocaleString("id-ID")}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                          Rp {annualEstimatedPad.toLocaleString("id-ID")}
                        </td>

                        <td className="py-3 px-4">
                          {asset.billingEligibility === "BILLABLE" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <ShieldCheck className="w-3 h-3" />
                              Sah Pemda
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              Verifikasi Syahbandar
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {asset.status === "LEASED" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                              <Store className="w-3 h-3" />
                              Tersewa
                            </span>
                          ) : asset.status === "AVAILABLE" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Tersedia
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                              Pemeliharaan
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
      )}

      {/* ========================================================= */}
      {/* 5. MODAL: CATAT PEMBAYARAN KASDA SEWA TENANT              */}
      {/* ========================================================= */}
      {selectedLeaseForPayment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0B241E] text-white flex items-center justify-center">
                  <Coins className="w-4 h-4 text-[#D97706]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0B241E] text-base">
                    Catat Pembayaran Sewa Kasda
                  </h3>
                  <p className="text-xs text-gray-400">
                    Pencatatan penerimaan kasda pemanfaatan aset daerah
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLeaseForPayment(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Alert Feedback */}
              {actionSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-medium">
                  {actionSuccessMsg}
                </div>
              )}
              {actionErrorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-medium">
                  {actionErrorMsg}
                </div>
              )}

              {/* Data Ringkas Kontrak */}
              <div className="p-3 bg-gray-50 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nomor PKS:</span>
                  <span className="font-bold text-[#0B241E]">
                    {selectedLeaseForPayment.contractNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Nama Tenant:</span>
                  <span className="font-semibold text-gray-800">
                    {selectedLeaseForPayment.tenantName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Objek Fasilitas:</span>
                  <span className="text-gray-700">
                    {selectedLeaseForPayment.asset?.name} (
                    {Number(selectedLeaseForPayment.asset?.areaSqm || 0)} m²)
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200">
                  <span className="text-gray-500 font-semibold">Total Nilai Sewa:</span>
                  <span className="font-mono font-bold text-gray-900">
                    Rp{" "}
                    {Number(
                      selectedLeaseForPayment.totalAnnualAmountIdr || 0
                    ).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Input Form */}
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">
                    Tahun Periode Sewa
                  </label>
                  <input
                    type="number"
                    min={2024}
                    max={2030}
                    value={paymentForm.periodYear}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, periodYear: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:border-[#0B241E]"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 font-semibold mb-1">
                    Nominal Disetor ke Kasda (Rp)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={paymentForm.amountIdr}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, amountIdr: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono font-bold text-[#0B241E] focus:outline-none focus:border-[#0B241E]"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 font-semibold mb-1">
                    Tanggal Setor / Penerimaan Kasda
                  </label>
                  <input
                    type="date"
                    value={paymentForm.paidAt}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, paidAt: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0B241E]"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 font-semibold mb-1">
                    No. Bukti Transaksi Kasda / Bank RKUD
                  </label>
                  <input
                    type="text"
                    value={paymentForm.referenceNo}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, referenceNo: e.target.value })
                    }
                    placeholder="Contoh: BKU-TENANT-004 / TRF-BP-9921"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:border-[#0B241E]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedLeaseForPayment(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePayment}
                disabled={isSubmittingPayment}
                className="px-5 py-2 bg-[#0B241E] hover:bg-[#133D31] text-white font-semibold rounded-xl text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D97706]" />
                {isSubmittingPayment ? "Menyimpan..." : "Simpan & Bukukan Kasda"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
