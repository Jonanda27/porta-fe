"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  CreditCard,
  Receipt,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Printer,
  X,
  ShieldCheck,
  TrendingUp,
  FileText,
  Copy,
  QrCode,
  Ship,
  Upload,
  Calendar,
  Search,
  RefreshCw,
  Anchor,
  Scale,
  Zap,
  ExternalLink,
  Building2,
  Store,
} from "lucide-react";
import { useBillingStore } from "@/store/billing.store";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/toast.store";
import {
  BillingInvoice,
  InvoiceItem,
  UnifiedPaidRecord,
  UnpaidLeaseSummary,
} from "@/types/billing.types";
import { AssetLease, AssetLeasePayment } from "@/types/asset.types";
import { PrintReceiptModal } from "@/components/tenant/PrintReceiptModal";
import { InvoicePaymentModal } from "@/components/kapal/penagihan/InvoicePaymentModal";
import { InvoiceSsrdModal } from "@/components/kapal/penagihan/InvoiceSsrdModal";
import { LeasePaymentModal } from "@/components/kapal/penagihan/LeasePaymentModal";
import {
  buildUnifiedPaidRecords,
  computeUnpaidLeases,
  extractPaidLeasePayments,
  formatRupiah,
  getVirtualAccountNo,
} from "@/lib/kapal-billing";
import { formatLabel } from "@/lib/format-labels";

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

  const [activeTab, setActiveTab] = useState<"unpaid" | "history">("unpaid");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "DERMAGA" | "RUANGAN">("ALL");
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

  const handleOpenPayment = (inv: BillingInvoice, defaultTab: "gateway" | "manual" = "gateway") => {
    setSelectedInvoice(inv);
    setPaymentMethodTab(defaultTab);
    clearCheckoutSession();
    setRefNumberInput(`TRX-${Date.now().toString().slice(-6)}`);
    setPaymentFileInput(null);
    setErrorMessage(null);
    setIsPaymentModalOpen(true);
  };

  const handleGatewayCheckout = async () => {
    if (!selectedInvoice) return;
    setIsCheckingOut(true);
    setErrorMessage(null);

    try {
      const session = await checkoutPayment({
        targetType: "INVOICE",
        targetId: selectedInvoice.id,
      });

      if (session.redirectUrl) {
        window.open(session.redirectUrl, "_blank", "noopener,noreferrer");
      }
      toast.success(
        "Sesi Pembayaran Dibuat",
        `Sesi pembayaran online #${session.orderId} berhasil dibuat! Silakan selesaikan pembayaran.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memulai sesi pembayaran gateway digital.";
      setErrorMessage(msg);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleCheckPaymentStatus = async () => {
    setIsCheckingOut(true);
    try {
      await fetchInvoices();
      const current = useBillingStore.getState().invoices.find((i) => i.id === selectedInvoice?.id);
      if (current?.status === "PAID") {
        setIsPaymentModalOpen(false);
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

  // Handler Pembayaran & e-SSRD Pengajuan Ruangan (Asset Lease)
  const handleOpenLeasePayment = (
    item: UnpaidLeaseSummary,
    defaultTab: "gateway" | "manual" = "gateway"
  ) => {
    setSelectedLeaseForPayment(item);
    setLeasePaymentTab(defaultTab);
    clearCheckoutSession();
    setErrorMessage(null);
    setIsLeasePaymentModalOpen(true);
  };

  const handleLeaseGatewayCheckout = async () => {
    if (!selectedLeaseForPayment) return;
    setIsCheckingOut(true);
    setErrorMessage(null);
    try {
      const session = await checkoutPayment({
        targetType: "ASSET_LEASE",
        targetId: selectedLeaseForPayment.lease.id,
      });
      if (session.redirectUrl) {
        window.open(session.redirectUrl, "_blank", "noopener,noreferrer");
      }
      toast.success(
        "Sesi Pembayaran Sewa Dibuat",
        `Sesi pembayaran sewa ruangan #${session.orderId} berhasil dibuat! Silakan selesaikan pembayaran.`
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

  const handleCheckLeasePaymentStatus = async () => {
    setIsCheckingOut(true);
    try {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tagihan Unpaid */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full">
              {totalUnpaidCount} e-SKRD Aktif
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Tagihan e-SKRD Belum Bayar
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            {formatRupiah(totalUnpaid)}
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Menunggu pelunasan ke RKUD</span>
          </p>
        </div>

        {/* KPI 2: Total Lunas Bulan Ini */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
              {totalPaidCount} Lunas RKUD
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Retribusi Terbayar (e-SSRD)
          </p>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-1">
            {formatRupiah(totalPaid)}
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-emerald-700 font-semibold">Kuitansi sah terverifikasi</span>
          </p>
        </div>

        {/* KPI 3: Bank Persepsi Terdaftar */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Receipt className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-full">
              Kasda Mimika
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Bank Persepsi Penerima
          </p>
          <p className="text-base font-extrabold text-[#0B241E] font-mono mt-1">
            Bank Papua (RKUD) & BNI
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Host-to-Host Virtual Account Aktif
          </p>
        </div>

        {/* KPI 4: Kepatuhan Retribusi */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              Prioritas Sandar
            </span>
          </div>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-3">
            Kepatuhan Pelabuhan
          </p>
          <p className="text-xl font-extrabold text-emerald-700 font-mono mt-1">
            {totalUnpaidCount === 0 ? "Bebas Tunggakan" : "Tertib Administrasi"}
          </p>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Operator: {user?.fullName || "PT Pelayaran Mimika Sejahtera"}
          </p>
        </div>
      </div>

      {/* 2. TABS NAVIGATOR, FILTER KATEGORI & SEARCH BAR */}
      <div className="space-y-3 border-b border-[#CBD5E1] pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab("unpaid")}
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
              onClick={() => setActiveTab("history")}
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari e-SKRD, kapal, PKS, ruangan..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-[#CBD5E1] text-xs focus:outline-hidden focus:border-[#0B241E] bg-white w-60"
              />
            </div>
            <button
              onClick={() => {
                fetchInvoices();
                fetchLeases();
              }}
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
            onClick={() => setCategoryFilter("ALL")}
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
            onClick={() => setCategoryFilter("DERMAGA")}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
              categoryFilter === "DERMAGA"
                ? "bg-sky-700 text-white"
                : "bg-sky-50 text-sky-900 border border-sky-200 hover:bg-sky-100"
            }`}
          >
            <Anchor className="w-3 h-3" />
            <span>
              Pengajuan Dermaga ({activeTab === "unpaid" ? unpaidInvoices.length : paidInvoices.length})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("RUANGAN")}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
              categoryFilter === "RUANGAN"
                ? "bg-violet-700 text-white"
                : "bg-violet-50 text-violet-900 border border-violet-200 hover:bg-violet-100"
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>
              Pengajuan Ruangan (
              {activeTab === "unpaid" ? unpaidLeases.length : paidLeasePayments.length})
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: DAFTAR TAGIHAN e-SKRD (DERMAGA & RUANGAN)               */}
      {/* ============================================================== */}
      {activeTab === "unpaid" && (
        <div className="space-y-4">
          {isLoading && totalUnpaidCount === 0 ? (
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-10 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#0B241E] animate-spin mx-auto" />
              <p className="text-xs text-[#64748B]">Memuat tagihan retribusi e-SKRD terkini dari server...</p>
            </div>
          ) : filteredUnpaid.length === 0 && filteredUnpaidLeases.length === 0 ? (
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-8 text-center text-xs text-[#64748B] space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="font-bold text-[#0B241E] text-sm">Tidak ada tagihan tertunda!</p>
              <p>Seluruh kewajiban retribusi pengajuan dermaga maupun sewa ruangan Anda telah lunas.</p>
            </div>
          ) : (
            <>
              {/* KARTU TAGIHAN PENGAJUAN DERMAGA (e-SKRD KAPAL) */}
              {filteredUnpaid.map((inv) => {
                const vesselName = inv.visit?.vessel?.name || "Kapal Niaga";
                const grossTonnage = inv.visit?.vessel?.grossTonnage || 0;
                const dueDateFormatted = inv.dueDate
                  ? new Date(inv.dueDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Segera";

                return (
                  <div
                    key={`dermaga-${inv.id}`}
                    className="bg-white border border-[#CBD5E1] border-l-4 border-l-[#D97706] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-5"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#F1F5F9] pb-4">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-900 border border-sky-200">
                            <Anchor className="w-3 h-3" />
                            Pengajuan Dermaga
                          </span>
                          <span className="font-mono text-xs font-bold text-[#0B241E] bg-[#F8FAFC] border border-[#CBD5E1] px-2.5 py-0.5 rounded-md">
                            {inv.invoiceNumber}
                          </span>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {inv.billingStage === "ADVANCE_SKRD"
                              ? "Uang Muka"
                              : "SKRD Rampung"}
                          </span>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            {inv.status === "ISSUED"
                              ? "Menunggu Pembayaran"
                              : formatLabel(inv.status)}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-base text-[#0B241E] flex items-center gap-2">
                          <Ship className="w-4 h-4 text-[#D97706] shrink-0" />
                          <span>
                            {vesselName}{" "}
                            <span className="text-xs font-mono font-semibold text-[#64748B]">
                              ({Number(grossTonnage).toLocaleString()} GT)
                            </span>
                          </span>
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#64748B]">
                          <span>
                            Kunjungan:{" "}
                            <strong className="font-mono text-[#334155]">
                              {inv.visit?.visitNumber || `VISIT-#${inv.visitId}`}
                            </strong>
                          </span>
                          <span>
                            Pelabuhan:{" "}
                            <strong className="text-[#334155]">Pelabuhan Poumako</strong>
                          </span>
                          <span>
                            Jatuh Tempo:{" "}
                            <strong className="text-[#0B241E]">{dueDateFormatted}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5">
                        <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
                          Total Tagihan
                        </span>
                        <p className="font-mono text-xl font-black text-[#0B241E] mt-0.5">
                          {formatRupiah(inv.totalAmountIdr)}
                        </p>
                      </div>
                    </div>

                    {/* Rincian Komponen Biaya Berdasarkan Items Backend */}
                    <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] space-y-2 text-xs">
                      <p className="text-[11px] font-bold text-[#0B241E] uppercase tracking-wide flex items-center gap-1.5">
                        <Anchor className="w-3.5 h-3.5 text-[#0B241E]" />
                        <span>Rincian Pungutan Sesuai Perbup Mimika No. 25/2024 & Perda No. 4/2023:</span>
                      </p>

                      {inv.items && inv.items.length > 0 ? (
                        <div className="space-y-1.5 divide-y divide-[#E2E8F0]/60">
                          {inv.items.map((item: InvoiceItem) => (
                            <div key={item.id} className="pt-1.5 flex justify-between text-[#64748B]">
                              <div>
                                <span className="font-semibold text-[#0B241E]">{item.description}</span>
                                {item.formulaNote && (
                                  <p className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                                    {item.formulaNote}
                                  </p>
                                )}
                              </div>
                              <span className="font-mono font-bold text-[#0B241E] shrink-0">
                                {formatRupiah(item.subtotalIdr)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="pt-1.5 flex justify-between text-xs text-[#64748B]">
                          <span className="font-semibold text-[#0B241E]">
                            Ketetapan Retribusi Kepelabuhanan
                          </span>
                          <span className="font-mono font-bold text-[#0B241E]">
                            {formatRupiah(inv.totalAmountIdr)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action CTA */}
                    <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-end gap-2 flex-wrap">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Link
                          href="/kapal/keberatan"
                          className="w-full sm:w-auto px-4 py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0B241E] text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Ajukan penundaan atau angsuran e-SKRD sesuai Perbup 25/2024"
                        >
                          <Scale className="w-3.5 h-3.5 text-[#D97706]" />
                          <span>Ajukan Keringanan</span>
                        </Link>

                        <button
                          onClick={() => handleOpenPayment(inv, "gateway")}
                          className="w-full sm:w-auto px-4 py-2.5 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Bayar langsung via QRIS / VA Otomatis (Midtrans)"
                        >
                          <QrCode className="w-4 h-4 text-white" />
                          <span>QRIS / VA Instan</span>
                        </button>

                        <button
                          onClick={() => handleOpenPayment(inv, "manual")}
                          className="w-full sm:w-auto px-5 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4 text-[#D97706]" />
                          <span>Transfer RKUD</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* KARTU TAGIHAN PENGAJUAN RUANGAN (SEWA ASET / PKS) */}
              {filteredUnpaidLeases.map((item) => {
                const { lease, totalDue, totalPaid, remaining } = item;
                const areaSqm = Number(lease.asset?.areaSqm || 0);
                const ratePerSqm = Number(lease.asset?.annualRatePerSqmIdr || 0);

                return (
                  <div
                    key={`ruangan-${lease.id}`}
                    className="bg-white border-2 border-violet-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-5"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-900 border border-violet-200">
                            <Building2 className="w-3 h-3" />
                            Pengajuan Ruangan
                          </span>
                          <span className="font-mono text-xs font-bold text-violet-900 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded">
                            {lease.contractNumber}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            PKS {lease.status}
                          </span>
                          <h3 className="font-extrabold text-sm text-[#0B241E] flex items-center gap-1.5">
                            <Store className="w-4 h-4 text-[#D97706]" />
                            <span>{lease.asset?.name || `Aset #${lease.assetId}`}</span>
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#64748B] mt-1.5">
                          <span>
                            Kode Aset: <strong className="font-mono text-[#334155]">{lease.asset?.assetCode || "-"}</strong>
                          </span>
                          <span>
                            Tipe: <strong className="text-[#334155]">{lease.asset?.assetType ? formatLabel(lease.asset.assetType) : "Aset"}</strong>
                          </span>
                          <span>
                            Masa Sewa:{" "}
                            <strong className="text-[#334155]">
                              {new Date(lease.startDate).toLocaleDateString("id-ID")} s.d.{" "}
                              {new Date(lease.endDate).toLocaleDateString("id-ID")}
                            </strong>
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                          Sisa Tagihan Sewa (e-SKRD)
                        </span>
                        <p className="font-mono text-xl font-black text-[#0B241E]">
                          {formatRupiah(remaining)}
                        </p>
                        {totalPaid > 0 && (
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            Terbayar: {formatRupiah(totalPaid)} dari {formatRupiah(totalDue)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rincian Tarif Retribusi Kekayaan Daerah */}
                    <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] space-y-2 text-xs">
                      <p className="text-[11px] font-bold text-[#0B241E] uppercase tracking-wide flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-violet-700" />
                        <span>Rincian Retribusi Pemanfaatan Kekayaan Daerah (Perda Mimika No. 4/2023):</span>
                      </p>
                      <div className="space-y-1.5 divide-y divide-[#E2E8F0]/60">
                        <div className="pt-1.5 flex justify-between text-[#64748B]">
                          <div>
                            <span className="font-semibold text-[#0B241E]">
                              Sewa {lease.asset?.name || "Ruangan / Aset Pelabuhan"}
                            </span>
                            <p className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                              {areaSqm} m² × {formatRupiah(ratePerSqm)} / m² / tahun (Rekening PAD 4.1.02.02.01)
                            </p>
                          </div>
                          <span className="font-mono font-bold text-[#0B241E] shrink-0">
                            {formatRupiah(totalDue)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action CTA */}
                    <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-end gap-2 flex-wrap">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Link
                          href="/kapal/kontrak-sewa"
                          className="w-full sm:w-auto px-4 py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0B241E] text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5 text-violet-700" />
                          <span>Detail PKS</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleOpenLeasePayment(item, "gateway")}
                          className="w-full sm:w-auto px-4 py-2.5 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Bayar sewa ruangan via QRIS / VA Otomatis"
                        >
                          <QrCode className="w-4 h-4 text-white" />
                          <span>QRIS / VA Instan</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenLeasePayment(item, "manual")}
                          className="w-full sm:w-auto px-5 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4 text-[#D97706]" />
                          <span>Setor RKUD / Loket</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: RIWAYAT PELAYANAN & KUITANSI e-SSRD (TERPADU)           */}
      {/* ============================================================== */}
      {activeTab === "history" && (
        <div className="bg-white border border-[#CBD5E1] rounded-2xl overflow-hidden shadow-xs min-h-[280px] flex flex-col">
          {isLoading && totalPaidCount === 0 ? (
            <div className="p-10 text-center space-y-3 my-auto">
              <RefreshCw className="w-8 h-8 text-[#0B241E] animate-spin mx-auto" />
              <p className="text-xs text-[#64748B]">Memuat riwayat e-SSRD dari server...</p>
            </div>
          ) : unifiedPaidRecords.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#64748B] space-y-2 my-auto">
              <FileText className="w-10 h-10 text-[#94A3B8] mx-auto" />
              <p className="font-bold text-[#0B241E] text-sm">Belum ada riwayat transaksi lunas.</p>
              <p>Tagihan Pengajuan Dermaga maupun Pengajuan Ruangan yang telah lunas akan tercantum di sini.</p>
            </div>
          ) : (
            <div className="w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    <th className="py-3.5 px-5">No. SKRD &amp; e-SSRD</th>
                    <th className="py-3.5 px-4">Objek &amp; Referensi</th>
                    <th className="py-3.5 px-4">Tanggal</th>
                    <th className="py-3.5 px-4 text-right">Nilai &amp; Status</th>
                    <th className="py-3.5 px-5 text-right">Dokumen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {unifiedPaidRecords.map((record) => {
                    if (record.kind === "DERMAGA") {
                      const inv = record.invoice;
                      const vesselName = inv.visit?.vessel?.name || "Kapal Niaga";
                      const gt = inv.visit?.vessel?.grossTonnage || 0;
                      const issuedDate = new Date(inv.issuedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });

                      return (
                        <tr key={`paid-dermaga-${inv.id}`} className="hover:bg-[#F8FAFC]/80 transition-colors">
                          <td className="py-4 px-5 align-top">
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-50 text-sky-900 border border-sky-200 mb-1.5">
                              <Anchor className="w-3 h-3" />
                              Dermaga
                            </span>
                            <p className="font-mono font-bold text-[#0B241E] text-xs break-all">
                              {inv.invoiceNumber}
                            </p>
                            <p className="font-mono text-[10.5px] text-emerald-700 font-semibold mt-0.5 break-all">
                              {inv.ssrdNumber || `SSRD-PMK-${inv.id}`}
                            </p>
                          </td>

                          <td className="py-4 px-4 align-top">
                            <p className="font-extrabold text-[#0B241E] text-xs">
                              {vesselName}{" "}
                              <span className="font-mono font-semibold text-[#64748B] text-[11px]">
                                ({Number(gt).toLocaleString()} GT)
                              </span>
                            </p>
                            <p className="font-mono text-[11px] text-[#475569] mt-1 break-all">
                              {inv.visit?.visitNumber || `VISIT-#${inv.visitId}`}
                            </p>
                            <p className="text-[10.5px] text-[#94A3B8] mt-0.5">
                              Pelabuhan Poumako
                            </p>
                          </td>

                          <td className="py-4 px-4 align-top font-mono text-xs text-[#475569] whitespace-nowrap">
                            {issuedDate}
                          </td>

                          <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                            <p className="font-mono text-sm font-extrabold text-emerald-800">
                              {formatRupiah(inv.totalAmountIdr)}
                            </p>
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 mt-1.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              Lunas RKUD
                            </span>
                          </td>

                          <td className="py-4 px-5 align-middle text-right whitespace-nowrap">
                            <button
                              onClick={() => handleOpenSSRD(inv)}
                              className="px-3.5 py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#0B241E] hover:text-white text-[#0B241E] text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5 shrink-0" />
                              <span>e-SSRD</span>
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    const { lease, payment } = record;
                    const paidDate = new Date(payment.paidAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                    const ssrdLabel = `SSRD-PKS-${payment.periodYear}-${String(payment.id).padStart(6, "0")}`;

                    return (
                      <tr key={`paid-ruangan-${payment.id}`} className="hover:bg-[#F8FAFC]/80 transition-colors">
                        <td className="py-4 px-5 align-top">
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-violet-50 text-violet-900 border border-violet-200 mb-1.5">
                            <Building2 className="w-3 h-3" />
                            Ruangan
                          </span>
                          <p className="font-mono font-bold text-[#0B241E] text-xs break-all">
                            {lease.contractNumber}
                          </p>
                          <p className="font-mono text-[10.5px] text-emerald-700 font-semibold mt-0.5 break-all">
                            {ssrdLabel}
                          </p>
                        </td>

                        <td className="py-4 px-4 align-top">
                          <p className="font-extrabold text-[#0B241E] text-xs">
                            {lease.asset?.name || `Aset #${lease.assetId}`}
                          </p>
                          <p className="text-[11px] text-[#475569] font-mono mt-1">
                            {lease.asset?.assetCode} ({Number(lease.asset?.areaSqm || 0)} m²)
                          </p>
                          <p className="text-[10.5px] text-[#94A3B8] mt-0.5">
                            Sewa Aset BMD (Tahun {payment.periodYear})
                          </p>
                        </td>

                        <td className="py-4 px-4 align-top font-mono text-xs text-[#475569] whitespace-nowrap">
                          {paidDate}
                        </td>

                        <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                          <p className="font-mono text-sm font-extrabold text-emerald-800">
                            {formatRupiah(payment.amountIdr)}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 mt-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            Lunas RKUD
                          </span>
                        </td>

                        <td className="py-4 px-5 align-middle text-right whitespace-nowrap">
                          <button
                            onClick={() => handleOpenLeaseSSRD(payment.id)}
                            className="px-3.5 py-2 rounded-xl bg-violet-50 hover:bg-[#0B241E] hover:text-white text-violet-900 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 shrink-0" />
                            <span>e-SSRD</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. MODAL PEMBAYARAN DIGITAL (VA BANK KASDA RKUD) */}
      <InvoicePaymentModal
        isOpen={isPaymentModalOpen}
        selectedInvoice={selectedInvoice}
        errorMessage={errorMessage}
        paymentMethodTab={paymentMethodTab}
        onChangePaymentMethodTab={setPaymentMethodTab}
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

      {/* 5. MODAL PEMBAYARAN PENGAJUAN RUANGAN (SEWA ASET / PKS) */}
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
