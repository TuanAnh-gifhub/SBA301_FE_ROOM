import { useLocation } from "react-router-dom";

export default function PaymentSuccessPage() {
  const { state } = useLocation();
  const booking = state?.booking;

  if (!booking) return <div>Không có dữ liệu booking</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">

      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-green-500 rounded-full 
                        flex items-center justify-center mx-auto">
          <span className="text-white text-4xl">✓</span>
        </div>

        <h1 className="text-3xl font-bold text-green-600 mt-4">
          Thanh toán thành công!
        </h1>

        <p className="text-gray-500 mt-2">
          Cảm ơn bạn đã sử dụng dịch vụ.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-10 mb-10">

    
        <div>
          <h2 className="font-semibold text-cyan-600 mb-3">
            Thông tin đặt phòng
          </h2>

          <p><b>Booking ID:</b> #{booking.bookingId}</p>
          <p><b>Khu vực:</b> {booking.rentalArea.rentalAreaName}</p>
          <p>
            <b>Ngày nhận:</b>{" "}
            {new Date(booking.startTime).toLocaleString()}
          </p>
          <p>
            <b>Ngày trả:</b>{" "}
            {new Date(booking.endTime).toLocaleString()}
          </p>
        </div>

      
        <div>
          <h2 className="font-semibold text-cyan-600 mb-3">
            Thông tin thanh toán
          </h2>

          <p><b>Tổng tiền:</b> {booking.totalPrice} VNĐ</p>
          <p><b>Đã thanh toán:</b> {booking.totalPrice} VNĐ</p>
          <p><b>Phương thức:</b> BANK_TRANSFER</p>

          <p className="text-green-600 font-semibold">
            Trạng thái: {booking.statusPayment}
          </p>
        </div>
      </div>

    
      <div className="mb-10">
        <h2 className="font-semibold text-cyan-600 mb-4">
          Chi tiết phòng đã đặt
        </h2>

        <table className="w-full border rounded-lg overflow-hidden">
          <thead className="bg-cyan-50">
            <tr>
              <th className="p-3">STT</th>
              <th>Phòng</th>
              <th>Bắt đầu</th>
              <th>Kết thúc</th>
              <th>Room Code</th>
            </tr>
          </thead>

          <tbody>
            {booking.slots.map((s: any, i: number) => (
              <tr key={i} className="text-center border-t">
                <td className="p-3">{i + 1}</td>
                <td>{s.roomCopy.roomCode}</td>
                <td>
                  {new Date(s.startTime).toLocaleString()}
                </td>
                <td>
                  {new Date(s.endTime).toLocaleString()}
                </td>
                <td>{s.roomCopy.roomCode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

     
      <div className="grid grid-cols-2 gap-10">

        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="font-semibold mb-4">
            Hóa đơn của bạn
          </h3>

          <a
            href={booking.invoicePdfUrl || "/no-invoice.pdf"}
            target="_blank"
            className="bg-cyan-500 text-white px-5 py-2 rounded"
          >
            Download PDF
          </a>
        </div>

      
        <div className="bg-white shadow rounded-xl p-6 text-center">
          <h3 className="font-semibold mb-4">
            Booking QR
          </h3>

          <img
            src={booking.qrCodeUrl || "/no-qr-code.png"}
            className="mx-auto w-44"
          />

          <p className="text-gray-500 mt-3 text-sm">
            Xuất trình khi check-in
          </p>
        </div>
      </div>
    </div>
  );
}