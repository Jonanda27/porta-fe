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
  X,
  Clock,
  RefreshCw,
  Anchor,
  FileCheck2,
  Loader2,
  Image as ImageIcon,
  Paperclip,
  ExternalLink,
  Trash2,
  Pencil,
  User,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { API_CONFIG } from "@/config/api.config";
import { useKapalStore } from "@/store/kapal.store";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/toast.store";
import {
  LegalDocSlotSpec,
  OperatorDocument,
  Vessel,
  VesselFormState,
  VesselRegistrationAttachment,
} from "@/types/kapal.types";
import {
  COMPANY_LEGAL_DOC_SLOTS,
  formatDocCategory,
  formatVesselType,
} from "@/lib/kapal-profil";
import { VesselFormModal } from "@/components/kapal/profil/VesselFormModal";

const formatShippingCategory = (category?: string | null): string => {
  switch (category) {
    case "LUAR_NEGERI":
      return "Luar Negeri";
    case "PELRA_PERINTIS":
      return "Pelra / Perintis";
    case "DALAM_NEGERI":
    default:
      return "Dalam Negeri";
  }
};

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
    uploadOperatorDocument,
  } = useKapalStore();

  const [activeTab, setActiveTab] = useState<"profil" | "armada" | "akun">("profil");
  const [isAddVesselModalOpen, setIsAddVesselModalOpen] = useState<boolean>(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [operatorFormData, setOperatorFormData] = useState({
    name: "",
    npwp: "",
    phone: "",
    email: "",
    address: "",
    operatorProfile: "REGULAR_SCHEDULED" as "REGULAR_SCHEDULED" | "INCIDENTAL",
  });
  const [isSavingCompany, setIsSavingCompany] = useState<boolean>(false);
  const [companyError, setCompanyError] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Pengaturan Akun Login & Keamanan (PATCH /auth/me/profile & PATCH /auth/me/password)
  const [accountForm, setAccountForm] = useState({
    fullName: "",
    email: "",
    username: "",
    currentPassword: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showCurrentPwd, setShowCurrentPwd] = useState<boolean>(false);
  const [showNewPwd, setShowNewPwd] = useState<boolean>(false);
  const [isSavingPassword, setIsSavingPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // New / Edit Vessel Form State
  const [vesselFormData, setVesselFormData] = useState<VesselFormState>({
    name: "",
    registrationNumber: "",
    imoNumber: "",
    grossTonnage: 500,
    shipType: "NIAGA" as "NIAGA" | "NON_NIAGA",
    vesselCategory: "BARANG" as "BARANG" | "PENUMPANG" | "CAMPURAN",
    shippingCategory: "DALAM_NEGERI" as "LUAR_NEGERI" | "DALAM_NEGERI" | "PELRA_PERINTIS",
    lengthMeters: 65,
    draftMeters: 4.2,
    flag: "Indonesia",
  });

  // Lampiran Foto & Dokumen Pendukung saat Registrasi / Edit Kapal
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

  const backendOrigin = useMemo(
    () => API_CONFIG.BASE_URL.replace(/\/api\/v1\/?$/, ""),
    []
  );

  const getBackendFileUrl = (filePath?: string | null): string | null => {
    if (!filePath) return null;
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }
    return `${backendOrigin}/${filePath.replace(/^\/+/, "")}`;
  };

  const isVesselPhotoDoc = (doc: OperatorDocument): boolean => {
    return (
      doc.notes === "FOTO_KAPAL" ||
      doc.documentNumber === "FOTO-KAPAL" ||
      (doc.category === "LAINNYA" && Boolean(doc.mimeType?.startsWith("image/")))
    );
  };

  useEffect(() => {
    return () => {
      if (vesselPhotoPreview) {
        URL.revokeObjectURL(vesselPhotoPreview);
      }
    };
  }, [vesselPhotoPreview]);

  // State Inline Upload per Slot Berkas Legalitas Badan Usaha
  const [slotDocNumbers, setSlotDocNumbers] = useState<Record<string, string>>({});
  const [slotSelectedFiles, setSlotSelectedFiles] = useState<Record<string, File | null>>({});
  const [uploadingSlotKey, setUploadingSlotKey] = useState<string | null>(null);
  const [editingSlotKey, setEditingSlotKey] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    refreshMe();
  }, [fetchDashboardData, refreshMe]);

  useEffect(() => {
    if (user) {
      setAccountForm({
        fullName: user.fullName || "",
        email: user.email || "",
        username: user.username || "",
        currentPassword: "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (operator) {
      setOperatorFormData({
        name: operator.name || "",
        npwp: operator.npwp || "",
        phone: operator.phone || "",
        email: operator.email || "",
        address: operator.address || "",
        operatorProfile: operator.operatorProfile || "REGULAR_SCHEDULED",
      });
    }
  }, [operator]);

  const isChangingLoginCredential = useMemo(() => {
    if (!user) return false;
    const nextEmail = accountForm.email.trim().toLowerCase();
    const curEmail = (user.email || "").trim().toLowerCase();
    const nextUsername = accountForm.username.trim().toLowerCase();
    const curUsername = (user.username || "").trim().toLowerCase();
    return nextEmail !== curEmail || nextUsername !== curUsername;
  }, [user, accountForm.email, accountForm.username]);

  const handleSubmitAccountProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);

    const trimmedName = accountForm.fullName.trim();
    const trimmedEmail = accountForm.email.trim().toLowerCase();
    const trimmedUsername = accountForm.username.trim();

    if (!trimmedName) {
      setProfileError("Nama lengkap akun tidak boleh kosong.");
      return;
    }
    if (!trimmedEmail) {
      setProfileError("Alamat email login wajib diisi.");
      return;
    }
    if (trimmedUsername && !/^[a-zA-Z0-9._-]{4,50}$/.test(trimmedUsername)) {
      setProfileError(
        "Username harus 4–50 karakter (hanya huruf, angka, titik, garis bawah, atau strip)."
      );
      return;
    }
    if (isChangingLoginCredential && !accountForm.currentPassword) {
      setProfileError(
        "Kata sandi saat ini wajib diisi untuk memverifikasi perubahan email atau username."
      );
      return;
    }

    setIsSavingProfile(true);
    try {
      const updated = await updateMyProfile({
        fullName: trimmedName,
        email: trimmedEmail,
        username: trimmedUsername ? trimmedUsername : null,
        ...(isChangingLoginCredential
          ? { currentPassword: accountForm.currentPassword }
          : {}),
      });
      setAccountForm({
        fullName: updated.fullName || "",
        email: updated.email || "",
        username: updated.username || "",
        currentPassword: "",
      });
      toast.success("Profil Akun Diperbarui", "Data profil akun login berhasil disimpan.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memperbarui profil akun.";
      setProfileError(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSubmitChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!passwordForm.currentPassword) {
      setPasswordError("Harap masukkan kata sandi saat ini.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Kata sandi baru minimal 6 karakter.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setPasswordError("Kata sandi baru harus berbeda dari kata sandi saat ini.");
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await changeMyPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      toast.success("Kata Sandi Diperbarui", res.message || "Kata sandi berhasil diperbarui!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengganti kata sandi.";
      setPasswordError(msg);
    } finally {
      setIsSavingPassword(false);
    }
  };

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

  const handleOpenAddVessel = () => {
    setEditingVessel(null);
    setVesselFormData({
      name: "",
      registrationNumber: "",
      imoNumber: "",
      grossTonnage: 500,
      shipType: "NIAGA",
      vesselCategory: "BARANG",
      shippingCategory: "DALAM_NEGERI",
      lengthMeters: 65,
      draftMeters: 4.2,
      flag: "Indonesia",
    });
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
    setIsAddVesselModalOpen(true);
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

  const handleSubmitAddVessel = async (e: React.FormEvent) => {
    e.preventDefault();
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
            operatorId: user?.operatorId || operator?.id || 1,
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

  // Filter khusus dokumen level Badan Usaha (bukan dokumen milik unit kapal)
  const companyOnlyDocuments = useMemo(() => {
    return (operator?.documents || []).filter(
      (doc) =>
        !doc.vesselId &&
        doc.category !== "SURAT_UKUR" &&
        doc.category !== "PAS_BESAR_KECIL" &&
        !isVesselPhotoDoc(doc)
    );
  }, [operator?.documents]);

  // Pemetaan setiap slot berkas legalitas dengan dokumen yang sudah terunggah di backend
  const matchedSlotDocs = useMemo(() => {
    const map: Record<string, OperatorDocument | null> = {};
    const usedDocIds = new Set<number>();

    // Pass 1: Cocokkan berdasarkan tag notes `SLOT:<slotKey>` (dokumen yang diunggah dari slot ini)
    for (const slot of COMPANY_LEGAL_DOC_SLOTS) {
      const exactMatch = [...companyOnlyDocuments]
        .reverse()
        .find((d) => d.notes?.startsWith(`SLOT:${slot.slotKey}`) && !usedDocIds.has(d.id));
      if (exactMatch) {
        map[slot.slotKey] = exactMatch;
        usedDocIds.add(exactMatch.id);
      } else {
        map[slot.slotKey] = null;
      }
    }

    // Pass 2: Fallback pencocokan untuk dokumen legacy/seed yang belum punya tag SLOT
    for (const slot of COMPANY_LEGAL_DOC_SLOTS) {
      if (map[slot.slotKey]) continue;
      const fallbackMatch = [...companyOnlyDocuments].reverse().find((d) => {
        if (usedDocIds.has(d.id)) return false;
        if (slot.slotKey === "SIUPAL" && d.category === "SIUPAL_NIB") {
          const isNibOnly =
            d.documentNumber?.toUpperCase().startsWith("NIB") &&
            !d.documentNumber?.toUpperCase().includes("SIUP");
          return !isNibOnly;
        }
        if (slot.slotKey === "NIB" && d.category === "SIUPAL_NIB") {
          return true;
        }
        if (slot.slotKey === "NPWP" && d.category === "NPWP") {
          return true;
        }
        if (slot.category === "LAINNYA" && d.category === "LAINNYA") {
          return true;
        }
        return false;
      });

      if (fallbackMatch) {
        map[slot.slotKey] = fallbackMatch;
        usedDocIds.add(fallbackMatch.id);
      }
    }

    return map;
  }, [companyOnlyDocuments]);

  const completedRequiredSlotsCount = useMemo(() => {
    return COMPANY_LEGAL_DOC_SLOTS.filter(
      (s) => s.required && Boolean(matchedSlotDocs[s.slotKey])
    ).length;
  }, [matchedSlotDocs]);

  const totalRequiredSlotsCount = useMemo(
    () => COMPANY_LEGAL_DOC_SLOTS.filter((s) => s.required).length,
    []
  );

  const handleInlineSlotUpload = async (slot: LegalDocSlotSpec) => {
    const opId = operator?.id || user?.operatorId || 1;
    const file = slotSelectedFiles[slot.slotKey];
    const docNum = (slotDocNumbers[slot.slotKey] || "").trim();

    if (!file) {
      setErrorMessage(`Silakan pilih file PDF atau Gambar untuk berkas "${slot.title}".`);
      return;
    }

    setUploadingSlotKey(slot.slotKey);
    setErrorMessage(null);

    try {
      await uploadOperatorDocument(
        opId,
        {
          category: slot.category,
          documentNumber: docNum || `${slot.slotKey}-${new Date().getFullYear()}`,
          notes: `SLOT:${slot.slotKey} - ${slot.title}`,
        },
        file
      );

      setSlotSelectedFiles((prev) => ({ ...prev, [slot.slotKey]: null }));
      setEditingSlotKey(null);
      toast.success("Berkas Diunggah", `Dokumen "${slot.title}" berhasil diunggah ke server PORTA.`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : `Gagal mengunggah berkas ${slot.title}.`;
      setErrorMessage(msg);
    } finally {
      setUploadingSlotKey(null);
    }
  };

  const handleSubmitEditOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    const opId = operator?.id || user?.operatorId;
    if (!opId) {
      setCompanyError("ID perusahaan operator tidak ditemukan.");
      return;
    }
    if (!operatorFormData.name.trim()) {
      setCompanyError("Nama perusahaan badan usaha wajib diisi.");
      return;
    }

    setIsSavingCompany(true);
    setCompanyError(null);
    try {
      await updateOperatorProfile(opId, {
        name: operatorFormData.name.trim(),
        npwp: operatorFormData.npwp.trim() || undefined,
        phone: operatorFormData.phone.trim() || undefined,
        email: operatorFormData.email.trim() || undefined,
        address: operatorFormData.address.trim() || undefined,
        operatorProfile: operatorFormData.operatorProfile,
      });
      toast.success(
        "Profil Usaha Diperbarui",
        "Profil badan usaha perusahaan pelayaran berhasil diperbarui."
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal memperbarui profil badan usaha.";
      setCompanyError(msg);
    } finally {
      setIsSavingCompany(false);
    }
  };

  return (
    <div className="space-y-6">
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

      {/* Banner Panduan Singkat untuk Akun yang Belum Terverifikasi */}
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
                Lengkapi <strong>5 berkas wajib badan usaha</strong> di bawah ini serta daftarkan unit kapal Anda pada tab{" "}
                <strong>Master Data Armada</strong>. Seluruh menu operasional akan aktif otomatis setelah berkas disahkan oleh petugas.
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

      {/* ========================================================================= */}
      {/* TOP ELEVATED CONTROL DECK & SUB-MODULE TABS                                */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-3 sm:p-3.5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0]">
          {/* Tab 1: Profil & Legalitas Badan Usaha */}
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
          </button>

          {/* Tab 2: Master Data Armada */}
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
            <span>Master Data Armada ({totalFleetCount})</span>
          </button>

          {/* Tab 3: Pengaturan Akun & Keamanan */}
          <button
            type="button"
            onClick={() => setActiveTab("akun")}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "akun"
                ? "bg-[#0B241E] text-white shadow-xs font-extrabold"
                : "text-[#64748B] hover:text-[#0B241E] hover:bg-white/70"
            }`}
          >
            <KeyRound className={`w-4 h-4 ${activeTab === "akun" ? "text-[#D97706]" : "text-[#64748B]"}`} />
            <span>Akun &amp; Keamanan</span>
            {user?.mustChangePassword && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white">
                Ganti Sandi
              </span>
            )}
          </button>
        </div>

        {/* Contextual Action & Refresh */}
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

      {/* ========================================================================= */}
      {/* TAB 1: MASTER DATA ARMADA KAPAL                                           */}
      {/* ========================================================================= */}
      {activeTab === "armada" && (
        <section className="space-y-4">
          {/* Filter Kategori & Ringkasan Status Verifikasi Ringkas */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#CBD5E1] p-3 rounded-2xl shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#64748B] px-1.5">Kategori:</span>
              {[
                { id: "ALL", label: "Semua", icon: Ship },
                { id: "BARANG", label: "Barang / Kargo", icon: Anchor },
                { id: "PENUMPANG", label: "Penumpang", icon: Ship },
                { id: "CAMPURAN", label: "Campuran / Ro-Ro", icon: Ship },
              ].map((item) => {
                const isActive = selectedCategory === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setSelectedCategory(
                        item.id as "ALL" | "BARANG" | "PENUMPANG" | "CAMPURAN"
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? "bg-[#0B241E] text-white shadow-xs"
                        : "bg-[#F8FAFC] text-[#64748B] hover:text-[#0B241E] border border-[#E2E8F0]"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#D97706]" : "text-[#94A3B8]"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Terverifikasi: {verifiedFleetCount}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-bold">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Menunggu: {pendingFleetCount}</span>
              </span>
              {selectedCategory !== "ALL" && (
                <span className="text-[#64748B] font-medium pl-1">
                  Menampilkan <strong className="text-[#0B241E]">{vessels.length}</strong> dari{" "}
                  {totalFleetCount}
                </span>
              )}
            </div>
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
                const photoDocs = (vessel.documents || []).filter(isVesselPhotoDoc);
                const latestPhotoDoc =
                  photoDocs.length > 0 ? photoDocs[photoDocs.length - 1] : null;
                const photoUrl = getBackendFileUrl(latestPhotoDoc?.filePath);
                const legalDocs = (vessel.documents || []).filter(
                  (d) => !isVesselPhotoDoc(d)
                );

                return (
                  <div
                    key={vessel.id}
                    className="bg-white border border-[#CBD5E1] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Banner Foto Fisik Kapal */}
                      <div className="relative h-40 w-full bg-gradient-to-br from-[#0B241E] to-[#163D32] overflow-hidden">
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={`Foto ${vessel.name}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-white/70 gap-1.5">
                            <Ship className="w-9 h-9 text-[#D97706]/80" />
                            <span className="text-[10.5px] font-medium text-white/60">
                              Belum ada foto kapal
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                        <span
                          className={`absolute top-3 right-3 text-[9.5px] font-bold px-2.5 py-0.5 rounded-full uppercase shadow-xs ${
                            isVerified
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-amber-100 text-amber-900 border border-amber-300"
                          }`}
                        >
                          {isVerified ? "Terverifikasi" : "Menunggu Verifikasi Petugas"}
                        </span>
                      </div>

                      <div className="p-5 pb-0">
                        <div className="border-b border-[#F1F5F9] pb-3">
                          <h3 className="font-extrabold text-sm text-[#0B241E] truncate">
                            {vessel.name}
                          </h3>
                          <p className="text-[11px] font-mono text-[#64748B] mt-0.5 truncate">
                            {vessel.registrationNumber}
                            {vessel.imoNumber ? ` • IMO: ${vessel.imoNumber}` : ""}
                          </p>
                        </div>

                        {/* Spesifikasi Kapal */}
                        <div className="grid grid-cols-2 gap-2 text-xs py-3 text-[#64748B]">
                          <div className="bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0]">
                            <span className="text-[10px] text-[#94A3B8] font-bold block uppercase">
                              Bobot GT
                            </span>
                            <strong className="text-[#0B241E] font-mono text-sm">
                              {Number(vessel.grossTonnage).toLocaleString()} GT
                            </strong>
                          </div>

                          <div className="bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0]">
                            <span className="text-[10px] text-[#94A3B8] font-bold block uppercase">
                              Kategori Pelayaran
                            </span>
                            <strong className="text-[#0B241E] text-xs">
                              {formatShippingCategory(vessel.shippingCategory)}
                            </strong>
                          </div>

                          <div className="bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0]">
                            <span className="text-[10px] text-[#94A3B8] font-bold block uppercase">
                              Dimensi LoA / Draft
                            </span>
                            <span className="text-[#0B241E] font-mono text-[11px]">
                              {vessel.lengthMeters ? `${vessel.lengthMeters}m` : "-"} /{" "}
                              {vessel.draftMeters ? `${vessel.draftMeters}m` : "-"}
                            </span>
                          </div>

                          <div className="bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0]">
                            <span className="text-[10px] text-[#94A3B8] font-bold block uppercase">
                              Tipe Kapal
                            </span>
                            <span className="text-[#0B241E] font-semibold text-[11px]">
                              {formatVesselType(vessel.shipType, vessel.vesselCategory)}
                            </span>
                          </div>
                        </div>

                        {/* Dokumen Pendukung Kapal yang Diunggah */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold uppercase text-[#94A3B8] block">
                            Dokumen Pendukung ({legalDocs.length})
                          </span>
                          {legalDocs.length > 0 ? (
                            <div className="space-y-1">
                              {legalDocs.map((doc) => {
                                const docUrl = getBackendFileUrl(doc.filePath);
                                return (
                                  <div
                                    key={doc.id}
                                    className="flex items-center justify-between gap-2 text-[11px] bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200"
                                  >
                                    <span
                                      className="font-medium text-[#0B241E] truncate"
                                      title={`${formatDocCategory(doc.category)}: ${doc.fileName}`}
                                    >
                                      <strong className="text-[#334155]">
                                        {formatDocCategory(doc.category)}:
                                      </strong>{" "}
                                      {doc.fileName}
                                    </span>
                                    {docUrl && (
                                      <a
                                        href={docUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#0284C7] hover:text-[#0B241E] font-bold inline-flex items-center gap-1 shrink-0 text-[10.5px]"
                                        title="Buka berkas"
                                      >
                                        <span>Buka</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-[11px] text-[#94A3B8] italic">
                              Belum ada dokumen Surat Ukur / Pas Besar terlampir.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tombol Edit Data Kapal (Membuka Modal Edit + Foto + Dokumen) */}
                    <div className="p-5 pt-4 mt-2 border-t border-[#F1F5F9]">
                      <button
                        type="button"
                        onClick={() => handleOpenEditVessel(vessel)}
                        className="w-full py-2 bg-[#F1F5F9] hover:bg-[#0B241E] hover:text-white text-[#0B241E] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#D97706]" />
                        <span>Edit Data Kapal</span>
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-extrabold text-[#0B241E]">
                      {operator?.name || "PT Pelayaran Mimika Sejahtera"}
                    </h2>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isOperatorVerified
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : isOperatorRejected
                          ? "bg-rose-100 text-rose-800 border-rose-300"
                          : "bg-amber-100 text-amber-900 border-amber-300"
                      }`}
                    >
                      {operatorStatusLabel}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Operator Angkutan Laut Terdaftar • Profil:{" "}
                    <strong className="font-semibold text-[#334155]">
                      {operator?.operatorProfile === "INCIDENTAL"
                        ? "Insidental / Non-Reguler"
                        : "Rutin Terjadwal"}
                    </strong>
                  </p>
                </div>
              </div>
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

          {/* Checklist & Upload Langsung Berkas Legalitas Badan Usaha (Tanpa Modal) */}
          <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#0B241E] flex items-center gap-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                  <span>
                    Kelengkapan Berkas Legalitas &amp; Perizinan Berusaha
                  </span>
                </h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Masukkan nomor surat dan unggah file langsung pada masing-masing baris dokumen di bawah ini (format PDF, JPG, atau PNG).
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border ${
                    completedRequiredSlotsCount >= totalRequiredSlotsCount
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-amber-50 text-amber-900 border-amber-200"
                  }`}
                >
                  Wajib Terunggah: {completedRequiredSlotsCount}/{totalRequiredSlotsCount} Berkas
                </span>
              </div>
            </div>

            {errorMessage && activeTab === "profil" && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-600 hover:text-rose-900 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="space-y-3.5">
              {COMPANY_LEGAL_DOC_SLOTS.map((slot, index) => {
                const uploadedDoc = matchedSlotDocs[slot.slotKey];
                const docUrl = getBackendFileUrl(uploadedDoc?.filePath);
                const isUploadingThisSlot = uploadingSlotKey === slot.slotKey;
                const isEditingThisSlot = !uploadedDoc || editingSlotKey === slot.slotKey;
                const selectedFile = slotSelectedFiles[slot.slotKey] || null;
                const docNumValue =
                  slotDocNumbers[slot.slotKey] !== undefined
                    ? slotDocNumbers[slot.slotKey]
                    : uploadedDoc?.documentNumber || "";

                return (
                  <div
                    key={slot.slotKey}
                    className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                      uploadedDoc
                        ? "bg-[#FAFCFB] border-emerald-200/90"
                        : "bg-white border-[#CBD5E1] hover:border-[#0B241E]/40"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Kiri: Informasi Persyaratan Berkas */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-mono text-xs font-extrabold border ${
                            uploadedDoc
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-[#F1F5F9] text-[#0B241E] border-[#CBD5E1]"
                          }`}
                        >
                          {uploadedDoc ? (
                            <FileCheck2 className="w-4.5 h-4.5 text-emerald-700" />
                          ) : (
                            <span>0{index + 1}</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs sm:text-[13px] font-extrabold text-[#0B241E]">
                              {slot.title}
                            </h4>
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                                slot.required
                                  ? "bg-amber-50 text-amber-900 border-amber-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                            >
                              {slot.shortBadge}
                            </span>
                            {uploadedDoc ? (
                              <span
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                  isOperatorVerified
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                    : "bg-sky-50 text-sky-800 border-sky-200"
                                }`}
                              >
                                {isOperatorVerified
                                  ? "Terverifikasi Petugas"
                                  : "Terunggah • Menunggu Verifikasi Petugas"}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                Belum Diunggah
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[#64748B] leading-relaxed">
                            {slot.description}
                          </p>

                          {/* Info Berkas Jika Sudah Diunggah */}
                          {uploadedDoc && (
                            <div className="pt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-mono text-[#334155]">
                              <span className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-[#E2E8F0]">
                                <Paperclip className="w-3 h-3 text-emerald-700" />
                                <strong className="text-[#0B241E]">{uploadedDoc.fileName}</strong>
                              </span>
                              <span>
                                No. Dokumen:{" "}
                                <strong className="text-[#0B241E]">
                                  {uploadedDoc.documentNumber || "-"}
                                </strong>
                              </span>
                              <span className="text-[#64748B]">
                                Diunggah:{" "}
                                {new Date(uploadedDoc.createdAt).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                              {docUrl && (
                                <a
                                  href={docUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#0284C7] hover:text-[#0B241E] font-sans font-bold inline-flex items-center gap-1 underline"
                                >
                                  <span>Lihat Berkas</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Kanan: Tombol Ganti Berkas bila sudah terunggah & tidak sedang mode edit */}
                      {uploadedDoc && !isEditingThisSlot && (
                        <div className="shrink-0 flex items-center gap-2 self-end lg:self-center">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSlotKey(slot.slotKey);
                              setSlotDocNumbers((prev) => ({
                                ...prev,
                                [slot.slotKey]: uploadedDoc.documentNumber || "",
                              }));
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F1F5F9] text-[#0B241E] border border-[#CBD5E1] text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5 text-[#D97706]" />
                            <span>Perbarui Berkas</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Panel Form Inline Upload (Muncul langsung bila belum diunggah atau saat klik Perbarui Berkas) */}
                    {isEditingThisSlot && (
                      <div className="mt-4 pt-3.5 border-t border-[#E2E8F0] grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                        <div className="md:col-span-5">
                          <label className="block text-[11px] font-bold text-[#0B241E] mb-1">
                            Nomor Surat / SK / Identitas Dokumen
                          </label>
                          <input
                            type="text"
                            value={docNumValue}
                            onChange={(e) =>
                              setSlotDocNumbers((prev) => ({
                                ...prev,
                                [slot.slotKey]: e.target.value,
                              }))
                            }
                            placeholder={slot.placeholderNumber}
                            className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-mono text-[#0B241E] focus:border-[#0B241E] focus:outline-hidden"
                          />
                        </div>

                        <div className="md:col-span-4">
                          <label className="block text-[11px] font-bold text-[#0B241E] mb-1">
                            Pilih File Berkas (PDF / JPG / PNG) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setSlotSelectedFiles((prev) => ({
                                ...prev,
                                [slot.slotKey]: file,
                              }));
                            }}
                            className="w-full text-xs text-[#64748B] file:mr-2.5 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#F1F5F9] hover:file:bg-[#E2E8F0] file:text-[#0B241E] file:font-bold file:text-xs cursor-pointer bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-1"
                          />
                        </div>

                        <div className="md:col-span-3 flex items-center justify-end gap-2">
                          {uploadedDoc && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSlotKey(null);
                                setSlotSelectedFiles((prev) => ({
                                  ...prev,
                                  [slot.slotKey]: null,
                                }));
                              }}
                              className="px-3 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:text-[#0B241E] cursor-pointer"
                            >
                              Batal
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={isUploadingThisSlot || !selectedFile}
                            onClick={() => handleInlineSlotUpload(slot)}
                            className="w-full md:w-auto px-4 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-extrabold transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                          >
                            {isUploadingThisSlot ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D97706]" />
                                <span>Mengunggah...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5 text-[#D97706]" />
                                <span>{uploadedDoc ? "Simpan Berkas Baru" : "Unggah Berkas"}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PENGATURAN PROFIL PERUSAHAAN, AKUN LOGIN & KEAMANAN                */}
      {/* ========================================================================= */}
      {activeTab === "akun" && (
        <section className="space-y-5">
          {user?.mustChangePassword && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-sm text-amber-950">
                  Disarankan Segera Mengganti Kata Sandi Awal
                </p>
                <p className="text-amber-900 mt-0.5 leading-relaxed">
                  Akun Anda masih menggunakan kata sandi awal yang dibuat oleh sistem/admin. Demi keamanan operasional armada, silakan perbarui kata sandi Anda di bawah ini.
                </p>
              </div>
            </div>
          )}

          {/* Card 0: Profil Badan Usaha Perusahaan Pelayaran (PATCH /operators/:id) */}
          <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#0B241E]">
                  Profil Badan Usaha Perusahaan Pelayaran
                </h3>
                <p className="text-xs text-[#64748B]">
                  Perbarui identitas resmi perusahaan, NPWP, kontak operasional, dan alamat kantor cabang pelabuhan.
                </p>
              </div>
            </div>

            {companyError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{companyError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitEditOperator} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block font-bold text-[#0B241E] mb-1">
                    Nama Badan Usaha / Perusahaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={operatorFormData.name}
                    onChange={(e) =>
                      setOperatorFormData({ ...operatorFormData, name: e.target.value })
                    }
                    placeholder="Contoh: PT Pelayaran Mimika Sejahtera"
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-semibold focus:border-[#0B241E] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0B241E] mb-1">
                    NPWP Perusahaan
                  </label>
                  <input
                    type="text"
                    value={operatorFormData.npwp}
                    onChange={(e) =>
                      setOperatorFormData({ ...operatorFormData, npwp: e.target.value })
                    }
                    placeholder="01.234.567.8-954.000"
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-mono focus:border-[#0B241E] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0B241E] mb-1">
                    Profil Operasional Pelayaran
                  </label>
                  <select
                    value={operatorFormData.operatorProfile}
                    onChange={(e) =>
                      setOperatorFormData({
                        ...operatorFormData,
                        operatorProfile: e.target.value as "REGULAR_SCHEDULED" | "INCIDENTAL",
                      })
                    }
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-semibold focus:border-[#0B241E] focus:outline-hidden"
                  >
                    <option value="REGULAR_SCHEDULED">Rutin Terjadwal</option>
                    <option value="INCIDENTAL">Insidental / Non-Reguler</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#0B241E] mb-1">
                    Nomor Telepon Operasional
                  </label>
                  <input
                    type="text"
                    value={operatorFormData.phone}
                    onChange={(e) =>
                      setOperatorFormData({ ...operatorFormData, phone: e.target.value })
                    }
                    placeholder="0811-4800-291"
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-mono focus:border-[#0B241E] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0B241E] mb-1">
                    Email Resmi Perusahaan
                  </label>
                  <input
                    type="email"
                    value={operatorFormData.email}
                    onChange={(e) =>
                      setOperatorFormData({ ...operatorFormData, email: e.target.value })
                    }
                    placeholder="ops@perusahaan.co.id"
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-mono focus:border-[#0B241E] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0B241E] mb-1">
                    Alamat Kantor Pelabuhan
                  </label>
                  <input
                    type="text"
                    value={operatorFormData.address}
                    onChange={(e) =>
                      setOperatorFormData({ ...operatorFormData, address: e.target.value })
                    }
                    placeholder="Alamat lengkap kantor cabang pelabuhan"
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-medium focus:border-[#0B241E] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end border-t border-[#F1F5F9]">
                <button
                  type="submit"
                  disabled={isSavingCompany}
                  className="px-5 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white font-extrabold rounded-xl shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isSavingCompany && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSavingCompany ? "Menyimpan..." : "Simpan Profil Perusahaan"}</span>
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Card 1: Identitas Akun Login */}
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0B241E]">
                    Identitas Akun Login
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Perbarui nama PIC akun, alamat email login, atau username portal.
                  </p>
                </div>
              </div>

              {profileError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitAccountProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#0B241E] mb-1">
                    Nama Lengkap Akun / PIC <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={accountForm.fullName}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, fullName: e.target.value })
                    }
                    placeholder="Contoh: Budi Santoso"
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-semibold focus:border-[#0B241E] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0B241E] mb-1">
                    Alamat Email Login <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={accountForm.email}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, email: e.target.value })
                    }
                    placeholder="operator@perusahaan.co.id"
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-mono focus:border-[#0B241E] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0B241E] mb-1">
                    Username Alternatif (Opsional)
                  </label>
                  <input
                    type="text"
                    value={accountForm.username}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, username: e.target.value })
                    }
                    placeholder="Contoh: mimika.shipping (4–50 karakter, tanpa @)"
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-mono focus:border-[#0B241E] focus:outline-hidden"
                  />
                  <p className="text-[10.5px] text-[#64748B] mt-1">
                    Hanya huruf, angka, titik (.), garis bawah (_), atau strip (-).
                  </p>
                </div>

                {isChangingLoginCredential && (
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                    <label className="block font-bold text-amber-950">
                      Kata Sandi Saat Ini (Verifikasi Perubahan Email/Username){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={accountForm.currentPassword}
                      onChange={(e) =>
                        setAccountForm({
                          ...accountForm,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="Masukkan kata sandi saat ini"
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-semibold focus:border-[#0B241E] focus:outline-hidden"
                    />
                  </div>
                )}

                <div className="pt-2 flex justify-end border-t border-[#F1F5F9]">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-5 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white font-extrabold rounded-xl shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {isSavingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isSavingProfile ? "Menyimpan..." : "Simpan Profil Akun"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Card 2: Ganti Kata Sandi */}
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0B241E]">
                    Keamanan &amp; Ganti Kata Sandi
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Gunakan kata sandi kuat minimal 6 karakter. Sesi token diperbarui otomatis.
                  </p>
                </div>
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitChangePassword} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#0B241E] mb-1">
                    Kata Sandi Saat Ini <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPwd ? "text" : "password"}
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="Masukkan kata sandi saat ini"
                      className="w-full p-2.5 pr-10 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-semibold focus:border-[#0B241E] focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPwd((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0B241E] p-1 cursor-pointer"
                      title={showCurrentPwd ? "Sembunyikan" : "Tampilkan"}
                    >
                      {showCurrentPwd ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#0B241E] mb-1">
                    Kata Sandi Baru <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPwd ? "text" : "password"}
                      required
                      minLength={6}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Minimal 6 karakter"
                      className="w-full p-2.5 pr-10 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-semibold focus:border-[#0B241E] focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0B241E] p-1 cursor-pointer"
                      title={showNewPwd ? "Sembunyikan" : "Tampilkan"}
                    >
                      {showNewPwd ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#0B241E] mb-1">
                    Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showNewPwd ? "text" : "password"}
                    required
                    minLength={6}
                    value={passwordForm.confirmNewPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmNewPassword: e.target.value,
                      })
                    }
                    placeholder="Ulangi kata sandi baru"
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-semibold focus:border-[#0B241E] focus:outline-hidden"
                  />
                </div>

                <div className="pt-2 flex justify-end border-t border-[#F1F5F9]">
                  <button
                    type="submit"
                    disabled={isSavingPassword}
                    className="px-5 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white font-extrabold rounded-xl shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {isSavingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isSavingPassword ? "Memperbarui..." : "Perbarui Kata Sandi"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DAFTARKAN / EDIT ARMADA KAPAL (DATA + FOTO + DOKUMEN)              */}
      {/* ========================================================================= */}
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
        onSubmit={handleSubmitAddVessel}
        onClose={() => {
          setIsAddVesselModalOpen(false);
          setEditingVessel(null);
        }}
      />
    </div>
  );
}
