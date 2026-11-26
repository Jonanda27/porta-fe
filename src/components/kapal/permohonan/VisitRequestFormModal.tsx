"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  Ship,
  Clock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Send,
  Check,
  FileCheck2,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ShieldCheck,
  Droplets,
  Zap,
  Trash2,
  Printer,
  ArrowRight,
  Loader2,
  Anchor,
  ClipboardList,
  Compass,
  Route,
  AlertCircle,
  FileSignature,
  ExternalLink,
  Paperclip,
} from "lucide-react";
import { formatRupiah } from "@/lib/kapal-billing";
import { formatDocCategory } from "@/lib/kapal-profil";
import {
  DestinationPortOption,
  FleetOption,
  getPermohonanFileUrl,
} from "@/lib/kapal-permohonan";
import { VisitCostEstimateResult } from "@/lib/tariff-estimator";
import { CustomSelectField } from "@/components/ui/CustomSelectField";
import { OperatorBerthingContract, Vessel } from "@/types/kapal.types";
import { BerthItem } from "@/types/port.types";

export interface VisitRequestFormModalProps {
  wizardStep: number;
  onWizardStepChange: (step: number) => void;
  hasAnyActiveContract: boolean;
  hasActiveBerthingContract: boolean;
  contracts: OperatorBerthingContract[];
  activeContracts: OperatorBerthingContract[];
  activeBerthingContract: OperatorBerthingContract | null;
  onSwitchToTracking: () => void;
  vessels: Vessel[];
  fleetOptions: FleetOption[];
  selectedVesselId: string;
  onSelectVesselId: (id: string) => void;
  activeVessel: FleetOption;
  activityType: string;
  onActivityTypeChange: (value: string) => void;
  originPort: string;
  onOriginPortChange: (value: string) => void;
  destinationPort: string;
  onDestinationPortChange: (value: string) => void;
  destinationPortOptions: DestinationPortOption[];
  derivedRoute: string;
  needFreshWater: boolean;
  onNeedFreshWaterChange: (checked: boolean) => void;
  waterVolume: number;
  onWaterVolumeChange: (val: number) => void;
  needShorePower: boolean;
  onNeedShorePowerChange: (checked: boolean) => void;
  powerKwh: number;
  onPowerKwhChange: (val: number) => void;
  needWasteDisposal: boolean;
  onNeedWasteDisposalChange: (checked: boolean) => void;
  todayDateStr: string;
  currentTimeStr: string;
  etaDate: string;
  etaTime: string;
  etdDate: string;
  etdTime: string;
  onEtaDateChange: (val: string) => void;
  onEtaTimeChange: (val: string) => void;
  onEtdDateChange: (val: string) => void;
  onEtdTimeChange: (val: string) => void;
  serviceDurationHours: number;
  onServiceDurationHoursChange: (hours: number) => void;
  scheduleError: string | null;
  isScheduleValid: boolean;
  docManifestDraft: boolean;
  onDocManifestDraftChange: (checked: boolean) => void;
  tripDocumentFile: File | null;
  onTripDocumentFileChange: (file: File | null) => void;
  additionalNote: string;
  onAdditionalNoteChange: (note: string) => void;
  costs: VisitCostEstimateResult;
  agreementChecked: boolean;
  onAgreementCheckedChange: (checked: boolean) => void;
  isSubmitting: boolean;
  onFinalSubmit: () => void;
  createdTicketId: string | null;
  activeBerth: BerthItem | undefined;
  onResetForm: () => void;
}

export function VisitRequestFormModal({
  wizardStep,
  onWizardStepChange,
  hasAnyActiveContract,
  hasActiveBerthingContract,
  contracts,
  activeContracts,
  activeBerthingContract,
  onSwitchToTracking,
  vessels,
  fleetOptions,
  onSelectVesselId,
  activeVessel,
  activityType,
  onActivityTypeChange,
  originPort,
  onOriginPortChange,
  destinationPort,
  onDestinationPortChange,
  destinationPortOptions,
  derivedRoute,
  needFreshWater,
  onNeedFreshWaterChange,
  waterVolume,
  onWaterVolumeChange,
  needShorePower,
  onNeedShorePowerChange,
  powerKwh,
  onPowerKwhChange,
  needWasteDisposal,
  onNeedWasteDisposalChange,
  todayDateStr,
  currentTimeStr,
  etaDate,
  etaTime,
  etdDate,
  etdTime,
  onEtaDateChange,
  onEtaTimeChange,
  onEtdDateChange,
  onEtdTimeChange,
  serviceDurationHours,
  onServiceDurationHoursChange,
  scheduleError,
  isScheduleValid,
  docManifestDraft,
  onDocManifestDraftChange,
  tripDocumentFile,
  onTripDocumentFileChange,
  additionalNote,
  onAdditionalNoteChange,
  costs,
  agreementChecked,
  onAgreementCheckedChange,
  isSubmitting,
  onFinalSubmit,
  createdTicketId,
  activeBerth,
  onResetForm,
}: VisitRequestFormModalProps) {
  const [isVesselDropdownOpen, setIsVesselDropdownOpen] = useState<boolean>(false);
  const vesselDropdownRef = useRef<HTMLDivElement>(null);

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

  if (!hasAnyActiveContract) {
    const pendingContract = contracts?.find(
      (c) =>
        c.status === "PENDING_VERIFICATION" ||
        c.status === "PENDING_HEAD_OF_PORT"
    );

    return (
      <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xs p-6 sm:p-10">
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
              onClick={onSwitchToTracking}
              className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-50 text-[#0B241E] border border-[#CBD5E1] font-bold rounded-xl text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Lihat Riwayat Permohonan</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedVesselEntity = vessels.find(
    (v) => String(v.id) === activeVessel.id
  );
  const vesselDocs = (selectedVesselEntity?.documents || []).filter(
    (d) =>
      !d.mimeType?.startsWith("image/") ||
      d.category === "SURAT_UKUR" ||
      d.category === "PAS_BESAR_KECIL"
  );

  return (
    <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xs overflow-hidden">
      {/* Stepper Header (5 Langkah) */}
      <div className="bg-[#0B241E] p-4 sm:p-6 border-b border-[#143E33] text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#D97706] uppercase font-bold">
              PORTAL MANDIRI OPERATOR PELAYARAN
            </span>
            <h2 className="text-base sm:text-lg font-black text-white">
              Permohonan Jadwal &amp; Alokasi Dermaga Sandar
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
        {/* STEP 1: PILIH LAYANAN & FASILITAS */}
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
                              onSelectVesselId(v.id);
                              setIsVesselDropdownOpen(false);
                            }}
                            className={`w-full px-3.5 py-2.5 flex items-center justify-between gap-2.5 text-left transition-colors cursor-pointer ${
                              isSelected ? "bg-emerald-50/70" : "hover:bg-slate-50"
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
                onChange={onActivityTypeChange}
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
                onChange={onOriginPortChange}
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
                onChange={onDestinationPortChange}
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
                    <span>
                      Peringatan: Pelabuhan asal dan tujuan tidak boleh sama. Harap pilih pelabuhan keberangkatan dan sandar yang berbeda.
                    </span>
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
                    onToggle: onNeedFreshWaterChange,
                    activeBox: "bg-blue-50/70 border-blue-300",
                    icon: <Droplets className="w-4 h-4 text-blue-600 shrink-0" />,
                    title: "Air Bersih (Bunkering)",
                    rateDesc: "Tarif resmi: Rp 28.000 / m³ (Pipa Hydrant Dermaga)",
                    inputVal: waterVolume,
                    onInputChange: onWaterVolumeChange,
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
                    onToggle: onNeedShorePowerChange,
                    activeBox: "bg-amber-50/70 border-amber-300",
                    icon: <Zap className="w-4 h-4 text-amber-600 shrink-0" />,
                    title: "Shore Power Listrik",
                    rateDesc: "Tarif resmi: Rp 3.200 / kWh (Cold Ironing Connection)",
                    inputVal: powerKwh,
                    onInputChange: onPowerKwhChange,
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
                    onToggle: onNeedWasteDisposalChange,
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
              ) : (
                <span />
              )}
              <button
                type="button"
                disabled={fleetOptions.length === 0}
                onClick={() => onWizardStepChange(2)}
                className={`px-6 py-2.5 text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-2 ${
                  fleetOptions.length === 0
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-[#0B241E] hover:bg-[#143E33] cursor-pointer"
                }`}
              >
                <span>Lanjut ke Langkah 2: Tentukan Waktu</span>
                <ChevronRight
                  className={`w-4 h-4 ${
                    fleetOptions.length === 0 ? "text-slate-400" : "text-[#D97706]"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: TENTUKAN WAKTU & JADWAL */}
        {wizardStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-black text-[#0B241E] uppercase tracking-wide flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D97706]" />
                <span>Langkah 2: Tentukan Waktu Pelayanan (ETA &amp; ETD)</span>
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
                      onChange={(e) => onEtaDateChange(e.target.value)}
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
                      onChange={(e) => onEtaTimeChange(e.target.value)}
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
                      onChange={(e) => onEtdDateChange(e.target.value)}
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
                      onChange={(e) => onEtdTimeChange(e.target.value)}
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
                      onClick={() => onServiceDurationHoursChange(hrs)}
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
                onClick={() => onWizardStepChange(1)}
                className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0B241E] flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                disabled={!isScheduleValid}
                onClick={() => onWizardStepChange(3)}
                className={`px-6 py-2.5 text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-2 ${
                  isScheduleValid
                    ? "bg-[#0B241E] hover:bg-[#143E33] text-white cursor-pointer"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <span>Lanjut ke Langkah 3: Lengkapi Dokumen</span>
                <ChevronRight
                  className={`w-4 h-4 ${isScheduleValid ? "text-[#D97706]" : "text-slate-400"}`}
                />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DOKUMEN MASTER OTOMATIS & KELENGKAPAN PER-KUNJUNGAN */}
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

            {/* BLOK 1: Berkas Terverifikasi Otomatis */}
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
                    const fileUrl = getPermohonanFileUrl(doc.filePath);
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
                    onChange={(e) => onDocManifestDraftChange(e.target.checked)}
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
                      onClick={() => onTripDocumentFileChange(null)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer shrink-0"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => onTripDocumentFileChange(e.target.files?.[0] || null)}
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
                onChange={(e) => onAdditionalNoteChange(e.target.value)}
                placeholder="Contoh: Membutuhkan prioritas pengisian air tawar segera setelah kapal sandar..."
                className="w-full text-xs font-semibold p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-between border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => onWizardStepChange(2)}
                className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0B241E] flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={() => onWizardStepChange(4)}
                className="px-6 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Lanjut ke Langkah 4: Tinjau &amp; Estimasi Biaya</span>
                <ChevronRight className="w-4 h-4 text-[#D97706]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: TINJAU PERMOHONAN & ESTIMASI BIAYA */}
        {wizardStep === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-black text-[#0B241E] uppercase tracking-wide flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#D97706]" />
                <span>Langkah 4: Tinjau Permohonan &amp; Estimasi Retribusi Resmi</span>
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Periksa ringkasan permohonan. Estimasi dihitung otomatis berdasarkan tarif resmi PP No. 35/2023.
              </p>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#CBD5E1] text-xs">
              <div>
                <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">
                  Kapal &amp; Dimensi
                </span>
                <p className="font-extrabold text-[#0B241E] text-sm mt-0.5">{activeVessel.name}</p>
                <p className="font-mono text-[#64748B] text-[11px]">
                  {activeVessel.gt.toLocaleString()} GT | {activeVessel.callSign}
                </p>
              </div>
              <div>
                <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">
                  Rencana Pelayanan
                </span>
                <p className="font-bold text-[#0B241E] mt-0.5">{destinationPort}</p>
                <p className="text-[11px] text-[#64748B]">
                  {etaDate} ({etaTime} - {etdTime} WIB | {serviceDurationHours} Jam)
                </p>
              </div>
              <div>
                <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">
                  Dermaga &amp; Trayek
                </span>
                <p className="font-bold text-[#0B241E] mt-0.5">Ditetapkan Petugas UPT</p>
                <p className="text-[11px] text-[#64748B]">
                  {derivedRoute} | Menunggu Alokasi Resmi
                </p>
              </div>
            </div>

            {/* DETAILED COST BREAKDOWN TABLE */}
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
                        Pengelolaan Sampah &amp; Limbah Kapal
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
                    <td
                      colSpan={3}
                      className="p-3 text-[#0B241E] text-right uppercase tracking-wider font-extrabold"
                    >
                      Total Estimasi Biaya Retribusi:
                    </td>
                    <td className="p-3 text-right font-mono text-base font-black text-[#0B241E]">
                      {formatRupiah(costs.total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Disclaimer Box */}
            <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-xl text-xs text-amber-950 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Catatan Ketentuan Pelayanan &amp; Tagihan Final (PP 35/2023):</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                <em>
                  Estimasi biaya ditandai jelas. Tagihan final (e-SKRD) mengikuti persetujuan dan realisasi layanan aktual
                </em>{" "}
                berdasarkan pencatatan waktu sandar sebenarnya (ATA / ATB / ATD) serta meteran utilitas riil di dermaga pelabuhan.
              </p>
            </div>

            {/* Pakta Integritas Checkbox */}
            <label className="p-3.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreementChecked}
                onChange={(e) => onAgreementCheckedChange(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-[#0B241E]"
              />
              <div className="text-xs">
                <span className="font-bold text-[#0B241E] block">
                  Pakta Integritas &amp; Konfirmasi Pemohon:
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
                onClick={() => onWizardStepChange(3)}
                className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0B241E] flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  disabled={isSubmitting || !hasActiveBerthingContract}
                  onClick={onFinalSubmit}
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

        {/* STEP 5: KIRIM & PANTAU */}
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
                <span className="text-[10px] uppercase font-bold text-[#94A3B8]">
                  Nomor Tiket Permohonan
                </span>
                <span className="font-mono text-sm font-black text-[#0B241E]">
                  {createdTicketId}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <span className="text-[10px] text-[#64748B] block">Kapal Pemohon:</span>
                  <p className="font-bold text-[#0B241E]">{activeVessel.name}</p>
                  <span className="text-[10px] font-mono text-[#64748B]">
                    {activeVessel.gt} GT
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] block">
                    Dermaga Sandar Diajukan:
                  </span>
                  <p className="font-bold text-[#0B241E]">
                    {activeBerth?.name || "Dermaga Reguler"}
                  </p>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold">
                    {activeBerth?.code}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] block">
                    Rencana Waktu Sandar:
                  </span>
                  <p className="font-bold text-[#0B241E]">
                    {etaDate}, {etaTime} WIT
                  </p>
                  <span className="text-[10px] text-[#64748B]">
                    Durasi: {serviceDurationHours} Jam
                  </span>
                </div>
                <div className="sm:col-span-3 pt-1 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-[11px] text-[#64748B] font-semibold">
                    Total Estimasi Retribusi (PP 35/2023):
                  </span>
                  <p className="font-black text-emerald-800 font-mono text-sm">
                    {formatRupiah(costs.total)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onResetForm}
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
  );
}
