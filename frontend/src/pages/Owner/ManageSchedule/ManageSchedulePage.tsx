import { IlamyResourceCalendar } from "@ilamy/calendar";
import type { CalendarEvent, CellClickInfo, Resource } from "@ilamy/calendar";
import { useState } from "react";
import dayjs from "dayjs";

interface BookingForm {
  name: string;
  phone: string;
  note: string;
}

const ManageSchedulePage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<CellClickInfo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<BookingForm>({
    name: "",
    phone: "",
    note: "",
  });

  // Danh sách phòng 20 người
  const rooms: Resource[] = [
    { id: "301", title: "Phòng 301", color: "#3B82F6" },
    { id: "302", title: "Phòng 302", color: "#3B82F6" },
    { id: "303", title: "Phòng 303", color: "#3B82F6" },
  ];

  // Khi click vào 1 ô trống
  const handleCellClick = (info: CellClickInfo) => {
    if (!info.resourceId) return;

    setSelectedSlot(info);
    setShowModal(true);
  };

  // Kiểm tra trùng giờ
  const isOverlapping = (slot: CellClickInfo) => {
    return events.some(
      (event) =>
        event.resourceId === slot.resourceId &&
        dayjs(event.start).isBefore(slot.end) &&
        dayjs(event.end).isAfter(slot.start),
    );
  };

  // Xác nhận đặt phòng
  const handleConfirmBooking = () => {
    if (!selectedSlot) return;

    if (isOverlapping(selectedSlot)) {
      alert("Khung giờ này đã được đặt!");
      return;
    }

    const newEvent: CalendarEvent = {
      id: `booking-${Date.now()}`,
      title: form.name || "Khách đặt phòng",
      start: selectedSlot.start,
      end: selectedSlot.end,
      resourceId: selectedSlot.resourceId,
      color: "#10B981",
    };

    setEvents((prev) => [...prev, newEvent]);

    // Reset
    setShowModal(false);
    setSelectedSlot(null);
    setForm({ name: "", phone: "", note: "" });
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Quản lý lịch phòng 20 người</h1>

      <div className="p-6 bg-white rounded-xl shadow">
        <IlamyResourceCalendar
          resources={rooms}
          events={events}
          initialView="day"
          firstDayOfWeek="monday"
          onCellClick={handleCellClick}
          timeSlotDuration={30}
          minTime="07:00"
          maxTime="22:00"
        />
      </div>

      {/* Modal đặt phòng */}
      {showModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[400px] shadow-xl">
            <h2 className="text-xl font-semibold mb-4">
              Đặt phòng {selectedSlot.resourceId}
            </h2>

            <p className="text-sm mb-3 text-gray-500">
              {dayjs(selectedSlot.start).format("HH:mm")} -{" "}
              {dayjs(selectedSlot.end).format("HH:mm")}
            </p>

            <input
              className="w-full border p-2 rounded mb-3"
              placeholder="Tên khách hàng"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              className="w-full border p-2 rounded mb-3"
              placeholder="Số điện thoại"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <textarea
              className="w-full border p-2 rounded mb-4"
              placeholder="Ghi chú"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowModal(false)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={handleConfirmBooking}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageSchedulePage;
