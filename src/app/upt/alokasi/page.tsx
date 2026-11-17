"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Anchor,
  Ship,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Search,
  Filter,
  FileText,
  FileCheck2,
  Droplets,
  Zap,
  Trash2,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Building2,
  Printer,
  Download,
  X,
  Check,
  Layers,
  MapPin,
  HelpCircle,
  Maximize2,
  ChevronDown,
  Info,
  CalendarCheck2,
} from "lucide-react";

// ==========================================
// DATA TYPES
// ==========================================
export interface DockMaster {
  id: string;
  name: string;
  type: "Reguler" | "Eksekutif";
  maxGT: number;
  maxLOA: number;
  depthDraft: number; // in meters LWS
  equipment: string;
  status: "READY" | "OCCUPIED" | "MAINTENANCE";
}

export interface BerthRequest {
  id: string;
  ticketNumber: string;
  vesselName: string;
  callSign: string;
  gt: number;
  loa: number;
  draft: number;
  companyName: string;
  businessType: string;
  route: string;
  activityType: string;
  dockPreference: "Reguler" | "Eksekutif";
  requestedDockId?: string;
  allocatedDockId?: string;
  allocatedDockName?: string;
  eta: string;
  etd: string;
  slotStartTime: string;
  slotEndTime: string;
  durationHours: number;
  utilities: {
    freshWater: boolean;
    waterVolume?: number; // m3
    shorePower: boolean;
    powerKwh?: number; // kWh
    wasteDisposal: boolean;
  };
  retribusiPP35: {
    tambatCost: number;
    labuhCost: number;
    waterCost: number;
    powerCost: number;
    wasteCost: number;
    totalCost: number;
  };
  status:
    | "PENDING_ALLOCATION"
    | "SCHEDULE_CONFLICT"
    | "READY_FOR_CONFIRMATION"
    | "ALLOCATED_APPROVED"
    | "REJECTED";
  conflictNote?: string;
  suggestedDockId?: string;
  officerNotes?: string;
  verifiedBy?: string;
  allocatedAt?: string;
  documents: {
    seaworthyValid: boolean;
    tonnageCertValid: boolean;
    spitValid: boolean;
    manifestDraftValid: boolean;
  };
}

// Master Berth List
const DOCK_FACILITIES: DockMaster[] = [
  {
    id: "DOCK-01",
    name: "Dermaga 1",
    type: "Reguler",
    maxGT: 2500,
    maxLOA: 80,
    depthDraft: 5.0,
    equipment: "Movable Bridge Mekanik, Hydrant Air, Shore Connection 50kVA",
    status: "OCCUPIED",
  },
  {
    id: "DOCK-02",
    name: "Dermaga 2",
    type: "Reguler",
    maxGT: 3000,
    maxLOA: 95,
    depthDraft: 5.5,
    equipment: "Movable Bridge Mekanik, Hydrant Air, Shore Connection 80kVA",
    status: "READY",
  },
  {
    id: "DOCK-03",
    name: "Dermaga 3",
    type: "Reguler",
    maxGT: 3500,
    maxLOA: 105,
    depthDraft: 6.0,
    equipment: "Movable Bridge Mekanik, Hydrant Air, Shore Connection 100kVA",
    status: "READY",
  },
  {
    id: "DOCK-04",
    name: "Dermaga 4",
    type: "Reguler",
    maxGT: 4000,
    maxLOA: 115,
    depthDraft: 6.0,
    equipment: "Movable Bridge Mekanik, Hydrant Air, Shore Connection 100kVA",
    status: "READY",
  },
  {
    id: "DOCK-05",
    name: "Dermaga 5",
    type: "Reguler",
    maxGT: 4500,
    maxLOA: 120,
    depthDraft: 6.5,
    equipment: "Movable Bridge Mekanik, Hydrant Air, Shore Connection 125kVA",
    status: "READY",
  },
  {
    id: "DOCK-EX-01",
    name: "Dermaga Eksekutif 1",
    type: "Eksekutif",
    maxGT: 6000,
    maxLOA: 140,
    depthDraft: 7.0,
    equipment: "Hydraulic Ramp Door, Movable Gangway, Shore Connection 250kVA",
    status: "READY",
  },
  {
    id: "DOCK-EX-02",
    name: "Dermaga Eksekutif 2",
    type: "Eksekutif",
    maxGT: 6000,
    maxLOA: 140,
    depthDraft: 7.0,
    equipment: "Hydraulic Ramp Door, Movable Gangway, Shore Connection 250kVA",
    status: "OCCUPIED",
  },
];

// Initial Requests Queue
const INITIAL_REQUESTS: BerthRequest[] = [
  {
    id: "REQ-DOCK-2026-091",
    ticketNumber: "REQ-DOCK-2026-091",
    vesselName: "KMP Portlink III",
    callSign: "PK-PL03",
    gt: 5200,
    loa: 125.0,
    draft: 5.5,
    companyName: "PT ASDP Indonesia Ferry (Persero)",
    businessType: "BUMN Pelayaran Perhubungan",
    route: "Bakauheni ➔ Merak",
    activityType: "Bongkar & Muat Penumpang & Kendaraan (Ferry Ro-Ro Eksekutif)",
    dockPreference: "Eksekutif",
    requestedDockId: "DOCK-EX-01",
    eta: "16 Nov 2026, 21:00 WIB",
    etd: "16 Nov 2026, 23:00 WIB",
    slotStartTime: "21:00",
    slotEndTime: "23:00",
    durationHours: 2.0,
    utilities: {
      freshWater: true,
      waterVolume: 40,
      shorePower: true,
      powerKwh: 200,
      wasteDisposal: true,
    },
    retribusiPP35: {
      tambatCost: 936000,
      labuhCost: 208000,
      waterCost: 1120000,
      powerCost: 640000,
      wasteCost: 150000,
      totalCost: 3054000,
    },
    status: "PENDING_ALLOCATION",
    documents: {
      seaworthyValid: true,
      tonnageCertValid: true,
      spitValid: true,
      manifestDraftValid: true,
    },
    officerNotes: "",
  },
  {
    id: "REQ-DOCK-2026-092",
    ticketNumber: "REQ-DOCK-2026-092",
    vesselName: "KMP Dharma Rucitra",
    callSign: "PK-DR44",
    gt: 2100,
    loa: 92.0,
    draft: 4.5,
    companyName: "PT Dharma Lautan Utama",
    businessType: "Badan Usaha Pelayaran Niaga",
    route: "Bakauheni ➔ Merak",
    activityType: "Bongkar Muat Reguler Ro-Ro",
    dockPreference: "Reguler",
    requestedDockId: "DOCK-02",
    eta: "16 Nov 2026, 14:30 WIB",
    etd: "16 Nov 2026, 16:00 WIB",
    slotStartTime: "14:30",
    slotEndTime: "16:00",
    durationHours: 1.5,
    utilities: {
      freshWater: true,
      waterVolume: 25,
      shorePower: false,
      wasteDisposal: true,
    },
    retribusiPP35: {
      tambatCost: 567000,
      labuhCost: 84000,
      waterCost: 700000,
      powerCost: 0,
      wasteCost: 150000,
      totalCost: 1501000,
    },
    status: "SCHEDULE_CONFLICT",
    conflictNote:
      "Tumpang tindih jadwal 60 menit dengan alokasi KMP Mutiara Persada di Dermaga 2 (Slot 14:00 - 15:30 WIB).",
    suggestedDockId: "DOCK-03",
    documents: {
      seaworthyValid: true,
      tonnageCertValid: true,
      spitValid: true,
      manifestDraftValid: true,
    },
    officerNotes: "",
  },
  {
    id: "REQ-DOCK-2026-089",
    ticketNumber: "REQ-DOCK-2026-089",
    vesselName: "KMP Nusantara Express",
    callSign: "PK-NE11",
    gt: 2100,
    loa: 92.0,
    draft: 4.5,
    companyName: "PT ASDP Indonesia Ferry (Persero)",
    businessType: "BUMN Pelayaran Perhubungan",
    route: "Bakauheni ➔ Merak",
    activityType: "Bongkar Muat Ferry Eksekutif",
    dockPreference: "Eksekutif",
    requestedDockId: "DOCK-EX-01",
    eta: "16 Nov 2026, 18:30 WIB",
    etd: "16 Nov 2026, 20:00 WIB",
    slotStartTime: "18:30",
    slotEndTime: "20:00",
    durationHours: 1.5,
    utilities: {
      freshWater: false,
      shorePower: true,
      powerKwh: 150,
      wasteDisposal: true,
    },
    retribusiPP35: {
      tambatCost: 567000,
      labuhCost: 84000,
      waterCost: 0,
      powerCost: 480000,
      wasteCost: 150000,
      totalCost: 1281000,
    },
    status: "READY_FOR_CONFIRMATION",
    documents: {
      seaworthyValid: true,
      tonnageCertValid: true,
      spitValid: true,
      manifestDraftValid: true,
    },
    officerNotes: "Verifikasi teknis ramp door & colokan shore connection selesai. Siap disahkan.",
  },
  {
    id: "REQ-DOCK-2026-088",
    ticketNumber: "REQ-DOCK-2026-088",
    vesselName: "KMP Mutiara Persada",
    callSign: "PK-MP44",
    gt: 1800,
    loa: 85.0,
    draft: 4.2,
    companyName: "PT Pelayaran Nusantara Bahari",
    businessType: "Badan Usaha Pelayaran Niaga",
    route: "Bakauheni ➔ Merak",
    activityType: "Bongkar & Muat Penumpang / Kendaraan (Ferry Ro-Ro)",
    dockPreference: "Reguler",
    allocatedDockId: "DOCK-02",
    allocatedDockName: "Dermaga 2",
    eta: "16 Nov 2026, 14:00 WIB",
    etd: "16 Nov 2026, 15:30 WIB",
    slotStartTime: "14:00",
    slotEndTime: "15:30",
    durationHours: 1.5,
    utilities: {
      freshWater: true,
      waterVolume: 35,
      shorePower: false,
      wasteDisposal: true,
    },
    retribusiPP35: {
      tambatCost: 324000,
      labuhCost: 72000,
      waterCost: 980000,
      powerCost: 0,
      wasteCost: 150000,
      totalCost: 1526000,
    },
    status: "ALLOCATED_APPROVED",
    allocatedAt: "16 Nov 2026, 10:15 WIB",
    verifiedBy: "Capt. Ridwan Hakim (Supervisor Jaga Sif 1)",
    documents: {
      seaworthyValid: true,
      tonnageCertValid: true,
      spitValid: true,
      manifestDraftValid: true,
    },
    officerNotes:
      "Alokasi disahkan di Dermaga 2. Sandar lambung kiri setelah alur bebas. Laporkan manifes 60 menit sebelum tiba.",
  },
  {
    id: "REQ-DOCK-2026-085",
    ticketNumber: "REQ-DOCK-2026-085",
    vesselName: "KMP Baruna Jaya",
    callSign: "PK-BJ92",
    gt: 1250,
    loa: 72.5,
    draft: 3.8,
    companyName: "PT Pelayaran Nusantara Bahari",
    businessType: "Badan Usaha Pelayaran Niaga",
    route: "Merak ➔ Bakauheni",
    activityType: "Ferry Ro-Ro Reguler",
    dockPreference: "Reguler",
    allocatedDockId: "DOCK-01",
    allocatedDockName: "Dermaga 1",
    eta: "16 Nov 2026, 08:00 WIB",
    etd: "16 Nov 2026, 10:00 WIB",
    slotStartTime: "08:00",
    slotEndTime: "10:00",
    durationHours: 2.0,
    utilities: {
      freshWater: true,
      waterVolume: 20,
      shorePower: true,
      powerKwh: 50,
      wasteDisposal: true,
    },
    retribusiPP35: {
      tambatCost: 225000,
      labuhCost: 50000,
      waterCost: 560000,
      powerCost: 160000,
      wasteCost: 150000,
      totalCost: 1145000,
    },
    status: "ALLOCATED_APPROVED",
    allocatedAt: "16 Nov 2026, 06:30 WIB",
    verifiedBy: "Capt. Ridwan Hakim (Supervisor Jaga Sif 1)",
    documents: {
      seaworthyValid: true,
      tonnageCertValid: true,
      spitValid: true,
      manifestDraftValid: true,
    },
    officerNotes: "Operasional lancar. Sedang dalam proses pemuatan penumpang.",
  },
  {
    id: "REQ-DOCK-2026-084",
    ticketNumber: "REQ-DOCK-2026-084",
    vesselName: "KM Selat Berkah 02",
    callSign: "PK-SB02",
    gt: 450,
    loa: 38.0,
    draft: 2.1,
    companyName: "Koperasi Jasa Angkutan Laut Selat Sunda",
    businessType: "Koperasi Pelayaran Rakyat",
    route: "Bakauheni ➔ Merak",
    activityType: "Fast Ferry / Speedboat Penumpang",
    dockPreference: "Reguler",
    allocatedDockId: "DOCK-04",
    allocatedDockName: "Dermaga 4",
    eta: "16 Nov 2026, 11:00 WIB",
    etd: "16 Nov 2026, 12:30 WIB",
    slotStartTime: "11:00",
    slotEndTime: "12:30",
    durationHours: 1.5,
    utilities: {
      freshWater: false,
      shorePower: false,
      wasteDisposal: true,
    },
    retribusiPP35: {
      tambatCost: 81000,
      labuhCost: 18000,
      waterCost: 0,
      powerCost: 0,
      wasteCost: 150000,
      totalCost: 249000,
    },
    status: "ALLOCATED_APPROVED",
    allocatedAt: "16 Nov 2026, 08:00 WIB",
    verifiedBy: "Capt. Ridwan Hakim (Supervisor Jaga Sif 1)",
    documents: {
      seaworthyValid: true,
      tonnageCertValid: true,
      spitValid: true,
      manifestDraftValid: true,
    },
    officerNotes: "Sandar di dermaga ponton sisi dalam Dermaga 4.",
  },
];

export default function UptAlokasiPage() {
  const [requests, setRequests] = useState<BerthRequest[]>(INITIAL_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<BerthRequest | null>(null);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState<boolean>(false);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState<boolean>(false);
  const [activeLetterReq, setActiveLetterReq] = useState<BerthRequest | null>(null);

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<"queue" | "matrix">("queue");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dockTypeFilter, setDockTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states in allocation modal
  const [targetDockId, setTargetDockId] = useState<string>("DOCK-02");
  const [customSlotStart, setCustomSlotStart] = useState<string>("14:00");
  const [customSlotEnd, setCustomSlotEnd] = useState<string>("15:30");
  const [confirmFreshWater, setConfirmFreshWater] = useState<boolean>(true);
  const [confirmShorePower, setConfirmShorePower] = useState<boolean>(true);
  const [confirmWaste, setConfirmWaste] = useState<boolean>(true);
  const [inspectorNotes, setInspectorNotes] = useState<string>("");

  // Show Toast Helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Metrics computation
  const pendingCount = requests.filter(
    (r) => r.status === "PENDING_ALLOCATION" || r.status === "READY_FOR_CONFIRMATION"
  ).length;
  const conflictCount = requests.filter((r) => r.status === "SCHEDULE_CONFLICT").length;
  const approvedTodayCount = requests.filter((r) => r.status === "ALLOCATED_APPROVED").length;
  const totalBerths = DOCK_FACILITIES.length;
  const occupiedBerths = DOCK_FACILITIES.filter((d) => d.status === "OCCUPIED").length;
  const berthUtilizationRate = Math.round((occupiedBerths / totalBerths) * 100);

  // Filtered requests
  const filteredRequests = requests.filter((req) => {
    // Status filter
    if (statusFilter === "pending") {
      if (req.status !== "PENDING_ALLOCATION" && req.status !== "READY_FOR_CONFIRMATION")
        return false;
    } else if (statusFilter === "conflict") {
      if (req.status !== "SCHEDULE_CONFLICT") return false;
    } else if (statusFilter === "approved") {
      if (req.status !== "ALLOCATED_APPROVED") return false;
    }

    // Dock type filter
    if (dockTypeFilter !== "all" && req.dockPreference !== dockTypeFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchVessel = req.vesselName.toLowerCase().includes(q);
      const matchTicket = req.ticketNumber.toLowerCase().includes(q);
      const matchCompany = req.companyName.toLowerCase().includes(q);
      const matchCall = req.callSign.toLowerCase().includes(q);
      if (!matchVessel && !matchTicket && !matchCompany && !matchCall) return false;
    }

    return true;
  });

  // Open Allocation Modal
  const handleOpenAllocationModal = (req: BerthRequest) => {
    setSelectedRequest(req);
    // If conflict and has suggestion, use it
    const defaultDock = req.suggestedDockId || req.requestedDockId || req.allocatedDockId || "DOCK-02";
    setTargetDockId(defaultDock);
    setCustomSlotStart(req.slotStartTime || "14:00");
    setCustomSlotEnd(req.slotEndTime || "15:30");
    setConfirmFreshWater(req.utilities.freshWater);
    setConfirmShorePower(req.utilities.shorePower);
    setConfirmWaste(req.utilities.wasteDisposal);
    setInspectorNotes(
      req.officerNotes ||
        "Sandar lambung kiri. Kecepatan olah gerak maksimal 3 knot di alur pelabuhan. Siapkan tali tambat standar SOLAS."
    );
    setIsAllocationModalOpen(true);
  };

  // Submit Official Berth Allocation
  const handleConfirmBerthAllocation = () => {
    if (!selectedRequest) return;

    const chosenDock = DOCK_FACILITIES.find((d) => d.id === targetDockId);
    const dockName = chosenDock ? chosenDock.name : "Dermaga 1";

    setRequests((prev) =>
      prev.map((r) =>
        r.id === selectedRequest.id
          ? {
              ...r,
              status: "ALLOCATED_APPROVED",
              allocatedDockId: targetDockId,
              allocatedDockName: dockName,
              slotStartTime: customSlotStart,
              slotEndTime: customSlotEnd,
              conflictNote: undefined,
              officerNotes: inspectorNotes,
              allocatedAt: "Hari ini, " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
              verifiedBy: "Capt. Ridwan Hakim (Supervisor Jaga Sif 1)",
            }
          : r
      )
    );

    setIsAllocationModalOpen(false);
    triggerToast(
      `Alokasi slot ${dockName} untuk ${selectedRequest.vesselName} (${customSlotStart} - ${customSlotEnd} WIB) berhasil disahkan & diterbitkan!`
    );
  };

  // Quick Resolve Conflict: Reassign to suggested dock
  const handleQuickResolveConflict = (req: BerthRequest) => {
    const suggestedDock = DOCK_FACILITIES.find((d) => d.id === (req.suggestedDockId || "DOCK-03"));
    const dockName = suggestedDock ? suggestedDock.name : "Dermaga 3";

    setRequests((prev) =>
      prev.map((r) =>
        r.id === req.id
          ? {
              ...r,
              status: "ALLOCATED_APPROVED",
              allocatedDockId: suggestedDock?.id || "DOCK-03",
              allocatedDockName: dockName,
              conflictNote: undefined,
              officerNotes: `Slot dialihkan dari Dermaga 2 ke ${dockName} untuk mencegah bentrok antrean kapal. Kelaiklautan terverifikasi.`,
              allocatedAt: "Hari ini, " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
              verifiedBy: "Capt. Ridwan Hakim (Supervisor Jaga Sif 1)",
            }
          : r
      )
    );

    triggerToast(
      `Bentrok diselesaikan! ${req.vesselName} berhasil dialihkan ke ${dockName} (bebas antrean).`
    );
  };

  // Open Letter Modal
  const handleOpenLetterModal = (req: BerthRequest) => {
    setActiveLetterReq(req);
    setIsLetterModalOpen(true);
  };

  // Target Dock Validation Helper in Modal
  const selectedDockData = DOCK_FACILITIES.find((d) => d.id === targetDockId);
  const isGtExceeded = selectedRequest && selectedDockData ? selectedRequest.gt > selectedDockData.maxGT : false;
  const isDraftExceeded = selectedRequest && selectedDockData ? selectedRequest.draft > selectedDockData.depthDraft : false;
  const isLoaExceeded = selectedRequest && selectedDockData ? selectedRequest.loa > selectedDockData.maxLOA : false;

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
              <CalendarCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-[#0B241E]">
                  Meja Persetujuan Sandar & Alokasi Slot Dermaga
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  PORTA Core Berth Desk
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pemeriksaan izin trayek, mitigasi bentrok jadwal slot dermaga, verifikasi bunker & shore power, serta penetapan izin sandar resmi.
              </p>
            </div>
          </div>

          {/* View Mode Switcher Pill */}
          <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl border border-slate-200 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("queue")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "queue"
                  ? "bg-[#0B241E] text-white shadow-xs"
                  : "text-slate-600 hover:text-[#0B241E]"
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Antrean Permohonan ({requests.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("matrix")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "matrix"
                  ? "bg-[#0B241E] text-white shadow-xs"
                  : "text-slate-600 hover:text-[#0B241E]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Matriks Visual Slot Dermaga</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1 */}
          <div className="p-3.5 sm:p-4 bg-[#F8FAFC] rounded-xl border border-slate-200/90 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Menunggu Alokasi
              </span>
              <p className="text-xl sm:text-2xl font-black text-[#D97706] mt-0.5">
                {pendingCount} Permohonan
              </p>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Perlu penetapan slot resmi
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-[#D97706] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
          </div>

          {/* Card 2: Conflict Warning */}
          <div
            onClick={() => setStatusFilter("conflict")}
            className={`p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              conflictCount > 0
                ? "bg-rose-50/70 border-rose-300 hover:border-rose-400 shadow-2xs"
                : "bg-[#F8FAFC] border-slate-200/90"
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700 block">
                  Deteksi Bentrok Jadwal
                </span>
                {conflictCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </div>
              <p className="text-xl sm:text-2xl font-black text-rose-700 mt-0.5">
                {conflictCount} Konflik Slot
              </p>
              <span className="text-[10px] text-rose-600 mt-0.5 block font-medium">
                {conflictCount > 0 ? "Tumpang tindih Dermaga 2 • Klik filter" : "Semua slot bebas bentrok"}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-3.5 sm:p-4 bg-[#F8FAFC] rounded-xl border border-slate-200/90 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Alokasi Disahkan
              </span>
              <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5">
                {approvedTodayCount} Kapal
              </p>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Jadwal sandar terkonfirmasi
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-3.5 sm:p-4 bg-[#F8FAFC] rounded-xl border border-slate-200/90 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Utilisasi Dermaga
              </span>
              <p className="text-xl sm:text-2xl font-black text-[#0B241E] font-mono mt-0.5">
                {berthUtilizationRate}%
              </p>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                {occupiedBerths} dari {totalBerths} dermaga terisi/booking
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <Anchor className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TAB CONTENT: QUEUE OR VISUAL MATRIX                    */}
      {/* ========================================================= */}
      {activeTab === "queue" ? (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama kapal, call sign (PK-..), tiket ID, atau operator pelayaran..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#D97706] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Selector */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === "all"
                      ? "bg-white text-[#0B241E] shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Semua ({requests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("pending")}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    statusFilter === "pending"
                      ? "bg-white text-amber-700 shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Menunggu ({pendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("conflict")}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    statusFilter === "conflict"
                      ? "bg-white text-rose-700 shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Bentrok ({conflictCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("approved")}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    statusFilter === "approved"
                      ? "bg-white text-emerald-700 shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Disetujui ({approvedTodayCount})
                </button>
              </div>

              {/* Dock Type Filter */}
              <select
                value={dockTypeFilter}
                onChange={(e) => setDockTypeFilter(e.target.value)}
                className="text-xs bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:border-[#D97706]"
              >
                <option value="all">Semua Dermaga</option>
                <option value="Reguler">Dermaga Reguler (1-5)</option>
                <option value="Eksekutif">Dermaga Eksekutif (1-2)</option>
              </select>
            </div>
          </div>

          {/* Cards List of Requests */}
          <div className="space-y-3.5">
            {filteredRequests.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <Ship className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700">Tidak ada permohonan yang sesuai filter</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ubah kata kunci pencarian atau reset filter status permohonan di atas.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setDockTypeFilter("all");
                    setSearchQuery("");
                  }}
                  className="mt-4 text-xs font-bold text-[#0B241E] hover:text-[#D97706] underline"
                >
                  Reset Semua Filter
                </button>
              </div>
            ) : (
              filteredRequests.map((req) => {
                const isConflict = req.status === "SCHEDULE_CONFLICT";
                const isApproved = req.status === "ALLOCATED_APPROVED";
                const isReady = req.status === "READY_FOR_CONFIRMATION";
                const isPending = req.status === "PENDING_ALLOCATION";

                return (
                  <div
                    key={req.id}
                    className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                      isConflict
                        ? "border-rose-300 hover:border-rose-400 ring-1 ring-rose-200/50"
                        : isApproved
                        ? "border-slate-200 hover:border-slate-300"
                        : "border-amber-200 hover:border-amber-300 ring-1 ring-amber-100"
                    }`}
                  >
                    {/* Top Ribbon for Conflicts */}
                    {isConflict && (
                      <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-rose-800">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
                          <span className="text-xs font-bold font-mono">
                            PERINGATAN BENTROK JADWAL OTOMATIS:
                          </span>
                          <span className="text-xs text-rose-700">{req.conflictNote}</span>
                        </div>
                        {req.suggestedDockId && (
                          <button
                            type="button"
                            onClick={() => handleQuickResolveConflict(req)}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1 self-start sm:self-auto"
                          >
                            <Sparkles className="w-3 h-3 text-amber-200" />
                            <span>Alihkan Cepat ke {DOCK_FACILITIES.find((d) => d.id === req.suggestedDockId)?.name}</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Main Card Content */}
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Left: Vessel and Company info */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-[#0B241E] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {req.ticketNumber}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <h2 className="text-base font-extrabold text-[#0B241E] flex items-center gap-1.5">
                              <Ship className="w-4 h-4 text-[#D97706]" strokeWidth={2.5} />
                              {req.vesselName}
                            </h2>
                            <span className="font-mono text-xs text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                              {req.callSign}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                req.dockPreference === "Eksekutif"
                                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                                  : "bg-blue-100 text-blue-800 border border-blue-200"
                              }`}
                            >
                              Tipe {req.dockPreference}
                            </span>
                          </div>

                          {/* Company & Route info */}
                          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              <strong className="text-slate-800">{req.companyName}</strong>
                            </span>
                            <span className="flex items-center gap-1 font-mono text-slate-500">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {req.route}
                            </span>
                            <span className="text-slate-400">|</span>
                            <span className="font-mono text-slate-600 font-semibold">
                              {req.gt.toLocaleString("id-ID")} GT • LOA {req.loa}m • Draft {req.draft}m
                            </span>
                          </div>

                          {/* Utilities Request Badge Strip */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-[11px] font-bold text-slate-400 mr-1">
                              Permintaan Utilitas:
                            </span>
                            {req.utilities.freshWater && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-md">
                                <Droplets className="w-3 h-3 text-sky-600" />
                                Air Bersih ({req.utilities.waterVolume} m³)
                              </span>
                            )}
                            {req.utilities.shorePower && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                                <Zap className="w-3 h-3 text-amber-600" />
                                Shore Power ({req.utilities.powerKwh} kWh)
                              </span>
                            )}
                            {req.utilities.wasteDisposal && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                                <Trash2 className="w-3 h-3 text-emerald-600" />
                                Pengelolaan Limbah
                              </span>
                            )}
                            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 ml-auto lg:ml-0">
                              Estimasi PP 35/2023: <strong>Rp {req.retribusiPP35.totalCost.toLocaleString("id-ID")}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Right: Schedule & Action Desk */}
                        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 shrink-0 min-w-[260px]">
                          {/* Schedule block */}
                          <div className="text-left lg:text-right">
                            <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                              Jadwal Slot Waktu
                            </span>
                            <p className="text-xs font-bold text-[#0B241E] flex items-center lg:justify-end gap-1.5 mt-0.5">
                              <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                              {req.eta} s/d {req.slotEndTime} WIB
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Durasi Sandar: <strong>{req.durationHours} Jam</strong>
                            </p>
                          </div>

                          {/* Status Badge & Action buttons */}
                          <div className="flex items-center gap-2 w-full sm:w-auto lg:w-full justify-between lg:justify-end">
                            {isApproved ? (
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    {req.allocatedDockName} Terbit
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleOpenLetterModal(req)}
                                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all"
                                  title="Cetak / Unduh Berita Acara Penetapan Sandar"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenAllocationModal(req)}
                                className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 ${
                                  isConflict
                                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                                    : "bg-[#0B241E] hover:bg-[#133D31] text-white hover:text-[#D97706]"
                                }`}
                              >
                                <span>{isConflict ? "Ubah & Atasi Bentrok" : "Tetapkan Alokasi Dermaga"}</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Notes row if any */}
                      {req.officerNotes && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-500 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/70">
                          <Info className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-700">Catatan Resmi Verifikator UPT: </span>
                            <span>{req.officerNotes}</span>
                            {req.verifiedBy && (
                              <span className="block text-[10px] text-slate-400 mt-0.5 font-mono">
                                Oleh: {req.verifiedBy} • {req.allocatedAt}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* 2B. TAB CONTENT: MATRIKS VISUAL SLOT DERMAGA (24 JAM)     */
        /* ========================================================= */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#0B241E] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D97706]" />
                Matriks Visual Ketersediaan Slot Dermaga Hari Ini (16 Nov 2026)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Visualisasi pemanfaatan slot jam per dermaga. Deteksi otomatis slot tumpang tindih untuk mencegah kemacetan alur sandar.
              </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-600" />
                <span className="text-slate-600 font-medium">Sandar Disetujui</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-400 border border-amber-500" />
                <span className="text-slate-600 font-medium">Menunggu Approval</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500 border border-rose-600 animate-pulse" />
                <span className="text-rose-700 font-bold">Bentrok Jadwal</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300" />
                <span className="text-slate-500">Slot Kosong</span>
              </span>
            </div>
          </div>

          {/* Timeline Hours Header */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[780px]">
              <div className="grid grid-cols-12 gap-1 text-[11px] font-mono text-slate-400 font-bold border-b border-slate-200 pb-2 mb-3 px-2">
                <div className="col-span-3 text-slate-600">FASILITAS DERMAGA</div>
                <div className="col-span-1 text-center">08:00</div>
                <div className="col-span-1 text-center">10:00</div>
                <div className="col-span-1 text-center">12:00</div>
                <div className="col-span-1 text-center">14:00</div>
                <div className="col-span-1 text-center">16:00</div>
                <div className="col-span-1 text-center">18:00</div>
                <div className="col-span-1 text-center">20:00</div>
                <div className="col-span-1 text-center">22:00</div>
                <div className="col-span-1 text-center">24:00</div>
              </div>

              {/* Berth Rows */}
              <div className="space-y-3">
                {DOCK_FACILITIES.map((dock) => {
                  return (
                    <div
                      key={dock.id}
                      className="grid grid-cols-12 gap-1 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200/90 text-xs hover:bg-slate-100/70 transition-all"
                    >
                      {/* Left: Dock Title & Specs */}
                      <div className="col-span-3 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#0B241E]">{dock.name}</span>
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                              dock.type === "Eksekutif"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {dock.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                          Max {dock.maxGT.toLocaleString()} GT • Draft {dock.depthDraft}m LWS
                        </p>
                      </div>

                      {/* 9 Time Slots (08:00 to 24:00) */}
                      <div className="col-span-9 grid grid-cols-9 gap-1 h-11 relative">
                        {/* Custom Rendering for Mock Bookings */}
                        {dock.id === "DOCK-01" && (
                          <>
                            {/* 08:00 - 10:00 Approved KMP Baruna Jaya */}
                            <div className="col-span-2 bg-emerald-600 text-white rounded-lg p-1.5 flex flex-col justify-center shadow-xs overflow-hidden">
                              <span className="font-bold text-[10px] truncate leading-tight">
                                KMP Baruna Jaya
                              </span>
                              <span className="text-[9px] text-emerald-100 font-mono truncate">
                                08:00 - 10:00 (1.250 GT)
                              </span>
                            </div>
                            <div className="col-span-7 bg-white rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                              Tersedia
                            </div>
                          </>
                        )}

                        {dock.id === "DOCK-02" && (
                          <>
                            <div className="col-span-3 bg-white rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                              Tersedia
                            </div>
                            {/* 14:00 - 16:00 Conflict Zone */}
                            <div className="col-span-2 relative">
                              {/* Approved Ship */}
                              <div className="h-full bg-emerald-600 text-white rounded-lg p-1 flex flex-col justify-center shadow-xs overflow-hidden">
                                <span className="font-bold text-[10px] truncate leading-tight">
                                  KMP Mutiara Persada
                                </span>
                                <span className="text-[9px] text-emerald-100 font-mono truncate">
                                  14:00 - 15:30 (1.800 GT)
                                </span>
                              </div>
                              {/* Overlapping Request Overlay */}
                              {conflictCount > 0 && (
                                <div
                                  onClick={() => {
                                    const c = requests.find((r) => r.status === "SCHEDULE_CONFLICT");
                                    if (c) handleOpenAllocationModal(c);
                                  }}
                                  className="absolute -top-1.5 -bottom-1.5 -left-1 -right-1 bg-rose-500/90 hover:bg-rose-600 text-white rounded-lg p-1 border-2 border-white flex flex-col justify-center shadow-md cursor-pointer transition-all animate-pulse z-10"
                                  title="Bentrok terdeteksi! Klik untuk atasi jadwal."
                                >
                                  <span className="font-extrabold text-[9px] flex items-center gap-1 leading-tight">
                                    <AlertTriangle className="w-3 h-3 shrink-0" /> BENTROK: KMP Dharma Rucitra
                                  </span>
                                  <span className="text-[8px] text-rose-100 font-mono truncate">
                                    14:30 - 16:00 (Klik atasi)
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="col-span-4 bg-white rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                              Tersedia
                            </div>
                          </>
                        )}

                        {dock.id === "DOCK-03" && (
                          <div className="col-span-9 bg-emerald-50/60 rounded-lg border border-dashed border-emerald-300 flex items-center justify-center text-[10px] text-emerald-700 font-semibold gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                            <span>Slot Kosong Optimal 14:00 - 24:00 (Direkomendasikan untuk relokasi KMP Dharma Rucitra)</span>
                          </div>
                        )}

                        {dock.id === "DOCK-04" && (
                          <>
                            <div className="col-span-1 bg-white rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                              Tersedia
                            </div>
                            {/* 11:00 - 12:30 KM Selat Berkah 02 */}
                            <div className="col-span-2 bg-emerald-600 text-white rounded-lg p-1.5 flex flex-col justify-center shadow-xs overflow-hidden">
                              <span className="font-bold text-[10px] truncate leading-tight">
                                KM Selat Berkah 02
                              </span>
                              <span className="text-[9px] text-emerald-100 font-mono truncate">
                                11:00 - 12:30 (450 GT)
                              </span>
                            </div>
                            <div className="col-span-6 bg-white rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                              Tersedia
                            </div>
                          </>
                        )}

                        {dock.id === "DOCK-05" && (
                          <div className="col-span-9 bg-white rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                            Tersedia Sepanjang Hari (Cadangan Cuaca Ekstrem / Overhaul)
                          </div>
                        )}

                        {dock.id === "DOCK-EX-01" && (
                          <>
                            <div className="col-span-5 bg-white rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                              Tersedia
                            </div>
                            {/* 18:30 - 20:00 KMP Nusantara Express */}
                            <div className="col-span-2 bg-amber-500 text-white rounded-lg p-1.5 flex flex-col justify-center shadow-xs overflow-hidden">
                              <span className="font-bold text-[10px] truncate leading-tight">
                                KMP Nusantara Express
                              </span>
                              <span className="text-[9px] text-amber-100 font-mono truncate">
                                18:30 - 20:00 (Verifikasi)
                              </span>
                            </div>
                            {/* 21:00 - 23:00 KMP Portlink III */}
                            <div className="col-span-2 bg-amber-500 text-white rounded-lg p-1.5 flex flex-col justify-center shadow-xs overflow-hidden">
                              <span className="font-bold text-[10px] truncate leading-tight">
                                KMP Portlink III
                              </span>
                              <span className="text-[9px] text-amber-100 font-mono truncate">
                                21:00 - 23:00 (5.200 GT)
                              </span>
                            </div>
                          </>
                        )}

                        {dock.id === "DOCK-EX-02" && (
                          <>
                            <div className="col-span-4 bg-emerald-600 text-white rounded-lg p-1.5 flex flex-col justify-center shadow-xs overflow-hidden">
                              <span className="font-bold text-[10px] truncate leading-tight">
                                KMP Sebuku (Reguler Line Eksekutif)
                              </span>
                              <span className="text-[9px] text-emerald-100 font-mono truncate">
                                09:00 - 13:00 (5.500 GT)
                              </span>
                            </div>
                            <div className="col-span-5 bg-white rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                              Tersedia
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. MODAL: PENETAPAN ALOKASI RESMI DERMAGA & UTILITAS      */}
      {/* ========================================================= */}
      {isAllocationModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold shadow-xs">
                  <CalendarCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0B241E]">
                    Meja Verifikasi & Penetapan Alokasi Dermaga
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedRequest.ticketNumber} • {selectedRequest.vesselName} ({selectedRequest.gt.toLocaleString()} GT)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAllocationModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Vessel & Legal Checklist Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-mono uppercase">Operator Pelayaran</span>
                  <strong className="text-slate-800">{selectedRequest.companyName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-mono uppercase">Lintasan Trayek</span>
                  <strong className="text-slate-800 font-mono">{selectedRequest.route}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-mono uppercase">Spesifikasi Armada</span>
                  <strong className="text-slate-800 font-mono">
                    LOA {selectedRequest.loa}m • Draft {selectedRequest.draft}m
                  </strong>
                </div>
              </div>

              {/* Legal Checklist Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Kelaiklautan Sah</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Surat Ukur Valid</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Izin Trayek (SPIT)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Manifes Terunggah</span>
                </div>
              </div>
            </div>

            {/* Berth Assignment Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Penetapan Dermaga Resmi:
                </label>
                <select
                  value={targetDockId}
                  onChange={(e) => setTargetDockId(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#D97706] shadow-2xs"
                >
                  {DOCK_FACILITIES.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.type}) — Kapasitas Max {d.maxGT.toLocaleString()} GT, Draft {d.depthDraft}m LWS
                    </option>
                  ))}
                </select>

                {/* Compatibility Assessment Alerts */}
                {selectedDockData && (
                  <div className="mt-2 space-y-1.5">
                    {isGtExceeded && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Peringatan: Kapasitas kapal ({selectedRequest.gt} GT) melampaui batas aman dermaga ({selectedDockData.maxGT} GT)!</span>
                      </div>
                    )}
                    {isDraftExceeded && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Peringatan Kedalaman: Draft kapal ({selectedRequest.draft}m) melebihi kedalaman kolam dermaga ({selectedDockData.depthDraft}m LWS)!</span>
                      </div>
                    )}
                    {!isGtExceeded && !isDraftExceeded && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          Kompatibilitas Fisik Lolos: Draft {selectedRequest.draft}m aman di kedalaman {selectedDockData.depthDraft}m LWS • GT memenuhi kapasitas {selectedDockData.name}.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Slot Time Picker */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Slot Jam Mulai Sandar:
                  </label>
                  <input
                    type="time"
                    value={customSlotStart}
                    onChange={(e) => setCustomSlotStart(e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#D97706]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Slot Jam Selesai / Bertolak:
                  </label>
                  <input
                    type="time"
                    value={customSlotEnd}
                    onChange={(e) => setCustomSlotEnd(e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#D97706]"
                  />
                </div>
              </div>

              {/* Utilities Confirmation Checklist */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Konfirmasi Kesiapan Utilitas Pelabuhan:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-all">
                    <input
                      type="checkbox"
                      checked={confirmFreshWater}
                      onChange={(e) => setConfirmFreshWater(e.target.checked)}
                      className="rounded border-slate-300 text-[#0B241E] focus:ring-[#D97706]"
                    />
                    <Droplets className="w-4 h-4 text-sky-600" />
                    <span className="text-xs text-slate-700 font-medium">
                      Hydrant Air Bersih: Pasokan {selectedRequest.utilities.waterVolume || 30} m³ telah dikonfirmasi ke regu mekanik dermaga.
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-all">
                    <input
                      type="checkbox"
                      checked={confirmShorePower}
                      onChange={(e) => setConfirmShorePower(e.target.checked)}
                      className="rounded border-slate-300 text-[#0B241E] focus:ring-[#D97706]"
                    />
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span className="text-xs text-slate-700 font-medium">
                      Shore Connection Listrik Darat: Panel breaker siap suplai daya {selectedRequest.utilities.powerKwh || 150} kWh.
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-all">
                    <input
                      type="checkbox"
                      checked={confirmWaste}
                      onChange={(e) => setConfirmWaste(e.target.checked)}
                      className="rounded border-slate-300 text-[#0B241E] focus:ring-[#D97706]"
                    />
                    <Trash2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs text-slate-700 font-medium">
                      Pengelolaan Sampah & Limbah Kapal: Truk penjemputan kebersihan pelabuhan standby.
                    </span>
                  </label>
                </div>
              </div>

              {/* Inspector Official Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Resmi Verifikator UPT untuk Nakhoda / Agen:
                </label>
                <textarea
                  rows={2}
                  value={inspectorNotes}
                  onChange={(e) => setInspectorNotes(e.target.value)}
                  placeholder="Instruksi olah gerak kapal, sisi lambung sandar, atau catatan keselamatan..."
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-[#D97706] font-sans"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setIsAllocationModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleConfirmBerthAllocation}
                disabled={isGtExceeded || isDraftExceeded}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center gap-2 ${
                  isGtExceeded || isDraftExceeded
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-[#0B241E] hover:bg-[#133D31] text-[#D97706] hover:text-white"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Sahkan & Terbitkan Penetapan Sandar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MODAL: BERITA ACARA PENETAPAN SANDAR (SURAT RESMI UPT)  */}
      {/* ========================================================= */}
      {isLetterModalOpen && activeLetterReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#D97706]" />
                <h3 className="text-sm font-extrabold text-[#0B241E]">
                  Surat Penetapan Alokasi Sandar & Izin Masuk Kolam
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLetterModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Letter Paper Body */}
            <div className="p-5 bg-slate-50/90 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-4 font-sans">
              {/* Header Letterhead */}
              <div className="text-center border-b border-slate-300 pb-3">
                <p className="font-black text-sm uppercase text-[#0B241E]">
                  PEMERINTAH PROVINSI / KABUPATEN
                </p>
                <p className="font-bold text-xs uppercase text-slate-600">
                  UNIT PELAKSANA TEKNIS DAERAH (UPTD) PELABUHAN REGIONAL MERAK
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Sistem Informasi Terpadu PORTA • Dasar Hukum: PP No. 35 Tahun 2023
                </p>
              </div>

              {/* Meta information */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block">NO. SURAT PENETAPAN:</span>
                  <span className="font-bold text-slate-900">
                    SK-SANDAR/UPTD-MRK/2026/XI/{activeLetterReq.ticketNumber.replace("REQ-DOCK-", "")}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">TANGGAL PENETAPAN:</span>
                  <span className="font-bold text-slate-900">{activeLetterReq.allocatedAt || "16 Nov 2026"}</span>
                </div>
              </div>

              {/* Vessel detail table */}
              <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Nama Armada:</span>
                  <span className="font-bold text-[#0B241E]">{activeLetterReq.vesselName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Tanda Panggilan (Call Sign):</span>
                  <span className="font-mono font-bold">{activeLetterReq.callSign}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Bobot / Ukuran:</span>
                  <span className="font-mono">
                    {activeLetterReq.gt.toLocaleString()} GT (LOA {activeLetterReq.loa}m / Draft {activeLetterReq.draft}m)
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Badan Usaha / Operator:</span>
                  <span className="font-bold">{activeLetterReq.companyName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Dermaga yang Ditetapkan:</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {activeLetterReq.allocatedDockName || activeLetterReq.requestedDockId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Alokasi Waktu Sandar:</span>
                  <span className="font-mono font-bold text-[#D97706]">
                    {activeLetterReq.slotStartTime} - {activeLetterReq.slotEndTime} WIB
                  </span>
                </div>
              </div>

              {/* Retribution info */}
              <div className="bg-amber-50/60 rounded-xl border border-amber-200 p-3 text-[11px]">
                <span className="font-bold text-amber-900 block mb-1">
                  Ketetapan Retribusi Jasa Kepelabuhanan (PP 35/2023):
                </span>
                <div className="flex justify-between text-slate-600">
                  <span>Jasa Tambat & Labuh:</span>
                  <span className="font-mono font-bold">
                    Rp {(activeLetterReq.retribusiPP35.tambatCost + activeLetterReq.retribusiPP35.labuhCost).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Utilitas (Air, Listrik, Sampah):</span>
                  <span className="font-mono font-bold">
                    Rp {(activeLetterReq.retribusiPP35.waterCost + activeLetterReq.retribusiPP35.powerCost + activeLetterReq.retribusiPP35.wasteCost).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-amber-950 border-t border-amber-200/80 pt-1 mt-1">
                  <span>Total Tagihan (e-SKRD):</span>
                  <span className="font-mono text-xs">
                    Rp {activeLetterReq.retribusiPP35.totalCost.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Instructions & Signature block */}
              <div className="flex justify-between items-end pt-2 text-[10px]">
                <div className="max-w-[240px] text-slate-500">
                  <p className="font-bold text-slate-700">Instruksi Syahbandar:</p>
                  <p className="mt-0.5 leading-relaxed">{activeLetterReq.officerNotes || "Sandar lambung kiri, taati batas olah gerak alur."}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-500">Supervisor Jaga Sif 1,</p>
                  <div className="w-20 h-10 border border-dashed border-emerald-400 bg-emerald-50/60 rounded flex items-center justify-center my-1 mx-auto text-[9px] text-emerald-800 font-mono font-bold">
                    [TERTANDATANGANI DIGITAL]
                  </div>
                  <p className="font-bold text-slate-800">{activeLetterReq.verifiedBy || "Capt. Ridwan Hakim"}</p>
                  <p className="text-slate-400">NIP. 19780812 200312 1 002</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setIsLetterModalOpen(false)}
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
                <span>Cetak Lembar Penetapan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
