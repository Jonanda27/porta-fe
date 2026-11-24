"use client";

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { ToastVariant, useToastStore } from "@/store/toast.store";

const VARIANT_STYLES: Record<
  ToastVariant,
  {
    borderClass: string;
    accentBarClass: string;
    iconBgClass: string;
    titleClass: string;
    Icon: typeof CheckCircle2;
  }
> = {
  success: {
    borderClass: "border-emerald-200/90",
    accentBarClass: "bg-emerald-500",
    iconBgClass: "bg-emerald-50 text-emerald-600",
    titleClass: "text-[#0B241E]",
    Icon: CheckCircle2,
  },
  error: {
    borderClass: "border-rose-200/90",
    accentBarClass: "bg-rose-500",
    iconBgClass: "bg-rose-50 text-rose-600",
    titleClass: "text-rose-950",
    Icon: XCircle,
  },
  warning: {
    borderClass: "border-amber-200/90",
    accentBarClass: "bg-amber-500",
    iconBgClass: "bg-amber-50 text-amber-600",
    titleClass: "text-amber-950",
    Icon: AlertTriangle,
  },
  info: {
    borderClass: "border-blue-200/90",
    accentBarClass: "bg-blue-500",
    iconBgClass: "bg-blue-50 text-blue-600",
    titleClass: "text-blue-950",
    Icon: Info,
  },
};

/**
 * Kontainer notifikasi toast mengambang (floating) di sudut kanan atas viewport.
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-20 right-4 sm:right-6 z-[120] flex flex-col gap-2.5 w-[calc(100vw-2rem)] max-w-sm pointer-events-none"
    >
      {toasts.map((item) => {
        const style = VARIANT_STYLES[item.variant];
        const { Icon } = style;

        return (
          <div
            key={item.id}
            role="status"
            className={`pointer-events-auto relative overflow-hidden bg-white/95 backdrop-blur-md border ${style.borderClass} rounded-2xl shadow-xl p-3.5 pl-4 flex items-start gap-3 transition-all duration-200 animate-in fade-in slide-in-from-right-4`}
          >
            <span className={`absolute left-0 top-0 bottom-0 w-1 ${style.accentBarClass}`} />

            <div
              className={`w-8 h-8 rounded-xl ${style.iconBgClass} flex items-center justify-center shrink-0 mt-0.5`}
            >
              <Icon className="w-4 h-4 stroke-[2.25]" />
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-xs font-extrabold leading-snug ${style.titleClass}`}>
                {item.title}
              </p>
              {item.message && (
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  {item.message}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeToast(item.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="Tutup notifikasi"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
