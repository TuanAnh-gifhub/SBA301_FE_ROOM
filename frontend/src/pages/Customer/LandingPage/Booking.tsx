import { useState } from "react";

export default function BookingPanel({ room }: any) {
  const [quantity, setQuantity] = useState(1);

  const handleBooking = () => {
    console.log("Đặt phòng", {
      roomId: room.roomId,
      quantity,
    });
  };

  return (
    <div className="text-right space-y-3">
      <select
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        className="border p-2 rounded"
      >
        {[1, 2, 3, 4].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>

      <button
        onClick={handleBooking}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Đặt phòng
      </button>
    </div>
  );
}
