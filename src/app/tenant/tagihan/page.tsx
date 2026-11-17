"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Receipt,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  Download,
  Printer,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  Lock,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";

export default function TenantTagihanPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<string>("SKRD-AST/2026/0482");

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-[#0B241E]">
                Surat Ketetapan Retribusi Daerah (e-SKRD) & Bukti Setor
              </h2>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Lampiran I & III Perbup Mimika 25/2024
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Tagihan resmi pemanfaatan tempat usaha kios pelabuhan, pembayaran via Bank Kasda, dan arsip SSRD sah.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 bg-[#0B241E] hover:bg-[#143E33] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Printer className="w-4 h-4 text-[#D97706]" />
          <span>Cetak Salinan SKRD & SSRD</span>
        </button>
      </div>

      {/* Invoice Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Invoice List (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold text-[#0B241E] uppercase tracking-wider pb-2 border-b border-[#F1F5F9]">
            Daftar Dokumen Ketetapan Retribusi
          </h3>

          <div className="space-y-2">
            {[
              {
                id: "SKRD-AST/2026/0482",
                period: "November 2026",
                title: "Sewa Kios A-04 + Utilitas Listrik & Air",
                amount: 2112000,
                status: "LUNAS",
                dueDate: "30 Nov 2026",
              },
              {
                id: "SKRD-AST/2026/0431",
                period: "Oktober 2026",
                title: "Sewa Kios A-04 + Utilitas Listrik & Air",
                amount: 2095000,
                status: "LUNAS",
                dueDate: "31 Okt 2026",
              },
              {
                id: "SKRD-AST/2026/0388",
                period: "September 2026",
                title: "Sewa Kios A-04 + Utilitas Listrik & Air",
                amount: 2105000,
                status: "LUNAS",
                dueDate: "30 Sep 2026",
              },
            ].map((inv) => (
              <div
                key={inv.id}
                onClick={() => setSelectedInvoice(inv.id)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedInvoice === inv.id
                    ? "bg-emerald-50/70 border-emerald-300 shadow-xs"
                    : "bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#F1F5F9]"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-[#0B241E] text-[11px]">{inv.id}</span>
                    <p className="font-bold text-[#0B241E] mt-0.5">{inv.period}</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {inv.status}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-black/5 text-[11px]">
                  <span className="text-[#64748B]">Total SKRD:</span>
                  <strong className="font-mono text-emerald-800">{formatRupiah(inv.amount)}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Official SKRD & SSRD Document Simulator (7 cols) */}
        <div className="lg:col-span-7 bg-[#FAFAFA] border border-[#CBD5E1] rounded-2xl p-6 shadow-sm font-sans text-xs text-[#0B241E] space-y-4">
          {/* Document Header */}
          <div className="text-center pb-3 border-b-2 border-[#0B241E]">
            <p className="text-[10px] uppercase font-bold text-[#475569] tracking-wider">
              PEMERINTAH KABUPATEN MIMIKA • BADAN PENDAPATAN DAERAH
            </p>
            <h4 className="text-sm font-extrabold uppercase mt-0.5">
              SURAT KETETAPAN RETRIBUSI DAERAH (SKRD)
            </h4>
            <p className="text-[10px] font-mono text-[#64748B] mt-0.5">
              Nomor Kohir SKRD: {selectedInvoice}
            </p>
          </div>

          {/* Legal Basis */}
          <div className="text-[10px] text-[#64748B] italic leading-tight">
            Berdasarkan Peraturan Pemerintah Nomor 35 Tahun 2023 dan Peraturan Daerah Kabupaten Mimika Nomor 4 Tahun 2023 juncto Perbup Mimika Nomor 25 Tahun 2024 tentang Tata Cara Pemungutan Retribusi Daerah.
          </div>

          {/* Taxpayer Info */}
          <div className="p-3 bg-white border border-[#E2E8F0] rounded-xl space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Wajib Retribusi:</span>
              <strong className="text-[#0B241E]">Ny. Martha Kogoya (Kios Cendrawasih Souvenir)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">NPWPD:</span>
              <span className="font-mono text-[#0B241E]">03.182.901.4-951.000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Objek Retribusi:</span>
              <span>Kios Komersial Blok A-04 (Lantai 1 Terminal)</span>
            </div>
          </div>

          {/* Items breakdown */}
          <table className="w-full text-left border-collapse border border-[#CBD5E1] text-[11px]">
            <thead>
              <tr className="bg-[#F1F5F9] border-b border-[#CBD5E1] font-bold">
                <th className="p-2">Uraian Retribusi Daerah</th>
                <th className="p-2 text-right">Jumlah (Rp)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#CBD5E1]">
                <td className="p-2">1. Pokok Sewa Tempat Usaha Kios (12 m² @ Rp 125.000/bln)</td>
                <td className="p-2 text-right font-mono">1.500.000</td>
              </tr>
              <tr className="border-b border-[#CBD5E1]">
                <td className="p-2">2. Konsumsi Listrik Penerangan (340 kWh @ Rp 1.444)</td>
                <td className="p-2 text-right font-mono">491.000</td>
              </tr>
              <tr className="border-b border-[#CBD5E1]">
                <td className="p-2">3. Retribusi Air Bersih (14 m³ @ Rp 8.500)</td>
                <td className="p-2 text-right font-mono">119.000</td>
              </tr>
              <tr className="border-b border-[#CBD5E1]">
                <td className="p-2">4. Retribusi Kebersihan & Sampah Pelabuhan</td>
                <td className="p-2 text-right font-mono">2.000</td>
              </tr>
              <tr className="bg-emerald-50 font-bold">
                <td className="p-2">TOTAL KETETAPAN SKRD</td>
                <td className="p-2 text-right font-mono text-emerald-800 text-sm">2.112.000</td>
              </tr>
            </tbody>
          </table>

          {/* SSRD Validation Stempel */}
          <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
              <div>
                <p className="font-extrabold text-emerald-950">STATUS: SUDAH DISETOR LUNAS (SSRD)</p>
                <p className="text-[10px] text-emerald-800 font-mono">
                  NTPD: 20261116-004812-BAP • Disetor via Bank Papua RKUD Mimika
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-white text-emerald-900 border border-emerald-300 px-2 py-1 rounded">
              LUNAS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
