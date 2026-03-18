import React, { useMemo, useState } from "react";
import { Button, Card, DatePicker, Input, message } from "antd";
import {
  CalendarOutlined,
  UsergroupAddOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

type Props = {
  title?: string;
  price: number;
  categoryName?: string;
  capacity?: number;
  availableRoomCount?: number;
};

const formatVND = (value: number) => {
  return value.toLocaleString("vi-VN") + " VNĐ";
};

const BookingCard: React.FC<Props> = ({
  title,
  price,
  categoryName,
  capacity,
  availableRoomCount = 1,
}) => {
  const [bookingDate, setBookingDate] = useState<any>(dayjs());
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [quantity, setQuantity] = useState(1);

  const durationHours = useMemo(() => {
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);

    const start = sh * 60 + sm;
    const end = eh * 60 + em;

    if (end <= start) return 0;
    return (end - start) / 60;
  }, [startTime, endTime]);

  const rentalFee = useMemo(() => {
    if (durationHours <= 0) return 0;
    return price * durationHours * quantity;
  }, [price, durationHours, quantity]);

  const serviceFee = 15000;
  const total = rentalFee + serviceFee;

  const handleBooking = () => {
    if (!bookingDate) {
      message.warning("Vui lòng chọn ngày đặt phòng");
      return;
    }

    if (durationHours <= 0) {
      message.warning("Giờ kết thúc phải lớn hơn giờ bắt đầu");
      return;
    }

    message.info("Chưa tích hợp API đặt phòng");
  };

  return (
    <Card className="shadow-sm rounded-xl xl:sticky xl:top-4">
      <div className="text-2xl font-bold text-gray-800 leading-snug">
        {title}
      </div>

      <div className="mt-4 flex items-end gap-2">
        <div className="text-5xl font-bold text-[#4da6ff]">
          {Number(price || 0).toLocaleString("vi-VN")}
        </div>
        <div className="text-gray-500 text-xl mb-1">VNĐ / giờ</div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <div className="font-semibold text-gray-700 mb-2">Chọn ngày</div>
          <DatePicker
            value={bookingDate}
            onChange={setBookingDate}
            format="DD/MM/YYYY"
            className="!w-full !h-12"
            placeholder="dd/mm/yyyy"
            suffixIcon={<CalendarOutlined />}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="font-semibold text-gray-700 mb-2">Giờ bắt đầu</div>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="!h-12"
            />
          </div>

          <div>
            <div className="font-semibold text-gray-700 mb-2">Giờ kết thúc</div>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="!h-12"
            />
          </div>
        </div>

        <div>
          <div className="font-semibold text-gray-700 mb-2">Số người</div>
          <Input
            readOnly
            className="!h-12"
            prefix={<UsergroupAddOutlined />}
            value={capacity ? `${capacity} người` : "Chưa cập nhật"}
          />
        </div>

        <div>
          <div className="font-semibold text-gray-700 mb-2">Loại phòng</div>
          <Input readOnly className="!h-12" value={categoryName || "—"} />
        </div>

        <div>
          <div className="font-semibold text-gray-700 mb-2">Số lượng phòng</div>
          <div className="flex items-center gap-3">
            <Button
              className="!h-12 !w-12"
              icon={<MinusOutlined />}
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            />
            <div className="flex-1 h-12 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-lg font-semibold">
              {quantity}
            </div>
            <Button
              className="!h-12 !w-12"
              icon={<PlusOutlined />}
              onClick={() =>
                setQuantity((prev) =>
                  Math.min(availableRoomCount || 1, prev + 1),
                )
              }
            />
          </div>
        </div>
      </div>

      <div className="mt-6 border-t pt-5 space-y-3">
        <div className="flex items-center justify-between text-gray-700">
          <span>
            Giá thuê ({durationHours} giờ × {quantity} phòng)
          </span>
          <span className="font-semibold">{formatVND(rentalFee)}</span>
        </div>

        <div className="flex items-center justify-between text-gray-700">
          <span>Phí dịch vụ</span>
          <span className="font-semibold">{formatVND(serviceFee)}</span>
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-2xl font-bold text-gray-800">Tổng cộng</span>
          <span className="text-4xl font-bold text-[#4da6ff]">
            {formatVND(total)}
          </span>
        </div>
      </div>

      <Button
        type="primary"
        block
        size="large"
        className="!mt-6 !h-12"
        style={{
          background: "#4da6ff",
          borderColor: "#4da6ff",
          borderRadius: 12,
          fontWeight: 700,
        }}
        onClick={handleBooking}
      >
        Đặt phòng ngay
      </Button>

      <div className="mt-4 rounded-xl bg-[#eef6ff] border border-[#d7eaff] p-4 text-[#2f74c8]">
        <div className="font-semibold">Miễn phí huỷ trong 24h</div>
        <div className="text-sm mt-1">
          Huỷ miễn phí trước 24h để được hoàn tiền đầy đủ
        </div>
      </div>
    </Card>
  );
};

export default BookingCard;
