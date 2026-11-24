"use client";

import React from "react";
import { BillingInvoice, InvoicePrintPayload } from "@/types/billing.types";
import {
  OfficialRetribusiDocumentData,
  OfficialRetribusiDocumentModal,
} from "@/components/billing/OfficialRetribusiDocumentModal";

interface InvoiceSsrdModalProps {
  isOpen: boolean;
  selectedInvoice: BillingInvoice | null;
  activePrintPayload: InvoicePrintPayload | null;
  operatorFallbackName?: string | null;
  onClose: () => void;
}

export function InvoiceSsrdModal({
  isOpen,
  selectedInvoice,
  activePrintPayload,
  operatorFallbackName,
  onClose,
}: InvoiceSsrdModalProps) {
  if (!isOpen || !selectedInvoice) return null;

  const totalIdr = Number(selectedInvoice.totalAmountIdr) || 0;
  const issuedAt = selectedInvoice.issuedAt;
  const docData: OfficialRetribusiDocumentData = {
    docType: "SSRD",
    documentNumber:
      activePrintPayload?.ssrdNumber ||
      selectedInvoice.ssrdNumber ||
      `SSRD-PMK-${selectedInvoice.id}`,
    referenceSkrdNumber: selectedInvoice.invoiceNumber,
    issuedAt,
    dueDate: selectedInvoice.dueDate,
    tahunRetribusi: new Date(issuedAt).getFullYear(),
    wajibRetribusiName:
      activePrintPayload?.operator?.name ||
      operatorFallbackName ||
      "Operator Kapal",
    wajibRetribusiAddress:
      activePrintPayload?.operator?.address ||
      "Jl. Pelabuhan Poumako, Kabupaten Mimika",
    wajibRetribusiContact: activePrintPayload?.operator?.npwp || undefined,
    npwrd: `NPWRD-PMK-${String(selectedInvoice.operatorId || selectedInvoice.id).padStart(5, "0")}`,
    retribusiTypeLabel: "Retribusi Jasa Kepelabuhanan",
    principalIdr: totalIdr,
    penaltyIdr: 0,
    totalIdr,
    portName:
      activePrintPayload?.port?.name || "Pelabuhan Poumako (UPTD Pomako)",
    visitNumber:
      selectedInvoice.visit?.visitNumber || `VISIT-#${selectedInvoice.visitId}`,
    vesselSummary: `${selectedInvoice.visit?.vessel?.name || "Kapal"} (${Number(
      selectedInvoice.visit?.vessel?.grossTonnage || 0
    ).toLocaleString("id-ID")} GT)`,
  };

  return (
    <OfficialRetribusiDocumentModal
      isOpen={isOpen}
      data={docData}
      onClose={onClose}
    />
  );
}
