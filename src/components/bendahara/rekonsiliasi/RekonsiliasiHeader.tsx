"use client";

import {
  Coins,
  Download,
  Receipt,
  ShieldCheck,
  Ship,
  Ticket,
} from "lucide-react";

export type RekonsiliasiTab = "BKU" | "HANDOVERS" | "BOOKS" | "MANIFESTS";

export interface RekonsiliasiHeaderProps {
  activeTab: RekonsiliasiTab;
  onSelectTab: (tab: RekonsiliasiTab) => void;
  handoversCount: number;
  ticketBooksCount: number;
  manifestsCount: number;
  onDownloadPasal95Report: () => void;
}

export function RekonsiliasiHeader({
  activeTab,
  onSelectTab,
  handoversCount,
  ticketBooksCount,
  manifestsCount,
  onDownloadPasal95Report,
}: RekonsiliasiHeaderProps) {
  return (
    <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="text-sm font-extrabold text-[#0B241E] flex items-center gap-2">
          <Coins className="w-4 h-4 text-[#D97706]" />
          <span>Rekonsiliasi Buku Kas Umum &amp; Setoran Loket Gerbang</span>
        </h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Penyelarasan catatan penerimaan kasda loket gerbang, transfer bank RKUD Papua, dan manifes penyeberangan sesuai{" "}
          <span className="font-semibold text-[#0B241E]">
            Perbup Mimika No. 25/2024
          </span>.
        </p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
        <button
          onClick={() => onSelectTab("BKU")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "BKU"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-[#D97706]" />
          Buku Kas Umum (BKU)
        </button>
        <button
          onClick={() => onSelectTab("HANDOVERS")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "HANDOVERS"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Serah Terima Kasir ({handoversCount})
        </button>
        <button
          onClick={() => onSelectTab("BOOKS")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "BOOKS"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Ticket className="w-3.5 h-3.5 text-amber-500" />
          Buku Karcis ({ticketBooksCount})
        </button>
        <button
          onClick={() => onSelectTab("MANIFESTS")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "MANIFESTS"
              ? "bg-[#0B241E] text-white shadow-xs"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Ship className="w-3.5 h-3.5 text-blue-500" />
          Manifes Ferry ({manifestsCount})
        </button>
        <button
          type="button"
          onClick={onDownloadPasal95Report}
          title="Unduh Laporan Realisasi Bulanan sesuai Pasal 95 Perbup Mimika 25/2024 (batas lapor tanggal 5 bulan berikutnya)"
          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5 text-[#D97706]" />
          Laporan Pasal 95 (CSV)
        </button>
      </div>
    </div>
  );
}
