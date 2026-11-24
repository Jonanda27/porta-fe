import { create } from "zustand";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  durationMs: number;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (item: Omit<ToastItem, "id">) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const MAX_TOASTS = 4;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (item) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({
      toasts: [...state.toasts.slice(-(MAX_TOASTS - 1)), { ...item, id }],
    }));

    if (item.durationMs > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, item.durationMs);
    }

    return id;
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearAll: () => set({ toasts: [] }),
}));

/**
 * Helper global untuk memicu notifikasi toast dari komponen atau store manapun.
 */
export const toast = {
  success: (title: string, message?: string, durationMs: number = 4500) =>
    useToastStore.getState().addToast({ variant: "success", title, message, durationMs }),
  error: (title: string, message?: string, durationMs: number = 5500) =>
    useToastStore.getState().addToast({ variant: "error", title, message, durationMs }),
  warning: (title: string, message?: string, durationMs: number = 5000) =>
    useToastStore.getState().addToast({ variant: "warning", title, message, durationMs }),
  info: (title: string, message?: string, durationMs: number = 4500) =>
    useToastStore.getState().addToast({ variant: "info", title, message, durationMs }),
};
