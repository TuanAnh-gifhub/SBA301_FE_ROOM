import { useState } from "react";
import type { Room } from "../../../types/room";
import type { BookingRequest, SlotDraft } from "../../../types/booking";
import { toSlotRequest } from "../../../utils/bookingMapper";
import { InputNumber, Space } from "antd";
import axios from "axios";

interface DailyFormProps {
  room: Room;
  userId: string;
}

export default function DailyForm({ room, userId }: DailyFormProps) {
  const [slots, setSlots] = useState<SlotDraft[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState({
    start: "08:00",
    end: "10:00",
  });

  const [draftQuantity, setDraftQuantity] = useState(1);

  const addSlot = () => {
    if (!date) {
      alert("Vui lòng chọn ngày!");
      return;
    }

    const existed = slots.some(
      (s) =>
        s.date === date && s.startTime === time.start && s.endTime === time.end,
    );
    if (existed) {
      alert("Khung giờ này đã tồn tại!");
      return;
    }

    setSlots([
      ...slots,
      {
        date,
        startTime: time.start,
        endTime: time.end,
        quantity: draftQuantity,
      },
    ]);
  };

  const updateSlot = (index: number, data: Partial<SlotDraft>) => {
    const next = [...slots];
    next[index] = { ...next[index], ...data };
    setSlots(next);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const onSubmit = async () => {
    if (slots.length === 0) {
      alert("Vui lòng thêm ít nhất 1 ngày!");
      return;
    }
   
    const payload: BookingRequest = {
      userId: userId,
      bookingType: "DAILY",
      numberOfMonths: 0,
      slotRequests: slots.map((s) =>
        toSlotRequest(s, room.id),
      ),
    };

    console.log("Payload gửi BE:", payload);
    alert("Đã tạo booking! Kiểm tra console log.");
    await axios.post("/api/v1/rent-room/bookings", payload);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-xl bg-blue-50 space-y-4">
        <h3 className="font-bold text-blue-700">Chọn ngày & khung giờ</h3>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            className="border p-2 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <Space>
            <span className="text-sm font-medium">Số lượng phòng</span>
            <InputNumber
              min={1}
              max={room.quantity}
              value={draftQuantity}
              onChange={(v) => setDraftQuantity(v || 1)}
              className="w-24"
            />
            <span className="text-xs text-gray-400">/ {room.quantity}</span>
          </Space>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="time"
            value={time.start}
            onChange={(e) => setTime({ ...time, start: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <span>-</span>
          <input
            type="time"
            value={time.end}
            onChange={(e) => setTime({ ...time, end: e.target.value })}
            className="border p-2 rounded w-full"
          />
        </div>

        <button
          onClick={addSlot}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
        >
          Thêm vào danh sách
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Danh sách đã chọn ({slots.length})</h3>

        {slots.map((s, i) => (
          <div
            key={i}
            className="flex flex-wrap items-center gap-4 p-3 border rounded-xl bg-white shadow-sm"
          >
            <span className="font-bold w-28">{s.date}</span>

            <div className="flex items-center gap-1">
              <input
                type="time"
                value={s.startTime}
                onChange={(e) => updateSlot(i, { startTime: e.target.value })}
                className="border rounded px-1"
              />
              <span>→</span>
              <input
                type="time"
                value={s.endTime}
                onChange={(e) => updateSlot(i, { endTime: e.target.value })}
                className="border rounded px-1"
              />
            </div>

            <Space>
              <span className="text-sm">Số lượng</span>
              <InputNumber
                min={1}
                max={room.quantity}
                value={s.quantity}
                onChange={(v) => updateSlot(i, { quantity: v || 1 })}
                className="w-24"
              />
            </Space>

            <button
              className="text-xs text-blue-600"
              onClick={() => setDraftQuantity(s.quantity)}
            >
              Dùng số lượng này cho slot mới
            </button>

            <button
              onClick={() => removeSlot(i)}
              className="text-red-500 text-sm font-medium ml-auto"
            >
              Xóa
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onSubmit}
        className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition"
      >
         ĐẶT LỊCH
      </button>
    </div>
  );
}
