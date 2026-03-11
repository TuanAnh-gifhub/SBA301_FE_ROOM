import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { downloadInvoice } from "../../../services/booking/bookingService";
import {
  getBookingByBookingId,
  cancelBooking,
} from "../../../services/booking/bookingService";
import { getBookingQrUrl } from "../../../services/booking/bookingService";
export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      const res = await getBookingByBookingId(bookingId);
      setBooking(res.result);
    };

    fetchBooking();
  }, [bookingId]);

  const handleDownloadInvoice = async () => {
    const blob = await downloadInvoice(bookingId);

    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice_${bookingId}.pdf`;
    link.click();
  };

  const handleCancelBooking = async () => {
    if (!window.confirm("Bạn có chắc muốn hủy booking?")) return;

    const res = await cancelBooking(bookingId);
    if (res.code === 200) {
      toast.success("hủy thành công ");
    }
    navigate("/my-bookings");
  };

  if (!booking) return <div className="p-10 text-center">Loading...</div>;

  const statusColor = {
    COMPLETED: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="text-gray-500">
          ← Quay lại
        </button>

        <span
          className={`px-3 py-1 rounded-full text-sm ${
            statusColor[booking.status] || "bg-gray-100"
          }`}
        >
          {booking.status}
        </span>
      </div>

      <div className="bg-white shadow rounded-xl p-6 grid grid-cols-2 gap-10">
        <div>
          <h2 className="text-lg font-semibold mb-4">Thông tin booking</h2>

          <p>
            <b>Booking ID:</b> {booking.bookingId}
          </p>
          <p>
            <b>Khu vực:</b> {booking.rentalArea.rentalAreaName}
          </p>
           <p>
            <b>Địa chỉ:</b> {booking.rentalArea.address}
          </p>
          <p>
            <b>Người đặt:</b> {booking.userName}
          </p>
          <p>
            <b>SĐT:</b> {booking.phoneNumber}
          </p>

          <p className="mt-3">
            <b>Tổng tiền:</b>{" "}
            <span className="text-xl font-semibold text-black">
              {booking.totalPrice.toLocaleString()} đ
            </span>
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Ghi chú</h2>
          <p className="text-gray-600">{booking.note || "Không có ghi chú"}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="font-semibold mb-4">Thời gian sử dụng</h2>

        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Check-in</p>
            <p className="font-semibold">
              {new Date(booking.startTime).toLocaleString()}
            </p>
          </div>

          <div className="flex-1 mx-4 border-t-2 border-dashed"></div>

          <div className="text-center">
            <p className="text-gray-500 text-sm">Check-out</p>
            <p className="font-semibold">
              {new Date(booking.endTime).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="font-semibold mb-4">Danh sách phòng</h2>

        <table className="w-full text-center">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2">#</th>
              <th>Phòng</th>
              <th>Bắt đầu</th>
              <th>Kết thúc</th>
            </tr>
          </thead>

          <tbody>
            {booking.slots.map((slot: any, index: number) => (
              <tr key={index} className="border-t">
                <td>{index + 1}</td>
                <td>{slot.roomCopy.roomCode}</td>
                <td>{new Date(slot.startTime).toLocaleString()}</td>
                <td>{new Date(slot.endTime).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-xl p-6 text-center">
          <h3 className="font-semibold mb-3">QR Check-in</h3>

          <img
            src={getBookingQrUrl(bookingId, "CHECK_IN")}
            className="mx-auto w-40"
          />
          <p className="text-sm text-gray-500 mt-2">
            Xuất trình khi nhận phòng
          </p>
        </div>

        <div className="bg-white shadow rounded-xl p-6 text-center">
          <h3 className="font-semibold mb-3">QR Check-out</h3>

          <img
            src={getBookingQrUrl(bookingId, "CHECK_OUT")}
            className="mx-auto w-40"
          />

          <p className="text-sm text-gray-500 mt-2">Xuất trình khi trả phòng</p>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleDownloadInvoice}
          className="px-5 py-2 border rounded-lg"
        >
          Tải hóa đơn
        </button>

        <button
          onClick={handleCancelBooking}
          className="px-5 py-2 bg-red-500 text-white rounded-lg"
        >
          Hủy booking
        </button>
      </div>
    </div>
  );
}
