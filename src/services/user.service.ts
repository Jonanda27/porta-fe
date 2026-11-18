import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import {
  CreateUserPayload,
  ResetUserPasswordPayload,
  UpdateUserPayload,
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

  updateUser(userId: number, payload: UpdateUserPayload): Promise<UserAccountItem> {
    return apiClient.patch<UserAccountItem>(
      `${API_CONFIG.ENDPOINTS.USERS.BASE}/${userId}`,
      payload
    );
  },

  updateUserStatus(
    userId: number,
    payload: UpdateUserStatusPayload
  ): Promise<UserAccountItem> {
    return apiClient.patch<UserAccountItem>(
      `${API_CONFIG.ENDPOINTS.USERS.BASE}/${userId}/status`,
      payload
    );
  },

  resetUserPassword(
    userId: number,
    payload: ResetUserPasswordPayload
  ): Promise<UserAccountItem> {
    return apiClient.patch<UserAccountItem>(
      `${API_CONFIG.ENDPOINTS.USERS.BASE}/${userId}/reset-password`,
      payload
    );
  },
};
