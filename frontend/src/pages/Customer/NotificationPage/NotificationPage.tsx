import React, { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";
import websocketService from "../../../services/websocketService";
import { formatDistanceToNow } from "date-fns"; // Thư viện để format "2 phút trước"
import { vi } from "date-fns/locale";

const NotificationPage = () => {
  const [allNotis, setAllNotis] = useState<any[]>([]);

  useEffect(() => {
    // 1. Chỗ này sau này bạn nên gọi API: fetch('/api/notifications')
    // để lấy danh sách thông báo cũ từ Database khi vừa vào trang.

    // 2. Lắng nghe thông báo real-time từ WebSocket
    const unsubscribe = websocketService.onNotification((data) => {
      console.log("📢 Trang Notification nhận dữ liệu:", data);
      // Thêm thông báo mới lên đầu danh sách
      setAllNotis((prev) => [data, ...prev]);
    });

    return () => {
      unsubscribe(); // Quan trọng: hủy lắng nghe khi rời trang để tránh tràn bộ nhớ
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 pt-24">
      <h1 className="text-2xl font-bold mb-6">Trung tâm thông báo</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tab Filters */}
        <div className="flex gap-4 p-4 border-b bg-gray-50/50">
          <button className="px-4 py-1.5 rounded-full bg-[#4da6ff] text-white text-sm font-medium">
            Tất cả ({allNotis.length})
          </button>
          <button className="px-4 py-1.5 rounded-full bg-white border text-sm hover:bg-gray-100 transition-colors">
            Chưa đọc
          </button>
        </div>

        {/* Danh sách thông báo */}
        <div className="divide-y divide-gray-100">
          {allNotis.length === 0 ? (
            <div className="p-20 text-center text-gray-400">
              <FaBell className="mx-auto text-4xl mb-4 opacity-20" />
              <p>Bạn chưa có thông báo nào mới</p>
            </div>
          ) : (
            allNotis.map((noti, index) => (
              <div
                key={noti.notificationId || index}
                className={`p-4 flex gap-4 hover:bg-blue-50/50 transition-all cursor-pointer items-start ${!noti.read ? "bg-blue-50/20" : ""}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center ${noti.type === "CHAT" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}
                >
                  <FaBell />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900">
                      {noti.notificationTitle}
                    </h3>
                    <span className="text-[11px] text-gray-400">
                      {noti.createdAt
                        ? formatDistanceToNow(new Date(noti.createdAt), {
                            addSuffix: true,
                            locale: vi,
                          })
                        : "Vừa xong"}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">
                    {noti.notificationBody}
                  </p>

                  {noti.link && (
                    <button
                      onClick={() => (window.location.href = noti.link)}
                      className="mt-2 text-xs font-bold text-[#4da6ff] hover:underline"
                    >
                      Xem chi tiết
                    </button>
                  )}
                </div>

                {/* Chấm xanh báo hiệu chưa đọc */}
                {!noti.read && (
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
