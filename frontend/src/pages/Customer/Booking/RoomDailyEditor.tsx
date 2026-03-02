import { useState } from "react";
import { InputNumber } from "antd";
import type { Room } from "../../../types/room";
import { toast } from "react-toastify";
export default function RoomDailyEditor({ room, onAddSlot }) {
  const [date, setDate] = useState("");
  const [start, setStart] = useState("07:00");
  const [end, setEnd] = useState("09:00");
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    if (!date) {
      toast.error("Chọn ngày");
      return;
    }

    if (start >= end) {
      toast.error("Giờ không hợp lệ");
      return;
    }

    onAddSlot({
      roomId: room.roomId,
      room,
      date,
      start,
      end,
      quantity,
    });
  };

  return (
    <div className="border rounded-xl p-4 space-y-3">
      <h3 className="font-bold text-blue-600">{room.roomName}</h3>

      <input type="date" onChange={(e) => setDate(e.target.value)} />

      <div className="flex gap-2">
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

      <InputNumber
        min={1}
        max={room.roomCopies?.length || 1}
        value={quantity}
        onChange={(v) => setQuantity(v || 1)}
      />

      <button
        onClick={handleAdd}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Thêm khung giờ
      </button>
    </div>
  );
}
