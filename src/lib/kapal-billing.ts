import {
  BillingInvoice,
  UnifiedPaidRecord,
  UnpaidLeaseSummary,
} from "@/types/billing.types";
import { AssetLease, AssetLeasePayment } from "@/types/asset.types";

export function formatRupiah(val?: number | string | null): string {
  const num = Number(val) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function getVirtualAccountNo(inv: BillingInvoice, bank: string): string {
  const prefix = bank === "bank_papua" ? "9928" : "8810";
  const paddedId = String(inv.id).padStart(6, "0");
  return `${prefix} 1840 2910 ${paddedId}`;
}

export function computeUnpaidLeases(leases: AssetLease[]): UnpaidLeaseSummary[] {
  return leases
    .filter((l) => l.status === "ACTIVE")
    .map((lease) => {
      const totalDue = Number(lease.totalAnnualAmountIdr || 0);
      const totalPaid = (lease.payments || []).reduce(
        (sum, p) => sum + Number(p.amountIdr || 0),
        0
      );
      const remaining = Math.max(0, totalDue - totalPaid);
      return { lease, totalDue, totalPaid, remaining };
    })
    .filter((item) => item.remaining > 0);
}

export function extractPaidLeasePayments(
  leases: AssetLease[]
): { lease: AssetLease; payment: AssetLeasePayment }[] {
  const rows: { lease: AssetLease; payment: AssetLeasePayment }[] = [];
  for (const lease of leases) {
    for (const payment of lease.payments || []) {
      rows.push({ lease, payment });
    }
  }
  return rows;
}

export function buildUnifiedPaidRecords(
  paidInvoices: BillingInvoice[],
  paidLeasePayments: { lease: AssetLease; payment: AssetLeasePayment }[],
  searchQuery: string,
  categoryFilter: "ALL" | "DERMAGA" | "RUANGAN"
): UnifiedPaidRecord[] {
  const q = searchQuery.trim().toLowerCase();
  const list: UnifiedPaidRecord[] = [];

  if (categoryFilter !== "RUANGAN") {
    for (const inv of paidInvoices) {
      const matches =
        !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        (inv.ssrdNumber && inv.ssrdNumber.toLowerCase().includes(q)) ||
        (inv.visit?.vessel?.name && inv.visit.vessel.name.toLowerCase().includes(q));
      if (matches) {
        list.push({
          kind: "DERMAGA",
          sortDate: new Date(inv.issuedAt).getTime(),
          invoice: inv,
        });
      }
    }
  }

  if (categoryFilter !== "DERMAGA") {
    for (const entry of paidLeasePayments) {
      const matches =
        !q ||
        entry.lease.contractNumber.toLowerCase().includes(q) ||
        (entry.lease.asset?.name &&
          entry.lease.asset.name.toLowerCase().includes(q)) ||
        (entry.lease.asset?.assetCode &&
          entry.lease.asset.assetCode.toLowerCase().includes(q));
      if (matches) {
        list.push({
          kind: "RUANGAN",
          sortDate: new Date(entry.payment.paidAt).getTime(),
          lease: entry.lease,
          payment: entry.payment,
        });
      }
    }
  }

  return list.sort((a, b) => b.sortDate - a.sortDate);
}
