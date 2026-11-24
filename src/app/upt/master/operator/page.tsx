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
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useUptStore } from "@/store/upt.store";
import { UptService } from "@/services/upt.service";
import { formatLabel } from "@/lib/format-labels";
import { TablePagination } from "@/components/ui/table-pagination";
import { StatusDot } from "@/components/ui/status-indicator";
import { ShipOperatorItem } from "@/types/upt.types";

export default function MasterOperatorPage() {
  const { user } = useAuthStore();
  const { operators, isLoading, fetchVerificationData } = useUptStore();

  const isSuperadmin = user?.role === "SUPERADMIN";
  const isAdmin = user?.role === "ADMIN_PELABUHAN";
  const canAccess = isSuperadmin || isAdmin;

  const [searchQuery, setSearchQuery] = useState("");
  const [profileFilter, setProfileFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail Modal
  const [selectedOperator, setSelectedOperator] = useState<ShipOperatorItem | null>(null);

  // Create/Edit Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState<ShipOperatorItem | null>(null);
  const [name, setName] = useState("");
  const [npwp, setNpwp] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [operatorProfile, setOperatorProfile] = useState<"REGULAR_SCHEDULED" | "INCIDENTAL">("REGULAR_SCHEDULED");

  useEffect(() => {
    if (canAccess) {
      fetchVerificationData();
    }
  }, [canAccess, fetchVerificationData]);

  const openCreateModal = () => {
    setEditingOperator(null);
    setName("");
    setNpwp("");
    setPhone("");
    setEmail("");
    setAddress("");
    setOperatorProfile("REGULAR_SCHEDULED");
    setErrorMsg(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (op: ShipOperatorItem) => {
    setEditingOperator(op);
    setName(op.name);
    setNpwp(op.npwp || "");
    setPhone(op.phone || "");
    setEmail(op.email || "");
    setAddress(op.address || "");
    setOperatorProfile(op.operatorProfile);
    setErrorMsg(null);
    setIsFormModalOpen(true);
  };

  const handleSaveOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      const payload = {
        name: name.trim(),
        npwp: npwp.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        operatorProfile,
      };
      if (editingOperator) {
        await UptService.updateOperator(editingOperator.id, payload);
        setFeedback(`Data operator "${payload.name}" berhasil diperbarui.`);
      } else {
        await UptService.createOperator(payload);
        setFeedback(`Operator baru "${payload.name}" berhasil ditambahkan.`);
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
    setFeedback(null);
    try {
      await UptService.updateOperator(op.id, { isActive: false });
      setFeedback(`Operator "${op.name}" telah dinonaktifkan.`);
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

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

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
                        {isSuperadmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditModal(op)}
                              title="Ubah Operator"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleDeactivateOperator(op)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Nonaktifkan Operator"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: PT Pelayaran Mimika Sejahtera"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Profil Operasional
                </label>
                <select
                  value={operatorProfile}
                  onChange={(e) =>
                    setOperatorProfile(e.target.value as "REGULAR_SCHEDULED" | "INCIDENTAL")
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
                  value={npwp}
                  onChange={(e) => setNpwp(e.target.value)}
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
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
              <div>
                <h4 className="text-xs font-bold text-[#0B241E] mb-2.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#133D31]" />
                  Dokumen Legalitas & SIUPAL Perusahaan
                </h4>
                {!selectedOperator.documents || selectedOperator.documents.length === 0 ? (
                  <p className="text-[#94A3B8] italic p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                    Belum ada dokumen legalitas terunggah.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedOperator.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]"
                      >
                        <div>
                          <div className="font-semibold text-[#1E293B]">{formatLabel(doc.category)}</div>
                          <div className="text-[11px] text-[#64748B]">
                            {doc.documentNumber || doc.fileName}
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-semibold border ${doc.verificationStatus === "VERIFIED"
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
