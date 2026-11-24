"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Anchor,
  Building2,
  ShieldCheck,
  Search,
  CheckCircle2,
  Layers,
  Ruler,
  RefreshCw,
  Info,
  Waves,
  Wrench,
  XCircle,
  Ship,
  Package,
  Users,
  Calendar,
  Clock,
} from "lucide-react";
import { usePortStore } from "@/store/port.store";
import {
  BerthAuthorityFilter as AuthorityFilter,
  BerthAuthorityType,
  BerthOperationalStatus,
  BerthOperationalStatusFilter as OperationalStatusFilter,
  BerthServiceCategory,
  BerthServiceCategoryFilter as ServiceCategoryFilter,
  BerthType,
} from "@/types/port.types";

export default function DermagaPage() {
  const {
    berths,
    berthsSchedule,
    isLoading,
    isScheduleLoading,
    fetchBerths,
    fetchBerthsSchedule,
  } = usePortStore();

  const [authorityFilter, setAuthorityFilter] = useState<AuthorityFilter>("ALL");
  const [serviceCategoryFilter, setServiceCategoryFilter] =
    useState<ServiceCategoryFilter>("ALL");
  const [operationalStatusFilter, setOperationalStatusFilter] =
    useState<OperationalStatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [scheduleDate, setScheduleDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    fetchBerths(1);
  }, [fetchBerths]);

  useEffect(() => {
    if (scheduleDate) {
      fetchBerthsSchedule(1, scheduleDate);
    }
  }, [fetchBerthsSchedule, scheduleDate]);

  const formatScheduleTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // Statistik Ringkas Dermaga Fisik (Real-Time)
  const stats = useMemo(() => {
    const total = berths.length;
    const pemda = berths.filter((b) => b.authorityType === "PEMDA_DISHUB").length;
    const billable = berths.filter((b) => b.billingEligibility === "BILLABLE").length;
    const openCount = berths.filter(
      (b) => (b.operationalStatus || "OPEN") === "OPEN"
    ).length;
    const maintenanceCount = berths.filter(
      (b) => b.operationalStatus === "MAINTENANCE"
    ).length;
    const closedCount = berths.filter(
      (b) => b.operationalStatus === "CLOSED"
    ).length;
    const readinessPct = total > 0 ? Math.round((openCount / total) * 100) : 0;
    const totalLength = berths.reduce((sum, b) => {
      const len = b.maxLengthMeters ? Number(b.maxLengthMeters) : 0;
      return sum + (isNaN(len) ? 0 : len);
    }, 0);

    return {
      total,
      pemda,
      billable,
      openCount,
      maintenanceCount,
      closedCount,
      readinessPct,
      totalLength,
    };
  }, [berths]);

  // Filter & Search Dermaga
  const filteredBerths = useMemo(() => {
    return berths.filter((item) => {
      if (authorityFilter !== "ALL" && item.authorityType !== authorityFilter) {
        return false;
      }

      if (
        serviceCategoryFilter !== "ALL" &&
        item.berthServiceCategory !== serviceCategoryFilter
      ) {
        return false;
      }

      const currentStatus: BerthOperationalStatus = item.operationalStatus || "OPEN";
      if (
        operationalStatusFilter !== "ALL" &&
        currentStatus !== operationalStatusFilter
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(query);
        const matchCode = item.code.toLowerCase().includes(query);
        const matchLegal = item.legalBasis
          ? item.legalBasis.toLowerCase().includes(query)
          : false;
        return matchName || matchCode || matchLegal;
      }

      return true;
    });
  }, [
    berths,
    authorityFilter,
    serviceCategoryFilter,
    operationalStatusFilter,
    searchQuery,
  ]);

  const getOperationalStatusMeta = (status?: BerthOperationalStatus) => {
    switch (status) {
      case "MAINTENANCE":
        return {
          label: "Pemeliharaan",
          badgeClass: "text-amber-800 bg-amber-50 border-amber-200",
          cardBorderClass: "border-amber-200/90 hover:border-amber-300",
          icon: Wrench,
          isPulse: false,
        };
      case "CLOSED":
        return {
          label: "Tutup Sementara",
          badgeClass: "text-rose-700 bg-rose-50 border-rose-200",
          cardBorderClass: "border-rose-200/90 hover:border-rose-300",
          icon: XCircle,
          isPulse: false,
        };
      case "OPEN":
      default:
        return {
          label: "Siap Sandar (OPEN)",
          badgeClass: "text-emerald-700 bg-emerald-50 border-emerald-200/80",
          cardBorderClass: "border-[#E2E8F0] hover:border-[#CBD5E1]",
          icon: CheckCircle2,
          isPulse: true,
        };
    }
  };

  const getServiceCategoryMeta = (category?: BerthServiceCategory) => {
    switch (category) {
      case "DERMAGA_BARANG":
        return {
          label: "Dermaga Barang",
          badgeClass: "bg-sky-50 text-sky-800 border-sky-200",
          icon: Package,
        };
      case "DERMAGA_PENUMPANG":
        return {
          label: "Dermaga Penumpang",
          badgeClass: "bg-violet-50 text-violet-800 border-violet-200",
          icon: Users,
        };
      case "DERMAGA_CAMPURAN":
      default:
        return {
          label: "Dermaga Campuran",
          badgeClass: "bg-teal-50 text-teal-800 border-teal-200",
          icon: Ship,
        };
    }
  };

  const getBerthTypeLabel = (type: BerthType) => {
    switch (type) {
      case "DERMAGA_BESI_BETON_KAYU":
        return "Dermaga Permanen (Besi/Beton/Kayu)";
      case "PINGGIRAN_TALUD":
        return "Pinggiran Talud Penahan Tanah";
      case "BRESSING_DOLPHIN_PELAMPUNG":
        return "Bressing / Breasting Dolphin Pelampung";
      default:
        return type;
    }
  };

  const getAuthorityBadge = (authority: BerthAuthorityType) => {
    switch (authority) {
      case "PEMDA_DISHUB":
        return {
          label: "Pemda Kab. Mimika (Dishub)",
          badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      case "UPP_KEMENHUB":
        return {
          label: "Kantor UPP Kemenhub",
          badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
        };
      case "TUKS_TERSUS":
        return {
          label: "TUKS / Tersus Mitra",
          badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
        };
      default:
        return {
          label: authority,
          badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Summary Metrics Header (Fokus Dermaga Fisik) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Dermaga & Garis Sandar */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono font-semibold text-[#64748B] uppercase tracking-wider">
              Dermaga &amp; Garis Sandar
            </p>
            <p className="text-2xl font-black text-[#0B241E] mt-1">{stats.total} Tambatan</p>
            <p className="text-[10px] text-[#64748B] mt-0.5 font-medium">
              Total LOA <strong className="text-[#D97706]">{stats.totalLength} Meter</strong>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0B241E]/5 text-[#0B241E] flex items-center justify-center shrink-0">
            <Anchor className="w-5 h-5 text-[#0B241E]" />
          </div>
        </div>

        {/* KPI 2: Kesiapan Operasional */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono font-semibold text-[#64748B] uppercase tracking-wider">
              Kesiapan Dermaga
            </p>
            <p
              className={`text-2xl font-black mt-1 ${
                stats.readinessPct >= 80
                  ? "text-emerald-600"
                  : stats.readinessPct >= 50
                  ? "text-amber-600"
                  : "text-rose-600"
              }`}
            >
              {stats.total > 0 ? `${stats.readinessPct}% Siap` : "-"}
            </p>
            <p className="text-[10px] text-[#64748B] mt-0.5 font-medium">
              <span className="text-emerald-700 font-bold">{stats.openCount} Open</span>
              {stats.maintenanceCount > 0 && (
                <>
                  {" "}•{" "}
                  <span className="text-amber-700 font-bold">
                    {stats.maintenanceCount} Maintenance
                  </span>
                </>
              )}
              {stats.closedCount > 0 && (
                <>
                  {" "}•{" "}
                  <span className="text-rose-700 font-bold">{stats.closedCount} Tutup</span>
                </>
              )}
            </p>
          </div>
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
              stats.readinessPct >= 80
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : stats.readinessPct >= 50
                ? "bg-amber-50 text-amber-600 border-amber-200"
                : "bg-rose-50 text-rose-600 border-rose-200"
            }`}
          >
            {stats.readinessPct >= 80 ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : stats.readinessPct >= 50 ? (
              <Wrench className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
          </div>
        </div>

        {/* KPI 3: Dermaga Kewenangan Pemda */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono font-semibold text-[#64748B] uppercase tracking-wider">
              Dermaga Pemda Mimika
            </p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{stats.pemda} Unit</p>
            <p className="text-[10px] text-[#64748B] mt-0.5 font-medium">
              Pengelolaan UPTD Dishub
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Objek Retribusi Daerah */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono font-semibold text-[#64748B] uppercase tracking-wider">
              Objek Retribusi e-SKRD
            </p>
            <p className="text-2xl font-black text-[#D97706] mt-1">{stats.billable} Unit</p>
            <p className="text-[10px] text-[#64748B] mt-0.5 font-medium">
              Perda Kab. Mimika No. 4/2023
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D97706] border border-amber-200 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Authority Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setAuthorityFilter("ALL")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                authorityFilter === "ALL"
                  ? "bg-[#0B241E] text-white shadow-xs"
                  : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
              }`}
            >
              <span>Semua Pengelola</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthorityFilter("PEMDA_DISHUB")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                authorityFilter === "PEMDA_DISHUB"
                  ? "bg-[#0B241E] text-white shadow-xs"
                  : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pemda Mimika (Dishub)</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthorityFilter("UPP_KEMENHUB")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                authorityFilter === "UPP_KEMENHUB"
                  ? "bg-[#0B241E] text-white shadow-xs"
                  : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
              }`}
            >
              <Anchor className="w-3.5 h-3.5 text-blue-500" />
              <span>UPP Kemenhub</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthorityFilter("TUKS_TERSUS")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                authorityFilter === "TUKS_TERSUS"
                  ? "bg-[#0B241E] text-white shadow-xs"
                  : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-500" />
              <span>TUKS / Mitra</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto shrink-0">
            <div className="inline-flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#D97706]" />
              <span className="text-[11px] font-semibold text-[#475569]">Jadwal Tgl:</span>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                aria-label="Pilih tanggal jadwal dermaga"
                className="text-xs font-mono font-bold text-[#0B241E] bg-transparent focus:outline-none cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                fetchBerths(1);
                fetchBerthsSchedule(1, scheduleDate);
              }}
              disabled={isLoading || isScheduleLoading}
              className="px-3 py-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] hover:text-[#0B241E] transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
              title="Segarkan data dermaga dan jadwal"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isLoading || isScheduleLoading ? "animate-spin text-[#D97706]" : ""
                }`}
              />
              <span>Segarkan</span>
            </button>
          </div>
        </div>

        {/* Search Bar + Filter Kategori Layanan & Status Operasional */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama dermaga, kode alokasi (misal: DRM-PEMDA-01), atau dasar regulasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-2.5 text-[#0B241E] placeholder-[#94A3B8] focus:outline-none focus:border-[#D97706] focus:bg-white transition-colors"
            />
          </div>

          <select
            value={serviceCategoryFilter}
            onChange={(e) =>
              setServiceCategoryFilter(e.target.value as ServiceCategoryFilter)
            }
            aria-label="Filter Kategori Layanan Dermaga"
            className="text-xs font-semibold bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-[#0B241E] focus:outline-none focus:border-[#D97706] focus:bg-white cursor-pointer"
          >
            <option value="ALL">Semua Kategori Layanan</option>
            <option value="DERMAGA_CAMPURAN">Dermaga Campuran</option>
            <option value="DERMAGA_PENUMPANG">Dermaga Penumpang</option>
            <option value="DERMAGA_BARANG">Dermaga Barang</option>
          </select>

          <select
            value={operationalStatusFilter}
            onChange={(e) =>
              setOperationalStatusFilter(e.target.value as OperationalStatusFilter)
            }
            aria-label="Filter Status Operasional Dermaga"
            className="text-xs font-semibold bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-[#0B241E] focus:outline-none focus:border-[#D97706] focus:bg-white cursor-pointer"
          >
            <option value="ALL">Semua Status Operasional</option>
            <option value="OPEN">Siap Sandar (OPEN) ({stats.openCount})</option>
            <option value="MAINTENANCE">Pemeliharaan ({stats.maintenanceCount})</option>
            <option value="CLOSED">Tutup Sementara ({stats.closedCount})</option>
          </select>
        </div>
      </div>

      {/* 3. Berths Directory Grid */}
      <div className="space-y-4">
        {isLoading && berths.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs animate-pulse space-y-3"
              >
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-8 bg-slate-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filteredBerths.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#0B241E]/5 text-[#0B241E] mx-auto flex items-center justify-center mb-4">
              <Anchor className="w-7 h-7 text-[#85A69B]" />
            </div>
            <h3 className="text-base font-bold text-[#0B241E]">Tidak Ditemukan Dermaga</h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1 leading-relaxed">
              {searchQuery
                ? `Tidak ditemukan fasilitas dermaga yang cocok dengan kata kunci "${searchQuery}".`
                : "Belum ada dermaga yang sesuai dengan kombinasi filter kategori layanan dan status operasional ini."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBerths.map((berth) => {
              const authorityConfig = getAuthorityBadge(berth.authorityType);
              const statusMeta = getOperationalStatusMeta(berth.operationalStatus);
              const serviceMeta = getServiceCategoryMeta(berth.berthServiceCategory);
              const StatusIcon = statusMeta.icon;
              const ServiceIcon = serviceMeta.icon;
              const berthSchedule = berthsSchedule?.berths.find(
                (s) => s.berth.id === berth.id
              );

              return (
                <div
                  key={berth.id}
                  className={`bg-white rounded-2xl border ${statusMeta.cardBorderClass} p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group`}
                >
                  <div className="space-y-3">
                    {/* Header Card: Code, Authority Badge & Real-Time Operational Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold bg-[#0B241E] text-white px-2.5 py-1 rounded-lg tracking-wider shadow-xs">
                          {berth.code}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${authorityConfig.badgeClass}`}
                        >
                          {berth.authorityType === "PEMDA_DISHUB" ? (
                            <Building2 className="w-3 h-3 text-emerald-600" />
                          ) : berth.authorityType === "UPP_KEMENHUB" ? (
                            <Anchor className="w-3 h-3 text-blue-500" />
                          ) : (
                            <Layers className="w-3 h-3 text-purple-500" />
                          )}
                          <span>{authorityConfig.label}</span>
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold border px-2.5 py-0.5 rounded-full shrink-0 ${statusMeta.badgeClass}`}
                      >
                        {statusMeta.isPulse ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        ) : (
                          <StatusIcon className="w-3 h-3 shrink-0" />
                        )}
                        <span>{statusMeta.label}</span>
                      </span>
                    </div>

                    {/* Berth Name, Service Category & Construction Type */}
                    <div>
                      <h4 className="text-base font-bold text-[#0B241E] group-hover:text-[#D97706] transition-colors leading-snug">
                        {berth.name}
                      </h4>
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-md border ${serviceMeta.badgeClass}`}
                        >
                          <ServiceIcon className="w-3 h-3 shrink-0" />
                          <span>{serviceMeta.label}</span>
                        </span>
                        <span className="text-xs text-[#64748B] flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-[#85A69B] shrink-0" />
                          <span>{getBerthTypeLabel(berth.berthType)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Technical Specifications Grid */}
                    <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] text-xs space-y-2.5">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] font-mono font-medium text-[#64748B] block uppercase tracking-wider">
                            Panjang Tambatan (LOA)
                          </span>
                          <p className="font-bold text-[#0B241E] mt-0.5 flex items-center gap-1.5 text-sm">
                            <Ruler className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                            <span>{berth.maxLengthMeters || "-"} Meter</span>
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono font-medium text-[#64748B] block uppercase tracking-wider">
                            Draft Maksimal (LWS)
                          </span>
                          <p className="font-bold text-[#0B241E] mt-0.5 flex items-center gap-1.5 text-sm">
                            <Waves className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                            <span>{berth.maxDraftMeters ? `${berth.maxDraftMeters} Meter` : "Aman Standar"}</span>
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E2E8F0]/80 flex items-center justify-between text-xs">
                        <span className="text-[10px] font-mono font-medium text-[#64748B] uppercase tracking-wider">
                          Status Retribusi Daerah:
                        </span>
                        {berth.billingEligibility === "BILLABLE" ? (
                          <span className="font-bold text-emerald-700 inline-flex items-center gap-1 text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Objek Retribusi e-SKRD</span>
                          </span>
                        ) : (
                          <span className="font-bold text-blue-700 inline-flex items-center gap-1 text-[11px]">
                            <Info className="w-3.5 h-3.5" />
                            <span>Non-Retribusi Daerah</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Jadwal Okupansi & Slot Kosong Dermaga */}
                    <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] text-xs space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold text-[#0B241E] uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                          <span>Jadwal Dermaga ({scheduleDate})</span>
                        </span>
                        {berthSchedule && (
                          <span className="text-[10px] font-semibold text-[#64748B]">
                            {berthSchedule.occupiedSlots.length} Terisi
                          </span>
                        )}
                      </div>

                      {isScheduleLoading ? (
                        <p className="text-[11px] text-[#64748B]">Memuat jadwal dermaga...</p>
                      ) : berthSchedule ? (
                        <div className="space-y-1.5">
                          {berthSchedule.occupiedSlots.length > 0 ? (
                            <div className="space-y-1">
                              {berthSchedule.occupiedSlots.map((slot) => (
                                <div
                                  key={slot.berthingId}
                                  className="flex items-center justify-between gap-2 bg-amber-50/80 border border-amber-200/80 rounded-lg px-2.5 py-1.5 text-[11px]"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-mono font-bold text-[#0B241E] whitespace-nowrap">
                                      {formatScheduleTime(slot.startAt)}–
                                      {formatScheduleTime(slot.endAt)}
                                    </span>
                                    <span className="font-semibold text-[#1E293B] truncate">
                                      {slot.vesselName}
                                    </span>
                                  </div>
                                  <span
                                    className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                      slot.status === "ACTIVE"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : slot.status === "COMPLETED"
                                        ? "bg-slate-200 text-slate-700"
                                        : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    {slot.status === "ACTIVE"
                                      ? "Sedang Sandar"
                                      : slot.status === "COMPLETED"
                                      ? "Selesai"
                                      : "Terjadwal"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] font-semibold text-emerald-700">
                              Belum ada jadwal sandar pada tanggal ini.
                            </p>
                          )}

                          {berthSchedule.freeSlots.length > 0 && (
                            <div className="text-[11px] text-[#475569] pt-0.5">
                              <span className="font-bold text-emerald-700">Slot Kosong: </span>
                              <span className="font-mono">
                                {berthSchedule.freeSlots
                                  .map(
                                    (fs) =>
                                      `${formatScheduleTime(fs.startAt)}–${formatScheduleTime(
                                        fs.endAt
                                      )}`
                                  )
                                  .join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#94A3B8]">Jadwal belum tersedia.</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
