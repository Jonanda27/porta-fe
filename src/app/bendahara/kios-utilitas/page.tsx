"use client";

import { useState, useEffect } from "react";
import { useBillingStore } from "@/store/billing.store";
import { useCargoUtilityStore } from "@/store/cargo-utility.store";
import { AssetLease, RecordLeasePaymentDto } from "@/types/asset.types";
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
import {
  KiosUtilitasHeader,
  KiosUtilitasTab,
} from "@/components/bendahara/kios-utilitas/KiosUtilitasHeader";
import { KiosUtilitasStatsCards } from "@/components/bendahara/kios-utilitas/KiosUtilitasStatsCards";
import {
  KiosLeasesSection,
  LeaseFilterType,
} from "@/components/bendahara/kios-utilitas/KiosLeasesSection";
import { UtilityBillingSection } from "@/components/bendahara/kios-utilitas/UtilityBillingSection";
import { CargoRevenueSection } from "@/components/bendahara/kios-utilitas/CargoRevenueSection";
import { EquipmentRentalSection } from "@/components/bendahara/kios-utilitas/EquipmentRentalSection";
import { PortAssetsSection } from "@/components/bendahara/kios-utilitas/PortAssetsSection";
import { OperationalFilterType } from "@/components/bendahara/kios-utilitas/OperationalFilterBar";
import { getPaymentSummary } from "@/components/bendahara/kios-utilitas/lease-utils";

export default function KiosDanUtilitasPage() {
  const {
    leases,
    assets,
    activeLeaseReceipt,
    fetchLeases,
    fetchAssets,
    fetchRevenueSummary,
    recordLeasePayment,
    fetchLeasePaymentReceipt,
    clearActiveLeaseReceipt,
  } = useBillingStore();

  const {
    utilities,
    cargoRecords,
    equipmentRentals,
    activeReceipt,
    fetchUtilities,
    fetchCargoRecords,
    fetchEquipmentRentals,
    payUtility,
    payCargo,
    payEquipment,
    fetchUtilityReceipt,
    clearActiveReceipt,
  } = useCargoUtilityStore();

  const [activeTab, setActiveTab] = useState<KiosUtilitasTab>("LEASES");

  // Filter States
  const [leaseFilter, setLeaseFilter] = useState<LeaseFilterType>("ALL");
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>("ALL");
  const [operationalFilter, setOperationalFilter] = useState<OperationalFilterType>("ALL");
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

  const handleTabChange = (tab: KiosUtilitasTab) => {
    setActiveTab(tab);
    setSearchQuery("");
  };

  // Metrik Statistik Gabungan
  const totalLeaseRevenueIdr = leases.reduce((acc, l) => {
    const paid = (l.payments || []).reduce((pAcc, p) => pAcc + Number(p.amountIdr || 0), 0);
    return acc + paid;
  }, 0);

  const totalOutstandingLeaseIdr = leases.reduce((acc, l) => {
    const { remaining } = getPaymentSummary(l);
    return acc + remaining;
  }, 0);

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
      <KiosUtilitasHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={{
          leases: leases.length,
          utilities: utilities.length,
          cargo: cargoRecords.length,
          equipment: equipmentRentals.length,
          assets: assets.length,
        }}
      />

      <KiosUtilitasStatsCards
        totalLeaseRevenueIdr={totalLeaseRevenueIdr}
        totalOperationalRevenueIdr={totalOperationalRevenueIdr}
        totalOutstandingOperationalIdr={totalOutstandingOperationalIdr}
        totalOutstandingLeaseIdr={totalOutstandingLeaseIdr}
      />

      {activeTab === "LEASES" && (
        <KiosLeasesSection
          leases={leases}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          leaseFilter={leaseFilter}
          onLeaseFilterChange={setLeaseFilter}
          onOpenPaymentModal={handleOpenPaymentModal}
          onViewLeaseReceipt={handleViewLeaseReceipt}
        />
      )}

      {activeTab === "UTILITIES" && (
        <UtilityBillingSection
          utilities={utilities}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          operationalFilter={operationalFilter}
          onOperationalFilterChange={setOperationalFilter}
          onOpenPayModal={setPayOperationalModal}
          onViewUtilityReceipt={handleViewUtilityReceipt}
        />
      )}

      {activeTab === "CARGO" && (
        <CargoRevenueSection
          cargoRecords={cargoRecords}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          operationalFilter={operationalFilter}
          onOperationalFilterChange={setOperationalFilter}
          onOpenPayModal={setPayOperationalModal}
        />
      )}

      {activeTab === "EQUIPMENT" && (
        <EquipmentRentalSection
          equipmentRentals={equipmentRentals}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          operationalFilter={operationalFilter}
          onOperationalFilterChange={setOperationalFilter}
          onOpenPayModal={setPayOperationalModal}
        />
      )}

      {activeTab === "ASSETS" && (
        <PortAssetsSection
          assets={assets}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          assetTypeFilter={assetTypeFilter}
          onAssetTypeFilterChange={setAssetTypeFilter}
        />
      )}

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

      <OperationalPaymentModal
        modal={payOperationalModal}
        actionSuccessMsg={actionSuccessMsg}
        actionErrorMsg={actionErrorMsg}
        isSubmitting={isSubmittingPayment}
        onConfirm={handleConfirmOperationalPayment}
        onClose={() => setPayOperationalModal(null)}
      />

      <UtilityReceiptModal
        isOpen={showReceiptModal}
        isLoading={receiptLoading}
        activeReceipt={activeReceipt}
        onClose={() => {
          setShowReceiptModal(false);
          clearActiveReceipt();
        }}
      />

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
