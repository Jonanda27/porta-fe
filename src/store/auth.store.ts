import { create } from "zustand";
import {
  AuthUser,
  ChangeMyPasswordPayload,
  ChangeMyPasswordResponse,
  LoginCredentials,
  LoginResponse,
  RegisterOperatorDto,
  RegisterOperatorResponse,
  UpdateMyProfilePayload,
} from "@/types/auth.types";
import { RegisterTenantPayload } from "@/types/tenant.types";
import { AuthService } from "@/services/auth.service";
import { TenantService } from "@/services/tenant.service";
import { ApiException } from "@/lib/api-client";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  register: (dto: RegisterOperatorDto) => Promise<RegisterOperatorResponse>;
  registerTenant: (payload: RegisterTenantPayload) => Promise<LoginResponse>;
  logout: () => void;
  refreshMe: () => Promise<AuthUser | null>;
  updateMyProfile: (payload: UpdateMyProfilePayload) => Promise<AuthUser>;
  changeMyPassword: (
    payload: ChangeMyPasswordPayload
  ) => Promise<ChangeMyPasswordResponse>;
  setUser: (user: AuthUser | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.login(credentials);
      set({
        user: response.user,
        token: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return response;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal melakukan proses login.";

      set({
        error: errorMessage,
        isLoading: false,
      });
      throw err;
    }
  },

  register: async (
    dto: RegisterOperatorDto
  ): Promise<RegisterOperatorResponse> => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.register(dto);
      set({
        isLoading: false,
        error: null,
      });
      return response;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memproses pendaftaran operator.";

      set({
        error: errorMessage,
        isLoading: false,
      });
      throw err;
    }
  },

  registerTenant: async (
    payload: RegisterTenantPayload
  ): Promise<LoginResponse> => {
    set({ isLoading: true, error: null });
    try {
      const response = await TenantService.registerTenant(payload);
      AuthService.saveSession(response);
      set({
        user: response.user,
        token: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return response;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memproses pendaftaran tenant.";

      set({
        error: errorMessage,
        isLoading: false,
      });
      throw err;
    }
  },

  logout: () => {
    AuthService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  refreshMe: async (): Promise<AuthUser | null> => {
    try {
      const freshUser = await AuthService.getCurrentUser();
      if (typeof window !== "undefined") {
        localStorage.setItem("porta_user", JSON.stringify(freshUser));
      }
      set({ user: freshUser, isAuthenticated: true });
      return freshUser;
    } catch {
      return null;
    }
  },

  updateMyProfile: async (payload: UpdateMyProfilePayload): Promise<AuthUser> => {
    set({ isLoading: true, error: null });
    try {
      const updated = await AuthService.updateMyProfile(payload);
      set({
        user: updated,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return updated;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memperbarui profil akun.";
      set({ error: errorMessage, isLoading: false });
      throw err;
    }
  },

  changeMyPassword: async (
    payload: ChangeMyPasswordPayload
  ): Promise<ChangeMyPasswordResponse> => {
    set({ isLoading: true, error: null });
    try {
      const res = await AuthService.changeMyPassword(payload);
      const currentUser = get().user;
      set({
        token: res.accessToken,
        user: currentUser
          ? { ...currentUser, mustChangePassword: false }
          : currentUser,
        isLoading: false,
        error: null,
      });
      return res;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Gagal memperbarui kata sandi.";
      set({ error: errorMessage, isLoading: false });
      throw err;
    }
  },

  setUser: (user: AuthUser | null) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  initialize: () => {
    if (typeof window === "undefined") return;
    const token = AuthService.getStoredToken();
    const user = AuthService.getStoredUser();

    if (token && user) {
      set({
        token,
        user,
        isAuthenticated: true,
      });
    }
  },
}));
