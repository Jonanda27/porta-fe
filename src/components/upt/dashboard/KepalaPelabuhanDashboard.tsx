"use client";

import React, { useMemo } from "react";
import { OperatorBerthingContract } from "@/types/kapal.types";
import { PortItem } from "@/types/port.types";
import {
  AssetLeaseItem,
  RevenueSummaryResponse,
  ShipVisitItem,
  UptInvoiceItem,
  WarningItem,
} from "@/types/upt.types";
import { ExecutiveKpiGrid } from "./kepala/ExecutiveKpiGrid";
import {
  ExecutiveApprovalItem,
  ExecutiveQueueSection,
} from "./kepala/ExecutiveQueueSection";
import { RevenueColumnChart } from "./kepala/RevenueColumnChart";
import { VisitAndBerthChart } from "./kepala/VisitAndBerthChart";

interface KepalaPelabuhanDashboardProps {
  revenueSummary: RevenueSummaryResponse | null;
  visits: ShipVisitItem[];
  unbilledVisits: ShipVisitItem[];
  leases: AssetLeaseItem[];
  pendingBerthingContracts: OperatorBerthingContract[];
  invoices: UptInvoiceItem[];
  warnings: WarningItem[];
  ports: PortItem[];
  error: string | null;
}

export function KepalaPelabuhanDashboard({
  revenueSummary,
  visits,
  unbilledVisits,
  leases,
  pendingBerthingContracts,
  invoices,
  warnings,
  ports,
  error,
}: KepalaPelabuhanDashboardProps) {
  const visitStats = useMemo(() => {
    const requested = visits.filter((v) => v.status === "REQUESTED").length;
    const active = visits.filter((v) =>
      ["APPROVED", "ANCHORED", "BERTHED"].includes(v.status)
    ).length;
    const completed = visits.filter((v) =>
      ["DEPARTED", "BILLED", "SETTLED"].includes(v.status)
    ).length;
    return { requested, active, completed };
  }, [visits]);

  const berthStats = useMemo(() => {
    const allBerths = ports.flatMap((p) => p.berths || []);
    return {
      total: allBerths.length,
      open: allBerths.filter((b) => (b.operationalStatus || "OPEN") === "OPEN").length,
      maintenance: allBerths.filter((b) => b.operationalStatus === "MAINTENANCE").length,
      closed: allBerths.filter((b) => b.operationalStatus === "CLOSED").length,
    };
  }, [ports]);

  const pendingApprovals = useMemo<ExecutiveApprovalItem[]>(() => {
    const headLeases = leases
      .filter((l) => l.status === "PENDING_HEAD_OF_PORT")
      .map((l) => ({
        id: `lease-${l.id}`,
        badge: "PKS Ruangan",
        title: l.contractNumber,
        subtitle: `${l.tenantName} — ${l.asset?.name || "Aset Pelabuhan"}`,
        href: "/upt/verifikasi/pks-ruangan",
      }));

    const headSandar = pendingBerthingContracts.map((c) => ({
      id: `sandar-${c.id}`,
      badge: "PKS Sandar",
      title: c.contractNumber,
      subtitle: `${c.operator?.name || "Operator Kapal"} — ${c.title || "Kontrak Sandar"}`,
      href: "/upt/verifikasi/pks-sandar",
    }));

    const requestedVisits = visits
      .filter((v) => v.status === "REQUESTED")
      .map((v) => ({
        id: `visit-${v.id}`,
        badge: "Izin Sandar",
        title: v.visitNumber,
        subtitle: `${v.vessel?.name || "Kapal"} — ${v.operator?.name || "-"}`,
        href: "/upt/alokasi",
      }));

    return [...headLeases, ...headSandar, ...requestedVisits];
  }, [leases, pendingBerthingContracts, visits]);

  const unpaidInvoices = useMemo(
    () =>
      invoices.filter((inv) =>
        ["ISSUED", "PARTIAL", "DRAFT"].includes(inv.status)
      ),
    [invoices]
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      <ExecutiveKpiGrid
        metrics={{
          verifiedRevenueIdr: revenueSummary?.totalVerifiedRevenueIdr ?? 0,
          outstandingReceivablesIdr: revenueSummary?.outstandingReceivablesIdr ?? 0,
          pendingApprovalsCount: pendingApprovals.length,
          activeVisitsCount: visitStats.active,
          openBerthsCount: berthStats.open,
          totalBerthsCount: berthStats.total,
          unbilledVisitsCount: unbilledVisits.length,
          unpaidInvoicesCount: unpaidInvoices.length,
          warningsCount: warnings.length,
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <RevenueColumnChart revenueSummary={revenueSummary} />
        <VisitAndBerthChart
          activeVisits={visitStats.active}
          requestedVisits={visitStats.requested}
          completedVisits={visitStats.completed}
          openBerths={berthStats.open}
          maintenanceBerths={berthStats.maintenance}
          closedBerths={berthStats.closed}
        />
      </div>

      <ExecutiveQueueSection
        pendingApprovals={pendingApprovals}
        unbilledVisits={unbilledVisits}
        unpaidInvoices={unpaidInvoices}
      />
    </div>
  );
}
