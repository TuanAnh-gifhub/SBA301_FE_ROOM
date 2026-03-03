import { useEffect, useState } from "react";
import { packageService } from "../../services/package/packageService";
import type { PackageResponse } from "../../services/package/packageService";
import { subscriptionService } from "../../services/subscription/subscriptionService";
import type { SubscriptionResponse } from "../../services/subscription/subscriptionService";
import { useAuth } from "../../context/AuthContext";

// =====================================================
// PackagePage — Trang xem và mua gói premium
// =====================================================

export default function PackagePage() {
  // --- State ---
  const [packages, setPackages] = useState<PackageResponse[]>([]);       // danh sách gói
  const [mySubscription, setMySubscription] = useState<SubscriptionResponse | null>(null); // gói đang dùng
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);         // gói đang được mua (để show loading)
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { isAuthenticated } = useAuth(); // lấy trạng thái đăng nhập

  // --- Lấy dữ liệu khi component mount ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Lấy danh sách gói (public, ai cũng gọi được)
      const pkgRes = await packageService.getAllPackages();
      setPackages(pkgRes.data.result);

      // Nếu đã đăng nhập → lấy gói đang dùng
      if (isAuthenticated) {
        try {
          const subRes = await subscriptionService.getMySubscription();
          setMySubscription(subRes.data.result);
        } catch {
          // Chưa có gói → bình thường, không cần báo lỗi
          setMySubscription(null);
        }
      }
    } catch {
      setError("Không thể tải danh sách gói. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // --- Xử lý mua gói ---
  const handleBuy = async (packageId: string) => {
    if (!isAuthenticated) {
      setError("Bạn cần đăng nhập để mua gói!");
      return;
    }

    setBuyingId(packageId); // đánh dấu gói đang mua để disable button
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await subscriptionService.subscribe(packageId);
      setMySubscription(res.data.result);              // cập nhật gói đang dùng
      setSuccessMsg("Mua gói thành công! 🎉");
} catch (err: unknown) {
      // Ép kiểu err thành một object mô phỏng cấu trúc lỗi của Axios
      const error = err as { response?: { data?: { message?: string } } };
      
      // Lúc này gọi error?.response?.data?.message sẽ hoàn toàn hợp lệ và xanh mượt
      const msg = error?.response?.data?.message;
      
      if (msg === "User already has an active subscription") {
        setError("Bạn đang có gói active rồi, không thể mua thêm!");
      } else {
        setError("Mua gói thất bại. Vui lòng thử lại.");
      }
    } finally {
      setBuyingId(null); // bỏ loading
    }
  };

  // --- Format tiền VND ---
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  // --- Format ngày ---
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("vi-VN");

  // =====================================================
  // RENDER
  // =====================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* ===== TIÊU ĐỀ ===== */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Gói Premium</h1>
        <p className="text-gray-500 mt-2">
          Nâng cấp tài khoản để đăng tin ưu tiên và nhiều tính năng hơn
        </p>
      </div>

      {/* ===== THÔNG BÁO ===== */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {successMsg}
        </div>
      )}

      {/* ===== GÓI ĐANG DÙNG ===== */}
      {mySubscription && (
        <div className="mb-10 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            ✅ Gói đang sử dụng
          </h2>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
            <span>Tên gói:</span>
            <span className="font-medium">{mySubscription.packageName}</span>
            <span>Ngày bắt đầu:</span>
            <span className="font-medium">{formatDate(mySubscription.startDate)}</span>
            <span>Ngày hết hạn:</span>
            <span className="font-medium">{formatDate(mySubscription.endDate)}</span>
            <span>Trạng thái:</span>
            <span className="font-medium text-green-600">Đang hoạt động</span>
          </div>
        </div>
      )}

      {/* ===== DANH SÁCH GÓI ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          // Kiểm tra gói này có phải gói đang dùng không
          const isCurrentPkg = mySubscription?.packageId === pkg.rentPackageId;
          const isBuying = buyingId === pkg.rentPackageId;

          return (
            <div
              key={pkg.rentPackageId}
              className={`rounded-xl border p-6 flex flex-col gap-4 shadow-sm transition-all
                ${isCurrentPkg
                  ? "border-blue-400 bg-blue-50"   // highlight gói đang dùng
                  : "border-gray-200 bg-white hover:shadow-md"
                }`}
            >
              {/* Tên gói */}
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {pkg.rentPackageName}
                </h3>
                {isCurrentPkg && (
                  <span className="text-xs text-blue-600 font-medium">
                    ✅ Đang sử dụng
                  </span>
                )}
              </div>

              {/* Mô tả */}
              <p className="text-gray-500 text-sm flex-1">{pkg.description}</p>

              {/* Thời hạn + giá */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  ⏱ {pkg.durationDays} ngày
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {formatPrice(pkg.price)}
                </span>
              </div>

              {/* Nút mua */}
              <button
                onClick={() => handleBuy(pkg.rentPackageId)}
                disabled={!!mySubscription || isBuying} // disable nếu đang có gói active
                className={`w-full py-2 rounded-lg font-medium text-sm transition-all
                  ${mySubscription
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                  }`}
              >
                {isBuying
                  ? "Đang xử lý..."
                  : isCurrentPkg
                  ? "Đang dùng"
                  : mySubscription
                  ? "Đã có gói active"
                  : "Mua ngay"}
              </button>
            </div>
          );
        })}
      </div>

      {/* ===== KHÔNG CÓ GÓI NÀO ===== */}
      {packages.length === 0 && (
        <div className="text-center text-gray-400 py-20">
          Hiện chưa có gói nào. Vui lòng quay lại sau.
        </div>
      )}
    </div>
  );
}