"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Ship,
  Store,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileText,
  ShieldAlert,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useUptStore } from "@/store/upt.store";
import { VerificationStatus } from "@/types/upt.types";

type TabType = "operators" | "vessels" | "tenants";

const STATUS_BADGE: Record<VerificationStatus, string> = {
  PENDING: "bg-amber-50 text-amber-800 border-amber-200",
  VERIFIED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function VerifikasiPage() {
  const { user } = useAuthStore();
  const {
    operators,
    vessels,
    tenants,
    isLoading,
    isSubmitting,
    error,
    fetchVerificationData,
    verifyOperator,
    verifyVessel,
    verifyTenant,
    clearError,
  } = useUptStore();

  const canAccess =
    user?.role === "SUPERADMIN" || user?.role === "ADMIN_PELABUHAN";

  const [activeTab, setActiveTab] = useState<TabType>("operators");
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | "">("PENDING");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Reject modal state
  const [rejectTarget, setRejectTarget] = useState<{
    type: TabType;
    id: number;
    name: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (canAccess) {
      fetchVerificationData();
    }
  }, [canAccess, fetchVerificationData]);

  if (!canAccess) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center">
        <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <h2 className="text-base font-bold text-[#0B241E]">Akses Terbatas</h2>
        <p className="text-xs text-[#64748B] mt-1">
          Verifikasi pendaftaran hanya dapat dilakukan oleh Admin Pelabuhan atau Superadmin.
        </p>
      </div>
    );
  }

  const pendingOps = operators.filter((o) => o.verificationStatus === "PENDING").length;
  const pendingVessels = vessels.filter((v) => v.verificationStatus === "PENDING").length;
  const pendingTenants = tenants.filter((t) => t.verificationStatus === "PENDING").length;

  const filteredOperators = operators.filter((o) =>
    statusFilter ? o.verificationStatus === statusFilter : true
  );
  const filteredVessels = vessels.filter((v) =>
    statusFilter ? v.verificationStatus === statusFilter : true
  );
  const filteredTenants = tenants.filter((t) =>
    statusFilter ? t.verificationStatus === statusFilter : true
  );

  const handleApprove = async (type: TabType, id: number, name: string) => {
    setFeedback(null);
    clearError();
    if (type === "operators") {
      await verifyOperator(id, { status: "VERIFIED" });
    } else if (type === "vessels") {
      await verifyVessel(id, { status: "VERIFIED" });
    } else {
      await verifyTenant(id, { verificationStatus: "VERIFIED" });
    }
    setFeedback(`${name} berhasil diverifikasi (VERIFIED).`);
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget) return;
    setFeedback(null);
    clearError();

    if (rejectTarget.type === "operators") {
      await verifyOperator(rejectTarget.id, {
        status: "REJECTED",
        rejectionReason: rejectionReason.trim(),
      });
    } else if (rejectTarget.type === "vessels") {
      await verifyVessel(rejectTarget.id, {
        status: "REJECTED",
        rejectionReason: rejectionReason.trim(),
      });
    } else {
      await verifyTenant(rejectTarget.id, {
        verificationStatus: "REJECTED",
        rejectionReason: rejectionReason.trim(),
      });
    }

    setFeedback(`${rejectTarget.name} telah ditolak (REJECTED).`);
    setRejectTarget(null);
    setRejectionReason("");
  };

  return (
    <div className="space-y-6">
      {/* Summary Tabs & Filter */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("operators")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === "operators"
                ? "bg-[#0B241E] text-white"
                : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
            }`}
          >
            <Building2 className="w-4 h-4 text-[#D97706]" />
            Operator Kapal
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800">
              {pendingOps}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("vessels")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === "vessels"
                ? "bg-[#0B241E] text-white"
                : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
            }`}
          >
            <Ship className="w-4 h-4 text-[#D97706]" />
            Armada Kapal
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800">
              {pendingVessels}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tenants")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === "tenants"
                ? "bg-[#0B241E] text-white"
                : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
            }`}
          >
            <Store className="w-4 h-4 text-[#D97706]" />
            Tenant Mitra
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800">
              {pendingTenants}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as VerificationStatus | "")}
            className="px-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0B241E]"
          >
            <option value="PENDING">Menunggu Verifikasi (PENDING)</option>
            <option value="VERIFIED">Terverifikasi (VERIFIED)</option>
            <option value="REJECTED">Ditolak (REJECTED)</option>
            <option value="">Semua Status</option>
          </select>

          <button
            type="button"
            onClick={() => fetchVerificationData()}
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

      {/* Main Content */}
      {isLoading ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 flex items-center justify-center gap-2 text-xs text-[#64748B]">
          <Loader2 className="w-4 h-4 animate-spin" />
          Memuat antrean verifikasi...
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
          {activeTab === "operators" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B] bg-[#F8FAFC]">
                    <th className="py-3 px-4">Perusahaan / Operator</th>
                    <th className="py-3 px-4">NPWP & Kontak</th>
                    <th className="py-3 px-4">Profil</th>
                    <th className="py-3 px-4">Dokumen</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {filteredOperators.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-[#94A3B8]">
                        Tidak ada data operator untuk filter ini.
                      </td>
                    </tr>
                  ) : (
                    filteredOperators.map((op) => (
                      <tr key={op.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-4 font-bold text-[#0B241E]">
                          {op.name}
                          {op.rejectionReason && (
                            <p className="text-[11px] font-normal text-rose-600 mt-0.5">
                              Alasan: {op.rejectionReason}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[#475569]">
                          <div>NPWP: {op.npwp || "-"}</div>
                          <div className="text-[11px] text-[#64748B]">
                            {op.email || "-"} • {op.phone || "-"}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#475569]">
                          {op.operatorProfile}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#334155]">
                            <FileText className="w-3.5 h-3.5 text-[#D97706]" />
                            {op.documents?.length ?? 0} Berkas
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              STATUS_BADGE[op.verificationStatus]
                            }`}
                          >
                            {op.verificationStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {op.verificationStatus !== "VERIFIED" && (
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleApprove("operators", op.id, op.name)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Verifikasi
                            </button>
                          )}
                          {op.verificationStatus !== "REJECTED" && (
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() =>
                                setRejectTarget({ type: "operators", id: op.id, name: op.name })
                              }
                              className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Tolak
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "vessels" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B] bg-[#F8FAFC]">
                    <th className="py-3 px-4">Nama Kapal</th>
                    <th className="py-3 px-4">Operator</th>
                    <th className="py-3 px-4">No. Registrasi / IMO</th>
                    <th className="py-3 px-4">GT & Kategori</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {filteredVessels.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-[#94A3B8]">
                        Tidak ada data kapal untuk filter ini.
                      </td>
                    </tr>
                  ) : (
                    filteredVessels.map((v) => (
                      <tr key={v.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-4 font-bold text-[#0B241E]">
                          {v.name}
                          <div className="text-[11px] font-normal text-[#64748B]">
                            Bendera: {v.flag}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#475569]">
                          {v.operator?.name || `Operator #${v.operatorId}`}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#334155]">
                          <div>{v.registrationNumber}</div>
                          <div className="text-[#94A3B8]">{v.imoNumber || "-"}</div>
                        </td>
                        <td className="py-3 px-4 text-[#475569]">
                          <div className="font-bold">{Number(v.grossTonnage)} GT</div>
                          <div className="text-[10px] text-[#94A3B8]">
                            {v.vesselCategory} • {v.shippingCategory}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              STATUS_BADGE[v.verificationStatus]
                            }`}
                          >
                            {v.verificationStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {v.verificationStatus !== "VERIFIED" && (
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleApprove("vessels", v.id, v.name)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Verifikasi
                            </button>
                          )}
                          {v.verificationStatus !== "REJECTED" && (
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() =>
                                setRejectTarget({ type: "vessels", id: v.id, name: v.name })
                              }
                              className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Tolak
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "tenants" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B] bg-[#F8FAFC]">
                    <th className="py-3 px-4">Nama Usaha / Tenant</th>
                    <th className="py-3 px-4">NIB / NPWP</th>
                    <th className="py-3 px-4">Kontak</th>
                    <th className="py-3 px-4">Dokumen</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {filteredTenants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-[#94A3B8]">
                        Belum ada data tenant mitra untuk filter ini.
                      </td>
                    </tr>
                  ) : (
                    filteredTenants.map((t) => (
                      <tr key={t.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-4 font-bold text-[#0B241E]">
                          {t.name}
                          {t.rejectionReason && (
                            <p className="text-[11px] font-normal text-rose-600 mt-0.5">
                              Alasan: {t.rejectionReason}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[#475569]">
                          <div>NIB: {t.nib || "-"}</div>
                          <div className="text-[11px] text-[#64748B]">
                            NPWP: {t.npwp || "-"}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#475569]">
                          <div>{t.email || "-"}</div>
                          <div className="text-[11px] text-[#64748B]">{t.phone || "-"}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#334155]">
                            <FileText className="w-3.5 h-3.5 text-[#D97706]" />
                            {t.documents?.length ?? 0} Berkas
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              STATUS_BADGE[t.verificationStatus]
                            }`}
                          >
                            {t.verificationStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {t.verificationStatus !== "VERIFIED" && (
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleApprove("tenants", t.id, t.name)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Verifikasi
                            </button>
                          )}
                          {t.verificationStatus !== "REJECTED" && (
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() =>
                                setRejectTarget({ type: "tenants", id: t.id, name: t.name })
                              }
                              className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Tolak
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmReject}
            className="bg-white rounded-2xl border border-[#E2E8F0] w-full max-w-md p-6 space-y-4 shadow-xl"
          >
            <h3 className="text-base font-extrabold text-[#0B241E]">
              Tolak Verifikasi: {rejectTarget.name}
            </h3>
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Alasan Penolakan
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Misal: Dokumen SIUPAL / NPWP tidak terbaca atau masa berlaku habis"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
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
                Tolak Verifikasi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
