"use client";

import React, { useState } from "react";
import {
  Ticket,
  QrCode,
  CheckCircle2,
  CreditCard,
  Building2,
  Ship,
  Car,
  User,
  Bike,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Download,
  Share2,
  Copy,
  Printer,
  ChevronRight,
  ArrowLeft,
  DollarSign,
  Receipt,
  FileCheck2,
} from "lucide-react";

interface ServiceType {
  id: string;
  name: string;
  category: "pax" | "motor" | "car" | "truck";
  icon: any;
  baseFare: number; // Operator kapal
  retribusiPemda: number; // Retribusi Pemda PP 35/2023
  insurance: number; // Jasa Raharja
  description: string;
}

export default function PenumpangTiketPage() {
  // Booking Steps: 1: Service Selection, 2: Identity, 3: Payment (QRIS/VA), 4: E-Ticket Issued
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Selections
  const [selectedServiceId, setSelectedServiceId] = useState<string>("gol4a");
  const [quantity, setQuantity] = useState<number>(1);
  const [route, setRoute] = useState<string>("Merak ➔ Bakauheni");
  const [departureDate, setDepartureDate] = useState<string>("2026-11-16");
  const [departureTime, setDepartureTime] = useState<string>("14:00 WIB");
  const [dockService, setDockService] = useState<"Eksekutif" | "Reguler">("Reguler");

  // User Details
  const [leadName, setLeadName] = useState<string>("Rian Pratama");
  const [nik, setNik] = useState<string>("3201140908870003");
  const [phone, setPhone] = useState<string>("081289123456");
  const [plateNumber, setPlateNumber] = useState<string>("B 1892 KRA");

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "va_bca" | "va_mandiri" | "va_bri">("qris");
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Service Catalog
  const serviceOptions: ServiceType[] = [
    {
      id: "pax_adult",
      name: "Pejalan Kaki (Dewasa)",
      category: "pax",
      icon: User,
      baseFare: 35000,
      retribusiPemda: 10000,
      insurance: 2500,
      description: "Pas masuk terminal dan tiket penyeberangan orang",
    },
    {
      id: "gol2",
      name: "Golongan II (Sepeda Motor < 500cc)",
      category: "motor",
      icon: Bike,
      baseFare: 45000,
      retribusiPemda: 15000,
      insurance: 5000,
      description: "Termasuk pengendara & 1 pembonceng serta pas pelabuhan",
    },
    {
      id: "gol4a",
      name: "Golongan IV A (Mobil Pribadi / Minibus)",
      category: "car",
      icon: Car,
      baseFare: 380000,
      retribusiPemda: 45000,
      insurance: 15000,
      description: "Panjang $\\le$ 5 meter beserta seluruh penumpang di dalamnya",
    },
    {
      id: "gol5a",
      name: "Golongan V A (Bus Sedang / Elf)",
      category: "truck",
      icon: Truck,
      baseFare: 750000,
      retribusiPemda: 80000,
      insurance: 25000,
      description: "Panjang 5-7 meter kapasitas penumpang sedang",
    },
    {
      id: "gol5b",
      name: "Golongan V B (Truk Muatan Sedang)",
      category: "truck",
      icon: Truck,
      baseFare: 680000,
      retribusiPemda: 75000,
      insurance: 20000,
      description: "Panjang 5-7 meter muatan barang logistik",
    },
  ];

  const currentService =
    serviceOptions.find((s) => s.id === selectedServiceId) || serviceOptions[2];

  // Price calculations
  const totalBaseFare = currentService.baseFare * quantity;
  const totalRetribusi = currentService.retribusiPemda * quantity;
  const totalInsurance = currentService.insurance * quantity;
  const grandTotal = totalBaseFare + totalRetribusi + totalInsurance;

  const bookingCode = "PORTA-PAS-2026-99214";

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSimulatePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setCurrentStep(4);
    }, 1200);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(bookingCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. STEPPER NAVIGATION BAR */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-[#64748B]">
          {/* Step 1 */}
          <div
            className={`flex items-center gap-2 cursor-pointer ${
              currentStep >= 1 ? "text-[#0284C7]" : "text-[#94A3B8]"
            }`}
            onClick={() => currentStep > 1 && setCurrentStep(1)}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStep >= 1
                  ? "bg-[#0284C7] text-white"
                  : "bg-[#F1F5F9] text-[#64748B]"
              }`}
            >
              1
            </div>
            <span className="hidden sm:inline">Pilih Layanan</span>
          </div>

          <div className="flex-1 h-0.5 mx-2 bg-[#E2E8F0]" />

          {/* Step 2 */}
          <div
            className={`flex items-center gap-2 cursor-pointer ${
              currentStep >= 2 ? "text-[#0284C7]" : "text-[#94A3B8]"
            }`}
            onClick={() => currentStep > 2 && setCurrentStep(2)}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStep >= 2
                  ? "bg-[#0284C7] text-white"
                  : "bg-[#F1F5F9] text-[#64748B]"
              }`}
            >
              2
            </div>
            <span className="hidden sm:inline">Data Pemesan</span>
          </div>

          <div className="flex-1 h-0.5 mx-2 bg-[#E2E8F0]" />

          {/* Step 3 */}
          <div
            className={`flex items-center gap-2 cursor-pointer ${
              currentStep >= 3 ? "text-[#0284C7]" : "text-[#94A3B8]"
            }`}
            onClick={() => currentStep === 4 && setCurrentStep(3)}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStep >= 3
                  ? "bg-[#0284C7] text-white"
                  : "bg-[#F1F5F9] text-[#64748B]"
              }`}
            >
              3
            </div>
            <span className="hidden sm:inline">Pembayaran & Split</span>
          </div>

          <div className="flex-1 h-0.5 mx-2 bg-[#E2E8F0]" />

          {/* Step 4 */}
          <div
            className={`flex items-center gap-2 ${
              currentStep === 4 ? "text-emerald-700" : "text-[#94A3B8]"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStep === 4
                  ? "bg-emerald-600 text-white"
                  : "bg-[#F1F5F9] text-[#64748B]"
              }`}
            >
              4
            </div>
            <span className="hidden sm:inline">E-Ticket QR</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* STEP 1: SERVICE & VEHICLE CLASS SELECTION                     */}
      {/* ============================================================== */}
      {currentStep === 1 && (
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#F1F5F9] pb-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0284C7]">
              Langkah 1 dari 4
            </span>
            <h2 className="text-xl font-black text-[#0A2540] mt-0.5">
              Pilih Layanan & Golongan Pas Masuk Pelabuhan
            </h2>
            <p className="text-xs text-[#64748B] mt-1">
              Pilih jenis pengguna jasa (orang atau kendaraan) sesuai ketentuan PP No. 35/2023.
            </p>
          </div>

          {/* Lintasan & Layanan Dermaga */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1">
                Lintasan Penyeberangan
              </label>
              <select
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7]"
              >
                <option value="Merak ➔ Bakauheni">Merak ➔ Bakauheni (Selat Sunda)</option>
                <option value="Bakauheni ➔ Merak">Bakauheni ➔ Merak</option>
                <option value="Ketapang ➔ Gilimanuk">Ketapang ➔ Gilimanuk</option>
                <option value="Gilimanuk ➔ Ketapang">Gilimanuk ➔ Ketapang</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1">
                Tanggal Keberangkatan
              </label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7]"
              >
              </input>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1">
                Kelas Dermaga
              </label>
              <select
                value={dockService}
                onChange={(e) => setDockService(e.target.value as any)}
                className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7]"
              >
                <option value="Reguler">Layanan Reguler</option>
                <option value="Eksekutif">Layanan Eksekutif (Dermaga Cepat)</option>
              </select>
            </div>
          </div>

          {/* Cards of Service / Golongan */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-[#475569]">
              Pilih Golongan Tarif Retribusi & Tiket:
            </label>
            <div className="grid grid-cols-1 gap-3">
              {serviceOptions.map((srv) => {
                const isSelected = selectedServiceId === srv.id;
                const Icon = srv.icon;
                const totalItem = srv.baseFare + srv.retribusiPemda + srv.insurance;

                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedServiceId(srv.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected
                        ? "bg-[#F0F9FF] border-[#0284C7] shadow-xs"
                        : "bg-white border-[#E2E8F0] hover:border-[#CBD5E1]"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                          isSelected
                            ? "bg-[#0284C7] text-white"
                            : "bg-[#F1F5F9] text-[#64748B]"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-xs text-[#0A2540]">
                            {srv.name}
                          </h4>
                          {isSelected && (
                            <span className="text-[10px] font-mono font-bold bg-[#0284C7] text-white px-1.5 py-0.2 rounded">
                              Terpilih
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-0.5">
                          {srv.description}
                        </p>
                        <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                          Retribusi Pemda: {formatRupiah(srv.retribusiPemda)} • Jasa Tiket: {formatRupiah(srv.baseFare)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-extrabold text-[#0A2540] font-mono">
                        {formatRupiah(totalItem)}
                      </p>
                      <p className="text-[10px] text-[#94A3B8]">/ Unit / Perjalanan</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Action */}
          <div className="pt-4 flex items-center justify-between border-t border-[#F1F5F9]">
            <span className="text-xs text-[#64748B]">
              Total Estimasi: <strong className="text-[#0A2540]">{formatRupiah(grandTotal)}</strong>
            </span>
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] hover:from-[#0369A1] hover:to-[#0891B2] text-white text-xs font-extrabold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Lanjut ke Data Identitas</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 2: PASSENGER & VEHICLE DETAILS                          */}
      {/* ============================================================== */}
      {currentStep === 2 && (
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#F1F5F9] pb-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0284C7]">
              Langkah 2 dari 4
            </span>
            <h2 className="text-xl font-black text-[#0A2540] mt-0.5">
              Data Identitas Pemesan & Kendaraan
            </h2>
            <p className="text-xs text-[#64748B] mt-1">
              Data manifes resmi sesuai regulasi SOLAS dan asuransi kecelakaan kapal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1">
                Nama Lengkap Pemesan (Sesuai KTP)
              </label>
              <input
                type="text"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1">
                Nomor Induk Kependudukan (NIK)
              </label>
              <input
                type="text"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1">
                Nomor WhatsApp / HP Aktif (Untuk Kirim E-Ticket)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            {currentService.category !== "pax" && (
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">
                  Nomor Polisi Kendaraan (Plat Nomor)
                </label>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  placeholder="Contoh: B 1234 ABC"
                  className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7] uppercase font-mono"
                />
              </div>
            )}
          </div>

          {/* Manifes Privacy Protection Notice */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3 text-xs text-blue-900">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Data pribadi Anda dilindungi sesuai UU Perlindungan Data Pribadi (PDP) dan hanya digunakan untuk kepentingan manifes keselamatan pelayaran syahbandar serta penerbitan kupon retribusi daerah resmi.
            </p>
          </div>

          {/* Action Row */}
          <div className="pt-4 flex items-center justify-between border-t border-[#F1F5F9]">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0A2540] flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>

            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] hover:from-[#0369A1] hover:to-[#0891B2] text-white text-xs font-extrabold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Lanjut ke Penagihan & Pembayaran</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 3: INTEGRATED BILLING & DIGITAL PAYMENT (QRIS / VA)      */}
      {/* ============================================================== */}
      {currentStep === 3 && (
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#F1F5F9] pb-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0284C7]">
              Langkah 3 dari 4
            </span>
            <h2 className="text-xl font-black text-[#0A2540] mt-0.5">
              Penagihan Terintegrasi & Konfirmasi Pembayaran
            </h2>
            <p className="text-xs text-[#64748B] mt-1">
              Rincian split otomatis antara hak penerimaan daerah (Pemda) dan operator kapal sesuai PP No. 35/2023.
            </p>
          </div>

          {/* Breakdown Table (PP 35/2023 Split) */}
          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#0A2540] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#0284C7]" />
                <span>Rincian Komponen Tagihan Resmi</span>
              </span>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                PP 35/2023 Compliant
              </span>
            </div>

            <div className="space-y-2 text-xs border-t border-[#E2E8F0] pt-2">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Layanan Terpilih:</span>
                <strong className="text-[#0A2540]">{currentService.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Jasa Tiket Angkutan Kapal (Operator):</span>
                <span className="font-mono text-[#0A2540]">{formatRupiah(totalBaseFare)}</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-semibold bg-emerald-50/60 p-1.5 rounded">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Hak Retribusi Pas Pelabuhan Pemda (Kas Daerah):</span>
                </span>
                <span className="font-mono font-bold">{formatRupiah(totalRetribusi)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Iuran Wajib Dana Kecelakaan (Jasa Raharja):</span>
                <span className="font-mono text-[#0A2540]">{formatRupiah(totalInsurance)}</span>
              </div>
              <div className="flex justify-between border-t-2 border-[#CBD5E1] pt-2 text-sm font-extrabold text-[#0A2540]">
                <span>TOTAL PEMBAYARAN:</span>
                <span className="font-mono text-base text-[#0284C7]">{formatRupiah(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector & Dynamic QRIS Box */}
          <div className="space-y-4">
            <label className="block text-xs font-bold text-[#475569]">
              Pilih Saluran Pembayaran Elektronik:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod("qris")}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                  paymentMethod === "qris"
                    ? "bg-[#F0F9FF] border-[#0284C7] text-[#0284C7] shadow-xs"
                    : "bg-white border-[#CBD5E1] text-[#64748B]"
                }`}
              >
                QRIS Dinamis
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("va_bca")}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                  paymentMethod === "va_bca"
                    ? "bg-[#F0F9FF] border-[#0284C7] text-[#0284C7] shadow-xs"
                    : "bg-white border-[#CBD5E1] text-[#64748B]"
                }`}
              >
                BCA Virtual Account
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("va_mandiri")}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                  paymentMethod === "va_mandiri"
                    ? "bg-[#F0F9FF] border-[#0284C7] text-[#0284C7] shadow-xs"
                    : "bg-white border-[#CBD5E1] text-[#64748B]"
                }`}
              >
                Mandiri VA
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("va_bri")}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                  paymentMethod === "va_bri"
                    ? "bg-[#F0F9FF] border-[#0284C7] text-[#0284C7] shadow-xs"
                    : "bg-white border-[#CBD5E1] text-[#64748B]"
                }`}
              >
                BRI VA / Briva
              </button>
            </div>

            {/* QRIS / VA Display Box */}
            <div className="p-6 bg-[#FAFCFF] border-2 border-dashed border-[#0284C7]/40 rounded-2xl flex flex-col items-center text-center space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <Clock className="w-3.5 h-3.5" />
                <span>Batas Waktu Pembayaran: 14:55 Menit</span>
              </div>

              {paymentMethod === "qris" ? (
                <div className="p-4 bg-white rounded-xl shadow-md border border-[#E2E8F0] flex flex-col items-center">
                  <div className="w-44 h-44 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                    <QrCode className="w-36 h-36" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#0A2540] mt-2">
                    NMID: ID1020268892401
                  </span>
                  <span className="text-[10px] text-[#64748B]">
                    Scan dengan BCA, GoPay, OVO, Dana, ShopeePay
                  </span>
                </div>
              ) : (
                <div className="p-5 bg-white rounded-xl shadow-sm border border-[#E2E8F0] space-y-2 max-w-sm w-full">
                  <p className="text-xs text-[#64748B]">Nomor Virtual Account:</p>
                  <p className="font-mono text-lg font-black text-[#0A2540] tracking-wider">
                    8809 1200 4829 119
                  </p>
                  <button
                    onClick={handleCopyCode}
                    className="text-xs text-[#0284C7] font-bold hover:underline"
                  >
                    {isCopied ? "Berhasil Disalin!" : "Salin Nomor VA"}
                  </button>
                </div>
              )}

              <p className="text-xs text-[#64748B] max-w-md">
                Setelah pembayaran lunas, kode booking E-Ticket dan QR validasi gerbang otomatis diterbitkan.
              </p>

              <button
                onClick={handleSimulatePayment}
                disabled={isProcessingPayment}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memverifikasi Pembayaran Bank...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simulasikan Pembayaran Berhasil (Konfirmasi Bank)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[#F1F5F9]">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0A2540] flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 4: ISSUED E-TICKET QR CODE (Alur Transaksi Selesai)       */}
      {/* ============================================================== */}
      {currentStep === 4 && (
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-8 shadow-lg space-y-6">
          <div className="text-center space-y-2 border-b border-[#F1F5F9] pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>PEMBAYARAN LUNAS • TIKET AKTIF SIAP SCAN</span>
            </div>
            <h2 className="text-2xl font-black text-[#0A2540]">
              E-Ticket & Pas Pelabuhan Digital
            </h2>
            <p className="text-xs text-[#64748B]">
              Tunjukkan QR Code ini pada scanner gerbang (*gate barrier*) pelabuhan.
            </p>
          </div>

          {/* OFFICIAL BOARDING PASS TICKET CARD */}
          <div className="border-2 border-[#0284C7]/30 rounded-2xl overflow-hidden bg-gradient-to-b from-[#FAFCFF] to-white shadow-md">
            {/* Ticket Header Bar */}
            <div className="bg-gradient-to-r from-[#0A2540] via-[#0F3A5D] to-[#0D9488] text-white p-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Ship className="w-5 h-5 text-[#38BDF8]" />
                <div>
                  <span className="font-extrabold text-sm tracking-wide">
                    PORTA BOARDING PASS
                  </span>
                  <span className="block text-[9px] font-mono text-[#67E8F9]">
                    KUPON RETRIBUSI DAERAH TERINTEGRASI
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono bg-white/20 text-white font-bold px-2 py-0.5 rounded">
                  {bookingCode}
                </span>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Flight / Ship Details */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#94A3B8]">
                    Lintasan Penyeberangan
                  </span>
                  <h3 className="text-lg font-black text-[#0A2540]">{route}</h3>
                  <p className="text-xs text-[#0284C7] font-semibold">
                    KMP Portlink III • {dockService === "Eksekutif" ? "Dermaga Eksekutif 1" : "Dermaga Reguler 2"}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <div>
                    <span className="text-[9px] uppercase text-[#94A3B8] font-bold block">
                      Nama Penumpang
                    </span>
                    <strong className="text-[#0A2540]">{leadName}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-[#94A3B8] font-bold block">
                      Golongan
                    </span>
                    <strong className="text-[#0A2540]">{currentService.name.split("(")[0]}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-[#94A3B8] font-bold block">
                      No. Polisi
                    </span>
                    <strong className="text-[#0A2540] font-mono">{plateNumber}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-[#94A3B8] font-bold block">
                      Jadwal Berangkat
                    </span>
                    <strong className="text-[#0284C7] font-mono">{departureTime}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-[#94A3B8] font-bold block">
                      Tanggal
                    </span>
                    <strong className="text-[#0A2540] font-mono">{departureDate}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-[#94A3B8] font-bold block">
                      Retribusi Pemda
                    </span>
                    <strong className="text-emerald-700 font-mono font-bold">
                      {formatRupiah(totalRetribusi)}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Valid untuk 1 kali scan masuk di gate tollgate UPTD Pelabuhan Merak.
                  </span>
                </div>
              </div>

              {/* QR Code Validation Box */}
              <div className="flex flex-col items-center justify-center p-4 bg-white border border-[#CBD5E1] rounded-2xl shadow-xs text-center space-y-2">
                <div className="w-40 h-40 bg-slate-950 rounded-xl flex items-center justify-center text-white p-2">
                  <QrCode className="w-32 h-32" />
                </div>
                <span className="font-mono text-xs font-bold text-[#0A2540]">
                  {bookingCode}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Status: Siap Boarding
                </span>
              </div>
            </div>

            {/* Ticket Footer Bar */}
            <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] p-3 px-6 text-center text-[10px] text-[#64748B]">
              Karcis ini memuat hak penerimaan retribusi daerah Pemda sesuai PP No. 35/2023 Pasal 88 dan Pasal 92.
            </div>
          </div>

          {/* Ticket Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-white hover:bg-[#F8FAFC] text-[#0A2540] border border-[#CBD5E1] rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#0284C7]" />
              <span>Cetak Tiket / PDF</span>
            </button>
            <button
              onClick={() => alert(`Tiket dan QR Code telah dikirim ke nomor WhatsApp: ${phone}`)}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Kirim ke WhatsApp</span>
            </button>
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2.5 bg-[#0A2540] hover:bg-[#1E3A8A] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Ticket className="w-4 h-4 text-[#38BDF8]" />
              <span>Pesan Tiket Lainnya</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
