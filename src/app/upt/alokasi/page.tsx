"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CalendarCheck2,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  Store,
} from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";
import { useAuthStore } from "@/store/auth.store";
import { usePortStore } from "@/store/port.store";
import { useUptStore } from "@/store/upt.store";
import { toast } from "@/store/toast.store";
import { ShipVisitItem } from "@/types/upt.types";
import {
  AlokasiTabType,
  isBerthCategoryCompatible,
  paginateItems,
} from "./alokasi.utils";
import { LeasesCardList, OverridesCardList, VisitsCardList } from "./components/AlokasiCardLists";
import { BerthAllocationModal, RejectLeaseModal } from "./components/AlokasiModals";

export default function AlokasiPage() {
  const { user } = useAuthStore();
  const {
    visits,
    pendingOverrides,
    leases,
    isLoading,
    isSubmitting,
    error,
    fetchAllocationData,
    approveVisit,
    decideOverride,
    approveLease,
    rejectLease,
    clearError,
  } = useUptStore();
  const {
    ports,
    berthsSchedule,
    isScheduleLoading,
    fetchPorts,
    fetchBerthsSchedule,
  } = usePortStore();

  const isMultiPortAdmin = user?.role === "ADMIN_PELABUHAN" && !user?.portId;
  const canApproveAdminActions = user?.role === "ADMIN_PELABUHAN";
  const canAccess =
    user?.role === "ADMIN_PELABUHAN" ||
    user?.role === "PETUGAS_REGISTRASI_KONTRAK";

  const [selectedPortId, setSelectedPortId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<AlokasiTabType>("visits");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [rejectLeaseTarget, setRejectLeaseTarget] = useState<{
    id: number;
    contractNumber: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [allocatingVisit, setAllocatingVisit] = useState<ShipVisitItem | null>(null);
  const [selectedBerthId, setSelectedBerthId] = useState<number>(1);
  const [scheduleDate, setScheduleDate] = useState<string>("");
  const [allocatedBerthsMap, setAllocatedBerthsMap] = useState<Record<number, string>>({});

  const numericPortId = selectedPortId ? Number(selectedPortId) : undefined;

  const availableBerths = useMemo(() => {
    const targetPortId = numericPortId || user?.portId || ports[0]?.id;
    return ports.find((p) => p.id === targetPortId)?.berths ?? [];
  }, [ports, numericPortId, user?.portId]);

  const isBerthOccupied = (berthId: number) =>
    visits.some((v) => v.berthings?.some((b) => b.berthId === berthId && !b.actualEndAt));

  useEffect(() => {
    if (!canAccess) return;
    fetchAllocationData(numericPortId);
    fetchPorts();
  }, [canAccess, numericPortId, fetchAllocationData, fetchPorts]);

  if (!canAccess) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center">
        <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <h2 className="text-base font-bold text-[#0B241E]">Akses Terbatas</h2>
        <p className="text-xs text-[#64748B] mt-1">
          Persetujuan sandar dan sewa aset dikelola oleh Admin Pelabuhan atau Petugas Registrasi &amp; Kontrak.
        </p>
      </div>
    );
  }

  const query = searchQuery.toLowerCase();
  const requestedVisits = visits.filter((v) => v.status === "REQUESTED");
  const requestedLeases = leases.filter((l) => l.status === "REQUESTED");

  const filteredVisits = visits.filter((v) => {
    const matchStatus =
      !statusFilter ||
      (statusFilter === "ASSIGNED" ? v.status !== "REQUESTED" : v.status === statusFilter);
    const matchSearch =
      !query ||
      v.visitNumber.toLowerCase().includes(query) ||
      Boolean(v.vessel?.name?.toLowerCase().includes(query)) ||
      Boolean(v.vessel?.registrationNumber?.toLowerCase().includes(query));
    return matchStatus && matchSearch;
  });

  const filteredOverrides = pendingOverrides.filter((o) => {
    if (!query) return true;
    return (
      Boolean(o.berth?.name?.toLowerCase().includes(query)) ||
      Boolean(o.berth?.code?.toLowerCase().includes(query)) ||
      Boolean(o.overrideReason?.toLowerCase().includes(query))
    );
  });

  const filteredLeases = leases.filter((l) => {
    const matchStatus = !statusFilter || l.status === statusFilter;
    const matchSearch =
      !query ||
      l.contractNumber.toLowerCase().includes(query) ||
      Boolean(l.tenantName?.toLowerCase().includes(query)) ||
      Boolean(l.asset?.name?.toLowerCase().includes(query));
    return matchStatus && matchSearch;
  });

  const currentListLength =
    activeTab === "visits"
      ? filteredVisits.length
      : activeTab === "overrides"
      ? filteredOverrides.length
      : filteredLeases.length;

  const totalPages = Math.ceil(currentListLength / itemsPerPage) || 1;
  const pagedVisits = paginateItems(filteredVisits, currentPage, itemsPerPage);
  const pagedOverrides = paginateItems(filteredOverrides, currentPage, itemsPerPage);
  const pagedLeases = paginateItems(filteredLeases, currentPage, itemsPerPage);

  const handleSelectTab = (tab: AlokasiTabType) => {
    setActiveTab(tab);
    setStatusFilter("");
    setCurrentPage(1);
  };

  const handleOpenAllocationModal = (visit: ShipVisitItem) => {
    const visitDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jayapura",
    }).format(new Date(visit.eta));
    const vesselLoa = visit.vessel?.lengthMeters ? Number(visit.vessel.lengthMeters) : null;
    const firstEligibleBerth = availableBerths.find((b) => {
      const maxLen = b.maxLengthMeters ? Number(b.maxLengthMeters) : null;
      const loaOk = vesselLoa !== null && maxLen !== null ? vesselLoa <= maxLen : true;
      const catOk = isBerthCategoryCompatible(
        visit.vessel?.vesselCategory,
        b.berthServiceCategory
      );
      return loaOk && catOk;
    });
    setAllocatingVisit(visit);
    setSelectedBerthId(firstEligibleBerth?.id || 0);
    setScheduleDate(visitDate);
    fetchBerthsSchedule(visit.portId, visitDate);
  };

  const handleConfirmAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatingVisit) return;
    clearError();

    const chosenBerth = availableBerths.find((b) => b.id === selectedBerthId);
    await approveVisit(allocatingVisit.id, numericPortId, selectedBerthId);

    if (chosenBerth) {
      setAllocatedBerthsMap((prev) => ({
        ...prev,
        [allocatingVisit.id]: chosenBerth.name,
      }));
    }

    toast.success(
      "Alokasi Sandar Disetujui",
      `Permohonan sandar kapal ${allocatingVisit.vessel?.name || allocatingVisit.visitNumber} berhasil disetujui & dialokasikan ke ${
        chosenBerth?.name || "Dermaga Terpilih"
      }.`
    );
    setAllocatingVisit(null);
  };

  const handleDecideOverride = async (
    visitId: number,
    berthingId: number,
    decision: "APPROVED" | "REJECTED"
  ) => {
    clearError();
    await decideOverride(
      visitId,
      berthingId,
      {
        decision,
        approvalNotes:
          decision === "APPROVED"
            ? "Disetujui oleh Admin Pelabuhan"
            : "Ditolak oleh Admin Pelabuhan",
      },
      numericPortId
    );
    toast.success("Override Sandar Diputuskan", `Override sandar #${berthingId} berhasil diputuskan: ${decision}.`);
  };

  const handleApproveLease = async (leaseId: number, contractNumber: string) => {
    clearError();
    await approveLease(leaseId, numericPortId);
    toast.success("Pengajuan Sewa Disetujui", `Pengajuan sewa ${contractNumber} disetujui dan diaktifkan.`);
  };

  const handleConfirmRejectLease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectLeaseTarget) return;
    clearError();
    await rejectLease(rejectLeaseTarget.id, rejectReason.trim(), numericPortId);
    toast.success("Pengajuan Sewa Ditolak", `Pengajuan sewa ${rejectLeaseTarget.contractNumber} telah ditolak.`);
    setRejectLeaseTarget(null);
    setRejectReason("");
  };

  const tabItems = [
    {
      key: "visits" as const,
      label: "Permohonan Kunjungan",
      count: requestedVisits.length,
      icon: CalendarCheck2,
    },
    {
      key: "overrides" as const,
      label: "Override Dermaga",
      count: pendingOverrides.length,
      icon: AlertTriangle,
    },
    {
      key: "leases" as const,
      label: "Pengajuan Sewa Aset",
      count: requestedLeases.length,
      icon: Store,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleSelectTab(tab.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
                  active
                    ? "bg-[#0B241E] text-white"
                    : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
                }`}
              >
                <Icon className="w-4 h-4 text-[#D97706]" />
                {tab.label}
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isMultiPortAdmin && (
            <select
              value={selectedPortId}
              onChange={(e) => {
                setSelectedPortId(e.target.value);
                setCurrentPage(1);
              }}
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

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari kunjungan, kapal, tenant..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs focus:outline-none focus:ring-1 focus:ring-[#133D31]"
            />
          </div>

          <button
            type="button"
            onClick={() => fetchAllocationData(numericPortId)}
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

      {isLoading ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 flex items-center justify-center gap-2 text-xs text-[#64748B]">
          <Loader2 className="w-4 h-4 animate-spin" />
          Memuat antrean persetujuan...
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
          {activeTab === "visits" && (
            <VisitsCardList
              visits={pagedVisits}
              totalVisitsCount={visits.length}
              requestedCount={requestedVisits.length}
              filteredCount={filteredVisits.length}
              statusFilter={statusFilter}
              onStatusFilterChange={(nextStatus) => {
                setStatusFilter(nextStatus);
                setCurrentPage(1);
              }}
              allocatedBerthsMap={allocatedBerthsMap}
              isSubmitting={isSubmitting}
              onOpenAllocationModal={handleOpenAllocationModal}
            />
          )}

          {activeTab === "overrides" && (
            <OverridesCardList
              overrides={pagedOverrides}
              canApproveAdminActions={canApproveAdminActions}
              isSubmitting={isSubmitting}
              onDecideOverride={handleDecideOverride}
            />
          )}

          {activeTab === "leases" && (
            <LeasesCardList
              leases={pagedLeases}
              canApproveAdminActions={canApproveAdminActions}
              isSubmitting={isSubmitting}
              onApproveLease={handleApproveLease}
              onRequestRejectLease={setRejectLeaseTarget}
            />
          )}

          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={currentListLength}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}

      <BerthAllocationModal
        visit={allocatingVisit}
        availableBerths={availableBerths}
        selectedBerthId={selectedBerthId}
        berthsSchedule={berthsSchedule}
        isScheduleLoading={isScheduleLoading}
        scheduleDate={scheduleDate}
        isSubmitting={isSubmitting}
        isBerthOccupied={isBerthOccupied}
        onSelectBerth={setSelectedBerthId}
        onClose={() => setAllocatingVisit(null)}
        onSubmit={handleConfirmAllocation}
      />

      <RejectLeaseModal
        target={rejectLeaseTarget}
        reason={rejectReason}
        isSubmitting={isSubmitting}
        onChangeReason={setRejectReason}
        onClose={() => setRejectLeaseTarget(null)}
        onSubmit={handleConfirmRejectLease}
      />
    </div>
  );
}
