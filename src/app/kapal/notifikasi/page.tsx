"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileText,
  CreditCard,
  Anchor,
  Clock,
  ArrowRight,
  Filter,
  Search,
  RefreshCw,
  CheckCheck,
  ShieldAlert,
  Info,
  Calendar,
  Layers,
} from "lucide-react";
import { useNotificationStore } from "@/store/notification.store";
import { AppNotification, NotificationType } from "@/types/notification.types";

type FilterTab = "ALL" | "UNREAD" | "VISITS" | "BILLING" | "WARNINGS";

export default function NotifikasiPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Statistik Ringkas
  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = unreadCount;
    const visits = notifications.filter(
      (n) => n.type === "VISIT_APPROVED" || n.type === "BERTHING_OVERRIDE"
    ).length;
    const billing = notifications.filter(
      (n) => n.type === "INVOICE_ISSUED" || n.type === "PAYMENT_VERIFIED"
    ).length;
    const warnings = notifications.filter((n) => n.type === "WARNING").length;

    return { total, unread, visits, billing, warnings };
  }, [notifications, unreadCount]);

  // Filter & Search List
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Tab Filter
      if (activeTab === "UNREAD" && item.isRead) return false;
      if (
        activeTab === "VISITS" &&
        item.type !== "VISIT_APPROVED" &&
        item.type !== "BERTHING_OVERRIDE"
      ) {
        return false;
      }
      if (
        activeTab === "BILLING" &&
        item.type !== "INVOICE_ISSUED" &&
        item.type !== "PAYMENT_VERIFIED"
      ) {
        return false;
      }
      if (activeTab === "WARNINGS" && item.type !== "WARNING") return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchMessage = item.message.toLowerCase().includes(query);
        const matchType = item.type.toLowerCase().includes(query);
        return matchTitle || matchMessage || matchType;
      }

      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  // Helper formatting waktu relatif & tanggal lokal
  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Baru saja";
      if (diffMins < 60) return `${diffMins} menit lalu`;
      if (diffHours < 24) return `${diffHours} jam lalu`;
      if (diffDays === 1) return "Kemarin";
      if (diffDays < 7) return `${diffDays} hari lalu`;

      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatFullDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      });
    } catch {
      return dateStr;
    }
  };

  // Helper render ikon dan badge warna per tipe notifikasi
  const getTypeConfig = (type: NotificationType) => {
    switch (type) {
      case "WARNING":
        return {
          label: "Surat Teguran / Peringatan",
          icon: AlertTriangle,
          badgeBg: "bg-red-50 text-red-700 border-red-200",
          iconBg: "bg-red-100 text-red-600 border-red-200",
          cardBorder: "border-l-4 border-l-red-500",
        };
      case "VISIT_APPROVED":
        return {
          label: "Izin Sandar Disetujui",
          icon: Anchor,
          badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          iconBg: "bg-emerald-100 text-emerald-600 border-emerald-200",
          cardBorder: "border-l-4 border-l-emerald-500",
        };
      case "INVOICE_ISSUED":
        return {
          label: "Tagihan e-SKRD Terbit",
          icon: FileText,
          badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
          iconBg: "bg-amber-100 text-amber-700 border-amber-200",
          cardBorder: "border-l-4 border-l-amber-500",
        };
      case "PAYMENT_VERIFIED":
        return {
          label: "Setoran e-SSRD Terverifikasi",
          icon: CheckCircle2,
          badgeBg: "bg-teal-50 text-teal-700 border-teal-200",
          iconBg: "bg-teal-100 text-teal-600 border-teal-200",
          cardBorder: "border-l-4 border-l-teal-500",
        };
      case "BERTHING_OVERRIDE":
        return {
          label: "Penyesuaian Dermaga",
          icon: Layers,
          badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
          iconBg: "bg-purple-100 text-purple-600 border-purple-200",
          cardBorder: "border-l-4 border-l-purple-500",
        };
      default:
        return {
          label: "Informasi Sistem",
          icon: Info,
          badgeBg: "bg-slate-50 text-slate-700 border-slate-200",
          iconBg: "bg-slate-100 text-slate-600 border-slate-200",
          cardBorder: "border-l-4 border-l-slate-400",
        };
    }
  };

  const handleNotificationClick = async (item: AppNotification) => {
    if (!item.isRead) {
      await markAsRead(item.id);
    }
    if (item.linkUrl) {
      router.push(item.linkUrl);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Ringkasan & Kartu Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Notifikasi */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono font-semibold text-[#64748B] uppercase tracking-wider">
              Total Notifikasi
            </p>
            <p className="text-2xl font-black text-[#0B241E] mt-1">{stats.total}</p>
            <p className="text-[10px] text-[#64748B] mt-0.5">Pemberitahuan resmi</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0B241E]/5 text-[#0B241E] flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        {/* Belum Dibaca */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono font-semibold text-[#64748B] uppercase tracking-wider">
              Belum Dibaca
            </p>
            <p className="text-2xl font-black text-[#D97706] mt-1">{stats.unread}</p>
            <p className="text-[10px] text-amber-700 mt-0.5">Perlu perhatian operator</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D97706] border border-amber-200 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Izin Sandar & Operasional */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono font-semibold text-[#64748B] uppercase tracking-wider">
              Izin Sandar & Armada
            </p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{stats.visits}</p>
            <p className="text-[10px] text-emerald-600 mt-0.5">Clearance Pelabuhan</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <Anchor className="w-5 h-5" />
          </div>
        </div>

        {/* Tagihan & Surat Teguran */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono font-semibold text-[#64748B] uppercase tracking-wider">
              Tagihan & Teguran
            </p>
            <p className="text-2xl font-black text-slate-800 mt-1">
              {stats.billing + stats.warnings}
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">
              {stats.warnings} surat teguran aktif
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Main Filter & Control Panel */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === "ALL"
                  ? "bg-[#0B241E] text-white shadow-xs"
                  : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
              }`}
            >
              <span>Semua</span>
              <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.2 rounded-full">
                {stats.total}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("UNREAD")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === "UNREAD"
                  ? "bg-[#D97706] text-[#0B241E] shadow-xs"
                  : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
              }`}
            >
              <span>Belum Dibaca</span>
              {stats.unread > 0 && (
                <span className="text-[10px] font-mono bg-red-600 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                  {stats.unread}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("VISITS")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === "VISITS"
                  ? "bg-[#0B241E] text-white shadow-xs"
                  : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
              }`}
            >
              <Anchor className="w-3.5 h-3.5" />
              <span>Izin Sandar</span>
            </button>

            <button
              onClick={() => setActiveTab("BILLING")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === "BILLING"
                  ? "bg-[#0B241E] text-white shadow-xs"
                  : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Tagihan e-SKRD</span>
            </button>

            <button
              onClick={() => setActiveTab("WARNINGS")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === "WARNINGS"
                  ? "bg-[#0B241E] text-white shadow-xs"
                  : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span>Surat Teguran</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fetchNotifications()}
              disabled={isLoading}
              className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0B241E] transition-colors cursor-pointer disabled:opacity-50"
              title="Segarkan notifikasi"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin text-[#D97706]" : ""}`}
              />
            </button>

            <button
              type="button"
              onClick={() => markAllAsRead()}
              disabled={stats.unread === 0 || isLoading}
              className="px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-bold text-[#0B241E] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Tandai Semua Dibaca</span>
            </button>
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul, pesan, nomor SKRD, atau nomor kunjungan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-2.5 text-[#0B241E] placeholder-[#94A3B8] focus:outline-none focus:border-[#D97706] focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* 3. Notification List Section */}
      <div className="space-y-3">
        {isLoading && notifications.length === 0 ? (
          // Skeleton Loading
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs animate-pulse flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#0B241E]/5 text-[#0B241E] mx-auto flex items-center justify-center mb-4">
              <Bell className="w-7 h-7 text-[#85A69B]" />
            </div>
            <h3 className="text-base font-bold text-[#0B241E]">
              Tidak Ada Notifikasi
            </h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1 leading-relaxed">
              {searchQuery
                ? `Tidak ditemukan notifikasi yang cocok dengan kata kunci "${searchQuery}".`
                : activeTab === "UNREAD"
                ? "Semua notifikasi sistem telah Anda baca. Operasional armada Anda berjalan lancar."
                : "Belum ada notifikasi baru untuk kategori ini."}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-4 px-4 py-1.5 text-xs font-bold text-[#D97706] hover:underline cursor-pointer"
              >
                Hapus Pencarian
              </button>
            )}
          </div>
        ) : (
          // Daftar Notifikasi
          filteredNotifications.map((item) => {
            const config = getTypeConfig(item.type);
            const IconComponent = config.icon;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs transition-all hover:shadow-md ${
                  config.cardBorder
                } ${!item.isRead ? "bg-amber-50/15" : ""}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Bagian Kiri: Ikon & Teks Konten */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${config.iconBg}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${config.badgeBg}`}
                        >
                          {config.label}
                        </span>

                        {!item.isRead && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
                            Baru
                          </span>
                        )}

                        <span className="text-[11px] text-[#94A3B8] flex items-center gap-1 ml-auto sm:ml-0 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(item.createdAt)}</span>
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#0B241E] leading-snug">
                        {item.title}
                      </h4>

                      <p className="text-xs text-[#475569] leading-relaxed">
                        {item.message}
                      </p>

                      <p className="text-[10px] text-[#94A3B8] font-mono pt-1">
                        Diterima: {formatFullDate(item.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Bagian Kanan: Aksi & Navigasi */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#F1F5F9]">
                    {item.linkUrl && (
                      <button
                        type="button"
                        onClick={() => handleNotificationClick(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs group"
                      >
                        <span>Buka Detail</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#D97706] group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}

                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={() => markAsRead(item.id)}
                        className="text-[11px] font-medium text-[#64748B] hover:text-[#0B241E] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tandai dibaca</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Footer Informasi Layanan & Integrasi Syahbandar */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0" />
          <span>
            Notifikasi otomatis tersinkronisasi dengan Dispatcher & Syahbandar Pelabuhan Poumako.
          </span>
        </div>
        <Link
          href="/panduan"
          className="text-[#D97706] hover:underline font-semibold shrink-0"
        >
          Pelajari Sistem Notifikasi & Prosedur Respon &rarr;
        </Link>
      </div>
    </div>
  );
}
