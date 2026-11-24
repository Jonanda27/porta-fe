"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
  subtitle?: string;
  disabled?: boolean;
  badgeText?: string;
  badgeVariant?: "emerald" | "amber" | "slate";
}

interface CustomSelectFieldProps {
  label: string;
  required?: boolean;
  value: string;
  options: CustomSelectOption[];
  onChange: (value: string) => void;
  icon: React.ReactNode;
  minHeightClass?: string;
}

/**
 * Komponen dropdown kustom yang seragam, responsif, dan estetis
 * untuk menggantikan elemen native <select>.
 */
export function CustomSelectField({
  label,
  required = false,
  value,
  options,
  onChange,
  icon,
  minHeightClass = "min-h-[54px]",
}: CustomSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-bold text-[#0B241E] mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 bg-[#F8FAFC] border rounded-xl text-left transition-all cursor-pointer ${minHeightClass} ${
          isOpen
            ? "border-[#0B241E] ring-2 ring-[#0B241E]/10 bg-white"
            : "border-[#CBD5E1] hover:border-[#94A3B8]"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-slate-200/75 text-[#0B241E] flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-semibold text-[#0B241E] truncate">
              {selectedOption?.label || "-"}
            </span>
            {selectedOption?.subtitle && (
              <span className="block text-[10.5px] text-[#64748B] truncate mt-0.5">
                {selectedOption.subtitle}
              </span>
            )}
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform duration-150 ${
            isOpen ? "rotate-180 text-[#0B241E]" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-[#CBD5E1] rounded-xl shadow-xl z-30 overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            const badgeClass =
              opt.badgeVariant === "emerald"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : opt.badgeVariant === "amber"
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-slate-100 text-slate-500 border-slate-200";

            return (
              <button
                key={opt.value}
                type="button"
                disabled={opt.disabled}
                onClick={() => {
                  if (opt.disabled) return;
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 flex items-center justify-between gap-2.5 text-left transition-colors ${
                  opt.disabled
                    ? "opacity-60 cursor-not-allowed bg-slate-50/70"
                    : isSelected
                    ? "bg-emerald-50/70 cursor-pointer"
                    : "hover:bg-slate-50 cursor-pointer"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-bold truncate ${
                        opt.disabled ? "text-slate-500" : "text-[#0B241E]"
                      }`}
                    >
                      {opt.label}
                    </span>
                    {opt.badgeText && (
                      <span
                        className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${badgeClass}`}
                      >
                        {opt.badgeText}
                      </span>
                    )}
                  </div>
                  {opt.subtitle && (
                    <span className="block text-[10.5px] text-[#64748B] truncate mt-0.5">
                      {opt.subtitle}
                    </span>
                  )}
                </div>
                {isSelected && !opt.disabled && (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
