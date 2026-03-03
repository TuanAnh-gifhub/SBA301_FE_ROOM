import api from "../config/axios";
import type { ApiResponse } from "./usersService";

export interface RoleResponse {
  roleId: number;
  roleName: string;
  description: string;
  active: boolean;
}

export interface CreateRoleRequest {
  roleName: string;
  description?: string;
  active?: boolean;
}

export interface UpdateRoleRequest {
  roleName: string;
  description?: string;
}

export const roleService = {
  getAllRoles: () => {
    return api.get<any, ApiResponse<RoleResponse[]>>("/roles");
  },

  createRole: (data: CreateRoleRequest) => {
    return api.post<any, ApiResponse<RoleResponse>>("/roles", data);
  },

  updateRole: (id: number, data: UpdateRoleRequest) => {
    return api.put<any, ApiResponse<RoleResponse>>(`/roles/${id}`, data);
  },

  updateStatus: (id: number, active: boolean) => {
    return api.patch<any, ApiResponse<void>>(
      `/roles/${id}/status?active=${active}`,
    );
  },
};
