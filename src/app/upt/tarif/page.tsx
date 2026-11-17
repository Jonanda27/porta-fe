"use client";

import React, { useEffect, useState } from "react";
import {
  Receipt,
  Plus,
  RefreshCw,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert,
  PowerOff,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useTariffStore } from "@/store/tariff.store";
import {
  ActivityMode,
  Currency,
  ServiceCode,
  ShipType,
  ShippingCategory,
  TariffUnitType,
} from "@/types/tariff.types";
import { BerthType } from "@/types/port.types";

export default function TarifPage() {
  const { user } = useAuthStore();
  const {
    tariffs,
    usdRate,
    isLoading,
    isRateLoading,
    isSubmitting,
    error,
    fetchTariffs,
    fetchUsdRate,
    createTariff,
    deactivateTariff,
    clearError,
  } = useTariffStore();

  const canAccess =
    user?.role === "SUPERADMIN" || user?.role === "ADMIN_PELABUHAN";

  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tariffCode, setTariffCode] = useState("");
  const [serviceCode, setServiceCode] = useState<ServiceCode>("JASA_TAMBAT_UMUM");
  const [shippingCategory, setShippingCategory] =
    useState<ShippingCategory>("DALAM_NEGERI");
  const [shipType, setShipType] = useState<ShipType | "">("");
  const [activityMode, setActivityMode] = useState<ActivityMode | "">("");
  const [berthType, setBerthType] = useState<BerthType | "">("");
  const [unitType, setUnitType] = useState<TariffUnitType>("GT_PER_ETMAL");
  const [currency, setCurrency] = useState<Currency>("IDR");
  const [amount, setAmount] = useState("");
  const [legalBasis, setLegalBasis] = useState(
    "Perda Kab. Mimika No. 4 Tahun 2023 Lampiran XI"
  );
  const [effectiveFrom, setEffectiveFrom] = useState(
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    if (canAccess) {
      fetchTariffs();
      fetchUsdRate(false);
    }
  }, [canAccess, fetchTariffs, fetchUsdRate]);

  if (!canAccess) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center">
        <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <h2 className="text-base font-bold text-[#0B241E]">Akses Terbatas</h2>
        <p className="text-xs text-[#64748B] mt-1">
          Pengaturan Master Tarif Perda hanya tersedia untuk Superadmin dan Admin Pelabuhan.
        </p>
      </div>
    );
  }

  const filteredTariffs = tariffs.filter((t) =>
    serviceFilter ? t.serviceCode === serviceFilter : true
  );

  const handleCreateTariff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    await createTariff({
      tariffCode: tariffCode.trim().toUpperCase(),
      serviceCode,
      shippingCategory,
      shipType: shipType || undefined,
      activityMode: activityMode || undefined,
      berthType: berthType || undefined,
      unitType,
      currency,
      amount: Number(amount),
      legalBasis: legalBasis.trim(),
      effectiveFrom: new Date(effectiveFrom).toISOString(),
    });
    setFeedback(`Tarif ${tariffCode.toUpperCase()} berhasil ditambahkan.`);
    setIsModalOpen(false);
  };

  const handleDeactivate = async (id: number, code: string) => {
    setFeedback(null);
    await deactivateTariff(id);
    setFeedback(`Tarif ${code} berhasil dinonaktifkan.`);
  };

  return (
    <div className="space-y-6">
      {/* Live USD Rate Banner + Toolbar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#0B241E] text-white rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#85A69B]">
              Kurs Live USD → IDR
            </p>
            <p className="text-xl font-extrabold text-white mt-1">
              {usdRate
                ? `Rp ${usdRate.rate.toLocaleString("id-ID")}`
                : "Memuat..."}
            </p>
            <p className="text-[11px] text-[#BED2CA] mt-1">
              {usdRate
                ? `Sumber: ${usdRate.source}${
                    usdRate.isFallback ? " (Fallback)" : ""
                  }`
                : "Mengambil kurs referensi"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchUsdRate(true)}
            disabled={isRateLoading}
            className="px-3 py-2 rounded-xl bg-[#143E33] hover:bg-[#1E5748] border border-[#1E5748] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5 text-[#D97706]" />
            <RefreshCw className={`w-3.5 h-3.5 ${isRateLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0B241E]"
            >
              <option value="">Semua Jenis Jasa</option>
              <option value="JASA_LABUH">JASA_LABUH</option>
              <option value="KEGIATAN_TUKS_TERSUS">KEGIATAN_TUKS_TERSUS</option>
              <option value="JASA_TAMBAT_UMUM">JASA_TAMBAT_UMUM</option>
              <option value="JASA_TAMBAT_KHUSUS">JASA_TAMBAT_KHUSUS</option>
            </select>
            <button
              type="button"
              onClick={() => fetchTariffs()}
              disabled={isLoading}
              className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Muat Ulang
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setTariffCode("");
              setAmount("");
              clearError();
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#D97706]" />
            Tambah Tarif Perda
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Active Tariffs Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0B241E]">
            <Receipt className="w-4 h-4 text-[#D97706]" />
            Matriks Tarif Aktif ({filteredTariffs.length})
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-[#64748B]">
                <th className="py-3 px-4">Kode Tarif</th>
                <th className="py-3 px-4">Jasa</th>
                <th className="py-3 px-4">Pelayaran & Kapal</th>
                <th className="py-3 px-4">Satuan</th>
                <th className="py-3 px-4">Nominal</th>
                <th className="py-3 px-4">Dasar Hukum</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#64748B]">
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Memuat matriks tarif...
                  </td>
                </tr>
              ) : filteredTariffs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#94A3B8]">
                    Belum ada tarif aktif untuk filter ini.
                  </td>
                </tr>
              ) : (
                filteredTariffs.map((t) => (
                  <tr key={t.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3 px-4 font-mono font-bold text-[#0B241E]">
                      {t.tariffCode}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#1E293B]">
                      {t.serviceCode}
                    </td>
                    <td className="py-3 px-4 text-[#475569]">
                      <div>{t.shippingCategory}</div>
                      <div className="text-[10px] text-[#94A3B8]">
                        {[t.shipType, t.activityMode, t.berthType]
                          .filter(Boolean)
                          .join(" • ") || "Umum"}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#475569]">
                      {t.unitType}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#0B241E]">
                      {t.currency === "USD"
                        ? `$ ${Number(t.amount).toLocaleString("en-US")}`
                        : `Rp ${Number(t.amount).toLocaleString("id-ID")}`}
                    </td>
                    <td className="py-3 px-4 text-[#64748B] max-w-xs truncate">
                      {t.legalBasis}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleDeactivate(t.id, t.tariffCode)}
                        className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <PowerOff className="w-3 h-3" />
                        Nonaktifkan
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Tariff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTariff}
            className="bg-white rounded-2xl border border-[#E2E8F0] w-full max-w-lg p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-base font-extrabold text-[#0B241E]">
              Tambah Tarif Perda Baru
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Kode Tarif
                </label>
                <input
                  type="text"
                  required
                  value={tariffCode}
                  onChange={(e) => setTariffCode(e.target.value)}
                  placeholder="TAMBAT_UMUM_DN_2027"
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Jenis Jasa
                </label>
                <select
                  value={serviceCode}
                  onChange={(e) => setServiceCode(e.target.value as ServiceCode)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                >
                  <option value="JASA_LABUH">JASA_LABUH</option>
                  <option value="KEGIATAN_TUKS_TERSUS">
                    KEGIATAN_TUKS_TERSUS
                  </option>
                  <option value="JASA_TAMBAT_UMUM">JASA_TAMBAT_UMUM</option>
                  <option value="JASA_TAMBAT_KHUSUS">JASA_TAMBAT_KHUSUS</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Kategori Pelayaran
                </label>
                <select
                  value={shippingCategory}
                  onChange={(e) =>
                    setShippingCategory(e.target.value as ShippingCategory)
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                >
                  <option value="DALAM_NEGERI">DALAM_NEGERI</option>
                  <option value="LUAR_NEGERI">LUAR_NEGERI</option>
                  <option value="PELRA_PERINTIS">PELRA_PERINTIS</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Satuan Hitung
                </label>
                <select
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value as TariffUnitType)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                >
                  <option value="GT_PER_ETMAL">GT_PER_ETMAL</option>
                  <option value="GT_PER_15_DAYS">GT_PER_15_DAYS</option>
                  <option value="GT_PER_MONTH">GT_PER_MONTH</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Jenis Kapal (Opsional)
                </label>
                <select
                  value={shipType}
                  onChange={(e) => setShipType(e.target.value as ShipType | "")}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                >
                  <option value="">Semua</option>
                  <option value="NIAGA">NIAGA</option>
                  <option value="NON_NIAGA">NON_NIAGA</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Mode Aktivitas
                </label>
                <select
                  value={activityMode}
                  onChange={(e) =>
                    setActivityMode(e.target.value as ActivityMode | "")
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                >
                  <option value="">Semua</option>
                  <option value="NORMAL">NORMAL</option>
                  <option value="FIXED_ACTIVITY">FIXED_ACTIVITY</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Tipe Dermaga
                </label>
                <select
                  value={berthType}
                  onChange={(e) => setBerthType(e.target.value as BerthType | "")}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                >
                  <option value="">Semua</option>
                  <option value="DERMAGA_BESI_BETON_KAYU">
                    Besi / Beton / Kayu
                  </option>
                  <option value="BRESSING_DOLPHIN_PELAMPUNG">
                    Bressing / Dolphin
                  </option>
                  <option value="PINGGIRAN_TALUD">Pinggiran / Talud</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Mata Uang
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                >
                  <option value="IDR">IDR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Nominal Tarif
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Berlaku Mulai
                </label>
                <input
                  type="date"
                  required
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Dasar Hukum
              </label>
              <input
                type="text"
                required
                value={legalBasis}
                onChange={(e) => setLegalBasis(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-[#0B241E] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Simpan Tarif
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
