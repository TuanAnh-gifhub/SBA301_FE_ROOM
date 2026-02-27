import { useState } from "react";
import axios from "axios";
import RoomSlotEditor from "./RoomSlotEditor";
import type { Room } from "../../../types/room";

interface Props {
  selectedRooms: Record<string, { room: Room; quantity: number }>;
  userId: string;
}

interface Slot {
  roomId: string;
  date: string;
  start: string;
  end: string;
  quantity: number;
}

export default function HourlyForm({ selectedRooms, userId }: Props) {
  
  const [slots, setSlots] = useState<Slot[]>([]);


  const addSlot = (slot: Slot) => {
    setSlots((prev) => [...prev, slot]);
  };

  const onSubmit = async () => {
    if (slots.length === 0) {
      alert("Vui lòng thêm ít nhất 1 khung giờ");
      return;
    }

    const payload = {
      userId,
      bookingType: "HOURLY",
      numberOfMonths: 0,
      slotRequests: slots.map((s) => ({
        roomId: s.roomId,
        quantity: s.quantity,
        startTime: `${s.date}T${s.start}:00`,
        endTime: `${s.date}T${s.end}:00`,
      })),
    };

    console.log("Payload:", payload);

    await axios.post("/api/v1/rent-room/bookings", payload);
  };

  return (
    <div className="space-y-6">

      {Object.values(selectedRooms).map(({ room }) => (
        <RoomSlotEditor key={room.roomId} room={room} onAddSlot={addSlot} />
      ))}

   
      <div className="border rounded-lg p-3">
        <h3 className="font-bold mb-2">Khung giờ đã chọn ({slots.length})</h3>

        {slots.map((s, i) => (
          <div key={i} className="text-sm">
            Room: {s.roomId} | {s.date} | {s.start} → {s.end} ({s.quantity})
          </div>
        ))}
      </div>

      <button
        onClick={onSubmit}
        className="w-full bg-black text-white py-4 rounded-2xl font-bold"
      >
        ĐẶT LỊCH
      </button>
    </div>
  );
}
