"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Calendar, Clock, AlertTriangle, X, Anchor } from "lucide-react";
import { formatRupiah } from "@/lib/kapal-billing";
import {
  buildCreatedDockRequest,
  buildVerifiedFleetOptions,
  EMPTY_FLEET_OPTION,
  FALLBACK_BERTHS,
  FALLBACK_DESTINATION_PORTS,
  formatLocalDate,
  formatLocalTime,
  getPortShortName,
  mapVisitsToDockRequests,
} from "@/lib/kapal-permohonan";
import { estimateVisitCosts } from "@/lib/tariff-estimator";
import { useKapalStore } from "@/store/kapal.store";
import { useAuthStore } from "@/store/auth.store";
import { usePortStore } from "@/store/port.store";
import { useTariffStore } from "@/store/tariff.store";
import { useBillingStore } from "@/store/billing.store";
import { toast } from "@/store/toast.store";
import { DockRequest } from "@/types/kapal.types";
import { DockRequestDetailModal } from "@/components/kapal/permohonan/DockRequestDetailModal";
import { VisitRequestFormModal } from "@/components/kapal/permohonan/VisitRequestFormModal";
import { VisitRequestsSection } from "@/components/kapal/permohonan/VisitRequestsSection";

export default function KapalPermohonanPage() {
  const { initialize: initAuth } = useAuthStore();
  const { vessels, visits, contracts, fetchDashboardData, createVisitRequest } = useKapalStore();
  const { ports, fetchPorts, berths, fetchBerths } = usePortStore();
  const { tariffs, usdRate, fetchTariffs, fetchUsdRate } = useTariffStore();
  const { invoices, fetchInvoices, generateVisitEstimate } = useBillingStore();

  const [selectedBerthId, setSelectedBerthId] = useState<number>(1);
  const [estimatingVisitId, setEstimatingVisitId] = useState<number | null>(null);
  const [estimateErrorToast, setEstimateErrorToast] = useState<string | null>(null);

  const displayBerths = useMemo(() => {
    if (berths && berths.length > 0) return berths;
    return FALLBACK_BERTHS;
  }, [berths]);

  const activeBerth =
    displayBerths.find((b) => b.id === selectedBerthId) || displayBerths[0];

  const [activeTab, setActiveTab] = useState<"tracking" | "wizard">("tracking");
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [selectedDetailReq, setSelectedDetailReq] = useState<DockRequest | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    initAuth();
    fetchDashboardData();
    fetchBerths(1);
    fetchPorts();
    fetchTariffs();
    fetchUsdRate();
    fetchInvoices();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const prefId = params.get("preferredBerthId");
      if (prefId) {
        setSelectedBerthId(Number(prefId));
        setActiveTab("wizard");
        setWizardStep(1);
      }
    }
  }, [initAuth, fetchDashboardData, fetchBerths, fetchPorts, fetchTariffs, fetchUsdRate, fetchInvoices]);

  const fleetOptions = useMemo(() => buildVerifiedFleetOptions(vessels), [vessels]);

  // Langkah 1: Pilih Layanan & Fasilitas
  const [selectedVesselId, setSelectedVesselId] = useState<string>("");
  const [originPort, setOriginPort] = useState<string>("Pelabuhan Dobo");
  const [destinationPort, setDestinationPort] = useState<string>("Pelabuhan Umum Poumako");
  const [activityType, setActivityType] = useState<string>(
    "Bongkar & Muat Penumpang / Kendaraan (Ferry Ro-Ro)"
  );

  // Kebutuhan Fasilitas & Utilitas
  const [needFreshWater, setNeedFreshWater] = useState<boolean>(true);
  const [waterVolume, setWaterVolume] = useState<number>(35);
  const [needShorePower, setNeedShorePower] = useState<boolean>(false);
  const [powerKwh, setPowerKwh] = useState<number>(120);
  const [needWasteDisposal, setNeedWasteDisposal] = useState<boolean>(true);

  const destinationPortOptions = useMemo(() => {
    if (ports && ports.length > 0) {
      return ports.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        label: `${p.name} (${p.code})`,
      }));
    }
    return FALLBACK_DESTINATION_PORTS;
  }, [ports]);

  useEffect(() => {
    if (
      destinationPortOptions.length > 0 &&
      !destinationPortOptions.some((p) => p.name === destinationPort)
    ) {
      setDestinationPort(destinationPortOptions[0].name);
    }
  }, [destinationPortOptions, destinationPort]);

  const targetPortId = useMemo(() => {
    const p = destinationPortOptions.find((opt) => opt.name === destinationPort);
    return p?.id || 1;
  }, [destinationPortOptions, destinationPort]);

  const activeContracts = useMemo(() => {
    if (!contracts || contracts.length === 0) return [];
    const now = new Date();
    return contracts.filter(
      (c) =>
        c.status === "ACTIVE" &&
        new Date(c.startDate) <= now &&
        new Date(c.endDate) >= now
    );
  }, [contracts]);

  const activeBerthingContract = useMemo(
    () => activeContracts.find((c) => c.portId === targetPortId) || null,
    [activeContracts, targetPortId]
  );

  const hasActiveBerthingContract = Boolean(activeBerthingContract);
  const hasAnyActiveContract = activeContracts.length > 0;

  // Otomatis arahkan pelabuhan tujuan ke pelabuhan pertama yang memiliki PKS aktif
  useEffect(() => {
    if (activeContracts.length === 0 || destinationPortOptions.length === 0) return;
    const currentHasActive = activeContracts.some((c) => c.portId === targetPortId);
    if (!currentHasActive) {
      const firstActivePort = destinationPortOptions.find((opt) =>
        activeContracts.some((c) => c.portId === opt.id)
      );
      if (firstActivePort) {
        setDestinationPort(firstActivePort.name);
      }
    }
  }, [activeContracts, destinationPortOptions, targetPortId]);

  useEffect(() => {
    if (
      fleetOptions.length > 0 &&
      (!selectedVesselId || !fleetOptions.some((f) => f.id === selectedVesselId))
    ) {
      setSelectedVesselId(fleetOptions[0].id);
    }
  }, [fleetOptions, selectedVesselId]);

  const derivedRoute = `${getPortShortName(originPort)} ➔ ${getPortShortName(destinationPort)}`;

  // Waktu real-time saat ini (diperbarui tiap 30 detik agar batas min tetap akurat)
  const [currentNow, setCurrentNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const todayDateStr = formatLocalDate(currentNow);
  const currentTimeStr = formatLocalTime(currentNow);

  // Langkah 2: Tentukan Waktu
  const [etaDate, setEtaDate] = useState<string>(() => formatLocalDate(new Date()));
  const [etaTime, setEtaTime] = useState<string>(() => formatLocalTime(new Date()));
  const [etdDate, setEtdDate] = useState<string>(() =>
    formatLocalDate(new Date(Date.now() + 2 * 60 * 60 * 1000))
  );
  const [etdTime, setEtdTime] = useState<string>(() =>
    formatLocalTime(new Date(Date.now() + 2 * 60 * 60 * 1000))
  );
  const [serviceDurationHours, setServiceDurationHours] = useState<number>(2);

  const handleEtaDateChange = (val: string) => {
    const safeDate = val && val < todayDateStr ? todayDateStr : val;
    const nextEtaTime =
      safeDate === todayDateStr && etaTime < currentTimeStr ? currentTimeStr : etaTime;
    setEtaDate(safeDate);
    if (nextEtaTime !== etaTime) {
      setEtaTime(nextEtaTime);
    }

    const etaDt = new Date(`${safeDate}T${nextEtaTime}:00`);
    const etdDt = new Date(`${etdDate}T${etdTime}:00`);
    if (etdDate < safeDate || etdDt <= etaDt) {
      const shiftedEtd = new Date(
        etaDt.getTime() + Math.round(serviceDurationHours * 60) * 60_000
      );
      setEtdDate(formatLocalDate(shiftedEtd));
      setEtdTime(formatLocalTime(shiftedEtd));
    }
  };

  const handleEtaTimeChange = (val: string) => {
    const safeTime = etaDate === todayDateStr && val < currentTimeStr ? currentTimeStr : val;
    setEtaTime(safeTime);
    const etaDt = new Date(`${etaDate}T${safeTime}:00`);
    const etdDt = new Date(`${etdDate}T${etdTime}:00`);
    if (etdDt <= etaDt) {
      const shiftedEtd = new Date(
        etaDt.getTime() + Math.round(serviceDurationHours * 60) * 60_000
      );
      setEtdDate(formatLocalDate(shiftedEtd));
      setEtdTime(formatLocalTime(shiftedEtd));
    }
  };

  const handleEtdDateChange = (val: string) => {
    const minDate = etaDate > todayDateStr ? etaDate : todayDateStr;
    const safeDate = val && val < minDate ? minDate : val;
    setEtdDate(safeDate);
    const minTimeForEtd =
      safeDate === etaDate ? etaTime : safeDate === todayDateStr ? currentTimeStr : "";
    if (minTimeForEtd && etdTime < minTimeForEtd) {
      setEtdTime(minTimeForEtd);
    }
  };

  const handleEtdTimeChange = (val: string) => {
    const minTimeForEtd =
      etdDate === etaDate ? etaTime : etdDate === todayDateStr ? currentTimeStr : "";
    const safeTime = minTimeForEtd && val < minTimeForEtd ? minTimeForEtd : val;
    setEtdTime(safeTime);
  };

  const scheduleError = useMemo(() => {
    if (!etaDate || !etaTime || !etdDate || !etdTime) {
      return "Harap lengkapi tanggal dan jam kedatangan serta keberangkatan.";
    }
    const etaDt = new Date(`${etaDate}T${etaTime}:00`);
    const etdDt = new Date(`${etdDate}T${etdTime}:00`);
    const minNow = new Date(`${todayDateStr}T${currentTimeStr}:00`);
    if (etaDt < minNow) {
      return "Waktu kedatangan tidak boleh berada di masa lalu.";
    }
    if (etdDt <= etaDt) {
      return "Waktu keberangkatan harus lebih akhir dari waktu kedatangan.";
    }
    return null;
  }, [etaDate, etaTime, etdDate, etdTime, todayDateStr, currentTimeStr]);

  const isScheduleValid = scheduleError === null;

  // Langkah 3: Dokumen & Kelaiklautan
  const [docManifestDraft, setDocManifestDraft] = useState<boolean>(true);
  const [tripDocumentFile, setTripDocumentFile] = useState<File | null>(null);
  const [additionalNote, setAdditionalNote] = useState<string>("");

  // Langkah 4: Tinjau & Pakta Integritas
  const [agreementChecked, setAgreementChecked] = useState<boolean>(true);

  // Langkah 5: Tiket Sukses
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  const backendRequests = useMemo(
    () =>
      mapVisitsToDockRequests({
        visits,
        invoices,
        tariffs,
        exchangeRateUsd: usdRate?.rate || 16000,
      }),
    [visits, invoices, tariffs, usdRate]
  );

  const [localRequests, setLocalRequests] = useState<DockRequest[]>([]);

  const requests = useMemo<DockRequest[]>(() => {
    const map = new Map<string, DockRequest>();
    backendRequests.forEach((req) => {
      if (req.id) map.set(req.id, req);
    });
    localRequests.forEach((req) => {
      if (req.id && !map.has(req.id)) {
        map.set(req.id, req);
      }
    });
    return Array.from(map.values());
  }, [localRequests, backendRequests]);

  const statusCounts = useMemo(() => {
    const submitted = requests.filter((r) => r.status === "submitted").length;
    const verified = requests.filter((r) => r.status === "verified").length;
    const approved = requests.filter((r) => r.status === "approved").length;
    return { submitted, verified, approved };
  }, [requests]);

  const activeVessel =
    fleetOptions.find((v) => v.id === selectedVesselId) ||
    fleetOptions[0] ||
    EMPTY_FLEET_OPTION;

  const costs = useMemo(
    () =>
      estimateVisitCosts({
        tariffs,
        exchangeRateUsd: usdRate?.rate || 16000,
        grossTonnage: activeVessel.gt,
        durationHours: serviceDurationHours,
        shippingCategory: activeVessel.shippingCategory,
        shipType: activeVessel.shipType,
        berthType: activeBerth?.berthType,
        needFreshWater,
        waterVolume,
        needShorePower,
        powerKwh,
        needWasteDisposal,
      }),
    [
      tariffs,
      usdRate,
      activeVessel.gt,
      activeVessel.shippingCategory,
      activeVessel.shipType,
      serviceDurationHours,
      activeBerth?.berthType,
      needFreshWater,
      waterVolume,
      needShorePower,
      powerKwh,
      needWasteDisposal,
    ]
  );

  const handleGenerateOfficialEstimate = async (visitId: number) => {
    setEstimatingVisitId(visitId);
    setEstimateErrorToast(null);
    try {
      const estimate = await generateVisitEstimate(visitId, {});
      toast.success(
        "Estimasi Tarif Dihitung",
        `Estimasi resmi ${estimate.invoiceNumber} berhasil dihitung server (${formatRupiah(
          Number(estimate.totalAmountIdr)
        )}).`
      );
      if (selectedDetailReq?.visitId === visitId) {
        setSelectedDetailReq((prev) =>
          prev
            ? {
                ...prev,
                officialInvoice: estimate,
                costBreakdown: {
                  ...prev.costBreakdown,
                  total: Number(estimate.totalAmountIdr),
                },
              }
            : null
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal menghitung estimasi resmi dari backend.";
      setEstimateErrorToast(msg);
      setTimeout(() => setEstimateErrorToast(null), 6000);
    } finally {
      setEstimatingVisitId(null);
    }
  };

  const handleFinalSubmit = async () => {
    if (!agreementChecked) {
      setEstimateErrorToast(
        "Harap setujui pakta integritas dan ketentuan estimasi retribusi sebelum mengirim."
      );
      setTimeout(() => setEstimateErrorToast(null), 5000);
      return;
    }

    setIsSubmitting(true);

    try {
      const etaIso = new Date(`${etaDate}T${etaTime}:00`).toISOString();
      const etdIso = new Date(`${etdDate}T${etdTime}:00`).toISOString();

      const targetPort = destinationPortOptions.find((p) => p.name === destinationPort);
      const resolvedPortId = targetPort?.id || 1;

      const newVisit = await createVisitRequest({
        portId: resolvedPortId,
        vesselId: activeVessel.numericId,
        visitOrigin: "OPERATOR_REQUEST",
        activityMode: "NORMAL",
        isTransitOnly: false,
        originPort,
        destinationPort,
        eta: etaIso,
        etd: etdIso,
        notes:
          additionalNote ||
          `Permohonan sandar kapal ${activeVessel.name} (${activeVessel.gt} GT) di ${destinationPort}. Kebutuhan: ${activityType}. Menunggu verifikasi & alokasi dermaga oleh Petugas UPT.`,
      });

      const newReq = buildCreatedDockRequest({
        newVisit,
        activeVessel,
        destinationPort,
        derivedRoute,
        activityType,
        etaDate,
        etaTime,
        etdDate,
        etdTime,
        serviceDurationHours,
        needFreshWater,
        waterVolume,
        needShorePower,
        powerKwh,
        needWasteDisposal,
        costs,
      });

      setLocalRequests((prev) => [newReq, ...prev]);
      setCreatedTicketId(newVisit.visitNumber);
      setWizardStep(5);
      toast.success(
        "Permohonan Jadwal Diajukan",
        `Permohonan ${newVisit.visitNumber} berhasil diajukan ke server backend.`
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal mengirim permohonan ke server backend.";
      setEstimateErrorToast(msg);
      setTimeout(() => setEstimateErrorToast(null), 6000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setWizardStep(1);
    setCreatedTicketId(null);
    setActiveTab("tracking");
  };

  const filteredRequests = requests.filter((r) => {
    const matchSearch =
      r.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.vesselName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.port.toLowerCase().includes(searchFilter.toLowerCase());

    if (statusFilter === "all") return matchSearch;
    return matchSearch && r.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {estimateErrorToast && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{estimateErrorToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setEstimateErrorToast(null)}
            className="p-1 text-rose-600 hover:text-rose-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Mode Switcher Deck */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("tracking")}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
              activeTab === "tracking"
                ? "bg-[#0B241E] text-white shadow-sm font-extrabold"
                : "bg-[#F8FAFC] text-[#64748B] hover:text-[#0B241E] hover:bg-[#F1F5F9] border border-[#E2E8F0]"
            }`}
          >
            <Clock
              className={`w-4 h-4 ${
                activeTab === "tracking" ? "text-[#D97706]" : "text-[#64748B]"
              }`}
            />
            <span>Pelacakan Permohonan</span>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                activeTab === "tracking"
                  ? "bg-white/20 text-white font-bold"
                  : "bg-slate-200/80 text-slate-700 font-bold"
              }`}
            >
              {requests.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("wizard");
              if (wizardStep === 5) setWizardStep(1);
            }}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
              activeTab === "wizard"
                ? "bg-[#0B241E] text-white shadow-sm font-extrabold"
                : "bg-[#F8FAFC] text-[#64748B] hover:text-[#0B241E] hover:bg-[#F1F5F9] border border-[#E2E8F0]"
            }`}
          >
            <Calendar
              className={`w-4 h-4 ${
                activeTab === "wizard" ? "text-[#D97706]" : "text-[#D97706]"
              }`}
            />
            <span>+ Ajukan Permohonan Sandar</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-[#64748B] font-medium pr-2">
          <Anchor className="w-4 h-4 text-[#85A69B]" />
          <span>Fasilitas Sandar Pelabuhan Poumako</span>
        </div>
      </div>

      {/* VIEW A: WIZARD 5 LANGKAH "AJUKAN PENGGUNAAN DERMAGA" */}
      {activeTab === "wizard" && (
        <VisitRequestFormModal
          wizardStep={wizardStep}
          onWizardStepChange={setWizardStep}
          hasAnyActiveContract={hasAnyActiveContract}
          hasActiveBerthingContract={hasActiveBerthingContract}
          contracts={contracts}
          activeContracts={activeContracts}
          activeBerthingContract={activeBerthingContract}
          onSwitchToTracking={() => setActiveTab("tracking")}
          vessels={vessels}
          fleetOptions={fleetOptions}
          selectedVesselId={selectedVesselId}
          onSelectVesselId={setSelectedVesselId}
          activeVessel={activeVessel}
          activityType={activityType}
          onActivityTypeChange={setActivityType}
          originPort={originPort}
          onOriginPortChange={setOriginPort}
          destinationPort={destinationPort}
          onDestinationPortChange={setDestinationPort}
          destinationPortOptions={destinationPortOptions}
          derivedRoute={derivedRoute}
          needFreshWater={needFreshWater}
          onNeedFreshWaterChange={setNeedFreshWater}
          waterVolume={waterVolume}
          onWaterVolumeChange={setWaterVolume}
          needShorePower={needShorePower}
          onNeedShorePowerChange={setNeedShorePower}
          powerKwh={powerKwh}
          onPowerKwhChange={setPowerKwh}
          needWasteDisposal={needWasteDisposal}
          onNeedWasteDisposalChange={setNeedWasteDisposal}
          todayDateStr={todayDateStr}
          currentTimeStr={currentTimeStr}
          etaDate={etaDate}
          etaTime={etaTime}
          etdDate={etdDate}
          etdTime={etdTime}
          onEtaDateChange={handleEtaDateChange}
          onEtaTimeChange={handleEtaTimeChange}
          onEtdDateChange={handleEtdDateChange}
          onEtdTimeChange={handleEtdTimeChange}
          serviceDurationHours={serviceDurationHours}
          onServiceDurationHoursChange={setServiceDurationHours}
          scheduleError={scheduleError}
          isScheduleValid={isScheduleValid}
          docManifestDraft={docManifestDraft}
          onDocManifestDraftChange={setDocManifestDraft}
          tripDocumentFile={tripDocumentFile}
          onTripDocumentFileChange={setTripDocumentFile}
          additionalNote={additionalNote}
          onAdditionalNoteChange={setAdditionalNote}
          costs={costs}
          agreementChecked={agreementChecked}
          onAgreementCheckedChange={setAgreementChecked}
          isSubmitting={isSubmitting}
          onFinalSubmit={handleFinalSubmit}
          createdTicketId={createdTicketId}
          activeBerth={activeBerth}
          onResetForm={handleResetForm}
        />
      )}

      {/* VIEW B: PELACAKAN STATUS PERMOHONAN & RIWAYAT SIKLUS */}
      {activeTab === "tracking" && (
        <VisitRequestsSection
          requests={requests}
          filteredRequests={filteredRequests}
          statusCounts={statusCounts}
          searchFilter={searchFilter}
          onSearchFilterChange={setSearchFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          estimatingVisitId={estimatingVisitId}
          onGenerateOfficialEstimate={handleGenerateOfficialEstimate}
          onSelectDetailRequest={setSelectedDetailReq}
        />
      )}

      {/* MODAL DETAIL PERMOHONAN */}
      <DockRequestDetailModal
        request={selectedDetailReq}
        estimatingVisitId={estimatingVisitId}
        onGenerateOfficialEstimate={handleGenerateOfficialEstimate}
        onClose={() => setSelectedDetailReq(null)}
      />
    </div>
  );
}
