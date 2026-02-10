// components/HourlyForm.tsx
"use client";

import { useState } from "react";
import type { Room } from "../../../types/room";
import type { BookingRequest } from "../../../types/booking";
import { InputNumber, Space } from "antd";
export default function HourlyForm({
  room,
  userId,
}: {
  room: Room;
  userId: string;
}) {
  const [date, setDate] = useState("");
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("10:00");
  const [quantity, setQuantity] = useState(1);

  const bookingRequest: BookingRequest = {
    userId,
    bookingType: "HOURLY",
    numberOfMonths: 0,
    slotRequests: date
      ? [
          {
            roomId: room.id,
            quantity,
            startTime: `${date}T${start}:00`,
            endTime: `${date}T${end}:00`,
          },
        ]
      : [],
  };
  const onSubmit = async () => {
    const payload: BookingRequest = {
      userId,
      bookingType: "HOURLY",
      numberOfMonths: 0,
      slotRequests: bookingRequest.slotRequests,
    };

    console.log("Payload gửi BE:", payload);
    alert("Đã gửi dữ liệu! Kiểm tra Console log.");
    // await fetch('/api/bookings', { method: 'POST', body: JSON.stringify(payload) });
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
          max={room.quantity}
          value={quantity}
          onChange={(v) => setQuantity(v || 1)}
          className="w-24"
        />
        <span className="text-xs text-gray-400">/ {room.quantity}</span>
      </Space>
      <pre className="bg-gray-100 p-3 rounded text-xs">
        {JSON.stringify(bookingRequest, null, 2)}
      </pre>

      <button
        onClick={onSubmit}
        className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition"
      >
        XÁC NHẬN ĐẶT LỊCH
      </button>
    </div>
  );
}
