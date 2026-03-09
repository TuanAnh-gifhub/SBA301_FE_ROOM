import { useState, useRef, useEffect } from "react";
import { FiMessageCircle, FiMoon, FiSun } from "react-icons/fi";
import { FaBell } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import LoginPage from "../../pages/Customer/LoginPage/LoginPage";
import ScrambleText from "./ScrambleText";
import UserMenu from "./UserMenu";

import { useAuth } from "../../context/AuthContext";
import websocketService from "../../services/websocketService";
import { toast } from "react-toastify";
import notificationService from "../../services/notificationService";

const logo =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%234da6ff'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='20' font-weight='bold' fill='white'%3EEduRoom%3C/text%3E%3C/svg%3E";

const useScrollspy = () => ({ activeSection: "hero" });

const useAuthCheck = () => {
  const { isAuthenticated } = useAuth();
  const requireAuth = (cb: () => void) => {
    if (!isAuthenticated) {
      cb();
    } else {
      cb();
    }
  };
  return { requireAuth };
};

const useUnreadMessages = () => ({ unreadMessages: [], unreadCount: 0 });

const HEADER_CONFIG = { MIN_HEIGHT: 64 } as const;

const ICON_BUTTON_CLASS =
  "relative w-9 h-9 md:w-10 md:h-10 grid place-items-center rounded-full border border-transparent hover:border-[#4da6ff] shadow-sm hover:shadow-md hover:scale-105 transition-transform duration-300 ease-in-out origin-center will-change-transform";
const PRIMARY_BUTTON_CLASS =
  "px-1.5 md:px-4 py-1.5 md:py-2 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out border hover:border-[#4da6ff]";
const BUTTON_TEXT_HOVER_CLASS =
  "text-[11px] md:text-xs whitespace-nowrap inline-block hover:scale-110 transition-transform duration-300 ease-in-out";

const Header = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const { activeSection } = useScrollspy();
  const { requireAuth } = useAuthCheck();
  const { unreadCount } = useUnreadMessages();
  const navigate = useNavigate();
  const location = useLocation();
  const [isHeaderTransparent, setIsHeaderTransparent] =
    useState<boolean>(false);

  const [headerHeight, setHeaderHeight] = useState<number>(
    HEADER_CONFIG.MIN_HEIGHT,
  );
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("landing_dark_mode") === "true";
  });

  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]); // Lưu danh sách hiển thị nhanh
  const notiRef = useRef<HTMLDivElement>(null);

  const headerRef = useRef<HTMLElement>(null);
  const headerHeightClass = "md:h-16 py-1";
  const logoSizeClass = "h-9 w-9 md:h-11 md:w-11";
  const titleTextClass = "text-base md:text-2xl";

  const handleLogoutClick = async () => {
    await logout();
    navigate("/");
  };

  useEffect(() => {
    if (isAuthenticated) {
      const fetchTopNotifications = async () => {
        try {
          const response = await notificationService.getMyNotifications(0, 10);
          if (response.code === 200 && response.result) {
            setNotifications(response.result.content);

            const unread = response.result.content.filter(
              (n) => !n.isRead,
            ).length;
            setUnreadNotificationsCount(unread);
          }
        } catch (error) {
          console.error("Lỗi lấy thông báo tại Header:", error);
        }
      };
      fetchTopNotifications();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const updateHeaderHeight = () => {
      const h = headerRef.current
        ? headerRef.current.offsetHeight
        : HEADER_CONFIG.MIN_HEIGHT;
      setHeaderHeight(h);
    };
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

  useEffect(() => {
    const isHome = location.pathname === "/";
    if (!isHome) {
      setIsHeaderTransparent(false);
      return;
    }

    const onScroll = () => {
      setIsHeaderTransparent(window.scrollY < 40);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  useEffect(() => {
    const unsubscribe = websocketService.onNotification((data) => {
      if (data.type === "CHAT") {
        const isChatPage = window.location.pathname.includes("/chat");

        const isBubbleChatOpen =
          document.querySelector(".active-chat-bubble") !== null;

        if (
          document.visibilityState === "visible" &&
          (isChatPage || isBubbleChatOpen)
        ) {
          return;
        }
      }

      setUnreadNotificationsCount((prev) => prev + 1);

      setNotifications((prev) => {
        const updatedList = [data, ...prev];
        const seenSenders = new Set<string>();

        const filtered = updatedList.filter((noti) => {
          if (noti.type === "CHAT") {
            const sId = noti.link
              ? noti.link.split("/").pop()?.split("?")[0]
              : "default";
            if (sId && seenSenders.has(sId)) return false;
            if (sId) seenSenders.add(sId);
            return true;
          }
          return true;
        });

        return filtered.slice(0, 10);
      });

      const rawId = data.link ? data.link.split("/").pop() : "default";
      const senderId = rawId ? rawId.split("?")[0] : "default";

      const customToastId =
        data.type === "CHAT"
          ? `toast-chat-${senderId}`
          : `toast-noti-${data.notificationId}`;

      const toastMessage = `🔔 ${data.notificationTitle}: ${data.notificationBody}`;

      if (toast.isActive(customToastId)) {
        toast.update(customToastId, {
          render: toastMessage,
          autoClose: 3000,
        });
      } else {
        toast.info(toastMessage, {
          toastId: customToastId,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notiRef.current && !notiRef.current.contains(event.target as Node)) {
        setIsNotiOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayUser = user
    ? {
        name: user.userName || "User",
      }
    : null;

  return (
    <>
      <header
        ref={headerRef}
        className={`w-full fixed top-0 left-0 right-0 z-50 text-[#0e0e0e] text-base leading-[1.4] transition-colors duration-300 ${
          isHeaderTransparent
            ? "border-b-0 shadow-none bg-transparent"
            : "border-b-2 border-[#4da6ff] shadow-sm bg-[rgba(228,228,228,0.82)] backdrop-blur-[2px]"
        }`}
        style={{ minHeight: `${HEADER_CONFIG.MIN_HEIGHT}px` }}
      >
        <div
          className={`w-full max-w-screen-2xl mx-auto px-2 md:px-4 flex flex-col items-center justify-center h-auto ${headerHeightClass}`}
        >
          <div className="flex items-center justify-between w-full gap-2 md:gap-4">
            {/* LOGO */}
            <div className="flex items-center shrink-0 gap-1 md:gap-3">
              <Link
                to="/"
                className="flex items-center gap-1 md:gap-2"
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  if (window.location.pathname === "/chat") {
                    e.preventDefault();
                    window.location.href = "/";
                  }
                }}
              >
                <img
                  src={logo}
                  alt="EduRoom Logo"
                  className={`${logoSizeClass} object-contain border-2 border-[#4da6ff] rounded-lg bg-white`}
                />
                {activeSection === "hero" ? (
                  <span
                    className={`relative ${titleTextClass} font-extrabold tracking-tight text-black select-none`}
                    style={{ letterSpacing: 2, marginLeft: "6px" }}
                  >
                    <motion.span
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute -left-2 -top-1 text-[#4da6ff] font-extrabold"
                      style={{ fontWeight: 900, fontSize: "1.5rem" }}
                    >
                      ⌜
                    </motion.span>
                    <span className="relative z-10 inline-block">
                      <ScrambleText
                        text="EduRoom"
                        triggerKey={activeSection}
                        className="inline-block"
                      />
                    </span>
                    <motion.span
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute -right-2 -bottom-1 text-[#4da6ff] font-extrabold"
                      style={{ fontWeight: 900, fontSize: "1.5rem" }}
                    >
                      ⌟
                    </motion.span>
                  </span>
                ) : (
                  <span
                    className={`${titleTextClass} font-extrabold tracking-tight text-black select-none`}
                    style={{
                      letterSpacing: 2,
                      marginLeft: "6px",
                      fontWeight: 900,
                    }}
                  >
                    EduRoom
                  </span>
                )}
              </Link>
            </div>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
              {(() => {
                const iconBgClass = isHeaderTransparent
                  ? "bg-transparent hover:bg-white/10"
                  : "";
                const notificationBgClass = isHeaderTransparent
                  ? iconBgClass
                  : "bg-red-50 hover:bg-red-100";
                const chatBgClass = isHeaderTransparent
                  ? iconBgClass
                  : "bg-blue-50 hover:bg-blue-100";

                return (
                  <>
                    {/* Dark Mode */}
                    <button
                      onClick={() => {
                        setIsDarkMode((prev) => {
                          const newValue = !prev;
                          localStorage.setItem(
                            "landing_dark_mode",
                            String(newValue),
                          );
                          window.dispatchEvent(
                            new CustomEvent("darkModeChanged", {
                              detail: { isDarkMode: newValue },
                            }),
                          );
                          return newValue;
                        });
                      }}
                      className={`relative inline-flex items-center h-7 w-14 rounded-full transition-colors duration-300 focus:outline-none ${
                        isHeaderTransparent
                          ? "bg-white/10 hover:bg-white/15"
                          : isDarkMode
                            ? "bg-slate-700"
                            : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-flex items-center justify-center h-6 w-6 rounded-full bg-white shadow-lg transform transition-transform duration-300 ${isDarkMode ? "translate-x-7" : "translate-x-1"}`}
                      >
                        {isDarkMode ? (
                          <FiMoon size={14} className="text-slate-700" />
                        ) : (
                          <FiSun size={14} className="text-yellow-500" />
                        )}
                      </span>
                    </button>

                    {/* Notifications */}
                    <div className="relative" ref={notiRef}>
                      <button
                        onClick={() => {
                          setIsNotiOpen(!isNotiOpen);
                          setUnreadNotificationsCount(0); // Tạm thời xóa count khi mở xem
                        }}
                        className={`${ICON_BUTTON_CLASS} ${notificationBgClass}`}
                      >
                        <FaBell size={18} className="text-[#ffcc00] m-auto" />
                        {unreadNotificationsCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px]">
                            {unreadNotificationsCount}
                          </span>
                        )}
                      </button>

                      {/* Dropdown Menu */}
                      {isNotiOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute right-0 mt-2 w-72 md:w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] overflow-hidden"
                        >
                          <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                            <span className="font-bold text-gray-700">
                              Thông báo mới
                            </span>
                            <button className="text-xs text-blue-500 hover:underline">
                              Đã đọc tất cả
                            </button>
                          </div>

                          <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="p-4 text-center text-gray-400 text-sm">
                                Chưa có thông báo nào
                              </div>
                            ) : (
                              notifications.map((n, index) => (
                                <div
                                  key={n.notificationId || index}
                                  className={`p-3 border-b hover:bg-blue-50 transition-colors cursor-pointer flex items-start gap-2 ${
                                    !n.isRead ? "bg-blue-50/50" : ""
                                  }`}
                                  onClick={() => {
                                    if (n.link) window.location.href = n.link;
                                    setIsNotiOpen(false);
                                  }}
                                >
                                  <div className="flex-1">
                                    <p
                                      className={`text-sm text-gray-800 ${!n.isRead ? "font-bold" : "font-medium"}`}
                                    >
                                      {n.notificationTitle}
                                    </p>
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                      {n.notificationBody}
                                    </p>
                                  </div>
                                  {!n.isRead && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                                  )}
                                </div>
                              ))
                            )}
                          </div>

                          <Link
                            to="/notifications"
                            onClick={() => setIsNotiOpen(false)}
                            className="block p-2 text-center text-sm font-medium text-blue-600 hover:bg-gray-100 border-t"
                          >
                            Xem tất cả thông báo
                          </Link>
                        </motion.div>
                      )}
                    </div>

                    {/* Chat */}
                    <button
                      onClick={() => {
                        requireAuth(() => {
                          navigate("/chat");
                        });
                      }}
                      className={`${ICON_BUTTON_CLASS} ${chatBgClass}`}
                      title="Chat"
                    >
                      <FiMessageCircle
                        size={18}
                        className="md:text-[20px] text-[#4da6ff] m-auto"
                      />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center animate-pulse">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Đăng phòng */}
                    <button
                      onClick={() => requireAuth(() => navigate("/post-item"))}
                      className={`${PRIMARY_BUTTON_CLASS} inline-flex items-center justify-center h-10 md:h-11 px-3 md:px-5 py-2 md:py-2.5 bg-[#4da6ff]/70 hover:bg-[#4da6ff]/90 text-white border-[#4da6ff]/50 hover:border-[#4da6ff]`}
                      title="Đăng tin"
                    >
                      <span
                        className={`${BUTTON_TEXT_HOVER_CLASS} leading-none`}
                      >
                        Đăng phòng
                      </span>
                    </button>

                    {/* Gói Premium */}
                    <Link
                      to="/packages"
                      className={`${PRIMARY_BUTTON_CLASS} inline-flex items-center justify-center h-10 md:h-11 px-3 md:px-5 py-2 md:py-2.5
                      ${
                        isHeaderTransparent
                          ? "bg-white/10 text-white border-white/30 hover:bg-white/20"
                          : "bg-yellow-400/80 hover:bg-yellow-400 text-white border-yellow-400/50 hover:border-yellow-500"
                      }`}
                      title="Gói Premium"
                    >
                      <span
                        className={`${BUTTON_TEXT_HOVER_CLASS} leading-none`}
                      >
                        ⭐ Gói Premium
                      </span>
                    </Link>

                    {/* --- 5. USER MENU MỚI --- */}
                    {isLoading ? (
                      // Skeleton Loader khi đang check Auth từ Context
                      <div className="w-10 h-10 ml-2 bg-gray-200 rounded-full animate-pulse" />
                    ) : (
                      <UserMenu
                        isLoggedIn={isAuthenticated}
                        user={displayUser}
                        onLoginClick={() => setShowLoginModal(true)}
                        onLogoutClick={handleLogoutClick}
                        isHeaderTransparent={isHeaderTransparent}
                      />
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </header>

      <div style={{ height: headerHeight }} />

      <LoginPage
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};

export default Header;
