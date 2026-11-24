"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Ship,
  Search,
  RefreshCw,
  Eye,
  FileText,
  X,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Building2,
  GitMerge,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useUptStore } from "@/store/upt.store";
import { UptService } from "@/services/upt.service";
import { formatLabel } from "@/lib/format-labels";
import { TablePagination } from "@/components/ui/table-pagination";
import { StatusDot } from "@/components/ui/status-indicator";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { VesselItem } from "@/types/upt.types";
import { VesselConflictErrorDetails } from "@/types/kapal.types";
import { ApiException } from "@/lib/api-client";

export default function MasterKapalPage() {
  const { user } = useAuthStore();
  const { vessels, operators, isLoading, fetchVerificationData } = useUptStore();

  const isSuperadmin = user?.role === "SUPERADMIN";
  const isAdmin = user?.role === "ADMIN_PELABUHAN" || user?.role === "KEPALA_PELABUHAN";
  const canAccess = isSuperadmin || isAdmin;

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [shippingFilter, setShippingFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail Modal
  const [selectedVessel, setSelectedVessel] = useState<VesselItem | null>(null);

  // Create/Edit Modal (Global Independent Vessel — operatorId opsional!)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<VesselItem | null>(null);
  const [operatorId, setOperatorId] = useState<string>("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [imoNumber, setImoNumber] = useState("");
  const [name, setName] = useState("");
  const [flag, setFlag] = useState("Indonesia");
  const [grossTonnage, setGrossTonnage] = useState("");
  const [shipType, setShipType] = useState<"NIAGA" | "NON_NIAGA">("NIAGA");
  const [vesselCategory, setVesselCategory] = useState<"BARANG" | "PENUMPANG" | "CAMPURAN">("CAMPURAN");
  const [shippingCategory, setShippingCategory] = useState<"DALAM_NEGERI" | "LUAR_NEGERI" | "PELRA_PERINTIS">("DALAM_NEGERI");
  const [lengthMeters, setLengthMeters] = useState("");
  const [draftMeters, setDraftMeters] = useState("");
  const [conflictWarning, setConflictWarning] = useState<VesselConflictErrorDetails | null>(null);

  // Merge Duplicate Vessel Modal (SUPERADMIN only)
  const [mergeSource, setMergeSource] = useState<VesselItem | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<string>("");

  // Safe Confirm Modals (replaces native confirm/prompt)
  const [deactivateTarget, setDeactivateTarget] = useState<VesselItem | null>(null);
  const [rejectClaimTarget, setRejectClaimTarget] = useState<{
    operatorId: number;
    vesselId: number;
    operatorName: string;
  } | null>(null);

  useEffect(() => {
    if (canAccess) {
      fetchVerificationData();
    }
  }, [canAccess, fetchVerificationData]);

  const openCreateModal = () => {
    setEditingVessel(null);
    setOperatorId("");
    setRegistrationNumber("");
    setImoNumber("");
    setName("");
    setFlag("Indonesia");
    setGrossTonnage("");
    setShipType("NIAGA");
    setVesselCategory("CAMPURAN");
    setShippingCategory("DALAM_NEGERI");
    setLengthMeters("");
    setDraftMeters("");
    setConflictWarning(null);
    setErrorMsg(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (v: VesselItem) => {
    setEditingVessel(v);
    setOperatorId(v.operatorId ? String(v.operatorId) : "");
    setRegistrationNumber(v.registrationNumber);
    setImoNumber(v.imoNumber || "");
    setName(v.name);
    setFlag(v.flag || "Indonesia");
    setGrossTonnage(String(v.grossTonnage));
    setShipType(v.shipType);
    setVesselCategory(v.vesselCategory);
    setShippingCategory(v.shippingCategory);
    setLengthMeters(v.lengthMeters ? String(v.lengthMeters) : "");
    setDraftMeters(v.draftMeters ? String(v.draftMeters) : "");
    setConflictWarning(null);
    setErrorMsg(null);
    setIsFormModalOpen(true);
  };

  const submitVesselPayload = async (confirmNotDuplicate = false) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      const payload = {
        ...(operatorId ? { operatorId: Number(operatorId) } : {}),
        ...(confirmNotDuplicate ? { confirmNotDuplicate: true } : {}),
        registrationNumber: registrationNumber.trim(),
        imoNumber: imoNumber.trim() || undefined,
        name: name.trim(),
        flag: flag.trim() || "Indonesia",
        grossTonnage: Number(grossTonnage),
        shipType,
        vesselCategory,
        shippingCategory,
        lengthMeters: lengthMeters ? Number(lengthMeters) : undefined,
        draftMeters: draftMeters ? Number(draftMeters) : undefined,
      };
      if (editingVessel) {
        await UptService.updateVessel(editingVessel.id, payload);
        setFeedback(`Master kapal "${payload.name}" berhasil diperbarui.`);
      } else {
        await UptService.createVessel(payload);
        setFeedback(`Master kapal global "${payload.name}" berhasil ditambahkan.`);
      }
      setConflictWarning(null);
      setIsFormModalOpen(false);
      await fetchVerificationData();
    } catch (err) {
      if (err instanceof ApiException && err.statusCode === 409 && err.details && typeof err.details === "object") {
        const details = err.details as VesselConflictErrorDetails;
        if (details.code === "POSSIBLE_DUPLICATE_VESSEL" || details.code === "DUPLICATE_VESSEL_IDENTITY") {
          setConflictWarning(details);
          setIsSubmitting(false);
          return;
        }
      }
      setErrorMsg(err instanceof Error ? err.message : "Gagal menyimpan data kapal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveVessel = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitVesselPayload(false);
  };

  const confirmDeactivateVessel = async () => {
    if (!deactivateTarget) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      await UptService.updateVessel(deactivateTarget.id, { isActive: false });
      setFeedback(`Kapal "${deactivateTarget.name}" telah dinonaktifkan.`);
      setDeactivateTarget(null);
      await fetchVerificationData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal menonaktifkan kapal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyClaim = async (
    opId: number,
    vesselId: number,
    status: "VERIFIED" | "REJECTED",
    rejectionReason?: string
  ) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      await UptService.verifyVesselClaim(opId, vesselId, { status, rejectionReason });
      setFeedback(`Status klaim armada berhasil diubah menjadi ${formatLabel(status)}.`);
      await fetchVerificationData();
      setSelectedVessel(null);
      setRejectClaimTarget(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal memverifikasi klaim kapal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmMerge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mergeSource || !mergeTargetId) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      await UptService.mergeDuplicateVessel(mergeSource.id, Number(mergeTargetId));
      setFeedback(
        `Kapal duplikat "${mergeSource.name}" berhasil digabungkan ke master kapal target.`
      );
      setMergeSource(null);
      setMergeTargetId("");
      await fetchVerificationData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal menggabungkan kapal duplikat.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLinkedOperatorsLabel = (v: VesselItem) => {
    const activeLinks = (v.operatorLinks || []).filter((l) => l.isActive);
    if (activeLinks.length > 0) {
      return activeLinks;
    }
    if (v.operator) {
      return [
        {
          id: 0,
          operatorId: v.operator.id,
          vesselId: v.id,
          relationshipType: "OWNER" as const,
          verificationStatus: v.verificationStatus,
          isActive: true,
          operator: v.operator,
        },
      ];
    }
    return [];
  };

  const filteredVessels = useMemo(() => {
    return vessels.filter((v) => {
      const q = searchQuery.toLowerCase();
      const linkedNames = (v.operatorLinks || [])
        .map((l) => l.operator?.name?.toLowerCase() || "")
        .join(" ");
      const matchSearch =
        searchQuery === "" ||
        v.name.toLowerCase().includes(q) ||
        v.registrationNumber.toLowerCase().includes(q) ||
        (v.imoNumber && v.imoNumber.toLowerCase().includes(q)) ||
        (v.operator?.name && v.operator.name.toLowerCase().includes(q)) ||
        linkedNames.includes(q);

      const matchCategory = categoryFilter === "" || v.vesselCategory === categoryFilter;
      const matchShipping = shippingFilter === "" || v.shippingCategory === shippingFilter;

      return matchSearch && matchCategory && matchShipping;
    });
  }, [vessels, searchQuery, categoryFilter, shippingFilter]);

  const totalPages = Math.ceil(filteredVessels.length / itemsPerPage) || 1;
  const paginatedVessels = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVessels.slice(start, start + itemsPerPage);
  }, [filteredVessels, currentPage, itemsPerPage]);

  return (
    <div className="space-y-4">
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

      {/* Single Clean Unified Table Container (No nested boxes) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* Integrated Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 flex-wrap">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari kapal, no. reg, IMO, perusahaan..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#0B241E]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="">Semua Kategori</option>
                <option value="PENUMPANG">Penumpang</option>
                <option value="BARANG">Barang</option>
                <option value="CAMPURAN">Campuran</option>
              </select>

              <select
                value={shippingFilter}
                onChange={(e) => {
                  setShippingFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="">Semua Trayek</option>
                <option value="DALAM_NEGERI">Dalam Negeri</option>
                <option value="LUAR_NEGERI">Luar Negeri</option>
                <option value="PELRA_PERINTIS">Pelayaran Rakyat</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fetchVerificationData()}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Muat Ulang"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            {isSuperadmin && (
              <button
                type="button"
                onClick={openCreateModal}
                className="px-3.5 py-2 rounded-lg bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Tambah Kapal</span>
              </button>
            )}
          </div>
        </div>

        {/* Spacious Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                <th className="py-3 px-5">Kapal & Identitas</th>
                <th className="py-3 px-4 hidden md:table-cell">Perusahaan Terhubung</th>
                <th className="py-3 px-4 hidden sm:table-cell">Kategori & Trayek</th>
                <th className="py-3 px-4 hidden lg:table-cell">Dimensi Teknis</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedVessels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Ship className="w-7 h-7 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium">Tidak ada data kapal yang sesuai.</p>
                  </td>
                </tr>
              ) : (
                paginatedVessels.map((v) => {
                  const linkedOps = getLinkedOperatorsLabel(v);
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900">{v.name}</div>
                        <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                          {v.registrationNumber}
                          {v.imoNumber ? ` • IMO ${v.imoNumber}` : ""}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        {linkedOps.length === 0 ? (
                          <span className="text-slate-400 italic">Master Global</span>
                        ) : (
                          <div className="space-y-1">
                            {linkedOps.map((link) => (
                              <div key={`${v.id}-${link.operatorId}`} className="leading-snug">
                                <span className="font-medium text-slate-800">
                                  {link.operator?.name || `Operator #${link.operatorId}`}
                                </span>
                                <span className="text-[11px] text-slate-400 ml-1.5">
                                  ({formatLabel(link.relationshipType)}
                                  {link.verificationStatus === "PENDING" ? " • Pending" : ""})
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 hidden sm:table-cell">
                        <div className="font-medium text-slate-800">
                          {formatLabel(v.vesselCategory)}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {formatLabel(v.shippingCategory)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 hidden lg:table-cell">
                        <div className="font-medium text-slate-900">
                          {Number(v.grossTonnage).toLocaleString("id-ID")} GT
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          LOA {v.lengthMeters ?? "-"} m • Draft {v.draftMeters ?? "-"} m
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusDot status={v.verificationStatus} />
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-0.5">
                          <button
                            type="button"
                            onClick={() => setSelectedVessel(v)}
                            title="Lihat Detail Kapal"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isSuperadmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEditModal(v)}
                                title="Ubah Master Kapal"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => setDeactivateTarget(v)}
                                title="Nonaktifkan Kapal"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
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
          totalItems={filteredVessels.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Create / Edit Modal (GLOBAL INDEPENDENT MASTER VESSEL) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form
            onSubmit={handleSaveVessel}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E2E8F0] p-6 sm:p-8 space-y-5"
          >
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#F1F5F9]">
              <div>
                <h3 className="text-base font-extrabold text-[#0B241E]">
                  {editingVessel
                    ? `Ubah Master Kapal: ${editingVessel.name}`
                    : "Tambah Master Kapal Global Baru"}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Master kapal bersifat independen — tidak wajib terikat ke 1 perusahaan. Perusahaan dapat mengklaim kapal ini kapan saja.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {conflictWarning && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-2.5">
                <div className="flex items-start gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>{conflictWarning.message}</span>
                </div>
                {conflictWarning.existingVessel && (
                  <div className="p-2.5 rounded-xl bg-white border border-amber-200 font-mono text-[11px]">
                    Terdaftar: <strong>{conflictWarning.existingVessel.name}</strong> (Reg:{" "}
                    {conflictWarning.existingVessel.registrationNumber})
                  </div>
                )}
                {conflictWarning.similarVessels && conflictWarning.similarVessels.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="font-semibold text-[11px]">Kapal dengan nama mirip di katalog:</p>
                    {conflictWarning.similarVessels.map((sv) => (
                      <div
                        key={sv.id}
                        className="p-2 rounded-lg bg-white border border-amber-200 flex items-center justify-between text-[11px]"
                      >
                        <span>
                          <strong>{sv.name}</strong> ({sv.registrationNumber})
                        </span>
                        {sv.similarity && (
                          <span className="font-mono text-amber-700 font-bold">
                            Kemiripan {Math.round(sv.similarity * 100)}%
                          </span>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => submitVesselPayload(true)}
                      className="mt-2 px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs cursor-pointer"
                    >
                      Tetap Simpan (Konfirmasi Kapal Berbeda)
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Nama Kapal <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: KM Poumako Jaya"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Nomor Registrasi Kapal <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="Contoh: REG-PMK-021"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Nomor IMO (Opsional)
                </label>
                <input
                  type="text"
                  value={imoNumber}
                  onChange={(e) => setImoNumber(e.target.value)}
                  placeholder="IMO9123456"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Bendera Kebangsaan
                </label>
                <input
                  type="text"
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  placeholder="Indonesia"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Kategori Kapal
                </label>
                <select
                  value={vesselCategory}
                  onChange={(e) =>
                    setVesselCategory(e.target.value as "BARANG" | "PENUMPANG" | "CAMPURAN")
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
                >
                  <option value="PENUMPANG">Kapal Penumpang</option>
                  <option value="BARANG">Kapal Barang</option>
                  <option value="CAMPURAN">Kapal Campuran</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Trayek Pelayaran
                </label>
                <select
                  value={shippingCategory}
                  onChange={(e) =>
                    setShippingCategory(
                      e.target.value as "DALAM_NEGERI" | "LUAR_NEGERI" | "PELRA_PERINTIS"
                    )
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
                >
                  <option value="DALAM_NEGERI">Dalam Negeri</option>
                  <option value="LUAR_NEGERI">Luar Negeri</option>
                  <option value="PELRA_PERINTIS">Pelayaran Rakyat / Perintis</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Jenis Kapal
                </label>
                <select
                  value={shipType}
                  onChange={(e) => setShipType(e.target.value as "NIAGA" | "NON_NIAGA")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
                >
                  <option value="NIAGA">Kapal Niaga</option>
                  <option value="NON_NIAGA">Kapal Non-Niaga</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Tonase Kotor (GT) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={grossTonnage}
                  onChange={(e) => setGrossTonnage(e.target.value)}
                  placeholder="500"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Panjang Kapal / LOA (Meter)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={1}
                  value={lengthMeters}
                  onChange={(e) => setLengthMeters(e.target.value)}
                  placeholder="65"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Sarat Kapal / Draft (Meter)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0.5}
                  value={draftMeters}
                  onChange={(e) => setDraftMeters(e.target.value)}
                  placeholder="4.5"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Operator Awal (Opsional — Biarkan Kosong untuk Master Global Independen)
                </label>
                <select
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-medium bg-[#F8FAFC]"
                >
                  <option value="">-- Tanpa Ikatan Operator (Master Kapal Global Independen) --</option>
                  {operators.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Simpan Master Kapal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Merge Duplicate Vessel Modal (SUPERADMIN) */}
      {mergeSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <form
            onSubmit={handleConfirmMerge}
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-[#E2E8F0]"
          >
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <GitMerge className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0B241E]">
                    Gabungkan Kapal Duplikat (Merge)
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Sumber duplikat: <strong>{mergeSource.name}</strong> ({mergeSource.registrationNumber})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMergeSource(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
              Seluruh riwayat kunjungan, dokumen, sertifikat, dan klaim operator dari{" "}
              <strong>{mergeSource.name}</strong> akan dipindahkan secara atomik ke kapal target, lalu entri duplikat ini akan dinonaktifkan.
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Pilih Master Kapal Target (Utama)
              </label>
              <select
                required
                value={mergeTargetId}
                onChange={(e) => setMergeTargetId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
              >
                <option value="">-- Pilih Kapal Target --</option>
                {vessels
                  .filter((v) => v.id !== mergeSource.id && v.isActive)
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} — {v.registrationNumber} ({Number(v.grossTonnage)} GT)
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setMergeSource(null)}
                className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !mergeTargetId}
                className="px-5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Gabungkan Sekarang
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Detail Modal */}
      {selectedVessel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#133D31]/10 flex items-center justify-center text-[#133D31]">
                  <Ship className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B241E]">{selectedVessel.name}</h3>
                  <p className="text-xs text-[#64748B]">
                    Registrasi: {selectedVessel.registrationNumber}
                    {selectedVessel.imoNumber ? ` • IMO: ${selectedVessel.imoNumber}` : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVessel(null)}
                className="p-2 text-[#94A3B8] hover:text-[#475569] rounded-lg hover:bg-[#F1F5F9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B]">Bendera Kebangsaan:</span>
                  <p className="text-sm font-bold text-[#0B241E] mt-0.5">{selectedVessel.flag}</p>
                </div>
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B]">Kategori & Trayek:</span>
                  <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                    {formatLabel(selectedVessel.vesselCategory)} •{" "}
                    {formatLabel(selectedVessel.shippingCategory)}
                  </p>
                </div>
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B]">Tonase Kotor (GT):</span>
                  <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                    {Number(selectedVessel.grossTonnage).toLocaleString("id-ID")} GT
                  </p>
                </div>
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B]">LOA / Draft:</span>
                  <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                    {selectedVessel.lengthMeters ? `${selectedVessel.lengthMeters} m` : "-"} /{" "}
                    {selectedVessel.draftMeters ? `${selectedVessel.draftMeters} m` : "-"}
                  </p>
                </div>
              </div>

              {/* Perusahaan Terhubung (Many-to-Many OperatorVessel) */}
              <div>
                <h4 className="text-xs font-bold text-[#0B241E] mb-2.5 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#133D31]" />
                  Perusahaan Pelayaran / Agen Terhubung
                </h4>
                {getLinkedOperatorsLabel(selectedVessel).length === 0 ? (
                  <p className="text-[#94A3B8] italic p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                    Belum diklaim oleh perusahaan pelayaran mana pun (Master Global).
                  </p>
                ) : (
                  <div className="space-y-2">
                    {getLinkedOperatorsLabel(selectedVessel).map((link) => (
                      <div
                        key={`${selectedVessel.id}-${link.operatorId}`}
                        className="flex items-center justify-between gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]"
                      >
                        <div>
                          <div className="font-bold text-[#0B241E]">
                            {link.operator?.name || `Operator #${link.operatorId}`}
                          </div>
                          <div className="text-[11px] text-[#64748B] mt-0.5 flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                              {formatLabel(link.relationshipType)}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded font-semibold border ${
                                link.verificationStatus === "VERIFIED"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : link.verificationStatus === "REJECTED"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}
                            >
                              {formatLabel(link.verificationStatus)}
                            </span>
                          </div>
                        </div>

                        {link.verificationStatus === "PENDING" && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() =>
                                handleVerifyClaim(link.operatorId, selectedVessel.id, "VERIFIED")
                              }
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                            >
                              Setujui Klaim
                            </button>
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() =>
                                setRejectClaimTarget({
                                  operatorId: link.operatorId,
                                  vesselId: selectedVessel.id,
                                  operatorName:
                                    link.operator?.name || `Operator #${link.operatorId}`,
                                })
                              }
                              className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold cursor-pointer"
                            >
                              Tolak
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dokumen Kapal */}
              <div>
                <h4 className="text-xs font-bold text-[#0B241E] mb-2.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#133D31]" />
                  Dokumen Legalitas & Sertifikasi Kapal
                </h4>
                {!selectedVessel.documents || selectedVessel.documents.length === 0 ? (
                  <p className="text-[#94A3B8] italic p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                    Belum ada dokumen yang diunggah.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedVessel.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]"
                      >
                        <div>
                          <div className="font-semibold text-[#1E293B]">
                            {formatLabel(doc.category)}
                          </div>
                          <div className="text-[11px] text-[#64748B]">
                            {doc.documentNumber || doc.fileName}
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            doc.verificationStatus === "VERIFIED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {formatLabel(doc.verificationStatus)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              {isSuperadmin ? (
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedVessel;
                    setSelectedVessel(null);
                    setMergeSource(target);
                    setMergeTargetId("");
                  }}
                  className="text-xs font-medium text-slate-500 hover:text-indigo-700 inline-flex items-center gap-1.5 cursor-pointer"
                  title="Gunakan hanya jika data kapal ini ternyata dobel/typo dari kapal lain"
                >
                  <GitMerge className="w-3.5 h-3.5" />
                  <span>Gabungkan jika data ini dobel (typo)</span>
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => setSelectedVessel(null)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safe Confirm Modals */}
      <ConfirmActionModal
        isOpen={Boolean(deactivateTarget)}
        title={`Nonaktifkan Kapal "${deactivateTarget?.name ?? ""}"?`}
        description="Kapal akan disembunyikan dari katalog aktif. Riwayat kunjungan dan tagihan sebelumnya tetap tersimpan aman."
        confirmLabel="Nonaktifkan"
        variant="danger"
        isLoading={isSubmitting}
        onConfirm={confirmDeactivateVessel}
        onCancel={() => setDeactivateTarget(null)}
      />

      <ConfirmActionModal
        isOpen={Boolean(rejectClaimTarget)}
        title={`Tolak Klaim Armada (${rejectClaimTarget?.operatorName ?? ""})?`}
        description="Perusahaan ini tidak akan dapat mengajukan kunjungan sandar untuk kapal tersebut sampai mengajukan ulang dengan dokumen yang valid."
        confirmLabel="Tolak Klaim"
        variant="warning"
        requireReason
        reasonLabel="Alasan Penolakan Klaim"
        reasonPlaceholder="Contoh: Surat kuasa keagenan tidak sesuai atau masa berlaku habis..."
        isLoading={isSubmitting}
        onConfirm={(reason) => {
          if (!rejectClaimTarget) return;
          void handleVerifyClaim(
            rejectClaimTarget.operatorId,
            rejectClaimTarget.vesselId,
            "REJECTED",
            reason || "Dokumen kuasa/keagenan tidak valid"
          );
        }}
        onCancel={() => setRejectClaimTarget(null)}
      />
    </div>
  );
}
