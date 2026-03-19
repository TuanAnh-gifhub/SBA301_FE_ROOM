import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  downloadInvoice,
  getBookingByBookingId,
  cancelBooking,
  getBookingQrUrl,
} from "../../../services/booking/bookingService";
import { Modal, Button } from "antd";

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<any>(null);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [openModal, setOpenModal] = useState(false);

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
    try {
      setLoadingCancel(true);

      const res = await cancelBooking(bookingId);
      if (res.code === 200) {
        toast.success("Hủy booking thành công");
        setOpenModal(false);
        navigate("/my-bookings");
      }
    } catch (err) {
      toast.error("Hủy booking thất bại");
    } finally {
      setLoadingCancel(false);
    }
  };

  if (!booking) return <div className="p-10 text-center">Loading...</div>;

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

  const status = statusConfig[booking.status] || {
    text: booking.status,
    class: "bg-gray-100 text-gray-700",
  };

  const isDisabledCancel =
    booking.status === "CANCELLED" || booking.status === "COMPLETED";

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="text-gray-500">
          ← Quay lại
        </button>

        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${status.class}`}
        >
          {status.text}
        </span>
      </div>

      {/* Info */}
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
      </div>

      {/* Time */}
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

      {/* QR */}
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-xl p-6 text-center">
          <h3 className="font-semibold mb-3">QR Check-in</h3>

          <img
            src={getBookingQrUrl(bookingId, "CHECK_IN")}
            className="mx-auto w-40"
          />
        </div>

        <div className="bg-white shadow rounded-xl p-6 text-center">
          <h3 className="font-semibold mb-3">QR Check-out</h3>

          <img
            src={getBookingQrUrl(bookingId, "CHECK_OUT")}
            className="mx-auto w-40"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleDownloadInvoice}
          className="px-5 py-2 border rounded-lg"
        >
          Tải hóa đơn
        </button>

        <button
          disabled={isDisabledCancel}
          onClick={() => setOpenModal(true)}
          className={`px-5 py-2 rounded-lg text-white ${
            isDisabledCancel
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          Hủy booking
        </button>
      </div>

      <Modal
        title="Xác nhận hủy booking"
        open={openModal}
        onCancel={() => setOpenModal(false)}
        footer={[
          <Button key="back" onClick={() => setOpenModal(false)}>
            Không
          </Button>,
          <Button
            key="submit"
            danger
            loading={loadingCancel}
            onClick={handleCancelBooking}
          >
            Xác nhận hủy
          </Button>,
        ]}
      >
        <p>
          Bạn có chắc chắn muốn hủy lịch không? <br />
          <span className="text-red-500">
            (Chính sách: hủy sẽ không được hoàn tiền/ có thể khôi phục lại liên
            hệ chủ)
          </span>
        </p>
      </Modal>
    </div>
  );
}
