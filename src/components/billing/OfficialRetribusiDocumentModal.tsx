"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Printer, X, CheckSquare, Square } from "lucide-react";
import { formatRupiah } from "@/lib/kapal-billing";
import { formatTerbilangRupiah } from "@/lib/terbilang";

export type OfficialRetribusiDocType = "SKRD" | "SSRD" | "STRD";

export type SsrdPaymentBasis =
  | "SKRD"
  | "STRD"
  | "SKRDT"
  | "SK_PEMBETULAN"
  | "SK_KEBERATAN"
  | "LAIN_LAIN";

const SSRD_BASIS_OPTIONS: { key: SsrdPaymentBasis; label: string }[] = [
  { key: "SKRD", label: "SKRD" },
  { key: "STRD", label: "STRD" },
  { key: "SKRDT", label: "SKRDT" },
  { key: "SK_PEMBETULAN", label: "SK Pembetulan" },
  { key: "SK_KEBERATAN", label: "SK Keberatan" },
  { key: "LAIN_LAIN", label: "Lain - lain" },
];

export interface OfficialRetribusiItemRow {
  description: string;
  formulaNote?: string | null;
  subtotalIdr: number | string;
}

export interface OfficialRetribusiDocumentData {
  docType: OfficialRetribusiDocType;
  documentNumber: string;
  referenceSkrdNumber?: string;
  ssrdBasis?: SsrdPaymentBasis;
  issuedAt: string;
  dueDate?: string | null;
  masaRetribusi?: string;
  tahunRetribusi: number;
  wajibRetribusiName: string;
  wajibRetribusiAddress?: string;
  wajibRetribusiContact?: string;
  npwrd: string;
  retribusiTypeLabel: string;
  items?: OfficialRetribusiItemRow[];
  principalIdr: number;
  penaltyIdr?: number;
  totalIdr: number;
  portName?: string;
  visitNumber?: string;
  vesselSummary?: string;
}

interface OfficialRetribusiDocumentModalProps {
  isOpen: boolean;
  data: OfficialRetribusiDocumentData | null;
  onClose: () => void;
}

const DOC_TITLE_MAP: Record<OfficialRetribusiDocType, { heading: string; sub: string; code: string }> = {
  SKRD: {
    heading: "SURAT KETETAPAN RETRIBUSI DAERAH",
    sub: "( SKRD )",
    code: "Lampiran I Perbup Mimika 25/2024",
  },
  SSRD: {
    heading: "SURAT SETORAN RETRIBUSI DAERAH",
    sub: "( SSRD )",
    code: "Lampiran III Perbup Mimika 25/2024",
  },
  STRD: {
    heading: "SURAT TAGIHAN RETRIBUSI DAERAH",
    sub: "( STRD )",
    code: "Lampiran IV Perbup Mimika 25/2024",
  },
};

function parseSafeDate(value?: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime()) || parsed.getFullYear() < 2000) {
    return null;
  }
  return parsed;
}

export function OfficialRetribusiDocumentModal({
  isOpen,
  data,
  onClose,
}: OfficialRetribusiDocumentModalProps) {
  if (!isOpen || !data || typeof document === "undefined") return null;

  const meta = DOC_TITLE_MAP[data.docType];
  const safeIssuedDate = parseSafeDate(data.issuedAt) ?? new Date();
  const safeDueDate = parseSafeDate(data.dueDate);
  const safeYear =
    data.tahunRetribusi && data.tahunRetribusi >= 2000
      ? data.tahunRetribusi
      : safeIssuedDate.getFullYear();

  const issuedDateStr = safeIssuedDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jayapura",
  });
  const dueDateStr = safeDueDate
    ? safeDueDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jayapura",
      })
    : "-";
  const masaStr =
    data.masaRetribusi ||
    safeIssuedDate.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jayapura",
    });

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 print:static print:bg-white print:p-0">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-[#CBD5E1] overflow-hidden print:max-h-none print:shadow-none print:border-0 print:rounded-none">
        {/* Toolbar Modal */}
        <div className="bg-[#0B241E] text-white px-5 py-3 flex items-center justify-between shrink-0 print:hidden">
          <div>
            <h3 className="font-bold text-sm">
              Format Resmi {data.docType} — {meta.code}
            </h3>
            <p className="text-[11px] text-[#A7C4BA] font-mono">{data.documentNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak {data.docType}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#85A69B] hover:text-white cursor-pointer"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dokumen Resmi Tabular Sesuai Lampiran Perbup Mimika No. 25 Tahun 2024 */}
        <div className="p-4 sm:p-5 bg-white text-[#0B241E] text-xs overflow-y-auto flex-1 min-h-0 print:p-0 print:overflow-visible">
          <div className="border-2 border-[#0B241E]">
            {/* Kop Surat 3 Kolom */}
            <div className="grid grid-cols-[1fr_1.9fr_1.2fr] border-b-2 border-[#0B241E]">
              <div className="p-2 flex flex-col items-center justify-center border-r border-[#0B241E] text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo-mimika.svg"
                  alt="Lambang Daerah Kabupaten Mimika"
                  className="w-11 h-12 object-contain"
                />
              </div>
              <div className="p-2.5 flex flex-col items-center justify-center border-r border-[#0B241E] text-center">
                <p className="font-extrabold text-xs uppercase">
                  PEMERINTAH KABUPATEN MIMIKA
                </p>
                <p className="font-bold text-[11px] uppercase">
                  DINAS PERHUBUNGAN / BADAN PENDAPATAN DAERAH
                </p>
                <p className="text-[10px] text-[#475569] mt-0.5">
                  {data.portName || "Jl. Pelabuhan Poumako, Kabupaten Mimika, Papua Tengah"}
                </p>
              </div>
              <div className="p-2.5 flex flex-col items-center justify-center text-center">
                <p className="font-extrabold text-[11px] uppercase leading-tight">
                  {meta.heading}
                </p>
                <p className="font-black text-xs mt-0.5">{meta.sub}</p>
                <p className="text-[10px] mt-1 font-medium">
                  {data.retribusiTypeLabel}
                </p>
                <p className="text-[10px] font-bold">Tahun {safeYear}</p>
              </div>
            </div>

            {/* Identitas Wajib Retribusi & Nomor Urut */}
            <div className="grid grid-cols-[2.2fr_1fr] border-b border-[#0B241E]">
              <div className="p-2.5 border-r border-[#0B241E] space-y-0.5 text-[11px]">
                <div className="grid grid-cols-[130px_10px_1fr]">
                  <span className="font-semibold">Nama Wajib Retribusi</span>
                  <span>:</span>
                  <span className="font-bold">{data.wajibRetribusiName}</span>
                </div>
                <div className="grid grid-cols-[130px_10px_1fr]">
                  <span className="font-semibold">Alamat</span>
                  <span>:</span>
                  <span>{data.wajibRetribusiAddress || "Jl. Pelabuhan Poumako, Timika"}</span>
                </div>
                {data.wajibRetribusiContact && (
                  <div className="grid grid-cols-[130px_10px_1fr]">
                    <span className="font-semibold">Telp. / Email</span>
                    <span>:</span>
                    <span>{data.wajibRetribusiContact}</span>
                  </div>
                )}
                <div className="grid grid-cols-[130px_10px_1fr]">
                  <span className="font-semibold">NPWRD</span>
                  <span>:</span>
                  <span className="font-mono font-bold">{data.npwrd}</span>
                </div>
                {data.docType !== "STRD" && (
                  <div className="grid grid-cols-[130px_10px_1fr]">
                    <span className="font-semibold">Masa Retribusi</span>
                    <span>:</span>
                    <span>{masaStr}</span>
                  </div>
                )}
                {data.docType === "SKRD" && (
                  <div className="grid grid-cols-[130px_10px_1fr]">
                    <span className="font-semibold">Jatuh Tempo</span>
                    <span>:</span>
                    <span className="font-bold">{dueDateStr}</span>
                  </div>
                )}
              </div>

              <div className="p-3 flex flex-col justify-center space-y-1 text-[11px]">
                <span className="text-[10px] text-[#64748B] font-bold uppercase">
                  {data.docType === "STRD" ? "Nomor STRD" : "No. Urut / Nomor Dokumen"}
                </span>
                <p className="font-mono font-black text-xs break-all">
                  {data.documentNumber}
                </p>
                {data.visitNumber && (
                  <p className="text-[10px] font-mono text-[#475569] pt-1">
                    Ref. Kunjungan: {data.visitNumber}
                  </p>
                )}
                {data.vesselSummary && (
                  <p className="text-[10px] text-[#475569]">{data.vesselSummary}</p>
                )}
              </div>
            </div>

            {/* Bagian Khusus SSRD: Checklist Dasar Setoran (6 Pilihan Lampiran III) */}
            {data.docType === "SSRD" && (() => {
              const activeBasis: SsrdPaymentBasis =
                data.ssrdBasis ??
                (data.referenceSkrdNumber?.toUpperCase().startsWith("STRD") ? "STRD" : "SKRD");

              return (
                <div className="p-3 border-b border-[#0B241E] bg-[#F8FAFC] text-[11px] space-y-2">
                  <div className="grid grid-cols-[155px_10px_1fr] items-start">
                    <span className="font-semibold">Menyetor berdasarkan *)</span>
                    <span>:</span>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
                        {SSRD_BASIS_OPTIONS.map((option) => {
                          const isChecked = activeBasis === option.key;
                          return (
                            <span
                              key={option.key}
                              className={`inline-flex items-center gap-1.5 ${
                                isChecked ? "font-bold text-[#0B241E]" : "text-[#64748B]"
                              }`}
                            >
                              {isChecked ? (
                                <CheckSquare className="w-3.5 h-3.5 text-[#0B241E] shrink-0" />
                              ) : (
                                <Square className="w-3.5 h-3.5 shrink-0" />
                              )}
                              <span>{option.label}</span>
                            </span>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 pt-0.5 text-[10.5px] text-[#334155] border-t border-dashed border-[#CBD5E1]">
                        <span>
                          Masa Retribusi : <strong>{masaStr}</strong>
                        </span>
                        <span>
                          Tahun : <strong>{safeYear}</strong>
                        </span>
                        <span>
                          No. Urut :{" "}
                          <strong className="font-mono">
                            {data.referenceSkrdNumber || data.documentNumber}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Dasar Hukum untuk SKRD & STRD */}
            {data.docType !== "SSRD" && (
              <div className="p-3 border-b border-[#0B241E] text-[10.5px] leading-relaxed">
                Berdasarkan Undang-Undang Nomor 1 Tahun 2022 tentang Hubungan Keuangan Antara Pemerintah Pusat dan Pemerintahan Daerah, Peraturan Daerah Kabupaten Mimika Nomor 4 Tahun 2023 tentang Pajak Daerah dan Retribusi Daerah, serta Peraturan Bupati Mimika Nomor 25 Tahun 2024.
              </div>
            )}

            {/* Tabel Rincian */}
            {data.docType === "SKRD" ? (
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-[#0B241E] bg-[#F8FAFC] text-center font-bold uppercase text-[10px]">
                    <th className="p-2 border-r border-[#0B241E] text-left">
                      Jenis Retribusi
                    </th>
                    <th className="p-2 border-r border-[#0B241E]">
                      Pokok Ketetapan (Rp)
                    </th>
                    <th className="p-2">Retribusi yang Harus Dibayar (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CBD5E1]">
                  {data.items && data.items.length > 0 ? (
                    data.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 border-r border-[#0B241E]">
                          <p className="font-semibold">
                            {idx + 1}. {item.description}
                          </p>
                          {item.formulaNote && (
                            <p className="text-[10px] font-mono text-[#64748B]">
                              {item.formulaNote}
                            </p>
                          )}
                        </td>
                        <td className="p-2 border-r border-[#0B241E] text-right font-mono">
                          {formatRupiah(item.subtotalIdr)}
                        </td>
                        <td className="p-2 text-right font-mono font-bold">
                          {formatRupiah(item.subtotalIdr)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-2 border-r border-[#0B241E]">
                        1. {data.retribusiTypeLabel}
                      </td>
                      <td className="p-2 border-r border-[#0B241E] text-right font-mono">
                        {formatRupiah(data.principalIdr)}
                      </td>
                      <td className="p-2 text-right font-mono font-bold">
                        {formatRupiah(data.totalIdr)}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[#0B241E] font-extrabold bg-[#F8FAFC]">
                    <td className="p-2 border-r border-[#0B241E] italic">
                      Jumlah Retribusi yang harus dibayar
                    </td>
                    <td className="p-2 border-r border-[#0B241E] text-right font-mono">
                      {formatRupiah(data.principalIdr)}
                    </td>
                    <td className="p-2 text-right font-mono">
                      {formatRupiah(data.totalIdr)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-[#0B241E] bg-[#F8FAFC] text-center font-bold uppercase text-[10px]">
                    <th className="p-2 border-r border-[#0B241E]">Tahun</th>
                    <th className="p-2 border-r border-[#0B241E]">
                      Retribusi Terhutang (Rp)
                    </th>
                    <th className="p-2 border-r border-[#0B241E]">
                      Sanksi / Denda (Rp)
                    </th>
                    <th className="p-2">Jumlah Retribusi Terhutang (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#CBD5E1]">
                    <td className="p-2 border-r border-[#0B241E] text-center font-mono font-bold">
                      {data.tahunRetribusi}
                    </td>
                    <td className="p-2 border-r border-[#0B241E] text-right font-mono">
                      {formatRupiah(data.principalIdr)}
                    </td>
                    <td className="p-2 border-r border-[#0B241E] text-right font-mono">
                      {formatRupiah(data.penaltyIdr || 0)}
                    </td>
                    <td className="p-2 text-right font-mono font-bold">
                      {formatRupiah(data.totalIdr)}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t border-[#0B241E] font-extrabold bg-[#F8FAFC]">
                    <td className="p-2 border-r border-[#0B241E] italic">
                      Total yang Harus Dibayar
                    </td>
                    <td className="p-2 border-r border-[#0B241E] text-right font-mono">
                      {formatRupiah(data.principalIdr)}
                    </td>
                    <td className="p-2 border-r border-[#0B241E] text-right font-mono">
                      {formatRupiah(data.penaltyIdr || 0)}
                    </td>
                    <td className="p-2 text-right font-mono">
                      {formatRupiah(data.totalIdr)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}

            {/* Baris Dengan Huruf */}
            <div className="p-2.5 border-t border-b border-[#0B241E] text-[11px]">
              <span className="font-bold italic">Dengan Huruf : </span>
              <span className="font-semibold">
                ({formatTerbilangRupiah(data.totalIdr)})
              </span>
            </div>

            {/* Perhatian (SKRD & STRD) */}
            {data.docType !== "SSRD" && (
              <div className="p-3 border-b border-[#0B241E] text-[10.5px] space-y-1">
                <p className="font-extrabold underline">PERHATIAN :</p>
                {data.docType === "SKRD" ? (
                  <ol className="list-decimal pl-5 space-y-0.5">
                    <li>
                      Harap penyetoran dilakukan melalui Kas Daerah (Bank Papua RKUD) atau Bendahara Penerima dengan menggunakan Surat Setoran Retribusi Daerah (SSRD).
                    </li>
                    <li>
                      Apabila SKRD ini tidak atau kurang dibayar setelah tanggal jatuh tempo, dikenakan sanksi administrasi berupa bunga 1% per bulan (maks. 24 bulan sesuai Pasal 21 ayat 8 Perbup Mimika 25/2024).
                    </li>
                  </ol>
                ) : (
                  <ol className="list-decimal pl-5 space-y-0.5">
                    <li>
                      Harap penyetoran dilakukan ke Kas Daerah Kabupaten Mimika (Bank Papua RKUD) melalui Bendahara Penerima paling lambat 7 (tujuh) hari kerja sejak menerima STRD ini.
                    </li>
                    <li>
                      STRD ini dapat diabaikan apabila sejumlah Retribusi Daerah Terhutang tersebut di atas telah dibayar lunas.
                    </li>
                  </ol>
                )}
              </div>
            )}

            {/* Blok Tanda Tangan */}
            {data.docType === "SSRD" ? (
              <div className="grid grid-cols-3 text-center text-[10.5px]">
                <div className="p-3 border-r border-[#0B241E] flex flex-col justify-between min-h-[96px]">
                  <p className="font-semibold">
                    Ruang Untuk Teraan Kas Register / Tanda Tangan Petugas Penerima
                  </p>
                  <p className="text-[10px] text-[#475569] pt-4">
                    Bendahara Penerima UPT
                  </p>
                </div>
                <div className="p-3 border-r border-[#0B241E] flex flex-col justify-between min-h-[96px] text-left">
                  <p className="font-semibold text-center">
                    Diterima Oleh, Petugas Tempat Pembayaran
                  </p>
                  <div className="text-[10px] space-y-0.5 pt-3">
                    <p>Tanggal : {issuedDateStr}</p>
                    <p>Nama : Bank Papua RKUD</p>
                  </div>
                </div>
                <div className="p-3 flex flex-col justify-between min-h-[96px]">
                  <div>
                    <p>Timika, {issuedDateStr}</p>
                    <p className="font-semibold">Penyetor</p>
                  </div>
                  <p className="font-bold border-t border-dashed border-[#94A3B8] pt-1">
                    {data.wajibRetribusiName}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 text-center text-[10.5px]">
                <div className="p-3 border-r border-[#0B241E] flex flex-col justify-between min-h-[96px]">
                  <div>
                    <p>Tanggal, {issuedDateStr}</p>
                    <p className="font-semibold">Yang Menerima,</p>
                  </div>
                  <p className="font-bold border-t border-dashed border-[#94A3B8] pt-1 mx-6">
                    {data.wajibRetribusiName}
                  </p>
                </div>
                <div className="p-3 flex flex-col justify-between min-h-[96px]">
                  <div>
                    <p>Timika, {issuedDateStr}</p>
                    <p className="font-semibold">
                      Kepala UPTD Pelabuhan / Pengelola Retribusi
                    </p>
                    <p>Kabupaten Mimika,</p>
                  </div>
                  <p className="text-[10px] border-t border-dashed border-[#94A3B8] pt-1 mx-6">
                    NIP. ........................................
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
