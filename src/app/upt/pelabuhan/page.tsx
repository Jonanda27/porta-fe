"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, AlertCircle, ShieldAlert, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { usePortStore } from "@/store/port.store";
import { toast } from "@/store/toast.store";
import { BerthItem, PortCategory, PortItem } from "@/types/port.types";
import { PortTabsBar } from "@/components/upt/pelabuhan/PortTabsBar";
import { BerthsTable } from "@/components/upt/pelabuhan/BerthsTable";
import { PortFormModal, PortFormState } from "@/components/upt/pelabuhan/PortFormModal";
import { BerthFormModal, BerthFormState } from "@/components/upt/pelabuhan/BerthFormModal";

const INITIAL_PORT_FORM: PortFormState = {
  code: "",
  name: "",
  location: "",
  portCategory: "CAMPURAN",
};

const INITIAL_BERTH_FORM: BerthFormState = {
  portId: 0,
  code: "",
  name: "",
  berthType: "DERMAGA_BESI_BETON_KAYU",
  berthServiceCategory: "DERMAGA_CAMPURAN",
  operationalStatus: "OPEN",
  authorityType: "PEMDA_DISHUB",
  billingEligibility: "BILLABLE",
  legalBasis: "Perda Kab. Mimika No. 4 Tahun 2023 Lampiran XI",
  maxLengthMeters: "",
  maxDraftMeters: "",
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
  const [portForm, setPortForm] = useState<PortFormState>(INITIAL_PORT_FORM);

  // Berth modal state
  const [isBerthModalOpen, setIsBerthModalOpen] = useState(false);
  const [editingBerth, setEditingBerth] = useState<BerthItem | null>(null);
  const [berthForm, setBerthForm] = useState<BerthFormState>(INITIAL_BERTH_FORM);

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
          Halaman Pelabuhan &amp; Dermaga hanya dapat diakses oleh Superadmin atau Admin Pelabuhan.
        </p>
      </div>
    );
  }

  const openCreatePort = () => {
    setEditingPort(null);
    setPortForm(INITIAL_PORT_FORM);
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
      ...INITIAL_BERTH_FORM,
      portId,
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
            <option value="CAMPURAN">Pelabuhan Campuran (Penumpang &amp; Barang)</option>
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
        <PortTabsBar
          visiblePorts={visiblePorts}
          selectedPortId={selectedPort?.id ?? null}
          portSearchQuery={portSearchQuery}
          categoryFilter={categoryFilter}
          isLoading={isLoading}
          isSuperadmin={isSuperadmin}
          onPortSearchChange={setPortSearchQuery}
          onCategoryFilterChange={setCategoryFilter}
          onRefresh={() => fetchPorts(categoryFilter || undefined)}
          onCreatePort={openCreatePort}
          onSelectPort={(portId) => {
            setSelectedPortId(portId);
            setBerthPage(1);
          }}
        />

        <BerthsTable
          selectedPort={selectedPort}
          pagedBerths={pagedBerths}
          totalFilteredBerths={filteredBerths.length}
          searchBerthQuery={searchBerthQuery}
          berthCategoryFilter={berthCategoryFilter}
          berthPage={berthPage}
          totalBerthPages={totalBerthPages}
          berthItemsPerPage={berthItemsPerPage}
          isSuperadmin={isSuperadmin}
          onSearchBerthChange={(value) => {
            setSearchBerthQuery(value);
            setBerthPage(1);
          }}
          onBerthCategoryFilterChange={(value) => {
            setBerthCategoryFilter(value);
            setBerthPage(1);
          }}
          onBerthPageChange={setBerthPage}
          onBerthItemsPerPageChange={setBerthItemsPerPage}
          onEditPort={openEditPort}
          onCreateBerth={openCreateBerth}
          onEditBerth={openEditBerth}
        />
      </div>

      <PortFormModal
        isOpen={isPortModalOpen}
        editingPort={editingPort}
        form={portForm}
        isSubmitting={isSubmitting}
        onFormChange={setPortForm}
        onClose={() => setIsPortModalOpen(false)}
        onSubmit={handleSavePort}
      />

      <BerthFormModal
        isOpen={isBerthModalOpen}
        editingBerth={editingBerth}
        form={berthForm}
        isSubmitting={isSubmitting}
        onFormChange={setBerthForm}
        onClose={() => setIsBerthModalOpen(false)}
        onSubmit={handleSaveBerth}
      />
    </div>
  );
}
