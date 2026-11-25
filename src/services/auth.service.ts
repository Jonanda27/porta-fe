import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import { AUTH_COOKIE_KEYS } from "@/lib/route-guard";
import {
  AuthUser,
  ChangeMyPasswordPayload,
  ChangeMyPasswordResponse,
  LoginCredentials,
  LoginResponse,
  RegisterOperatorDto,
  RegisterOperatorResponse,
  UpdateMyProfilePayload,
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
   * Mengubah profil (nama, email, username) user yang sedang login
   */
  public static async updateMyProfile(payload: UpdateMyProfilePayload): Promise<AuthUser> {
    const updated = await apiClient.patch<AuthUser>(
      API_CONFIG.ENDPOINTS.AUTH.ME_PROFILE,
      payload
    );
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    }
    return updated;
  }

  /**
   * Mengubah kata sandi user yang sedang login (dan memperbarui token JWT)
   */
  public static async changeMyPassword(
    payload: ChangeMyPasswordPayload
  ): Promise<ChangeMyPasswordResponse> {
    const res = await apiClient.patch<ChangeMyPasswordResponse>(
      API_CONFIG.ENDPOINTS.AUTH.ME_PASSWORD,
      payload
    );
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.TOKEN, res.accessToken);
      const stored = this.getStoredUser();
      const nextUser = res.user
        ? { ...stored, ...res.user, mustChangePassword: false }
        : stored
        ? { ...stored, mustChangePassword: false }
        : null;
      if (nextUser) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(nextUser));
      }
    }
    return res;
  }

  /**
   * Menyinkronkan token & role ke cookie agar Edge Middleware dapat memvalidasi rute sebelum render
   */
  public static syncSessionCookies(token: string, role?: UserRole | string): void {
    if (typeof document === "undefined") return;
    const maxAgeSeconds = 60 * 60 * 24 * 7; // 7 hari
    document.cookie = `${AUTH_COOKIE_KEYS.TOKEN}=${encodeURIComponent(
      token
    )}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
    if (role) {
      document.cookie = `${AUTH_COOKIE_KEYS.ROLE}=${encodeURIComponent(
        role
      )}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
    }
  }

  /**
   * Menyimpan session token & profil ke localStorage serta cookie
   */
  public static saveSession(session: LoginResponse): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.TOKEN, session.accessToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(session.user));
    this.syncSessionCookies(session.accessToken, session.user?.role);
  }

  /**
   * Menghapus session saat logout
   */
  public static logout(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    if (typeof document !== "undefined") {
      document.cookie = `${AUTH_COOKIE_KEYS.TOKEN}=; path=/; max-age=0; SameSite=Lax`;
      document.cookie = `${AUTH_COOKIE_KEYS.ROLE}=; path=/; max-age=0; SameSite=Lax`;
    }
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
      case "KEPALA_DINAS":
      case "DISHUB_EKSEKUTIF":
      case "KEPALA_BIDANG":
      case "KEPALA_UPTD":
        return "/dinas/dashboard";

      case "OPERATOR_KAPAL":
        return "/kapal/dashboard";

      case "BENDAHARA":
        return "/bendahara/dashboard";

      case "TENANT":
        return "/tenant";

      case "SUPERADMIN":
        return "/upt/pelabuhan";

      case "ADMIN_PELABUHAN":
        return "/upt/checker/tugas";

      case "KEPALA_PELABUHAN":
      case "BENDAHARA":
      case "PETUGAS_TAGIHAN":
        return "/upt/dashboard";

      case "PETUGAS_REGISTRASI_KONTRAK":
        return "/upt/verifikasi";

      case "PETUGAS_RUANGAN":
        return "/upt/pemeliharaan";

      case "PETUGAS_DERMAGA":
      case "PETUGAS_DERMAGA_BARANG":
      case "PETUGAS_DERMAGA_PENUMPANG":
        return "/upt/kapal";

      default:
        return "/upt/dashboard";
    }
  }
}
