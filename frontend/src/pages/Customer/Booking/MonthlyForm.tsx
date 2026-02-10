// components/MonthlyForm.tsx
"use client";

import { useState, useMemo } from "react";
import type { Room } from "../../../types/room";
import type { BookingRequest } from "../../../types/booking";
import { InputNumber, Space } from "antd";

interface MonthlyFormProps {
  room: Room;
  userId: string;
}

export default function MonthlyForm({ room, userId }: MonthlyFormProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [time, setTime] = useState({
    start: "08:00",
    end: "10:00",
  });

  // ===== Tính số tháng =====
  const numberOfMonths = useMemo(() => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) return 0;

    const days = diffMs / (1000 * 60 * 60 * 24);
    return Math.ceil(days / 30);
  }, [startDate, endDate]);

  const bookingRequest: BookingRequest = {
    userId,
    bookingType: "MONTHLY",
    numberOfMonths,
    slotRequests:
      startDate && endDate
        ? [
            {
              roomId: room.id,
              quantity,
              startTime: `${startDate}T${time.start}:00`,
              endTime: `${endDate}T${time.end}:00`,
            },
          ]
        : [],
  };

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-lg">Thuê theo tháng</h3>

    
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Ngày bắt đầu</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Ngày kết thúc</label>
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
      </div>

     
      <div className="grid grid-cols-2 gap-3">
        <input
          type="time"
          value={time.start}
          onChange={(e) => setTime({ ...time, start: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="time"
          value={time.end}
          onChange={(e) => setTime({ ...time, end: e.target.value })}
          className="border p-2 rounded"
        />
      </div>

     
      <Space>
        <span className="text-sm font-medium">Số lượng phòng</span>
        <InputNumber
          min={1}
          max={room.quantity}
          value={quantity}
          onChange={(v) => setQuantity(v || 1)}
          className="w-24"
        />
        <span className="text-xs text-gray-400">/ {room.quantity}</span>
      </Space>

      
      {numberOfMonths > 0 && (
        <div className="p-3 rounded-lg bg-blue-50 text-sm">
          ⏱ Thời gian thuê: <b>{numberOfMonths}</b> tháng
        </div>
      )}

      <pre className="bg-gray-100 p-3 rounded text-xs">
        {JSON.stringify(bookingRequest, null, 2)}
      </pre>
    </div>
  );
}
