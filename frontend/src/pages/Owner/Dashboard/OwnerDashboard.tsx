import { useEffect, useState, useCallback } from "react";
import { Card, Statistic, Spin, Alert, Badge, Tooltip, Select } from "antd";
import {
  HomeOutlined,
  CalendarOutlined,
  StarOutlined,
  WalletOutlined,
  RiseOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LockOutlined,
} from "@ant-design/icons";
import {
  dashboardService,
  type TimeRange,
  type BookingSummary,
  type BookingRevenue,
  type WalletRevenue,
  type WalletInfo,
  type EscrowSummary,
  type RoomSummary,
  type ReviewStats,
  type RevenueItem,
} from "../../../services/ownerDashboard/service";

// ----------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------

const formatVND = (value: number | undefined | null) => {
  if (value == null) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatRating = (value: number | null | undefined) => {
  if (value == null) return "N/A";
  return value.toFixed(1);
};

const TIME_RANGE_OPTIONS = [
  { label: "7 ngày", value: "7d" },
  { label: "30 ngày", value: "30d" },
  { label: "3 tháng", value: "3m" },
  { label: "Năm nay", value: "ytd" },
];

// ----------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------

/** Mini bar chart dùng Tailwind, không cần thư viện */
function MiniBarChart({ data, label }: { data: RevenueItem[]; label: string }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
        Không có dữ liệu
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.revenue ?? 0), 1);

  return (
    <div>
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      <div className="flex items-end gap-1 h-20">
        {data.map((item, i) => {
          const heightPct = ((item.revenue ?? 0) / maxVal) * 100;
          return (
            <Tooltip
              key={i}
              title={`${item.label}: ${formatVND(item.revenue)}`}
            >
              <div className="flex-1 flex flex-col items-center gap-1 cursor-pointer group">
                <div
                  className="w-full bg-blue-400 group-hover:bg-blue-500 rounded-t transition-all duration-200 min-h-[2px]"
                  style={{ height: `${Math.max(heightPct, 2)}%` }}
                />
              </div>
            </Tooltip>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

/** Card loading skeleton */
function StatCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
    </Card>
  );
}

/** Badge số đỏ cho pending reply */
function PendingBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
      {count}
    </span>
  );
}

// ----------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------

export default function OwnerDashboard() {
  const [range, setRange] = useState<TimeRange>("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho từng API
  const [bookingSummary, setBookingSummary] = useState<BookingSummary | null>(null);
  const [bookingRevenue, setBookingRevenue] = useState<BookingRevenue | null>(null);
  const [walletRevenue, setWalletRevenue] = useState<WalletRevenue | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [escrow, setEscrow] = useState<EscrowSummary | null>(null);
  const [roomSummary, setRoomSummary] = useState<RoomSummary | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);

  const fetchAll = useCallback(async (selectedRange: TimeRange) => {
    setLoading(true);
    setError(null);
    try {
      // Gọi song song để nhanh nhất
      const [booking, revenue, walletRev, wallet, escrowData, rooms, reviews] =
        await Promise.all([
          dashboardService.getBookingSummary(selectedRange),
          dashboardService.getBookingRevenue(),
          dashboardService.getWalletRevenue(selectedRange),
          dashboardService.getWalletInfo(),
          dashboardService.getEscrowSummary(),
          dashboardService.getRoomSummary(),
          dashboardService.getReviewStats(selectedRange),
        ]);

      setBookingSummary(booking);
      setBookingRevenue(revenue);
      setWalletRevenue(walletRev);
      setWalletInfo(wallet);
      setEscrow(escrowData);
      setRoomSummary(rooms);
      setReviewStats(reviews);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Không thể tải dữ liệu dashboard";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(range);
  }, [range, fetchAll]);

  // ----------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Tổng quan hoạt động cho thuê phòng của bạn
          </p>
        </div>
        <Select
          value={range}
          onChange={(val) => setRange(val as TimeRange)}
          options={TIME_RANGE_OPTIONS}
          className="w-32"
          size="middle"
        />
      </div>

      {/* Error */}
      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-4"
          closable
          onClose={() => setError(null)}
        />
      )}

      {/* ── ROW 1: KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            {/* Tổng doanh thu */}
            <Card className="border-l-4 border-l-blue-500 shadow-sm">
              <Statistic
                title={
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <RiseOutlined className="text-blue-500" />
                    Doanh thu
                  </span>
                }
                value={bookingSummary?.totalRevenue ?? 0}
                formatter={(v) => formatVND(Number(v))}
                valueStyle={{ fontSize: 20, fontWeight: 700, color: "#1d4ed8" }}
              />
              <p className="text-xs text-gray-400 mt-1">
                Net: {formatVND(walletRevenue?.netRevenue)}
              </p>
            </Card>

            {/* Số dư ví */}
            <Card className="border-l-4 border-l-green-500 shadow-sm">
              <Statistic
                title={
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <WalletOutlined className="text-green-500" />
                    Số dư ví
                    {walletInfo?.isFrozen && (
                      <Tooltip title="Ví đang bị khóa">
                        <LockOutlined className="text-red-400 ml-1" />
                      </Tooltip>
                    )}
                  </span>
                }
                value={walletInfo?.balance ?? 0}
                formatter={(v) => formatVND(Number(v))}
                valueStyle={{ fontSize: 20, fontWeight: 700, color: "#15803d" }}
              />
              <p className="text-xs text-gray-400 mt-1">
                Đang giữ: {formatVND(escrow?.totalNetAmount)}
              </p>
            </Card>

            {/* Tổng booking */}
            <Card className="border-l-4 border-l-purple-500 shadow-sm">
              <Statistic
                title={
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <CalendarOutlined className="text-purple-500" />
                    Booking
                  </span>
                }
                value={bookingSummary?.totalBookings ?? 0}
                valueStyle={{ fontSize: 20, fontWeight: 700, color: "#7e22ce" }}
              />
              <div className="flex gap-3 mt-1">
                <span className="text-xs text-green-500 flex items-center gap-0.5">
                  <CheckCircleOutlined />
                  {bookingSummary?.completedBookings ?? 0}
                </span>
                <span className="text-xs text-red-400 flex items-center gap-0.5">
                  <CloseCircleOutlined />
                  {bookingSummary?.cancelledBookings ?? 0}
                </span>
              </div>
            </Card>

            {/* Đánh giá */}
            <Card className="border-l-4 border-l-yellow-400 shadow-sm">
              <Statistic
                title={
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <StarOutlined className="text-yellow-400" />
                    Đánh giá
                    <PendingBadge count={reviewStats?.pendingReplyCount ?? 0} />
                  </span>
                }
                value={formatRating(reviewStats?.overallAvgRating)}
                suffix={
                  reviewStats?.overallAvgRating != null ? "/ 5" : undefined
                }
                valueStyle={{ fontSize: 20, fontWeight: 700, color: "#b45309" }}
              />
              <p className="text-xs text-gray-400 mt-1">
                +{reviewStats?.newReviewsInPeriod ?? 0} review trong kỳ
              </p>
            </Card>
          </>
        )}
      </div>

      {/* ── ROW 2: Chart + Phòng + Review ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Biểu đồ doanh thu — chiếm 2 cột */}
        <Card
          title={
            <span className="font-semibold text-gray-700">
              📈 Biểu đồ doanh thu
            </span>
          }
          className="lg:col-span-2 shadow-sm"
          extra={
            <span className="text-sm text-gray-400">
              Hôm nay: {formatVND(bookingRevenue?.revenueToday)}
            </span>
          }
        >
          {loading ? (
            <Spin className="w-full flex justify-center py-8" />
          ) : (
            <div className="space-y-4">
              <MiniBarChart
                data={bookingRevenue?.revenueLast7Days ?? []}
                label="7 ngày gần nhất"
              />
              <MiniBarChart
                data={bookingRevenue?.revenueByMonth ?? []}
                label="Theo tháng trong năm"
              />
            </div>
          )}
        </Card>

        {/* Phòng */}
        <Card
          title={
            <span className="font-semibold text-gray-700">
              🏠 Tình trạng phòng
            </span>
          }
          className="shadow-sm"
        >
          {loading ? (
            <Spin className="w-full flex justify-center py-8" />
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 flex items-center gap-1">
                  <HomeOutlined /> Tổng số phòng
                </span>
                <span className="font-bold text-gray-800 text-lg">
                  {roomSummary?.totalRooms ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Badge status="success" />
                  Đang hoạt động
                </span>
                <span className="font-semibold text-green-600">
                  {roomSummary?.activeRooms ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Badge status="warning" />
                  Đang bảo trì
                </span>
                <span className="font-semibold text-yellow-600">
                  {roomSummary?.maintenanceRooms ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Badge status="default" />
                  Ngừng hoạt động
                </span>
                <span className="font-semibold text-gray-400">
                  {roomSummary?.inactiveRooms ?? 0}
                </span>
              </div>

              {/* Mini progress bar */}
              {(roomSummary?.totalRooms ?? 0) > 0 && (
                <div className="mt-3">
                  <div className="flex rounded-full overflow-hidden h-3">
                    <div
                      className="bg-green-400 transition-all"
                      style={{
                        width: `${((roomSummary!.activeRooms / roomSummary!.totalRooms) * 100).toFixed(1)}%`,
                      }}
                    />
                    <div
                      className="bg-yellow-400 transition-all"
                      style={{
                        width: `${((roomSummary!.maintenanceRooms / roomSummary!.totalRooms) * 100).toFixed(1)}%`,
                      }}
                    />
                    <div className="bg-gray-200 flex-1" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {(
                      (roomSummary!.activeRooms / roomSummary!.totalRooms) *
                      100
                    ).toFixed(0)}
                    % đang hoạt động
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* ── ROW 3: Ví + Escrow + Review detail ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ví & hoa hồng */}
        <Card
          title={
            <span className="font-semibold text-gray-700">💰 Thu nhập ví</span>
          }
          className="shadow-sm"
        >
          {loading ? (
            <Spin className="w-full flex justify-center py-8" />
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 text-sm">Tổng thu</span>
                <span className="font-bold text-blue-600">
                  {formatVND(walletRevenue?.totalIncome)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 text-sm">Hoa hồng</span>
                <span className="text-red-400 font-medium">
                  - {formatVND(walletRevenue?.totalCommission)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-gray-100">
                <span className="text-gray-700 font-semibold">Thực nhận</span>
                <span className="font-bold text-green-600 text-lg">
                  {formatVND(walletRevenue?.netRevenue)}
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* Escrow */}
        <Card
          title={
            <span className="font-semibold text-gray-700">
              🔒 Tiền đang giữ
            </span>
          }
          className="shadow-sm"
          extra={
            <Tooltip title="Tiền được giải phóng sau 7 ngày checkout">
              <span className="text-xs text-gray-400 cursor-help">
                Giải phóng sau 7 ngày
              </span>
            </Tooltip>
          }
        >
          {loading ? (
            <Spin className="w-full flex justify-center py-8" />
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 text-sm">Tổng đang giữ</span>
                <span className="font-bold text-orange-500">
                  {formatVND(escrow?.totalHoldingAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 text-sm">Trừ hoa hồng</span>
                <span className="text-red-400 font-medium">
                  - {formatVND(escrow?.totalCommissionAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-gray-100">
                <span className="text-gray-700 font-semibold">
                  Sẽ nhận được
                </span>
                <span className="font-bold text-green-600 text-lg">
                  {formatVND(escrow?.totalNetAmount)}
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* Review detail */}
        <Card
          title={
            <span className="font-semibold text-gray-700">
              ⭐ Chi tiết đánh giá
            </span>
          }
          className="shadow-sm"
        >
          {loading ? (
            <Spin className="w-full flex justify-center py-8" />
          ) : (
            <div className="space-y-3">
              {/* Overall rating lớn */}
              <div className="text-center py-2 border-b border-gray-100">
                <div className="text-4xl font-bold text-yellow-500">
                  {formatRating(reviewStats?.overallAvgRating)}
                </div>
                <div className="text-sm text-gray-400">
                  Điểm trung bình tổng thể
                </div>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 text-sm">Trong kỳ</span>
                <span className="font-semibold text-yellow-500">
                  ⭐ {formatRating(reviewStats?.avgRatingInPeriod)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 text-sm">Review mới</span>
                <span className="font-semibold text-blue-600">
                  +{reviewStats?.newReviewsInPeriod ?? 0}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-gray-100">
                <span className="text-gray-600 flex items-center gap-1">
                  <MessageOutlined className="text-red-400" />
                  Chưa phản hồi
                </span>
                <span
                  className={`font-bold text-lg ${
                    (reviewStats?.pendingReplyCount ?? 0) > 0
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                >
                  {reviewStats?.pendingReplyCount ?? 0}
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}