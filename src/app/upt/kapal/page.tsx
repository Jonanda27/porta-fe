"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useFieldOpsStore } from "@/store/field-ops.store";
import { usePortStore } from "@/store/port.store";
import { toast } from "@/store/toast.store";
import {
  CreateCargoRecordPayload,
  CreateEquipmentRentalPayload,
  CreateUtilityReadingPayload,
} from "@/types/field-ops.types";
import { ShipVisitItem, UptKapalTabType } from "@/types/upt.types";
import { UptKapalToolbar } from "@/components/upt/kapal/UptKapalToolbar";
import { UptVisitsSection } from "@/components/upt/kapal/UptVisitsSection";
import { UptCargoEquipmentSection } from "@/components/upt/kapal/UptCargoEquipmentSection";
import { UptUtilitiesSection } from "@/components/upt/kapal/UptUtilitiesSection";
import { UptStartBerthingModal } from "@/components/upt/kapal/UptStartBerthingModal";

export default function UptKapalPage() {
  const { user } = useAuthStore();
  const isReadOnlyMonitoring = user?.role === "KEPALA_PELABUHAN";
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

  // Start berthing modal state
  const [berthingVisitId, setBerthingVisitId] = useState<number | null>(null);
  const [berthId, setBerthId] = useState<string>("");
  const [isBerthLocked, setIsBerthLocked] = useState<boolean>(false);
  const [berthCategory, setBerthCategory] = useState<"UMUM" | "KHUSUS_TUKS">(
    "UMUM"
  );
  const [overrideReason, setOverrideReason] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  useEffect(() => {
    fetchVesselOpsData(numericPortId);
    fetchPorts();
  }, [numericPortId, fetchVesselOpsData, fetchPorts]);

  const activePortBerths = useMemo(
    () =>
      ports.find((p) => p.id === activePortId)?.berths ||
      ports.flatMap((p) => p.berths || []),
    [ports, activePortId]
  );

  const berthOccupationMap = useMemo(() => {
    const map = new Map<number, ShipVisitItem>();
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

  const activeBerthingVisit = useMemo(
    () => visits.find((v) => v.id === berthingVisitId) || null,
    [visits, berthingVisitId]
  );

  const handleOpenBerthingModal = (v: ShipVisitItem) => {
    const allocatedBerthing = v.berthingRecords?.[0] || v.berthings?.[0];
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
  };

  const handleArrival = async (visitId: number, visitNumber: string) => {
    clearError();
    try {
      await recordArrival(visitId, new Date().toISOString(), numericPortId);
      toast.success(
        "Kedatangan Dicatat",
        `Kedatangan (ATA) untuk ${visitNumber} berhasil dicatat.`
      );
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
      await endBerthing(
        visitId,
        berthingId,
        new Date().toISOString(),
        numericPortId
      );
      toast.success(
        "Selesai Sandar Dicatat",
        "Selesai sandar berhasil dicatat."
      );
    } catch {
      // Error sudah ditangani di store
    }
  };

  const handleDeparture = async (visitId: number, visitNumber: string) => {
    clearError();
    try {
      await recordDeparture(visitId, new Date().toISOString(), numericPortId);
      toast.success(
        "Keberangkatan Dicatat",
        `Keberangkatan (ATD) untuk ${visitNumber} berhasil dicatat.`
      );
    } catch {
      // Error sudah ditangani di store
    }
  };

  const handleCreateCargo = async (payload: CreateCargoRecordPayload) => {
    clearError();
    await createCargo(payload, numericPortId);
    toast.success(
      "Bongkar Muat Disimpan",
      "Catatan bongkar muat berhasil disimpan."
    );
  };

  const handleCreateEquipment = async (
    payload: CreateEquipmentRentalPayload
  ) => {
    clearError();
    await createEquipment(payload, numericPortId);
    toast.success("Sewa Alat Dicatat", "Sewa alat pelabuhan berhasil dicatat.");
  };

  const handleCreateUtility = async (payload: CreateUtilityReadingPayload) => {
    clearError();
    await createUtility(payload, numericPortId);
    toast.success(
      "Meter Utilitas Disimpan",
      "Pembacaan meter utilitas berhasil disimpan."
    );
  };

  return (
    <div className="space-y-6">
      <UptKapalToolbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        visitsCount={visits.length}
        utilitiesCount={utilities.length}
        isSuperadmin={isSuperadmin}
        selectedPortId={selectedPortId}
        onPortChange={setSelectedPortId}
        ports={ports}
        isLoading={isLoading}
        onRefresh={() => fetchVesselOpsData(numericPortId)}
      />

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {activeTab === "visits" && (
        <UptVisitsSection
          visits={visits}
          activePortBerths={activePortBerths}
          berthOccupationMap={berthOccupationMap}
          occupiedBerthCount={occupiedBerthCount}
          availableBerthCount={availableBerthCount}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          numericPortId={numericPortId}
          onRecordArrival={handleArrival}
          onOpenBerthingModal={handleOpenBerthingModal}
          onEndBerthing={handleEndBerthing}
          onRecordDeparture={handleDeparture}
        />
      )}

      {activeTab === "cargo" && (
        <UptCargoEquipmentSection
          visits={visits}
          activePortId={activePortId}
          isSubmitting={isSubmitting}
          onCreateCargo={handleCreateCargo}
          onCreateEquipment={handleCreateEquipment}
        />
      )}

      {activeTab === "utilities" && (
        <UptUtilitiesSection
          visits={visits}
          utilities={utilities}
          activePortId={activePortId}
          numericPortId={numericPortId}
          isSubmitting={isSubmitting}
          onCreateUtility={handleCreateUtility}
        />
      )}

      <UptStartBerthingModal
        berthingVisit={activeBerthingVisit}
        activePortBerths={activePortBerths}
        berthId={berthId}
        onBerthIdChange={setBerthId}
        isBerthLocked={isBerthLocked}
        berthCategory={berthCategory}
        onBerthCategoryChange={setBerthCategory}
        overrideReason={overrideReason}
        onOverrideReasonChange={setOverrideReason}
        evidenceFile={evidenceFile}
        onEvidenceFileChange={setEvidenceFile}
        error={error}
        isSubmitting={isSubmitting}
        onClose={() => setBerthingVisitId(null)}
        onSubmit={handleStartBerthing}
      />
    </div>
  );
}
