import React, { useState } from "react";
import { Tabs } from "antd";
import { FileTextOutlined, HomeOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import ManagePostPage from "../ManagePostPage/ManagePostPage";
import ManageRoomPage from "../ManageRoomPage/ManageRoomPage";
import ManageBookingPage from "../../Owner/ManageBookingPage/ManageBookingPage";
import ManageSchedulePage from "../../Owner/ManageSchedule/ManageSchedulePage";

const ManagePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Xác định tab active dựa trên hash hoặc query params
    const getActiveTab = () => {
        if (location.hash === "#rooms" || location.search.includes("tab=rooms")) {
            return "rooms";
        }
        return "posts"; // default
    };

    const [activeTab, setActiveTab] = useState<string>(getActiveTab());

    const handleTabChange = (key: string) => {
        setActiveTab(key);
        // Cập nhật URL mà không reload trang
        if (key === "rooms") {
            navigate("/manage-posts#rooms", { replace: true });
        } else {
            navigate("/manage-posts", { replace: true });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    type="card"
                    size="large"
                    className="manage-tabs"
                    items={[
                        {
                            key: "posts",
                            label: (
                                <span className="flex items-center gap-2">
                                    <FileTextOutlined />
                                    Quản lý tin đăng
                                </span>
                            ),
                            children: <ManagePostPage />,
                        },
                        {
                            key: "rooms",
                            label: (
                                <span className="flex items-center gap-2">
                                    <HomeOutlined />
                                    Quản lý phòng
                                </span>
                            ),
                            children: <ManageRoomPage />,
                        },
                        {
                            key: "bookings",
                            label: (
                                <span className="flex items-center gap-2">
                                    <HomeOutlined />
                                    Quản lý đặt lịch
                                </span>
                            ),
                            children: <ManageBookingPage />,
                        },
                        {
                            key: "schedules",
                            label: (
                                <span className="flex items-center gap-2">
                                    <HomeOutlined />
                                    Lịch hẹn 
                                </span>
                            ),
                            children: <ManageSchedulePage />,
                        }
                    ]}
                />
            </div>
        </div>
    );
};

export default ManagePage;
