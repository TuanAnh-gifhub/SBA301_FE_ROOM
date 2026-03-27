import api from "../../config/axios";
import type { ApiResponse } from "../notificationService";

export interface ChartDataDTO {
  label: string;
  amount: number;
}

export interface StatusDataDTO {
  label: string;
  value: number;
  color: string;
}

export interface AdminChartResponse {
  revenueDaily: ChartDataDTO[];
  revenueMonthly: ChartDataDTO[];
  bookingDaily: ChartDataDTO[];
  bookingMonthly: ChartDataDTO[];
  usersDaily: ChartDataDTO[];
  usersMonthly: ChartDataDTO[];
  revenueByStatus: StatusDataDTO[];
  bookingByStatus: StatusDataDTO[];
  roomByStatus: StatusDataDTO[];
  currentMonthRevenue: number;
  currentMonthGMV: number;
  revenueGrowth: number;
  pendingPosts: number;
}

export const adminDashboardService = {
  getChartData: () => {
    return api.get<any, ApiResponse<AdminChartResponse>>("/admin/dashboard/charts");
  },
};