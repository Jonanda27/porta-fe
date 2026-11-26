"use client";

import { CheckCircle2, Clock, Coins, Search, Users } from "lucide-react";
import { GateHandoverItem } from "@/types/field-ops.types";

export interface HandoversSectionProps {
  handovers: GateHandoverItem[];
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  onOpenCloseHandover: (handover: GateHandoverItem) => void;
}

export function HandoversSection({
  handovers,
  searchQuery,
  onChangeSearchQuery,
  onOpenCloseHandover,
}: HandoversSectionProps) {
  return (
    <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xs overflow-hidden">
      <div className="p-4 border-b border-[#F1F5F9] bg-[#FAFCFB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <h3 className="font-extrabold text-sm text-[#0B241E]">
            Rekonsiliasi Sesi Serah Terima Uang Fisik Kasir Loket Gerbang
          </h3>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Pengawasan setoran karcis pas masuk pelabuhan dari petugas shift loket ke Bendahara (Zero Discrepancy Policy).
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari petugas atau nomor buku..."
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0B241E]"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-mono text-[11px] text-[#64748B] uppercase">
            <tr>
              <th className="p-3.5">Petugas Juru Gerbang</th>
              <th className="p-3.5">Buku Karcis &amp; Kategori</th>
              <th className="p-3.5">Rentang Seri Shift</th>
              <th className="p-3.5">Karcis Terjual</th>
              <th className="p-3.5">Target Setoran</th>
              <th className="p-3.5">Uang Fisik Diterima</th>
              <th className="p-3.5">Status Handover</th>
              <th className="p-3.5 text-center">Aksi Bendahara</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {handovers.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-[#64748B]">
                  Belum ada sesi serah terima loket yang tercatat.
                </td>
              </tr>
            ) : (
              handovers.map((h) => {
                const isSettled = h.status === "SETTLED";
                const nominal = Number(h.book?.nominalPerTicket || 0);
                return (
                  <tr key={h.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-[#0B241E] flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#D97706]" />
                        {h.wardenName}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        Mulai:{" "}
                        {new Date(h.dispatchTime).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        WIT
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-gray-900 font-mono">
                        {h.book?.bookCode || "KRC-00"}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {h.book?.ticketCategory.replace(/_/g, " ")} (Rp{" "}
                        {nominal.toLocaleString("id-ID")})
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-gray-700">
                      Seri: {h.dispatchedSerialStart} s.d. {h.dispatchedSerialEnd}
                    </td>

                    <td className="p-3.5 font-mono font-bold text-gray-800">
                      {isSettled ? `${h.soldQty} Lembar` : "Sedang Berjalan"}
                    </td>

                    <td className="p-3.5 font-mono font-bold text-gray-800">
                      {isSettled
                        ? `Rp ${Number(h.expectedAmountIdr || 0).toLocaleString("id-ID")}`
                        : "-"}
                    </td>

                    <td className="p-3.5 font-mono font-black text-emerald-800">
                      {isSettled
                        ? `Rp ${Number(h.actualCashSettledIdr || 0).toLocaleString("id-ID")}`
                        : "-"}
                    </td>

                    <td className="p-3.5">
                      {isSettled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Disahkan Kasda
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" />
                          Shift Berjalan
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      {!isSettled ? (
                        <button
                          onClick={() => onOpenCloseHandover(h)}
                          className="px-3 py-1.5 bg-[#0B241E] hover:bg-[#143E33] text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer mx-auto"
                        >
                          <Coins className="w-3.5 h-3.5 text-[#D97706]" />
                          <span>Validasi Setoran</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400 font-mono">
                          {h.settleTime
                            ? new Date(h.settleTime).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Selesai"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
