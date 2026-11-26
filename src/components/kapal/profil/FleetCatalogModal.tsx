"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Ship, X, AlertTriangle, Link2, Search, Plus } from "lucide-react";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { formatLabel } from "@/lib/format-labels";
import { KapalService } from "@/services/kapal.service";
import {
  Vessel,
  VesselConflictErrorDetails,
  VesselRelationshipType,
} from "@/types/kapal.types";

export interface FleetCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string | null;
  vesselConflict: VesselConflictErrorDetails | null;
  isSubmitting: boolean;
  vessels: Vessel[];
  claimRelationshipType: VesselRelationshipType;
  onChangeClaimRelationshipType: (type: VesselRelationshipType) => void;
  onClaimFromCatalog: (vesselId: number, vesselName: string) => void;
  onForceRegisterNewVessel: () => void;
  onOpenNewVesselForm: (initialName: string) => void;
}

export function FleetCatalogModal({
  isOpen,
  onClose,
  errorMessage,
  vesselConflict,
  isSubmitting,
  vessels,
  claimRelationshipType,
  onChangeClaimRelationshipType,
  onClaimFromCatalog,
  onForceRegisterNewVessel,
  onOpenNewVesselForm,
}: FleetCatalogModalProps) {
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogResults, setCatalogResults] = useState<Vessel[]>([]);
  const [isSearchingCatalog, setIsSearchingCatalog] = useState(false);

  const loadCatalog = useCallback(async (q?: string) => {
    setIsSearchingCatalog(true);
    try {
      const results = await KapalService.searchVesselCatalog(q?.trim() || undefined);
      setCatalogResults(results);
    } catch {
      setCatalogResults([]);
    } finally {
      setIsSearchingCatalog(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCatalogQuery("");
      void loadCatalog("");
    }
  }, [isOpen, loadCatalog]);

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
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
                  Cari &amp; klaim kapal yang sudah ada di database PORTA terlebih dahulu untuk
                  mencegah duplikasi.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0B241E] cursor-pointer"
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

          {vesselConflict && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2.5 text-xs">
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
                      onClaimFromCatalog(
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
                        onClick={() => onClaimFromCatalog(sv.id, sv.name)}
                        className="px-3 py-1 rounded-lg bg-[#0B241E] text-white font-bold text-[11px] cursor-pointer"
                      >
                        Klaim Kapal Ini
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={onForceRegisterNewVessel}
                    className="px-3.5 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-[11px] cursor-pointer"
                  >
                    Bukan Duplikat — Tetap Daftarkan Kapal Baru
                  </button>
                </div>
              )}
            </div>
          )}

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
                    onChangeClaimRelationshipType(e.target.value as VesselRelationshipType)
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
                    onClick={() => onOpenNewVesselForm(catalogQuery)}
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
                          onClick={() => onClaimFromCatalog(cv.id, cv.name)}
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

            <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between gap-3">
              <span className="text-[11px] text-[#64748B]">Kapal belum terdaftar di PORTA?</span>
              <button
                type="button"
                onClick={() => onOpenNewVesselForm(catalogQuery)}
                className="px-4 py-2 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold rounded-xl cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Daftarkan Kapal Baru</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
