"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Ship,
  Clock,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  ShieldCheck,
  Download,
  Search,
  ExternalLink,
  Users,
  Truck,
  ArrowRight,
  Send,
  Droplets,
  Zap,
  Trash2,
  CalendarCheck2,
  X,
  Check,
  Printer,
  Sparkles,
  Info,
  Building2,
  Lock,
  ChevronRight,
  Filter,
} from "lucide-react";

// ==========================================
// DATA TYPES
// ==========================================
export interface PassengerItem {
  id: string;
  name: string;
  category: "Dewasa" | "Anak" | "Bayi";
  gender: "L" | "P";
  idMasked: string;
  ticketClass: string;
  gateCheckinTime: string;
  insuranceValid: boolean;
}

export interface VehicleItem {
  id: string;
  plateNumber: string;
  vehicleClass: "Gol II (Motor)" | "Gol IV (Mobil)" | "Gol V (Truk Sedang)" | "Gol VI+ (Truk Besar)";
  driverName: string;
  cargoType: string;
  weightTon: number;
}

export interface VesselLog {
  id: string;
  name: string;
  callSign: string;
  gt: number;
  loa: number;
  draft: number;
  dock: string;
  dockType: "Reguler" | "Eksekutif";
  operator: string;
  route: string;
  ata: string; // Actual Time of Arrival
  atb: string; // Actual Time of Berthing
  atd: string; // Actual Time of Departure
  allocatedSlotDurationHours: number;
  status: "approaching" | "docked" | "overstay" | "departed";
  passengers: number;
  maxPassengers: number;
  vehicles: number;
  maxVehicles: number;
  manifestHash: string;
  spbStatus: "pending" | "approved" | "rejected";
  spbNumber?: string;
  spbIssuedAt?: string;
  rejectionReason?: string;
  // Actual Utilities Logged
  utilitiesActual: {
    freshWaterM3: number;
    shorePowerKwh: number;
    wasteDisposed: boolean;
  };
  // Retribusi PP 35/2023 Breakdown
  retribusi: {
    tambatRatePerHour: number;
    tambatCost: number;
    labuhCost: number;
    waterCost: number;
    powerCost: number;
    wasteCost: number;
    totalCost: number;
  };
  passengerList: PassengerItem[];
  vehicleList: VehicleItem[];
}

// ==========================================
// MOCK DATASET
// ==========================================
const INITIAL_VESSELS: VesselLog[] = [
  {
    id: "V-01",
    name: "KMP Baruna Jaya",
    callSign: "PK-BJ92",
    gt: 1250,
    loa: 72.5,
    draft: 3.8,
    dock: "Dermaga 1",
    dockType: "Reguler",
    operator: "PT Pelayaran Nusantara Bahari",
    route: "Merak ➔ Bakauheni",
    ata: "07:45 WIB",
    atb: "08:00 WIB",
    atd: "--:--",
    allocatedSlotDurationHours: 2.0,
    status: "docked",
    passengers: 215,
    maxPassengers: 350,
    vehicles: 42,
    maxVehicles: 60,
    manifestHash: "SHA256: 8f4a7c29...e49b",
    spbStatus: "pending",
    utilitiesActual: {
      freshWaterM3: 20,
      shorePowerKwh: 50,
      wasteDisposed: true,
    },
    retribusi: {
      tambatRatePerHour: 112500,
      tambatCost: 225000,
      labuhCost: 50000,
      waterCost: 560000,
      powerCost: 160000,
      wasteCost: 150000,
      totalCost: 1145000,
    },
    passengerList: [
      { id: "P-01", name: "Ahmad Syafi'i", category: "Dewasa", gender: "L", idMasked: "3201****4412", ticketClass: "Reguler Dewasa", gateCheckinTime: "07:20 WIB", insuranceValid: true },
      { id: "P-02", name: "Siti Aminah", category: "Dewasa", gender: "P", idMasked: "3201****8831", ticketClass: "Reguler Dewasa", gateCheckinTime: "07:22 WIB", insuranceValid: true },
      { id: "P-03", name: "Rian Hidayat", category: "Anak", gender: "L", idMasked: "3201****1190", ticketClass: "Reguler Anak", gateCheckinTime: "07:25 WIB", insuranceValid: true },
      { id: "P-04", name: "Budi Santoso", category: "Dewasa", gender: "L", idMasked: "3671****9901", ticketClass: "Reguler Dewasa", gateCheckinTime: "07:30 WIB", insuranceValid: true },
    ],
    vehicleList: [
      { id: "VH-01", plateNumber: "B 1892 KDA", vehicleClass: "Gol IV (Mobil)", driverName: "Ahmad Syafi'i", cargoType: "Penumpang Pribadi", weightTon: 1.8 },
      { id: "VH-02", plateNumber: "A 9021 BB", vehicleClass: "Gol II (Motor)", driverName: "Rahmat Subagyo", cargoType: "Penumpang Roda Dua", weightTon: 0.2 },
      { id: "VH-03", plateNumber: "BE 8122 YU", vehicleClass: "Gol V (Truk Sedang)", driverName: "Supriyadi", cargoType: "Sayur & Buah Segar", weightTon: 8.5 },
    ],
  },
  {
    id: "V-02",
    name: "KMP Mutiara Persada",
    callSign: "PK-MP44",
    gt: 1800,
    loa: 85.0,
    draft: 4.2,
    dock: "Dermaga 2",
    dockType: "Reguler",
    operator: "PT Pelayaran Nusantara Bahari",
    route: "Bakauheni ➔ Merak",
    ata: "13:45 WIB",
    atb: "14:00 WIB",
    atd: "--:--",
    allocatedSlotDurationHours: 1.5,
    status: "overstay",
    passengers: 320,
    maxPassengers: 400,
    vehicles: 54,
    maxVehicles: 65,
    manifestHash: "SHA256: d491ea70...21c4",
    spbStatus: "pending",
    utilitiesActual: {
      freshWaterM3: 35,
      shorePowerKwh: 0,
      wasteDisposed: true,
    },
    retribusi: {
      tambatRatePerHour: 162000,
      tambatCost: 405000,
      labuhCost: 72000,
      waterCost: 980000,
      powerCost: 0,
      wasteCost: 150000,
      totalCost: 1607000,
    },
    passengerList: [
      { id: "P-11", name: "Hendro Pranoto", category: "Dewasa", gender: "L", idMasked: "1801****2291", ticketClass: "Reguler Dewasa", gateCheckinTime: "13:20 WIB", insuranceValid: true },
      { id: "P-12", name: "Dewi Lestari", category: "Dewasa", gender: "P", idMasked: "1801****3390", ticketClass: "Reguler Dewasa", gateCheckinTime: "13:25 WIB", insuranceValid: true },
    ],
    vehicleList: [
      { id: "VH-11", plateNumber: "B 9912 UZ", vehicleClass: "Gol VI+ (Truk Besar)", driverName: "Bambang Hermanto", cargoType: "Bahan Bangunan & Semen", weightTon: 18.2 },
      { id: "VH-12", plateNumber: "BE 4410 KL", vehicleClass: "Gol IV (Mobil)", driverName: "Dewi Lestari", cargoType: "Penumpang Keluarga", weightTon: 2.1 },
    ],
  },
  {
    id: "V-03",
    name: "KMP Dharma Rucitra",
    callSign: "PK-DR44",
    gt: 2100,
    loa: 92.0,
    draft: 4.5,
    dock: "Dermaga 3",
    dockType: "Reguler",
    operator: "PT Dharma Lautan Utama",
    route: "Bakauheni ➔ Merak",
    ata: "14:20 WIB",
    atb: "--:--",
    atd: "--:--",
    allocatedSlotDurationHours: 1.5,
    status: "approaching",
    passengers: 290,
    maxPassengers: 420,
    vehicles: 48,
    maxVehicles: 60,
    manifestHash: "SHA256: 19c83a1f...b012",
    spbStatus: "pending",
    utilitiesActual: {
      freshWaterM3: 25,
      shorePowerKwh: 0,
      wasteDisposed: true,
    },
    retribusi: {
      tambatRatePerHour: 189000,
      tambatCost: 283500,
      labuhCost: 84000,
      waterCost: 700000,
      powerCost: 0,
      wasteCost: 150000,
      totalCost: 1217500,
    },
    passengerList: [
      { id: "P-21", name: "Gunawan Santoso", category: "Dewasa", gender: "L", idMasked: "3171****9090", ticketClass: "Reguler Dewasa", gateCheckinTime: "13:50 WIB", insuranceValid: true },
    ],
    vehicleList: [
      { id: "VH-21", plateNumber: "D 1092 AB", vehicleClass: "Gol IV (Mobil)", driverName: "Gunawan Santoso", cargoType: "Penumpang Pribadi", weightTon: 1.9 },
    ],
  },
  {
    id: "V-04",
    name: "KM Selat Berkah 02",
    callSign: "PK-SB02",
    gt: 450,
    loa: 38.0,
    draft: 2.1,
    dock: "Dermaga 4",
    dockType: "Reguler",
    operator: "Koperasi Jasa Angkutan Laut Selat Sunda",
    route: "Bakauheni ➔ Merak",
    ata: "10:45 WIB",
    atb: "11:00 WIB",
    atd: "12:30 WIB",
    allocatedSlotDurationHours: 1.5,
    status: "departed",
    passengers: 120,
    maxPassengers: 180,
    vehicles: 0,
    maxVehicles: 0,
    manifestHash: "SHA256: a12bc789...55ee",
    spbStatus: "approved",
    spbNumber: "SPB/UPTD-MRK/2026/XI/084",
    spbIssuedAt: "16 Nov 2026, 12:15 WIB",
    utilitiesActual: {
      freshWaterM3: 0,
      shorePowerKwh: 0,
      wasteDisposed: true,
    },
    retribusi: {
      tambatRatePerHour: 40500,
      tambatCost: 81000,
      labuhCost: 18000,
      waterCost: 0,
      powerCost: 0,
      wasteCost: 150000,
      totalCost: 249000,
    },
    passengerList: [
      { id: "P-31", name: "Mustafa Kamal", category: "Dewasa", gender: "L", idMasked: "1871****4411", ticketClass: "Speedboat Eksekutif", gateCheckinTime: "10:30 WIB", insuranceValid: true },
    ],
    vehicleList: [],
  },
];

export default function UptKapalPage() {
  const [vessels, setVessels] = useState<VesselLog[]>(INITIAL_VESSELS);
  const [selectedVesselId, setSelectedVesselId] = useState<string>("V-01");
  const [activeTab, setActiveTab] = useState<"timestamp" | "manifest">("timestamp");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isManifestModalOpen, setIsManifestModalOpen] = useState<boolean>(false);
  const [isSpbModalOpen, setIsSpbModalOpen] = useState<boolean>(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState<boolean>(false);
  const [rejectionInput, setRejectionInput] = useState<string>("");

  // Selected Vessel Active
  const activeVessel = vessels.find((v) => v.id === selectedVesselId) || vessels[0];

  // Timestamp Input State
  const [inputATA, setInputATA] = useState<string>(activeVessel.ata);
  const [inputATB, setInputATB] = useState<string>(activeVessel.atb);
  const [inputATD, setInputATD] = useState<string>(activeVessel.atd);

  // Utilities Input State
  const [waterM3Input, setWaterM3Input] = useState<number>(activeVessel.utilitiesActual.freshWaterM3);
  const [powerKwhInput, setPowerKwhInput] = useState<number>(activeVessel.utilitiesActual.shorePowerKwh);
  const [wasteChecked, setWasteChecked] = useState<boolean>(activeVessel.utilitiesActual.wasteDisposed);

  // Sync inputs when active vessel changes
  const handleSelectVessel = (v: VesselLog) => {
    setSelectedVesselId(v.id);
    setInputATA(v.ata);
    setInputATB(v.atb);
    setInputATD(v.atd);
    setWaterM3Input(v.utilitiesActual.freshWaterM3);
    setPowerKwhInput(v.utilitiesActual.shorePowerKwh);
    setWasteChecked(v.utilitiesActual.wasteDisposed);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Helper set current clock
  const setCurrentTime = (type: "ata" | "atb" | "atd") => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;
    if (type === "ata") setInputATA(timeStr);
    if (type === "atb") setInputATB(timeStr);
    if (type === "atd") setInputATD(timeStr);
  };

  // Save Logbook Timestamp & Utilities
  const handleSaveTimestamp = () => {
    // Recalculate retribusi
    const waterCost = waterM3Input * 28000;
    const powerCost = powerKwhInput * 3200;
    const wasteCost = wasteChecked ? 150000 : 0;
    const tambatCost = activeVessel.retribusi.tambatCost;
    const labuhCost = activeVessel.retribusi.labuhCost;
    const totalCost = tambatCost + labuhCost + waterCost + powerCost + wasteCost;

    const newStatus: "approaching" | "docked" | "overstay" | "departed" =
      inputATD !== "--:--"
        ? "departed"
        : activeVessel.status === "overstay"
        ? "overstay"
        : inputATB !== "--:--"
        ? "docked"
        : "approaching";

    setVessels((prev) =>
      prev.map((v) =>
        v.id === activeVessel.id
          ? {
              ...v,
              ata: inputATA,
              atb: inputATB,
              atd: inputATD,
              status: newStatus,
              utilitiesActual: {
                freshWaterM3: waterM3Input,
                shorePowerKwh: powerKwhInput,
                wasteDisposed: wasteChecked,
              },
              retribusi: {
                ...v.retribusi,
                waterCost,
                powerCost,
                wasteCost,
                totalCost,
              },
            }
          : v
      )
    );

    triggerToast(
      `Timestamp & data utilitas aktual untuk ${activeVessel.name} berhasil disimpan ke logbook resmi Syahbandar!`
    );
  };

  // Approve SPB Action
  const handleApproveSPB = () => {
    const spbNum = `SPB/UPTD-MRK/2026/XI/${Math.floor(100 + Math.random() * 900)}`;
    const nowTime = `16 Nov 2026, ${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`;

    setVessels((prev) =>
      prev.map((v) =>
        v.id === activeVessel.id
          ? {
              ...v,
              spbStatus: "approved",
              spbNumber: spbNum,
              spbIssuedAt: nowTime,
            }
          : v
      )
    );

    setIsSpbModalOpen(true);
    triggerToast(
      `Manifes disahkan! Surat Persetujuan Berlayar (SPB) ${activeVessel.name} terbit & tagihan e-SKRD otomatis terkunci.`
    );
  };

  // Reject Manifest Action
  const handleConfirmRejectManifest = () => {
    const reason = rejectionInput.trim() || "Kapasitas beban melebihi manifes keselamatan atau terdapat anomali data tiket.";

    setVessels((prev) =>
      prev.map((v) =>
        v.id === activeVessel.id
          ? {
              ...v,
              spbStatus: "rejected",
              rejectionReason: reason,
            }
          : v
      )
    );

    setRejectionModalOpen(false);
    setRejectionInput("");
    triggerToast(`Manifes ${activeVessel.name} ditolak. Notifikasi perbaikan telah dikirim ke Nakhoda / Operator.`);
  };

  // Metrics computation
  const totalMonitored = vessels.length;
  const dockedCount = vessels.filter((v) => v.status === "docked" || v.status === "overstay").length;
  const overstayCount = vessels.filter((v) => v.status === "overstay").length;
  const manifestPendingCount = vessels.filter((v) => v.spbStatus === "pending").length;
  const totalRetribusiSif = vessels.reduce((acc, v) => acc + v.retribusi.totalCost, 0);

  // Filtered vessels
  const filteredVessels = vessels.filter((v) => {
    if (statusFilter === "docked" && v.status !== "docked" && v.status !== "overstay") return false;
    if (statusFilter === "overstay" && v.status !== "overstay") return false;
    if (statusFilter === "approaching" && v.status !== "approaching") return false;
    if (statusFilter === "departed" && v.status !== "departed") return false;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchName = v.name.toLowerCase().includes(q);
      const matchCall = v.callSign.toLowerCase().includes(q);
      const matchDock = v.dock.toLowerCase().includes(q);
      const matchOp = v.operator.toLowerCase().includes(q);
      if (!matchName && !matchCall && !matchDock && !matchOp) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0B241E] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 max-w-md">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs leading-relaxed text-emerald-100">{toastMessage}</p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. TOP ELEVATED DECK & KPI SUMMARY                        */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-md p-4 sm:p-5 relative z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center shadow-xs border border-[#164336]">
              <Ship className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-[#0B241E]">
                  Buku Log Sandar Digital & Validasi Manifes SOLAS
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Syahbandar Desk • Sif 1 Aktif
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pencatatan ATA/ATB/ATD aktual, deteksi overstay dwell time, verifikasi manifes berenkripsi, serta penerbitan SPB & e-SKRD otomatis (PP 35/2023).
              </p>
            </div>
          </div>

          {/* Quick Action: Link to Meja Alokasi */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <Link
              href="/upt/alokasi"
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <CalendarCheck2 className="w-4 h-4 text-[#D97706]" />
              <span>Meja Alokasi Dermaga</span>
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Metric 1 */}
          <div className="p-3.5 sm:p-4 bg-[#F8FAFC] rounded-xl border border-slate-200/90 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Kapal Dalam Pengawasan
              </span>
              <p className="text-xl sm:text-2xl font-black text-[#0B241E] font-mono mt-0.5">
                {totalMonitored} Armada
              </p>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                {dockedCount} Sandar Aktif • 1 Menuju Alur
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              <Ship className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 2: Overstay Alert */}
          <div
            onClick={() => setStatusFilter("overstay")}
            className={`p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              overstayCount > 0
                ? "bg-amber-50/70 border-amber-300 hover:border-amber-400 shadow-2xs"
                : "bg-[#F8FAFC] border-slate-200/90"
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 block">
                  Peringatan Overstay
                </span>
                {overstayCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </div>
              <p className="text-xl sm:text-2xl font-black text-amber-800 mt-0.5 font-mono">
                {overstayCount} Armada
              </p>
              <span className="text-[10px] text-amber-700 mt-0.5 block font-medium">
                {overstayCount > 0 ? "Dwell time > batas kuota slot sandar" : "Semua kapal tepat waktu"}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
          </div>

          {/* Metric 3 */}
          <div className="p-3.5 sm:p-4 bg-[#F8FAFC] rounded-xl border border-slate-200/90 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Validasi Manifes SOLAS
              </span>
              <p className="text-xl sm:text-2xl font-black text-[#D97706] mt-0.5">
                {manifestPendingCount} Perlu Review
              </p>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Batas beban & integritas hash
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-[#D97706] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 4 */}
          <div className="p-3.5 sm:p-4 bg-[#F8FAFC] rounded-xl border border-slate-200/90 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Billing Retribusi Sif (PP 35)
              </span>
              <p className="text-xl sm:text-2xl font-black text-emerald-700 font-mono mt-0.5">
                Rp {totalRetribusiSif.toLocaleString("id-ID")}
              </p>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Akumulasi tambat, labuh & utilitas
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN WORKSPACE: VESSEL QUEUE & ACTIVE INSPECTION DESK */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Fleet List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Filter & Search Bar */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama kapal, dermaga, call sign..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#D97706] focus:bg-white transition-all"
              />
            </div>

            {/* Status pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-semibold pb-1">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-2.5 py-1 rounded-lg transition-all shrink-0 ${
                  statusFilter === "all"
                    ? "bg-[#0B241E] text-white font-bold"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Semua ({vessels.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("docked")}
                className={`px-2.5 py-1 rounded-lg transition-all shrink-0 ${
                  statusFilter === "docked"
                    ? "bg-[#0B241E] text-white font-bold"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Sandar ({dockedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("overstay")}
                className={`px-2.5 py-1 rounded-lg transition-all shrink-0 flex items-center gap-1 ${
                  statusFilter === "overstay"
                    ? "bg-amber-600 text-white font-bold"
                    : "text-amber-700 bg-amber-50 hover:bg-amber-100"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Overstay ({overstayCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("departed")}
                className={`px-2.5 py-1 rounded-lg transition-all shrink-0 ${
                  statusFilter === "departed"
                    ? "bg-[#0B241E] text-white font-bold"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Bertolak (1)
              </button>
            </div>
          </div>

          {/* List of Vessels Cards */}
          <div className="space-y-2.5">
            {filteredVessels.map((v) => {
              const isSelected = v.id === activeVessel.id;
              const isOverstay = v.status === "overstay";

              return (
                <div
                  key={v.id}
                  onClick={() => handleSelectVessel(v)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative shadow-2xs ${
                    isSelected
                      ? "bg-[#0B241E] text-white border-[#0B241E] ring-2 ring-[#D97706]/40"
                      : isOverstay
                      ? "bg-amber-50/60 border-amber-300 hover:border-amber-400 text-slate-900"
                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Ship
                        className={`w-4 h-4 ${
                          isSelected ? "text-[#D97706]" : "text-slate-600"
                        }`}
                      />
                      <span className="font-extrabold text-xs sm:text-sm truncate">
                        {v.name}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold shrink-0 ${
                        isSelected
                          ? "bg-[#143E33] text-[#D97706] border border-[#1E5748]"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {v.dock}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className={isSelected ? "text-[#BED2CA]" : "text-slate-500"}>
                      {v.callSign} • {v.gt.toLocaleString()} GT
                    </span>
                    <span className="font-mono text-[11px] font-bold">
                      ATA {v.ata.replace(" WIB", "")} | ATB {v.atb.replace(" WIB", "")}
                    </span>
                  </div>

                  {/* Overstay Warning Banner */}
                  {isOverstay && (
                    <div
                      className={`mt-2.5 p-2 rounded-xl text-[11px] flex items-center gap-1.5 font-bold ${
                        isSelected
                          ? "bg-amber-500/20 text-amber-200 border border-amber-400/40"
                          : "bg-amber-100 text-amber-900 border border-amber-200"
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Overstay: Melebihi kuota alokasi slot ({v.allocatedSlotDurationHours} Jam)</span>
                    </div>
                  )}

                  {/* Bottom Badges */}
                  <div className="mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] border-slate-100/20">
                    <span className={isSelected ? "text-slate-300" : "text-slate-500"}>
                      {v.passengers} Penumpang • {v.vehicles} Kendaraan
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        v.spbStatus === "approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : v.spbStatus === "rejected"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {v.spbStatus === "approved"
                        ? "SPB Sah"
                        : v.spbStatus === "rejected"
                        ? "Manifes Ditolak"
                        : "Review Manifes"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Workspace & Inspections Desk (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Header Card of Selected Vessel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-[#0B241E]">
                    {activeVessel.name}
                  </h2>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                    {activeVessel.callSign}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {activeVessel.dock}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeVessel.operator} • Lintasan: <strong>{activeVessel.route}</strong>
                </p>
              </div>

              {/* Status pill */}
              <div className="text-right self-start sm:self-auto">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-xl inline-flex items-center gap-1.5 ${
                    activeVessel.status === "overstay"
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : activeVessel.status === "docked"
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      : activeVessel.status === "departed"
                      ? "bg-slate-100 text-slate-800 border border-slate-300"
                      : "bg-sky-100 text-sky-900 border border-sky-300"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  <span className="uppercase font-mono text-[10px]">
                    Status: {activeVessel.status}
                  </span>
                </span>
              </div>
            </div>

            {/* Tab Switcher: Log Waktu vs Validasi Manifes */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("timestamp")}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === "timestamp"
                    ? "bg-white text-[#0B241E] shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Clock className="w-4 h-4 text-[#D97706]" />
                <span>Pencatatan Waktu Aktual & Utilitas</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("manifest")}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === "manifest"
                    ? "bg-white text-[#0B241E] shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Validasi Manifes SOLAS & SPB</span>
              </button>
            </div>

            {/* TAB 1: TIMESTAMPING & UTILITIES RECONCILIATION */}
            {activeTab === "timestamp" ? (
              <div className="space-y-4 pt-2">
                {/* 3 Timestamp Inputs */}
                <div>
                  <span className="text-xs font-extrabold text-slate-700 block mb-2">
                    Logbook Waktu Aktual Gerak Kapal:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* ATA */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                          ATA (Waktu Tiba)
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                      </div>
                      <input
                        type="text"
                        value={inputATA}
                        onChange={(e) => setInputATA(e.target.value)}
                        className="w-full text-xs font-mono font-bold px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-[#0B241E] focus:outline-none focus:border-[#D97706]"
                      />
                      <button
                        type="button"
                        onClick={() => setCurrentTime("ata")}
                        className="w-full py-1 text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        Set Jam Sekarang
                      </button>
                    </div>

                    {/* ATB */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                          ATB (Mulai Sandar)
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </div>
                      <input
                        type="text"
                        value={inputATB}
                        onChange={(e) => setInputATB(e.target.value)}
                        className="w-full text-xs font-mono font-bold px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-[#0B241E] focus:outline-none focus:border-[#D97706]"
                      />
                      <button
                        type="button"
                        onClick={() => setCurrentTime("atb")}
                        className="w-full py-1 text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        Set Jam Sekarang
                      </button>
                    </div>

                    {/* ATD */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                          ATD (Waktu Tolak)
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={inputATD}
                        onChange={(e) => setInputATD(e.target.value)}
                        className="w-full text-xs font-mono font-bold px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-[#0B241E] focus:outline-none focus:border-[#D97706]"
                      />
                      <button
                        type="button"
                        onClick={() => setCurrentTime("atd")}
                        className="w-full py-1 text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        Set Jam Sekarang
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actual Utilities Input & Metering */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-xs font-extrabold text-slate-700 block">
                    Pencatatan Meteran Utilitas Riil (Dasar Tagihan e-SKRD PP 35/2023):
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-sky-600" />
                        <span>Air Bersih (m³):</span>
                      </label>
                      <input
                        type="number"
                        value={waterM3Input}
                        onChange={(e) => setWaterM3Input(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-[#0B241E] focus:outline-none focus:border-[#D97706]"
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">@ Rp 28.000 / m³</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span>Shore Power (kWh):</span>
                      </label>
                      <input
                        type="number"
                        value={powerKwhInput}
                        onChange={(e) => setPowerKwhInput(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-[#0B241E] focus:outline-none focus:border-[#D97706]"
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">@ Rp 3.200 / kWh</span>
                    </div>

                    <div className="flex flex-col justify-end">
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wasteChecked}
                          onChange={(e) => setWasteChecked(e.target.checked)}
                          className="rounded border-slate-300 text-[#0B241E] focus:ring-[#D97706]"
                        />
                        <Trash2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[11px] font-bold text-slate-700">Angkut Limbah</span>
                      </label>
                      <span className="text-[10px] text-slate-400 block mt-0.5 pl-1">Tetap: Rp 150.000</span>
                    </div>
                  </div>
                </div>

                {/* Retribution Calculation Preview */}
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-800 font-bold block">
                      Kalkulasi Retribusi Tambat & Utilitas Riil (PP 35/2023)
                    </span>
                    <p className="text-base font-black text-amber-950 font-mono mt-0.5">
                      Rp {(activeVessel.retribusi.tambatCost + activeVessel.retribusi.labuhCost + waterM3Input * 28000 + powerKwhInput * 3200 + (wasteChecked ? 150000 : 0)).toLocaleString("id-ID")}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveTimestamp}
                    className="px-4 py-2 bg-[#0B241E] hover:bg-[#164336] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
                    <span>Simpan & Kunci Logbook</span>
                  </button>
                </div>
              </div>
            ) : (
              /* TAB 2: MANIFEST VERIFICATION & SPB ISSUANCE */
              <div className="space-y-4 pt-2">
                {/* Manifest Security Hash Banner */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block font-bold">
                      HASH INTEGRITAS MANIFES OPERATOR (SOLAS CHAPTER III/V)
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-0.5 inline-block">
                      {activeVessel.manifestHash}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-lg self-start sm:self-auto">
                    Status Dokumen: Terenkripsi Sah
                  </span>
                </div>

                {/* Capacity vs Actual Passengers & Vehicles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Passenger Card */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-bold flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-600" />
                        <span>Kapasitas Penumpang</span>
                      </span>
                      <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Aman ({Math.round((activeVessel.passengers / activeVessel.maxPassengers) * 100)}%)
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-2xl font-black text-[#0B241E] font-mono">
                        {activeVessel.passengers}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Batas Maks: {activeVessel.maxPassengers} Jiwa
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (activeVessel.passengers / activeVessel.maxPassengers) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Vehicles Card */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-bold flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-sky-600" />
                        <span>Kapasitas Kendaraan</span>
                      </span>
                      <span className="text-[11px] font-mono font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                        {activeVessel.maxVehicles > 0
                          ? `${Math.round((activeVessel.vehicles / activeVessel.maxVehicles) * 100)}% Muatan`
                          : "Khusus Penumpang"}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-2xl font-black text-[#0B241E] font-mono">
                        {activeVessel.vehicles}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {activeVessel.maxVehicles > 0
                          ? `Batas Maks: ${activeVessel.maxVehicles} Unit`
                          : "Tidak Muat Kendaraan"}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-600 h-full rounded-full transition-all"
                        style={{
                          width: `${
                            activeVessel.maxVehicles > 0
                              ? Math.min(100, (activeVessel.vehicles / activeVessel.maxVehicles) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons: View Manifest Table, Reject, Issue SPB */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setIsManifestModalOpen(true)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <FileText className="w-4 h-4 text-[#D97706]" />
                    <span>Buka Rincian Manifes Penumpang & Kendaraan</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRejectionModalOpen(true)}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Tolak Manifes
                    </button>
                    <button
                      type="button"
                      onClick={handleApproveSPB}
                      className="px-5 py-2 bg-[#0B241E] hover:bg-[#164336] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#D97706]" />
                      <span>{activeVessel.spbStatus === "approved" ? "Lihat Lembar SPB Terbit" : "Sahkan & Terbitkan SPB"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MODAL: RINCIAN MANIFES PENUMPANG & KENDARAAN (SOLAS)   */}
      {/* ========================================================= */}
      {isManifestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#D97706]" />
                <div>
                  <h3 className="text-base font-black text-[#0B241E]">
                    Rincian Manifes SOLAS: {activeVessel.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {activeVessel.manifestHash} • Operator: {activeVessel.operator}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManifestModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Passenger Manifest Table */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Sampel Daftar Penumpang Terverifikasi Gate:</span>
              </span>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] font-mono font-bold text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">No</th>
                      <th className="p-2.5">Nama Penumpang</th>
                      <th className="p-2.5">Kategori / Gender</th>
                      <th className="p-2.5">Identitas (Terenkripsi)</th>
                      <th className="p-2.5">Tiket & Gate Scan</th>
                      <th className="p-2.5">Asuransi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {activeVessel.passengerList.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-[#0B241E]">{p.name}</td>
                        <td className="p-2.5">{p.category} ({p.gender})</td>
                        <td className="p-2.5 font-mono text-slate-500">{p.idMasked}</td>
                        <td className="p-2.5 font-mono text-[11px]">
                          {p.ticketClass} • {p.gateCheckinTime}
                        </td>
                        <td className="p-2.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Check className="w-3 h-3" /> Sah
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Vehicle Manifest Table if any */}
            {activeVessel.vehicleList.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-sky-600" />
                  <span>Daftar Kendaraan & Muatan Logistik:</span>
                </span>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] font-mono font-bold text-slate-500 uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">No Polisi</th>
                        <th className="p-2.5">Golongan</th>
                        <th className="p-2.5">Nama Pengemudi</th>
                        <th className="p-2.5">Jenis Muatan</th>
                        <th className="p-2.5">Berat Estimasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {activeVessel.vehicleList.map((vh) => (
                        <tr key={vh.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-2.5 font-mono font-bold text-[#0B241E]">{vh.plateNumber}</td>
                          <td className="p-2.5">{vh.vehicleClass}</td>
                          <td className="p-2.5">{vh.driverName}</td>
                          <td className="p-2.5">{vh.cargoType}</td>
                          <td className="p-2.5 font-mono text-[11px] font-bold">{vh.weightTon} Ton</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setIsManifestModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center gap-1.5 transition-all"
              >
                <Printer className="w-4 h-4 text-[#D97706]" />
                <span>Cetak Manifes Lengkap</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MODAL: SURAT PERSETUJUAN BERLAYAR (SPB) RESMI          */}
      {/* ========================================================= */}
      {isSpbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 my-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-[#0B241E]">
                  Surat Persetujuan Berlayar (SPB) / Port Clearance
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSpbModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SPB Letter Paper Body */}
            <div className="p-5 bg-slate-50/90 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-4 font-sans">
              {/* Header Letterhead */}
              <div className="text-center border-b border-slate-300 pb-3">
                <p className="font-black text-xs uppercase text-slate-800">
                  KEMENTERIAN PERHUBUNGAN REPUBLIK INDONESIA
                </p>
                <p className="font-black text-sm uppercase text-[#0B241E]">
                  KANTOR KESYAHBANDARAN DAN OTORITAS PELABUHAN
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  SURAT PERSETUJUAN BERLAYAR (PORT CLEARANCE CERTIFICATE)
                </p>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block">NO. REGISTRASI SPB:</span>
                  <span className="font-bold text-slate-900">
                    {activeVessel.spbNumber || "SPB/UPTD-MRK/2026/XI/088"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">WAKTU PENERBITAN:</span>
                  <span className="font-bold text-slate-900">
                    {activeVessel.spbIssuedAt || "16 Nov 2026, 15:30 WIB"}
                  </span>
                </div>
              </div>

              {/* Vessel specs */}
              <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Nama Armada:</span>
                  <span className="font-bold text-[#0B241E]">{activeVessel.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Call Sign / Ukuran:</span>
                  <span className="font-mono font-bold">
                    {activeVessel.callSign} • {activeVessel.gt.toLocaleString()} GT
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Operator / Pemilik:</span>
                  <span className="font-bold">{activeVessel.operator}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Pelabuhan Tujuan:</span>
                  <span className="font-bold text-emerald-800 font-mono">Pelabuhan Regional Bakauheni</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Jumlah Muatan:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {activeVessel.passengers} Penumpang • {activeVessel.vehicles} Kendaraan
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kondisi Cuaca BMKG:</span>
                  <span className="font-semibold text-emerald-700">
                    Aman (Gelombang 0.5 - 1.0 m, Angin 8 knot)
                  </span>
                </div>
              </div>

              {/* Tagihan e-SKRD Banner */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-[11px]">
                <span className="font-bold text-emerald-950 block mb-1">
                  Status Pembayaran Jasa Kepelabuhanan (PP 35/2023):
                </span>
                <div className="flex justify-between text-slate-600">
                  <span>Tagihan Retribusi (e-SKRD):</span>
                  <span className="font-mono font-bold text-emerald-900">
                    Rp {activeVessel.retribusi.totalCost.toLocaleString("id-ID")} (Terkunci & Diterbitkan)
                  </span>
                </div>
              </div>

              {/* Signature block */}
              <div className="flex justify-between items-end pt-2 text-[10px]">
                <div className="text-slate-500 max-w-[200px]">
                  <p className="font-bold text-slate-700">Pemberitahuan:</p>
                  <p className="mt-0.5 leading-relaxed">
                    SPB ini berlaku 24 jam sejak diterbitkan dan gugur apabila kapal menambah muatan setelah bertolak.
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-slate-500">Syahbandar UPTD Merak,</p>
                  <div className="w-20 h-10 border border-dashed border-emerald-400 bg-emerald-50/60 rounded flex items-center justify-center my-1 mx-auto text-[9px] text-emerald-800 font-mono font-bold">
                    [DISAHKAN DIGITAL]
                  </div>
                  <p className="font-bold text-slate-800">Capt. Ridwan Hakim</p>
                  <p className="text-slate-400 font-mono">NIP. 19780812 200312 1 002</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setIsSpbModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0B241E] hover:bg-[#133D31] text-white flex items-center gap-2 transition-all shadow-xs"
              >
                <Printer className="w-4 h-4 text-[#D97706]" />
                <span>Cetak Lembar SPB Fisik</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL: TOLAK MANIFES KESELAMATAN                       */}
      {/* ========================================================= */}
      {rejectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-700 border-b border-slate-100 pb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Tolak Manifes Keselamatan: {activeVessel.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  SPB tidak akan diterbitkan sampai dilakukan revisi muatan.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alasan Penolakan Resmi Syahbandar:
              </label>
              <textarea
                rows={3}
                value={rejectionInput}
                onChange={(e) => setRejectionInput(e.target.value)}
                placeholder="Contoh: Muatan kendaraan golongan VI melebihi batas bobot aman kapal atau terdapat penumpang tanpa tiket..."
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-rose-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectManifest}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-xs"
              >
                Kirim Penolakan Manifes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
