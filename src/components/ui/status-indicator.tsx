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
  PENDING: "amber",
  PENDING_VERIFICATION: "amber",
  PENDING_HEAD_OF_PORT: "amber",
  MAINTENANCE: "amber",
  REQUESTED: "amber",
  WARNING: "amber",
  CLOSED: "rose",
  REJECTED: "rose",
  SUSPENDED: "rose",
  INACTIVE: "rose",
  TERMINATED: "rose",
  BLOCK: "rose",
  LEASED: "blue",
  EXPIRED: "slate",
  NOT_BILLABLE: "slate",
};

const DOT_CLASSES: Record<Tone, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  blue: "bg-blue-500",
  slate: "bg-slate-400",
};

const TEXT_CLASSES: Record<Tone, string> = {
  emerald: "text-emerald-700",
  amber: "text-amber-700",
  rose: "text-rose-700",
  blue: "text-blue-700",
  slate: "text-slate-600",
};

interface StatusDotProps {
  status: string;
  label?: string;
  tone?: Tone;
}

/**
 * Minimalist enterprise status indicator (dot + crisp text, zero boxed borders).
 */
export function StatusDot({ status, label, tone }: StatusDotProps) {
  const resolvedTone = tone || STATUS_TONE_MAP[status] || "slate";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${TEXT_CLASSES[resolvedTone]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT_CLASSES[resolvedTone]}`} />
      <span>{label ?? formatLabel(status)}</span>
    </span>
  );
}
