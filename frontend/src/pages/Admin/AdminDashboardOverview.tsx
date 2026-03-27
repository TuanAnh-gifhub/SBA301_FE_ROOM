import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, Statistic, Spin, Alert } from "antd";
import {
  RiseOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  BankOutlined,
  UsergroupAddOutlined,
  PieChartOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import {
  adminDashboardService,
  type AdminChartResponse,
  type ChartDataDTO,
} from "../../services/dashboard/adminDashboardService";
import {
  userService,
  type NewUserStatsResponse,
} from "../../services/usersService";
import { getAdminPendingEscrow } from "../../services/wallet/walletService";

type TimeRange = "7d" | "30d" | "3m" | "ytd";

interface StatusData {
  label: string;
  value: number;
  color: string;
}

interface AdminDashboardMockData {
  platformRevenue: number;
  totalGMV: number;
  pendingRooms: number;
  pendingWithdrawals: number;
  roomStats: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
  };
}

// ----------------------------------------------------------------
// HELPERS & SUB-COMPONENTS
// ----------------------------------------------------------------

const formatVND = (value: number | undefined | null) => {
  if (value == null) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

function StatCardSkeleton() {
  return (
    <Card className="animate-pulse shadow-sm">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
    </Card>
  );
}

function MiniBarChart({
  data,
  label,
  colorClass = "bg-blue-500 hover:bg-blue-600",
  isCurrency = false,
}: {
  data: ChartDataDTO[];
  label: string;
  colorClass?: string;
  isCurrency?: boolean;
}) {
  if (!data || data.length === 0)
    return (
      <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
        Không có dữ liệu
      </div>
    );
  const maxVal = Math.max(...data.map((d) => d.amount ?? 0), 0);
  return (
    <div className="mb-6 last:mb-0">
      <p className="text-sm font-medium text-gray-500 mb-3">{label}</p>
      <div className="flex items-end gap-1 h-32">
        {data.map((item, i) => {
          const heightPct =
            maxVal > 0 ? ((item.amount ?? 0) / maxVal) * 100 : 0;
          const displayVal = isCurrency
            ? formatVND(item.amount)
            : item.amount.toLocaleString();
          return (
            <div
              key={i}
              className={`w-full ${colorClass} rounded-t transition-all duration-200 cursor-pointer relative group`}
              style={{
                height: `${heightPct}%`,
                minHeight: item.amount > 0 ? "4px" : "2px",
              }}
            >
              <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap pointer-events-none transition-opacity z-10">
                {item.label}: {displayVal}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

function StatusDonutChart({
  data,
  isCurrency = false,
}: {
  data: StatusData[];
  isCurrency?: boolean;
}) {
  if (!data || data.length === 0) return null;
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let startAngle = 0;
  const gradientParts = data.map((item) => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const part = `${item.color} ${startAngle}% ${startAngle + percentage}%`;
    startAngle += percentage;
    return part;
  });

  return (
    <div className="flex flex-col items-center pt-4">
      <div
        className="w-40 h-40 rounded-full relative shadow-inner mb-6"
        style={{ background: `conic-gradient(${gradientParts.join(", ")})` }}
      >
        <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
          <span className="text-xs text-gray-400">Tổng cộng</span>
          <span className="font-bold text-gray-700 text-sm">
            {isCurrency ? "100%" : total.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="w-full space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="text-gray-600">{item.label}</span>
            </div>
            <div className="text-right">
              <span className="font-medium mr-2">
                {isCurrency
                  ? formatVND(item.value)
                  : item.value.toLocaleString()}
              </span>
              <span className="text-gray-400 text-xs">
                ({total > 0 ? ((item.value / total) * 100).toFixed(1) : "0"}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------

export default function AdminDashboardOverview() {
  const [range, setRange] = useState<TimeRange>("30d");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  // --- THÔNG SỐ DATA THẬT TỪ API ---
  const [disputedCount, setDisputedCount] = useState<number>(0);
  const [newUsersData, setNewUsersData] = useState<NewUserStatsResponse | null>(
    null,
  );
  const [chartData, setChartData] = useState<AdminChartResponse | null>(null);

  // --- MOCK DATA (Cho các phần chưa code API) ---
  const [mockData, setMockData] = useState<AdminDashboardMockData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrors([]);

    try {
      // 1. GỌI API THẬT (Chạy song song 3 API)
      const [escrowRes, usersRes, chartsRes] = await Promise.allSettled([
        getAdminPendingEscrow(1, 1, true),
        userService.getNewUserStats(range),
        adminDashboardService.getChartData(), // <-- Gọi API Biểu đồ mới
      ]);

      // Xử lý Escrow
      if (escrowRes.status === "fulfilled") {
        setDisputedCount(escrowRes.value.totalElements || 0);
      } else setErrors((prev) => [...prev, "Lỗi tải dữ liệu Escrow"]);

      // Xử lý Người dùng mới
      if (usersRes.status === "fulfilled") {
        const payload = usersRes.value as any;
        setNewUsersData(
          payload?.data?.result ||
            payload?.result ||
            payload || { total: 0, hosts: 0, tenants: 0 },
        );
      } else setErrors((prev) => [...prev, "Lỗi tải thống kê Người dùng mới"]);

      // Xử lý Dữ liệu Biểu đồ
      if (chartsRes.status === "fulfilled") {
        const payload = chartsRes.value as any;
        setChartData(payload?.data?.result || payload?.result || payload);
      } else setErrors((prev) => [...prev, "Lỗi tải dữ liệu biểu đồ"]);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Tổng quan hoạt động và kiểm duyệt hệ thống
          </p>
        </div>
      </div>

      {errors.length > 0 && (
        <Alert
          type="warning"
          message={`${errors.length} API gặp sự cố`}
          description={
            <ul className="text-xs mt-1 space-y-0.5">
              {errors.map((e, i) => (
                <li key={i}>• {e}</li>
              ))}
            </ul>
          }
          className="mb-4 shadow-sm"
          closable
          onClose={() => setErrors([])}
        />
      )}

      {/* ── ROW 1: KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <ExclamationCircleOutlined className="text-orange-500" />{" "}
                    Escrow khiếu nại
                  </span>
                }
                value={disputedCount}
                valueStyle={{ fontSize: 22, fontWeight: 700, color: "#ea580c" }}
              />
              <div className="mt-2">
                <Link
                  to="/admin/wallet-overview"
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Xử lý ngay &rarr;
                </Link>
              </div>
            </Card>

            {/* THẺ TIN CHỜ DUYỆT ĐÃ ĐƯỢC CẬP NHẬT */}
            <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <FileTextOutlined className="text-blue-500" /> Tin chờ duyệt
                  </span>
                }
                // ĐỔI mockData?.pendingRooms THÀNH chartData?.pendingPosts
                value={chartData?.pendingPosts ?? 0}
                valueStyle={{ fontSize: 22, fontWeight: 700, color: "#3b82f6" }}
              />
              <div className="mt-2">
                <Link
                  to="/admin/posts"
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Xem danh sách &rarr;
                </Link>
              </div>
            </Card>

            <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <BankOutlined className="text-purple-500" /> Yêu cầu rút
                    tiền
                  </span>
                }
                value={mockData?.pendingWithdrawals}
                valueStyle={{ fontSize: 22, fontWeight: 700, color: "#a855f7" }}
              />
              <div className="mt-2">
                <Link
                  to="/admin/finance"
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Kiểm duyệt ví &rarr;
                </Link>
              </div>
            </Card>

            <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <UsergroupAddOutlined className="text-emerald-500" /> Người
                    dùng mới
                  </span>
                }
                value={newUsersData?.total ?? 0}
                valueStyle={{ fontSize: 22, fontWeight: 700, color: "#10b981" }}
              />
              <div className="flex gap-3 mt-2">
                <span className="text-xs text-gray-500">
                  Chủ:{" "}
                  <strong className="text-emerald-600">
                    {newUsersData?.hosts ?? 0}
                  </strong>
                </span>
                <span className="text-xs text-gray-500">
                  Khách:{" "}
                  <strong className="text-emerald-600">
                    {newUsersData?.tenants ?? 0}
                  </strong>
                </span>
              </div>
            </Card>

            {/* THẺ DOANH THU ĐÃ CẬP NHẬT DATA THẬT */}
            <Card className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <RiseOutlined className="text-indigo-500" /> Doanh thu
                    (Tháng này)
                  </span>
                }
                value={chartData?.currentMonthRevenue ?? 0}
                formatter={(v) => formatVND(Number(v))}
                valueStyle={{ fontSize: 24, fontWeight: 700, color: "#4f46e5" }}
              />
              <div className="flex items-center justify-between mt-2 border-t border-gray-100 pt-2">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    (chartData?.revenueGrowth ?? 0) >= 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {(chartData?.revenueGrowth ?? 0) > 0 ? "+" : ""}
                  {chartData?.revenueGrowth?.toFixed(1) ?? 0}%
                </span>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* ── ROW 2: DOANH THU ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card
          title={
            <span className="font-semibold text-gray-700">
              <BarChartOutlined className="mr-2 text-indigo-500" />
              Biểu đồ Doanh thu
            </span>
          }
          className="lg:col-span-2 shadow-sm"
        >
          {loading ? (
            <Spin className="w-full flex justify-center py-12" />
          ) : (
            <>
              {/* SỬ DỤNG DATA THẬT */}
              <MiniBarChart
                data={chartData?.revenueDaily ?? []}
                label="Theo 7 ngày gần nhất"
                colorClass="bg-indigo-400 hover:bg-indigo-500"
                isCurrency
              />
              <div className="h-px bg-gray-100 my-4" />
              <MiniBarChart
                data={chartData?.revenueMonthly ?? []}
                label="Theo các tháng trong năm"
                colorClass="bg-indigo-400 hover:bg-indigo-500"
                isCurrency
              />
            </>
          )}
        </Card>
        <Card
          title={
            <span className="font-semibold text-gray-700">
              <PieChartOutlined className="mr-2 text-indigo-500" />
              Trạng thái Doanh thu
            </span>
          }
          className="shadow-sm"
        >
          {loading ? (
            <Spin className="w-full flex justify-center py-12" />
          ) : (
            <StatusDonutChart
              data={chartData?.revenueByStatus ?? []}
              isCurrency
            />
          )}
        </Card>
      </div>

      {/* ── ROW 3: BOOKING ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card
          title={
            <span className="font-semibold text-gray-700">
              <BarChartOutlined className="mr-2 text-blue-500" />
              Thống kê Booking
            </span>
          }
          className="lg:col-span-2 shadow-sm"
        >
          {loading ? (
            <Spin className="w-full flex justify-center py-12" />
          ) : (
            <>
              {/* SỬ DỤNG DATA THẬT */}
              <MiniBarChart
                data={chartData?.bookingDaily ?? []}
                label="Theo 7 ngày gần nhất"
                colorClass="bg-blue-400 hover:bg-blue-500"
              />
              <div className="h-px bg-gray-100 my-4" />
              <MiniBarChart
                data={chartData?.bookingMonthly ?? []}
                label="Theo các tháng trong năm"
                colorClass="bg-blue-400 hover:bg-blue-500"
              />
            </>
          )}
        </Card>
        <Card
          title={
            <span className="font-semibold text-gray-700">
              <PieChartOutlined className="mr-2 text-blue-500" />
              Trạng thái Booking
            </span>
          }
          className="shadow-sm"
        >
          {loading ? (
            <Spin className="w-full flex justify-center py-12" />
          ) : (
            <StatusDonutChart data={chartData?.bookingByStatus ?? []} />
          )}
        </Card>
      </div>

      {/* ── ROW 4: NGƯỜI DÙNG & PHÒNG (Đã đổi sang Data thật) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card
          title={
            <span className="font-semibold text-gray-700">
              <BarChartOutlined className="mr-2 text-emerald-500" />
              Người dùng đăng ký mới
            </span>
          }
          className="lg:col-span-2 shadow-sm"
        >
          {loading ? (
            <Spin className="w-full flex justify-center py-12" />
          ) : (
            <>
              {/* ĐỔI TỪ MOCK DATA SANG CHART DATA */}
              <MiniBarChart
                data={chartData?.usersDaily ?? []}
                label="Theo 7 ngày gần nhất"
                colorClass="bg-emerald-400 hover:bg-emerald-500"
              />
              <div className="h-px bg-gray-100 my-4" />
              <MiniBarChart
                data={chartData?.usersMonthly ?? []}
                label="Theo các tháng trong năm"
                colorClass="bg-emerald-400 hover:bg-emerald-500"
              />
            </>
          )}
        </Card>

        <Card
          title={
            <span className="font-semibold text-gray-700">
              <PieChartOutlined className="mr-2 text-emerald-500" /> Trạng thái
              tin đăng
            </span>
          }
          className="shadow-sm"
        >
          {loading ? (
            <Spin className="w-full flex justify-center py-12" />
          ) : (
            <StatusDonutChart data={chartData?.roomByStatus ?? []} />
          )}
        </Card>
      </div>
    </div>
  );
}
