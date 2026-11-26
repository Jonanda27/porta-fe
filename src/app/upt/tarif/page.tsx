"use client";

import React, { useEffect, useState } from "react";
import {
  Receipt,
  Plus,
  RefreshCw,
  DollarSign,
  AlertCircle,
  Loader2,
  ShieldAlert,
  PowerOff,
  Search,
} from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";
import { useAuthStore } from "@/store/auth.store";
import { useTariffStore } from "@/store/tariff.store";
import { usePaymentStore } from "@/store/payment.store";
import { toast } from "@/store/toast.store";
import { formatLabel } from "@/lib/format-labels";
import { PaymentProviderType } from "@/types/payment.types";
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
    user?.role === "SUPERADMIN" ||
    user?.role === "KEPALA_PELABUHAN" ||
    user?.role === "ADMIN_PELABUHAN" ||
    user?.role === "BENDAHARA";
  const isSuperadmin = user?.role === "SUPERADMIN";
  const {
    config: paymentConfig,
    isUpdating: isPaymentUpdating,
    fetchConfig: fetchPaymentConfig,
    updateConfig: updatePaymentConfig,
  } = usePaymentStore();

  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [searchTariffQuery, setSearchTariffQuery] = useState("");
  const [tariffPage, setTariffPage] = useState(1);
  const [tariffItemsPerPage, setTariffItemsPerPage] = useState(10);

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
      if (isSuperadmin) fetchPaymentConfig();
    }
  }, [canAccess, isSuperadmin, fetchTariffs, fetchUsdRate, fetchPaymentConfig]);

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

  const filteredTariffs = tariffs.filter((t) => {
    const matchService = serviceFilter ? t.serviceCode === serviceFilter : true;
    const matchSearch =
      !searchTariffQuery ||
      t.tariffCode.toLowerCase().includes(searchTariffQuery.toLowerCase()) ||
      t.serviceCode.toLowerCase().includes(searchTariffQuery.toLowerCase()) ||
      (t.legalBasis && t.legalBasis.toLowerCase().includes(searchTariffQuery.toLowerCase()));
    return matchService && matchSearch;
  });

  const totalTariffPages = Math.ceil(filteredTariffs.length / tariffItemsPerPage) || 1;
  const pagedTariffs = filteredTariffs.slice(
    (tariffPage - 1) * tariffItemsPerPage,
    tariffPage * tariffItemsPerPage
  );

  const handleCreateTariff = async (e: React.FormEvent) => {
    e.preventDefault();
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
    toast.success("Tarif Ditambahkan", `Tarif ${tariffCode.toUpperCase()} berhasil ditambahkan.`);
    setIsModalOpen(false);
  };

  const handleDeactivate = async (id: number, code: string) => {
    await deactivateTariff(id);
    toast.success("Tarif Dinonaktifkan", `Tarif ${code} berhasil dinonaktifkan.`);
  };

  return (
    <div className="space-y-6">
      {/* Live USD Rate Banner + Toolbar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#0B241E] text-white rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-medium text-[#85A69B]">
              Kurs USD Hari Ini
            </p>
            <p className="text-xl font-bold text-white mt-1">
              {usdRate
                ? `Rp ${usdRate.rate.toLocaleString("id-ID")}`
                : "Memuat..."}
            </p>
            <p className="text-[11px] text-[#BED2CA] mt-1">
              {usdRate ? "Nilai tukar acuan kapal luar negeri" : "Mengambil kurs..."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchUsdRate(true)}
            disabled={isRateLoading}
            className="px-3 py-2 rounded-xl bg-[#143E33] hover:bg-[#1E5748] border border-[#1E5748] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5 text-[#D97706]" />
            <RefreshCw className={`w-3.5 h-3.5 ${isRateLoading ? "animate-spin" : ""}`} />
            Perbarui
          </button>
        </div>

        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0B241E]"
            >
              <option value="">Semua Layanan</option>
              <option value="JASA_LABUH">Jasa Labuh</option>
              <option value="KEGIATAN_TUKS_TERSUS">Kegiatan TUKS</option>
              <option value="JASA_TAMBAT_UMUM">Jasa Tambat Umum</option>
              <option value="JASA_TAMBAT_KHUSUS">Jasa Tambat Khusus</option>
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

          {isSuperadmin && (
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
              Tambah Tarif
            </button>
          )}
        </div>
      </div>

      {/* Payment Gateway Feature Flag Switch (SUPERADMIN Only) */}
      {isSuperadmin && paymentConfig && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
          <div>
            <p className="text-xs font-extrabold text-[#0B241E]">
              Pengaturan Kanal Pembayaran Online (Midtrans / Bank Papua)
            </p>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Aktifkan atau sembunyikan tombol pembayaran online di portal Tenant & Operator kapan saja.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              disabled={isPaymentUpdating}
              value={paymentConfig.provider}
              onChange={async (e) => {
                const nextProvider = e.target.value as PaymentProviderType;
                await updatePaymentConfig({
                  gatewayEnabled: paymentConfig.gatewayEnabled,
                  provider: nextProvider,
                });
                toast.success("Provider Diubah", `Provider pembayaran diubah ke ${nextProvider}.`);
              }}
              className="px-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0B241E]"
            >
              <option value="MIDTRANS">MIDTRANS (VA / QRIS / e-Wallet)</option>
              <option value="BANK_PAPUA">BANK_PAPUA (RKUD Langsung)</option>
              <option value="MANUAL">MANUAL (Loket Bendahara)</option>
            </select>
            <button
              type="button"
              disabled={isPaymentUpdating}
              onClick={async () => {
                const nextState = !paymentConfig.gatewayEnabled;
                await updatePaymentConfig({
                  gatewayEnabled: nextState,
                  provider: paymentConfig.provider,
                });
                toast.success(
                  nextState ? "Pembayaran Online Diaktifkan" : "Pembayaran Online Disembunyikan",
                  nextState
                    ? "Pembayaran online diaktifkan (tampil di portal)."
                    : "Pembayaran online disembunyikan (hanya transfer Bank Papua / Bendahara)."
                );
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${paymentConfig.gatewayEnabled
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                }`}
            >
              {paymentConfig.gatewayEnabled ? "Status: AKTIF (Tampil)" : "Status: DISEMBUNYIKAN"}
            </button>
          </div>
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
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0B241E]">
            <Receipt className="w-4 h-4 text-[#D97706]" />
            Daftar Tarif Layanan ({filteredTariffs.length})
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTariffQuery}
              onChange={(e) => {
                setSearchTariffQuery(e.target.value);
                setTariffPage(1);
              }}
              placeholder="Cari kode tarif, layanan, dasar hukum..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#CBD5E1] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#133D31]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] bg-white">
                <th className="py-3.5 px-4">Kode</th>
                <th className="py-3.5 px-4">Layanan</th>
                <th className="py-3.5 px-4">Kategori Pelayaran</th>
                <th className="py-3.5 px-4">Satuan</th>
                <th className="py-3.5 px-4">Tarif</th>
                <th className="py-3.5 px-4">Keterangan</th>
                {isSuperadmin && <th className="py-3.5 px-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={isSuperadmin ? 7 : 6} className="py-10 text-center text-[#64748B]">
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Memuat daftar tarif...
                  </td>
                </tr>
              ) : pagedTariffs.length === 0 ? (
                <tr>
                  <td colSpan={isSuperadmin ? 7 : 6} className="py-10 text-center text-[#94A3B8]">
                    Belum ada tarif untuk pilihan ini.
                  </td>
                </tr>
              ) : (
                pagedTariffs.map((t) => (
                  <tr key={t.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-[#0B241E]">
                      {t.tariffCode}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#1E293B]">
                      {formatLabel(t.serviceCode)}
                    </td>
                    <td className="py-3.5 px-4 text-[#475569]">
                      <div className="font-semibold text-[#0B241E]">
                        {formatLabel(t.shippingCategory)}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        {[t.shipType, t.activityMode, t.berthType]
                          .filter(Boolean)
                          .map((item) => formatLabel(item))
                          .join(" • ") || "Umum"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#475569]">
                      {formatLabel(t.unitType)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#0B241E]">
                      {t.currency === "USD"
                        ? `$ ${Number(t.amount).toLocaleString("en-US")}`
                        : `Rp ${Number(t.amount).toLocaleString("id-ID")}`}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B] max-w-xs truncate">
                      {t.legalBasis}
                    </td>
                    {isSuperadmin && (
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleDeactivate(t.id, t.tariffCode)}
                          className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <PowerOff className="w-3 h-3" />
                          Nonaktifkan
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={tariffPage}
          totalPages={totalTariffPages}
          totalItems={filteredTariffs.length}
          itemsPerPage={tariffItemsPerPage}
          onPageChange={setTariffPage}
          onItemsPerPageChange={setTariffItemsPerPage}
        />
      </div>

      {/* Create Tariff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTariff}
            className="bg-white rounded-3xl border border-[#E2E8F0] w-full max-w-2xl p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div>
              <h3 className="text-base font-extrabold text-[#0B241E]">
                Tambah Tarif Perda Baru
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Konfigurasi tarif resmi berdasarkan Perda Kabupaten Mimika No. 4 Tahun 2023.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Kode Tarif
                </label>
                <input
                  type="text"
                  required
                  value={tariffCode}
                  onChange={(e) => setTariffCode(e.target.value)}
                  placeholder="TAMBAT_UMUM_DN_2027"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Jenis Jasa Kepelabuhanan
                </label>
                <select
                  value={serviceCode}
                  onChange={(e) => setServiceCode(e.target.value as ServiceCode)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
                >
                  <option value="JASA_LABUH">Jasa Labuh Kapal</option>
                  <option value="KEGIATAN_TUKS_TERSUS">Kegiatan TUKS / Tersus</option>
                  <option value="JASA_TAMBAT_UMUM">Jasa Tambat Dermaga Umum</option>
                  <option value="JASA_TAMBAT_KHUSUS">Jasa Tambat Khusus</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Kategori Pelayaran
                </label>
                <select
                  value={shippingCategory}
                  onChange={(e) =>
                    setShippingCategory(e.target.value as ShippingCategory)
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
                >
                  <option value="DALAM_NEGERI">Pelayaran Dalam Negeri</option>
                  <option value="LUAR_NEGERI">Pelayaran Luar Negeri</option>
                  <option value="PELRA_PERINTIS">Pelayaran Rakyat / Perintis</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Satuan Perhitungan
                </label>
                <select
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value as TariffUnitType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold"
                >
                  <option value="GT_PER_ETMAL">GT / Etmal (24 Jam)</option>
                  <option value="GT_PER_15_DAYS">GT / 15 Hari</option>
                  <option value="GT_PER_MONTH">GT / 30 Hari (Bulan)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Jenis Kapal (Opsional)
                </label>
                <select
                  value={shipType}
                  onChange={(e) => setShipType(e.target.value as ShipType | "")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                >
                  <option value="">Semua Jenis Kapal</option>
                  <option value="NIAGA">Kapal Niaga</option>
                  <option value="NON_NIAGA">Kapal Non-Niaga</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Mode Aktivitas
                </label>
                <select
                  value={activityMode}
                  onChange={(e) =>
                    setActivityMode(e.target.value as ActivityMode | "")
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                >
                  <option value="">Semua Aktivitas</option>
                  <option value="NORMAL">Kunjungan Normal</option>
                  <option value="FIXED_ACTIVITY">Kegiatan Tetap</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Tipe Konstruksi Dermaga
                </label>
                <select
                  value={berthType}
                  onChange={(e) => setBerthType(e.target.value as BerthType | "")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs"
                >
                  <option value="">Semua Konstruksi</option>
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
