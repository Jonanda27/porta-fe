"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  Search,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { usePortStore } from "@/store/port.store";
import { toast } from "@/store/toast.store";
import { TablePagination } from "@/components/ui/table-pagination";
import { StatusDot } from "@/components/ui/status-indicator";
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
  const isAdminPelabuhan =
    user?.role === "ADMIN_PELABUHAN" || user?.role === "KEPALA_PELABUHAN";
  const canAccess = isSuperadmin || isAdminPelabuhan;

  const [categoryFilter, setCategoryFilter] = useState<PortCategory | "">("");
  const [portSearchQuery, setPortSearchQuery] = useState("");
  const [selectedPortId, setSelectedPortId] = useState<number | null>(null);

  const [searchBerthQuery, setSearchBerthQuery] = useState("");
  const [berthCategoryFilter, setBerthCategoryFilter] = useState<string>("");
  const [berthPage, setBerthPage] = useState(1);
  const [berthItemsPerPage, setBerthItemsPerPage] = useState(10);

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

  const visiblePorts = useMemo(() => {
    const scoped = isSuperadmin
      ? ports
      : ports.filter((p) => (user?.portId ? p.id === user.portId : true));
    const q = portSearchQuery.trim().toLowerCase();
    if (!q) return scoped;
    return scoped.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.location && p.location.toLowerCase().includes(q))
    );
  }, [isSuperadmin, ports, user?.portId, portSearchQuery]);

  useEffect(() => {
    if (visiblePorts.length === 0) {
      setSelectedPortId(null);
      return;
    }
    const stillExists = visiblePorts.some((p) => p.id === selectedPortId);
    if (!stillExists) {
      setSelectedPortId(visiblePorts[0].id);
    }
  }, [visiblePorts, selectedPortId]);

  const selectedPort = useMemo(
    () => visiblePorts.find((p) => p.id === selectedPortId) || null,
    [visiblePorts, selectedPortId]
  );

  const allBerths = useMemo(
    () => visiblePorts.flatMap((p) => p.berths || []),
    [visiblePorts]
  );

  const filteredBerths = useMemo(() => {
    const berths = selectedPort?.berths || [];
    const q = searchBerthQuery.trim().toLowerCase();
    return berths.filter((b) => {
      const matchQuery =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q);
      const matchCat =
        !berthCategoryFilter || b.berthServiceCategory === berthCategoryFilter;
      return matchQuery && matchCat;
    });
  }, [selectedPort, searchBerthQuery, berthCategoryFilter]);

  const totalBerthPages = Math.ceil(filteredBerths.length / berthItemsPerPage) || 1;
  const pagedBerths = useMemo(() => {
    const start = (berthPage - 1) * berthItemsPerPage;
    return filteredBerths.slice(start, start + berthItemsPerPage);
  }, [filteredBerths, berthPage, berthItemsPerPage]);

  if (!canAccess) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h2 className="text-sm font-semibold text-slate-900">Akses Terbatas</h2>
        <p className="text-xs text-slate-500 mt-1">
          Halaman Pelabuhan & Dermaga hanya dapat diakses oleh Superadmin atau Admin Pelabuhan.
        </p>
      </div>
    );
  }

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
    <div className="space-y-4">
      {/* Compact Flat Summary Strip (No nested boxes) */}
      <div className="bg-white border border-slate-200 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        <div className="px-4 py-3">
          <span className="text-[11px] font-medium text-slate-500">Total Pelabuhan</span>
          <p className="text-lg font-bold text-slate-900 mt-0.5">{visiblePorts.length}</p>
        </div>
        <div className="px-4 py-3">
          <span className="text-[11px] font-medium text-slate-500">Total Dermaga</span>
          <p className="text-lg font-bold text-slate-900 mt-0.5">
            {allBerths.length}{" "}
            <span className="text-xs font-normal text-slate-500">
              ({allBerths.filter((b) => b.operationalStatus === "OPEN").length} aktif)
            </span>
          </p>
        </div>
        <div className="px-4 py-3">
          <span className="text-[11px] font-medium text-slate-500">Kena Retribusi</span>
          <p className="text-lg font-bold text-slate-900 mt-0.5">
            {allBerths.filter((b) => b.billingEligibility === "BILLABLE").length}
          </p>
        </div>
        <div className="px-4 py-3">
          <span className="text-[11px] font-medium text-slate-500">Dalam Perbaikan</span>
          <p className="text-lg font-bold text-slate-900 mt-0.5">
            {allBerths.filter((b) => b.operationalStatus === "MAINTENANCE").length}
          </p>
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
        <div className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SINGLE FULL-WIDTH WORKSPACE (Horizontal Port Tabs + Full-Width Berths Table) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* Top Bar: Port Switcher Tabs + Search + Add Port */}
        <div className="px-4 sm:px-5 pt-3.5 border-b border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-1 flex-wrap">
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={portSearchQuery}
                  onChange={(e) => setPortSearchQuery(e.target.value)}
                  placeholder="Filter daftar pelabuhan..."
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#0B241E]"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as PortCategory | "")}
                className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                title="Filter Kategori Pelabuhan"
              >
                <option value="">Semua Kategori Pelabuhan</option>
                <option value="BARANG">Barang</option>
                <option value="PENUMPANG">Penumpang</option>
                <option value="CAMPURAN">Campuran</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => fetchPorts(categoryFilter || undefined)}
                title="Muat Ulang"
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
              {isSuperadmin && (
                <button
                  type="button"
                  onClick={openCreatePort}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#0B241E]" />
                  <span>Tambah Pelabuhan</span>
                </button>
              )}
            </div>
          </div>

          {/* Horizontal Scrollable Port Tabs (Always visible, zero width stolen from table!) */}
          <div className="flex items-center gap-1 overflow-x-auto -mb-px">
            {isLoading && visiblePorts.length === 0 ? (
              <div className="py-2.5 text-xs text-slate-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin inline mr-1.5" />
                Memuat pelabuhan...
              </div>
            ) : visiblePorts.length === 0 ? (
              <div className="py-2.5 text-xs text-slate-400">
                Tidak ada pelabuhan ditemukan.
              </div>
            ) : (
              visiblePorts.map((port) => {
                const isSelected = port.id === selectedPort?.id;
                const berthCount = port.berths?.length || 0;
                return (
                  <button
                    key={port.id}
                    type="button"
                    onClick={() => {
                      setSelectedPortId(port.id);
                      setBerthPage(1);
                    }}
                    className={`px-3.5 py-2.5 text-xs whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
                      isSelected
                        ? "border-[#0B241E] text-slate-900 font-semibold"
                        : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 font-medium"
                    }`}
                  >
                    <span className="font-mono text-[11px] text-slate-400">{port.code}</span>
                    <span>{port.name}</span>
                    <span className="text-[11px] text-slate-400">({berthCount})</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* FULL-WIDTH SELECTED PORT DETAILS & BERTHS TABLE */}
        {!selectedPort ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
            <Anchor className="w-8 h-8 mb-2 text-slate-300" />
            <p className="text-xs font-medium">Pilih pelabuhan di atas untuk melihat daftar dermaga.</p>
          </div>
        ) : (
          <div>
            {/* Selected Port Header + Berth Filters */}
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/40">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-bold text-slate-900">{selectedPort.name}</h2>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-600">
                    {formatLabel(selectedPort.portCategory)}
                  </span>
                </div>
                {selectedPort.location && (
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{selectedPort.location}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="relative w-full sm:w-52">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchBerthQuery}
                    onChange={(e) => {
                      setSearchBerthQuery(e.target.value);
                      setBerthPage(1);
                    }}
                    placeholder="Cari dermaga..."
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B241E]"
                  />
                </div>
                <select
                  value={berthCategoryFilter}
                  onChange={(e) => {
                    setBerthCategoryFilter(e.target.value);
                    setBerthPage(1);
                  }}
                  className="py-1.5 px-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
                >
                  <option value="">Semua Jenis</option>
                  <option value="DERMAGA_BARANG">Dermaga Barang</option>
                  <option value="DERMAGA_PENUMPANG">Dermaga Penumpang</option>
                  <option value="DERMAGA_CAMPURAN">Dermaga Campuran</option>
                </select>
                {isSuperadmin && (
                  <button
                    type="button"
                    onClick={() => openEditPort(selectedPort)}
                    title="Ubah Info Pelabuhan"
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openCreateBerth(selectedPort.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Tambah Dermaga</span>
                </button>
              </div>
            </div>

            {/* Full-Width Spacious Berths Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-white">
                    <th className="py-3 px-5">Dermaga</th>
                    <th className="py-3 px-4">Jenis & Konstruksi</th>
                    <th className="py-3 px-4 hidden md:table-cell">Pengelola</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Ukuran Maksimal</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right w-16">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {pagedBerths.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Belum ada dermaga pada pelabuhan ini.
                      </td>
                    </tr>
                  ) : (
                    pagedBerths.map((berth) => (
                      <tr key={berth.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-slate-900">{berth.name}</div>
                          <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                            {berth.code}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">
                            {formatLabel(berth.berthServiceCategory)}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {formatLabel(berth.berthType)}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 hidden md:table-cell">
                          <div className="font-medium text-slate-800">
                            {formatLabel(berth.authorityType)}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {formatLabel(berth.billingEligibility)}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 hidden sm:table-cell whitespace-nowrap">
                          <div className="font-medium text-slate-800">
                            Panjang {berth.maxLengthMeters ?? "-"} m
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Kedalaman {berth.maxDraftMeters ?? "-"} m
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusDot status={berth.operationalStatus} />
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => openEditBerth(berth)}
                            title="Ubah Dermaga"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
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
          </div>
        )}
      </div>

      {/* Create / Edit Port Modal */}
      {isPortModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePort}
            className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingPort ? `Ubah Pelabuhan: ${editingPort.name}` : "Tambah Pelabuhan Baru"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lengkapi kode, nama, lokasi, dan kategori layanan pelabuhan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPortModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Pelabuhan
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
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create / Edit Berth Modal */}
      {isBerthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveBerth}
            className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingBerth ? `Ubah Dermaga: ${editingBerth.name}` : "Tambah Dermaga Baru"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atur spesifikasi teknis, kewenangan retribusi, dan status operasional dermaga.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBerthModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Dermaga
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
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Layanan Dermaga
                </label>
                <select
                  value={berthForm.berthServiceCategory}
                  onChange={(e) =>
                    setBerthForm((prev) => ({
                      ...prev,
                      berthServiceCategory: e.target.value as BerthServiceCategory,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                >
                  <option value="DERMAGA_BARANG">Dermaga Barang / Kargo</option>
                  <option value="DERMAGA_PENUMPANG">Dermaga Penumpang &amp; Ro-Ro</option>
                  <option value="DERMAGA_CAMPURAN">Dermaga Serbaguna (Campuran)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Operasional
                </label>
                <select
                  value={berthForm.operationalStatus}
                  onChange={(e) =>
                    setBerthForm((prev) => ({
                      ...prev,
                      operationalStatus: e.target.value as BerthOperationalStatus,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                >
                  <option value="OPEN">Aktif</option>
                  <option value="MAINTENANCE">Perbaikan</option>
                  <option value="CLOSED">Tutup</option>
                </select>
              </div>

            {!editingBerth && (
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Panjang Maksimal (Meter)
                </label>
                <input
                  type="number"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kedalaman Maksimal / Draft (Meter)
                </label>
                <input
                  type="number"
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

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBerthModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
