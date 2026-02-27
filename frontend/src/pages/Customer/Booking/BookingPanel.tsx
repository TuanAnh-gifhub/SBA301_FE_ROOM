import { Card, Segmented } from "antd";
import { useState } from "react";

import HourlyForm from "./HourlyForm";
import DailyForm from "./DailyForm";
import MonthlyForm from "./MonthlyForm";

import type { Room } from "../../../types/room";
import type { BookingType } from "../../../types/booking";

interface Props {
  selectedRooms: Record<string, { room: Room; quantity: number }>;
  userId: string;
}

export default function BookingPanel({ selectedRooms, userId }: Props) {
  const [type, setType] = useState<BookingType>("HOURLY");


  const hasSelectedRoom = Object.keys(selectedRooms).length > 0;

  const renderForm = () => {
    switch (type) {
      case "HOURLY":
        return <HourlyForm selectedRooms={selectedRooms} userId={userId} />;

      case "DAILY":
        return <DailyForm selectedRooms={selectedRooms} userId={userId} />;

      case "MONTHLY":
        return <MonthlyForm selectedRooms={selectedRooms} userId={userId} />;

      default:
        return null;
    }
  };

  return (
    <Card
      title="Đặt phòng"
      style={{
        position: "sticky",
        top: 20,
      }}
    >
      {/* chọn loại booking */}
      <Segmented
        block
        value={type}
        onChange={(v) => setType(v as BookingType)}
        options={[
          { label: "Theo giờ", value: "HOURLY" },
          { label: "Theo ngày", value: "DAILY" },
          { label: "Theo tháng", value: "MONTHLY" },
        ]}
        style={{ marginBottom: 20 }}
      />

      {!hasSelectedRoom ? (
        <div style={{ textAlign: "center", color: "#999" }}>
          <p>Vui lòng chọn phòng để đặt</p>
        </div>
      ) : (
        renderForm()
      )}
    </Card>
  );
}
