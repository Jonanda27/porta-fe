"use client";

import React from "react";
import { AlertTriangle, Anchor, FileSignature, LucideIcon, Wallet } from "lucide-react";

export interface ExecutiveKpiMetrics {
  verifiedRevenueIdr: number;
  outstandingReceivablesIdr: number;
  pendingApprovalsCount: number;
  activeVisitsCount: number;
  openBerthsCount: number;
  totalBerthsCount: number;
  unbilledVisitsCount: number;
  unpaidInvoicesCount: number;
  warningsCount: number;
}

export function formatRupiahCompact(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(2)} M`;
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)} Jt`;
  }
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

interface KpiCardProps {
  title: string;
  value: React.ReactNode;
  subtitle: React.ReactNode;
  icon: LucideIcon;
  iconClassName: string;
  valueClassName?: string;
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClassName,
  valueClassName = "text-[#0B241E]",
}: KpiCardProps) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between text-[#64748B] text-xs font-bold">
        <span>{title}</span>
        <Icon className={`w-4 h-4 ${iconClassName}`} />
      </div>
      <p className={`text-2xl font-black mt-2 ${valueClassName}`}>{value}</p>
      <p className="text-[11px] text-[#64748B] mt-1">{subtitle}</p>
    </div>
  );
}

interface ExecutiveKpiGridProps {
  metrics: ExecutiveKpiMetrics;
}

export function ExecutiveKpiGrid({ metrics }: ExecutiveKpiGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="Penerimaan Terverifikasi"
        icon={Wallet}
        iconClassName="text-[#D97706]"
        value={formatRupiahCompact(metrics.verifiedRevenueIdr)}
        subtitle={
          <>
            Piutang aktif:{" "}
            <span className="font-semibold text-[#D97706]">
              {formatRupiahCompact(metrics.outstandingReceivablesIdr)}
            </span>
          </>
        }
      />

      <KpiCard
        title="Menunggu Pengesahan"
        icon={FileSignature}
        iconClassName="text-[#D97706]"
        value={metrics.pendingApprovalsCount}
        subtitle="PKS Sandar, Sewa Aset & Izin Tambat"
      />

      <KpiCard
        title="Operasional Kapal & Dermaga"
        icon={Anchor}
        iconClassName="text-emerald-600"
        value={
          <>
            {metrics.activeVisitsCount}{" "}
            <span className="text-xs font-semibold text-[#64748B]">Kapal Aktif</span>
          </>
        }
        subtitle={
          <span className="text-emerald-700 font-semibold">
            {metrics.openBerthsCount} / {metrics.totalBerthsCount} dermaga berstatus OPEN
          </span>
        }
      />

      <KpiCard
        title="Pengawasan PAD & Teguran"
        icon={AlertTriangle}
        iconClassName="text-rose-600"
        valueClassName="text-rose-700"
        value={metrics.unbilledVisitsCount + metrics.unpaidInvoicesCount}
        subtitle={`${metrics.unbilledVisitsCount} belum SKRD, ${metrics.warningsCount} surat teguran`}
      />
    </div>
  );
}
