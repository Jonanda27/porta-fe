import { create } from "zustand";
import { AuthUser, LoginCredentials, LoginResponse } from "@/types/auth.types";
import { AuthService } from "@/services/auth.service";
import { ApiException } from "@/lib/api-client";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => void;
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

  logout: () => {
    AuthService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
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
