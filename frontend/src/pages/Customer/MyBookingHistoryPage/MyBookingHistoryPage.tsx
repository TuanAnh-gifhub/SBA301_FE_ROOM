import { useEffect, useState } from "react";
import { getBookingsByUserId } from "../../../services/booking/bookingService";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function MyBookingHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const size = 3;

  useEffect(() => {
    if (user?.userId) {
      fetchBookings(page);
    }
  }, [page, user]);

  const fetchBookings = async (pageNumber: number) => {
    try {
      setLoading(true);

      const res = await getBookingsByUserId({
        userId: user.userId,
        page: pageNumber,
        size: size,
      });

      setData(res.result.data);
      setTotalPages(res.result.totalPages);
    } catch (err) {
      console.error("Error fetch booking:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  // ✅ config chuẩn cho status
  const statusConfig: any = {
    BOOKED: {
      text: "Đã đặt",
      class: "bg-blue-100 text-blue-700",
    },
    COMPLETED: {
      text: "Hoàn thành",
      class: "bg-green-100 text-green-700",
    },
    CANCELLED: {
      text: "Đã hủy",
      class: "bg-red-100 text-red-700",
    },
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Lịch sử đặt phòng</h1>

      {/* Booking List */}
      <div className="space-y-4">
        {data.map((booking) => {
          const status = statusConfig[booking.status] || {
            text: booking.status,
            class: "bg-gray-100 text-gray-700",
          };

          return (
            <div
              key={booking.bookingId}
              className="border rounded-xl p-5 shadow-sm bg-white"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="font-medium">Người đặt: {booking.userName}</p>
                  <p className="text-sm text-gray-500">
                    SĐT: {booking.phoneNumber}
                  </p>
                </div>

                {/* ✅ Status badge */}
                <span
                  className={`px-3 py-1 text-sm rounded-full font-medium ${status.class}`}
                >
                  {status.text}
                </span>
              </div>

              {/* Slots */}
              <div className="space-y-2 mb-3">
                {booking.slots.map((slot: any) => (
                  <div
                    key={slot.slotId}
                    className="flex justify-between bg-gray-50 p-2 rounded-lg"
                  >
                    <span>
                      Phòng: <strong>{slot.roomCopy.roomCode}</strong>
                    </span>

                    <span className="text-sm text-gray-600">
                      {new Date(slot.startTime).toLocaleString()} -{" "}
                      {new Date(slot.endTime).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">
                  Tổng tiền:{" "}
                  <strong className="text-black">
                    {booking.totalPrice.toLocaleString()}đ
                  </strong>
                </span>

                <span className="text-gray-400">
                  {new Date(booking.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Action */}
              <div className="flex justify-end mt-3">
                <button
                  onClick={() =>
                    navigate(`/my-booking-history/${booking.bookingId}`)
                  }
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          );
        })}
      </div>

      
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Trước
        </button>

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => setPage(index + 1)}
            className={`px-3 py-1 border rounded ${
              page === index + 1 ? "bg-blue-500 text-white" : "bg-white"
            }`}
          >
            {index + 1}
          </button>
        ))}

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
