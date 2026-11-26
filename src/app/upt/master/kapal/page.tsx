"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Ship,
  Search,
  RefreshCw,
  Eye,
  Filter,
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useUptStore } from "@/store/upt.store";
import { toast } from "@/store/toast.store";
import { UptService } from "@/services/upt.service";
import { formatLabel } from "@/lib/format-labels";
import { TablePagination } from "@/components/ui/table-pagination";
import { StatusDot } from "@/components/ui/status-indicator";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { VesselItem } from "@/types/upt.types";
import { VesselConflictErrorDetails } from "@/types/kapal.types";
import { ApiException } from "@/lib/api-client";
import {
  VesselFormModal,
  VesselFormState,
} from "@/components/upt/master/kapal/VesselFormModal";
import { VesselMergeModal } from "@/components/upt/master/kapal/VesselMergeModal";
import {
  VesselDetailModal,
  RejectClaimTarget,
} from "@/components/upt/master/kapal/VesselDetailModal";

export default function MasterKapalPage() {
  const { user } = useAuthStore();
  const {
    vessels,
    operators,
    isLoading,
    fetchVerificationData,
    uploadVesselDocumentByOfficer,
  } = useUptStore();

  const isSuperadmin = user?.role === "SUPERADMIN";
  const isAdmin = user?.role === "ADMIN_PELABUHAN" || user?.role === "KEPALA_PELABUHAN";
  const isRegistrasiKontrak = user?.role === "PETUGAS_REGISTRASI_KONTRAK";
  const canAccess = isSuperadmin || isAdmin || isRegistrasiKontrak;

  // Inline vessel document upload state (POST /vessels/:id/documents)
  const [vesselDocCategory, setVesselDocCategory] = useState<
    "SURAT_UKUR" | "PAS_BESAR_KECIL" | "LAINNYA"
  >("SURAT_UKUR");
  const [vesselDocNumber, setVesselDocNumber] = useState("");
  const [vesselDocFile, setVesselDocFile] = useState<File | null>(null);
  const [isUploadingVesselDoc, setIsUploadingVesselDoc] = useState(false);

  const handleUploadDocForVessel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVessel || !vesselDocFile) return;
    setIsUploadingVesselDoc(true);
    setErrorMsg(null);
    try {
      await uploadVesselDocumentByOfficer(
        selectedVessel.id,
        {
          category: vesselDocCategory,
          documentNumber:
            vesselDocNumber.trim() || `${vesselDocCategory}-${selectedVessel.registrationNumber}`,
          notes: "Diunggah oleh Petugas Registrasi & Kontrak",
        },
        vesselDocFile
      );
      const allVessels = await UptService.getVessels();
      const updated = allVessels.find((v) => v.id === selectedVessel.id);
      if (updated) setSelectedVessel(updated);
      setVesselDocNumber("");
      setVesselDocFile(null);
      toast.success(
        "Berkas Diunggah",
        `Berkas ${formatLabel(vesselDocCategory)} untuk kapal ${selectedVessel.name} berhasil diunggah!`
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal mengunggah dokumen kapal.");
    } finally {
      setIsUploadingVesselDoc(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [shippingFilter, setShippingFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail Modal
  const [selectedVessel, setSelectedVessel] = useState<VesselItem | null>(null);

  // Create/Edit Modal (Global Independent Vessel — operatorId opsional!)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<VesselItem | null>(null);
  const [vesselForm, setVesselForm] = useState<VesselFormState>({
    operatorId: "",
    registrationNumber: "",
    imoNumber: "",
    name: "",
    flag: "Indonesia",
    grossTonnage: "",
    shipType: "NIAGA",
    vesselCategory: "CAMPURAN",
    shippingCategory: "DALAM_NEGERI",
    lengthMeters: "",
    draftMeters: "",
  });
  const [conflictWarning, setConflictWarning] = useState<VesselConflictErrorDetails | null>(null);

  // Merge Duplicate Vessel Modal (SUPERADMIN only)
  const [mergeSource, setMergeSource] = useState<VesselItem | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<string>("");

  // Safe Confirm Modals (replaces native confirm/prompt)
  const [deactivateTarget, setDeactivateTarget] = useState<VesselItem | null>(null);
  const [rejectClaimTarget, setRejectClaimTarget] = useState<RejectClaimTarget | null>(null);

  useEffect(() => {
    if (canAccess) {
      fetchVerificationData();
    }
  }, [canAccess, fetchVerificationData]);

  const openCreateModal = () => {
    setEditingVessel(null);
    setVesselForm({
      operatorId: "",
      registrationNumber: "",
      imoNumber: "",
      name: "",
      flag: "Indonesia",
      grossTonnage: "",
      shipType: "NIAGA",
      vesselCategory: "CAMPURAN",
      shippingCategory: "DALAM_NEGERI",
      lengthMeters: "",
      draftMeters: "",
    });
    setConflictWarning(null);
    setErrorMsg(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (v: VesselItem) => {
    setEditingVessel(v);
    setVesselForm({
      operatorId: v.operatorId ? String(v.operatorId) : "",
      registrationNumber: v.registrationNumber,
      imoNumber: v.imoNumber || "",
      name: v.name,
      flag: v.flag || "Indonesia",
      grossTonnage: String(v.grossTonnage),
      shipType: v.shipType,
      vesselCategory: v.vesselCategory,
      shippingCategory: v.shippingCategory,
      lengthMeters: v.lengthMeters ? String(v.lengthMeters) : "",
      draftMeters: v.draftMeters ? String(v.draftMeters) : "",
    });
    setConflictWarning(null);
    setErrorMsg(null);
    setIsFormModalOpen(true);
  };

  const submitVesselPayload = async (confirmNotDuplicate = false) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const payload = {
        ...(vesselForm.operatorId ? { operatorId: Number(vesselForm.operatorId) } : {}),
        ...(confirmNotDuplicate ? { confirmNotDuplicate: true } : {}),
        registrationNumber: vesselForm.registrationNumber.trim(),
        imoNumber: vesselForm.imoNumber.trim() || undefined,
        name: vesselForm.name.trim(),
        flag: vesselForm.flag.trim() || "Indonesia",
        grossTonnage: Number(vesselForm.grossTonnage),
        shipType: vesselForm.shipType,
        vesselCategory: vesselForm.vesselCategory,
        shippingCategory: vesselForm.shippingCategory,
        lengthMeters: vesselForm.lengthMeters
          ? Number(vesselForm.lengthMeters)
          : undefined,
        draftMeters: vesselForm.draftMeters
          ? Number(vesselForm.draftMeters)
          : undefined,
      };
      if (editingVessel) {
        await UptService.updateVessel(editingVessel.id, payload);
        toast.success("Kapal Diperbarui", `Data kapal "${payload.name}" berhasil diperbarui.`);
      } else {
        await UptService.createVessel(payload);
        toast.success("Kapal Ditambahkan", `Kapal baru "${payload.name}" berhasil ditambahkan.`);
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
    try {
      if (!deactivateTarget) return;
      await UptService.updateVessel(deactivateTarget.id, { isActive: false });
      toast.success("Kapal Dinonaktifkan", `Kapal "${deactivateTarget.name}" telah dinonaktifkan.`);
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
    try {
      await UptService.verifyVesselClaim(opId, vesselId, { status, rejectionReason });
      toast.success(
        "Klaim Armada Diverifikasi",
        `Status klaim armada berhasil diubah menjadi ${formatLabel(status)}.`
      );
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
    try {
      await UptService.mergeDuplicateVessel(mergeSource.id, Number(mergeTargetId));
      toast.success(
        "Kapal Duplikat Digabungkan",
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

        {/* Main Table */}
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

      <VesselFormModal
        isOpen={isFormModalOpen}
        editingVessel={editingVessel}
        vesselForm={vesselForm}
        setVesselForm={setVesselForm}
        operators={operators}
        conflictWarning={conflictWarning}
        isSubmitting={isSubmitting}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSaveVessel}
        onConfirmNotDuplicate={() => submitVesselPayload(true)}
      />

      <VesselMergeModal
        mergeSource={mergeSource}
        mergeTargetId={mergeTargetId}
        onMergeTargetIdChange={setMergeTargetId}
        vessels={vessels}
        isSubmitting={isSubmitting}
        onClose={() => setMergeSource(null)}
        onSubmit={handleConfirmMerge}
      />

      <VesselDetailModal
        vessel={selectedVessel}
        linkedOperators={selectedVessel ? getLinkedOperatorsLabel(selectedVessel) : []}
        isSuperadmin={isSuperadmin}
        isSubmitting={isSubmitting}
        vesselDocCategory={vesselDocCategory}
        onVesselDocCategoryChange={setVesselDocCategory}
        vesselDocNumber={vesselDocNumber}
        onVesselDocNumberChange={setVesselDocNumber}
        vesselDocFile={vesselDocFile}
        onVesselDocFileChange={setVesselDocFile}
        isUploadingVesselDoc={isUploadingVesselDoc}
        onUploadDoc={handleUploadDocForVessel}
        onApproveClaim={(operatorId, vesselId) =>
          handleVerifyClaim(operatorId, vesselId, "VERIFIED")
        }
        onRejectClaim={setRejectClaimTarget}
        onOpenMerge={(target) => {
          setSelectedVessel(null);
          setMergeSource(target);
          setMergeTargetId("");
        }}
        onClose={() => setSelectedVessel(null)}
      />

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
