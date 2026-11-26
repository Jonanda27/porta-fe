"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Anchor,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { toast } from "@/store/toast.store";
import { TablePagination } from "@/components/ui/table-pagination";
import { formatLabel } from "@/lib/format-labels";
import { BerthItem } from "@/types/port.types";
import { ShipVisitItem } from "@/types/upt.types";
import { UptBerthOccupancyPanel } from "./UptBerthOccupancyPanel";

type VisitStatusFilter = "ALL" | "PENDING_ARRIVAL" | "ACTIVE" | "COMPLETED";

export interface UptVisitsSectionProps {
  visits: ShipVisitItem[];
  activePortBerths: BerthItem[];
  berthOccupationMap: Map<number, ShipVisitItem>;
  occupiedBerthCount: number;
  availableBerthCount: number;
  isLoading: boolean;
  isSubmitting: boolean;
  numericPortId?: number;
  onRecordArrival: (visitId: number, visitNumber: string) => Promise<void>;
  onOpenBerthingModal: (visit: ShipVisitItem) => void;
  onEndBerthing: (visitId: number, berthingId: number) => Promise<void>;
  onRecordDeparture: (visitId: number, visitNumber: string) => Promise<void>;
}

function formatWitDateTime(iso?: string | null) {
  if (!iso) return "-";
  return `${new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jayapura",
  })} WIT`;
}

function getStatusBadgeStyle(status: string) {
  switch (status) {
    case "APPROVED":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "ANCHORED":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "BERTHED":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "DEPARTED":
    case "BILLED":
    case "SETTLED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export function UptVisitsSection({
  visits,
  activePortBerths,
  berthOccupationMap,
  occupiedBerthCount,
  availableBerthCount,
  isLoading,
  isSubmitting,
  numericPortId,
  onRecordArrival,
  onOpenBerthingModal,
  onEndBerthing,
  onRecordDeparture,
}: UptVisitsSectionProps) {
  const [selectedBerthFilter, setSelectedBerthFilter] = useState<number | null>(
    null
  );
  const [visitStatusFilter, setVisitStatusFilter] =
    useState<VisitStatusFilter>("ALL");
  const [visitSearch, setVisitSearch] = useState("");
  const [copiedVisitId, setCopiedVisitId] = useState<number | null>(null);
  const [visitsPage, setVisitsPage] = useState(1);
  const [visitsItemsPerPage, setVisitsItemsPerPage] = useState(10);

  const visitCounts = useMemo(() => {
    let pendingArrival = 0;
    let active = 0;
    let completed = 0;
    for (const v of visits) {
      if (v.status === "APPROVED" || v.status === "ANCHORED") {
        pendingArrival += 1;
      } else if (v.status === "BERTHED") {
        active += 1;
      } else if (
        v.status === "DEPARTED" ||
        v.status === "BILLED" ||
        v.status === "SETTLED"
      ) {
        completed += 1;
      }
    }
    return {
      all: visits.length,
      pendingArrival,
      active,
      completed,
    };
  }, [visits]);

  const filteredVisits = useMemo(() => {
    const q = visitSearch.trim().toLowerCase();
    return visits.filter((v) => {
      if (visitStatusFilter === "PENDING_ARRIVAL") {
        if (v.status !== "APPROVED" && v.status !== "ANCHORED") return false;
      } else if (visitStatusFilter === "ACTIVE") {
        if (v.status !== "BERTHED") return false;
      } else if (visitStatusFilter === "COMPLETED") {
        if (
          v.status !== "DEPARTED" &&
          v.status !== "BILLED" &&
          v.status !== "SETTLED"
        ) {
          return false;
        }
      }

      if (selectedBerthFilter !== null) {
        const berthingList = v.berthingRecords || v.berthings || [];
        const matchesBerth = berthingList.some(
          (b) => b.berthId === selectedBerthFilter
        );
        if (!matchesBerth) return false;
      }

      if (q) {
        const vesselName = (v.vessel?.name || "").toLowerCase();
        const visitNum = (v.visitNumber || "").toLowerCase();
        const origin = (v.originPort || "").toLowerCase();
        const dest = (v.destinationPort || "").toLowerCase();
        if (
          !vesselName.includes(q) &&
          !visitNum.includes(q) &&
          !origin.includes(q) &&
          !dest.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [visits, visitStatusFilter, selectedBerthFilter, visitSearch]);

  useEffect(() => {
    setVisitsPage(1);
  }, [visitStatusFilter, selectedBerthFilter, visitSearch, numericPortId]);

  const totalVisitPages = Math.max(
    1,
    Math.ceil(filteredVisits.length / visitsItemsPerPage)
  );
  const paginatedVisits = useMemo(() => {
    const safePage = Math.min(visitsPage, totalVisitPages);
    const start = (safePage - 1) * visitsItemsPerPage;
    return filteredVisits.slice(start, start + visitsItemsPerPage);
  }, [filteredVisits, visitsPage, totalVisitPages, visitsItemsPerPage]);

  const handleCopyVisitNumber = async (visitId: number, visitNumber: string) => {
    try {
      await navigator.clipboard.writeText(visitNumber);
      setCopiedVisitId(visitId);
      setTimeout(() => {
        setCopiedVisitId((prev) => (prev === visitId ? null : prev));
      }, 1500);
    } catch {
      toast.error("Gagal Menyalin", "Tidak dapat menyalin nomor kunjungan.");
    }
  };

  return (
    <div className="space-y-4">
      <UptBerthOccupancyPanel
        activePortBerths={activePortBerths}
        berthOccupationMap={berthOccupationMap}
        occupiedBerthCount={occupiedBerthCount}
        availableBerthCount={availableBerthCount}
        selectedBerthFilter={selectedBerthFilter}
        onToggleBerthFilter={(id) =>
          setSelectedBerthFilter((prev) => (prev === id ? null : id))
        }
        onClearBerthFilter={() => setSelectedBerthFilter(null)}
      />

      {/* Focused Table Card dengan Filter Status & Pencarian */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC]/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { key: "ALL", label: "Semua", count: visitCounts.all },
                {
                  key: "PENDING_ARRIVAL",
                  label: "Menunggu / Tiba",
                  count: visitCounts.pendingArrival,
                },
                {
                  key: "ACTIVE",
                  label: "Sedang Sandar",
                  count: visitCounts.active,
                },
                {
                  key: "COMPLETED",
                  label: "Selesai",
                  count: visitCounts.completed,
                },
              ] as const
            ).map((item) => {
              const active = visitStatusFilter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setVisitStatusFilter(item.key)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                    active
                      ? "bg-[#0B241E] text-white"
                      : "bg-white border border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]"
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-[#64748B]"
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={visitSearch}
              onChange={(e) => setVisitSearch(e.target.value)}
              placeholder="Cari kapal, rute, no. kunjungan..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-[#CBD5E1] bg-white text-xs text-[#0B241E] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0B241E]"
            />
            {visitSearch && (
              <button
                type="button"
                onClick={() => setVisitSearch("")}
                aria-label="Hapus pencarian"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B] bg-[#F8FAFC]">
                <th className="py-3 px-4">No. Kunjungan</th>
                <th className="py-3 px-4">Kapal &amp; Rute</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Waktu Aktual (WIT)</th>
                <th className="py-3 px-4 text-right">Progres &amp; Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#64748B]">
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Memuat log kunjungan...
                  </td>
                </tr>
              ) : filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#94A3B8]">
                    {visits.length === 0
                      ? "Belum ada data kunjungan kapal."
                      : "Tidak ada kunjungan yang sesuai dengan filter."}
                  </td>
                </tr>
              ) : (
                paginatedVisits.map((v) => {
                  const berthingList = v.berthingRecords || v.berthings || [];
                  const pendingOverride = berthingList.find(
                    (b) => b.approvalStatus === "PENDING" && !b.actualEndAt
                  );
                  const activeBerthing = berthingList.find(
                    (b) =>
                      Boolean(b.actualStartAt) &&
                      !b.actualEndAt &&
                      b.approvalStatus !== "PENDING" &&
                      b.approvalStatus !== "REJECTED"
                  );
                  const primaryBerth =
                    activeBerthing?.berth ||
                    berthingList[0]?.berth ||
                    activePortBerths.find(
                      (b) =>
                        b.id ===
                        (activeBerthing?.berthId || berthingList[0]?.berthId)
                    );

                  const step1Done = Boolean(v.ataAnchorage);
                  const step2Done = Boolean(
                    activeBerthing ||
                      v.status === "BERTHED" ||
                      v.status === "DEPARTED" ||
                      v.status === "BILLED" ||
                      v.status === "SETTLED"
                  );
                  const step3Done = Boolean(
                    (v.status === "BERTHED" && !activeBerthing) || v.atdPort
                  );
                  const step4Done = Boolean(v.atdPort);

                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[#0B241E] text-[11.5px]">
                            {v.visitNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyVisitNumber(v.id, v.visitNumber)
                            }
                            title="Salin No. Kunjungan"
                            className="p-1 rounded-md text-[#94A3B8] hover:text-[#0B241E] hover:bg-slate-100 cursor-pointer"
                          >
                            {copiedVisitId === v.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        {primaryBerth && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-slate-100 text-[#475569] font-mono text-[10px] font-semibold">
                            {primaryBerth.code}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#1E293B]">
                          {v.vessel?.name || `Kapal #${v.vesselId}`}
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          {v.originPort || "-"} → {v.destinationPort || "-"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(
                            v.status
                          )}`}
                        >
                          {formatLabel(v.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-[#475569] font-mono whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-[#94A3B8] w-7">
                            ATA
                          </span>
                          <span>{formatWitDateTime(v.ataAnchorage)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold text-[#94A3B8] w-7">
                            ATD
                          </span>
                          <span>{formatWitDateTime(v.atdPort)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-3">
                          {/* Compact 4-Dot Visual Stepper */}
                          <div
                            className="hidden xl:flex items-center gap-1"
                            title="Alur: 1. Tiba → 2. Sandar → 3. Lepas → 4. Berangkat"
                          >
                            {[
                              {
                                label: "1. Tiba",
                                done: step1Done,
                                active: v.status === "APPROVED",
                              },
                              {
                                label: "2. Sandar",
                                done: step2Done,
                                active: v.status === "ANCHORED",
                              },
                              {
                                label: "3. Lepas",
                                done: step3Done,
                                active: Boolean(activeBerthing),
                              },
                              {
                                label: "4. Berangkat",
                                done: step4Done,
                                active:
                                  v.status === "BERTHED" && !activeBerthing,
                              },
                            ].map((st, idx) => (
                              <React.Fragment key={st.label}>
                                <span
                                  title={st.label}
                                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                    st.done
                                      ? "bg-emerald-500"
                                      : st.active
                                      ? "bg-amber-500 ring-2 ring-amber-200"
                                      : "bg-slate-200"
                                  }`}
                                />
                                {idx < 3 && (
                                  <span
                                    className={`w-3 h-0.5 ${
                                      st.done
                                        ? "bg-emerald-400"
                                        : "bg-slate-200"
                                    }`}
                                  />
                                )}
                              </React.Fragment>
                            ))}
                          </div>

                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            {v.status === "APPROVED" && (
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() =>
                                  onRecordArrival(v.id, v.visitNumber)
                                }
                                className="px-3 py-1.5 rounded-lg bg-[#0B241E] hover:bg-[#13382F] text-white text-[11px] font-bold cursor-pointer transition-colors whitespace-nowrap"
                              >
                                1. Catat Tiba (ATA)
                              </button>
                            )}

                            {v.status === "ANCHORED" &&
                              !activeBerthing &&
                              pendingOverride && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                                  Menunggu Persetujuan Override
                                </span>
                              )}

                            {v.status === "ANCHORED" &&
                              !activeBerthing &&
                              !pendingOverride && (
                                <>
                                  <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => onOpenBerthingModal(v)}
                                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
                                  >
                                    <Anchor className="w-3 h-3" />
                                    2. Mulai Sandar (ATB)
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() =>
                                      onRecordDeparture(v.id, v.visitNumber)
                                    }
                                    title="Gunakan hanya jika kapal langsung bertolak tanpa sandar di dermaga"
                                    className="px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#475569] text-[11px] font-semibold cursor-pointer transition-colors whitespace-nowrap"
                                  >
                                    Tanpa Sandar
                                  </button>
                                </>
                              )}

                            {activeBerthing && (
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() =>
                                  onEndBerthing(v.id, activeBerthing.id)
                                }
                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold cursor-pointer transition-colors whitespace-nowrap"
                              >
                                3. Lepas Sandar
                              </button>
                            )}

                            {v.status === "BERTHED" && !activeBerthing && (
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() =>
                                  onRecordDeparture(v.id, v.visitNumber)
                                }
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer transition-colors whitespace-nowrap"
                              >
                                4. Catat Berangkat (ATD)
                              </button>
                            )}

                            {(v.status === "DEPARTED" ||
                              v.status === "BILLED" ||
                              v.status === "SETTLED") && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10.5px] font-bold whitespace-nowrap">
                                <CheckCircle2 className="w-3 h-3" />
                                Pelayaran Selesai
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          currentPage={Math.min(visitsPage, totalVisitPages)}
          totalPages={totalVisitPages}
          totalItems={filteredVisits.length}
          itemsPerPage={visitsItemsPerPage}
          onPageChange={setVisitsPage}
          onItemsPerPageChange={(items) => {
            setVisitsItemsPerPage(items);
            setVisitsPage(1);
          }}
          itemsPerPageOptions={[10, 25, 50, 100]}
          className="px-4"
        />
      </div>
    </div>
  );
}
