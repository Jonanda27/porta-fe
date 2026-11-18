"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Anchor,
  Ship,
  Building2,
  ShieldCheck,
  Scale,
  ArrowRight,
  Search,
  CheckCircle2,
  AlertCircle,
  Layers,
  Ruler,
  FileText,
  RefreshCw,
  Info,
  Calendar,
  Waves,
  MapPin,
} from "lucide-react";
import { usePortStore } from "@/store/port.store";
import { Berth, BerthAuthorityType, BerthType } from "@/types/port.types";

type AuthorityFilter = "ALL" | "PEMDA_DISHUB" | "UPP_KEMENHUB" | "TUKS_TERSUS";

export default function DermagaPage() {
  const router = useRouter();
  const { berths, activePort, isLoading, error, fetchPortAndBerthsData } = usePortStore();

  const [authorityFilter, setAuthorityFilter] = useState<AuthorityFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchPortAndBerthsData(1);
  }, [fetchPortAndBerthsData]);

  // Statistik Ringkas Fasilitas Dermaga
  const stats = useMemo(() => {
    const total = berths.length;
    const pemda = berths.filter((b) => b.authorityType === "PEMDA_DISHUB").length;
    const billable = berths.filter((b) => b.billingEligibility === "BILLABLE").length;
    const totalLength = berths.reduce((sum, b) => {
      const len = b.maxLengthMeters ? Number(b.maxLengthMeters) : 0;
      return sum + (isNaN(len) ? 0 : len);
    }, 0);

    return { total, pemda, billable, totalLength };
  }, [berths]);

  // Filter & Search List
  const filteredBerths = useMemo(() => {
    return berths.filter((item) => {
      // Authority Filter
      if (authorityFilter !== "ALL" && item.authorityType !== authorityFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(query);
        const matchCode = item.code.toLowerCase().includes(query);
        const matchLegal = item.legalBasis
          ? item.legalBasis.toLowerCase().includes(query)
          : false;
        return matchName || matchCode || matchLegal;
      }

      return true;
    });
  }, [berths, authorityFilter, searchQuery]);

  // Helper deskripsi tipe konstruksi dermaga
  const getBerthTypeLabel = (type: BerthType) => {
    switch (type) {
      case "DERMAGA_BESI_BETON_KAYU":
        return "Dermaga Permanen (Besi/Beton/Kayu)";
      case "PINGGIRAN_TALUD":
        return "Pinggiran Talud Penahan Tanah";
      case "BRESSING_DOLPHIN_PELAMPUNG":
        return "Bressing / Breasting Dolphin Pelampung";
      default:
        return type;
    }
  };

  const getAuthorityBadge = (authority: BerthAuthorityType) => {
    switch (authority) {
      case "PEMDA_DISHUB":
        return {
          label: "Pemda Kab. Mimika (Dishub)",
          badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
          desc: "Retribusi Daerah Resmi (PAD Pemda Mimika)",
        };
      case "UPP_KEMENHUB":
        return {
          label: "Kantor UPP Kemenhub",
          badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
          desc: "Bukan Objek Retribusi Daerah (UU HKPD)",
        };
      case "TUKS_TERSUS":
        return {
          label: "TUKS / Tersus Mitra",
          badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
          desc: "Dermaga Kepentingan Sendiri",
        };
      default:
        return {
          label: authority,
          badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
          desc: "Fasilitas Pelabuhan",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Summary Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Dermaga Fisik */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono font-semibold text-[#64748B] uppercase tracking-wider">
              Total Fasilitas Dermaga
            </p>
            <p className="text-2xl font-black text-[#0B241E] mt-1">{stats.total} Tambatan</p>
            <p className="text-[10px] text-[#64748B] mt-0.5">Pelabuhan Poumako, Mimika</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0B241E]/5 text-[#0B241E] flex items-center justify-center">
            <Anchor className="w-5 h-5 text-[#0B241E]" />
          </div>
        </div>

        {/* Dermaga Aset Pemda */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono font-semibold text-[#64748B] uppercase tracking-wider">
              Aset Pemda Dishub
            </p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{stats.pemda} Lokasi</p>
            <p className="text-[10px] text-emerald-600 mt-0.5">Objek Retribusi Perda 4/2023</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Total Garis Sandar */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono font-semibold text-[#64748B] uppercase tracking-wider">
              Total Panjang Garis Sandar
            </p>
            <p className="text-2xl font-black text-[#D97706] mt-1">{stats.totalLength} Meter</p>
            <p className="text-[10px] text-amber-800 mt-0.5">Kapasitas Tambat Efektif</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D97706] border border-amber-200 flex items-center justify-center">
            <Ruler className="w-5 h-5" />
          </div>
        </div>

        {/* Kesiapan Operasional */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono font-semibold text-[#64748B] uppercase tracking-wider">
              Kesiapan Operasional
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-1">100% Siap</p>
            <p className="text-[10px] text-emerald-700 mt-0.5">Status Seluruh Berth OPEN</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Authority Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setAuthorityFilter("ALL")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                authorityFilter === "ALL"
                  ? "bg-[#0B241E] text-white shadow-xs"
                  : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
              }`}
            >
              <span>Semua Dermaga</span>
              <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.2 rounded-full">
                {stats.total}
              </span>
            </button>

            <button
              onClick={() => setAuthorityFilter("PEMDA_DISHUB")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                authorityFilter === "PEMDA_DISHUB"
                  ? "bg-[#0B241E] text-white shadow-xs"
                  : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pemda Mimika (Dishub)</span>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded-full">
                {stats.pemda}
              </span>
            </button>

            <button
              onClick={() => setAuthorityFilter("UPP_KEMENHUB")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                authorityFilter === "UPP_KEMENHUB"
                  ? "bg-[#0B241E] text-white shadow-xs"
                  : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
              }`}
            >
              <Anchor className="w-3.5 h-3.5 text-blue-500" />
              <span>UPP Kemenhub</span>
            </button>

            <button
              onClick={() => setAuthorityFilter("TUKS_TERSUS")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                authorityFilter === "TUKS_TERSUS"
                  ? "bg-[#0B241E] text-white shadow-xs"
                  : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-500" />
              <span>TUKS / Mitra</span>
            </button>
          </div>

          {/* Action Refresh Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fetchPortAndBerthsData(1)}
              disabled={isLoading}
              className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0B241E] transition-colors cursor-pointer disabled:opacity-50"
              title="Segarkan data dermaga"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#D97706]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama dermaga, kode alokasi (misal: DRM-PEMDA-01), atau dasar regulasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-2.5 text-[#0B241E] placeholder-[#94A3B8] focus:outline-none focus:border-[#D97706] focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* 3. Berths Directory Grid */}
      <div className="space-y-4">
        {isLoading && berths.length === 0 ? (
          // Skeleton Loading
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs animate-pulse space-y-3"
              >
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-8 bg-slate-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filteredBerths.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#0B241E]/5 text-[#0B241E] mx-auto flex items-center justify-center mb-4">
              <Anchor className="w-7 h-7 text-[#85A69B]" />
            </div>
            <h3 className="text-base font-bold text-[#0B241E]">Tidak Ditemukan Dermaga</h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1 leading-relaxed">
              {searchQuery
                ? `Tidak ditemukan fasilitas dermaga yang cocok dengan kata kunci "${searchQuery}".`
                : "Belum ada dermaga aktif untuk kategori ini."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBerths.map((berth) => {
              const authorityConfig = getAuthorityBadge(berth.authorityType);
              const isPemda = berth.authorityType === "PEMDA_DISHUB";

              return (
                <div
                  key={berth.id}
                  className="bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#CBD5E1] p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Header Card: Code & Authority Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold bg-[#0B241E] text-white px-2.5 py-1 rounded-lg tracking-wider shadow-xs">
                          {berth.code}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${authorityConfig.badgeClass}`}
                        >
                          {berth.authorityType === "PEMDA_DISHUB" ? (
                            <Building2 className="w-3 h-3 text-emerald-600" />
                          ) : berth.authorityType === "UPP_KEMENHUB" ? (
                            <Anchor className="w-3 h-3 text-blue-500" />
                          ) : (
                            <Layers className="w-3 h-3 text-purple-500" />
                          )}
                          <span>{authorityConfig.label}</span>
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Siap Sandar
                      </span>
                    </div>

                    {/* Berth Name & Construction Type */}
                    <div>
                      <h4 className="text-base font-bold text-[#0B241E] group-hover:text-[#D97706] transition-colors leading-snug">
                        {berth.name}
                      </h4>
                      <p className="text-xs text-[#64748B] mt-1 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#85A69B] shrink-0" />
                        <span>{getBerthTypeLabel(berth.berthType)}</span>
                      </p>
                    </div>

                    {/* Technical Specifications Grid */}
                    <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] text-xs space-y-2.5">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] font-mono font-medium text-[#64748B] block uppercase tracking-wider">
                            Panjang Tambatan (LOA)
                          </span>
                          <p className="font-bold text-[#0B241E] mt-0.5 flex items-center gap-1.5 text-sm">
                            <Ruler className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                            <span>{berth.maxLengthMeters || "-"} Meter</span>
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono font-medium text-[#64748B] block uppercase tracking-wider">
                            Draft Maksimal (LWS)
                          </span>
                          <p className="font-bold text-[#0B241E] mt-0.5 flex items-center gap-1.5 text-sm">
                            <Waves className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                            <span>{berth.maxDraftMeters ? `${berth.maxDraftMeters} Meter` : "Aman Standar"}</span>
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E2E8F0]/80 flex items-center justify-between text-xs">
                        <span className="text-[10px] font-mono font-medium text-[#64748B] uppercase tracking-wider">
                          Status Retribusi Daerah:
                        </span>
                        {berth.billingEligibility === "BILLABLE" ? (
                          <span className="font-bold text-emerald-700 inline-flex items-center gap-1 text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Objek Retribusi e-SKRD</span>
                          </span>
                        ) : (
                          <span className="font-bold text-blue-700 inline-flex items-center gap-1 text-[11px]">
                            <Info className="w-3.5 h-3.5" />
                            <span>Non-Retribusi Daerah</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Legal Basis & Management Evidence */}
                    <div className="space-y-1.5 text-[11px] text-[#64748B] border-t border-[#F1F5F9] pt-2.5">
                      <div className="flex items-start gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                        <span className="leading-snug">
                          <span className="font-semibold text-slate-700">Dasar Regulasi:</span> {berth.legalBasis}
                        </span>
                      </div>
                      {berth.managementEvidence && (
                        <div className="flex items-start gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#85A69B] shrink-0 mt-0.5" />
                          <span className="leading-snug">
                            <span className="font-semibold text-slate-700">Legalitas Pengelolaan:</span> {berth.managementEvidence}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom CTA Button */}
                  <div className="pt-3.5 border-t border-[#F1F5F9] mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-[#64748B] flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                      Pelabuhan Poumako, Mimika
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/kapal/permohonan?preferredBerthId=${berth.id}&berthCode=${berth.code}`
                        )
                      }
                      className="px-4 py-2 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:shadow-md group/btn"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>Ajukan Sandar di Sini</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#D97706] group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Footer Information & Legal Notice */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#D97706] shrink-0" />
          <span>
            Data dermaga disinkronkan langsung dari Master Fasilitas Pelabuhan Poumako (UPT Dishub Mimika & Syahbandar).
          </span>
        </div>
        <Link
          href="/panduan"
          className="text-[#D97706] hover:underline font-semibold shrink-0"
        >
          Lihat Skema Alokasi Berth Slot & Draft Minimum &rarr;
        </Link>
      </div>
    </div>
  );
}
