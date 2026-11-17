import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "dinas" | "upt" | "kapal" | "penumpang" | "success" | "warning";
  children?: React.ReactNode;
}

export function Badge({
  className,
  variant = "upt",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    dinas: "bg-indigo-100 text-indigo-800 border-indigo-200",
    upt: "bg-sky-100 text-sky-800 border-sky-200",
    kapal: "bg-teal-100 text-teal-800 border-teal-200",
    penumpang: "bg-emerald-100 text-emerald-800 border-emerald-200",
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200",
  };

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
}
