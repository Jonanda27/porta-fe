"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useBillingStore } from "@/store/billing.store";
import { useDinasStore } from "@/store/dinas.store";
import { VesselCategoryItem, computeMonthlyTrendData } from "@/lib/dinas-dashboard";
import { ExecutiveKpiCards } from "@/components/dinas/ExecutiveKpiCards";
import { ExecutiveTrendChart } from "@/components/dinas/ExecutiveTrendChart";
import { ExecutiveAnalyticsGrid } from "@/components/dinas/ExecutiveAnalyticsGrid";
import { DivisionAndPortTables } from "@/components/dinas/DivisionAndPortTables";
import { BerthDrilldownSection } from "@/components/dinas/BerthDrilldownSection";
import { UnbilledVisitsAlertTable } from "@/components/dinas/UnbilledVisitsAlertTable";

function DinasDashboardContent() {
  const searchParams = useSearchParams();
  const portIdParam = searchParams.get("portId");
  const selectedPortFilter =
    portIdParam && portIdParam !== "all" ? Number(portIdParam) : undefined;

  const {
    revenueSummary,
    unbilledVisits,
    invoices,
    fetchRevenueSummary,
    fetchUnbilledVisits,
    fetchInvoices,
  } = useBillingStore();

  const {
    kadisMonitoring,
    drilldownData,
    isLoadingDrilldown,
    fetchKadisMonitoring,
    fetchKabidDrilldown,
  } = useDinasStore();

  const [selectedDrilldownPortId, setSelectedDrilldownPortId] = useState<number | undefined>(undefined);
  const [selectedTerminalId, setSelectedTerminalId] = useState<number | undefined>(undefined);
  const [selectedBerthId, setSelectedBerthId] = useState<number | undefined>(undefined);

  useEffect(() => {
    fetchRevenueSummary(selectedPortFilter);
    fetchUnbilledVisits(selectedPortFilter);
    fetchInvoices();
    fetchKadisMonitoring();
    fetchKabidDrilldown({
      portId: selectedDrilldownPortId || selectedPortFilter,
      terminalId: selectedTerminalId,
      berthId: selectedBerthId,
    });
  }, [
    fetchRevenueSummary,
    fetchUnbilledVisits,
    fetchInvoices,
    fetchKadisMonitoring,
    fetchKabidDrilldown,
    selectedPortFilter,
    selectedDrilldownPortId,
    selectedTerminalId,
    selectedBerthId,
  ]);

  const divisionData = kadisMonitoring?.divisionPerformance || [];
  const portComparisonData = kadisMonitoring?.portPerformance || [];
  const selectedPortStats = selectedPortFilter
    ? portComparisonData.find((p) => p.portId === selectedPortFilter)
    : undefined;

  const apbdTarget2026 =
    kadisMonitoring?.agencyOverview?.revenueTargetAndRealization?.annualTargetIdr ?? 0;

  const totalVerifiedPad = selectedPortFilter
    ? (revenueSummary?.totalVerifiedRevenueIdr ?? selectedPortStats?.revenue?.totalRevenueIdr ?? 0)
    : (kadisMonitoring?.agencyOverview?.revenue?.totalVerifiedRevenueIdr ??
        revenueSummary?.totalVerifiedRevenueIdr ??
        0);

  const padPercentage =
    apbdTarget2026 > 0 ? ((totalVerifiedPad / apbdTarget2026) * 100).toFixed(1) : "0.0";

  const totalReceivables = selectedPortFilter
    ? (revenueSummary?.outstandingReceivablesIdr ?? 0)
    : (kadisMonitoring?.agencyOverview?.revenue?.outstandingReceivablesIdr ??
        revenueSummary?.outstandingReceivablesIdr ??
        0);

  const outstandingCount = revenueSummary?.outstandingInvoiceCount ?? 0;
  const unbilledCount = unbilledVisits.length || revenueSummary?.unbilledDepartedVisitsCount || 0;

  const vesselRev = selectedPortFilter
    ? (revenueSummary?.vesselRevenueIdr ?? 0)
    : (kadisMonitoring?.agencyOverview?.revenue?.vesselRevenueIdr ??
        revenueSummary?.vesselRevenueIdr ??
        0);

  const gateRev = selectedPortFilter
    ? (revenueSummary?.gateTicketingRevenueIdr ?? 0)
    : (kadisMonitoring?.agencyOverview?.revenue?.gateTicketingRevenueIdr ??
        revenueSummary?.gateTicketingRevenueIdr ??
        0);

  const assetRev = selectedPortFilter
    ? (revenueSummary?.assetLeaseRevenueIdr ?? 0)
    : (kadisMonitoring?.agencyOverview?.revenue?.assetLeaseRevenueIdr ??
        revenueSummary?.assetLeaseRevenueIdr ??
        0);

  const cargoUtilityRev = selectedPortFilter
    ? (revenueSummary?.cargoEquipmentRevenueIdr ?? 0) + (revenueSummary?.utilityRevenueIdr ?? 0)
    : (kadisMonitoring?.agencyOverview?.revenue?.cargoEquipmentRevenueIdr ??
        revenueSummary?.cargoEquipmentRevenueIdr ??
        0) +
      (kadisMonitoring?.agencyOverview?.revenue?.utilityRevenueIdr ??
        revenueSummary?.utilityRevenueIdr ??
        0);

  const taskCompletionRate = selectedPortFilter
    ? (selectedPortStats?.taskPerformance?.completionRatePercent ?? 0)
    : (kadisMonitoring?.agencyOverview?.taskPerformance?.completionRatePercent ?? 0);

  const activeBerthingsCount = selectedPortFilter
    ? (selectedPortStats?.vesselActivity?.activeBerthings ?? 0)
    : (kadisMonitoring?.agencyOverview?.vesselActivity?.activeBerthings ?? 0);

  const vesselCategories: VesselCategoryItem[] = [
    {
      key: "BARANG",
      label: "Kapal Niaga / Barang",
      colorBg: "bg-blue-600",
      textColor: "text-blue-700",
      borderCls: "border-blue-200",
      bgLight: "bg-blue-50/60",
      visitCount: revenueSummary?.vesselCategoryBreakdown?.["BARANG"]?.visitCount ?? 0,
      revenueIdr: revenueSummary?.vesselCategoryBreakdown?.["BARANG"]?.verifiedRevenueIdr ?? 0,
    },
    {
      key: "PENUMPANG",
      label: "Kapal Penumpang & Ferry",
      colorBg: "bg-emerald-600",
      textColor: "text-emerald-700",
      borderCls: "border-emerald-200",
      bgLight: "bg-emerald-50/60",
      visitCount: revenueSummary?.vesselCategoryBreakdown?.["PENUMPANG"]?.visitCount ?? 0,
      revenueIdr: revenueSummary?.vesselCategoryBreakdown?.["PENUMPANG"]?.verifiedRevenueIdr ?? 0,
    },
    {
      key: "CAMPURAN",
      label: "Kapal Pelra / Campuran",
      colorBg: "bg-amber-600",
      textColor: "text-amber-700",
      borderCls: "border-amber-200",
      bgLight: "bg-amber-50/60",
      visitCount: revenueSummary?.vesselCategoryBreakdown?.["CAMPURAN"]?.visitCount ?? 0,
      revenueIdr: revenueSummary?.vesselCategoryBreakdown?.["CAMPURAN"]?.verifiedRevenueIdr ?? 0,
    },
  ];

  const trendData = useMemo(
    () => computeMonthlyTrendData(invoices, selectedPortFilter),
    [invoices, selectedPortFilter]
  );

  return (
    <div className="space-y-6">
      <ExecutiveKpiCards
        totalVerifiedPad={totalVerifiedPad}
        apbdTarget2026={apbdTarget2026}
        padPercentage={padPercentage}
        taskCompletionRate={taskCompletionRate}
        activeBerthingsCount={activeBerthingsCount}
        totalReceivables={totalReceivables}
        outstandingCount={outstandingCount}
        unbilledCount={unbilledCount}
      />

      <div className="space-y-6">
        <ExecutiveTrendChart trendData={trendData} />

        <ExecutiveAnalyticsGrid
          totalVerifiedPad={totalVerifiedPad}
          apbdTarget2026={apbdTarget2026}
          padPercentage={padPercentage}
          taskCompletionRate={taskCompletionRate}
          vesselRev={vesselRev}
          gateRev={gateRev}
          assetRev={assetRev}
          cargoUtilityRev={cargoUtilityRev}
          portComparisonData={portComparisonData}
          vesselCategories={vesselCategories}
        />
      </div>

      <DivisionAndPortTables
        divisionData={divisionData}
        portComparisonData={portComparisonData}
      />

      <BerthDrilldownSection
        drilldownData={drilldownData}
        isLoadingDrilldown={isLoadingDrilldown}
        selectedDrilldownPortId={selectedDrilldownPortId}
        selectedTerminalId={selectedTerminalId}
        selectedBerthId={selectedBerthId}
        onSelectPort={setSelectedDrilldownPortId}
        onSelectTerminal={setSelectedTerminalId}
        onSelectBerth={setSelectedBerthId}
      />

      <UnbilledVisitsAlertTable unbilledVisits={unbilledVisits} />
    </div>
  );
}

/**
 * Halaman Dashboard Eksekutif Dinas Perhubungan Kab. Mimika.
 */
export default function DinasDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs font-mono text-gray-400">
          Memuat Dashboard Eksekutif Dinas...
        </div>
      }
    >
      <DinasDashboardContent />
    </Suspense>
  );
}
