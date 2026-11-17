import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import {
  CreateUserPayload,
  UpdateUserStatusPayload,
  UserAccountItem,
} from "@/types/user.types";

/**
 * Service untuk mengelola Akun Pengguna & RBAC (Users Management)
 */
export const UserService = {
  getAllUsers(portId?: number): Promise<UserAccountItem[]> {
    return apiClient.get<UserAccountItem[]>(
      API_CONFIG.ENDPOINTS.USERS.BASE,
      portId ? { params: { portId } } : undefined
    );
  },

  createUser(payload: CreateUserPayload): Promise<UserAccountItem> {
    return apiClient.post<UserAccountItem>(API_CONFIG.ENDPOINTS.USERS.BASE, payload);
  },

  updateUserStatus(
    userId: number,
    payload: UpdateUserStatusPayload
  ): Promise<Pick<UserAccountItem, "id" | "email" | "role" | "isActive">> {
    return apiClient.patch<Pick<UserAccountItem, "id" | "email" | "role" | "isActive">>(
      `${API_CONFIG.ENDPOINTS.USERS.BASE}/${userId}/status`,
      payload
    );
  },
};
