"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Anchor, Calendar, Check, Clock, Loader2, X } from "lucide-react";
import { PortBerthsScheduleResponse } from "@/types/port.types";
import { ShipVisitItem } from "@/types/upt.types";
import {
  AlokasiBerthOption,
  formatBerthServiceCategory,
  formatCompactSchedule,
  formatTimeOnly,
  isBerthCategoryCompatible,
} from "../alokasi.utils";

interface BerthAllocationModalProps {
  visit: ShipVisitItem | null;
  availableBerths: AlokasiBerthOption[];
  selectedBerthId: number;
  berthsSchedule: PortBerthsScheduleResponse | null;
  isScheduleLoading: boolean;
  scheduleDate: string;
  isSubmitting: boolean;
  isBerthOccupied: (berthId: number) => boolean;
  onSelectBerth: (berthId: number) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function BerthAllocationModal({
  visit,
  availableBerths,
  selectedBerthId,
  berthsSchedule,
  isScheduleLoading,
  scheduleDate,
  isSubmitting,
  isBerthOccupied,
  onSelectBerth,
  onClose,
  onSubmit,
}: BerthAllocationModalProps) {
  if (!visit || typeof document === "undefined") return null;

  const formattedScheduleDate = scheduleDate
    ? scheduleDate.split("-").reverse().join("/")
    : "-";

  const vesselLoa = visit.vessel?.lengthMeters ? Number(visit.vessel.lengthMeters) : null;
  const vesselDraft = visit.vessel?.draftMeters ? Number(visit.vessel.draftMeters) : null;
  const vesselGt = visit.vessel?.grossTonnage != null ? Number(visit.vessel.grossTonnage) : null;

  const visitEtaMs = new Date(visit.eta).getTime();
  const visitEtdMs = new Date(visit.etd).getTime();

  const doesBerthOverlapVisit = (berthId: number) => {
    const schedule = berthsSchedule?.berths.find((s) => s.berth.id === berthId);
    if (!schedule) return false;
    return schedule.occupiedSlots.some((slot) => {
      const slotStart = new Date(slot.startAt).getTime();
      const slotEnd = new Date(slot.endAt).getTime();
      return slotStart < visitEtdMs && slotEnd > visitEtaMs;
    });
  };

  const hasSelectedConflict = doesBerthOverlapVisit(selectedBerthId);

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-3xl border border-[#E2E8F0] w-full max-w-3xl max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center shadow-xs">
              <Anchor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0B241E]">
                Alokasikan Dermaga Sandar Kapal
              </h3>
              <p className="text-xs text-[#64748B]">
                Verifikasi data kapal dan tentukan dermaga sandar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-1 space-y-4">
          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
              <span className="font-mono font-bold text-[#0B241E] bg-white px-2.5 py-1 rounded-md border border-slate-200">
                {visit.visitNumber}
              </span>
              <span className="text-[11px] text-[#64748B]">
                Rute: <strong>{visit.originPort || "-"}</strong> ➔{" "}
                <strong>{visit.destinationPort || "-"}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-[1.1fr_1.45fr_1.25fr_1.1fr] gap-4 text-xs">
              <div>
                <span className="text-[10px] text-[#94A3B8] font-bold block uppercase tracking-wide">
                  Nama Kapal
                </span>
                <p className="font-extrabold text-[#0B241E] mt-0.5 leading-snug">
                  {visit.vessel?.name || `Kapal #${visit.vesselId}`}
                </p>
                <p className="text-[10px] font-mono text-[#64748B] mt-0.5">
                  {visit.vessel?.registrationNumber || "-"}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-[#94A3B8] font-bold block uppercase tracking-wide">
                  Operator
                </span>
                <p className="font-bold text-[#334155] mt-0.5 leading-snug">
                  {visit.operator?.name || "-"}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-[#94A3B8] font-bold block uppercase tracking-wide">
                  Bobot &amp; Panjang
                </span>
                <p className="font-mono font-bold text-[#0B241E] mt-0.5">
                  {vesselGt !== null ? `${vesselGt} GT` : "-"}
                </p>
                <p className="text-[10.5px] font-mono text-[#64748B] whitespace-nowrap mt-0.5">
                  LOA: {vesselLoa !== null ? `${vesselLoa}m` : "-"} • Draft:{" "}
                  {vesselDraft !== null ? `${vesselDraft}m` : "-"}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-[#94A3B8] font-bold block uppercase tracking-wide">
                  Jadwal ETA / ETD
                </span>
                <p className="text-[11px] font-mono font-semibold text-[#0B241E] mt-0.5 whitespace-nowrap">
                  {formatCompactSchedule(visit.eta)}
                </p>
                <p className="text-[10.5px] font-mono text-[#64748B] whitespace-nowrap mt-0.5">
                  s/d {formatCompactSchedule(visit.etd)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="text-xs font-bold text-[#0B241E] flex items-center gap-1.5 uppercase font-mono tracking-wider">
                <Anchor className="w-4 h-4 text-[#D97706]" />
                <span>
                  PILIH FASILITAS DERMAGA <span className="text-red-500">*</span>
                </span>
              </label>

              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className="inline-flex items-center gap-1.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg px-2.5 py-1 select-none"
                  title="Tanggal jadwal otomatis mengikuti tanggal ETA kapal"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                  <span className="text-[10.5px] font-semibold text-[#475569]">Jadwal Tgl:</span>
                  <span className="text-[11px] font-mono font-bold text-[#0B241E]">
                    {formattedScheduleDate}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {availableBerths.length} Dermaga Terdaftar
                </span>
              </div>
            </div>

            {availableBerths.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#94A3B8] border border-dashed border-[#E2E8F0] rounded-2xl bg-[#F8FAFC]">
                Belum ada data fasilitas dermaga terdaftar pada pelabuhan ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableBerths.map((b) => {
                  const isSelected = selectedBerthId === b.id;
                  const occupied = isBerthOccupied(b.id);
                  const maxLen = b.maxLengthMeters ? Number(b.maxLengthMeters) : null;
                  const canCompareLoa = vesselLoa !== null && maxLen !== null;
                  const isLoaFit = canCompareLoa ? vesselLoa <= maxLen : true;
                  const isLoaExceeded = canCompareLoa && !isLoaFit;
                  const isCategoryMatch = isBerthCategoryCompatible(
                    visit.vessel?.vesselCategory,
                    b.berthServiceCategory
                  );
                  const isCategoryMismatch = !isCategoryMatch;
                  const isBerthDisabled = isLoaExceeded || isCategoryMismatch;
                  const berthSchedule = berthsSchedule?.berths.find((s) => s.berth.id === b.id);
                  const hasConflict = doesBerthOverlapVisit(b.id);

                  return (
                    <div
                      key={b.id}
                      onClick={() => {
                        if (!isBerthDisabled) onSelectBerth(b.id);
                      }}
                      className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-2.5 relative ${
                        isBerthDisabled
                          ? "border-[#E2E8F0] bg-slate-50/80 opacity-60 cursor-not-allowed"
                          : isSelected
                          ? hasConflict
                            ? "border-rose-500 bg-rose-50/40 shadow-sm cursor-pointer"
                            : "border-[#0B241E] bg-[#F4F9F6] shadow-sm ring-1 ring-[#0B241E]/20 cursor-pointer"
                          : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:bg-[#F8FAFC] cursor-pointer"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#0B241E]/10 text-[#0B241E] whitespace-nowrap">
                            {b.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${
                              hasConflict
                                ? "bg-rose-100 text-rose-800 border-rose-300"
                                : occupied
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : "bg-emerald-100 text-emerald-800 border-emerald-300"
                            }`}
                          >
                            {hasConflict
                              ? "Bentrok Jadwal"
                              : occupied
                              ? "Sedang Terisi"
                              : "Tersedia"}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-xs text-[#0B241E] leading-snug line-clamp-2 min-h-[2.1rem]">
                          {b.name}
                        </h4>

                        <div className="flex items-center justify-between flex-wrap gap-x-2 gap-y-0.5 text-[10.5px] text-[#64748B]">
                          <span className="whitespace-nowrap">
                            Kapasitas:{" "}
                            <strong className="text-[#0B241E] font-mono">
                              {maxLen !== null ? `${maxLen}m` : "-"}
                            </strong>
                          </span>
                          <span
                            className={`font-semibold whitespace-nowrap ${
                              !canCompareLoa
                                ? "text-[#64748B]"
                                : isLoaFit
                                ? "text-emerald-700"
                                : "text-amber-700"
                            }`}
                          >
                            {!canCompareLoa
                              ? "LOA kapal belum diisi"
                              : isLoaFit
                              ? "Muat LOA Kapal"
                              : "⚠️ Melebihi Garis Tambat"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between flex-wrap gap-x-2 gap-y-0.5 text-[10.5px]">
                          <span className="text-[#475569] font-medium">
                            {formatBerthServiceCategory(b.berthServiceCategory)}
                          </span>
                          <span
                            className={`font-semibold ${
                              isCategoryMismatch ? "text-rose-700" : "text-emerald-700"
                            }`}
                          >
                            {isCategoryMismatch
                              ? "⚠️ Tidak Sesuai Kapal"
                              : "Sesuai Kategori Kapal"}
                          </span>
                        </div>

                        {/* Jadwal Okupansi & Slot Kosong Dermaga */}
                        <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 space-y-1.5 text-[10px]">
                          {isScheduleLoading ? (
                            <div className="flex items-center gap-1.5 text-[#64748B]">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Memuat jadwal dermaga...</span>
                            </div>
                          ) : berthSchedule ? (
                            <>
                              {berthSchedule.occupiedSlots.length > 0 ? (
                                <div className="space-y-1">
                                  <span className="font-bold text-[#475569] uppercase tracking-wider text-[9px] block">
                                    Terisi:
                                  </span>
                                  {berthSchedule.occupiedSlots.map((slot) => (
                                    <div
                                      key={slot.berthingId}
                                      className="flex items-center justify-between gap-2 text-[#1E293B] bg-amber-50/80 border border-amber-200/80 rounded-lg px-2 py-1"
                                    >
                                      <span className="font-mono font-bold whitespace-nowrap">
                                        {formatTimeOnly(slot.startAt)}–{formatTimeOnly(slot.endAt)}
                                      </span>
                                      <span className="truncate font-semibold text-[#0B241E]">
                                        {slot.vesselName}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                                  <Clock className="w-3 h-3 shrink-0" />
                                  <span>Belum ada jadwal sandar pada tanggal ini</span>
                                </div>
                              )}

                              {berthSchedule.freeSlots.length > 0 && (
                                <div className="pt-0.5 text-[#475569]">
                                  <span className="font-bold text-emerald-700">Kosong: </span>
                                  <span className="font-mono">
                                    {berthSchedule.freeSlots
                                      .map(
                                        (fs) =>
                                          `${formatTimeOnly(fs.startAt)}–${formatTimeOnly(fs.endAt)} WIT`
                                      )
                                      .join(", ")}
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-[#94A3B8]">Jadwal tidak tersedia</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E2E8F0] text-[10px]">
                        <span className="text-[#64748B] font-medium truncate">
                          {b.authorityType === "PEMDA_DISHUB"
                            ? "Retribusi Pemda (PP 35/2023)"
                            : b.authorityType}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <input
                            type="radio"
                            name="allocatedBerth"
                            disabled={isBerthDisabled}
                            checked={isSelected && !isBerthDisabled}
                            onChange={() => {
                              if (!isBerthDisabled) onSelectBerth(b.id);
                            }}
                            className="w-3.5 h-3.5 text-[#0B241E] focus:ring-0 cursor-pointer disabled:cursor-not-allowed shrink-0"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC]/60 shrink-0 gap-3 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>

          <div className="flex items-center gap-3">
            {hasSelectedConflict && (
              <span className="text-[11px] font-semibold text-rose-700">
                Dermaga terpilih bentrok dengan jadwal kapal lain.
              </span>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !selectedBerthId || hasSelectedConflict}
              className="px-6 py-2.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-950/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menetapkan Dermaga...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-[#D97706] stroke-[3]" />
                  <span>Tetapkan Dermaga &amp; Setujui Kunjungan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>,
    document.body
  );
}

interface RejectLeaseModalProps {
  target: { id: number; contractNumber: string } | null;
  reason: string;
  isSubmitting: boolean;
  onChangeReason: (reason: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function RejectLeaseModal({
  target,
  reason,
  isSubmitting,
  onChangeReason,
  onClose,
  onSubmit,
}: RejectLeaseModalProps) {
  if (!target || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-3xl border border-[#E2E8F0] w-full max-w-xl p-6 sm:p-8 space-y-5 shadow-2xl"
      >
        <h3 className="text-base font-extrabold text-[#0B241E]">
          Tolak Pengajuan Sewa {target.contractNumber}
        </h3>
        <div>
          <label className="block text-xs font-bold text-[#334155] mb-1">
            Alasan Penolakan
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => onChangeReason(e.target.value)}
            placeholder="Misal: Aset sedang dijadwalkan untuk pemeliharaan"
            className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Tolak Pengajuan
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
