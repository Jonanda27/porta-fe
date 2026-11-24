"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  AlertCircle,
  Loader2,
  RefreshCw,
  Play,
  Send,
  Paperclip,
  Plus,
  X,
  FileText,
  Clock,
  ExternalLink,
  Search,
} from "lucide-react";
import { API_CONFIG } from "@/config/api.config";
import { useAuthStore } from "@/store/auth.store";
import { useUptStore } from "@/store/upt.store";
import { toast } from "@/store/toast.store";
import { formatLabel } from "@/lib/format-labels";
import { OfficerTaskItem } from "@/types/upt.types";

const EXECUTION_STATUS_BADGE: Record<string, string> = {
  NOT_STARTED: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  SUBMITTED: "bg-amber-100 text-amber-800",
  RETURNED: "bg-rose-100 text-rose-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  OVERDUE: "bg-rose-100 text-rose-800",
  CANCELLED: "bg-gray-100 text-gray-600",
};

const PRIORITY_BADGE: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-sky-100 text-sky-800",
  HIGH: "bg-amber-100 text-amber-800",
  CRITICAL: "bg-rose-100 text-rose-800",
};

export default function BendaharaTugasSayaPage() {
  const { user } = useAuthStore();
  const {
    myAssignments,
    taskTemplates,
    officerTasks,
    isLoading,
    isSubmitting,
    error,
    fetchOfficerWorkspaceData,
    createOfficerTask,
    startOfficerTask,
    updateOfficerTaskChecklist,
    uploadOfficerTaskAttachment,
    submitOfficerTask,
    clearError,
  } = useUptStore();

  const activePortId = Number(user?.portId || myAssignments[0]?.portId || 1);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [selectedTask, setSelectedTask] = useState<OfficerTaskItem | null>(null);
  const [checklistState, setChecklistState] = useState<
    Record<string, { checked: boolean; notes: string }>
  >({});
  const [submissionNotes, setSubmissionNotes] = useState<string>("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentNotes, setAttachmentNotes] = useState<string>("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newTaskType, setNewTaskType] = useState<string>("");
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [newTaskDescription, setNewTaskDescription] = useState<string>("");
  const [newTaskPriority, setNewTaskPriority] = useState<
    "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  >("HIGH");
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>(
    new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16)
  );

  useEffect(() => {
    fetchOfficerWorkspaceData(activePortId);
  }, [activePortId, fetchOfficerWorkspaceData]);

  useEffect(() => {
    if (!newTaskType && taskTemplates.length > 0) {
      setNewTaskType(taskTemplates[0].taskType);
    }
  }, [newTaskType, taskTemplates]);

  const backendOrigin = API_CONFIG.BASE_URL.replace(/\/api\/v1\/?$/, "");
  const getBackendFileUrl = (filePath?: string | null): string | null => {
    if (!filePath) return null;
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }
    return `${backendOrigin}/${filePath.replace(/^\/+/, "")}`;
  };

  const filteredTasks = useMemo(() => {
    return officerTasks.filter((t) => {
      if (statusFilter && t.executionStatus !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.taskNumber.toLowerCase().includes(q) ||
          t.taskType.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [officerTasks, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: officerTasks.length,
      inProgress: officerTasks.filter(
        (t) => t.executionStatus === "IN_PROGRESS" || t.executionStatus === "NOT_STARTED"
      ).length,
      submittedOrDone: officerTasks.filter(
        (t) => t.executionStatus === "SUBMITTED" || t.executionStatus === "COMPLETED"
      ).length,
      overdue: officerTasks.filter((t) => t.isOverdue).length,
    };
  }, [officerTasks]);

  const openTaskModal = (task: OfficerTaskItem) => {
    setSelectedTask(task);
    const initialMap: Record<string, { checked: boolean; notes: string }> = {};
    (task.checklistItems || []).forEach((item) => {
      initialMap[item.code] = {
        checked: Boolean(item.checkedByOfficer),
        notes: item.officerNotes || "",
      };
    });
    setChecklistState(initialMap);
    setSubmissionNotes(task.notes || "");
    setAttachmentFile(null);
    setAttachmentNotes("");
  };

  const handleStartTask = async (taskId: number) => {
    clearError();
    await startOfficerTask(taskId);
    toast.success(
      "Tugas Dimulai",
      "Tugas dimulai. Silakan lengkapi checklist dan unggah bukti pendukung."
    );
  };

  const handleSaveChecklist = async () => {
    if (!selectedTask) return;
    clearError();
    const items = Object.entries(checklistState).map(([code, val]) => ({
      code,
      checkedByOfficer: val.checked,
      officerNotes: val.notes || undefined,
    }));
    await updateOfficerTaskChecklist(selectedTask.id, {
      items,
      notes: submissionNotes || undefined,
    });
    toast.success("Checklist Tersimpan", "Checklist tugas berhasil disimpan.");
  };

  const handleUploadAttachment = async () => {
    if (!selectedTask || !attachmentFile) return;
    clearError();
    await uploadOfficerTaskAttachment(
      selectedTask.id,
      attachmentFile,
      attachmentNotes || undefined
    );
    setAttachmentFile(null);
    setAttachmentNotes("");
    toast.success("Lampiran Diunggah", "Lampiran bukti tugas berhasil diunggah.");
  };

  const handleSubmitTask = async () => {
    if (!selectedTask) return;
    clearError();
    const checklistItems = Object.entries(checklistState).map(([code, val]) => ({
      code,
      checkedByOfficer: val.checked,
      officerNotes: val.notes || undefined,
    }));
    await submitOfficerTask(selectedTask.id, {
      notes: submissionNotes || undefined,
      checklistItems,
    });
    setSelectedTask(null);
    toast.success(
      "Tugas Dikirim",
      "Lembar tugas berhasil dikirim untuk verifikasi pimpinan."
    );
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskType || !newTaskTitle.trim()) return;
    clearError();
    await createOfficerTask({
      taskType: newTaskType,
      title: newTaskTitle.trim(),
      description:
        newTaskDescription.trim() ||
        "Lembar tugas administrasi kebendaharaan dan rekonsiliasi penerimaan daerah.",
      portId: activePortId,
      priority: newTaskPriority,
      dueDate: new Date(newTaskDueDate).toISOString(),
    });
    setIsCreateModalOpen(false);
    setNewTaskTitle("");
    setNewTaskDescription("");
    toast.success("Tugas Diterbitkan", "Lembar tugas baru berhasil diterbitkan.");
  };

  return (
    <div className="space-y-6">
      {/* Feedback & Error Banner */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="text-rose-600 hover:text-rose-800 font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            Total Lembar Tugas
          </p>
          <p className="text-2xl font-extrabold text-[#0B241E] font-mono mt-1">
            {stats.total}
          </p>
        </div>
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            Aktif / Berjalan
          </p>
          <p className="text-2xl font-extrabold text-blue-700 font-mono mt-1">
            {stats.inProgress}
          </p>
        </div>
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            Terkirim / Selesai
          </p>
          <p className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">
            {stats.submittedOrDone}
          </p>
        </div>
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            Melewati Batas SLA
          </p>
          <p className="text-2xl font-extrabold text-rose-700 font-mono mt-1">
            {stats.overdue}
          </p>
        </div>
      </div>

      {/* Toolbar & Table */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#F1F5F9] bg-[#FAFCFB] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="font-extrabold text-sm text-[#0B241E] flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#D97706]" />
              <span>Daftar Tugas &amp; Checklist Kebendaharaan</span>
            </h2>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Pelaksanaan checklist operasional keuangan, verifikasi e-SSRD, dan pelaporan bukti kerja.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nomor atau judul tugas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#0B241E]"
            >
              <option value="">Semua Status</option>
              <option value="NOT_STARTED">Belum Dimulai</option>
              <option value="IN_PROGRESS">Sedang Berjalan</option>
              <option value="SUBMITTED">Menunggu Review</option>
              <option value="RETURNED">Perlu Revisi</option>
              <option value="COMPLETED">Selesai</option>
            </select>

            <button
              type="button"
              onClick={() => fetchOfficerWorkspaceData(activePortId, true)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-[#0B241E] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Segarkan</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Buat Lembar Tugas</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-mono text-[11px] text-[#64748B] uppercase">
              <tr>
                <th className="p-3.5">No. Tugas</th>
                <th className="p-3.5">Judul &amp; Jenis</th>
                <th className="p-3.5">Prioritas</th>
                <th className="p-3.5">Batas Waktu</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {isLoading && filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#64748B]">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B241E]" />
                    Memuat daftar tugas kebendaharaan...
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#64748B]">
                    Belum ada lembar tugas yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-[#F8FAFC]">
                    <td className="p-3.5 font-mono font-bold text-[#0B241E]">
                      {task.taskNumber}
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-[#0B241E]">{task.title}</p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        {formatLabel(task.taskType)}
                      </p>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          PRIORITY_BADGE[task.priority] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[#475569]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>
                          {new Date(task.dueDate).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {task.isOverdue && (
                        <span className="text-[10px] font-bold text-rose-600">
                          Terlambat SLA
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          EXECUTION_STATUS_BADGE[task.executionStatus] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {formatLabel(task.executionStatus)}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      {task.executionStatus === "NOT_STARTED" && (
                        <button
                          type="button"
                          onClick={() => handleStartTask(task.id)}
                          disabled={isSubmitting}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3" />
                          <span>Mulai</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openTaskModal(task)}
                        className="px-2.5 py-1 rounded-lg border border-[#CBD5E1] bg-white hover:bg-gray-50 text-[#0B241E] text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3 h-3 text-[#D97706]" />
                        <span>Checklist &amp; Kirim</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Checklist & Submit */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <p className="text-[11px] font-mono text-[#D97706] font-bold">
                  {selectedTask.taskNumber}
                </p>
                <h3 className="text-base font-extrabold text-[#0B241E]">
                  {selectedTask.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 text-xs">
              <p className="text-[#475569] leading-relaxed">{selectedTask.description}</p>

              {/* Checklist Items */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-[#0B241E] uppercase tracking-wider text-[11px]">
                  Item Checklist Pelaksanaan
                </h4>
                {(selectedTask.checklistItems || []).length === 0 ? (
                  <p className="text-[#64748B] italic">
                    Tidak ada item checklist khusus untuk tugas ini.
                  </p>
                ) : (
                  (selectedTask.checklistItems || []).map((item) => {
                    const current = checklistState[item.code] || {
                      checked: false,
                      notes: "",
                    };
                    return (
                      <div
                        key={item.code}
                        className="p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-2"
                      >
                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={current.checked}
                            onChange={(e) =>
                              setChecklistState((prev) => ({
                                ...prev,
                                [item.code]: {
                                  ...current,
                                  checked: e.target.checked,
                                },
                              }))
                            }
                            className="mt-0.5 rounded border-gray-300 text-[#0B241E]"
                          />
                          <span className="font-semibold text-[#0B241E]">
                            {item.label}
                            {item.isRequired && (
                              <span className="text-rose-600 ml-1">*</span>
                            )}
                          </span>
                        </label>
                        <input
                          type="text"
                          placeholder="Catatan pemeriksaan (opsional)..."
                          value={current.notes}
                          onChange={(e) =>
                            setChecklistState((prev) => ({
                              ...prev,
                              [item.code]: {
                                ...current,
                                notes: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
                        />
                      </div>
                    );
                  })
                )}
              </div>

              {/* Upload Attachment */}
              <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#FAFCFB] space-y-3">
                <h4 className="font-bold text-[#0B241E] flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Lampiran Bukti Kerja</span>
                </h4>

                {(selectedTask.attachments || []).length > 0 && (
                  <ul className="space-y-1.5">
                    {(selectedTask.attachments || []).map((att) => {
                      const url = getBackendFileUrl(att.filePath);
                      return (
                        <li
                          key={att.id}
                          className="flex items-center justify-between text-[11px] bg-white px-3 py-1.5 rounded-lg border border-gray-200"
                        >
                          <span className="truncate font-medium text-[#0B241E]">
                            {att.fileName}
                          </span>
                          {url && (
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline inline-flex items-center gap-1 shrink-0"
                            >
                              <span>Buka</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="file"
                    onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                    className="text-[11px] text-[#475569]"
                  />
                  <input
                    type="text"
                    placeholder="Keterangan lampiran..."
                    value={attachmentNotes}
                    onChange={(e) => setAttachmentNotes(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
                  />
                </div>
                <button
                  type="button"
                  disabled={!attachmentFile || isSubmitting}
                  onClick={handleUploadAttachment}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-[11px] font-bold cursor-pointer"
                >
                  Unggah Lampiran
                </button>
              </div>

              {/* Submission Notes */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#0B241E]">
                  Catatan Penyelesaian Tugas
                </label>
                <textarea
                  rows={3}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Tuliskan ringkasan hasil verifikasi atau rekonsiliasi..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0B241E]"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[#E2E8F0] bg-[#FAFCFB] flex items-center justify-end gap-2 sticky bottom-0">
              <button
                type="button"
                onClick={handleSaveChecklist}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-[#CBD5E1] bg-white hover:bg-gray-50 text-xs font-bold text-[#0B241E] cursor-pointer"
              >
                Simpan Checklist
              </button>
              <button
                type="button"
                onClick={handleSubmitTask}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Kirim ke Pimpinan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create New Task */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTask}
            className="bg-white rounded-2xl border border-[#CBD5E1] shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#0B241E]">
                Terbitkan Lembar Tugas Kebendaharaan
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#0B241E]">Template Jenis Tugas</label>
                <select
                  value={newTaskType}
                  onChange={(e) => setNewTaskType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                  required
                >
                  {taskTemplates.length === 0 ? (
                    <option value="GENERAL_FINANCE_AUDIT">
                      Audit Administrasi Keuangan
                    </option>
                  ) : (
                    taskTemplates.map((tpl) => (
                      <option key={tpl.id} value={tpl.taskType}>
                        {tpl.titleTemplate} ({tpl.code})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0B241E]">Judul Tugas</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Contoh: Rekonsiliasi BKU & e-SSRD Shift Pagi"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0B241E]">Deskripsi Tugas</label>
                <textarea
                  rows={3}
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Detail pekerjaan pemeriksaan atau rekonsiliasi..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#0B241E]">Prioritas</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) =>
                      setNewTaskPriority(
                        e.target.value as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#0B241E]">Batas Waktu</label>
                  <input
                    type="datetime-local"
                    required
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E2E8F0] bg-[#FAFCFB] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-[#475569] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold cursor-pointer"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Tugas"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
