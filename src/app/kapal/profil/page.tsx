"use client";

import React, { useState, useEffect } from "react";
import {
  Ship,
  Building2,
  AlertTriangle,
  Plus,
  Clock,
  RefreshCw,
  KeyRound,
} from "lucide-react";
import { getBackendFileUrl } from "@/lib/file-url";
import { useKapalStore } from "@/store/kapal.store";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/toast.store";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { ApiException } from "@/lib/api-client";
import { formatLabel } from "@/lib/format-labels";
import {
  Vessel,
  VesselConflictErrorDetails,
  VesselFormState,
  VesselRegistrationAttachment,
  VesselRelationshipType,
} from "@/types/kapal.types";
import { DEFAULT_VESSEL_FORM, isVesselPhotoDoc } from "@/lib/kapal-profil";
import { VesselFormModal } from "@/components/kapal/profil/VesselFormModal";
import { CompanyProfileTab } from "@/components/kapal/profil/CompanyProfileTab";
import { FleetManagementTab } from "@/components/kapal/profil/FleetManagementTab";
import { AccountSecurityTab } from "@/components/kapal/profil/AccountSecurityTab";
import { FleetCatalogModal } from "@/components/kapal/profil/FleetCatalogModal";

export default function KapalProfilPage() {
  const { user, refreshMe, updateMyProfile, changeMyPassword } = useAuthStore();
  const {
    operator,
    vessels,
    isLoading,
    error,
    selectedCategory,
    setSelectedCategory,
    fetchDashboardData,
    updateOperatorProfile,
    createVessel,
    updateVessel,
    claimVessel,
    unlinkVessel,
    uploadOperatorDocument,
  } = useKapalStore();

  const [activeTab, setActiveTab] = useState<"profil" | "armada" | "akun">("profil");
  const [isAddVesselModalOpen, setIsAddVesselModalOpen] = useState<boolean>(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [unlinkTarget, setUnlinkTarget] = useState<Vessel | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Global Catalog Search-First & Claim State
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState<boolean>(false);
  const [claimRelationshipType, setClaimRelationshipType] =
    useState<VesselRelationshipType>("AGENT");
  const [vesselConflict, setVesselConflict] = useState<VesselConflictErrorDetails | null>(null);

  // New / Edit Vessel Form State
  const [vesselFormData, setVesselFormData] = useState<VesselFormState>(DEFAULT_VESSEL_FORM);
  const [vesselPhotoFile, setVesselPhotoFile] = useState<File | null>(null);
  const [vesselPhotoPreview, setVesselPhotoPreview] = useState<string | null>(null);
  const [primaryDocCategory, setPrimaryDocCategory] = useState<
    "SURAT_UKUR" | "PAS_BESAR_KECIL" | "LAINNYA"
  >("SURAT_UKUR");
  const [primaryDocNumber, setPrimaryDocNumber] = useState<string>("");
  const [primaryDocFile, setPrimaryDocFile] = useState<File | null>(null);
  const [showSecondaryDocSlot, setShowSecondaryDocSlot] = useState<boolean>(false);
  const [secondaryDocCategory, setSecondaryDocCategory] = useState<
    "SURAT_UKUR" | "PAS_BESAR_KECIL" | "LAINNYA"
  >("PAS_BESAR_KECIL");
  const [secondaryDocNumber, setSecondaryDocNumber] = useState<string>("");
  const [secondaryDocFile, setSecondaryDocFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDashboardData();
    refreshMe();
  }, [fetchDashboardData, refreshMe]);

  useEffect(() => {
    return () => {
      if (vesselPhotoPreview) {
        URL.revokeObjectURL(vesselPhotoPreview);
      }
    };
  }, [vesselPhotoPreview]);

  const totalFleetCount = operator?.fleetSummary?.totalVessels ?? vessels.length;
  const verifiedFleetCount =
    operator?.fleetSummary?.verifiedVesselsCount ??
    vessels.filter((v) => v.verificationStatus === "VERIFIED").length;
  const pendingFleetCount =
    operator?.fleetSummary?.pendingVesselsCount ??
    vessels.filter((v) => v.verificationStatus === "PENDING").length;

  const effectiveOperatorStatus =
    operator?.verificationStatus || user?.operatorVerificationStatus || "VERIFIED";
  const isOperatorVerified = effectiveOperatorStatus === "VERIFIED";
  const isOperatorRejected = effectiveOperatorStatus === "REJECTED";
  const operatorStatusLabel = isOperatorVerified
    ? "Terverifikasi"
    : isOperatorRejected
    ? "Ditolak Petugas"
    : "Menunggu Verifikasi Petugas";

  const resetVesselAttachments = () => {
    if (vesselPhotoPreview) {
      URL.revokeObjectURL(vesselPhotoPreview);
    }
    setVesselPhotoFile(null);
    setVesselPhotoPreview(null);
    setPrimaryDocCategory("SURAT_UKUR");
    setPrimaryDocNumber("");
    setPrimaryDocFile(null);
    setShowSecondaryDocSlot(false);
    setSecondaryDocCategory("PAS_BESAR_KECIL");
    setSecondaryDocNumber("");
    setSecondaryDocFile(null);
    setErrorMessage(null);
  };

  const handleOpenAddVessel = () => {
    setEditingVessel(null);
    setClaimRelationshipType("AGENT");
    setVesselConflict(null);
    setVesselFormData(DEFAULT_VESSEL_FORM);
    resetVesselAttachments();
    setIsCatalogModalOpen(true);
  };

  const handleOpenEditVessel = (vessel: Vessel) => {
    setEditingVessel(vessel);
    setVesselFormData({
      name: vessel.name || "",
      registrationNumber: vessel.registrationNumber || "",
      imoNumber: vessel.imoNumber || "",
      grossTonnage: Number(vessel.grossTonnage) || 500,
      shipType: vessel.shipType || "NIAGA",
      vesselCategory: vessel.vesselCategory || "BARANG",
      shippingCategory: vessel.shippingCategory || "DALAM_NEGERI",
      lengthMeters: Number(vessel.lengthMeters) || 65,
      draftMeters: Number(vessel.draftMeters) || 4.2,
      flag: vessel.flag || "Indonesia",
    });
    resetVesselAttachments();
    setIsAddVesselModalOpen(true);
  };

  const handleSelectVesselPhoto = (file: File | null) => {
    if (vesselPhotoPreview) {
      URL.revokeObjectURL(vesselPhotoPreview);
    }
    if (!file) {
      setVesselPhotoFile(null);
      setVesselPhotoPreview(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Foto kapal harus berupa file gambar (JPG, PNG, atau WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Ukuran foto kapal maksimal 5 MB.");
      return;
    }
    setErrorMessage(null);
    setVesselPhotoFile(file);
    setVesselPhotoPreview(URL.createObjectURL(file));
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
      await claimVessel(Number(opId), vesselId, {
        relationshipType: claimRelationshipType,
      });
      setIsCatalogModalOpen(false);
      setIsAddVesselModalOpen(false);
      setVesselConflict(null);
      toast.success(
        "Kapal Berhasil Diklaim",
        `Kapal "${vesselName}" berhasil diklaim ke armada Anda sebagai ${formatLabel(
          claimRelationshipType
        )}.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengklaim kapal ke armada.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmUnlinkVessel = async () => {
    if (!unlinkTarget) return;
    const opId = user?.operatorId || operator?.id;
    if (!opId) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await unlinkVessel(Number(opId), unlinkTarget.id);
      toast.success(
        "Kapal Dilepas dari Armada",
        `Kapal "${unlinkTarget.name}" berhasil dilepas dari armada Anda.`
      );
      setUnlinkTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal melepas kapal dari armada.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitNewVessel = async (confirmNotDuplicate = false) => {
    if (!vesselFormData.name.trim()) return;
    const isEditMode = Boolean(editingVessel);

    if (!isEditMode && !vesselPhotoFile) {
      setErrorMessage("Harap lampirkan foto fisik kapal (JPG/PNG/WEBP) terlebih dahulu.");
      return;
    }
    if (!isEditMode && !primaryDocFile) {
      setErrorMessage(
        "Harap lampirkan minimal 1 dokumen pendukung kapal (Surat Ukur / Pas Besar / Sertifikat)."
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setVesselConflict(null);

    try {
      const attachments: VesselRegistrationAttachment[] = [];
      if (vesselPhotoFile) {
        attachments.push({
          category: "LAINNYA",
          documentNumber: "FOTO-KAPAL",
          notes: "FOTO_KAPAL",
          file: vesselPhotoFile,
        });
      }
      if (primaryDocFile) {
        attachments.push({
          category: primaryDocCategory,
          documentNumber:
            primaryDocNumber.trim() || vesselFormData.registrationNumber.trim(),
          notes: isEditMode
            ? "Dokumen pendukung pembaruan data kapal"
            : "Dokumen pendukung utama registrasi kapal",
          file: primaryDocFile,
        });
      }
      if (secondaryDocFile) {
        attachments.push({
          category: secondaryDocCategory,
          documentNumber: secondaryDocNumber.trim() || undefined,
          notes: "Dokumen pendukung tambahan kapal",
          file: secondaryDocFile,
        });
      }

      if (editingVessel) {
        const updated = await updateVessel(
          editingVessel.id,
          {
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
          },
          attachments
        );
        setIsAddVesselModalOpen(false);
        setEditingVessel(null);
        toast.success(
          "Armada Berhasil Diperbarui",
          attachments.length > 0
            ? `Data kapal ${updated.name} berhasil diperbarui beserta ${attachments.length} berkas baru.`
            : `Data kapal ${updated.name} berhasil diperbarui.`
        );
      } else {
        const created = await createVessel(
          {
            operatorId: user?.operatorId || operator?.id || undefined,
            relationshipType: claimRelationshipType,
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
          },
          attachments
        );
        setIsAddVesselModalOpen(false);
        toast.success(
          "Armada Berhasil Didaftarkan",
          `Kapal ${created.name} (${created.grossTonnage} GT) beserta foto & ${Math.max(
            0,
            attachments.length - 1
          )} dokumen pendukung telah tersimpan.`
        );
      }
    } catch (err: unknown) {
      if (
        !editingVessel &&
        err instanceof ApiException &&
        err.statusCode === 409 &&
        err.details &&
        typeof err.details === "object"
      ) {
        const details = err.details as VesselConflictErrorDetails;
        if (
          details.code === "DUPLICATE_VESSEL_IDENTITY" ||
          details.code === "POSSIBLE_DUPLICATE_VESSEL"
        ) {
          setVesselConflict(details);
          setIsAddVesselModalOpen(false);
          setIsCatalogModalOpen(true);
          setIsSubmitting(false);
          return;
        }
      }
      const msg =
        err instanceof Error
          ? err.message
          : editingVessel
          ? "Gagal memperbarui data armada kapal."
          : "Gagal mendaftarkan armada kapal.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
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

      {!isOperatorVerified && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3 min-w-0">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs text-amber-950">
                  Tahap Aktivasi Kemitraan Pelayaran
                </span>
                <span className="text-[10px] font-mono font-bold bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-full">
                  Verifikator: Petugas Registrasi &amp; Kontrak
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Lengkapi <strong>5 berkas wajib badan usaha</strong> di bawah ini serta daftarkan
                unit kapal Anda pada tab <strong>Master Data Armada</strong>. Seluruh menu
                operasional akan aktif otomatis setelah berkas disahkan oleh petugas.
              </p>
            </div>
          </div>
          {activeTab !== "profil" && (
            <button
              type="button"
              onClick={() => setActiveTab("profil")}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shrink-0 cursor-pointer shadow-xs"
            >
              Unggah Berkas Legalitas
            </button>
          )}
        </div>
      )}

      {/* TOP ELEVATED CONTROL DECK & SUB-MODULE TABS */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-3 sm:p-3.5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => setActiveTab("profil")}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "profil"
                ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                : "text-[#64748B] hover:text-[#0B241E] hover:bg-white/70"
            }`}
          >
            <Building2
              className={`w-4 h-4 ${activeTab === "profil" ? "text-[#D97706]" : "text-[#64748B]"}`}
            />
            <span>Legalitas Badan Usaha</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("armada")}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "armada"
                ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                : "text-[#64748B] hover:text-[#0B241E] hover:bg-white/70"
            }`}
          >
            <Ship
              className={`w-4 h-4 ${activeTab === "armada" ? "text-[#D97706]" : "text-[#64748B]"}`}
            />
            <span>Master Data Armada ({totalFleetCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("akun")}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "akun"
                ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                : "text-[#64748B] hover:text-[#0B241E] hover:bg-white/70"
            }`}
          >
            <KeyRound
              className={`w-4 h-4 ${activeTab === "akun" ? "text-[#D97706]" : "text-[#64748B]"}`}
            />
            <span>Akun &amp; Keamanan</span>
            {user?.mustChangePassword && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white">
                Ganti Sandi
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchDashboardData()}
            disabled={isLoading}
            className="p-2.5 border border-[#CBD5E1] bg-white rounded-xl hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0B241E] cursor-pointer disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          {activeTab === "armada" && (
            <button
              type="button"
              onClick={handleOpenAddVessel}
              className="px-4 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#D97706]" />
              <span>Daftarkan Armada Kapal Baru</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === "armada" && (
        <FleetManagementTab
          vessels={vessels}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          totalFleetCount={totalFleetCount}
          verifiedFleetCount={verifiedFleetCount}
          pendingFleetCount={pendingFleetCount}
          isVesselPhotoDoc={isVesselPhotoDoc}
          onOpenEditVessel={handleOpenEditVessel}
          onUnlinkVessel={setUnlinkTarget}
        />
      )}

      {activeTab === "profil" && (
        <CompanyProfileTab
          operator={operator}
          userOperatorId={user?.operatorId ? Number(user.operatorId) : undefined}
          userEmail={user?.email}
          isOperatorVerified={isOperatorVerified}
          isOperatorRejected={isOperatorRejected}
          operatorStatusLabel={operatorStatusLabel}
          onUploadOperatorDocument={uploadOperatorDocument}
        />
      )}

      {activeTab === "akun" && (
        <AccountSecurityTab
          user={user}
          operator={operator}
          onUpdateOperatorProfile={updateOperatorProfile}
          onUpdateMyProfile={updateMyProfile}
          onChangeMyPassword={changeMyPassword}
        />
      )}

      <FleetCatalogModal
        isOpen={isCatalogModalOpen}
        onClose={() => {
          setIsCatalogModalOpen(false);
          setVesselConflict(null);
        }}
        errorMessage={errorMessage}
        vesselConflict={vesselConflict}
        isSubmitting={isSubmitting}
        vessels={vessels}
        claimRelationshipType={claimRelationshipType}
        onChangeClaimRelationshipType={setClaimRelationshipType}
        onClaimFromCatalog={(id, name) => void handleClaimFromCatalog(id, name)}
        onForceRegisterNewVessel={() => {
          setIsCatalogModalOpen(false);
          void submitNewVessel(true);
        }}
        onOpenNewVesselForm={(initialName) => {
          setVesselFormData((prev) => ({ ...prev, name: prev.name || initialName }));
          setIsCatalogModalOpen(false);
          setIsAddVesselModalOpen(true);
        }}
      />

      <VesselFormModal
        isOpen={isAddVesselModalOpen}
        editingVessel={editingVessel}
        errorMessage={errorMessage}
        isSubmitting={isSubmitting}
        vesselFormData={vesselFormData}
        onChangeVesselFormData={setVesselFormData}
        vesselPhotoPreview={vesselPhotoPreview}
        vesselPhotoFile={vesselPhotoFile}
        onSelectVesselPhoto={handleSelectVesselPhoto}
        primaryDocCategory={primaryDocCategory}
        onChangePrimaryDocCategory={setPrimaryDocCategory}
        primaryDocNumber={primaryDocNumber}
        onChangePrimaryDocNumber={setPrimaryDocNumber}
        onChangePrimaryDocFile={setPrimaryDocFile}
        showSecondaryDocSlot={showSecondaryDocSlot}
        onToggleSecondaryDocSlot={setShowSecondaryDocSlot}
        secondaryDocCategory={secondaryDocCategory}
        onChangeSecondaryDocCategory={setSecondaryDocCategory}
        secondaryDocNumber={secondaryDocNumber}
        onChangeSecondaryDocNumber={setSecondaryDocNumber}
        onChangeSecondaryDocFile={setSecondaryDocFile}
        isVesselPhotoDoc={isVesselPhotoDoc}
        getBackendFileUrl={getBackendFileUrl}
        onSubmit={(e) => {
          e.preventDefault();
          void submitNewVessel(false);
        }}
        onClose={() => {
          setIsAddVesselModalOpen(false);
          setEditingVessel(null);
        }}
      />

      <ConfirmActionModal
        isOpen={Boolean(unlinkTarget)}
        title={`Lepas Kapal "${unlinkTarget?.name ?? ""}"?`}
        description="Kapal akan dilepas dari daftar armada perusahaan Anda. Data master kapal dan riwayat kunjungan tetap tersimpan aman."
        confirmLabel="Lepas dari Armada"
        variant="warning"
        isLoading={isSubmitting}
        onConfirm={() => void confirmUnlinkVessel()}
        onCancel={() => setUnlinkTarget(null)}
      />
    </div>
  );
}
