"use client";

import { Plus, Search, Ticket } from "lucide-react";
import { GateTicketBookItem } from "@/types/field-ops.types";

export interface TicketBooksSectionProps {
  ticketBooks: GateTicketBookItem[];
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  onOpenCreateBook: () => void;
}

export function TicketBooksSection({
  ticketBooks,
  searchQuery,
  onChangeSearchQuery,
  onOpenCreateBook,
}: TicketBooksSectionProps) {
  return (
    <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xs overflow-hidden">
      <div className="p-4 border-b border-[#F1F5F9] bg-[#FAFCFB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <h3 className="font-extrabold text-sm text-[#0B241E]">
            Inventarisasi Buku Bendel Karcis Pas Masuk Pelabuhan
          </h3>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Pengawasan nomor porporasi Bapenda Mimika dan legalitas bendel karcis pas pelabuhan sesuai Perbup 25/2024 Pasal 13.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kode buku atau porporasi..."
              value={searchQuery}
              onChange={(e) => onChangeSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0B241E]"
            />
          </div>
          <button
            type="button"
            onClick={onOpenCreateBook}
            className="px-3.5 py-1.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Terbitkan Buku Karcis</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-mono text-[11px] text-[#64748B] uppercase">
            <tr>
              <th className="p-3.5">Kode Buku Karcis</th>
              <th className="p-3.5">Kategori Pas Masuk</th>
              <th className="p-3.5">Nomor Porporasi Bapenda</th>
              <th className="p-3.5">Rentang Nomor Seri</th>
              <th className="p-3.5">Total Kapasitas</th>
              <th className="p-3.5">Tarif per Karcis</th>
              <th className="p-3.5">Status Buku</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {ticketBooks.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#64748B]">
                  Belum ada data buku karcis yang terdaftar.
                </td>
              </tr>
            ) : (
              ticketBooks.map((b) => (
                <tr key={b.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="p-3.5 font-mono font-bold text-[#0B241E] flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5 text-[#D97706]" />
                    {b.bookCode}
                  </td>
                  <td className="p-3.5 font-semibold text-gray-800">
                    {b.ticketCategory.replace(/_/g, " ")}
                  </td>
                  <td className="p-3.5 font-mono text-gray-700">
                    {b.porporasiNumber || "PORPORASI-BAPENDA-SAH"}
                  </td>
                  <td className="p-3.5 font-mono text-gray-700">
                    No. {b.serialStart} s.d. No. {b.serialEnd}
                  </td>
                  <td className="p-3.5 font-mono text-gray-700">
                    {b.serialEnd - b.serialStart + 1} Lembar
                  </td>
                  <td className="p-3.5 font-mono font-bold text-[#0B241E]">
                    Rp {Number(b.nominalPerTicket).toLocaleString("id-ID")}
                  </td>
                  <td className="p-3.5">
                    {b.status === "ACTIVE" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        Sedang Digunakan
                      </span>
                    ) : b.status === "STOK" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Stok Tersedia
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                        Habis Terpakai
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
