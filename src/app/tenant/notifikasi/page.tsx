"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileCheck2,
  Zap,
  Search,
  RefreshCw,
  ExternalLink,
  Filter,
  Check,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";
import { useNotificationStore } from "@/store/notification.store";
import { AppNotification } from "@/types/notification.types";
import { NotificationPreferencesModal } from "@/components/tenant/NotificationPreferencesModal";

export default function TenantNotifikasiPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "ALL" | "UNREAD" | "LEASES" | "BILLING" | "WARNINGS"
  >("ALL");
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter((item: AppNotification) => {
    // Search query matching
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Filter tab matching
    if (activeFilter === "UNREAD") return !item.isRead;
    if (activeFilter === "LEASES")
      return (
        item.type === "LEASE_REQUEST" ||
        item.type === "LEASE_VERIFIED" ||
        item.type === "LEASE_APPROVED" ||
        item.type === "LEASE_REJECTED" ||
        item.category === "LEASE"
      );
    if (activeFilter === "BILLING")
      return (
        item.type === "INVOICE_ISSUED" ||
        item.type === "PAYMENT_VERIFIED" ||
        item.type === "PAYMENT_SUCCESS" ||
        item.type === "UTILITY_ALERT" ||
        item.category === "BILLING"
      );
    if (activeFilter === "WARNINGS")
      return (
        item.type === "WARNING" ||
        item.priority === "WARNING" ||
        item.priority === "URGENT" ||
        item.priority === "CRITICAL"
      );

    return true;
  });

  const leaseNotifsCount = notifications.filter(
    (n) =>
      n.type === "LEASE_REQUEST" ||
      n.type === "LEASE_VERIFIED" ||
      n.type === "LEASE_APPROVED" ||
      n.type === "LEASE_REJECTED" ||
      n.category === "LEASE"
  ).length;

  const billingNotifsCount = notifications.filter(
    (n) =>
      n.type === "INVOICE_ISSUED" ||
      n.type === "PAYMENT_VERIFIED" ||
      n.type === "PAYMENT_SUCCESS" ||
      n.type === "UTILITY_ALERT" ||
      n.category === "BILLING"
  ).length;

  const getNotifIcon = (type: string, category?: string) => {
    if (category === "MAINTENANCE" || type === "MAINTENANCE") {
      return <Wrench className="w-4 h-4 text-[#D97706]" />;
    }
    switch (type) {
      case "LEASE_APPROVED":
      case "PAYMENT_VERIFIED":
      case "PAYMENT_SUCCESS":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "WARNING":
      case "LEASE_REJECTED":
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case "INVOICE_ISSUED":
        return <Receipt className="w-4 h-4 text-[#D97706]" />;
      case "UTILITY_ALERT":
        return <Zap className="w-4 h-4 text-cyan-600" />;
      case "LEASE_VERIFIED":
      case "LEASE_REQUEST":
        return <FileCheck2 className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const getNotifBadge = (type: string, priority?: string) => {
    if (priority === "CRITICAL" || type === "LEASE_REJECTED") {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          Kritis
        </span>
      );
    }
    if (priority === "URGENT" || type === "LEASE_APPROVED") {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Penting
        </span>
      );
    }
    if (priority === "WARNING" || type === "WARNING") {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          Peringatan
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        Informasi
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
            <span>Total Notifikasi</span>
            <Bell className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0B241E] mt-2">
            {notifications.length}
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-0.5">Arsip seluruh pesan</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
            <span>Belum Dibaca</span>
            <span className="w-2 h-2 rounded-full bg-[#D97706]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#D97706] mt-2">
            {unreadCount}
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-0.5">Memerlukan perhatian</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
            <span>Sewa & PKS</span>
            <FileCheck2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0B241E] mt-2">
            {leaseNotifsCount}
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-0.5">Status verifikasi kontrak</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
            <span>Tagihan & Kasda</span>
            <Receipt className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0B241E] mt-2">
            {billingNotifsCount}
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-0.5">e-SKRD & Bukti e-SSRD</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              activeFilter === "ALL"
                ? "bg-[#0B241E] text-white"
                : "bg-slate-100 hover:bg-slate-200 text-[#475569]"
            }`}
          >
            Semua ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("UNREAD")}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              activeFilter === "UNREAD"
                ? "bg-[#0B241E] text-white"
                : "bg-slate-100 hover:bg-slate-200 text-[#475569]"
            }`}
          >
            Belum Dibaca ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("LEASES")}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              activeFilter === "LEASES"
                ? "bg-[#0B241E] text-white"
                : "bg-slate-100 hover:bg-slate-200 text-[#475569]"
            }`}
          >
            Sewa & PKS ({leaseNotifsCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("BILLING")}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              activeFilter === "BILLING"
                ? "bg-[#0B241E] text-white"
                : "bg-slate-100 hover:bg-slate-200 text-[#475569]"
            }`}
          >
            Tagihan & e-SKRD ({billingNotifsCount})
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari notifikasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2 text-[#0B241E] placeholder-[#94A3B8] focus:outline-none focus:border-[#D97706]"
            />
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#0B241E] flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
              title="Tandai seluruh pesan telah dibaca"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Tandai Semua Dibaca</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsPreferencesModalOpen(true)}
            className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#0B241E] flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
            title="Atur preferensi saluran notifikasi"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#D97706]" />
            <span className="hidden sm:inline">Preferensi</span>
          </button>

          <button
            type="button"
            onClick={() => fetchNotifications()}
            disabled={isLoading}
            className="p-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#475569] cursor-pointer shrink-0"
            title="Muat Ulang"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Notifications List Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs divide-y divide-[#F1F5F9]">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-[#64748B]">
            <Bell className="w-8 h-8 text-[#94A3B8] mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold text-[#0B241E]">
              Tidak ada notifikasi yang sesuai
            </p>
            <p className="text-xs text-[#94A3B8] mt-1">
              {searchQuery
                ? `Tidak ditemukan pesan dengan kata kunci "${searchQuery}".`
                : "Seluruh pesan telah diperiksa atau belum ada riwayat baru."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((item: AppNotification) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 transition-colors flex items-start justify-between gap-4 ${
                !item.isRead ? "bg-amber-50/25 hover:bg-amber-50/40" : "hover:bg-[#F8FAFC]"
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                {/* Type Icon */}
                <div className="w-9 h-9 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  {getNotifIcon(item.type, item.category)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-[#0B241E] leading-tight">
                      {item.title}
                    </h3>
                    {getNotifBadge(item.type, item.priority)}
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#D97706] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    {item.message}
                  </p>
                  <div className="text-[10px] font-mono text-[#94A3B8] pt-1">
                    {new Date(item.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {!item.isRead && (
                  <button
                    type="button"
                    onClick={() => markAsRead(item.id)}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-emerald-700 transition-colors cursor-pointer"
                    title="Tandai telah dibaca"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}

                {item.linkUrl && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!item.isRead) {
                        await markAsRead(item.id);
                      }
                      router.push(item.linkUrl!);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <span>Buka Rincian</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#D97706]" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Pengaturan Preferensi Notifikasi */}
      <NotificationPreferencesModal
        isOpen={isPreferencesModalOpen}
        onClose={() => setIsPreferencesModalOpen(false)}
        onSaved={fetchNotifications}
      />
    </div>
  );
}
