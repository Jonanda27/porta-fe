"use client";

import React, { useEffect, useState } from "react";
import {
  CalendarCheck2,
  AlertTriangle,
  Store,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Search,
} from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";
import { useAuthStore } from "@/store/auth.store";
import { useUptStore } from "@/store/upt.store";
import { usePortStore } from "@/store/port.store";
import { formatLabel } from "@/lib/format-labels";

type TabType = "visits" | "overrides" | "leases";

export default function AlokasiPage() {
  const { user } = useAuthStore();
  const {
    visits,
    pendingOverrides,
    leases,
    isLoading,
    isSubmitting,
    error,
    fetchAllocationData,
    approveVisit,
    decideOverride,
    approveLease,
    rejectLease,
    clearError,
  } = useUptStore();
  const { ports, fetchPorts } = usePortStore();

  const isMultiPortAdmin = user?.role === "ADMIN_PELABUHAN" && !user?.portId;
  const canAccess = user?.role === "ADMIN_PELABUHAN";

  const [selectedPortId, setSelectedPortId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>("visits");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [rejectLeaseTarget, setRejectLeaseTarget] = useState<{
    id: number;
    contractNumber: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const numericPortId = selectedPortId ? Number(selectedPortId) : undefined;

  useEffect(() => {
    if (canAccess) {
      fetchAllocationData(numericPortId);
      if (isMultiPortAdmin) fetchPorts();
    }
  }, [canAccess, isMultiPortAdmin, numericPortId, fetchAllocationData, fetchPorts]);

  if (!canAccess) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center">
        <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <h2 className="text-base font-bold text-[#0B241E]">Akses Terbatas</h2>
        <p className="text-xs text-[#64748B] mt-1">
          Persetujuan sandar dan sewa aset dikelola oleh Admin Pelabuhan.
        </p>
      </div>
    );
  }

  const requestedVisits = visits.filter((v) => v.status === "REQUESTED");
  const requestedLeases = leases.filter((l) => l.status === "REQUESTED");

  const filteredVisits = visits.filter((v) => {
    const matchStatus = !statusFilter || v.status === statusFilter;
    const matchSearch =
      !searchQuery ||
      v.visitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.vessel?.name && v.vessel.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.vessel?.registrationNumber &&
        v.vessel.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const filteredOverrides = pendingOverrides.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (o.berth?.name && o.berth.name.toLowerCase().includes(q)) ||
      (o.berth?.code && o.berth.code.toLowerCase().includes(q)) ||
      (o.overrideReason && o.overrideReason.toLowerCase().includes(q))
    );
  });

  const filteredLeases = leases.filter((l) => {
    const matchStatus = !statusFilter || l.status === statusFilter;
    const matchSearch =
      !searchQuery ||
      l.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.tenantName && l.tenantName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.asset?.name && l.asset.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const currentListLength =
    activeTab === "visits"
      ? filteredVisits.length
      : activeTab === "overrides"
      ? filteredOverrides.length
      : filteredLeases.length;

  const totalPages = Math.ceil(currentListLength / itemsPerPage) || 1;
  const pagedVisits = filteredVisits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const pagedOverrides = filteredOverrides.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const pagedLeases = filteredLeases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleApproveVisit = async (visitId: number, visitNumber: string) => {
    setFeedback(null);
    clearError();
    await approveVisit(visitId, numericPortId);
    setFeedback(`Kunjungan ${visitNumber} berhasil disetujui (APPROVED).`);
  };

  const handleDecideOverride = async (
    visitId: number,
    berthingId: number,
    decision: "APPROVED" | "REJECTED"
  ) => {
    setFeedback(null);
    clearError();
    await decideOverride(
      visitId,
      berthingId,
      {
        decision,
        approvalNotes:
          decision === "APPROVED"
            ? "Disetujui oleh Admin Pelabuhan"
            : "Ditolak oleh Admin Pelabuhan",
      },
      numericPortId
    );
    setFeedback(`Override sandar #${berthingId} berhasil diputuskan: ${decision}.`);
  };

  const handleApproveLease = async (leaseId: number, contractNumber: string) => {
    setFeedback(null);
    clearError();
    await approveLease(leaseId, numericPortId);
    setFeedback(`Pengajuan sewa ${contractNumber} disetujui dan diaktifkan.`);
  };

  const handleConfirmRejectLease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectLeaseTarget) return;
    setFeedback(null);
    clearError();
    await rejectLease(rejectLeaseTarget.id, rejectReason.trim(), numericPortId);
    setFeedback(`Pengajuan sewa ${rejectLeaseTarget.contractNumber} telah ditolak.`);
    setRejectLeaseTarget(null);
    setRejectReason("");
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("visits")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
              activeTab === "visits"
                ? "bg-[#0B241E] text-white"
                : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
            }`}
          >
            <CalendarCheck2 className="w-4 h-4 text-[#D97706]" />
            Permohonan Kunjungan
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800">
              {requestedVisits.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("overrides")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
              activeTab === "overrides"
                ? "bg-[#0B241E] text-white"
                : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
            Override Dermaga
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800">
              {pendingOverrides.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("leases")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
              activeTab === "leases"
                ? "bg-[#0B241E] text-white"
                : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
            }`}
          >
            <Store className="w-4 h-4 text-[#D97706]" />
            Pengajuan Sewa Aset
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800">
              {requestedLeases.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isMultiPortAdmin && (
            <select
              value={selectedPortId}
              onChange={(e) => {
                setSelectedPortId(e.target.value);
                setCurrentPage(1);
              }}
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

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari kunjungan, kapal, tenant..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs focus:outline-none focus:ring-1 focus:ring-[#133D31]"
            />
          </div>

          <button
            type="button"
            onClick={() => fetchAllocationData(numericPortId)}
            disabled={isLoading}
            className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 flex items-center justify-center gap-2 text-xs text-[#64748B]">
          <Loader2 className="w-4 h-4 animate-spin" />
          Memuat antrean persetujuan...
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
          {activeTab === "visits" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] bg-[#F8FAFC]">
                    <th className="py-3 px-4">No. Kunjungan</th>
                    <th className="py-3 px-4">Kapal & Operator</th>
                    <th className="py-3 px-4">Rute</th>
                    <th className="py-3 px-4">ETA / ETD</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {pagedVisits.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-[#94A3B8]">
                        Belum ada data kunjungan kapal yang sesuai.
                      </td>
                    </tr>
                  ) : (
                    pagedVisits.map((v) => (
                      <tr key={v.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                          {v.visitNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#1E293B]">
                            {v.vessel?.name || `Kapal #${v.vesselId}`}
                          </div>
                          <div className="text-[11px] text-[#64748B]">
                            {v.operator?.name || `Operator #${v.operatorId}`}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#475569]">
                          {v.originPort || "-"} → {v.destinationPort || "-"}
                        </td>
                        <td className="py-3 px-4 text-[11px] text-[#475569]">
                          <div>ETA: {new Date(v.eta).toLocaleString("id-ID")}</div>
                          <div>ETD: {new Date(v.etd).toLocaleString("id-ID")}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                              v.status === "REQUESTED"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {formatLabel(v.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {v.status === "REQUESTED" ? (
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleApproveVisit(v.id, v.visitNumber)}
                              className="px-3 py-1.5 rounded-lg bg-[#0B241E] hover:bg-[#143E33] text-white text-[11px] font-bold cursor-pointer"
                            >
                              Setujui Kunjungan
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#94A3B8]">Diproses</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "overrides" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] bg-[#F8FAFC]">
                    <th className="py-3 px-4">Kunjungan & Kapal</th>
                    <th className="py-3 px-4">Dermaga</th>
                    <th className="py-3 px-4">Hasil Validasi</th>
                    <th className="py-3 px-4">Alasan Override</th>
                    <th className="py-3 px-4 text-right">Keputusan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {pagedOverrides.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-[#94A3B8]">
                        Tidak ada permohonan override dermaga yang menunggu persetujuan.
                      </td>
                    </tr>
                  ) : (
                    pagedOverrides.map((b) => (
                      <tr key={b.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-[#0B241E]">
                            {b.visit?.visitNumber || `Visit #${b.visitId}`}
                          </div>
                          <div className="text-[11px] text-[#64748B]">
                            {b.visit?.vessel?.name || "-"}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#334155]">
                          {b.berth ? `${b.berth.code} - ${b.berth.name}` : `Berth #${b.berthId}`}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            {formatLabel(b.validationResult)} ({formatLabel(b.compatibilityStatus)})
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#475569] max-w-xs">
                          {b.overrideReason || "-"}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleDecideOverride(b.visitId, b.id, "APPROVED")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                          >
                            Setujui
                          </button>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleDecideOverride(b.visitId, b.id, "REJECTED")}
                            className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold cursor-pointer"
                          >
                            Tolak
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "leases" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] bg-[#F8FAFC]">
                    <th className="py-3 px-4">No. Kontrak</th>
                    <th className="py-3 px-4">Tenant / Penyewa</th>
                    <th className="py-3 px-4">Aset Pelabuhan</th>
                    <th className="py-3 px-4">Periode & Nilai</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {pagedLeases.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-[#94A3B8]">
                        Belum ada data pengajuan atau kontrak sewa aset.
                      </td>
                    </tr>
                  ) : (
                    pagedLeases.map((l) => (
                      <tr key={l.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                          {l.contractNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#1E293B]">{l.tenantName}</div>
                          <div className="text-[11px] text-[#64748B]">
                            {l.tenantPhone || "-"}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#475569]">
                          {l.asset ? `${l.asset.assetCode} - ${l.asset.name}` : `Aset #${l.assetId}`}
                        </td>
                        <td className="py-3 px-4 text-[11px]">
                          <div className="font-bold text-[#0B241E]">
                            Rp {Number(l.totalAnnualAmountIdr).toLocaleString("id-ID")} / thn
                          </div>
                          <div className="text-[#64748B]">
                            {new Date(l.startDate).toLocaleDateString("id-ID")} –{" "}
                            {new Date(l.endDate).toLocaleDateString("id-ID")}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                              l.status === "REQUESTED"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : l.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {formatLabel(l.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {l.status === "REQUESTED" ? (
                            <>
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handleApproveLease(l.id, l.contractNumber)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                              >
                                Setujui
                              </button>
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() =>
                                  setRejectLeaseTarget({
                                    id: l.id,
                                    contractNumber: l.contractNumber,
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <XCircle className="w-3 h-3" />
                                Tolak
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-[#94A3B8]">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={currentListLength}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}

      {/* Reject Lease Modal */}
      {rejectLeaseTarget && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmRejectLease}
            className="bg-white rounded-3xl border border-[#E2E8F0] w-full max-w-xl p-6 sm:p-8 space-y-5 shadow-2xl"
          >
            <h3 className="text-base font-extrabold text-[#0B241E]">
              Tolak Pengajuan Sewa {rejectLeaseTarget.contractNumber}
            </h3>
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Alasan Penolakan
              </label>
              <textarea
                required
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Misal: Aset sedang dijadwalkan untuk pemeliharaan"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectLeaseTarget(null)}
                className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Tolak Pengajuan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
