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

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

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

  const activeSsrdBasis: SsrdPaymentBasis =
    data.ssrdBasis ??
    (data.referenceSkrdNumber?.toUpperCase().startsWith("STRD") ? "STRD" : "SKRD");

  const handlePrintPdf = () => {
    const printWin = window.open("", "_blank", "width=950,height=800");
    if (!printWin) return;

    const origin = window.location.origin;
    const safeDocNum = escapeHtml(data.documentNumber);
    const safeName = escapeHtml(data.wajibRetribusiName);
    const safeAddr = escapeHtml(data.wajibRetribusiAddress || "Jl. Pelabuhan Poumako, Timika");
    const safeContact = data.wajibRetribusiContact ? escapeHtml(data.wajibRetribusiContact) : "";
    const safeNpwrd = escapeHtml(data.npwrd);
    const safeRetribusiLabel = escapeHtml(data.retribusiTypeLabel);
    const safePort = escapeHtml(data.portName || "Jl. Pelabuhan Poumako, Kabupaten Mimika, Papua Tengah");
    const safeVisit = data.visitNumber ? escapeHtml(data.visitNumber) : "";
    const safeVessel = data.vesselSummary ? escapeHtml(data.vesselSummary) : "";
    const safeRefSkrd = escapeHtml(data.referenceSkrdNumber || data.documentNumber);
    const terbilangStr = escapeHtml(formatTerbilangRupiah(data.totalIdr));

    const ssrdBasisHtml =
      data.docType === "SSRD"
        ? `
        <div class="box-section bg-soft">
          <div class="basis-row">
            <div class="basis-label">Menyetor berdasarkan *) :</div>
            <div class="basis-body">
              <div class="basis-grid">
                ${SSRD_BASIS_OPTIONS.map((opt) => {
                  const checked = activeSsrdBasis === opt.key;
                  return `<span class="basis-item ${checked ? "checked" : ""}">
                    <span class="chk">${checked ? "☑" : "☐"}</span> ${escapeHtml(opt.label)}
                  </span>`;
                }).join("")}
              </div>
              <div class="basis-meta">
                <span>Masa Retribusi : <strong>${escapeHtml(masaStr)}</strong></span>
                <span>Tahun : <strong>${safeYear}</strong></span>
                <span>No. Urut : <strong class="mono">${safeRefSkrd}</strong></span>
              </div>
            </div>
          </div>
        </div>`
        : "";

    const legalBasisHtml =
      data.docType !== "SSRD"
        ? `<div class="box-section legal-text">
            Berdasarkan Undang-Undang Nomor 1 Tahun 2022 tentang Hubungan Keuangan Antara Pemerintah Pusat dan Pemerintahan Daerah, Peraturan Daerah Kabupaten Mimika Nomor 4 Tahun 2023 tentang Pajak Daerah dan Retribusi Daerah, serta Peraturan Bupati Mimika Nomor 25 Tahun 2024.
          </div>`
        : "";

    const itemsRowsHtml =
      data.docType === "SKRD"
        ? data.items && data.items.length > 0
          ? data.items
              .map(
                (item, idx) => `
              <tr>
                <td>
                  <div style="font-weight:bold;">${idx + 1}. ${escapeHtml(item.description)}</div>
                  ${item.formulaNote ? `<div class="mono note">${escapeHtml(item.formulaNote)}</div>` : ""}
                </td>
                <td class="num mono">${escapeHtml(formatRupiah(item.subtotalIdr))}</td>
                <td class="num mono bold">${escapeHtml(formatRupiah(item.subtotalIdr))}</td>
              </tr>`
              )
              .join("")
          : `<tr>
              <td>1. ${safeRetribusiLabel}</td>
              <td class="num mono">${escapeHtml(formatRupiah(data.principalIdr))}</td>
              <td class="num mono bold">${escapeHtml(formatRupiah(data.totalIdr))}</td>
            </tr>`
        : "";

    const tableHtml =
      data.docType === "SKRD"
        ? `
        <table class="items">
          <thead>
            <tr>
              <th style="text-align:left;width:54%;">Jenis Retribusi</th>
              <th style="width:23%;">Pokok Ketetapan (Rp)</th>
              <th style="width:23%;">Retribusi Harus Dibayar (Rp)</th>
            </tr>
          </thead>
          <tbody>${itemsRowsHtml}</tbody>
          <tfoot>
            <tr>
              <td style="font-style:italic;font-weight:bold;">Jumlah Retribusi yang harus dibayar</td>
              <td class="num mono bold">${escapeHtml(formatRupiah(data.principalIdr))}</td>
              <td class="num mono bold">${escapeHtml(formatRupiah(data.totalIdr))}</td>
            </tr>
          </tfoot>
        </table>`
        : `
        <table class="items">
          <thead>
            <tr>
              <th style="width:14%;">Tahun</th>
              <th style="width:29%;">Retribusi Terhutang (Rp)</th>
              <th style="width:27%;">Sanksi / Denda (Rp)</th>
              <th style="width:30%;">Jumlah Retribusi Terhutang (Rp)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align:center;" class="mono bold">${safeYear}</td>
              <td class="num mono">${escapeHtml(formatRupiah(data.principalIdr))}</td>
              <td class="num mono">${escapeHtml(formatRupiah(data.penaltyIdr || 0))}</td>
              <td class="num mono bold">${escapeHtml(formatRupiah(data.totalIdr))}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td style="font-style:italic;font-weight:bold;">Total yang Harus Dibayar</td>
              <td class="num mono bold">${escapeHtml(formatRupiah(data.principalIdr))}</td>
              <td class="num mono bold">${escapeHtml(formatRupiah(data.penaltyIdr || 0))}</td>
              <td class="num mono bold">${escapeHtml(formatRupiah(data.totalIdr))}</td>
            </tr>
          </tfoot>
        </table>`;

    const attentionHtml =
      data.docType !== "SSRD"
        ? `
        <div class="box-section">
          <div style="font-weight:bold;text-decoration:underline;margin-bottom:4px;">PERHATIAN :</div>
          <ol style="margin:0;padding-left:18px;line-height:1.45;">
            ${
              data.docType === "SKRD"
                ? `<li>Harap penyetoran dilakukan melalui Kas Daerah (Bank Papua RKUD) atau Bendahara Penerima dengan menggunakan Surat Setoran Retribusi Daerah (SSRD).</li>
                   <li>Apabila SKRD ini tidak atau kurang dibayar setelah tanggal jatuh tempo, dikenakan sanksi administrasi berupa bunga 1% per bulan (maks. 24 bulan sesuai Pasal 21 ayat 8 Perbup Mimika 25/2024).</li>`
                : `<li>Harap penyetoran dilakukan ke Kas Daerah Kabupaten Mimika (Bank Papua RKUD) melalui Bendahara Penerima paling lambat 7 (tujuh) hari kerja sejak menerima STRD ini.</li>
                   <li>STRD ini dapat diabaikan apabila sejumlah Retribusi Daerah Terhutang tersebut di atas telah dibayar lunas.</li>`
            }
          </ol>
        </div>`
        : "";

    const signatureHtml =
      data.docType === "SSRD"
        ? `
        <div class="sign-3">
          <div class="sign-col">
            <div style="font-weight:bold;">Ruang Untuk Teraan Kas Register / Tanda Tangan Petugas Penerima</div>
            <div style="margin-top:46px;font-size:9.5pt;color:#334155;">Bendahara Penerima UPT</div>
          </div>
          <div class="sign-col">
            <div style="font-weight:bold;text-align:center;">Diterima Oleh, Petugas Tempat Pembayaran</div>
            <div style="margin-top:34px;text-align:left;font-size:9.5pt;">
              <div>Tanggal : ${escapeHtml(issuedDateStr)}</div>
              <div>Nama : Bank Papua RKUD</div>
            </div>
          </div>
          <div class="sign-col">
            <div>
              <div>Timika, ${escapeHtml(issuedDateStr)}</div>
              <div style="font-weight:bold;">Penyetor</div>
            </div>
            <div class="sign-line" style="margin-top:38px;">${safeName}</div>
          </div>
        </div>`
        : `
        <div class="sign-2">
          <div class="sign-col">
            <div>
              <div>Tanggal, ${escapeHtml(issuedDateStr)}</div>
              <div style="font-weight:bold;">Yang Menerima,</div>
            </div>
            <div class="sign-line" style="margin-top:46px;margin-left:24px;margin-right:24px;">${safeName}</div>
          </div>
          <div class="sign-col">
            <div>
              <div>Timika, ${escapeHtml(issuedDateStr)}</div>
              <div style="font-weight:bold;">Kepala UPTD Pelabuhan / Pengelola Retribusi</div>
              <div>Kabupaten Mimika,</div>
            </div>
            <div class="sign-line" style="margin-top:32px;margin-left:24px;margin-right:24px;">NIP. ........................................</div>
          </div>
        </div>`;

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8" />
        <title>${safeDocNum} - ${escapeHtml(meta.heading)}</title>
        <style>
          @page { size: A4 portrait; margin: 14mm 16mm; }
          * { box-sizing: border-box; }
          body {
            font-family: "Times New Roman", Times, serif;
            color: #0b241e;
            font-size: 10.5pt;
            line-height: 1.4;
            margin: 0;
            padding: 0;
          }
          .mono { font-family: "Courier New", Courier, monospace; }
          .bold { font-weight: bold; }
          .doc-frame { border: 2px solid #0b241e; width: 100%; }
          .kop-grid {
            display: grid;
            grid-template-columns: 0.9fr 2fr 1.25fr;
            border-bottom: 2px solid #0b241e;
          }
          .kop-cell {
            padding: 8px 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
          .kop-cell + .kop-cell { border-left: 1px solid #0b241e; }
          .ident-grid {
            display: grid;
            grid-template-columns: 2.2fr 1fr;
            border-bottom: 1px solid #0b241e;
          }
          .ident-left { padding: 8px 10px; border-right: 1px solid #0b241e; font-size: 10pt; }
          .ident-right { padding: 8px 10px; display: flex; flex-direction: column; justify-content: center; font-size: 10pt; }
          table.kv { width: 100%; border-collapse: collapse; }
          table.kv td { padding: 1.5px 2px; vertical-align: top; }
          table.kv td.k { width: 132px; font-weight: bold; }
          table.kv td.s { width: 10px; }
          .box-section { padding: 8px 10px; border-bottom: 1px solid #0b241e; font-size: 10pt; }
          .bg-soft { background: #f8fafc; }
          .legal-text { text-align: justify; line-height: 1.45; }
          .basis-row { display: flex; gap: 8px; align-items: flex-start; }
          .basis-label { width: 155px; font-weight: bold; shrink: 0; }
          .basis-body { flex: 1; }
          .basis-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px 10px; margin-bottom: 6px; }
          .basis-item { color: #475569; }
          .basis-item.checked { color: #0b241e; font-weight: bold; }
          .basis-meta { display: flex; flex-wrap: wrap; gap: 14px; padding-top: 4px; border-top: 1px dashed #cbd5e1; font-size: 9.5pt; }
          table.items { width: 100%; border-collapse: collapse; font-size: 10pt; }
          table.items th, table.items td { padding: 6px 8px; border-bottom: 1px solid #0b241e; vertical-align: top; }
          table.items th + th, table.items td + td { border-left: 1px solid #0b241e; }
          table.items thead th { background: #f8fafc; text-transform: uppercase; font-size: 9.5pt; text-align: center; }
          table.items tbody td { border-bottom-color: #cbd5e1; }
          table.items tfoot td { background: #f8fafc; border-top: 1px solid #0b241e; }
          td.num { text-align: right; }
          .note { font-size: 9pt; color: #475569; margin-top: 2px; }
          .terbilang { padding: 7px 10px; border-bottom: 1px solid #0b241e; font-size: 10pt; }
          .sign-2 { display: grid; grid-template-columns: 1fr 1fr; text-align: center; font-size: 10pt; }
          .sign-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; text-align: center; font-size: 9.5pt; }
          .sign-col { padding: 10px; display: flex; flex-direction: column; justify-content: space-between; min-height: 112px; }
          .sign-col + .sign-col { border-left: 1px solid #0b241e; }
          .sign-line { border-top: 1px dashed #64748b; padding-top: 4px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="doc-frame">
          <div class="kop-grid">
            <div class="kop-cell">
              <img src="${origin}/images/logo-mimika.svg" alt="Lambang Kabupaten Mimika" style="width:46px;height:52px;object-fit:contain;" />
            </div>
            <div class="kop-cell">
              <div style="font-weight:bold;font-size:11pt;text-transform:uppercase;">PEMERINTAH KABUPATEN MIMIKA</div>
              <div style="font-weight:bold;font-size:10pt;text-transform:uppercase;">DINAS PERHUBUNGAN / BADAN PENDAPATAN DAERAH</div>
              <div style="font-size:9pt;color:#475569;margin-top:2px;">${safePort}</div>
            </div>
            <div class="kop-cell">
              <div style="font-weight:bold;font-size:10pt;text-transform:uppercase;line-height:1.25;">${escapeHtml(meta.heading)}</div>
              <div style="font-weight:bold;font-size:11pt;margin-top:2px;">${escapeHtml(meta.sub)}</div>
              <div style="font-size:9pt;margin-top:4px;">${safeRetribusiLabel}</div>
              <div style="font-size:9.5pt;font-weight:bold;">Tahun ${safeYear}</div>
            </div>
          </div>

          <div class="ident-grid">
            <div class="ident-left">
              <table class="kv">
                <tr><td class="k">Nama Wajib Retribusi</td><td class="s">:</td><td class="bold">${safeName}</td></tr>
                <tr><td class="k">Alamat</td><td class="s">:</td><td>${safeAddr}</td></tr>
                ${safeContact ? `<tr><td class="k">Telp. / Email</td><td class="s">:</td><td>${safeContact}</td></tr>` : ""}
                <tr><td class="k">NPWRD</td><td class="s">:</td><td class="mono bold">${safeNpwrd}</td></tr>
                ${data.docType !== "STRD" ? `<tr><td class="k">Masa Retribusi</td><td class="s">:</td><td>${escapeHtml(masaStr)}</td></tr>` : ""}
                ${data.docType === "SKRD" ? `<tr><td class="k">Jatuh Tempo</td><td class="s">:</td><td class="bold">${escapeHtml(dueDateStr)}</td></tr>` : ""}
              </table>
            </div>
            <div class="ident-right">
              <div style="font-size:8.5pt;color:#64748b;font-weight:bold;text-transform:uppercase;">
                ${data.docType === "STRD" ? "Nomor STRD" : "No. Urut / Nomor Dokumen"}
              </div>
              <div class="mono bold" style="font-size:10.5pt;margin-top:2px;word-break:break-all;">${safeDocNum}</div>
              ${safeVisit ? `<div class="mono" style="font-size:8.5pt;color:#475569;margin-top:4px;">Ref. Kunjungan: ${safeVisit}</div>` : ""}
              ${safeVessel ? `<div style="font-size:8.5pt;color:#475569;margin-top:2px;">${safeVessel}</div>` : ""}
            </div>
          </div>

          ${ssrdBasisHtml}
          ${legalBasisHtml}
          ${tableHtml}

          <div class="terbilang">
            <span style="font-weight:bold;font-style:italic;">Dengan Huruf : </span>
            <span style="font-weight:bold;">(${terbilangStr})</span>
          </div>

          ${attentionHtml}
          ${signatureHtml}
        </div>
        <div style="margin-top:8px;font-size:8.5pt;color:#64748b;text-align:right;font-style:italic;">
          Dicetak melalui Sistem PORTA Kabupaten Mimika • ${escapeHtml(meta.code)}
        </div>
      </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
    }, 250);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[93vh] flex flex-col shadow-2xl border border-[#CBD5E1] overflow-hidden my-2">
        {/* Toolbar Modal */}
        <div className="bg-[#0B241E] text-white px-6 py-3.5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-extrabold text-sm">
              Pratinjau Surat Resmi {data.docType} (Ukuran A4) — {meta.code}
            </h3>
            <p className="text-[11px] text-[#A7C4BA] font-mono">
              {data.documentNumber} • Standar Kertas A4 (210 × 297 mm)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintPdf}
              className="px-3.5 py-1.5 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF (A4)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:bg-white/10 cursor-pointer"
              aria-label="Tutup modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pratinjau Lembar Kertas A4 (210mm x 297mm) */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-200/80 flex-1 min-h-0">
          <div
            className="mx-auto bg-white border border-slate-300 shadow-xl text-[#0B241E] font-serif px-6 py-8 sm:px-[14mm] sm:py-[14mm]"
            style={{ width: "100%", maxWidth: "210mm", minHeight: "297mm", fontSize: "10.5pt" }}
          >
            <div className="border-2 border-[#0B241E]">
              {/* Kop Surat 3 Kolom */}
              <div className="grid grid-cols-[1fr_1.9fr_1.2fr] border-b-2 border-[#0B241E]">
                <div className="p-2.5 flex flex-col items-center justify-center border-r border-[#0B241E] text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/logo-mimika.svg"
                    alt="Lambang Daerah Kabupaten Mimika"
                    className="w-12 h-14 object-contain"
                  />
                </div>
                <div className="p-3 flex flex-col items-center justify-center border-r border-[#0B241E] text-center">
                  <p className="font-bold text-[11pt] uppercase">
                    PEMERINTAH KABUPATEN MIMIKA
                  </p>
                  <p className="font-bold text-[10pt] uppercase">
                    DINAS PERHUBUNGAN / BADAN PENDAPATAN DAERAH
                  </p>
                  <p className="text-[9pt] text-[#475569] mt-0.5">
                    {data.portName || "Jl. Pelabuhan Poumako, Kabupaten Mimika, Papua Tengah"}
                  </p>
                </div>
                <div className="p-3 flex flex-col items-center justify-center text-center">
                  <p className="font-bold text-[10pt] uppercase leading-tight">
                    {meta.heading}
                  </p>
                  <p className="font-bold text-[11pt] mt-0.5">{meta.sub}</p>
                  <p className="text-[9pt] mt-1 font-medium">
                    {data.retribusiTypeLabel}
                  </p>
                  <p className="text-[9.5pt] font-bold">Tahun {safeYear}</p>
                </div>
              </div>

              {/* Identitas Wajib Retribusi & Nomor Urut */}
              <div className="grid grid-cols-[2.2fr_1fr] border-b border-[#0B241E]">
                <div className="p-3 border-r border-[#0B241E] space-y-0.5 text-[10pt]">
                  <div className="grid grid-cols-[140px_10px_1fr]">
                    <span className="font-semibold">Nama Wajib Retribusi</span>
                    <span>:</span>
                    <span className="font-bold">{data.wajibRetribusiName}</span>
                  </div>
                  <div className="grid grid-cols-[140px_10px_1fr]">
                    <span className="font-semibold">Alamat</span>
                    <span>:</span>
                    <span>{data.wajibRetribusiAddress || "Jl. Pelabuhan Poumako, Timika"}</span>
                  </div>
                  {data.wajibRetribusiContact && (
                    <div className="grid grid-cols-[140px_10px_1fr]">
                      <span className="font-semibold">Telp. / Email</span>
                      <span>:</span>
                      <span>{data.wajibRetribusiContact}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-[140px_10px_1fr]">
                    <span className="font-semibold">NPWRD</span>
                    <span>:</span>
                    <span className="font-mono font-bold">{data.npwrd}</span>
                  </div>
                  {data.docType !== "STRD" && (
                    <div className="grid grid-cols-[140px_10px_1fr]">
                      <span className="font-semibold">Masa Retribusi</span>
                      <span>:</span>
                      <span>{masaStr}</span>
                    </div>
                  )}
                  {data.docType === "SKRD" && (
                    <div className="grid grid-cols-[140px_10px_1fr]">
                      <span className="font-semibold">Jatuh Tempo</span>
                      <span>:</span>
                      <span className="font-bold">{dueDateStr}</span>
                    </div>
                  )}
                </div>

                <div className="p-3 flex flex-col justify-center space-y-1 text-[10pt]">
                  <span className="text-[8.5pt] font-sans text-[#64748B] font-bold uppercase">
                    {data.docType === "STRD" ? "Nomor STRD" : "No. Urut / Nomor Dokumen"}
                  </span>
                  <p className="font-mono font-bold text-[10.5pt] break-all">
                    {data.documentNumber}
                  </p>
                  {data.visitNumber && (
                    <p className="text-[9pt] font-mono text-[#475569] pt-1">
                      Ref. Kunjungan: {data.visitNumber}
                    </p>
                  )}
                  {data.vesselSummary && (
                    <p className="text-[9pt] text-[#475569]">{data.vesselSummary}</p>
                  )}
                </div>
              </div>

              {/* Bagian Khusus SSRD: Checklist Dasar Setoran */}
              {data.docType === "SSRD" && (
                <div className="p-3 border-b border-[#0B241E] bg-[#F8FAFC] text-[10pt] space-y-2">
                  <div className="grid grid-cols-[160px_10px_1fr] items-start">
                    <span className="font-semibold">Menyetor berdasarkan *)</span>
                    <span>:</span>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
                        {SSRD_BASIS_OPTIONS.map((option) => {
                          const isChecked = activeSsrdBasis === option.key;
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
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 pt-1 text-[9.5pt] text-[#334155] border-t border-dashed border-[#CBD5E1]">
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
              )}

              {/* Dasar Hukum untuk SKRD & STRD */}
              {data.docType !== "SSRD" && (
                <div className="p-3 border-b border-[#0B241E] text-[10pt] text-justify leading-relaxed">
                  Berdasarkan Undang-Undang Nomor 1 Tahun 2022 tentang Hubungan Keuangan Antara Pemerintah Pusat dan Pemerintahan Daerah, Peraturan Daerah Kabupaten Mimika Nomor 4 Tahun 2023 tentang Pajak Daerah dan Retribusi Daerah, serta Peraturan Bupati Mimika Nomor 25 Tahun 2024.
                </div>
              )}

              {/* Tabel Rincian */}
              {data.docType === "SKRD" ? (
                <table className="w-full text-left border-collapse text-[10pt]">
                  <thead>
                    <tr className="border-b border-[#0B241E] bg-[#F8FAFC] text-center font-bold uppercase text-[9.5pt]">
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
                              <p className="text-[9pt] font-mono text-[#64748B]">
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
                    <tr className="border-t border-[#0B241E] font-bold bg-[#F8FAFC]">
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
                <table className="w-full text-left border-collapse text-[10pt]">
                  <thead>
                    <tr className="border-b border-[#0B241E] bg-[#F8FAFC] text-center font-bold uppercase text-[9.5pt]">
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
                        {safeYear}
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
                    <tr className="border-t border-[#0B241E] font-bold bg-[#F8FAFC]">
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
              <div className="p-2.5 border-t border-b border-[#0B241E] text-[10pt]">
                <span className="font-bold italic">Dengan Huruf : </span>
                <span className="font-semibold">
                  ({formatTerbilangRupiah(data.totalIdr)})
                </span>
              </div>

              {/* Perhatian (SKRD & STRD) */}
              {data.docType !== "SSRD" && (
                <div className="p-3 border-b border-[#0B241E] text-[10pt] space-y-1">
                  <p className="font-bold underline">PERHATIAN :</p>
                  {data.docType === "SKRD" ? (
                    <ol className="list-decimal pl-5 space-y-0.5 leading-relaxed">
                      <li>
                        Harap penyetoran dilakukan melalui Kas Daerah (Bank Papua RKUD) atau Bendahara Penerima dengan menggunakan Surat Setoran Retribusi Daerah (SSRD).
                      </li>
                      <li>
                        Apabila SKRD ini tidak atau kurang dibayar setelah tanggal jatuh tempo, dikenakan sanksi administrasi berupa bunga 1% per bulan (maks. 24 bulan sesuai Pasal 21 ayat 8 Perbup Mimika 25/2024).
                      </li>
                    </ol>
                  ) : (
                    <ol className="list-decimal pl-5 space-y-0.5 leading-relaxed">
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
                <div className="grid grid-cols-3 text-center text-[9.5pt]">
                  <div className="p-3 border-r border-[#0B241E] flex flex-col justify-between min-h-[110px]">
                    <p className="font-semibold">
                      Ruang Untuk Teraan Kas Register / Tanda Tangan Petugas Penerima
                    </p>
                    <p className="text-[9pt] text-[#475569] pt-4">
                      Bendahara Penerima UPT
                    </p>
                  </div>
                  <div className="p-3 border-r border-[#0B241E] flex flex-col justify-between min-h-[110px] text-left">
                    <p className="font-semibold text-center">
                      Diterima Oleh, Petugas Tempat Pembayaran
                    </p>
                    <div className="text-[9pt] space-y-0.5 pt-3">
                      <p>Tanggal : {issuedDateStr}</p>
                      <p>Nama : Bank Papua RKUD</p>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col justify-between min-h-[110px]">
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
                <div className="grid grid-cols-2 text-center text-[10pt]">
                  <div className="p-3 border-r border-[#0B241E] flex flex-col justify-between min-h-[112px]">
                    <div>
                      <p>Tanggal, {issuedDateStr}</p>
                      <p className="font-semibold">Yang Menerima,</p>
                    </div>
                    <p className="font-bold border-t border-dashed border-[#94A3B8] pt-1 mx-6">
                      {data.wajibRetribusiName}
                    </p>
                  </div>
                  <div className="p-3 flex flex-col justify-between min-h-[112px]">
                    <div>
                      <p>Timika, {issuedDateStr}</p>
                      <p className="font-semibold">
                        Kepala UPTD Pelabuhan / Pengelola Retribusi
                      </p>
                      <p>Kabupaten Mimika,</p>
                    </div>
                    <p className="text-[9.5pt] border-t border-dashed border-[#94A3B8] pt-1 mx-6">
                      NIP. ........................................
                    </p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-[8.5pt] text-[#64748B] text-right italic mt-2">
              Dicetak melalui Sistem PORTA Kabupaten Mimika • {meta.code}
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
