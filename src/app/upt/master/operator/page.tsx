"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Search,
  RefreshCw,
  Eye,
  Plus,
  Phone,
  Mail,
  Filter,
  Edit3,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useUptStore } from "@/store/upt.store";
import { toast } from "@/store/toast.store";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { UptService } from "@/services/upt.service";
import { TablePagination } from "@/components/ui/table-pagination";
import { StatusDot } from "@/components/ui/status-indicator";
import { ShipOperatorItem } from "@/types/upt.types";
import {
  OperatorFormModal,
  OperatorFormValues,
} from "@/components/upt/master/operator/OperatorFormModal";
import { OperatorDetailModal } from "@/components/upt/master/operator/OperatorDetailModal";

export default function MasterOperatorPage() {
  const { user } = useAuthStore();
  const { operators, isLoading, fetchVerificationData } = useUptStore();

  const isSuperadmin = user?.role === "SUPERADMIN";
  const isAdmin = user?.role === "ADMIN_PELABUHAN";
  const isRegistrasiKontrak = user?.role === "PETUGAS_REGISTRASI_KONTRAK";
  const canAccess = isSuperadmin || isAdmin || isRegistrasiKontrak;

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
  const [operatorForm, setOperatorForm] = useState<OperatorFormValues>({
    name: "",
    npwp: "",
    phone: "",
    email: "",
    address: "",
    operatorProfile: "REGULAR_SCHEDULED",
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

  const [deactivateTarget, setDeactivateTarget] = useState<ShipOperatorItem | null>(null);

  const handleDeactivateOperator = (op: ShipOperatorItem) => {
    setDeactivateTarget(op);
  };

  const confirmDeactivateOperator = async () => {
    if (!deactivateTarget) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await UptService.updateOperator(deactivateTarget.id, { isActive: false });
      toast.success(
        "Operator Dinonaktifkan",
        `Operator "${deactivateTarget.name}" telah dinonaktifkan.`
      );
      setDeactivateTarget(null);
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
              <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                <th className="py-3 px-5">Perusahaan Operator</th>
                <th className="py-3 px-4 hidden md:table-cell">Kontak</th>
                <th className="py-3 px-4 hidden sm:table-cell">Profil</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedOperators.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Building2 className="w-7 h-7 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium">Tidak ada data operator yang sesuai.</p>
                  </td>
                </tr>
              ) : (
                paginatedOperators.map((op) => (
                  <tr key={op.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900">{op.name}</div>
                      <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                        NPWP: {op.npwp || "-"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <div className="text-slate-800 font-medium flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {op.phone || "-"}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {op.email || "-"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 hidden sm:table-cell font-medium text-slate-700">
                      {op.operatorProfile === "REGULAR_SCHEDULED"
                        ? "Jadwal Reguler"
                        : "Insidental"}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusDot status={op.verificationStatus} />
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-0.5">
                        <button
                          type="button"
                          onClick={() => setSelectedOperator(op)}
                          title="Lihat Detail Operator"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canAccess && (
                          <button
                            type="button"
                            onClick={() => openEditModal(op)}
                            title="Ubah Operator"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        {isSuperadmin && (
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleDeactivateOperator(op)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Nonaktifkan Operator"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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

      <OperatorFormModal
        isOpen={isFormModalOpen}
        editingOperator={editingOperator}
        form={operatorForm}
        isSubmitting={isSubmitting}
        onChange={setOperatorForm}
        onSubmit={handleSaveOperator}
        onClose={() => setIsFormModalOpen(false)}
      />

      <OperatorDetailModal
        operator={selectedOperator}
        onClose={() => setSelectedOperator(null)}
        onOperatorUpdated={setSelectedOperator}
        onError={setErrorMsg}
      />

      <ConfirmActionModal
        isOpen={Boolean(deactivateTarget)}
        title={`Nonaktifkan Operator "${deactivateTarget?.name ?? ""}"?`}
        description="Operator akan disembunyikan dari daftar aktif. Riwayat kapal dan transaksi sebelumnya tetap tersimpan aman."
        confirmLabel="Nonaktifkan"
        variant="danger"
        isLoading={isSubmitting}
        onConfirm={() => void confirmDeactivateOperator()}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  );
}
