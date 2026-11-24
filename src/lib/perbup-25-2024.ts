import { BillingInvoice, WarningLevel } from "@/types/billing.types";
import { GateTicketBookItem } from "@/types/field-ops.types";

/**
 * Helper kepatuhan Perbup Mimika No. 25 Tahun 2024:
 * - Pasal 21: Tahapan penagihan berjenjang (Pemberitahuan H-7, Teguran H+7, STRD + bunga 1%/bulan maks 24 bln)
 * - Pasal 95: Laporan Realisasi Bulanan PD Pengelola (maks. tanggal 5 bulan berikutnya)
 */

export type Pasal21Stage =
  | "AKTIF"
  | "PEMBERITAHUAN_H7"
  | "TEGURAN_H7"
  | "STRD_FINAL";

export interface Pasal21Classification {
  stage: Pasal21Stage;
  label: string;
  defaultWarningLevel: WarningLevel;
  daysDiffFromDue: number;
  monthsOverdue: number;
  interestRatePerMonth: number;
  estimatedInterestIdr: number;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function classifyPasal21Collection(
  principalAmount: number | string,
  dueDateStr: string,
  now: Date = new Date()
): Pasal21Classification {
  const principal = Number(principalAmount) || 0;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  // Positif = masih tersisa N hari menuju jatuh tempo; Negatif = lewat N hari
  const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / MS_PER_DAY);
  const daysOverdue = Math.max(0, -daysUntilDue);
  const monthsOverdue =
    daysOverdue > 0 ? Math.min(24, Math.ceil(daysOverdue / 30)) : 0;
  const estimatedInterestIdr = Math.round(principal * 0.01 * monthsOverdue);

  if (daysUntilDue > 7) {
    return {
      stage: "AKTIF",
      label: `Jatuh Tempo ${daysUntilDue} Hari Lagi`,
      defaultWarningLevel: "TEGURAN_1",
      daysDiffFromDue: daysUntilDue,
      monthsOverdue: 0,
      interestRatePerMonth: 0.01,
      estimatedInterestIdr: 0,
    };
  }

  if (daysUntilDue >= 0) {
    return {
      stage: "PEMBERITAHUAN_H7",
      label:
        daysUntilDue === 0
          ? "Jatuh Tempo Hari Ini (Pemberitahuan)"
          : `H-${daysUntilDue} Pemberitahuan (Pasal 21 ayat 3)`,
      defaultWarningLevel: "TEGURAN_1",
      daysDiffFromDue: daysUntilDue,
      monthsOverdue: 0,
      interestRatePerMonth: 0.01,
      estimatedInterestIdr: 0,
    };
  }

  if (daysOverdue <= 14) {
    return {
      stage: "TEGURAN_H7",
      label: `Lewat ${daysOverdue} Hari (Surat Teguran)`,
      defaultWarningLevel: "TEGURAN_2",
      daysDiffFromDue: daysUntilDue,
      monthsOverdue,
      interestRatePerMonth: 0.01,
      estimatedInterestIdr,
    };
  }

  return {
    stage: "STRD_FINAL",
    label: `Lewat ${daysOverdue} Hari (Siap STRD)`,
    defaultWarningLevel: "TEGURAN_3",
    daysDiffFromDue: daysUntilDue,
    monthsOverdue,
    interestRatePerMonth: 0.01,
    estimatedInterestIdr,
  };
}

function escapeCsvCell(value: string | number | null | undefined): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildPasal95MonthlyReportCsv(params: {
  monthLabel: string;
  invoices: BillingInvoice[];
  ticketBooks: GateTicketBookItem[];
}): string {
  const { monthLabel, invoices, ticketBooks } = params;
  const rows: string[] = [];

  rows.push(`LAPORAN REALISASI PENERIMAAN RETRIBUSI DAERAH (PASAL 95 PERBUP MIMIKA NO. 25/2024)`);
  rows.push(`Periode,${escapeCsvCell(monthLabel)},Batas Lapor,Maksimal Tanggal 5 Bulan Berikutnya`);
  rows.push(`Tujuan,Bupati Mimika melalui Kepala Bapenda (Tembusan: Inspektorat)`);
  rows.push("");
  rows.push("BAGIAN A: RINCIAN KETETAPAN SKRD & STRD (PASAL 95 AYAT 1 HURUF A)");
  rows.push(
    [
      "No",
      "Nomor SKRD",
      "Tanggal Terbit",
      "Tanggal Jatuh Tempo",
      "Nama Wajib Retribusi / Kapal",
      "Jenis Retribusi",
      "Pokok Ketetapan (IDR)",
      "Status",
    ].join(",")
  );

  invoices.forEach((inv, idx) => {
    rows.push(
      [
        idx + 1,
        escapeCsvCell(inv.invoiceNumber),
        escapeCsvCell(new Date(inv.issuedAt).toLocaleDateString("id-ID")),
        escapeCsvCell(inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("id-ID") : "-"),
        escapeCsvCell(inv.visit?.vessel?.name || `Operator #${inv.operatorId}`),
        escapeCsvCell(inv.billingStage === "ADVANCE_SKRD" ? "Uang Muka Kepelabuhanan" : "Jasa Kepelabuhanan"),
        Number(inv.totalAmountIdr) || 0,
        escapeCsvCell(inv.status),
      ].join(",")
    );
  });

  rows.push("");
  rows.push("BAGIAN B: RINCIAN KARCIS / DOKUMEN YANG DIPERSAMAKAN (PASAL 95 AYAT 1 HURUF B)");
  rows.push(
    [
      "No",
      "Kode Buku Karcis",
      "No. Porporasi Bapenda",
      "Jenis Retribusi",
      "Nomor Seri",
      "Nilai Nominal (IDR)",
      "Jumlah Lembar",
      "Nilai Total Buku (IDR)",
      "Status",
    ].join(",")
  );

  ticketBooks.forEach((b, idx) => {
    const totalSheets = Math.max(0, b.serialEnd - b.serialStart + 1);
    const totalCash = totalSheets * (Number(b.nominalPerTicket) || 0);
    rows.push(
      [
        idx + 1,
        escapeCsvCell(b.bookCode),
        escapeCsvCell(b.porporasiNumber || "-"),
        escapeCsvCell(b.ticketCategory),
        escapeCsvCell(`${b.serialStart}-${b.serialEnd}`),
        Number(b.nominalPerTicket) || 0,
        totalSheets,
        totalCash,
        escapeCsvCell(b.status),
      ].join(",")
    );
  });

  return rows.join("\n");
}

export interface Pasal22WriteOffCandidate {
  invoice: BillingInvoice;
  yearsOverdue: number;
  principalIdr: number;
  authority: "KEPALA_PD" | "BUPATI";
  authorityLabel: string;
}

const KEPALA_PD_WRITE_OFF_LIMIT_IDR = 100_000_000;

/**
 * BAB III Pasal 22 & Pasal 25 Perbup Mimika No. 25 Tahun 2024:
 * - Kedaluwarsa penagihan: 3 tahun sejak terutangnya retribusi (Pasal 22 ayat 1)
 * - Batas kewenangan penghapusan: <= Rp 100 juta oleh Kepala PD, > Rp 100 juta oleh Bupati (Pasal 25 ayat 1)
 */
export function evaluatePasal22Receivables(
  invoices: BillingInvoice[],
  now: Date = new Date()
): Pasal22WriteOffCandidate[] {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  return invoices
    .filter((inv) => inv.status !== "PAID" && inv.status !== "VOID" && Boolean(inv.dueDate))
    .map((inv) => {
      const due = new Date(inv.dueDate);
      due.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - due.getTime()) / MS_PER_DAY);
      const yearsOverdue = Number((diffDays / 365).toFixed(1));
      const principalIdr = Number(inv.totalAmountIdr) || 0;
      const authority: "KEPALA_PD" | "BUPATI" =
        principalIdr <= KEPALA_PD_WRITE_OFF_LIMIT_IDR ? "KEPALA_PD" : "BUPATI";

      return {
        invoice: inv,
        yearsOverdue,
        principalIdr,
        authority,
        authorityLabel:
          authority === "KEPALA_PD"
            ? "Kepala PD/UPT (<= Rp 100 Juta)"
            : "Bupati Mimika (> Rp 100 Juta)",
      };
    })
    .filter((item) => item.yearsOverdue >= 3);
}

export function buildPasal26WriteOffReportCsv(
  budgetYear: number,
  candidates: Pasal22WriteOffCandidate[]
): string {
  const rows: string[] = [];
  rows.push(`DAFTAR USULAN PENGHAPUSAN PIUTANG RETRIBUSI DAERAH (PASAL 26 PERBUP MIMIKA NO. 25/2024)`);
  rows.push(`Tahun Anggaran,${budgetYear}`);
  rows.push("");
  rows.push(
    [
      "No",
      "Nama Wajib Retribusi / Kapal",
      "Nomor SKRD",
      "Jenis Retribusi",
      "Tahun Retribusi",
      "Jumlah Piutang (IDR)",
      "Lama Kedaluwarsa (Tahun)",
      "Kewenangan Penetapan (Pasal 25)",
      "Alasan Penghapusan",
    ].join(",")
  );

  candidates.forEach((c, idx) => {
    rows.push(
      [
        idx + 1,
        escapeCsvCell(c.invoice.visit?.vessel?.name || `Operator #${c.invoice.operatorId}`),
        escapeCsvCell(c.invoice.invoiceNumber),
        escapeCsvCell("Retribusi Jasa Kepelabuhanan"),
        new Date(c.invoice.issuedAt).getFullYear(),
        c.principalIdr,
        c.yearsOverdue,
        escapeCsvCell(c.authorityLabel),
        escapeCsvCell("Kedaluwarsa hak penagihan melampaui 3 tahun (Pasal 22)"),
      ].join(",")
    );
  });

  return rows.join("\n");
}
