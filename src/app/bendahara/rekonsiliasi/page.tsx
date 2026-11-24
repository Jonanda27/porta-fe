"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Coins,
  Receipt,
  Landmark,
  CheckCircle2,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  Clock,
  Ticket,
  Ship,
  AlertTriangle,
  X,
  Plus,
  MapPin,
  Lock,
  Users,
  Download,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useBillingStore } from "@/store/billing.store";
import { formatRupiah } from "@/lib/kapal-billing";
import { toast } from "@/store/toast.store";
import { buildPasal95MonthlyReportCsv } from "@/lib/perbup-25-2024";
import {
  CloseGateHandoverPayload,
  CreateGateTicketBookPayload,
  GateHandoverItem,
} from "@/types/field-ops.types";
import {
  CreateTicketBookModal,
  HandoverCloseFormState,
  HandoverCloseModal,
} from "@/components/bendahara/rekonsiliasi/RekonsiliasiModals";

export default function BendaharaRekonsiliasiPage() {
  const { user } = useAuthStore();
  const {
    revenueSummary,
    invoices,
    ticketBooks,
    ferryRoutes,
    handovers,
    manifests,
    isLoading,
    fetchRevenueSummary,
    fetchInvoices,
    fetchTicketBooks,
    createTicketBook,
    fetchFerryRoutes,
    fetchHandovers,
    fetchManifests,
    closeHandover,
  } = useBillingStore();

  const [activeTab, setActiveTab] = useState<"BKU" | "HANDOVERS" | "BOOKS" | "MANIFESTS">("BKU");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isClosingBook, setIsClosingBook] = useState<boolean>(false);

  // Modal State for Creating New Ticket Book (POST /gate-ticketing/books)
  const [isCreateBookOpen, setIsCreateBookOpen] = useState<boolean>(false);
  const [isSavingBook, setIsSavingBook] = useState<boolean>(false);
  const [bookFormError, setBookFormError] = useState<string | null>(null);
  const [newBookForm, setNewBookForm] = useState<CreateGateTicketBookPayload>({
    portId: Number(user?.portId || 1),
    bookCode: `KRC-PMK-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
    ticketCategory: "PAS_ORANG_DEWASA",
    serialStart: 1,
    serialEnd: 100,
    nominalPerTicket: 5000,
    porporasiNumber: "",
    porporasiDate: new Date().toISOString().split("T")[0],
    legalBasis: "Perda Kab. Mimika No. 4 Tahun 2023",
  });

  // Modal State for Settling/Closing Handover
  const [selectedHandoverForClose, setSelectedHandoverForClose] =
    useState<GateHandoverItem | null>(null);
  const [closeForm, setCloseForm] = useState<HandoverCloseFormState>({
    lastReturnedSerial: 0,
    actualCashSettledIdr: 0,
    notes: "",
  });
  const [isSubmittingClose, setIsSubmittingClose] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchRevenueSummary();
    fetchInvoices();
    fetchTicketBooks();
    fetchFerryRoutes();
    fetchHandovers();
    fetchManifests();
  }, [
    fetchRevenueSummary,
    fetchInvoices,
    fetchTicketBooks,
    fetchFerryRoutes,
    fetchHandovers,
    fetchManifests,
  ]);

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookFormError(null);
    setIsSavingBook(true);
    try {
      await createTicketBook({
        ...newBookForm,
        portId: Number(user?.portId || newBookForm.portId || 1),
        serialStart: Number(newBookForm.serialStart),
        serialEnd: Number(newBookForm.serialEnd),
        nominalPerTicket: Number(newBookForm.nominalPerTicket),
        porporasiNumber: newBookForm.porporasiNumber?.trim() || undefined,
      });
      setIsCreateBookOpen(false);
      toast.success(
        "Buku Karcis Diterbitkan",
        `Buku karcis ${newBookForm.bookCode} berhasil diterbitkan ke inventaris!`
      );
    } catch (err: unknown) {
      setBookFormError(
        err instanceof Error ? err.message : "Gagal menerbitkan buku karcis baru."
      );
    } finally {
      setIsSavingBook(false);
    }
  };


  const totalVerifiedPAD = revenueSummary?.totalVerifiedRevenueIdr ?? 0;
  const vesselTotal = revenueSummary?.vesselRevenueIdr ?? 0;
  const gateTotal = revenueSummary?.gateTicketingRevenueIdr ?? 0;
  const assetTotal = revenueSummary?.assetLeaseRevenueIdr ?? 0;
  const cargoTotal = revenueSummary?.cargoEquipmentRevenueIdr ?? 0;
  const utilityTotal = revenueSummary?.utilityRevenueIdr ?? 0;

  // Daftar transaksi lunas pada e-SKRD untuk buku kas
  const paidTransactions = useMemo(() => {
    return invoices.filter((inv) => inv.status === "PAID" || inv.ssrdNumber);
  }, [invoices]);

  // Filter Handovers
  const filteredHandovers = handovers.filter((h) => {
    const matchesSearch =
      h.wardenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.book?.bookCode || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.book?.ticketCategory || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Filter Ticket Books
  const filteredBooks = ticketBooks.filter((b) => {
    const matchesSearch =
      b.bookCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.ticketCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.porporasiNumber || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Filter Manifests
  const filteredManifests = manifests.filter((m) => {
    const matchesSearch =
      m.manifestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.visit?.vessel?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.ferryRoute?.destinationName || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleCloseDailyBook = () => {
    setIsClosingBook(true);
    setTimeout(() => {
      setIsClosingBook(false);
      toast.success(
        "BKU Ditutup & Disahkan",
        `Buku Kas Umum (BKU) Penerimaan Tanggal ${selectedDate} berhasil ditutup dan disahkan ke Kasda!`
      );
    }, 1000);
  };

  // Open Handover Modal
  const handleOpenCloseHandoverModal = (handover: GateHandoverItem) => {
    setSelectedHandoverForClose(handover);
    const nominal = Number(handover.book?.nominalPerTicket || 0);
    // Default: sisa tiket dikembalikan dimulai dari nomor setelah serial awal
    const defaultLastReturned = handover.dispatchedSerialStart;
    setCloseForm({
      lastReturnedSerial: defaultLastReturned,
      actualCashSettledIdr: 0,
      notes: "Rekonsiliasi serah terima shift loket gerbang pelabuhan",
    });
    setActionSuccessMsg(null);
    setActionErrorMsg(null);
  };

  // Calculated values in modal
  const modalCalculations = useMemo(() => {
    if (!selectedHandoverForClose) {
      return { soldQty: 0, expectedAmount: 0, diff: 0 };
    }
    const start = selectedHandoverForClose.dispatchedSerialStart;
    const nominal = Number(selectedHandoverForClose.book?.nominalPerTicket || 0);
    const lastReturned = Number(closeForm.lastReturnedSerial);
    const soldQty = Math.max(0, lastReturned - start);
    const expectedAmount = soldQty * nominal;
    const diff = Number(closeForm.actualCashSettledIdr) - expectedAmount;
    return { soldQty, expectedAmount, diff };
  }, [selectedHandoverForClose, closeForm]);

  // Submit Handover Close
  const handleSaveCloseHandover = async () => {
    if (!selectedHandoverForClose) return;

    if (modalCalculations.diff !== 0) {
      setActionErrorMsg(
        `Prinsip Zero Discrepancy: Uang setoran fisik (Rp ${Number(
          closeForm.actualCashSettledIdr
        ).toLocaleString("id-ID")}) harus sama persis dengan kalkulasi penjualan karcis (Rp ${modalCalculations.expectedAmount.toLocaleString(
          "id-ID"
        )}). Selisih: Rp ${modalCalculations.diff.toLocaleString("id-ID")}.`
      );
      return;
    }

    setIsSubmittingClose(true);
    setActionErrorMsg(null);
    try {
      const payload: CloseGateHandoverPayload = {
        lastReturnedSerial: Number(closeForm.lastReturnedSerial),
        actualCashSettledIdr: Number(closeForm.actualCashSettledIdr),
        notes: closeForm.notes,
      };

      await closeHandover(selectedHandoverForClose.id, payload);
      setActionSuccessMsg(
        `Sesi serah terima ${selectedHandoverForClose.wardenName} (${selectedHandoverForClose.book?.bookCode}) berhasil diselesaikan dan disahkan ke Kasda!`
      );
      setTimeout(() => {
        setSelectedHandoverForClose(null);
      }, 1500);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menyelesaikan serah terima kasir.";
      setActionErrorMsg(msg);
    } finally {
      setIsSubmittingClose(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Rekonsiliasi & Tab Switcher */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-extrabold text-[#0B241E] flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#D97706]" />
            <span>Rekonsiliasi Buku Kas Umum & Setoran Loket Gerbang</span>
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
            onClick={() => {
              setActiveTab("BKU");
              setSearchQuery("");
            }}
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
            onClick={() => {
              setActiveTab("HANDOVERS");
              setSearchQuery("");
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "HANDOVERS"
                ? "bg-[#0B241E] text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Serah Terima Kasir ({handovers.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("BOOKS");
              setSearchQuery("");
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "BOOKS"
                ? "bg-[#0B241E] text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Ticket className="w-3.5 h-3.5 text-amber-500" />
            Buku Karcis ({ticketBooks.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("MANIFESTS");
              setSearchQuery("");
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "MANIFESTS"
                ? "bg-[#0B241E] text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Ship className="w-3.5 h-3.5 text-blue-500" />
            Manifes Ferry ({manifests.length})
          </button>
          <button
            type="button"
            onClick={() => {
              const monthLabel = new Date(selectedDate).toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
              });
              const csv = buildPasal95MonthlyReportCsv({
                monthLabel,
                invoices,
                ticketBooks,
              });
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `Laporan-Pasal95-Retribusi-${selectedDate.slice(0, 7)}.csv`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
              toast.success(
                "Laporan Pasal 95 Diunduh",
                `Laporan realisasi bulanan (${monthLabel}) siap disampaikan ke Bupati via Bapenda & Inspektorat (maks. tgl 5 bulan berikutnya).`
              );
            }}
            title="Unduh Laporan Realisasi Bulanan sesuai Pasal 95 Perbup Mimika 25/2024 (batas lapor tanggal 5 bulan berikutnya)"
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-[#D97706]" />
            Laporan Pasal 95 (CSV)
          </button>
        </div>
      </div>

      {/* 2. Kartu Status Rekonsiliasi Tiga Arah */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pos 1: Kas Loket & Pas Gerbang */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#64748B] uppercase">
              1. Kas Loket & Pas Gerbang
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-xl font-black text-[#0B241E]">
            {formatRupiah(gateTotal)}
          </p>
          <p className="text-[11px] text-[#64748B]">
            Uang fisik tiket gerbang & pas pelabuhan
          </p>
          <div className="pt-2 border-t border-[#F1F5F9] text-[10px] font-mono text-emerald-700 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              {handovers.filter((h) => h.status === "SETTLED").length} Sesi Terbuku Kasda
            </span>
          </div>
        </div>

        {/* Pos 2: Transfer Bank RKUD (e-SKRD/e-SSRD) */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#64748B] uppercase">
              2. Transfer Bank Papua (RKUD)
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <p className="text-xl font-black text-blue-900">
            {formatRupiah(vesselTotal)}
          </p>
          <p className="text-[11px] text-[#64748B]">
            Retribusi jasa tambat & labuh kapal
          </p>
          <div className="pt-2 border-t border-[#F1F5F9] text-[10px] font-mono text-blue-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Host-to-Host Mutasi Sah</span>
          </div>
        </div>

        {/* Pos 3: Penerimaan Lain (Tenant, Kargo, Air) */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#64748B] uppercase">
              3. Tenant, Kargo & Utilitas
            </span>
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          </div>
          <p className="text-xl font-black text-purple-900">
            {formatRupiah(assetTotal + cargoTotal + utilityTotal)}
          </p>
          <p className="text-[11px] text-[#64748B]">
            Sewa kios, pemakaian alat, & air tawar
          </p>
          <div className="pt-2 border-t border-[#F1F5F9] text-[10px] font-mono text-purple-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Penerimaan Sah Kasda</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. TAB 1: BUKU KAS UMUM (BKU) PENERIMAAN                   */}
      {/* ========================================================= */}
      {activeTab === "BKU" && (
        <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#F1F5F9] bg-[#FAFCFB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="font-extrabold text-sm text-[#0B241E]">
                Buku Kas Umum (BKU) Penerimaan — Pelabuhan Poumako
              </h3>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Format Standar Permendagri & Perbup Mimika 25/2024 tentang Tata Cara Penatausahaan Kasda.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="p-1.5 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0B241E]"
              />
              <button
                type="button"
                onClick={handleCloseDailyBook}
                disabled={isClosingBook}
                className="px-3 py-1.5 bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5 text-[#D97706]" />
                <span>{isClosingBook ? "Menutup..." : "Tutup Kas"}</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  alert(
                    `Mencetak Berita Acara Rekonsiliasi & BKU:\nTanggal: ${selectedDate}\nTotal Penerimaan: ${formatRupiah(
                      totalVerifiedPAD
                    )}\nStatus: DITUTUP SAH`
                  )
                }
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Cetak BKU</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-mono text-[11px] text-[#64748B] uppercase">
                <tr>
                  <th className="p-3.5">Tanggal / No. BKU</th>
                  <th className="p-3.5">Uraian Transaksi</th>
                  <th className="p-3.5">Kode Rekening PAD</th>
                  <th className="p-3.5">Penerimaan (Debet)</th>
                  <th className="p-3.5">Penyetoran ke RKUD (Kredit)</th>
                  <th className="p-3.5">Status Validasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {paidTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#64748B]">
                      Belum ada transaksi penerimaan pada tanggal yang dipilih.
                    </td>
                  </tr>
                ) : (
                  paidTransactions.map((tx, idx) => (
                    <tr key={tx.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="p-3.5 font-mono">
                        <div className="font-bold text-[#0B241E]">
                          {new Date(tx.updatedAt || tx.issuedAt).toLocaleDateString("id-ID")}
                        </div>
                        <div className="text-[10px] text-[#64748B]">
                          BKU-{(idx + 1).toString().padStart(4, "0")}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-[#0B241E]">
                          Penerimaan e-SKRD {tx.invoiceNumber}
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          Kapal: {tx.visit?.vessel?.name} ({tx.visit?.vessel?.grossTonnage} GT)
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-[#64748B]">
                        4.1.02.02.01 (Retribusi Jasa Pelabuhan)
                      </td>
                      <td className="p-3.5 font-bold text-emerald-800 font-mono">
                        {formatRupiah(tx.totalAmountIdr)}
                      </td>
                      <td className="p-3.5 font-bold text-blue-800 font-mono">
                        {formatRupiah(tx.totalAmountIdr)}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Rekonsiliasi Sah</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-[#F8FAFC] border-t-2 border-[#CBD5E1] font-bold text-xs">
                <tr>
                  <td colSpan={3} className="p-3.5 text-right font-black uppercase text-[#0B241E]">
                    Total Penerimaan & Penyetoran Kasda (RKUD):
                  </td>
                  <td className="p-3.5 text-emerald-900 font-black text-sm font-mono">
                    {formatRupiah(totalVerifiedPAD)}
                  </td>
                  <td className="p-3.5 text-blue-900 font-black text-sm font-mono">
                    {formatRupiah(totalVerifiedPAD)}
                  </td>
                  <td className="p-3.5 text-emerald-700 font-mono text-[11px]">
                    Nihil Selisih (0)
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. TAB 2: SERAH TERIMA KASIR LOKET GERBANG (HANDOVERS)    */}
      {/* ========================================================= */}
      {activeTab === "HANDOVERS" && (
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0B241E]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-mono text-[11px] text-[#64748B] uppercase">
                <tr>
                  <th className="p-3.5">Petugas Juru Gerbang</th>
                  <th className="p-3.5">Buku Karcis & Kategori</th>
                  <th className="p-3.5">Rentang Seri Shift</th>
                  <th className="p-3.5">Karcis Terjual</th>
                  <th className="p-3.5">Target Setoran</th>
                  <th className="p-3.5">Uang Fisik Diterima</th>
                  <th className="p-3.5">Status Handover</th>
                  <th className="p-3.5 text-center">Aksi Bendahara</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredHandovers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-[#64748B]">
                      Belum ada sesi serah terima loket yang tercatat.
                    </td>
                  </tr>
                ) : (
                  filteredHandovers.map((h) => {
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
                            Mulai: {new Date(h.dispatchTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIT
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-semibold text-gray-900 font-mono">
                            {h.book?.bookCode || "KRC-00"}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {h.book?.ticketCategory.replace(/_/g, " ")} (Rp {nominal.toLocaleString("id-ID")})
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
                              onClick={() => handleOpenCloseHandoverModal(h)}
                              className="px-3 py-1.5 bg-[#0B241E] hover:bg-[#143E33] text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer mx-auto"
                            >
                              <Coins className="w-3.5 h-3.5 text-[#D97706]" />
                              <span>Validasi Setoran</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-mono">
                              {h.settleTime
                                ? new Date(h.settleTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
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
      )}

      {/* ========================================================= */}
      {/* 5. TAB 3: INVENTARIS BUKU KARCIS (TICKET BOOKS)           */}
      {/* ========================================================= */}
      {activeTab === "BOOKS" && (
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0B241E]"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setBookFormError(null);
                  setIsCreateBookOpen(true);
                }}
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
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#64748B]">
                      Belum ada data buku karcis yang terdaftar.
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((b) => (
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
      )}

      {/* ========================================================= */}
      {/* 6. TAB 4: AUDIT MANIFES PENYEBERANGAN (MANIFESTS)          */}
      {/* ========================================================= */}
      {activeTab === "MANIFESTS" && (
        <div className="space-y-5">
        <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#F1F5F9] bg-[#FAFCFB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="font-extrabold text-sm text-[#0B241E]">
                Rekonsiliasi Manifes Penumpang & Kendaraan Kapal Ferry
              </h3>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Pencocokan kuota manifes keberangkatan kapal penyeberangan dengan penerimaan retribusi jasa terminal pelabuhan.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari manifes, kapal, atau rute..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0B241E]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-mono text-[11px] text-[#64748B] uppercase">
                <tr>
                  <th className="p-3.5">Nomor Manifes & Tanggal</th>
                  <th className="p-3.5">Armada Kapal Ferry</th>
                  <th className="p-3.5">Rute Penyeberangan</th>
                  <th className="p-3.5">Jumlah Penumpang</th>
                  <th className="p-3.5">Kendaraan & Kargo</th>
                  <th className="p-3.5">Retribusi Terminal (PAD)</th>
                  <th className="p-3.5">Kelas Terminal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredManifests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#64748B]">
                      Belum ada data manifes kapal penyeberangan yang tercatat.
                    </td>
                  </tr>
                ) : (
                  filteredManifests.map((m) => (
                    <tr key={m.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-[#0B241E] flex items-center gap-1.5">
                          <Ship className="w-3.5 h-3.5 text-blue-600" />
                          {m.manifestNumber}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(m.createdAt).toLocaleDateString("id-ID")}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-gray-900">
                          {m.visit?.vessel?.name || "KMP. Poumako Ferry"}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          {m.visit?.visitNumber || "VIST-REG"}
                        </div>
                      </td>

                      <td className="p-3.5 font-medium text-gray-800">
                        {m.ferryRoute?.destinationName || "Poumako - Agats (PP)"}
                      </td>

                      <td className="p-3.5 text-gray-800">
                        <div>Dewasa: <span className="font-bold">{m.adultCount}</span> Org</div>
                        <div className="text-[11px] text-gray-500">
                          Anak: {m.childCount} | Pengantar: {m.greeterCount}
                        </div>
                      </td>

                      <td className="p-3.5 text-gray-800">
                        <div>Kendaraan: <span className="font-bold">{m.vehicleCount}</span> Unit</div>
                        <div className="text-[11px] text-gray-500">Kargo: {Number(m.cargoTons)} Ton</div>
                      </td>

                      <td className="p-3.5 font-mono font-black text-emerald-800 text-sm">
                        Rp {Number(m.terminalFeeIdr).toLocaleString("id-ID")}
                      </td>

                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          {m.terminalClass.replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rute Penyeberangan Resmi (GET /gate-ticketing/ferry-routes) */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#F1F5F9] bg-[#FAFCFB] flex items-center justify-between text-xs">
            <div>
              <h3 className="font-extrabold text-sm text-[#0B241E] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D97706]" />
                <span>Daftar Rute Penyeberangan &amp; Tarif Penumpang ({ferryRoutes.length})</span>
              </h3>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Referensi jarak mil laut dan tarif resmi penumpang dewasa/anak sesuai Perda Kab. Mimika No. 4/2023.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-mono text-[11px] text-[#64748B] uppercase">
                <tr>
                  <th className="p-3.5">Tujuan Penyeberangan</th>
                  <th className="p-3.5">Jarak Tempuh</th>
                  <th className="p-3.5">Tarif Penumpang Dewasa</th>
                  <th className="p-3.5">Tarif Penumpang Anak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {ferryRoutes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-[#64748B]">
                      Belum ada rute penyeberangan terdaftar.
                    </td>
                  </tr>
                ) : (
                  ferryRoutes.map((r) => (
                    <tr key={r.id} className="hover:bg-[#F8FAFC]">
                      <td className="p-3.5 font-bold text-[#0B241E]">{r.destinationName}</td>
                      <td className="p-3.5 font-mono text-[#475569]">{r.distanceMiles} Mil Laut</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-800">
                        Rp {Number(r.adultFareIdr).toLocaleString("id-ID")}
                      </td>
                      <td className="p-3.5 font-mono font-semibold text-[#0B241E]">
                        Rp {Number(r.childFareIdr).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}

      {/* 7. MODAL: VALIDASI & TUTUP SERAH TERIMA KASIR LOKET */}
      <HandoverCloseModal
        handover={selectedHandoverForClose}
        closeForm={closeForm}
        onChangeCloseForm={setCloseForm}
        modalCalculations={modalCalculations}
        actionSuccessMsg={actionSuccessMsg}
        actionErrorMsg={actionErrorMsg}
        isSubmitting={isSubmittingClose}
        onSave={handleSaveCloseHandover}
        onClose={() => setSelectedHandoverForClose(null)}
      />

      {/* MODAL TERBITKAN BUKU KARCIS BARU (POST /gate-ticketing/books) */}
      <CreateTicketBookModal
        isOpen={isCreateBookOpen}
        isSaving={isSavingBook}
        formError={bookFormError}
        newBookForm={newBookForm}
        onChangeBookForm={setNewBookForm}
        onSubmit={handleCreateBook}
        onClose={() => setIsCreateBookOpen(false)}
      />
    </div>
  );
}
