"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useFieldOpsStore } from "@/store/field-ops.store";
import { usePortStore } from "@/store/port.store";

type TabType = "handovers" | "reports";

export default function UptShiftPage() {
  const { user } = useAuthStore();
  const {
    handovers,
    ticketBooks,
    dailyReports,
    visits,
    isLoading,
    isSubmitting,
    error,
    fetchShiftData,
    openHandover,
    closeHandover,
    createDailyReport,
    acknowledgeDailyReport,
    clearError,
  } = useFieldOpsStore();
  const { ports, fetchPorts } = usePortStore();

  const isSuperadmin = user?.role === "SUPERADMIN";
  const canCloseHandover =
    isSuperadmin || user?.role === "ADMIN_PELABUHAN" || user?.role === "BENDAHARA";
  const canAcknowledgeReport =
    isSuperadmin || user?.role === "ADMIN_PELABUHAN";

  const [selectedPortId, setSelectedPortId] = useState<string>("");
  const numericPortId = selectedPortId ? Number(selectedPortId) : undefined;
  const activePortId = numericPortId || user?.portId || ports[0]?.id || 1;

  const [activeTab, setActiveTab] = useState<TabType>("handovers");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Open handover form
  const [bookId, setBookId] = useState<string>("");
  const [wardenName, setWardenName] = useState(user?.fullName || "");

  // Close handover modal
  const [closingId, setClosingId] = useState<number | null>(null);
  const [lastReturnedSerial, setLastReturnedSerial] = useState("");
  const [actualCashSettledIdr, setActualCashSettledIdr] = useState("");

  // Daily report form
  const [reportDate, setReportDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [generalNotes, setGeneralNotes] = useState("");

  useEffect(() => {
    fetchShiftData(numericPortId);
    fetchPorts();
  }, [numericPortId, fetchShiftData, fetchPorts]);

  const handleOpenHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookId) return;
    setFeedback(null);
    clearError();
    await openHandover(
      { bookId: Number(bookId), wardenName: wardenName.trim() },
      numericPortId
    );
    setFeedback("Sif jaga gerbang berhasil dibuka.");
  };

  const handleCloseHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingId) return;
    setFeedback(null);
    clearError();
    await closeHandover(
      closingId,
      {
        lastReturnedSerial: Number(lastReturnedSerial),
        actualCashSettledIdr: Number(actualCashSettledIdr),
      },
      numericPortId
    );
    setFeedback(`Sif #${closingId} berhasil ditutup dan direkonsiliasi.`);
    setClosingId(null);
    setLastReturnedSerial("");
    setActualCashSettledIdr("");
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    clearError();
    const activeItems = visits.slice(0, 10).map((v) => ({
      visitId: v.id,
      vesselNameSnapshot: v.vessel?.name || `Kapal #${v.vesselId}`,
      registrationNumberSnapshot:
        v.vessel?.registrationNumber || v.visitNumber,
      isAdhoc: false,
    }));

    await createDailyReport(
      {
        portId: activePortId,
        reportDate,
        generalNotes: generalNotes.trim() || undefined,
        items: activeItems,
      },
      numericPortId
    );
    setFeedback("Laporan harian sif berhasil dikirim.");
    setGeneralNotes("");
  };

  const handleAcknowledge = async (id: number, reportNumber: string) => {
    setFeedback(null);
    clearError();
    await acknowledgeDailyReport(id, numericPortId);
    setFeedback(`Laporan ${reportNumber} telah disahkan (ACKNOWLEDGED).`);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("handovers")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
              activeTab === "handovers"
                ? "bg-[#0B241E] text-white"
                : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
            }`}
          >
            <Clock className="w-4 h-4 text-[#D97706]" />
            Handover Sif Gerbang ({handovers.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
              activeTab === "reports"
                ? "bg-[#0B241E] text-white"
                : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
            }`}
          >
            <FileText className="w-4 h-4 text-[#D97706]" />
            Laporan Harian Pelabuhan ({dailyReports.length})
          </button>
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
            onClick={() => fetchShiftData(numericPortId)}
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

      {/* Tab 1: Gate Handovers */}
      {activeTab === "handovers" && (
        <div className="space-y-6">
          <form
            onSubmit={handleOpenHandover}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-wrap items-end gap-3 shadow-2xs"
          >
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Buku Karcis
              </label>
              <select
                required
                value={bookId}
                onChange={(e) => setBookId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              >
                <option value="">-- Pilih Buku Karcis --</option>
                {ticketBooks
                  .filter((b) => b.status !== "HABIS")
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bookCode} ({b.ticketCategory})
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Nama Petugas Jaga
              </label>
              <input
                type="text"
                required
                value={wardenName}
                onChange={(e) => setWardenName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#0B241E] text-white text-xs font-bold cursor-pointer"
            >
              Buka Sif Gerbang
            </button>
          </form>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B] bg-[#F8FAFC]">
                  <th className="py-3 px-4">Petugas & Buku</th>
                  <th className="py-3 px-4">Seri Diserahkan</th>
                  <th className="py-3 px-4">Terjual & Setoran</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {handovers.map((h) => (
                  <tr key={h.id}>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0B241E]">{h.wardenName}</div>
                      <div className="text-[11px] font-mono text-[#64748B]">
                        {h.book?.bookCode || `Book #${h.bookId}`}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {h.dispatchedSerialStart} – {h.dispatchedSerialEnd}
                    </td>
                    <td className="py-3 px-4">
                      {h.soldQty !== null && h.soldQty !== undefined
                        ? `${h.soldQty} lbr • Rp ${Number(
                            h.actualCashSettledIdr ?? 0
                          ).toLocaleString("id-ID")}`
                        : "Belum ditutup"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100">
                        {h.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {h.status === "DISTRIBUTED" && canCloseHandover ? (
                        <button
                          type="button"
                          onClick={() => setClosingId(h.id)}
                          className="px-3 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-bold cursor-pointer"
                        >
                          Tutup Sif
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#94A3B8]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {handovers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#94A3B8]">
                      Belum ada serah terima sif gerbang.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Daily Reports */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <form
            onSubmit={handleCreateReport}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-wrap items-end gap-3 shadow-2xs"
          >
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Tanggal Laporan
              </label>
              <input
                type="date"
                required
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>
            <div className="flex-1 min-w-[240px]">
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Catatan Sif / Kondisi Dermaga
              </label>
              <input
                type="text"
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Situasi dermaga dan kapal terkendali"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#0B241E] text-white text-xs font-bold cursor-pointer"
            >
              Kirim Laporan Harian
            </button>
          </form>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B] bg-[#F8FAFC]">
                  <th className="py-3 px-4">No. Laporan</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Catatan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Pengesahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {dailyReports.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                      {r.reportNumber}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(r.reportDate).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-3 px-4 text-[#475569]">
                      {r.generalNotes || "-"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.status === "ACKNOWLEDGED"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {r.status === "SUBMITTED" && canAcknowledgeReport ? (
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleAcknowledge(r.id, r.reportNumber)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold cursor-pointer"
                        >
                          Sahkan (Acknowledge)
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#94A3B8]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {dailyReports.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#94A3B8]">
                      Belum ada laporan harian pelabuhan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Close Handover Modal */}
      {closingId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCloseHandover}
            className="bg-white rounded-2xl border border-[#E2E8F0] w-full max-w-md p-6 space-y-4 shadow-xl"
          >
            <h3 className="text-base font-extrabold text-[#0B241E]">
              Tutup Sif & Rekonsiliasi Kasir
            </h3>
            <input
              type="number"
              required
              min={1}
              value={lastReturnedSerial}
              onChange={(e) => setLastReturnedSerial(e.target.value)}
              placeholder="Nomor Seri Karcis Terakhir Dikembalikan"
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
            />
            <input
              type="number"
              required
              min={0}
              value={actualCashSettledIdr}
              onChange={(e) => setActualCashSettledIdr(e.target.value)}
              placeholder="Total Uang Disetor (Rp)"
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setClosingId(null)}
                className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-[#0B241E] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Tutup Sif
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
