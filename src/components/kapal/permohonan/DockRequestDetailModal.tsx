"use client";

import React from "react";
import { FileText, X, Clock, Anchor, Loader2, DollarSign } from "lucide-react";
import { DockRequest } from "@/types/kapal.types";
import { formatRupiah } from "@/lib/kapal-billing";
import { ModalPortal } from "@/components/ui/ModalPortal";

interface DockRequestDetailModalProps {
  request: DockRequest | null;
  estimatingVisitId: number | null;
  onGenerateOfficialEstimate: (visitId: number) => void;
  onClose: () => void;
}

export function DockRequestDetailModal({
  request,
  estimatingVisitId,
  onGenerateOfficialEstimate,
  onClose,
}: DockRequestDetailModalProps) {
  if (!request) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
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
              <span className="font-mono text-xs text-[#64748B]">{request.id}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0B241E] hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
          <div>
            <span className="text-[#94A3B8] text-[10px] uppercase font-bold block">
              Armada Kapal
            </span>
            <p className="font-bold text-[#0B241E] text-sm mt-0.5">{request.vesselName}</p>
            <p className="font-mono text-[#64748B]">
              {request.gt.toLocaleString()} GT • {request.callSign}
            </p>
          </div>
          <div>
            <span className="text-[#94A3B8] text-[10px] uppercase font-bold block">
              Status Permohonan
            </span>
            <span className="inline-block mt-1 font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {request.statusLabel}
            </span>
          </div>
          <div>
            <span className="text-[#94A3B8] text-[10px] uppercase font-bold block">
              Pelabuhan &amp; Rute
            </span>
            <p className="font-bold text-[#0B241E] mt-0.5">{request.port}</p>
            <p className="text-[#64748B]">{request.route}</p>
          </div>
          <div>
            <span className="text-[#94A3B8] text-[10px] uppercase font-bold block">
              Alokasi Penetapan Dermaga
            </span>
            {request.allocatedDock?.includes("Menunggu") ||
            request.status === "submitted" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 mt-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Menunggu verifikasi &amp; alokasi oleh Petugas UPT</span>
              </span>
            ) : (
              <p className="font-bold text-emerald-800 flex items-center gap-1.5 mt-1 text-xs">
                <Anchor className="w-4 h-4 text-[#D97706]" />
                <span>{request.allocatedDock}</span>
              </p>
            )}
          </div>
        </div>

        {/* Rincian Biaya */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-[#0B241E]">
              {request.officialInvoice
                ? `Rincian Tagihan Resmi Server (${request.officialInvoice.invoiceNumber}):`
                : "Rincian Estimasi Tarif Retribusi (Perda 4/2023):"}
            </span>
            {request.officialInvoice ? (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {request.officialInvoice.billingStage}
              </span>
            ) : (
              request.visitId &&
              request.backendStatus &&
              request.backendStatus !== "REQUESTED" &&
              request.backendStatus !== "CANCELLED" && (
                <button
                  type="button"
                  disabled={estimatingVisitId === request.visitId}
                  onClick={() => onGenerateOfficialEstimate(request.visitId!)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0B241E] hover:bg-[#143E33] text-white text-[11px] font-bold cursor-pointer disabled:opacity-50"
                >
                  {estimatingVisitId === request.visitId ? (
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
            {request.officialInvoice?.items && request.officialInvoice.items.length > 0 ? (
              request.officialInvoice.items.map((item) => (
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
                    <span className="text-[#64748B] block">
                      Jasa Tambat / Sandar Dermaga:
                    </span>
                    {request.costBreakdown.tambatFormula && (
                      <span className="text-[10px] font-mono text-[#94A3B8]">
                        {request.costBreakdown.tambatFormula}
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-[#0B241E] shrink-0">
                    {formatRupiah(request.costBreakdown.mooring)}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[#64748B] block">Jasa Labuh Perairan:</span>
                    {request.costBreakdown.labuhFormula && (
                      <span className="text-[10px] font-mono text-[#94A3B8]">
                        {request.costBreakdown.labuhFormula}
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-[#0B241E] shrink-0">
                    {formatRupiah(request.costBreakdown.anchorage)}
                  </span>
                </div>
                {request.utilities.freshWater && (
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">
                      Air Bersih ({request.utilities.waterVolume} m³):
                    </span>
                    <span className="font-mono font-bold text-[#0B241E]">
                      {formatRupiah(request.costBreakdown.water)}
                    </span>
                  </div>
                )}
                {request.utilities.shorePower && (
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">
                      Listrik Darat Shore Power ({request.utilities.powerKwh} kWh):
                    </span>
                    <span className="font-mono font-bold text-[#0B241E]">
                      {formatRupiah(request.costBreakdown.power)}
                    </span>
                  </div>
                )}
                {request.utilities.wasteDisposal && (
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Jasa Pengelolaan Limbah Kapal:</span>
                    <span className="font-mono font-bold text-[#0B241E]">
                      {formatRupiah(request.costBreakdown.waste)}
                    </span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between border-t border-[#CBD5E1] pt-2 font-bold text-sm">
              <span className="text-[#0B241E]">
                {request.officialInvoice ? "Total Resmi Server:" : "Total Estimasi:"}
              </span>
              <span className="font-mono text-[#0B241E]">
                {formatRupiah(request.costBreakdown.total)}
              </span>
            </div>
          </div>
        </div>

        {request.officerNotes && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950">
            <span className="font-bold block">Catatan Verifikator UPT:</span>
            <p className="mt-0.5 text-[#334155]">{request.officerNotes}</p>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#0B241E] text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
