"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Ship,
  Anchor,
  AlertTriangle,
  Wallet,
  CalendarCheck2,
  ShieldCheck,
  Loader2,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { formatLabel } from "@/lib/format-labels";
import { PortItem } from "@/types/port.types";
import {
  AssetLeaseItem,
  IssueWarningPayload,
  RevenueSummaryResponse,
  ShipVisitItem,
  UptInvoiceItem,
  WarningItem,
} from "@/types/upt.types";
import { IssueWarningModal } from "@/components/upt/dashboard/IssueWarningModal";

export interface AdminUptDashboardProps {
  visits: ShipVisitItem[];
  unbilledVisits: ShipVisitItem[];
  leases: AssetLeaseItem[];
  invoices: UptInvoiceItem[];
  warnings: WarningItem[];
  revenueSummary: RevenueSummaryResponse | null;
  ports: PortItem[];
  userPortId?: number | string | null;
  isSuperadmin: boolean;
  canIssueWarning: boolean;
  selectedPortId: string;
  onSelectPortId: (portId: string) => void;
  numericPortId?: number;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  onRefresh: () => void;
  onIssueWarning: (payload: IssueWarningPayload, portId?: number) => Promise<void>;
}

export function AdminUptDashboard({
  visits,
  unbilledVisits,
  leases,
  invoices,
  warnings,
  revenueSummary,
  ports,
  userPortId,
  isSuperadmin,
  canIssueWarning,
  selectedPortId,
  onSelectPortId,
  numericPortId,
  isLoading,
  isSubmitting,
  error,
  onRefresh,
  onIssueWarning,
}: AdminUptDashboardProps) {
  const [warningInvoiceId, setWarningInvoiceId] = useState<number | null>(null);
  const [warningLevel, setWarningLevel] = useState<"TEGURAN_1" | "TEGURAN_2" | "TEGURAN_3">(
    "TEGURAN_1"
  );
  const [warningMessage, setWarningMessage] = useState(
    "Tagihan SKRD telah melewati jatuh tempo. Harap segera dilunasi."
  );
  const [warningFeedback, setWarningFeedback] = useState<string | null>(null);

  const activeVisits = visits.filter((v) =>
    ["APPROVED", "ANCHORED", "BERTHED"].includes(v.status)
  );
  const requestedVisitsCount = visits.filter((v) => v.status === "REQUESTED").length;
  const requestedLeasesCount = leases.filter((l) => l.status === "REQUESTED").length;

  const visiblePorts = numericPortId
    ? ports.filter((p) => p.id === numericPortId)
    : userPortId && !isSuperadmin
    ? ports.filter((p) => p.id === userPortId)
    : ports;

  const allBerths = visiblePorts.flatMap((p) =>
    (p.berths || []).map((b) => ({ ...b, portName: p.name }))
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* 1. OVERLAPPING OPERATIONAL KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Wallet className="w-4.5 h-4.5" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 truncate">
                Terverifikasi
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-4">
              Total Penerimaan Terverifikasi
            </p>
            <p className="text-2xl font-extrabold text-[#0B241E] mt-1 tracking-tight">
              Rp {(revenueSummary?.totalVerifiedRevenueIdr ?? 0).toLocaleString("id-ID")}
            </p>
          </div>
          <p className="text-xs text-[#64748B] mt-3 pt-2.5 border-t border-[#F1F5F9]">
            Kapal: Rp {(revenueSummary?.vesselRevenueIdr ?? 0).toLocaleString("id-ID")}
          </p>
        </div>

        <Link
          href="/upt/kapal"
          className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Ship className="w-4.5 h-4.5" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 truncate">
                {requestedVisitsCount} Menunggu ACC
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-4">
              Kunjungan Aktif di Pelabuhan
            </p>
            <p className="text-2xl font-extrabold text-[#0B241E] mt-1 tracking-tight">
              {activeVisits.length} Kapal
            </p>
          </div>
          <p className="text-xs text-[#64748B] mt-3 pt-2.5 border-t border-[#F1F5F9]">
            {requestedVisitsCount} permohonan menunggu persetujuan
          </p>
        </Link>

        <Link
          href="/upt/pelabuhan"
          className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <Anchor className="w-4.5 h-4.5" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200/80 truncate">
                Status OPEN
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-4">
              Dermaga Terbuka
            </p>
            <p className="text-2xl font-extrabold text-[#0B241E] mt-1 tracking-tight">
              {allBerths.filter((b) => b.operationalStatus === "OPEN").length} / {allBerths.length} Dermaga
            </p>
          </div>
          <p className="text-xs text-[#64748B] mt-3 pt-2.5 border-t border-[#F1F5F9]">
            {requestedLeasesCount} pengajuan sewa aset menunggu
          </p>
        </Link>

        <div className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4.5 h-4.5" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 truncate">
                {warnings.filter((w) => w.status === "SENT").length} Terkirim
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-4">
              Surat Teguran Piutang
            </p>
            <p className="text-2xl font-extrabold text-[#0B241E] mt-1 tracking-tight">
              {warnings.length} Surat
            </p>
          </div>
          <p className="text-xs text-[#64748B] mt-3 pt-2.5 border-t border-[#F1F5F9]">
            {warnings.filter((w) => w.status === "SENT").length} belum terselesaikan
          </p>
        </div>
      </div>

      {/* Top Filter Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <p className="text-xs font-bold text-[#0B241E]">
            Ringkasan Operasional &amp; Penerimaan Real-Time
          </p>
          <p className="text-[11px] text-[#64748B]">
            Data tersinkron langsung dari modul Kunjungan, Dermaga, Aset, dan Retribusi Daerah.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSuperadmin && (
            <select
              value={selectedPortId}
              onChange={(e) => onSelectPortId(e.target.value)}
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
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Action Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/upt/verifikasi"
          className="bg-white border border-[#E2E8F0] hover:border-[#0B241E] rounded-2xl p-5 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#0B241E]">
                Antrean Verifikasi Operator, Kapal &amp; Tenant
              </h3>
              <p className="text-xs text-[#64748B]">
                Periksa legalitas SIUPAL, NIB, NPWP, dan Surat Ukur GT.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#0B241E]" />
        </Link>

        <Link
          href="/upt/alokasi"
          className="bg-white border border-[#E2E8F0] hover:border-[#0B241E] rounded-2xl p-5 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#0B241E]">
                Persetujuan Sandar &amp; Sewa Aset ({requestedVisitsCount + requestedLeasesCount})
              </h3>
              <p className="text-xs text-[#64748B]">
                Proses permohonan kunjungan kapal, override dermaga, dan kontrak PKS.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#0B241E]" />
        </Link>
      </div>

      {/* Active Berths & Recent Visits */}
      {isLoading ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 flex items-center justify-center gap-2 text-xs text-[#64748B]">
          <Loader2 className="w-4 h-4 animate-spin" />
          Memuat data operasional...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#0B241E]">
              Kunjungan Kapal Terbaru ({visits.length})
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {visits.slice(0, 6).map((v) => (
                <div key={v.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#0B241E]">
                      {v.vessel?.name || `Kapal #${v.vesselId}`}{" "}
                      <span className="font-mono text-[11px] text-[#64748B]">
                        ({v.visitNumber})
                      </span>
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      {v.originPort || "-"} → {v.destinationPort || "-"}
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {formatLabel(v.status)}
                  </span>
                </div>
              ))}
              {visits.length === 0 && (
                <div className="p-8 text-center text-xs text-[#94A3B8]">
                  Belum ada kunjungan kapal tercatat.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#0B241E]">
              Status Dermaga ({allBerths.length})
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {allBerths.map((b) => (
                <div key={b.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#0B241E]">
                      {b.code} — {b.name}
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      {b.portName} • {formatLabel(b.berthServiceCategory)}
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      b.operationalStatus === "OPEN"
                        ? "bg-emerald-50 text-emerald-700"
                        : b.operationalStatus === "MAINTENANCE"
                        ? "bg-amber-50 text-amber-800"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {formatLabel(b.operationalStatus)}
                  </span>
                </div>
              ))}
              {allBerths.length === 0 && (
                <div className="p-8 text-center text-xs text-[#94A3B8]">
                  Belum ada dermaga terdaftar.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pengendalian Piutang, Kunjungan Belum Tertagih, & Surat Teguran */}
      {warningFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          {warningFeedback}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#0B241E]">
            Tagihan SKRD / Piutang Aktif (
            {invoices.filter((i) => i.status === "ISSUED" || i.status === "PARTIAL").length})
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {invoices
              .filter((i) => i.status === "ISSUED" || i.status === "PARTIAL")
              .slice(0, 6)
              .map((inv) => (
                <div key={inv.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-mono font-bold text-[#0B241E]">
                      {inv.documentNumber} ({formatLabel(inv.status)})
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      {inv.operator?.name || "-"} • Rp{" "}
                      {Number(inv.totalAmountIdr).toLocaleString("id-ID")}
                    </div>
                  </div>
                  {canIssueWarning && (
                    <button
                      type="button"
                      onClick={() => setWarningInvoiceId(inv.id)}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold cursor-pointer"
                    >
                      Terbitkan Teguran
                    </button>
                  )}
                </div>
              ))}
            {invoices.filter((i) => i.status === "ISSUED" || i.status === "PARTIAL").length ===
              0 && (
              <div className="p-6 text-center text-xs text-[#94A3B8]">
                Tidak ada tagihan piutang yang menunggak.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#0B241E]">
            Kunjungan Berangkat Belum Terbit SKRD Final ({unbilledVisits.length})
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {unbilledVisits.slice(0, 6).map((v) => (
              <div key={v.id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="font-mono font-bold text-[#0B241E]">{v.visitNumber}</div>
                  <div className="text-[11px] text-[#64748B]">
                    {v.vessel?.name || `Kapal #${v.vesselId}`} • {v.operator?.name || "-"}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  Belum Terbit SKRD
                </span>
              </div>
            ))}
            {unbilledVisits.length === 0 && (
              <div className="p-6 text-center text-xs text-[#94A3B8]">
                Seluruh kunjungan kapal yang berangkat sudah diterbitkan SKRD.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Riwayat Surat Teguran */}
      {warnings.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#0B241E]">
            Riwayat Surat Teguran Retribusi ({warnings.length})
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {warnings.slice(0, 6).map((w) => (
              <div key={w.id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="font-mono font-bold text-[#0B241E]">
                    {w.warningNumber} — {formatLabel(w.level)}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    SKRD: {w.invoice?.documentNumber || "-"} • {w.notes || "-"}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  {formatLabel(w.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Terbitkan Surat Teguran */}
      <IssueWarningModal
        warningInvoiceId={warningInvoiceId}
        warningLevel={warningLevel}
        onChangeWarningLevel={setWarningLevel}
        warningMessage={warningMessage}
        onChangeWarningMessage={setWarningMessage}
        isSubmitting={isSubmitting}
        onConfirm={async () => {
          if (warningInvoiceId === null) return;
          try {
            await onIssueWarning(
              {
                invoiceId: warningInvoiceId,
                warningLevel,
                message: warningMessage,
              },
              numericPortId
            );
            setWarningFeedback(
              `Surat ${warningLevel.replace("_", " ")} berhasil diterbitkan.`
            );
            setWarningInvoiceId(null);
          } catch {
            // error handled in store
          }
        }}
        onClose={() => setWarningInvoiceId(null)}
      />
    </div>
  );
}
