"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { ModalPortal } from "@/components/ui/ModalPortal";

interface PaymentSideDrawerProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  leftColumn: React.ReactNode;
  rightColumn: React.ReactNode;
}

export function PaymentSideDrawer({
  isOpen,
  title,
  subtitle,
  icon,
  onClose,
  leftColumn,
  rightColumn,
}: PaymentSideDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow === "hidden" ? "" : prevOverflow;
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[110] flex justify-end">
        <div
          className="fixed inset-0 bg-black/55 backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="relative z-10 w-full max-w-5xl h-full bg-[#F8FAFC] shadow-2xl border-l border-[#CBD5E1] flex flex-col overflow-hidden"
        >
          {/* Drawer Header */}
          <header className="bg-[#0B241E] text-white px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-white/10">
            <div className="flex items-center gap-3 min-w-0">
              {icon && (
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                <h3 className="font-bold text-sm truncate">{title}</h3>
                {subtitle && (
                  <p className="text-[11px] text-[#94A3B8] truncate">{subtitle}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              aria-label="Tutup panel pembayaran"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* Two-Column Responsive Workspace */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
              <div className="lg:col-span-5 space-y-4">{leftColumn}</div>
              <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-2xs flex flex-col min-h-[540px]">
                {rightColumn}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </ModalPortal>
  );
}
