"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Send,
  RotateCcw,
  ShieldAlert,
  FileCheck2,
  X,
  Eye,
  Paperclip,
  ExternalLink,
  Ship,
  Calendar,
} from "lucide-react";
import { getUploadedFileUrl } from "@/config/api.config";
import { useAuthStore } from "@/store/auth.store";
import { CheckerService } from "@/services/checker.service";
import {
  CheckerDailyReportItem,
  DailyObligationRecapResponse,
} from "@/types/checker.types";
import { StatusDot } from "@/components/ui/status-indicator";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { formatLabel } from "@/lib/format-labels";

export default function CheckerLaporanPage() {
  const { user } = useAuthStore();
  const canAccess =
    user?.role === "ADMIN_PELABUHAN" ||
    user?.role === "KEPALA_PELABUHAN" ||
    user?.role === "SUPERADMIN";
  const isAdminChecker = user?.role === "ADMIN_PELABUHAN";
  const isKepalaPelabuhan = user?.role === "KEPALA_PELABUHAN";

  const [activeTab, setActiveTab] = useState<"obligations" | "reports">("obligations");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const [recap, setRecap] = useState<DailyObligationRecapResponse | null>(null);
  const [reports, setReports] = useState<CheckerDailyReportItem[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedReport, setSelectedReport] = useState<CheckerDailyReportItem | null>(null);
  const [returnReportTarget, setReturnReportTarget] = useState<CheckerDailyReportItem | null>(null);
  const [verifyNotes, setVerifyNotes] = useState("");

  const fetchData = useCallback(async () => {
    if (!canAccess) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [recapRes, reportsRes] = await Promise.all([
        CheckerService.getDailyObligationRecap(selectedDate || undefined),
        CheckerService.getDailyReports(),
      ]);
      setRecap(recapRes);
      setReports(reportsRes);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal memuat rekap laporan harian.");
    } finally {
      setIsLoading(false);
    }
  }, [canAccess, selectedDate]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const filteredOfficers = useMemo(() => {
    const list = recap?.officers || [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (item) =>
        item.officer.fullName.toLowerCase().includes(q) ||
        item.officer.email.toLowerCase().includes(q)
    );
  }, [recap, searchQuery]);

  const filteredReports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter(
      (r) =>
        (r.reportNumber ?? `LAP-${r.id}`).toLowerCase().includes(q) ||
        (r.officer?.fullName && r.officer.fullName.toLowerCase().includes(q)) ||
        (r.shiftName ?? "").toLowerCase().includes(q) ||
        (r.generalNotes ?? "").toLowerCase().includes(q)
    );
  }, [reports, searchQuery]);

  const handleAdminCheckReport = async (
    report: CheckerDailyReportItem,
    decision: "APPROVED" | "RETURNED",
    notes?: string
  ) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      await CheckerService.adminCheckDailyReport(report.id, decision, notes);
      setFeedback(
        decision === "APPROVED"
          ? `Laporan ${report.reportNumber ?? `#${report.id}`} telah dicek Admin dan diserahkan ke Kepala Pelabuhan.`
          : `Laporan ${report.reportNumber ?? `#${report.id}`} dikembalikan ke petugas untuk dilengkapi.`
      );
      setReturnReportTarget(null);
      await fetchData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal memproses pemeriksaan laporan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHeadVerifyReport = async (
    report: CheckerDailyReportItem,
    decision: "APPROVED" | "RETURNED",
    notes?: string
  ) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      await CheckerService.headVerifyDailyReport(report.id, decision, notes);
      setFeedback(
        decision === "APPROVED"
          ? `Laporan ${report.reportNumber ?? `#${report.id}`} telah diverifikasi Kepala Pelabuhan.`
          : `Laporan ${report.reportNumber ?? `#${report.id}`} dikembalikan oleh Kepala Pelabuhan.`
      );
      setReturnReportTarget(null);
      await fetchData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal memverifikasi laporan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canAccess) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h2 className="text-sm font-semibold text-slate-900">Akses Terbatas</h2>
        <p className="text-xs text-slate-500 mt-1">
          Halaman Rekap Laporan Harian hanya tersedia untuk Admin Pelabuhan dan Kepala Pelabuhan.
        </p>
      </div>
    );
  }

  const submittedReportsCount = reports.filter((r) => r.status === "SUBMITTED").length;
  const adminCheckedCount = reports.filter((r) => r.status === "ADMIN_CHECKED").length;
  const unsubmittedOfficersCount = (recap?.officers || []).filter(
    (o) => o.metrics.unsubmitted > 0
  ).length;

  return (
    <div className="space-y-4">
      {/* Flat Summary Strip */}
      <div className="bg-white border border-slate-200 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        <div className="px-4 py-3">
          <span className="text-[11px] font-medium text-slate-500">Total Petugas Aktif</span>
          <p className="text-lg font-bold text-slate-900 mt-0.5">
            {recap?.officers.length ?? 0}
          </p>
        </div>
        <div className="px-4 py-3">
          <span className="text-[11px] font-medium text-slate-500">Petugas Belum Selesai</span>
          <p className="text-lg font-bold text-amber-600 mt-0.5">
            {unsubmittedOfficersCount}
          </p>
        </div>
        <div className="px-4 py-3">
          <span className="text-[11px] font-medium text-slate-500">Laporan Menunggu Cek</span>
          <p className="text-lg font-bold text-slate-900 mt-0.5">
            {submittedReportsCount}
          </p>
        </div>
        <div className="px-4 py-3">
          <span className="text-[11px] font-medium text-slate-500">Diserahkan ke Kepala</span>
          <p className="text-lg font-bold text-emerald-700 mt-0.5">
            {adminCheckedCount}
          </p>
        </div>
      </div>

      {/* Domain Breakdown Summary */}
      {recap?.domainBreakdown && recap.domainBreakdown.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Ringkasan Progres Per Bidang Tugas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recap.domainBreakdown
              .filter((d) => d.total > 0)
              .map((d) => (
                <div
                  key={d.domainCode}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-800">
                      {d.domainLabel}
                    </span>
                    <span className="text-xs font-bold text-[#0F2A1D]">
                      {d.headVerified}/{d.total}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                    <span>Dikirim: {d.submitted}</span>
                    <span>• Proses: {d.inProgress}</span>
                    {d.returned > 0 && (
                      <span className="text-amber-700 font-medium">
                        • Retur: {d.returned}
                      </span>
                    )}
                    {d.overdue > 0 && (
                      <span className="text-rose-700 font-medium">
                        • Overdue: {d.overdue}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {feedback && (
        <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button type="button" onClick={() => setFeedback(null)} className="cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Unified Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 sm:px-5 pt-3 border-b border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-1 flex-wrap">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama petugas atau no. laporan..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#0B241E]"
                />
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              />
            </div>

            <button
              type="button"
              onClick={() => void fetchData()}
              title="Muat Ulang"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer self-end sm:self-auto"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto -mb-px">
            <button
              type="button"
              onClick={() => setActiveTab("obligations")}
              className={`px-3.5 py-2.5 text-xs whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                activeTab === "obligations"
                  ? "border-[#0B241E] text-slate-900 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-800 font-medium"
              }`}
            >
              Kepatuhan Harian Petugas ({filteredOfficers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reports")}
              className={`px-3.5 py-2.5 text-xs whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                activeTab === "reports"
                  ? "border-[#0B241E] text-slate-900 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-800 font-medium"
              }`}
            >
              Laporan Sif Harian ({filteredReports.length})
            </button>
          </div>
        </div>

        {activeTab === "obligations" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                  <th className="py-3 px-5">Petugas</th>
                  <th className="py-3 px-4">Kewajiban Tugas</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Sudah Diserahkan</th>
                  <th className="py-3 px-4 hidden md:table-cell">Belum / Terlambat</th>
                  <th className="py-3 px-4">Status Harian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredOfficers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <FileCheck2 className="w-7 h-7 mx-auto mb-2 text-slate-300" />
                      <p className="font-medium">Belum ada data kepatuhan petugas.</p>
                    </td>
                  </tr>
                ) : (
                  filteredOfficers.map((item) => (
                    <tr key={item.officer.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900">
                          {item.officer.fullName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {item.officer.email}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {item.metrics.totalObligated} tugas
                      </td>
                      <td className="py-3.5 px-4 hidden sm:table-cell text-slate-700">
                        {item.metrics.submitted} diserahkan • {item.metrics.adminChecked} dicek
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <span className={item.metrics.unsubmitted > 0 ? "text-amber-700 font-medium" : "text-slate-500"}>
                          {item.metrics.unsubmitted} belum
                        </span>
                        {item.metrics.overdue > 0 && (
                          <span className="ml-2 text-rose-600 font-semibold">
                            • {item.metrics.overdue} terlambat
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusDot status={item.overallObligationStatus} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                  <th className="py-3 px-5">No. Laporan & Tanggal</th>
                  <th className="py-3 px-4">Petugas Pengirim</th>
                  <th className="py-3 px-4 hidden md:table-cell">Catatan Sif</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <FileCheck2 className="w-7 h-7 mx-auto mb-2 text-slate-300" />
                      <p className="font-medium">Belum ada laporan harian masuk.</p>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((rep) => {
                    const effectiveStatus = rep.reviewStatus || rep.status;
                    const canCheck = isAdminChecker && effectiveStatus === "WAITING_ADMIN";
                    const canHeadVerify =
                      isKepalaPelabuhan &&
                      (effectiveStatus === "WAITING_HEAD_VERIFICATION" ||
                        effectiveStatus === "ADMIN_CHECKED");
                    return (
                      <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-mono font-semibold text-slate-900">
                            {rep.reportNumber ?? `LAP-${rep.id}`}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {new Date(rep.reportDate).toLocaleDateString("id-ID")}
                            {rep.shiftName ? ` • ${rep.shiftName}` : ""}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">
                            {rep.officer?.fullName || "-"}
                          </div>
                          {rep.officer?.role && (
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {formatLabel(rep.officer.role)}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 hidden md:table-cell text-slate-600 max-w-xs truncate">
                          {rep.generalNotes || rep.summaryNotes || "-"}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusDot status={effectiveStatus} />
                        </td>
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReport(rep);
                                setVerifyNotes("");
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-[11px] font-semibold cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Detail
                            </button>
                            {(canCheck || canHeadVerify) && (
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => {
                                  if (canHeadVerify) {
                                    void handleHeadVerifyReport(
                                      rep,
                                      "APPROVED",
                                      "Laporan harian telah diverifikasi dan diterima Kepala Pelabuhan."
                                    );
                                  } else {
                                    void handleAdminCheckReport(
                                      rep,
                                      "APPROVED",
                                      "Kelengkapan laporan harian telah diperiksa Admin dan diserahkan ke Kepala Pelabuhan."
                                    );
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0F2A1D] text-white hover:bg-emerald-900 text-[11px] font-semibold cursor-pointer"
                              >
                                {canHeadVerify ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    Verifikasi
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-3.5 h-3.5 text-amber-400" />
                                    Teruskan
                                  </>
                                )}
                              </button>
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
        )}
      </div>

      {/* Detail Laporan Harian Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    {selectedReport.reportNumber ?? `LAP-${selectedReport.id}`}
                  </span>
                  <StatusDot status={selectedReport.reviewStatus || selectedReport.status} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  Laporan Sif Harian — {selectedReport.officer?.fullName || "Petugas"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(selectedReport.reportDate).toLocaleDateString("id-ID")}</span>
                  {selectedReport.officer?.role && (
                    <span>• {formatLabel(selectedReport.officer.role)}</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ringkasan / Catatan Sif */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                Catatan &amp; Ringkasan Operasional Sif
              </span>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                {selectedReport.generalNotes || selectedReport.summaryNotes || "Tidak ada catatan."}
              </p>
            </div>

            {/* Daftar Kapal & Bukti Foto dalam Laporan */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Ship className="w-4 h-4 text-slate-500" />
                Daftar Kapal &amp; Bukti Lapangan ({selectedReport.items?.length ?? 0})
              </span>
              {selectedReport.items && selectedReport.items.length > 0 ? (
                <div className="space-y-2">
                  {selectedReport.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 p-3 text-xs flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">
                          {item.vesselNameSnapshot}{" "}
                          <span className="font-mono text-[11px] text-slate-500">
                            ({item.registrationNumberSnapshot})
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-slate-600 mt-0.5">{item.notes}</p>
                        )}
                      </div>
                      {item.evidencePhoto && (
                        <a
                          href={getUploadedFileUrl(item.evidencePhoto)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 shrink-0"
                        >
                          <Paperclip className="w-3 h-3" />
                          Lihat Bukti
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                  Tidak ada lampiran kapal/foto spesifik pada laporan ini.
                </div>
              )}
            </div>

            {/* Domain Snapshot jika ada */}
            {Array.isArray(selectedReport.domainSummaryJson) &&
              selectedReport.domainSummaryJson.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-700 block">
                    Snapshot Kinerja Per Bidang Saat Laporan Dikirim
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedReport.domainSummaryJson.map((d) => (
                      <div
                        key={d.domainCode}
                        className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-800">{d.domainLabel}</span>
                        <span className="font-mono font-bold text-[#0F2A1D]">
                          {d.headVerified}/{d.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Riwayat Catatan Checker & Kepala */}
            {(selectedReport.adminNotes || selectedReport.adminCheckNotes || selectedReport.headNotes) && (
              <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                {(selectedReport.adminNotes || selectedReport.adminCheckNotes) && (
                  <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-blue-900">
                    <span className="font-semibold block">Catatan Admin Checker:</span>
                    <p className="mt-0.5">{selectedReport.adminNotes || selectedReport.adminCheckNotes}</p>
                  </div>
                )}
                {selectedReport.headNotes && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-900">
                    <span className="font-semibold block">Catatan Kepala Pelabuhan:</span>
                    <p className="mt-0.5">{selectedReport.headNotes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Input catatan & tombol aksi untuk Admin / Kepala */}
            {(() => {
              const st = selectedReport.reviewStatus || selectedReport.status;
              const modalCanAdmin = isAdminChecker && st === "WAITING_ADMIN";
              const modalCanHead =
                isKepalaPelabuhan &&
                (st === "WAITING_HEAD_VERIFICATION" || st === "ADMIN_CHECKED");

              return (
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  {(modalCanAdmin || modalCanHead) && (
                    <textarea
                      rows={2}
                      value={verifyNotes}
                      onChange={(e) => setVerifyNotes(e.target.value)}
                      placeholder={
                        modalCanHead
                          ? "Catatan verifikasi Kepala Pelabuhan (opsional)..."
                          : "Catatan pemeriksaan Admin Checker (opsional)..."
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-[#0F2A1D]"
                    />
                  )}
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedReport(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Tutup
                    </button>
                    {(modalCanAdmin || modalCanHead) && (
                      <>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => {
                            setReturnReportTarget(selectedReport);
                            setSelectedReport(null);
                          }}
                          className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                        >
                          Kembalikan Revisi
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => {
                            if (modalCanHead) {
                              void handleHeadVerifyReport(
                                selectedReport,
                                "APPROVED",
                                verifyNotes.trim() ||
                                  "Laporan harian telah diverifikasi dan diterima Kepala Pelabuhan."
                              ).then(() => setSelectedReport(null));
                            } else {
                              void handleAdminCheckReport(
                                selectedReport,
                                "APPROVED",
                                verifyNotes.trim() ||
                                  "Kelengkapan laporan harian telah diperiksa Admin dan diserahkan ke Kepala Pelabuhan."
                              ).then(() => setSelectedReport(null));
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F2A1D] hover:bg-emerald-900 text-white text-xs font-semibold cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>
                            {modalCanHead
                              ? "Verifikasi Kepala Pelabuhan"
                              : "Loloskan & Teruskan ke Kepala"}
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <ConfirmActionModal
        isOpen={Boolean(returnReportTarget)}
        title={`Kembalikan Laporan "${returnReportTarget?.reportNumber ?? ""}"?`}
        description="Laporan sif harian akan dikembalikan ke petugas agar data atau lampiran yang kurang dapat diperbaiki."
        confirmLabel="Kembalikan Laporan"
        variant="warning"
        requireReason
        reasonLabel="Catatan Kekurangan Laporan"
        reasonPlaceholder="Tuliskan bagian laporan yang perlu dilengkapi petugas..."
        isLoading={isSubmitting}
        onConfirm={(reason) => {
          if (!returnReportTarget) return;
          if (isKepalaPelabuhan) {
            void handleHeadVerifyReport(returnReportTarget, "RETURNED", reason);
          } else {
            void handleAdminCheckReport(returnReportTarget, "RETURNED", reason);
          }
        }}
        onCancel={() => setReturnReportTarget(null)}
      />
    </div>
  );
}
