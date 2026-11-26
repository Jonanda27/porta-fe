"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Ship,
  RefreshCw,
  ArrowRight,
  Building2,
  FileSignature,
  ClipboardList,
  CheckCircle2,
  Lock,
  FileCheck2,
} from "lucide-react";
import { formatLabel } from "@/lib/format-labels";
import { OperatorBerthingContract } from "@/types/kapal.types";
import {
  AssetLeaseItem,
  DocumentItem,
  OfficerTaskItem,
  ShipOperatorItem,
  TenantItem,
  UserAssignmentItem,
  VesselItem,
} from "@/types/upt.types";

const VESSEL_ONLY_DOC_TYPES = new Set([
  "SURAT_UKUR",
  "PAS_BESAR",
  "PAS_KECIL",
  "SERTIFIKAT_KESELAMATAN",
]);

function checkOperatorDocReadiness(docs?: DocumentItem[]) {
  const companyDocs = (docs || []).filter(
    (d) =>
      !VESSEL_ONLY_DOC_TYPES.has(d.category) &&
      d.notes !== "FOTO_KAPAL" &&
      d.documentNumber !== "FOTO-KAPAL"
  );
  const uploadedTypes = new Set(companyDocs.map((d) => d.category));
  const hasSiupalOrNib = uploadedTypes.has("SIUPAL_NIB");
  const hasNpwp = uploadedTypes.has("NPWP");
  return {
    totalDocs: companyDocs.length,
    isReady: hasSiupalOrNib && hasNpwp,
  };
}

export interface PetugasRegistrasiDashboardProps {
  operators: ShipOperatorItem[];
  vessels: VesselItem[];
  tenants: TenantItem[];
  pendingBerthingContracts: OperatorBerthingContract[];
  leases: AssetLeaseItem[];
  myAssignments: UserAssignmentItem[];
  officerTasks: OfficerTaskItem[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function PetugasRegistrasiDashboard({
  operators,
  vessels,
  tenants,
  pendingBerthingContracts,
  leases,
  myAssignments,
  officerTasks,
  isLoading,
  error,
  onRefresh,
}: PetugasRegistrasiDashboardProps) {
  const [queueFilter, setQueueFilter] = useState<
    "ALL" | "PKS_RUANGAN" | "OPERATOR" | "KAPAL" | "TENANT"
  >("ALL");
  const [queuePage, setQueuePage] = useState<number>(1);
  const QUEUE_PAGE_SIZE = 5;

  // 1. Operator Metrics (Real DB)
  const pendingOperators = operators.filter((o) => o.verificationStatus === "PENDING");
  const verifiedOperators = operators.filter((o) => o.verificationStatus === "VERIFIED");
  const rejectedOperators = operators.filter((o) => o.verificationStatus === "REJECTED");

  // 2. Vessel Metrics (Real DB)
  const pendingVessels = vessels.filter((v) => v.verificationStatus === "PENDING");
  const verifiedVessels = vessels.filter((v) => v.verificationStatus === "VERIFIED");
  const rejectedVessels = vessels.filter((v) => v.verificationStatus === "REJECTED");
  const totalGrossTonnage = vessels.reduce((acc, v) => acc + (Number(v.grossTonnage) || 0), 0);
  const cargoVesselsCount = vessels.filter((v) => v.vesselCategory === "BARANG").length;
  const passengerVesselsCount = vessels.filter((v) => v.vesselCategory === "PENUMPANG").length;
  const mixedVesselsCount = vessels.filter((v) => v.vesselCategory === "CAMPURAN").length;

  // 3. Tenant Metrics (Real DB)
  const pendingTenants = tenants.filter((t) => t.verificationStatus === "PENDING");
  const verifiedTenants = tenants.filter((t) => t.verificationStatus === "VERIFIED");
  const rejectedTenants = tenants.filter((t) => t.verificationStatus === "REJECTED");

  // 4. PKS Sandar & PKS Sewa Ruangan Metrics (Real DB)
  const pendingBerthingList = pendingBerthingContracts.filter(
    (c) => c.status === "PENDING_VERIFICATION" || c.status === "PENDING_HEAD_OF_PORT"
  );
  const activeBerthingContracts = pendingBerthingContracts.filter(
    (c) => c.status === "ACTIVE"
  );
  const rejectedBerthingContracts = pendingBerthingContracts.filter(
    (c) => c.status === "REJECTED"
  );

  const stage1RoomLeases = leases.filter(
    (l) => l.status === "REQUESTED" || l.status === "PENDING_ROOM_OFFICER"
  );
  const stage2RoomLeases = leases.filter((l) => l.status === "PENDING_HEAD_OF_PORT");
  const activeRoomLeases = leases.filter((l) => l.status === "ACTIVE");
  const rejectedRoomLeases = leases.filter((l) => l.status === "REJECTED");
  const totalActiveLeaseAnnualValue = activeRoomLeases.reduce(
    (acc, l) => acc + (Number(l.totalAnnualAmountIdr) || 0),
    0
  );

  // 5. Officer Tasks Summary (Real DB)
  const completedTasks = officerTasks.filter((t) =>
    ["SUBMITTED", "COMPLETED", "VERIFIED"].includes(t.executionStatus)
  );
  const inProgressTasks = officerTasks.filter((t) =>
    ["IN_PROGRESS", "NOT_STARTED", "ASSIGNED"].includes(t.executionStatus)
  );

  // 6. Totals
  const totalMitraCount = operators.length + tenants.length;
  const totalVerifiedMitraCount = verifiedOperators.length + verifiedTenants.length;
  const totalPendingMitraCount = pendingOperators.length + pendingTenants.length;
  const totalContractsCount = leases.length + pendingBerthingContracts.length;
  const totalActiveContractsCount = activeRoomLeases.length + activeBerthingContracts.length;
  const totalPendingAll =
    stage1RoomLeases.length +
    pendingOperators.length +
    pendingVessels.length +
    pendingTenants.length;

  // 7. Real DB Data for Chart 1: Verification & Contract Status per Module
  const moduleChartData = [
    {
      label: "Operator Kapal",
      href: "/upt/verifikasi",
      verified: verifiedOperators.length,
      pending: pendingOperators.length,
      rejected: rejectedOperators.length,
      total: operators.length,
    },
    {
      label: "Armada Kapal",
      href: "/upt/verifikasi/kapal",
      verified: verifiedVessels.length,
      pending: pendingVessels.length,
      rejected: rejectedVessels.length,
      total: vessels.length,
    },
    {
      label: "Tenant Mitra",
      href: "/upt/verifikasi/tenant",
      verified: verifiedTenants.length,
      pending: pendingTenants.length,
      rejected: rejectedTenants.length,
      total: tenants.length,
    },
    {
      label: "PKS Sewa Ruangan",
      href: "/upt/verifikasi/pks-ruangan",
      verified: activeRoomLeases.length,
      pending: stage1RoomLeases.length + stage2RoomLeases.length,
      rejected: rejectedRoomLeases.length,
      total: leases.length,
    },
    {
      label: "PKS Sandar Kapal",
      href: "/upt/verifikasi/pks-sandar",
      verified: activeBerthingContracts.length,
      pending: pendingBerthingList.length,
      rejected: rejectedBerthingContracts.length,
      total: pendingBerthingContracts.length,
    },
  ];

  // 8. Real DB Data for Chart 2: SVG Donut Chart of Fleet Composition & GT
  const fleetSegmentsConfig = [
    {
      key: "DALAM_NEGERI",
      label: "Dalam Negeri",
      color: "#0B241E",
    },
    {
      key: "PELRA_PERINTIS",
      label: "Pelra & Perintis",
      color: "#0D9488",
    },
    {
      key: "LUAR_NEGERI",
      label: "Luar Negeri",
      color: "#D97706",
    },
  ];

  const donutRadius = 54;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let cumulativeFraction = 0;

  const fleetDonutSegments = fleetSegmentsConfig.map((seg) => {
    const matched = vessels.filter((v) => v.shippingCategory === seg.key);
    const count = matched.length;
    const gt = matched.reduce((acc, v) => acc + (Number(v.grossTonnage) || 0), 0);
    const fraction = vessels.length > 0 ? count / vessels.length : 0;
    const strokeLength = fraction * donutCircumference;
    const strokeOffset = -cumulativeFraction * donutCircumference;
    cumulativeFraction += fraction;
    return {
      ...seg,
      count,
      gt,
      pct: Math.round(fraction * 100),
      strokeLength,
      strokeOffset,
    };
  });

  // 9. Unified Action Queue Rows for Clean Executive Table
  const unifiedQueueRows: {
    key: string;
    category: "PKS_RUANGAN" | "OPERATOR" | "KAPAL" | "TENANT";
    categoryLabel: string;
    categoryBadgeClass: string;
    title: string;
    subtitle: string;
    specText: string;
    readinessLabel: string;
    isReady: boolean;
    href: string;
    actionLabel: string;
  }[] = [
    ...stage1RoomLeases.map((l) => ({
      key: `lease-${l.id}`,
      category: "PKS_RUANGAN" as const,
      categoryLabel: "PKS Ruangan",
      categoryBadgeClass: "bg-teal-50 text-teal-800 border-teal-200",
      title: l.tenantName,
      subtitle: l.contractNumber,
      specText: `${l.asset?.name || "Ruangan"} • Rp ${Number(
        l.totalAnnualAmountIdr
      ).toLocaleString("id-ID")}/thn`,
      readinessLabel: "Siap Verifikasi Tahap 1",
      isReady: true,
      href: "/upt/verifikasi/pks-ruangan",
      actionLabel: "Verifikasi",
    })),
    ...pendingOperators.map((op) => {
      const docCheck = checkOperatorDocReadiness(op.documents);
      return {
        key: `op-${op.id}`,
        category: "OPERATOR" as const,
        categoryLabel: "Operator Kapal",
        categoryBadgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
        title: op.name,
        subtitle: `NPWP: ${op.npwp || "-"}`,
        specText: `${op.email || "-"} • ${op.phone || "-"}`,
        readinessLabel: docCheck.isReady
          ? `Berkas Lengkap (${docCheck.totalDocs} Berkas)`
          : "Belum Unggah SIUPAL & NPWP",
        isReady: docCheck.isReady,
        href: "/upt/verifikasi",
        actionLabel: docCheck.isReady ? "Verifikasi" : "Periksa",
      };
    }),
    ...pendingVessels.map((v) => {
      const docCount = (v.documents || []).filter(
        (d) => d.notes !== "FOTO_KAPAL" && d.documentNumber !== "FOTO-KAPAL"
      ).length;
      return {
        key: `vessel-${v.id}`,
        category: "KAPAL" as const,
        categoryLabel: "Armada Kapal",
        categoryBadgeClass: "bg-blue-50 text-blue-800 border-blue-200",
        title: v.name,
        subtitle: v.registrationNumber,
        specText: `${v.grossTonnage} GT • ${formatLabel(v.shippingCategory)} • ${
          v.operator?.name || "-"
        }`,
        readinessLabel:
          docCount > 0
            ? `Surat Ukur (${docCount} Berkas)`
            : "Belum Unggah Surat Ukur",
        isReady: docCount > 0,
        href: "/upt/verifikasi/kapal",
        actionLabel: docCount > 0 ? "Verifikasi" : "Periksa",
      };
    }),
    ...pendingTenants.map((t) => ({
      key: `tenant-${t.id}`,
      category: "TENANT" as const,
      categoryLabel: "Tenant Mitra",
      categoryBadgeClass: "bg-amber-50 text-amber-800 border-amber-200",
      title: t.name,
      subtitle: `NPWP: ${t.npwp || "-"}`,
      specText: `NIB: ${t.nib || "-"} • ${t.phone || "-"}`,
      readinessLabel: `${(t.documents || []).length} Berkas Terunggah`,
      isReady: true,
      href: "/upt/verifikasi/tenant",
      actionLabel: "Verifikasi",
    })),
  ];

  const filteredQueueRows =
    queueFilter === "ALL"
      ? unifiedQueueRows
      : unifiedQueueRows.filter((r) => r.category === queueFilter);

  const totalQueuePages = Math.max(1, Math.ceil(filteredQueueRows.length / QUEUE_PAGE_SIZE));
  const safeQueuePage = Math.min(queuePage, totalQueuePages);
  const pagedQueueRows = filteredQueueRows.slice(
    (safeQueuePage - 1) * QUEUE_PAGE_SIZE,
    safeQueuePage * QUEUE_PAGE_SIZE
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. FOUR ESSENTIAL KPI CARDS (100% Real DB Data)           */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Mitra Usaha (Operator & Tenant) */}
        <Link
          href="/upt/verifikasi"
          className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all block"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5" />
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
              {totalPendingMitraCount} Menunggu
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-4">
            Mitra Usaha Terdaftar
          </p>
          <p className="text-2xl font-extrabold text-[#0B241E] mt-1 tracking-tight">
            {totalMitraCount}{" "}
            <span className="text-xs font-normal text-[#64748B]">
              ({totalVerifiedMitraCount} Terverifikasi)
            </span>
          </p>
          <div className="mt-3 pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
            <span>
              {operators.length} Operator • {tenants.length} Tenant
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#0B241E]" />
          </div>
        </Link>

        {/* KPI 2: Armada Kapal & Total GT */}
        <Link
          href="/upt/verifikasi/kapal"
          className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all block"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center">
              <Ship className="w-4.5 h-4.5" />
            </div>
            <span className="text-[11px] font-bold text-blue-800 bg-blue-100/80 px-2.5 py-0.5 rounded-full">
              {totalGrossTonnage.toLocaleString("id-ID")} GT
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-4">
            Armada Kapal Terdaftar
          </p>
          <p className="text-2xl font-extrabold text-[#0B241E] mt-1 tracking-tight">
            {vessels.length}{" "}
            <span className="text-xs font-normal text-[#64748B]">
              ({verifiedVessels.length} Aktif)
            </span>
          </p>
          <div className="mt-3 pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
            <span>{pendingVessels.length} kapal menunggu verifikasi</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#0B241E]" />
          </div>
        </Link>

        {/* KPI 3: Kontrak PKS (Ruangan & Sandar) */}
        <Link
          href="/upt/verifikasi/pks-ruangan"
          className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all block"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center">
              <FileSignature className="w-4.5 h-4.5" />
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
              {stage1RoomLeases.length} Tahap 1
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-4">
            Kontrak PKS Ruangan &amp; Sandar
          </p>
          <p className="text-2xl font-extrabold text-[#0B241E] mt-1 tracking-tight">
            {totalContractsCount}{" "}
            <span className="text-xs font-normal text-[#64748B]">
              ({totalActiveContractsCount} Disahkan)
            </span>
          </p>
          <div className="mt-3 pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
            <span>Nilai Sewa: Rp {(totalActiveLeaseAnnualValue / 1_000_000).toFixed(1)} Jt/thn</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#0B241E]" />
          </div>
        </Link>

        {/* KPI 4: Lembar Tugas SOP */}
        <Link
          href="/upt/tugas-saya"
          className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all block"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center">
              <ClipboardList className="w-4.5 h-4.5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
              {inProgressTasks.length} Berjalan
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-4">
            Tugas Pemeriksaan SOP
          </p>
          <p className="text-2xl font-extrabold text-[#0B241E] mt-1 tracking-tight">
            {completedTasks.length} / {officerTasks.length}{" "}
            <span className="text-xs font-normal text-[#64748B]">Selesai</span>
          </p>
          <div className="mt-3 pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
            <span>SK: {myAssignments[0]?.assignmentCode || "ASG-PMK-SPEC-REG-34"}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#0B241E]" />
          </div>
        </Link>
      </div>

      {/* ========================================================= */}
      {/* 2. TWO REAL-DATA EXECUTIVE CHARTS (Balanced Equal Height) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* CHART 1 (7 COLS): GRAFIK STATUS VERIFIKASI & KONTRAK PER MODUL */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-[#F1F5F9]">
            <div>
              <h2 className="text-sm font-extrabold text-[#0B241E]">
                Grafik Realisasi Verifikasi &amp; Kontrak per Modul
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Rasio data Terverifikasi/Aktif terhadap antrean Menunggu Verifikasi
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold shrink-0">
              <span className="inline-flex items-center gap-1.5 text-[#334155]">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#0D9488]" />
                Aktif
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#334155]">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#D97706]" />
                Menunggu
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-3">
            {moduleChartData.map((m) => {
              const total = Math.max(m.total, 1);
              const verifiedPct = Math.round((m.verified / total) * 100);
              const pendingPct = Math.round((m.pending / total) * 100);
              const rejectedPct = Math.max(0, 100 - verifiedPct - pendingPct);

              return (
                <Link
                  key={m.label}
                  href={m.href}
                  className="block group space-y-1.5 hover:bg-[#F8FAFC] p-2 -mx-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0B241E] group-hover:underline">
                      {m.label}
                    </span>
                    <div className="flex items-center gap-2.5 font-mono text-[11px]">
                      <span className="text-teal-700 font-bold">
                        {m.verified} Aktif ({verifiedPct}%)
                      </span>
                      {m.pending > 0 && (
                        <span className="text-amber-700 font-bold">
                          • {m.pending} Menunggu
                        </span>
                      )}
                      <span className="text-[#64748B] font-semibold">
                        [{m.total}]
                      </span>
                    </div>
                  </div>

                  {/* Multi-Segment Stacked Bar */}
                  <div className="w-full h-3 rounded-full bg-[#F1F5F9] overflow-hidden flex">
                    {m.verified > 0 && (
                      <div
                        className="h-full bg-[#0D9488] transition-all"
                        style={{ width: `${verifiedPct}%` }}
                        title={`Terverifikasi / Aktif: ${m.verified}`}
                      />
                    )}
                    {m.pending > 0 && (
                      <div
                        className="h-full bg-[#D97706] transition-all"
                        style={{ width: `${pendingPct}%` }}
                        title={`Menunggu: ${m.pending}`}
                      />
                    )}
                    {m.rejected > 0 && (
                      <div
                        className="h-full bg-rose-500 transition-all"
                        style={{ width: `${rejectedPct}%` }}
                        title={`Ditolak: ${m.rejected}`}
                      />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* CHART 2 (5 COLS): GRAFIK DONUT KOMPOSISI ARMADA & TONASE (Zero Nested Cards) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-2xs flex flex-col justify-between gap-4">
          <div className="pb-3.5 border-b border-[#F1F5F9] flex items-baseline justify-between gap-2">
            <div>
              <h2 className="text-sm font-extrabold text-[#0B241E]">
                Grafik Komposisi Trayek &amp; Tonase Armada
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Proporsi kapal &amp; Gross Tonnage (GT) berdasarkan trayek
              </p>
            </div>
            <span className="font-mono text-xs font-extrabold text-[#0D9488] shrink-0">
              {totalGrossTonnage.toLocaleString("id-ID")} GT
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 my-auto">
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r={donutRadius}
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth="16"
                />
                {fleetDonutSegments.map((seg) =>
                  seg.count > 0 ? (
                    <circle
                      key={seg.key}
                      cx="70"
                      cy="70"
                      r={donutRadius}
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="16"
                      strokeDasharray={`${seg.strokeLength} ${donutCircumference}`}
                      strokeDashoffset={seg.strokeOffset}
                      strokeLinecap="butt"
                    />
                  ) : null
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-[#0B241E] font-mono leading-none">
                  {vessels.length}
                </span>
                <span className="text-[10px] font-semibold text-[#64748B] mt-1">
                  Unit Kapal
                </span>
              </div>
            </div>

            {/* Clean Flat Legend List (No Nested Cards, Subtle Hairline Divider) */}
            <div className="flex-1 w-full divide-y divide-[#F1F5F9]">
              {fleetDonutSegments.map((seg) => (
                <div
                  key={seg.key}
                  className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    <div>
                      <div className="font-bold text-[#0B241E]">{seg.label}</div>
                      <div className="text-[11px] font-mono text-[#64748B]">
                        {seg.gt.toLocaleString("id-ID")} GT
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-extrabold text-[#0B241E]">{seg.count} Kapal</span>
                    <span className="text-[11px] text-[#0D9488] font-bold ml-1.5">
                      ({seg.pct}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clean Flat Bottom Summary Row (Divided by Hairlines, Zero Box Borders) */}
          <div className="pt-3.5 border-t border-[#F1F5F9] grid grid-cols-3 divide-x divide-[#F1F5F9] text-center">
            <div className="px-2">
              <div className="text-[11px] text-[#64748B]">Kapal Barang</div>
              <div className="text-sm font-extrabold font-mono text-[#0B241E] mt-0.5">
                {cargoVesselsCount} Unit
              </div>
            </div>
            <div className="px-2">
              <div className="text-[11px] text-[#64748B]">Kapal Penumpang</div>
              <div className="text-sm font-extrabold font-mono text-[#0B241E] mt-0.5">
                {passengerVesselsCount} Unit
              </div>
            </div>
            <div className="px-2">
              <div className="text-[11px] text-[#64748B]">Campuran / Ro-Ro</div>
              <div className="text-sm font-extrabold font-mono text-[#0B241E] mt-0.5">
                {mixedVesselsCount} Unit
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. CLEAN EXECUTIVE TABLE: DAFTAR ANTREAN VERIFIKASI AKTIF */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-[#0B241E] text-sm flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#D97706]" />
              <span>Antrean Permohonan Menunggu Verifikasi ({totalPendingAll})</span>
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Daftar permohonan yang memerlukan pemeriksaan berkas wajib atau verifikasi ruangan Tahap 1.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "ALL" as const, label: `Semua (${totalPendingAll})` },
              { id: "PKS_RUANGAN" as const, label: `PKS Ruangan (${stage1RoomLeases.length})` },
              { id: "OPERATOR" as const, label: `Operator (${pendingOperators.length})` },
              { id: "KAPAL" as const, label: `Kapal (${pendingVessels.length})` },
              { id: "TENANT" as const, label: `Tenant (${pendingTenants.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setQueueFilter(tab.id);
                  setQueuePage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  queueFilter === tab.id
                    ? "bg-[#0B241E] text-white"
                    : "bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]"
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#0B241E] cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-hidden">
          <table className="w-full text-left text-xs table-fixed border-collapse">
            <thead className="bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider font-semibold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4 w-[14%]">Kategori</th>
                <th className="py-3 px-4 w-[25%]">Nama Mitra / Kapal</th>
                <th className="py-3 px-4 w-[28%]">Rincian &amp; Spesifikasi</th>
                <th className="py-3 px-4 w-[21%]">Kelengkapan Berkas</th>
                <th className="py-3 px-4 text-right w-[12%]">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {pagedQueueRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#94A3B8]">
                    Tidak ada permohonan yang menunggu verifikasi pada kategori ini.
                  </td>
                </tr>
              ) : (
                pagedQueueRows.map((row) => (
                  <tr key={row.key} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4 align-middle">
                      <span
                        className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border inline-block whitespace-nowrap ${row.categoryBadgeClass}`}
                      >
                        {row.categoryLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4 align-middle">
                      <div className="font-bold text-[#0B241E] truncate" title={row.title}>
                        {row.title}
                      </div>
                      <div className="text-[11px] font-mono text-[#64748B] truncate">
                        {row.subtitle}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#475569] align-middle">
                      <div className="truncate" title={row.specText}>
                        {row.specText}
                      </div>
                    </td>
                    <td className="py-3 px-4 align-middle">
                      {row.isReady ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>{row.readinessLabel}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200 whitespace-nowrap">
                          <Lock className="w-3 h-3 shrink-0" />
                          <span>{row.readinessLabel}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right align-middle">
                      <Link
                        href={row.href}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-colors whitespace-nowrap ${
                          row.isReady
                            ? "bg-[#0B241E] hover:bg-[#143E33] text-white shadow-2xs"
                            : "bg-white hover:bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1]"
                        }`}
                      >
                        <span>{row.actionLabel}</span>
                        <ArrowRight className="w-3 h-3 shrink-0" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredQueueRows.length > QUEUE_PAGE_SIZE && (
          <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
            <span>
              Menampilkan{" "}
              <strong className="text-[#0B241E]">
                {(safeQueuePage - 1) * QUEUE_PAGE_SIZE + 1}–
                {Math.min(safeQueuePage * QUEUE_PAGE_SIZE, filteredQueueRows.length)}
              </strong>{" "}
              dari <strong className="text-[#0B241E]">{filteredQueueRows.length}</strong> antrean
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={safeQueuePage <= 1}
                onClick={() => setQueuePage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] disabled:opacity-40 font-semibold text-[#0B241E] cursor-pointer disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <span className="px-2 font-mono font-bold text-[#0B241E]">
                {safeQueuePage} / {totalQueuePages}
              </span>
              <button
                type="button"
                disabled={safeQueuePage >= totalQueuePages}
                onClick={() => setQueuePage((p) => Math.min(totalQueuePages, p + 1))}
                className="px-2.5 py-1 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] disabled:opacity-40 font-semibold text-[#0B241E] cursor-pointer disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
