"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Warehouse,
  Search,
  RefreshCw,
  Eye,
  Plus,
  X,
  Filter,
  Edit3,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { usePortStore } from "@/store/port.store";
import { toast } from "@/store/toast.store";
import { TenantService } from "@/services/tenant.service";
import { UptService } from "@/services/upt.service";
import { PortAssetCatalogItem } from "@/types/tenant.types";
import { formatLabel } from "@/lib/format-labels";
import { TablePagination } from "@/components/ui/table-pagination";
import { StatusDot } from "@/components/ui/status-indicator";
import { ModalPortal } from "@/components/ui/ModalPortal";

export default function MasterAsetPage() {
  const { user } = useAuthStore();
  const { ports, fetchPorts } = usePortStore();
  const isSuperadmin = user?.role === "SUPERADMIN";
  const isAdmin = user?.role === "ADMIN_PELABUHAN";
  const canAccess = isSuperadmin || isAdmin;

  const [assets, setAssets] = useState<PortAssetCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [billingFilter, setBillingFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail Modal
  const [selectedAsset, setSelectedAsset] = useState<PortAssetCatalogItem | null>(null);

  // Create/Edit Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<PortAssetCatalogItem | null>(null);
  const [assetForm, setAssetForm] = useState({
    portId: "",
    assetCode: "",
    name: "",
    assetType: "KIOS",
    areaSqm: "",
    annualRatePerSqmIdr: "",
    billingEligibility: "BILLABLE" as
      | "BILLABLE"
      | "NOT_BILLABLE"
      | "PENDING_VERIFICATION",
    status: "AVAILABLE" as "AVAILABLE" | "LEASED" | "MAINTENANCE",
    gisCoordinates: "",
    legalBasis: "Perda Kab. Mimika No. 4 Tahun 2023 Lampiran XI",
  });

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const data = await TenantService.getAvailableAssets();
      setAssets(data);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal memuat master aset.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (canAccess) {
      fetchAssets();
      fetchPorts();
    }
  }, [canAccess, fetchPorts]);

  const openCreateModal = () => {
    setEditingAsset(null);
    setAssetForm({
      portId: ports[0]?.id ? String(ports[0].id) : "1",
      assetCode: "",
      name: "",
      assetType: "KIOS",
      areaSqm: "",
      annualRatePerSqmIdr: "",
      billingEligibility: "BILLABLE",
      status: "AVAILABLE",
      gisCoordinates: "",
      legalBasis: "Perda Kab. Mimika No. 4 Tahun 2023 Lampiran XI",
    });
    setErrorMsg(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (ast: PortAssetCatalogItem) => {
    setEditingAsset(ast);
    setAssetForm({
      portId: String(ast.portId),
      assetCode: ast.assetCode,
      name: ast.name,
      assetType: ast.assetType,
      areaSqm: String(ast.areaSqm),
      annualRatePerSqmIdr: String(ast.annualRatePerSqmIdr),
      billingEligibility: ast.billingEligibility,
      status: ast.status,
      gisCoordinates: ast.gisCoordinates || "",
      legalBasis: ast.legalBasis || "Perda Kab. Mimika No. 4 Tahun 2023 Lampiran XI",
    });
    setErrorMsg(null);
    setIsFormModalOpen(true);
  };

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      if (editingAsset) {
        await UptService.updateAsset(editingAsset.id, {
          name: assetForm.name.trim(),
          assetType: assetForm.assetType,
          areaSqm: Number(assetForm.areaSqm),
          annualRatePerSqmIdr: Number(assetForm.annualRatePerSqmIdr),
          billingEligibility: assetForm.billingEligibility,
          status: assetForm.status,
          gisCoordinates: assetForm.gisCoordinates.trim() || undefined,
          legalBasis: assetForm.legalBasis.trim() || undefined,
        });
        toast.success("Aset Diperbarui", `Data aset "${assetForm.name}" berhasil diperbarui.`);
      } else {
        await UptService.createAsset({
          portId: Number(assetForm.portId),
          assetCode: assetForm.assetCode.trim().toUpperCase(),
          name: assetForm.name.trim(),
          assetType: assetForm.assetType,
          areaSqm: Number(assetForm.areaSqm),
          annualRatePerSqmIdr: Number(assetForm.annualRatePerSqmIdr),
          billingEligibility: assetForm.billingEligibility,
          gisCoordinates: assetForm.gisCoordinates.trim() || undefined,
          legalBasis: assetForm.legalBasis.trim() || undefined,
        });
        toast.success("Aset Ditambahkan", `Aset baru "${assetForm.name}" berhasil ditambahkan.`);
      }
      setIsFormModalOpen(false);
      await fetchAssets();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal menyimpan data aset.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((ast) => {
      const matchSearch =
        searchQuery === "" ||
        ast.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ast.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ast.assetType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ast.legalBasis && ast.legalBasis.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === "" || ast.status === statusFilter;
      const matchBilling = billingFilter === "" || ast.billingEligibility === billingFilter;

      return matchSearch && matchStatus && matchBilling;
    });
  }, [assets, searchQuery, statusFilter, billingFilter]);

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage) || 1;
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAssets.slice(start, start + itemsPerPage);
  }, [filteredAssets, currentPage, itemsPerPage]);

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
                placeholder="Cari aset, kode, tipe bangunan..."
                className="w-full pl-9 pr-3.5 py-2 text-xs border border-[#CBD5E1] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#133D31]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <Filter className="w-4 h-4 text-[#64748B] shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="py-2 px-3 text-xs border border-[#CBD5E1] rounded-xl bg-white font-medium text-[#1E293B]"
              >
                <option value="">Semua Status Aset</option>
                <option value="AVAILABLE">Tersedia</option>
                <option value="LEASED">Disewa</option>
                <option value="MAINTENANCE">Pemeliharaan</option>
              </select>

              <select
                value={billingFilter}
                onChange={(e) => {
                  setBillingFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="py-2 px-3 text-xs border border-[#CBD5E1] rounded-xl bg-white font-medium text-[#1E293B]"
              >
                <option value="">Semua Retribusi</option>
                <option value="BILLABLE">Kena Retribusi</option>
                <option value="NOT_BILLABLE">Bebas Retribusi</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={fetchAssets}
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
                Tambah Aset
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
                <th className="py-3 px-5">Aset & Fasilitas</th>
                <th className="py-3 px-4 hidden sm:table-cell">Tipe & Luas</th>
                <th className="py-3 px-4 hidden md:table-cell">Tarif Sewa</th>
                <th className="py-3 px-4 hidden lg:table-cell">Retribusi</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Warehouse className="w-7 h-7 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium">Tidak ada data aset yang sesuai.</p>
                  </td>
                </tr>
              ) : (
                paginatedAssets.map((ast) => (
                  <tr key={ast.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900">{ast.name}</div>
                      <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                        {ast.assetCode}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 hidden sm:table-cell">
                      <div className="font-medium text-slate-800">{formatLabel(ast.assetType)}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {Number(ast.areaSqm).toLocaleString("id-ID")} m²
                      </div>
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <div className="font-medium text-slate-900">
                        Rp {Number(ast.annualRatePerSqmIdr).toLocaleString("id-ID")} / m²
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        ~ Rp{" "}
                        {(
                          Number(ast.areaSqm) * Number(ast.annualRatePerSqmIdr)
                        ).toLocaleString("id-ID")}{" "}
                        / thn
                      </div>
                    </td>
                    <td className="py-3.5 px-4 hidden lg:table-cell">
                      <div className="font-medium text-slate-800">
                        {formatLabel(ast.billingEligibility)}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">
                        {ast.legalBasis || "Perda Kab. Mimika No. 4/2023"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusDot status={ast.status} />
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-0.5">
                        <button
                          type="button"
                          onClick={() => setSelectedAsset(ast)}
                          title="Lihat Detail Aset"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isSuperadmin && (
                          <button
                            type="button"
                            onClick={() => openEditModal(ast)}
                            title="Ubah Aset"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
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
          totalItems={filteredAssets.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Create / Edit Modal */}
      {isFormModalOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form
            onSubmit={handleSaveAsset}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E2E8F0] p-6 sm:p-8 space-y-5"
          >
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#F1F5F9]">
              <div>
                <h3 className="text-base font-extrabold text-[#0B241E]">
                  {editingAsset
                    ? `Ubah Aset: ${editingAsset.name}`
                    : "Tambah Master Aset & Fasilitas Baru"}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Kelola unit kios, gudang, lahan komersial, dan tarif sewanya sesuai Perda.
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
              {!editingAsset && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#334155] mb-1.5">
                      Pelabuhan Induk
                    </label>
                    <select
                      required
                      value={assetForm.portId}
                      onChange={(e) =>
                        setAssetForm((prev) => ({ ...prev, portId: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
                    >
                      {ports.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.code} - {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#334155] mb-1.5">
                      Kode Aset
                    </label>
                    <input
                      type="text"
                      required
                      value={assetForm.assetCode}
                      onChange={(e) =>
                        setAssetForm((prev) => ({ ...prev, assetCode: e.target.value }))
                      }
                      placeholder="KIOS-PMK-05"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-mono"
                    />
                  </div>
                </>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Nama Aset / Fasilitas
                </label>
                <input
                  type="text"
                  required
                  value={assetForm.name}
                  onChange={(e) =>
                    setAssetForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Contoh: Kios Terminal Penumpang No. 5"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Kategori Aset
                </label>
                <select
                  value={assetForm.assetType}
                  onChange={(e) =>
                    setAssetForm((prev) => ({ ...prev, assetType: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
                >
                  <option value="KIOS">Kios Usaha</option>
                  <option value="GUDANG">Gudang Logistik</option>
                  <option value="LAHAN_GALANGAN">Lahan &amp; Galangan</option>
                  <option value="PERAIRAN_ATAS_AIR">Perairan / Atas Air</option>
                  <option value="RUANG_IKLAN">Ruang Iklan / Reklame</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Status Retribusi
                </label>
                <select
                  value={assetForm.billingEligibility}
                  onChange={(e) =>
                    setAssetForm((prev) => ({
                      ...prev,
                      billingEligibility: e.target.value as
                        | "BILLABLE"
                        | "NOT_BILLABLE"
                        | "PENDING_VERIFICATION",
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
                >
                  <option value="BILLABLE">Kena Retribusi</option>
                  <option value="NOT_BILLABLE">Bebas Retribusi</option>
                  <option value="PENDING_VERIFICATION">Perlu Cek</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Luas Area (m²)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  step="0.5"
                  value={assetForm.areaSqm}
                  onChange={(e) =>
                    setAssetForm((prev) => ({ ...prev, areaSqm: e.target.value }))
                  }
                  placeholder="20"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Tarif Sewa / m² / Tahun (Rp)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={assetForm.annualRatePerSqmIdr}
                  onChange={(e) =>
                    setAssetForm((prev) => ({
                      ...prev,
                      annualRatePerSqmIdr: e.target.value,
                    }))
                  }
                  placeholder="50000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>

              {editingAsset && (
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Status Ketersediaan
                  </label>
                  <select
                    value={assetForm.status}
                    onChange={(e) =>
                      setAssetForm((prev) => ({
                        ...prev,
                        status: e.target.value as "AVAILABLE" | "LEASED" | "MAINTENANCE",
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
                  >
                    <option value="AVAILABLE">Tersedia</option>
                    <option value="LEASED">Sedang Disewa</option>
                    <option value="MAINTENANCE">Dalam Perbaikan</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Koordinat GIS (Opsional)
                </label>
                <input
                  type="text"
                  value={assetForm.gisCoordinates}
                  onChange={(e) =>
                    setAssetForm((prev) => ({ ...prev, gisCoordinates: e.target.value }))
                  }
                  placeholder="-4.8192, 136.8245"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Dasar Hukum
                </label>
                <input
                  type="text"
                  value={assetForm.legalBasis}
                  onChange={(e) =>
                    setAssetForm((prev) => ({ ...prev, legalBasis: e.target.value }))
                  }
                  placeholder="Perda Kab. Mimika No. 4 Tahun 2023 Lampiran XI"
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
                Simpan Aset
              </button>
            </div>
          </form>
        </div>
        </ModalPortal>
      )}

      {/* Detail Modal */}
      {selectedAsset && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#133D31]/10 flex items-center justify-center text-[#133D31]">
                  <Warehouse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B241E]">{selectedAsset.name}</h3>
                  <p className="text-xs text-[#64748B]">Kode Aset: {selectedAsset.assetCode}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAsset(null)}
                className="p-2 text-[#94A3B8] hover:text-[#475569] rounded-lg hover:bg-[#F1F5F9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B]">Kategori & Tipe Aset:</span>
                  <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                    {formatLabel(selectedAsset.assetType)}
                  </p>
                </div>
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B]">Status Ketersediaan:</span>
                  <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                    {formatLabel(selectedAsset.status)}
                  </p>
                </div>
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B]">Luas Area:</span>
                  <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                    {Number(selectedAsset.areaSqm).toLocaleString("id-ID")} m²
                  </p>
                </div>
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B]">Tarif Sewa Perda:</span>
                  <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                    Rp {Number(selectedAsset.annualRatePerSqmIdr).toLocaleString("id-ID")} / m² / tahun
                  </p>
                </div>
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B]">Status Retribusi:</span>
                  <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                    {formatLabel(selectedAsset.billingEligibility)}
                  </p>
                </div>
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B]">Koordinat GIS:</span>
                  <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                    {selectedAsset.gisCoordinates || "Belum dipetakan"}
                  </p>
                </div>
                <div className="col-span-2 p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B]">Dasar Hukum & Peraturan Daerah:</span>
                  <p className="text-sm font-bold text-[#0B241E] mt-0.5">
                    {selectedAsset.legalBasis || "Perda Kab. Mimika No. 4 Tahun 2023 Lampiran XI"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAsset(null)}
                className="px-4 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#1E293B] hover:bg-[#F1F5F9]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  );
}
