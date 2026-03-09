import { useEffect, useState } from "react";
import { getBookingsByUserId } from "../../../services/booking/bookingService";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function MyBookingHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const size = 3;

  useEffect(() => {
    if (user?.userId) {
      fetchBookings(page);
    }
  }, [page, user]);

  const fetchBookings = async (pageNumber) => {
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

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Lịch sử đặt phòng</h1>

      {/* Booking List */}
      <div className="space-y-4">
        {data.map((booking) => (
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

              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  booking.status === "COMPLETED"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {booking.status}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              {booking.slots.map((slot) => (
                <div
                  key={slot.slotId}
                  className="flex justify-between bg-gray-50 p-1 rounded-lg"
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
            <div className="flex justify-end mt-3">
              <button
                onClick={() =>
                  navigate(`/my-booking-history/${booking.bookingId}`)
                }
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded"
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
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
          Next
        </button>
      </div>
    </div>
  );
}
