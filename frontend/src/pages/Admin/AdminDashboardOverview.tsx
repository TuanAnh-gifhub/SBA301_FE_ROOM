import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminPendingEscrow } from "../../services/wallet/walletService";

type ErrorWithResponse = { response?: { data?: { message?: string } } };

const AdminDashboardOverview = () => {
  const [disputedCount, setDisputedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDisputedEscrow = async () => {
      try {
        const result = await getAdminPendingEscrow(1, 1, true);
        setDisputedCount(result.totalElements || 0);
      } catch (e: unknown) {
        const err = e as ErrorWithResponse;
        setError(err?.response?.data?.message ?? "Không tải được cảnh báo escrow.");
      }
    };
    fetchDisputedEscrow();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Chào mừng đến với trang quản trị!</p>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-600 mb-1">Escrow đang có khiếu nại</p>
        <p className="text-2xl font-bold text-orange-600">{disputedCount}</p>
        <div className="mt-2">
          <Link to="/admin/wallet-overview" className="text-sm text-blue-600 hover:underline">
            Mở trang quản lý escrow
          </Link>
        </div>
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default AdminDashboardOverview;
