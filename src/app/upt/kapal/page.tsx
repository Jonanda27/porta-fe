"use client";

import React, { useEffect, useState } from "react";
import {
  Ship,
  Anchor,
  Package,
  Droplet,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useFieldOpsStore } from "@/store/field-ops.store";
import { usePortStore } from "@/store/port.store";
import { toast } from "@/store/toast.store";
import { formatLabel } from "@/lib/format-labels";
import {
  CargoCategory,
  PortEquipmentType,
  UtilityType,
} from "@/types/field-ops.types";
import { UptKapalTabType } from "@/types/upt.types";

export default function UptKapalPage() {
  const { user } = useAuthStore();
  const {
    visits,
    utilities,
    isLoading,
    isSubmitting,
    error,
    fetchVesselOpsData,
    recordArrival,
    startBerthing,
    endBerthing,
    recordDeparture,
    createCargo,
    createEquipment,
    createUtility,
    clearError,
  } = useFieldOpsStore();
  const { ports, fetchPorts } = usePortStore();

  const isSuperadmin = user?.role === "SUPERADMIN";
  const [selectedPortId, setSelectedPortId] = useState<string>("");
  const numericPortId = selectedPortId ? Number(selectedPortId) : undefined;
  const activePortId = Number(numericPortId || user?.portId || ports[0]?.id || 1);

  const [activeTab, setActiveTab] = useState<UptKapalTabType>("visits");

  // Start berthing modal
  const [berthingVisitId, setBerthingVisitId] = useState<number | null>(null);
  const [berthId, setBerthId] = useState<string>("");
  const [isBerthLocked, setIsBerthLocked] = useState<boolean>(false);
  const [berthCategory, setBerthCategory] = useState<"UMUM" | "KHUSUS_TUKS">("UMUM");
  const [overrideReason, setOverrideReason] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  // Cargo & equipment form state
  const [cargoVisitId, setCargoVisitId] = useState<string>("");
  const [cargoCategory, setCargoCategory] = useState<CargoCategory>("ANTARPULAU");
  const [cargoDesc, setCargoDesc] = useState("");
  const [cargoQty, setCargoQty] = useState("");
  const [cargoUnit, setCargoUnit] = useState("ton");

  const [equipVisitId, setEquipVisitId] = useState<string>("");
  const [equipType, setEquipType] = useState<PortEquipmentType>("FORKLIFT");
  const [equipLabel, setEquipLabel] = useState("Forklift 5 Ton");
  const [equipHours, setEquipHours] = useState("2");

  // Utility form state
  const [utilType, setUtilType] = useState<UtilityType>("AIR_BERSIH");
  const [utilVisitId, setUtilVisitId] = useState<string>("");
  const [meterStart, setMeterStart] = useState("");
  const [meterEnd, setMeterEnd] = useState("");
  const [utilUnit, setUtilUnit] = useState("liter");

  useEffect(() => {
    fetchVesselOpsData(numericPortId);
    fetchPorts();
  }, [numericPortId, fetchVesselOpsData, fetchPorts]);

  const activePortBerths =
    ports.find((p) => p.id === activePortId)?.berths ||
    ports.flatMap((p) => p.berths || []);

  const handleArrival = async (visitId: number, visitNumber: string) => {
    clearError();
    try {
      await recordArrival(visitId, new Date().toISOString(), numericPortId);
      toast.success("Kedatangan Dicatat", `Kedatangan (ATA) untuk ${visitNumber} berhasil dicatat.`);
    } catch {
      // Error sudah ditangani di store
    }
  };

  const handleStartBerthing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!berthingVisitId || !berthId) return;
    clearError();
    try {
      await startBerthing(
        berthingVisitId,
        {
          berthId: Number(berthId),
          berthCategory,
          actualStartAt: new Date().toISOString(),
          overrideReason: overrideReason.trim() || undefined,
          safetyChecklistVerified: true,
          evidenceFile,
        },
        numericPortId
      );
      toast.success(
        overrideReason.trim() ? "Override Sandar Dikirim" : "Sandar Dicatat",
        overrideReason.trim()
          ? "Pengajuan override sandar berhasil dikirim dan menunggu persetujuan Admin Pelabuhan di menu Alokasi Dermaga."
          : "Pencatatan sandar (ATB) berhasil disimpan."
      );
      setBerthingVisitId(null);
      setOverrideReason("");
      setEvidenceFile(null);
    } catch {
      // Error sudah ditangani di store
    }
  };

  const handleEndBerthing = async (visitId: number, berthingId: number) => {
    clearError();
    try {
      await endBerthing(visitId, berthingId, new Date().toISOString(), numericPortId);
      toast.success("Selesai Sandar Dicatat", "Selesai sandar berhasil dicatat.");
    } catch {
      // Error sudah ditangani di store
    }
  };

  const handleDeparture = async (visitId: number, visitNumber: string) => {
    clearError();
    try {
      await recordDeparture(visitId, new Date().toISOString(), numericPortId);
      toast.success("Keberangkatan Dicatat", `Keberangkatan (ATD) untuk ${visitNumber} berhasil dicatat.`);
    } catch {
      // Error sudah ditangani di store
    }
  };

  const handleCreateCargo = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await createCargo(
      {
        portId: activePortId,
        visitId: cargoVisitId ? Number(cargoVisitId) : undefined,
        cargoCategory,
        description: cargoDesc.trim(),
        quantity: Number(cargoQty),
        unitLabel: cargoUnit.trim(),
      },
      numericPortId
    );
    toast.success("Bongkar Muat Disimpan", "Catatan bongkar muat berhasil disimpan.");
    setCargoDesc("");
    setCargoQty("");
  };

  const handleCreateEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await createEquipment(
      {
        portId: activePortId,
        visitId: equipVisitId ? Number(equipVisitId) : undefined,
        equipmentType: equipType,
        capacityLabel: equipLabel.trim(),
        durationHours: Number(equipHours),
      },
      numericPortId
    );
    toast.success("Sewa Alat Dicatat", "Sewa alat pelabuhan berhasil dicatat.");
  };

  const handleCreateUtility = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await createUtility(
      {
        portId: activePortId,
        visitId: utilVisitId ? Number(utilVisitId) : undefined,
        utilityType: utilType,
        meterStart: Number(meterStart),
        meterEnd: Number(meterEnd),
        unitLabel: utilUnit.trim(),
      },
      numericPortId
    );
    toast.success("Meter Utilitas Disimpan", "Pembacaan meter utilitas berhasil disimpan.");
    setMeterStart("");
    setMeterEnd("");
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("visits")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
              activeTab === "visits"
                ? "bg-[#0B241E] text-white"
                : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
            }`}
          >
            <Ship className="w-4 h-4 text-[#D97706]" />
            Log Kunjungan & Sandar ({visits.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cargo")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
              activeTab === "cargo"
                ? "bg-[#0B241E] text-white"
                : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
            }`}
          >
            <Package className="w-4 h-4 text-[#D97706]" />
            Bongkar Muat & Sewa Alat
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("utilities")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
              activeTab === "utilities"
                ? "bg-[#0B241E] text-white"
                : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
            }`}
          >
            <Droplet className="w-4 h-4 text-[#D97706]" />
            Utilitas Air & Listrik ({utilities.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isSuperadmin && (
            <select
              value={selectedPortId}
              onChange={(e) => setSelectedPortId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0B241E]"
            >
              <option value="">Semua Pelabuhan</option>
              {ports.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={() => fetchVesselOpsData(numericPortId)}
            disabled={isLoading}
            className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab 1: Visits & Berthing */}
      {activeTab === "visits" && (
        <div className="space-y-4">
          {/* Panel Okupansi Dermaga Real-Time */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs">
            <h3 className="text-xs font-bold text-[#0B241E] mb-3 flex items-center gap-1.5">
              <Anchor className="w-4 h-4 text-[#D97706]" />
              Okupansi Dermaga Real-Time
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activePortBerths.map((berth) => {
                const occupyingVisit = visits.find((v) =>
                  (v.berthingRecords || v.berthings)?.some(
                    (b) =>
                      b.berthId === berth.id &&
                      Boolean(b.actualStartAt) &&
                      !b.actualEndAt &&
                      b.approvalStatus !== "PENDING" &&
                      b.approvalStatus !== "REJECTED"
                  )
                );
                return (
                  <div
                    key={berth.id}
                    className={`p-3 rounded-xl border text-xs ${
                      occupyingVisit
                        ? "bg-amber-50/70 border-amber-200"
                        : berth.operationalStatus === "OPEN"
                        ? "bg-emerald-50/50 border-emerald-200"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-[#0B241E]">
                        {berth.code}
                      </span>
                      <span className="text-[10px] font-bold">
                        {occupyingVisit
                          ? "Terisi"
                          : formatLabel(berth.operationalStatus)}
                      </span>
                    </div>
                    <p className="font-semibold text-[#1E293B] mt-0.5 truncate">
                      {berth.name}
                    </p>
                    <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
                      {occupyingVisit
                        ? `Kapal: ${
                            occupyingVisit.vessel?.name ||
                            occupyingVisit.visitNumber
                          }`
                        : formatLabel(berth.berthServiceCategory)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B] bg-[#F8FAFC]">
                  <th className="py-3 px-4">No. Kunjungan</th>
                  <th className="py-3 px-4">Kapal</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Waktu Aktual (ATA / ATD WIT)</th>
                  <th className="py-3 px-4">Alur &amp; Aksi Lapangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[#64748B]">
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Memuat log kunjungan...
                    </td>
                  </tr>
                ) : visits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[#94A3B8]">
                      Belum ada data kunjungan kapal.
                    </td>
                  </tr>
                ) : (
                  visits.map((v) => {
                    const berthingList = v.berthingRecords || v.berthings || [];
                    const pendingOverride = berthingList.find(
                      (b) => b.approvalStatus === "PENDING" && !b.actualEndAt
                    );
                    const activeBerthing = berthingList.find(
                      (b) =>
                        Boolean(b.actualStartAt) &&
                        !b.actualEndAt &&
                        b.approvalStatus !== "PENDING" &&
                        b.approvalStatus !== "REJECTED"
                    );
                    return (
                      <tr key={v.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                          {v.visitNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#1E293B]">
                            {v.vessel?.name || `Kapal #${v.vesselId}`}
                          </div>
                          <div className="text-[11px] text-[#64748B]">
                            {v.originPort || "-"} → {v.destinationPort || "-"}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                            {formatLabel(v.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-[#475569] font-mono">
                          <div>
                            ATA:{" "}
                            {v.ataAnchorage
                              ? `${new Date(v.ataAnchorage).toLocaleString("id-ID", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  timeZone: "Asia/Jayapura",
                                })} WIT`
                              : "-"}
                          </div>
                          <div>
                            ATD:{" "}
                            {v.atdPort
                              ? `${new Date(v.atdPort).toLocaleString("id-ID", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  timeZone: "Asia/Jayapura",
                                })} WIT`
                              : "-"}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col items-end gap-1.5">
                            {/* Mini Stepper Alur Operasional */}
                            <div className="flex items-center gap-1 text-[10px] font-semibold text-[#94A3B8]">
                              <span
                                className={
                                  v.ataAnchorage
                                    ? "text-emerald-700 font-bold"
                                    : v.status === "APPROVED"
                                    ? "text-[#0B241E] font-bold"
                                    : ""
                                }
                              >
                                1. Tiba
                              </span>
                              <span>→</span>
                              <span
                                className={
                                  activeBerthing ||
                                  v.status === "BERTHED" ||
                                  v.status === "DEPARTED" ||
                                  v.status === "BILLED" ||
                                  v.status === "SETTLED"
                                    ? "text-emerald-700 font-bold"
                                    : v.status === "ANCHORED"
                                    ? "text-amber-700 font-bold"
                                    : ""
                                }
                              >
                                2. Sandar
                              </span>
                              <span>→</span>
                              <span
                                className={
                                  v.status === "BERTHED" && !activeBerthing
                                    ? "text-blue-700 font-bold"
                                    : v.atdPort
                                    ? "text-emerald-700 font-bold"
                                    : ""
                                }
                              >
                                3. Lepas
                              </span>
                              <span>→</span>
                              <span className={v.atdPort ? "text-emerald-700 font-bold" : ""}>
                                4. Berangkat
                              </span>
                            </div>

                            <div className="flex items-center justify-end gap-2 flex-wrap">
                              {/* Langkah 1: Catat Tiba (ATA) */}
                              {v.status === "APPROVED" && (
                                <button
                                  type="button"
                                  disabled={isSubmitting}
                                  onClick={() => handleArrival(v.id, v.visitNumber)}
                                  className="px-3 py-1.5 rounded-lg bg-[#0B241E] hover:bg-[#13382F] text-white text-[11px] font-bold cursor-pointer transition-colors"
                                >
                                  1. Catat Tiba (ATA)
                                </button>
                              )}

                              {/* Langkah 2: Mulai Sandar (ATB) setelah kapal tiba / berlabuh */}
                              {v.status === "ANCHORED" && !activeBerthing && pendingOverride && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                                  Menunggu Persetujuan Override (Menu Alokasi UPT)
                                </span>
                              )}

                              {v.status === "ANCHORED" && !activeBerthing && !pendingOverride && (
                                <>
                                  <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => {
                                      const allocatedBerthing =
                                        v.berthingRecords?.[0] || v.berthings?.[0];
                                      const allocatedBerthId = allocatedBerthing?.berthId;
                                      setBerthingVisitId(v.id);
                                      setBerthId(
                                        allocatedBerthId
                                          ? String(allocatedBerthId)
                                          : activePortBerths[0]?.id
                                          ? String(activePortBerths[0].id)
                                          : ""
                                      );
                                      setIsBerthLocked(Boolean(allocatedBerthId));
                                      if (allocatedBerthing?.berthCategory) {
                                        setBerthCategory(allocatedBerthing.berthCategory);
                                      }
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <Anchor className="w-3 h-3" />
                                    2. Mulai Sandar (ATB)
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => handleDeparture(v.id, v.visitNumber)}
                                    title="Gunakan hanya jika kapal langsung bertolak tanpa sandar di dermaga"
                                    className="px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#475569] text-[11px] font-semibold cursor-pointer transition-colors"
                                  >
                                    Berangkat Tanpa Sandar
                                  </button>
                                </>
                              )}

                              {/* Langkah 3: Lepas Sandar saat kapal sedang sandar */}
                              {activeBerthing && (
                                <button
                                  type="button"
                                  disabled={isSubmitting}
                                  onClick={() => handleEndBerthing(v.id, activeBerthing.id)}
                                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold cursor-pointer transition-colors"
                                >
                                  3. Lepas Sandar
                                </button>
                              )}

                              {/* Langkah 4: Catat Berangkat (ATD) setelah lepas sandar */}
                              {v.status === "BERTHED" && !activeBerthing && (
                                <button
                                  type="button"
                                  disabled={isSubmitting}
                                  onClick={() => handleDeparture(v.id, v.visitNumber)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer transition-colors"
                                >
                                  4. Catat Berangkat (ATD)
                                </button>
                              )}

                              {(v.status === "DEPARTED" ||
                                v.status === "BILLED" ||
                                v.status === "SETTLED") && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10.5px] font-bold">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Pelayaran Selesai
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}

      {/* Tab 2: Cargo & Equipment */}
      {activeTab === "cargo" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form
            onSubmit={handleCreateCargo}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-2xs"
          >
            <h3 className="text-sm font-extrabold text-[#0B241E] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#D97706]" />
              Catat Bongkar Muat Barang
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Kategori Muatan
                </label>
                <select
                  value={cargoCategory}
                  onChange={(e) => setCargoCategory(e.target.value as CargoCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                >
                  <option value="ANTARPULAU">Muatan Antarpulau</option>
                  <option value="IMPOR_EKSPOR">Muatan Ekspor / Impor</option>
                  <option value="BULOG_PUPUK">Beras Bulog / Pupuk Subsidi</option>
                  <option value="HEWAN_TERNAK">Hewan Ternak</option>
                  <option value="PETI_KEMAS_20FT">Peti Kemas 20 Feet</option>
                  <option value="PETI_KEMAS_40FT">Peti Kemas 40 Feet</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Kunjungan Kapal (Opsional)
                </label>
                <select
                  value={cargoVisitId}
                  onChange={(e) => setCargoVisitId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                >
                  <option value="">Umum / Tanpa Kunjungan</option>
                  {visits.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.visitNumber} ({v.vessel?.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Deskripsi Muatan
              </label>
              <input
                type="text"
                required
                value={cargoDesc}
                onChange={(e) => setCargoDesc(e.target.value)}
                placeholder="Bongkar muat beras Bulog 100 ton"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Volume / Jumlah
                </label>
                <input
                  type="number"
                  required
                  min={0.01}
                  step="0.01"
                  value={cargoQty}
                  onChange={(e) => setCargoQty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Satuan
                </label>
                <input
                  type="text"
                  required
                  value={cargoUnit}
                  onChange={(e) => setCargoUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#0B241E] text-white text-xs font-bold cursor-pointer"
            >
              Simpan Bongkar Muat
            </button>
          </form>

          <form
            onSubmit={handleCreateEquipment}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-2xs"
          >
            <h3 className="text-sm font-extrabold text-[#0B241E] flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#D97706]" />
              Catat Sewa Alat Pelabuhan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Jenis Alat
                </label>
                <select
                  value={equipType}
                  onChange={(e) => setEquipType(e.target.value as PortEquipmentType)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                >
                  <option value="FORKLIFT">Forklift Pelabuhan</option>
                  <option value="CRANE_LISTRIK_DIESEL">Crane Listrik / Diesel</option>
                  <option value="MOTOR_LONG_BOAT">Motor Long Boat</option>
                  <option value="GEROBAK_DORONG">Gerobak Dorong</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Kunjungan (Opsional)
                </label>
                <select
                  value={equipVisitId}
                  onChange={(e) => setEquipVisitId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                >
                  <option value="">Umum</option>
                  {visits.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.visitNumber} ({v.vessel?.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Label Kapasitas
                </label>
                <input
                  type="text"
                  required
                  value={equipLabel}
                  onChange={(e) => setEquipLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Durasi (Jam)
                </label>
                <input
                  type="number"
                  required
                  min={0.5}
                  step="0.5"
                  value={equipHours}
                  onChange={(e) => setEquipHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#0B241E] text-white text-xs font-bold cursor-pointer"
            >
              Simpan Sewa Alat
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Utilities */}
      {activeTab === "utilities" && (
        <div className="space-y-6">
          <form
            onSubmit={handleCreateUtility}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-2xs"
          >
            <h3 className="text-sm font-extrabold text-[#0B241E]">
              Catat Meteran Air Bersih / Listrik
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <select
                value={utilType}
                onChange={(e) => setUtilType(e.target.value as UtilityType)}
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              >
                <option value="AIR_BERSIH">Air Bersih Kapal / Kios</option>
                <option value="LISTRIK">Aliran Listrik (kWh)</option>
              </select>
              <select
                value={utilVisitId}
                onChange={(e) => setUtilVisitId(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              >
                <option value="">Kunjungan (Opsional)</option>
                {visits.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.visitNumber}
                  </option>
                ))}
              </select>
              <input
                type="number"
                required
                min={0}
                value={meterStart}
                onChange={(e) => setMeterStart(e.target.value)}
                placeholder="Meter Awal"
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
              <input
                type="number"
                required
                min={0}
                value={meterEnd}
                onChange={(e) => setMeterEnd(e.target.value)}
                placeholder="Meter Akhir"
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
              <input
                type="text"
                required
                value={utilUnit}
                onChange={(e) => setUtilUnit(e.target.value)}
                placeholder="Satuan (liter / kWh)"
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#0B241E] text-white text-xs font-bold cursor-pointer"
            >
              Simpan Meteran
            </button>
          </form>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B] bg-[#F8FAFC]">
                  <th className="py-3 px-4">No. Catatan</th>
                  <th className="py-3 px-4">Utilitas</th>
                  <th className="py-3 px-4">Meter Awal → Akhir</th>
                  <th className="py-3 px-4">Volume</th>
                  <th className="py-3 px-4">Tagihan</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {utilities.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                      {u.readingNumber}
                    </td>
                    <td className="py-3 px-4">{formatLabel(u.utilityType)}</td>
                    <td className="py-3 px-4 font-mono">
                      {u.meterStart} → {u.meterEnd}
                    </td>
                    <td className="py-3 px-4">
                      {u.volumeConsumed} {u.unitLabel}
                    </td>
                    <td className="py-3 px-4 font-bold">
                      Rp {Number(u.totalAmountIdr).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100">
                        {formatLabel(u.paymentStatus)}
                      </span>
                    </td>
                  </tr>
                ))}
                {utilities.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#94A3B8]">
                      Belum ada catatan meteran utilitas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Start Berthing Modal */}
      {berthingVisitId && (() => {
        const activeVisitObj = visits.find((v) => v.id === berthingVisitId);
        const selectedBerthObj = activePortBerths.find(
          (b) => String(b.id) === berthId
        );
        const vesselCat = activeVisitObj?.vessel?.vesselCategory;
        const berthCat = selectedBerthObj?.berthServiceCategory;
        const isCategoryMismatch = Boolean(
          vesselCat &&
            berthCat &&
            berthCat !== "DERMAGA_CAMPURAN" &&
            !(vesselCat === "BARANG" && berthCat === "DERMAGA_BARANG") &&
            !(vesselCat === "PENUMPANG" && berthCat === "DERMAGA_PENUMPANG")
        );

        return (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleStartBerthing}
            className="bg-white rounded-3xl border border-[#E2E8F0] w-full max-w-xl p-6 space-y-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center shrink-0">
                  <Anchor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0B241E]">
                    Mulai Sandar Kapal (ATB)
                  </h3>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    {activeVisitObj?.vessel?.name || `Kapal #${activeVisitObj?.vesselId || ""}`}{" "}
                    <span className="font-mono text-[#94A3B8]">
                      ({activeVisitObj?.visitNumber || ""})
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBerthingVisitId(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
                aria-label="Tutup modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#334155]">
                  Dermaga Sandar
                </label>
                {isBerthLocked && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Sesuai Alokasi UPT
                  </span>
                )}
              </div>
              {isBerthLocked ? (
                <div className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#0B241E]">
                  {(() => {
                    const allocBerth =
                      activeVisitObj?.berthingRecords?.[0]?.berth ||
                      activeVisitObj?.berthings?.[0]?.berth;
                    if (selectedBerthObj) {
                      return `${selectedBerthObj.code} - ${selectedBerthObj.name} (${formatLabel(
                        selectedBerthObj.berthServiceCategory
                      )})`;
                    }
                    if (allocBerth) {
                      return `${allocBerth.code} - ${allocBerth.name}`;
                    }
                    return `Dermaga #${berthId}`;
                  })()}
                </div>
              ) : (
                <select
                  required
                  value={berthId}
                  onChange={(e) => setBerthId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
                >
                  <option value="">-- Pilih Dermaga --</option>
                  {activePortBerths.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} - {b.name} ({formatLabel(b.berthServiceCategory)})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Kategori Tambat
              </label>
              {isBerthLocked ? (
                <div className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#334155]">
                  {berthCategory === "KHUSUS_TUKS"
                    ? "Tambat Khusus / TUKS"
                    : "Tambat Dermaga Umum"}
                </div>
              ) : (
                <select
                  value={berthCategory}
                  onChange={(e) =>
                    setBerthCategory(e.target.value as "UMUM" | "KHUSUS_TUKS")
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
                >
                  <option value="UMUM">Tambat Dermaga Umum</option>
                  <option value="KHUSUS_TUKS">Tambat Khusus / TUKS</option>
                </select>
              )}
            </div>
            {(isCategoryMismatch || !isBerthLocked) && (
              <div className="space-y-1.5">
                {isCategoryMismatch && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold">
                    Kategori kapal ({formatLabel(vesselCat || "")}) tidak sesuai dengan peruntukan dermaga ({formatLabel(berthCat || "")}). Wajib mengisi alasan override untuk pengajuan persetujuan.
                  </div>
                )}
                <label className="block text-xs font-bold text-[#334155]">
                  Alasan Override {isCategoryMismatch ? <span className="text-rose-500">*</span> : "(Opsional)"}
                </label>
                <input
                  type="text"
                  required={isCategoryMismatch}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder={
                    isCategoryMismatch
                      ? "Contoh: Dermaga barang penuh, dialihkan sementara ke dermaga penumpang"
                      : "Opsional"
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Foto Bukti Sandar (Opsional)
              </label>
              {evidenceFile ? (
                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0B241E] truncate">
                        {evidenceFile.name}
                      </p>
                      <p className="text-[10px] text-[#64748B]">
                        {(evidenceFile.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEvidenceFile(null)}
                    className="p-1.5 rounded-lg text-[#64748B] hover:text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0"
                    title="Hapus foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-xs font-semibold text-[#475569] cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-[#64748B]" />
                  <span>Pilih Foto Bukti Sandar (JPG / PNG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setBerthingVisitId(null)}
                className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] hover:bg-[#F8FAFC] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#0B241E] hover:bg-[#13382F] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Simpan Sandar
              </button>
            </div>
          </form>
        </div>
        );
      })()}
    </div>
  );
}
