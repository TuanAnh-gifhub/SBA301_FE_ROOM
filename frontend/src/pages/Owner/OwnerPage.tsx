import React, { useState, useEffect } from "react";
import { Layout, ConfigProvider, theme as antTheme } from "antd";
import { Outlet } from "react-router-dom";

import AdminHeader from "../../components/Admin/Header";
import { useAuth } from "../../context/AuthContext";
import SidebarOwner from "../../components/Owner/SideBarOwner";

const { Content } = Layout;

const THEME_KEY = "adminTheme";

const OwnerPage: React.FC = () => {
  const { user, logout } = useAuth();

  const [collapsed, setCollapsed] = useState<boolean>(false);

  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem(THEME_KEY) === "dark";
  });

  useEffect(() => {
    const themeValue = isDark ? "dark" : "light";
    localStorage.setItem(THEME_KEY, themeValue);
    document.body.setAttribute("data-theme", themeValue);
  }, [isDark]);

  const handleThemeToggle = () => setIsDark((prev) => !prev);

  const handleLogoutClick = async () => {
    await logout();
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#1677ff",
        },
      }}
    >
      <Layout className="h-screen overflow-hidden flex flex-row">
        <SidebarOwner
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed(!collapsed)}
          isDark={isDark}
          ownerUser={user}
          handleLogout={handleLogoutClick}
        />

        <Layout className="flex flex-col flex-1 min-w-0 transition-all duration-200">
          <AdminHeader
            collapsed={collapsed}
            toggleCollapsed={() => setCollapsed(!collapsed)}
            adminUser={user}
            isDark={isDark}
            onThemeToggle={handleThemeToggle}
          />

          <Content
            className={`flex-1 p-3 overflow-y-auto transition-colors duration-200 ${
              isDark ? "bg-[#141414]" : "bg-[#ffff]"
            }`}
          >
            <Outlet context={{ isDark }} />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default OwnerPage;
