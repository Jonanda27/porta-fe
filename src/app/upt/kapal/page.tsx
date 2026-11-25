"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Ship,
  Anchor,
  Package,
  Droplet,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Upload,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useFieldOpsStore } from "@/store/field-ops.store";
import { usePortStore } from "@/store/port.store";
import { toast } from "@/store/toast.store";
import { TablePagination } from "@/components/ui/table-pagination";
import { formatLabel } from "@/lib/format-labels";
import {
  CargoCategory,
  PortEquipmentType,
  UtilityType,
} from "@/types/field-ops.types";
import { UptKapalTabType } from "@/types/upt.types";

export default function UptKapalPage() {
  const { user } = useAuthStore();
  const {
    visits,
    utilities,
    isLoading,
    isSubmitting,
    error,
    fetchVesselOpsData,
    recordArrival,
    startBerthing,
    endBerthing,
    recordDeparture,
    createCargo,
    createEquipment,
    createUtility,
    clearError,
  } = useFieldOpsStore();
  const { ports, fetchPorts } = usePortStore();

  const isSuperadmin = user?.role === "SUPERADMIN";
  const [selectedPortId, setSelectedPortId] = useState<string>("");
  const numericPortId = selectedPortId ? Number(selectedPortId) : undefined;
  const activePortId = Number(numericPortId || user?.portId || ports[0]?.id || 1);

  const [activeTab, setActiveTab] = useState<UptKapalTabType>("visits");

  // Opsi 1 UI states: compact berth strip, status/berth/search filters, clipboard feedback
  const [isBerthExpanded, setIsBerthExpanded] = useState(false);
  const [selectedBerthFilter, setSelectedBerthFilter] = useState<number | null>(null);
  const [visitStatusFilter, setVisitStatusFilter] = useState<
    "ALL" | "PENDING_ARRIVAL" | "ACTIVE" | "COMPLETED"
  >("ALL");
  const [visitSearch, setVisitSearch] = useState("");
  const [copiedVisitId, setCopiedVisitId] = useState<number | null>(null);
  const [visitsPage, setVisitsPage] = useState(1);
  const [visitsItemsPerPage, setVisitsItemsPerPage] = useState(10);
  const [utilPage, setUtilPage] = useState(1);
  const [utilItemsPerPage, setUtilItemsPerPage] = useState(10);

  // Start berthing modal
  const [berthingVisitId, setBerthingVisitId] = useState<number | null>(null);
  const [berthId, setBerthId] = useState<string>("");
  const [isBerthLocked, setIsBerthLocked] = useState<boolean>(false);
  const [berthCategory, setBerthCategory] = useState<"UMUM" | "KHUSUS_TUKS">("UMUM");
  const [overrideReason, setOverrideReason] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  // Cargo & equipment form state
  const [cargoVisitId, setCargoVisitId] = useState<string>("");
  const [cargoCategory, setCargoCategory] = useState<CargoCategory>("ANTARPULAU");
  const [cargoDesc, setCargoDesc] = useState("");
  const [cargoQty, setCargoQty] = useState("");
  const [cargoUnit, setCargoUnit] = useState("ton");

  const [equipVisitId, setEquipVisitId] = useState<string>("");
  const [equipType, setEquipType] = useState<PortEquipmentType>("FORKLIFT");
  const [equipLabel, setEquipLabel] = useState("Forklift 5 Ton");
  const [equipHours, setEquipHours] = useState("2");

  // Utility form state
  const [utilType, setUtilType] = useState<UtilityType>("AIR_BERSIH");
  const [utilVisitId, setUtilVisitId] = useState<string>("");
  const [meterStart, setMeterStart] = useState("");
  const [meterEnd, setMeterEnd] = useState("");
  const [utilUnit, setUtilUnit] = useState("liter");

  useEffect(() => {
    fetchVesselOpsData(numericPortId);
    fetchPorts();
  }, [numericPortId, fetchVesselOpsData, fetchPorts]);

  const activePortBerths =
    ports.find((p) => p.id === activePortId)?.berths ||
    ports.flatMap((p) => p.berths || []);

  const berthOccupationMap = useMemo(() => {
    const map = new Map<number, (typeof visits)[number]>();
    for (const berth of activePortBerths) {
      const occupying = visits.find((v) =>
        (v.berthingRecords || v.berthings)?.some(
          (b) =>
            b.berthId === berth.id &&
            Boolean(b.actualStartAt) &&
            !b.actualEndAt &&
            b.approvalStatus !== "PENDING" &&
            b.approvalStatus !== "REJECTED"
        )
      );
      if (occupying) {
        map.set(berth.id, occupying);
      }
    }
    return map;
  }, [activePortBerths, visits]);

  const occupiedBerthCount = berthOccupationMap.size;
  const availableBerthCount = activePortBerths.filter(
    (b) => !berthOccupationMap.has(b.id) && b.operationalStatus === "OPEN"
  ).length;

  const visitCounts = useMemo(() => {
    let pendingArrival = 0;
    let active = 0;
    let completed = 0;
    for (const v of visits) {
      if (v.status === "APPROVED" || v.status === "ANCHORED") {
        pendingArrival += 1;
      } else if (v.status === "BERTHED") {
        active += 1;
      } else if (
        v.status === "DEPARTED" ||
        v.status === "BILLED" ||
        v.status === "SETTLED"
      ) {
        completed += 1;
      }
    }
    return {
      all: visits.length,
      pendingArrival,
      active,
      completed,
    };
  }, [visits]);

  const filteredVisits = useMemo(() => {
    const q = visitSearch.trim().toLowerCase();
    return visits.filter((v) => {
      if (visitStatusFilter === "PENDING_ARRIVAL") {
        if (v.status !== "APPROVED" && v.status !== "ANCHORED") return false;
      } else if (visitStatusFilter === "ACTIVE") {
        if (v.status !== "BERTHED") return false;
      } else if (visitStatusFilter === "COMPLETED") {
        if (
          v.status !== "DEPARTED" &&
          v.status !== "BILLED" &&
          v.status !== "SETTLED"
        ) {
          return false;
        }
      }

      if (selectedBerthFilter !== null) {
        const berthingList = v.berthingRecords || v.berthings || [];
        const matchesBerth = berthingList.some(
          (b) => b.berthId === selectedBerthFilter
        );
        if (!matchesBerth) return false;
      }

      if (q) {
        const vesselName = (v.vessel?.name || "").toLowerCase();
        const visitNum = (v.visitNumber || "").toLowerCase();
        const origin = (v.originPort || "").toLowerCase();
        const dest = (v.destinationPort || "").toLowerCase();
        if (
          !vesselName.includes(q) &&
          !visitNum.includes(q) &&
          !origin.includes(q) &&
          !dest.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [visits, visitStatusFilter, selectedBerthFilter, visitSearch]);

  useEffect(() => {
    setVisitsPage(1);
  }, [visitStatusFilter, selectedBerthFilter, visitSearch, numericPortId]);

  useEffect(() => {
    setUtilPage(1);
  }, [numericPortId]);

  const totalVisitPages = Math.max(
    1,
    Math.ceil(filteredVisits.length / visitsItemsPerPage)
  );
  const paginatedVisits = useMemo(() => {
    const safePage = Math.min(visitsPage, totalVisitPages);
    const start = (safePage - 1) * visitsItemsPerPage;
    return filteredVisits.slice(start, start + visitsItemsPerPage);
  }, [filteredVisits, visitsPage, totalVisitPages, visitsItemsPerPage]);

  const totalUtilPages = Math.max(
    1,
    Math.ceil(utilities.length / utilItemsPerPage)
  );
  const paginatedUtilities = useMemo(() => {
    const safePage = Math.min(utilPage, totalUtilPages);
    const start = (safePage - 1) * utilItemsPerPage;
    return utilities.slice(start, start + utilItemsPerPage);
  }, [utilities, utilPage, totalUtilPages, utilItemsPerPage]);

  const handleCopyVisitNumber = async (visitId: number, visitNumber: string) => {
    try {
      await navigator.clipboard.writeText(visitNumber);
      setCopiedVisitId(visitId);
      setTimeout(() => {
        setCopiedVisitId((prev) => (prev === visitId ? null : prev));
      }, 1500);
    } catch {
      toast.error("Gagal Menyalin", "Tidak dapat menyalin nomor kunjungan.");
    }
  };

  const formatWitDateTime = (iso?: string | null) => {
    if (!iso) return "-";
    return `${new Date(iso).toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jayapura",
    })} WIT`;
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "ANCHORED":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "BERTHED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "DEPARTED":
      case "BILLED":
      case "SETTLED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const handleArrival = async (visitId: number, visitNumber: string) => {
    clearError();
    try {
      await recordArrival(visitId, new Date().toISOString(), numericPortId);
      toast.success("Kedatangan Dicatat", `Kedatangan (ATA) untuk ${visitNumber} berhasil dicatat.`);
    } catch {
      // Error sudah ditangani di store
    }
  };

  const handleStartBerthing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!berthingVisitId || !berthId) return;
    clearError();
    try {
      await startBerthing(
        berthingVisitId,
        {
          berthId: Number(berthId),
          berthCategory,
          actualStartAt: new Date().toISOString(),
          overrideReason: overrideReason.trim() || undefined,
          safetyChecklistVerified: true,
          evidenceFile,
        },
        numericPortId
      );
      toast.success(
        overrideReason.trim() ? "Override Sandar Dikirim" : "Sandar Dicatat",
        overrideReason.trim()
          ? "Pengajuan override sandar berhasil dikirim dan menunggu persetujuan Admin Pelabuhan di menu Alokasi Dermaga."
          : "Pencatatan sandar (ATB) berhasil disimpan."
      );
      setBerthingVisitId(null);
      setOverrideReason("");
      setEvidenceFile(null);
    } catch {
      // Error sudah ditangani di store
    }
  };

  const handleEndBerthing = async (visitId: number, berthingId: number) => {
    clearError();
    try {
      await endBerthing(visitId, berthingId, new Date().toISOString(), numericPortId);
      toast.success("Selesai Sandar Dicatat", "Selesai sandar berhasil dicatat.");
    } catch {
      // Error sudah ditangani di store
    }
  };

  const handleDeparture = async (visitId: number, visitNumber: string) => {
    clearError();
    try {
      await recordDeparture(visitId, new Date().toISOString(), numericPortId);
      toast.success("Keberangkatan Dicatat", `Keberangkatan (ATD) untuk ${visitNumber} berhasil dicatat.`);
    } catch {
      // Error sudah ditangani di store
    }
  };

  const handleCreateCargo = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await createCargo(
      {
        portId: activePortId,
        visitId: cargoVisitId ? Number(cargoVisitId) : undefined,
        cargoCategory,
        description: cargoDesc.trim(),
        quantity: Number(cargoQty),
        unitLabel: cargoUnit.trim(),
      },
      numericPortId
    );
    toast.success("Bongkar Muat Disimpan", "Catatan bongkar muat berhasil disimpan.");
    setCargoDesc("");
    setCargoQty("");
  };

  const handleCreateEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await createEquipment(
      {
        portId: activePortId,
        visitId: equipVisitId ? Number(equipVisitId) : undefined,
        equipmentType: equipType,
        capacityLabel: equipLabel.trim(),
        durationHours: Number(equipHours),
      },
      numericPortId
    );
    toast.success("Sewa Alat Dicatat", "Sewa alat pelabuhan berhasil dicatat.");
  };

  const handleCreateUtility = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await createUtility(
      {
        portId: activePortId,
        visitId: utilVisitId ? Number(utilVisitId) : undefined,
        utilityType: utilType,
        meterStart: Number(meterStart),
        meterEnd: Number(meterEnd),
        unitLabel: utilUnit.trim(),
      },
      numericPortId
    );
    toast.success("Meter Utilitas Disimpan", "Pembacaan meter utilitas berhasil disimpan.");
    setMeterStart("");
    setMeterEnd("");
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("visits")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
              activeTab === "visits"
                ? "bg-[#0B241E] text-white"
                : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
            }`}
          >
            <Ship className="w-4 h-4 text-[#D97706]" />
            Log Kunjungan & Sandar ({visits.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cargo")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
              activeTab === "cargo"
                ? "bg-[#0B241E] text-white"
                : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
            }`}
          >
            <Package className="w-4 h-4 text-[#D97706]" />
            Bongkar Muat & Sewa Alat
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("utilities")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
              activeTab === "utilities"
                ? "bg-[#0B241E] text-white"
                : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
            }`}
          >
            <Droplet className="w-4 h-4 text-[#D97706]" />
            Utilitas Air & Listrik ({utilities.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isSuperadmin && (
            <select
              value={selectedPortId}
              onChange={(e) => setSelectedPortId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0B241E]"
            >
              <option value="">Semua Pelabuhan</option>
              {ports.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={() => fetchVesselOpsData(numericPortId)}
            disabled={isLoading}
            className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab 1: Visits & Berthing (Opsi 1: Compact Berth Strip + Focused Table) */}
      {activeTab === "visits" && (
        <div className="space-y-4">
          {/* Panel Okupansi Dermaga Real-Time (Compact Strip + Expandable) */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs font-bold text-[#0B241E] flex items-center gap-1.5">
                  <Anchor className="w-4 h-4 text-[#D97706]" />
                  Okupansi Dermaga Real-Time
                </h3>
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  {occupiedBerthCount}/{activePortBerths.length} Terisi
                </span>
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {availableBerthCount} Tersedia
                </span>
                {selectedBerthFilter !== null && (
                  <button
                    type="button"
                    onClick={() => setSelectedBerthFilter(null)}
                    className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#0B241E] text-white inline-flex items-center gap-1 cursor-pointer hover:bg-[#13382F]"
                  >
                    Filter Dermaga Aktif
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsBerthExpanded((prev) => !prev)}
                className="text-[11px] font-semibold text-[#475569] hover:text-[#0B241E] inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#F8FAFC] cursor-pointer"
              >
                {isBerthExpanded ? (
                  <>
                    Ringkas
                    <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    Detail Kartu
                    <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {isBerthExpanded ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {activePortBerths.map((berth) => {
                  const occupyingVisit = berthOccupationMap.get(berth.id);
                  const isSelected = selectedBerthFilter === berth.id;
                  return (
                    <button
                      key={berth.id}
                      type="button"
                      onClick={() =>
                        setSelectedBerthFilter((prev) =>
                          prev === berth.id ? null : berth.id
                        )
                      }
                      className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                        occupyingVisit
                          ? "bg-amber-50/70 border-amber-200 hover:border-amber-300"
                          : berth.operationalStatus === "OPEN"
                          ? "bg-emerald-50/50 border-emerald-200 hover:border-emerald-300"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300"
                      } ${isSelected ? "ring-2 ring-[#0B241E] ring-offset-1" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-[#0B241E]">
                          {berth.code}
                        </span>
                        <span className="text-[10px] font-bold">
                          {occupyingVisit
                            ? "Terisi"
                            : formatLabel(berth.operationalStatus)}
                        </span>
                      </div>
                      <p className="font-semibold text-[#1E293B] mt-0.5 truncate">
                        {berth.name}
                      </p>
                      <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
                        {occupyingVisit
                          ? `Kapal: ${
                              occupyingVisit.vessel?.name ||
                              occupyingVisit.visitNumber
                            }`
                          : formatLabel(berth.berthServiceCategory)}
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {activePortBerths.map((berth) => {
                  const occupyingVisit = berthOccupationMap.get(berth.id);
                  const isSelected = selectedBerthFilter === berth.id;
                  return (
                    <button
                      key={berth.id}
                      type="button"
                      onClick={() =>
                        setSelectedBerthFilter((prev) =>
                          prev === berth.id ? null : berth.id
                        )
                      }
                      title={`${berth.name} — Klik untuk filter kunjungan di dermaga ini`}
                      className={`text-left px-2.5 py-2 rounded-xl border transition-all cursor-pointer ${
                        occupyingVisit
                          ? "bg-amber-50/80 border-amber-200 hover:border-amber-300"
                          : berth.operationalStatus === "OPEN"
                          ? "bg-emerald-50/50 border-emerald-200 hover:border-emerald-300"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300"
                      } ${isSelected ? "ring-2 ring-[#0B241E] ring-offset-1" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-mono text-[11px] font-bold text-[#0B241E] truncate">
                          {berth.code}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            occupyingVisit
                              ? "bg-amber-500"
                              : berth.operationalStatus === "OPEN"
                              ? "bg-emerald-500"
                              : "bg-slate-400"
                          }`}
                        />
                      </div>
                      <p className="text-[10.5px] font-medium text-[#475569] truncate mt-0.5">
                        {occupyingVisit
                          ? occupyingVisit.vessel?.name ||
                            occupyingVisit.visitNumber
                          : "Tersedia"}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Focused Table Card dengan Filter Status & Pencarian */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
            {/* Table Filter & Search Toolbar */}
            <div className="p-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC]/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    { key: "ALL", label: "Semua", count: visitCounts.all },
                    {
                      key: "PENDING_ARRIVAL",
                      label: "Menunggu / Tiba",
                      count: visitCounts.pendingArrival,
                    },
                    {
                      key: "ACTIVE",
                      label: "Sedang Sandar",
                      count: visitCounts.active,
                    },
                    {
                      key: "COMPLETED",
                      label: "Selesai",
                      count: visitCounts.completed,
                    },
                  ] as const
                ).map((item) => {
                  const active = visitStatusFilter === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setVisitStatusFilter(item.key)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                        active
                          ? "bg-[#0B241E] text-white"
                          : "bg-white border border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-[#64748B]"
                        }`}
                      >
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={visitSearch}
                  onChange={(e) => setVisitSearch(e.target.value)}
                  placeholder="Cari kapal, rute, no. kunjungan..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-[#CBD5E1] bg-white text-xs text-[#0B241E] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0B241E]"
                />
                {visitSearch && (
                  <button
                    type="button"
                    onClick={() => setVisitSearch("")}
                    aria-label="Hapus pencarian"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B] bg-[#F8FAFC]">
                    <th className="py-3 px-4">No. Kunjungan</th>
                    <th className="py-3 px-4">Kapal &amp; Rute</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Waktu Aktual (WIT)</th>
                    <th className="py-3 px-4 text-right">Progres &amp; Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-[#64748B]">
                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                        Memuat log kunjungan...
                      </td>
                    </tr>
                  ) : filteredVisits.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-[#94A3B8]">
                        {visits.length === 0
                          ? "Belum ada data kunjungan kapal."
                          : "Tidak ada kunjungan yang sesuai dengan filter."}
                      </td>
                    </tr>
                  ) : (
                    paginatedVisits.map((v) => {
                      const berthingList = v.berthingRecords || v.berthings || [];
                      const pendingOverride = berthingList.find(
                        (b) => b.approvalStatus === "PENDING" && !b.actualEndAt
                      );
                      const activeBerthing = berthingList.find(
                        (b) =>
                          Boolean(b.actualStartAt) &&
                          !b.actualEndAt &&
                          b.approvalStatus !== "PENDING" &&
                          b.approvalStatus !== "REJECTED"
                      );
                      const primaryBerth =
                        activeBerthing?.berth ||
                        berthingList[0]?.berth ||
                        activePortBerths.find(
                          (b) => b.id === (activeBerthing?.berthId || berthingList[0]?.berthId)
                        );

                      const step1Done = Boolean(v.ataAnchorage);
                      const step2Done = Boolean(
                        activeBerthing ||
                          v.status === "BERTHED" ||
                          v.status === "DEPARTED" ||
                          v.status === "BILLED" ||
                          v.status === "SETTLED"
                      );
                      const step3Done = Boolean(
                        (v.status === "BERTHED" && !activeBerthing) || v.atdPort
                      );
                      const step4Done = Boolean(v.atdPort);

                      return (
                        <tr key={v.id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-[#0B241E] text-[11.5px]">
                                {v.visitNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyVisitNumber(v.id, v.visitNumber)}
                                title="Salin No. Kunjungan"
                                className="p-1 rounded-md text-[#94A3B8] hover:text-[#0B241E] hover:bg-slate-100 cursor-pointer"
                              >
                                {copiedVisitId === v.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            {primaryBerth && (
                              <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-slate-100 text-[#475569] font-mono text-[10px] font-semibold">
                                {primaryBerth.code}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#1E293B]">
                              {v.vessel?.name || `Kapal #${v.vesselId}`}
                            </div>
                            <div className="text-[11px] text-[#64748B]">
                              {v.originPort || "-"} → {v.destinationPort || "-"}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(
                                v.status
                              )}`}
                            >
                              {formatLabel(v.status)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[11px] text-[#475569] font-mono whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-[#94A3B8] w-7">
                                ATA
                              </span>
                              <span>{formatWitDateTime(v.ataAnchorage)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-bold text-[#94A3B8] w-7">
                                ATD
                              </span>
                              <span>{formatWitDateTime(v.atdPort)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-3">
                              {/* Compact 4-Dot Visual Stepper */}
                              <div
                                className="hidden xl:flex items-center gap-1"
                                title="Alur: 1. Tiba → 2. Sandar → 3. Lepas → 4. Berangkat"
                              >
                                {[
                                  { label: "1. Tiba", done: step1Done, active: v.status === "APPROVED" },
                                  { label: "2. Sandar", done: step2Done, active: v.status === "ANCHORED" },
                                  { label: "3. Lepas", done: step3Done, active: Boolean(activeBerthing) },
                                  { label: "4. Berangkat", done: step4Done, active: v.status === "BERTHED" && !activeBerthing },
                                ].map((st, idx) => (
                                  <React.Fragment key={st.label}>
                                    <span
                                      title={st.label}
                                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                        st.done
                                          ? "bg-emerald-500"
                                          : st.active
                                          ? "bg-amber-500 ring-2 ring-amber-200"
                                          : "bg-slate-200"
                                      }`}
                                    />
                                    {idx < 3 && (
                                      <span
                                        className={`w-3 h-0.5 ${
                                          st.done ? "bg-emerald-400" : "bg-slate-200"
                                        }`}
                                      />
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>

                              <div className="flex items-center justify-end gap-2 flex-wrap">
                                {/* Langkah 1: Catat Tiba (ATA) */}
                                {v.status === "APPROVED" && (
                                  <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => handleArrival(v.id, v.visitNumber)}
                                    className="px-3 py-1.5 rounded-lg bg-[#0B241E] hover:bg-[#13382F] text-white text-[11px] font-bold cursor-pointer transition-colors whitespace-nowrap"
                                  >
                                    1. Catat Tiba (ATA)
                                  </button>
                                )}

                                {/* Langkah 2: Mulai Sandar (ATB) setelah kapal tiba / berlabuh */}
                                {v.status === "ANCHORED" && !activeBerthing && pendingOverride && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                                    Menunggu Persetujuan Override
                                  </span>
                                )}

                                {v.status === "ANCHORED" && !activeBerthing && !pendingOverride && (
                                  <>
                                    <button
                                      type="button"
                                      disabled={isSubmitting}
                                      onClick={() => {
                                        const allocatedBerthing =
                                          v.berthingRecords?.[0] || v.berthings?.[0];
                                        const allocatedBerthId = allocatedBerthing?.berthId;
                                        setBerthingVisitId(v.id);
                                        setBerthId(
                                          allocatedBerthId
                                            ? String(allocatedBerthId)
                                            : activePortBerths[0]?.id
                                            ? String(activePortBerths[0].id)
                                            : ""
                                        );
                                        setIsBerthLocked(Boolean(allocatedBerthId));
                                        if (allocatedBerthing?.berthCategory) {
                                          setBerthCategory(allocatedBerthing.berthCategory);
                                        }
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
                                    >
                                      <Anchor className="w-3 h-3" />
                                      2. Mulai Sandar (ATB)
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isSubmitting}
                                      onClick={() => handleDeparture(v.id, v.visitNumber)}
                                      title="Gunakan hanya jika kapal langsung bertolak tanpa sandar di dermaga"
                                      className="px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#475569] text-[11px] font-semibold cursor-pointer transition-colors whitespace-nowrap"
                                    >
                                      Tanpa Sandar
                                    </button>
                                  </>
                                )}

                                {/* Langkah 3: Lepas Sandar saat kapal sedang sandar */}
                                {activeBerthing && (
                                  <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => handleEndBerthing(v.id, activeBerthing.id)}
                                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold cursor-pointer transition-colors whitespace-nowrap"
                                  >
                                    3. Lepas Sandar
                                  </button>
                                )}

                                {/* Langkah 4: Catat Berangkat (ATD) setelah lepas sandar */}
                                {v.status === "BERTHED" && !activeBerthing && (
                                  <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => handleDeparture(v.id, v.visitNumber)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer transition-colors whitespace-nowrap"
                                  >
                                    4. Catat Berangkat (ATD)
                                  </button>
                                )}

                                {(v.status === "DEPARTED" ||
                                  v.status === "BILLED" ||
                                  v.status === "SETTLED") && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10.5px] font-bold whitespace-nowrap">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Pelayaran Selesai
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <TablePagination
              currentPage={Math.min(visitsPage, totalVisitPages)}
              totalPages={totalVisitPages}
              totalItems={filteredVisits.length}
              itemsPerPage={visitsItemsPerPage}
              onPageChange={setVisitsPage}
              onItemsPerPageChange={(items) => {
                setVisitsItemsPerPage(items);
                setVisitsPage(1);
              }}
              itemsPerPageOptions={[10, 25, 50, 100]}
              className="px-4"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Cargo & Equipment */}
      {activeTab === "cargo" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form
            onSubmit={handleCreateCargo}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-2xs"
          >
            <h3 className="text-sm font-extrabold text-[#0B241E] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#D97706]" />
              Catat Bongkar Muat Barang
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Kategori Muatan
                </label>
                <select
                  value={cargoCategory}
                  onChange={(e) => setCargoCategory(e.target.value as CargoCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                >
                  <option value="ANTARPULAU">Muatan Antarpulau</option>
                  <option value="IMPOR_EKSPOR">Muatan Ekspor / Impor</option>
                  <option value="BULOG_PUPUK">Beras Bulog / Pupuk Subsidi</option>
                  <option value="HEWAN_TERNAK">Hewan Ternak</option>
                  <option value="PETI_KEMAS_20FT">Peti Kemas 20 Feet</option>
                  <option value="PETI_KEMAS_40FT">Peti Kemas 40 Feet</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Kunjungan Kapal (Opsional)
                </label>
                <select
                  value={cargoVisitId}
                  onChange={(e) => setCargoVisitId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                >
                  <option value="">Umum / Tanpa Kunjungan</option>
                  {visits.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.visitNumber} ({v.vessel?.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Deskripsi Muatan
              </label>
              <input
                type="text"
                required
                value={cargoDesc}
                onChange={(e) => setCargoDesc(e.target.value)}
                placeholder="Bongkar muat beras Bulog 100 ton"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Volume / Jumlah
                </label>
                <input
                  type="number"
                  required
                  min={0.01}
                  step="0.01"
                  value={cargoQty}
                  onChange={(e) => setCargoQty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Satuan
                </label>
                <input
                  type="text"
                  required
                  value={cargoUnit}
                  onChange={(e) => setCargoUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#0B241E] text-white text-xs font-bold cursor-pointer"
            >
              Simpan Bongkar Muat
            </button>
          </form>

          <form
            onSubmit={handleCreateEquipment}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-2xs"
          >
            <h3 className="text-sm font-extrabold text-[#0B241E] flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#D97706]" />
              Catat Sewa Alat Pelabuhan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Jenis Alat
                </label>
                <select
                  value={equipType}
                  onChange={(e) => setEquipType(e.target.value as PortEquipmentType)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                >
                  <option value="FORKLIFT">Forklift Pelabuhan</option>
                  <option value="CRANE_LISTRIK_DIESEL">Crane Listrik / Diesel</option>
                  <option value="MOTOR_LONG_BOAT">Motor Long Boat</option>
                  <option value="GEROBAK_DORONG">Gerobak Dorong</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Kunjungan (Opsional)
                </label>
                <select
                  value={equipVisitId}
                  onChange={(e) => setEquipVisitId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                >
                  <option value="">Umum</option>
                  {visits.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.visitNumber} ({v.vessel?.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Label Kapasitas
                </label>
                <input
                  type="text"
                  required
                  value={equipLabel}
                  onChange={(e) => setEquipLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Durasi (Jam)
                </label>
                <input
                  type="number"
                  required
                  min={0.5}
                  step="0.5"
                  value={equipHours}
                  onChange={(e) => setEquipHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#0B241E] text-white text-xs font-bold cursor-pointer"
            >
              Simpan Sewa Alat
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Utilities */}
      {activeTab === "utilities" && (
        <div className="space-y-6">
          <form
            onSubmit={handleCreateUtility}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-2xs"
          >
            <h3 className="text-sm font-extrabold text-[#0B241E]">
              Catat Meteran Air Bersih / Listrik
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <select
                value={utilType}
                onChange={(e) => setUtilType(e.target.value as UtilityType)}
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              >
                <option value="AIR_BERSIH">Air Bersih Kapal / Kios</option>
                <option value="LISTRIK">Aliran Listrik (kWh)</option>
              </select>
              <select
                value={utilVisitId}
                onChange={(e) => setUtilVisitId(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              >
                <option value="">Kunjungan (Opsional)</option>
                {visits.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.visitNumber}
                  </option>
                ))}
              </select>
              <input
                type="number"
                required
                min={0}
                value={meterStart}
                onChange={(e) => setMeterStart(e.target.value)}
                placeholder="Meter Awal"
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
              <input
                type="number"
                required
                min={0}
                value={meterEnd}
                onChange={(e) => setMeterEnd(e.target.value)}
                placeholder="Meter Akhir"
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
              <input
                type="text"
                required
                value={utilUnit}
                onChange={(e) => setUtilUnit(e.target.value)}
                placeholder="Satuan (liter / kWh)"
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#0B241E] text-white text-xs font-bold cursor-pointer"
            >
              Simpan Meteran
            </button>
          </form>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B] bg-[#F8FAFC]">
                  <th className="py-3 px-4">No. Catatan</th>
                  <th className="py-3 px-4">Utilitas</th>
                  <th className="py-3 px-4">Meter Awal → Akhir</th>
                  <th className="py-3 px-4">Volume</th>
                  <th className="py-3 px-4">Tagihan</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {paginatedUtilities.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                      {u.readingNumber}
                    </td>
                    <td className="py-3 px-4">{formatLabel(u.utilityType)}</td>
                    <td className="py-3 px-4 font-mono">
                      {u.meterStart} → {u.meterEnd}
                    </td>
                    <td className="py-3 px-4">
                      {u.volumeConsumed} {u.unitLabel}
                    </td>
                    <td className="py-3 px-4 font-bold">
                      Rp {Number(u.totalAmountIdr).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100">
                        {formatLabel(u.paymentStatus)}
                      </span>
                    </td>
                  </tr>
                ))}
                {utilities.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#94A3B8]">
                      Belum ada catatan meteran utilitas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <TablePagination
              currentPage={Math.min(utilPage, totalUtilPages)}
              totalPages={totalUtilPages}
              totalItems={utilities.length}
              itemsPerPage={utilItemsPerPage}
              onPageChange={setUtilPage}
              onItemsPerPageChange={(items) => {
                setUtilItemsPerPage(items);
                setUtilPage(1);
              }}
              itemsPerPageOptions={[10, 25, 50]}
              className="px-4"
            />
          </div>
        </div>
      )}

      {/* Start Berthing Modal */}
      {berthingVisitId && (() => {
        const activeVisitObj = visits.find((v) => v.id === berthingVisitId);
        const selectedBerthObj = activePortBerths.find(
          (b) => String(b.id) === berthId
        );
        const vesselCat = activeVisitObj?.vessel?.vesselCategory;
        const berthCat = selectedBerthObj?.berthServiceCategory;
        const isCategoryMismatch = Boolean(
          vesselCat &&
            berthCat &&
            berthCat !== "DERMAGA_CAMPURAN" &&
            !(vesselCat === "BARANG" && berthCat === "DERMAGA_BARANG") &&
            !(vesselCat === "PENUMPANG" && berthCat === "DERMAGA_PENUMPANG")
        );

        return (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleStartBerthing}
            className="bg-white rounded-3xl border border-[#E2E8F0] w-full max-w-xl p-6 space-y-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center shrink-0">
                  <Anchor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0B241E]">
                    Mulai Sandar Kapal (ATB)
                  </h3>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    {activeVisitObj?.vessel?.name || `Kapal #${activeVisitObj?.vesselId || ""}`}{" "}
                    <span className="font-mono text-[#94A3B8]">
                      ({activeVisitObj?.visitNumber || ""})
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBerthingVisitId(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
                aria-label="Tutup modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#334155]">
                  Dermaga Sandar
                </label>
                {isBerthLocked && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Sesuai Alokasi UPT
                  </span>
                )}
              </div>
              {isBerthLocked ? (
                <div className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#0B241E]">
                  {(() => {
                    const allocBerth =
                      activeVisitObj?.berthingRecords?.[0]?.berth ||
                      activeVisitObj?.berthings?.[0]?.berth;
                    if (selectedBerthObj) {
                      return `${selectedBerthObj.code} - ${selectedBerthObj.name} (${formatLabel(
                        selectedBerthObj.berthServiceCategory
                      )})`;
                    }
                    if (allocBerth) {
                      return `${allocBerth.code} - ${allocBerth.name}`;
                    }
                    return `Dermaga #${berthId}`;
                  })()}
                </div>
              ) : (
                <select
                  required
                  value={berthId}
                  onChange={(e) => setBerthId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
                >
                  <option value="">-- Pilih Dermaga --</option>
                  {activePortBerths.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} - {b.name} ({formatLabel(b.berthServiceCategory)})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Kategori Tambat
              </label>
              {isBerthLocked ? (
                <div className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#334155]">
                  {berthCategory === "KHUSUS_TUKS"
                    ? "Tambat Khusus / TUKS"
                    : "Tambat Dermaga Umum"}
                </div>
              ) : (
                <select
                  value={berthCategory}
                  onChange={(e) =>
                    setBerthCategory(e.target.value as "UMUM" | "KHUSUS_TUKS")
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
                >
                  <option value="UMUM">Tambat Dermaga Umum</option>
                  <option value="KHUSUS_TUKS">Tambat Khusus / TUKS</option>
                </select>
              )}
            </div>
            {(isCategoryMismatch || !isBerthLocked) && (
              <div className="space-y-1.5">
                {isCategoryMismatch && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold">
                    Kategori kapal ({formatLabel(vesselCat || "")}) tidak sesuai dengan peruntukan dermaga ({formatLabel(berthCat || "")}). Wajib mengisi alasan override untuk pengajuan persetujuan.
                  </div>
                )}
                <label className="block text-xs font-bold text-[#334155]">
                  Alasan Override {isCategoryMismatch ? <span className="text-rose-500">*</span> : "(Opsional)"}
                </label>
                <input
                  type="text"
                  required={isCategoryMismatch}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder={
                    isCategoryMismatch
                      ? "Contoh: Dermaga barang penuh, dialihkan sementara ke dermaga penumpang"
                      : "Opsional"
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Foto Bukti Sandar (Opsional)
              </label>
              {evidenceFile ? (
                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0B241E] truncate">
                        {evidenceFile.name}
                      </p>
                      <p className="text-[10px] text-[#64748B]">
                        {(evidenceFile.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEvidenceFile(null)}
                    className="p-1.5 rounded-lg text-[#64748B] hover:text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0"
                    title="Hapus foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-xs font-semibold text-[#475569] cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-[#64748B]" />
                  <span>Pilih Foto Bukti Sandar (JPG / PNG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setBerthingVisitId(null)}
                className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] hover:bg-[#F8FAFC] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#0B241E] hover:bg-[#13382F] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Simpan Sandar
              </button>
            </div>
          </form>
        </div>
        );
      })()}
    </div>
  );
}
