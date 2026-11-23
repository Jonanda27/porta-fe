"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Ship,
  Calendar,
  FileCheck2,
  CreditCard,
  Anchor,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Loader2,
  ExternalLink,
  ArrowRight,
  Receipt,
  Scale,
  MapPin,
} from "lucide-react";
import { useKapalStore } from "@/store/kapal.store";
import { useAuthStore } from "@/store/auth.store";
import { useBillingStore } from "@/store/billing.store";
import { VesselVisit } from "@/types/kapal.types";

export default function KapalDashboardPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { user, initialize: initAuth } = useAuthStore();
  const { operator, vessels, visits, isLoading, fetchDashboardData } = useKapalStore();
  const { invoices, fetchInvoices } = useBillingStore();

  useEffect(() => {
    initAuth();
    fetchDashboardData();
    fetchInvoices();
  }, [initAuth, fetchDashboardData, fetchInvoices]);

  // Nama operator dan dokumen legalitas
  const operatorName =
    operator?.name ||
    (user?.fullName
      ? user.fullName.replace(/\(.*?\)/g, "").trim()
      : "PT Pelayaran Mimika Sejahtera");

  const siupalDoc = operator?.documents?.find((d) => d.category === "SIUPAL_NIB");
  const effectiveVerifStatus =
    operator?.verificationStatus || user?.operatorVerificationStatus || "VERIFIED";
  const isVerifiedOperator = effectiveVerifStatus === "VERIFIED";
  const isPendingVerif = effectiveVerifStatus === "PENDING";
  const isRejectedVerif = effectiveVerifStatus === "REJECTED";
  const siupalNumber =
    siupalDoc?.documentNumber ||
    (isPendingVerif
      ? "Menunggu Verifikasi Petugas"
      : isRejectedVerif
      ? "Verifikasi Ditolak"
      : "Belum Ada SIUPAL");

  // Perhitungan Data Real Kunjungan & Armada
  const activeVisits = useMemo(() => {
    return visits.filter((v) => v.status === "BERTHED" || v.status === "ARRIVED");
  }, [visits]);

  const scheduledVisits = useMemo(() => {
    return visits.filter((v) => v.status === "SCHEDULED" || v.status === "APPROVED");
  }, [visits]);

  const completedVisits = useMemo(() => {
    return visits.filter((v) => v.status === "DEPARTED");
  }, [visits]);

  const pendingVisits = useMemo(() => {
    return visits.filter((v) => v.status === "REQUESTED");
  }, [visits]);

  // Perhitungan Data Real Tagihan e-SKRD dari useBillingStore
  const unpaidInvoices = useMemo(() => {
    return invoices.filter(
      (inv) =>
        inv.status === "ISSUED" ||
        inv.status === "PARTIAL" ||
        inv.status === "DRAFT"
    );
  }, [invoices]);

  const paidInvoices = useMemo(() => {
    return invoices.filter((inv) => inv.status === "PAID");
  }, [invoices]);

  const totalUnpaidIdr = useMemo(() => {
    return unpaidInvoices.reduce(
      (acc, inv) => acc + Number(inv.totalAmountIdr || 0),
      0
    );
  }, [unpaidInvoices]);

  // Perhitungan Kepatuhan Manifes SOLAS
  const visitsNeedingManifest = useMemo(() => {
    return visits.filter(
      (v) =>
        v.status === "SCHEDULED" ||
        v.status === "APPROVED" ||
        v.status === "BERTHED"
    );
  }, [visits]);

  // Data kunjungan yang ditampilkan (jika backend telah memiliki visit)
  const displayVisits = visits.length > 0 ? visits : [];

  // Filter kunjungan kapal
  const filteredVisits = displayVisits.filter((v) => {
    if (selectedStatus === "all") return true;
    if (selectedStatus === "active") return v.status === "BERTHED" || v.status === "ARRIVED";
    if (selectedStatus === "scheduled") return v.status === "SCHEDULED" || v.status === "APPROVED" || v.status === "REQUESTED";
    if (selectedStatus === "completed") return v.status === "DEPARTED";
    return true;
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatTimeOnly = (dateStr?: string | null) => {
    if (!dateStr) return "--:-- WIT";
    try {
      const d = new Date(dateStr);
      return (
        d.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }) + " WIT"
      );
    } catch {
      return "--:-- WIT";
    }
  };

  const formatShortDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return "";
    }
  };

  const formatDurationLabel = (etaStr?: string | null, etdStr?: string | null) => {
    if (!etaStr || !etdStr) return "Jadwal Sandar";
    const start = new Date(etaStr).getTime();
    const end = new Date(etdStr).getTime();
    if (isNaN(start) || isNaN(end) || end <= start) return "Jadwal Sandar";
    const totalHours = Math.round((end - start) / (1000 * 60 * 60));
    if (totalHours < 24) return `${totalHours} jam`;
    const days = Math.floor(totalHours / 24);
    const remHours = totalHours % 24;
    return remHours > 0 ? `${days} hr ${remHours} jam` : `${days} hari`;
  };

  const getStageIndex = (status: string): number => {
    if (status === "DEPARTED") return 3;
    if (status === "BERTHED" || status === "ARRIVED") return 2;
    if (status === "SCHEDULED" || status === "APPROVED") return 1;
    return 0;
  };

  const getStatusMeta = (status: string) => {
    switch (status) {
      case "BERTHED":
        return {
          label: "Sandar Aktif",
          badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
          accentClass: "bg-emerald-500",
          dotClass: "bg-emerald-500 animate-pulse",
          isLive: true,
        };
      case "ARRIVED":
        return {
          label: "Tiba di Kolam Labuh",
          badgeClass: "bg-teal-100 text-teal-800 border-teal-200",
          accentClass: "bg-teal-500",
          dotClass: "bg-teal-500 animate-pulse",
          isLive: true,
        };
      case "SCHEDULED":
      case "APPROVED":
        return {
          label: status === "SCHEDULED" ? "Jadwal Terverifikasi" : "Disetujui UPT",
          badgeClass: "bg-sky-100 text-sky-800 border-sky-200",
          accentClass: "bg-sky-500",
          dotClass: "bg-sky-500",
          isLive: false,
        };
      case "REQUESTED":
        return {
          label: "Menunggu Alokasi UPT",
          badgeClass: "bg-amber-100 text-amber-900 border-amber-200",
          accentClass: "bg-amber-500",
          dotClass: "bg-amber-500",
          isLive: false,
        };
      default:
        return {
          label: "Selesai Pelayanan",
          badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
          accentClass: "bg-slate-400",
          dotClass: "bg-slate-400",
          isLive: false,
        };
    }
  };

  // Kelompokkan kunjungan per tanggal ETA untuk tampilan Maritime Agenda Timeline
  const groupedSchedule = useMemo(() => {
    const groups = new Map<
      string,
      {
        dateKey: string;
        dayNum: string;
        monthShort: string;
        yearNum: string;
        relativeLabel: string;
        fullDateLabel: string;
        isToday: boolean;
        items: VesselVisit[];
      }
    >();

    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowKey = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    const sorted = [...filteredVisits].sort((a, b) => {
      const ta = a.eta ? new Date(a.eta).getTime() : 0;
      const tb = b.eta ? new Date(b.eta).getTime() : 0;
      return tb - ta;
    });

    for (const v of sorted) {
      const d = v.eta ? new Date(v.eta) : new Date();
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      if (!groups.has(key)) {
        const isToday = key === todayKey;
        const relativeLabel = isToday
          ? "Hari Ini"
          : key === tomorrowKey
          ? "Besok"
          : key === yesterdayKey
          ? "Kemarin"
          : d.toLocaleDateString("id-ID", { weekday: "long" });

        groups.set(key, {
          dateKey: key,
          dayNum: String(d.getDate()).padStart(2, "0"),
          monthShort: d
            .toLocaleDateString("id-ID", { month: "short" })
            .toUpperCase(),
          yearNum: String(d.getFullYear()),
          relativeLabel,
          fullDateLabel: d.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          isToday,
          items: [],
        });
      }
      groups.get(key)!.items.push(v);
    }

    return Array.from(groups.values());
  }, [filteredVisits]);

  return (
    <div className="space-y-6">
      {/* Banner Status Verifikasi Kemitraan Operator (Bila Masih PENDING / Belum Terverifikasi) */}
      {!isVerifiedOperator && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-start gap-3 min-w-0">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs text-amber-950">
                  {isRejectedVerif
                    ? "Status Kemitraan: Verifikasi Ditolak Petugas"
                    : "Status Kemitraan: Menunggu Verifikasi Petugas"}
                </span>
                <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                  Verifikator: Petugas Registrasi &amp; Kontrak
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Pendaftaran badan usaha Anda telah tersimpan di server dan sedang menunggu verifikasi dari{" "}
                <strong>Petugas Registrasi &amp; Kontrak</strong>. Selama proses verifikasi berlangsung, Anda hanya dapat mengakses halaman{" "}
                <strong>Dashboard Operator</strong> dan <strong>Profil &amp; Master Kapal</strong>.
              </p>
            </div>
          </div>
          <Link
            href="/kapal/profil"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shrink-0 shadow-xs"
          >
            <span>Lengkapi Profil &amp; Berkas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 1. OVERLAPPING OPERATIONAL KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Armada Terdaftar */}
        {(() => {
          const totalFleet = operator?.fleetSummary?.totalVessels ?? vessels.length;
          const verifiedFleet =
            operator?.fleetSummary?.verifiedVesselsCount ??
            vessels.filter((v) => v.verificationStatus === "VERIFIED").length;
          const pendingFleet =
            operator?.fleetSummary?.pendingVesselsCount ??
            vessels.filter((v) => v.verificationStatus === "PENDING").length;

          return (
            <Link
              href="/kapal/profil"
              className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full group"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Ship className="w-4.5 h-4.5 stroke-[2.25]" />
                </div>
                <span
                  className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200/70 px-2.5 py-0.5 rounded-full truncate max-w-[140px]"
                  title={siupalNumber}
                >
                  {siupalNumber}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider truncate">
                  Armada Kapal Terdaftar
                </p>
                <p className="text-[22px] leading-tight font-extrabold text-[#0B241E] font-mono mt-1 truncate">
                  {isLoading && totalFleet === 0 ? "..." : `${totalFleet} Kapal`}
                </p>
              </div>

              <p className="text-[11px] text-[#64748B] mt-2.5 pt-2.5 border-t border-[#F1F5F9] truncate">
                <span className="text-emerald-700 font-bold">{verifiedFleet} Terverifikasi</span>
                <span>
                  {" "}
                  •{" "}
                  {pendingFleet > 0
                    ? `${pendingFleet} Menunggu Verifikasi Petugas`
                    : !isVerifiedOperator
                    ? "Menunggu Verifikasi Petugas"
                    : "Siap Beroperasi"}
                </span>
              </p>
            </Link>
          );
        })()}

        {/* KPI 2: Kunjungan & Permohonan Dermaga */}
        <Link
          href={isVerifiedOperator ? "/kapal/riwayat" : "/kapal/profil"}
          title={
            isVerifiedOperator
              ? "Lihat Riwayat Kunjungan"
              : "Terkunci — Menunggu Verifikasi Petugas"
          }
          className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full group"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Calendar className="w-4.5 h-4.5 stroke-[2.25]" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-full whitespace-nowrap">
              Pelabuhan Poumako
            </span>
          </div>

          <div className="mt-4">
            <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider truncate">
              Total Riwayat Kunjungan
            </p>
            <p className="text-[22px] leading-tight font-extrabold text-[#0B241E] font-mono mt-1 truncate">
              {isLoading && visits.length === 0 ? "..." : `${visits.length} Kunjungan`}
            </p>
          </div>

          <p className="text-[11px] text-[#64748B] mt-2.5 pt-2.5 border-t border-[#F1F5F9] truncate">
            <span className="font-semibold text-[#0B241E]">
              {visits.filter((v) => v.status === "BERTHED" || v.status === "ARRIVED").length} Sandar Aktif
            </span>
            <span>
              {" "}
              • {visits.filter((v) => v.status === "DEPARTED").length} Selesai Pelayanan
            </span>
          </p>
        </Link>

        {/* KPI 3: Status Manifes SOLAS */}
        <Link
          href={isVerifiedOperator ? "/kapal/manifes" : "/kapal/profil"}
          title={
            isVerifiedOperator
              ? "Buka Pelaporan Manifes"
              : "Terkunci — Menunggu Verifikasi Petugas"
          }
          className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full group"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-4.5 h-4.5 stroke-[2.25]" />
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap border ${
                visitsNeedingManifest.length > 0
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : completedVisits.length > 0
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                  : "bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              {visitsNeedingManifest.length > 0
                ? `${visitsNeedingManifest.length} Perlu Lapor`
                : completedVisits.length > 0
                ? "SOLAS Clear"
                : "Siap Lapor"}
            </span>
          </div>

          <div className="mt-4">
            <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider truncate">
              Pelaporan Manifes Kapal
            </p>
            <p className="text-[22px] leading-tight font-extrabold text-[#0B241E] font-mono mt-1 truncate">
              {visitsNeedingManifest.length > 0
                ? `${visitsNeedingManifest.length} Pelayaran`
                : completedVisits.length > 0
                ? "100% Terlapor"
                : "0 Kunjungan"}
            </p>
          </div>

          <p className="text-[11px] text-[#64748B] mt-2.5 pt-2.5 border-t border-[#F1F5F9] truncate">
            {visitsNeedingManifest.length > 0
              ? "Menunggu pelaporan manifes muatan"
              : completedVisits.length > 0
              ? `${completedVisits.length} kunjungan selesai clearance SPB`
              : "Belum ada antrean jadwal sandar"}
          </p>
        </Link>

        {/* KPI 4: Tagihan Retribusi e-SKRD */}
        <Link
          href={isVerifiedOperator ? "/kapal/penagihan" : "/kapal/profil"}
          title={
            isVerifiedOperator
              ? "Buka Tagihan e-SKRD"
              : "Terkunci — Menunggu Verifikasi Petugas"
          }
          className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full group"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <CreditCard className="w-4.5 h-4.5 stroke-[2.25]" />
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap border ${
                unpaidInvoices.length > 0
                  ? "bg-amber-50 text-amber-900 border-amber-200"
                  : paidInvoices.length > 0
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                  : "bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              {unpaidInvoices.length > 0
                ? `${unpaidInvoices.length} Belum Bayar`
                : paidInvoices.length > 0
                ? "Tertib Bayar"
                : "Nihil Tagihan"}
            </span>
          </div>

          <div className="mt-4">
            <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider truncate">
              Tagihan Retribusi e-SKRD
            </p>
            <p className="text-[22px] leading-tight font-extrabold text-[#0B241E] font-mono mt-1 truncate">
              {unpaidInvoices.length > 0
                ? formatRupiah(totalUnpaidIdr)
                : "Rp 0 (Lunas)"}
            </p>
          </div>

          <p className="text-[11px] text-[#64748B] mt-2.5 pt-2.5 border-t border-[#F1F5F9] truncate">
            {unpaidInvoices.length > 0 ? (
              <>
                <span className="font-semibold text-amber-800">
                  {unpaidInvoices.length} invoice aktif
                </span>
                <span> • {paidInvoices.length} lunas</span>
              </>
            ) : paidInvoices.length > 0 ? (
              `Seluruh ${paidInvoices.length} e-SKRD telah lunas ke Kasda`
            ) : (
              "Belum ada tagihan retribusi terbit"
            )}
          </p>
        </Link>
      </div>

      {/* 2. MARITIME AGENDA TIMELINE SCHEDULE (VOYAGE BOARDING-PASS CARDS) */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#FAFCFB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Calendar className="w-5 h-5 text-[#D97706]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#0B241E]">
                Jadwal & Status Operasional Armada — Pelabuhan Poumako
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Agenda pelayaran & progres sandar real-time untuk{" "}
                <strong className="text-[#0B241E]">{operatorName}</strong>
              </p>
            </div>
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl text-xs font-bold flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedStatus("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedStatus === "all"
                  ? "bg-white text-[#0B241E] shadow-xs"
                  : "text-[#64748B] hover:text-[#0B241E]"
              }`}
            >
              Semua ({displayVisits.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("active")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedStatus === "active"
                  ? "bg-white text-[#0B241E] shadow-xs"
                  : "text-[#64748B] hover:text-[#0B241E]"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Sandar Aktif ({activeVisits.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("scheduled")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedStatus === "scheduled"
                  ? "bg-white text-[#0B241E] shadow-xs"
                  : "text-[#64748B] hover:text-[#0B241E]"
              }`}
            >
              Terjadwal ({scheduledVisits.length + pendingVisits.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("completed")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedStatus === "completed"
                  ? "bg-white text-[#0B241E] shadow-xs"
                  : "text-[#64748B] hover:text-[#0B241E]"
              }`}
            >
              Selesai ({completedVisits.length})
            </button>
          </div>
        </div>

        {isLoading && displayVisits.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-[#D97706]" />
            <p className="text-xs">Memuat jadwal operasional armada dari backend...</p>
          </div>
        ) : groupedSchedule.length > 0 ? (
          <div className="p-5 sm:p-6 space-y-6 bg-[#F8FAFC]/60">
            {groupedSchedule.map((group, groupIdx) => (
              <div key={group.dateKey} className="flex flex-col md:flex-row gap-4 md:gap-5">
                {/* Left Vertical Date Column & Rail */}
                <div className="flex md:flex-col items-center md:items-center gap-3 md:gap-0 md:w-24 shrink-0">
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-center border shadow-2xs w-auto md:w-full transition-colors ${
                      group.isToday
                        ? "bg-[#0B241E] text-white border-[#0B241E]"
                        : "bg-white text-[#0B241E] border-[#E2E8F0]"
                    }`}
                  >
                    <p
                      className={`text-[10px] font-mono font-bold tracking-wider uppercase ${
                        group.isToday ? "text-[#D97706]" : "text-[#64748B]"
                      }`}
                    >
                      {group.monthShort} {group.yearNum}
                    </p>
                    <p className="text-2xl font-black font-mono leading-tight mt-0.5">
                      {group.dayNum}
                    </p>
                    <p
                      className={`text-[10px] font-bold mt-0.5 truncate ${
                        group.isToday ? "text-emerald-200" : "text-[#64748B]"
                      }`}
                    >
                      {group.relativeLabel}
                    </p>
                  </div>

                  {/* Mobile Date Subtitle */}
                  <div className="md:hidden">
                    <p className="text-xs font-extrabold text-[#0B241E]">{group.fullDateLabel}</p>
                    <p className="text-[11px] text-[#64748B]">
                      {group.items.length} jadwal pelayaran
                    </p>
                  </div>

                  {/* Vertical Connecting Rail (Desktop) */}
                  {groupIdx < groupedSchedule.length - 1 && (
                    <div className="hidden md:block w-px flex-1 min-h-[24px] border-l-2 border-dashed border-[#CBD5E1] mt-3" />
                  )}
                </div>

                {/* Right Schedule Cards Stack */}
                <div className="flex-1 space-y-3.5 min-w-0">
                  {group.items.map((v) => {
                    const vesselName = v.vessel?.name || "Kapal Terdaftar";
                    const gt = v.vessel?.grossTonnage
                      ? `${Number(v.vessel.grossTonnage).toLocaleString("id-ID")} GT`
                      : "-";
                    const regNo = v.vessel?.registrationNumber || "-";
                    const allocatedBerth = v.berthingRecords?.[0]?.berth?.name;
                    const berthName = allocatedBerth
                      ? allocatedBerth
                      : v.status === "APPROVED" || v.status === "SCHEDULED"
                      ? "Dermaga Umum Poumako"
                      : null;

                    const statusMeta = getStatusMeta(v.status);
                    const stageIndex = getStageIndex(v.status);
                    const durationText = formatDurationLabel(v.eta, v.etd);
                    const etaShortDate = formatShortDate(v.eta);
                    const etdShortDate = formatShortDate(v.etd);
                    const isDifferentDay = etaShortDate && etdShortDate && etaShortDate !== etdShortDate;

                    const stages = [
                      { label: "Diajukan" },
                      { label: "Terjadwal" },
                      { label: "Sandar" },
                      { label: "Bertolak" },
                    ];

                    return (
                      <div
                        key={v.id}
                        className="group relative bg-white border border-[#E2E8F0] hover:border-[#0B241E]/30 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex"
                      >
                        {/* Left Status Color Accent Bar */}
                        <div className={`w-1.5 shrink-0 ${statusMeta.accentClass}`} />

                        <div className="flex-1 p-4 sm:p-5 space-y-4 min-w-0">
                          {/* Card Top Row: Vessel Identity + Status & Berth Pills */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-[#0B241E]/5 border border-[#0B241E]/10 text-[#0B241E] flex items-center justify-center shrink-0">
                                <Ship className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-extrabold text-sm text-[#0B241E] truncate">
                                    {vesselName}
                                  </h4>
                                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200/80">
                                    {v.visitNumber}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#64748B] font-mono mt-0.5">
                                  {regNo} • {gt} • {v.vessel?.vesselCategory || "Campuran"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap shrink-0">
                              {berthName && (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F8FAFC] text-[#0B241E] border border-[#E2E8F0]">
                                  <Anchor className="w-3 h-3 text-[#D97706]" />
                                  <span className="truncate max-w-[160px]" title={berthName}>
                                    {berthName}
                                  </span>
                                </span>
                              )}

                              <span
                                className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${statusMeta.badgeClass}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                                <span>{statusMeta.label}</span>
                              </span>
                            </div>
                          </div>

                          {/* Card Middle Row: Voyage Boarding-Pass Route & Time Window */}
                          <div className="bg-[#F8FAFC] border border-[#E2E8F0]/90 rounded-xl p-3.5 sm:p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
                              {/* ETA / Origin */}
                              <div className="min-w-0">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-bold block">
                                  ETA • Kedatangan
                                </span>
                                <p className="text-base sm:text-lg font-black font-mono text-[#0B241E] tracking-tight mt-0.5">
                                  {formatTimeOnly(v.eta)}
                                </p>
                                <p className="text-xs font-semibold text-[#334155] flex items-center gap-1 mt-0.5 truncate">
                                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span className="truncate">
                                    {v.originPort || "Pelabuhan Dobo"}
                                  </span>
                                </p>
                              </div>

                              {/* Center Track & Duration */}
                              <div className="flex flex-col items-center justify-center min-w-[140px] py-1">
                                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white border border-[#CBD5E1] text-[#0B241E] shadow-2xs">
                                  {durationText}
                                </span>
                                <div className="w-full flex items-center gap-1.5 mt-2">
                                  <span className="w-2 h-2 rounded-full bg-[#0B241E] shrink-0" />
                                  <div className="flex-1 border-t-2 border-dashed border-[#94A3B8]" />
                                  <span className="w-6 h-6 rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center shadow-2xs shrink-0">
                                    <Ship className="w-3.5 h-3.5 text-[#D97706]" />
                                  </span>
                                  <div className="flex-1 border-t-2 border-dashed border-[#94A3B8]" />
                                  <ArrowRight className="w-3.5 h-3.5 text-[#D97706] shrink-0 -ml-1" />
                                </div>
                              </div>

                              {/* ETD / Destination */}
                              <div className="sm:text-right min-w-0">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-bold block">
                                  ETD • Bertolak {isDifferentDay ? `(${etdShortDate})` : ""}
                                </span>
                                <p className="text-base sm:text-lg font-black font-mono text-[#0B241E] tracking-tight mt-0.5">
                                  {formatTimeOnly(v.etd)}
                                </p>
                                <p className="text-xs font-semibold text-[#334155] flex items-center sm:justify-end gap-1 mt-0.5 truncate">
                                  <Anchor className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                                  <span className="truncate">
                                    {v.destinationPort || "Pelabuhan Poumako"}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Card Bottom Row: 4-Stage Progress Stepper + Quick Actions */}
                          <div className="pt-1 flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-t border-[#F1F5F9]">
                            {/* 4-Stage Operational Progress */}
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-2 lg:pt-1">
                              {stages.map((st, idx) => {
                                const isDone = idx < stageIndex || (idx === 3 && stageIndex === 3);
                                const isCurrent = idx === stageIndex && stageIndex < 3;
                                return (
                                  <React.Fragment key={st.label}>
                                    <div
                                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                        isDone
                                          ? "bg-emerald-50 text-emerald-800"
                                          : isCurrent
                                          ? "bg-[#0B241E] text-white shadow-2xs"
                                          : "bg-slate-50 text-slate-400"
                                      }`}
                                    >
                                      {isDone ? (
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      ) : isCurrent ? (
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
                                      ) : (
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                      )}
                                      <span>{st.label}</span>
                                    </div>
                                    {idx < stages.length - 1 && (
                                      <ChevronRight className="w-3 h-3 text-[#CBD5E1] shrink-0" />
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </div>

                            {/* Quick Action Buttons */}
                            <div className="flex items-center gap-2 shrink-0 pt-1 lg:pt-0">
                              <Link
                                href={`/kapal/manifes?ship=${encodeURIComponent(vesselName)}`}
                                className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-[#0B241E] hover:text-white text-[#0B241E] border border-[#E2E8F0] text-[11px] font-bold transition-colors inline-flex items-center gap-1.5"
                              >
                                <FileCheck2 className="w-3.5 h-3.5 text-[#D97706]" />
                                <span>Manifes</span>
                              </Link>
                              <Link
                                href="/kapal/penagihan"
                                className="px-3 py-1.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                              >
                                <CreditCard className="w-3.5 h-3.5 text-[#D97706]" />
                                <span>Tagihan e-SKRD</span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center space-y-4">
            <p className="text-xs text-slate-600">
              Belum ada kunjungan kapal yang tercatat untuk filter ini.
            </p>
            {vessels.length > 0 && (
              <div className="max-w-md mx-auto p-4 bg-slate-50 border border-slate-200 rounded-xl text-left">
                <p className="text-xs font-bold text-[#0B241E] mb-2">
                  Daftar Kapal Terdaftar Milik Anda:
                </p>
                <ul className="text-xs space-y-1.5 text-slate-600 font-mono">
                  {vessels.map((v) => (
                    <li key={v.id} className="flex justify-between items-center py-1 border-b border-slate-200/60 last:border-0">
                      <span className="font-bold text-[#0B241E]">{v.name}</span>
                      <span className="text-[11px] text-slate-500">{v.grossTonnage} GT ({v.shipType})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {isVerifiedOperator ? (
              <Link
                href="/kapal/permohonan"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>+ Ajukan Permohonan Sandar Baru</span>
              </Link>
            ) : (
              <Link
                href="/kapal/profil"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#D97706]" />
                <span>Lengkapi Profil &amp; Berkas (Menunggu Verifikasi Petugas)</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* 3. ALERTS & REGULATORY SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-[#0B241E] uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D97706]" />
              <span>Status Alokasi & Permohonan Sandar (PPK)</span>
            </h4>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                pendingVisits.length > 0
                  ? "bg-amber-100 text-amber-900 border border-amber-200"
                  : scheduledVisits.length > 0
                  ? "bg-blue-100 text-blue-800"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {!isVerifiedOperator
                ? "Menunggu Verifikasi Petugas"
                : pendingVisits.length > 0
                ? `${pendingVisits.length} Verifikasi Petugas`
                : scheduledVisits.length > 0
                ? `${scheduledVisits.length} Siap Tambat`
                : "Operasional Normal"}
            </span>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            {!isVerifiedOperator
              ? "Fitur pengajuan jadwal sandar dermaga akan terbuka otomatis setelah akun badan usaha Anda diverifikasi oleh Petugas Registrasi & Kontrak."
              : pendingVisits.length > 0
              ? `Terdapat ${pendingVisits.length} permohonan sandar baru sedang menunggu peninjauan dan penetapan dermaga oleh petugas pelabuhan.`
              : scheduledVisits.length > 0
              ? `Terdapat ${scheduledVisits.length} jadwal sandar kapal telah terverifikasi/disetujui dan siap memasuki tambatan dermaga.`
              : "Seluruh permohonan sandar kapal telah terproses. Permohonan baru wajib diajukan minimal 4 jam sebelum estimasi kedatangan (ETA)."}
          </p>
          <div className="pt-2">
            <Link
              href={isVerifiedOperator ? "/kapal/permohonan" : "/kapal/profil"}
              className="text-xs font-bold text-[#0B241E] hover:text-[#D97706] flex items-center gap-1 group"
            >
              <span>
                {isVerifiedOperator
                  ? "Buka Formulir Pengajuan Jadwal"
                  : "Lengkapi Dokumen Legalitas di Profil"}
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-[#0B241E] uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Kewajiban Retribusi Daerah (PP 35/2023)</span>
            </h4>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                unpaidInvoices.length > 0
                  ? "bg-red-100 text-red-900 border border-red-200"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {unpaidInvoices.length > 0
                ? "Menunggu Setoran"
                : "Kepatuhan Penuh"}
            </span>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            {unpaidInvoices.length > 0
              ? `Terdapat ${unpaidInvoices.length} tagihan e-SKRD aktif senilai ${formatRupiah(totalUnpaidIdr)} yang menunggu pelunasan ke Kas Daerah (RKUD) Kab. Mimika via Virtual Account / QRIS.`
              : `Seluruh ${paidInvoices.length} tagihan retribusi e-SKRD telah lunas terbayar dan tersinkronisasi ke Kas Daerah (RKUD) Kabupaten Mimika.`}
          </p>
          <div className="pt-2">
            <Link
              href={isVerifiedOperator ? "/kapal/penagihan" : "/kapal/profil"}
              className="text-xs font-bold text-[#0B241E] hover:text-[#D97706] flex items-center gap-1 group"
            >
              <span>
                {isVerifiedOperator
                  ? "Cek Tagihan e-SKRD & Rekening RKUD"
                  : "Buka Halaman Profil & Master Kapal"}
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
