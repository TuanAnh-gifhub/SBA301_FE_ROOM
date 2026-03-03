import api from "../../config/axios";
import type { ApiResponse } from "../usersService";

// ===== INTERFACES =====
// Khớp 100% với SubscriptionResponse.java ở BE

export interface SubscriptionResponse {
  subscriptionId: string;
  userId: string;
  userName: string;
  packageId: string;
  packageName: string;
  price: number;
  startDate: string;           // LocalDateTime → string
  endDate: string;             // LocalDateTime → string
  active: boolean;
  createdAt: string;
}

// ===== SERVICE =====

export const subscriptionService = {
  // User mua gói — cần đăng nhập
  // BE tự lấy userId từ JWT token, FE chỉ gửi packageId
  subscribe: (packageId: string) => {
    return api.post<ApiResponse<SubscriptionResponse>>("/subscriptions", {
      packageId,
    });
  },

  // User xem gói đang dùng của mình — cần đăng nhập
  getMySubscription: () => {
    return api.get<ApiResponse<SubscriptionResponse>>("/subscriptions/me");
  },

  // Admin xem subscription của user bất kỳ — cần ADMIN role
  getSubscriptionByUserId: (userId: string) => {
    return api.get<ApiResponse<SubscriptionResponse>>(
      `/subscriptions/user/${userId}`
    );
  },
};