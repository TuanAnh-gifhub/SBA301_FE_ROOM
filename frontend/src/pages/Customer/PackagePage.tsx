import { useEffect, useState } from "react";
import { packageService } from "../../services/package/packageService";
import type { PackageResponse } from "../../services/package/packageService";
import { subscriptionService } from "../../services/subscription/subscriptionService";
import type { SubscriptionResponse } from "../../services/subscription/subscriptionService";
import { useAuth } from "../../context/AuthContext";
import { Modal, Radio, Button } from "antd"; // Import thêm antd
import { toast } from "react-toastify"; // Thay thế state error/successMsg bằng toast

// =====================================================
// PackagePage — Trang xem và mua gói premium
// =====================================================

export default function PackagePage() {
  // --- State ---
  const [packages, setPackages] = useState<PackageResponse[]>([]);
  const [mySubscription, setMySubscription] =
    useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // --- State cho Modal Thanh toán ---
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] =
    useState<PackageResponse | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("WALLET");
  const [isProcessing, setIsProcessing] = useState(false);

  const { isAuthenticated } = useAuth();

  // --- Lấy dữ liệu khi component mount ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pkgRes = await packageService.getAllPackages();
      setPackages(pkgRes.data.result);

      if (isAuthenticated) {
        try {
          const subRes = await subscriptionService.getMySubscription();
          setMySubscription(subRes.data.result);
        } catch {
          setMySubscription(null);
        }
      }
    } catch {
      toast.error("Không thể tải danh sách gói. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // --- BƯỚC 1: Bấm nút ở gói ---
  const handleOpenCheckout = (pkg: PackageResponse) => {
    if (!isAuthenticated) {
      toast.error("Bạn cần đăng nhập để mua gói!");
      return;
    }
    if (mySubscription) {
      toast.error("Bạn đang có gói active rồi, không thể mua thêm!");
      return;
    }

    setSelectedPackage(pkg);
    setIsCheckoutModalOpen(true);
  };

  // --- BƯỚC 2: Xác nhận thanh toán trong Modal ---
  const handleConfirmPayment = async () => {
    if (!selectedPackage) return;

    if (paymentMethod !== "WALLET") {
      toast.info("Tính năng thanh toán chuyển khoản đang được phát triển!");
      return;
    }

    setIsProcessing(true);

    try {
      const res = await subscriptionService.subscribe(
        selectedPackage.rentPackageId,
      );
      setMySubscription(res.data.result);
      toast.success("Mua gói thành công! 🎉");
      setIsCheckoutModalOpen(false); // Đóng modal khi thành công
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error?.response?.data?.message;

      if (msg === "User already has an active subscription") {
        toast.error("Bạn đang có gói active rồi, không thể mua thêm!");
      } else if (msg === "Số dư trong ví không đủ để thanh toán gói cước này") {
        toast.error("Số dư ví không đủ. Vui lòng nạp thêm tiền!");
      } else {
        toast.error("Thanh toán thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Format ---
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("vi-VN");

  // =====================================================
  // RENDER
  // =====================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600" />
          <p className="text-gray-500 font-medium">Đang tải bảng giá...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ===== TIÊU ĐỀ ===== */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">
            Bảng giá
          </h2>
          <p className="mt-2 text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Nâng tầm trải nghiệm cùng Premium
          </p>
          <p className="mt-4 text-xl text-gray-500">
            Mở khóa các tính năng độc quyền, đăng tin ưu tiên và tiếp cận nhiều
            khách hàng hơn.
          </p>
        </div>

        {/* ===== GÓI ĐANG DÙNG ===== */}
        {mySubscription && (
          <div className="max-w-3xl mx-auto mb-16 p-6 sm:p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold">Gói đang sử dụng</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <div>
                <p className="text-blue-100 mb-1">Tên gói</p>
                <p className="font-semibold text-lg">
                  {mySubscription.packageName}
                </p>
              </div>
              <div>
                <p className="text-blue-100 mb-1">Trạng thái</p>
                <p className="font-semibold text-green-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  Đang hoạt động
                </p>
              </div>
              <div>
                <p className="text-blue-100 mb-1">Bắt đầu</p>
                <p className="font-semibold">
                  {formatDate(mySubscription.startDate)}
                </p>
              </div>
              <div>
                <p className="text-blue-100 mb-1">Hết hạn</p>
                <p className="font-semibold">
                  {formatDate(mySubscription.endDate)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== DANH SÁCH GÓI ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {packages.map((pkg) => {
            const isCurrentPkg =
              mySubscription?.packageId === pkg.rentPackageId;
            const isPopular =
              (pkg.rentPackageName || "").toLowerCase().includes("monthly") ||
              (pkg.description || "").includes("phổ biến");

            return (
              <div
                key={pkg.rentPackageId}
                className={`relative flex flex-col p-8 bg-white rounded-2xl transition-all duration-300
                  ${
                    isCurrentPkg
                      ? "ring-2 ring-blue-500 shadow-xl shadow-blue-100 scale-[1.02]"
                      : "border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1"
                  }`}
              >
                {/* Badge Phổ biến */}
                {isPopular && !isCurrentPkg && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-md">
                      Phổ biến nhất
                    </span>
                  </div>
                )}

                {/* Badge Đang sử dụng */}
                {isCurrentPkg && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-md flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Đang sử dụng
                    </span>
                  </div>
                )}

                {/* Tên gói & Mô tả */}
                <div className="mb-6 text-center">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {pkg.rentPackageName}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 h-10">
                    {pkg.description}
                  </p>
                </div>

                {/* Giá tiền */}
                <div className="mb-6 flex items-baseline justify-center text-gray-900">
                  <span className="text-4xl font-extrabold tracking-tight">
                    {formatPrice(pkg.price)}
                  </span>
                </div>

                <div className="mb-8 text-center border-b border-gray-100 pb-6">
                  <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Thời hạn: {pkg.durationDays} ngày
                  </span>
                </div>

                {/* Quyền lợi ảo (UI only) */}
                <ul className="flex-1 space-y-4 text-sm text-gray-600 mb-8">
                  <li className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-blue-500 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Hỗ trợ đăng tin ưu tiên</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-blue-500 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Huy hiệu thành viên Premium</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-blue-500 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Mở khóa toàn bộ tính năng</span>
                  </li>
                </ul>

                {/* Nút đăng ký */}
                <button
                  onClick={() => handleOpenCheckout(pkg)}
                  disabled={!!mySubscription}
                  className={`mt-auto w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-200
                    ${
                      mySubscription
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : isPopular && !isCurrentPkg
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg active:scale-[0.98]"
                          : "bg-blue-50 text-blue-700 hover:bg-blue-100 active:scale-[0.98]"
                    }`}
                >
                  {isCurrentPkg
                    ? "Gói hiện tại"
                    : mySubscription
                      ? "Đã có gói active"
                      : "Đăng ký ngay"}
                </button>
              </div>
            );
          })}
        </div>

        {packages.length === 0 && (
          <div className="text-center text-gray-400 py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <svg
              className="mx-auto h-12 w-12 text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p>Hiện chưa có gói nào. Vui lòng quay lại sau.</p>
          </div>
        )}

        {/* ===== MODAL XÁC NHẬN THANH TOÁN ===== */}
        <Modal
          title={<span className="text-xl font-bold">Xác nhận thanh toán</span>}
          open={isCheckoutModalOpen}
          onCancel={() => !isProcessing && setIsCheckoutModalOpen(false)}
          footer={null}
          centered
        >
          {selectedPackage && (
            <div className="mt-4">
              <div className="bg-gray-50 p-4 rounded-xl mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Gói đăng ký:</span>
                  <span className="font-bold text-lg">
                    {selectedPackage.rentPackageName}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Thời hạn:</span>
                  <span className="font-medium">
                    {selectedPackage.durationDays} ngày
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                  <span className="text-gray-600 font-medium">
                    Tổng thanh toán:
                  </span>
                  <span className="font-extrabold text-blue-600 text-xl">
                    {formatPrice(selectedPackage.price)}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-3">
                  Chọn phương thức thanh toán
                </h4>
                <Radio.Group
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  value={paymentMethod}
                  className="flex flex-col gap-3 w-full"
                >
                  <div
                    className={`border p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${paymentMethod === "WALLET" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                  >
                    <Radio value="WALLET">
                      <span className="font-medium">Ví cá nhân nội bộ</span>
                    </Radio>
                  </div>
                  <div
                    className={`border p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${paymentMethod === "PAYOS" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                  >
                    <Radio value="PAYOS">
                      <span className="font-medium">
                        Chuyển khoản QR (PayOS)
                      </span>
                      <span className="ml-2 text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded">
                        Đang phát triển
                      </span>
                    </Radio>
                  </div>
                </Radio.Group>
              </div>

              <Button
                type="primary"
                size="large"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold"
                onClick={handleConfirmPayment}
                loading={isProcessing}
              >
                Xác nhận thanh toán
              </Button>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
