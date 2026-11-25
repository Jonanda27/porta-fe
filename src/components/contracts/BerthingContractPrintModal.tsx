"use client";

import React from "react";
import { Printer, X, FileSignature, ShieldCheck } from "lucide-react";
import { OperatorBerthingContract } from "@/types/kapal.types";

interface BerthingContractPrintModalProps {
  contract: OperatorBerthingContract | null;
  operatorNameFallback?: string;
  onClose: () => void;
}

export function BerthingContractPrintModal({
  contract,
  operatorNameFallback,
  onClose,
}: BerthingContractPrintModalProps) {
  if (!contract) return null;

  const operatorName =
    contract.operator?.name || operatorNameFallback || `Operator #${contract.operatorId}`;
  const portName = contract.port?.name || "Pelabuhan Umum Poumako";
  const startDateLabel = new Date(contract.startDate).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const endDateLabel = new Date(contract.endDate).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const headName = contract.verifiedBy?.fullName || "Kepala Pelabuhan";
  const headSignedLabel = contract.headSignedAt
    ? new Date(contract.headSignedAt).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const handlePrintPdf = () => {
    const printWin = window.open("", "_blank", "width=900,height=750");
    if (!printWin) return;

    const signatureBlockHtml = contract.headSignatureData
      ? `<img src="${contract.headSignatureData}" alt="TTE Kepala Pelabuhan" style="height:72px;object-fit:contain;margin:6px auto;" />
         <div style="font-size:10px;color:#065f46;font-weight:700;">TTE Terverifikasi • ${headSignedLabel || ""}</div>
         ${
           contract.headSignatureHash
             ? `<div style="font-size:9px;color:#475569;font-family:monospace;">Hash: ${contract.headSignatureHash.slice(0, 20)}...</div>`
             : ""
         }`
      : `<div style="height:76px;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:11px;border:1px dashed #cbd5e1;border-radius:6px;margin:8px 0;">
           Menunggu Tanda Tangan Elektronik
         </div>`;

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8" />
        <title>${contract.contractNumber} - Surat Kontrak PKS Sandar</title>
        <style>
          @page { size: A4; margin: 18mm; }
          body { font-family: "Times New Roman", Times, serif; color: #0f172a; line-height: 1.55; font-size: 12pt; }
          .kop { text-align: center; border-bottom: 3px double #0f172a; padding-bottom: 10px; margin-bottom: 18px; }
          .kop h1 { margin: 0; font-size: 14pt; letter-spacing: 0.5px; text-transform: uppercase; }
          .kop h2 { margin: 2px 0; font-size: 12pt; text-transform: uppercase; }
          .kop p { margin: 2px 0 0; font-size: 9.5pt; color: #334155; }
          .title { text-align: center; margin: 16px 0 18px; }
          .title h3 { margin: 0; font-size: 13pt; text-decoration: underline; text-transform: uppercase; }
          .title p { margin: 4px 0 0; font-family: monospace; font-size: 10.5pt; font-weight: bold; }
          table.meta { width: 100%; border-collapse: collapse; margin: 14px 0 18px; font-size: 11pt; }
          table.meta td { padding: 5px 8px; border: 1px solid #cbd5e1; vertical-align: top; }
          table.meta td.label { width: 34%; font-weight: bold; background: #f8fafc; }
          .pasal { margin: 12px 0; text-align: justify; }
          .pasal h4 { margin: 0 0 4px; font-size: 11.5pt; }
          .sign-grid { display: flex; justify-content: space-between; gap: 28px; margin-top: 32px; page-break-inside: avoid; }
          .sign-box { width: 46%; text-align: center; }
          .wet-box { height: 76px; border: 1px dashed #94a3b8; border-radius: 6px; margin: 8px 0; display: flex; align-items: center; justify-content: center; font-size: 9.5pt; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="kop">
          <h1>Pemerintah Kabupaten Mimika</h1>
          <h2>Dinas Perhubungan — Pengelola ${portName}</h2>
          <p>Sistem Pengelolaan Pelabuhan &amp; Penerimaan Daerah Terintegrasi (PORTA)</p>
        </div>

        <div class="title">
          <h3>Perjanjian Kerja Sama (PKS) Pelayanan Sandar &amp; Tambat Kapal</h3>
          <p>Nomor: ${contract.contractNumber}</p>
        </div>

        <p style="text-align:justify;">
          Pada hari ini, berdasarkan hasil verifikasi kelengkapan administrasi dan prasyarat teknis kepelabuhanan oleh Petugas Registrasi &amp; Kontrak, diterbitkan Surat Perjanjian Kerja Sama (PKS) Pelayanan Sandar dan Tambat Kapal antara Pengelola <strong>${portName}</strong> (PIHAK PERTAMA) dan <strong>${operatorName}</strong> (PIHAK KEDUA) dengan rincian sebagai berikut:
        </p>

        <table class="meta">
          <tr><td class="label">Judul Kontrak</td><td>${contract.title}</td></tr>
          <tr><td class="label">Perusahaan Operator Kapal</td><td><strong>${operatorName}</strong></td></tr>
          <tr><td class="label">Pelabuhan Layanan</td><td>${portName}</td></tr>
          <tr><td class="label">Alokasi Dermaga</td><td>${contract.dockAllocation || "Dermaga Umum"}</td></tr>
          <tr><td class="label">Kuota Sandar Bulanan</td><td>${contract.monthlyQuota || 30} Kunjungan / Bulan</td></tr>
          <tr><td class="label">Masa Berlaku Kontrak</td><td>${startDateLabel} s/d ${endDateLabel}</td></tr>
        </table>

        <div class="pasal">
          <h4>Pasal 1 — Ketentuan Operasional &amp; Retribusi</h4>
          <p>PIHAK KEDUA wajib mematuhi jadwal alokasi dermaga yang ditetapkan UPT Pelabuhan, melengkapi manifes muatan/penumpang sebelum sandar, serta melunasi retribusi jasa labuh dan tambat sesuai ketentuan peraturan daerah yang berlaku.</p>
        </div>

        <div class="pasal">
          <h4>Pasal 2 — Penandatanganan &amp; Pengesahan</h4>
          <p>Dokumen ini wajib dicetak dan ditandatangani basah (berikut stempel perusahaan dan materai secukupnya) oleh PIHAK KEDUA, kemudian dipindai (scan) dan diunggah kembali ke portal PORTA untuk pengesahan Tanda Tangan Elektronik (TTE) oleh Kepala Pelabuhan.</p>
        </div>

        <div class="sign-grid">
          <div class="sign-box">
            <div style="font-weight:bold;">PIHAK PERTAMA</div>
            <div style="font-size:10.5pt;">Kepala Pelabuhan</div>
            ${signatureBlockHtml}
            <div style="font-weight:bold;text-decoration:underline;margin-top:6px;">${headName}</div>
          </div>
          <div class="sign-box">
            <div style="font-weight:bold;">PIHAK KEDUA</div>
            <div style="font-size:10.5pt;">${operatorName}</div>
            <div class="wet-box">Tanda Tangan Basah,<br/>Materai Rp10.000 &amp; Stempel</div>
            <div style="font-weight:bold;text-decoration:underline;margin-top:6px;">Pimpinan / Kuasa Operator</div>
          </div>
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

  return (
    <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E2E8F0] w-full max-w-3xl shadow-2xl overflow-hidden my-6">
        <div className="px-6 py-4 bg-[#0B241E] text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <FileSignature className="w-5 h-5 text-[#F59E0B]" />
            <div>
              <h3 className="text-sm font-extrabold">
                Surat Kontrak PKS Sandar Siap Cetak
              </h3>
              <p className="text-[11px] text-white/75 font-mono">
                {contract.contractNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintPdf}
              className="px-3.5 py-1.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / Simpan PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:bg-white/10 cursor-pointer"
              aria-label="Tutup pratinjau kontrak"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto bg-[#F8FAFC]">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-5 shadow-2xs text-xs text-[#1E293B]">
            <div className="text-center border-b-2 border-[#0B241E] pb-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                Pemerintah Kabupaten Mimika • Dinas Perhubungan
              </p>
              <h4 className="text-base font-extrabold text-[#0B241E] mt-0.5 uppercase">
                Pengelola {portName}
              </h4>
            </div>

            <div className="text-center">
              <p className="text-sm font-extrabold underline uppercase text-[#0B241E]">
                Perjanjian Kerja Sama (PKS) Pelayanan Sandar &amp; Tambat Kapal
              </p>
              <p className="font-mono font-bold text-[#475569] mt-1">
                Nomor: {contract.contractNumber}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#64748B] block">
                  Operator Kapal (Pihak Kedua)
                </span>
                <span className="font-bold text-[#0B241E]">{operatorName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#64748B] block">
                  Judul Kontrak
                </span>
                <span className="font-semibold text-[#0B241E]">{contract.title}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#64748B] block">
                  Alokasi Dermaga &amp; Kuota
                </span>
                <span className="font-semibold">
                  {contract.dockAllocation || "Dermaga Umum"} ({contract.monthlyQuota || 30}x/bln)
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#64748B] block">
                  Masa Berlaku
                </span>
                <span className="font-semibold">
                  {startDateLabel} s/d {endDateLabel}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              <strong>Petunjuk Penandatanganan:</strong> Klik <strong>Cetak / Simpan PDF</strong> di atas, bubuhkan{" "}
              <strong>tanda tangan basah, materai &amp; stempel perusahaan</strong> pada kolom Pihak Kedua, lalu scan dan unggah ulang dokumen tersebut melalui tombol <strong>Upload Scan TTD Basah</strong>.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="border border-[#E2E8F0] rounded-xl p-4 text-center">
                <p className="font-bold text-[#0B241E]">PIHAK PERTAMA</p>
                <p className="text-[11px] text-[#64748B] mb-2">Kepala Pelabuhan</p>
                {contract.headSignatureData ? (
                  <div className="py-2 space-y-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={contract.headSignatureData}
                      alt="TTE Kepala Pelabuhan"
                      className="h-16 mx-auto object-contain"
                    />
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      TTE Sah • {headSignedLabel}
                    </span>
                  </div>
                ) : (
                  <div className="h-20 border border-dashed border-[#CBD5E1] rounded-lg flex items-center justify-center text-[11px] text-[#94A3B8]">
                    Menunggu TTE Kepala Pelabuhan
                  </div>
                )}
                <p className="font-bold underline mt-2 text-[#0B241E]">{headName}</p>
              </div>

              <div className="border border-[#E2E8F0] rounded-xl p-4 text-center">
                <p className="font-bold text-[#0B241E]">PIHAK KEDUA</p>
                <p className="text-[11px] text-[#64748B] mb-2">{operatorName}</p>
                <div className="h-20 border border-dashed border-[#CBD5E1] rounded-lg flex items-center justify-center text-[11px] text-[#64748B] px-3">
                  Area Tanda Tangan Basah, Materai &amp; Stempel Perusahaan
                </div>
                <p className="font-bold underline mt-2 text-[#0B241E]">
                  Pimpinan / Kuasa Operator
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
