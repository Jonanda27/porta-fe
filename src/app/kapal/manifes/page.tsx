"use client";

import React, { useState } from "react";
import {
  FileCheck2,
  Ship,
  Users,
  Car,
  Truck,
  Bike,
  ShieldCheck,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Lock,
  Download,
  Send,
  FileText,
  Clock,
  X,
  RefreshCw,
} from "lucide-react";

export default function KapalManifesPage() {
  const [selectedVessel, setSelectedVessel] = useState<string>("KMP Mutiara Persada (Dermaga 2 - 14:00 WIB)");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Passenger Form Fields
  const [paxAdult, setPaxAdult] = useState<number>(312);
  const [paxChild, setPaxChild] = useState<number>(45);
  const [paxInfant, setPaxInfant] = useState<number>(8);
  const [crewCount, setCrewCount] = useState<number>(18);

  // Vehicle Form Fields
  const [vehGol1, setVehGol1] = useState<number>(4);
  const [vehGol2, setVehGol2] = useState<number>(28);
  const [vehGol3, setVehGol3] = useState<number>(2);
  const [vehGol4A, setVehGol4A] = useState<number>(24);
  const [vehGol4B, setVehGol4B] = useState<number>(6);
  const [vehGol5, setVehGol5] = useState<number>(8);
  const [vehGol6_7, setVehGol6_7] = useState<number>(4);

  // Uploaded PDF State
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: string;
    hash: string;
  } | null>({
    name: "MANIFES_RESMI_KMP_MUTIARA_16NOV2026.pdf",
    size: "1.8 MB",
    hash: "SHA256: 7f8c4...e1920",
  });

  const [isCaptainDeclared, setIsCaptainDeclared] = useState<boolean>(true);
  const [captainName, setCaptainName] = useState<string>("Capt. Aris Munandar (NIP: 19820411 200802 1 003)");

  // Calculations
  const totalPax = paxAdult + paxChild + paxInfant + crewCount;
  const maxPaxCapacity = 500;
  const paxUtilization = ((totalPax / maxPaxCapacity) * 100).toFixed(1);

  const totalVehicles = vehGol1 + vehGol2 + vehGol3 + vehGol4A + vehGol4B + vehGol5 + vehGol6_7;
  const maxVehicleCapacity = 80;
  const vehicleUtilization = ((totalVehicles / maxVehicleCapacity) * 100).toFixed(1);

  // UPT Ticket Gate Cross-check data (simulated real-time)
  const uptScannedTickets = {
    passengers: 365,
    vehicles: 72,
  };

  const isOverloaded = totalPax > maxPaxCapacity || totalVehicles > maxVehicleCapacity;

  const handleSubmitManifest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCaptainDeclared) {
      alert("Pernyataan kelaiklautan dan keselamatan nakhoda wajib dicentang sebelum mengirim manifes!");
      return;
    }
    setSuccessToast("Laporan Manifes resmi SOLAS berhasil diserahkan ke Petugas UPT dan Syahbandar. Status: Menunggu Clearance SPB.");
    setTimeout(() => setSuccessToast(null), 5000);
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {successToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-fade-in border border-emerald-500">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-white hover:text-emerald-100 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. SELECTOR KAPAL & JADWAL KEBERANGKATAN */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold">
            <Ship className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#0B241E]">
              Pilih Armada Pelayaran untuk Pelaporan Manifes
            </h2>
            <p className="text-xs text-[#64748B]">
              Laporan wajib diserahkan maksimal 30 menit sebelum kapal bertolak
            </p>
          </div>
        </div>

        <div className="w-full md:w-80">
          <select
            value={selectedVessel}
            onChange={(e) => setSelectedVessel(e.target.value)}
            className="w-full text-xs font-bold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
          >
            <option value="KMP Mutiara Persada (Dermaga 2 - 14:00 WIB)">
              KMP Mutiara Persada (Dermaga 2 - 14:00 WIB)
            </option>
            <option value="KMP Baruna Jaya (Dermaga 1 - 08:00 WIB)">
              KMP Baruna Jaya (Dermaga 1 - Selesai Sandar)
            </option>
            <option value="KMP Nusantara Express (Dermaga Eksekutif 1 - 18:30 WIB)">
              KMP Nusantara Express (Eksekutif 1 - 18:30 WIB)
            </option>
          </select>
        </div>
      </div>

      {/* 2. SOLAS SAFETY CAPACITY & CROSS-CHECK WITH UPT TICKETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Penumpang Utilization */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#0B241E] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0284C7]" />
              <span>Kapasitas Keselamatan Penumpang (SOLAS)</span>
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {paxUtilization}% Terisi
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-black font-mono text-[#0B241E]">
              {totalPax} <span className="text-xs font-normal text-[#64748B]">/ {maxPaxCapacity} Orang</span>
            </p>
            <p className="text-xs text-[#64748B]">
              Tiket Gate UPT: <strong className="text-[#0B241E]">{uptScannedTickets.passengers} Orang</strong>
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                Number(paxUtilization) > 95 ? "bg-amber-500" : "bg-emerald-600"
              }`}
              style={{ width: `${Math.min(Number(paxUtilization), 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kapasitas penumpang memenuhi batas aman standar SOLAS</span>
          </p>
        </div>

        {/* Card 2: Kendaraan Utilization */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#0B241E] flex items-center gap-2">
              <Car className="w-4 h-4 text-[#D97706]" />
              <span>Kapasitas Dek Kendaraan (Car Deck)</span>
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {vehicleUtilization}% Terisi
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-black font-mono text-[#0B241E]">
              {totalVehicles} <span className="text-xs font-normal text-[#64748B]">/ {maxVehicleCapacity} Unit</span>
            </p>
            <p className="text-xs text-[#64748B]">
              Tiket Gate UPT: <strong className="text-[#0B241E]">{uptScannedTickets.vehicles} Unit</strong>
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                Number(vehicleUtilization) > 95 ? "bg-amber-500" : "bg-[#D97706]"
              }`}
              style={{ width: `${Math.min(Number(vehicleUtilization), 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sisa slot dek: {maxVehicleCapacity - totalVehicles} unit kendaraan campuran</span>
          </p>
        </div>
      </div>

      {/* 3. FORMULIR RINCIAN MUATAN & PENUMPANG (ISOLATED FORM) */}
      <form onSubmit={handleSubmitManifest} className="bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-[#F1F5F9] pb-4">
          <h3 className="text-base font-black text-[#0B241E]">
            Formulir Pelaporan Jumlah Penumpang & Muatan Kendaraan
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Data ini akan dicocokkan dengan data kupon pas pelabuhan sebelum izin berlayar (SPB) diterbitkan oleh Syahbandar.
          </p>
        </div>

        {/* Section A: Penumpang */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-[#0B241E] uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0284C7]" />
            <span>A. Rincian Jiwa Penumpang & Awak Kapal (Crew)</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-[#475569] mb-1">
                Dewasa (Orang)
              </label>
              <input
                type="number"
                min="0"
                value={paxAdult}
                onChange={(e) => setPaxAdult(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#475569] mb-1">
                Anak-anak (Orang)
              </label>
              <input
                type="number"
                min="0"
                value={paxChild}
                onChange={(e) => setPaxChild(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#475569] mb-1">
                Bayi / Balita (Infant)
              </label>
              <input
                type="number"
                min="0"
                value={paxInfant}
                onChange={(e) => setPaxInfant(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#475569] mb-1">
                Awak Kapal (Kru / ABK)
              </label>
              <input
                type="number"
                min="1"
                value={crewCount}
                onChange={(e) => setCrewCount(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>
          </div>
        </div>

        {/* Section B: Kendaraan */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-extrabold text-[#0B241E] uppercase tracking-wider flex items-center gap-2">
            <Car className="w-4 h-4 text-[#D97706]" />
            <span>B. Rincian Golongan Kendaraan (Muatan Dek)</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-[#475569] mb-1">
                Gol I (Sepeda)
              </label>
              <input
                type="number"
                min="0"
                value={vehGol1}
                onChange={(e) => setVehGol1(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#475569] mb-1">
                Gol II (Motor &lt; 500cc)
              </label>
              <input
                type="number"
                min="0"
                value={vehGol2}
                onChange={(e) => setVehGol2(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#475569] mb-1">
                Gol III (Moge)
              </label>
              <input
                type="number"
                min="0"
                value={vehGol3}
                onChange={(e) => setVehGol3(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#475569] mb-1">
                Gol IV A (Mobil)
              </label>
              <input
                type="number"
                min="0"
                value={vehGol4A}
                onChange={(e) => setVehGol4A(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#475569] mb-1">
                Gol IV B (Pick-up)
              </label>
              <input
                type="number"
                min="0"
                value={vehGol4B}
                onChange={(e) => setVehGol4B(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#475569] mb-1">
                Gol V (Bus/Truk)
              </label>
              <input
                type="number"
                min="0"
                value={vehGol5}
                onChange={(e) => setVehGol5(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#475569] mb-1">
                Gol VI - VII (Tronton)
              </label>
              <input
                type="number"
                min="0"
                value={vehGol6_7}
                onChange={(e) => setVehGol6_7(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold p-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0B241E]"
              />
            </div>
          </div>
        </div>

        {/* Section C: Lampiran Berkas PDF Manifes */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold text-[#0B241E]">
            C. Lampiran Berkas Manifes Resmi Perusahaan Kapal (.PDF)
          </label>
          {attachedFile ? (
            <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#0284C7]" />
                <div>
                  <p className="font-bold text-[#0B241E]">{attachedFile.name}</p>
                  <p className="text-[10px] text-[#64748B] font-mono">
                    {attachedFile.size} • {attachedFile.hash}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="text-red-600 hover:text-red-800 text-xs font-bold p-1 cursor-pointer"
              >
                Ganti Berkas
              </button>
            </div>
          ) : (
            <div
              onClick={() =>
                setAttachedFile({
                  name: "MANIFES_UPLOAD_16NOV2026.pdf",
                  size: "2.1 MB",
                  hash: "SHA256: e82b...199a",
                })
              }
              className="p-4 rounded-xl border-2 border-dashed border-[#CBD5E1] hover:border-[#0B241E] text-center cursor-pointer text-xs space-y-1 transition-colors"
            >
              <Upload className="w-6 h-6 text-[#64748B] mx-auto" />
              <p className="font-bold text-[#0B241E]">Klik untuk mengunggah dokumen manifes PDF</p>
              <p className="text-[10px] text-[#94A3B8]">Maksimal berkas 10 MB (Format PDF bertanda tangan)</p>
            </div>
          )}
        </div>

        {/* Section D: Deklarasi Tanggung Jawab Nakhoda */}
        <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3 text-xs">
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              id="captain_check"
              checked={isCaptainDeclared}
              onChange={(e) => setIsCaptainDeclared(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#0B241E] rounded cursor-pointer"
            />
            <label htmlFor="captain_check" className="cursor-pointer space-y-1">
              <strong className="text-amber-950 block font-bold">
                Pernyataan Kelaiklautan & Tanggung Jawab Nakhoda (Master's Declaration):
              </strong>
              <p className="text-amber-900/90 text-[11px] leading-relaxed">
                Saya menyatakan dengan sebenarnya bahwa muatan kapal telah diperiksa, diikat (*lashing*) sesuai standar keselamatan, stabilitas sarat kapal (draft) dalam batas aman, dan jumlah jiwa di atas kapal tidak melebihi kapasitas sertifikat keselamatan.
              </p>
            </label>
          </div>

          <div className="pt-2 border-t border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-amber-950 gap-2">
            <div>
              <span>Nakhoda Bertanggung Jawab: </span>
              <strong className="font-mono">{captainName}</strong>
            </div>
            <span className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
              Ttd Digital Terverifikasi
            </span>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-[#F1F5F9]">
          <span className="text-xs text-[#64748B] flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Data terenkripsi dan terhubung langsung ke Syahbandar UPTD.</span>
          </span>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4 text-[#D97706]" />
            <span>Kirim Manifes & Minta Clearance SPB</span>
          </button>
        </div>
      </form>
    </div>
  );
}
