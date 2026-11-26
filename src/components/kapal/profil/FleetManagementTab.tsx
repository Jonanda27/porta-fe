"use client";

import React from "react";
import {
  Ship,
  Anchor,
  ShieldCheck,
  Clock,
  RefreshCw,
  ExternalLink,
  Pencil,
  Unlink,
} from "lucide-react";
import { getBackendFileUrl } from "@/lib/file-url";
import { formatDocCategory, formatVesselType } from "@/lib/kapal-profil";
import { OperatorDocument, Vessel } from "@/types/kapal.types";

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

export interface FleetManagementTabProps {
  vessels: Vessel[];
  isLoading: boolean;
  isSubmitting: boolean;
  selectedCategory: "ALL" | "BARANG" | "PENUMPANG" | "CAMPURAN";
  onSelectCategory: (category: "ALL" | "BARANG" | "PENUMPANG" | "CAMPURAN") => void;
  totalFleetCount: number;
  verifiedFleetCount: number;
  pendingFleetCount: number;
  isVesselPhotoDoc: (doc: OperatorDocument) => boolean;
  onOpenEditVessel: (vessel: Vessel) => void;
  onUnlinkVessel: (vessel: Vessel) => void;
}

export function FleetManagementTab({
  vessels,
  isLoading,
  isSubmitting,
  selectedCategory,
  onSelectCategory,
  totalFleetCount,
  verifiedFleetCount,
  pendingFleetCount,
  isVesselPhotoDoc,
  onOpenEditVessel,
  onUnlinkVessel,
}: FleetManagementTabProps) {
  return (
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
                  onSelectCategory(
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
            const legalDocs = (vessel.documents || []).filter((d) => !isVesselPhotoDoc(d));

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

                {/* Tombol Edit Data Kapal & Lepas dari Armada */}
                <div className="p-5 pt-4 mt-2 border-t border-[#F1F5F9] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenEditVessel(vessel)}
                    className="flex-1 py-2 bg-[#F1F5F9] hover:bg-[#0B241E] hover:text-white text-[#0B241E] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Edit Data Kapal</span>
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => onUnlinkVessel(vessel)}
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
  );
}
