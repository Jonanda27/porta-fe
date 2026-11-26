"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { useBillingStore } from "@/store/billing.store";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/toast.store";
import { PaymentService } from "@/services/payment.service";
import {
  BillingInvoice,
  UnifiedPaidRecord,
  UnpaidLeaseSummary,
} from "@/types/billing.types";
import { PrintReceiptModal } from "@/components/tenant/PrintReceiptModal";
import { InvoicePaymentModal } from "@/components/kapal/penagihan/InvoicePaymentModal";
import { InvoiceSsrdModal } from "@/components/kapal/penagihan/InvoiceSsrdModal";
import { LeasePaymentModal } from "@/components/kapal/penagihan/LeasePaymentModal";
import { PenagihanKpiDeck } from "@/components/kapal/penagihan/PenagihanKpiDeck";
import {
  PenagihanCategoryFilter,
  PenagihanTab,
  PenagihanToolbar,
} from "@/components/kapal/penagihan/PenagihanToolbar";
import { UnpaidBillingSection } from "@/components/kapal/penagihan/UnpaidBillingSection";
import { PaymentHistoryTable } from "@/components/kapal/penagihan/PaymentHistoryTable";
import {
  buildUnifiedPaidRecords,
  computeUnpaidLeases,
  extractPaidLeasePayments,
  getVirtualAccountNo,
} from "@/lib/kapal-billing";

export default function KapalPenagihanPage() {
  const { user } = useAuthStore();
  const {
    invoices,
    leases,
    isLoading,
    error,
    activePrintPayload,
    activeLeaseReceipt,
    paymentConfig,
    activeCheckoutSession,
    fetchInvoices,
    fetchLeases,
    fetchPaymentConfig,
    fetchPrintPayload,
    fetchLeasePaymentReceipt,
    clearActiveLeaseReceipt,
    checkoutPayment,
    clearCheckoutSession,
    submitPaymentProof,
  } = useBillingStore();

  const [activeTab, setActiveTab] = useState<PenagihanTab>("unpaid");
  const [categoryFilter, setCategoryFilter] = useState<PenagihanCategoryFilter>("ALL");
  const [selectedInvoice, setSelectedInvoice] = useState<BillingInvoice | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isSSRDModalOpen, setIsSSRDModalOpen] = useState<boolean>(false);
  const [paymentMethodTab, setPaymentMethodTab] = useState<"gateway" | "manual">("gateway");
  const [selectedBank, setSelectedBank] = useState<string>("bank_papua");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [refNumberInput, setRefNumberInput] = useState<string>("");
  const [paymentFileInput, setPaymentFileInput] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // State khusus pembayaran & kuitansi e-SSRD Pengajuan Ruangan (Asset Lease)
  const [selectedLeaseForPayment, setSelectedLeaseForPayment] =
    useState<UnpaidLeaseSummary | null>(null);
  const [isLeasePaymentModalOpen, setIsLeasePaymentModalOpen] = useState<boolean>(false);
  const [leasePaymentTab, setLeasePaymentTab] = useState<"gateway" | "manual">("gateway");
  const [isLeaseSSRDModalOpen, setIsLeaseSSRDModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchInvoices();
    fetchLeases();
    fetchPaymentConfig();
  }, [fetchInvoices, fetchLeases, fetchPaymentConfig]);

  const unpaidInvoices = useMemo(() => {
    return invoices.filter(
      (inv) =>
        inv.status === "ISSUED" ||
        inv.status === "DRAFT" ||
        inv.status === "PARTIAL"
    );
  }, [invoices]);

  const paidInvoices = useMemo(() => {
    return invoices.filter((inv) => inv.status === "PAID");
  }, [invoices]);

  // Hitung tagihan sewa ruangan (PKS Aktif yang masih memiliki sisa tagihan)
  const unpaidLeases = useMemo<UnpaidLeaseSummary[]>(
    () => computeUnpaidLeases(leases),
    [leases]
  );

  // Daftar seluruh pembayaran sewa ruangan yang sudah lunas (untuk tab e-SSRD)
  const paidLeasePayments = useMemo(
    () => extractPaidLeasePayments(leases),
    [leases]
  );

  const filteredUnpaid = useMemo(() => {
    if (categoryFilter === "RUANGAN") return [];
    if (!searchQuery.trim()) return unpaidInvoices;
    const q = searchQuery.toLowerCase();
    return unpaidInvoices.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        (inv.visit?.vessel?.name && inv.visit.vessel.name.toLowerCase().includes(q))
    );
  }, [unpaidInvoices, searchQuery, categoryFilter]);

  const filteredUnpaidLeases = useMemo(() => {
    if (categoryFilter === "DERMAGA") return [];
    if (!searchQuery.trim()) return unpaidLeases;
    const q = searchQuery.toLowerCase();
    return unpaidLeases.filter(
      ({ lease }) =>
        lease.contractNumber.toLowerCase().includes(q) ||
        (lease.asset?.name && lease.asset.name.toLowerCase().includes(q)) ||
        (lease.asset?.assetCode && lease.asset.assetCode.toLowerCase().includes(q))
    );
  }, [unpaidLeases, searchQuery, categoryFilter]);

  const unifiedPaidRecords = useMemo<UnifiedPaidRecord[]>(
    () => buildUnifiedPaidRecords(paidInvoices, paidLeasePayments, searchQuery, categoryFilter),
    [paidInvoices, paidLeasePayments, searchQuery, categoryFilter]
  );

  const totalUnpaidCount = unpaidInvoices.length + unpaidLeases.length;
  const totalPaidCount = paidInvoices.length + paidLeasePayments.length;

  const totalUnpaid = useMemo(() => {
    const invSum = unpaidInvoices.reduce(
      (acc, inv) => acc + Number(inv.totalAmountIdr || 0),
      0
    );
    const leaseSum = unpaidLeases.reduce((acc, item) => acc + item.remaining, 0);
    return invSum + leaseSum;
  }, [unpaidInvoices, unpaidLeases]);

  const totalPaid = useMemo(() => {
    const invSum = paidInvoices.reduce(
      (acc, inv) => acc + Number(inv.totalAmountIdr || 0),
      0
    );
    const leaseSum = paidLeasePayments.reduce(
      (acc, entry) => acc + Number(entry.payment.amountIdr || 0),
      0
    );
    return invSum + leaseSum;
  }, [paidInvoices, paidLeasePayments]);

  const runInvoiceGatewayCheckout = async (inv: BillingInvoice) => {
    setIsCheckingOut(true);
    setErrorMessage(null);

    try {
      const session = await checkoutPayment({
        targetType: "INVOICE",
        targetId: inv.id,
      });
      toast.success(
        "Sesi Pembayaran Dibuat",
        `Sesi pembayaran online #${session.orderId} siap di panel pembayaran.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memulai sesi pembayaran gateway digital.";
      setErrorMessage(msg);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleOpenPayment = (inv: BillingInvoice, defaultTab: "gateway" | "manual" = "gateway") => {
    const gatewayEnabled = paymentConfig ? paymentConfig.gatewayEnabled : true;
    const effectiveTab = defaultTab === "gateway" && !gatewayEnabled ? "manual" : defaultTab;
    setSelectedInvoice(inv);
    setPaymentMethodTab(effectiveTab);
    clearCheckoutSession();
    setRefNumberInput(`TRX-${Date.now().toString().slice(-6)}`);
    setPaymentFileInput(null);
    setErrorMessage(null);
    setIsPaymentModalOpen(true);
    if (effectiveTab === "gateway" && gatewayEnabled) {
      void runInvoiceGatewayCheckout(inv);
    }
  };

  const handleGatewayCheckout = async () => {
    if (!selectedInvoice) return;
    await runInvoiceGatewayCheckout(selectedInvoice);
  };

  const handleCheckPaymentStatus = async () => {
    setIsCheckingOut(true);
    try {
      const orderId = useBillingStore.getState().activeCheckoutSession?.orderId;
      if (orderId) {
        await PaymentService.syncStatus(orderId);
      }
      await fetchInvoices();
      const current = useBillingStore.getState().invoices.find((i) => i.id === selectedInvoice?.id);
      if (current?.status === "PAID") {
        setIsPaymentModalOpen(false);
        clearCheckoutSession();
        toast.success(
          "Pembayaran Terverifikasi",
          `Pembayaran tagihan ${selectedInvoice?.invoiceNumber} telah terverifikasi LUNAS.`
        );
      } else {
        toast.info("Status Disinkronkan", "Status tagihan berhasil disinkronkan.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyinkronkan status tagihan.";
      setErrorMessage(msg);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleOpenSSRD = async (inv: BillingInvoice) => {
    setSelectedInvoice(inv);
    setIsSSRDModalOpen(true);
    try {
      await fetchPrintPayload(inv.id);
    } catch {
      // Fallback is handled by selectedInvoice
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedInvoice) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      await submitPaymentProof(
        selectedInvoice.id,
        {
          idempotencyKey: `PAY-${selectedInvoice.invoiceNumber}-${Date.now()}`,
          amountIdr: Number(selectedInvoice.totalAmountIdr),
          method: "BANK_TRANSFER",
          referenceNo: refNumberInput || `REF-RKUD-${Date.now().toString().slice(-8)}`,
          paidAt: new Date().toISOString(),
        },
        paymentFileInput || undefined
      );

      setIsPaymentModalOpen(false);
      toast.success(
        "Bukti Pembayaran Terkirim",
        `Bukti pembayaran untuk invoice ${selectedInvoice.invoiceNumber} berhasil dikirim ke RKUD Bank Kas Daerah Mimika.`
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan saat memproses pembayaran.";
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyVA = () => {
    if (!selectedInvoice) return;
    const va = getVirtualAccountNo(selectedInvoice, selectedBank);
    navigator.clipboard?.writeText(va.replace(/\s+/g, ""));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const runLeaseGatewayCheckout = async (item: UnpaidLeaseSummary) => {
    setIsCheckingOut(true);
    setErrorMessage(null);
    try {
      const session = await checkoutPayment({
        targetType: "ASSET_LEASE",
        targetId: item.lease.id,
      });
      toast.success(
        "Sesi Pembayaran Sewa Dibuat",
        `Sesi pembayaran sewa ruangan #${session.orderId} siap di panel pembayaran.`
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal memulai sesi pembayaran online sewa ruangan.";
      setErrorMessage(msg);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Handler Pembayaran & e-SSRD Pengajuan Ruangan (Asset Lease)
  const handleOpenLeasePayment = (
    item: UnpaidLeaseSummary,
    defaultTab: "gateway" | "manual" = "gateway"
  ) => {
    const gatewayEnabled = paymentConfig ? paymentConfig.gatewayEnabled : true;
    const effectiveTab = defaultTab === "gateway" && !gatewayEnabled ? "manual" : defaultTab;
    setSelectedLeaseForPayment(item);
    setLeasePaymentTab(effectiveTab);
    clearCheckoutSession();
    setErrorMessage(null);
    setIsLeasePaymentModalOpen(true);
    if (effectiveTab === "gateway" && gatewayEnabled) {
      void runLeaseGatewayCheckout(item);
    }
  };

  const handleLeaseGatewayCheckout = async () => {
    if (!selectedLeaseForPayment) return;
    await runLeaseGatewayCheckout(selectedLeaseForPayment);
  };

  const handleCheckLeasePaymentStatus = async () => {
    setIsCheckingOut(true);
    try {
      const orderId = useBillingStore.getState().activeCheckoutSession?.orderId;
      if (orderId) {
        await PaymentService.syncStatus(orderId);
      }
      await fetchLeases();
      const updatedLease = useBillingStore
        .getState()
        .leases.find((l) => l.id === selectedLeaseForPayment?.lease.id);
      if (updatedLease) {
        const paid = (updatedLease.payments || []).reduce(
          (sum, p) => sum + Number(p.amountIdr || 0),
          0
        );
        const rem = Math.max(0, Number(updatedLease.totalAnnualAmountIdr || 0) - paid);
        if (rem === 0 && paid > 0) {
          setIsLeasePaymentModalOpen(false);
          clearCheckoutSession();
          toast.success(
            "Pembayaran Sewa Terverifikasi",
            `Pembayaran sewa ruangan ${updatedLease.contractNumber} telah terverifikasi LUNAS.`
          );
          return;
        }
      }
      toast.info("Status Disinkronkan", "Status pembayaran sewa ruangan berhasil disinkronkan.");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menyinkronkan status pembayaran sewa.";
      setErrorMessage(msg);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleOpenLeaseSSRD = async (paymentId: number) => {
    setErrorMessage(null);
    try {
      await fetchLeasePaymentReceipt(paymentId);
      setIsLeaseSSRDModalOpen(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal memuat kuitansi e-SSRD sewa ruangan.";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Global Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchInvoices()}
            className="underline font-bold hover:text-rose-950 cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* 1. FINANCIAL SUMMARY KPI DECK */}
      <PenagihanKpiDeck
        totalUnpaidCount={totalUnpaidCount}
        totalPaidCount={totalPaidCount}
        totalUnpaid={totalUnpaid}
        totalPaid={totalPaid}
        operatorName={user?.fullName}
      />

      {/* 2. TABS NAVIGATOR, FILTER KATEGORI & SEARCH BAR */}
      <PenagihanToolbar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        categoryFilter={categoryFilter}
        onChangeCategoryFilter={setCategoryFilter}
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        totalUnpaidCount={totalUnpaidCount}
        totalPaidCount={totalPaidCount}
        unpaidInvoicesCount={unpaidInvoices.length}
        paidInvoicesCount={paidInvoices.length}
        unpaidLeasesCount={unpaidLeases.length}
        paidLeasePaymentsCount={paidLeasePayments.length}
        isLoading={isLoading}
        onRefresh={() => {
          fetchInvoices();
          fetchLeases();
        }}
      />

      {/* TAB 1: DAFTAR TAGIHAN e-SKRD (DERMAGA & RUANGAN) */}
      {activeTab === "unpaid" && (
        <UnpaidBillingSection
          isLoading={isLoading}
          totalUnpaidCount={totalUnpaidCount}
          filteredUnpaid={filteredUnpaid}
          filteredUnpaidLeases={filteredUnpaidLeases}
          onOpenPayment={handleOpenPayment}
          onOpenLeasePayment={handleOpenLeasePayment}
        />
      )}

      {/* TAB 2: RIWAYAT PELAYANAN & KUITANSI e-SSRD (TERPADU) */}
      {activeTab === "history" && (
        <PaymentHistoryTable
          isLoading={isLoading}
          totalPaidCount={totalPaidCount}
          unifiedPaidRecords={unifiedPaidRecords}
          onOpenInvoiceSsrd={handleOpenSSRD}
          onOpenLeaseSsrd={handleOpenLeaseSSRD}
        />
      )}

      {/* 3. SIDE DRAWER PEMBAYARAN DIGITAL & TRANSFER RKUD */}
      <InvoicePaymentModal
        isOpen={isPaymentModalOpen}
        selectedInvoice={selectedInvoice}
        errorMessage={errorMessage}
        paymentMethodTab={paymentMethodTab}
        onChangePaymentMethodTab={setPaymentMethodTab}
        paymentConfig={paymentConfig}
        activeCheckoutSession={activeCheckoutSession}
        isCheckingOut={isCheckingOut}
        isProcessing={isProcessing}
        selectedBank={selectedBank}
        onSelectBank={setSelectedBank}
        isCopied={isCopied}
        refNumberInput={refNumberInput}
        onChangeRefNumber={setRefNumberInput}
        onChangePaymentFile={setPaymentFileInput}
        onGatewayCheckout={handleGatewayCheckout}
        onGatewaySuccess={() => {
          setIsPaymentModalOpen(false);
          void handleCheckPaymentStatus();
        }}
        onCheckPaymentStatus={handleCheckPaymentStatus}
        onCopyVA={handleCopyVA}
        onConfirmPayment={handleConfirmPayment}
        onClose={() => setIsPaymentModalOpen(false)}
      />

      {/* 4. MODAL BUKTI SETOR e-SSRD (Surat Setoran Retribusi Daerah) */}
      <InvoiceSsrdModal
        isOpen={isSSRDModalOpen}
        selectedInvoice={selectedInvoice}
        activePrintPayload={activePrintPayload}
        operatorFallbackName={user?.fullName}
        onClose={() => setIsSSRDModalOpen(false)}
      />

      {/* 5. SIDE DRAWER PEMBAYARAN PENGAJUAN RUANGAN (SEWA ASET / PKS) */}
      <LeasePaymentModal
        isOpen={isLeasePaymentModalOpen}
        selectedLeaseForPayment={selectedLeaseForPayment}
        errorMessage={errorMessage}
        leasePaymentTab={leasePaymentTab}
        onChangeLeasePaymentTab={setLeasePaymentTab}
        paymentConfig={paymentConfig}
        activeCheckoutSession={activeCheckoutSession}
        isCheckingOut={isCheckingOut}
        onGatewayCheckout={handleLeaseGatewayCheckout}
        onGatewaySuccess={() => {
          setIsLeasePaymentModalOpen(false);
          void handleCheckLeasePaymentStatus();
        }}
        onCheckStatus={handleCheckLeasePaymentStatus}
        onClose={() => setIsLeasePaymentModalOpen(false)}
      />

      {/* 6. MODAL CETAK KUITANSI RESMI e-SSRD SEWA RUANGAN (REUSE) */}
      <PrintReceiptModal
        isOpen={isLeaseSSRDModalOpen}
        onClose={() => {
          setIsLeaseSSRDModalOpen(false);
          clearActiveLeaseReceipt();
        }}
        receipt={
          activeLeaseReceipt
            ? { type: "LEASE_PAYMENT", data: activeLeaseReceipt }
            : null
        }
      />
    </div>
  );
}
