"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Ship,
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Send,
  Check,
  Eye,
  FileCheck2,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Building2,
  X,
  Droplets,
  Zap,
  Trash2,
  Radio,
  Download,
  Printer,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";

// Types
interface DockRequest {
  id: string;
  vesselName: string;
  callSign: string;
  gt: number;
  port: string;
  route: string;
  activityType: string;
  dockType: "Reguler" | "Eksekutif";
  eta: string;
  etd: string;
  durationHours: number;
  utilities: {
    freshWater: boolean;
    waterVolume?: number;
    shorePower: boolean;
    powerKwh?: number;
    wasteDisposal: boolean;
  };
  costBreakdown: {
    mooring: number;
    anchorage: number;
    water: number;
    power: number;
    waste: number;
    total: number;
  };
  status: "submitted" | "verified" | "approved" | "rejected";
  statusLabel: string;
  allocatedDock?: string;
  officerNotes?: string;
  submittedAt: string;
}

export default function KapalPermohonanPage() {
  const [activeTab, setActiveTab] = useState<"tracking" | "wizard">("tracking");
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [selectedDetailReq, setSelectedDetailReq] = useState<DockRequest | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Master fleet for selection
  const fleetOptions = [
    {
      id: "VES-01",
      name: "KMP Baruna Jaya",
      callSign: "PK-BJ92",
      gt: 1250,
      loa: 72.5,
      draft: 3.8,
      defaultRoute: "Merak ➔ Bakauheni",
    },
    {
      id: "VES-02",
      name: "KMP Mutiara Persada",
      callSign: "PK-MP44",
      gt: 1800,
      loa: 85.0,
      draft: 4.2,
      defaultRoute: "Bakauheni ➔ Merak",
    },
    {
      id: "VES-03",
      name: "KMP Nusantara Express",
      callSign: "PK-NE11",
      gt: 2100,
      loa: 92.0,
      draft: 4.5,
      defaultRoute: "Bakauheni ➔ Merak",
    },
    {
      id: "VES-04",
      name: "KMP Portlink III",
      callSign: "PK-PL03",
      gt: 5200,
      loa: 125.0,
      draft: 5.5,
      defaultRoute: "Merak ➔ Bakauheni",
    },
  ];

  // ==========================================
  // WIZARD FORM STATE (5 Langkah PDF Halaman 9)
  // ==========================================
  // Langkah 1: Pilih Layanan & Fasilitas
  const [selectedVesselId, setSelectedVesselId] = useState<string>("VES-02");
  const [originPort, setOriginPort] = useState<string>("Pelabuhan Regional Bakauheni");
  const [destinationPort, setDestinationPort] = useState<string>("Pelabuhan Regional Merak");

  // Helper: Dapatkan nama singkat pelabuhan
  const getPortShortName = (fullName: string) => {
    if (fullName.includes("Bakauheni")) return "Bakauheni";
    if (fullName.includes("Merak")) return "Merak";
    if (fullName.includes("Ciwandan")) return "Ciwandan";
    if (fullName.includes("Panjang")) return "Panjang";
    return fullName;
  };

  // Opsi 2: Lintasan otomatis terisi (Auto-Derived) dari Asal ➔ Tujuan
  const derivedRoute = `${getPortShortName(originPort)} ➔ ${getPortShortName(destinationPort)}`;
  const [activityType, setActivityType] = useState<string>("Bongkar & Muat Penumpang / Kendaraan (Ferry Ro-Ro)");
  const [dockPreference, setDockPreference] = useState<"Reguler" | "Eksekutif">("Reguler");

  // Kebutuhan Fasilitas & Utilitas (PDF Hal. 3 & 9)
  const [needFreshWater, setNeedFreshWater] = useState<boolean>(true);
  const [waterVolume, setWaterVolume] = useState<number>(35); // ton/m3
  const [needShorePower, setNeedShorePower] = useState<boolean>(false);
  const [powerKwh, setPowerKwh] = useState<number>(120); // kWh
  const [needWasteDisposal, setNeedWasteDisposal] = useState<boolean>(true);

  // Langkah 2: Tentukan Waktu
  const [etaDate, setEtaDate] = useState<string>("2026-11-17");
  const [etaTime, setEtaTime] = useState<string>("10:00");
  const [etdDate, setEtdDate] = useState<string>("2026-11-17");
  const [etdTime, setEtdTime] = useState<string>("11:45");
  const [serviceDurationHours, setServiceDurationHours] = useState<number>(2); // 1.75 rounded up

  // Langkah 3: Dokumen & Kelaiklautan
  const [docSeaworthy, setDocSeaworthy] = useState<boolean>(true);
  const [docTonnageCert, setDocTonnageCert] = useState<boolean>(true);
  const [docManifestDraft, setDocManifestDraft] = useState<boolean>(true);
  const [docSPIT, setDocSPIT] = useState<boolean>(true);
  const [additionalNote, setAdditionalNote] = useState<string>("");

  // Langkah 4: Tinjau & Pakta Integritas
  const [agreementChecked, setAgreementChecked] = useState<boolean>(true);

  // Langkah 5: Tiket Sukses
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  // ==========================================
  // DUMMY ACTIVE & HISTORICAL REQUESTS DATASET
  // ==========================================
  const [requests, setRequests] = useState<DockRequest[]>([
    {
      id: "REQ-DOCK-2026-088",
      vesselName: "KMP Mutiara Persada",
      callSign: "PK-MP44",
      gt: 1800,
      port: "Pelabuhan Regional Merak",
      route: "Bakauheni ➔ Merak",
      activityType: "Bongkar & Muat Penumpang / Kendaraan (Ferry Ro-Ro)",
      dockType: "Reguler",
      eta: "16 Nov 2026, 14:00 WIB",
      etd: "16 Nov 2026, 15:30 WIB",
      durationHours: 1.5,
      utilities: {
        freshWater: true,
        waterVolume: 35,
        shorePower: false,
        wasteDisposal: true,
      },
      costBreakdown: {
        mooring: 324000,
        anchorage: 72000,
        water: 980000,
        power: 0,
        waste: 150000,
        total: 1526000,
      },
      status: "approved",
      statusLabel: "Alokasi Dermaga Terbit",
      allocatedDock: "Dermaga 2 (Slot: 14:00 - 15:30 WIB)",
      officerNotes: "Permohonan disetujui. Sandar di Dermaga 2 setelah KMP Baruna Jaya bertolak. Wajib laporkan manifes 60 menit sebelum tiba.",
      submittedAt: "16 Nov 2026, 09:15 WIB",
    },
    {
      id: "REQ-DOCK-2026-089",
      vesselName: "KMP Nusantara Express",
      callSign: "PK-NE11",
      gt: 2100,
      port: "Pelabuhan Regional Merak",
      route: "Bakauheni ➔ Merak",
      activityType: "Bongkar & Muat Penumpang / Kendaraan (Ferry Ro-Ro)",
      dockType: "Eksekutif",
      eta: "16 Nov 2026, 18:30 WIB",
      etd: "16 Nov 2026, 20:00 WIB",
      durationHours: 1.5,
      utilities: {
        freshWater: false,
        shorePower: true,
        powerKwh: 150,
        wasteDisposal: true,
      },
      costBreakdown: {
        mooring: 567000,
        anchorage: 84000,
        water: 0,
        power: 480000,
        waste: 150000,
        total: 1281000,
      },
      status: "verified",
      statusLabel: "Diverifikasi UPTD Merak",
      allocatedDock: "Standby Alokasi Dermaga Eksekutif 1",
      officerNotes: "Sedang menunggu verifikasi ketersediaan ramp door hidrolik oleh pengawas jaga dermaga eksekutif.",
      submittedAt: "16 Nov 2026, 11:30 WIB",
    },
    {
      id: "REQ-DOCK-2026-091",
      vesselName: "KMP Portlink III",
      callSign: "PK-PL03",
      gt: 5200,
      port: "Pelabuhan Regional Merak",
      route: "Merak ➔ Bakauheni",
      activityType: "Bongkar & Muat Penumpang / Kendaraan (Ferry Ro-Ro)",
      dockType: "Eksekutif",
      eta: "17 Nov 2026, 06:00 WIB",
      etd: "17 Nov 2026, 08:00 WIB",
      durationHours: 2.0,
      utilities: {
        freshWater: true,
        waterVolume: 50,
        shorePower: true,
        powerKwh: 200,
        wasteDisposal: true,
      },
      costBreakdown: {
        mooring: 1872000,
        anchorage: 208000,
        water: 1400000,
        power: 640000,
        waste: 150000,
        total: 4270000,
      },
      status: "submitted",
      statusLabel: "Menunggu Review UPT",
      officerNotes: "Dokumen telah masuk antrean pemeriksaan verifikator pelabuhan.",
      submittedAt: "16 Nov 2026, 15:45 WIB",
    },
    {
      id: "REQ-DOCK-2026-085",
      vesselName: "KMP Baruna Jaya",
      callSign: "PK-BJ92",
      gt: 1250,
      port: "Pelabuhan Regional Merak",
      route: "Merak ➔ Bakauheni",
      activityType: "Bongkar & Muat Penumpang / Kendaraan (Ferry Ro-Ro)",
      dockType: "Reguler",
      eta: "16 Nov 2026, 08:00 WIB",
      etd: "16 Nov 2026, 09:30 WIB",
      durationHours: 1.5,
      utilities: {
        freshWater: true,
        waterVolume: 25,
        shorePower: false,
        wasteDisposal: false,
      },
      costBreakdown: {
        mooring: 225000,
        anchorage: 50000,
        water: 700000,
        power: 0,
        waste: 0,
        total: 975000,
      },
      status: "approved",
      statusLabel: "Pelayanan Selesai",
      allocatedDock: "Dermaga 1",
      officerNotes: "Pelayanan selesai tepat waktu. e-SKRD telah diterbitkan di menu Penagihan.",
      submittedAt: "15 Nov 2026, 20:00 WIB",
    },
  ]);

  // Active vessel helper
  const activeVessel = fleetOptions.find((v) => v.id === selectedVesselId) || fleetOptions[0];

  // Calculation helpers (Tarif PP 35/2023)
  const calculateDetailedCosts = () => {
    const gt = activeVessel.gt;
    // Tambat: Reguler Rp 120/GT/jam, Eksekutif Rp 180/GT/jam
    const mooringRate = dockPreference === "Eksekutif" ? 180 : 120;
    const mooring = gt * mooringRate * serviceDurationHours;

    // Labuh: Rp 40/GT per kunjungan
    const anchorage = gt * 40;

    // Utilitas Air Bersih: Rp 28.000 / m3
    const water = needFreshWater ? waterVolume * 28000 : 0;

    // Utilitas Listrik Shore Power: Rp 3.200 / kWh
    const power = needShorePower ? powerKwh * 3200 : 0;

    // Jasa Pengelolaan Sampah Kapal: Biaya tetap Rp 150.000
    const waste = needWasteDisposal ? 150000 : 0;

    const total = mooring + anchorage + water + power + waste;

    return {
      mooring,
      anchorage,
      water,
      power,
      waste,
      total,
    };
  };

  const costs = calculateDetailedCosts();

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Submit Handler for Step 4
  const handleFinalSubmit = () => {
    if (!agreementChecked) {
      alert("Harap setujui pakta integritas dan ketentuan estimasi retribusi sebelum mengirim.");
      return;
    }

    const generatedId = `REQ-DOCK-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newReq: DockRequest = {
      id: generatedId,
      vesselName: activeVessel.name,
      callSign: activeVessel.callSign,
      gt: activeVessel.gt,
      port: destinationPort,
      route: derivedRoute,
      activityType: activityType,
      dockType: dockPreference,
      eta: `${etaDate}, ${etaTime} WIB`,
      etd: `${etdDate}, ${etdTime} WIB`,
      durationHours: serviceDurationHours,
      utilities: {
        freshWater: needFreshWater,
        waterVolume: needFreshWater ? waterVolume : 0,
        shorePower: needShorePower,
        powerKwh: needShorePower ? powerKwh : 0,
        wasteDisposal: needWasteDisposal,
      },
      costBreakdown: costs,
      status: "submitted",
      statusLabel: "Diajukan (Menunggu Review UPT)",
      officerNotes: "Permohonan baru telah diterima sistem. Menunggu pemeriksaan verifikator pelabuhan.",
      submittedAt: "Hari ini, Baru saja",
    };

    setRequests([newReq, ...requests]);
    setCreatedTicketId(generatedId);
    setWizardStep(5); // Pindah ke Langkah 5: Kirim & Pantau
    setSuccessToast(`Permohonan ${generatedId} berhasil diajukan ke Petugas UPT!`);
  };

  const handleResetForm = () => {
    setWizardStep(1);
    setCreatedTicketId(null);
    setActiveTab("tracking");
  };

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    const matchSearch =
      r.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.vesselName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.port.toLowerCase().includes(searchFilter.toLowerCase());

    if (statusFilter === "all") return matchSearch;
    return matchSearch && r.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-fade-in border border-emerald-500">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-white hover:text-emerald-100 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Mode Switcher Deck (Clean elevated card separated from dark header) */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-3 sm:p-3.5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => setActiveTab("tracking")}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "tracking"
                ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                : "text-[#64748B] hover:text-[#0B241E] hover:bg-white/70"
            }`}
          >
            <Clock className={`w-4 h-4 ${activeTab === "tracking" ? "text-[#D97706]" : "text-[#64748B]"}`} />
            <span>Status & Pelacakan Permohonan ({requests.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("wizard");
              if (wizardStep === 5) setWizardStep(1);
            }}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "wizard"
                ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                : "text-[#64748B] hover:text-[#0B241E] hover:bg-white/70"
            }`}
          >
            <Calendar className={`w-4 h-4 ${activeTab === "wizard" ? "text-[#D97706]" : "text-[#64748B]"}`} />
            <span>+ Ajukan Penggunaan Dermaga (Wizard 5 Langkah)</span>
          </button>
        </div>

        {activeTab === "tracking" && (
          <div className="flex items-center gap-2 text-[11px] font-mono px-2">
            <span className="text-[#64748B] hidden sm:inline">Status:</span>
            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-bold">
              1 Diajukan
            </span>
            <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md font-bold">
              1 Diverifikasi
            </span>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
              2 Disetujui
            </span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW A: WIZARD 5 LANGKAH "AJUKAN PENGGUNAAN DERMAGA" (PORTA.pdf Halaman 9) */}
      {/* ========================================================================= */}
      {activeTab === "wizard" && (
        <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xs overflow-hidden">
          {/* Stepper Header (5 Langkah) */}
          <div className="bg-[#0B241E] p-4 sm:p-6 border-b border-[#143E33] text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#D97706] uppercase font-bold">
                  PORTAL MANDIRI OPERATOR PELAYARAN
                </span>
                <h2 className="text-base sm:text-lg font-black text-white">
                  Permohonan Jadwal & Alokasi Dermaga Sandar
                </h2>
              </div>
              <div className="text-xs text-[#A0C4B8] font-mono">
                Langkah {wizardStep} dari 5
              </div>
            </div>

            {/* Stepper Visual Pills */}
            <div className="grid grid-cols-5 gap-2 text-center text-[11px] font-bold">
              {[
                { num: 1, label: "Pilih Layanan" },
                { num: 2, label: "Tentukan Waktu" },
                { num: 3, label: "Lengkapi Dokumen" },
                { num: 4, label: "Tinjau & Estimasi" },
                { num: 5, label: "Kirim & Pantau" },
              ].map((s) => (
                <div
                  key={s.num}
                  className={`p-2 rounded-lg border transition-all ${
                    wizardStep === s.num
                      ? "bg-[#D97706] text-[#0B241E] border-[#D97706] shadow-md font-black"
                      : wizardStep > s.num
                      ? "bg-[#143E33] text-white border-[#235848]"
                      : "bg-[#0B241E] text-[#6A9486] border-[#143E33] opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    {wizardStep > s.num ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <span className="font-mono text-xs">{s.num}</span>
                    )}
                    <span className="hidden md:inline truncate">{s.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* ------------------------------------------------------------- */}
            {/* STEP 1: PILIH LAYANAN & FASILITAS (PDF Hal. 9 Baris 1)         */}
            {/* ------------------------------------------------------------- */}
            {wizardStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-[#0B241E] uppercase tracking-wide flex items-center gap-2">
                    <Ship className="w-4 h-4 text-[#D97706]" />
                    <span>Langkah 1: Pilih Layanan & Kebutuhan Fasilitas Dermaga</span>
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Tentukan armada kapal, pelabuhan tujuan, kelas dermaga sandar, serta pesanan utilitas air tawar dan listrik darat.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Armada Kapal */}
                  <div>
                    <label className="block text-xs font-bold text-[#0B241E] mb-1.5">
                      Pilih Armada Kapal Pemohon <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedVesselId}
                      onChange={(e) => {
                        setSelectedVesselId(e.target.value);
                      }}
                      className="w-full text-xs font-semibold p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
                    >
                      {fleetOptions.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.gt.toLocaleString()} GT • Call Sign: {v.callSign})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-[#64748B] mt-1">
                      Dimensi: LOA {activeVessel.loa} m • Sarat Draft {activeVessel.draft} m
                    </p>
                  </div>

                  {/* Jenis Kegiatan */}
                  <div>
                    <label className="block text-xs font-bold text-[#0B241E] mb-1.5">
                      Jenis Kegiatan Pelayanan Kapal <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value)}
                      className="w-full text-xs font-semibold p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
                    >
                      <option value="Bongkar & Muat Penumpang / Kendaraan (Ferry Ro-Ro)">
                        Bongkar & Muat Penumpang / Kendaraan (Ferry Ro-Ro)
                      </option>
                      <option value="Labuh Jangkar & Pengisian Perbekalan (Bunkering)">
                        Labuh Jangkar & Pengisian Perbekalan (Bunkering)
                      </option>
                      <option value="Perbaikan Teknis / Emergency Docking">
                        Perbaikan Teknis / Emergency Docking
                      </option>
                    </select>
                  </div>

                  {/* Pelabuhan Asal Keberangkatan */}
                  <div>
                    <label className="block text-xs font-bold text-[#0B241E] mb-1.5 flex items-center justify-between">
                      <span>Pelabuhan Asal Keberangkatan (Origin) <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-[#64748B] font-mono">Keberangkatan</span>
                    </label>
                    <select
                      value={originPort}
                      onChange={(e) => setOriginPort(e.target.value)}
                      className="w-full text-xs font-semibold p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
                    >
                      <option value="Pelabuhan Regional Bakauheni">Pelabuhan Regional Bakauheni (Lampung)</option>
                      <option value="Pelabuhan Regional Merak">Pelabuhan Regional Merak (Banten)</option>
                      <option value="Pelabuhan Ciwandan Banten">Pelabuhan Ciwandan (Banten)</option>
                      <option value="Pelabuhan Panjang Lampung">Pelabuhan Panjang (Lampung)</option>
                    </select>
                  </div>

                  {/* Pelabuhan Tujuan Pelayanan */}
                  <div>
                    <label className="block text-xs font-bold text-[#0B241E] mb-1.5 flex items-center justify-between">
                      <span>Pelabuhan Tujuan Pelayanan (Destination) <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-[#0284C7] font-mono">Lokasi Sandar</span>
                    </label>
                    <select
                      value={destinationPort}
                      onChange={(e) => setDestinationPort(e.target.value)}
                      className="w-full text-xs font-semibold p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
                    >
                      <option value="Pelabuhan Regional Merak">Pelabuhan Regional Merak (Dermaga 1 - 7)</option>
                      <option value="Pelabuhan Regional Bakauheni">Pelabuhan Regional Bakauheni (Dermaga 1 - 5)</option>
                      <option value="Pelabuhan Ciwandan Banten">Pelabuhan Ciwandan (Dermaga Curah/Ro-Ro)</option>
                      <option value="Pelabuhan Panjang Lampung">Pelabuhan Panjang (Lampung)</option>
                    </select>
                  </div>

                  {/* LINTASAN TRAYEK TERJADWAL (OTOMATIS SESUAI OPSI 2) */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#0B241E] mb-1.5 flex items-center justify-between">
                      <span>Lintasan Trayek Terjadwal (Otomatis Terkunci Sesuai SPIT)</span>
                      <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sistem Auto-Derived</span>
                      </span>
                    </label>

                    <div className="p-3.5 bg-[#F8FAFC] border-2 border-[#CBD5E1] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-xs shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-[#0B241E] tracking-tight">
                              {derivedRoute}
                            </span>
                            {originPort === destinationPort && (
                              <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                Asal & Tujuan Sama
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#64748B] mt-0.5">
                            Lintasan otomatis dikunci berdasarkan koordinat pelabuhan asal ➔ pelabuhan tujuan resmi.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Izin SPIT No. KP-812/DJPL/2024</span>
                        </span>
                      </div>
                    </div>

                    {originPort === destinationPort && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Peringatan: Pelabuhan asal dan tujuan tidak boleh sama. Harap pilih pelabuhan keberangkatan dan sandar yang berbeda.</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Pilihan Kelas Dermaga */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-[#0B241E]">
                    Pilihan Fasilitas Dermaga (Tarif PP No. 35/2023)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => setDockPreference("Reguler")}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                        dockPreference === "Reguler"
                          ? "border-[#0B241E] bg-[#F4F9F6] shadow-sm"
                          : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={dockPreference === "Reguler"}
                        onChange={() => setDockPreference("Reguler")}
                        className="mt-1 text-[#0B241E]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#0B241E]">Dermaga Reguler</span>
                          <span className="bg-[#E2E8F0] text-[#475569] text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                            Rp 120 / GT / Jam
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-1">
                          Cocok untuk kapal ferry standar dengan movable bridge konvensional. Waktu alokasi standar 1 - 2 jam.
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => setDockPreference("Eksekutif")}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                        dockPreference === "Eksekutif"
                          ? "border-[#0B241E] bg-[#F4F9F6] shadow-sm"
                          : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={dockPreference === "Eksekutif"}
                        onChange={() => setDockPreference("Eksekutif")}
                        className="mt-1 text-[#0B241E]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#0B241E]">Dermaga Eksekutif</span>
                          <span className="bg-[#D97706]/15 text-[#92400E] text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                            Rp 180 / GT / Jam
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-1">
                          Dilengkapi garbarata penumpang dan hydraulic ramp door berkecepatan tinggi.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kebutuhan Utilitas Dermaga (PDF Hal. 3 & 9) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#0B241E]">
                      Kebutuhan Layanan Utilitas Pelabuhan (Meter / Konsumsi Terukur)
                    </label>
                    <span className="text-[10px] text-[#64748B] font-mono">PP 35/2023 Pasal 14</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {/* Utilitas 1: Air Bersih */}
                    <div
                      className={`p-3.5 rounded-xl border transition-all ${
                        needFreshWater ? "bg-blue-50/70 border-blue-300" : "bg-[#F8FAFC] border-[#E2E8F0]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2 font-bold text-[#0B241E] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={needFreshWater}
                            onChange={(e) => setNeedFreshWater(e.target.checked)}
                            className="rounded text-[#0B241E]"
                          />
                          <Droplets className="w-4 h-4 text-blue-600" />
                          <span>Air Bersih (Bunkering)</span>
                        </label>
                      </div>
                      <p className="text-[10px] text-[#64748B] mb-2">
                        Tarif resmi: Rp 28.000 / m³ (Pipa Hydrant Dermaga)
                      </p>
                      {needFreshWater && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="5"
                            max="200"
                            step="5"
                            value={waterVolume}
                            onChange={(e) => setWaterVolume(Number(e.target.value))}
                            className="w-20 p-1.5 text-xs font-bold bg-white border border-blue-300 rounded-lg text-center"
                          />
                          <span className="font-bold text-[#0B241E]">m³ (Ton)</span>
                          <span className="text-[11px] font-mono text-blue-800 ml-auto font-bold">
                            {formatRupiah(waterVolume * 28000)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Utilitas 2: Listrik Darat Shore Power */}
                    <div
                      className={`p-3.5 rounded-xl border transition-all ${
                        needShorePower ? "bg-amber-50/70 border-amber-300" : "bg-[#F8FAFC] border-[#E2E8F0]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2 font-bold text-[#0B241E] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={needShorePower}
                            onChange={(e) => setNeedShorePower(e.target.checked)}
                            className="rounded text-[#0B241E]"
                          />
                          <Zap className="w-4 h-4 text-amber-600" />
                          <span>Shore Power Listrik</span>
                        </label>
                      </div>
                      <p className="text-[10px] text-[#64748B] mb-2">
                        Tarif resmi: Rp 3.200 / kWh (Cold Ironing Connection)
                      </p>
                      {needShorePower && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="20"
                            max="500"
                            step="10"
                            value={powerKwh}
                            onChange={(e) => setPowerKwh(Number(e.target.value))}
                            className="w-20 p-1.5 text-xs font-bold bg-white border border-amber-300 rounded-lg text-center"
                          />
                          <span className="font-bold text-[#0B241E]">kWh</span>
                          <span className="text-[11px] font-mono text-amber-900 ml-auto font-bold">
                            {formatRupiah(powerKwh * 3200)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Utilitas 3: Pengelolaan Sampah & Limbah */}
                    <div
                      className={`p-3.5 rounded-xl border transition-all ${
                        needWasteDisposal ? "bg-emerald-50/70 border-emerald-300" : "bg-[#F8FAFC] border-[#E2E8F0]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2 font-bold text-[#0B241E] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={needWasteDisposal}
                            onChange={(e) => setNeedWasteDisposal(e.target.checked)}
                            className="rounded text-[#0B241E]"
                          />
                          <Trash2 className="w-4 h-4 text-emerald-600" />
                          <span>Pengelolaan Limbah</span>
                        </label>
                      </div>
                      <p className="text-[10px] text-[#64748B] mb-2">
                        Tarif tetap per call sandar: Rp 150.000 (Standar MARPOL)
                      </p>
                      {needWasteDisposal && (
                        <div className="text-right">
                          <span className="text-[11px] font-mono text-emerald-900 font-bold">
                            {formatRupiah(150000)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex items-center justify-end border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="px-6 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>Lanjut ke Langkah 2: Tentukan Waktu</span>
                    <ChevronRight className="w-4 h-4 text-[#D97706]" />
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 2: TENTUKAN WAKTU & JADWAL (PDF Hal. 9 Baris 2)           */}
            {/* ------------------------------------------------------------- */}
            {wizardStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-[#0B241E] uppercase tracking-wide flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#D97706]" />
                    <span>Langkah 2: Tentukan Waktu Pelayanan (ETA & ETD)</span>
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Masukkan rencana kedatangan kapal, estimasi keberangkatan, dan durasi slot dermaga yang dibutuhkan.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Rencana Kedatangan (ETA) */}
                  <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0B241E]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Rencana Kedatangan (ETA - Estimated Time of Arrival)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-[#64748B] mb-1 font-semibold">
                          Tanggal Kedatangan
                        </label>
                        <input
                          type="date"
                          value={etaDate}
                          onChange={(e) => setEtaDate(e.target.value)}
                          className="w-full text-xs font-semibold p-2.5 bg-white border border-[#CBD5E1] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#64748B] mb-1 font-semibold">
                          Jam Kedatangan (WIB)
                        </label>
                        <input
                          type="time"
                          value={etaTime}
                          onChange={(e) => setEtaTime(e.target.value)}
                          className="w-full text-xs font-semibold p-2.5 bg-white border border-[#CBD5E1] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rencana Keberangkatan (ETD) */}
                  <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0B241E]">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Rencana Keberangkatan (ETD - Estimated Time of Departure)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-[#64748B] mb-1 font-semibold">
                          Tanggal Keberangkatan
                        </label>
                        <input
                          type="date"
                          value={etdDate}
                          onChange={(e) => setEtdDate(e.target.value)}
                          className="w-full text-xs font-semibold p-2.5 bg-white border border-[#CBD5E1] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#64748B] mb-1 font-semibold">
                          Jam Keberangkatan (WIB)
                        </label>
                        <input
                          type="time"
                          value={etdTime}
                          onChange={(e) => setEtdTime(e.target.value)}
                          className="w-full text-xs font-semibold p-2.5 bg-white border border-[#CBD5E1] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Durasi Sandar & Slot Pelayanan */}
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-extrabold text-xs text-emerald-950 block">
                        Durasi Alokasi Slot Dermaga yang Diajukan
                      </span>
                      <p className="text-[11px] text-emerald-800">
                        PP 35/2023 menghitung pembulatan per jam penuh untuk pemakaian dermaga.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {[1, 1.5, 2, 3, 4].map((hrs) => (
                        <button
                          key={hrs}
                          type="button"
                          onClick={() => setServiceDurationHours(hrs)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            serviceDurationHours === hrs
                              ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                              : "bg-white text-[#475569] border border-emerald-300 hover:bg-emerald-100"
                          }`}
                        >
                          {hrs} Jam
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Visual Conflict Detection Preview */}
                <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="font-bold text-[#0B241E] block">
                      Analisis Ketersediaan Slot Dermaga (Conflict Detection):
                    </strong>
                    <p className="text-[#64748B] mt-0.5 leading-relaxed">
                      Slot waktu <strong>{etaDate} pukul {etaTime} s/d {etdTime} WIB</strong> tersedia di {destinationPort}. Tidak terdeteksi bentrok jadwal dengan kapal reguler lainnya pada lintasan {derivedRoute}.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex items-center justify-between border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0B241E] flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Kembali</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="px-6 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>Lanjut ke Langkah 3: Lengkapi Dokumen</span>
                    <ChevronRight className="w-4 h-4 text-[#D97706]" />
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 3: LENGKAPI DOKUMEN & SYARAT (PDF Hal. 9 Baris 3)         */}
            {/* ------------------------------------------------------------- */}
            {wizardStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-[#0B241E] uppercase tracking-wide flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#D97706]" />
                    <span>Langkah 3: Lengkapi Dokumen & Kelaiklautan Kapal</span>
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Sistem secara otomatis menautkan sertifikat aktif armada {activeVessel.name}. Periksa kelengkapan berkas sebelum verifikasi petugas.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Doc 1 */}
                  <label className="p-4 bg-[#F8FAFC] rounded-xl border border-[#CBD5E1] flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={docSeaworthy}
                        onChange={(e) => setDocSeaworthy(e.target.checked)}
                        className="w-4 h-4 rounded text-[#0B241E]"
                      />
                      <div>
                        <span className="font-bold text-[#0B241E] text-xs block">
                          Sertifikat Keselamatan Konstruksi & Kelaiklautan (Safety Certificate)
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          Terdaftar di database Ditjen Perhubungan Laut • Status: Valid hingga 12 Okt 2027
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      Terverifikasi
                    </span>
                  </label>

                  {/* Doc 2 */}
                  <label className="p-4 bg-[#F8FAFC] rounded-xl border border-[#CBD5E1] flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={docTonnageCert}
                        onChange={(e) => setDocTonnageCert(e.target.checked)}
                        className="w-4 h-4 rounded text-[#0B241E]"
                      />
                      <div>
                        <span className="font-bold text-[#0B241E] text-xs block">
                          Surat Ukur Kapal Internasional (Tonnage Certificate - {activeVessel.gt} GT)
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          Dasar penetapan tarif retribusi tambat & labuh PP 35/2023
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      Terverifikasi
                    </span>
                  </label>

                  {/* Doc 3 */}
                  <label className="p-4 bg-[#F8FAFC] rounded-xl border border-[#CBD5E1] flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={docSPIT}
                        onChange={(e) => setDocSPIT(e.target.checked)}
                        className="w-4 h-4 rounded text-[#0B241E]"
                      />
                      <div>
                        <span className="font-bold text-[#0B241E] text-xs block">
                          Surat Persetujuan Izin Trayek (SPIT) Lintas Merak-Bakauheni
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          Nomor: KP-812/DJPL/2024 • Berlaku s/d 31 Des 2026
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      Terverifikasi
                    </span>
                  </label>

                  {/* Doc 4 */}
                  <label className="p-4 bg-[#F8FAFC] rounded-xl border border-[#CBD5E1] flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={docManifestDraft}
                        onChange={(e) => setDocManifestDraft(e.target.checked)}
                        className="w-4 h-4 rounded text-[#0B241E]"
                      />
                      <div>
                        <span className="font-bold text-[#0B241E] text-xs block">
                          Draft Rencana Muatan & Manifes Awal (SOLAS Compliant)
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          Kapasitas maksimum kapal tidak melebihi ambang batas keselamatan
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                      Wajib Lapor
                    </span>
                  </label>
                </div>

                {/* Catatan Tambahan Operator */}
                <div>
                  <label className="block text-xs font-bold text-[#0B241E] mb-1.5">
                    Catatan Khusus untuk Petugas UPT / Syahbandar (Opsional):
                  </label>
                  <textarea
                    rows={2}
                    value={additionalNote}
                    onChange={(e) => setAdditionalNote(e.target.value)}
                    placeholder="Contoh: Membutuhkan prioritas pengisian air tawar segera setelah kapal sandar..."
                    className="w-full text-xs font-semibold p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex items-center justify-between border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0B241E] flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Kembali</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(4)}
                    className="px-6 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>Lanjut ke Langkah 4: Tinjau & Estimasi Biaya</span>
                    <ChevronRight className="w-4 h-4 text-[#D97706]" />
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 4: TINJAU PERMOHONAN & ESTIMASI BIAYA (PDF Hal. 9 Baris 4) */}
            {/* ------------------------------------------------------------- */}
            {wizardStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-[#0B241E] uppercase tracking-wide flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#D97706]" />
                    <span>Langkah 4: Tinjau Permohonan & Estimasi Retribusi Resmi</span>
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Periksa ringkasan permohonan. Estimasi dihitung otomatis berdasarkan tarif resmi PP No. 35/2023.
                  </p>
                </div>

                {/* Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#CBD5E1] text-xs">
                  <div>
                    <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">Kapal & Dimensi</span>
                    <p className="font-extrabold text-[#0B241E] text-sm mt-0.5">{activeVessel.name}</p>
                    <p className="font-mono text-[#64748B] text-[11px]">{activeVessel.gt.toLocaleString()} GT • {activeVessel.callSign}</p>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">Rencana Pelayanan</span>
                    <p className="font-bold text-[#0B241E] mt-0.5">{destinationPort}</p>
                    <p className="text-[11px] text-[#64748B]">
                      {etaDate} ({etaTime} - {etdTime} WIB • {serviceDurationHours} Jam)
                    </p>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">Dermaga & Trayek</span>
                    <p className="font-bold text-[#0B241E] mt-0.5">Dermaga {dockPreference}</p>
                    <p className="text-[11px] text-[#64748B]">{derivedRoute}</p>
                  </div>
                </div>

                {/* DETAILED COST BREAKDOWN TABLE (PP No. 35/2023) */}
                <div className="border border-[#CBD5E1] rounded-xl overflow-hidden text-xs">
                  <div className="bg-[#0B241E] px-4 py-2.5 text-white flex items-center justify-between">
                    <span className="font-bold text-xs flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#D97706]" />
                      <span>Rincian Estimasi Retribusi Pelayanan Kepelabuhanan (PP 35/2023)</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#A0C4B8]">DASAR TARIF RESMI</span>
                  </div>

                  <table className="w-full text-left">
                    <thead className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-[10px] font-mono uppercase text-[#64748B]">
                      <tr>
                        <th className="p-3">Komponen Layanan</th>
                        <th className="p-3">Dasar Perhitungan</th>
                        <th className="p-3">Tarif Satuan Resmi</th>
                        <th className="p-3 text-right">Subtotal Estimasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {/* Mooring */}
                      <tr>
                        <td className="p-3 font-semibold text-[#0B241E]">
                          Jasa Tambat / Sandar Dermaga ({dockPreference})
                        </td>
                        <td className="p-3 font-mono text-[#64748B]">
                          {activeVessel.gt} GT × {serviceDurationHours} Jam
                        </td>
                        <td className="p-3 font-mono text-[#64748B]">
                          Rp {dockPreference === "Eksekutif" ? "180" : "120"} / GT / Jam
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-[#0B241E]">
                          {formatRupiah(costs.mooring)}
                        </td>
                      </tr>

                      {/* Anchorage */}
                      <tr>
                        <td className="p-3 font-semibold text-[#0B241E]">
                          Jasa Labuh Perairan Pelabuhan
                        </td>
                        <td className="p-3 font-mono text-[#64748B]">
                          {activeVessel.gt} GT × 1 Kunjungan
                        </td>
                        <td className="p-3 font-mono text-[#64748B]">
                          Rp 40 / GT
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-[#0B241E]">
                          {formatRupiah(costs.anchorage)}
                        </td>
                      </tr>

                      {/* Fresh Water */}
                      {needFreshWater && (
                        <tr>
                          <td className="p-3 font-semibold text-[#0B241E]">
                            Utilitas Air Bersih Dermaga (Bunkering)
                          </td>
                          <td className="p-3 font-mono text-[#64748B]">
                            {waterVolume} m³ (Ton)
                          </td>
                          <td className="p-3 font-mono text-[#64748B]">
                            Rp 28.000 / m³
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-[#0B241E]">
                            {formatRupiah(costs.water)}
                          </td>
                        </tr>
                      )}

                      {/* Shore Power */}
                      {needShorePower && (
                        <tr>
                          <td className="p-3 font-semibold text-[#0B241E]">
                            Utilitas Listrik Darat (Shore Connection)
                          </td>
                          <td className="p-3 font-mono text-[#64748B]">
                            {powerKwh} kWh
                          </td>
                          <td className="p-3 font-mono text-[#64748B]">
                            Rp 3.200 / kWh
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-[#0B241E]">
                            {formatRupiah(costs.power)}
                          </td>
                        </tr>
                      )}

                      {/* Waste Disposal */}
                      {needWasteDisposal && (
                        <tr>
                          <td className="p-3 font-semibold text-[#0B241E]">
                            Pengelolaan Sampah & Limbah Kapal
                          </td>
                          <td className="p-3 font-mono text-[#64748B]">
                            1 Kunjungan Sandar
                          </td>
                          <td className="p-3 font-mono text-[#64748B]">
                            Rp 150.000 / Call
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-[#0B241E]">
                            {formatRupiah(costs.waste)}
                          </td>
                        </tr>
                      )}

                      {/* TOTAL */}
                      <tr className="bg-[#F4F9F6] font-bold">
                        <td colSpan={3} className="p-3 text-[#0B241E] text-right uppercase tracking-wider font-extrabold">
                          Total Estimasi Biaya Retribusi:
                        </td>
                        <td className="p-3 text-right font-mono text-base font-black text-[#0B241E]">
                          {formatRupiah(costs.total)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Disclaimer Box (Sesuai PDF Hal. 9) */}
                <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-xl text-xs text-amber-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Catatan Ketentuan Pelayanan & Tagihan Final (PP 35/2023):</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    <em>Estimasi biaya ditandai jelas. Tagihan final (e-SKRD) mengikuti persetujuan dan realisasi layanan aktual</em> berdasarkan pencatatan waktu sandar sebenarnya (ATA / ATB / ATD) serta meteran utilitas riil di dermaga pelabuhan.
                  </p>
                </div>

                {/* Pakta Integritas Checkbox */}
                <label className="p-3.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreementChecked}
                    onChange={(e) => setAgreementChecked(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-[#0B241E]"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[#0B241E] block">
                      Pakta Integritas & Konfirmasi Pemohon:
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      Saya menyatakan bahwa seluruh data armada, jadwal, dan kelaiklautan yang diajukan adalah benar dan sah. Perusahaan bersedia mematuhi jadwal alokasi dermaga yang disahkan petugas UPTD serta melunasi kewajiban retribusi daerah.
                    </span>
                  </div>
                </label>

                {/* Action Buttons */}
                <div className="pt-4 flex items-center justify-between border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0B241E] flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Kembali</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    className="px-6 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-[#D97706]" />
                    <span>Kirim Permohonan ke UPT Pelabuhan</span>
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 5: KIRIM & PANTAU (PDF Hal. 9 Baris 5)                    */}
            {/* ------------------------------------------------------------- */}
            {wizardStep === 5 && (
              <div className="space-y-6 text-center py-6 max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-[11px] font-mono font-bold text-[#D97706] bg-[#0B241E] px-3 py-1 rounded-full uppercase">
                    Status: Diajukan ke Petugas UPT
                  </span>
                  <h3 className="text-xl font-black text-[#0B241E] mt-3">
                    Permohonan Penggunaan Dermaga Berhasil Diajukan!
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                    Permohonan jadwal sandar armada Anda telah diteruskan ke meja pengawas dermaga UPTD Pelabuhan. Petugas akan memverifikasi alokasi dermaga dalam waktu <strong>kurang dari 2 jam kerja</strong>.
                  </p>
                </div>

                {/* Ticket Receipt Box */}
                <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl text-left space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                    <span className="text-[10px] uppercase font-bold text-[#94A3B8]">Nomor Tiket Permohonan</span>
                    <span className="font-mono text-sm font-black text-[#0B241E]">{createdTicketId}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-[#64748B]">Kapal:</span>
                      <p className="font-bold text-[#0B241E]">{activeVessel.name}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B]">Pelabuhan Tujuan:</span>
                      <p className="font-bold text-[#0B241E]">{destinationPort}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B]">Rencana ETA:</span>
                      <p className="font-bold text-[#0B241E]">{etaDate}, {etaTime} WIB</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B]">Estimasi Retribusi:</span>
                      <p className="font-bold text-emerald-800 font-mono">{formatRupiah(costs.total)}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#0B241E] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#143E33] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-[#D97706]" />
                    <span>Pantau di Daftar Permohonan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      alert("Mencetak bukti pengajuan permohonan sandar (PDF)...");
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-white border border-[#CBD5E1] text-[#0B241E] text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-[#64748B]" />
                    <span>Cetak Bukti Pengajuan (PDF)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW B: PELACAKAN STATUS PERMOHONAN & RIWAYAT SIKLUS                       */}
      {/* ========================================================================= */}
      {activeTab === "tracking" && (
        <div className="space-y-6">
          {/* Filter Bar & Counters */}
          <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Cari nomor permohonan, nama kapal, atau rute..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full text-xs font-semibold pl-9 pr-4 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 text-xs">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-[#0B241E] text-white"
                    : "bg-[#F1F5F9] text-[#64748B] hover:text-[#0B241E]"
                }`}
              >
                Semua ({requests.length})
              </button>
              <button
                onClick={() => setStatusFilter("submitted")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === "submitted"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                }`}
              >
                Diajukan (1)
              </button>
              <button
                onClick={() => setStatusFilter("verified")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === "verified"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-800 hover:bg-blue-100"
                }`}
              >
                Diverifikasi (1)
              </button>
              <button
                onClick={() => setStatusFilter("approved")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === "approved"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                Disetujui UPT (2)
              </button>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-4">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-[#CBD5E1] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold shrink-0">
                      <Ship className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#D97706] bg-[#0B241E] px-2 py-0.5 rounded">
                          {req.id}
                        </span>
                        <h3 className="font-extrabold text-sm text-[#0B241E]">
                          {req.vesselName} ({req.gt.toLocaleString()} GT)
                        </h3>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        Diajukan: {req.submittedAt} • Rute: {req.route} • {req.port}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                        req.status === "approved"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : req.status === "verified"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {req.statusLabel}
                    </span>

                    <button
                      onClick={() => setSelectedDetailReq(req)}
                      className="p-1.5 rounded-lg border border-[#CBD5E1] text-[#64748B] hover:text-[#0B241E] hover:bg-slate-50 cursor-pointer"
                      title="Lihat Detail Permohonan"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* SIKLUS STEPPER MINI (Permohonan ➔ Verifikasi ➔ Persetujuan) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Step 1 */}
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold text-emerald-950">1. Permohonan Masuk</p>
                      <p className="text-[10px] text-emerald-800">Dokumen & utilitas tercatat</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div
                    className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                      req.status === "verified" || req.status === "approved"
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    {req.status === "verified" || req.status === "approved" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-blue-600 shrink-0 animate-spin" />
                    )}
                    <div>
                      <p className="font-bold text-[#0B241E]">2. Verifikasi Jadwal</p>
                      <p className="text-[10px] text-[#64748B]">Pemeriksaan fisik dermaga</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div
                    className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                      req.status === "approved"
                        ? "bg-emerald-50 border-emerald-300"
                        : "bg-[#F8FAFC] border-[#E2E8F0] opacity-60"
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        req.status === "approved" ? "text-emerald-600" : "text-[#94A3B8]"
                      }`}
                    />
                    <div>
                      <p className="font-bold text-[#0B241E]">3. Alokasi Dermaga Terbit</p>
                      <p className="text-[10px] text-[#64748B]">Izin sandar disahkan UPT</p>
                    </div>
                  </div>
                </div>

                {/* Detail Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] text-xs">
                  <div>
                    <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">Rencana Sandar (ETA)</span>
                    <p className="font-mono font-bold text-[#0B241E] mt-0.5">{req.eta}</p>
                    <p className="font-mono text-[#64748B] text-[11px]">s/d {req.etd}</p>
                  </div>

                  <div>
                    <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">Alokasi Dermaga</span>
                    <p className="font-bold text-[#0284C7] mt-0.5">
                      {req.allocatedDock || "Menunggu Penetapan Petugas"}
                    </p>
                    <p className="text-[10px] text-[#64748B]">Kelas: {req.dockType}</p>
                  </div>

                  <div>
                    <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">Utilitas Dipesan</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      {req.utilities.freshWater && (
                        <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded font-bold" title="Air Bersih">
                          Air {req.utilities.waterVolume} m³
                        </span>
                      )}
                      {req.utilities.shorePower && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-bold" title="Listrik Darat">
                          Listrik {req.utilities.powerKwh} kWh
                        </span>
                      )}
                      {req.utilities.wasteDisposal && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold" title="Sampah">
                          Limbah
                        </span>
                      )}
                      {!req.utilities.freshWater && !req.utilities.shorePower && !req.utilities.wasteDisposal && (
                        <span className="text-[#94A3B8] text-[11px]">-</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">Estimasi Retribusi</span>
                    <p className="font-mono font-extrabold text-[#0B241E] text-sm mt-0.5">
                      {formatRupiah(req.costBreakdown.total)}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-semibold">PP No. 35/2023</p>
                  </div>
                </div>

                {/* Officer Notes if available */}
                {req.officerNotes && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[11px] block font-bold">Catatan Verifikator UPT Pelabuhan:</strong>
                      <p className="text-[#334155] mt-0.5 leading-relaxed">{req.officerNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DETAIL PERMOHONAN                                                   */}
      {/* ========================================================================= */}
      {selectedDetailReq && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 border border-[#CBD5E1] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#0B241E]">
                    Rincian Lengkap Permohonan Dermaga
                  </h3>
                  <span className="font-mono text-xs text-[#64748B]">{selectedDetailReq.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetailReq(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0B241E] hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
              <div>
                <span className="text-[#94A3B8] text-[10px] uppercase font-bold block">Armada Kapal</span>
                <p className="font-bold text-[#0B241E] text-sm mt-0.5">{selectedDetailReq.vesselName}</p>
                <p className="font-mono text-[#64748B]">{selectedDetailReq.gt.toLocaleString()} GT • {selectedDetailReq.callSign}</p>
              </div>
              <div>
                <span className="text-[#94A3B8] text-[10px] uppercase font-bold block">Status Permohonan</span>
                <span className="inline-block mt-1 font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {selectedDetailReq.statusLabel}
                </span>
              </div>
              <div>
                <span className="text-[#94A3B8] text-[10px] uppercase font-bold block">Pelabuhan & Rute</span>
                <p className="font-bold text-[#0B241E] mt-0.5">{selectedDetailReq.port}</p>
                <p className="text-[#64748B]">{selectedDetailReq.route}</p>
              </div>
              <div>
                <span className="text-[#94A3B8] text-[10px] uppercase font-bold block">Alokasi Penetapan UPT</span>
                <p className="font-bold text-[#0284C7] mt-0.5">{selectedDetailReq.allocatedDock || "Menunggu Penetapan"}</p>
              </div>
            </div>

            {/* Rincian Biaya */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-[#0B241E] block">Rincian Komponen Tarif Retribusi:</span>
              <div className="border border-[#CBD5E1] rounded-xl p-3 space-y-1.5 bg-slate-50">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Jasa Tambat Dermaga ({selectedDetailReq.dockType}):</span>
                  <span className="font-mono font-bold text-[#0B241E]">{formatRupiah(selectedDetailReq.costBreakdown.mooring)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Jasa Labuh Perairan:</span>
                  <span className="font-mono font-bold text-[#0B241E]">{formatRupiah(selectedDetailReq.costBreakdown.anchorage)}</span>
                </div>
                {selectedDetailReq.utilities.freshWater && (
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Air Bersih ({selectedDetailReq.utilities.waterVolume} m³):</span>
                    <span className="font-mono font-bold text-[#0B241E]">{formatRupiah(selectedDetailReq.costBreakdown.water)}</span>
                  </div>
                )}
                {selectedDetailReq.utilities.shorePower && (
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Listrik Darat Shore Power ({selectedDetailReq.utilities.powerKwh} kWh):</span>
                    <span className="font-mono font-bold text-[#0B241E]">{formatRupiah(selectedDetailReq.costBreakdown.power)}</span>
                  </div>
                )}
                {selectedDetailReq.utilities.wasteDisposal && (
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Jasa Pengelolaan Limbah Kapal:</span>
                    <span className="font-mono font-bold text-[#0B241E]">{formatRupiah(selectedDetailReq.costBreakdown.waste)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[#CBD5E1] pt-2 font-bold text-sm">
                  <span className="text-[#0B241E]">Total Estimasi:</span>
                  <span className="font-mono text-[#0B241E]">{formatRupiah(selectedDetailReq.costBreakdown.total)}</span>
                </div>
              </div>
            </div>

            {selectedDetailReq.officerNotes && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950">
                <span className="font-bold block">Catatan Verifikator UPT:</span>
                <p className="mt-0.5 text-[#334155]">{selectedDetailReq.officerNotes}</p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDetailReq(null)}
                className="px-5 py-2 bg-[#0B241E] text-white text-xs font-bold rounded-xl"
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
