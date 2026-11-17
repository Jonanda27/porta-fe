"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Search,
} from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";
import { useTenantStore } from "@/store/tenant.store";
import { TenantLeaseItem } from "@/types/tenant.types";
import { formatLabel } from "@/lib/format-labels";

export default function TenantKontrakPage() {
  const {
    leases,
    isLoading,
    isSubmitting,
    error,
    fetchTenantData,
    requestLease,
    clearError,
  } = useTenantStore();

  const [renewTarget, setRenewTarget] = useState<TenantLeaseItem | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchTenantData();
  }, [fetchTenantData]);

  const filteredLeases = leases.filter((l) => {
    const matchStatus = !statusFilter || l.status === statusFilter;
    const matchSearch =
      !searchQuery ||
      l.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.asset?.name && l.asset.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.asset?.assetCode && l.asset.assetCode.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filteredLeases.length / itemsPerPage) || 1;
  const pagedLeases = filteredLeases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openRenewModal = (lease: TenantLeaseItem) => {
    const nextStart = new Date(lease.endDate);
    nextStart.setDate(nextStart.getDate() + 1);
    const nextEnd = new Date(nextStart);
    nextEnd.setFullYear(nextEnd.getFullYear() + 1);

    setStartDate(nextStart.toISOString().slice(0, 10));
    setEndDate(nextEnd.toISOString().slice(0, 10));
    clearError();
    setRenewTarget(lease);
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewTarget) return;
    setFeedback(null);
    await requestLease({
      assetId: renewTarget.assetId,
      startDate,
      endDate,
    });
    setFeedback(
      `Permohonan perpanjangan sewa untuk ${
        renewTarget.asset?.name || `Aset #${renewTarget.assetId}`
      } berhasil diajukan.`
    );
    setRenewTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0B241E]">
          <FileText className="w-4 h-4 text-[#D97706]" />
          Daftar Pengajuan & Kontrak PKS ({filteredLeases.length})
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari no. kontrak, aset..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#CBD5E1] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#133D31]"
            />
          </div>

          <button
            type="button"
            onClick={() => fetchTenantData()}
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

      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B] bg-[#F8FAFC]">
                <th className="py-3 px-4">No. Kontrak</th>
                <th className="py-3 px-4">Fasilitas / Aset</th>
                <th className="py-3 px-4">Masa Berlaku</th>
                <th className="py-3 px-4">Nilai Tahunan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#64748B]">
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Memuat kontrak PKS...
                  </td>
                </tr>
              ) : pagedLeases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#94A3B8]">
                    Belum ada pengajuan atau kontrak sewa yang sesuai.
                  </td>
                </tr>
              ) : (
                pagedLeases.map((l) => (
                  <tr key={l.id}>
                    <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                      {l.contractNumber}
                      {l.rejectionReason && (
                        <p className="text-[11px] font-sans font-normal text-rose-600 mt-0.5">
                          Alasan: {l.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#1E293B]">
                        {l.asset?.name || `Aset #${l.assetId}`}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        {l.asset?.assetCode}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#475569]">
                      {new Date(l.startDate).toLocaleDateString("id-ID")} –{" "}
                      {new Date(l.endDate).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#0B241E]">
                      Rp {Number(l.totalAnnualAmountIdr).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          l.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : l.status === "REQUESTED"
                            ? "bg-amber-50 text-amber-800"
                            : l.status === "REJECTED"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {formatLabel(l.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {l.status === "ACTIVE" ? (
                        <button
                          type="button"
                          onClick={() => openRenewModal(l)}
                          className="px-2.5 py-1 rounded-lg bg-[#0B241E] hover:bg-[#143E33] text-white text-[11px] font-bold cursor-pointer"
                        >
                          Ajukan Perpanjangan
                        </button>
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

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredLeases.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {renewTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleRenewSubmit}
            className="bg-white rounded-2xl border border-[#E2E8F0] w-full max-w-xl p-6 space-y-5 shadow-2xl"
          >
            <div>
              <h3 className="text-base font-extrabold text-[#0B241E]">
                Perpanjangan Kontrak: {renewTarget.asset?.name}
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Tentukan rentang periode perpanjangan sewa fasilitas pelabuhan.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Mulai Periode Baru
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Akhir Periode Baru
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-2 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setRenewTarget(null)}
                className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#0B241E] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Kirim Perpanjangan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
