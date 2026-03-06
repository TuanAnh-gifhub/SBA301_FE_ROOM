import api from "../../config/axios";
import type { ApiResponse } from "../usersService";

// ===== INTERFACES =====
// Khớp 100% với RentPackageResponse.java ở BE

export interface PackageResponse {
  rentPackageId: string;       // UUID từ BE
  rentPackageName: string;
  price: number;
  durationDays: number;
  description: string;
  createdAt: string;           // LocalDateTime → string khi qua JSON
  updatedAt: string;
}

export interface PackageRequest {
  rentPackageName: string;
  price: number;
  durationDays: number;
  description: string;
}

// ===== SERVICE =====

export const packageService = {
  // Lấy tất cả gói — không cần đăng nhập (public)
  getAllPackages: () => {
    return api.get<ApiResponse<PackageResponse[]>>("/packages");
  },

  // Lấy chi tiết 1 gói theo id
  getPackageById: (id: string) => {
    return api.get<ApiResponse<PackageResponse>>(`/packages/${id}`);
  },

  // Tạo gói mới — chỉ ADMIN
  createPackage: (data: PackageRequest) => {
    return api.post<ApiResponse<PackageResponse>>("/packages", data);
  },

  // Cập nhật gói — chỉ ADMIN
  updatePackage: (id: string, data: PackageRequest) => {
    return api.put<ApiResponse<PackageResponse>>(`/packages/${id}`, data);
  },

  // Xóa gói — chỉ ADMIN
  deletePackage: (id: string) => {
    return api.delete<ApiResponse<void>>(`/packages/${id}`);
  },
};