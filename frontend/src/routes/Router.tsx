import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import LandingPage from "../pages/Customer/LandingPage/LandingPage";
import RoomDetailPage from "../pages/Customer/RoomDetailPage/RoomDetailPage";
import ChatBoxHome from "../pages/Customer/ChatBox/ChatBoxHome";
import WalletPage from "../pages/Customer/WalletPage/WalletPage";
import WalletHistoryPage from "../pages/Customer/WalletPage/WalletHistoryPage";
import WalletPromotion from "../pages/Customer/WalletPage/WalletPromotion";
import NotFound from "../components/Error/NotFound";
import AdminPage from "../pages/Admin/AdminPage";
import LoginAdmin from "../pages/Admin/LoginAdmin";
import { ProtectedAdminRoute } from "./ProtectedAdminRouter";
import { ProtectedOwnerRoute } from "./ProtectedOwnerRouter";
import AboutUs from "../pages/Customer/AboutUs/AboutUs";
import ReportPage from "../pages/Admin/ReportAdmin/ReportPage";
import ReportForm from "../pages/Customer/ReportPage/ReportForm";
import ResetPassword from "../pages/Customer/LoginPage/ResetPassword";
import UserManagement from "../pages/Admin/UserManagement/UserManagement";
import ManagePage from "../pages/Customer/ManagePage/ManagePage";
import ConfirmRegister from "../pages/Customer/LoginPage/ConfirmRegister";
import AmenityManagementPage from "../pages/Admin/AmenityManagement/AmenityManagementPage";
import CategoryManagementPage from "../pages/Admin/CategoryManagement/CategoryManagementPage";
import PostManagementPage from "../pages/Admin/PostManagement/PostManagementPage";
import ProductPage from "../pages/Customer/ProductPage/ProductPage";
import RentalDetailPage from "../pages/Customer/LandingPage/RentalDetailPage";
import PackagePage from "../pages/Customer/PackagePage";
import PackageManagementPage from "../pages/Admin/PackageManagement/PackageManagementPage";

import BookingDetail from "../pages/Customer/Booking/BookingDetail";
import PaymentSuccessPage from "../pages/Customer/Payment/PaymentSuccessPage";
import BookingPaymentResultPage from "../pages/Customer/Payment/BookingPaymentResultPage";
import WalletDepositResultPage from "../pages/Customer/WalletPage/WalletDepositResultPage";
import WalletWithdrawManagementPage from "../pages/Admin/WalletManagement/WalletWithdrawManagementPage";
import WalletFreezeManagementPage from "../pages/Admin/WalletManagement/WalletFreezeManagementPage";
import AdminWalletOverviewPage from "../pages/Admin/WalletManagement/AdminWalletOverviewPage";
import CommissionConfigManagementPage from "../pages/Admin/WalletManagement/CommissionConfigManagementPage";
import AdminDashboardOverview from "../pages/Admin/AdminDashboardOverview";
import OwnerPage from "../pages/Owner/OwnerPage";
import ManageRoomPage from "../pages/Customer/ManageRoomPage/ManageRoomPage";
import ManageBookingPage from "../pages/Owner/ManageBookingPage/ManageBookingPage";
import ManageSchedulePage from "../pages/Owner/ManageSchedule/ManageSchedulePage";
import ManagePostPage from "../pages/Customer/ManagePostPage/ManagePostPage";
import NotificationPage from "../pages/Customer/NotificationPage/NotificationPage";
import MyBookingHistoryPage from "../pages/Customer/MyBookingHistoryPage/MyBookingHistoryPage";
import BookingDetailPage from "../pages/Customer/MyBookingHistoryPage/BookingDetailPage";
import OwnerDashBoard from "../pages/Owner/Dashboard/OwnerDashboard";
import ProfilePage from "../pages/Customer/ProfilePage/ProfilePage";
import ProductDetailPage from "../pages/Customer/ProductDetail/ProductDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    handle: { breadcrumb: "Trang chủ" },
    children: [
      {
        index: true,
        element: <LandingPage />,
        handle: { breadcrumb: "Trang chủ" },
      },

      {
        path: "home",
        element: <LandingPage />,
        handle: { breadcrumb: "Trang chủ" },
      },
      {
        path: "landing",
        element: <LandingPage />,
        handle: { breadcrumb: "Trang chủ" },
      },
      {
        //  <Route path="/rentals/:id" element={<RentalDetailPage />} />
        path: "rentals/:id",
        element: <RentalDetailPage />,
      },
      {
        //    navigate(`/customer/bookings/${res.data.bookingIntentId}`);
        path: "customer/bookings/:bookingId",
        element: <BookingDetail />,
        handle: { breadcrumb: "Chi tiết booking" },
      },
      {
        path: "payment/success/:bookingId",
        element: <PaymentSuccessPage />,
        handle: { breadcrumb: "Thanh toán thành công" },
      },
      // {
      //   path: "product/:id",
      //   element: <RoomDetailPage />,
      //   handle: { breadcrumb: "Chi tiết phòng" },
      // },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "my-booking-history",
        element: <MyBookingHistoryPage />,
      },
      {
        path: "/my-booking-history/:bookingId",
        element: <BookingDetailPage />,
      },
      {
        path: "payment/booking-result",
        element: <BookingPaymentResultPage />,
        handle: { breadcrumb: "Kết quả thanh toán booking" },
      },
      {
        path: "product/:id",
        element: <RoomDetailPage />,
        handle: { breadcrumb: "Chi tiết phòng" },
      },
      {
        path: "chat",
        element: <ChatBoxHome />,
        handle: { breadcrumb: "Chat" },
      },
      {
        path: "wallet",
        element: <WalletPage />,
        handle: { breadcrumb: "Ví cá nhân" },
      },
      {
        path: "wallet/recharge",
        element: <WalletPage />,
        handle: { breadcrumb: "Nạp ví" },
      },
      {
        path: "wallet/withdraw",
        element: <WalletPage />,
        handle: { breadcrumb: "Rút tiền" },
      },
      {
        path: "wallet/revenue",
        element: <WalletPage />,
        handle: { breadcrumb: "Doanh thu" },
      },
      {
        path: "wallet/history",
        element: <WalletHistoryPage />,
        handle: { breadcrumb: "Lịch sử giao dịch" },
      },
      {
        path: "wallet/promotion",
        element: <WalletPromotion />,
        handle: { breadcrumb: "Khuyến mãi" },
      },
      {
        path: "wallet/deposit/result",
        element: <WalletDepositResultPage />,
        handle: { breadcrumb: "Kết quả nạp ví" },
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
        handle: { breadcrumb: "Đặt lại mật khẩu" },
      },
      {
        path: "manage-posts",
        element: <ManagePage />,
        handle: { breadcrumb: "Quản lý cá nhân" },
      },
      {
        path: "*",
        element: <NotFound />,
        handle: { breadcrumb: "Không tìm thấy" },
      },
      {
        path: "admin",
        element: <NotFound />,
        handle: { breadcrumb: "Không tìm thấy" },
      },
      {
        path: "register/confirm",
        element: <ConfirmRegister />,
        handle: { breadcrumb: "Xác nhận tài khoản" },
      },
      {
        path: "about-us",
        element: <AboutUs />,
        handle: { breadcrumb: "Về chúng tôi" },
      },
      {
        path: "packages",
        element: <PackagePage />,
        handle: { breadcrumb: "Gói Premium" },
      },
      {
        path: "report-form",
        element: <ReportForm />,
        handle: { breadcrumb: "Báo cáo vi phạm" },
      },
      {
        path: "products",
        element: <ProductPage />,
      },
      {
        path: "products/:postId",
        element: <ProductDetailPage />,
        handle: { breadcrumb: "Chi tiết sản phẩm" },
      },
      {
        path: "notifications",
        element: <NotificationPage />,
        handle: { breadcrumb: "Thông báo mới" },
      }
    ],
  },
  // Admin routes
  {
    path: "/admin/login",
    element: <LoginAdmin />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedAdminRoute>
        <AdminPage />
      </ProtectedAdminRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboardOverview />,
      },
      {
        path: "customers",
        element: <UserManagement />,
      },
      {
        path: "posts",
        element: <PostManagementPage />,
      },

      {
        path: "reports",
        element: <ReportPage />,
      },
      {
        path: "amenities",
        element: <AmenityManagementPage />,
      },
      {
        path: "room-types",
        element: <CategoryManagementPage />,
      },
      {
        path: "posts",
        element: <PostManagementPage />,
      },
      {
        path: "packages",
        element: <PackageManagementPage />,
      },
      {
        path: "transactions",
        element: <WalletWithdrawManagementPage />,
      },
      {
        path: "wallet-overview",
        element: <AdminWalletOverviewPage />,
      },
      {
        path: "commission-config",
        element: <CommissionConfigManagementPage />,
      },
      {
        path: "wallet-freeze",
        element: <WalletFreezeManagementPage />,
      },
    ],
  },

  //Owner
  {
    path: "/owner",
    element: (
      <ProtectedOwnerRoute >
      <OwnerPage />
       </ProtectedOwnerRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <div className="p-6">
            <h1
              className="text-2xl font-bold mb-4"
              style={{ color: "inherit" }}
            >
              Dashboard
            </h1>
            <p style={{ color: "inherit" }}>
              Chào mừng đến với trang quản trị!
            </p>
          </div>
        ),
      },
      {
path:"dashboard",
element: <OwnerDashBoard />,
      },
      {
        path: "manage-posts",
        element: <ManagePostPage />,
      },
      {
        path: "rooms",
        element: <ManageRoomPage />,
      },
      {
        path: "bookings",
        element: <ManageBookingPage />,
      },
      {
        path: "schedules",
        element: <ManageSchedulePage />,
      },
    ],
  },
]);
