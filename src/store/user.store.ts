import { create } from "zustand";
import { UserService } from "@/services/user.service";
import {
  CreateUserPayload,
  RbacRoleMatrixItem,
  ResetUserPasswordPayload,
  UpdateUserPayload,
  UserAccountItem,
  UserMutationResponse,
} from "@/types/user.types";
import { UserRole } from "@/types/auth.types";

interface UserState {
  users: UserAccountItem[];
  rbacRoles: RbacRoleMatrixItem[];
  isLoading: boolean;
  isLoadingRbac: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchUsers: (portId?: number) => Promise<void>;
  fetchRbacRoles: () => Promise<void>;
  createUser: (
    payload: CreateUserPayload,
    activePortFilter?: number
  ) => Promise<UserMutationResponse>;
  updateUser: (
    userId: number,
    payload: UpdateUserPayload,
    activePortFilter?: number
  ) => Promise<void>;
  toggleUserStatus: (userId: number, isActive: boolean) => Promise<void>;
  resetUserPassword: (
    userId: number,
    payload: ResetUserPasswordPayload
  ) => Promise<UserMutationResponse>;
  updateRolePermissions: (role: UserRole, permissionCodes: string[]) => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  rbacRoles: [],
  isLoading: false,
  isLoadingRbac: false,
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

  fetchRbacRoles: async () => {
    set({ isLoadingRbac: true, error: null });
    try {
      const rbacRoles = await UserService.getRbacRoles();
      set({ rbacRoles, isLoadingRbac: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat katalog RBAC role.";
      set({ error: message, isLoadingRbac: false });
    }
  },

  createUser: async (payload: CreateUserPayload, activePortFilter?: number) => {
    set({ isSubmitting: true, error: null });
    try {
      const created = await UserService.createUser(payload);
      await get().fetchUsers(activePortFilter);
      set({ isSubmitting: false });
      return created;
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
      return updated;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mereset kata sandi pengguna.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  updateRolePermissions: async (role: UserRole, permissionCodes: string[]) => {
    set({ isSubmitting: true, error: null });
    try {
      await UserService.updateRolePermissions(role, permissionCodes);
      await get().fetchRbacRoles();
      set({ isSubmitting: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan hak akses role.";
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
