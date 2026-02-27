// services/package.service.ts

// services/package.service.ts
import type { Package, PackageFormData, PackageResponse } from './package.types';
/**
 * Base URL của API - lấy từ .env
 */
const API_URL = import.meta.env.VITE_API_URL;
/**
 * Package Service - chứa tất cả các function gọi API liên quan đến package
 */
export class PackageService {
  
  /**
   * Lấy danh sách tất cả các gói
   * @returns Promise<Package[]>
   */
  static async getAllPackages(): Promise<Package[]> {
    try {
      const response = await fetch(`${API_URL}/packages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Không thể lấy danh sách gói');
      }

      const data: PackageResponse = await response.json();
      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết 1 gói theo ID
   * @param id - ID của gói
   * @returns Promise<Package>
   */
  static async getPackageById(id: string): Promise<Package> {
    try {
      const response = await fetch(`${API_URL}/packages/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Không thể lấy thông tin gói');
      }

      const data: PackageResponse = await response.json();
      return data.data as Package;
    } catch (error) {
      console.error('Error fetching package:', error);
      throw error;
    }
  }

  /**
   * Tạo gói mới (chỉ admin)
   * @param packageData - Dữ liệu gói mới
   * @returns Promise<Package>
   */
  static async createPackage(packageData: PackageFormData): Promise<Package> {
    try {
      const response = await fetch(`${API_URL}/packages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Thêm token authentication
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(packageData),
      });

      if (!response.ok) {
        throw new Error('Không thể tạo gói mới');
      }

      const data: PackageResponse = await response.json();
      return data.data as Package;
    } catch (error) {
      console.error('Error creating package:', error);
      throw error;
    }
  }

  /**
   * Cập nhật gói (chỉ admin)
   * @param id - ID của gói cần cập nhật
   * @param packageData - Dữ liệu mới
   * @returns Promise<Package>
   */
  static async updatePackage(id: string, packageData: PackageFormData): Promise<Package> {
    try {
      const response = await fetch(`${API_URL}/packages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Thêm token authentication
        },
        body: JSON.stringify(packageData),
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật gói');
      }

      const data: PackageResponse = await response.json();
      return data.data as Package;
    } catch (error) {
      console.error('Error updating package:', error);
      throw error;
    }
  }

  /**
   * Xóa gói (chỉ admin)
   * @param id - ID của gói cần xóa
   * @returns Promise<boolean>
   */
  static async deletePackage(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/packages/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Thêm token authentication
        },
      });

      if (!response.ok) {
        throw new Error('Không thể xóa gói');
      }

      return true;
    } catch (error) {
      console.error('Error deleting package:', error);
      throw error;
    }
  }
}