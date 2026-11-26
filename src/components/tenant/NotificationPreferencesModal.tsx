"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  SlidersHorizontal,
  Bell,
  FileText,
  Receipt,
  Wrench,
  AlertCircle,
  Loader2,
  Save,
} from "lucide-react";
import { NotificationService } from "@/services/notification.service";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { toast } from "@/store/toast.store";
import {
  NotificationPreference,
  NotificationPriority,
} from "@/types/notification.types";

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

interface CategoryConfig {
  key: string;
  title: string;
  desc: string;
  icon: typeof Bell;
  defaultPriority: NotificationPriority;
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: "LEASE",
    title: "Sewa Kios & Kontrak PKS",
    desc: "Verifikasi fisik ruangan, pengesahan kontrak PKS Kepala Pelabuhan, dan perpanjangan masa sewa.",
    icon: FileText,
    defaultPriority: "INFORMATIONAL",
  },
  {
    key: "BILLING",
    title: "Tagihan & Retribusi Daerah (e-SKRD)",
    desc: "Penerbitan surat ketetapan SKRD, sanksi denda 2% Perbup Mimika 25/2024, dan konfirmasi bukti bayar Kasda.",
    icon: Receipt,
    defaultPriority: "INFORMATIONAL",
  },
  {
    key: "MAINTENANCE",
    title: "Pemeliharaan & Aduan Fasilitas Kios",
    desc: "Progres penanganan teknis kelistrikan, kebocoran air, fisik bangunan, dan catatan penyelesaian UPTD.",
    icon: Wrench,
    defaultPriority: "INFORMATIONAL",
  },
  {
    key: "GENERAL",
    title: "Pengumuman Operasional & Regulasi",
    desc: "Pemberitahuan resmi UPTD, pasang surut dermaga, cuaca maritim, dan kebijakan pelabuhan terintegrasi.",
    icon: Bell,
    defaultPriority: "INFORMATIONAL",
  },
];

const PRIORITY_OPTIONS: Array<{ value: NotificationPriority; label: string }> = [
  { value: "INFORMATIONAL", label: "Semua Tingkat (Termasuk Info Rutin)" },
  { value: "WARNING", label: "Peringatan & Jatuh Tempo (Warning)" },
  { value: "URGENT", label: "Mendesak / Butuh Aksi (Urgent)" },
  { value: "CRITICAL", label: "Hanya Kritis / Sanksi (Critical)" },
];

export function NotificationPreferencesModal({
  isOpen,
  onClose,
  onSaved,
}: NotificationPreferencesModalProps) {
  const [preferences, setPreferences] = useState<
    Record<string, { inAppEnabled: boolean; minPriority: NotificationPriority }>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPreferences();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const loadPreferences = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data: NotificationPreference[] = await NotificationService.getPreferences();
      const map: Record<
        string,
        { inAppEnabled: boolean; minPriority: NotificationPriority }
      > = {};

      CATEGORIES.forEach((cat) => {
        const found = data.find((p) => p.category === cat.key);
        map[cat.key] = {
          inAppEnabled: found ? found.inAppEnabled : true,
          minPriority: found ? found.minPriority : cat.defaultPriority,
        };
      });

      setPreferences(map);
    } catch {
      // Default fallback
      const fallbackMap: Record<
        string,
        { inAppEnabled: boolean; minPriority: NotificationPriority }
      > = {};
      CATEGORIES.forEach((cat) => {
        fallbackMap[cat.key] = {
          inAppEnabled: true,
          minPriority: cat.defaultPriority,
        };
      });
      setPreferences(fallbackMap);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (categoryKey: string) => {
    setPreferences((prev) => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        inAppEnabled: !prev[categoryKey]?.inAppEnabled,
      },
    }));
  };

  const handlePriorityChange = (
    categoryKey: string,
    minPriority: NotificationPriority
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        minPriority,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await Promise.all(
        CATEGORIES.map((cat) => {
          const pref = preferences[cat.key];
          return NotificationService.updatePreference({
            category: cat.key,
            inAppEnabled: pref ? pref.inAppEnabled : true,
            minPriority: pref ? pref.minPriority : cat.defaultPriority,
          });
        })
      );

      toast.success("Pengaturan preferensi notifikasi berhasil disimpan.");
      if (onSaved) onSaved();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal menyimpan preferensi notifikasi.";
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0B241E] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D97706]/20 border border-[#D97706]/40 flex items-center justify-center text-[#D97706]">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Preferensi Saluran Notifikasi</h2>
              <p className="text-xs text-[#BED2CA]">
                Kelola kategori dan ambang batas prioritas notifikasi in-app
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 text-center text-[#64748B]">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#D97706]" />
              <span className="text-xs">Memuat preferensi pemberitahuan...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {CATEGORIES.map((cat) => {
                const IconComp = cat.icon;
                const pref = preferences[cat.key] || {
                  inAppEnabled: true,
                  minPriority: cat.defaultPriority,
                };

                return (
                  <div
                    key={cat.key}
                    className={`p-4 rounded-2xl border transition-all ${
                      pref.inAppEnabled
                        ? "bg-white border-slate-200 shadow-2xs"
                        : "bg-slate-50 border-slate-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            pref.inAppEnabled
                              ? "bg-[#0B241E]/10 text-[#0B241E]"
                              : "bg-slate-200 text-slate-400"
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold text-[#0B241E]">
                            {cat.title}
                          </h3>
                          <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                            {cat.desc}
                          </p>
                        </div>
                      </div>

                      {/* Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggle(cat.key)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
                          pref.inAppEnabled ? "bg-emerald-600" : "bg-slate-300"
                        }`}
                        title={pref.inAppEnabled ? "Aktif" : "Nonaktif"}
                      >
                        <span
                          className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                            pref.inAppEnabled ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Priority Selector when enabled */}
                    {pref.inAppEnabled && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-[#475569]">
                          Ambang Batas Prioritas Minimum:
                        </span>
                        <select
                          value={pref.minPriority}
                          onChange={(e) =>
                            handlePriorityChange(
                              cat.key,
                              e.target.value as NotificationPriority
                            )
                          }
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-[#0B241E] bg-white focus:outline-none focus:ring-1 focus:ring-[#0B241E]"
                        >
                          {PRIORITY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Info note */}
          <p className="text-[11px] text-[#64748B] pt-2">
            *) Pemberitahuan darurat seperti sanksi tunggakan STRD dan pemadaman darurat pelabuhan akan selalu diteruskan terlepas dari preferensi minimal yang Anda atur.
          </p>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-[#475569] text-xs font-semibold cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="px-5 py-2.5 rounded-xl bg-[#0B241E] hover:bg-[#143E33] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D97706]" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#D97706]" />
                  <span>Simpan Preferensi</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
