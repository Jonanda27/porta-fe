"use client";

import React, { useRef } from "react";
import { Printer, X, CheckCircle2, ShieldCheck, QrCode } from "lucide-react";
import { ReceiptModalData } from "@/types/tenant.types";

interface PrintReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: ReceiptModalData | null;
}

function angkaTerbilang(nilai: number): string {
  const bilangan = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
  ];
  nilai = Math.floor(Math.abs(nilai));
  if (nilai === 0) return "Nol";
  if (nilai < 12) return bilangan[nilai];
  if (nilai < 20) return bilangan[nilai - 10] + " Belas";
  if (nilai < 100)
    return (
      bilangan[Math.floor(nilai / 10)] +
      " Puluh" +
      (nilai % 10 !== 0 ? " " + bilangan[nilai % 10] : "")
    );
  if (nilai < 200)
    return "Seratus" + (nilai - 100 !== 0 ? " " + angkaTerbilang(nilai - 100) : "");
  if (nilai < 1000)
    return (
      bilangan[Math.floor(nilai / 100)] +
      " Ratus" +
      (nilai % 100 !== 0 ? " " + angkaTerbilang(nilai % 100) : "")
    );
  if (nilai < 2000)
    return (
      "Seribu" + (nilai - 1000 !== 0 ? " " + angkaTerbilang(nilai - 1000) : "")
    );
  if (nilai < 1000000)
    return (
      angkaTerbilang(Math.floor(nilai / 1000)) +
      " Ribu" +
      (nilai % 1000 !== 0 ? " " + angkaTerbilang(nilai % 1000) : "")
    );
  if (nilai < 1000000000)
    return (
      angkaTerbilang(Math.floor(nilai / 1000000)) +
      " Juta" +
      (nilai % 1000000 !== 0 ? " " + angkaTerbilang(nilai % 1000000) : "")
    );
  if (nilai < 1000000000000)
    return (
      angkaTerbilang(Math.floor(nilai / 1000000000)) +
      " Miliar" +
      (nilai % 1000000000 !== 0
        ? " " + angkaTerbilang(nilai % 1000000000)
        : "")
    );
  return nilai.toString();
}

export function PrintReceiptModal({
  isOpen,
  onClose,
  receipt,
}: PrintReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !receipt) return null;

  const isLease = receipt.type === "LEASE_PAYMENT";
  const leaseData = isLease ? receipt.data : null;
  const utilityData = !isLease ? receipt.data : null;

  const ssrdNumber = isLease ? leaseData!.ssrdNumber : utilityData!.ssrdNumber;
  const referenceNumber = isLease
    ? leaseData!.contractNumber
    : utilityData!.readingNumber;
  const paymentDate = isLease ? leaseData!.paymentDate : utilityData!.paymentDate;
  const formattedDate = new Date(paymentDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const portName = isLease ? leaseData!.portName : utilityData!.portName;

  const taxPayerName = isLease
    ? leaseData!.taxPayer.businessName || leaseData!.taxPayer.tenantName
    : utilityData!.taxPayer.businessName || utilityData!.taxPayer.tenantName;
  const taxPayerNpwp = isLease
    ? leaseData!.taxPayer.tenantNpwp
    : utilityData!.taxPayer.tenantNpwp;

  const totalAmount = isLease
    ? Number(leaseData!.paymentDetails.amountPaidIdr)
    : Number(utilityData!.paymentDetails.totalAmountIdr);

  const terbilangText = `${angkaTerbilang(totalAmount)} Rupiah`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      {/* Container wrapper */}
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Toolbar (hidden during print) */}
        <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D97706]/20 border border-[#D97706]/40 flex items-center justify-center text-[#D97706]">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                Kuitansi Sah Retribusi Daerah (e-SSRD)
              </h2>
              <p className="text-[11px] text-slate-400">
                Dokumen Resmi Bukti Penyetoran Kas Daerah Kab. Mimika
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Cetak Dokumen / Unduh PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="overflow-y-auto p-6 md:p-8 bg-slate-100 flex justify-center">
          <div
            ref={printRef}
            id="printable-receipt"
            className="bg-white w-full max-w-2xl border border-slate-300 p-8 shadow-sm font-sans text-slate-900"
          >
            {/* Kop Surat Pemerintah Kabupaten Mimika */}
            <div className="border-b-[3px] border-double border-slate-900 pb-3 text-center relative">
              <div className="flex items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-300 flex flex-col items-center justify-center p-1 shrink-0 text-center">
                  <span className="text-[9px] font-bold text-slate-700 leading-tight">
                    PEMKAB
                  </span>
                  <span className="text-[10px] font-extrabold text-[#0B241E]">
                    MIMIKA
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="text-xs font-bold tracking-widest text-slate-600 uppercase">
                    Pemerintah Kabupaten Mimika
                  </h3>
                  <h1 className="text-base font-extrabold tracking-tight text-[#0B241E] uppercase">
                    Dinas Perhubungan
                  </h1>
                  <h2 className="text-xs font-bold text-[#D97706] uppercase tracking-wide">
                    UPTD Pengelolaan Pelabuhan Poumako
                  </h2>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Jl. Poros Pelabuhan Poumako, Distrik Mimika Timur, Mimika, Papua Tengah 99910
                  </p>
                  <p className="text-[9px] text-slate-500">
                    Laman Resmi: porta.mimikakab.go.id • Pos-el: dishub@mimikakab.go.id
                  </p>
                </div>
                <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-300 flex flex-col items-center justify-center p-1 shrink-0 text-center">
                  <span className="text-[8px] font-bold text-slate-700 leading-tight">
                    PORTA
                  </span>
                  <span className="text-[9px] font-extrabold text-emerald-800">
                    RESMI
                  </span>
                </div>
              </div>
            </div>

            {/* Document Header & Nomor Surat */}
            <div className="mt-4 text-center">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold tracking-wide uppercase border border-emerald-300 mb-1">
                Lunas (Sah) — Bukti Penerimaan Daerah
              </span>
              <h2 className="text-sm font-extrabold uppercase text-[#0B241E] tracking-tight">
                Surat Setoran Retribusi Daerah (e-SSRD)
              </h2>
              <p className="text-[10px] text-slate-500">
                Nomor Register Kasda:{" "}
                <span className="font-mono font-bold text-slate-800">
                  {ssrdNumber}
                </span>
              </p>
              <p className="text-[9px] text-slate-400 italic">
                Berdasarkan UU No. 1/2022 (HKPD), Perda Kab. Mimika No. 4/2023 & Perbup No. 25/2024
              </p>
            </div>

            {/* Information Grid: Wajib Retribusi & Obyek Retribusi */}
            <div className="mt-5 grid grid-cols-2 gap-4 text-[11px] bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
              <div className="space-y-1.5 border-r border-slate-200 pr-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Wajib Retribusi (Penyetor)
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">Nama Perusahaan/Tenant:</div>
                  <div className="font-bold text-slate-900">{taxPayerName}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">Nomor Pokok Wajib Pajak (NPWP):</div>
                  <div className="font-mono font-semibold text-slate-800">
                    {taxPayerNpwp || "-"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">Pelabuhan Layanan:</div>
                  <div className="font-semibold text-slate-800">{portName}</div>
                </div>
              </div>

              <div className="space-y-1.5 pl-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Rincian Obyek Retribusi
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">
                    {isLease ? "No. Kontrak PKS Sewa:" : "No. Meteran / Catatan:"}
                  </div>
                  <div className="font-mono font-bold text-slate-900">
                    {referenceNumber}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">Nama Objek Fasilitas:</div>
                  <div className="font-semibold text-slate-800">
                    {isLease
                      ? `${leaseData!.retributionObject.assetName} (${leaseData!.retributionObject.assetCode})`
                      : `${utilityData!.retributionObject.assetName} [${utilityData!.retributionObject.utilityType}]`}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">Kode Rekening Pendapatan Daerah:</div>
                  <div className="font-mono text-[10px] text-slate-700">
                    {isLease
                      ? leaseData!.retributionObject.revenueAccountCode
                      : utilityData!.retributionObject.revenueAccountCode}
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="mt-4">
              <table className="w-full text-left text-[11px] border border-slate-300 border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300 w-8 text-center">No</th>
                    <th className="p-2 border-r border-slate-300">Uraian Retribusi Daerah</th>
                    <th className="p-2 border-r border-slate-300 text-center">
                      {isLease ? "Periode" : "Pemakaian"}
                    </th>
                    <th className="p-2 border-r border-slate-300 text-right">
                      Tarif Satuan
                    </th>
                    <th className="p-2 text-right">Jumlah Setor (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {isLease ? (
                    <tr>
                      <td className="p-2 border-r border-slate-300 text-center">1</td>
                      <td className="p-2 border-r border-slate-300">
                        <div className="font-semibold text-slate-900">
                          Sewa Lahan/Bangunan ({leaseData!.retributionObject.assetType})
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Luas Aset: {leaseData!.retributionObject.areaSqm} m² • {leaseData!.retributionObject.legalBasis}
                        </div>
                      </td>
                      <td className="p-2 border-r border-slate-300 text-center font-mono">
                        Th. {leaseData!.paymentDetails.periodYear}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-right font-mono">
                        Rp {leaseData!.retributionObject.annualRatePerSqmIdr.toLocaleString("id-ID")}/m²
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-900">
                        Rp {totalAmount.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td className="p-2 border-r border-slate-300 text-center">1</td>
                      <td className="p-2 border-r border-slate-300">
                        <div className="font-semibold text-slate-900">
                          Retribusi Utilitas Pelabuhan ({utilityData!.retributionObject.utilityType})
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Meter Awal: {utilityData!.retributionObject.meterStart} s/d Meter Akhir: {utilityData!.retributionObject.meterEnd}
                        </div>
                      </td>
                      <td className="p-2 border-r border-slate-300 text-center font-mono">
                        {utilityData!.retributionObject.volumeConsumed} {utilityData!.retributionObject.unitLabel}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-right font-mono">
                        Rp {utilityData!.retributionObject.ratePerUnitIdr.toLocaleString("id-ID")}
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-900">
                        Rp {totalAmount.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="border-t-2 border-slate-400 bg-slate-50 font-bold">
                  <tr>
                    <td colSpan={4} className="p-2 text-right border-r border-slate-300">
                      Total Setoran Diterima di Kas Daerah:
                    </td>
                    <td className="p-2 text-right font-mono text-emerald-800 text-xs">
                      Rp {totalAmount.toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Terbilang Box */}
              <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px]">
                <span className="font-bold text-slate-600">Terbilang: </span>
                <span className="italic font-semibold text-slate-800">
                  # {terbilangText} #
                </span>
              </div>
            </div>

            {/* Validation & Signatures Footer */}
            <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 items-end">
              {/* Left Column: QR Code Verification */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-300 shrink-0 text-center">
                  <QrCode className="w-14 h-14 text-slate-800 mx-auto" />
                  <span className="text-[8px] font-mono font-bold text-slate-600 block mt-0.5">
                    VERIFIED
                  </span>
                </div>
                <div className="text-[9px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-emerald-700 text-[10px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Otentikasi Digital PORTA
                  </div>
                  <p>
                    Kuitansi e-SSRD ini sah dan diterbitkan otomatis oleh Sistem Pengelolaan Pelabuhan & Penerimaan Daerah Terintegrasi (PORTA) Kabupaten Mimika.
                  </p>
                  <p className="font-mono text-[8px] text-slate-400">
                    ID Transaksi: {isLease ? leaseData!.paymentDetails.idempotencyKey : utilityData!.paymentDetails.idempotencyKey}
                  </p>
                </div>
              </div>

              {/* Right Column: Pejabat / Pengesahan Bendahara */}
              <div className="text-right text-[10px] space-y-1">
                <div>Poumako, {formattedDate}</div>
                <div className="font-semibold text-slate-700">
                  UPTD Pengelolaan Pelabuhan Poumako
                </div>
                <div className="text-[9px] text-slate-500">
                  Bendahara Penerimaan Pembantu
                </div>
                <div className="h-12 flex items-center justify-end">
                  <div className="border border-emerald-600 bg-emerald-50 px-3 py-1 rounded text-[9px] font-extrabold text-emerald-800 uppercase tracking-widest inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    TERVERIFIKASI SAH
                  </div>
                </div>
                <div className="font-bold text-slate-900 underline">
                  {isLease
                    ? leaseData!.paymentDetails.verifiedByName
                    : utilityData!.paymentDetails.recordedByName}
                </div>
                <div className="text-[8px] text-slate-400">
                  NIP. 19820412 200801 1 015
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Print Media Stylesheet */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt,
          #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: fixed;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20mm !important;
            border: none !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
