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
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useUptStore } from "@/store/upt.store";
import { UptService } from "@/services/upt.service";
import { formatLabel } from "@/lib/format-labels";
import { TablePagination } from "@/components/ui/table-pagination";
import { VesselItem } from "@/types/upt.types";

export default function MasterKapalPage() {
  const { user } = useAuthStore();
  const { vessels, operators, isLoading, fetchVerificationData } = useUptStore();

  const isSuperadmin = user?.role === "SUPERADMIN";
  const isAdmin = user?.role === "ADMIN_PELABUHAN";
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

  // Create/Edit Modal
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

  useEffect(() => {
    if (canAccess) {
      fetchVerificationData();
    }
  }, [canAccess, fetchVerificationData]);

  const openCreateModal = () => {
    setEditingVessel(null);
    setOperatorId(operators[0]?.id ? String(operators[0].id) : "");
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
    setErrorMsg(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (v: VesselItem) => {
    setEditingVessel(v);
    setOperatorId(String(v.operatorId));
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
    setErrorMsg(null);
    setIsFormModalOpen(true);
  };

  const handleSaveVessel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      const payload = {
        operatorId: Number(operatorId),
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
        setFeedback(`Data kapal "${payload.name}" berhasil diperbarui.`);
      } else {
        await UptService.createVessel(payload);
        setFeedback(`Kapal baru "${payload.name}" berhasil ditambahkan.`);
      }
      setIsFormModalOpen(false);
      await fetchVerificationData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal menyimpan data kapal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivateVessel = async (v: VesselItem) => {
    if (!confirm(`Nonaktifkan kapal "${v.name}" dari daftar aktif?`)) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      await UptService.updateVessel(v.id, { isActive: false });
      setFeedback(`Kapal "${v.name}" telah dinonaktifkan.`);
      await fetchVerificationData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal menonaktifkan kapal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVessels = useMemo(() => {
    return vessels.filter((v) => {
      const matchSearch =
        searchQuery === "" ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.imoNumber && v.imoNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.operator?.name && v.operator.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
                placeholder="Cari kapal, no. reg, operator..."
                className="w-full pl-9 pr-3.5 py-2 text-xs border border-[#CBD5E1] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#133D31]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <Filter className="w-4 h-4 text-[#64748B] shrink-0" />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="py-2 px-3 text-xs border border-[#CBD5E1] rounded-xl bg-white font-medium text-[#1E293B]"
              >
                <option value="">Semua Kategori Kapal</option>
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
                className="py-2 px-3 text-xs border border-[#CBD5E1] rounded-xl bg-white font-medium text-[#1E293B]"
              >
                <option value="">Semua Trayek</option>
                <option value="DALAM_NEGERI">Dalam Negeri</option>
                <option value="LUAR_NEGERI">Luar Negeri</option>
                <option value="PELRA_PERINTIS">Pelayaran Rakyat</option>
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
                Tambah Kapal
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
              <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] bg-[#F8FAFC]">
                <th className="py-3.5 px-5">Kapal & Registrasi</th>
                <th className="py-3.5 px-4">Operator Kapal</th>
                <th className="py-3.5 px-4">Kategori & Trayek</th>
                <th className="py-3.5 px-4">Dimensi Teknis</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-xs">
              {paginatedVessels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#94A3B8]">
                    <Ship className="w-8 h-8 mx-auto mb-2 text-[#CBD5E1]" />
                    <p className="font-medium">Tidak ada data kapal yang sesuai.</p>
                  </td>
                </tr>
              ) : (
                paginatedVessels.map((v) => (
                  <tr key={v.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-[#0B241E] text-sm flex items-center gap-2">
                        <Ship className="w-4 h-4 text-[#133D31] shrink-0" />
                        {v.name}
                      </div>
                      <div className="font-mono text-[11px] text-[#64748B] mt-0.5">
                        No. Reg: {v.registrationNumber} {v.imoNumber ? `| IMO: ${v.imoNumber}` : ""}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#1E293B]">
                      {v.operator?.name || "Belum Terhubung"}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {formatLabel(v.vesselCategory)}
                      </span>
                      <div className="text-[11px] text-[#64748B] mt-1">
                        {formatLabel(v.shippingCategory)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#334155]">
                        {Number(v.grossTonnage).toLocaleString("id-ID")} GT
                      </div>
                      <div className="text-[11px] text-[#64748B] mt-0.5">
                        LOA: {v.lengthMeters ?? "-"} m | Draft: {v.draftMeters ?? "-"} m
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          v.verificationStatus === "VERIFIED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : v.verificationStatus === "REJECTED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {formatLabel(v.verificationStatus)}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedVessel(v)}
                        className="px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#1E293B] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#133D31]" />
                        Detail
                      </button>
                      {isSuperadmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => openEditModal(v)}
                            className="px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#1E293B] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#D97706]" />
                            Ubah
                          </button>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleDeactivateVessel(v)}
                            className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                            title="Nonaktifkan Kapal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
          totalItems={filteredVessels.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Create / Edit Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form
            onSubmit={handleSaveVessel}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E2E8F0] p-6 sm:p-8 space-y-5"
          >
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#F1F5F9]">
              <div>
                <h3 className="text-base font-extrabold text-[#0B241E]">
                  {editingVessel ? `Ubah Kapal: ${editingVessel.name}` : "Tambah Master Kapal Baru"}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Kelola identitas kapal beserta ukuran dimensi teknis sebagai dasar tarif layanan.
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
                  Operator Kapal
                </label>
                <select
                  required
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
                >
                  <option value="">-- Pilih Perusahaan Operator --</option>
                  {operators.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Nama Kapal
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
                  Nomor Registrasi Kapal
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
                  Tonase Kotor (GT)
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
                Simpan Kapal
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
                  <span className="text-[#64748B]">Operator Kapal:</span>
                  <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                    {selectedVessel.operator?.name || "Belum Terhubung"}
                  </p>
                </div>
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
                  <span className="text-[#64748B]">Panjang Kapal (LOA):</span>
                  <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                    {selectedVessel.lengthMeters ? `${selectedVessel.lengthMeters} meter` : "-"}
                  </p>
                </div>
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B]">Sarat Maksimum (Draft):</span>
                  <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                    {selectedVessel.draftMeters ? `${selectedVessel.draftMeters} meter` : "-"}
                  </p>
                </div>
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
                          <div className="font-semibold text-[#1E293B]">{formatLabel(doc.category)}</div>
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

            <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedVessel(null)}
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
