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

export type TimeRange = "7d" | "30d" | "3m" | "ytd";

// ----------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------

export function getDateRange(range: TimeRange): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().slice(0, 19); // "2025-03-17T10:00:00"
  let from: Date;

  switch (range) {
    case "7d":
      from = new Date(now);
      from.setDate(now.getDate() - 7);
      break;
    case "30d":
      from = new Date(now);
      from.setDate(now.getDate() - 30);
      break;
    case "3m":
      from = new Date(now);
      from.setMonth(now.getMonth() - 3);
      break;
    case "ytd":
      from = new Date(now.getFullYear(), 0, 1); // Jan 1 of current year
      break;
  }

  return { from: from.toISOString().slice(0, 19), to };
}

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
};