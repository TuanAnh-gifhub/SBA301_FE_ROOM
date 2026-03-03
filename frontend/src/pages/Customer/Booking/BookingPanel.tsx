type Props = {
  cart: CartItem[];
  increase: (index: number) => void;
  decrease: (index: number) => void;
  filter: BookingFilter;
};
import { toast } from "react-toastify";
export default function BookingPanel({
  cart,
  increase,
  decrease,
  onSubmit,
}: Props) {
  const handleBookingNow = () => {
    toast.info("Thêm khung giờ để đặt phòng");
  };
  return (
    <>
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
        <div className="border rounded-xl p-5">
          <h2>Tóm tắt đặt phòng</h2>

          {cart.map((item, index) => (
            <div key={index}>
              <h4>{item.room.roomName}</h4>

              <p>
                {item.date} | {item.startTime} - {item.endTime}
              </p>

              <button onClick={() => decrease(index)}>-</button>
              {item.quantity}
              <button onClick={() => increase(index)}>+</button>
            </div>
          ))}

          <button
            onClick={onSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          >
            Đặt Phòng
          </button>
        </div>
      )}
    </>
  );
}
