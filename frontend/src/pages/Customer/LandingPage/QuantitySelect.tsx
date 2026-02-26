import { Select } from "antd";
import { useBooking } from "../../Customer/Booking/BookingContext";
import { useState } from "react";
interface Props {
  room: any;
  onChange: (qty: number) => void;
}
export default function QuantitySelect({ room, onChange }: Props) {
  const [quantity, setQuantity] = useState(0);

  const max = room.roomCopies?.length || 0;

  return (
    <Select
      value={quantity}
      style={{ width: 80 }}
      onChange={(value) => {
        setQuantity(value);
        onChange(value);
      }}
    >
      {[...Array(max + 1)].map((_, i) => (
        <Select.Option key={i} value={i}>
          {i}
        </Select.Option>
      ))}
    </Select>
  );
}