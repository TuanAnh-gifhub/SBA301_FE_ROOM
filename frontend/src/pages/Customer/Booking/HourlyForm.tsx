import { useState } from "react";
import type { Room } from "../../../types/room";
import type { BookingRequest } from "../../../types/booking";
import { InputNumber, Space } from "antd";
import axios from "axios";
export default function HourlyForm({
  room,
  quantity,
  userId,
}: {
  room: Room;
  quantity: number;
  userId: string;
}) {
  const [date, setDate] = useState("");
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("10:00");
  const [quantityState, setQuantityState] = useState(quantity);

  const bookingRequest: BookingRequest = {
    userId,
    bookingType: "HOURLY",
    numberOfMonths: 0,
    slotRequests: date
      ? [
          {
            roomId: room.id,
            quantity: quantityState,
            startTime: `${date}T${start}:00`,
            endTime: `${date}T${end}:00`,
          },
        ]
      : [],
  };
  const onSubmit = async () => {
    const payload: BookingRequest = {
      userId: userId,
      bookingType: "HOURLY",
      numberOfMonths: 0,
      slotRequests: bookingRequest.slotRequests,
    };

    console.log("Payload gửi BE:", payload);
    alert("Đã gửi dữ liệu! Kiểm tra Console log.");
    await axios.post(
      "http://localhost:8080/api/v1/rent-room/bookings",
      payload,
    );
  };
  return (
    <div className="space-y-4">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-3">
        <input
          type="time"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <input
          type="time"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
      </div>

      <Space>
        <span className="text-sm font-medium">Số lượng</span>
        <InputNumber
          min={1}
          max={quantityState}
          value={quantityState}
          onChange={(v) => setQuantityState(v || 1)}
          className="w-24"
        />
        <span className="text-xs text-gray-400">/ {room.quantity}</span>
      </Space>

      <button
        onClick={onSubmit}
        className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition"
      >
         ĐẶT LỊCH
      </button>
    </div>
  );
}
