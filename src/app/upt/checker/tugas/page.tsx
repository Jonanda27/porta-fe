"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Eye,
  RotateCcw,
  Send,
  ShieldAlert,
  ClipboardCheck,
  X,
  Paperclip,
  ExternalLink,
  FileCheck2,
  Loader2,
} from "lucide-react";
import { getUploadedFileUrl } from "@/config/api.config";
import { useAuthStore } from "@/store/auth.store";
import { CheckerService } from "@/services/checker.service";
import {
  AdminCheckerDashboardResponse,
  CheckerTaskItem,
} from "@/types/checker.types";
import { TaskDetailItem } from "@/types/task.types";
import { StatusDot } from "@/components/ui/status-indicator";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { TablePagination } from "@/components/ui/table-pagination";
import { formatLabel } from "@/lib/format-labels";
import { ModalPortal } from "@/components/ui/ModalPortal";

type QueueTab = "head_queue" | "waiting" | "unsubmitted" | "overdue" | "returned";

export default function CheckerTugasPage() {
  const { user } = useAuthStore();
  const canAccess =
    user?.role === "ADMIN_PELABUHAN" ||
    user?.role === "KEPALA_PELABUHAN" ||
    user?.role === "SUPERADMIN";
  const isAdminChecker = user?.role === "ADMIN_PELABUHAN";

  const [dashboard, setDashboard] = useState<AdminCheckerDashboardResponse | null>(null);
  const [headQueue, setHeadQueue] = useState<CheckerTaskItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [activeQueue, setActiveQueue] = useState<QueueTab>(
    user?.role === "KEPALA_PELABUHAN" ? "head_queue" : "waiting"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedTask, setSelectedTask] = useState<CheckerTaskItem | null>(null);
  const [taskDetail, setTaskDetail] = useState<TaskDetailItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [adminChecklist, setAdminChecklist] = useState<
    Record<string, { checkedByAdmin: boolean; adminNotes: string }>
  >({});
  const [returnTarget, setReturnTarget] = useState<CheckerTaskItem | null>(null);
  const isKepalaPelabuhan = user?.role === "KEPALA_PELABUHAN";

  useEffect(() => {
    if (!selectedTask) {
      setTaskDetail(null);
      setAdminChecklist({});
      return;
    }
    let cancelled = false;
    setLoadingDetail(true);
    CheckerService.getTaskDetail(selectedTask.id)
      .then((detail) => {
        if (cancelled) return;
        setTaskDetail(detail);
        const initial: Record<string, { checkedByAdmin: boolean; adminNotes: string }> = {};
        for (const item of detail.checklistItems ?? []) {
          initial[item.code] = {
            checkedByAdmin: item.checkedByAdmin,
            adminNotes: item.adminNotes ?? "",
          };
        }
        setAdminChecklist(initial);
      })
      .catch(() => {
        if (!cancelled) setTaskDetail(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedTask]);

  const fetchDashboard = useCallback(async () => {
    if (!canAccess) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [data, headRes] = await Promise.all([
        CheckerService.getAdminTaskDashboard(selectedDate || undefined),
        isKepalaPelabuhan ? CheckerService.getHeadQueue() : Promise.resolve([]),
      ]);
      setDashboard(data);
      setHeadQueue(
        (headRes || []).map((t) => ({
          id: t.id,
          taskCode: t.taskNumber,
          title: t.title,
          description: t.description,
          taskType: t.taskType,
          executionStatus: t.executionStatus as CheckerTaskItem["executionStatus"],
          reviewStatus: t.reviewStatus as CheckerTaskItem["reviewStatus"],
          priority: t.priority,
          isOverdue: t.isOverdue,
          hasIssue: t.hasIssue,
          issueNotes: t.issueNotes,
          dueDate: t.dueDate,
          submittedAt: t.submittedAt,
          assignee: t.assignee,
          berth: t.berth,
          visit: t.visit,
          attachments: t.attachments,
        }))
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal memuat dashboard checker tugas.");
    } finally {
      setIsLoading(false);
    }
  }, [canAccess, isKepalaPelabuhan, selectedDate]);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const activeList = useMemo(() => {
    if (activeQueue === "head_queue") {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return headQueue;
      return headQueue.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.taskCode.toLowerCase().includes(q) ||
          (t.assignee?.fullName && t.assignee.fullName.toLowerCase().includes(q)) ||
          (t.berth?.name && t.berth.name.toLowerCase().includes(q))
      );
    }
    if (!dashboard) return [];
    const base =
      activeQueue === "waiting"
        ? dashboard.queues.waitingAdminReviewTasks
        : activeQueue === "unsubmitted"
        ? dashboard.queues.unsubmittedTasks
        : activeQueue === "overdue"
        ? dashboard.queues.overdueTasks
        : dashboard.queues.incompleteReturnedTasks;

    const q = searchQuery.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.taskCode.toLowerCase().includes(q) ||
        (t.assignee?.fullName && t.assignee.fullName.toLowerCase().includes(q)) ||
        (t.berth?.name && t.berth.name.toLowerCase().includes(q))
    );
  }, [dashboard, headQueue, activeQueue, searchQuery]);

  const totalPages = Math.ceil(activeList.length / itemsPerPage) || 1;
  const pagedTasks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return activeList.slice(start, start + itemsPerPage);
  }, [activeList, currentPage, itemsPerPage]);

  const handleApproveToHead = async (task: CheckerTaskItem) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      if (task.reviewStatus === "WAITING_ADMIN") {
        await CheckerService.startAdminReview(task.id);
      }
      const checklistPayload =
        taskDetail && taskDetail.id === task.id
          ? (taskDetail.checklistItems ?? [])
              .filter((c) => c.isApplicable)
              .map((c) => ({
                code: c.code,
                checkedByAdmin:
                  adminChecklist[c.code]?.checkedByAdmin ?? c.checkedByAdmin,
                adminNotes: adminChecklist[c.code]?.adminNotes ?? c.adminNotes ?? "",
              }))
          : undefined;
      await CheckerService.approveTaskToHead(task.id, undefined, checklistPayload);
      setFeedback(
        `Tugas "${task.title}" (${task.taskCode}) lolos pengecekan Admin dan diteruskan ke Kepala Pelabuhan.`
      );
      setSelectedTask(null);
      await fetchDashboard();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal meneruskan tugas ke Kepala Pelabuhan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHeadVerify = async (task: CheckerTaskItem) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      await CheckerService.headVerifyTask(
        task.id,
        "Hasil pekerjaan dan bukti dokumen telah diverifikasi Kepala Pelabuhan."
      );
      setFeedback(`Tugas "${task.title}" (${task.taskCode}) telah diverifikasi Kepala Pelabuhan.`);
      setSelectedTask(null);
      await fetchDashboard();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal memverifikasi tugas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReturn = async (reason?: string) => {
    if (!returnTarget || !reason) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      if (returnTarget.reviewStatus === "WAITING_ADMIN") {
        await CheckerService.startAdminReview(returnTarget.id);
      }
      if (taskDetail && taskDetail.id === returnTarget.id && (taskDetail.checklistItems ?? []).length > 0) {
        const itemsToSave = (taskDetail.checklistItems ?? [])
          .filter((c) => c.isApplicable)
          .map((c) => ({
            code: c.code,
            checkedByAdmin: adminChecklist[c.code]?.checkedByAdmin ?? c.checkedByAdmin,
            adminNotes: adminChecklist[c.code]?.adminNotes ?? c.adminNotes ?? "",
          }));
        if (itemsToSave.length > 0) {
          await CheckerService.updateAdminChecklist(returnTarget.id, itemsToSave);
        }
      }
      await CheckerService.returnTaskToOfficer(returnTarget.id, reason);
      setFeedback(`Tugas "${returnTarget.title}" dikembalikan ke petugas untuk dilengkapi.`);
      setReturnTarget(null);
      setSelectedTask(null);
      await fetchDashboard();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal mengembalikan tugas ke petugas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmHeadReturn = async (reason?: string) => {
    if (!returnTarget || !reason) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      await CheckerService.headReturnTask(returnTarget.id, reason);
      setFeedback(`Tugas "${returnTarget.title}" dikembalikan oleh Kepala Pelabuhan untuk dilengkapi.`);
      setReturnTarget(null);
      setSelectedTask(null);
      await fetchDashboard();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal mengembalikan tugas.");
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
          Halaman Checker Tugas hanya tersedia untuk Admin Pelabuhan dan Kepala Pelabuhan.
        </p>
      </div>
    );
  }

  const summary = dashboard?.summary;

  return (
    <div className="space-y-4">
      {/* Flat Summary Strip */}
      <div className="bg-white border border-slate-200 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        <div className="px-4 py-3">
          <span className="text-[11px] font-medium text-slate-500">Petugas Lapangan</span>
          <p className="text-lg font-bold text-slate-900 mt-0.5">
            {summary?.totalOfficers ?? 0}
          </p>
        </div>
        <div className="px-4 py-3">
          <span className="text-[11px] font-medium text-slate-500">Menunggu Cek Admin</span>
          <p className="text-lg font-bold text-slate-900 mt-0.5">
            {summary?.waitingAdminReviewCount ?? 0}
          </p>
        </div>
        <div className="px-4 py-3">
          <span className="text-[11px] font-medium text-slate-500">Belum Dikumpulkan</span>
          <p className="text-lg font-bold text-slate-900 mt-0.5">
            {summary?.unsubmittedCount ?? 0}
          </p>
        </div>
        <div className="px-4 py-3">
          <span className="text-[11px] font-medium text-slate-500">Terlambat (Overdue)</span>
          <p className="text-lg font-bold text-rose-600 mt-0.5">
            {summary?.overdueCount ?? 0}
          </p>
        </div>
      </div>

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

      {/* Unified Checker Workspace */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* Queue Tabs + Filter */}
        <div className="px-4 sm:px-5 pt-3 border-b border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-1 flex-wrap">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari tugas, kode, atau nama petugas..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#0B241E]"
                />
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                title="Filter Tanggal Kewajiban"
              />
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate("")}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Reset Tanggal
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => void fetchDashboard()}
              title="Muat Ulang"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer self-end sm:self-auto"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto -mb-px">
            {[
              ...(isKepalaPelabuhan
                ? [
                    {
                      key: "head_queue" as const,
                      label: "Siap Verifikasi Kepala",
                      count: headQueue.length,
                    },
                  ]
                : []),
              {
                key: "waiting" as const,
                label: "Menunggu Cek Admin",
                count: summary?.waitingAdminReviewCount ?? 0,
              },
              {
                key: "unsubmitted" as const,
                label: "Belum Dikumpulkan",
                count: summary?.unsubmittedCount ?? 0,
              },
              {
                key: "overdue" as const,
                label: "Terlambat",
                count: summary?.overdueCount ?? 0,
              },
              {
                key: "returned" as const,
                label: "Dikembalikan / Revisi",
                count: summary?.incompleteReturnedCount ?? 0,
              },
            ].map((tab) => {
              const isActive = activeQueue === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveQueue(tab.key);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-2.5 text-xs whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isActive
                      ? "border-[#0B241E] text-slate-900 font-semibold"
                      : "border-transparent text-slate-500 hover:text-slate-800 font-medium"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[11px] text-slate-400">({tab.count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tasks Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                <th className="py-3 px-5">Tugas & Referensi</th>
                <th className="py-3 px-4">Petugas Penanggung Jawab</th>
                <th className="py-3 px-4 hidden md:table-cell">Lokasi / Kapal</th>
                <th className="py-3 px-4 hidden sm:table-cell">Progres</th>
                <th className="py-3 px-4">Status Cek</th>
                <th className="py-3 px-5 text-right w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {pagedTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <ClipboardCheck className="w-7 h-7 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium">Tidak ada tugas pada antrean ini.</p>
                  </td>
                </tr>
              ) : (
                pagedTasks.map((task) => {
                  const canReview =
                    isAdminChecker &&
                    (task.reviewStatus === "WAITING_ADMIN" ||
                      task.reviewStatus === "ADMIN_REVIEW");
                  return (
                    <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900">{task.title}</div>
                        <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                          {task.taskCode} • {formatLabel(task.taskType)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          {task.assignee?.fullName || "Belum Ditugaskan"}
                        </div>
                        {task.assignee?.role && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {formatLabel(task.assignee.role)}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell text-slate-600">
                        <div>{task.berth?.name || "-"}</div>
                        {task.visit?.vessel?.name && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {task.visit.vessel.name} ({task.visit.visitNumber})
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 hidden sm:table-cell">
                        <StatusDot
                          status={task.isOverdue ? "OVERDUE" : task.executionStatus}
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusDot status={task.reviewStatus} />
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-0.5">
                          <button
                            type="button"
                            onClick={() => setSelectedTask(task)}
                            title="Lihat Detail & Lampiran"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canReview && (
                            <>
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => void handleApproveToHead(task)}
                                title="Loloskan ke Kepala Pelabuhan"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => setReturnTarget(task)}
                                title="Kembalikan ke Petugas (Revisi)"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            </>
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
          totalItems={activeList.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedTask.title}</h3>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  {selectedTask.taskCode} • {formatLabel(selectedTask.taskType)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Petugas</span>
                <span className="font-semibold text-slate-900">
                  {selectedTask.assignee?.fullName || "-"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Status Pemeriksaan</span>
                <StatusDot status={selectedTask.reviewStatus} />
              </div>
              {selectedTask.description && (
                <div className="col-span-2">
                  <span className="text-slate-400 block">Deskripsi</span>
                  <p className="text-slate-700 mt-0.5">{selectedTask.description}</p>
                </div>
              )}
              <div className="col-span-2 space-y-1.5">
                <span className="text-slate-400 block">Bukti Lampiran Petugas</span>
                {(taskDetail?.attachments ?? selectedTask.attachments ?? []).length > 0 ? (
                  (taskDetail?.attachments ?? selectedTask.attachments ?? []).map((att) => (
                    <a
                      key={att.id}
                      href={getUploadedFileUrl(att.filePath)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs hover:bg-emerald-50/50"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-800 truncate">{att.fileName}</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    </a>
                  ))
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-amber-800">
                    Belum ada dokumen atau foto bukti yang dilampirkan petugas pada tugas ini.
                  </div>
                )}
              </div>
            </div>

            {loadingDetail ? (
              <div className="flex items-center justify-center py-6 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memuat konteks objek & checklist detail...
              </div>
            ) : (
              <>
                {taskDetail?.sourceContext && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase">
                      <span>Konteks Objek ({taskDetail.sourceContext.kind})</span>
                      <span className="font-mono text-slate-700">
                        {taskDetail.sourceContext.referenceCode}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900">
                      {taskDetail.sourceContext.title}
                    </div>
                    {taskDetail.sourceContext.subtitle && (
                      <div className="text-xs text-slate-600">
                        {taskDetail.sourceContext.subtitle}
                      </div>
                    )}
                    {taskDetail.sourceContext.documents.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {taskDetail.sourceContext.documents.map((doc, idx) => (
                          <a
                            key={idx}
                            href={getUploadedFileUrl(doc.filePath)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50"
                          >
                            <FileCheck2 className="w-3 h-3" />
                            {doc.label}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {taskDetail?.checklistItems && taskDetail.checklistItems.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-700 block">
                      Pemeriksaan Checklist Per Item
                    </span>
                    {taskDetail.checklistItems
                      .filter((c) => c.isApplicable)
                      .map((item) => {
                        const adminState = adminChecklist[item.code] ?? {
                          checkedByAdmin: item.checkedByAdmin,
                          adminNotes: item.adminNotes ?? "",
                        };
                        const boundAtt = (taskDetail.attachments ?? []).find(
                          (a) => a.checklistItemId === item.id
                        );
                        const evidencePath = item.attachmentPath || boundAtt?.filePath;
                        const canAdminEdit =
                          isAdminChecker &&
                          (selectedTask.reviewStatus === "WAITING_ADMIN" ||
                            selectedTask.reviewStatus === "ADMIN_REVIEW");

                        return (
                          <div
                            key={item.id}
                            className="rounded-xl border border-slate-200 p-3 text-xs space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="font-medium text-slate-900">{item.label}</div>
                                <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap gap-2">
                                  <span>
                                    Petugas:{" "}
                                    <strong className={item.checkedByOfficer ? "text-emerald-700" : "text-rose-600"}>
                                      {item.checkedByOfficer ? "Sudah" : "Belum"}
                                    </strong>
                                  </span>
                                  {item.officerNotes && (
                                    <span className="italic text-slate-600">
                                      &ldquo;{item.officerNotes}&rdquo;
                                    </span>
                                  )}
                                </div>
                              </div>
                              {evidencePath && (
                                <a
                                  href={getUploadedFileUrl(evidencePath)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-1 text-[11px] font-medium text-emerald-700 shrink-0"
                                >
                                  <Paperclip className="w-3 h-3" />
                                  Bukti
                                </a>
                              )}
                            </div>

                            {canAdminEdit ? (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1 border-t border-slate-100">
                                <label className="inline-flex items-center gap-1.5 font-medium text-slate-800 cursor-pointer shrink-0">
                                  <input
                                    type="checkbox"
                                    checked={adminState.checkedByAdmin}
                                    onChange={(e) =>
                                      setAdminChecklist((prev) => ({
                                        ...prev,
                                        [item.code]: {
                                          ...adminState,
                                          checkedByAdmin: e.target.checked,
                                        },
                                      }))
                                    }
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-[#0F2A1D]"
                                  />
                                  Cek Admin OK
                                </label>
                                <input
                                  type="text"
                                  value={adminState.adminNotes}
                                  onChange={(e) =>
                                    setAdminChecklist((prev) => ({
                                      ...prev,
                                      [item.code]: {
                                        ...adminState,
                                        adminNotes: e.target.value,
                                      },
                                    }))
                                  }
                                  placeholder="Catatan checker untuk item ini..."
                                  className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] focus:outline-none focus:border-[#0F2A1D]"
                                />
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-500">
                                Cek Admin:{" "}
                                <strong className={item.checkedByAdmin ? "text-emerald-700" : "text-slate-600"}>
                                  {item.checkedByAdmin ? "Sesuai" : "Belum Dicek"}
                                </strong>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
              {isKepalaPelabuhan &&
                (selectedTask.reviewStatus === "WAITING_HEAD_VERIFICATION" ||
                  selectedTask.reviewStatus === "ADMIN_APPROVED") && (
                  <>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setReturnTarget(selectedTask)}
                      className="px-4 py-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                    >
                      Kembalikan Revisi
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => void handleHeadVerify(selectedTask)}
                      className="px-4 py-2 rounded-lg bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Verifikasi Kepala Pelabuhan</span>
                    </button>
                  </>
                )}
              {isAdminChecker &&
                (selectedTask.reviewStatus === "WAITING_ADMIN" ||
                  selectedTask.reviewStatus === "ADMIN_REVIEW") && (
                  <>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setReturnTarget(selectedTask)}
                      className="px-4 py-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                    >
                      Kembalikan Revisi
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => void handleApproveToHead(selectedTask)}
                      className="px-4 py-2 rounded-lg bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>Teruskan ke Kepala Pelabuhan</span>
                    </button>
                  </>
                )}
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      <ConfirmActionModal
        isOpen={Boolean(returnTarget)}
        title={`Kembalikan Tugas "${returnTarget?.title ?? ""}"?`}
        description="Tugas akan dikembalikan ke petugas yang bersangkutan agar bukti atau checklist dilengkapi sebelum diserahkan ke Kepala Pelabuhan."
        confirmLabel="Kembalikan ke Petugas"
        variant="warning"
        requireReason
        reasonLabel="Catatan Kekurangan / Revisi"
        reasonPlaceholder="Contoh: Foto bukti sandar / berita acara belum terlampir..."
        isLoading={isSubmitting}
        onConfirm={isKepalaPelabuhan ? handleConfirmHeadReturn : handleConfirmReturn}
        onCancel={() => setReturnTarget(null)}
      />
    </div>
  );
}
