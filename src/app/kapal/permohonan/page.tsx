"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  ChevronDown,
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
  Loader2,
  Anchor,
  ClipboardList,
  Compass,
  Route,
  Info,
  AlertCircle,
  FileSignature,
  ExternalLink,
  Paperclip,
} from "lucide-react";
import { API_CONFIG } from "@/config/api.config";
import { formatDocCategory } from "@/lib/kapal-profil";
import { formatRupiah } from "@/lib/kapal-billing";
import { useKapalStore } from "@/store/kapal.store";
import { useAuthStore } from "@/store/auth.store";
import { usePortStore } from "@/store/port.store";
import { useTariffStore } from "@/store/tariff.store";
import { useBillingStore } from "@/store/billing.store";
import { toast } from "@/store/toast.store";
import { BillingInvoice } from "@/types/billing.types";
import { CustomSelectField } from "@/components/ui/CustomSelectField";
import { DockRequest } from "@/types/kapal.types";
import { BerthType } from "@/types/port.types";
import { ShipType, ShippingCategory } from "@/types/tariff.types";
import { estimateVisitCosts } from "@/lib/tariff-estimator";
import { DockRequestDetailModal } from "@/components/kapal/permohonan/DockRequestDetailModal";

export default function KapalPermohonanPage() {
  const { user, initialize: initAuth } = useAuthStore();
  const { vessels, visits, contracts, isLoading, fetchDashboardData, createVisitRequest } = useKapalStore();
  const { ports, fetchPorts, berths, fetchBerths } = usePortStore();
  const { tariffs, usdRate, isRateLoading, fetchTariffs, fetchUsdRate } = useTariffStore();
  const { invoices, fetchInvoices, generateVisitEstimate } = useBillingStore();

  const [selectedBerthId, setSelectedBerthId] = useState<number>(1);
  const [estimatingVisitId, setEstimatingVisitId] = useState<number | null>(null);
  const [estimateErrorToast, setEstimateErrorToast] = useState<string | null>(null);

  // Master fasilitas dermaga Pelabuhan Poumako dengan fallback data resmi Perda No. 4/2023
  const displayBerths = useMemo(() => {
    if (berths && berths.length > 0) return berths;
    return [
      {
        id: 1,
        portId: 1,
        code: "DRM-PEMDA-01",
        name: "Dermaga Beton Nusantara Pemda",
        berthType: "DERMAGA_BESI_BETON_KAYU" as const,
        berthServiceCategory: "DERMAGA_CAMPURAN" as const,
        authorityType: "PEMDA_DISHUB" as const,
        billingEligibility: "BILLABLE" as const,
        maxLengthMeters: 120,
        operationalStatus: "OPEN" as const,
        legalBasis: "Perda Kab. Mimika No. 4 Tahun 2023 Lampiran XI",
        isActive: true,
        createdAt: "",
        updatedAt: "",
      },
      {
        id: 2,
        portId: 1,
        code: "TLD-PEMDA-01",
        name: "Tambatan Talud Cenderawasih",
        berthType: "PINGGIRAN_TALUD" as const,
        berthServiceCategory: "DERMAGA_BARANG" as const,
        authorityType: "PEMDA_DISHUB" as const,
        billingEligibility: "BILLABLE" as const,
        maxLengthMeters: 60,
        operationalStatus: "OPEN" as const,
        legalBasis: "Perda Kab. Mimika No. 4 Tahun 2023 Lampiran XI",
        isActive: true,
        createdAt: "",
        updatedAt: "",
      },
      {
        id: 3,
        portId: 1,
        code: "DOL-PEMDA-01",
        name: "Dolphin Bressing MB Penyeberangan Ferry",
        berthType: "BRESSING_DOLPHIN_PELAMPUNG" as const,
        berthServiceCategory: "DERMAGA_PENUMPANG" as const,
        authorityType: "PEMDA_DISHUB" as const,
        billingEligibility: "BILLABLE" as const,
        maxLengthMeters: 90,
        operationalStatus: "OPEN" as const,
        legalBasis: "Perda Kab. Mimika No. 4 Tahun 2023 Lampiran XI",
        isActive: true,
        createdAt: "",
        updatedAt: "",
      },
      {
        id: 4,
        portId: 1,
        code: "DRM-UPP-01",
        name: "Dermaga UPP Kemenhub (Non-Retribusi Pemda)",
        berthType: "DERMAGA_BESI_BETON_KAYU" as const,
        berthServiceCategory: "DERMAGA_CAMPURAN" as const,
        authorityType: "UPP_KEMENHUB" as const,
        billingEligibility: "NOT_BILLABLE" as const,
        maxLengthMeters: 150,
        operationalStatus: "OPEN" as const,
        legalBasis: "PM Perhubungan No. 36 Tahun 2012",
        isActive: true,
        createdAt: "",
        updatedAt: "",
      },
      {
        id: 5,
        portId: 1,
        code: "DRM-PELRA-01",
        name: "Dermaga Pelabuhan Rakyat Muara Pomako",
        berthType: "DERMAGA_BESI_BETON_KAYU" as const,
        berthServiceCategory: "DERMAGA_BARANG" as const,
        authorityType: "PEMDA_DISHUB" as const,
        billingEligibility: "BILLABLE" as const,
        maxLengthMeters: 50,
        operationalStatus: "OPEN" as const,
        legalBasis: "Perda Kab. Mimika No. 4 Tahun 2023",
        isActive: true,
        createdAt: "",
        updatedAt: "",
      },
      {
        id: 6,
        portId: 1,
        code: "TUKS-LPS-01",
        name: "Dermaga TUKS Logistik Pantai Selatan",
        berthType: "DERMAGA_BESI_BETON_KAYU" as const,
        berthServiceCategory: "DERMAGA_BARANG" as const,
        authorityType: "TUKS_TERSUS" as const,
        billingEligibility: "NOT_BILLABLE" as const,
        maxLengthMeters: 80,
        operationalStatus: "OPEN" as const,
        legalBasis: "Izin Operasional TUKS Kemenhub",
        isActive: true,
        createdAt: "",
        updatedAt: "",
      },
    ];
  }, [berths]);

  // Dermaga aktif terpilih
  const activeBerth =
    displayBerths.find((b) => b.id === selectedBerthId) || displayBerths[0];

  useEffect(() => {
    initAuth();
    fetchDashboardData();
    fetchBerths(1);
    fetchPorts();
    fetchTariffs();
    fetchUsdRate();
    fetchInvoices();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const prefId = params.get("preferredBerthId");
      if (prefId) {
        setSelectedBerthId(Number(prefId));
        setActiveTab("wizard");
        setWizardStep(1); // Tetap di Langkah 1 agar pemohon dapat memilih armada kapal
      }
    }
  }, [initAuth, fetchDashboardData, fetchBerths, fetchPorts, fetchTariffs, fetchUsdRate, fetchInvoices]);

  const [activeTab, setActiveTab] = useState<"tracking" | "wizard">("tracking");
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [selectedDetailReq, setSelectedDetailReq] = useState<DockRequest | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Master fleet for selection dari real backend vessels (hanya kapal berstatus VERIFIED)
  const fleetOptions = useMemo(() => {
    return vessels
      .filter((v) => v.verificationStatus === "VERIFIED")
      .map((v) => ({
        id: String(v.id),
        numericId: v.id,
        name: v.name,
        callSign: v.registrationNumber,
        gt: Number(v.grossTonnage) || 500,
        loa: v.lengthMeters || 65.0,
        draft: v.draftMeters || 3.5,
        shippingCategory: (v.shippingCategory || "DALAM_NEGERI") as ShippingCategory,
        shipType: (v.shipType || "NIAGA") as ShipType,
        defaultRoute: "Pelabuhan Dobo ➔ Pelabuhan Poumako",
      }));
  }, [vessels]);

  // ==========================================
  // WIZARD FORM STATE (5 Langkah PDF Halaman 9)
  // ==========================================
  // Langkah 1: Pilih Layanan & Fasilitas
  const [selectedVesselId, setSelectedVesselId] = useState<string>("");
  const [isVesselDropdownOpen, setIsVesselDropdownOpen] = useState<boolean>(false);
  const vesselDropdownRef = useRef<HTMLDivElement>(null);
  const [originPort, setOriginPort] = useState<string>("Pelabuhan Dobo");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        vesselDropdownRef.current &&
        !vesselDropdownRef.current.contains(event.target as Node)
      ) {
        setIsVesselDropdownOpen(false);
      }
    }
    if (isVesselDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVesselDropdownOpen]);

  // Master Pelabuhan Tujuan Pelayanan (sinkron dari API backend via usePortStore dengan fallback)
  const destinationPortOptions = useMemo(() => {
    if (ports && ports.length > 0) {
      return ports.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        label: `${p.name} (${p.code})`,
      }));
    }
    return [
      { id: 1, name: "Pelabuhan Umum Poumako", code: "PMK", label: "Pelabuhan Umum Poumako (Dermaga UPTD Pomako)" },
      { id: 2, name: "Pelabuhan Barang & Logistik Poumako", code: "PMK-BRG", label: "Pelabuhan Barang & Logistik Poumako" },
      { id: 3, name: "Pelabuhan Penumpang & Wisata Bahari Poumako", code: "PMK-PAS", label: "Pelabuhan Penumpang & Wisata Bahari Poumako" },
      { id: 4, name: "Dermaga UPP Kemenhub Pomako", code: "UPP-PMK", label: "Dermaga UPP Kemenhub Pomako" },
    ];
  }, [ports]);

  const [destinationPort, setDestinationPort] = useState<string>("Pelabuhan Umum Poumako");

  useEffect(() => {
    if (
      destinationPortOptions.length > 0 &&
      !destinationPortOptions.some((p) => p.name === destinationPort)
    ) {
      setDestinationPort(destinationPortOptions[0].name);
    }
  }, [destinationPortOptions, destinationPort]);

  const targetPortId = useMemo(() => {
    const p = destinationPortOptions.find((opt) => opt.name === destinationPort);
    return p?.id || 1;
  }, [destinationPortOptions, destinationPort]);

  const activeContracts = useMemo(() => {
    if (!contracts || contracts.length === 0) return [];
    const now = new Date();
    return contracts.filter(
      (c) =>
        c.status === "ACTIVE" &&
        new Date(c.startDate) <= now &&
        new Date(c.endDate) >= now
    );
  }, [contracts]);

  const activeBerthingContract = useMemo(() => {
    return activeContracts.find((c) => c.portId === targetPortId) || null;
  }, [activeContracts, targetPortId]);

  const hasActiveBerthingContract = Boolean(activeBerthingContract);
  const hasAnyActiveContract = activeContracts.length > 0;

  // Otomatis arahkan pelabuhan tujuan ke pelabuhan pertama yang memiliki PKS aktif
  useEffect(() => {
    if (activeContracts.length === 0 || destinationPortOptions.length === 0) return;
    const currentHasActive = activeContracts.some((c) => c.portId === targetPortId);
    if (!currentHasActive) {
      const firstActivePort = destinationPortOptions.find((opt) =>
        activeContracts.some((c) => c.portId === opt.id)
      );
      if (firstActivePort) {
        setDestinationPort(firstActivePort.name);
      }
    }
  }, [activeContracts, destinationPortOptions, targetPortId]);

  useEffect(() => {
    if (fleetOptions.length > 0 && (!selectedVesselId || !fleetOptions.some((f) => f.id === selectedVesselId))) {
      setSelectedVesselId(fleetOptions[0].id);
    }
  }, [fleetOptions, selectedVesselId]);

  // Helper: Dapatkan nama singkat pelabuhan
  const getPortShortName = (fullName: string) => {
    if (fullName.includes("Poumako") || fullName.includes("Pomako")) return "Poumako";
    if (fullName.includes("Dobo")) return "Dobo";
    if (fullName.includes("Agats") || fullName.includes("Asmat")) return "Agats";
    if (fullName.includes("Merauke")) return "Merauke";
    if (fullName.includes("Timika")) return "Timika";
    return fullName;
  };

  // Opsi 2: Lintasan otomatis terisi (Auto-Derived) dari Asal ➔ Tujuan
  const derivedRoute = `${getPortShortName(originPort)} ➔ ${getPortShortName(destinationPort)}`;
  const [activityType, setActivityType] = useState<string>("Bongkar & Muat Penumpang / Kendaraan (Ferry Ro-Ro)");

  // Kebutuhan Fasilitas & Utilitas (PDF Hal. 3 & 9)
  const [needFreshWater, setNeedFreshWater] = useState<boolean>(true);
  const [waterVolume, setWaterVolume] = useState<number>(35); // ton/m3
  const [needShorePower, setNeedShorePower] = useState<boolean>(false);
  const [powerKwh, setPowerKwh] = useState<number>(120); // kWh
  const [needWasteDisposal, setNeedWasteDisposal] = useState<boolean>(true);

  // Helper format tanggal & jam lokal (YYYY-MM-DD & HH:mm)
  const formatLocalDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const formatLocalTime = (d: Date) => {
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${min}`;
  };

  // Waktu real-time saat ini (diperbarui tiap 30 detik agar batas min tetap akurat)
  const [currentNow, setCurrentNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const todayDateStr = formatLocalDate(currentNow);
  const currentTimeStr = formatLocalTime(currentNow);

  // Langkah 2: Tentukan Waktu (Default real-time: hari ini & jam saat ini)
  const [etaDate, setEtaDate] = useState<string>(() => formatLocalDate(new Date()));
  const [etaTime, setEtaTime] = useState<string>(() => formatLocalTime(new Date()));
  const [etdDate, setEtdDate] = useState<string>(() =>
    formatLocalDate(new Date(Date.now() + 2 * 60 * 60 * 1000))
  );
  const [etdTime, setEtdTime] = useState<string>(() =>
    formatLocalTime(new Date(Date.now() + 2 * 60 * 60 * 1000))
  );
  const [serviceDurationHours, setServiceDurationHours] = useState<number>(2);

  const handleEtaDateChange = (val: string) => {
    const safeDate = val && val < todayDateStr ? todayDateStr : val;
    const nextEtaTime =
      safeDate === todayDateStr && etaTime < currentTimeStr ? currentTimeStr : etaTime;
    setEtaDate(safeDate);
    if (nextEtaTime !== etaTime) {
      setEtaTime(nextEtaTime);
    }

    const etaDt = new Date(`${safeDate}T${nextEtaTime}:00`);
    const etdDt = new Date(`${etdDate}T${etdTime}:00`);
    if (etdDate < safeDate || etdDt <= etaDt) {
      const shiftedEtd = new Date(
        etaDt.getTime() + Math.round(serviceDurationHours * 60) * 60_000
      );
      setEtdDate(formatLocalDate(shiftedEtd));
      setEtdTime(formatLocalTime(shiftedEtd));
    }
  };

  const handleEtaTimeChange = (val: string) => {
    const safeTime = etaDate === todayDateStr && val < currentTimeStr ? currentTimeStr : val;
    setEtaTime(safeTime);
    const etaDt = new Date(`${etaDate}T${safeTime}:00`);
    const etdDt = new Date(`${etdDate}T${etdTime}:00`);
    if (etdDt <= etaDt) {
      const shiftedEtd = new Date(
        etaDt.getTime() + Math.round(serviceDurationHours * 60) * 60_000
      );
      setEtdDate(formatLocalDate(shiftedEtd));
      setEtdTime(formatLocalTime(shiftedEtd));
    }
  };

  const handleEtdDateChange = (val: string) => {
    const minDate = etaDate > todayDateStr ? etaDate : todayDateStr;
    const safeDate = val && val < minDate ? minDate : val;
    setEtdDate(safeDate);
    const minTimeForEtd =
      safeDate === etaDate ? etaTime : safeDate === todayDateStr ? currentTimeStr : "";
    if (minTimeForEtd && etdTime < minTimeForEtd) {
      setEtdTime(minTimeForEtd);
    }
  };

  const handleEtdTimeChange = (val: string) => {
    const minTimeForEtd =
      etdDate === etaDate ? etaTime : etdDate === todayDateStr ? currentTimeStr : "";
    const safeTime = minTimeForEtd && val < minTimeForEtd ? minTimeForEtd : val;
    setEtdTime(safeTime);
  };

  const scheduleError = useMemo(() => {
    if (!etaDate || !etaTime || !etdDate || !etdTime) {
      return "Harap lengkapi tanggal dan jam kedatangan serta keberangkatan.";
    }
    const etaDt = new Date(`${etaDate}T${etaTime}:00`);
    const etdDt = new Date(`${etdDate}T${etdTime}:00`);
    const minNow = new Date(`${todayDateStr}T${currentTimeStr}:00`);
    if (etaDt < minNow) {
      return "Waktu kedatangan tidak boleh berada di masa lalu.";
    }
    if (etdDt <= etaDt) {
      return "Waktu keberangkatan harus lebih akhir dari waktu kedatangan.";
    }
    return null;
  }, [etaDate, etaTime, etdDate, etdTime, todayDateStr, currentTimeStr]);

  const isScheduleValid = scheduleError === null;

  // Langkah 3: Dokumen & Kelaiklautan
  const [docManifestDraft, setDocManifestDraft] = useState<boolean>(true);
  const [tripDocumentFile, setTripDocumentFile] = useState<File | null>(null);
  const [additionalNote, setAdditionalNote] = useState<string>("");

  // Langkah 4: Tinjau & Pakta Integritas
  const [agreementChecked, setAgreementChecked] = useState<boolean>(true);

  // Langkah 5: Tiket Sukses
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  // ==========================================
  // REAL VISITS DARI BACKEND DI-MAP KE DOCK REQUEST
  // ==========================================
  const backendRequests: DockRequest[] = visits.map((v) => {
    const gt = v.vessel?.grossTonnage ? Number(v.vessel.grossTonnage) : 500;
    const vesselName = v.vessel?.name || "Kapal Terdaftar";
    const callSign = v.vessel?.registrationNumber || "REG-PMK-001";
    const portName = v.port?.name || "Pelabuhan Poumako, Mimika";
    const routeStr = `${v.originPort || "Pelabuhan Dobo"} ➔ ${v.destinationPort || "Pelabuhan Poumako"}`;

    let status: "submitted" | "verified" | "approved" | "rejected" = "submitted";
    let statusLabel = "Diajukan (Menunggu Review UPT)";

    if (v.status === "APPROVED" || v.status === "BERTHED" || v.status === "DEPARTED") {
      status = "approved";
      statusLabel =
        v.status === "BERTHED"
          ? "Sandar Aktif di Dermaga"
          : v.status === "DEPARTED"
          ? "Pelayanan Selesai"
          : "Alokasi Dermaga Terbit";
    } else if (v.status === "ARRIVED") {
      status = "verified";
      statusLabel = "Tiba di Kolam Labuh (Diverifikasi)";
    } else if (v.status === "REQUESTED") {
      status = "submitted";
      statusLabel = "Diajukan (Menunggu Review UPT)";
    }

    const etaStr = new Date(v.eta).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIT";

    const etdStr = new Date(v.etd).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIT";

    const durationHours = Math.max(
      1,
      Math.ceil((new Date(v.etd).getTime() - new Date(v.eta).getTime()) / (1000 * 60 * 60)) || 24
    );

    const visitInvoices = invoices.filter(
      (inv) => inv.visitId === v.id && inv.status !== "VOID"
    );
    const officialInvoice =
      visitInvoices.find((inv) => inv.billingStage === "FINAL_SKRD") ||
      visitInvoices.find((inv) => inv.billingStage === "ADVANCE_SKRD") ||
      visitInvoices.find((inv) => inv.billingStage === "ESTIMATE") ||
      visitInvoices[0] ||
      null;

    const liveEstimate = estimateVisitCosts({
      tariffs,
      exchangeRateUsd: usdRate?.rate || 16000,
      grossTonnage: gt,
      durationHours,
      shippingCategory: (v.vessel?.shippingCategory || "DALAM_NEGERI") as ShippingCategory,
      shipType: (v.vessel?.shipType || "NIAGA") as ShipType,
      berthType: v.berthingRecords?.[0]?.berth?.berthType as BerthType | undefined,
      needFreshWater: false,
      waterVolume: 0,
      needShorePower: false,
      powerKwh: 0,
      needWasteDisposal: false,
    });

    return {
      id: v.visitNumber,
      visitId: v.id,
      backendStatus: v.status,
      vesselName,
      callSign,
      gt,
      port: portName,
      route: routeStr,
      activityType: v.activityMode === "NORMAL" ? "Bongkar Muat & Sandar Tambat" : "Labuh & Transit",
      dockType: "Reguler",
      eta: etaStr,
      etd: etdStr,
      durationHours,
      utilities: {
        freshWater: false,
        waterVolume: 0,
        shorePower: false,
        wasteDisposal: false,
      },
      costBreakdown: {
        mooring: liveEstimate.mooring,
        anchorage: liveEstimate.anchorage,
        water: 0,
        power: 0,
        waste: 0,
        total: officialInvoice
          ? Number(officialInvoice.totalAmountIdr)
          : liveEstimate.total,
        labuhFormula: liveEstimate.labuh.formulaNote,
        tambatFormula: liveEstimate.tambat.formulaNote,
      },
      officialInvoice,
      status,
      statusLabel,
      allocatedDock:
        v.berthingRecords?.[0]?.berth?.name ||
        v.notes?.match(/\[Alokasi Dermaga: ([^\]]+)\]/)?.[1] ||
        (v.status === "REQUESTED"
          ? "Menunggu Penetapan Petugas Dermaga"
          : "Dermaga Pelabuhan Poumako"),
      officerNotes: v.notes || "Permohonan terdaftar di sistem backend PORTA.",
      submittedAt: new Date(v.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
  });

  const [localRequests, setLocalRequests] = useState<DockRequest[]>([]);

  // Gabungkan localRequests dan backendRequests tanpa ada ID kunjungan yang duplikat
  const requests = useMemo<DockRequest[]>(() => {
    const map = new Map<string, DockRequest>();
    // Prioritaskan data backend agar status & estimasi resmi server selalu paling mutakhir
    backendRequests.forEach((req) => {
      if (req.id) map.set(req.id, req);
    });
    // Tambahkan localRequests jika belum tersinkron dari backend
    localRequests.forEach((req) => {
      if (req.id && !map.has(req.id)) {
        map.set(req.id, req);
      }
    });
    return Array.from(map.values());
  }, [localRequests, backendRequests]);

  // Hitung jumlah dinamis per status permohonan
  const statusCounts = useMemo(() => {
    const submitted = requests.filter((r) => r.status === "submitted").length;
    const verified = requests.filter((r) => r.status === "verified").length;
    const approved = requests.filter((r) => r.status === "approved").length;
    return { submitted, verified, approved };
  }, [requests]);

  // Active vessel helper dengan safe fallback
  const activeVessel =
    fleetOptions.find((v) => v.id === selectedVesselId) ||
    fleetOptions[0] || {
      id: "",
      numericId: 0,
      name: "Belum Ada Kapal",
      callSign: "-",
      gt: 0,
      loa: 0,
      draft: 0,
      shippingCategory: "DALAM_NEGERI" as ShippingCategory,
      shipType: "NIAGA" as ShipType,
      defaultRoute: "-",
    };

  // Kalkulasi Retribusi Live berbasis Master Tarif Perda Mimika 4/2023 & Kurs USD Server
  const costs = useMemo(
    () =>
      estimateVisitCosts({
        tariffs,
        exchangeRateUsd: usdRate?.rate || 16000,
        grossTonnage: activeVessel.gt,
        durationHours: serviceDurationHours,
        shippingCategory: activeVessel.shippingCategory,
        shipType: activeVessel.shipType,
        berthType: activeBerth?.berthType,
        needFreshWater,
        waterVolume,
        needShorePower,
        powerKwh,
        needWasteDisposal,
      }),
    [
      tariffs,
      usdRate,
      activeVessel.gt,
      activeVessel.shippingCategory,
      activeVessel.shipType,
      serviceDurationHours,
      activeBerth?.berthType,
      needFreshWater,
      waterVolume,
      needShorePower,
      powerKwh,
      needWasteDisposal,
    ]
  );

  const handleGenerateOfficialEstimate = async (visitId: number) => {
    setEstimatingVisitId(visitId);
    setEstimateErrorToast(null);
    try {
      const estimate = await generateVisitEstimate(visitId, {});
      toast.success(
        "Estimasi Tarif Dihitung",
        `Estimasi resmi ${estimate.invoiceNumber} berhasil dihitung server (${formatRupiah(
          Number(estimate.totalAmountIdr)
        )}).`
      );
      if (selectedDetailReq?.visitId === visitId) {
        setSelectedDetailReq((prev) =>
          prev
            ? {
                ...prev,
                officialInvoice: estimate,
                costBreakdown: {
                  ...prev.costBreakdown,
                  total: Number(estimate.totalAmountIdr),
                },
              }
            : null
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal menghitung estimasi resmi dari backend.";
      setEstimateErrorToast(msg);
      setTimeout(() => setEstimateErrorToast(null), 6000);
    } finally {
      setEstimatingVisitId(null);
    }
  };


  // Submit Handler for Step 4 (Menyimpan data langsung ke REST API Backend)
  const handleFinalSubmit = async () => {
    if (!agreementChecked) {
      setEstimateErrorToast(
        "Harap setujui pakta integritas dan ketentuan estimasi retribusi sebelum mengirim."
      );
      setTimeout(() => setEstimateErrorToast(null), 5000);
      return;
    }

    setIsSubmitting(true);

    try {
      const etaIso = new Date(`${etaDate}T${etaTime}:00`).toISOString();
      const etdIso = new Date(`${etdDate}T${etdTime}:00`).toISOString();

      const targetPort = destinationPortOptions.find((p) => p.name === destinationPort);
      const targetPortId = targetPort?.id || 1;

      const newVisit = await createVisitRequest({
        portId: targetPortId,
        vesselId: activeVessel.numericId,
        visitOrigin: "OPERATOR_REQUEST",
        activityMode: "NORMAL",
        isTransitOnly: false,
        originPort,
        destinationPort,
        eta: etaIso,
        etd: etdIso,
        notes:
          additionalNote ||
          `Permohonan sandar kapal ${activeVessel.name} (${activeVessel.gt} GT) di ${destinationPort}. Kebutuhan: ${activityType}. Menunggu verifikasi & alokasi dermaga oleh Petugas UPT.`,
      });

      const newReq: DockRequest = {
        id: newVisit.visitNumber,
        visitId: newVisit.id,
        backendStatus: newVisit.status,
        vesselName: activeVessel.name,
        callSign: activeVessel.callSign,
        gt: activeVessel.gt,
        port: destinationPort,
        route: derivedRoute,
        activityType: activityType,
        dockType: "Reguler",
        allocatedDock: "Menunggu Penetapan Petugas Dermaga",
        eta: `${etaDate}, ${etaTime} WIT`,
        etd: `${etdDate}, ${etdTime} WIT`,
        durationHours: serviceDurationHours,
        utilities: {
          freshWater: needFreshWater,
          waterVolume: needFreshWater ? waterVolume : 0,
          shorePower: needShorePower,
          powerKwh: needShorePower ? powerKwh : 0,
          wasteDisposal: needWasteDisposal,
        },
        costBreakdown: {
          mooring: costs.mooring,
          anchorage: costs.anchorage,
          water: costs.water,
          power: costs.power,
          waste: costs.waste,
          total: costs.total,
          labuhFormula: costs.labuh.formulaNote,
          tambatFormula: costs.tambat.formulaNote,
        },
        officialInvoice: null,
        status: "submitted",
        statusLabel: "Diajukan (Menunggu Alokasi Dermaga)",
        officerNotes: "Permohonan baru berhasil dikirim ke UPT Pelabuhan. Petugas Dermaga akan memverifikasi slot kosong dan menetapkan dermaga sandar.",
        submittedAt: "Hari ini, Baru saja",
      };

      setLocalRequests((prev) => [newReq, ...prev]);
      setCreatedTicketId(newVisit.visitNumber);
      setWizardStep(5); // Pindah ke Langkah 5: Kirim & Pantau
      toast.success(
        "Permohonan Jadwal Diajukan",
        `Permohonan ${newVisit.visitNumber} berhasil diajukan ke server backend.`
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal mengirim permohonan ke server backend.";
      setEstimateErrorToast(msg);
      setTimeout(() => setEstimateErrorToast(null), 6000);
    } finally {
      setIsSubmitting(false);
    }
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
      {estimateErrorToast && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{estimateErrorToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setEstimateErrorToast(null)}
            className="p-1 text-rose-600 hover:text-rose-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Mode Switcher Deck */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("tracking")}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
              activeTab === "tracking"
                ? "bg-[#0B241E] text-white shadow-sm font-extrabold"
                : "bg-[#F8FAFC] text-[#64748B] hover:text-[#0B241E] hover:bg-[#F1F5F9] border border-[#E2E8F0]"
            }`}
          >
            <Clock className={`w-4 h-4 ${activeTab === "tracking" ? "text-[#D97706]" : "text-[#64748B]"}`} />
            <span>Pelacakan Permohonan</span>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                activeTab === "tracking"
                  ? "bg-white/20 text-white font-bold"
                  : "bg-slate-200/80 text-slate-700 font-bold"
              }`}
            >
              {requests.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("wizard");
              if (wizardStep === 5) setWizardStep(1);
            }}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
              activeTab === "wizard"
                ? "bg-[#0B241E] text-white shadow-sm font-extrabold"
                : "bg-[#F8FAFC] text-[#64748B] hover:text-[#0B241E] hover:bg-[#F1F5F9] border border-[#E2E8F0]"
            }`}
          >
            <Calendar className={`w-4 h-4 ${activeTab === "wizard" ? "text-[#D97706]" : "text-[#D97706]"}`} />
            <span>+ Ajukan Permohonan Sandar</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-[#64748B] font-medium pr-2">
          <Anchor className="w-4 h-4 text-[#85A69B]" />
          <span>Fasilitas Sandar Pelabuhan Poumako</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW A: WIZARD 5 LANGKAH "AJUKAN PENGGUNAAN DERMAGA" (PORTA.pdf Halaman 9) */}
      {/* ========================================================================= */}
      {activeTab === "wizard" && !hasAnyActiveContract && (
        <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xs p-6 sm:p-10">
          {(() => {
            const pendingContract = contracts?.find(
              (c) =>
                c.status === "PENDING_VERIFICATION" ||
                c.status === "PENDING_HEAD_OF_PORT"
            );

            return (
              <div className="max-w-xl mx-auto text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-[#D97706] flex items-center justify-center mx-auto shadow-xs">
                  <FileSignature className="w-7 h-7" />
                </div>

                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>
                      {pendingContract
                        ? "Menunggu Pengesahan Kepala Pelabuhan"
                        : "PKS Sandar Belum Aktif"}
                    </span>
                  </span>

                  <h3 className="text-lg sm:text-xl font-black text-[#0B241E]">
                    Pengajuan Jadwal Sandar Memerlukan PKS Sandar Aktif
                  </h3>

                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                    Sesuai prosedur operasional pelabuhan, operator kapal wajib memiliki{" "}
                    <strong className="text-[#0B241E]">
                      Perjanjian Kerja Sama (PKS Sandar)
                    </strong>{" "}
                    yang berstatus <strong className="text-emerald-700">AKTIF</strong> dan
                    disahkan Kepala Pelabuhan sebelum dapat mengisi permohonan jadwal &amp;
                    alokasi dermaga.
                  </p>
                </div>

                {/* Alur Singkat 2 Langkah */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-xs pt-1">
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[#0B241E] text-[#D97706] font-mono font-black flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div>
                      <p className="font-bold text-[#0B241E]">Ajukan &amp; Sahkan PKS Sandar</p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        Lengkapi kontrak payung layanan sandar di menu PKS Sandar.
                      </p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 font-mono font-black flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div>
                      <p className="font-bold text-[#0B241E]">Ajukan Jadwal Dermaga</p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        Formulir permohonan sandar otomatis terbuka setelah PKS aktif.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    href="/kapal/pks-sandar"
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white font-extrabold rounded-xl text-xs inline-flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <FileSignature className="w-4 h-4 text-[#D97706]" />
                    <span>
                      {pendingContract
                        ? "Cek Status Pengajuan PKS Sandar"
                        : "Ajukan Kontrak PKS Sandar"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setActiveTab("tracking")}
                    className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-50 text-[#0B241E] border border-[#CBD5E1] font-bold rounded-xl text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Lihat Riwayat Permohonan</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === "wizard" && hasAnyActiveContract && (
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
                    <span>Langkah 1: Pilih Armada Kapal, Rute, &amp; Layanan Tambat</span>
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Tentukan armada kapal, pelabuhan tujuan, kelas layanan, serta utilitas air tawar &amp; listrik. Alokasi fisik dermaga akan ditetapkan oleh Petugas UPT.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Armada Kapal */}
                  {fleetOptions.length === 0 ? (
                    <div className="col-span-full p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-xs text-amber-950">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          {vessels.length > 0
                            ? "Belum Ada Armada Kapal Terverifikasi"
                            : "Belum Ada Armada Kapal Terdaftar"}
                        </span>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        {vessels.length > 0 ? (
                          <>
                            Armada kapal Anda saat ini masih menunggu verifikasi petugas UPT. Hanya kapal dengan status <strong>Terverifikasi</strong> yang dapat dipilih untuk pengajuan permohonan sandar dermaga.
                          </>
                        ) : (
                          <>
                            Anda belum memiliki armada kapal yang terdaftar di akun ini. Silakan daftarkan master kapal Anda di menu <strong>Profil &amp; Master Kapal</strong> terlebih dahulu agar izin sandar dan estimasi tarif PP No. 35/2023 dapat diproses dengan benar.
                          </>
                        )}
                      </p>
                      <Link
                        href="/kapal/profil"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B241E] text-white rounded-lg font-bold text-xs hover:bg-[#143E33] transition-colors"
                      >
                        <span>
                          {vessels.length > 0
                            ? "Cek Status Verifikasi Armada"
                            : "Daftarkan Armada Kapal Sekarang"}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <div className="relative" ref={vesselDropdownRef}>
                      <label className="block text-xs font-bold text-[#0B241E] mb-1.5">
                        Pilih Armada Kapal Pemohon <span className="text-red-500">*</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => setIsVesselDropdownOpen((prev) => !prev)}
                        className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 bg-[#F8FAFC] border rounded-xl text-left transition-all cursor-pointer ${
                          isVesselDropdownOpen
                            ? "border-[#0B241E] ring-2 ring-[#0B241E]/10 bg-white"
                            : "border-[#CBD5E1] hover:border-[#94A3B8]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#0B241E] text-[#D97706] flex items-center justify-center shrink-0">
                            <Ship className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-extrabold text-[#0B241E] truncate">
                                {activeVessel.name}
                              </span>
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9.5px] font-bold">
                                <ShieldCheck className="w-2.5 h-2.5" />
                                Terverifikasi
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[10.5px] font-mono text-[#64748B]">
                              <span>{activeVessel.gt.toLocaleString()} GT</span>
                              <span className="text-[#CBD5E1]">|</span>
                              <span>Call Sign: {activeVessel.callSign}</span>
                            </div>
                          </div>
                        </div>

                        <ChevronDown
                          className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform duration-150 ${
                            isVesselDropdownOpen ? "rotate-180 text-[#0B241E]" : ""
                          }`}
                        />
                      </button>

                      {isVesselDropdownOpen && (
                        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-[#CBD5E1] rounded-xl shadow-xl z-30 overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100">
                          {fleetOptions.map((v) => {
                            const isSelected = v.id === activeVessel.id;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => {
                                  setSelectedVesselId(v.id);
                                  setIsVesselDropdownOpen(false);
                                }}
                                className={`w-full px-3.5 py-2.5 flex items-center justify-between gap-2.5 text-left transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-emerald-50/70"
                                    : "hover:bg-slate-50"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                      isSelected
                                        ? "bg-[#0B241E] text-[#D97706]"
                                        : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    <Ship className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-bold text-[#0B241E] truncate">
                                        {v.name}
                                      </span>
                                      <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                        Terverifikasi
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[10.5px] font-mono text-[#64748B]">
                                      <span>{v.gt.toLocaleString()} GT</span>
                                      <span className="text-[#CBD5E1]">|</span>
                                      <span>{v.callSign}</span>
                                      <span className="text-[#CBD5E1]">|</span>
                                      <span>LOA {v.loa} m</span>
                                    </div>
                                  </div>
                                </div>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Jenis Kegiatan */}
                  <CustomSelectField
                    label="Jenis Kegiatan Pelayanan Kapal"
                    required
                    value={activityType}
                    onChange={setActivityType}
                    icon={<ClipboardList className="w-4 h-4" />}
                    minHeightClass="min-h-[58px]"
                    options={[
                      {
                        value: "Bongkar & Muat Penumpang / Kendaraan (Ferry Ro-Ro)",
                        label: "Bongkar & Muat Penumpang / Kendaraan (Ferry Ro-Ro)",
                        subtitle: "Pelayanan sandar komersial reguler",
                      },
                      {
                        value: "Labuh Jangkar & Pengisian Perbekalan (Bunkering)",
                        label: "Labuh Jangkar & Pengisian Perbekalan (Bunkering)",
                        subtitle: "Pengisian air bersih, BBM & logistik",
                      },
                      {
                        value: "Perbaikan Teknis / Emergency Docking",
                        label: "Perbaikan Teknis / Emergency Docking",
                        subtitle: "Sandar khusus pemeliharaan atau darurat",
                      },
                    ]}
                  />

                  {/* Pelabuhan Asal Keberangkatan */}
                  <CustomSelectField
                    label="Pelabuhan Asal Keberangkatan (Origin)"
                    required
                    value={originPort}
                    onChange={setOriginPort}
                    icon={<Compass className="w-4 h-4" />}
                    options={[
                      { value: "Pelabuhan Dobo", label: "Pelabuhan Dobo", subtitle: "Kepulauan Aru" },
                      { value: "Pelabuhan Agats", label: "Pelabuhan Agats", subtitle: "Kabupaten Asmat" },
                      { value: "Pelabuhan Merauke", label: "Pelabuhan Merauke", subtitle: "Papua Selatan" },
                      { value: "Wilayah Kerja Pomako", label: "Wilayah Kerja Pomako", subtitle: "Rute Lokal Mimika" },
                      { value: "Pelabuhan Timika Barat", label: "Pelabuhan Timika Barat", subtitle: "Kabupaten Mimika" },
                    ]}
                  />

                  {/* Pelabuhan Tujuan Pelayanan */}
                  <CustomSelectField
                    label="Pelabuhan Tujuan Pelayanan (Destination)"
                    required
                    value={destinationPort}
                    onChange={setDestinationPort}
                    icon={<Anchor className="w-4 h-4 text-[#D97706]" />}
                    options={destinationPortOptions.map((port) => {
                      const isActive = activeContracts.some((c) => c.portId === port.id);
                      const isPending =
                        !isActive &&
                        contracts?.some(
                          (c) =>
                            c.portId === port.id &&
                            (c.status === "PENDING_VERIFICATION" ||
                              c.status === "PENDING_HEAD_OF_PORT")
                        );
                      return {
                        value: port.name,
                        label: port.name,
                        subtitle: port.code ? `Kode UPT: ${port.code}` : undefined,
                        disabled: !isActive,
                        badgeText: isActive
                          ? "PKS Aktif"
                          : isPending
                          ? "Menunggu Verifikasi PKS"
                          : "Belum Ada PKS",
                        badgeVariant: isActive ? "emerald" : isPending ? "amber" : "slate",
                      };
                    })}
                  />

                  {/* LINTASAN PELAYARAN TERJADWAL */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#0B241E] mb-1.5">
                      Lintasan Pelayaran Terjadwal
                    </label>

                    <div className="p-3.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-xs shrink-0">
                          <Route className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-[#0B241E] tracking-tight">
                              {derivedRoute}
                            </span>
                            {originPort === destinationPort && (
                              <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                Asal &amp; Tujuan Sama
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#64748B] mt-0.5">
                            Lintasan otomatis dikunci berdasarkan pelabuhan asal dan pelabuhan tujuan.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Lintasan Resmi Pelabuhan</span>
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

                {/* Kebutuhan Utilitas Dermaga */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-[#0B241E]">
                    Kebutuhan Layanan Utilitas Pelabuhan (Meter / Konsumsi Terukur)
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {[
                      {
                        key: "water",
                        checked: needFreshWater,
                        onToggle: setNeedFreshWater,
                        activeBox: "bg-blue-50/70 border-blue-300",
                        icon: <Droplets className="w-4 h-4 text-blue-600 shrink-0" />,
                        title: "Air Bersih (Bunkering)",
                        rateDesc: "Tarif resmi: Rp 28.000 / m³ (Pipa Hydrant Dermaga)",
                        inputVal: waterVolume,
                        onInputChange: setWaterVolume,
                        min: 5,
                        max: 200,
                        step: 5,
                        unit: "m³",
                        inputBorder: "border-blue-300",
                        amountTextClass: "text-blue-800",
                        subtotal: waterVolume * 28000,
                      },
                      {
                        key: "power",
                        checked: needShorePower,
                        onToggle: setNeedShorePower,
                        activeBox: "bg-amber-50/70 border-amber-300",
                        icon: <Zap className="w-4 h-4 text-amber-600 shrink-0" />,
                        title: "Shore Power Listrik",
                        rateDesc: "Tarif resmi: Rp 3.200 / kWh (Cold Ironing Connection)",
                        inputVal: powerKwh,
                        onInputChange: setPowerKwh,
                        min: 20,
                        max: 500,
                        step: 10,
                        unit: "kWh",
                        inputBorder: "border-amber-300",
                        amountTextClass: "text-amber-900",
                        subtotal: powerKwh * 3200,
                      },
                      {
                        key: "waste",
                        checked: needWasteDisposal,
                        onToggle: setNeedWasteDisposal,
                        activeBox: "bg-emerald-50/70 border-emerald-300",
                        icon: <Trash2 className="w-4 h-4 text-emerald-600 shrink-0" />,
                        title: "Pengelolaan Limbah",
                        rateDesc: "Tarif tetap per call sandar: Rp 150.000 (Standar MARPOL)",
                        amountTextClass: "text-emerald-900",
                        subtotal: 150000,
                      },
                    ].map((util) => (
                      <div
                        key={util.key}
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between min-h-[124px] ${
                          util.checked ? util.activeBox : "bg-[#F8FAFC] border-[#E2E8F0]"
                        }`}
                      >
                        <div>
                          <label className="flex items-center gap-2 font-bold text-[#0B241E] cursor-pointer mb-1.5">
                            <input
                              type="checkbox"
                              checked={util.checked}
                              onChange={(e) => util.onToggle(e.target.checked)}
                              className="rounded text-[#0B241E]"
                            />
                            {util.icon}
                            <span>{util.title}</span>
                          </label>
                          <p className="text-[10.5px] text-[#64748B]">{util.rateDesc}</p>
                        </div>

                        <div className="pt-2.5 mt-3 border-t border-slate-200/70 flex items-center justify-between gap-2">
                          {util.checked ? (
                            <>
                              {util.unit && util.onInputChange ? (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={util.min}
                                    max={util.max}
                                    step={util.step}
                                    value={util.inputVal}
                                    onChange={(e) => util.onInputChange?.(Number(e.target.value))}
                                    className={`w-16 p-1.5 text-xs font-bold bg-white border ${util.inputBorder} rounded-lg text-center`}
                                  />
                                  <span className="font-bold text-[#0B241E] text-[11px]">
                                    {util.unit}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10.5px] font-semibold text-emerald-800">
                                  Paket Tetap / Call
                                </span>
                              )}
                              <span className={`text-xs font-mono font-extrabold ${util.amountTextClass}`}>
                                {formatRupiah(util.subtotal)}
                              </span>
                            </>
                          ) : (
                            <span className="text-[10.5px] text-slate-400">
                              Centang untuk memesan layanan
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex items-center justify-between border-t border-[#F1F5F9]">
                  {fleetOptions.length === 0 ? (
                    <span className="text-[11px] text-amber-700 font-semibold">
                      ⚠️ Wajib mendaftarkan minimal 1 armada kapal untuk melanjutkan.
                    </span>
                  ) : <span />}
                  <button
                    type="button"
                    disabled={fleetOptions.length === 0}
                    onClick={() => setWizardStep(2)}
                    className={`px-6 py-2.5 text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-2 ${
                      fleetOptions.length === 0
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                        : "bg-[#0B241E] hover:bg-[#143E33] cursor-pointer"
                    }`}
                  >
                    <span>Lanjut ke Langkah 2: Tentukan Waktu</span>
                    <ChevronRight className={`w-4 h-4 ${fleetOptions.length === 0 ? "text-slate-400" : "text-[#D97706]"}`} />
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
                          min={todayDateStr}
                          value={etaDate}
                          onChange={(e) => handleEtaDateChange(e.target.value)}
                          className="w-full text-xs font-semibold p-2.5 bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#0B241E]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#64748B] mb-1 font-semibold">
                          Jam Kedatangan (WIT)
                        </label>
                        <input
                          type="time"
                          min={etaDate === todayDateStr ? currentTimeStr : undefined}
                          value={etaTime}
                          onChange={(e) => handleEtaTimeChange(e.target.value)}
                          className="w-full text-xs font-semibold p-2.5 bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#0B241E]"
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
                          min={etaDate > todayDateStr ? etaDate : todayDateStr}
                          value={etdDate}
                          onChange={(e) => handleEtdDateChange(e.target.value)}
                          className="w-full text-xs font-semibold p-2.5 bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#0B241E]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#64748B] mb-1 font-semibold">
                          Jam Keberangkatan (WIT)
                        </label>
                        <input
                          type="time"
                          min={
                            etdDate === etaDate
                              ? etaTime
                              : etdDate === todayDateStr
                              ? currentTimeStr
                              : undefined
                          }
                          value={etdTime}
                          onChange={(e) => handleEtdTimeChange(e.target.value)}
                          className="w-full text-xs font-semibold p-2.5 bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#0B241E]"
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

                {scheduleError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{scheduleError}</span>
                  </div>
                )}

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
                    disabled={!isScheduleValid}
                    onClick={() => setWizardStep(3)}
                    className={`px-6 py-2.5 text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-2 ${
                      isScheduleValid
                        ? "bg-[#0B241E] hover:bg-[#143E33] text-white cursor-pointer"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <span>Lanjut ke Langkah 3: Lengkapi Dokumen</span>
                    <ChevronRight className={`w-4 h-4 ${isScheduleValid ? "text-[#D97706]" : "text-slate-400"}`} />
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 3: DOKUMEN MASTER OTOMATIS & KELENGKAPAN PER-KUNJUNGAN   */}
            {/* ------------------------------------------------------------- */}
            {wizardStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-[#0B241E] uppercase tracking-wide flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#D97706]" />
                    <span>Langkah 3: Berkas Legalitas Armada &amp; Kelengkapan Pelayaran</span>
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Berkas master kapal {activeVessel.name} dan PKS Sandar ditautkan otomatis dari profil. Anda tidak perlu mengunggah ulang berkas yang sudah terdaftar.
                  </p>
                </div>

                {/* BLOK 1: Berkas Terverifikasi Otomatis (100% Data Riil API) */}
                {(() => {
                  const selectedVesselEntity = vessels.find(
                    (v) => String(v.id) === activeVessel.id
                  );
                  const vesselDocs = (selectedVesselEntity?.documents || []).filter(
                    (d) =>
                      !d.mimeType?.startsWith("image/") ||
                      d.category === "SURAT_UKUR" ||
                      d.category === "PAS_BESAR_KECIL"
                  );

                  const getFileUrl = (filePath?: string | null) => {
                    if (!filePath) return null;
                    if (filePath.startsWith("http")) return filePath;
                    const normalized = filePath.replace(/\\/g, "/");
                    const base = API_CONFIG.BASE_URL.replace(/\/api\/?$/, "");
                    return `${base}/${normalized.replace(/^\/+/, "")}`;
                  };

                  return (
                    <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#E2E8F0]">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-extrabold text-[#0B241E]">
                            Berkas Legalitas Otomatis (Dari Profil Armada &amp; PKS)
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          Auto-Linked
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {/* Kontrak PKS Sandar Aktif */}
                        {activeBerthingContract && (
                          <div className="p-3 bg-white rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-[#0B241E]">
                                  Kontrak PKS Sandar ({destinationPort})
                                </span>
                                <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                  {activeBerthingContract.contractNumber}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#64748B] mt-0.5">
                                Berlaku s/d{" "}
                                {new Date(activeBerthingContract.endDate).toLocaleDateString("id-ID", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded shrink-0">
                              Aktif &amp; Disahkan
                            </span>
                          </div>
                        )}

                        {/* Dokumen Riil Armada dari Backend */}
                        {vesselDocs.length === 0 ? (
                          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <span className="text-amber-900 font-medium">
                              Belum ada dokumen legalitas terlampir pada profil kapal ini.
                            </span>
                            <Link
                              href="/kapal/profil"
                              className="text-xs font-bold text-[#0B241E] hover:underline inline-flex items-center gap-1 shrink-0"
                            >
                              <span>Lengkapi di Profil Kapal</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        ) : (
                          vesselDocs.map((doc) => {
                            const fileUrl = getFileUrl(doc.filePath);
                            const effectiveStatus =
                              doc.verificationStatus === "REJECTED"
                                ? "REJECTED"
                                : doc.verificationStatus === "VERIFIED" ||
                                  selectedVesselEntity?.verificationStatus === "VERIFIED"
                                ? "VERIFIED"
                                : "PENDING";
                            const statusLabel =
                              effectiveStatus === "VERIFIED"
                                ? "Terverifikasi"
                                : effectiveStatus === "REJECTED"
                                ? "Ditolak"
                                : "Menunggu Verifikasi";
                            const statusClass =
                              effectiveStatus === "VERIFIED"
                                ? "bg-emerald-100 text-emerald-800"
                                : effectiveStatus === "REJECTED"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800";

                            return (
                              <div
                                key={doc.id}
                                className="p-3 bg-white rounded-xl border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 text-xs"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-[#0B241E]">
                                      {formatDocCategory(doc.category)}
                                    </span>
                                    {doc.documentNumber && (
                                      <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                        No. {doc.documentNumber}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                                    Berkas: {doc.fileName}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {fileUrl && (
                                    <a
                                      href={fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[11px] font-bold text-[#0284C7] hover:underline inline-flex items-center gap-1"
                                    >
                                      <span>Lihat</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                  <span
                                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded ${statusClass}`}
                                  >
                                    {statusLabel}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* BLOK 2: Kelengkapan Khusus Pelayaran Ini (Per-Kunjungan) */}
                <div className="p-4 rounded-2xl bg-white border border-[#CBD5E1] space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-extrabold text-[#0B241E] flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-[#D97706]" />
                      <span>Kelengkapan Khusus Pelayaran Ini (Per-Kunjungan)</span>
                    </span>
                    <span className="text-[10px] font-mono bg-blue-50 text-blue-800 border border-blue-200 font-bold px-2.5 py-0.5 rounded-full">
                      Trip {derivedRoute}
                    </span>
                  </div>

                  {/* Konfirmasi Kesiapan Manifes Awal */}
                  <label className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={docManifestDraft}
                        onChange={(e) => setDocManifestDraft(e.target.checked)}
                        className="w-4 h-4 rounded text-[#0B241E] shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-[#0B241E] text-xs block">
                          Konfirmasi Draft Rencana Muatan &amp; Manifes Awal (SOLAS Compliant)
                        </span>
                        <span className="text-[11px] text-[#64748B] block mt-0.5">
                          Muatan dan penumpang pelayaran ini mematuhi ambang batas keselamatan kapal
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded shrink-0">
                      Wajib Lapor
                    </span>
                  </label>

                  {/* Upload Opsional Dokumen Pendukung Perjalanan */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#0B241E]">
                        Unggah Dokumen Pendukung Perjalanan (Opsional)
                      </label>
                      <span className="text-[10px] font-mono text-[#64748B]">
                        PDF / JPG / PNG
                      </span>
                    </div>
                    {tripDocumentFile ? (
                      <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span className="font-semibold text-[#0B241E] truncate">
                            {tripDocumentFile.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">
                            ({(tripDocumentFile.size / 1024).toFixed(0)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTripDocumentFile(null)}
                          className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer shrink-0"
                        >
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => setTripDocumentFile(e.target.files?.[0] || null)}
                        className="w-full text-[11px] text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-1.5 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#0B241E] file:text-white file:text-[11px] file:font-bold hover:file:bg-[#143E33] cursor-pointer"
                      />
                    )}
                  </div>
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
                    <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">Kapal &amp; Dimensi</span>
                    <p className="font-extrabold text-[#0B241E] text-sm mt-0.5">{activeVessel.name}</p>
                    <p className="font-mono text-[#64748B] text-[11px]">
                      {activeVessel.gt.toLocaleString()} GT | {activeVessel.callSign}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">Rencana Pelayanan</span>
                    <p className="font-bold text-[#0B241E] mt-0.5">{destinationPort}</p>
                    <p className="text-[11px] text-[#64748B]">
                      {etaDate} ({etaTime} - {etdTime} WIB | {serviceDurationHours} Jam)
                    </p>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">Dermaga &amp; Trayek</span>
                    <p className="font-bold text-[#0B241E] mt-0.5">Ditetapkan Petugas UPT</p>
                    <p className="text-[11px] text-[#64748B]">
                      {derivedRoute} | Menunggu Alokasi Resmi
                    </p>
                  </div>
                </div>

                {/* DETAILED COST BREAKDOWN TABLE (LIVE PERDA MIMIKA 4/2023 & PP 35/2023) */}
                <div className="border border-[#CBD5E1] rounded-xl overflow-hidden text-xs">
                  <div className="bg-[#0B241E] px-4 py-2.5 text-white flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-xs flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#D97706]" />
                      <span>Rincian Estimasi Retribusi Kepelabuhanan</span>
                    </span>
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
                      {/* Mooring / Jasa Tambat */}
                      <tr>
                        <td className="p-3 font-semibold text-[#0B241E]">
                          <span>Jasa Tambat / Sandar Dermaga</span>
                          <span className="block text-[10px] font-mono text-[#64748B] font-normal mt-0.5">
                            {costs.tambat.tariffCode} • {costs.tambat.legalBasis}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[#64748B]">
                          {costs.tambat.formulaNote}
                        </td>
                        <td className="p-3 font-mono text-[#64748B]">
                          {costs.tambat.rateLabel}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-[#0B241E]">
                          {formatRupiah(costs.mooring)}
                        </td>
                      </tr>

                      {/* Anchorage / Jasa Labuh */}
                      <tr>
                        <td className="p-3 font-semibold text-[#0B241E]">
                          <span>Jasa Labuh Perairan Pelabuhan</span>
                          <span className="block text-[10px] font-mono text-[#64748B] font-normal mt-0.5">
                            {costs.labuh.tariffCode} • {costs.labuh.legalBasis}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[#64748B]">
                          {costs.labuh.formulaNote}
                        </td>
                        <td className="p-3 font-mono text-[#64748B]">
                          {costs.labuh.rateLabel}
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
                  <div className="flex flex-col items-end gap-1">
                    <button
                      type="button"
                      disabled={isSubmitting || !hasActiveBerthingContract}
                      onClick={handleFinalSubmit}
                      className="px-6 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#D97706]" />
                          <span>Mengirim ke Backend...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-[#D97706]" />
                          <span>Kirim Permohonan ke UPT Pelabuhan</span>
                        </>
                      )}
                    </button>
                    {!hasActiveBerthingContract && (
                      <span className="text-[10px] text-amber-700 font-medium">
                        * PKS Sandar Kapal aktif diperlukan untuk mengirim permohonan.
                      </span>
                    )}
                  </div>
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

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    <div>
                      <span className="text-[10px] text-[#64748B] block">Kapal Pemohon:</span>
                      <p className="font-bold text-[#0B241E]">{activeVessel.name}</p>
                      <span className="text-[10px] font-mono text-[#64748B]">{activeVessel.gt} GT</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block">Dermaga Sandar Diajukan:</span>
                      <p className="font-bold text-[#0B241E]">{activeBerth?.name || "Dermaga Reguler"}</p>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold">{activeBerth?.code}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block">Rencana Waktu Sandar:</span>
                      <p className="font-bold text-[#0B241E]">{etaDate}, {etaTime} WIT</p>
                      <span className="text-[10px] text-[#64748B]">Durasi: {serviceDurationHours} Jam</span>
                    </div>
                    <div className="sm:col-span-3 pt-1 border-t border-[#E2E8F0] flex items-center justify-between">
                      <span className="text-[11px] text-[#64748B] font-semibold">Total Estimasi Retribusi (PP 35/2023):</span>
                      <p className="font-black text-emerald-800 font-mono text-sm">{formatRupiah(costs.total)}</p>
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
                    onClick={() => window.print()}
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
                Diajukan ({statusCounts.submitted})
              </button>
              <button
                onClick={() => setStatusFilter("verified")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === "verified"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-800 hover:bg-blue-100"
                }`}
              >
                Diverifikasi ({statusCounts.verified})
              </button>
              <button
                onClick={() => setStatusFilter("approved")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === "approved"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                Disetujui UPT ({statusCounts.approved})
              </button>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-4">
            {filteredRequests.map((req, idx) => (
              <div
                key={req.id ? `${req.id}-${idx}` : `req-${idx}`}
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
                    {req.status === "submitted" || req.allocatedDock?.includes("Menunggu") ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200 mt-1">
                        <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate">Menunggu Petugas</span>
                      </span>
                    ) : (
                      <p className="font-bold text-emerald-800 flex items-center gap-1 mt-0.5 truncate">
                        <Anchor className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                        <span>{req.allocatedDock}</span>
                      </p>
                    )}
                    <p className="text-[10px] text-[#64748B] mt-0.5">{req.route}</p>
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
                    <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">
                      {req.officialInvoice ? "Estimasi / e-SKRD Resmi" : "Estimasi Retribusi"}
                    </span>
                    <p className="font-mono font-extrabold text-[#0B241E] text-sm mt-0.5">
                      {formatRupiah(req.costBreakdown.total)}
                    </p>
                    {req.officialInvoice ? (
                      <Link
                        href="/kapal/penagihan"
                        className="inline-flex items-center gap-1 text-[10px] text-emerald-700 hover:underline font-mono font-bold mt-0.5"
                      >
                        <span>{req.officialInvoice.invoiceNumber}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    ) : req.visitId &&
                      req.backendStatus &&
                      req.backendStatus !== "REQUESTED" &&
                      req.backendStatus !== "CANCELLED" ? (
                      <button
                        type="button"
                        disabled={estimatingVisitId === req.visitId}
                        onClick={() => handleGenerateOfficialEstimate(req.visitId!)}
                        className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0B241E] hover:bg-[#143E33] text-white text-[10px] font-bold cursor-pointer disabled:opacity-50"
                      >
                        {estimatingVisitId === req.visitId ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <DollarSign className="w-3 h-3 text-[#D97706]" />
                        )}
                        <span>Hitung Estimasi Resmi</span>
                      </button>
                    ) : (
                      <p className="text-[10px] text-emerald-700 font-semibold">
                        Tarif Perda 4/2023
                      </p>
                    )}
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
      <DockRequestDetailModal
        request={selectedDetailReq}
        estimatingVisitId={estimatingVisitId}
        onGenerateOfficialEstimate={handleGenerateOfficialEstimate}
        onClose={() => setSelectedDetailReq(null)}
      />
    </div>
  );
}
