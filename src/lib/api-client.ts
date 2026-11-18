import { API_CONFIG } from "@/config/api.config";

export class ApiException extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = "ApiException";
    this.statusCode = statusCode;
    this.details = details;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("porta_token");
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${cleanPath}`);

    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          url.searchParams.append(key, String(val));
        }
      });
    }

    return url.toString();
  }

  public async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { body, params, headers, ...customConfig } = options;

    const token = this.getAuthToken();
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    const defaultHeaders: Record<string, string> = {
      Accept: "application/json",
    };

    if (!isFormData) {
      defaultHeaders["Content-Type"] = "application/json";
    }

    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...customConfig,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
    };

    if (body !== undefined) {
      config.body = isFormData
        ? (body as FormData)
        : typeof body === "string"
        ? body
        : JSON.stringify(body);
    }

    const targetUrl = this.buildUrl(path, params);

    try {
      const response = await fetch(targetUrl, config);
      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");
      const responseData = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const errorMessage =
          (typeof responseData === "object" && responseData !== null && "message" in responseData)
            ? Array.isArray((responseData as { message: unknown }).message)
              ? (responseData as { message: string[] }).message.join(", ")
              : String((responseData as { message: unknown }).message)
            : response.statusText || "Terjadi kesalahan pada permintaan server.";

        throw new ApiException(errorMessage, response.status, responseData);
      }

      return responseData as T;
    } catch (error: unknown) {
      if (error instanceof ApiException) {
        throw error;
      }

      const networkError = error as Error;
      if (
        networkError.message.includes("Failed to fetch") ||
        networkError.message.includes("NetworkError") ||
        networkError.message.includes("ERR_CONNECTION_REFUSED")
      ) {
        throw new ApiException(
          `Gagal terhubung ke server backend (${this.baseUrl}). Pastikan backend sedang aktif.`,
          0,
          error
        );
      }

      throw new ApiException(networkError.message || "Kesalahan jaringan tidak terduga.", 500, error);
    }
  }

  public get<T>(path: string, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  public post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  public put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  public patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  public delete<T>(path: string, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

// Singleton API client instance
export const apiClient = new ApiClient(API_CONFIG.BASE_URL);
