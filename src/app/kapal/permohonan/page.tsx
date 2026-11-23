"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Loader2,
  Anchor,
  Info,
  AlertCircle,
  FileSignature,
} from "lucide-react";
import { useKapalStore } from "@/store/kapal.store";
import { useAuthStore } from "@/store/auth.store";
import { usePortStore } from "@/store/port.store";
import { useTariffStore } from "@/store/tariff.store";
import { useBillingStore } from "@/store/billing.store";
import { BillingInvoice } from "@/types/billing.types";
import { BerthType } from "@/types/port.types";
import { ShipType, ShippingCategory } from "@/types/tariff.types";
import { estimateVisitCosts } from "@/lib/tariff-estimator";

// Types
interface DockRequest {
  id: string;
  visitId?: number;
  backendStatus?: string;
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
    labuhFormula?: string;
    tambatFormula?: string;
  };
  officialInvoice?: BillingInvoice | null;
  status: "submitted" | "verified" | "approved" | "rejected";
  statusLabel: string;
  allocatedDock?: string;
  officerNotes?: string;
  submittedAt: string;
}

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
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [selectedDetailReq, setSelectedDetailReq] = useState<DockRequest | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Master fleet for selection dari real backend vessels
  const fleetOptions = useMemo(() => {
    return vessels.map((v) => ({
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
  const [originPort, setOriginPort] = useState<string>("Pelabuhan Dobo");

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

  const activeBerthingContract = useMemo(() => {
    if (!contracts || contracts.length === 0) return null;
    const now = new Date();
    return (
      contracts.find(
        (c) =>
          c.portId === targetPortId &&
          c.status === "ACTIVE" &&
          new Date(c.startDate) <= now &&
          new Date(c.endDate) >= now
      ) || null
    );
  }, [contracts, targetPortId]);

  const hasActiveBerthingContract = Boolean(activeBerthingContract);

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
      setSuccessToast(
        `Estimasi resmi ${estimate.invoiceNumber} berhasil dihitung server (${formatRupiah(
          Number(estimate.totalAmountIdr)
        )})!`
      );
      setTimeout(() => setSuccessToast(null), 6000);
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

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Submit Handler for Step 4 (Menyimpan data langsung ke REST API Backend)
  const handleFinalSubmit = async () => {
    if (!agreementChecked) {
      alert("Harap setujui pakta integritas dan ketentuan estimasi retribusi sebelum mengirim.");
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
      setSuccessToast(`Permohonan ${newVisit.visitNumber} berhasil diajukan ke server backend!`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal mengirim permohonan ke server backend.";
      alert(msg);
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
      {/* Toast Alert */}
      {successToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-fade-in border border-emerald-500">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-white" />
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
            {/* PKS SANDAR GATEKEEPER WARNING BANNER */}
            {!hasActiveBerthingContract && (
              <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#0B241E] text-sm">
                      PKS Sandar Kapal (Kontrak Payung) Belum Aktif
                    </h4>
                    <p className="text-[#475569] text-xs mt-0.5 max-w-2xl">
                      Operator wajib memiliki <strong>Perjanjian Kerja Sama (PKS Sandar)</strong> yang <strong>AKTIF</strong> dan telah disahkan <strong>Kepala Pelabuhan</strong> sebelum mengajukan warta sandar. Pengiriman permohonan dinonaktifkan sampai PKS Sandar disetujui.
                    </p>
                  </div>
                </div>
                <Link
                  href="/kapal/pks-sandar"
                  className="px-4 py-2 bg-[#0B241E] hover:bg-[#143E33] text-white font-bold rounded-xl text-xs shrink-0 inline-flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <FileSignature className="w-4 h-4 text-[#D97706]" />
                  <span>Ajukan PKS Sandar</span>
                </Link>
              </div>
            )}
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
                        <span>Belum Ada Armada Kapal Terdaftar</span>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        Anda belum memiliki armada kapal yang terdaftar di akun ini. Silakan daftarkan master kapal Anda di menu <strong>Profil &amp; Master Kapal</strong> terlebih dahulu agar izin sandar dan estimasi tarif PP No. 35/2023 dapat diproses dengan benar.
                      </p>
                      <Link
                        href="/kapal/profil"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B241E] text-white rounded-lg font-bold text-xs hover:bg-[#143E33] transition-colors"
                      >
                        <span>Daftarkan Armada Kapal Sekarang</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : (
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
                  )}

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
                      <option value="Pelabuhan Dobo">Pelabuhan Dobo (Kepulauan Aru)</option>
                      <option value="Pelabuhan Agats">Pelabuhan Agats (Kabupaten Asmat)</option>
                      <option value="Pelabuhan Merauke">Pelabuhan Merauke (Papua Selatan)</option>
                      <option value="Wilayah Kerja Pomako">Wilayah Kerja Pomako (Lokal)</option>
                      <option value="Pelabuhan Timika Barat">Pelabuhan Timika Barat</option>
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
                      {destinationPortOptions.map((port) => (
                        <option key={port.id} value={port.name}>
                          {port.label}
                        </option>
                      ))}
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

                {/* INFORMASI SOP: PENETAPAN DERMAGA OLEH PETUGAS UPT DERMAGA */}
                <div className="space-y-3 pt-2">
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-3 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center shrink-0 shadow-xs">
                          <Anchor className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-extrabold text-[#0B241E]">
                            Penetapan Dermaga Sandar Dikelola oleh Petugas UPT
                          </h4>
                          <p className="text-[11px] text-[#64748B]">
                            SOP Alokasi Tambat Pelabuhan Poumako • Wewenang Petugas Dermaga
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300 self-start sm:self-auto">
                        <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                        <span>Alokasi Pasca-Verifikasi</span>
                      </span>
                    </div>

                    <p className="text-xs text-[#334155] leading-relaxed">
                      Sesuai Standar Operasional Prosedur (SOP) Pelabuhan Poumako dan tata kelola maritim daerah, operator kapal <strong>tidak memilih dermaga secara mandiri</strong>. Setelah permohonan ini diajukan, <strong>Petugas Dermaga UPT</strong> akan memverifikasi kelaikan kapal serta ketersediaan slot dermaga yang kosong (berth availability) untuk menetapkan alokasi dermaga resmi.
                    </p>

                    {/* Parameter Teknis Kapal yang Dievaluasi Petugas */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#94A3B8] font-bold block uppercase">Panjang Kapal (LOA)</span>
                        <strong className="text-xs font-mono text-[#0B241E]">{activeVessel.loa} Meter</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#94A3B8] font-bold block uppercase">Draft Kedalaman</span>
                        <strong className="text-xs font-mono text-[#0B241E]">{activeVessel.draft} Meter</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#94A3B8] font-bold block uppercase">Bobot Kapal (GT)</span>
                        <strong className="text-xs font-mono text-[#0B241E]">{activeVessel.gt} GT</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#94A3B8] font-bold block uppercase">Status Alokasi Awal</span>
                        <span className="text-[10.5px] font-bold text-amber-700 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Menunggu Petugas</span>
                        </span>
                      </div>
                    </div>

                    {/* Notice Penjelasan */}
                    <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-xl flex items-start gap-2 text-xs text-amber-900">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="leading-snug text-[11.5px]">
                        Status permohonan yang baru diajukan adalah <strong>&ldquo;Menunggu Verifikasi &amp; Alokasi Dermaga&rdquo;</strong>. Petugas Dermaga akan memilih dermaga yang kosong dan hasil penetapan tambat akan otomatis tertera di tiket permohonan Anda.
                      </p>
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
                    <p className="font-bold text-[#0B241E] mt-0.5">
                      {activeBerth?.name || "Ditetapkan Petugas UPT"}
                    </p>
                    <p className="text-[11px] text-[#64748B]">
                      {derivedRoute} • Menunggu Alokasi Resmi
                    </p>
                  </div>
                </div>

                {/* DETAILED COST BREAKDOWN TABLE (LIVE PERDA MIMIKA 4/2023 & PP 35/2023) */}
                <div className="border border-[#CBD5E1] rounded-xl overflow-hidden text-xs">
                  <div className="bg-[#0B241E] px-4 py-2.5 text-white flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-xs flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#D97706]" />
                      <span>Rincian Estimasi Retribusi Kepelabuhanan (Perda 4/2023 &amp; PP 35/2023)</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          costs.isLiveTariff
                            ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30"
                            : "bg-amber-500/20 text-amber-200 border border-amber-400/30"
                        }`}
                      >
                        {costs.isLiveTariff ? "TARIF LIVE SERVER" : "TARIF REFERENSI"}
                      </span>
                      {usdRate && (
                        <button
                          type="button"
                          onClick={() => fetchUsdRate(true)}
                          disabled={isRateLoading}
                          className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[#A0C4B8] cursor-pointer disabled:opacity-50"
                          title={`Kurs USD Live (${usdRate.source}) — klik untuk perbarui`}
                        >
                          <RefreshCw className={`w-3 h-3 ${isRateLoading ? "animate-spin" : ""}`} />
                          <span>1 USD = Rp {usdRate.rate.toLocaleString("id-ID")}</span>
                        </button>
                      )}
                    </div>
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
                <span className="text-[#94A3B8] text-[10px] uppercase font-bold block">Alokasi Penetapan Dermaga</span>
                {selectedDetailReq.allocatedDock?.includes("Menunggu") || selectedDetailReq.status === "submitted" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 mt-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Menunggu verifikasi &amp; alokasi oleh Petugas UPT</span>
                  </span>
                ) : (
                  <p className="font-bold text-emerald-800 flex items-center gap-1.5 mt-1 text-xs">
                    <Anchor className="w-4 h-4 text-[#D97706]" />
                    <span>{selectedDetailReq.allocatedDock}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Rincian Biaya */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[#0B241E]">
                  {selectedDetailReq.officialInvoice
                    ? `Rincian Tagihan Resmi Server (${selectedDetailReq.officialInvoice.invoiceNumber}):`
                    : "Rincian Estimasi Tarif Retribusi (Perda 4/2023):"}
                </span>
                {selectedDetailReq.officialInvoice ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {selectedDetailReq.officialInvoice.billingStage}
                  </span>
                ) : (
                  selectedDetailReq.visitId &&
                  selectedDetailReq.backendStatus &&
                  selectedDetailReq.backendStatus !== "REQUESTED" &&
                  selectedDetailReq.backendStatus !== "CANCELLED" && (
                    <button
                      type="button"
                      disabled={estimatingVisitId === selectedDetailReq.visitId}
                      onClick={() => handleGenerateOfficialEstimate(selectedDetailReq.visitId!)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0B241E] hover:bg-[#143E33] text-white text-[11px] font-bold cursor-pointer disabled:opacity-50"
                    >
                      {estimatingVisitId === selectedDetailReq.visitId ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <DollarSign className="w-3 h-3 text-[#D97706]" />
                      )}
                      <span>Hitung Estimasi Resmi Server</span>
                    </button>
                  )
                )}
              </div>

              <div className="border border-[#CBD5E1] rounded-xl p-3 space-y-1.5 bg-slate-50">
                {selectedDetailReq.officialInvoice?.items &&
                selectedDetailReq.officialInvoice.items.length > 0 ? (
                  selectedDetailReq.officialInvoice.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[#0B241E] font-semibold block">
                          {item.description}
                        </span>
                        {item.formulaNote && (
                          <span className="text-[10px] font-mono text-[#64748B]">
                            {item.formulaNote}
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-[#0B241E] shrink-0">
                        {formatRupiah(Number(item.subtotalIdr))}
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[#64748B] block">Jasa Tambat / Sandar Dermaga:</span>
                        {selectedDetailReq.costBreakdown.tambatFormula && (
                          <span className="text-[10px] font-mono text-[#94A3B8]">
                            {selectedDetailReq.costBreakdown.tambatFormula}
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-[#0B241E] shrink-0">
                        {formatRupiah(selectedDetailReq.costBreakdown.mooring)}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[#64748B] block">Jasa Labuh Perairan:</span>
                        {selectedDetailReq.costBreakdown.labuhFormula && (
                          <span className="text-[10px] font-mono text-[#94A3B8]">
                            {selectedDetailReq.costBreakdown.labuhFormula}
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-[#0B241E] shrink-0">
                        {formatRupiah(selectedDetailReq.costBreakdown.anchorage)}
                      </span>
                    </div>
                    {selectedDetailReq.utilities.freshWater && (
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">
                          Air Bersih ({selectedDetailReq.utilities.waterVolume} m³):
                        </span>
                        <span className="font-mono font-bold text-[#0B241E]">
                          {formatRupiah(selectedDetailReq.costBreakdown.water)}
                        </span>
                      </div>
                    )}
                    {selectedDetailReq.utilities.shorePower && (
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">
                          Listrik Darat Shore Power ({selectedDetailReq.utilities.powerKwh} kWh):
                        </span>
                        <span className="font-mono font-bold text-[#0B241E]">
                          {formatRupiah(selectedDetailReq.costBreakdown.power)}
                        </span>
                      </div>
                    )}
                    {selectedDetailReq.utilities.wasteDisposal && (
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Jasa Pengelolaan Limbah Kapal:</span>
                        <span className="font-mono font-bold text-[#0B241E]">
                          {formatRupiah(selectedDetailReq.costBreakdown.waste)}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between border-t border-[#CBD5E1] pt-2 font-bold text-sm">
                  <span className="text-[#0B241E]">
                    {selectedDetailReq.officialInvoice ? "Total Resmi Server:" : "Total Estimasi:"}
                  </span>
                  <span className="font-mono text-[#0B241E]">
                    {formatRupiah(selectedDetailReq.costBreakdown.total)}
                  </span>
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
