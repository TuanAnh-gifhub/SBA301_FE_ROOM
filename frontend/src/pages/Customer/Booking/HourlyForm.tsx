import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoomSlotEditor from "./RoomSlotEditor";
import type { Room } from "../../../types/room";

import {
  createBookingIntent,
  updateBookingIntent,
} from "../../../services/booking/bookingService";

import {
  getBookingIntent,
  saveBookingIntent,
  clearBookingIntent,
} from "../../../hooks/useBookingIntent";

import { toast } from "react-toastify";

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

export default function HourlyForm({
  selectedRooms,
  setSelectedRooms,
  userId,
}: any) {
  const navigate = useNavigate();

  const saved = getBookingIntent();

  const [slots, setSlots] = useState<Slot[]>(saved?.slots || []);
  const [bookingIntentId, setBookingIntentId] = useState<string | null>(
    saved?.bookingIntentId || null,
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!saved?.expireAt) return;

    if (new Date(saved.expireAt) < new Date()) {
      clearBookingIntent();
      setSlots([]);
      setBookingIntentId(null);
    }
  }, []);

  const buildPayload = (slotList: Slot[]) => ({
    userId,
    bookingType: "HOURLY",
    numberOfMonths: 0,
    slotRequests: slotList.map((s) => ({
      roomId: s.roomId,
      quantity: s.quantity,
      startTime: `${s.date}T${s.start}:00`,
      endTime: `${s.date}T${s.end}:00`,
    })),
  });

  const addSlot = async (slot: Slot) => {
    try {
      const updated = [...slots, slot];
      setSlots(updated);

      const payload = buildPayload(updated);

      if (!bookingIntentId) {
        const res = await createBookingIntent(payload);

        const bookingIntentId = res.bookingIntentId;

        setBookingIntentId(bookingIntentId);

        saveBookingIntent({
          bookingIntentId: bookingIntentId,
          slots: updated,
          expireAt: res.expiresAt,
        });

      
      } 
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const onSubmit = async () => {
    if (!bookingIntentId) {
      toast.error("Vui lòng thêm khung giờ trước khi đặt lịch");
      return;
    }

    navigate(`/customer/bookings/${bookingIntentId}`);
  };

  return (
    <div className="space-y-6">
      {Object.values(selectedRooms).map(({ room }) => (
        <RoomSlotEditor
          key={room.roomId}
          room={room}
          selectedRooms={selectedRooms}
          setSelectedRooms={setSelectedRooms}
          onAddSlot={addSlot}
        />
      ))}

      <button
        onClick={onSubmit}
        disabled={loading}
        className={`
        w-full py-4 rounded-2xl font-bold text-white
        ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}
      `}
      >
        ĐẶT LỊCH
      </button>
    </div>
  );
}
