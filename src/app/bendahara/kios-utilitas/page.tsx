"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Store,
  Warehouse,
  Coins,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  FileText,
  Printer,
  X,
  CreditCard,
  MapPin,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Droplets,
  Zap,
  Boxes,
  Truck,
  Wrench,
  Download,
  Receipt,
  ExternalLink,
} from "lucide-react";
import { useBillingStore } from "@/store/billing.store";
import { useCargoUtilityStore } from "@/store/cargo-utility.store";
import {
  AssetLease,
  LeasePaymentReceiptPayload,
  PortAsset,
  RecordLeasePaymentDto,
} from "@/types/asset.types";
import {
  CargoHandlingRecord,
  EquipmentRentalRecord,
  UtilityMeterReading,
  UtilityReceiptPayload,
} from "@/types/cargo-utility.types";
import {
  LeasePaymentFormState,
  LeasePaymentRecordModal,
} from "@/components/bendahara/kios-utilitas/LeasePaymentRecordModal";
import {
  OperationalPaymentModal,
  OperationalPayModalState,
} from "@/components/bendahara/kios-utilitas/OperationalPaymentModal";
import { UtilityReceiptModal } from "@/components/bendahara/kios-utilitas/UtilityReceiptModal";
import { LeaseReceiptModal } from "@/components/bendahara/kios-utilitas/LeaseReceiptModal";

export default function KiosDanUtilitasPage() {
  // Billing Store for Leases & Assets
  const {
    leases,
    assets,
    revenueSummary,
    activeLeaseReceipt,
    fetchLeases,
    fetchAssets,
    fetchRevenueSummary,
    recordLeasePayment,
    fetchLeasePaymentReceipt,
    clearActiveLeaseReceipt,
  } = useBillingStore();

  // Cargo & Utility Store
  const {
    utilities,
    cargoRecords,
    equipmentRentals,
    activeReceipt,
    isLoading: isCargoLoading,
    error: cargoError,
    fetchUtilities,
    fetchCargoRecords,
    fetchEquipmentRentals,
    payUtility,
    payCargo,
    payEquipment,
    fetchUtilityReceipt,
    clearActiveReceipt,
  } = useCargoUtilityStore();

  const [activeTab, setActiveTab] = useState<
    "LEASES" | "ASSETS" | "UTILITIES" | "CARGO" | "EQUIPMENT"
  >("LEASES");

  // Filter States
  const [leaseFilter, setLeaseFilter] = useState<"ALL" | "ACTIVE" | "EXPIRING" | "CRITICAL">("ALL");
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>("ALL");
  const [operationalFilter, setOperationalFilter] = useState<"ALL" | "UNPAID" | "PAID">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State for Lease Payment Recording
  const [selectedLeaseForPayment, setSelectedLeaseForPayment] = useState<AssetLease | null>(null);
  const [paymentForm, setPaymentForm] = useState<LeasePaymentFormState>({
    periodYear: new Date().getFullYear(),
    amountIdr: 0,
    paidAt: new Date().toISOString().split("T")[0],
    referenceNo: "",
  });

  // Modal State for Paying Utility / Cargo / Equipment
  const [payOperationalModal, setPayOperationalModal] =
    useState<OperationalPayModalState | null>(null);

  const [isSubmittingPayment, setIsSubmittingPayment] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // Modal State for Receipt Viewer
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [receiptLoading, setReceiptLoading] = useState<boolean>(false);

  // Modal State for Lease SSRD Receipt Viewer
  const [showLeaseReceiptModal, setShowLeaseReceiptModal] = useState<boolean>(false);
  const [leaseReceiptLoading, setLeaseReceiptLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchLeases();
    fetchAssets();
    fetchRevenueSummary();
    fetchUtilities();
    fetchCargoRecords();
    fetchEquipmentRentals();
  }, [
    fetchLeases,
    fetchAssets,
    fetchRevenueSummary,
    fetchUtilities,
    fetchCargoRecords,
    fetchEquipmentRentals,
  ]);

  // Helper sisa hari sewa
  const getDaysRemaining = (endDateStr: string): number => {
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

  // Helper total bayar vs total tagihan sewa
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

  // Filter leases
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

  // Filter assets
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (assetTypeFilter !== "ALL" && asset.assetType !== assetTypeFilter) return false;
    return true;
  });

  // Filter utilities
  const filteredUtilities = utilities.filter((u) => {
    const matchesSearch =
      u.readingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.utilityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.asset?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.visit?.vessel?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (operationalFilter === "UNPAID") return u.paymentStatus === "UNPAID";
    if (operationalFilter === "PAID") return u.paymentStatus === "PAID";
    return true;
  });

  // Filter cargo records
  const filteredCargo = cargoRecords.filter((c) => {
    const matchesSearch =
      c.recordNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.cargoCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.visit?.vessel?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (operationalFilter === "UNPAID") return c.paymentStatus === "UNPAID";
    if (operationalFilter === "PAID") return c.paymentStatus === "PAID";
    return true;
  });

  // Filter equipment rentals
  const filteredEquipment = equipmentRentals.filter((e) => {
    const matchesSearch =
      e.rentalNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.equipmentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.capacityLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.visit?.vessel?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (operationalFilter === "UNPAID") return e.paymentStatus === "UNPAID";
    if (operationalFilter === "PAID") return e.paymentStatus === "PAID";
    return true;
  });

  // Metrik Statistik Gabungan
  const totalLeaseRevenueIdr = leases.reduce((acc, l) => {
    const paid = (l.payments || []).reduce((pAcc, p) => pAcc + Number(p.amountIdr || 0), 0);
    return acc + paid;
  }, 0);

  const totalOutstandingLeaseIdr = leases.reduce((acc, l) => {
    const { remaining } = getPaymentSummary(l);
    return acc + remaining;
  }, 0);

  // Realisasi Kasda Utilitas & Kargo (Sudah Bayar)
  const paidUtilitiesIdr = utilities
    .filter((u) => u.paymentStatus === "PAID")
    .reduce((acc, u) => acc + Number(u.totalAmountIdr || 0), 0);

  const paidCargoIdr = cargoRecords
    .filter((c) => c.paymentStatus === "PAID")
    .reduce((acc, c) => acc + Number(c.totalAmountIdr || 0), 0);

  const paidEquipmentIdr = equipmentRentals
    .filter((e) => e.paymentStatus === "PAID")
    .reduce((acc, e) => acc + Number(e.totalAmountIdr || 0), 0);

  const totalOperationalRevenueIdr = paidUtilitiesIdr + paidCargoIdr + paidEquipmentIdr;

  // Piutang Utilitas, Kargo & Alat (Belum Bayar)
  const unpaidUtilitiesIdr = utilities
    .filter((u) => u.paymentStatus === "UNPAID")
    .reduce((acc, u) => acc + Number(u.totalAmountIdr || 0), 0);

  const unpaidCargoIdr = cargoRecords
    .filter((c) => c.paymentStatus === "UNPAID")
    .reduce((acc, c) => acc + Number(c.totalAmountIdr || 0), 0);

  const unpaidEquipmentIdr = equipmentRentals
    .filter((e) => e.paymentStatus === "UNPAID")
    .reduce((acc, e) => acc + Number(e.totalAmountIdr || 0), 0);

  const totalOutstandingOperationalIdr =
    unpaidUtilitiesIdr + unpaidCargoIdr + unpaidEquipmentIdr;

  // Handler Buka Modal Bayar Sewa Lahan/Kios
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
  const handleSaveLeasePayment = async () => {
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

  // Handler Konfirmasi Bayar Operasional (Utilitas / Kargo / Alat)
  const handleConfirmOperationalPayment = async () => {
    if (!payOperationalModal) return;

    setIsSubmittingPayment(true);
    setActionErrorMsg(null);
    try {
      const idempotencyKey = `KASDA-${payOperationalModal.type}-${payOperationalModal.id}-${Date.now()}`;
      if (payOperationalModal.type === "UTILITY") {
        await payUtility(payOperationalModal.id, idempotencyKey);
      } else if (payOperationalModal.type === "CARGO") {
        await payCargo(payOperationalModal.id, idempotencyKey);
      } else if (payOperationalModal.type === "EQUIPMENT") {
        await payEquipment(payOperationalModal.id, idempotencyKey);
      }

      setActionSuccessMsg(
        `Penerimaan kasda atas ${payOperationalModal.title} (${payOperationalModal.identifierNumber}) sebesar Rp ${payOperationalModal.amountIdr.toLocaleString(
          "id-ID"
        )} berhasil disetor dan disahkan!`
      );

      setTimeout(() => {
        setPayOperationalModal(null);
        setActionSuccessMsg(null);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memproses pembayaran kasda.";
      setActionErrorMsg(msg);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Handler Lihat Kuitansi SSRD Utilitas
  const handleViewUtilityReceipt = async (id: number) => {
    setReceiptLoading(true);
    setShowReceiptModal(true);
    try {
      await fetchUtilityReceipt(id);
    } catch (err: unknown) {
      console.error("Gagal memuat kuitansi:", err);
    } finally {
      setReceiptLoading(false);
    }
  };

  // Handler Lihat Kuitansi e-SSRD Sewa Aset/Kios (Perda Mimika No. 4/2023)
  const handleViewLeaseReceipt = async (paymentId: number) => {
    setLeaseReceiptLoading(true);
    setShowLeaseReceiptModal(true);
    try {
      await fetchLeasePaymentReceipt(paymentId);
    } catch (err: unknown) {
      console.error("Gagal memuat kuitansi e-SSRD sewa aset:", err);
    } finally {
      setLeaseReceiptLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. HEADER SECTION & TAB NAVIGASI UTAMA                    */}
      {/* ========================================================= */}
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
            onClick={() => {
              setActiveTab("LEASES");
              setSearchQuery("");
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "LEASES"
                ? "bg-[#0B241E] text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Store className="w-3.5 h-3.5 text-[#D97706]" />
            Sewa Kios ({leases.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("UTILITIES");
              setSearchQuery("");
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "UTILITIES"
                ? "bg-[#0B241E] text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Utilitas Dermaga ({utilities.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("CARGO");
              setSearchQuery("");
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "CARGO"
                ? "bg-[#0B241E] text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Boxes className="w-3.5 h-3.5 text-emerald-500" />
            Kargo ({cargoRecords.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("EQUIPMENT");
              setSearchQuery("");
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "EQUIPMENT"
                ? "bg-[#0B241E] text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-blue-500" />
            Alat Pelabuhan ({equipmentRentals.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("ASSETS");
              setSearchQuery("");
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "ASSETS"
                ? "bg-[#0B241E] text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Warehouse className="w-3.5 h-3.5 text-gray-400" />
            Master Aset ({assets.length})
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. STATISTIC METRIC CARDS                                 */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Realisasi Kasda Sewa Kios */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Realisasi Sewa Kios BMD
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
              Sewa lahan, kios & gedung pelabuhan
            </p>
          </div>
        </div>

        {/* Card 2: Realisasi Kasda Utilitas & Operasional */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Realisasi Utilitas & Operasional
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-blue-700">
              Rp {totalOperationalRevenueIdr.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Air bersih, listrik, kargo & alat
            </p>
          </div>
        </div>

        {/* Card 3: Piutang Operasional (Belum Disetor) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Piutang Operasional Berjalan
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-600">
              Rp {totalOutstandingOperationalIdr.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Menunggu pembayaran kasir/loket
            </p>
          </div>
        </div>

        {/* Card 4: Piutang Sewa Tenant */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Piutang Sewa Tenant
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600">
              Rp {totalOutstandingLeaseIdr.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Kontrak sewa belum diselesaikan
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. TAB 1: KONTRAK SEWA TENANT (LEASES)                    */}
      {/* ========================================================= */}
      {activeTab === "LEASES" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
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
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleOpenPaymentModal(lease)}
                              className="px-3 py-1.5 bg-[#0B241E] hover:bg-[#133D31] text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                              title="Catat Pembayaran Kasda"
                            >
                              <Coins className="w-3.5 h-3.5 text-[#D97706]" />
                              Bayar
                            </button>
                            {lease.payments && lease.payments.length > 0 && (
                              <button
                                onClick={() =>
                                  handleViewLeaseReceipt(
                                    lease.payments![lease.payments!.length - 1].id
                                  )
                                }
                                className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                                title={`Cetak Kuitansi e-SSRD Kasda (${lease.payments.length} transaksi)`}
                              >
                                <Printer className="w-3.5 h-3.5 text-gray-600" />
                                e-SSRD
                              </button>
                            )}
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
      {/* 4. TAB 2: UTILITAS DERMAGA (AIR BERSIH & LISTRIK)          */}
      {/* ========================================================= */}
      {activeTab === "UTILITIES" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nomor meteran, fasilitas, atau kapal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0B241E] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <span className="text-xs text-gray-400 font-medium">Status Setoran:</span>
              <button
                onClick={() => setOperationalFilter("ALL")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  operationalFilter === "ALL"
                    ? "bg-[#0B241E] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Semua ({utilities.length})
              </button>
              <button
                onClick={() => setOperationalFilter("UNPAID")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  operationalFilter === "UNPAID"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                Menunggu Pembayaran
              </button>
              <button
                onClick={() => setOperationalFilter("PAID")}
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

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFB] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">No. Bukti & Jenis</th>
                  <th className="py-3 px-4">Fasilitas / Kapal Objek</th>
                  <th className="py-3 px-4">Pencatatan Meteran</th>
                  <th className="py-3 px-4">Volume Terpakai</th>
                  <th className="py-3 px-4">Tarif Satuan</th>
                  <th className="py-3 px-4">Total Tagihan</th>
                  <th className="py-3 px-4">Status Kasda</th>
                  <th className="py-3 px-4 text-center">Aksi Bendahara</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredUtilities.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      Tidak ada pencatatan utilitas yang cocok dengan kriteria.
                    </td>
                  </tr>
                ) : (
                  filteredUtilities.map((u) => {
                    const isPaid = u.paymentStatus === "PAID";
                    return (
                      <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#0B241E] flex items-center gap-1.5 font-mono">
                            {u.utilityType === "AIR_BERSIH" ? (
                              <Droplets className="w-3.5 h-3.5 text-blue-500" />
                            ) : (
                              <Zap className="w-3.5 h-3.5 text-amber-500" />
                            )}
                            {u.readingNumber}
                          </div>
                          <div className="text-[11px] text-gray-500 font-semibold mt-0.5">
                            {u.utilityType === "AIR_BERSIH" ? "Air Bersih Kapal/Tenant" : "Energi Listrik Dermaga"}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-900">
                            {u.asset?.name || u.visit?.vessel?.name || "Fasilitas Pelabuhan Poumako"}
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                            {u.asset?.assetCode || u.visit?.visitNumber || "Umum"}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-gray-700">
                          <div>Awal: {Number(u.meterStart).toLocaleString("id-ID")}</div>
                          <div>Akhir: {Number(u.meterEnd).toLocaleString("id-ID")}</div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-gray-900">
                          {Number(u.volumeConsumed).toLocaleString("id-ID")} {u.unitLabel}
                        </td>

                        <td className="py-3 px-4 font-mono text-gray-700">
                          Rp {Number(u.ratePerUnitIdr).toLocaleString("id-ID")} / {u.unitLabel}
                        </td>

                        <td className="py-3 px-4 font-mono font-black text-[#0B241E]">
                          Rp {Number(u.totalAmountIdr).toLocaleString("id-ID")}
                        </td>

                        <td className="py-3 px-4">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Lunas Kasda
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3" />
                              Belum Bayar
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {!isPaid ? (
                              <button
                                onClick={() =>
                                  setPayOperationalModal({
                                    isOpen: true,
                                    type: "UTILITY",
                                    id: u.id,
                                    title: "Retribusi Utilitas Dermaga",
                                    identifierNumber: u.readingNumber,
                                    amountIdr: Number(u.totalAmountIdr),
                                    payerLabel: u.asset?.name || u.visit?.vessel?.name || "Pemakai Jasa Dermaga",
                                  })
                                }
                                className="px-3 py-1.5 bg-[#0B241E] hover:bg-[#133D31] text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <Coins className="w-3.5 h-3.5 text-[#D97706]" />
                                Setor Kasda
                              </button>
                            ) : (
                              <button
                                onClick={() => handleViewUtilityReceipt(u.id)}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                                title="Lihat Kuitansi e-SSRD"
                              >
                                <Printer className="w-3.5 h-3.5 text-gray-600" />
                                Cetak e-SSRD
                              </button>
                            )}
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
      {/* 5. TAB 3: PELAYANAN KARGO / BONGKAR MUAT                   */}
      {/* ========================================================= */}
      {activeTab === "CARGO" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nomor registrasi, kargo, atau kapal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0B241E] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <span className="text-xs text-gray-400 font-medium">Status Kasda:</span>
              <button
                onClick={() => setOperationalFilter("ALL")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  operationalFilter === "ALL"
                    ? "bg-[#0B241E] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Semua ({cargoRecords.length})
              </button>
              <button
                onClick={() => setOperationalFilter("UNPAID")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  operationalFilter === "UNPAID"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                Menunggu Pembayaran
              </button>
              <button
                onClick={() => setOperationalFilter("PAID")}
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

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFB] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">No. Registrasi Kargo</th>
                  <th className="py-3 px-4">Kategori & Uraian Barang</th>
                  <th className="py-3 px-4">Kapal Pengangkut</th>
                  <th className="py-3 px-4">Kuantitas</th>
                  <th className="py-3 px-4">Durasi Penumpukan</th>
                  <th className="py-3 px-4">Total Retribusi</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Aksi Bendahara</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredCargo.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      Tidak ada pencatatan kargo yang cocok dengan kriteria.
                    </td>
                  </tr>
                ) : (
                  filteredCargo.map((c) => {
                    const isPaid = c.paymentStatus === "PAID";
                    return (
                      <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                          <div className="flex items-center gap-1.5">
                            <Boxes className="w-3.5 h-3.5 text-emerald-600" />
                            {c.recordNumber}
                          </div>
                          <div className="text-[10px] text-gray-400 font-sans mt-0.5">
                            {c.storageLocation ? c.storageLocation.replace("_", " ") : "Dermaga"}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-gray-900 block">
                            {c.cargoCategory.replace("_", " ")}
                          </span>
                          <span className="text-gray-500 text-[11px] block mt-0.5">
                            {c.description}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-800">
                            {c.visit?.vessel?.name || "Kapal Non-Reguler"}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            {c.visit?.visitNumber || "-"}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-gray-900">
                          {Number(c.quantity).toLocaleString("id-ID")} {c.unitLabel}
                        </td>

                        <td className="py-3 px-4 text-gray-700 font-medium">
                          {c.durationDays} Hari
                        </td>

                        <td className="py-3 px-4 font-mono font-black text-[#0B241E]">
                          Rp {Number(c.totalAmountIdr).toLocaleString("id-ID")}
                        </td>

                        <td className="py-3 px-4">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Lunas Kasda
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3" />
                              Belum Bayar
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          {!isPaid ? (
                            <button
                              onClick={() =>
                                setPayOperationalModal({
                                  isOpen: true,
                                  type: "CARGO",
                                  id: c.id,
                                  title: "Retribusi Pelayanan Kargo",
                                  identifierNumber: c.recordNumber,
                                  amountIdr: Number(c.totalAmountIdr),
                                  payerLabel: c.visit?.vessel?.name || c.description,
                                })
                              }
                              className="px-3 py-1.5 bg-[#0B241E] hover:bg-[#133D31] text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer mx-auto"
                            >
                              <Coins className="w-3.5 h-3.5 text-[#D97706]" />
                              Setor Kasda
                            </button>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-mono">
                              {c.paidAt ? new Date(c.paidAt).toLocaleDateString("id-ID") : "Terverifikasi"}
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
      {/* 6. TAB 4: ALAT PELABUHAN (CRANE & FORKLIFT)               */}
      {/* ========================================================= */}
      {activeTab === "EQUIPMENT" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nomor sewa alat, jenis unit, atau kapal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0B241E] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <span className="text-xs text-gray-400 font-medium">Status Kasda:</span>
              <button
                onClick={() => setOperationalFilter("ALL")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  operationalFilter === "ALL"
                    ? "bg-[#0B241E] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Semua ({equipmentRentals.length})
              </button>
              <button
                onClick={() => setOperationalFilter("UNPAID")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  operationalFilter === "UNPAID"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                Menunggu Pembayaran
              </button>
              <button
                onClick={() => setOperationalFilter("PAID")}
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

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFB] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">No. Registrasi Sewa</th>
                  <th className="py-3 px-4">Jenis Unit Alat</th>
                  <th className="py-3 px-4">Kapal / Pemakai Jasa</th>
                  <th className="py-3 px-4">Jumlah Unit</th>
                  <th className="py-3 px-4">Durasi Pemakaian</th>
                  <th className="py-3 px-4">Tarif per Jam</th>
                  <th className="py-3 px-4">Total Tagihan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Aksi Bendahara</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredEquipment.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400">
                      Tidak ada sewa alat pelabuhan yang cocok dengan kriteria.
                    </td>
                  </tr>
                ) : (
                  filteredEquipment.map((e) => {
                    const isPaid = e.paymentStatus === "PAID";
                    return (
                      <tr key={e.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                          <div className="flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-blue-600" />
                            {e.rentalNumber}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-gray-900 block">
                            {e.equipmentType.replace("_", " ")}
                          </span>
                          <span className="text-gray-500 text-[11px] block mt-0.5">
                            Kapasitas: {e.capacityLabel}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-800">
                            {e.visit?.vessel?.name || "Operasional Dermaga"}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            {e.visit?.visitNumber || "-"}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-medium text-gray-800">
                          {e.unitCount} Unit
                        </td>

                        <td className="py-3 px-4 font-mono font-medium text-gray-800">
                          {Number(e.durationHours)} Jam
                        </td>

                        <td className="py-3 px-4 font-mono text-gray-700">
                          Rp {Number(e.ratePerHourIdr).toLocaleString("id-ID")}
                        </td>

                        <td className="py-3 px-4 font-mono font-black text-[#0B241E]">
                          Rp {Number(e.totalAmountIdr).toLocaleString("id-ID")}
                        </td>

                        <td className="py-3 px-4">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Lunas Kasda
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3" />
                              Belum Bayar
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          {!isPaid ? (
                            <button
                              onClick={() =>
                                setPayOperationalModal({
                                  isOpen: true,
                                  type: "EQUIPMENT",
                                  id: e.id,
                                  title: "Retribusi Sewa Alat Pelabuhan",
                                  identifierNumber: e.rentalNumber,
                                  amountIdr: Number(e.totalAmountIdr),
                                  payerLabel: e.visit?.vessel?.name || e.capacityLabel,
                                })
                              }
                              className="px-3 py-1.5 bg-[#0B241E] hover:bg-[#133D31] text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer mx-auto"
                            >
                              <Coins className="w-3.5 h-3.5 text-[#D97706]" />
                              Setor Kasda
                            </button>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-mono">
                              {e.paidAt ? new Date(e.paidAt).toLocaleDateString("id-ID") : "Terverifikasi"}
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
      {/* 7. TAB 5: MASTER ASET PELABUHAN (ASSETS)                  */}
      {/* ========================================================= */}
      {activeTab === "ASSETS" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
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
      {/* 8. MODAL: CATAT PEMBAYARAN KASDA SEWA TENANT */}
      <LeasePaymentRecordModal
        selectedLease={selectedLeaseForPayment}
        paymentForm={paymentForm}
        onChangePaymentForm={setPaymentForm}
        actionSuccessMsg={actionSuccessMsg}
        actionErrorMsg={actionErrorMsg}
        isSubmitting={isSubmittingPayment}
        onSave={handleSaveLeasePayment}
        onClose={() => setSelectedLeaseForPayment(null)}
      />

      {/* 9. MODAL: KONFIRMASI BAYAR OPERASIONAL (UTILITAS/CARGO/EQ) */}
      <OperationalPaymentModal
        modal={payOperationalModal}
        actionSuccessMsg={actionSuccessMsg}
        actionErrorMsg={actionErrorMsg}
        isSubmitting={isSubmittingPayment}
        onConfirm={handleConfirmOperationalPayment}
        onClose={() => setPayOperationalModal(null)}
      />

      {/* 10. MODAL: DOKUMEN CETAK KUITANSI e-SSRD UTILITAS */}
      <UtilityReceiptModal
        isOpen={showReceiptModal}
        isLoading={receiptLoading}
        activeReceipt={activeReceipt}
        onClose={() => {
          setShowReceiptModal(false);
          clearActiveReceipt();
        }}
      />

      {/* 11. MODAL BUKTI PEMBAYARAN e-SSRD SEWA ASET/KIOS DAERAH */}
      <LeaseReceiptModal
        isOpen={showLeaseReceiptModal}
        isLoading={leaseReceiptLoading}
        activeLeaseReceipt={activeLeaseReceipt}
        onClose={() => {
          setShowLeaseReceiptModal(false);
          clearActiveLeaseReceipt();
        }}
      />
    </div>
  );
}
