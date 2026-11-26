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
  badgeText: string;
  badgeClassName: string;
  icon: LucideIcon;
  iconBoxClassName: string;
  valueClassName?: string;
}

function KpiCard({
  title,
  value,
  subtitle,
  badgeText,
  badgeClassName,
  icon: Icon,
  iconBoxClassName,
  valueClassName = "text-[#0B241E]",
}: KpiCardProps) {
  return (
    <div className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2">
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${iconBoxClassName}`}
          >
            <Icon className="w-4.5 h-4.5" />
          </div>
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border truncate ${badgeClassName}`}
          >
            {badgeText}
          </span>
        </div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-4">
          {title}
        </p>
        <p className={`text-2xl font-extrabold mt-1 tracking-tight ${valueClassName}`}>
          {value}
        </p>
      </div>
      <p className="text-xs text-[#64748B] mt-3 pt-2.5 border-t border-[#F1F5F9]">
        {subtitle}
      </p>
    </div>
  );
}

interface ExecutiveKpiGridProps {
  metrics: ExecutiveKpiMetrics;
}

export function ExecutiveKpiGrid({ metrics }: ExecutiveKpiGridProps) {
  const alertTotal = metrics.unbilledVisitsCount + metrics.unpaidInvoicesCount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="Penerimaan Terverifikasi"
        icon={Wallet}
        iconBoxClassName="bg-emerald-50 border-emerald-100 text-emerald-700"
        badgeText="PAD Kasda"
        badgeClassName="bg-emerald-50 text-emerald-700 border-emerald-200/80"
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
        iconBoxClassName="bg-amber-50 border-amber-100 text-amber-700"
        badgeText={metrics.pendingApprovalsCount > 0 ? "Perlu TTE / ACC" : "Terkendali"}
        badgeClassName="bg-amber-50 text-amber-800 border-amber-200/80"
        value={`${metrics.pendingApprovalsCount} Berkas`}
        subtitle="PKS Sandar, Sewa Aset & Izin Tambat"
      />

      <KpiCard
        title="Operasional Kapal & Dermaga"
        icon={Anchor}
        iconBoxClassName="bg-blue-50 border-blue-100 text-blue-700"
        badgeText={`${metrics.openBerthsCount}/${metrics.totalBerthsCount} Dermaga OPEN`}
        badgeClassName="bg-blue-50 text-blue-700 border-blue-200/80"
        value={`${metrics.activeVisitsCount} Kapal Aktif`}
        subtitle={
          <span className="text-emerald-700 font-semibold">
            {metrics.openBerthsCount} dari {metrics.totalBerthsCount} dermaga siap sandar
          </span>
        }
      />

      <KpiCard
        title="Pengawasan PAD & Teguran"
        icon={AlertTriangle}
        iconBoxClassName={
          alertTotal > 0
            ? "bg-rose-50 border-rose-100 text-rose-700"
            : "bg-emerald-50 border-emerald-100 text-emerald-700"
        }
        badgeText={`${metrics.warningsCount} Surat Teguran`}
        badgeClassName={
          alertTotal > 0
            ? "bg-rose-50 text-rose-700 border-rose-200/80"
            : "bg-emerald-50 text-emerald-700 border-emerald-200/80"
        }
        valueClassName={alertTotal > 0 ? "text-rose-700" : "text-[#0B241E]"}
        value={`${alertTotal} Tagihan`}
        subtitle={`${metrics.unbilledVisitsCount} belum SKRD • ${metrics.unpaidInvoicesCount} belum lunas`}
      />
    </div>
  );
}
