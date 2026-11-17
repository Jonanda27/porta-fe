"use client";

import React, { useEffect, useState } from "react";
import {
  QrCode,
  FileCheck2,
  MapPin,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useFieldOpsStore } from "@/store/field-ops.store";
import { usePortStore } from "@/store/port.store";
import { TerminalClass } from "@/types/field-ops.types";

type TabType = "books" | "manifests" | "routes";

export default function UptTiketPage() {
  const { user } = useAuthStore();
  const {
    ticketBooks,
    ferryRoutes,
    manifests,
    visits,
    isLoading,
    isSubmitting,
    error,
    fetchTicketingData,
    createTicketBook,
    createManifest,
    clearError,
  } = useFieldOpsStore();
  const { ports, fetchPorts } = usePortStore();

  const isSuperadmin = user?.role === "SUPERADMIN";
  const canCreateBook = isSuperadmin || user?.role === "ADMIN_PELABUHAN";
  const [selectedPortId, setSelectedPortId] = useState<string>("");
  const numericPortId = selectedPortId ? Number(selectedPortId) : undefined;
  const activePortId = numericPortId || user?.portId || ports[0]?.id || 1;

  const [activeTab, setActiveTab] = useState<TabType>("books");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Create book modal
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookCode, setBookCode] = useState("");
  const [ticketCategory, setTicketCategory] = useState("PAS_PENUMPANG");
  const [serialStart, setSerialStart] = useState("1");
  const [serialEnd, setSerialEnd] = useState("100");
  const [nominalPerTicket, setNominalPerTicket] = useState("5000");

  // Create manifest form
  const [manifestVisitId, setManifestVisitId] = useState<string>("");
  const [manifestRouteId, setManifestRouteId] = useState<string>("");
  const [terminalClass, setTerminalClass] = useState<TerminalClass>("KELAS_B");
  const [adultCount, setAdultCount] = useState("0");
  const [childCount, setChildCount] = useState("0");
  const [vehicleCount, setVehicleCount] = useState("0");
  const [cargoTons, setCargoTons] = useState("0");

  useEffect(() => {
    fetchTicketingData(numericPortId);
    fetchPorts();
  }, [numericPortId, fetchTicketingData, fetchPorts]);

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    clearError();
    await createTicketBook(
      {
        portId: activePortId,
        bookCode: bookCode.trim().toUpperCase(),
        ticketCategory: ticketCategory.trim(),
        serialStart: Number(serialStart),
        serialEnd: Number(serialEnd),
        nominalPerTicket: Number(nominalPerTicket),
      },
      numericPortId
    );
    setFeedback(`Buku karcis ${bookCode.toUpperCase()} berhasil didaftarkan.`);
    setIsBookModalOpen(false);
    setBookCode("");
  };

  const handleCreateManifest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manifestVisitId) return;
    setFeedback(null);
    clearError();
    await createManifest(
      {
        portId: activePortId,
        visitId: Number(manifestVisitId),
        ferryRouteId: manifestRouteId ? Number(manifestRouteId) : undefined,
        terminalClass,
        adultCount: Number(adultCount),
        childCount: Number(childCount),
        vehicleCount: Number(vehicleCount),
        cargoTons: Number(cargoTons),
      },
      numericPortId
    );
    setFeedback("Manifes kapal berhasil dicatat.");
    setAdultCount("0");
    setChildCount("0");
    setVehicleCount("0");
    setCargoTons("0");
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("books")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
              activeTab === "books"
                ? "bg-[#0B241E] text-white"
                : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
            }`}
          >
            <QrCode className="w-4 h-4 text-[#D97706]" />
            Buku Karcis / Porporasi ({ticketBooks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manifests")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
              activeTab === "manifests"
                ? "bg-[#0B241E] text-white"
                : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-[#D97706]" />
            Manifes Penumpang & Muatan ({manifests.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("routes")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
              activeTab === "routes"
                ? "bg-[#0B241E] text-white"
                : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
            }`}
          >
            <MapPin className="w-4 h-4 text-[#D97706]" />
            Rute Penyeberangan ({ferryRoutes.length})
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
            onClick={() => fetchTicketingData(numericPortId)}
            disabled={isLoading}
            className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          {canCreateBook && activeTab === "books" && (
            <button
              type="button"
              onClick={() => setIsBookModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#0B241E] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#D97706]" />
              Tambah Buku Karcis
            </button>
          )}
        </div>
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

      {/* Tab 1: Ticket Books */}
      {activeTab === "books" && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B] bg-[#F8FAFC]">
                <th className="py-3 px-4">Kode Buku</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Seri</th>
                <th className="py-3 px-4">Nominal</th>
                <th className="py-3 px-4">Porporasi</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-xs">
              {ticketBooks.map((b) => (
                <tr key={b.id}>
                  <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                    {b.bookCode}
                  </td>
                  <td className="py-3 px-4">{b.ticketCategory}</td>
                  <td className="py-3 px-4 font-mono">
                    {b.serialStart} – {b.serialEnd}
                  </td>
                  <td className="py-3 px-4 font-bold">
                    Rp {Number(b.nominalPerTicket).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-4 text-[#64748B]">
                    {b.porporasiNumber || "-"}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
              {ticketBooks.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#94A3B8]">
                    Belum ada buku karcis terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Manifests */}
      {activeTab === "manifests" && (
        <div className="space-y-6">
          <form
            onSubmit={handleCreateManifest}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-2xs"
          >
            <h3 className="text-sm font-extrabold text-[#0B241E]">
              Catat Manifes Keberangkatan Kapal
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                required
                value={manifestVisitId}
                onChange={(e) => setManifestVisitId(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              >
                <option value="">-- Pilih Kunjungan Kapal --</option>
                {visits.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.visitNumber} ({v.vessel?.name})
                  </option>
                ))}
              </select>
              <select
                value={manifestRouteId}
                onChange={(e) => setManifestRouteId(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              >
                <option value="">Rute Penyeberangan (Opsional)</option>
                {ferryRoutes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.destinationName} ({r.distanceMiles} mil)
                  </option>
                ))}
              </select>
              <select
                value={terminalClass}
                onChange={(e) => setTerminalClass(e.target.value as TerminalClass)}
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              >
                <option value="KELAS_A">KELAS_A</option>
                <option value="KELAS_B">KELAS_B</option>
                <option value="KELAS_C">KELAS_C</option>
              </select>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#334155] mb-1">
                  Penumpang Dewasa
                </label>
                <input
                  type="number"
                  min={0}
                  value={adultCount}
                  onChange={(e) => setAdultCount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#334155] mb-1">
                  Anak
                </label>
                <input
                  type="number"
                  min={0}
                  value={childCount}
                  onChange={(e) => setChildCount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#334155] mb-1">
                  Kendaraan
                </label>
                <input
                  type="number"
                  min={0}
                  value={vehicleCount}
                  onChange={(e) => setVehicleCount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#334155] mb-1">
                  Muatan (Ton)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.1"
                  value={cargoTons}
                  onChange={(e) => setCargoTons(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#0B241E] text-white text-xs font-bold cursor-pointer"
            >
              Simpan Manifes
            </button>
          </form>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B] bg-[#F8FAFC]">
                  <th className="py-3 px-4">No. Manifes</th>
                  <th className="py-3 px-4">Kunjungan</th>
                  <th className="py-3 px-4">Penumpang (D/A)</th>
                  <th className="py-3 px-4">Kendaraan</th>
                  <th className="py-3 px-4">Muatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {manifests.map((m) => (
                  <tr key={m.id}>
                    <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                      {m.manifestNumber}
                    </td>
                    <td className="py-3 px-4">
                      {m.visit?.visitNumber || `Visit #${m.visitId}`}
                    </td>
                    <td className="py-3 px-4">
                      {m.adultCount} / {m.childCount}
                    </td>
                    <td className="py-3 px-4">{m.vehicleCount}</td>
                    <td className="py-3 px-4">{m.cargoTons} ton</td>
                  </tr>
                ))}
                {manifests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#94A3B8]">
                      Belum ada manifes tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Ferry Routes */}
      {activeTab === "routes" && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B] bg-[#F8FAFC]">
                <th className="py-3 px-4">Tujuan</th>
                <th className="py-3 px-4">Jarak</th>
                <th className="py-3 px-4">Tarif Dewasa</th>
                <th className="py-3 px-4">Tarif Anak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-xs">
              {ferryRoutes.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 px-4 font-bold text-[#0B241E]">
                    {r.destinationName}
                  </td>
                  <td className="py-3 px-4">{r.distanceMiles} mil</td>
                  <td className="py-3 px-4">
                    Rp {Number(r.adultFareIdr).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-4">
                    Rp {Number(r.childFareIdr).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
              {ferryRoutes.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#94A3B8]">
                    Belum ada rute penyeberangan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Book */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateBook}
            className="bg-white rounded-2xl border border-[#E2E8F0] w-full max-w-md p-6 space-y-4 shadow-xl"
          >
            <h3 className="text-base font-extrabold text-[#0B241E]">
              Tambah Buku Karcis / Porporasi
            </h3>
            <input
              type="text"
              required
              value={bookCode}
              onChange={(e) => setBookCode(e.target.value)}
              placeholder="Kode Buku (mis. KRC-PMK-01)"
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
            />
            <input
              type="text"
              required
              value={ticketCategory}
              onChange={(e) => setTicketCategory(e.target.value)}
              placeholder="Kategori (mis. PAS_PENUMPANG)"
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                required
                min={1}
                value={serialStart}
                onChange={(e) => setSerialStart(e.target.value)}
                placeholder="Seri Awal"
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
              <input
                type="number"
                required
                min={1}
                value={serialEnd}
                onChange={(e) => setSerialEnd(e.target.value)}
                placeholder="Seri Akhir"
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
              <input
                type="number"
                required
                min={0}
                value={nominalPerTicket}
                onChange={(e) => setNominalPerTicket(e.target.value)}
                placeholder="Nominal"
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
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
                Simpan Buku
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
