"use client";

import React, { useEffect, useState } from "react";
import {
  Wrench,
  Building2,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useFieldOpsStore } from "@/store/field-ops.store";
import { usePortStore } from "@/store/port.store";
import { formatLabel } from "@/lib/format-labels";
import {
  MaintenanceSeverity,
  MaintenanceStatus,
} from "@/types/field-ops.types";

const SEVERITY_BADGE: Record<MaintenanceSeverity, string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-amber-50 text-amber-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-rose-100 text-rose-800",
};

export default function UptPemeliharaanPage() {
  const { user } = useAuthStore();
  const {
    maintenanceTickets,
    portAssets,
    isLoading,
    isSubmitting,
    error,
    fetchMaintenanceData,
    createMaintenance,
    updateMaintenanceStatus,
    clearError,
  } = useFieldOpsStore();
  const { ports, fetchPorts } = usePortStore();

  const isSuperadmin = user?.role === "SUPERADMIN";
  const [selectedPortId, setSelectedPortId] = useState<string>("");
  const numericPortId = selectedPortId ? Number(selectedPortId) : undefined;
  const activePortId = numericPortId || user?.portId || ports[0]?.id || 1;

  const [feedback, setFeedback] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [severity, setSeverity] = useState<MaintenanceSeverity>("MEDIUM");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [berthId, setBerthId] = useState<string>("");
  const [assetId, setAssetId] = useState<string>("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  useEffect(() => {
    fetchMaintenanceData(numericPortId);
    fetchPorts();
  }, [numericPortId, fetchMaintenanceData, fetchPorts]);

  const activePortBerths =
    ports.find((p) => p.id === activePortId)?.berths ||
    ports.flatMap((p) => p.berths || []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    clearError();
    await createMaintenance(
      {
        portId: activePortId,
        berthId: berthId ? Number(berthId) : undefined,
        assetId: assetId ? Number(assetId) : undefined,
        severity,
        title: title.trim(),
        description: description.trim(),
        evidenceFile,
      },
      numericPortId
    );
    setFeedback("Laporan kerusakan fasilitas berhasil dibuat.");
    setIsModalOpen(false);
    setTitle("");
    setDescription("");
    setEvidenceFile(null);
  };

  const handleStatusChange = async (id: number, status: MaintenanceStatus) => {
    setFeedback(null);
    clearError();
    await updateMaintenanceStatus(id, { status }, numericPortId);
    setFeedback(`Status tiket pemeliharaan #${id} diperbarui menjadi ${status}.`);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
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
            onClick={() => fetchMaintenanceData(numericPortId)}
            disabled={isLoading}
            className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            clearError();
            setIsModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-[#0B241E] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#D97706]" />
          Laporkan Kerusakan
        </button>
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

      {/* Tickets Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#0B241E] flex items-center gap-2">
          <Wrench className="w-4 h-4 text-[#D97706]" />
          Tiket Inspeksi & Pemeliharaan ({maintenanceTickets.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B]">
                <th className="py-3 px-4">No. Tiket</th>
                <th className="py-3 px-4">Judul & Deskripsi</th>
                <th className="py-3 px-4">Objek</th>
                <th className="py-3 px-4">Urgensi</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ubah Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-xs">
              {maintenanceTickets.map((t) => (
                <tr key={t.id}>
                  <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                    {t.ticketNumber}
                  </td>
                  <td className="py-3 px-4 max-w-sm">
                    <div className="font-bold text-[#1E293B]">{t.title}</div>
                    <div className="text-[11px] text-[#64748B] truncate">
                      {t.description}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#475569]">
                    {t.berth
                      ? `Dermaga ${t.berth.code}`
                      : t.asset
                      ? `Aset ${t.asset.assetCode}`
                      : "Umum"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        SEVERITY_BADGE[t.severity]
                      }`}
                    >
                      {formatLabel(t.severity)}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold">{formatLabel(t.status)}</td>
                  <td className="py-3 px-4 text-right">
                    <select
                      disabled={isSubmitting}
                      value={t.status}
                      onChange={(e) =>
                        handleStatusChange(t.id, e.target.value as MaintenanceStatus)
                      }
                      className="px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] text-[11px] font-semibold"
                    >
                      <option value="REPORTED">Baru Dilaporkan</option>
                      <option value="IN_PROGRESS">Sedang Dikerjakan</option>
                      <option value="RESOLVED">Selesai Diperbaiki</option>
                      <option value="CLOSED">Ditutup</option>
                    </select>
                  </td>
                </tr>
              ))}
              {maintenanceTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#94A3B8]">
                    Belum ada laporan kerusakan fasilitas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assets Summary */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#0B241E] flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#D97706]" />
          Inventaris Aset & Koordinat GIS ({portAssets.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B]">
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Nama Aset</th>
                <th className="py-3 px-4">Luas</th>
                <th className="py-3 px-4">Koordinat GIS</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-xs">
              {portAssets.map((a) => (
                <tr key={a.id}>
                  <td className="py-3 px-4 font-mono font-bold">{a.assetCode}</td>
                  <td className="py-3 px-4 font-semibold">{a.name}</td>
                  <td className="py-3 px-4">{a.areaSqm} m²</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#64748B]">
                    {a.gisCoordinates || "-"}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100">
                      {formatLabel(a.status)}
                    </span>
                  </td>
                </tr>
              ))}
              {portAssets.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#94A3B8]">
                    Belum ada aset terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Report Damage */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-3xl border border-[#E2E8F0] w-full max-w-xl p-6 sm:p-8 space-y-5 shadow-2xl"
          >
            <h3 className="text-base font-extrabold text-[#0B241E]">
              Laporkan Kerusakan Fasilitas
            </h3>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul Kerusakan"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
            />
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as MaintenanceSeverity)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
            >
              <option value="LOW">Urgensi Rendah</option>
              <option value="MEDIUM">Urgensi Sedang</option>
              <option value="HIGH">Urgensi Tinggi</option>
              <option value="CRITICAL">Darurat / Kritis</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={berthId}
                onChange={(e) => setBerthId(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              >
                <option value="">Dermaga (Opsional)</option>
                {activePortBerths.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} - {b.name}
                  </option>
                ))}
              </select>
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              >
                <option value="">Aset (Opsional)</option>
                {portAssets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.assetCode} - {a.name}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi detail kerusakan..."
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
              className="w-full text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
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
                Kirim Laporan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
