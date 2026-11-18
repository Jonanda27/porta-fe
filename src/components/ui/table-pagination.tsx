"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
  itemsPerPageOptions?: number[];
  className?: string;
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [5, 10, 25, 50],
  className = "",
}: TablePaginationProps) {
  if (totalItems === 0) {
    return null;
  }

  const fromIndex = (currentPage - 1) * itemsPerPage + 1;
  const toIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with ellipses if needed
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-[#E2E8F0] text-xs text-[#475569] ${className}`}
    >
      <div className="flex items-center gap-3">
        <span>
          Menampilkan <strong className="text-[#0B241E] font-semibold">{fromIndex}</strong> –{" "}
          <strong className="text-[#0B241E] font-semibold">{toIndex}</strong> dari{" "}
          <strong className="text-[#0B241E] font-semibold">{totalItems}</strong> data
        </span>

        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 ml-2 border-l border-[#E2E8F0] pl-3">
            <span className="text-[#64748B]">Per halaman:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="py-1 px-2 border border-[#CBD5E1] rounded-lg bg-white text-xs font-medium text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#133D31]"
            >
              {itemsPerPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Halaman Pertama"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          title="Sebelumnya"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`dots-${idx}`} className="px-1.5 text-[#94A3B8]">
                  ...
                </span>
              );
            }
            const pageNum = p as number;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`min-w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#0B241E] text-white shadow-xs"
                    : "border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#334155]"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          title="Selanjutnya"
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Halaman Terakhir"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
