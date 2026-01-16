import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import LandingPage from "../pages/Customer/LandingPage/LandingPage";
import RoomDetailPage from "../pages/Customer/RoomDetailPage/RoomDetailPage";
import NotFound from "../components/Error/NotFound";

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
        path: "product/:id",
        element: <RoomDetailPage />,
        handle: { breadcrumb: "Chi tiết phòng" },
      },
      {
        path: "*",
        element: <NotFound />,
        handle: { breadcrumb: "Không tìm thấy" },
      },
    ],
  },
]);
