"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Ship,
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  MessageSquare,
  Bot,
  Send,
  User,
  Sparkles,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Ticket,
} from "lucide-react";

interface ScheduleItem {
  id: string;
  shipName: string;
  operator: string;
  route: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  dockType: "Eksekutif" | "Reguler";
  dockName: string;
  status: "Tepat Waktu" | "Boarding" | "Perubahan Waktu";
  paxQuota: string;
  vehicleQuota: string;
  totalPrice: number;
  retribusiAmount: number;
}

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  badge?: string;
}

export default function PenumpangJadwalPage() {
  // Filter States
  const [selectedRoute, setSelectedRoute] = useState<string>("merak-bakauheni");
  const [selectedDockType, setSelectedDockType] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("2026-11-16");
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "bot",
      text: "Halo! Saya Asisten Virtual PORTA. Ada yang bisa saya bantu terkait jadwal penyeberangan, batas dimensi kendaraan, atau rincian tarif retribusi daerah PP 35/2023?",
      timestamp: "13:00 WIB",
      badge: "AI Terverifikasi",
    },
  ]);
  const [userInput, setUserInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Schedules Dataset
  const schedules: ScheduleItem[] = [
    {
      id: "SCH-01",
      shipName: "KMP Portlink III",
      operator: "PT ASDP Indonesia Ferry (Persero)",
      route: "Merak ➔ Bakauheni",
      departureTime: "08:00 WIB",
      arrivalTime: "09:45 WIB",
      duration: "1j 45m",
      dockType: "Eksekutif",
      dockName: "Dermaga Eksekutif 1",
      status: "Tepat Waktu",
      paxQuota: "92% Terisi (48 Kursi Tersedia)",
      vehicleQuota: "45/50 Mobil",
      totalPrice: 65000,
      retribusiAmount: 15000,
    },
    {
      id: "SCH-02",
      shipName: "KMP Batumandi",
      operator: "PT Dharma Lautan Utama",
      route: "Merak ➔ Bakauheni",
      departureTime: "09:15 WIB",
      arrivalTime: "11:15 WIB",
      duration: "2j 00m",
      dockType: "Reguler",
      dockName: "Dermaga Reguler 2",
      status: "Boarding",
      paxQuota: "80% Terisi (110 Kursi Tersedia)",
      vehicleQuota: "62/70 Mobil",
      totalPrice: 45000,
      retribusiAmount: 10000,
    },
    {
      id: "SCH-03",
      shipName: "KMP Sebuku",
      operator: "PT ASDP Indonesia Ferry (Persero)",
      route: "Merak ➔ Bakauheni",
      departureTime: "10:30 WIB",
      arrivalTime: "12:45 WIB",
      duration: "2j 15m",
      dockType: "Reguler",
      dockName: "Dermaga Reguler 3",
      status: "Perubahan Waktu",
      paxQuota: "Tersedia (200+ Kursi)",
      vehicleQuota: "Standby Antrean",
      totalPrice: 45000,
      retribusiAmount: 10000,
    },
    {
      id: "SCH-04",
      shipName: "KMP Legundi",
      operator: "PT Jemla Ferry",
      route: "Merak ➔ Bakauheni",
      departureTime: "11:45 WIB",
      arrivalTime: "13:30 WIB",
      duration: "1j 45m",
      dockType: "Eksekutif",
      dockName: "Dermaga Eksekutif 2",
      status: "Tepat Waktu",
      paxQuota: "Tersedia (140 Kursi)",
      vehicleQuota: "32/50 Mobil",
      totalPrice: 65000,
      retribusiAmount: 15000,
    },
    {
      id: "SCH-05",
      shipName: "KMP Rajabasa",
      operator: "PT Jembatan Maritim",
      route: "Merak ➔ Bakauheni",
      departureTime: "13:00 WIB",
      arrivalTime: "15:00 WIB",
      duration: "2j 00m",
      dockType: "Reguler",
      dockName: "Dermaga Reguler 1",
      status: "Tepat Waktu",
      paxQuota: "Tersedia (250 Kursi)",
      vehicleQuota: "20/70 Mobil",
      totalPrice: 45000,
      retribusiAmount: 10000,
    },
  ];

  // Filtered List
  const filteredSchedules = schedules.filter((sch) => {
    if (selectedDockType !== "all" && sch.dockType !== selectedDockType) return false;
    if (
      searchKeyword &&
      !sch.shipName.toLowerCase().includes(searchKeyword.toLowerCase()) &&
      !sch.operator.toLowerCase().includes(searchKeyword.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleSendChat = (questionText?: string) => {
    const query = questionText || userInput.trim();
    if (!query) return;

    const newMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: "Baru saja",
    };

    setChatMessages((prev) => [...prev, newMsg]);
    if (!questionText) setUserInput("");
    setIsTyping(true);

    // Knowledge-base rule-based answers matching official SOP & PP 35/2023
    setTimeout(() => {
      let botReply =
        "Terima kasih atas pertanyaan Anda. Untuk informasi lebih spesifik, Anda dapat menghubungi Call Center UPTD Pelabuhan di 1500-112 atau memeriksa katalog tarif resmi PP No. 35/2023.";

      const lower = query.toLowerCase();
      if (lower.includes("tarif") && (lower.includes("motor") || lower.includes("golongan ii"))) {
        botReply =
          "Berdasarkan Perda Retribusi Daerah sesuai PP No. 35/2023, tarif pas masuk untuk Sepeda Motor (Golongan II) adalah Rp 10.000 (retribusi Pemda) + tarif tiket kapal operator penyeberangan Rp 50.000. Total tiket Rp 60.000 sudah termasuk asuransi Jasa Raharja.";
      } else if (lower.includes("terlambat") || lower.includes("jam")) {
        botReply =
          "Sesuai SOP Pelabuhan, tiket berlaku hingga 2 jam setelah jam keberangkatan kapal yang tertera. Jika Anda terlambat melebihi batas toleransi, Anda dapat melakukan penjadwalan ulang (*reschedule*) di loket layanan pelanggan UPT sebelum tiket berstatus hangus.";
      } else if (lower.includes("tunai") || lower.includes("qris") || lower.includes("bayar")) {
        botReply =
          "Pembayaran di portal online mendukung QRIS, Virtual Account BCA/Mandiri/BRI, dan kartu debit. Di gate fisik loket, petugas UPT menyediakan opsi non-tunai (TapCash/E-Money) serta loket tunai darurat bagi pengguna jasa yang belum memiliki akses digital.";
      } else if (lower.includes("bagasi") || lower.includes("berat")) {
        botReply =
          "Batas bagasi cuma-cuma (*free baggage allowance*) bagi penumpang pejalan kaki adalah 20 kg per orang dengan dimensi maksimal 70x40x30 cm. Barang berukuran besar atau komoditas dagang akan dikenakan retribusi jasa dermaga barang sesuai ketentuan UPTD.";
      } else if (lower.includes("mobil") || lower.includes("golongan iv")) {
        botReply =
          "Untuk Mobil Pribadi (Golongan IV A), tarif pas pelabuhan resmi adalah Rp 35.000 (hak Pemda) terintegrasi dalam tiket penyeberangan. Kapasitas dermaga eksekutif saat ini beroperasi normal dengan waktu muat 20 menit.";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: botReply,
          timestamp: "Baru saja",
          badge: "Jawaban Resmi SOP",
        },
      ]);
      setIsTyping(false);
    }, 700);
  };

  const quickQuestions = [
    "Berapa tarif pas masuk motor Golongan II?",
    "Bagaimana jika saya terlambat dari jam kapal?",
    "Apakah retribusi daerah bisa bayar non-tunai di gate?",
    "Berapa batas berat bagasi penumpang pejalan kaki?",
  ];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0A2540] via-[#0F3A5D] to-[#0D9488] text-white p-6 sm:p-8 rounded-2xl shadow-md space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#67E8F9] text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5" />
          <span>Informasi Jadwal & Asisten Digital</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Daftar Keberangkatan & Asisten Informasi Layanan
        </h1>
        <p className="text-xs sm:text-sm text-[#E0F2FE]/90 max-w-2xl leading-relaxed">
          Temukan armada kapal, estimasi waktu tempuh, dan transparansi rincian retribusi daerah. Gunakan Asisten Virtual PORTA untuk tanya-jawab aturan resmi seputar pelabuhan.
        </p>
      </div>

      {/* Main Grid: 2 Columns (Left: Schedules 65%, Right: AI Chatbot Assistant 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ============================================================== */}
        {/* COLUMN 1: SCHEDULE LIST & ADVANCED FILTERS (8 Cols)            */}
        {/* ============================================================== */}
        <div className="lg:col-span-8 space-y-5">
          {/* Filter Bar */}
          <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2540] flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#0284C7]" />
                <span>Filter Pencarian Lintasan</span>
              </span>

              {/* Dock Type Switcher */}
              <div className="flex items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setSelectedDockType("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedDockType === "all"
                      ? "bg-white text-[#0A2540] shadow-xs"
                      : "text-[#64748B] hover:text-[#0A2540]"
                  }`}
                >
                  Semua Layanan
                </button>
                <button
                  onClick={() => setSelectedDockType("Eksekutif")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedDockType === "Eksekutif"
                      ? "bg-white text-[#0A2540] shadow-xs"
                      : "text-[#64748B] hover:text-[#0A2540]"
                  }`}
                >
                  Eksekutif (Cepat)
                </button>
                <button
                  onClick={() => setSelectedDockType("Reguler")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedDockType === "Reguler"
                      ? "bg-white text-[#0A2540] shadow-xs"
                      : "text-[#64748B] hover:text-[#0A2540]"
                  }`}
                >
                  Reguler
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                  Lintasan Penyeberangan
                </label>
                <select
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7]"
                >
                  <option value="merak-bakauheni">Merak ➔ Bakauheni (Selat Sunda)</option>
                  <option value="bakauheni-merak">Bakauheni ➔ Merak</option>
                  <option value="ketapang-gilimanuk">Ketapang ➔ Gilimanuk (Selat Bali)</option>
                  <option value="gilimanuk-ketapang">Gilimanuk ➔ Ketapang</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                  Cari Nama Kapal / Operator
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Contoh: Portlink, ASDP..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full text-xs font-semibold pl-9 pr-3 p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Cards List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-[#64748B] px-1">
              <span>
                Menampilkan <strong className="text-[#0A2540]">{filteredSchedules.length}</strong> jadwal penyeberangan
              </span>
              <span className="text-[11px]">Harga sudah memuat Retribusi Daerah PP 35/2023</span>
            </div>

            {filteredSchedules.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#CBD5E1] hover:border-[#0284C7] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header Row: Ship Name, Badge & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1F5F9] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center font-bold shrink-0">
                      <Ship className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-[#0A2540]">
                          {item.shipName}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.dockType === "Eksekutif"
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {item.dockType}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B]">{item.operator}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                        item.status === "Tepat Waktu"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.status === "Boarding"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Timeline & Route Information */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">
                      Waktu Keberangkatan
                    </span>
                    <p className="font-mono text-base font-extrabold text-[#0A2540] mt-0.5">
                      {item.departureTime}
                    </p>
                    <p className="text-[11px] text-[#64748B]">{item.dockName}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">
                      Estimasi Durasi
                    </span>
                    <p className="font-mono text-sm font-bold text-[#0284C7] mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.duration} Perjalanan</span>
                    </p>
                    <p className="text-[11px] text-[#64748B]">Tiba: {item.arrivalTime}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">
                      Ketersediaan Kuota
                    </span>
                    <p className="font-semibold text-[#0D9488] mt-1">{item.paxQuota}</p>
                    <p className="text-[11px] text-[#64748B]">{item.vehicleQuota}</p>
                  </div>
                </div>

                {/* Pricing & Booking CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                  <div className="w-full sm:w-auto">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-[#0A2540] font-mono">
                        {formatRupiah(item.totalPrice)}
                      </span>
                      <span className="text-[11px] text-[#64748B]">/ Penumpang</span>
                    </div>
                    <p className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                      <span>Termasuk Retribusi Pemda {formatRupiah(item.retribusiAmount)} (PP 35/2023)</span>
                    </p>
                  </div>

                  <Link
                    href={`/penumpang/tiket?ship=${encodeURIComponent(item.shipName)}&time=${encodeURIComponent(
                      item.departureTime
                    )}&dock=${encodeURIComponent(item.dockType)}`}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] hover:from-[#0369A1] hover:to-[#0891B2] text-white text-xs font-extrabold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Pilih & Pesan Tiket</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================== */}
        {/* COLUMN 2: ASISTEN INFORMASI LAYANAN (AI CHATBOT WIDGET) (4 Cols)*/}
        {/* ============================================================== */}
        <div className="lg:col-span-4 sticky top-28 space-y-4">
          <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-lg overflow-hidden flex flex-col h-[600px]">
            {/* Chatbot Header */}
            <div className="bg-gradient-to-r from-[#0A2540] to-[#0F3A5D] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#06B6D4] text-[#0A2540] flex items-center justify-center font-bold shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs tracking-tight">
                    Asisten Virtual PORTA
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] text-[#67E8F9]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Online • Panduan Resmi Pelabuhan</span>
                  </div>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-[#67E8F9]" />
            </div>

            {/* Quick Questions Chips */}
            <div className="p-3 bg-[#F8FAFC] border-b border-[#E2E8F0] space-y-1.5">
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                Pertanyaan Populer Pengguna:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendChat(q)}
                    className="text-[10px] text-[#0369A1] bg-white hover:bg-[#E0F2FE] border border-[#CBD5E1] hover:border-[#0284C7] px-2 py-1 rounded-md text-left transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAFBFD] text-xs">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 shadow-2xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#0284C7] text-white rounded-br-xs"
                        : "bg-white border border-[#E2E8F0] text-[#0F172A] rounded-bl-xs"
                    }`}
                  >
                    {msg.badge && (
                      <span className="inline-block text-[9px] font-mono font-bold bg-[#E0F2FE] text-[#0369A1] px-1.5 py-0.2 rounded mb-1">
                        {msg.badge}
                      </span>
                    )}
                    <p className="text-xs">{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-[#94A3B8] mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 text-xs text-[#64748B] bg-white p-2.5 rounded-xl w-32 border border-[#E2E8F0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[10px]">Mengetik...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="p-3 bg-white border-t border-[#E2E8F0]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ketik pertanyaan Anda di sini..."
                  className="flex-1 text-xs p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7] text-[#0F172A]"
                />
                <button
                  type="submit"
                  disabled={!userInput.trim()}
                  className="p-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white disabled:opacity-40 transition-colors cursor-pointer"
                  aria-label="Kirim Pesan"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[9px] text-[#94A3B8] mt-1.5 text-center">
                Didukung basis data regulasi SOP Dinas & PP No. 35/2023.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
