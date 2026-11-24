"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Search,
  RefreshCw,
  Eye,
  FileText,
  Plus,
  X,
  Phone,
  Mail,
  Filter,
  Edit3,
  Trash2,
  Loader2,
  AlertCircle,
  Upload,
  ExternalLink,
} from "lucide-react";
import { API_CONFIG } from "@/config/api.config";
import { useAuthStore } from "@/store/auth.store";
import { useUptStore } from "@/store/upt.store";
import { toast } from "@/store/toast.store";
import { UptService } from "@/services/upt.service";
import { formatLabel } from "@/lib/format-labels";
import { TablePagination } from "@/components/ui/table-pagination";
import { ShipOperatorItem } from "@/types/upt.types";

export default function MasterOperatorPage() {
  const { user } = useAuthStore();
  const {
    operators,
    isLoading,
    fetchVerificationData,
    uploadOperatorDocumentByOfficer,
  } = useUptStore();

  const isSuperadmin = user?.role === "SUPERADMIN";
  const isAdmin = user?.role === "ADMIN_PELABUHAN";
  const isRegistrasiKontrak = user?.role === "PETUGAS_REGISTRASI_KONTRAK";
  const canAccess = isSuperadmin || isAdmin || isRegistrasiKontrak;

  // Inline document upload state in Detail Modal (POST /operators/:id/documents)
  const [docCategory, setDocCategory] = useState<"SIUPAL_NIB" | "NPWP" | "LAINNYA">("SIUPAL_NIB");
  const [docNumber, setDocNumber] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const backendOrigin = API_CONFIG.BASE_URL.replace(/\/api\/v1\/?$/, "");
  const getBackendFileUrl = (filePath?: string | null): string | null => {
    if (!filePath) return null;
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) return filePath;
    return `${backendOrigin}/${filePath.replace(/^\/+/, "")}`;
  };

  const handleUploadDocForOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOperator || !docFile) return;
    setIsUploadingDoc(true);
    setErrorMsg(null);
    try {
      await uploadOperatorDocumentByOfficer(
        selectedOperator.id,
        {
          category: docCategory,
          documentNumber: docNumber.trim() || `${docCategory}-${new Date().getFullYear()}`,
          notes: "Diunggah oleh Petugas Registrasi & Kontrak",
        },
        docFile
      );
      const refreshed = await UptService.getOperatorById(selectedOperator.id);
      setSelectedOperator(refreshed);
      setDocNumber("");
      setDocFile(null);
      toast.success(
        "Berkas Diunggah",
        `Berkas ${formatLabel(docCategory)} untuk ${selectedOperator.name} berhasil diunggah!`
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal mengunggah dokumen operator.");
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [profileFilter, setProfileFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail Modal
  const [selectedOperator, setSelectedOperator] = useState<ShipOperatorItem | null>(null);

  // Create/Edit Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState<ShipOperatorItem | null>(null);
  const [operatorForm, setOperatorForm] = useState({
    name: "",
    npwp: "",
    phone: "",
    email: "",
    address: "",
    operatorProfile: "REGULAR_SCHEDULED" as "REGULAR_SCHEDULED" | "INCIDENTAL",
  });

  useEffect(() => {
    if (canAccess) {
      fetchVerificationData();
    }
  }, [canAccess, fetchVerificationData]);

  const openCreateModal = () => {
    setEditingOperator(null);
    setOperatorForm({
      name: "",
      npwp: "",
      phone: "",
      email: "",
      address: "",
      operatorProfile: "REGULAR_SCHEDULED",
    });
    setErrorMsg(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (op: ShipOperatorItem) => {
    setEditingOperator(op);
    setOperatorForm({
      name: op.name,
      npwp: op.npwp || "",
      phone: op.phone || "",
      email: op.email || "",
      address: op.address || "",
      operatorProfile: op.operatorProfile,
    });
    setErrorMsg(null);
    setIsFormModalOpen(true);
  };

  const handleSaveOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const payload = {
        name: operatorForm.name.trim(),
        npwp: operatorForm.npwp.trim() || undefined,
        phone: operatorForm.phone.trim() || undefined,
        email: operatorForm.email.trim() || undefined,
        address: operatorForm.address.trim() || undefined,
        operatorProfile: operatorForm.operatorProfile,
      };
      if (editingOperator) {
        await UptService.updateOperator(editingOperator.id, payload);
        toast.success("Operator Diperbarui", `Data operator "${payload.name}" berhasil diperbarui.`);
      } else {
        await UptService.createOperator(payload);
        toast.success("Operator Ditambahkan", `Operator baru "${payload.name}" berhasil ditambahkan.`);
      }
      setIsFormModalOpen(false);
      await fetchVerificationData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal menyimpan data operator.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivateOperator = async (op: ShipOperatorItem) => {
    if (!confirm(`Nonaktifkan operator "${op.name}" dari daftar aktif?`)) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await UptService.updateOperator(op.id, { isActive: false });
      toast.success("Operator Dinonaktifkan", `Operator "${op.name}" telah dinonaktifkan.`);
      await fetchVerificationData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal menonaktifkan operator.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOperators = useMemo(() => {
    return operators.filter((op) => {
      const matchSearch =
        searchQuery === "" ||
        op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (op.npwp && op.npwp.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (op.email && op.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (op.phone && op.phone.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchProfile = profileFilter === "" || op.operatorProfile === profileFilter;
      const matchStatus = statusFilter === "" || op.verificationStatus === statusFilter;

      return matchSearch && matchProfile && matchStatus;
    });
  }, [operators, searchQuery, profileFilter, statusFilter]);

  const totalPages = Math.ceil(filteredOperators.length / itemsPerPage) || 1;
  const paginatedOperators = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOperators.slice(start, start + itemsPerPage);
  }, [filteredOperators, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex-1 flex flex-col sm:flex-row items-center gap-3 flex-wrap">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari nama operator, NPWP, kontak..."
                className="w-full pl-9 pr-3.5 py-2 text-xs border border-[#CBD5E1] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#133D31]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <Filter className="w-4 h-4 text-[#64748B] shrink-0" />
              <select
                value={profileFilter}
                onChange={(e) => {
                  setProfileFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="py-2 px-3 text-xs border border-[#CBD5E1] rounded-xl bg-white font-medium text-[#1E293B]"
              >
                <option value="">Semua Profil Jadwal</option>
                <option value="REGULAR_SCHEDULED">Jadwal Reguler</option>
                <option value="INCIDENTAL">Insidental / Sewa</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="py-2 px-3 text-xs border border-[#CBD5E1] rounded-xl bg-white font-medium text-[#1E293B]"
              >
                <option value="">Semua Status</option>
                <option value="VERIFIED">Terverifikasi</option>
                <option value="PENDING">Menunggu</option>
                <option value="REJECTED">Ditolak</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => fetchVerificationData()}
              className="p-2 border border-[#CBD5E1] rounded-xl bg-white hover:bg-[#F8FAFC] text-[#475569] transition-colors cursor-pointer"
              title="Muat Ulang"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            {isSuperadmin && (
              <button
                type="button"
                onClick={openCreateModal}
                className="px-4 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#D97706]" />
                Tambah Operator
              </button>
            )}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] bg-[#F8FAFC]">
                <th className="py-3.5 px-5">Perusahaan Operator Kapal</th>
                <th className="py-3.5 px-4">Kontak & Alamat</th>
                <th className="py-3.5 px-4">Profil Operasional</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-xs">
              {paginatedOperators.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#94A3B8]">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-[#CBD5E1]" />
                    <p className="font-medium">Tidak ada data operator yang sesuai.</p>
                  </td>
                </tr>
              ) : (
                paginatedOperators.map((op) => (
                  <tr key={op.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-[#0B241E] text-sm flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#133D31] shrink-0" />
                        {op.name}
                      </div>
                      <div className="font-mono text-[11px] text-[#64748B] mt-0.5">
                        NPWP: {op.npwp || "Belum diisi"}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-[#1E293B] font-medium flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-[#64748B]" />
                        {op.phone || "-"}
                      </div>
                      <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-[#64748B]" />
                        {op.email || "-"}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {op.operatorProfile === "REGULAR_SCHEDULED"
                          ? "Jadwal Reguler"
                          : "Insidental"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${op.verificationStatus === "VERIFIED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : op.verificationStatus === "REJECTED"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                      >
                        {formatLabel(op.verificationStatus)}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedOperator(op)}
                        className="px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#1E293B] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#133D31]" />
                        Detail
                      </button>
                      {canAccess && (
                        <>
                          <button
                            type="button"
                            onClick={() => openEditModal(op)}
                            className="px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#1E293B] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#D97706]" />
                            Ubah
                          </button>
                          {isSuperadmin && (
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleDeactivateOperator(op)}
                              className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                              title="Nonaktifkan Operator"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredOperators.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Create / Edit Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form
            onSubmit={handleSaveOperator}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E2E8F0] p-6 sm:p-8 space-y-5"
          >
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#F1F5F9]">
              <div>
                <h3 className="text-base font-extrabold text-[#0B241E]">
                  {editingOperator
                    ? `Ubah Operator: ${editingOperator.name}`
                    : "Tambah Master Operator Kapal"}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Data induk perusahaan pelayaran atau agen kapal resmi yang beroperasi di pelabuhan.
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Nama Perusahaan Pelayaran / Operator
                </label>
                <input
                  type="text"
                  required
                  value={operatorForm.name}
                  onChange={(e) =>
                    setOperatorForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Contoh: PT Pelayaran Mimika Sejahtera"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Profil Operasional
                </label>
                <select
                  value={operatorForm.operatorProfile}
                  onChange={(e) =>
                    setOperatorForm((prev) => ({
                      ...prev,
                      operatorProfile: e.target.value as
                        | "REGULAR_SCHEDULED"
                        | "INCIDENTAL",
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
                >
                  <option value="REGULAR_SCHEDULED">Jadwal Reguler (Trayek Tetap)</option>
                  <option value="INCIDENTAL">Insidental / Non-Reguler</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  NPWP Perusahaan
                </label>
                <input
                  type="text"
                  value={operatorForm.npwp}
                  onChange={(e) =>
                    setOperatorForm((prev) => ({ ...prev, npwp: e.target.value }))
                  }
                  placeholder="01.234.567.8-954.000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  value={operatorForm.phone}
                  onChange={(e) =>
                    setOperatorForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="08123456789"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Email Resmi
                </label>
                <input
                  type="email"
                  value={operatorForm.email}
                  onChange={(e) =>
                    setOperatorForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="ops@mimika-shipping.co.id"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Alamat Kantor
                </label>
                <textarea
                  rows={2}
                  value={operatorForm.address}
                  onChange={(e) =>
                    setOperatorForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder="Alamat lengkap kantor operasional"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
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
                Simpan Operator
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Detail Modal */}
      {selectedOperator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#133D31]/10 flex items-center justify-center text-[#133D31]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B241E]">{selectedOperator.name}</h3>
                  <p className="text-xs text-[#64748B]">
                    NPWP: {selectedOperator.npwp || "Belum diisi"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOperator(null)}
                className="p-2 text-[#94A3B8] hover:text-[#475569] rounded-lg hover:bg-[#F1F5F9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B]">Profil Operasional:</span>
                  <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                    {selectedOperator.operatorProfile === "REGULAR_SCHEDULED"
                      ? "Jadwal Reguler (Trayek Tetap)"
                      : "Insidental / Non-Reguler"}
                  </p>
                </div>
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B]">Status Verifikasi:</span>
                  <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                    {formatLabel(selectedOperator.verificationStatus)}
                  </p>
                </div>
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B]">Nomor Telepon:</span>
                  <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                    {selectedOperator.phone || "-"}
                  </p>
                </div>
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B]">Alamat Email:</span>
                  <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                    {selectedOperator.email || "-"}
                  </p>
                </div>
                <div className="col-span-2 p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B]">Alamat Kantor:</span>
                  <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                    {selectedOperator.address || "Belum ada alamat terdaftar."}
                  </p>
                </div>
              </div>

              {/* Dokumen Perusahaan */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#0B241E] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#133D31]" />
                  Dokumen Legalitas &amp; SIUPAL Perusahaan
                </h4>
                {!selectedOperator.documents || selectedOperator.documents.length === 0 ? (
                  <p className="text-[#94A3B8] italic p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                    Belum ada dokumen legalitas terunggah.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedOperator.documents.map((doc) => {
                      const docUrl = getBackendFileUrl(doc.filePath);
                      return (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-[#1E293B] truncate">
                              {formatLabel(doc.category)}
                            </div>
                            <div className="text-[11px] text-[#64748B] truncate">
                              {doc.documentNumber || doc.fileName}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {docUrl && (
                              <a
                                href={docUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-white border border-[#CBD5E1] text-[#0B241E] hover:bg-[#0B241E] hover:text-white text-[10.5px] font-bold inline-flex items-center gap-1"
                              >
                                <span>Buka</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
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
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Form Unggah Berkas Legalitas oleh Petugas (POST /operators/:id/documents) */}
                <form
                  onSubmit={handleUploadDocForOperator}
                  className="p-4 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-3"
                >
                  <p className="text-xs font-extrabold text-[#0B241E] flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Unggah Berkas Legalitas Perusahaan (Oleh Petugas)</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#334155] mb-1">
                        Kategori Berkas
                      </label>
                      <select
                        value={docCategory}
                        onChange={(e) =>
                          setDocCategory(
                            e.target.value as "SIUPAL_NIB" | "NPWP" | "LAINNYA"
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-xs font-semibold"
                      >
                        <option value="SIUPAL_NIB">SIUPAL / NIB</option>
                        <option value="NPWP">NPWP Badan Usaha</option>
                        <option value="LAINNYA">Akta / Domisili / Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#334155] mb-1">
                        Nomor Surat / Dokumen
                      </label>
                      <input
                        type="text"
                        value={docNumber}
                        onChange={(e) => setDocNumber(e.target.value)}
                        placeholder="Contoh: SIUPAL-042/2026"
                        className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <input
                      type="file"
                      required
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                      className="text-xs text-[#64748B] file:mr-2.5 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#0B241E] file:text-white file:font-bold cursor-pointer"
                    />
                    <button
                      type="submit"
                      disabled={isUploadingDoc || !docFile}
                      className="px-3.5 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {isUploadingDoc ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-[#D97706]" />
                      )}
                      <span>Unggah Berkas</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOperator(null)}
                className="px-4 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#1E293B] hover:bg-[#F1F5F9]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
