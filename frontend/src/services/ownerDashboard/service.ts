import dayjs from "dayjs";
import api from "../../config/axios";

// ----------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------

export interface BookingSummary {
  totalRevenue: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}

export interface RevenueItem {
  label: string;
  revenue: number;
}

export interface BookingRevenue {
  revenueToday: number;
  revenueLast7Days: RevenueItem[];
  revenueByMonth: RevenueItem[];
  revenueByDay: RevenueItem[];
}

export interface WalletRevenue {
  totalIncome: number;
  totalCommission: number;
  netRevenue: number;
  transactions: unknown[];
}

export interface WalletInfo {
  walletId: string;
  balance: number;
  frozenAmount: number;
  isFrozen: boolean;
  frozenReason?: string;
}

export interface EscrowSummary {
  totalHoldingAmount: number;
  totalCommissionAmount: number;
  totalNetAmount: number;
  items: unknown[];
}

export interface RoomSummary {
  totalRooms: number;
  activeRooms: number;
  maintenanceRooms: number;
  inactiveRooms: number;
}

export interface ReviewStats {
  newReviewsInPeriod: number;
  avgRatingInPeriod: number | null;
  overallAvgRating: number | null;
  pendingReplyCount: number;
}

export interface RevenueData {
  label: string;
  amount: number;
}

export interface OwnerRevenueStatsResponse {
  last7Days: RevenueData[];
  monthlyInYear: RevenueData[];
}

export type TimeRange = "7d" | "30d" | "3m" | "ytd";

// ----------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------

export const getDateRange = (range: TimeRange) => {
  const now = dayjs(); // Lấy thời gian hiện tại của trình duyệt (ví dụ 14:54)
  
  // Format: "2026-03-25T14:54:40" (Không có chữ Z ở cuối để tránh bị Backend hiểu lầm là UTC)
  const to = now.format("YYYY-MM-DDTHH:mm:ss");

  let fromDate;
  switch (range) {
    case "7d":
      fromDate = now.subtract(7, "day");
      break;
    case "30d":
      fromDate = now.subtract(30, "day");
      break;
    case "3m":
      fromDate = now.subtract(3, "month");
      break;
    case "ytd":
      fromDate = now.startOf("year");
      break;
    default:
      fromDate = now.subtract(30, "day");
  }

  const from = fromDate.format("YYYY-MM-DDTHH:mm:ss");

  return { from, to };
};

// ----------------------------------------------------------------
// API CALLS
// ----------------------------------------------------------------

export const dashboardService = {
  /** API 1: Tổng booking summary */
  getBookingSummary: async (range: TimeRange): Promise<BookingSummary> => {
    const { from, to } = getDateRange(range);
    const res = await api.get("/bookings/dashboard/summary", {
      params: { from, to },
    });
    return res.data.result;
  },

  /** API 2: Biểu đồ doanh thu */
  getBookingRevenue: async (): Promise<BookingRevenue> => {
    const now = new Date();
    const res = await api.get("/bookings/dashboard/revenue", {
      params: {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      },
    });
    return res.data.result;
  },

/** API 3: Tổng thu nhập wallet */
  getWalletRevenue: async (range: TimeRange): Promise<WalletRevenue> => {
    const { from, to } = getDateRange(range);
    
    // Log này giúp bạn xác nhận toDate đã khớp với đồng hồ máy tính chưa
    console.log(`[Wallet API] Range: ${range} | From: ${from} | To: ${to}`);

    const res = await api.get("/wallet/revenue", {
      params: { fromDate: from, toDate: to },
    });
    return res.data.result;
  },

  /** API 4: Số dư ví */
  getWalletInfo: async (): Promise<WalletInfo> => {
    const res = await api.get("/wallet/me");
    return res.data.result;
  },

  /** API 5: Tiền đang giữ (escrow) */
  getEscrowSummary: async (): Promise<EscrowSummary> => {
    const res = await api.get("/wallet/escrow/pending");
    return res.data.result;
  },

  /** API 6: Thống kê phòng */
  getRoomSummary: async (): Promise<RoomSummary> => {
    const res = await api.get("/owner/dashboard/rooms-summary");
    return res.data.result;
  },

  /** API 7: Thống kê review */
  getReviewStats: async (range: TimeRange): Promise<ReviewStats> => {
    const { from, to } = getDateRange(range);
    const res = await api.get("/owner/dashboard/review-stats", {
      params: { from, to },
    });
    return res.data.result;
  },

  getOwnerRevenueStats: async (): Promise<OwnerRevenueStatsResponse> => {
    const res = await api.get("/owner/dashboard/revenue-stats");
    return res.data.result;
  },
};