"use client";

import React, { useState, useEffect } from "react";
import {
  QrCode,
  ScanLine,
  CheckCircle2,
  XCircle,
  Truck,
  Car,
  Bike,
  Wifi,
  WifiOff,
  RotateCw,
  Printer,
  ShieldAlert,
  AlertTriangle,
  Receipt,
  FileCheck2,
  Search,
  Check,
  CreditCard,
  Banknote,
  ArrowRight,
  ShieldCheck,
  User,
  Users,
  Navigation,
  Clock,
  Sparkles,
  RefreshCw,
  Filter,
  Download,
  Eye,
  SlidersHorizontal,
  Volume2,
  VolumeX,
} from "lucide-react";

// =========================================================================
// TYPES & DATA STRUCTURES (PP 35/2023 & Perbup Mimika 25/2024)
// =========================================================================

interface ScannedRecord {
  code: string;
  serialNumber: string; // Seri Porporasi Karcis Bapenda (Lampiran II)
  paxName: string;
  plateNumber?: string;
  category: string;
  golonganKey: string;
  dock: string;
  gateId: string;
  fareAmount: number;
  paymentMethod: "QRIS_ONLINE" | "CASH_LOKET" | "E_MONEY";
  scannedAt: string;
  isDuplicate?: boolean;
}

interface VehicleGolonganRate {
  key: string;
  label: string;
  description: string;
  tarif: number;
  category: "PAX" | "RODA_2" | "RODA_4" | "BUS_TRUK" | "ALAT_BERAT";
  icon: any;
}

const VEHICLE_RATES: Record<string, VehicleGolonganRate> = {
  PAX_D: {
    key: "PAX_D",
    label: "Pejalan Kaki (Dewasa)",
    description: "Pas Masuk perorangan usia > 12 tahun",
    tarif: 8000,
    category: "PAX",
    icon: User,
  },
  PAX_A: {
    key: "PAX_A",
    label: "Pejalan Kaki (Anak)",
    description: "Pas Masuk anak usia 2 - 12 tahun",
    tarif: 5000,
    category: "PAX",
    icon: Users,
  },
  GOL_1: {
    key: "GOL_1",
    label: "Golongan I (Sepeda)",
    description: "Sepeda kayuh / dorong",
    tarif: 10000,
    category: "RODA_2",
    icon: Bike,
  },
  GOL_2: {
    key: "GOL_2",
    label: "Golongan II (Sepeda Motor < 500cc)",
    description: "Sepeda motor bebek / matic roda dua",
    tarif: 25000,
    category: "RODA_2",
    icon: Bike,
  },
  GOL_3: {
    key: "GOL_3",
    label: "Golongan III (Motor Gede / Roda Tiga)",
    description: "Motor sport >= 500cc atau motor roda tiga barang",
    tarif: 45000,
    category: "RODA_2",
    icon: Bike,
  },
  GOL_4A: {
    key: "GOL_4A",
    label: "Golongan IVA (Mobil Pribadi)",
    description: "Kendaraan penumpang sedan/jeep/minibus <= 5 meter",
    tarif: 120000,
    category: "RODA_4",
    icon: Car,
  },
  GOL_4B: {
    key: "GOL_4B",
    label: "Golongan IVB (Mobil Barang Pick-up)",
    description: "Mobil barang bak terbuka / box <= 5 meter",
    tarif: 110000,
    category: "RODA_4",
    icon: Truck,
  },
  GOL_5A: {
    key: "GOL_5A",
    label: "Golongan VA (Bus Sedang)",
    description: "Mobil bus penumpang sedang panjang <= 7 meter",
    tarif: 280000,
    category: "BUS_TRUK",
    icon: Truck,
  },
  GOL_5B: {
    key: "GOL_5B",
    label: "Golongan VB (Truk Sedang)",
    description: "Mobil barang sedang panjang <= 7 meter",
    tarif: 250000,
    category: "BUS_TRUK",
    icon: Truck,
  },
  GOL_6A: {
    key: "GOL_6A",
    label: "Golongan VIA (Bus Besar)",
    description: "Mobil bus penumpang besar panjang <= 10 meter",
    tarif: 450000,
    category: "BUS_TRUK",
    icon: Truck,
  },
  GOL_6B: {
    key: "GOL_6B",
    label: "Golongan VIB (Truk Besar)",
    description: "Mobil barang besar panjang <= 10 meter",
    tarif: 410000,
    category: "BUS_TRUK",
    icon: Truck,
  },
  GOL_7: {
    key: "GOL_7",
    label: "Golongan VII (Truk Tronton / Fuso)",
    description: "Mobil barang tronton/gandengan <= 12 meter",
    tarif: 650000,
    category: "ALAT_BERAT",
    icon: Truck,
  },
  GOL_8: {
    key: "GOL_8",
    label: "Golongan VIII (Trailer / Alat Berat)",
    description: "Mobil alat berat / truk trailer panjang > 12 meter",
    tarif: 950000,
    category: "ALAT_BERAT",
    icon: Truck,
  },
};

// Initial Mock Passage Log
const INITIAL_LOGS: ScannedRecord[] = [
  {
    code: "TK-MRK-2026-904",
    serialNumber: "KRC-MMK-2024-04281",
    paxName: "Hendra Wijaya (4 Penumpang)",
    plateNumber: "B 1409 UPT",
    category: "Golongan IVA (Mobil Pribadi)",
    golonganKey: "GOL_4A",
    dock: "Dermaga 1",
    gateId: "Gate 3 (Mobil Pribadi)",
    fareAmount: 120000,
    paymentMethod: "QRIS_ONLINE",
    scannedAt: "08:42:15 WIB",
  },
  {
    code: "TK-MRK-2026-903",
    serialNumber: "KRC-MMK-2024-04280",
    paxName: "CV Surya Logistik (Supir: M. Rizal)",
    plateNumber: "PA 8812 B",
    category: "Golongan VIB (Truk Besar)",
    golonganKey: "GOL_6B",
    dock: "Dermaga 2",
    gateId: "Gate 4 (Truk Logistik)",
    fareAmount: 410000,
    paymentMethod: "E_MONEY",
    scannedAt: "08:39:50 WIB",
  },
  {
    code: "TK-MRK-2026-902",
    serialNumber: "KRC-MMK-2024-04279",
    paxName: "Ahmad Fauzi",
    plateNumber: "DS 4421 MM",
    category: "Golongan II (Sepeda Motor < 500cc)",
    golonganKey: "GOL_2",
    dock: "Dermaga 1",
    gateId: "Gate 2 (Sepeda Motor)",
    fareAmount: 25000,
    paymentMethod: "CASH_LOKET",
    scannedAt: "08:35:12 WIB",
  },
  {
    code: "TK-MRK-2026-901",
    serialNumber: "KRC-MMK-2024-04278",
    paxName: "Siti Rahmawati",
    category: "Pejalan Kaki (Dewasa)",
    golonganKey: "PAX_D",
    dock: "Dermaga 1",
    gateId: "Turnstile Gate 1 (Pejalan Kaki)",
    fareAmount: 8000,
    paymentMethod: "QRIS_ONLINE",
    scannedAt: "08:30:04 WIB",
  },
];

export default function UptTiketPage() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"gate" | "pos" | "history">("gate");

  // Resilience & Offline Mode
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(2);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Barrier Gate State
  const [gateBarrierStatus, setGateBarrierStatus] = useState<"CLOSED" | "OPEN">("CLOSED");
  const [barrierCountdown, setBarrierCountdown] = useState<number>(0);

  // Scanner Simulator State
  const [inputCode, setInputCode] = useState<string>("TK-MRK-2026-905");
  const [selectedGate, setSelectedGate] = useState<string>("Gate 3 (Mobil Pribadi)");
  const [scanResult, setScanResult] = useState<{
    status: "idle" | "valid" | "duplicate" | "invalid";
    message: string;
    details?: ScannedRecord;
  }>({
    status: "idle",
    message: "Arahkan barcode scanner / kamera ke QR E-Ticket atau masukkan kode tiket di bawah.",
  });

  // Database of Scanned Tickets (Anti-Passback)
  const [scannedTickets, setScannedTickets] = useState<Record<string, ScannedRecord>>({
    "TK-MRK-2026-880": {
      code: "TK-MRK-2026-880",
      serialNumber: "KRC-MMK-2024-04190",
      paxName: "Yohanis Kogoya",
      category: "Pejalan Kaki (Dewasa)",
      golonganKey: "PAX_D",
      dock: "Dermaga 1",
      gateId: "Turnstile Gate 1",
      fareAmount: 8000,
      paymentMethod: "QRIS_ONLINE",
      scannedAt: "Hari ini, 07:15:20 WIB",
      isDuplicate: true,
    },
  });

  // Recent Passage Log
  const [passageLogs, setPassageLogs] = useState<ScannedRecord[]>(INITIAL_LOGS);
  const [searchLog, setSearchLog] = useState<string>("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");

  // POS Loket Kasir State (Tab 2)
  const [selectedGol, setSelectedGol] = useState<string>("GOL_4A");
  const [posPlateNumber, setPosPlateNumber] = useState<string>("B 2026 UPT");
  const [posPaxName, setPosPaxName] = useState<string>("Budi Santoso");
  const [posCashGiven, setPosCashGiven] = useState<number>(150000);
  const [posPaymentMethod, setPosPaymentMethod] = useState<"CASH" | "QRIS">("CASH");
  const [posReceiptModal, setPosReceiptModal] = useState<ScannedRecord | null>(null);

  // Countdown timer for automatic barrier gate closing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gateBarrierStatus === "OPEN" && barrierCountdown > 0) {
      timer = setTimeout(() => {
        setBarrierCountdown((prev) => prev - 1);
      }, 1000);
    } else if (gateBarrierStatus === "OPEN" && barrierCountdown === 0) {
      setGateBarrierStatus("CLOSED");
    }
    return () => clearTimeout(timer);
  }, [gateBarrierStatus, barrierCountdown]);

  // Trigger Open Barrier
  const triggerBarrierOpen = () => {
    setGateBarrierStatus("OPEN");
    setBarrierCountdown(5); // Auto-close in 5 seconds
  };

  // Perform Scan on Gate
  const handlePerformScan = (codeToScan: string) => {
    const code = codeToScan.trim().toUpperCase();
    if (!code) return;

    const nowStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " WIB";

    // 1. Check Anti-Passback Duplicate
    if (scannedTickets[code]) {
      setScanResult({
        status: "duplicate",
        message: "AKSES DITOLAK: TIKET GANDA (ANTI-PASSBACK TERDETEKSI)",
        details: scannedTickets[code],
      });
      setGateBarrierStatus("CLOSED");
      return;
    }

    // 2. Validate Ticket Prefix
    if (code.startsWith("TK-") || code.startsWith("QR-") || code.startsWith("KRC-")) {
      const serialNum = `KRC-MMK-2024-${String(Math.floor(Math.random() * 90000) + 10000)}`;
      const randomRate = VEHICLE_RATES[selectedGol] || VEHICLE_RATES["GOL_4A"];

      const newRecord: ScannedRecord = {
        code,
        serialNumber: serialNum,
        paxName: "Pemegang E-Ticket Terdaftar",
        plateNumber: code.includes("MRK") ? "B " + Math.floor(Math.random() * 8999 + 1000) + " UPT" : undefined,
        category: randomRate.label,
        golonganKey: randomRate.key,
        dock: "Dermaga 1",
        gateId: selectedGate,
        fareAmount: randomRate.tarif,
        paymentMethod: "QRIS_ONLINE",
        scannedAt: nowStr,
      };

      setScannedTickets((prev) => ({ ...prev, [code]: newRecord }));
      setPassageLogs((prev) => [newRecord, ...prev]);

      setScanResult({
        status: "valid",
        message: "VALID - SILAKAN MASUK (PALANG PINTU GERBANG TERBUKA)",
        details: newRecord,
      });

      triggerBarrierOpen();

      if (isOfflineMode) {
        setOfflineQueueCount((prev) => prev + 1);
      }
    } else {
      setScanResult({
        status: "invalid",
        message: "TIKET TIDAK TERDAFTAR / BARCODE PALSU (PERIKSA KE LOKET)",
      });
      setGateBarrierStatus("CLOSED");
    }
  };

  // Quick Preset Simulator Click
  const handlePresetScan = (presetType: "valid_car" | "valid_pax" | "duplicate" | "invalid") => {
    if (presetType === "valid_car") {
      const randomCode = `TK-MRK-2026-${Math.floor(Math.random() * 800) + 200}`;
      setInputCode(randomCode);
      handlePerformScan(randomCode);
    } else if (presetType === "valid_pax") {
      const randomCode = `TK-MRK-2026-${Math.floor(Math.random() * 800) + 200}`;
      setSelectedGol("PAX_D");
      setInputCode(randomCode);
      handlePerformScan(randomCode);
    } else if (presetType === "duplicate") {
      setInputCode("TK-MRK-2026-880");
      handlePerformScan("TK-MRK-2026-880");
    } else if (presetType === "invalid") {
      setInputCode("FAKE-CODE-999");
      handlePerformScan("FAKE-CODE-999");
    }
  };

  // Issue Ticket from POS Counter (Tab 2)
  const handleIssuePOSPass = () => {
    const rate = VEHICLE_RATES[selectedGol];
    if (!rate) return;

    if (rate.category !== "PAX" && !posPlateNumber.trim()) {
      alert("Harap masukkan nomor polisi kendaraan.");
      return;
    }

    const nowStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " WIB";
    const newCode = `TK-MRK-2026-${Math.floor(Math.random() * 8999) + 1000}`;
    const newSerial = `KRC-MMK-2024-${Math.floor(Math.random() * 89999) + 10000}`;

    const newPass: ScannedRecord = {
      code: newCode,
      serialNumber: newSerial,
      paxName: posPaxName || "Pengguna Jasa Pelabuhan",
      plateNumber: rate.category !== "PAX" ? posPlateNumber.toUpperCase() : undefined,
      category: rate.label,
      golonganKey: rate.key,
      dock: "Dermaga 1",
      gateId: "Loket Kasir Gerbang Barat",
      fareAmount: rate.tarif,
      paymentMethod: posPaymentMethod === "CASH" ? "CASH_LOKET" : "QRIS_ONLINE",
      scannedAt: nowStr,
    };

    setPassageLogs((prev) => [newPass, ...prev]);
    setScannedTickets((prev) => ({ ...prev, [newCode]: newPass }));
    setPosReceiptModal(newPass);

    if (isOfflineMode) {
      setOfflineQueueCount((prev) => prev + 1);
    }
  };

  // Sync Offline Queue
  const handleSyncOffline = () => {
    alert(`Sinkronisasi Berhasil!\n${offlineQueueCount} transaksi offline di buffer lokal telah divalidasi ke basis data pusat PORTA.`);
    setOfflineQueueCount(0);
  };

  // Format IDR
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filtered Logs
  const filteredLogs = passageLogs.filter((log) => {
    const matchSearch =
      log.code.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.serialNumber.toLowerCase().includes(searchLog.toLowerCase()) ||
      (log.plateNumber && log.plateNumber.toLowerCase().includes(searchLog.toLowerCase())) ||
      log.paxName.toLowerCase().includes(searchLog.toLowerCase());

    const matchCategory =
      selectedCategoryFilter === "ALL" ||
      (selectedCategoryFilter === "PAX" && log.category.includes("Pejalan Kaki")) ||
      (selectedCategoryFilter === "VEHICLE" && !log.category.includes("Pejalan Kaki"));

    return matchSearch && matchCategory;
  });

  const totalRevenue = passageLogs.reduce((acc, curr) => acc + curr.fareAmount, 0);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP OPERATIONAL STATUS & RESILIENCE MODE BANNER                       */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-xs transition-colors ${
              isOfflineMode ? "bg-amber-600" : "bg-[#0B241E]"
            }`}
          >
            {isOfflineMode ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5 text-[#D97706]" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-[#0B241E]">
                Status Kontrol Gerbang: {isOfflineMode ? "Mode Offline (Blind Spot)" : "Online (Sinkronisasi Host-to-Host)"}
              </h2>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                  isOfflineMode ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {isOfflineMode ? "BUFFER LOKAL AKTIF" : "TERKONEKSI SERVER"}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              {isOfflineMode
                ? "Sinyal dermaga terputus. Validasi tetap berjalan menggunakan memori lokal tablet tanpa macet."
                : "Seluruh pemindaian tiket dan karcis terhubung real-time ke sistem Bapenda & Syahbandar UPTD."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isOfflineMode && offlineQueueCount > 0 && (
            <button
              type="button"
              onClick={handleSyncOffline}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Sinkronkan {offlineQueueCount} Data Lokal</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 border border-[#CBD5E1] rounded-lg text-[#64748B] hover:text-[#0B241E] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            title={soundEnabled ? "Nonaktifkan Suara Gate" : "Aktifkan Suara Gate"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-700" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            type="button"
            onClick={() => setIsOfflineMode(!isOfflineMode)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
              isOfflineMode
                ? "bg-[#0B241E] text-white border-[#0B241E]"
                : "bg-[#F8FAFC] text-[#475569] border-[#CBD5E1] hover:bg-[#F1F5F9]"
            }`}
          >
            {isOfflineMode ? "Pulihkan ke Online" : "Simulasi Blind Spot (Offline)"}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. OPERATIONAL KPI SUMMARY CARDS (PERBUP 25/2024 & PP 35/2023)           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Total Pelintasan Sif 1
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-2">
            {passageLogs.length + 1120} <span className="text-xs font-sans font-normal text-[#64748B]">Karcis / Pass</span>
          </p>
          <p className="text-[11px] text-[#64748B] mt-1 flex items-center gap-1">
            <span className="text-emerald-700 font-bold">100% Tercatat</span> di buku register Bapenda
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Total Retribusi Pas Masuk
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-[#0B241E] font-mono mt-2">
            {formatRupiah(totalRevenue + 42850000)}
          </p>
          <p className="text-[11px] text-[#64748B] mt-1">
            Akumulasi Retribusi Daerah (PP 35/2023)
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Status Barrier Gate
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              gateBarrierStatus === "OPEN" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold font-mono mt-2 flex items-center gap-2">
            {gateBarrierStatus === "OPEN" ? (
              <span className="text-emerald-700 flex items-center gap-1.5">
                TERBUKA ({barrierCountdown}s)
              </span>
            ) : (
              <span className="text-rose-700">TERTUTUP (AMAN)</span>
            )}
          </p>
          <p className="text-[11px] text-[#64748B] mt-1">
            Sensor palang pintu otomatis gerbang 1-4
          </p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Anti-Passback Guard
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-amber-700 font-mono mt-2">
            1 Kasus <span className="text-xs font-sans font-normal text-[#64748B]">Tertolak</span>
          </p>
          <p className="text-[11px] text-[#64748B] mt-1">
            Pencegahan tiket ganda / dipakai ulang
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. NAVIGATION TABS                                                        */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("gate")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "gate"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0B241E] hover:bg-white"
          }`}
        >
          <ScanLine className="w-4 h-4 text-[#D97706]" />
          <span>Pos Gerbang Masuk & Auto-Scanner</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pos")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "pos"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0B241E] hover:bg-white"
          }`}
        >
          <Receipt className="w-4 h-4 text-[#D97706]" />
          <span>Loket Kasir & Cetak Karcis Porporasi (Lampiran II)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "history"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0B241E] hover:bg-white"
          }`}
        >
          <Clock className="w-4 h-4 text-[#D97706]" />
          <span>Buku Log Pelintasan & Audit Anti-Passback ({passageLogs.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: POS GERBANG MASUK & QR SCANNER                                     */}
      {/* ========================================================================= */}
      {activeTab === "gate" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Column Left: Visual Scanner & Presets (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-[#D97706]" />
                <h3 className="text-sm font-extrabold text-[#0B241E]">
                  Kamera Pemindai E-Ticket Gerbang Masuk
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-bold text-[#64748B]">Pintu Gate:</label>
                <select
                  value={selectedGate}
                  onChange={(e) => setSelectedGate(e.target.value)}
                  className="text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-2.5 py-1 font-bold text-[#0B241E] focus:outline-none"
                >
                  <option>Gate 1 (Turnstile Pejalan Kaki)</option>
                  <option>Gate 2 (Sepeda Motor)</option>
                  <option>Gate 3 (Mobil Pribadi)</option>
                  <option>Gate 4 (Truk Logistik)</option>
                </select>
              </div>
            </div>

            {/* Visual Camera Scanner Frame */}
            <div className="bg-[#0B241E] rounded-2xl p-6 text-center text-white relative overflow-hidden flex flex-col items-center justify-center min-h-[240px] shadow-inner">
              {/* Animated Scan Beam */}
              <div className="w-56 h-40 border-2 border-[#D97706] rounded-xl relative flex items-center justify-center bg-black/40 shadow-2xl">
                <div className="w-full h-1 bg-[#D97706] animate-bounce shadow-[0_0_15px_#D97706]" />
                <QrCode className="w-20 h-20 text-white/20 absolute pointer-events-none" />
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#D97706]" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#D97706]" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#D97706]" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#D97706]" />
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs font-mono text-[#85A69B]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Kamera Aktif • Resolusi 1080p • Autofocus On</span>
              </div>
            </div>

            {/* Manual Code Input Bar */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0B241E]">
                Masukkan Kode Tiket / Barcode Scanner Gun:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePerformScan(inputCode)}
                    placeholder="Contoh: TK-MRK-2026-905"
                    className="w-full text-xs font-mono p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-bold text-[#0B241E] focus:outline-none focus:border-[#0B241E] focus:bg-white pl-10"
                  />
                  <QrCode className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                </div>
                <button
                  type="button"
                  onClick={() => handlePerformScan(inputCode)}
                  className="px-5 py-3 bg-[#0B241E] hover:bg-[#143E33] text-white rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-xs transition-colors shrink-0"
                >
                  <ScanLine className="w-4 h-4 text-[#D97706]" />
                  <span>Pindai Tiket</span>
                </button>
              </div>
            </div>

            {/* Quick Test Presets (Testing Shortcuts) */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
                Simulasi Uji Cepat (Testing Presets):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handlePresetScan("valid_car")}
                  className="p-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition-colors cursor-pointer text-left flex flex-col justify-between"
                >
                  <span className="flex items-center gap-1 font-extrabold">
                    <Car className="w-3.5 h-3.5 text-emerald-700" /> Mobil Sah
                  </span>
                  <span className="text-[10px] text-emerald-600 mt-1">TK-MRK (Gol IVA)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetScan("valid_pax")}
                  className="p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold border border-blue-200 transition-colors cursor-pointer text-left flex flex-col justify-between"
                >
                  <span className="flex items-center gap-1 font-extrabold">
                    <User className="w-3.5 h-3.5 text-blue-700" /> Pejalan Kaki
                  </span>
                  <span className="text-[10px] text-blue-600 mt-1">TK-MRK (Dewasa)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetScan("duplicate")}
                  className="p-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200 transition-colors cursor-pointer text-left flex flex-col justify-between"
                >
                  <span className="flex items-center gap-1 font-extrabold">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-700" /> Tiket Ganda
                  </span>
                  <span className="text-[10px] text-rose-600 mt-1">Anti-Passback</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetScan("invalid")}
                  className="p-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 transition-colors cursor-pointer text-left flex flex-col justify-between"
                >
                  <span className="flex items-center gap-1 font-extrabold">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> Barcode Palsu
                  </span>
                  <span className="text-[10px] text-amber-600 mt-1">Tak Terdaftar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Column Right: Scan Result & Barrier Gate Feedback (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Barrier Gate Physical Indicator */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <h4 className="text-xs font-extrabold text-[#0B241E] uppercase tracking-wider">
                  Status Palang Pintu Fisik
                </h4>
                <span className="text-[10px] font-mono text-[#64748B]">Otomatis Servo</span>
              </div>

              <div className="mt-4 flex flex-col items-center justify-center p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 ${
                    gateBarrierStatus === "OPEN"
                      ? "bg-emerald-600 scale-105 shadow-emerald-200"
                      : "bg-rose-600 shadow-rose-200"
                  }`}
                >
                  {gateBarrierStatus === "OPEN" ? (
                    <CheckCircle2 className="w-10 h-10" />
                  ) : (
                    <XCircle className="w-10 h-10" />
                  )}
                </div>

                <h4 className="text-base font-extrabold text-[#0B241E] mt-3">
                  {gateBarrierStatus === "OPEN" ? "PALANG TERBUKA" : "PALANG TERTUTUP"}
                </h4>
                <p className="text-xs text-[#64748B] mt-1 max-w-xs">
                  {gateBarrierStatus === "OPEN"
                    ? `Kendaraan dipersilakan melintas masuk menuju dermaga. Palang akan tertutup otomatis dalam ${barrierCountdown} detik.`
                    : "Menunggu pemindaian tiket sah atau verifikasi kasir loket."}
                </p>

                {gateBarrierStatus === "OPEN" && (
                  <div className="mt-3 w-full bg-emerald-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full transition-all duration-1000 ease-linear"
                      style={{ width: `${(barrierCountdown / 5) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Scan Result Feedback Card */}
            <div
              className={`p-5 rounded-xl border text-xs transition-all shadow-xs ${
                scanResult.status === "valid"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                  : scanResult.status === "duplicate"
                  ? "bg-rose-50 border-rose-300 text-rose-950"
                  : scanResult.status === "invalid"
                  ? "bg-amber-50 border-amber-300 text-amber-950"
                  : "bg-white border-[#E2E8F0] text-[#64748B]"
              }`}
            >
              <div className="flex items-start gap-3">
                {scanResult.status === "valid" && <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />}
                {scanResult.status === "duplicate" && <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />}
                {scanResult.status === "invalid" && <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />}
                {scanResult.status === "idle" && <QrCode className="w-6 h-6 text-[#64748B] shrink-0 mt-0.5" />}

                <div className="flex-1">
                  <p className="font-extrabold text-sm leading-tight">{scanResult.message}</p>

                  {scanResult.details && (
                    <div className="mt-3.5 space-y-2 text-xs bg-white/70 p-3.5 rounded-lg border border-black/5">
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Kode E-Ticket:</span>
                        <strong className="font-mono text-[#0B241E]">{scanResult.details.code}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Seri Porporasi:</span>
                        <span className="font-mono text-emerald-800 font-bold">{scanResult.details.serialNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Kategori:</span>
                        <strong className="text-[#0B241E]">{scanResult.details.category}</strong>
                      </div>
                      {scanResult.details.plateNumber && (
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Plat Nomor:</span>
                          <span className="font-mono bg-[#0B241E] text-white font-bold px-2 py-0.5 rounded text-[11px]">
                            {scanResult.details.plateNumber}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Tarif Retribusi:</span>
                        <strong className="text-[#0B241E] font-mono">{formatRupiah(scanResult.details.fareAmount)}</strong>
                      </div>
                      <div className="flex justify-between border-t border-black/5 pt-2">
                        <span className="text-[#64748B]">Waktu Tap:</span>
                        <span className="font-mono text-[#0B241E]">{scanResult.details.scannedAt}</span>
                      </div>

                      {scanResult.status === "duplicate" && (
                        <div className="mt-2 p-2 bg-rose-100 rounded text-rose-800 text-[11px] font-bold">
                          PERINGATAN: Tiket ini telah diverifikasi masuk pada gate sebelumnya. Akses ditolak untuk mencegah tumpangan ilegal.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LOKET KASIR CETAK KARCIS FISIK (LAMPIRAN II PERBUP MIMIKA 25/2024)   */}
      {/* ========================================================================= */}
      {activeTab === "pos" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input Selection (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-5">
            <div className="pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#D97706]" />
                <h3 className="text-sm font-extrabold text-[#0B241E]">
                  Penerbitan Karcis Retribusi Daerah (Porporasi Bapenda)
                </h3>
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                Sesuai Lampiran II Perbup Mimika No. 25 Tahun 2024 untuk loket pas masuk orang & kendaraan di gerbang pelabuhan.
              </p>
            </div>

            {/* Golongan Kendaraan Grid */}
            <div>
              <label className="text-xs font-bold text-[#0B241E] block mb-2">
                Pilih Golongan Kendaraan / Jenis Pas:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto p-1">
                {Object.values(VEHICLE_RATES).map((rate) => {
                  const IconComp = rate.icon;
                  const isSelected = selectedGol === rate.key;
                  return (
                    <button
                      key={rate.key}
                      type="button"
                      onClick={() => setSelectedGol(rate.key)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#0B241E] text-white border-[#0B241E] shadow-sm"
                          : "bg-[#F8FAFC] text-[#1E2922] border-[#E2E8F0] hover:bg-[#F1F5F9]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <IconComp className={`w-4 h-4 ${isSelected ? "text-[#D97706]" : "text-[#64748B]"}`} />
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? "bg-white/10 text-white" : "bg-white border text-[#64748B]"
                        }`}>
                          {rate.key}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs font-extrabold leading-snug">{rate.label}</p>
                        <p className={`text-[11px] font-mono font-bold mt-1 ${isSelected ? "text-[#D97706]" : "text-emerald-700"}`}>
                          {formatRupiah(rate.tarif)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#0B241E] block mb-1">
                  Nama Pembeli / Supir:
                </label>
                <input
                  type="text"
                  value={posPaxName}
                  onChange={(e) => setPosPaxName(e.target.value)}
                  placeholder="Nama pengemudi"
                  className="w-full text-xs p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg font-bold text-[#0B241E] focus:outline-none focus:border-[#0B241E]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0B241E] block mb-1">
                  Nomor Polisi (Plat Kendaraan):
                </label>
                <input
                  type="text"
                  value={posPlateNumber}
                  onChange={(e) => setPosPlateNumber(e.target.value)}
                  placeholder="B 2026 UPT"
                  disabled={VEHICLE_RATES[selectedGol]?.category === "PAX"}
                  className="w-full text-xs font-mono p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg font-bold text-[#0B241E] focus:outline-none focus:border-[#0B241E] disabled:bg-[#E2E8F0]"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2 border-t border-[#F1F5F9]">
              <label className="text-xs font-bold text-[#0B241E] block mb-2">
                Metode Pembayaran:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPosPaymentMethod("CASH")}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    posPaymentMethod === "CASH"
                      ? "bg-amber-50 border-amber-400 text-amber-900 font-bold shadow-xs"
                      : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]"
                  }`}
                >
                  <Banknote className="w-5 h-5 text-amber-700" />
                  <div className="text-left">
                    <p className="text-xs font-bold">Uang Tunai (Cash)</p>
                    <p className="text-[10px] text-[#64748B]">Setor bruto 1x24 jam</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPosPaymentMethod("QRIS")}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    posPaymentMethod === "QRIS"
                      ? "bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-xs"
                      : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]"
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-700" />
                  <div className="text-left">
                    <p className="text-xs font-bold">QRIS Dinamis Bapenda</p>
                    <p className="text-[10px] text-[#64748B]">Host-to-host Kasda</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Cash Given & Change Calculator */}
            {posPaymentMethod === "CASH" && (
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Total Retribusi:</span>
                  <strong className="text-base font-mono text-[#0B241E]">
                    {formatRupiah(VEHICLE_RATES[selectedGol]?.tarif || 0)}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-bold text-[#0B241E] whitespace-nowrap">
                    Uang Diterima:
                  </label>
                  <input
                    type="number"
                    value={posCashGiven}
                    onChange={(e) => setPosCashGiven(Number(e.target.value))}
                    step={5000}
                    className="w-40 text-right text-xs font-mono font-bold p-2 bg-white border border-[#CBD5E1] rounded-lg text-[#0B241E]"
                  />
                </div>

                <div className="flex items-center justify-between text-xs border-t border-[#E2E8F0] pt-2">
                  <span className="font-bold text-[#64748B]">Kembalian:</span>
                  <strong className="text-base font-mono text-emerald-700">
                    {formatRupiah(Math.max(0, posCashGiven - (VEHICLE_RATES[selectedGol]?.tarif || 0)))}
                  </strong>
                </div>
              </div>
            )}

            {/* Print Button */}
            <button
              type="button"
              onClick={handleIssuePOSPass}
              className="w-full py-3.5 bg-[#0B241E] hover:bg-[#143E33] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.99]"
            >
              <Printer className="w-4 h-4 text-[#D97706]" />
              <span>Cetak Karcis Porporasi Bapenda & Buka Gerbang</span>
            </button>
          </div>

          {/* Right: Live Preview of Official Karcis (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#FAFAFA] border border-[#CBD5E1] rounded-2xl p-6 shadow-sm relative overflow-hidden font-mono text-xs text-[#0B241E]">
              {/* Receipt Cut Edge Decorator */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-[#E2E8F0] border-b border-dashed border-[#CBD5E1]" />

              {/* Official Header */}
              <div className="text-center pb-3 border-b border-dashed border-[#CBD5E1]">
                <p className="text-[10px] uppercase font-bold text-[#64748B]">
                  PEMERINTAH KABUPATEN MIMIKA
                </p>
                <h4 className="text-xs font-extrabold uppercase mt-0.5">
                  DINAS PERHUBUNGAN • UPTD PELABUHAN
                </h4>
                <p className="text-[9px] text-[#64748B] mt-0.5">
                  KARCIS RETRIBUSI JASA KEPELABUHANAN
                </p>
                <div className="mt-2 inline-block px-2.5 py-0.5 bg-white border border-[#CBD5E1] rounded text-[10px] font-bold text-[#0B241E]">
                  KARCIS PORPORASI BAPENDA
                </div>
              </div>

              {/* Legal Reference according to Perbup */}
              <div className="py-3 text-[10px] space-y-1 border-b border-dashed border-[#CBD5E1] text-[#475569]">
                <p>Nomor Perda : Perda No. 4 Tahun 2023</p>
                <p>Nomor Perkada : Perbup Mimika No. 25 Tahun 2024</p>
                <p>Masa Retribusi : Harian / Sekali Masuk</p>
              </div>

              {/* Item Details */}
              <div className="py-3 space-y-2 border-b border-dashed border-[#CBD5E1]">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Jenis Layanan:</span>
                  <span className="font-bold text-right">{VEHICLE_RATES[selectedGol]?.label}</span>
                </div>
                {VEHICLE_RATES[selectedGol]?.category !== "PAX" && (
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">No. Polisi:</span>
                    <span className="font-bold bg-[#0B241E] text-white px-1.5 py-0.5 rounded text-[10px]">
                      {posPlateNumber || "-"}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Pengemudi:</span>
                  <span>{posPaxName || "Umum"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Lokasi:</span>
                  <span>Gerbang Masuk Dermaga 1</span>
                </div>
              </div>

              {/* Total Tarif Nominal */}
              <div className="py-3 text-center border-b border-dashed border-[#CBD5E1]">
                <p className="text-[10px] text-[#64748B] uppercase">Besaran Retribusi Terutang</p>
                <p className="text-lg font-extrabold text-[#0B241E] mt-1">
                  {formatRupiah(VEHICLE_RATES[selectedGol]?.tarif || 0)}
                </p>
                <p className="text-[9px] text-[#64748B] italic mt-0.5">
                  (LUNAS - Pembayaran {posPaymentMethod === "CASH" ? "Tunai Loket" : "QRIS Dinamis"})
                </p>
              </div>

              {/* QR Code Verification & Porporasi Serial */}
              <div className="pt-3 text-center flex flex-col items-center">
                <div className="p-2 bg-white border border-[#CBD5E1] rounded-lg shadow-2xs">
                  <QrCode className="w-16 h-16 text-[#0B241E]" />
                </div>
                <p className="text-[10px] font-bold text-emerald-800 mt-2">
                  SERI PORPORASI: KRC-MMK-2024-XXXXX
                </p>
                <p className="text-[9px] text-[#64748B] mt-1">
                  Simpan karcis ini sebagai tanda bukti sah melintas gerbang pelabuhan.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BUKU LOG PELINTASAN & DETEKSI ANTI-PASSBACK                        */}
      {/* ========================================================================= */}
      {activeTab === "history" && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs space-y-4">
          <div className="p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFCFB]">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-[#0B241E]" />
              <div>
                <h3 className="text-sm font-extrabold text-[#0B241E]">
                  Buku Register Pelintasan Gerbang Sif 1
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Pencatatan nomor seri porporasi, golongan kendaraan, dan audit anti-passback
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchLog}
                  onChange={(e) => setSearchLog(e.target.value)}
                  placeholder="Cari plat / kode / nama..."
                  className="text-xs p-2 pl-8 border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#0B241E] w-48 text-[#0B241E]"
                />
                <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-2.5" />
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="text-xs p-2 border border-[#CBD5E1] rounded-lg focus:outline-none text-[#0B241E] font-bold bg-white"
              >
                <option value="ALL">Semua Golongan</option>
                <option value="PAX">Pejalan Kaki Saja</option>
                <option value="VEHICLE">Kendaraan Saja</option>
              </select>

              <button
                type="button"
                onClick={() => alert("Laporan Register Pelintasan Gerbang telah diekspor ke format CSV Bapenda.")}
                className="p-2 border border-[#CBD5E1] rounded-lg text-[#0B241E] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                title="Ekspor CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3 px-4">Waktu Tap</th>
                  <th className="py-3 px-4">No. Karcis Porporasi</th>
                  <th className="py-3 px-4">Golongan / Layanan</th>
                  <th className="py-3 px-4">Plat Nomor / Nama</th>
                  <th className="py-3 px-4">Pintu Gerbang</th>
                  <th className="py-3 px-4 text-right">Tarif</th>
                  <th className="py-3 px-4 text-center">Metode Bayar</th>
                  <th className="py-3 px-4 text-center">Status Akses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAFC]/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[#64748B] whitespace-nowrap">
                      {log.scannedAt}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                      <div>{log.serialNumber}</div>
                      <div className="text-[10px] text-[#94A3B8] font-normal">{log.code}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#0B241E]">
                      {log.category}
                    </td>
                    <td className="py-3 px-4">
                      {log.plateNumber ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono bg-[#0B241E] text-white font-bold px-2 py-0.5 rounded text-[10px]">
                            {log.plateNumber}
                          </span>
                          <span className="text-[#64748B] text-[11px] truncate">{log.paxName}</span>
                        </div>
                      ) : (
                        <span className="text-[#475569]">{log.paxName}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">
                      {log.gateId}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#0B241E]">
                      {formatRupiah(log.fareAmount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        log.paymentMethod === "QRIS_ONLINE"
                          ? "bg-blue-50 text-blue-700"
                          : log.paymentMethod === "CASH_LOKET"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-purple-50 text-purple-700"
                      }`}>
                        {log.paymentMethod === "QRIS_ONLINE" ? "QRIS" : log.paymentMethod === "CASH_LOKET" ? "TUNAI" : "E-MONEY"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {log.isDuplicate ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                          <ShieldAlert className="w-3 h-3" />
                          Tertolak (Ganda)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Sukses Masuk
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL CETAK KARCIS LOKET HASIL PENERBITAN POS                             */}
      {/* ========================================================================= */}
      {posReceiptModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#CBD5E1] space-y-4 font-mono text-xs">
            <div className="text-center pb-3 border-b border-dashed border-[#CBD5E1]">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
              <h3 className="font-bold text-sm text-[#0B241E]">KARCIS BERHASIL DICETAK</h3>
              <p className="text-[10px] text-[#64748B]">Palang pintu otomatis telah terbuka!</p>
            </div>

            <div className="space-y-1.5 text-[11px] bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
              <div className="flex justify-between">
                <span className="text-[#64748B]">No. Seri:</span>
                <span className="font-bold text-emerald-800">{posReceiptModal.serialNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Golongan:</span>
                <span className="font-bold text-[#0B241E]">{posReceiptModal.category}</span>
              </div>
              {posReceiptModal.plateNumber && (
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Plat Nomor:</span>
                  <span className="font-bold">{posReceiptModal.plateNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#64748B]">Tarif:</span>
                <strong className="text-emerald-700">{formatRupiah(posReceiptModal.fareAmount)}</strong>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setPosReceiptModal(null);
                  triggerBarrierOpen();
                }}
                className="flex-1 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#D97706]" />
                <span>Cetak Thermal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPosReceiptModal(null);
                  triggerBarrierOpen();
                }}
                className="px-4 py-2.5 bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] rounded-xl font-bold transition-colors cursor-pointer"
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
