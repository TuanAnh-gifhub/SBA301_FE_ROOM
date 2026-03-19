type Props = {
  cart: CartItem[];
  increase: (index: number) => void;
  decrease: (index: number) => void;
  filter: BookingFilter;
};

import { message } from "antd";

export default function BookingPanel({
  cart,
  increase,
  decrease,
  onSubmit,
}: Props) {
  const handleBookingNow = () => {
    message.info("Thêm khung giờ để đặt phòng");
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-6">
      {cart.length === 0 ? (
        <p className="text-center text-gray-500 py-6">
          Chưa có phòng nào được chọn.
          <span
            onClick={handleBookingNow}
            className="text-blue-600 font-semibold ml-2 cursor-pointer hover:underline"
          >
            Đặt ngay
          </span>
        </p>
      ) : (
        <>
          <h2 className="text-lg font-semibold mb-4">
             Tóm tắt đặt phòng
          </h2>

          <div className="space-y-4">
            {cart.map((item, index) => (
              <div
                key={index}
                className="border rounded-xl p-4 bg-gray-50 hover:shadow transition"
              >
                <h4 className="font-medium text-gray-800">
                  {item.room.roomName}
                </h4>

                <p className="text-sm text-gray-500 mt-1">
                  {item.date} | {item.startTime} - {item.endTime}
                </p>

                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => decrease(index)}
                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-200 transition"
                  >
                    -
                  </button>

                  <span className="font-medium text-lg">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => increase(index)}
                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-200 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <b>Lưu ý:</b> Vui lòng kiểm tra kỹ thời gian trước khi đặt phòng.
          </div>

          <button
            onClick={onSubmit}
            className="w-full mt-5 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl font-medium transition"
          >
            Đặt phòng
          </button>
        </>
      )}
    </div>
  );
}