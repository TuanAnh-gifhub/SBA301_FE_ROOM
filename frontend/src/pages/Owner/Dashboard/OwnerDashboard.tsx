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
  DashboardOutlined,
} from "@ant-design/icons";
import {
  dashboardService,
  type TimeRange,
  type BookingSummary,
  type WalletRevenue,
  type WalletInfo,
  type EscrowSummary,
  type RoomSummary,
  type ReviewStats,
  type RevenueData,
  type OwnerRevenueStatsResponse,
} from "../../../services/ownerDashboard/service";
import PageHeader from "../../../components/Header/PageHeader";

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

function unwrap<T>(result: PromiseSettledResult<T>, fallback: T): T {
  if (result.status === "fulfilled") return result.value;
  console.warn("[Dashboard] API lỗi:", result.reason?.message ?? result.reason);
  return fallback;
}

function MiniBarChart({ data, label }: { data: RevenueData[]; label: string }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-gray-400 text-sm rounded-2xl bg-slate-50">
        Không có dữ liệu
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.amount ?? 0), 0);

  return (
    <div className="rounded-2xl border border-slate-100 p-4">
      <p className="text-sm font-medium text-slate-600 mb-3">{label}</p>
      <div className="flex items-end gap-2 h-24">
        {data.map((item, i) => {
          const heightPct =
            maxVal > 0 ? ((item.amount ?? 0) / maxVal) * 100 : 0;

          return (
            <div key={i} className="flex-1 flex flex-col justify-end">
              <div
                className="w-full rounded-t-xl bg-gradient-to-t from-sky-500 to-cyan-400 transition-all duration-200"
                style={{
                  height: `${heightPct}%`,
                  minHeight: item.amount > 0 ? "6px" : "3px",
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-slate-400 mt-2">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="animate-pulse rounded-3xl">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
    </Card>
  );
}

function PendingBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
      {count}
    </span>
  );
}

export default function OwnerDashboard() {
  const [range, setRange] = useState<TimeRange>("30d");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  const [bookingSummary, setBookingSummary] = useState<BookingSummary | null>(
    null,
  );
  const [revenueStats, setRevenueStats] =
    useState<OwnerRevenueStatsResponse | null>(null);
  const [walletRevenue, setWalletRevenue] = useState<WalletRevenue | null>(
    null,
  );
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [escrow, setEscrow] = useState<EscrowSummary | null>(null);
  const [roomSummary, setRoomSummary] = useState<RoomSummary | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);

  const fetchAll = useCallback(async (selectedRange: TimeRange) => {
    setLoading(true);
    setErrors([]);

    const [
      bookingRes,
      revenueStatsRes,
      walletRevRes,
      walletRes,
      escrowRes,
      roomsRes,
      reviewsRes,
    ] = await Promise.allSettled([
      dashboardService.getBookingSummary(selectedRange),
      dashboardService.getOwnerRevenueStats(),
      dashboardService.getWalletRevenue(selectedRange),
      dashboardService.getWalletInfo(),
      dashboardService.getEscrowSummary(),
      dashboardService.getRoomSummary(),
      dashboardService.getReviewStats(selectedRange),
    ]);

    setBookingSummary(unwrap(bookingRes, null));
    setRevenueStats(unwrap(revenueStatsRes, null));
    setWalletRevenue(unwrap(walletRevRes, null));
    setWalletInfo(unwrap(walletRes, null));
    setEscrow(unwrap(escrowRes, null));
    setRoomSummary(unwrap(roomsRes, null));
    setReviewStats(unwrap(reviewsRes, null));

    const failed = [
      bookingRes,
      revenueStatsRes,
      walletRevRes,
      walletRes,
      escrowRes,
      roomsRes,
      reviewsRes,
    ]
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map(
        (r) =>
          r.reason?.response?.data?.message ?? r.reason?.message ?? "API lỗi",
      );

    if (failed.length > 0) {
      setErrors(failed);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll(range);
  }, [range, fetchAll]);

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
      <PageHeader
        title="Dashboard chủ phòng"
        subtitle="Tổng quan doanh thu, booking, phòng và đánh giá của hệ thống cho thuê"
        icon={<DashboardOutlined />}
        extra={
          <Select
            value={range}
            onChange={(val) => setRange(val as TimeRange)}
            options={TIME_RANGE_OPTIONS}
            className="w-36"
            size="large"
          />
        }
      />

      {errors.length > 0 && (
        <Alert
          type="warning"
          message={`${errors.length} API chưa sẵn sàng — một số widget hiển thị 0`}
          description={
            <ul className="text-xs mt-1 space-y-0.5">
              {errors.map((e, i) => (
                <li key={i}>• {e}</li>
              ))}
            </ul>
          }
          className="mb-4 rounded-2xl"
          closable
          onClose={() => setErrors([])}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <Card className="!rounded-3xl !shadow-sm !border-0 bg-white">
              <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 mb-4" />
              <Statistic
                title={
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <RiseOutlined className="text-blue-500" /> Doanh thu
                  </span>
                }
                value={bookingSummary?.totalRevenue ?? 0}
                formatter={(v) => formatVND(Number(v))}
                valueStyle={{ fontSize: 24, fontWeight: 700, color: "#1d4ed8" }}
              />
              <p className="text-xs text-gray-400 mt-2">
                Net: {formatVND(walletRevenue?.netRevenue)}
              </p>
            </Card>

            <Card className="!rounded-3xl !shadow-sm !border-0 bg-white">
              <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 mb-4" />
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
                valueStyle={{ fontSize: 24, fontWeight: 700, color: "#15803d" }}
              />
              <p className="text-xs text-gray-400 mt-2">
                Đang giữ: {formatVND(escrow?.totalNetAmount)}
              </p>
            </Card>

            <Card className="!rounded-3xl !shadow-sm !border-0 bg-white">
              <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400 mb-4" />
              <Statistic
                title={
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <CalendarOutlined className="text-purple-500" /> Booking
                  </span>
                }
                value={bookingSummary?.totalBookings ?? 0}
                valueStyle={{ fontSize: 24, fontWeight: 700, color: "#7e22ce" }}
              />
              <div className="flex gap-4 mt-2">
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <CheckCircleOutlined />
                  {bookingSummary?.completedBookings ?? 0}
                </span>
                <span className="text-xs text-red-400 flex items-center gap-1">
                  <CloseCircleOutlined />
                  {bookingSummary?.cancelledBookings ?? 0}
                </span>
              </div>
            </Card>

            <Card className="!rounded-3xl !shadow-sm !border-0 bg-white">
              <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 mb-4" />
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
                valueStyle={{ fontSize: 24, fontWeight: 700, color: "#b45309" }}
              />
              <p className="text-xs text-gray-400 mt-2">
                +{reviewStats?.newReviewsInPeriod ?? 0} review trong kỳ
              </p>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card
          title={
            <span className="font-semibold text-slate-700">
              📈 Biểu đồ doanh thu
            </span>
          }
          className="lg:col-span-2 !rounded-3xl !shadow-sm !border-0"
        >
          {loading ? (
            <Spin className="w-full flex justify-center py-8" />
          ) : (
            <div className="space-y-4">
              <MiniBarChart
                data={revenueStats?.last7Days ?? []}
                label="7 ngày gần nhất"
              />
              <MiniBarChart
                data={revenueStats?.monthlyInYear ?? []}
                label="Theo tháng trong năm"
              />
            </div>
          )}
        </Card>

        <Card
          title={
            <span className="font-semibold text-slate-700">
              🏠 Tình trạng phòng
            </span>
          }
          className="!rounded-3xl !shadow-sm !border-0"
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
                  <Badge status="success" /> Đang hoạt động
                </span>
                <span className="font-semibold text-green-600">
                  {roomSummary?.activeRooms ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Badge status="warning" /> Đang bảo trì
                </span>
                <span className="font-semibold text-yellow-600">
                  {roomSummary?.maintenanceRooms ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Badge status="default" /> Ngừng hoạt động
                </span>
                <span className="font-semibold text-gray-400">
                  {roomSummary?.inactiveRooms ?? 0}
                </span>
              </div>

              {(roomSummary?.totalRooms ?? 0) > 0 && (
                <div className="mt-4 rounded-2xl bg-slate-50 p-3">
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
                  <p className="text-xs text-gray-400 mt-2 text-right">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card
          title={
            <span className="font-semibold text-slate-700">💰 Thu nhập ví</span>
          }
          className="!rounded-3xl !shadow-sm !border-0"
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

        <Card
          title={
            <span className="font-semibold text-slate-700">
              🔒 Tiền đang giữ
            </span>
          }
          className="!rounded-3xl !shadow-sm !border-0"
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

        <Card
          title={
            <span className="font-semibold text-slate-700">
              ⭐ Chi tiết đánh giá
            </span>
          }
          className="!rounded-3xl !shadow-sm !border-0"
        >
          {loading ? (
            <Spin className="w-full flex justify-center py-8" />
          ) : (
            <div className="space-y-3">
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
                  <MessageOutlined className="text-red-400" /> Chưa phản hồi
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
