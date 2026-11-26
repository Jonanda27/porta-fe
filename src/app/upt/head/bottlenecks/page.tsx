"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  FileWarning,
  Loader2,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { formatLabel } from "@/lib/format-labels";
import { CheckerService } from "@/services/checker.service";
import { HeadBottleneckItem, HeadBottlenecksResponse } from "@/types/task.types";

const STAGE_LABELS: Record<
  HeadBottleneckItem["stage"],
  { label: string; badgeClass: string }
> = {
  STUCK_AT_OFFICER: {
    label: "Tertahan di Petugas",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
  },
  RETURNED_LOOP: {
    label: "Dikembalikan / Revisi",
    badgeClass: "bg-red-100 text-red-800 border-red-200",
  },
  STUCK_AT_ADMIN_CHECKER: {
    label: "Menunggu Admin Checker",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
  },
  WAITING_HEAD: {
    label: "Siap Verifikasi Kepala",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
};

export default function HeadBottlenecksPage() {
  const [data, setData] = useState<HeadBottlenecksResponse | null>(null);
  const [stageFilter, setStageFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await CheckerService.getHeadBottlenecks(
        stageFilter ? { stage: stageFilter } : undefined
      );
      setData(res);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal memuat radar bottleneck."
      );
    } finally {
      setLoading(false);
    }
  }, [stageFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary = data?.summary;
  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Radar Bottleneck Operasional
          </h1>
          <p className="text-sm text-slate-500">
            Pantau titik macet tugas, penanggung jawab saat ini, dokumen yang belum lengkap, dan lama tertahan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/upt/checker/tugas"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F2A1D] px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-900"
          >
            Buka Antrean Verifikasi
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => loadData()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <button
          onClick={() => setStageFilter("")}
          className={`rounded-2xl border p-4 text-left transition-all ${
            stageFilter === ""
              ? "border-[#0F2A1D] bg-emerald-50/40 ring-1 ring-[#0F2A1D]"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="text-xs font-medium text-slate-500">Total Aktif</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {summary?.totalActive ?? 0}
          </div>
        </button>

        <button
          onClick={() => setStageFilter("STUCK_AT_OFFICER")}
          className={`rounded-2xl border p-4 text-left transition-all ${
            stageFilter === "STUCK_AT_OFFICER"
              ? "border-amber-600 bg-amber-50/50 ring-1 ring-amber-600"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="text-xs font-medium text-amber-700">Di Petugas</div>
          <div className="mt-1 text-2xl font-bold text-amber-800">
            {summary?.stuckAtOfficer ?? 0}
          </div>
        </button>

        <button
          onClick={() => setStageFilter("RETURNED_LOOP")}
          className={`rounded-2xl border p-4 text-left transition-all ${
            stageFilter === "RETURNED_LOOP"
              ? "border-red-600 bg-red-50/50 ring-1 ring-red-600"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="text-xs font-medium text-red-700">Dikembalikan</div>
          <div className="mt-1 text-2xl font-bold text-red-700">
            {summary?.returnedLoop ?? 0}
          </div>
        </button>

        <button
          onClick={() => setStageFilter("STUCK_AT_ADMIN_CHECKER")}
          className={`rounded-2xl border p-4 text-left transition-all ${
            stageFilter === "STUCK_AT_ADMIN_CHECKER"
              ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="text-xs font-medium text-blue-700">Di Admin Checker</div>
          <div className="mt-1 text-2xl font-bold text-blue-800">
            {summary?.stuckAtAdminChecker ?? 0}
          </div>
        </button>

        <button
          onClick={() => setStageFilter("WAITING_HEAD")}
          className={`rounded-2xl border p-4 text-left transition-all ${
            stageFilter === "WAITING_HEAD"
              ? "border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="text-xs font-medium text-emerald-700">Siap Kepala</div>
          <div className="mt-1 text-2xl font-bold text-emerald-800">
            {summary?.waitingHead ?? 0}
          </div>
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50/40 p-4">
          <div className="text-xs font-medium text-red-700">Melewati Batas</div>
          <div className="mt-1 text-2xl font-bold text-red-700">
            {summary?.overdueCount ?? 0}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Bottleneck Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Menganalisis hambatan tugas...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            <ShieldAlert className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
            Tidak ada tugas yang tertahan pada filter ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Tugas</th>
                  <th className="px-4 py-3">Posisi / Stage</th>
                  <th className="px-4 py-3">Penanggung Jawab</th>
                  <th className="px-4 py-3">Kekurangan / Penyebab</th>
                  <th className="px-4 py-3">Tertahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const stageMeta = STAGE_LABELS[item.stage];
                  return (
                    <tr key={item.taskId} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3.5 align-top">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-slate-500">
                            {item.taskNumber}
                          </span>
                          {item.isOverdue && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                              Overdue
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 font-semibold text-slate-900">
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatLabel(item.taskType)}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 align-top">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${stageMeta.badgeClass}`}
                        >
                          {stageMeta.label}
                        </span>
                        {item.returnCount > 0 && (
                          <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-red-700">
                            <RotateCcw className="h-3 w-3" />
                            Diretur {item.returnCount}x
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 align-top">
                        <div className="flex items-center gap-1.5 font-medium text-slate-900">
                          <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                          {item.currentHolder.fullName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatLabel(item.currentHolder.role)}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 align-top">
                        {item.lastReturnReason && (
                          <div className="mb-1.5 rounded-lg bg-red-50 px-2.5 py-1 text-xs text-red-800">
                            <span className="font-semibold">Alasan Retur:</span>{" "}
                            {item.lastReturnReason}
                          </div>
                        )}
                        {item.hasIssue && item.issueNotes && (
                          <div className="mb-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs text-amber-800">
                            <span className="font-semibold">Kendala:</span>{" "}
                            {item.issueNotes}
                          </div>
                        )}
                        {item.missingChecklistItems.length > 0 ? (
                          <ul className="space-y-1 text-xs text-slate-700">
                            {item.missingChecklistItems.slice(0, 4).map((m) => (
                              <li
                                key={m.code}
                                className="flex items-center gap-1.5"
                              >
                                <FileWarning className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                                <span>
                                  {m.label}{" "}
                                  <span className="text-[11px] font-semibold text-red-600">
                                    ({m.missingAttachment ? "Belum upload bukti" : "Belum dicentang"})
                                  </span>
                                </span>
                              </li>
                            ))}
                            {item.missingChecklistItems.length > 4 && (
                              <li className="text-[11px] text-slate-500">
                                +{item.missingChecklistItems.length - 4} item lainnya
                              </li>
                            )}
                          </ul>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Kelengkapan checklist terpenuhi
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 align-top whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 font-semibold text-slate-800">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {item.agingHours} jam
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Due: {new Date(item.dueDate).toLocaleDateString("id-ID")}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
