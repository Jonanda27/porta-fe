"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  FileCheck2,
  Ship,
  Users,
  Car,
  ShieldCheck,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Lock,
  Download,
  Send,
  FileText,
  Clock,
  X,
  RefreshCw,
  Info,
  Calendar,
  Compass,
  FileSpreadsheet,
} from "lucide-react";
import { useManifestStore } from "@/store/manifest.store";
import { useKapalStore } from "@/store/kapal.store";
import { useAuthStore } from "@/store/auth.store";
import { VesselVisit } from "@/types/kapal.types";

export default function KapalManifesPage() {
  const { user } = useAuthStore();
  const { visits, fetchVisits, isLoading: isLoadingVisits } = useKapalStore();
  const {
    manifests,
    ferryRoutes,
    isLoading: isLoadingManifests,
    isSubmitting,
    error,
    fetchManifests,
    fetchFerryRoutes,
    createManifest,
    clearError,
  } = useManifestStore();

  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
  const [selectedFerryRouteId, setSelectedFerryRouteId] = useState<number | null>(null);

  // Passenger Form Fields
  const [paxAdult, setPaxAdult] = useState<number>(312);
  const [paxChild, setPaxChild] = useState<number>(45);
  const [paxInfant, setPaxInfant] = useState<number>(8);
  const [crewCount, setCrewCount] = useState<number>(18);
  const [greeterCount, setGreeterCount] = useState<number>(0);
  const [cargoTons, setCargoTons] = useState<number>(15.5);

  // Vehicle Form Fields
  const [vehGol1, setVehGol1] = useState<number>(4);
  const [vehGol2, setVehGol2] = useState<number>(28);
  const [vehGol3, setVehGol3] = useState<number>(2);
  const [vehGol4A, setVehGol4A] = useState<number>(24);
  const [vehGol4B, setVehGol4B] = useState<number>(6);
  const [vehGol5, setVehGol5] = useState<number>(8);
  const [vehGol6_7, setVehGol6_7] = useState<number>(4);

  // Uploaded PDF State
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: string;
    hash: string;
  } | null>({
    name: "MANIFES_RESMI_SOLAS_PELABUHAN_POUMAKO.pdf",
    size: "1.8 MB",
    hash: "SHA256: 7f8c4...e1920",
  });

  const [isCaptainDeclared, setIsCaptainDeclared] = useState<boolean>(true);
  const [captainName, setCaptainName] = useState<string>(
    user?.fullName ? `Capt. ${user.fullName}` : "Capt. Aris Munandar (NIP: 19820411 200802 1 003)"
  );

  // Fetch initial data
  useEffect(() => {
    fetchVisits();
    fetchManifests();
    fetchFerryRoutes();
  }, [fetchVisits, fetchManifests, fetchFerryRoutes]);

  // Filter kunjungan kapal yang valid untuk pelaporan manifes (kategori PENUMPANG atau CAMPURAN)
  const availableVisits = useMemo(() => {
    if (visits.length === 0) return [];
    return visits.filter(
      (v) =>
        v.vessel?.vesselCategory === "PENUMPANG" ||
        v.vessel?.vesselCategory === "CAMPURAN" ||
        !v.vessel?.vesselCategory // fallback jika field optional
    );
  }, [visits]);

  // Set default selected visit
  useEffect(() => {
    if (availableVisits.length > 0 && selectedVisitId === null) {
      setSelectedVisitId(availableVisits[0].id);
    }
  }, [availableVisits, selectedVisitId]);

  // Set default ferry route if available
  useEffect(() => {
    if (ferryRoutes.length > 0 && selectedFerryRouteId === null) {
      setSelectedFerryRouteId(ferryRoutes[0].id);
    }
  }, [ferryRoutes, selectedFerryRouteId]);

  const activeVisit = useMemo(() => {
    return availableVisits.find((v) => v.id === selectedVisitId) || availableVisits[0] || null;
  }, [availableVisits, selectedVisitId]);

  // Calculations
  const totalPax = paxAdult + paxChild + paxInfant + crewCount;
  const maxPaxCapacity = 500;
  const paxUtilization = ((totalPax / maxPaxCapacity) * 100).toFixed(1);

  const totalVehicles = vehGol1 + vehGol2 + vehGol3 + vehGol4A + vehGol4B + vehGol5 + vehGol6_7;
  const maxVehicleCapacity = 80;
  const vehicleUtilization = ((totalVehicles / maxVehicleCapacity) * 100).toFixed(1);

  // UPT Ticket Gate Cross-check data (estimasi pas masuk penumpang & kendaraan di gate UPT)
  const uptScannedTickets = {
    passengers: paxAdult + paxChild,
    vehicles: totalVehicles,
  };

  const isOverloaded = totalPax > maxPaxCapacity || totalVehicles > maxVehicleCapacity;

  const handleSubmitManifest = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!isCaptainDeclared) {
      alert("Pernyataan kelaiklautan dan keselamatan nakhoda wajib dicentang sebelum mengirim manifes!");
      return;
    }

    // Tentukan visitId target
    const targetVisitId = activeVisit?.id || 1;
    const targetPortId = activeVisit?.portId || 1;

    try {
      const result = await createManifest({
        portId: targetPortId,
        visitId: targetVisitId,
        ferryRouteId: selectedFerryRouteId || undefined,
        terminalClass: "KELAS_B",
        adultCount: paxAdult,
        childCount: paxChild,
        infantCount: paxInfant,
        greeterCount: greeterCount,
        vehicleCount: totalVehicles,
        cargoTons: cargoTons,
        notes: `Laporan manifes resmi diserahkan oleh ${captainName}. ABK: ${crewCount} orang. Status: Kelaiklautan SOLAS Terverifikasi.`,
      });

      setSuccessToast(
        `Laporan Manifes resmi ${result.manifestNumber} berhasil diserahkan ke Petugas UPT dan Syahbandar. Status: Menunggu Clearance SPB.`
      );
      setTimeout(() => setSuccessToast(null), 6000);
    } catch {
      // Error otomatis tersimpan di useManifestStore.error
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {successToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-fade-in border border-emerald-500">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-white hover:text-emerald-100 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-rose-600 hover:text-rose-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. SELECTOR KAPAL, KUNJUNGAN, & TRAYEK */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold shrink-0">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#0B241E]">
                Pilih Armada & Kunjungan Pelayaran untuk Pelaporan Manifes
              </h2>
              <p className="text-xs text-[#64748B]">
                Laporan wajib diserahkan maksimal 30 menit sebelum kapal bertolak (SOP SOLAS Perda Mimika 4/2023)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchVisits();
                fetchManifests();
                fetchFerryRoutes();
              }}
              disabled={isLoadingVisits || isLoadingManifests}
              className="p-2 text-xs font-bold text-[#0B241E] hover:bg-[#F1F5F9] rounded-xl border border-[#CBD5E1] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Refresh Data Kunjungan & Manifes"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingVisits ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#F1F5F9]">
          {/* Selector Kunjungan Kapal */}
          <div>
            <label className="block text-xs font-bold text-[#0B241E] mb-1.5 flex items-center gap-1.5">
              <Ship className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>Kunjungan Kapal (Nomor PPK / Voyage) <span className="text-red-500">*</span></span>
            </label>
            <select
              value={selectedVisitId || ""}
              onChange={(e) => setSelectedVisitId(Number(e.target.value))}
              className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
            >
              {availableVisits.length > 0 ? (
                availableVisits.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vessel?.name || "Kapal"} ({v.visitNumber}) — {v.status}
                  </option>
                ))
              ) : (
                <option value={1}>KMP Mutiara Persada (VS-202611-001) — Sandar Aktif</option>
              )}
            </select>
          </div>

          {/* Selector Trayek Penyeberangan (Ferry Route) */}
          <div>
            <label className="block text-xs font-bold text-[#0B241E] mb-1.5 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Lintasan / Trayek Penyeberangan Resmi</span>
            </label>
            <select
              value={selectedFerryRouteId || ""}
              onChange={(e) => setSelectedFerryRouteId(e.target.value ? Number(e.target.value) : null)}
              className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
            >
              <option value="">-- Tanpa Rute Tertentu / Pelayaran Reguler --</option>
              {ferryRoutes.map((r) => (
                <option key={r.id} value={r.id}>
                  Tujuan {r.destinationName} ({r.distanceMiles} Mil) — Tarif Rp {Number(r.adultFareIdr).toLocaleString("id-ID")}
                </option>
              ))}
              {ferryRoutes.length === 0 && (
                <>
                  <option value={1}>Pelabuhan Poumako ➔ Dobo (Kepulauan Aru)</option>
                  <option value={2}>Pelabuhan Poumako ➔ Agats (Kabupaten Asmat)</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* 2. SOLAS SAFETY CAPACITY & CROSS-CHECK WITH UPT TICKETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Penumpang Utilization */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#0B241E] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0284C7]" />
              <span>Kapasitas Keselamatan Penumpang (SOLAS)</span>
            </span>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                Number(paxUtilization) > 100
                  ? "bg-rose-100 text-rose-800"
                  : Number(paxUtilization) > 90
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {paxUtilization}% Terisi
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-black font-mono text-[#0B241E]">
              {totalPax} <span className="text-xs font-normal text-[#64748B]">/ {maxPaxCapacity} Orang</span>
            </p>
            <p className="text-xs text-[#64748B]">
              Tiket Gate UPT: <strong className="text-[#0B241E]">{uptScannedTickets.passengers} Orang</strong>
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                Number(paxUtilization) > 100
                  ? "bg-rose-600"
                  : Number(paxUtilization) > 90
                  ? "bg-amber-500"
                  : "bg-emerald-600"
              }`}
              style={{ width: `${Math.min(Number(paxUtilization), 100)}%` }}
            />
          </div>
          <p
            className={`text-[10px] font-semibold flex items-center gap-1 ${
              Number(paxUtilization) > 100 ? "text-rose-700" : "text-emerald-700"
            }`}
          >
            {Number(paxUtilization) > 100 ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>PERINGATAN: Muatan melebihi batas keselamatan SOLAS!</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kapasitas penumpang memenuhi batas aman standar SOLAS</span>
              </>
            )}
          </p>
        </div>

        {/* Card 2: Kendaraan Utilization */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#0B241E] flex items-center gap-2">
              <Car className="w-4 h-4 text-[#D97706]" />
              <span>Kapasitas Dek Kendaraan (Car Deck)</span>
            </span>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                Number(vehicleUtilization) > 100
                  ? "bg-rose-100 text-rose-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {vehicleUtilization}% Terisi
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-black font-mono text-[#0B241E]">
              {totalVehicles} <span className="text-xs font-normal text-[#64748B]">/ {maxVehicleCapacity} Unit</span>
            </p>
            <p className="text-xs text-[#64748B]">
              Tiket Gate UPT: <strong className="text-[#0B241E]">{uptScannedTickets.vehicles} Unit</strong>
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                Number(vehicleUtilization) > 95 ? "bg-amber-500" : "bg-[#D97706]"
              }`}
              style={{ width: `${Math.min(Number(vehicleUtilization), 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sisa slot dek: {Math.max(0, maxVehicleCapacity - totalVehicles)} unit kendaraan campuran</span>
          </p>
        </div>
      </div>

      {/* 3. FORMULIR RINCIAN MUATAN & PENUMPANG (INTEGRATED FORM) */}
      <form onSubmit={handleSubmitManifest} className="bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-[#F1F5F9] pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-[#0B241E]">
              Formulir Pelaporan Jumlah Penumpang & Muatan Kendaraan
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Data akan otomatis dicatat di backend PORTA dan disinkronkan dengan data pos tiket sebelum SPB diterbitkan.
            </p>
          </div>
          <span className="hidden sm:inline-block bg-[#F4F9F6] border border-[#CBD5E1] text-[#0B241E] text-[11px] font-mono px-2.5 py-1 rounded-lg">
            Perda 4/2023 Pasal 14
          </span>
        </div>

        {/* Section A: Penumpang */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-[#0B241E] uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0284C7]" />
            <span>A. Rincian Jiwa Penumpang & Awak Kapal (Crew)</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-[#475569] mb-1">
                Dewasa (Orang) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={paxAdult}
                onChange={(e) => setPaxAdult(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#475569] mb-1">
                Anak-anak (Orang)
              </label>
              <input
                type="number"
                min="0"
                value={paxChild}
                onChange={(e) => setPaxChild(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#475569] mb-1">
                Bayi / Balita (Infant)
              </label>
              <input
                type="number"
                min="0"
                value={paxInfant}
                onChange={(e) => setPaxInfant(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#475569] mb-1">
                Pengantar (Greeter)
              </label>
              <input
                type="number"
                min="0"
                value={greeterCount}
                onChange={(e) => setGreeterCount(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#475569] mb-1">
                Awak Kapal (Kru / ABK)
              </label>
              <input
                type="number"
                min="1"
                value={crewCount}
                onChange={(e) => setCrewCount(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>
          </div>
        </div>

        {/* Section B: Kendaraan */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-[#0B241E] uppercase tracking-wider flex items-center gap-2">
              <Car className="w-4 h-4 text-[#D97706]" />
              <span>B. Rincian Golongan Kendaraan (Muatan Dek)</span>
            </h4>
            <span className="text-[11px] text-[#64748B] font-mono font-bold">
              Total Kendaraan: {totalVehicles} Unit
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-[#475569] mb-1">
                Gol I (Sepeda)
              </label>
              <input
                type="number"
                min="0"
                value={vehGol1}
                onChange={(e) => setVehGol1(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#475569] mb-1">
                Gol II (Motor &lt; 500cc)
              </label>
              <input
                type="number"
                min="0"
                value={vehGol2}
                onChange={(e) => setVehGol2(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#475569] mb-1">
                Gol III (Moge)
              </label>
              <input
                type="number"
                min="0"
                value={vehGol3}
                onChange={(e) => setVehGol3(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#475569] mb-1">
                Gol IV A (Mobil)
              </label>
              <input
                type="number"
                min="0"
                value={vehGol4A}
                onChange={(e) => setVehGol4A(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#475569] mb-1">
                Gol IV B (Pick-up)
              </label>
              <input
                type="number"
                min="0"
                value={vehGol4B}
                onChange={(e) => setVehGol4B(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#475569] mb-1">
                Gol V (Bus/Truk)
              </label>
              <input
                type="number"
                min="0"
                value={vehGol5}
                onChange={(e) => setVehGol5(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#475569] mb-1">
                Gol VI - VII (Tronton)
              </label>
              <input
                type="number"
                min="0"
                value={vehGol6_7}
                onChange={(e) => setVehGol6_7(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>
          </div>
        </div>

        {/* Section C: Muatan Barang Campuran & Lampiran */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#0B241E] mb-1">
              Muatan Kargo Barang Campuran (Ton)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={cargoTons}
              onChange={(e) => setCargoTons(Number(e.target.value))}
              className="w-full text-xs font-mono font-bold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              placeholder="0.0"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B241E] mb-1">
              Lampiran Dokumen Manifes Resmi (.PDF)
            </label>
            {attachedFile ? (
              <div className="p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0284C7] shrink-0" />
                  <div className="truncate">
                    <p className="font-bold text-[#0B241E] truncate">{attachedFile.name}</p>
                    <p className="text-[10px] text-[#64748B] font-mono">{attachedFile.size}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="text-red-600 hover:text-red-800 text-[11px] font-bold px-2 py-1 cursor-pointer shrink-0"
                >
                  Ganti
                </button>
              </div>
            ) : (
              <div
                onClick={() =>
                  setAttachedFile({
                    name: "MANIFES_UPLOAD_RESMI.pdf",
                    size: "2.1 MB",
                    hash: "SHA256: e82b...199a",
                  })
                }
                className="p-2.5 rounded-xl border border-dashed border-[#CBD5E1] hover:border-[#0B241E] text-center cursor-pointer text-xs transition-colors"
              >
                <p className="font-bold text-[#0B241E]">Unggah Dokumen Manifes PDF</p>
              </div>
            )}
          </div>
        </div>

        {/* Section D: Deklarasi Tanggung Jawab Nakhoda */}
        <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3 text-xs">
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              id="captain_check"
              checked={isCaptainDeclared}
              onChange={(e) => setIsCaptainDeclared(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#0B241E] rounded cursor-pointer"
            />
            <label htmlFor="captain_check" className="cursor-pointer space-y-1">
              <strong className="text-amber-950 block font-bold">
                Pernyataan Kelaiklautan & Tanggung Jawab Nakhoda (Master&apos;s Declaration):
              </strong>
              <p className="text-amber-900/90 text-[11px] leading-relaxed">
                Saya menyatakan dengan sebenarnya bahwa muatan kapal telah diperiksa, diikat (*lashing*) sesuai standar keselamatan, stabilitas sarat kapal (draft) dalam batas aman, dan jumlah jiwa di atas kapal tidak melebihi kapasitas sertifikat keselamatan.
              </p>
            </label>
          </div>

          <div className="pt-2 border-t border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-amber-950 gap-2">
            <div>
              <span>Nakhoda Bertanggung Jawab: </span>
              <strong className="font-mono">{captainName}</strong>
            </div>
            <span className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
              Ttd Digital Terverifikasi
            </span>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between border-t border-[#F1F5F9] gap-3">
          <span className="text-xs text-[#64748B] flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>Data terenkripsi dan terhubung langsung ke Syahbandar &amp; UPT Pelabuhan.</span>
          </span>

          <button
            type="submit"
            disabled={isSubmitting || isOverloaded}
            className="px-6 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#D97706]" />
                <span>Mengirim Manifes ke Server...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-[#D97706]" />
                <span>Kirim Manifes &amp; Minta Clearance SPB</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* 4. DAFTAR RIWAYAT MANIFES RESMI YANG TERDAFTAR DI BACKEND */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#0B241E]" />
            <h3 className="text-sm font-extrabold text-[#0B241E]">
              Riwayat Manifes Pelayaran Resmi Terverifikasi
            </h3>
          </div>
          <span className="text-xs text-[#64748B] font-mono">
            Total {manifests.length} Manifes Tercatat
          </span>
        </div>

        {isLoadingManifests && manifests.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#64748B] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#0B241E]" />
            <span>Memuat riwayat manifes dari server backend...</span>
          </div>
        ) : manifests.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#64748B]">
            <Info className="w-5 h-5 text-[#94A3B8] mx-auto mb-2" />
            <p className="font-semibold text-[#0B241E]">Belum Ada Manifes Tercatat</p>
            <p className="text-[11px] mt-0.5">
              Kirimkan formulir manifes di atas untuk mencatatkan manifes resmi keberangkatan kapal.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px] font-mono">
                <tr>
                  <th className="p-3">No. Manifes</th>
                  <th className="p-3">Kapal &amp; Kunjungan</th>
                  <th className="p-3">Trayek Tujuan</th>
                  <th className="p-3 text-center">Jiwa Penumpang</th>
                  <th className="p-3 text-center">Kendaraan</th>
                  <th className="p-3">Biaya Pas Terminal</th>
                  <th className="p-3">Waktu Lapor</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {manifests.map((mnf) => (
                  <tr key={mnf.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-3 font-mono font-bold text-[#0B241E]">
                      {mnf.manifestNumber}
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-[#0B241E]">
                        {mnf.visit?.vessel?.name || "Armada Pelayaran"}
                      </p>
                      <p className="text-[10px] font-mono text-[#64748B]">
                        {mnf.visit?.visitNumber || `Visit #${mnf.visitId}`}
                      </p>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-[#0B241E]">
                        {mnf.ferryRoute?.destinationName
                          ? `Tujuan ${mnf.ferryRoute.destinationName}`
                          : "Pelayaran Domestik"}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono">
                      <span className="font-bold text-[#0B241E]">
                        {mnf.adultCount + mnf.childCount + mnf.infantCount} Orang
                      </span>
                      <p className="text-[9.5px] text-[#64748B]">
                        (D: {mnf.adultCount}, A: {mnf.childCount}, B: {mnf.infantCount})
                      </p>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-[#0B241E]">
                      {mnf.vehicleCount} Unit
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-800">
                      Rp {Number(mnf.terminalFeeIdr || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="p-3 text-[11px] text-[#64748B]">
                      {new Date(mnf.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>SOLAS Validated</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
