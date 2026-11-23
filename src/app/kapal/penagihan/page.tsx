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
import { BillingInvoice, InvoiceItem } from "@/types/billing.types";
import { AssetLease, AssetLeasePayment } from "@/types/asset.types";
import { PrintReceiptModal } from "@/components/tenant/PrintReceiptModal";
import { formatLabel } from "@/lib/format-labels";

interface UnpaidLeaseSummary {
  lease: AssetLease;
  totalDue: number;
  totalPaid: number;
  remaining: number;
}

type UnifiedPaidRecord =
  | { kind: "DERMAGA"; sortDate: number; invoice: BillingInvoice }
  | { kind: "RUANGAN"; sortDate: number; lease: AssetLease; payment: AssetLeasePayment };

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
  const [successToast, setSuccessToast] = useState<string | null>(null);
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
  const unpaidLeases = useMemo<UnpaidLeaseSummary[]>(() => {
    return leases
      .filter((l) => l.status === "ACTIVE")
      .map((lease) => {
        const totalDue = Number(lease.totalAnnualAmountIdr || 0);
        const totalPaid = (lease.payments || []).reduce(
          (sum, p) => sum + Number(p.amountIdr || 0),
          0
        );
        const remaining = Math.max(0, totalDue - totalPaid);
        return { lease, totalDue, totalPaid, remaining };
      })
      .filter((item) => item.remaining > 0);
  }, [leases]);

  // Daftar seluruh pembayaran sewa ruangan yang sudah lunas (untuk tab e-SSRD)
  const paidLeasePayments = useMemo(() => {
    const rows: { lease: AssetLease; payment: AssetLeasePayment }[] = [];
    for (const lease of leases) {
      for (const payment of lease.payments || []) {
        rows.push({ lease, payment });
      }
    }
    return rows;
  }, [leases]);

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

  const unifiedPaidRecords = useMemo<UnifiedPaidRecord[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    const list: UnifiedPaidRecord[] = [];

    if (categoryFilter !== "RUANGAN") {
      for (const inv of paidInvoices) {
        const matches =
          !q ||
          inv.invoiceNumber.toLowerCase().includes(q) ||
          (inv.ssrdNumber && inv.ssrdNumber.toLowerCase().includes(q)) ||
          (inv.visit?.vessel?.name && inv.visit.vessel.name.toLowerCase().includes(q));
        if (matches) {
          list.push({
            kind: "DERMAGA",
            sortDate: new Date(inv.issuedAt).getTime(),
            invoice: inv,
          });
        }
      }
    }

    if (categoryFilter !== "DERMAGA") {
      for (const entry of paidLeasePayments) {
        const matches =
          !q ||
          entry.lease.contractNumber.toLowerCase().includes(q) ||
          (entry.lease.asset?.name &&
            entry.lease.asset.name.toLowerCase().includes(q)) ||
          (entry.lease.asset?.assetCode &&
            entry.lease.asset.assetCode.toLowerCase().includes(q));
        if (matches) {
          list.push({
            kind: "RUANGAN",
            sortDate: new Date(entry.payment.paidAt).getTime(),
            lease: entry.lease,
            payment: entry.payment,
          });
        }
      }
    }

    return list.sort((a, b) => b.sortDate - a.sortDate);
  }, [paidInvoices, paidLeasePayments, searchQuery, categoryFilter]);

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

  const formatRupiah = (val: number | string) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getVirtualAccountNo = (inv: BillingInvoice, bank: string) => {
    const prefix = bank === "bank_papua" ? "9928" : "8810";
    const paddedId = String(inv.id).padStart(6, "0");
    return `${prefix} 1840 2910 ${paddedId}`;
  };

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
      setSuccessToast(`Sesi pembayaran online #${session.orderId} berhasil dibuat! Silakan selesaikan pembayaran.`);
      setTimeout(() => setSuccessToast(null), 6000);
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
        setSuccessToast(`Pembayaran tagihan ${selectedInvoice?.invoiceNumber} telah terverifikasi LUNAS!`);
        setTimeout(() => setSuccessToast(null), 6000);
      } else {
        setSuccessToast("Status tagihan berhasil disinkronkan.");
        setTimeout(() => setSuccessToast(null), 3000);
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
      setSuccessToast(
        `Bukti pembayaran untuk invoice ${selectedInvoice.invoiceNumber} berhasil dikirim ke RKUD Bank Kas Daerah Mimika!`
      );
      setTimeout(() => setSuccessToast(null), 6000);
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
      setSuccessToast(
        `Sesi pembayaran sewa ruangan #${session.orderId} berhasil dibuat! Silakan selesaikan pembayaran.`
      );
      setTimeout(() => setSuccessToast(null), 6000);
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
          setSuccessToast(
            `Pembayaran sewa ruangan ${updatedLease.contractNumber} telah terverifikasi LUNAS!`
          );
          setTimeout(() => setSuccessToast(null), 6000);
          return;
        }
      }
      setSuccessToast("Status pembayaran sewa ruangan berhasil disinkronkan.");
      setTimeout(() => setSuccessToast(null), 3000);
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
      {/* Toast Alert */}
      {successToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-fade-in border border-emerald-500">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-white hover:text-emerald-100 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
          <p className="text-[11px] text-[#64748B] mt-1.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {unpaidInvoices.length} Dermaga • {unpaidLeases.length} Ruangan
            </span>
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
          <p className="text-[11px] text-[#64748B] mt-1.5 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 inline" />
            <span className="text-emerald-700 font-bold">
              {paidInvoices.length} Dermaga • {paidLeasePayments.length} Ruangan
            </span>
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
                    className="bg-white border-2 border-amber-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-5"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-200">
                            <Anchor className="w-3 h-3" />
                            Pengajuan Dermaga
                          </span>
                          <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                            {inv.invoiceNumber}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800 border border-amber-200">
                            {inv.billingStage} • {inv.status}
                          </span>
                          <h3 className="font-extrabold text-sm text-[#0B241E] flex items-center gap-1.5">
                            <Ship className="w-4 h-4 text-[#0B241E]" />
                            <span>
                              {vesselName} ({Number(grossTonnage).toLocaleString()} GT)
                            </span>
                          </h3>
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-1">
                          Kunjungan: {inv.visit?.visitNumber || `VISIT-#${inv.visitId}`} • Pelabuhan Poumako • Jatuh Tempo: {dueDateFormatted}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                          Total Tagihan Retribusi (e-SKRD)
                        </span>
                        <p className="font-mono text-xl font-black text-[#0B241E]">
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
                        <div className="space-y-1 text-xs text-[#64748B]">
                          <div className="flex justify-between">
                            <span>Jasa Labuh Kapal di Kolam Pelabuhan:</span>
                            <span className="font-mono text-[#0B241E]">{formatRupiah(Number(inv.totalAmountIdr) * 0.3)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Jasa Tambat & Sandar Dermaga:</span>
                            <span className="font-mono text-[#0B241E]">{formatRupiah(Number(inv.totalAmountIdr) * 0.7)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action CTA */}
                    <div className="pt-2 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          Penyetoran langsung masuk ke Rekening Kas Umum Daerah (RKUD) Pemkab Mimika.
                        </span>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Link
                          href="/kapal/keberatan"
                          className="w-full sm:w-auto px-4 py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0B241E] text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Ajukan penundaan atau angsuran e-SKRD sesuai Perbup 25/2024"
                        >
                          <Scale className="w-3.5 h-3.5 text-[#D97706]" />
                          <span>Keringanan e-SKRD</span>
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
                        <p className="text-[11px] text-[#64748B] mt-1">
                          Kode Aset: <strong className="font-mono">{lease.asset?.assetCode || "-"}</strong> •{" "}
                          Tipe: <strong>{lease.asset?.assetType ? formatLabel(lease.asset.assetType) : "Aset"}</strong> •{" "}
                          Masa Sewa: {new Date(lease.startDate).toLocaleDateString("id-ID")} s.d.{" "}
                          {new Date(lease.endDate).toLocaleDateString("id-ID")}
                        </p>
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
                              {areaSqm} m² × {formatRupiah(ratePerSqm)} / m² / tahun • Rekening PAD 4.1.02.02.01
                            </p>
                          </div>
                          <span className="font-mono font-bold text-[#0B241E] shrink-0">
                            {formatRupiah(totalDue)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action CTA */}
                    <div className="pt-2 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          Kuitansi e-SSRD resmi diterbitkan otomatis setelah pembayaran terverifikasi di Kasda.
                        </span>
                      </div>

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
        <div className="bg-white border border-[#CBD5E1] rounded-2xl overflow-hidden shadow-xs">
          {isLoading && totalPaidCount === 0 ? (
            <div className="p-10 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#0B241E] animate-spin mx-auto" />
              <p className="text-xs text-[#64748B]">Memuat riwayat e-SSRD dari server...</p>
            </div>
          ) : unifiedPaidRecords.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#64748B] space-y-2">
              <FileText className="w-10 h-10 text-[#94A3B8] mx-auto" />
              <p className="font-bold text-[#0B241E] text-sm">Belum ada riwayat transaksi lunas.</p>
              <p>Tagihan Pengajuan Dermaga maupun Pengajuan Ruangan yang telah lunas akan tercantum di sini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    <th className="py-3 px-4">Jenis Pengajuan</th>
                    <th className="py-3 px-4">No. e-SKRD / PKS & e-SSRD</th>
                    <th className="py-3 px-4">Objek Retribusi (Kapal / Ruangan)</th>
                    <th className="py-3 px-4">Referensi</th>
                    <th className="py-3 px-4 text-right">Nilai Retribusi</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Dokumen</th>
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
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-200 whitespace-nowrap">
                              <Anchor className="w-3 h-3" />
                              Pengajuan Dermaga
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono">
                            <p className="font-bold text-[#0B241E]">{inv.invoiceNumber}</p>
                            <p className="text-[10px] text-emerald-700 font-semibold">
                              {inv.ssrdNumber || `SSRD-PMK-${inv.id}`}
                            </p>
                          </td>

                          <td className="py-3 px-4 font-bold text-[#0B241E]">
                            {vesselName} ({Number(gt).toLocaleString()} GT)
                          </td>

                          <td className="py-3 px-4 text-[#475569]">
                            <p className="font-mono">{inv.visit?.visitNumber || `VISIT-#${inv.visitId}`}</p>
                            <p className="text-[10px] text-[#94A3B8]">Pelabuhan Poumako</p>
                          </td>

                          <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-800">
                            {formatRupiah(inv.totalAmountIdr)}
                          </td>

                          <td className="py-3 px-4 font-mono text-[11px] text-[#64748B]">
                            {issuedDate}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Lunas RKUD
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleOpenSSRD(inv)}
                              className="px-3 py-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#0B241E] hover:text-white text-[#0B241E] text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
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
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-900 border border-violet-200 whitespace-nowrap">
                            <Building2 className="w-3 h-3" />
                            Pengajuan Ruangan
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <p className="font-bold text-[#0B241E]">{lease.contractNumber}</p>
                          <p className="text-[10px] text-emerald-700 font-semibold">{ssrdLabel}</p>
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-bold text-[#0B241E]">
                            {lease.asset?.name || `Aset #${lease.assetId}`}
                          </p>
                          <p className="text-[10px] text-[#64748B] font-mono">
                            {lease.asset?.assetCode} • {Number(lease.asset?.areaSqm || 0)} m²
                          </p>
                        </td>

                        <td className="py-3 px-4 text-[#475569]">
                          <p className="font-mono">Tahun {payment.periodYear}</p>
                          <p className="text-[10px] text-[#94A3B8]">Sewa Aset BMD</p>
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-800">
                          {formatRupiah(payment.amountIdr)}
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px] text-[#64748B]">
                          {paidDate}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Lunas RKUD
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleOpenLeaseSSRD(payment.id)}
                            className="px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-[#0B241E] hover:text-white text-violet-900 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
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
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#CBD5E1] overflow-hidden my-8">
            <div className="bg-[#0B241E] text-white p-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-[#D97706]" />
                <h3 className="font-bold text-sm">
                  Pembayaran Retribusi e-SKRD Jasa Pelabuhan
                </h3>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-[#85A69B] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Summary */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Nomor e-SKRD:</span>
                  <span className="font-mono font-bold text-[#0B241E]">
                    {selectedInvoice.invoiceNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Armada:</span>
                  <strong className="text-[#0B241E]">
                    {selectedInvoice.visit?.vessel?.name || "Kapal Niaga"} (
                    {Number(selectedInvoice.visit?.vessel?.grossTonnage || 0).toLocaleString()} GT)
                  </strong>
                </div>
                <div className="flex justify-between border-t border-[#E2E8F0] pt-2 text-sm font-extrabold text-[#0B241E]">
                  <span>Total Tagihan:</span>
                  <span className="font-mono text-[#D97706] text-base">
                    {formatRupiah(selectedInvoice.totalAmountIdr)}
                  </span>
                </div>
              </div>

              {/* Metode Pembayaran Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setPaymentMethodTab("gateway")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethodTab === "gateway"
                      ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                      : "text-[#64748B] hover:text-[#0B241E]"
                  }`}
                >
                  <Zap className={`w-3.5 h-3.5 ${paymentMethodTab === "gateway" ? "text-[#D97706]" : ""}`} />
                  <span>QRIS & VA Instan (Online)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethodTab("manual")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethodTab === "manual"
                      ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                      : "text-[#64748B] hover:text-[#0B241E]"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Transfer RKUD Manual</span>
                </button>
              </div>

              {/* TAB 1: PEMBAYARAN GATEWAY ONLINE REAL-TIME */}
              {paymentMethodTab === "gateway" && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Gerbang Pembayaran Resmi Midtrans / Bank Papua Online</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 leading-relaxed">
                      Bayar langsung menggunakan <strong>QRIS (BCA, GoPay, OVO, Dana, LinkAja)</strong> atau <strong>Virtual Account Bank Otomatis</strong>. Pelunasan e-SKRD terverifikasi secara real-time ke kas daerah tanpa upload resi manual.
                    </p>
                  </div>

                  {activeCheckoutSession ? (
                    <div className="p-4 bg-[#FAFCFF] border-2 border-dashed border-[#0B241E]/40 rounded-xl space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#64748B] font-bold">Order ID Gateway:</span>
                        <span className="font-mono font-bold text-[#0B241E]">{activeCheckoutSession.orderId}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#64748B] font-bold">Total Pembayaran:</span>
                        <span className="font-mono font-black text-base text-[#D97706]">
                          {formatRupiah(activeCheckoutSession.amountIdr)}
                        </span>
                      </div>

                      {activeCheckoutSession.snapToken && (
                        <div className="text-left bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-[#64748B] block font-mono">Snap Session Token:</span>
                          <span className="text-xs font-mono font-bold text-slate-800 break-all select-all">
                            {activeCheckoutSession.snapToken}
                          </span>
                        </div>
                      )}

                      <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                        {activeCheckoutSession.redirectUrl && (
                          <a
                            href={activeCheckoutSession.redirectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-4 bg-[#0B241E] hover:bg-[#143E33] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4 text-[#D97706]" />
                            <span>Buka Layar Pembayaran Midtrans</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={handleCheckPaymentStatus}
                          disabled={isCheckingOut}
                          className="w-full sm:w-auto py-2.5 px-4 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0B241E] font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isCheckingOut ? "animate-spin" : ""}`} />
                          <span>Cek Status Lunas</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGatewayCheckout}
                      disabled={isCheckingOut}
                      className="w-full py-3 bg-[#0B241E] hover:bg-[#143E33] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isCheckingOut ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Menghubungi Payment Gateway Midtrans...</span>
                        </>
                      ) : (
                        <>
                          <QrCode className="w-4 h-4 text-[#D97706]" />
                          <span>Buat Sesi Bayar QRIS / VA Otomatis</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* TAB 2: TRANSFER MANUAL BANK KASDA */}
              {paymentMethodTab === "manual" && (
                <div className="space-y-4">
                  {/* Bank Persepsi Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#0B241E]">
                      Pilih Bank Rekening Kas Umum Daerah (RKUD) Kab. Mimika:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBank("bank_papua")}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                          selectedBank === "bank_papua"
                            ? "bg-[#0B241E] text-white border-[#0B241E]"
                            : "bg-white border-[#CBD5E1] text-[#64748B]"
                        }`}
                      >
                        Bank Papua (RKUD Utama)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedBank("bank_bni")}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                          selectedBank === "bank_bni"
                            ? "bg-[#0B241E] text-white border-[#0B241E]"
                            : "bg-white border-[#CBD5E1] text-[#64748B]"
                        }`}
                      >
                        Bank BNI (Kasda Mitra)
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Virtual Account Box */}
                  <div className="p-5 bg-[#FAFCFF] border-2 border-dashed border-[#0B241E]/40 rounded-xl text-center space-y-3">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                      Nomor Virtual Account Kasda Host-to-Host:
                    </span>
                    <p className="font-mono text-xl font-black text-[#0B241E] tracking-wider">
                      {getVirtualAccountNo(selectedInvoice, selectedBank)}
                    </p>
                    <button
                      type="button"
                      onClick={handleCopyVA}
                      className="text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
                    >
                      {isCopied ? "✓ Nomor VA Berhasil Disalin!" : "Salin Nomor VA"}
                    </button>
                    <p className="text-[10px] text-[#64748B]">
                      Penyetoran dapat dilakukan via Teller, Mobile Banking, atau Antarbank Kliring/BI-FAST.
                    </p>
                  </div>

                  {/* Form Input Referensi & Bukti Transfer */}
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0B241E] mb-1">
                        Nomor Referensi Setor / Resi Bank:
                      </label>
                      <input
                        type="text"
                        value={refNumberInput}
                        onChange={(e) => setRefNumberInput(e.target.value)}
                        placeholder="Contoh: REF-BAP-20261117-0921"
                        className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs font-mono focus:border-[#0B241E] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#0B241E] mb-1">
                        Upload File Bukti Setor / Struk (Opsional):
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => setPaymentFileInput(e.target.files?.[0] || null)}
                        className="w-full text-xs text-[#64748B] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#0B241E] file:text-white cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Submit Payment Confirmation */}
                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    disabled={isProcessing}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Merekonsiliasi Status Pembayaran Bank Kasda...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Kirim Bukti Pembayaran ke Kasda Pemkab Mimika</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL BUKTI SETOR e-SSRD (Surat Setoran Retribusi Daerah) */}
      {isSSRDModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#CBD5E1] overflow-hidden my-8">
            <div className="bg-[#0B241E] text-white p-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#D97706]" />
                <h3 className="font-bold text-sm">
                  Dokumen Resmi e-SSRD (Surat Setoran Retribusi Daerah)
                </h3>
              </div>
              <button
                onClick={() => setIsSSRDModalOpen(false)}
                className="text-[#85A69B] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs bg-[#FAFAFA]" id="ssrd-printable-area">
              {/* Document Kop */}
              <div className="text-center border-b-2 border-[#0B241E] pb-3 space-y-0.5">
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">
                  {activePrintPayload?.issuerAuthority || "PEMERINTAH KABUPATEN MIMIKA • DINAS PERHUBUNGAN"}
                </p>
                <h4 className="text-base font-black text-[#0B241E] uppercase">
                  SURAT SETORAN RETRIBUSI DAERAH (e-SSRD)
                </h4>
                <p className="text-[10px] text-[#64748B]">
                  Penerimaan Retribusi Jasa Kepelabuhanan Sesuai Perda Kab. Mimika No. 4 Tahun 2023 & PP No. 35 Tahun 2023
                </p>
                <div className="mt-2 inline-block px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-300 font-mono font-bold text-xs">
                  Nomor e-SSRD: {activePrintPayload?.ssrdNumber || selectedInvoice.ssrdNumber || `SSRD-PMK-${selectedInvoice.id}`}
                </div>
              </div>

              {/* Rincian Subjek & Objek Retribusi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-[#E2E8F0]">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#94A3B8]">Wajib Retribusi (Operator)</span>
                  <p className="font-extrabold text-[#0B241E] text-xs">
                    {activePrintPayload?.operator?.name || user?.fullName || "PT Pelayaran Mimika Sejahtera"}
                  </p>
                  <p className="text-[10px] text-[#64748B]">
                    NPWP: {activePrintPayload?.operator?.npwp || "01.889.340.2-951.000"}
                  </p>
                  <p className="text-[10px] text-[#64748B]">
                    Alamat: {activePrintPayload?.operator?.address || "Jl. Pelabuhan Poumako, Timika, Papua Tengah"}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#94A3B8]">Armada & Pelayanan</span>
                  <p className="font-extrabold text-[#0B241E] text-xs">
                    {selectedInvoice.visit?.vessel?.name || "Kapal Niaga"} (
                    {Number(selectedInvoice.visit?.vessel?.grossTonnage || 0).toLocaleString()} GT)
                  </p>
                  <p className="text-[10px] text-[#64748B]">
                    Pelabuhan: {activePrintPayload?.port?.name || "Pelabuhan Poumako (UPTD Pomako)"}
                  </p>
                  <p className="text-[10px] text-[#64748B]">
                    Nomor Kunjungan: {selectedInvoice.visit?.visitNumber || `VISIT-#${selectedInvoice.visitId}`}
                  </p>
                </div>
              </div>

              {/* Rincian Komponen Biaya */}
              <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">
                  Rincian Penyetoran Retribusi Daerah:
                </span>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-[10px] uppercase text-[#64748B]">
                      <th className="py-1">Uraian Jasa</th>
                      <th className="py-1">Tarif & Rumus</th>
                      <th className="py-1 text-right">Subtotal (IDR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {(activePrintPayload?.items || selectedInvoice.items || []).map((item, idx) => (
                      <tr key={idx} className="py-1.5">
                        <td className="py-1.5 font-medium text-[#0B241E]">{item.description}</td>
                        <td className="py-1.5 font-mono text-[10px] text-[#64748B]">{item.formulaNote || "-"}</td>
                        <td className="py-1.5 font-mono font-bold text-right text-[#0B241E]">
                          {formatRupiah(item.subtotalIdr)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[#0B241E] font-black text-sm text-[#0B241E]">
                      <td colSpan={2} className="pt-2">TOTAL SETORAN KE KAS UMUM DAERAH:</td>
                      <td className="pt-2 text-right font-mono text-emerald-800">
                        {formatRupiah(selectedInvoice.totalAmountIdr)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Digital Stamp & QR Validasi */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-[11px] text-emerald-950">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
                  <div>
                    <p className="font-bold">STATUS: LUNAS DI REKENING KAS DAERAH (RKUD)</p>
                    <p className="text-[10px] text-emerald-800">
                      NTEB: 9940182901192801 • Bank Papua RKUD Cabang Timika
                    </p>
                    <p className="text-[9px] text-[#64748B]">
                      Dokumen ini sah dan diterbitkan secara elektronik melalui Sistem PORTA Pemkab Mimika.
                    </p>
                  </div>
                </div>
                <QrCode className="w-10 h-10 text-emerald-900 shrink-0" />
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white border border-[#CBD5E1] hover:bg-[#F1F5F9] text-[#0B241E] font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Dokumen e-SSRD</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSSRDModalOpen(false)}
                  className="px-4 py-2 bg-[#0B241E] text-white font-extrabold rounded-xl hover:bg-[#143E33] cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL PEMBAYARAN PENGAJUAN RUANGAN (SEWA ASET / PKS) */}
      {isLeasePaymentModalOpen && selectedLeaseForPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#CBD5E1] overflow-hidden my-8">
            <div className="bg-[#0B241E] text-white p-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-[#D97706]" />
                <h3 className="font-bold text-sm">
                  Pembayaran e-SKRD Sewa Ruangan / Aset
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLeasePaymentModalOpen(false)}
                className="text-[#85A69B] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Summary */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-900 border border-violet-200">
                    <Building2 className="w-3 h-3" />
                    Pengajuan Ruangan
                  </span>
                  <span className="font-mono font-bold text-[#0B241E]">
                    {selectedLeaseForPayment.lease.contractNumber}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-[#64748B]">Objek Aset:</span>
                  <strong className="text-[#0B241E] text-right">
                    {selectedLeaseForPayment.lease.asset?.name ||
                      `Aset #${selectedLeaseForPayment.lease.assetId}`}
                  </strong>
                </div>
                <div className="flex justify-between border-t border-[#E2E8F0] pt-2 text-sm font-extrabold text-[#0B241E]">
                  <span>Sisa Tagihan Retribusi:</span>
                  <span className="font-mono text-[#D97706] text-base">
                    {formatRupiah(selectedLeaseForPayment.remaining)}
                  </span>
                </div>
              </div>

              {/* Metode Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setLeasePaymentTab("gateway")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    leasePaymentTab === "gateway"
                      ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                      : "text-[#64748B] hover:text-[#0B241E]"
                  }`}
                >
                  <Zap
                    className={`w-3.5 h-3.5 ${
                      leasePaymentTab === "gateway" ? "text-[#D97706]" : ""
                    }`}
                  />
                  <span>QRIS & VA Instan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLeasePaymentTab("manual")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    leasePaymentTab === "manual"
                      ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                      : "text-[#64748B] hover:text-[#0B241E]"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Setor RKUD / Bendahara</span>
                </button>
              </div>

              {leasePaymentTab === "gateway" && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Pembayaran Online ({paymentConfig?.provider || "Midtrans"} •{" "}
                        {paymentConfig?.gatewayEnabled ? "Aktif" : "Mode Bank Papua / Loket"})
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700 leading-relaxed">
                      Klik tombol di bawah untuk membuat sesi pembayaran otomatis QRIS / Virtual
                      Account. Setelah berhasil, e-SSRD sewa ruangan langsung terbit.
                    </p>
                  </div>

                  {activeCheckoutSession ? (
                    <div className="p-4 bg-[#FAFCFF] border-2 border-dashed border-[#0B241E]/40 rounded-xl space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#64748B] font-bold">Order ID:</span>
                        <span className="font-mono font-bold text-[#0B241E]">
                          {activeCheckoutSession.orderId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#64748B] font-bold">Nominal:</span>
                        <span className="font-mono font-black text-base text-[#D97706]">
                          {formatRupiah(activeCheckoutSession.amountIdr)}
                        </span>
                      </div>
                      <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                        {activeCheckoutSession.redirectUrl && (
                          <a
                            href={activeCheckoutSession.redirectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-4 bg-[#0B241E] hover:bg-[#143E33] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4 text-[#D97706]" />
                            <span>Buka Halaman Pembayaran</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={handleCheckLeasePaymentStatus}
                          disabled={isCheckingOut}
                          className="w-full sm:w-auto py-2.5 px-4 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0B241E] font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${isCheckingOut ? "animate-spin" : ""}`}
                          />
                          <span>Cek Status</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleLeaseGatewayCheckout}
                      disabled={isCheckingOut}
                      className="w-full py-3 bg-[#0B241E] hover:bg-[#143E33] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isCheckingOut ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Memproses Sesi Pembayaran...</span>
                        </>
                      ) : (
                        <>
                          <QrCode className="w-4 h-4 text-[#D97706]" />
                          <span>Buat Sesi Bayar QRIS / VA Sewa Ruangan</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {leasePaymentTab === "manual" && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#FAFCFF] border-2 border-dashed border-[#0B241E]/40 rounded-xl space-y-2 text-center">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                      Rekening Kas Umum Daerah (RKUD) Kab. Mimika — Bank Papua
                    </span>
                    <p className="font-mono text-lg font-black text-[#0B241E]">
                      104-01-01-000123-8
                    </p>
                    <p className="text-[11px] font-semibold text-[#0B241E]">
                      a.n. RKUD PEMERINTAH KABUPATEN MIMIKA (Retribusi Sewa BMD)
                    </p>
                    <p className="text-[10px] text-[#64748B]">
                      Cantumkan nomor kontrak{" "}
                      <strong className="font-mono text-[#0B241E]">
                        {selectedLeaseForPayment.lease.contractNumber}
                      </strong>{" "}
                      pada berita transfer, lalu tunjukkan bukti setor ke Bendahara Penerimaan UPTD
                      Pelabuhan untuk pencatatan & penerbitan kuitansi e-SSRD.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsLeasePaymentModalOpen(false)}
                      className="px-5 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white font-bold rounded-xl text-xs cursor-pointer"
                    >
                      Mengerti & Tutup
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
