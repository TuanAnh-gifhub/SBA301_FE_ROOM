import React, { useState, useEffect } from "react";
import { Layout, Menu, type MenuProps } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  CalendarOutlined,
  FileTextOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import type { UserResponse } from "../../services/usersService";

const { Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

interface SidebarProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
  isDark: boolean;
  ownerUser: UserResponse | null;
  handleLogout: () => void;
}

const SidebarOwner: React.FC<SidebarProps> = ({
  collapsed,
  isDark,
  ownerUser,
  handleLogout,
}) => {
  const location = useLocation();
  const [activeKey, setActiveKey] = useState<string>(location.pathname);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    setActiveKey(location.pathname);
  }, [location.pathname]);

  const onOpenChange: MenuProps["onOpenChange"] = (keys) => {
    setOpenKeys(keys);
  };

  const items: MenuItem[] = [
    getItem(
      <Link to="/owner/dashboard">Báo cáo và thống kê</Link>,
      "/owner/dashboard",
      <FileTextOutlined />,
    ),
    getItem(
      <Link to="/owner/manage-posts">Quản lý tin đăng</Link>,
      "/owner/manage-posts",
      <FileTextOutlined />,
    ),
    getItem(
      <Link to="/owner/rooms">Quản lý phòng</Link>,
      "/owner/rooms",
      <HomeOutlined />,
    ),
    getItem(
      <Link to="/owner/bookings">Quản lý đặt lịch</Link>,
      "/owner/bookings",
      <CalendarOutlined />,
    ),
    getItem(
      <Link to="/owner/schedules">Lịch hẹn</Link>,
      "/owner/schedules",
      <CalendarOutlined />,
    ),
  ];

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key === "logout") {
      handleLogout();
    }
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={260}
      theme={isDark ? "dark" : "light"}
      className="shadow-md z-20"
      style={{
        borderRight: isDark ? "1px solid #303030" : "1px solid #f0f0f0",
      }}
    >
      {/* Logo Section */}
         <Link
              to="/"
             
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#2563eb] transition-colors"
            >
               <div
        className={`h-16 flex items-center justify-center border-b transition-colors ${
          isDark ? "border-gray-700 bg-[#001529]" : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden px-4">
          <div className="min-w-[32px] h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            E
          </div>
          {!collapsed && (
            <div
              className={`font-bold text-xl tracking-tight whitespace-nowrap transition-opacity duration-300 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              EduRoom
            </div>
          )}
        </div>
      </div>
      </Link>
     

      <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar py-2">
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          items={items}
          onClick={handleMenuClick}
          theme={isDark ? "dark" : "light"}
          style={{ border: "none", background: "transparent" }}
        />
      </div>
    </Sider>
  );
};

export default SidebarOwner;
