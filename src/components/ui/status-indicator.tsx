"use client";

import React from "react";
import { formatLabel } from "@/lib/format-labels";

type Tone = "emerald" | "amber" | "rose" | "slate" | "blue";

const STATUS_TONE_MAP: Record<string, Tone> = {
  OPEN: "emerald",
  ACTIVE: "emerald",
  VERIFIED: "emerald",
  APPROVED: "emerald",
  AUTO_APPROVED: "emerald",
  AVAILABLE: "emerald",
  PAID: "emerald",
  COMPLETED: "emerald",
  ADMIN_APPROVED: "emerald",
  ADMIN_CHECKED: "emerald",
  HEAD_VERIFIED: "emerald",
  ACKNOWLEDGED: "emerald",

  ADMIN_REVIEW: "blue",
  WAITING_HEAD_VERIFICATION: "blue",
  SUBMITTED: "blue",
  IN_PROGRESS: "blue",
  LEASED: "blue",

  WAITING_ADMIN: "amber",
  PENDING: "amber",
  PENDING_VERIFICATION: "amber",
  PENDING_HEAD_OF_PORT: "amber",
  PENDING_SUBMISSION: "amber",
  MAINTENANCE: "amber",
  REQUESTED: "amber",
  WARNING: "amber",
  OBLIGATION_NOT_STARTED: "amber",

  ADMIN_RETURNED: "rose",
  HEAD_RETURNED: "rose",
  HEAD_REJECTED: "rose",
  RETURNED: "rose",
  INCOMPLETE_RETURNED: "rose",
  OVERDUE: "rose",
  CLOSED: "rose",
  REJECTED: "rose",
  SUSPENDED: "rose",
  INACTIVE: "rose",
  TERMINATED: "rose",
  BLOCK: "rose",

  NOT_STARTED: "slate",
  NOT_SUBMITTED: "slate",
  NO_OBLIGATION: "slate",
  CANCELLED: "slate",
  EXPIRED: "slate",
  NOT_BILLABLE: "slate",
};

const BADGE_CLASSES: Record<Tone, string> = {
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-800 border-amber-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
};

interface StatusDotProps {
  status: string;
  label?: string;
  tone?: Tone;
}

/**
 * Colored pill badge status indicator.
 */
export function StatusDot({ status, label, tone }: StatusDotProps) {
  const resolvedTone = tone || STATUS_TONE_MAP[status] || "slate";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${BADGE_CLASSES[resolvedTone]}`}
    >
      {label ?? formatLabel(status)}
    </span>
  );
}
