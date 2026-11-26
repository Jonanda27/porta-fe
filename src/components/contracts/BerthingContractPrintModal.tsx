"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Printer, X, FileSignature, ShieldCheck } from "lucide-react";
import { OperatorBerthingContract } from "@/types/kapal.types";

interface BerthingContractPrintModalProps {
  contract: OperatorBerthingContract | null;
  operatorNameFallback?: string;
  onClose: () => void;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export function BerthingContractPrintModal({
  contract,
  operatorNameFallback,
  onClose,
}: BerthingContractPrintModalProps) {
  if (!contract || typeof document === "undefined") return null;

  const operatorName =
    contract.operator?.name || operatorNameFallback || `Operator #${contract.operatorId}`;
  const portName = contract.port?.name || "Pelabuhan Umum Poumako";
  const dockAllocation = contract.dockAllocation || "Semua Fasilitas Dermaga (Umum)";
  const monthlyQuota = contract.monthlyQuota || 30;

  const formatLongDate = (dateStr?: string | null): string => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const startDateLabel = formatLongDate(contract.startDate);
  const endDateLabel = formatLongDate(contract.endDate);
  const contractDateLabel = formatLongDate(contract.createdAt || contract.startDate);

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
    const printWin = window.open("", "_blank", "width=950,height=800");
    if (!printWin) return;

    const safePortName = escapeHtml(portName);
    const safePortNameUpper = escapeHtml(portName.toUpperCase());
    const safeOperatorName = escapeHtml(operatorName);
    const safeContractNumber = escapeHtml(contract.contractNumber);
    const safeTitle = escapeHtml(contract.title);
    const safeDock = escapeHtml(dockAllocation);
    const safeHeadName = escapeHtml(headName);

    const signatureBlockHtml = contract.headSignatureData
      ? `<img src="${contract.headSignatureData}" alt="TTE Kepala Pelabuhan" style="height:68px;object-fit:contain;margin:4px auto;display:block;" />
         <div style="font-size:9pt;color:#065f46;font-weight:bold;">TTE Terverifikasi • ${escapeHtml(headSignedLabel || "")}</div>
         ${
           contract.headSignatureHash
             ? `<div style="font-size:8pt;color:#475569;font-family:monospace;">Hash: ${escapeHtml(contract.headSignatureHash.slice(0, 22))}...</div>`
             : ""
         }`
      : `<div style="height:78px;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:9.5pt;border:1px dashed #94a3b8;border-radius:4px;margin:8px 0;">
           Menunggu Pengesahan TTE<br/>Kepala Pelabuhan
         </div>`;

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8" />
        <title>${safeContractNumber} - Surat Perjanjian Kerja Sama (PKS Sandar)</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 18mm 20mm;
          }
          * { box-sizing: border-box; }
          body {
            font-family: "Times New Roman", Times, serif;
            color: #0f172a;
            line-height: 1.5;
            font-size: 11pt;
            margin: 0;
            padding: 0;
          }
          .kop {
            text-align: center;
            border-bottom: 3px double #0f172a;
            padding-bottom: 8px;
            margin-bottom: 16px;
          }
          .kop h1 {
            margin: 0;
            font-size: 13pt;
            letter-spacing: 0.4px;
            text-transform: uppercase;
          }
          .kop h2 {
            margin: 2px 0;
            font-size: 12pt;
            text-transform: uppercase;
          }
          .kop h3 {
            margin: 2px 0;
            font-size: 11pt;
            text-transform: uppercase;
          }
          .kop p {
            margin: 3px 0 0;
            font-size: 9pt;
            color: #334155;
            font-style: italic;
          }
          .doc-title {
            text-align: center;
            margin: 14px 0 16px;
          }
          .doc-title h4 {
            margin: 0;
            font-size: 12.5pt;
            text-decoration: underline;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          .doc-title .sub {
            margin: 3px 0 0;
            font-size: 10.5pt;
            font-weight: bold;
            text-transform: uppercase;
          }
          .doc-title .num {
            margin: 4px 0 0;
            font-family: "Courier New", Courier, monospace;
            font-size: 10.5pt;
            font-weight: bold;
          }
          p.justify {
            text-align: justify;
            margin: 0 0 8px;
          }
          table.parties {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0 10px;
            font-size: 10.5pt;
          }
          table.parties td {
            padding: 2px 4px;
            vertical-align: top;
          }
          table.parties td.no { width: 22px; font-weight: bold; }
          table.parties td.lbl { width: 155px; }
          table.parties td.sep { width: 14px; text-align: center; }
          table.meta {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0 14px;
            font-size: 10.5pt;
          }
          table.meta td {
            padding: 5px 8px;
            border: 1px solid #475569;
            vertical-align: top;
          }
          table.meta td.label {
            width: 34%;
            font-weight: bold;
            background: #f8fafc;
          }
          .pasal {
            margin: 10px 0;
            text-align: justify;
            page-break-inside: avoid;
          }
          .pasal h5 {
            margin: 0 0 4px;
            font-size: 11pt;
            text-align: center;
            text-transform: uppercase;
          }
          .pasal ol {
            margin: 0;
            padding-left: 18px;
          }
          .pasal ol li {
            margin-bottom: 3px;
          }
          .sign-wrap {
            margin-top: 22px;
            page-break-inside: avoid;
          }
          .sign-place {
            text-align: right;
            margin-bottom: 12px;
            font-size: 10.5pt;
          }
          .sign-grid {
            display: flex;
            justify-content: space-between;
            gap: 28px;
          }
          .sign-box {
            width: 46%;
            text-align: center;
            font-size: 10.5pt;
          }
          .wet-box {
            height: 78px;
            border: 1px dashed #64748b;
            border-radius: 4px;
            margin: 8px 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9pt;
            color: #475569;
          }
        </style>
      </head>
      <body>
        <div class="kop">
          <h1>Pemerintah Kabupaten Mimika</h1>
          <h2>Dinas Perhubungan</h2>
          <h3>Pengelola ${safePortNameUpper}</h3>
          <p>Sistem Pengelolaan Pelabuhan &amp; Penerimaan Daerah Terintegrasi (PORTA) • Kabupaten Mimika, Papua Tengah</p>
        </div>

        <div class="doc-title">
          <h4>Surat Perjanjian Kerja Sama (PKS)</h4>
          <div class="sub">Pemanfaatan Fasilitas Sandar, Tambat &amp; Pelayanan Jasa Kepelabuhanan</div>
          <div class="num">Nomor: ${safeContractNumber}</div>
        </div>

        <p class="justify">
          Pada hari ini, tanggal <strong>${escapeHtml(contractDateLabel)}</strong>, bertempat di Timika, Kabupaten Mimika, kami yang bertanda tangan di bawah ini:
        </p>

        <table class="parties">
          <tr>
            <td class="no">1.</td>
            <td class="lbl">Nama / Jabatan</td>
            <td class="sep">:</td>
            <td><strong>${safeHeadName}</strong> — Kepala Pelabuhan / Pengelola ${safePortName}</td>
          </tr>
          <tr>
            <td></td>
            <td class="lbl">Instansi</td>
            <td class="sep">:</td>
            <td>Dinas Perhubungan Kabupaten Mimika (${safePortName})</td>
          </tr>
        </table>
        <p class="justify" style="padding-left:22px;">
          Dalam hal ini bertindak untuk dan atas nama jabatannya mewakili Pemerintah Kabupaten Mimika selaku Pengelola Fasilitas Pelabuhan, yang selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.
        </p>

        <table class="parties">
          <tr>
            <td class="no">2.</td>
            <td class="lbl">Perusahaan / Badan Usaha</td>
            <td class="sep">:</td>
            <td><strong>${safeOperatorName}</strong></td>
          </tr>
          <tr>
            <td></td>
            <td class="lbl">Kedudukan</td>
            <td class="sep">:</td>
            <td>Perusahaan Pelayaran / Operator Kapal Pengguna Jasa Kepelabuhanan</td>
          </tr>
        </table>
        <p class="justify" style="padding-left:22px;">
          Dalam hal ini diwakili oleh Pimpinan / Kuasa Penanggung Jawab yang sah dan bertindak untuk dan atas nama badan usaha tersebut, yang selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong>.
        </p>

        <p class="justify">
          <strong>PIHAK PERTAMA</strong> dan <strong>PIHAK KEDUA</strong> secara bersama-sama disebut <strong>PARA PIHAK</strong>, terlebih dahulu menerangkan hal-hal sebagai berikut:
        </p>
        <p class="justify" style="padding-left:14px;">
          <strong>BAHWA</strong> PIHAK PERTAMA adalah pengelola resmi fasilitas kepelabuhanan pada ${safePortName} yang berwenang mengatur alokasi dermaga, pelayanan jasa labuh/tambat, serta pemungutan retribusi daerah sesuai Peraturan Pemerintah Nomor 35 Tahun 2023 dan Peraturan Bupati Mimika Nomor 25 Tahun 2024;<br/>
          <strong>BAHWA</strong> PIHAK KEDUA adalah operator kapal yang telah melalui verifikasi kelengkapan administrasi pada sistem PORTA dan bermaksud menjalin kerja sama pemanfaatan fasilitas sandar serta pelayanan jasa kepelabuhanan pada ${safePortName}.
        </p>

        <table class="meta">
          <tr><td class="label">Judul Perjanjian</td><td>${safeTitle}</td></tr>
          <tr><td class="label">Pelabuhan Layanan</td><td>${safePortName}</td></tr>
          <tr><td class="label">Alokasi Dermaga</td><td>${safeDock}</td></tr>
          <tr><td class="label">Estimasi Kuota Bulanan</td><td>${monthlyQuota} Kunjungan / Bulan</td></tr>
          <tr><td class="label">Masa Berlaku Kontrak</td><td>${escapeHtml(startDateLabel)} s/d ${escapeHtml(endDateLabel)}</td></tr>
        </table>

        <p class="justify">
          Berdasarkan hal-hal tersebut di atas, PARA PIHAK sepakat untuk mengikatkan diri dalam Perjanjian Kerja Sama (PKS) ini dengan syarat dan ketentuan sebagai berikut:
        </p>

        <div class="pasal">
          <h5>Pasal 1<br/>Ruang Lingkup Kerja Sama</h5>
          <p>PIHAK PERTAMA memberikan hak pemanfaatan fasilitas sandar, tambat, dan kolam labuh pada <strong>${safePortName}</strong> dengan alokasi utama pada <strong>${safeDock}</strong> dan estimasi kuota sebanyak <strong>${monthlyQuota} (kunjungan) per bulan</strong> kepada armada kapal yang dikelola secara sah oleh PIHAK KEDUA sesuai jadwal operasional pelabuhan.</p>
        </div>

        <div class="pasal">
          <h5>Pasal 2<br/>Jangka Waktu &amp; Perpanjangan Kontrak</h5>
          <ol>
            <li>Perjanjian Kerja Sama ini berlaku efektif terhitung sejak tanggal <strong>${escapeHtml(startDateLabel)}</strong> sampai dengan tanggal <strong>${escapeHtml(endDateLabel)}</strong>.</li>
            <li>Apabila PARA PIHAK bermaksud memperpanjang masa berlaku perjanjian, PIHAK KEDUA wajib mengajukan permohonan perpanjangan melalui sistem PORTA paling lambat 30 (tiga puluh) hari kalender sebelum jangka waktu kontrak berakhir.</li>
          </ol>
        </div>

        <div class="pasal">
          <h5>Pasal 3<br/>Hak dan Kewajiban PIHAK PERTAMA</h5>
          <ol>
            <li>Menjamin ketersediaan dan kelayakan fasilitas dermaga yang dialokasikan serta memberikan pelayanan sandar/tambat secara adil dan terukur sesuai jadwal tambat yang disetujui.</li>
            <li>Menerbitkan persetujuan sandar dan dokumen tagihan retribusi daerah resmi (e-SKRD) melalui sistem PORTA secara transparan.</li>
            <li>Melakukan pengawasan keselamatan pelayaran, ketertiban operasional, dan evaluasi kepatuhan pemanfaatan fasilitas pelabuhan.</li>
          </ol>
        </div>

        <div class="pasal">
          <h5>Pasal 4<br/>Hak dan Kewajiban PIHAK KEDUA</h5>
          <ol>
            <li>Memperoleh layanan alokasi sandar/tambat serta fasilitas utilitas pelabuhan (air bersih, listrik darat, dan pengelolaan limbah apabila diajukan) sesuai ketersediaan dan ketentuan yang berlaku.</li>
            <li>Wajib mengajukan permohonan sandar dan melengkapi pelaporan manifes muatan/penumpang (SOLAS) melalui portal PORTA sebelum kapal tiba di pelabuhan.</li>
            <li>Wajib menjaga keamanan, ketertiban, keselamatan kerja, serta kebersihan area dermaga dan bertanggung jawab atas segala kerusakan fasilitas akibat kelalaian operasional armada PIHAK KEDUA.</li>
          </ol>
        </div>

        <div class="pasal">
          <h5>Pasal 5<br/>Retribusi Daerah dan Tata Cara Pembayaran</h5>
          <p>PIHAK KEDUA wajib melunasi seluruh retribusi pelayanan jasa labuh, tambat, serta biaya pemakaian utilitas sesuai tarif yang ditetapkan dalam Peraturan Pemerintah Nomor 35 Tahun 2023 dan Peraturan Bupati Mimika Nomor 25 Tahun 2024 melalui kanal pembayaran resmi e-SKRD pada sistem PORTA sesuai batas waktu jatuh tempo.</p>
        </div>

        <div class="pasal">
          <h5>Pasal 6<br/>Larangan Pengalihan Hak</h5>
          <p>Selama jangka waktu berlakunya perjanjian ini, PIHAK KEDUA dilarang mengalihkan, menyewakan kembali, atau memindahtangankan hak pemanfaatan fasilitas maupun kuota slot sandar dalam perjanjian ini kepada pihak ketiga mana pun tanpa persetujuan tertulis terlebih dahulu dari PIHAK PERTAMA.</p>
        </div>

        <div class="pasal">
          <h5>Pasal 7<br/>Keadaan Memaksa (Force Majeure) &amp; Wanprestasi</h5>
          <ol>
            <li>PARA PIHAK dibebaskan dari tuntutan ganti rugi apabila keterlambatan atau kegagalan pelaksanaan kewajiban disebabkan oleh keadaan memaksa (<em>force majeure</em>) di luar kendali manusia, termasuk namun tidak terbatas pada bencana alam, gelombang ekstrem, gempa bumi, kebakaran, dan kebijakan darurat pemerintah.</li>
            <li>Apabila PIHAK KEDUA melanggar ketentuan perjanjian atau menunggak kewajiban retribusi daerah, PIHAK PERTAMA berhak menangguhkan layanan pengajuan sandar hingga kewajiban diselesaikan atau membatalkan perjanjian secara sepihak.</li>
          </ol>
        </div>

        <div class="pasal">
          <h5>Pasal 8<br/>Penyelesaian Perselisihan</h5>
          <ol>
            <li>Apabila terjadi perbedaan penafsiran atau perselisihan dalam pelaksanaan perjanjian ini, PARA PIHAK sepakat untuk menyelesaikannya terlebih dahulu melalui jalan musyawarah untuk mufakat.</li>
            <li>Apabila dalam waktu 30 (tiga puluh) hari kalender penyelesaian secara musyawarah tidak tercapai, PARA PIHAK sepakat untuk menempuh jalur hukum dengan memilih domisili hukum yang tetap dan umum pada <strong>Kantor Kepaniteraan Pengadilan Negeri Timika</strong>.</li>
          </ol>
        </div>

        <div class="pasal">
          <h5>Pasal 9<br/>Addendum dan Ketentuan Penutup</h5>
          <p>Hal-hal yang belum diatur atau belum cukup diatur dalam perjanjian ini akan ditetapkan bersama secara musyawarah oleh PARA PIHAK dan dituangkan dalam suatu <em>Addendum</em> tertulis yang merupakan bagian tidak terpisahkan dari Perjanjian Kerja Sama ini. Surat Perjanjian ini dibuat dengan itikad baik tanpa paksaan dari pihak mana pun serta ditandatangani oleh PARA PIHAK untuk dipergunakan sebagaimana mestinya.</p>
        </div>

        <div class="sign-wrap">
          <div class="sign-place">Timika, ${escapeHtml(contractDateLabel)}</div>
          <div class="sign-grid">
            <div class="sign-box">
              <div style="font-weight:bold;">PIHAK PERTAMA</div>
              <div>Kepala Pelabuhan • ${safePortName}</div>
              ${signatureBlockHtml}
              <div style="font-weight:bold;text-decoration:underline;margin-top:6px;">${safeHeadName}</div>
            </div>
            <div class="sign-box">
              <div style="font-weight:bold;">PIHAK KEDUA</div>
              <div>${safeOperatorName}</div>
              <div class="wet-box">Tanda Tangan Basah,<br/>Materai Rp10.000 &amp; Stempel</div>
              <div style="font-weight:bold;text-decoration:underline;margin-top:6px;">Pimpinan / Kuasa Operator</div>
            </div>
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

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E2E8F0] w-full max-w-5xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0B241E] text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <FileSignature className="w-5 h-5 text-[#F59E0B]" />
            <div>
              <h3 className="text-sm font-extrabold">
                Pratinjau Dokumen Resmi PKS Sandar (Ukuran A4)
              </h3>
              <p className="text-[11px] text-white/75 font-mono">
                {contract.contractNumber} • Standar Kertas A4 (210 × 297 mm)
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
              Cetak / Simpan PDF (A4)
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

        {/* Instruction Strip */}
        <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-[11px] leading-relaxed shrink-0">
          <strong>Petunjuk Penandatanganan:</strong> Klik <strong>Cetak / Simpan PDF (A4)</strong> di atas, bubuhkan{" "}
          <strong>tanda tangan basah, materai Rp10.000 &amp; stempel perusahaan</strong> pada kolom <strong>PIHAK KEDUA</strong>, lalu pindai (scan) dan unggah ulang melalui tombol <strong>Upload Scan TTD Basah</strong>.
        </div>

        {/* A4 Paper Preview Area */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-200/80 flex-1">
          <div
            className="mx-auto bg-white border border-slate-300 shadow-xl text-[#0f172a] font-serif leading-relaxed px-8 py-10 sm:px-[18mm] sm:py-[18mm]"
            style={{ width: "100%", maxWidth: "210mm", minHeight: "297mm", fontSize: "11pt" }}
          >
            {/* KOP SURAT */}
            <div className="text-center border-b-[3px] border-double border-[#0f172a] pb-2.5 mb-5">
              <p className="text-[12pt] font-bold uppercase tracking-wide">
                Pemerintah Kabupaten Mimika
              </p>
              <p className="text-[11.5pt] font-bold uppercase">Dinas Perhubungan</p>
              <h4 className="text-[11pt] font-bold uppercase">
                Pengelola {portName}
              </h4>
              <p className="text-[9pt] italic text-slate-600 mt-0.5">
                Sistem Pengelolaan Pelabuhan &amp; Penerimaan Daerah Terintegrasi (PORTA) • Kabupaten Mimika, Papua Tengah
              </p>
            </div>

            {/* JUDUL SURAT */}
            <div className="text-center mb-5">
              <h5 className="text-[12pt] font-bold underline uppercase tracking-wide">
                Surat Perjanjian Kerja Sama (PKS)
              </h5>
              <p className="text-[10pt] font-bold uppercase mt-0.5">
                Pemanfaatan Fasilitas Sandar, Tambat &amp; Pelayanan Jasa Kepelabuhanan
              </p>
              <p className="font-mono text-[10pt] font-bold mt-1">
                Nomor: {contract.contractNumber}
              </p>
            </div>

            {/* PEMBUKA & KOMPARISI */}
            <p className="text-justify mb-3">
              Pada hari ini, tanggal <strong>{contractDateLabel}</strong>, bertempat di Timika, Kabupaten Mimika, kami yang bertanda tangan di bawah ini:
            </p>

            <div className="space-y-3 mb-4">
              <div>
                <table className="w-full text-[10.5pt]">
                  <tbody>
                    <tr>
                      <td className="w-6 font-bold align-top">1.</td>
                      <td className="w-40 align-top">Nama / Jabatan</td>
                      <td className="w-3 text-center align-top">:</td>
                      <td>
                        <strong>{headName}</strong> — Kepala Pelabuhan / Pengelola {portName}
                      </td>
                    </tr>
                    <tr>
                      <td />
                      <td className="align-top">Instansi</td>
                      <td className="text-center align-top">:</td>
                      <td>Dinas Perhubungan Kabupaten Mimika ({portName})</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-justify pl-6 mt-1">
                  Dalam hal ini bertindak untuk dan atas nama jabatannya mewakili Pemerintah Kabupaten Mimika selaku Pengelola Fasilitas Pelabuhan, yang selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.
                </p>
              </div>

              <div>
                <table className="w-full text-[10.5pt]">
                  <tbody>
                    <tr>
                      <td className="w-6 font-bold align-top">2.</td>
                      <td className="w-40 align-top">Perusahaan / Badan Usaha</td>
                      <td className="w-3 text-center align-top">:</td>
                      <td>
                        <strong>{operatorName}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td />
                      <td className="align-top">Kedudukan</td>
                      <td className="text-center align-top">:</td>
                      <td>Perusahaan Pelayaran / Operator Kapal Pengguna Jasa Kepelabuhanan</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-justify pl-6 mt-1">
                  Dalam hal ini diwakili oleh Pimpinan / Kuasa Penanggung Jawab yang sah dan bertindak untuk dan atas nama badan usaha tersebut, yang selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong>.
                </p>
              </div>
            </div>

            {/* KONSIDERANS */}
            <p className="text-justify mb-2">
              <strong>PIHAK PERTAMA</strong> dan <strong>PIHAK KEDUA</strong> secara bersama-sama disebut <strong>PARA PIHAK</strong>, terlebih dahulu menerangkan hal-hal sebagai berikut:
            </p>
            <div className="text-justify pl-3 space-y-1 mb-4 text-[10.5pt]">
              <p>
                <strong>BAHWA</strong> PIHAK PERTAMA adalah pengelola resmi fasilitas kepelabuhanan pada {portName} yang berwenang mengatur alokasi dermaga, pelayanan jasa labuh/tambat, serta pemungutan retribusi daerah sesuai Peraturan Pemerintah Nomor 35 Tahun 2023 dan Peraturan Bupati Mimika Nomor 25 Tahun 2024;
              </p>
              <p>
                <strong>BAHWA</strong> PIHAK KEDUA adalah operator kapal yang telah melalui verifikasi kelengkapan administrasi pada sistem PORTA dan bermaksud menjalin kerja sama pemanfaatan fasilitas sandar serta pelayanan jasa kepelabuhanan pada {portName}.
              </p>
            </div>

            {/* TABEL RINGKASAN KONTRAK */}
            <table className="w-full border-collapse border border-slate-500 text-[10.5pt] mb-4">
              <tbody>
                <tr>
                  <td className="w-[34%] font-bold bg-slate-50 border border-slate-500 px-2.5 py-1.5">
                    Judul Perjanjian
                  </td>
                  <td className="border border-slate-500 px-2.5 py-1.5">{contract.title}</td>
                </tr>
                <tr>
                  <td className="font-bold bg-slate-50 border border-slate-500 px-2.5 py-1.5">
                    Pelabuhan Layanan
                  </td>
                  <td className="border border-slate-500 px-2.5 py-1.5">{portName}</td>
                </tr>
                <tr>
                  <td className="font-bold bg-slate-50 border border-slate-500 px-2.5 py-1.5">
                    Alokasi Dermaga
                  </td>
                  <td className="border border-slate-500 px-2.5 py-1.5">{dockAllocation}</td>
                </tr>
                <tr>
                  <td className="font-bold bg-slate-50 border border-slate-500 px-2.5 py-1.5">
                    Estimasi Kuota Bulanan
                  </td>
                  <td className="border border-slate-500 px-2.5 py-1.5">
                    {monthlyQuota} Kunjungan / Bulan
                  </td>
                </tr>
                <tr>
                  <td className="font-bold bg-slate-50 border border-slate-500 px-2.5 py-1.5">
                    Masa Berlaku Kontrak
                  </td>
                  <td className="border border-slate-500 px-2.5 py-1.5">
                    {startDateLabel} s/d {endDateLabel}
                  </td>
                </tr>
              </tbody>
            </table>

            <p className="text-justify mb-4">
              Berdasarkan hal-hal tersebut di atas, PARA PIHAK sepakat untuk mengikatkan diri dalam Perjanjian Kerja Sama (PKS) ini dengan syarat dan ketentuan sebagai berikut:
            </p>

            {/* PASAL-PASAL */}
            <div className="space-y-3.5 text-justify">
              <div>
                <h6 className="font-bold text-center uppercase">
                  Pasal 1 — Ruang Lingkup Kerja Sama
                </h6>
                <p>
                  PIHAK PERTAMA memberikan hak pemanfaatan fasilitas sandar, tambat, dan kolam labuh pada <strong>{portName}</strong> dengan alokasi utama pada <strong>{dockAllocation}</strong> dan estimasi kuota sebanyak <strong>{monthlyQuota} kunjungan per bulan</strong> kepada armada kapal yang dikelola secara sah oleh PIHAK KEDUA sesuai jadwal operasional pelabuhan.
                </p>
              </div>

              <div>
                <h6 className="font-bold text-center uppercase">
                  Pasal 2 — Jangka Waktu &amp; Perpanjangan Kontrak
                </h6>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>
                    Perjanjian Kerja Sama ini berlaku efektif terhitung sejak tanggal <strong>{startDateLabel}</strong> sampai dengan tanggal <strong>{endDateLabel}</strong>.
                  </li>
                  <li>
                    Apabila PARA PIHAK bermaksud memperpanjang masa berlaku perjanjian, PIHAK KEDUA wajib mengajukan permohonan perpanjangan melalui sistem PORTA paling lambat 30 (tiga puluh) hari kalender sebelum jangka waktu kontrak berakhir.
                  </li>
                </ol>
              </div>

              <div>
                <h6 className="font-bold text-center uppercase">
                  Pasal 3 — Hak dan Kewajiban PIHAK PERTAMA
                </h6>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>
                    Menjamin ketersediaan dan kelayakan fasilitas dermaga yang dialokasikan serta memberikan pelayanan sandar/tambat secara adil dan terukur sesuai jadwal tambat yang disetujui.
                  </li>
                  <li>
                    Menerbitkan persetujuan sandar dan dokumen tagihan retribusi daerah resmi (e-SKRD) melalui sistem PORTA secara transparan.
                  </li>
                  <li>
                    Melakukan pengawasan keselamatan pelayaran, ketertiban operasional, dan evaluasi kepatuhan pemanfaatan fasilitas pelabuhan.
                  </li>
                </ol>
              </div>

              <div>
                <h6 className="font-bold text-center uppercase">
                  Pasal 4 — Hak dan Kewajiban PIHAK KEDUA
                </h6>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>
                    Memperoleh layanan alokasi sandar/tambat serta fasilitas utilitas pelabuhan (air bersih, listrik darat, dan pengelolaan limbah apabila diajukan) sesuai ketersediaan dan ketentuan yang berlaku.
                  </li>
                  <li>
                    Wajib mengajukan permohonan sandar dan melengkapi pelaporan manifes muatan/penumpang (SOLAS) melalui portal PORTA sebelum kapal tiba di pelabuhan.
                  </li>
                  <li>
                    Wajib menjaga keamanan, ketertiban, keselamatan kerja, serta kebersihan area dermaga dan bertanggung jawab atas segala kerusakan fasilitas akibat kelalaian operasional armada PIHAK KEDUA.
                  </li>
                </ol>
              </div>

              <div>
                <h6 className="font-bold text-center uppercase">
                  Pasal 5 — Retribusi Daerah dan Tata Cara Pembayaran
                </h6>
                <p>
                  PIHAK KEDUA wajib melunasi seluruh retribusi pelayanan jasa labuh, tambat, serta biaya pemakaian utilitas sesuai tarif yang ditetapkan dalam Peraturan Pemerintah Nomor 35 Tahun 2023 dan Peraturan Bupati Mimika Nomor 25 Tahun 2024 melalui kanal pembayaran resmi e-SKRD pada sistem PORTA sesuai batas waktu jatuh tempo.
                </p>
              </div>

              <div>
                <h6 className="font-bold text-center uppercase">
                  Pasal 6 — Larangan Pengalihan Hak
                </h6>
                <p>
                  Selama jangka waktu berlakunya perjanjian ini, PIHAK KEDUA dilarang mengalihkan, menyewakan kembali, atau memindahtangankan hak pemanfaatan fasilitas maupun kuota slot sandar dalam perjanjian ini kepada pihak ketiga mana pun tanpa persetujuan tertulis terlebih dahulu dari PIHAK PERTAMA.
                </p>
              </div>

              <div>
                <h6 className="font-bold text-center uppercase">
                  Pasal 7 — Keadaan Memaksa (Force Majeure) &amp; Wanprestasi
                </h6>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>
                    PARA PIHAK dibebaskan dari tuntutan ganti rugi apabila keterlambatan atau kegagalan pelaksanaan kewajiban disebabkan oleh keadaan memaksa (<em>force majeure</em>) di luar kendali manusia, termasuk namun tidak terbatas pada bencana alam, gelombang ekstrem, gempa bumi, kebakaran, dan kebijakan darurat pemerintah.
                  </li>
                  <li>
                    Apabila PIHAK KEDUA melanggar ketentuan perjanjian atau menunggak kewajiban retribusi daerah, PIHAK PERTAMA berhak menangguhkan layanan pengajuan sandar hingga kewajiban diselesaikan atau membatalkan perjanjian secara sepihak.
                  </li>
                </ol>
              </div>

              <div>
                <h6 className="font-bold text-center uppercase">
                  Pasal 8 — Penyelesaian Perselisihan
                </h6>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>
                    Apabila terjadi perbedaan penafsiran atau perselisihan dalam pelaksanaan perjanjian ini, PARA PIHAK sepakat untuk menyelesaikannya terlebih dahulu melalui jalan musyawarah untuk mufakat.
                  </li>
                  <li>
                    Apabila dalam waktu 30 (tiga puluh) hari kalender penyelesaian secara musyawarah tidak tercapai, PARA PIHAK sepakat untuk menempuh jalur hukum dengan memilih domisili hukum yang tetap dan umum pada{" "}
                    <strong>Kantor Kepaniteraan Pengadilan Negeri Timika</strong>.
                  </li>
                </ol>
              </div>

              <div>
                <h6 className="font-bold text-center uppercase">
                  Pasal 9 — Addendum dan Ketentuan Penutup
                </h6>
                <p>
                  Hal-hal yang belum diatur atau belum cukup diatur dalam perjanjian ini akan ditetapkan bersama secara musyawarah oleh PARA PIHAK dan dituangkan dalam suatu <em>Addendum</em> tertulis yang merupakan bagian tidak terpisahkan dari Perjanjian Kerja Sama ini. Surat Perjanjian ini dibuat dengan itikad baik tanpa paksaan dari pihak mana pun serta ditandatangani oleh PARA PIHAK untuk dipergunakan sebagaimana mestinya.
                </p>
              </div>
            </div>

            {/* TANDA TANGAN (PIHAK PERTAMA & PIHAK KEDUA) */}
            <div className="mt-8 pt-2">
              <p className="text-right text-[10.5pt] mb-4">
                Timika, {contractDateLabel}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="text-center">
                  <p className="font-bold">PIHAK PERTAMA</p>
                  <p className="text-[10pt] mb-2">Kepala Pelabuhan • {portName}</p>
                  {contract.headSignatureData ? (
                    <div className="py-1 space-y-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={contract.headSignatureData}
                        alt="TTE Kepala Pelabuhan"
                        className="h-16 mx-auto object-contain"
                      />
                      <span className="inline-flex items-center gap-1 font-sans text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" />
                        TTE Sah • {headSignedLabel}
                      </span>
                    </div>
                  ) : (
                    <div className="h-20 border border-dashed border-slate-400 rounded flex items-center justify-center text-[9.5pt] text-slate-500 px-2">
                      Menunggu TTE Kepala Pelabuhan
                    </div>
                  )}
                  <p className="font-bold underline mt-2">{headName}</p>
                </div>

                <div className="text-center">
                  <p className="font-bold">PIHAK KEDUA</p>
                  <p className="text-[10pt] mb-2">{operatorName}</p>
                  <div className="h-20 border border-dashed border-slate-400 rounded flex items-center justify-center text-[9.5pt] text-slate-500 px-3">
                    Area Tanda Tangan Basah, Materai Rp10.000 &amp; Stempel
                  </div>
                  <p className="font-bold underline mt-2">Pimpinan / Kuasa Operator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
