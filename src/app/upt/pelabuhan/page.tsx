"use client";

import React, { useEffect, useState } from "react";
import {
  Anchor,
  Plus,
  Edit3,
  AlertCircle,
  Loader2,
  MapPin,
  ShieldAlert,
  RefreshCw,
  X,
  Building2,
  Layers,
  Search,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { usePortStore } from "@/store/port.store";
import { toast } from "@/store/toast.store";
import { TablePagination } from "@/components/ui/table-pagination";
import { formatLabel } from "@/lib/format-labels";
import {
  AuthorityType,
  BerthItem,
  BerthOperationalStatus,
  BerthServiceCategory,
  BerthType,
  BillingEligibility,
  PortCategory,
  PortItem,
} from "@/types/port.types";

const BERTH_STATUS_BADGE: Record<BerthOperationalStatus, string> = {
  OPEN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED: "bg-rose-50 text-rose-700 border-rose-200",
  MAINTENANCE: "bg-amber-50 text-amber-800 border-amber-200",
};

const BILLING_ELIGIBILITY_BADGE: Record<BillingEligibility, string> = {
  BILLABLE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  NOT_BILLABLE: "bg-slate-100 text-slate-600 border-slate-200",
  PENDING_VERIFICATION: "bg-amber-50 text-amber-700 border-amber-200",
};

const SERVICE_CATEGORY_BADGE: Record<BerthServiceCategory, string> = {
  DERMAGA_BARANG: "bg-blue-50 text-blue-700 border-blue-200",
  DERMAGA_PENUMPANG: "bg-purple-50 text-purple-700 border-purple-200",
  DERMAGA_CAMPURAN: "bg-teal-50 text-teal-700 border-teal-200",
};

export default function PelabuhanPage() {
  const { user } = useAuthStore();
  const {
    ports,
    isLoading,
    isSubmitting,
    error,
    fetchPorts,
    createPort,
    updatePort,
    createBerth,
    updateBerth,
    clearError,
  } = usePortStore();

  const isSuperadmin = user?.role === "SUPERADMIN";
  const isAdminPelabuhan = user?.role === "ADMIN_PELABUHAN";
  const canAccess = isSuperadmin || isAdminPelabuhan;

  const [categoryFilter, setCategoryFilter] = useState<PortCategory | "">("");
  const [searchBerthQuery, setSearchBerthQuery] = useState("");
  const [berthCategoryFilter, setBerthCategoryFilter] = useState<string>("");
  const [berthPage, setBerthPage] = useState(1);
  const [berthItemsPerPage, setBerthItemsPerPage] = useState(5);

  // Port modal state
  const [isPortModalOpen, setIsPortModalOpen] = useState(false);
  const [editingPort, setEditingPort] = useState<PortItem | null>(null);
  const [portForm, setPortForm] = useState({
    code: "",
    name: "",
    location: "",
    portCategory: "CAMPURAN" as PortCategory,
  });

  // Berth modal state
  const [isBerthModalOpen, setIsBerthModalOpen] = useState(false);
  const [editingBerth, setEditingBerth] = useState<BerthItem | null>(null);
  const [berthForm, setBerthForm] = useState({
    portId: 0,
    code: "",
    name: "",
    berthType: "DERMAGA_BESI_BETON_KAYU" as BerthType,
    berthServiceCategory: "DERMAGA_CAMPURAN" as BerthServiceCategory,
    operationalStatus: "OPEN" as BerthOperationalStatus,
    authorityType: "PEMDA_DISHUB" as AuthorityType,
    billingEligibility: "BILLABLE" as BillingEligibility,
    legalBasis: "Perda Kab. Mimika No. 4 Tahun 2023 Lampiran XI",
    maxLengthMeters: "",
    maxDraftMeters: "",
  });

  useEffect(() => {
    if (canAccess) {
      fetchPorts(categoryFilter || undefined);
    }
  }, [canAccess, categoryFilter, fetchPorts]);

  if (!canAccess) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center">
        <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <h2 className="text-base font-bold text-[#0B241E]">Akses Terbatas</h2>
        <p className="text-xs text-[#64748B] mt-1">
          Halaman Master Pelabuhan & Dermaga hanya dapat diakses oleh Superadmin atau Admin Pelabuhan.
        </p>
      </div>
    );
  }

  const visiblePorts = isSuperadmin
    ? ports
    : ports.filter((p) => (user?.portId ? p.id === user.portId : true));

  const allBerths = visiblePorts.flatMap((p) => p.berths || []);

  const openCreatePort = () => {
    setEditingPort(null);
    setPortForm({
      code: "",
      name: "",
      location: "",
      portCategory: "CAMPURAN",
    });
    clearError();
    setIsPortModalOpen(true);
  };

  const openEditPort = (port: PortItem) => {
    setEditingPort(port);
    setPortForm({
      code: port.code,
      name: port.name,
      location: port.location || "",
      portCategory: port.portCategory,
    });
    clearError();
    setIsPortModalOpen(true);
  };

  const handleSavePort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPort) {
      await updatePort(editingPort.id, {
        name: portForm.name.trim(),
        location: portForm.location.trim() || undefined,
        portCategory: portForm.portCategory,
      });
      toast.success("Pelabuhan Diperbarui", `Data pelabuhan "${portForm.name}" berhasil diperbarui.`);
    } else {
      await createPort({
        code: portForm.code.trim().toUpperCase(),
        name: portForm.name.trim(),
        location: portForm.location.trim() || undefined,
        portCategory: portForm.portCategory,
      });
      toast.success("Pelabuhan Ditambahkan", `Pelabuhan baru "${portForm.name}" berhasil ditambahkan.`);
    }
    setIsPortModalOpen(false);
  };

  const openCreateBerth = (portId: number) => {
    setEditingBerth(null);
    setBerthForm({
      portId,
      code: "",
      name: "",
      berthType: "DERMAGA_BESI_BETON_KAYU",
      berthServiceCategory: "DERMAGA_CAMPURAN",
      operationalStatus: "OPEN",
      authorityType: "PEMDA_DISHUB",
      billingEligibility: "BILLABLE",
      legalBasis: "Perda Kab. Mimika No. 4 Tahun 2023 Lampiran XI",
      maxLengthMeters: "100",
      maxDraftMeters: "6.5",
    });
    clearError();
    setIsBerthModalOpen(true);
  };

  const openEditBerth = (berth: BerthItem) => {
    setEditingBerth(berth);
    setBerthForm({
      portId: berth.portId,
      code: berth.code,
      name: berth.name,
      berthType: berth.berthType,
      berthServiceCategory: berth.berthServiceCategory,
      operationalStatus: berth.operationalStatus,
      authorityType: berth.authorityType,
      billingEligibility: berth.billingEligibility,
      legalBasis: berth.legalBasis || "",
      maxLengthMeters: berth.maxLengthMeters ? String(berth.maxLengthMeters) : "",
      maxDraftMeters: berth.maxDraftMeters ? String(berth.maxDraftMeters) : "",
    });
    clearError();
    setIsBerthModalOpen(true);
  };

  const handleSaveBerth = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLength = berthForm.maxLengthMeters
      ? Number(berthForm.maxLengthMeters)
      : undefined;
    const parsedDraft = berthForm.maxDraftMeters
      ? Number(berthForm.maxDraftMeters)
      : undefined;

    if (editingBerth) {
      await updateBerth(editingBerth.id, {
        name: berthForm.name.trim(),
        berthServiceCategory: berthForm.berthServiceCategory,
        operationalStatus: berthForm.operationalStatus,
        maxLengthMeters: parsedLength,
        maxDraftMeters: parsedDraft,
      });
      toast.success("Dermaga Diperbarui", `Dermaga "${berthForm.name}" berhasil diperbarui.`);
    } else {
      await createBerth({
        portId: berthForm.portId,
        code: berthForm.code.trim().toUpperCase(),
        name: berthForm.name.trim(),
        berthType: berthForm.berthType,
        berthServiceCategory: berthForm.berthServiceCategory,
        operationalStatus: berthForm.operationalStatus,
        authorityType: berthForm.authorityType,
        billingEligibility: berthForm.billingEligibility,
        legalBasis: berthForm.legalBasis.trim() || undefined,
        maxLengthMeters: parsedLength,
        maxDraftMeters: parsedDraft,
      });
      toast.success("Dermaga Ditambahkan", `Dermaga baru "${berthForm.name}" berhasil ditambahkan.`);
    }
    setIsBerthModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs">
          <p className="text-xs font-medium text-[#64748B]">Pelabuhan</p>
          <p className="text-2xl font-bold text-[#0B241E] mt-1">
            {visiblePorts.length}
          </p>
          <p className="text-[11px] text-[#64748B] mt-0.5">Lokasi terdaftar</p>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs">
          <p className="text-xs font-medium text-[#64748B]">Total Dermaga</p>
          <p className="text-2xl font-bold text-[#0B241E] mt-1">
            {allBerths.length}
          </p>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            {allBerths.filter((b) => b.operationalStatus === "OPEN").length} dermaga aktif
          </p>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs">
          <p className="text-xs font-medium text-[#64748B]">Kena Retribusi</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {allBerths.filter((b) => b.billingEligibility === "BILLABLE").length}
          </p>
          <p className="text-[11px] text-[#64748B] mt-0.5">Dermaga berbayar</p>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs">
          <p className="text-xs font-medium text-[#64748B]">Jenis Dermaga</p>
          <p className="text-sm font-bold text-[#0B241E] mt-2">
            {allBerths.filter((b) => b.berthServiceCategory === "DERMAGA_BARANG").length} Barang •{" "}
            {allBerths.filter((b) => b.berthServiceCategory === "DERMAGA_PENUMPANG").length} Penumpang •{" "}
            {allBerths.filter((b) => b.berthServiceCategory === "DERMAGA_CAMPURAN").length} Campuran
          </p>
          <p className="text-[11px] text-[#64748B] mt-1">Peruntukan layanan</p>
        </div>
      </div>

      {/* Header Toolbar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as PortCategory | "")}
            className="px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0B241E] focus:outline-none focus:border-[#0B241E]"
          >
            <option value="">Semua Kategori Pelabuhan</option>
            <option value="BARANG">Pelabuhan Khusus Barang</option>
            <option value="PENUMPANG">Pelabuhan Penumpang (Angkutan Orang)</option>
            <option value="CAMPURAN">Pelabuhan Campuran (Penumpang & Barang)</option>
          </select>
          <button
            type="button"
            onClick={() => fetchPorts(categoryFilter || undefined)}
            disabled={isLoading}
            className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Muat Ulang
          </button>
        </div>

        {isSuperadmin && (
          <button
            type="button"
            onClick={openCreatePort}
            className="px-4 py-2.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#D97706]" />
            Tambah Pelabuhan Baru
          </button>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Ports & Berths Cards */}
      {isLoading ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 flex items-center justify-center gap-2 text-xs text-[#64748B]">
          <Loader2 className="w-4 h-4 animate-spin" />
          Memuat master data pelabuhan...
        </div>
      ) : visiblePorts.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center text-xs text-[#64748B]">
          Belum ada data pelabuhan aktif.
        </div>
      ) : (
        <div className="space-y-6">
          {visiblePorts.map((port) => (
            <div
              key={port.id}
              className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs"
            >
              <div className="p-5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center shrink-0">
                    <Anchor className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-[#0B241E] text-white">
                        {port.code}
                      </span>
                      <h3 className="text-base font-extrabold text-[#0B241E]">
                        {port.name}
                      </h3>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {formatLabel(port.portCategory)}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D97706]" />
                      {port.location || "Lokasi belum ditentukan"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {isSuperadmin && (
                    <button
                      type="button"
                      onClick={() => openEditPort(port)}
                      className="px-3.5 py-2 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-xs font-bold text-[#334155] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Ubah Pelabuhan
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openCreateBerth(port.id)}
                    className="px-3.5 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#D97706]" />
                    Tambah Dermaga
                  </button>
                </div>
              </div>

              {/* Berths Filter Bar */}
              <div className="px-5 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchBerthQuery}
                      onChange={(e) => {
                        setSearchBerthQuery(e.target.value);
                        setBerthPage(1);
                      }}
                      placeholder="Cari nama dermaga, kode..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#CBD5E1] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#133D31]"
                    />
                  </div>
                  <select
                    value={berthCategoryFilter}
                    onChange={(e) => {
                      setBerthCategoryFilter(e.target.value);
                      setBerthPage(1);
                    }}
                    className="w-full sm:w-auto py-1.5 px-3 text-xs border border-[#CBD5E1] rounded-xl bg-white font-medium text-[#1E293B]"
                  >
                    <option value="">Semua Kategori Dermaga</option>
                    <option value="DERMAGA_BARANG">Dermaga Barang</option>
                    <option value="DERMAGA_PENUMPANG">Dermaga Penumpang</option>
                    <option value="DERMAGA_CAMPURAN">Dermaga Campuran</option>
                  </select>
                </div>
              </div>

              {/* Berths Table */}
              {(() => {
                const filteredBerths = (port.berths || []).filter((b) => {
                  const matchQ =
                    !searchBerthQuery ||
                    b.name.toLowerCase().includes(searchBerthQuery.toLowerCase()) ||
                    b.code.toLowerCase().includes(searchBerthQuery.toLowerCase());
                  const matchCat =
                    !berthCategoryFilter || b.berthServiceCategory === berthCategoryFilter;
                  return matchQ && matchCat;
                });
                const totalBerthPages = Math.ceil(filteredBerths.length / berthItemsPerPage) || 1;
                const pagedBerths = filteredBerths.slice(
                  (berthPage - 1) * berthItemsPerPage,
                  berthPage * berthItemsPerPage
                );

                return (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] bg-white">
                            <th className="py-3.5 px-5">Dermaga</th>
                            <th className="py-3.5 px-4">Jenis & Konstruksi</th>
                            <th className="py-3.5 px-4">Pengelola</th>
                            <th className="py-3.5 px-4">Ukuran Maksimal</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-5 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F5F9] text-xs">
                          {pagedBerths.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-[#94A3B8]">
                                Belum ada dermaga yang sesuai dengan pencarian atau filter.
                              </td>
                            </tr>
                          ) : (
                            pagedBerths.map((berth) => (
                              <tr key={berth.id} className="hover:bg-[#F8FAFC] transition-colors">
                                <td className="py-4 px-5">
                                  <div className="font-bold text-[#0B241E] text-sm">
                                    {berth.name}
                                  </div>
                                  <span className="inline-block font-mono text-[11px] text-[#64748B] mt-0.5">
                                    Kode: {berth.code}
                                  </span>
                                </td>
                                <td className="py-4 px-4">
                                  <span
                                    className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${SERVICE_CATEGORY_BADGE[berth.berthServiceCategory]
                                      }`}
                                  >
                                    {formatLabel(berth.berthServiceCategory)}
                                  </span>
                                  <div className="text-[11px] text-[#64748B] mt-1">
                                    {formatLabel(berth.berthType)}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="text-[#1E293B] font-semibold">
                                    {formatLabel(berth.authorityType)}
                                  </div>
                                  <span
                                    className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${BILLING_ELIGIBILITY_BADGE[berth.billingEligibility]
                                      }`}
                                  >
                                    {formatLabel(berth.billingEligibility)}
                                  </span>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="font-semibold text-[#334155]">
                                    Panjang {berth.maxLengthMeters ?? "-"} m
                                  </div>
                                  <div className="text-[11px] text-[#64748B] mt-0.5">
                                    Kedalaman {berth.maxDraftMeters ?? "-"} m
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <span
                                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${BERTH_STATUS_BADGE[berth.operationalStatus]
                                      }`}
                                  >
                                    {formatLabel(berth.operationalStatus)}
                                  </span>
                                </td>
                                <td className="py-4 px-5 text-right">
                                  <button
                                    type="button"
                                    onClick={() => openEditBerth(berth)}
                                    className="px-3 py-1.5 rounded-xl border border-[#CBD5E1] hover:bg-[#F1F5F9] text-xs font-semibold text-[#0B241E] cursor-pointer"
                                  >
                                    Ubah
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <TablePagination
                      currentPage={berthPage}
                      totalPages={totalBerthPages}
                      totalItems={filteredBerths.length}
                      itemsPerPage={berthItemsPerPage}
                      onPageChange={setBerthPage}
                      onItemsPerPageChange={setBerthItemsPerPage}
                    />
                  </>
                );
              })()}
            </div>
          ))}
        </div>
      )}

      {/* Spacious Modal Port */}
      {isPortModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePort}
            className="bg-white rounded-3xl border border-[#E2E8F0] w-full max-w-xl p-6 sm:p-8 space-y-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0B241E]">
                    {editingPort ? "Ubah Data Pelabuhan" : "Tambah Pelabuhan Baru"}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Atur identitas, lokasi kawasan, dan fungsi layanan utama pelabuhan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPortModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Kode Pelabuhan
                </label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingPort)}
                  maxLength={20}
                  value={portForm.code}
                  onChange={(e) =>
                    setPortForm((prev) => ({ ...prev, code: e.target.value }))
                  }
                  placeholder="Contoh: PMK"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Kategori Layanan Pelabuhan
                </label>
                <select
                  value={portForm.portCategory}
                  onChange={(e) =>
                    setPortForm((prev) => ({
                      ...prev,
                      portCategory: e.target.value as PortCategory,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
                >
                  <option value="CAMPURAN">Campuran (Penumpang &amp; Barang)</option>
                  <option value="BARANG">Khusus Barang / Kargo</option>
                  <option value="PENUMPANG">Khusus Penumpang</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Nama Resmi Pelabuhan
              </label>
              <input
                type="text"
                required
                maxLength={150}
                value={portForm.name}
                onChange={(e) =>
                  setPortForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Contoh: Pelabuhan Poumako"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Alamat / Lokasi Kawasan
              </label>
              <input
                type="text"
                value={portForm.location}
                onChange={(e) =>
                  setPortForm((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="Distrik Mimika Timur, Kabupaten Mimika, Papua Tengah"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setIsPortModalOpen(false)}
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
                Simpan Pelabuhan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Spacious Modal Berth */}
      {isBerthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveBerth}
            className="bg-white rounded-3xl border border-[#E2E8F0] w-full max-w-2xl p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0B241E]">
                    {editingBerth ? "Kelola Spesifikasi & Status Dermaga" : "Tambah Dermaga Baru"}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Tentukan fungsi layanan dermaga, konstruksi, kewenangan retribusi, dan kapasitas teknis kapal.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBerthModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Kode Dermaga
                </label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingBerth)}
                  maxLength={30}
                  value={berthForm.code}
                  onChange={(e) =>
                    setBerthForm((prev) => ({ ...prev, code: e.target.value }))
                  }
                  placeholder="DRM-PEMDA-02"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-mono disabled:bg-slate-100"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Nama Dermaga / Tambatan
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={berthForm.name}
                  onChange={(e) =>
                    setBerthForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Contoh: Dermaga Beton Nusantara Pemda"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Peruntukan Layanan Dermaga
                </label>
                <select
                  value={berthForm.berthServiceCategory}
                  onChange={(e) =>
                    setBerthForm((prev) => ({
                      ...prev,
                      berthServiceCategory: e.target.value as BerthServiceCategory,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
                >
                  <option value="DERMAGA_BARANG">Dermaga Barang / Kargo</option>
                  <option value="DERMAGA_PENUMPANG">Dermaga Penumpang &amp; Ro-Ro</option>
                  <option value="DERMAGA_CAMPURAN">Dermaga Serbaguna (Campuran)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Kondisi Operasional Saat Ini
                </label>
                <select
                  value={berthForm.operationalStatus}
                  onChange={(e) =>
                    setBerthForm((prev) => ({
                      ...prev,
                      operationalStatus: e.target.value as BerthOperationalStatus,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
                >
                  <option value="OPEN">Aktif Beroperasi (Siap Sandar)</option>
                  <option value="MAINTENANCE">Dalam Pemeliharaan / Perbaikan</option>
                  <option value="CLOSED">Ditutup Sementara</option>
                </select>
              </div>
            </div>

            {!editingBerth && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Tipe Konstruksi
                  </label>
                  <select
                    value={berthForm.berthType}
                    onChange={(e) =>
                      setBerthForm((prev) => ({
                        ...prev,
                        berthType: e.target.value as BerthType,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                  >
                    <option value="DERMAGA_BESI_BETON_KAYU">
                      Konstruksi Besi / Beton / Kayu
                    </option>
                    <option value="BRESSING_DOLPHIN_PELAMPUNG">
                      Bressing / Dolphin / Pelampung
                    </option>
                    <option value="PINGGIRAN_TALUD">Pinggiran / Talud Pantai</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Otoritas Pengelola
                  </label>
                  <select
                    value={berthForm.authorityType}
                    onChange={(e) =>
                      setBerthForm((prev) => ({
                        ...prev,
                        authorityType: e.target.value as AuthorityType,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                  >
                    <option value="PEMDA_DISHUB">Pemda / Dishub Kabupaten</option>
                    <option value="UPP_KEMENHUB">UPP Kementerian Perhubungan</option>
                    <option value="TUKS_TERSUS">TUKS / Terminal Khusus Swasta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Status Retribusi Pemda
                  </label>
                  <select
                    value={berthForm.billingEligibility}
                    onChange={(e) =>
                      setBerthForm((prev) => ({
                        ...prev,
                        billingEligibility: e.target.value as BillingEligibility,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                  >
                    <option value="BILLABLE">Objek Retribusi Pemda</option>
                    <option value="PENDING_VERIFICATION">
                      Menunggu Verifikasi Dasar Hukum
                    </option>
                    <option value="NOT_BILLABLE">Non-Retribusi Pemda</option>
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Panjang Maksimal Kapal / LOA (Meter)
                </label>
                <input
                  type="number"
                  min={1}
                  step="0.1"
                  value={berthForm.maxLengthMeters}
                  onChange={(e) =>
                    setBerthForm((prev) => ({
                      ...prev,
                      maxLengthMeters: e.target.value,
                    }))
                  }
                  placeholder="Contoh: 120"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Kedalaman Air / Draft Maksimal (Meter)
                </label>
                <input
                  type="number"
                  min={0.5}
                  step="0.1"
                  value={berthForm.maxDraftMeters}
                  onChange={(e) =>
                    setBerthForm((prev) => ({
                      ...prev,
                      maxDraftMeters: e.target.value,
                    }))
                  }
                  placeholder="Contoh: 8.5"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setIsBerthModalOpen(false)}
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
                Simpan Dermaga
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
