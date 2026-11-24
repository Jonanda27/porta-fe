"use client";

import { Anchor, CheckCircle2, Clock, MapPin, Ship, XCircle } from "lucide-react";
import { formatLabel } from "@/lib/format-labels";
import { AssetLeaseItem, BerthingRecordItem, ShipVisitItem } from "@/types/upt.types";
import { formatVisitSchedule } from "../alokasi.utils";

interface VisitsCardListProps {
  visits: ShipVisitItem[];
  totalVisitsCount: number;
  requestedCount: number;
  filteredCount: number;
  statusFilter: string;
  onStatusFilterChange: (nextStatus: string) => void;
  allocatedBerthsMap: Record<number, string>;
  isSubmitting: boolean;
  onOpenAllocationModal: (visit: ShipVisitItem) => void;
}

export function VisitsCardList({
  visits,
  totalVisitsCount,
  requestedCount,
  filteredCount,
  statusFilter,
  onStatusFilterChange,
  allocatedBerthsMap,
  isSubmitting,
  onOpenAllocationModal,
}: VisitsCardListProps) {
  const filterOptions = [
    { key: "", label: "Semua", count: totalVisitsCount },
    { key: "REQUESTED", label: "Menunggu Penetapan", count: requestedCount },
    { key: "ASSIGNED", label: "Sudah Ditetapkan", count: totalVisitsCount - requestedCount },
  ];

  return (
    <div className="p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2 flex-wrap">
          {filterOptions.map((item) => {
            const active = statusFilter === item.key;
            return (
              <button
                key={item.key || "all"}
                type="button"
                onClick={() => onStatusFilterChange(item.key)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                  active
                    ? "bg-[#0B241E] text-white border-[#0B241E]"
                    : "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:bg-[#F1F5F9]"
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    active ? "bg-white/15 text-white" : "bg-slate-200/70 text-[#334155]"
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
        <span className="text-[11px] text-[#64748B]">
          Menampilkan <strong className="text-[#0B241E]">{visits.length}</strong> dari{" "}
          <strong className="text-[#0B241E]">{filteredCount}</strong> kunjungan
        </span>
      </div>

      {visits.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#94A3B8] border border-dashed border-[#E2E8F0] rounded-2xl bg-[#F8FAFC]/50">
          Belum ada data kunjungan kapal yang sesuai.
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map((v) => {
            const isPending = v.status === "REQUESTED";
            const berthLabel =
              v.berthingRecords?.[0]?.berth?.name ||
              v.berthings?.[0]?.berth?.name ||
              allocatedBerthsMap[v.id] ||
              null;

            return (
              <div
                key={v.id}
                className={`rounded-2xl border border-[#E2E8F0] border-l-4 bg-white p-4 sm:p-5 transition-shadow hover:shadow-sm ${
                  isPending ? "border-l-amber-400" : "border-l-emerald-500"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-[#0B241E] bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-lg">
                      {v.visitNumber}
                    </span>

                    {isPending ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3 shrink-0 text-amber-600" />
                        <span>Menunggu Penetapan</span>
                      </span>
                    ) : (
                      <>
                        <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                          {formatLabel(v.status)}
                        </span>
                        {berthLabel && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Anchor className="w-3 h-3 shrink-0 text-emerald-600" />
                            <span>{berthLabel}</span>
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <div className="shrink-0">
                    {isPending ? (
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => onOpenAllocationModal(v)}
                        className="px-4 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold cursor-pointer inline-flex items-center gap-2 shadow-2xs transition-colors"
                      >
                        <Anchor className="w-3.5 h-3.5 shrink-0 text-[#D97706]" />
                        <span>Pilih Dermaga &amp; Setujui</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50/70 px-3 py-1.5 rounded-xl border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Ditetapkan &amp; Disetujui</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0 text-[#0B241E]">
                      <Ship className="w-4 h-4 text-[#D97706]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                        Kapal &amp; Operator
                      </span>
                      <p className="font-extrabold text-[#0B241E] text-[13px] leading-snug mt-0.5">
                        {v.vessel?.name || `Kapal #${v.vesselId}`}
                      </p>
                      <p className="text-[11px] text-[#64748B] leading-snug mt-0.5">
                        {v.operator?.name || `Operator #${v.operatorId}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0 text-[#0B241E]">
                      <MapPin className="w-4 h-4 text-[#0B241E]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                        Rute Pelayaran
                      </span>
                      <p className="font-semibold text-[#1E293B] mt-0.5 leading-snug">
                        {v.originPort || "-"}
                      </p>
                      <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                        → {v.destinationPort || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0 text-[#0B241E]">
                      <Clock className="w-4 h-4 text-[#64748B]" />
                    </div>
                    <div className="min-w-0 tabular-nums">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                        Jadwal ETA / ETD
                      </span>
                      <p className="text-[11.5px] text-[#1E293B] font-semibold mt-0.5">
                        ETA: {formatVisitSchedule(v.eta)}
                      </p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        ETD: {formatVisitSchedule(v.etd)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface OverridesCardListProps {
  overrides: BerthingRecordItem[];
  canApproveAdminActions: boolean;
  isSubmitting: boolean;
  onDecideOverride: (visitId: number, berthingId: number, decision: "APPROVED" | "REJECTED") => void;
}

export function OverridesCardList({
  overrides,
  canApproveAdminActions,
  isSubmitting,
  onDecideOverride,
}: OverridesCardListProps) {
  return (
    <div className="p-4 sm:p-5 space-y-3">
      {overrides.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#94A3B8] border border-dashed border-[#E2E8F0] rounded-2xl bg-[#F8FAFC]/50">
          Tidak ada permohonan override dermaga yang menunggu persetujuan.
        </div>
      ) : (
        overrides.map((b) => (
          <div
            key={b.id}
            className="rounded-2xl border border-[#E2E8F0] border-l-4 border-l-amber-400 bg-white p-4 sm:p-5 space-y-3 hover:shadow-sm transition-all"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-[#0B241E] bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-lg">
                  {b.visit?.visitNumber || `Visit #${b.visitId}`}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  {formatLabel(b.validationResult)} ({formatLabel(b.compatibilityStatus)})
                </span>
              </div>
              <div className="flex items-center gap-2">
                {canApproveAdminActions ? (
                  <>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => onDecideOverride(b.visitId, b.id, "APPROVED")}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                    >
                      Setujui
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => onDecideOverride(b.visitId, b.id, "REJECTED")}
                      className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold cursor-pointer"
                    >
                      Tolak
                    </button>
                  </>
                ) : (
                  <span className="text-[11px] text-[#94A3B8] font-medium">
                    Menunggu Persetujuan Admin/Kepala Pelabuhan
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                  Kapal
                </span>
                <p className="font-bold text-[#0B241E] mt-0.5">{b.visit?.vessel?.name || "-"}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                  Dermaga Tujuan
                </span>
                <p className="font-semibold text-[#334155] mt-0.5">
                  {b.berth ? `${b.berth.code} - ${b.berth.name}` : `Berth #${b.berthId}`}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                  Alasan Override
                </span>
                <p className="text-[#475569] mt-0.5">{b.overrideReason || "-"}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

interface LeasesCardListProps {
  leases: AssetLeaseItem[];
  canApproveAdminActions: boolean;
  isSubmitting: boolean;
  onApproveLease: (leaseId: number, contractNumber: string) => void;
  onRequestRejectLease: (target: { id: number; contractNumber: string }) => void;
}

export function LeasesCardList({
  leases,
  canApproveAdminActions,
  isSubmitting,
  onApproveLease,
  onRequestRejectLease,
}: LeasesCardListProps) {
  return (
    <div className="p-4 sm:p-5 space-y-3">
      {leases.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#94A3B8] border border-dashed border-[#E2E8F0] rounded-2xl bg-[#F8FAFC]/50">
          Belum ada data pengajuan atau kontrak sewa aset.
        </div>
      ) : (
        leases.map((l) => {
          const isLeasePending = l.status === "REQUESTED";
          return (
            <div
              key={l.id}
              className={`rounded-2xl border border-[#E2E8F0] border-l-4 bg-white p-4 sm:p-5 space-y-3 hover:shadow-sm transition-all ${
                isLeasePending ? "border-l-amber-400" : "border-l-emerald-500"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-[#0B241E] bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-lg">
                    {l.contractNumber}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                      isLeasePending
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : l.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {formatLabel(l.status)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isLeasePending ? (
                    <>
                      {canApproveAdminActions && (
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => onApproveLease(l.id, l.contractNumber)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                        >
                          Setujui
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() =>
                          onRequestRejectLease({
                            id: l.id,
                            contractNumber: l.contractNumber,
                          })
                        }
                        className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Tolak
                      </button>
                    </>
                  ) : (
                    <span className="text-[11px] text-[#94A3B8] font-medium">Sudah diproses</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                    Tenant / Penyewa
                  </span>
                  <p className="font-bold text-[#1E293B] mt-0.5">{l.tenantName}</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">{l.tenantPhone || "-"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                    Aset Pelabuhan
                  </span>
                  <p className="font-semibold text-[#334155] mt-0.5">
                    {l.asset ? `${l.asset.assetCode} - ${l.asset.name}` : `Aset #${l.assetId}`}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                    Periode &amp; Nilai Kontrak
                  </span>
                  <p className="font-bold text-[#0B241E] mt-0.5">
                    Rp {Number(l.totalAnnualAmountIdr).toLocaleString("id-ID")} / thn
                  </p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    {new Date(l.startDate).toLocaleDateString("id-ID")} –{" "}
                    {new Date(l.endDate).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
