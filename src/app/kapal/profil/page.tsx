"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Ship,
  Building2,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ShieldCheck,
  Download,
  X,
  Clock,
  Calendar,
  AlertCircle,
  FileSignature,
  TrendingUp,
  RefreshCw,
  Send,
  Anchor,
  FileCheck2,
  Search,
  Link2,
  Unlink,
} from "lucide-react";
import { useKapalStore } from "@/store/kapal.store";
import { useAuthStore } from "@/store/auth.store";
import { KapalService } from "@/services/kapal.service";
import { ApiException } from "@/lib/api-client";
import { formatLabel } from "@/lib/format-labels";
import {
  Vessel,
  OperatorDocument,
  VesselConflictErrorDetails,
  VesselRelationshipType,
} from "@/types/kapal.types";

interface PksContract {
  id: string;
  contractNumber: string;
  title: string;
  firstParty: string;
  secondParty: string;
  legalBasis: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  status: "active" | "expiring_soon" | "expired";
  statusLabel: string;
  monthlyQuota: number;
  usedQuota: number;
  fileName: string;
  dockAllocation: string;
}

export default function KapalProfilPage() {
  const { user } = useAuthStore();
  const {
    operator,
    vessels,
    isLoading,
    error,
    fetchDashboardData,
    createVessel,
    claimVessel,
    unlinkVessel,
    uploadVesselDocument,
    uploadOperatorDocument,
  } = useKapalStore();

  const [activeTab, setActiveTab] = useState<"armada" | "profil" | "pks">("armada");
  const [isAddVesselModalOpen, setIsAddVesselModalOpen] = useState<boolean>(false);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState<boolean>(false);
  const [isUploadOpDocModalOpen, setIsUploadOpDocModalOpen] = useState<boolean>(false);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState<boolean>(false);
  const [selectedVesselForDoc, setSelectedVesselForDoc] = useState<Vessel | null>(null);
  const [selectedPksForRenewal, setSelectedPksForRenewal] = useState<PksContract | null>(null);

  const [renewalYears, setRenewalYears] = useState<number>(1);
  const [renewalNotes, setRenewalNotes] = useState<string>("");
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // New Vessel & Global Catalog Search-First State
  const [vesselModalTab, setVesselModalTab] = useState<"catalog" | "create">("catalog");
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogResults, setCatalogResults] = useState<Vessel[]>([]);
  const [isSearchingCatalog, setIsSearchingCatalog] = useState(false);
  const [claimRelationshipType, setClaimRelationshipType] =
    useState<VesselRelationshipType>("AGENT");
  const [vesselConflict, setVesselConflict] = useState<VesselConflictErrorDetails | null>(null);

  const [vesselFormData, setVesselFormData] = useState({
    name: "",
    registrationNumber: "",
    imoNumber: "",
    grossTonnage: 500,
    shipType: "NIAGA" as "NIAGA" | "NON_NIAGA",
    vesselCategory: "BARANG" as "BARANG" | "PENUMPANG" | "CAMPURAN",
    shippingCategory: "DALAM_NEGERI" as "LUAR_NEGERI" | "DALAM_NEGERI" | "PELRA_PERINTIS",
    relationshipType: "OWNER" as VesselRelationshipType,
    lengthMeters: 65,
    draftMeters: 4.2,
    flag: "Indonesia",
  });

  // Document Upload Form State
  const [docFormData, setDocFormData] = useState({
    category: "SURAT_UKUR" as "SIUPAL_NIB" | "NPWP" | "SURAT_UKUR" | "PAS_BESAR_KECIL" | "LAINNYA",
    documentNumber: "",
    notes: "",
    file: null as File | null,
  });

  // Operator Document Upload Form State
  const [opDocFormData, setOpDocFormData] = useState({
    category: "SIUPAL_NIB" as "SIUPAL_NIB" | "NPWP" | "LAINNYA",
    documentNumber: "",
    notes: "",
    file: null as File | null,
  });

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // PKS Contracts Data (Pelabuhan Poumako)
  const contracts: PksContract[] = useMemo(() => {
    return [
      {
        id: "PKS-PMK-01",
        contractNumber: "PKS/PMK/2026/001-PMS",
        title: "Perjanjian Kerja Sama Pemanfaatan Fasilitas Sandar & Kolam Pelabuhan Poumako",
        firstParty: "UPTD Pengelolaan Pelabuhan Poumako & Bapenda Mimika",
        secondParty: operator?.name || "PT Pelayaran Mimika Sejahtera",
        legalBasis: "PP No. 35/2023 & Perda Kab. Mimika No. 4/2023",
        startDate: "01 Januari 2026",
        endDate: "31 Desember 2026",
        daysRemaining: 45,
        status: "expiring_soon",
        statusLabel: "Masa Berlaku Berakhir < 60 Hari (Perlu Perpanjangan)",
        monthlyQuota: 30,
        usedQuota: 18,
        fileName: "PKS_Poumako_Mimika_2026.pdf",
        dockAllocation: "Dermaga Umum Pomako & Dermaga Nusantara",
      },
      {
        id: "PKS-PMK-02",
        contractNumber: "PKS/PMK/2025/012-CAD",
        title: "PKS Fasilitas Tambat Cadangan & Alur Labuh Darurat Muara Pomako",
        firstParty: "Dinas Perhubungan Kabupaten Mimika",
        secondParty: operator?.name || "PT Pelayaran Mimika Sejahtera",
        legalBasis: "Perbup Mimika No. 25/2024",
        startDate: "01 Juli 2025",
        endDate: "30 Juni 2027",
        daysRemaining: 225,
        status: "active",
        statusLabel: "Aktif & Beroperasi",
        monthlyQuota: 15,
        usedQuota: 4,
        fileName: "PKS_Labuh_Darurat_Poumako.pdf",
        dockAllocation: "Kolam Labuh Sektor Barat Pomako",
      },
    ];
  }, [operator]);

  const loadCatalog = async (q?: string) => {
    setIsSearchingCatalog(true);
    try {
      const results = await KapalService.searchVesselCatalog(q?.trim() || undefined);
      setCatalogResults(results);
    } catch {
      setCatalogResults([]);
    } finally {
      setIsSearchingCatalog(false);
    }
  };

  const handleOpenAddVessel = () => {
    setVesselModalTab("catalog");
    setCatalogQuery("");
    setClaimRelationshipType("AGENT");
    setVesselConflict(null);
    setVesselFormData({
      name: "",
      registrationNumber: `REG-PMK-${Date.now().toString().slice(-4)}`,
      imoNumber: "",
      grossTonnage: 500,
      shipType: "NIAGA",
      vesselCategory: "BARANG",
      shippingCategory: "DALAM_NEGERI",
      relationshipType: "OWNER",
      lengthMeters: 65,
      draftMeters: 4.2,
      flag: "Indonesia",
    });
    setErrorMessage(null);
    setIsAddVesselModalOpen(true);
    void loadCatalog("");
  };

  const handleClaimFromCatalog = async (vesselId: number, vesselName: string) => {
    const opId = user?.operatorId || operator?.id;
    if (!opId) {
      setErrorMessage("Profil operator tidak ditemukan.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await claimVessel(opId, vesselId, {
        relationshipType: claimRelationshipType,
      });
      setIsAddVesselModalOpen(false);
      setVesselConflict(null);
      setSuccessToast(
        `Kapal "${vesselName}" berhasil diklaim ke armada Anda sebagai ${formatLabel(claimRelationshipType)}!`
      );
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengklaim kapal ke armada.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlinkVessel = async (vessel: Vessel) => {
    const opId = user?.operatorId || operator?.id;
    if (!opId) return;
    if (
      !confirm(
        `Lepas kapal "${vessel.name}" dari daftar armada perusahaan Anda? Data master kapal & riwayat kunjungan tetap aman.`
      )
    ) {
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await unlinkVessel(opId, vessel.id);
      setSuccessToast(`Kapal "${vessel.name}" berhasil dilepas dari armada Anda.`);
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal melepas kapal dari armada.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitNewVessel = async (confirmNotDuplicate = false) => {
    if (!vesselFormData.name.trim()) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    setVesselConflict(null);

    try {
      const created = await createVessel({
        operatorId: user?.operatorId || operator?.id || undefined,
        relationshipType: vesselFormData.relationshipType,
        ...(confirmNotDuplicate ? { confirmNotDuplicate: true } : {}),
        registrationNumber: vesselFormData.registrationNumber,
        imoNumber: vesselFormData.imoNumber || undefined,
        name: vesselFormData.name,
        grossTonnage: Number(vesselFormData.grossTonnage),
        shipType: vesselFormData.shipType,
        vesselCategory: vesselFormData.vesselCategory,
        shippingCategory: vesselFormData.shippingCategory,
        lengthMeters: Number(vesselFormData.lengthMeters),
        draftMeters: Number(vesselFormData.draftMeters),
        flag: vesselFormData.flag,
      });

      setIsAddVesselModalOpen(false);
      setSuccessToast(`Kapal ${created.name} (${created.grossTonnage} GT) berhasil didaftarkan ke sistem PORTA!`);
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err: unknown) {
      if (err instanceof ApiException && err.statusCode === 409 && err.details && typeof err.details === "object") {
        const details = err.details as VesselConflictErrorDetails;
        if (details.code === "DUPLICATE_VESSEL_IDENTITY" || details.code === "POSSIBLE_DUPLICATE_VESSEL") {
          setVesselConflict(details);
          setIsSubmitting(false);
          return;
        }
      }
      const msg = err instanceof Error ? err.message : "Gagal mendaftarkan armada kapal.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAddVessel = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitNewVessel(false);
  };

  const handleOpenUploadVesselDoc = (vessel: Vessel) => {
    setSelectedVesselForDoc(vessel);
    setDocFormData({
      category: "SURAT_UKUR",
      documentNumber: `SU-${vessel.name.replace(/\s+/g, "").slice(0, 4)}-${Date.now().toString().slice(-4)}`,
      notes: `Dokumen resmi Surat Ukur untuk ${vessel.name}`,
      file: null,
    });
    setErrorMessage(null);
    setIsUploadDocModalOpen(true);
  };

  const handleSubmitVesselDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVesselForDoc || !docFormData.file) {
      setErrorMessage("Silakan pilih berkas file dokumen yang valid.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await uploadVesselDocument(
        selectedVesselForDoc.id,
        {
          category: docFormData.category,
          documentNumber: docFormData.documentNumber || undefined,
          notes: docFormData.notes || undefined,
        },
        docFormData.file
      );

      setIsUploadDocModalOpen(false);
      setSelectedVesselForDoc(null);
      setSuccessToast("Dokumen kapal berhasil diunggah ke server!");
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengunggah dokumen kapal.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenUploadOpDoc = () => {
    setOpDocFormData({
      category: "SIUPAL_NIB",
      documentNumber: `SIUPAL-MMK-${Date.now().toString().slice(-4)}`,
      notes: "Dokumen legalitas izin usaha angkutan laut resmi",
      file: null,
    });
    setErrorMessage(null);
    setIsUploadOpDocModalOpen(true);
  };

  const handleSubmitOpDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    const opId = operator?.id || user?.operatorId || 1;
    if (!opDocFormData.file) {
      setErrorMessage("Silakan pilih berkas dokumen legalitas (PDF/Gambar).");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await uploadOperatorDocument(
        opId,
        {
          category: opDocFormData.category,
          documentNumber: opDocFormData.documentNumber || undefined,
          notes: opDocFormData.notes || undefined,
        },
        opDocFormData.file
      );

      setIsUploadOpDocModalOpen(false);
      setSuccessToast("Dokumen legalitas badan usaha berhasil diunggah ke server PORTA!");
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengunggah dokumen badan usaha.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRenewalModal = (contract: PksContract) => {
    setSelectedPksForRenewal(contract);
    setRenewalYears(1);
    setRenewalNotes("");
    setIsRenewalModalOpen(true);
  };

  const handleConfirmRenewal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPksForRenewal) return;

    setSuccessToast(
      `Permohonan perpanjangan kontrak ${selectedPksForRenewal.contractNumber} berhasil diajukan ke UPTD Pelabuhan Poumako & Bapenda Mimika!`
    );
    setIsRenewalModalOpen(false);
    setSelectedPksForRenewal(null);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  return (
    <div className="space-y-6">
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

      {/* Global Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchDashboardData()}
            className="underline font-bold hover:text-rose-950 cursor-pointer"
          >
            Muat Ulang
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP ELEVATED CONTROL DECK & SUB-MODULE TABS                                */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-3 sm:p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0]">
          {/* Tab 1: Master Data Armada */}
          <button
            type="button"
            onClick={() => setActiveTab("armada")}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "armada"
                ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                : "text-[#64748B] hover:text-[#0B241E] hover:bg-white/70"
            }`}
          >
            <Ship className={`w-4 h-4 ${activeTab === "armada" ? "text-[#D97706]" : "text-[#64748B]"}`} />
            <span>Master Data Armada ({vessels.length})</span>
          </button>

          {/* Tab 2: Profil & Legalitas Badan Usaha */}
          <button
            type="button"
            onClick={() => setActiveTab("profil")}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "profil"
                ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                : "text-[#64748B] hover:text-[#0B241E] hover:bg-white/70"
            }`}
          >
            <Building2 className={`w-4 h-4 ${activeTab === "profil" ? "text-[#D97706]" : "text-[#64748B]"}`} />
            <span>Legalitas Badan Usaha</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-700 text-white">
              {operator?.verificationStatus || "VERIFIED"}
            </span>
          </button>

          {/* Tab 3: Kontrak PKS & Kuota Sandar */}
          <button
            type="button"
            onClick={() => setActiveTab("pks")}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "pks"
                ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                : "text-[#64748B] hover:text-[#0B241E] hover:bg-white/70"
            }`}
          >
            <FileSignature className={`w-4 h-4 ${activeTab === "pks" ? "text-[#D97706]" : "text-[#64748B]"}`} />
            <span>Kontrak PKS & Kuota Sandar</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500 text-white">
              H-45
            </span>
          </button>
        </div>

        {/* Sub-header status badge */}
        <div className="flex items-center gap-2 text-xs text-[#64748B] px-2">
          <button
            onClick={() => fetchDashboardData()}
            disabled={isLoading}
            className="p-2 border border-[#CBD5E1] bg-white rounded-xl hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0B241E] cursor-pointer disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <span className="text-[11px] font-mono text-[#0B241E] font-bold bg-[#F8FAFC] border border-[#CBD5E1] px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <Anchor className="w-3.5 h-3.5 text-[#0B241E]" />
            <span>UPTD Pelabuhan Poumako</span>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MASTER DATA ARMADA KAPAL                                           */}
      {/* ========================================================================= */}
      {activeTab === "armada" && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#CBD5E1] shadow-xs">
            <div>
              <h2 className="text-sm font-extrabold text-[#0B241E]">
                Daftar Armada Kapal Terdaftar (Port Fleet Register)
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Armada resmi {operator?.name || "PT Pelayaran Mimika Sejahtera"} yang memiliki izin berlabuh di Pelabuhan Poumako.
              </p>
            </div>

            <button
              onClick={handleOpenAddVessel}
              className="px-4 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#D97706]" />
              <span>Daftarkan Armada Kapal Baru</span>
            </button>
          </div>

          {isLoading && vessels.length === 0 ? (
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-10 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#0B241E] animate-spin mx-auto" />
              <p className="text-xs text-[#64748B]">Memuat master armada dari server...</p>
            </div>
          ) : vessels.length === 0 ? (
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-8 text-center text-xs text-[#64748B] space-y-2">
              <Ship className="w-10 h-10 text-[#94A3B8] mx-auto" />
              <p className="font-bold text-[#0B241E] text-sm">Belum ada armada kapal terdaftar.</p>
              <p>Klik tombol &quot;Daftarkan Armada Kapal Baru&quot; di atas untuk mendaftarkan kapal Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vessels.map((vessel) => {
                const isVerified = vessel.verificationStatus === "VERIFIED";

                return (
                  <div
                    key={vessel.id}
                    className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 border-b border-[#F1F5F9] pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-sm text-[#0B241E]">
                              {vessel.name}
                            </h3>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                isVerified
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : "bg-amber-100 text-amber-800 border border-amber-300"
                              }`}
                            >
                              {isVerified ? "✓ Terverifikasi" : "Menunggu Syahbandar"}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-[#64748B] mt-0.5">
                            {vessel.registrationNumber} {vessel.imoNumber ? `• IMO: ${vessel.imoNumber}` : ""}
                          </p>
                        </div>

                        <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] flex items-center justify-center text-[#0B241E] shrink-0">
                          <Ship className="w-4 h-4 text-[#D97706]" />
                        </div>
                      </div>

                      {/* Spesifikasi Kapal */}
                      <div className="grid grid-cols-2 gap-2 text-xs py-3 text-[#64748B]">
                        <div className="bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0]">
                          <span className="text-[10px] text-[#94A3B8] font-bold block uppercase">Bobot GT</span>
                          <strong className="text-[#0B241E] font-mono text-sm">
                            {Number(vessel.grossTonnage).toLocaleString()} GT
                          </strong>
                        </div>

                        <div className="bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0]">
                          <span className="text-[10px] text-[#94A3B8] font-bold block uppercase">Kategori Pelayaran</span>
                          <strong className="text-[#0B241E] text-xs">
                            {vessel.shippingCategory || "DALAM_NEGERI"}
                          </strong>
                        </div>

                        <div className="bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0]">
                          <span className="text-[10px] text-[#94A3B8] font-bold block uppercase">Dimensi LoA / Draft</span>
                          <span className="text-[#0B241E] font-mono text-[11px]">
                            {vessel.lengthMeters ? `${vessel.lengthMeters}m` : "-"} / {vessel.draftMeters ? `${vessel.draftMeters}m` : "-"}
                          </span>
                        </div>

                        <div className="bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0]">
                          <span className="text-[10px] text-[#94A3B8] font-bold block uppercase">Tipe Kapal</span>
                          <span className="text-[#0B241E] text-[11px]">
                            {vessel.shipType} ({vessel.vesselCategory || "BARANG"})
                          </span>
                        </div>
                      </div>

                      {/* Dokumen Kapal yang Diunggah */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold uppercase text-[#94A3B8] block">
                          Dokumen Terunggah ({vessel.documents?.length || 0}):
                        </span>
                        {vessel.documents && vessel.documents.length > 0 ? (
                          <div className="space-y-1">
                            {vessel.documents.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between text-[11px] bg-slate-50 px-2 py-1 rounded border border-slate-200"
                              >
                                <span className="font-medium text-[#0B241E] truncate max-w-[170px]">
                                  {doc.category}: {doc.fileName}
                                </span>
                                <span className="text-[9px] font-mono text-emerald-700 font-bold">
                                  ✓ Sah
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-[#94A3B8] italic">
                            Belum ada dokumen Surat Ukur / Pas Besar terlampir.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Tombol Upload Dokumen & Lepas dari Armada */}
                    <div className="pt-2 border-t border-[#F1F5F9] flex items-center gap-2">
                      <button
                        onClick={() => handleOpenUploadVesselDoc(vessel)}
                        className="flex-1 py-2 bg-[#F1F5F9] hover:bg-[#0B241E] hover:text-white text-[#0B241E] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Dokumen</span>
                      </button>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleUnlinkVessel(vessel)}
                        className="px-3 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        title="Lepas kapal ini dari armada perusahaan Anda"
                      >
                        <Unlink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PROFIL & LEGALITAS BADAN USAHA OPERATOR                            */}
      {/* ========================================================================= */}
      {activeTab === "profil" && (
        <section className="space-y-5">
          {/* Card Info Perusahaan */}
          <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#0B241E] text-white flex items-center justify-center text-lg font-black shrink-0">
                  <Building2 className="w-6 h-6 text-[#D97706]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-[#0B241E]">
                      {operator?.name || "PT Pelayaran Mimika Sejahtera"}
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {operator?.verificationStatus || "VERIFIED"}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Operator Angkutan Laut Terdaftar • Profil: {operator?.operatorProfile || "REGULAR_SCHEDULED"}
                  </p>
                </div>
              </div>

              <button
                onClick={handleOpenUploadOpDoc}
                className="px-4 py-2 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Upload Dokumen SIUPAL/NPWP</span>
              </button>
            </div>

            {/* Identitas Kontak & Lokasi */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] text-[#94A3B8] font-bold block uppercase">Nomor Pokok Wajib Pajak (NPWP)</span>
                <p className="font-mono font-bold text-[#0B241E] mt-1 text-sm">
                  {operator?.npwp || "01.234.567.8-954.000"}
                </p>
              </div>

              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] text-[#94A3B8] font-bold block uppercase">Kontak Operasional</span>
                <p className="font-bold text-[#0B241E] mt-1">{operator?.phone || "0811-4800-291"}</p>
                <p className="text-[#64748B] text-[11px]">{operator?.email || user?.email || "ops@mimika-shipping.co.id"}</p>
              </div>

              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] text-[#94A3B8] font-bold block uppercase">Alamat Kantor Pelabuhan</span>
                <p className="text-[#0B241E] font-medium mt-1">
                  {operator?.address || "Kawasan Pelabuhan Poumako, Distrik Mimika Timur, Kabupaten Mimika, Papua Tengah"}
                </p>
              </div>
            </div>
          </div>

          {/* Dokumen Legalitas */}
          <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-[#0B241E] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Berkas Legalitas & Perizinan Berusaha (SIUPAL & NIB)</span>
            </h3>

            <div className="divide-y divide-[#E2E8F0]">
              {(operator?.documents && operator.documents.length > 0) ? (
                operator.documents.map((doc: OperatorDocument) => (
                  <div key={doc.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <FileCheck2 className="w-5 h-5 text-emerald-700 shrink-0" />
                      <div>
                        <p className="font-bold text-[#0B241E]">{doc.category}: {doc.fileName}</p>
                        <p className="text-[10px] font-mono text-[#64748B]">
                          No. Dokumen: {doc.documentNumber || "-"} • Diunggah: {new Date(doc.createdAt).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      ✓ Terverifikasi
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-[#64748B] space-y-2">
                  <FileText className="w-8 h-8 text-[#94A3B8] mx-auto" />
                  <p>Belum ada berkas SIUPAL/NPWP yang diunggah ke database backend.</p>
                  <p className="text-[11px] text-[#94A3B8]">
                    Gunakan tombol &quot;Upload Dokumen SIUPAL/NPWP&quot; di atas untuk melengkapi berkas legalitas.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: KONTRAK PKS & KUOTA SLOT SANDAR (RUJUKAN PP 35/2023)                */}
      {/* ========================================================================= */}
      {activeTab === "pks" && (
        <section className="space-y-4">
          <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#0B241E]">
                Perjanjian Kerja Sama (PKS) Sandar & Alokasi Kuota Dermaga
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Pengelolaan kontrak berkala pemanfaatan fasilitas dermaga UPTD Pelabuhan Poumako sesuai PP 35/2023.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl">
                Tersedia 2 PKS Aktif
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="bg-white border-2 border-amber-300 rounded-2xl p-5 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-3 border-b border-[#F1F5F9] pb-3">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                      {contract.contractNumber}
                    </span>
                    <h4 className="font-extrabold text-sm text-[#0B241E] mt-1">
                      {contract.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white shrink-0">
                    Sisa {contract.daysRemaining} Hari
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[#64748B]">
                  <div className="flex justify-between">
                    <span>Pihak Pertama:</span>
                    <strong className="text-[#0B241E]">{contract.firstParty}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Masa Berlaku:</span>
                    <span className="font-mono text-[#0B241E]">{contract.startDate} s/d {contract.endDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Alokasi Dermaga:</span>
                    <span className="text-[#0B241E] font-medium">{contract.dockAllocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kuota Bulanan:</span>
                    <span className="font-mono font-bold text-[#0B241E]">{contract.usedQuota} / {contract.monthlyQuota} Slot Digunakan</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                  <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{contract.fileName}</span>
                  </span>

                  <button
                    onClick={() => handleOpenRenewalModal(contract)}
                    className="px-4 py-2 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Ajukan Perpanjangan PKS
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CARI KATALOG GLOBAL / DAFTARKAN ARMADA KAPAL BARU                  */}
      {/* ========================================================================= */}
      {isAddVesselModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 border border-[#CBD5E1] shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-xs">
                  <Ship className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#0B241E]">
                    Tambah Armada Kapal (Katalog Global PORTA)
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Cari & klaim kapal yang sudah ada di database PORTA terlebih dahulu untuk mencegah duplikasi.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddVesselModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0B241E] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search-First Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => {
                  setVesselModalTab("catalog");
                  setErrorMessage(null);
                  setVesselConflict(null);
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  vesselModalTab === "catalog"
                    ? "bg-[#0B241E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0B241E]"
                }`}
              >
                <Search className="w-3.5 h-3.5 text-[#D97706]" />
                1. Cari & Klaim dari Katalog
              </button>
              <button
                type="button"
                onClick={() => {
                  setVesselModalTab("create");
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  vesselModalTab === "create"
                    ? "bg-[#0B241E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0B241E]"
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-[#D97706]" />
                2. Daftarkan Kapal Baru
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {vesselModalTab === "catalog" ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={catalogQuery}
                        onChange={(e) => setCatalogQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void loadCatalog(catalogQuery);
                          }
                        }}
                        placeholder="Ketik nama kapal, no. registrasi, atau IMO..."
                        className="w-full pl-9 pr-3 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => void loadCatalog(catalogQuery)}
                      disabled={isSearchingCatalog}
                      className="px-4 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white font-bold rounded-xl cursor-pointer"
                    >
                      {isSearchingCatalog ? "..." : "Cari"}
                    </button>
                  </div>

                  <div>
                    <select
                      value={claimRelationshipType}
                      onChange={(e) =>
                        setClaimRelationshipType(e.target.value as VesselRelationshipType)
                      }
                      className="w-full py-2.5 px-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-bold text-[#0B241E]"
                    >
                      <option value="AGENT">Status: Agen Pelayaran</option>
                      <option value="OWNER">Status: Pemilik Kapal</option>
                      <option value="CHARTERER">Status: Penyewa (Charterer)</option>
                    </select>
                  </div>
                </div>

                <div className="border border-[#E2E8F0] rounded-xl divide-y divide-[#F1F5F9] max-h-72 overflow-y-auto">
                  {isSearchingCatalog ? (
                    <div className="p-6 text-center text-[#64748B]">
                      Mencari kapal di katalog global PORTA...
                    </div>
                  ) : catalogResults.length === 0 ? (
                    <div className="p-6 text-center space-y-2 text-[#64748B]">
                      <p>Kapal tidak ditemukan di katalog global.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setVesselFormData((prev) => ({ ...prev, name: catalogQuery }));
                          setVesselModalTab("create");
                        }}
                        className="px-3.5 py-2 bg-[#0B241E] text-white font-bold rounded-xl cursor-pointer"
                      >
                        + Daftarkan Kapal Baru
                      </button>
                    </div>
                  ) : (
                    catalogResults.map((cv) => {
                      const alreadyInFleet = vessels.some((mv) => mv.id === cv.id);
                      return (
                        <div
                          key={cv.id}
                          className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#F8FAFC]"
                        >
                          <div>
                            <div className="font-extrabold text-[#0B241E] flex items-center gap-2">
                              <span>{cv.name}</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                {Number(cv.grossTonnage).toLocaleString()} GT
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-[#64748B] mt-0.5">
                              Reg: {cv.registrationNumber}
                              {cv.imoNumber ? ` • IMO: ${cv.imoNumber}` : ""} •{" "}
                              {formatLabel(cv.vesselCategory)}
                            </div>
                          </div>

                          {alreadyInFleet ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                              Sudah di Armada
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => void handleClaimFromCatalog(cv.id, cv.name)}
                              className="px-3 py-1.5 rounded-lg bg-[#0B241E] hover:bg-[#143E33] text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                            >
                              <Link2 className="w-3.5 h-3.5 text-[#D97706]" />
                              Klaim Kapal
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitAddVessel} className="space-y-4 text-xs">
                {vesselConflict && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2.5">
                    <div className="flex items-start gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <span>{vesselConflict.message}</span>
                    </div>

                    {vesselConflict.existingVessel && (
                      <div className="p-3 rounded-lg bg-white border border-amber-200 flex items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-[#0B241E]">
                            {vesselConflict.existingVessel.name}
                          </div>
                          <div className="font-mono text-[11px] text-[#64748B]">
                            Reg: {vesselConflict.existingVessel.registrationNumber}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() =>
                            void handleClaimFromCatalog(
                              vesselConflict.existingVessel!.id,
                              vesselConflict.existingVessel!.name
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-[#0B241E] text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Link2 className="w-3.5 h-3.5 text-[#D97706]" />
                          Klaim Kapal Ini
                        </button>
                      </div>
                    )}

                    {vesselConflict.similarVessels && vesselConflict.similarVessels.length > 0 && (
                      <div className="space-y-2">
                        <p className="font-semibold text-[11px]">
                          Apakah yang Anda maksud salah satu kapal berikut?
                        </p>
                        {vesselConflict.similarVessels.map((sv) => (
                          <div
                            key={sv.id}
                            className="p-2.5 rounded-lg bg-white border border-amber-200 flex items-center justify-between gap-2"
                          >
                            <div>
                              <span className="font-bold text-[#0B241E]">{sv.name}</span>{" "}
                              <span className="font-mono text-[11px] text-[#64748B]">
                                ({sv.registrationNumber})
                              </span>
                            </div>
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => void handleClaimFromCatalog(sv.id, sv.name)}
                              className="px-3 py-1 rounded-lg bg-[#0B241E] text-white font-bold text-[11px] cursor-pointer"
                            >
                              Klaim Kapal Ini
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => void submitNewVessel(true)}
                          className="px-3.5 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-[11px] cursor-pointer"
                        >
                          Bukan Duplikat — Tetap Daftarkan Kapal Baru
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#0B241E] mb-1">
                      Nama Kapal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: KM Mimika Bahari"
                      value={vesselFormData.name}
                      onChange={(e) => setVesselFormData({ ...vesselFormData, name: e.target.value })}
                      className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0B241E] mb-1">
                      Status Hubungan Perusahaan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={vesselFormData.relationshipType}
                      onChange={(e) =>
                        setVesselFormData({
                          ...vesselFormData,
                          relationshipType: e.target.value as VesselRelationshipType,
                        })
                      }
                      className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E] focus:outline-hidden"
                    >
                      <option value="OWNER">Pemilik Kapal (Owner)</option>
                      <option value="AGENT">Agen Pelayaran (Agent)</option>
                      <option value="CHARTERER">Penyewa (Charterer)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#0B241E] mb-1">
                      Nomor IMO (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: IMO9123456"
                      value={vesselFormData.imoNumber}
                      onChange={(e) => setVesselFormData({ ...vesselFormData, imoNumber: e.target.value })}
                      className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E] focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0B241E] mb-1">
                      Nomor Registrasi / Pas Tahunan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: REG-PMK-002"
                      value={vesselFormData.registrationNumber}
                      onChange={(e) => setVesselFormData({ ...vesselFormData, registrationNumber: e.target.value })}
                      className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E] focus:outline-hidden"
                    />
                  </div>
                </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0B241E] mb-1">
                    Gross Tonnage (GT) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={vesselFormData.grossTonnage}
                    onChange={(e) => setVesselFormData({ ...vesselFormData, grossTonnage: Number(e.target.value) })}
                    className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B241E] mb-1">
                    Panjang LoA (Meter)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={1}
                    value={vesselFormData.lengthMeters}
                    onChange={(e) => setVesselFormData({ ...vesselFormData, lengthMeters: Number(e.target.value) })}
                    className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B241E] mb-1">
                    Sarat Draft (Meter)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={0.5}
                    value={vesselFormData.draftMeters}
                    onChange={(e) => setVesselFormData({ ...vesselFormData, draftMeters: Number(e.target.value) })}
                    className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0B241E] mb-1">
                    Kategori Pelayaran Sesuai Tarif PP 35/2023
                  </label>
                  <select
                    value={vesselFormData.shippingCategory}
                    onChange={(e) =>
                      setVesselFormData({
                        ...vesselFormData,
                        shippingCategory: e.target.value as "LUAR_NEGERI" | "DALAM_NEGERI" | "PELRA_PERINTIS",
                      })
                    }
                    className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E] focus:outline-hidden"
                  >
                    <option value="DALAM_NEGERI">Pelayaran Dalam Negeri (Rp 100/GT/Etmal)</option>
                    <option value="PELRA_PERINTIS">Pelayaran Rakyat / Perintis (Rp 50/GT/Etmal)</option>
                    <option value="LUAR_NEGERI">Pelayaran Luar Negeri (USD Tariff Rate)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B241E] mb-1">
                    Tipe Kapal & Muatan
                  </label>
                  <select
                    value={vesselFormData.vesselCategory}
                    onChange={(e) =>
                      setVesselFormData({
                        ...vesselFormData,
                        vesselCategory: e.target.value as "BARANG" | "PENUMPANG" | "CAMPURAN",
                      })
                    }
                    className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E] focus:outline-hidden"
                  >
                    <option value="BARANG">Kapal Kargo / Barang</option>
                    <option value="PENUMPANG">Kapal Penumpang / Ferry</option>
                    <option value="CAMPURAN">Campuran (Barang & Penumpang)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsAddVesselModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0B241E] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-extrabold rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Mendaftarkan ke Server..." : "Simpan & Daftarkan Kapal"}
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: UPLOAD DOKUMEN KAPAL (POST /vessels/:id/documents)                 */}
      {/* ========================================================================= */}
      {isUploadDocModalOpen && selectedVesselForDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-[#CBD5E1] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-[#0B241E]">
                  Upload Dokumen Kelayakan Kapal
                </h3>
                <p className="text-xs text-[#64748B] font-mono">
                  {selectedVesselForDoc.name} ({selectedVesselForDoc.grossTonnage} GT)
                </p>
              </div>
              <button
                onClick={() => setIsUploadDocModalOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#0B241E] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitVesselDoc} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#0B241E] mb-1">
                  Kategori Dokumen Kapal:
                </label>
                <select
                  value={docFormData.category}
                  onChange={(e) =>
                    setDocFormData({
                      ...docFormData,
                      category: e.target.value as "SURAT_UKUR" | "PAS_BESAR_KECIL" | "LAINNYA",
                    })
                  }
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E]"
                >
                  <option value="SURAT_UKUR">Surat Ukur Kapal Internasional / Nasional</option>
                  <option value="PAS_BESAR_KECIL">Pas Besar / Pas Kecil Tahunan</option>
                  <option value="LAINNYA">Sertifikat Keselamatan Konstruksi & Radio</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#0B241E] mb-1">
                  Nomor Sertifikat / Dokumen:
                </label>
                <input
                  type="text"
                  required
                  value={docFormData.documentNumber}
                  onChange={(e) => setDocFormData({ ...docFormData, documentNumber: e.target.value })}
                  placeholder="Contoh: SU-9912/DJPL/2026"
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0B241E] mb-1">
                  Pilih File Berkas (PDF / Gambar Maks. 10MB):
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setDocFormData({ ...docFormData, file: e.target.files?.[0] || null })}
                  className="w-full text-xs text-[#64748B] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#0B241E] file:text-white cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0B241E] mb-1">
                  Catatan / Keterangan Penerbit (Opsional):
                </label>
                <input
                  type="text"
                  value={docFormData.notes}
                  onChange={(e) => setDocFormData({ ...docFormData, notes: e.target.value })}
                  placeholder="Diterbitkan oleh KSOP / Ditjen Hubla"
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsUploadDocModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0B241E]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white font-extrabold rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Mengunggah..." : "Unggah Dokumen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: UPLOAD DOKUMEN BADAN USAHA (POST /vessels/operators/:id/documents) */}
      {/* ========================================================================= */}
      {isUploadOpDocModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-[#CBD5E1] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-[#0B241E]">
                  Upload Dokumen Legalitas Perusahaan
                </h3>
                <p className="text-xs text-[#64748B]">
                  {operator?.name || "PT Pelayaran Mimika Sejahtera"}
                </p>
              </div>
              <button
                onClick={() => setIsUploadOpDocModalOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#0B241E] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOpDoc} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#0B241E] mb-1">
                  Kategori Perizinan Berusaha:
                </label>
                <select
                  value={opDocFormData.category}
                  onChange={(e) =>
                    setOpDocFormData({
                      ...opDocFormData,
                      category: e.target.value as "SIUPAL_NIB" | "NPWP" | "LAINNYA",
                    })
                  }
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E]"
                >
                  <option value="SIUPAL_NIB">SIUPAL / Nomor Induk Berusaha (NIB) Angkutan Laut</option>
                  <option value="NPWP">NPWP Badan Usaha Perusahaan</option>
                  <option value="LAINNYA">Akta Notaris / Perjanjian Konsesi Pelabuhan</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#0B241E] mb-1">
                  Nomor Surat / SK Izin:
                </label>
                <input
                  type="text"
                  required
                  value={opDocFormData.documentNumber}
                  onChange={(e) => setOpDocFormData({ ...opDocFormData, documentNumber: e.target.value })}
                  placeholder="Contoh: SIUPAL-042/AL.001/DJPL/2026"
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0B241E] mb-1">
                  Pilih Berkas Dokumen (PDF / Gambar):
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setOpDocFormData({ ...opDocFormData, file: e.target.files?.[0] || null })}
                  className="w-full text-xs text-[#64748B] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#0B241E] file:text-white cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsUploadOpDocModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0B241E]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white font-extrabold rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Mengunggah..." : "Unggah Berkas Legalitas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AJUKAN PERPANJANGAN PKS                                            */}
      {/* ========================================================================= */}
      {isRenewalModalOpen && selectedPksForRenewal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 border border-[#CBD5E1] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2.5">
                <FileSignature className="w-5 h-5 text-amber-700" />
                <h3 className="font-extrabold text-sm text-[#0B241E]">
                  Permohonan Perpanjangan Perjanjian Kerja Sama (PKS)
                </h3>
              </div>
              <button
                onClick={() => setIsRenewalModalOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#0B241E] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRenewal} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                <span className="font-bold text-amber-950 block">PKS Terkait:</span>
                <p className="text-amber-900 font-medium">{selectedPksForRenewal.title}</p>
                <p className="font-mono text-[11px] text-amber-800">
                  Masa Berlaku Berakhir: {selectedPksForRenewal.endDate} (Tersisa {selectedPksForRenewal.daysRemaining} Hari)
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B241E] mb-1">
                  Usulan Durasi Perpanjangan Kontrak:
                </label>
                <select
                  value={renewalYears}
                  onChange={(e) => setRenewalYears(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E]"
                >
                  <option value={1}>1 Tahun Kalender (1 Jan 2027 s/d 31 Des 2027)</option>
                  <option value={2}>2 Tahun Kalender (1 Jan 2027 s/d 31 Des 2028)</option>
                  <option value={3}>3 Tahun Kalender (Jangka Menengah)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B241E] mb-1">
                  Catatan Justifikasi / Kebutuhan Kuota Tambahan:
                </label>
                <textarea
                  rows={3}
                  value={renewalNotes}
                  onChange={(e) => setRenewalNotes(e.target.value)}
                  placeholder="Contoh: Mengantisipasi penambahan 1 unit armada kargo pada triwulan II 2027..."
                  className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:border-[#0B241E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsRenewalModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0B241E] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-extrabold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#D97706]" />
                  <span>Kirim Permohonan Perpanjangan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
