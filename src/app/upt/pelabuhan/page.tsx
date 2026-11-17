"use client";

import React, { useEffect, useState } from "react";
import {
  Anchor,
  Plus,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { usePortStore } from "@/store/port.store";
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

const PORT_CATEGORY_LABELS: Record<PortCategory, string> = {
  BARANG: "Pelabuhan Barang",
  PENUMPANG: "Pelabuhan Penumpang",
  CAMPURAN: "Pelabuhan Campuran",
};

const BERTH_STATUS_BADGE: Record<BerthOperationalStatus, string> = {
  OPEN: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CLOSED: "bg-rose-100 text-rose-800 border-rose-200",
  MAINTENANCE: "bg-amber-100 text-amber-800 border-amber-200",
};

const BILLING_ELIGIBILITY_BADGE: Record<BillingEligibility, string> = {
  BILLABLE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  NOT_BILLABLE: "bg-slate-100 text-slate-700 border-slate-200",
  PENDING_VERIFICATION: "bg-amber-50 text-amber-700 border-amber-200",
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
  const [feedback, setFeedback] = useState<string | null>(null);

  // Port modal state
  const [isPortModalOpen, setIsPortModalOpen] = useState(false);
  const [editingPort, setEditingPort] = useState<PortItem | null>(null);
  const [portCode, setPortCode] = useState("");
  const [portName, setPortName] = useState("");
  const [portLocation, setPortLocation] = useState("");
  const [portCategory, setPortCategory] = useState<PortCategory>("CAMPURAN");

  // Berth modal state
  const [isBerthModalOpen, setIsBerthModalOpen] = useState(false);
  const [editingBerth, setEditingBerth] = useState<BerthItem | null>(null);
  const [berthPortId, setBerthPortId] = useState<number>(0);
  const [berthCode, setBerthCode] = useState("");
  const [berthName, setBerthName] = useState("");
  const [berthType, setBerthType] = useState<BerthType>("DERMAGA_BESI_BETON_KAYU");
  const [berthServiceCategory, setBerthServiceCategory] =
    useState<BerthServiceCategory>("DERMAGA_CAMPURAN");
  const [berthStatus, setBerthStatus] = useState<BerthOperationalStatus>("OPEN");
  const [authorityType, setAuthorityType] = useState<AuthorityType>("PEMDA_DISHUB");
  const [billingEligibility, setBillingEligibility] =
    useState<BillingEligibility>("BILLABLE");
  const [maxLengthMeters, setMaxLengthMeters] = useState("");
  const [maxDraftMeters, setMaxDraftMeters] = useState("");

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

  const openCreatePort = () => {
    setEditingPort(null);
    setPortCode("");
    setPortName("");
    setPortLocation("");
    setPortCategory("CAMPURAN");
    clearError();
    setIsPortModalOpen(true);
  };

  const openEditPort = (port: PortItem) => {
    setEditingPort(port);
    setPortCode(port.code);
    setPortName(port.name);
    setPortLocation(port.location || "");
    setPortCategory(port.portCategory);
    clearError();
    setIsPortModalOpen(true);
  };

  const handleSavePort = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (editingPort) {
      await updatePort(editingPort.id, {
        name: portName.trim(),
        location: portLocation.trim() || undefined,
        portCategory,
      });
      setFeedback(`Pelabuhan ${portName} berhasil diperbarui.`);
    } else {
      await createPort({
        code: portCode.trim().toUpperCase(),
        name: portName.trim(),
        location: portLocation.trim() || undefined,
        portCategory,
      });
      setFeedback(`Pelabuhan ${portName} berhasil ditambahkan.`);
    }
    setIsPortModalOpen(false);
  };

  const openCreateBerth = (portId: number) => {
    setEditingBerth(null);
    setBerthPortId(portId);
    setBerthCode("");
    setBerthName("");
    setBerthType("DERMAGA_BESI_BETON_KAYU");
    setBerthServiceCategory("DERMAGA_CAMPURAN");
    setBerthStatus("OPEN");
    setAuthorityType("PEMDA_DISHUB");
    setBillingEligibility("BILLABLE");
    setMaxLengthMeters("");
    setMaxDraftMeters("");
    clearError();
    setIsBerthModalOpen(true);
  };

  const openEditBerth = (berth: BerthItem) => {
    setEditingBerth(berth);
    setBerthPortId(berth.portId);
    setBerthCode(berth.code);
    setBerthName(berth.name);
    setBerthType(berth.berthType);
    setBerthServiceCategory(berth.berthServiceCategory);
    setBerthStatus(berth.operationalStatus);
    setAuthorityType(berth.authorityType);
    setBillingEligibility(berth.billingEligibility);
    setMaxLengthMeters(berth.maxLengthMeters ? String(berth.maxLengthMeters) : "");
    setMaxDraftMeters(berth.maxDraftMeters ? String(berth.maxDraftMeters) : "");
    clearError();
    setIsBerthModalOpen(true);
  };

  const handleSaveBerth = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const parsedLength = maxLengthMeters ? Number(maxLengthMeters) : undefined;
    const parsedDraft = maxDraftMeters ? Number(maxDraftMeters) : undefined;

    if (editingBerth) {
      await updateBerth(editingBerth.id, {
        name: berthName.trim(),
        berthServiceCategory,
        operationalStatus: berthStatus,
        maxLengthMeters: parsedLength,
        maxDraftMeters: parsedDraft,
      });
      setFeedback(`Dermaga ${berthName} berhasil diperbarui.`);
    } else {
      await createBerth({
        portId: berthPortId,
        code: berthCode.trim().toUpperCase(),
        name: berthName.trim(),
        berthType,
        berthServiceCategory,
        operationalStatus: berthStatus,
        authorityType,
        billingEligibility,
        maxLengthMeters: parsedLength,
        maxDraftMeters: parsedDraft,
      });
      setFeedback(`Dermaga ${berthName} berhasil ditambahkan.`);
    }
    setIsBerthModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as PortCategory | "")}
            className="px-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0B241E] focus:outline-none focus:border-[#0B241E]"
          >
            <option value="">Semua Kategori Pelabuhan</option>
            <option value="BARANG">Pelabuhan Barang</option>
            <option value="PENUMPANG">Pelabuhan Penumpang</option>
            <option value="CAMPURAN">Pelabuhan Campuran</option>
          </select>
          <button
            type="button"
            onClick={() => fetchPorts(categoryFilter || undefined)}
            disabled={isLoading}
            className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] flex items-center gap-1.5 cursor-pointer"
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

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

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
        <div className="space-y-5">
          {visiblePorts.map((port) => (
            <div
              key={port.id}
              className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs"
            >
              <div className="p-5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center shrink-0">
                    <Anchor className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#0B241E] text-white">
                        {port.code}
                      </span>
                      <h3 className="text-sm font-extrabold text-[#0B241E]">
                        {port.name}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {PORT_CATEGORY_LABELS[port.portCategory]}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {port.location || "Lokasi belum ditentukan"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isSuperadmin && (
                    <button
                      type="button"
                      onClick={() => openEditPort(port)}
                      className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-xs font-bold text-[#334155] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Pelabuhan
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openCreateBerth(port.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#D97706]" />
                    Tambah Dermaga
                  </button>
                </div>
              </div>

              {/* Berths Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B] bg-white">
                      <th className="py-3 px-4">Kode</th>
                      <th className="py-3 px-4">Nama Dermaga</th>
                      <th className="py-3 px-4">Layanan & Struktur</th>
                      <th className="py-3 px-4">Kewenangan & Retribusi</th>
                      <th className="py-3 px-4">Spesifikasi</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] text-xs">
                    {!port.berths || port.berths.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-[#94A3B8]">
                          Belum ada dermaga terdaftar pada pelabuhan ini.
                        </td>
                      </tr>
                    ) : (
                      port.berths.map((berth) => (
                        <tr key={berth.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                            {berth.code}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#1E293B]">
                            {berth.name}
                          </td>
                          <td className="py-3 px-4 text-[#475569]">
                            <div>{berth.berthServiceCategory}</div>
                            <div className="text-[10px] text-[#94A3B8]">
                              {berth.berthType}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-[#334155] font-medium">
                              {berth.authorityType}
                            </div>
                            <span
                              className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                                BILLING_ELIGIBILITY_BADGE[berth.billingEligibility]
                              }`}
                            >
                              {berth.billingEligibility}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-[#475569]">
                            P: {berth.maxLengthMeters ?? "-"} m | Draft:{" "}
                            {berth.maxDraftMeters ?? "-"} m
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                BERTH_STATUS_BADGE[berth.operationalStatus]
                              }`}
                            >
                              {berth.operationalStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => openEditBerth(berth)}
                              className="px-2.5 py-1 rounded-lg border border-[#CBD5E1] hover:bg-[#F1F5F9] text-[11px] font-bold text-[#334155] cursor-pointer"
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
            </div>
          ))}
        </div>
      )}

      {/* Modal Port */}
      {isPortModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePort}
            className="bg-white rounded-2xl border border-[#E2E8F0] w-full max-w-md p-6 space-y-4 shadow-xl"
          >
            <h3 className="text-base font-extrabold text-[#0B241E]">
              {editingPort ? "Edit Pelabuhan" : "Tambah Pelabuhan Baru"}
            </h3>

            {!editingPort && (
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Kode Pelabuhan
                </label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={portCode}
                  onChange={(e) => setPortCode(e.target.value)}
                  placeholder="PMK"
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Nama Pelabuhan
              </label>
              <input
                type="text"
                required
                maxLength={150}
                value={portName}
                onChange={(e) => setPortName(e.target.value)}
                placeholder="Pelabuhan Poumako"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Lokasi
              </label>
              <input
                type="text"
                value={portLocation}
                onChange={(e) => setPortLocation(e.target.value)}
                placeholder="Kabupaten Mimika, Papua Tengah"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Kategori Pelabuhan
              </label>
              <select
                value={portCategory}
                onChange={(e) => setPortCategory(e.target.value as PortCategory)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              >
                <option value="BARANG">BARANG</option>
                <option value="PENUMPANG">PENUMPANG</option>
                <option value="CAMPURAN">CAMPURAN</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPortModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-[#0B241E] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Berth */}
      {isBerthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveBerth}
            className="bg-white rounded-2xl border border-[#E2E8F0] w-full max-w-lg p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-base font-extrabold text-[#0B241E]">
              {editingBerth ? "Edit Dermaga" : "Tambah Dermaga Baru"}
            </h3>

            {!editingBerth && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">
                    Kode Dermaga
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    value={berthCode}
                    onChange={(e) => setBerthCode(e.target.value)}
                    placeholder="DRM-BETON-02"
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">
                    Konstruksi Dermaga
                  </label>
                  <select
                    value={berthType}
                    onChange={(e) => setBerthType(e.target.value as BerthType)}
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                  >
                    <option value="DERMAGA_BESI_BETON_KAYU">
                      Besi / Beton / Kayu
                    </option>
                    <option value="BRESSING_DOLPHIN_PELAMPUNG">
                      Bressing / Dolphin / Pelampung
                    </option>
                    <option value="PINGGIRAN_TALUD">Pinggiran / Talud</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Nama Dermaga
              </label>
              <input
                type="text"
                required
                maxLength={150}
                value={berthName}
                onChange={(e) => setBerthName(e.target.value)}
                placeholder="Dermaga Beton Utama Pemda"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Kategori Layanan
                </label>
                <select
                  value={berthServiceCategory}
                  onChange={(e) =>
                    setBerthServiceCategory(e.target.value as BerthServiceCategory)
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                >
                  <option value="DERMAGA_BARANG">DERMAGA_BARANG</option>
                  <option value="DERMAGA_PENUMPANG">DERMAGA_PENUMPANG</option>
                  <option value="DERMAGA_CAMPURAN">DERMAGA_CAMPURAN</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Status Operasional
                </label>
                <select
                  value={berthStatus}
                  onChange={(e) =>
                    setBerthStatus(e.target.value as BerthOperationalStatus)
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>

            {!editingBerth && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">
                    Otoritas Pengelola
                  </label>
                  <select
                    value={authorityType}
                    onChange={(e) =>
                      setAuthorityType(e.target.value as AuthorityType)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                  >
                    <option value="PEMDA_DISHUB">PEMDA_DISHUB</option>
                    <option value="UPP_KEMENHUB">UPP_KEMENHUB</option>
                    <option value="TUKS_TERSUS">TUKS_TERSUS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">
                    Kelayakan Retribusi
                  </label>
                  <select
                    value={billingEligibility}
                    onChange={(e) =>
                      setBillingEligibility(e.target.value as BillingEligibility)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                  >
                    <option value="BILLABLE">BILLABLE</option>
                    <option value="PENDING_VERIFICATION">
                      PENDING_VERIFICATION
                    </option>
                    <option value="NOT_BILLABLE">NOT_BILLABLE</option>
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Panjang Maksimal (m)
                </label>
                <input
                  type="number"
                  min={1}
                  step="0.1"
                  value={maxLengthMeters}
                  onChange={(e) => setMaxLengthMeters(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Draft Maksimal (m)
                </label>
                <input
                  type="number"
                  min={0.5}
                  step="0.1"
                  value={maxDraftMeters}
                  onChange={(e) => setMaxDraftMeters(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBerthModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-[#0B241E] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
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
