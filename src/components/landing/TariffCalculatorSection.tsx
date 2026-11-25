"use client";

import React, { useState } from "react";
import { Ship, Ticket, Store } from "lucide-react";

const VEHICLE_PRICING: Record<string, { price: number; label: string }> = {
  gol1: { price: 8000, label: "Gol I (Sepeda Dayung)" },
  gol2: { price: 15000, label: "Gol II (Sepeda Motor < 250cc)" },
  gol3: { price: 25000, label: "Gol III (Sepeda Motor Besar / Roda 3)" },
  gol4: { price: 50000, label: "Gol IV (Mobil Pribadi / Pick Up)" },
  gol5: { price: 120000, label: "Gol V (Bus / Truk Sedang)" },
  gol6: { price: 250000, label: "Gol VI+ (Truk Tronton / Alat Berat)" },
};

const KIOS_ZONE_PRICING: Record<string, { ratePerM2: number; zoneName: string }> = {
  terminal: { ratePerM2: 250000, zoneName: "Zona A (Terminal Penumpang VIP/Lobby)" },
  pelataran: { ratePerM2: 180000, zoneName: "Zona B (Pelataran Parkir & Pujasera)" },
  logistik: { ratePerM2: 320000, zoneName: "Zona C (Kawasan Pergudangan Lini 1)" },
};

export function TariffCalculatorSection() {
  const [calcTab, setCalcTab] = useState<"kapal" | "tiket" | "sewa">("kapal");
  const [vesselGt, setVesselGt] = useState<number>(1500);
  const [berthHours, setBerthHours] = useState<number>(12);
  const [loaLength, setLoaLength] = useState<number>(65);
  const [vehicleClass, setVehicleClass] = useState<string>("gol4");
  const [passengerCount, setPassengerCount] = useState<number>(2);
  const [kiosArea, setKiosArea] = useState<number>(12);
  const [kiosZone, setKiosZone] = useState<string>("terminal");

  const calculateKapalFee = () => {
    const tambatFee = loaLength * berthHours * 450;
    const etmalCount = Math.max(1, Math.ceil(berthHours / 24));
    const labuhFee = vesselGt * 120 * etmalCount;
    const kebersihanFee = 75000;
    const total = tambatFee + labuhFee + kebersihanFee;
    return { tambatFee, labuhFee, kebersihanFee, total };
  };

  const calculateTiketFee = () => {
    const passengerPrice = 5000;
    const vehicleSpec = VEHICLE_PRICING[vehicleClass] || {
      price: 0,
      label: "Tanpa Kendaraan",
    };
    const totalPassenger = passengerCount * passengerPrice;
    const total = totalPassenger + vehicleSpec.price;
    return {
      totalPassenger,
      vehiclePrice: vehicleSpec.price,
      vehicleName: vehicleSpec.label,
      total,
    };
  };

  const calculateSewaFee = () => {
    const zoneSpec = KIOS_ZONE_PRICING[kiosZone] || KIOS_ZONE_PRICING.terminal;
    const sewaPokokTahun = kiosArea * zoneSpec.ratePerM2;
    const sewaPerBulan = Math.round(sewaPokokTahun / 12);
    const estimasiUtilitas = 450000;
    return {
      ratePerM2: zoneSpec.ratePerM2,
      zoneName: zoneSpec.zoneName,
      sewaPokokTahun,
      sewaPerBulan,
      estimasiUtilitas,
    };
  };

  const kapalFee = calculateKapalFee();
  const tiketFee = calculateTiketFee();
  const sewaFee = calculateSewaFee();

  return (
    <section
      id="kalkulator-tarif"
      className="scroll-mt-24 py-20 px-4 sm:px-8 bg-white border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D97706] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Kalkulator Transparansi PAD
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B241E]">
            Simulasi Estimasi Retribusi Daerah Resmi
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Hitung estimasi pokok retribusi daerah berdasarkan formula resmi{" "}
            <strong>PP No. 35 Tahun 2023</strong> dan{" "}
            <strong>Perbup Mimika No. 25 Tahun 2024</strong> sebelum diterbitkan SKRD.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-[#F8FAFC] rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="grid grid-cols-3 border-b border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setCalcTab("kapal")}
              className={`py-4 px-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all border-b-2 ${
                calcTab === "kapal"
                  ? "border-[#D97706] text-[#0B241E] bg-[#F8FAFC]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Ship className="w-4 h-4 text-[#D97706]" />
              <span>1. Jasa Sandar &amp; Labuh Kapal</span>
            </button>

            <button
              type="button"
              onClick={() => setCalcTab("tiket")}
              className={`py-4 px-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all border-b-2 ${
                calcTab === "tiket"
                  ? "border-[#D97706] text-[#0B241E] bg-[#F8FAFC]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Ticket className="w-4 h-4 text-[#D97706]" />
              <span>2. Karcis Masuk Terminal</span>
            </button>

            <button
              type="button"
              onClick={() => setCalcTab("sewa")}
              className={`py-4 px-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all border-b-2 ${
                calcTab === "sewa"
                  ? "border-[#D97706] text-[#0B241E] bg-[#F8FAFC]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Store className="w-4 h-4 text-[#D97706]" />
              <span>3. Sewa Kios / Lahan BMD</span>
            </button>
          </div>

          {calcTab === "kapal" && (
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                    Parameter Armada &amp; Slot Waktu
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { label: "Pelra 480 GT", gt: 480, loa: 32, hours: 8 },
                      { label: "Penumpang 1.500 GT", gt: 1500, loa: 65, hours: 12 },
                      { label: "Kargo 4.200 GT", gt: 4200, loa: 98, hours: 24 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setVesselGt(preset.gt);
                          setLoaLength(preset.loa);
                          setBerthHours(preset.hours);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#D97706] text-[10.5px] font-semibold text-[#0B241E] transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="calc-vessel-gt"
                    className="text-xs font-bold text-slate-700 block mb-1"
                  >
                    Tonase Kotor Kapal (Gross Tonnage / GT)
                  </label>
                  <input
                    id="calc-vessel-gt"
                    name="vesselGt"
                    type="number"
                    value={vesselGt}
                    onChange={(e) => setVesselGt(Math.max(10, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-[#0B241E] focus:outline-none focus:border-[#D97706]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Dasar tarif labuh: Rp 120 / GT / etmal (24 jam)
                  </span>
                </div>

                <div>
                  <label
                    htmlFor="calc-vessel-loa"
                    className="text-xs font-bold text-slate-700 block mb-1"
                  >
                    Panjang Kapal (LOA - Length Over All dalam Meter)
                  </label>
                  <input
                    id="calc-vessel-loa"
                    name="loaLength"
                    type="number"
                    value={loaLength}
                    onChange={(e) => setLoaLength(Math.max(5, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-[#0B241E] focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="calc-berth-hours"
                    className="text-xs font-bold text-slate-700 block mb-1"
                  >
                    Durasi Sandar Tambat di Dermaga (Jam)
                  </label>
                  <input
                    id="calc-berth-hours"
                    name="berthHours"
                    type="number"
                    value={berthHours}
                    onChange={(e) => setBerthHours(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-[#0B241E] focus:outline-none focus:border-[#D97706]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Dasar tarif tambat: Rp 450 / meter LOA / jam
                  </span>
                </div>
              </div>

              <div className="bg-[#0B241E] text-white p-6 rounded-2xl border border-[#164336] flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-[#D97706] font-bold uppercase tracking-wider block">
                    Estimasi Billing e-SKRD
                  </span>
                  <h5 className="text-base font-extrabold text-white mt-1">
                    Rincian Objek Retribusi Pelabuhan
                  </h5>

                  <div className="mt-4 space-y-2.5 text-xs text-[#BED2CA]">
                    <div className="flex justify-between">
                      <span>
                        Retribusi Tambat ({loaLength}m x {berthHours} jam):
                      </span>
                      <span className="font-mono text-white font-bold">
                        Rp {kapalFee.tambatFee.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Retribusi Jasa Labuh ({vesselGt} GT):</span>
                      <span className="font-mono text-white font-bold">
                        Rp {kapalFee.labuhFee.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jasa Kebersihan Dermaga:</span>
                      <span className="font-mono text-white font-bold">
                        Rp {kapalFee.kebersihanFee.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#164336]">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Total Pokok Tagihan SKRD
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-[#D97706] font-mono mt-1">
                    Rp {kapalFee.total.toLocaleString("id-ID")}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    *Jatuh tempo 30 hari. Keterlambatan dikenai sanksi bunga STRD 1% per
                    bulan (Pasal 21 ayat 8 Perbup).
                  </p>
                </div>
              </div>
            </div>
          )}

          {calcTab === "tiket" && (
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Golongan Kendaraan &amp; Penumpang
                </h4>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Pilih Golongan Kendaraan (Karcis Porporasi)
                  </label>
                  <select
                    value={vehicleClass}
                    onChange={(e) => setVehicleClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-[#0B241E] focus:outline-none focus:border-[#D97706]"
                  >
                    <option value="none">Tanpa Kendaraan (Pejalan Kaki Saja)</option>
                    <option value="gol1">Golongan I (Sepeda Dayung) - Rp 8.000</option>
                    <option value="gol2">
                      Golongan II (Sepeda Motor &lt; 250cc) - Rp 15.000
                    </option>
                    <option value="gol3">
                      Golongan III (Sepeda Motor Besar / Roda 3) - Rp 25.000
                    </option>
                    <option value="gol4">
                      Golongan IV (Mobil Pribadi / Pick Up) - Rp 50.000
                    </option>
                    <option value="gol5">
                      Golongan V (Bus / Truk Sedang) - Rp 120.000
                    </option>
                    <option value="gol6">
                      Golongan VI+ (Truk Tronton / Berat) - Rp 250.000
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Jumlah Penumpang / Pengantar (Jiwa)
                  </label>
                  <input
                    type="number"
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-[#0B241E] focus:outline-none focus:border-[#D97706]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Pas masuk orang: Rp 5.000 per orang (termasuk asuransi pelabuhan).
                  </span>
                </div>
              </div>

              <div className="bg-[#0B241E] text-white p-6 rounded-2xl border border-[#164336] flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-[#D97706] font-bold uppercase tracking-wider block">
                    Karcis Porporasi Bapenda
                  </span>
                  <h5 className="text-base font-extrabold text-white mt-1">
                    Simulasi Pas Masuk &amp; Kendaraan
                  </h5>

                  <div className="mt-4 space-y-2.5 text-xs text-[#BED2CA]">
                    <div className="flex justify-between">
                      <span>Pas Orang ({passengerCount} Penumpang):</span>
                      <span className="font-mono text-white font-bold">
                        Rp {tiketFee.totalPassenger.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Karcis {tiketFee.vehicleName}:</span>
                      <span className="font-mono text-white font-bold">
                        Rp {tiketFee.vehiclePrice.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Metode Validasi:</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        QR Code Anti-Passback
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#164336]">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Total Pembayaran di Loket / Gate
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-[#D97706] font-mono mt-1">
                    Rp {tiketFee.total.toLocaleString("id-ID")}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Dicetak dengan nomor registrasi unik porporasi resmi Bapenda.
                    Disetor ke Kasda maks 1x24 jam.
                  </p>
                </div>
              </div>
            </div>
          )}

          {calcTab === "sewa" && (
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Pemanfaatan Barang Milik Daerah (BMD)
                </h4>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Zona Penempatan Fasilitas Usaha
                  </label>
                  <select
                    value={kiosZone}
                    onChange={(e) => setKiosZone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-[#0B241E] focus:outline-none focus:border-[#D97706]"
                  >
                    <option value="terminal">
                      Zona A: Terminal Penumpang VIP / Kios Oleh-oleh (Rp
                      250.000/m²/thn)
                    </option>
                    <option value="pelataran">
                      Zona B: Pelataran Parkir &amp; Pujasera Terbuka (Rp 180.000/m²/thn)
                    </option>
                    <option value="logistik">
                      Zona C: Kawasan Gudang &amp; Depo Logistik Lini 1 (Rp
                      320.000/m²/thn)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Luas Ruang / Kavling yang Disewa (m²)
                  </label>
                  <input
                    type="number"
                    value={kiosArea}
                    onChange={(e) => setKiosArea(Math.max(2, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-[#0B241E] focus:outline-none focus:border-[#D97706]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Sesuai denah aset UPTD Pelabuhan dan kontrak PKS digital.
                  </span>
                </div>
              </div>

              <div className="bg-[#0B241E] text-white p-6 rounded-2xl border border-[#164336] flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-[#D97706] font-bold uppercase tracking-wider block">
                    Kontrak Sewa PKS BMD
                  </span>
                  <h5 className="text-base font-extrabold text-white mt-1">
                    Simulasi Retribusi Sewa Tahunan
                  </h5>

                  <div className="mt-4 space-y-2.5 text-xs text-[#BED2CA]">
                    <div className="flex justify-between gap-4">
                      <span className="shrink-0">Lokasi Zonasi:</span>
                      <span className="font-medium text-white text-right">
                        {sewaFee.zoneName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tarif Dasar ({kiosArea} m²):</span>
                      <span className="font-mono text-white font-bold">
                        Rp {sewaFee.sewaPokokTahun.toLocaleString("id-ID")} / tahun
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Beban Pokok per Bulan:</span>
                      <span className="font-mono text-[#D97706] font-bold">
                        Rp {sewaFee.sewaPerBulan.toLocaleString("id-ID")} / bln
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#164336]">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Total Retribusi Sewa (1 Tahun Kontrak)
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-[#D97706] font-mono mt-1">
                    Rp {sewaFee.sewaPokokTahun.toLocaleString("id-ID")}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Dapat diajukan skema angsuran SPARD maks. 6 kali angsuran (Pasal 19
                    Perbup Mimika 25/2024).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
