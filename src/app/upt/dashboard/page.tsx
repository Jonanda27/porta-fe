"use client";

import React, { useEffect, useState } from "react";
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
import { useAuthStore } from "@/store/auth.store";
import { useUptStore } from "@/store/upt.store";
import { usePortStore } from "@/store/port.store";

export default function UptDashboardPage() {
  const { user } = useAuthStore();
  const {
    visits,
    unbilledVisits,
    leases,
    invoices,
    warnings,
    revenueSummary,
    isLoading,
    isSubmitting,
    error,
    fetchDashboardData,
    issueWarning,
  } = useUptStore();
  const { ports, fetchPorts } = usePortStore();

  const isSuperadmin = user?.role === "SUPERADMIN";
  const canIssueWarning = isSuperadmin || user?.role === "ADMIN_PELABUHAN";
  const [selectedPortId, setSelectedPortId] = useState<string>("");
  const numericPortId = selectedPortId ? Number(selectedPortId) : undefined;
  const [warningInvoiceId, setWarningInvoiceId] = useState<number | null>(null);
  const [warningLevel, setWarningLevel] = useState<"TEGURAN_1" | "TEGURAN_2" | "TEGURAN_3">("TEGURAN_1");
  const [warningMessage, setWarningMessage] = useState("Tagihan SKRD telah melewati jatuh tempo. Harap segera dilunasi.");
  const [warningFeedback, setWarningFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData(numericPortId);
    fetchPorts();
  }, [numericPortId, fetchDashboardData, fetchPorts]);

  const activeVisits = visits.filter((v) =>
    ["APPROVED", "ANCHORED", "BERTHED"].includes(v.status)
  );
  const requestedVisitsCount = visits.filter((v) => v.status === "REQUESTED").length;
  const requestedLeasesCount = leases.filter((l) => l.status === "REQUESTED").length;

  const visiblePorts = numericPortId
    ? ports.filter((p) => p.id === numericPortId)
    : user?.portId && !isSuperadmin
    ? ports.filter((p) => p.id === user.portId)
    : ports;

  const allBerths = visiblePorts.flatMap((p) =>
    (p.berths || []).map((b) => ({ ...b, portName: p.name }))
  );

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div>
          <p className="text-xs font-bold text-[#0B241E]">
            Ringkasan Operasional & Penerimaan Real-Time
          </p>
          <p className="text-[11px] text-[#64748B]">
            Data tersinkron langsung dari modul Kunjungan, Dermaga, Aset, dan Retribusi Daerah.
          </p>
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
            onClick={() => fetchDashboardData(numericPortId)}
            disabled={isLoading}
            className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0B241E] text-white rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#85A69B] text-xs font-bold">
            <span>Total Penerimaan Terverifikasi</span>
            <Wallet className="w-4 h-4 text-[#D97706]" />
          </div>
          <p className="text-xl font-extrabold mt-2">
            Rp{" "}
            {(revenueSummary?.totalVerifiedRevenueIdr ?? 0).toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-[#BED2CA] mt-1">
            Kapal: Rp {(revenueSummary?.vesselRevenueIdr ?? 0).toLocaleString("id-ID")}
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-bold">
            <span>Kunjungan Aktif di Pelabuhan</span>
            <Ship className="w-4 h-4 text-[#0B241E]" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B241E] mt-2">
            {activeVisits.length}
          </p>
          <p className="text-[11px] text-[#64748B] mt-1">
            {requestedVisitsCount} permohonan menunggu persetujuan
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-bold">
            <span>Dermaga Terbuka (OPEN)</span>
            <Anchor className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B241E] mt-2">
            {allBerths.filter((b) => b.operationalStatus === "OPEN").length} /{" "}
            {allBerths.length}
          </p>
          <p className="text-[11px] text-[#64748B] mt-1">
            {requestedLeasesCount} pengajuan sewa aset menunggu
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-bold">
            <span>Surat Teguran Piutang</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B241E] mt-2">
            {warnings.length}
          </p>
          <p className="text-[11px] text-[#64748B] mt-1">
            {warnings.filter((w) => w.status === "SENT").length} belum terselesaikan
          </p>
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
                Antrean Verifikasi Operator, Kapal & Tenant
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
                Persetujuan Sandar & Sewa Aset ({requestedVisitsCount + requestedLeasesCount})
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
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {v.status}
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
                      {b.portName} • {b.berthServiceCategory}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      b.operationalStatus === "OPEN"
                        ? "bg-emerald-50 text-emerald-700"
                        : b.operationalStatus === "MAINTENANCE"
                        ? "bg-amber-50 text-amber-800"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {b.operationalStatus}
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
            Tagihan SKRD / Piutang Aktif ({invoices.filter((i) => i.status === "ISSUED" || i.status === "PARTIAL").length})
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {invoices
              .filter((i) => i.status === "ISSUED" || i.status === "PARTIAL")
              .slice(0, 6)
              .map((inv) => (
                <div key={inv.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-mono font-bold text-[#0B241E]">
                      {inv.documentNumber} ({inv.status})
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
            {invoices.filter((i) => i.status === "ISSUED" || i.status === "PARTIAL").length === 0 && (
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
                  <div className="font-mono font-bold text-[#0B241E]">
                    {v.visitNumber}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    {v.vessel?.name || `Kapal #${v.vesselId}`} • {v.operator?.name || "-"}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                  Belum SKRD Final
                </span>
              </div>
            ))}
            {unbilledVisits.length === 0 && (
              <div className="p-6 text-center text-xs text-[#94A3B8]">
                Semua kunjungan yang telah berangkat sudah memiliki SKRD Final.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Terbitkan Surat Teguran */}
      {warningInvoiceId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setWarningFeedback(null);
              await issueWarning(
                {
                  invoiceId: warningInvoiceId,
                  warningLevel,
                  message: warningMessage.trim(),
                },
                numericPortId
              );
              setWarningFeedback(`Surat ${warningLevel} untuk invoice #${warningInvoiceId} berhasil diterbitkan.`);
              setWarningInvoiceId(null);
            }}
            className="bg-white rounded-2xl border border-[#E2E8F0] w-full max-w-md p-6 space-y-4 shadow-xl"
          >
            <h3 className="text-base font-extrabold text-[#0B241E]">
              Terbitkan Surat Teguran Piutang
            </h3>
            <select
              value={warningLevel}
              onChange={(e) =>
                setWarningLevel(e.target.value as "TEGURAN_1" | "TEGURAN_2" | "TEGURAN_3")
              }
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
            >
              <option value="TEGURAN_1">TEGURAN_1</option>
              <option value="TEGURAN_2">TEGURAN_2</option>
              <option value="TEGURAN_3">TEGURAN_3</option>
            </select>
            <textarea
              required
              rows={3}
              value={warningMessage}
              onChange={(e) => setWarningMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setWarningInvoiceId(null)}
                className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold cursor-pointer"
              >
                Kirim Teguran
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
