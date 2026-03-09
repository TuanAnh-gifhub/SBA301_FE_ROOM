import { useEffect, useState } from "react";
import { dashboardService } from "../../../services/booking/bookingService";

export default function OwnerDashBoard() {
  const [summary, setSummary] = useState(null);

  const fetchDashboard = async () => {
    try {
      const data = await dashboardService.getSummary();
      setSummary(data);
    } catch (error) {
      console.log("Dashboard error", error);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!summary) return <div>Loading dashboard...</div>;

  return (
    <div className="p-6 grid grid-cols-4 gap-6">
      <div className="bg-white shadow rounded-xl p-5">
        <p className="text-gray-500">Tổng doanh thu</p>
        <h2 className="text-2xl font-bold text-green-600">
          {summary.totalRevenue?.toLocaleString()} đ
        </h2>
      </div>

      <div className="bg-white shadow rounded-xl p-5">
        <p className="text-gray-500">Tổng booking</p>
        <h2 className="text-2xl font-bold">{summary.totalBookings}</h2>
      </div>

      <div className="bg-white shadow rounded-xl p-5">
        <p className="text-gray-500">Booking hoàn thành</p>
        <h2 className="text-2xl font-bold text-blue-500">
          {summary.completedBookings}
        </h2>
      </div>

      <div className="bg-white shadow rounded-xl p-5">
        <p className="text-gray-500">Booking đã hủy</p>
        <h2 className="text-2xl font-bold text-red-500">
          {summary.cancelledBookings}
        </h2>
      </div>
    </div>
  );
}