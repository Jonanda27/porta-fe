import { create } from "zustand";
import { UserService } from "@/services/user.service";
import {
  CreateUserPayload,
  ResetUserPasswordPayload,
  UpdateUserPayload,
  UserAccountItem,
} from "@/types/user.types";

interface UserState {
  users: UserAccountItem[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchUsers: (portId?: number) => Promise<void>;
  createUser: (payload: CreateUserPayload, activePortFilter?: number) => Promise<void>;
  updateUser: (
    userId: number,
    payload: UpdateUserPayload,
    activePortFilter?: number
  ) => Promise<void>;
  toggleUserStatus: (userId: number, isActive: boolean) => Promise<void>;
  resetUserPassword: (
    userId: number,
    payload: ResetUserPasswordPayload
  ) => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchUsers: async (portId?: number) => {
    set({ isLoading: true, error: null });
    try {
      const users = await UserService.getAllUsers(portId);
      set({ users, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat daftar pengguna.";
      set({ error: message, isLoading: false });
    }
  },

  createUser: async (payload: CreateUserPayload, activePortFilter?: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await UserService.createUser(payload);
      await get().fetchUsers(activePortFilter);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal membuat akun pengguna.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  updateUser: async (
    userId: number,
    payload: UpdateUserPayload,
    activePortFilter?: number
  ) => {
    set({ isSubmitting: true, error: null });
    try {
      await UserService.updateUser(userId, payload);
      await get().fetchUsers(activePortFilter);
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memperbarui data pengguna.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  toggleUserStatus: async (userId: number, isActive: boolean) => {
    set({ isSubmitting: true, error: null });
    try {
      const updated = await UserService.updateUserStatus(userId, { isActive });
      set((state) => ({
        users: state.users.map((u) =>
          u.id === userId ? { ...u, isActive: updated.isActive } : u
        ),
        isSubmitting: false,
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mengubah status pengguna.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  resetUserPassword: async (userId: number, payload: ResetUserPasswordPayload) => {
    set({ isSubmitting: true, error: null });
    try {
      const updated = await UserService.resetUserPassword(userId, payload);
      set((state) => ({
        users: state.users.map((u) =>
          u.id === userId ? { ...u, mustChangePassword: updated.mustChangePassword } : u
        ),
        isSubmitting: false,
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mereset kata sandi pengguna.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
