import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  RegisterOperatorDto,
  RegisterOperatorResponse,
  UserRole,
} from "@/types/auth.types";

export * from "@/types/auth.types";

const STORAGE_KEYS = {
  TOKEN: "porta_token",
  USER: "porta_user",
} as const;

export class AuthService {
  /**
   * Mendaftarkan operator kapal baru ke backend NestJS (POST /auth/register)
   */
  public static async register(
    dto: RegisterOperatorDto
  ): Promise<RegisterOperatorResponse> {
    const response = await apiClient.post<RegisterOperatorResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      dto
    );
    return response;
  }

  /**
   * Melakukan autentikasi login ke backend NestJS
   */
  public static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    this.saveSession(response);
    return response;
  }

  /**
   * Mengambil data profil user saat ini dari backend
   */
  public static async getCurrentUser(): Promise<AuthUser> {
    return apiClient.get<AuthUser>(API_CONFIG.ENDPOINTS.AUTH.ME);
  }

  /**
   * Menyimpan session token & profil ke localStorage
   */
  public static saveSession(session: LoginResponse): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.TOKEN, session.accessToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(session.user));
  }

  /**
   * Menghapus session saat logout
   */
  public static logout(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  /**
   * Mendapatkan token JWT yang tersimpan
   */
  public static getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  /**
   * Mendapatkan profil user yang tersimpan di localStorage
   */
  public static getStoredUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  /**
   * Mengecek apakah user sedang terautentikasi
   */
  public static isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

  /**
   * Menentukan rute dashboard portal berdasarkan peran wewenang (Role)
   */
  public static getRedirectRouteByRole(role?: UserRole | string): string {
    switch (role) {
      case "DISHUB_EKSEKUTIF":
        return "/dinas/dashboard";

      case "OPERATOR_KAPAL":
        return "/kapal/dashboard";

      case "BENDAHARA":
        return "/bendahara/dashboard";

      case "ADMIN_PELABUHAN":
      case "SUPERADMIN":
        return "/upt/dashboard";

      case "PETUGAS_DERMAGA":
        return "/upt/kapal";

      default:
        return "/upt/dashboard";
    }
  }
}
