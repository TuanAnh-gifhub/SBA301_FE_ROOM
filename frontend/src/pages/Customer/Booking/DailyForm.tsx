import { useState } from "react";
import axios from "axios";
import type { Room } from "../../../types/room";
import RoomDailyEditor from "./RoomDailyEditor";

interface Props {
  selectedRooms: Record<
    string,
    { room: Room; quantity: number }
  >;
  userId: string;
}

interface Slot {
  roomId: string;
  date: string;
  start: string;
  end: string;
  quantity: number;
}

export default function DailyForm({
  selectedRooms,
  userId,
}: Props) {

  const [slots, setSlots] = useState<Slot[]>([]);

  const addSlot = (slot: Slot) => {
    setSlots(prev => [...prev, slot]);
  };

  const removeSlot = (index: number) => {
    setSlots(prev =>
      prev.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async () => {

    if (!slots.length) {
      alert("Chưa có slot");
      return;
    }

    const payload = {
      userId,
      bookingType: "DAILY",
      numberOfMonths: 0,
      slotRequests: slots.map(s => ({
        roomId: s.roomId,
        quantity: s.quantity,
        startTime: `${s.date}T${s.start}:00`,
        endTime: `${s.date}T${s.end}:00`,
      }))
    };

    console.log(payload);

    await axios.post(
      "/api/v1/rent-room/bookings",
      payload
    );
  };

  return (
    <div className="space-y-6">

      {/* editor từng room */}
      {Object.values(selectedRooms).map(
        ({ room }) => (
          <RoomDailyEditor
            key={room.roomId}
            room={room}
            onAddSlot={addSlot}
          />
        )
      )}

      {/* preview */}
      <div className="border p-4 rounded">
        <h3 className="font-bold">
          Slot đã chọn ({slots.length})
        </h3>

        {slots.map((s, i) => (
          <div key={i}>
            {s.date} |
            {s.start}-{s.end} |
            {s.quantity} phòng
            <button
              onClick={() => removeSlot(i)}
              className="ml-3 text-red-500"
            >
              Xóa
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onSubmit}
        className="w-full bg-black text-white py-4 rounded-xl"
      >
        ĐẶT LỊCH
      </button>
    </div>
  );
}