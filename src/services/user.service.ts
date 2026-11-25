import { API_CONFIG } from "@/config/api.config";
import { apiClient } from "@/lib/api-client";
import {
  CreateUserPayload,
  RbacRoleMatrixItem,
  ResetUserPasswordPayload,
  UpdateUserPayload,
  UpdateUserStatusPayload,
  UserAccountItem,
  UserMutationResponse,
} from "@/types/user.types";
import { UserRole } from "@/types/auth.types";

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

  createUser(payload: CreateUserPayload): Promise<UserMutationResponse> {
    return apiClient.post<UserMutationResponse>(API_CONFIG.ENDPOINTS.USERS.BASE, payload);
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
  ): Promise<UserMutationResponse> {
    return apiClient.patch<UserMutationResponse>(
      `${API_CONFIG.ENDPOINTS.USERS.BASE}/${userId}/reset-password`,
      payload
    );
  },

  async getRbacRoles(): Promise<RbacRoleMatrixItem[]> {
    const res = await apiClient.get<
      RbacRoleMatrixItem[] | { totalRoles?: number; roles?: RbacRoleMatrixItem[] }
    >(API_CONFIG.ENDPOINTS.USERS.RBAC_ROLES);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.roles)) return res.roles;
    return [];
  },

  updateRolePermissions(
    role: UserRole,
    permissionCodes: string[]
  ): Promise<{ role: UserRole; permissionCodes: string[] }> {
    return apiClient.put<{ role: UserRole; permissionCodes: string[] }>(
      `${API_CONFIG.ENDPOINTS.USERS.RBAC_ROLES}/${role}/permissions`,
      { permissionCodes }
    );
  },
};
