import { useState } from "react";
import { InputNumber } from "antd";
import type { Room } from "../../../types/room";
import { toast } from "react-toastify";
export default function RoomSlotEditor({
  room,
  selectedRooms,
  setSelectedRooms,
  onAddSlot,
}: {
  room: Room;
  selectedRooms: any;
  setSelectedRooms: any;
  onAddSlot: (slot: any) => void;
}) {
  const [date, setDate] = useState("");
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const selected = selectedRooms[room.roomId];
  const handleAdd = () => {
    if (!date) {
      toast.error("Vui lòng chọn ngày");
      return;
    }
    if (!start || !end) {
      toast.error("Vui lòng chọn thời gian bắt đầu và kết thúc");

      return;
    }

    onAddSlot({
      roomId: room.roomId,
      date,
      start,
      end,
      quantity:selected.quantity || quantity,
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
        {selected && (
          <div className="flex items-center gap-2">
            <span>Số lượng:</span>

            <InputNumber min={1} value={selected.quantity} disabled />
          </div>
        )}
      </div>

      <button
        onClick={handleAdd}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Thêm khung giờ
      </button>
    </div>
  );
}
