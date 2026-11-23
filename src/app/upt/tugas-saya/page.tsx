"use client";

import React, { useEffect, useState } from "react";
import {
  ClipboardList,
  ShieldCheck,
  CheckCircle2,
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
  Award,
} from "lucide-react";
import { API_CONFIG } from "@/config/api.config";
import { useAuthStore } from "@/store/auth.store";
import { useUptStore } from "@/store/upt.store";
import { useFieldOpsStore } from "@/store/field-ops.store";
import { formatLabel } from "@/lib/format-labels";
import { OfficerTaskItem } from "@/types/upt.types";

export default function UptTugasSayaPage() {
  const { user } = useAuthStore();
  const {
    myAssignments,
    taskTemplates,
    officerTasks,
    dailyObligations,
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

  const { dailyReports, fetchDailyReportsOnly, createDailyReport } = useFieldOpsStore();

  const activePortId = Number(user?.portId || myAssignments[0]?.portId || 1);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Selected Task for Checklist & Submission Modal
  const [selectedTask, setSelectedTask] = useState<OfficerTaskItem | null>(null);
  const [checklistState, setChecklistState] = useState<
    Record<string, { checked: boolean; notes: string }>
  >({});
  const [submissionNotes, setSubmissionNotes] = useState<string>("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentNotes, setAttachmentNotes] = useState<string>("");

  // Create New Task Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newTaskType, setNewTaskType] = useState<string>("COMPANY_REGISTRATION_CHECK");
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [newTaskDescription, setNewTaskDescription] = useState<string>("");
  const [newTaskPriority, setNewTaskPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("HIGH");
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>(
    new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16)
  );

  // Daily Shift Report Form
  const [reportDate, setReportDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [reportNotes, setReportNotes] = useState<string>("");

  useEffect(() => {
    fetchOfficerWorkspaceData(activePortId);
    fetchDailyReportsOnly(activePortId);
  }, [activePortId, fetchOfficerWorkspaceData, fetchDailyReportsOnly]);

  const backendOrigin = API_CONFIG.BASE_URL.replace(/\/api\/v1\/?$/, "");
  const getBackendFileUrl = (filePath?: string | null): string | null => {
    if (!filePath) return null;
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) return filePath;
    return `${backendOrigin}/${filePath.replace(/^\/+/, "")}`;
  };

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
    clearError();
  };

  const handleStartTask = async (task: OfficerTaskItem) => {
    setFeedback(null);
    clearError();
    try {
      await startOfficerTask(task.id);
      setFeedback(`Tugas "${task.title}" dimulai (IN_PROGRESS).`);
    } catch {
      // handled in store
    }
  };

  const handleSaveChecklist = async () => {
    if (!selectedTask) return;
    setFeedback(null);
    clearError();
    try {
      const items = (selectedTask.checklistItems || []).map((item) => ({
        code: item.code,
        checkedByOfficer: checklistState[item.code]?.checked ?? false,
        officerNotes: checklistState[item.code]?.notes || undefined,
      }));
      await updateOfficerTaskChecklist(selectedTask.id, {
        items,
        notes: submissionNotes || undefined,
      });
      setFeedback("Progres checklist SOP berhasil disimpan.");
    } catch {
      // handled in store
    }
  };

  const handleUploadAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !attachmentFile) return;
    setFeedback(null);
    clearError();
    try {
      await uploadOfficerTaskAttachment(
        selectedTask.id,
        attachmentFile,
        attachmentNotes.trim() || undefined
      );
      setAttachmentFile(null);
      setAttachmentNotes("");
      setFeedback("Lampiran bukti pemeriksaan berhasil diunggah.");
    } catch {
      // handled in store
    }
  };

  const handleSubmitTask = async () => {
    if (!selectedTask) return;
    setFeedback(null);
    clearError();
    try {
      const items = (selectedTask.checklistItems || []).map((item) => ({
        code: item.code,
        checkedByOfficer: checklistState[item.code]?.checked ?? true,
        officerNotes: checklistState[item.code]?.notes || undefined,
      }));
      await submitOfficerTask(selectedTask.id, {
        taskId: selectedTask.id,
        notes:
          submissionNotes.trim() ||
          "Pemeriksaan dokumen legalitas & registrasi selesai dilaksanakan sesuai SOP.",
        checklistItems: items,
      });
      setSelectedTask(null);
      setFeedback(`Lembar tugas ${selectedTask.taskNumber} berhasil disubmit!`);
    } catch {
      // handled in store
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setFeedback(null);
    clearError();
    try {
      await createOfficerTask({
        taskType: newTaskType,
        title: newTaskTitle.trim(),
        description:
          newTaskDescription.trim() ||
          "Pemeriksaan kelengkapan dokumen registrasi perusahaan & kontrak mitra pelabuhan.",
        portId: activePortId,
        priority: newTaskPriority,
        dueDate: new Date(newTaskDueDate).toISOString(),
      });
      setIsCreateModalOpen(false);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setFeedback("Lembar tugas SOP baru berhasil dibuat!");
    } catch {
      // handled in store
    }
  };

  const handleSubmitDailyReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportNotes.trim()) return;
    setFeedback(null);
    clearError();
    try {
      await createDailyReport(
        {
          portId: activePortId,
          reportDate,
          generalNotes: reportNotes.trim(),
          items: [],
        },
        activePortId
      );
      setReportNotes("");
      setFeedback("Laporan Harian Petugas berhasil dikirim ke Admin & Kepala Pelabuhan!");
    } catch {
      // handled in store
    }
  };

  const filteredTasks = officerTasks.filter((t) => {
    const matchStatus = statusFilter ? t.executionStatus === statusFilter : true;
    const matchSearch =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.taskNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
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

      {/* 1. SURAT PENUGASAN AKTIF (GET /assignments/my) */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#0B241E]">
                Surat Penugasan &amp; Kewenangan Aktif Saya
              </h2>
              <p className="text-xs text-[#64748B]">
                Penugasan resmi dari Kepala Pelabuhan beserta cakupan tupoksi &amp; hak akses sistem.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              fetchOfficerWorkspaceData(activePortId, true);
              fetchDailyReportsOnly(activePortId);
            }}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-bold text-[#0B241E] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {myAssignments.length === 0 ? (
          <p className="text-xs text-[#64748B] italic">
            Belum ada surat penugasan khusus yang tercatat untuk akun Anda.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myAssignments.map((asg) => (
              <div
                key={asg.id}
                className="p-4 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded bg-[#0B241E] text-[#D97706]">
                    {asg.assignmentCode}
                  </span>
                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {formatLabel(asg.status)}
                  </span>
                </div>
                <p className="font-bold text-[#0B241E]">
                  {asg.port?.name || "Pelabuhan Poumako"} • {formatLabel(asg.role)}
                </p>
                {asg.notes && <p className="text-[#475569] leading-relaxed">{asg.notes}</p>}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {asg.taskTypes.map((tt) => (
                    <span
                      key={tt}
                      className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white border border-[#CBD5E1] text-[#334155]"
                    >
                      {formatLabel(tt)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. DAFTAR LEMBAR TUGAS SOP (GET /tasks, POST /tasks, PATCH /tasks/:id/start, checklist, submit) */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#0B241E]">
                Lembar Tugas Pemeriksaan &amp; Verifikasi SOP ({filteredTasks.length})
              </h2>
              <p className="text-xs text-[#64748B]">
                Kerjakan checklist pemeriksaan pendaftaran perusahaan &amp; verifikasi dokumen legalitas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor/judul tugas..."
              className="px-3 py-1.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0B241E]"
            >
              <option value="">Semua Status</option>
              <option value="NOT_STARTED">Belum Dimulai</option>
              <option value="IN_PROGRESS">Sedang Dikerjakan</option>
              <option value="SUBMITTED">Telah Disubmit</option>
              <option value="COMPLETED">Selesai Diverifikasi</option>
            </select>
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

        <div className="w-full overflow-x-hidden">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] bg-[#F8FAFC]">
                <th className="py-3 px-4 w-[18%]">No. Tugas &amp; Tipe</th>
                <th className="py-3 px-3 w-[32%]">Judul &amp; Deskripsi Pemeriksaan</th>
                <th className="py-3 px-3 w-[14%]">Batas Waktu</th>
                <th className="py-3 px-3 w-[16%]">Status Eksekusi</th>
                <th className="py-3 px-4 text-right w-[20%]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-xs">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#94A3B8]">
                    Belum ada lembar tugas pemeriksaan untuk filter ini.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3.5 px-4 align-middle">
                      <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 block w-fit">
                        {task.taskNumber}
                      </span>
                      <span className="text-[11px] text-[#64748B] mt-1 block truncate">
                        {formatLabel(task.taskType)}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 align-middle">
                      <div className="font-bold text-[#0B241E] truncate" title={task.title}>
                        {task.title}
                      </div>
                      <p className="text-[11px] text-[#64748B] truncate mt-0.5" title={task.description}>
                        {task.description}
                      </p>
                    </td>
                    <td className="py-3.5 px-3 align-middle font-mono text-[11px] text-[#475569]">
                      {new Date(task.dueDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-3 align-middle">
                      <span
                        className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border inline-block ${
                          task.executionStatus === "COMPLETED" ||
                          task.executionStatus === "SUBMITTED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : task.executionStatus === "IN_PROGRESS"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {formatLabel(task.executionStatus)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right align-middle whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {task.executionStatus === "NOT_STARTED" && (
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleStartTask(task)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Play className="w-3 h-3" />
                            <span>Mulai</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openTaskModal(task)}
                          className="px-2.5 py-1 rounded-lg bg-[#0B241E] hover:bg-[#143E33] text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" />
                          <span>Checklist SOP</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. LAPORAN HARIAN PETUGAS & TEMPLATE SOP (GET /daily-reports, POST /daily-reports, GET /tasks/templates) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#F1F5F9] pb-3">
            <Clock className="w-5 h-5 text-[#D97706]" />
            <div>
              <h3 className="text-sm font-extrabold text-[#0B241E]">
                Kirim Laporan Harian Verifikasi &amp; Registrasi
              </h3>
              <p className="text-xs text-[#64748B]">
                Rekapitulasi harian pemeriksaan berkas operator, kapal, tenant, dan kontrak PKS.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitDailyReport} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#334155] mb-1">Tanggal Laporan</label>
              <input
                type="date"
                required
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#334155] mb-1">
                Catatan &amp; Ringkasan Hasil Verifikasi Hari Ini
              </label>
              <textarea
                rows={3}
                required
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                placeholder="Contoh: Telah dilakukan pemeriksaan berkas SIUPAL/NPWP untuk 3 perusahaan pelayaran baru dan review 1 kontrak PKS Sandar..."
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC]"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Kirim Laporan Harian</span>
              </button>
            </div>
          </form>

          {dailyReports.length > 0 && (
            <div className="pt-3 border-t border-[#F1F5F9] space-y-2">
              <p className="text-[11px] font-bold text-[#64748B] uppercase">
                Riwayat Laporan Harian Terbaru ({dailyReports.length})
              </p>
              <div className="max-h-40 overflow-y-auto space-y-1.5">
                {dailyReports.slice(0, 4).map((rep) => (
                  <div
                    key={rep.id}
                    className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-[#0B241E] truncate">{rep.reportNumber}</p>
                      <p className="text-[11px] text-[#64748B] truncate">
                        {rep.generalNotes || "Laporan operasional harian"}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      {formatLabel(rep.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-[#133D31]" />
              <div>
                <h3 className="text-sm font-extrabold text-[#0B241E]">
                  Standar Checklist SOP Verifikasi &amp; Kewajiban Harian
                </h3>
                <p className="text-xs text-[#64748B]">
                  Pedoman baku pemeriksaan dokumen legalitas perusahaan &amp; kontrak payung.
                </p>
              </div>
            </div>
            {dailyObligations && (
              <span className="text-[10.5px] font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                Rekap Harian Aktif
              </span>
            )}
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {taskTemplates
              .filter(
                (tpl) =>
                  tpl.taskType === "COMPANY_REGISTRATION_CHECK" ||
                  tpl.taskType === "DOCUMENT_VERIFICATION" ||
                  tpl.taskType === "ASSET_MANAGEMENT_CHECK"
              )
              .map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold text-[#D97706] bg-[#0B241E] px-2 py-0.5 rounded">
                      {tpl.code}
                    </span>
                    <span className="text-[10px] font-mono text-[#64748B]">
                      SLA: {tpl.slaMinutes} Menit
                    </span>
                  </div>
                  <p className="font-bold text-[#0B241E]">{tpl.titleTemplate}</p>
                  <p className="text-[11px] text-[#64748B]">{tpl.description}</p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* MODAL CHECKLIST & SUBMIT TUGAS */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-[#F1F5F9] pb-3.5">
              <div>
                <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                  {selectedTask.taskNumber} • {formatLabel(selectedTask.taskType)}
                </span>
                <h3 className="text-base font-extrabold text-[#0B241E] mt-1">
                  {selectedTask.title}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">{selectedTask.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="p-1.5 rounded-xl text-[#64748B] hover:text-[#0B241E] hover:bg-[#F1F5F9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2.5">
              <p className="text-xs font-extrabold text-[#0B241E]">
                Item Pemeriksaan Checklist SOP
              </p>
              {(selectedTask.checklistItems || []).map((item) => {
                const st = checklistState[item.code] || { checked: false, notes: "" };
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-2 text-xs"
                  >
                    <label className="flex items-start gap-2.5 cursor-pointer font-bold text-[#0B241E]">
                      <input
                        type="checkbox"
                        checked={st.checked}
                        onChange={(e) =>
                          setChecklistState((prev) => ({
                            ...prev,
                            [item.code]: { ...st, checked: e.target.checked },
                          }))
                        }
                        className="mt-0.5 w-4 h-4 rounded accent-[#0B241E]"
                      />
                      <span>
                        {item.label}{" "}
                        {item.isRequired && <span className="text-rose-600">*</span>}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={st.notes}
                      onChange={(e) =>
                        setChecklistState((prev) => ({
                          ...prev,
                          [item.code]: { ...st, notes: e.target.value },
                        }))
                      }
                      placeholder="Catatan hasil pemeriksaan item ini (opsional)..."
                      className="w-full px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-xs"
                    />
                  </div>
                );
              })}
            </div>

            {/* Lampiran Bukti */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3 text-xs">
              <p className="font-extrabold text-[#0B241E] flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Lampiran Bukti Verifikasi ({selectedTask.attachments?.length ?? 0})</span>
              </p>
              {(selectedTask.attachments || []).map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-[#E2E8F0]"
                >
                  <span className="font-medium text-[#0B241E] truncate">{att.fileName}</span>
                  {getBackendFileUrl(att.filePath) && (
                    <a
                      href={getBackendFileUrl(att.filePath) || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0284C7] font-bold inline-flex items-center gap-1"
                    >
                      <span>Buka</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
              <form onSubmit={handleUploadAttachment} className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                  className="text-xs text-[#64748B] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-[#0B241E] file:text-white file:font-bold cursor-pointer"
                />
                <input
                  type="text"
                  value={attachmentNotes}
                  onChange={(e) => setAttachmentNotes(e.target.value)}
                  placeholder="Keterangan lampiran..."
                  className="flex-1 min-w-[140px] px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-xs"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !attachmentFile}
                  className="px-3 py-1.5 rounded-lg bg-[#0B241E] text-white font-bold disabled:opacity-50 cursor-pointer"
                >
                  Unggah
                </button>
              </form>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Kesimpulan / Catatan Penyelesaian Tugas
              </label>
              <textarea
                rows={2}
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder="Catatan hasil verifikasi untuk diteruskan ke Admin Checker & Kepala Pelabuhan..."
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSaveChecklist}
                className="px-4 py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0B241E] text-xs font-bold cursor-pointer"
              >
                Simpan Progres Checklist
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitTask}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Selesai Tugas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BUAT LEMBAR TUGAS BARU (POST /tasks) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTask}
            className="bg-white rounded-3xl border border-[#E2E8F0] w-full max-w-lg p-6 sm:p-7 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#F1F5F9] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#0B241E]">
                  Buat Lembar Tugas Pemeriksaan Baru
                </h3>
                <p className="text-xs text-[#64748B]">
                  Tambahkan lembar kerja pemeriksaan registrasi perusahaan atau verifikasi dokumen.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-[#64748B] hover:text-[#0B241E] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block font-bold text-[#334155] mb-1">Kategori Tugas SOP</label>
              <select
                value={newTaskType}
                onChange={(e) => setNewTaskType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] font-semibold"
              >
                <option value="COMPANY_REGISTRATION_CHECK">
                  Pemeriksaan Pendaftaran Perusahaan (COMPANY_REGISTRATION_CHECK)
                </option>
                <option value="DOCUMENT_VERIFICATION">
                  Verifikasi Dokumen Legalitas &amp; Kontrak (DOCUMENT_VERIFICATION)
                </option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#334155] mb-1">
                Judul Tugas Pemeriksaan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Contoh: Pemeriksaan Berkas SIUPAL & NPWP PT Pelayaran Baru"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#334155] mb-1">Deskripsi Tugas</label>
              <textarea
                rows={2}
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Rincian pemeriksaan kelengkapan dokumen legalitas..."
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#334155] mb-1">Prioritas</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) =>
                    setNewTaskPriority(
                      e.target.value as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
                    )
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] font-semibold"
                >
                  <option value="MEDIUM">Normal (Medium)</option>
                  <option value="HIGH">Tinggi (High)</option>
                  <option value="CRITICAL">Segera (Critical)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-[#334155] mb-1">Batas Waktu</label>
                <input
                  type="datetime-local"
                  required
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#CBD5E1] font-bold text-[#475569] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white font-bold cursor-pointer"
              >
                Simpan Tugas
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
