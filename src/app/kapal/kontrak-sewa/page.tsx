"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Search,
  Building2,
  CreditCard,
  Clock,
  XCircle,
  Plus,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";
import { useKapalStore } from "@/store/kapal.store";
import { AssetLease } from "@/types/asset.types";
import { formatLabel } from "@/lib/format-labels";

export default function KapalKontrakSewaPage() {
  const {
    assetLeases,
    isLoading,
    isLeaseSubmitting,
    leaseError,
    fetchAssetLeases,
    requestAssetLease,
    clearLeaseError,
  } = useKapalStore();

  const [renewTarget, setRenewTarget] = useState<AssetLease | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchAssetLeases();
  }, [fetchAssetLeases]);

  const stats = useMemo(() => {
    const total = assetLeases.length;
    const pending = assetLeases.filter(
      (l) =>
        l.status === "REQUESTED" ||
        l.status === "PENDING_ROOM_OFFICER" ||
        l.status === "PENDING_HEAD_OF_PORT"
    ).length;
    const active = assetLeases.filter((l) => l.status === "ACTIVE").length;
    const totalActiveValue = assetLeases
      .filter((l) => l.status === "ACTIVE")
      .reduce((acc, l) => acc + Number(l.totalAnnualAmountIdr || 0), 0);
    return { total, pending, active, totalActiveValue };
  }, [assetLeases]);

  const filteredLeases = useMemo(() => {
    return assetLeases.filter((l) => {
      const matchStatus = !statusFilter || l.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        l.contractNumber.toLowerCase().includes(q) ||
        (l.asset?.name && l.asset.name.toLowerCase().includes(q)) ||
        (l.asset?.assetCode && l.asset.assetCode.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [assetLeases, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredLeases.length / itemsPerPage) || 1;
  const pagedLeases = filteredLeases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openRenewModal = (lease: AssetLease) => {
    const nextStart = new Date(lease.endDate);
    nextStart.setDate(nextStart.getDate() + 1);
    const nextEnd = new Date(nextStart);
    nextEnd.setFullYear(nextEnd.getFullYear() + 1);

    setStartDate(nextStart.toISOString().slice(0, 10));
    setEndDate(nextEnd.toISOString().slice(0, 10));
    clearLeaseError();
    setRenewTarget(lease);
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewTarget) return;
    setFeedback(null);
    try {
      await requestAssetLease({
        assetId: renewTarget.assetId,
        startDate,
        endDate,
      });
      setFeedback(
        `Permohonan perpanjangan sewa untuk ${
          renewTarget.asset?.name || `Aset #${renewTarget.assetId}`
        } berhasil diajukan dan masuk antrean verifikasi Petugas Ruangan.`
      );
      setRenewTarget(null);
    } catch {
      // Error ditangani di store
    }
  };

  const formatRupiah = (amount: number | string) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  const getLeasePaymentInfo = (lease: AssetLease) => {
    const totalDue = Number(lease.totalAnnualAmountIdr || 0);
    const totalPaid = (lease.payments || []).reduce(
      (sum, p) => sum + Number(p.amountIdr || 0),
      0
    );
    const remaining = Math.max(0, totalDue - totalPaid);
    return { totalDue, totalPaid, remaining, isPaidOff: remaining === 0 && totalPaid > 0 };
  };

  return (
    <div className="space-y-6">
      {/* 1. KPI SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            Total Pengajuan & PKS
          </p>
          <p className="text-2xl font-black text-[#0B241E] font-mono mt-1">{stats.total}</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            Proses Verifikasi (2-Tahap)
          </p>
          <p className="text-2xl font-black text-amber-700 font-mono mt-1">{stats.pending}</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            Kontrak PKS Aktif
          </p>
          <p className="text-2xl font-black text-emerald-700 font-mono mt-1">{stats.active}</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            Nilai Kontrak Aktif / Thn
          </p>
          <p className="text-lg font-black text-[#0B241E] font-mono mt-1">
            {formatRupiah(stats.totalActiveValue)}
          </p>
        </div>
      </div>

      {/* 2. HEADER & FILTER BAR */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-extrabold text-[#0B241E]">
          <FileText className="w-4 h-4 text-[#D97706]" />
          <span>Daftar Pengajuan & Kontrak Sewa Ruangan PKS ({filteredLeases.length})</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-full sm:w-52">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari no. PKS, aset..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#CBD5E1] rounded-xl bg-white focus:outline-none focus:border-[#0B241E]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs font-semibold border border-[#CBD5E1] rounded-xl bg-white text-[#334155] focus:outline-none focus:border-[#0B241E] cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="REQUESTED">Tahap 1: Petugas Ruangan</option>
            <option value="PENDING_HEAD_OF_PORT">Tahap 2: Kepala Pelabuhan</option>
            <option value="ACTIVE">Aktif (PKS Terbit)</option>
            <option value="REJECTED">Ditolak</option>
            <option value="EXPIRED">Berakhir</option>
          </select>

          <Link
            href="/kapal/sewa-ruangan"
            className="px-3.5 py-1.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Ajukan Sewa Baru</span>
          </Link>

          <button
            type="button"
            onClick={() => fetchAssetLeases()}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ALERTS */}
      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {leaseError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{leaseError}</span>
        </div>
      )}

      {/* 3. TABLE DAFTAR KONTRAK */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B] bg-[#F8FAFC]">
                <th className="py-3 px-4">No. PKS / Pengajuan</th>
                <th className="py-3 px-4">Ruangan / Aset BMD</th>
                <th className="py-3 px-4">Masa Berlaku</th>
                <th className="py-3 px-4">Nilai & Pelunasan</th>
                <th className="py-3 px-4">Progres 2-Tahap</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-xs">
              {isLoading && assetLeases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#64748B]">
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Memuat daftar pengajuan & kontrak sewa ruangan...
                  </td>
                </tr>
              ) : pagedLeases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center space-y-2">
                    <Building2 className="w-8 h-8 text-[#94A3B8] mx-auto" />
                    <p className="text-xs font-bold text-[#0B241E]">
                      Belum ada pengajuan atau kontrak sewa ruangan.
                    </p>
                    <p className="text-[11px] text-[#64748B]">
                      Silakan pilih ruangan, kantor, gudang, atau kios di Katalog Ruangan & Aset.
                    </p>
                    <Link
                      href="/kapal/sewa-ruangan"
                      className="inline-flex items-center gap-1 mt-1 px-4 py-2 rounded-xl bg-[#0B241E] text-white text-xs font-bold hover:bg-[#143E33]"
                    >
                      <span>Buka Katalog Ruangan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ) : (
                pagedLeases.map((l) => {
                  const payInfo = getLeasePaymentInfo(l);
                  const stage1Done = Boolean(l.verifiedByRoomOfficerAt) || l.status === "PENDING_HEAD_OF_PORT" || l.status === "ACTIVE";
                  const stage2Done = Boolean(l.verifiedByHeadOfPortAt) || l.status === "ACTIVE";

                  return (
                    <tr key={l.id} className="hover:bg-[#F8FAFC]/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#0B241E] block">
                          {l.contractNumber}
                        </span>
                        {l.rejectionReason && (
                          <p className="text-[11px] font-normal text-rose-600 mt-0.5 max-w-xs">
                            Alasan tolak: {l.rejectionReason}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-[#1E293B]">
                          {l.asset?.name || `Aset #${l.assetId}`}
                        </div>
                        <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                            {l.asset?.assetCode}
                          </span>
                          {l.asset?.assetType && (
                            <span>• {formatLabel(l.asset.assetType)}</span>
                          )}
                          {l.asset?.areaSqm && <span>• {Number(l.asset.areaSqm)} m²</span>}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[#475569] whitespace-nowrap">
                        {new Date(l.startDate).toLocaleDateString("id-ID")} –{" "}
                        {new Date(l.endDate).toLocaleDateString("id-ID")}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-[#0B241E]">
                          {formatRupiah(l.totalAnnualAmountIdr)}
                        </div>
                        {l.status === "ACTIVE" && (
                          <div className="mt-0.5 text-[10px] font-semibold">
                            {payInfo.isPaidOff ? (
                              <span className="text-emerald-700">✓ Lunas Kasda (e-SSRD)</span>
                            ) : (
                              <span className="text-amber-700">
                                Sisa tagihan: {formatRupiah(payInfo.remaining)}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1 text-[10px]">
                          <div className="flex items-center gap-1">
                            {stage1Done ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            ) : l.status === "REJECTED" ? (
                              <XCircle className="w-3 h-3 text-rose-500 shrink-0" />
                            ) : (
                              <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                            )}
                            <span className={stage1Done ? "text-emerald-800 font-semibold" : "text-[#64748B]"}>
                              1. Petugas Ruangan
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {stage2Done ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            ) : l.status === "REJECTED" ? (
                              <XCircle className="w-3 h-3 text-rose-500 shrink-0" />
                            ) : (
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            )}
                            <span className={stage2Done ? "text-emerald-800 font-semibold" : "text-[#64748B]"}>
                              2. Kepala Pelabuhan
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-block whitespace-nowrap ${
                            l.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : l.status === "REQUESTED" ||
                                l.status === "PENDING_ROOM_OFFICER" ||
                                l.status === "PENDING_HEAD_OF_PORT"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : l.status === "REJECTED"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {formatLabel(l.status)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {l.status === "ACTIVE" && !payInfo.isPaidOff && (
                            <Link
                              href="/kapal/penagihan"
                              className="px-2.5 py-1.5 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Bayar e-SKRD</span>
                            </Link>
                          )}

                          {l.status === "ACTIVE" && payInfo.isPaidOff && (
                            <Link
                              href="/kapal/penagihan"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                            >
                              <span>Lihat e-SSRD</span>
                            </Link>
                          )}

                          {l.status === "ACTIVE" && (
                            <button
                              type="button"
                              onClick={() => openRenewModal(l)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#0B241E] hover:bg-[#143E33] text-white text-[11px] font-bold cursor-pointer transition-colors"
                            >
                              Perpanjang
                            </button>
                          )}

                          {l.status === "REJECTED" && (
                            <Link
                              href="/kapal/sewa-ruangan"
                              className="px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0B241E] text-[11px] font-bold"
                            >
                              Ajukan Ulang
                            </Link>
                          )}

                          {l.status !== "ACTIVE" && l.status !== "REJECTED" && (
                            <span className="text-[11px] text-[#94A3B8]">Menunggu UPT</span>
                          )}
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
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredLeases.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* 4. MODAL PERPANJANGAN KONTRAK */}
      {renewTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleRenewSubmit}
            className="bg-white rounded-2xl border border-[#E2E8F0] w-full max-w-xl p-6 space-y-5 shadow-2xl"
          >
            <div>
              <h3 className="text-base font-extrabold text-[#0B241E]">
                Perpanjangan Kontrak Ruangan: {renewTarget.asset?.name}
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Tentukan rentang periode perpanjangan sewa fasilitas pelabuhan (PKS sebelumnya:{" "}
                <span className="font-mono font-bold">{renewTarget.contractNumber}</span>).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Mulai Periode Baru
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Akhir Periode Baru
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    required
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
                  />
                </div>
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
                disabled={isLeaseSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isLeaseSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Kirim Perpanjangan</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
