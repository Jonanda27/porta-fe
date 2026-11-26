import { AssetLease } from "@/types/asset.types";

export interface LeasePaymentSummary {
  totalDue: number;
  totalPaid: number;
  remaining: number;
  isPaidOff: boolean;
}

export function getDaysRemaining(endDateStr: string): number {
  const end = new Date(endDateStr).getTime();
  const now = new Date().getTime();
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
}

export function getPaymentSummary(lease: AssetLease): LeasePaymentSummary {
  const totalDue = Number(lease.totalAnnualAmountIdr || 0);
  const totalPaid = (lease.payments || []).reduce(
    (acc, p) => acc + Number(p.amountIdr || 0),
    0
  );
  const remaining = Math.max(0, totalDue - totalPaid);
  const isPaidOff = remaining === 0 && totalPaid > 0;
  return { totalDue, totalPaid, remaining, isPaidOff };
}
