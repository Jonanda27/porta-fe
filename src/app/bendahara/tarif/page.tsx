"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  DollarSign,
  RefreshCw,
  Search,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";
import { useTariffStore } from "@/store/tariff.store";
import { formatLabel } from "@/lib/format-labels";

export default function BendaharaTarifPage() {
  const {
    tariffs,
    usdRate,
    isLoading,
    isRateLoading,
    error,
    fetchTariffs,
    fetchUsdRate,
    clearError,
  } = useTariffStore();

  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  useEffect(() => {
    fetchTariffs();
    fetchUsdRate(false);
  }, [fetchTariffs, fetchUsdRate]);

  const filteredTariffs = useMemo(() => {
    return tariffs.filter((t) => {
      if (serviceFilter && t.serviceCode !== serviceFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.tariffCode.toLowerCase().includes(q) ||
          t.serviceCode.toLowerCase().includes(q) ||
          t.shippingCategory.toLowerCase().includes(q) ||
          t.legalBasis.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tariffs, serviceFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredTariffs.length / itemsPerPage));

  const paginatedTariffs = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredTariffs.slice(start, start + itemsPerPage);
  }, [filteredTariffs, page, itemsPerPage]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="font-bold text-rose-600 hover:text-rose-800"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Kurs USD Live Banner */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Kurs Referensi USD → IDR (Kapal Asing / Luar Negeri)
            </p>
            <div className="flex items-baseline gap-2.5 mt-0.5">
              <p className="text-xl font-extrabold text-[#0B241E] font-mono">
                {usdRate
                  ? `Rp ${Number(usdRate.rate).toLocaleString("id-ID")}`
                  : "Memuat kurs..."}
              </p>
              {usdRate && (
                <span className="text-[11px] text-[#64748B]">
                  Sumber: {usdRate.source} {usdRate.isFallback ? "(Fallback)" : "(Live)"}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchUsdRate(true)}
          disabled={isRateLoading}
          className="px-3.5 py-2 rounded-xl border border-[#CBD5E1] bg-white hover:bg-gray-50 text-xs font-bold text-[#0B241E] inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRateLoading ? "animate-spin" : ""}`} />
          <span>Perbarui Kurs USD</span>
        </button>
      </div>

      {/* Tabel Referensi Tarif Perda */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#F1F5F9] bg-[#FAFCFB] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="font-extrabold text-sm text-[#0B241E] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#D97706]" />
              <span>Referensi Master Tarif Retribusi Daerah ({filteredTariffs.length})</span>
            </h2>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Acuan resmi tarif jasa labuh, tambat, dan kegiatan TUKS/Tersus sesuai Perda Kab. Mimika No. 4/2023.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kode atau dasar hukum..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#0B241E]"
              />
            </div>

            <select
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#0B241E]"
            >
              <option value="">Semua Jenis Jasa</option>
              <option value="JASA_LABUH">Jasa Labuh</option>
              <option value="JASA_TAMBAT_UMUM">Jasa Tambat Umum</option>
              <option value="JASA_TAMBAT_KHUSUS">Jasa Tambat Khusus</option>
              <option value="KEGIATAN_TUKS_TERSUS">Kegiatan TUKS / Tersus</option>
            </select>

            <button
              type="button"
              onClick={() => fetchTariffs()}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-[#0B241E] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Segarkan</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-mono text-[11px] text-[#64748B] uppercase">
              <tr>
                <th className="p-3.5">Kode Tarif</th>
                <th className="p-3.5">Jenis Jasa</th>
                <th className="p-3.5">Kategori Pelayaran</th>
                <th className="p-3.5">Satuan</th>
                <th className="p-3.5">Besaran Tarif</th>
                <th className="p-3.5">Dasar Hukum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {isLoading && paginatedTariffs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#64748B]">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B241E]" />
                    Memuat referensi tarif Perda...
                  </td>
                </tr>
              ) : paginatedTariffs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#64748B]">
                    Tidak ada tarif yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedTariffs.map((t) => (
                  <tr key={t.id} className="hover:bg-[#F8FAFC]">
                    <td className="p-3.5 font-mono font-bold text-[#0B241E]">
                      {t.tariffCode}
                    </td>
                    <td className="p-3.5 font-semibold text-[#0B241E]">
                      {formatLabel(t.serviceCode)}
                    </td>
                    <td className="p-3.5 text-[#475569]">
                      {formatLabel(t.shippingCategory)}
                      {t.shipType ? ` • ${formatLabel(t.shipType)}` : ""}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[#475569]">
                      {formatLabel(t.unitType)}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-800">
                      {t.currency === "USD"
                        ? `$ ${Number(t.amount).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}`
                        : `Rp ${Number(t.amount).toLocaleString("id-ID")}`}
                    </td>
                    <td className="p-3.5 text-[11px] text-[#64748B] max-w-xs truncate">
                      {t.legalBasis}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filteredTariffs.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
          onItemsPerPageChange={(val) => {
            setItemsPerPage(val);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}
