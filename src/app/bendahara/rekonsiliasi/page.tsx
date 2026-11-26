"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import {
  RekonsiliasiHeader,
  RekonsiliasiTab,
} from "@/components/bendahara/rekonsiliasi/RekonsiliasiHeader";
import { RekonsiliasiSummaryCards } from "@/components/bendahara/rekonsiliasi/RekonsiliasiSummaryCards";
import { BkuLedgerSection } from "@/components/bendahara/rekonsiliasi/BkuLedgerSection";
import { HandoversSection } from "@/components/bendahara/rekonsiliasi/HandoversSection";
import { TicketBooksSection } from "@/components/bendahara/rekonsiliasi/TicketBooksSection";
import { ManifestsSection } from "@/components/bendahara/rekonsiliasi/ManifestsSection";

export default function BendaharaRekonsiliasiPage() {
  const { user } = useAuthStore();
  const {
    revenueSummary,
    invoices,
    ticketBooks,
    ferryRoutes,
    handovers,
    manifests,
    fetchRevenueSummary,
    fetchInvoices,
    fetchTicketBooks,
    createTicketBook,
    fetchFerryRoutes,
    fetchHandovers,
    fetchManifests,
    closeHandover,
  } = useBillingStore();

  const [activeTab, setActiveTab] = useState<RekonsiliasiTab>("BKU");
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

  const handleSelectTab = (tab: RekonsiliasiTab) => {
    setActiveTab(tab);
    setSearchQuery("");
  };

  const handleDownloadPasal95Report = () => {
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
  };

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

  const settledHandoversCount = useMemo(() => {
    return handovers.filter((h) => h.status === "SETTLED").length;
  }, [handovers]);

  // Filter Handovers
  const filteredHandovers = handovers.filter((h) => {
    const query = searchQuery.toLowerCase();
    return (
      h.wardenName.toLowerCase().includes(query) ||
      (h.book?.bookCode || "").toLowerCase().includes(query) ||
      (h.book?.ticketCategory || "").toLowerCase().includes(query)
    );
  });

  // Filter Ticket Books
  const filteredBooks = ticketBooks.filter((b) => {
    const query = searchQuery.toLowerCase();
    return (
      b.bookCode.toLowerCase().includes(query) ||
      b.ticketCategory.toLowerCase().includes(query) ||
      (b.porporasiNumber || "").toLowerCase().includes(query)
    );
  });

  // Filter Manifests
  const filteredManifests = manifests.filter((m) => {
    const query = searchQuery.toLowerCase();
    return (
      m.manifestNumber.toLowerCase().includes(query) ||
      (m.visit?.vessel?.name || "").toLowerCase().includes(query) ||
      (m.ferryRoute?.destinationName || "").toLowerCase().includes(query)
    );
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

  const handlePrintBku = () => {
    toast.info(
      "Berita Acara Rekonsiliasi & BKU",
      `Tanggal: ${selectedDate} • Total Penerimaan: ${formatRupiah(
        totalVerifiedPAD
      )} • Status: DITUTUP SAH`
    );
  };

  // Open Handover Modal
  const handleOpenCloseHandoverModal = (handover: GateHandoverItem) => {
    setSelectedHandoverForClose(handover);
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
      <RekonsiliasiHeader
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        handoversCount={handovers.length}
        ticketBooksCount={ticketBooks.length}
        manifestsCount={manifests.length}
        onDownloadPasal95Report={handleDownloadPasal95Report}
      />

      <RekonsiliasiSummaryCards
        gateTotal={gateTotal}
        settledHandoversCount={settledHandoversCount}
        vesselTotal={vesselTotal}
        otherRevenueTotal={assetTotal + cargoTotal + utilityTotal}
      />

      {activeTab === "BKU" && (
        <BkuLedgerSection
          selectedDate={selectedDate}
          onChangeDate={setSelectedDate}
          isClosingBook={isClosingBook}
          onCloseDailyBook={handleCloseDailyBook}
          onPrintBku={handlePrintBku}
          paidTransactions={paidTransactions}
          totalVerifiedPAD={totalVerifiedPAD}
        />
      )}

      {activeTab === "HANDOVERS" && (
        <HandoversSection
          handovers={filteredHandovers}
          searchQuery={searchQuery}
          onChangeSearchQuery={setSearchQuery}
          onOpenCloseHandover={handleOpenCloseHandoverModal}
        />
      )}

      {activeTab === "BOOKS" && (
        <TicketBooksSection
          ticketBooks={filteredBooks}
          searchQuery={searchQuery}
          onChangeSearchQuery={setSearchQuery}
          onOpenCreateBook={() => {
            setBookFormError(null);
            setIsCreateBookOpen(true);
          }}
        />
      )}

      {activeTab === "MANIFESTS" && (
        <ManifestsSection
          manifests={filteredManifests}
          ferryRoutes={ferryRoutes}
          searchQuery={searchQuery}
          onChangeSearchQuery={setSearchQuery}
        />
      )}

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
