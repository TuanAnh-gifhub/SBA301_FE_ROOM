// components/DetailSummary.tsx
"use client";

import { useState } from "react";
import type { Room } from "../../../types/room";
import  type { BookingType } from "../../../types/booking";
import HourlyForm from "../Booking/HourlyForm";
import DailyForm from "../Booking/DailyForm";
import MonthlyForm from "../Booking/MonthlyForm";

export default function DetailSummary({
  room,
  userId,
}: {
  room: Room;
  userId: string;
}) {
  const [type, setType] = useState<BookingType>("HOURLY");

  return (
    <section className="border rounded-xl bg-white p-5 space-y-5">
      <h2 className="font-semibold text-lg">{room.name}</h2>

      <div className="flex gap-2">
        {["HOURLY", "DAILY", "MONTHLY"].map((t) => (
          <button
            key={t}
            onClick={() => setType(t as BookingType)}
            className={`px-4 py-2 rounded-lg font-medium ${
              type === t ? "bg-blue-500 text-white" : "bg-gray-100"
            }`}
          >
            {t === "HOURLY"
              ? "Theo giờ"
              : t === "DAILY"
                ? "Theo ngày"
                : "Theo tháng"}
          </button>
        ))}
      </div>

      {type === "HOURLY" && <HourlyForm room={room} userId={userId} />}
      {type === "DAILY" && <DailyForm room={room} userId={userId} />}
      {type === "MONTHLY" && <MonthlyForm room={room} userId={userId} />}
    </section>
  );
}
