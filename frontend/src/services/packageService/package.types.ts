// types/package.types.ts

/**
 * Interface định nghĩa cấu trúc của 1 gói (package)
 * Dữ liệu này sẽ trả về từ BE
 */
export interface Package {
  id: string;                    // ID của gói
  name: string;                  // Tên gói (VD: "Gói Cơ Bản", "Gói Premium")
  description: string;           // Mô tả gói
  price: number;                 // Giá gói (VD: 100000)
  duration: number;              // Thời hạn (số ngày, VD: 30)
  maxPosts: number;              // Số bài đăng tối đa
  features: string[];            // Các tính năng (VD: ["Đăng 5 bài/tháng", "Hỗ trợ 24/7"])
  isActive: boolean;             // Gói có đang hoạt động không
  createdAt: string;             // Thời gian tạo
  updatedAt: string;             // Thời gian cập nhật
}

/**
 * Interface cho form tạo/sửa package
 * Không cần id, createdAt, updatedAt vì BE tự generate
 */
export interface PackageFormData {
  name: string;
  description: string;
  price: number;
  duration: number;
  maxPosts: number;
  features: string[];
  isActive: boolean;
}

/**
 * Interface cho response từ API
 */
export interface PackageResponse {
  success: boolean;
  data: Package | Package[];
  message?: string;
}