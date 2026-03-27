import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Modal, Input, Button, Tag } from "antd";
import {
  CalendarOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import roomsService from "../../../services/rooms/rooms";
import PageHeader from "../../../components/Header/PageHeader";

export default function ManageSchedulePage() {
  const roomColors = {
    "301": "#3b82f6",
    "302": "#22c55e",
    "303": "#f59e0b",
  };

  const [rooms, setRooms] = useState([]);
  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const [eventDetail, setEventDetail] = useState(null);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await roomsService.getMyRooms();
        const roomsData = res.result || [];

        setRooms(roomsData);

        const resourceData = roomsData.map((room) => ({
          id: room.roomId,
          title: room.roomName,
        }));

        setResources(resourceData);

        const calendarEvents = [];

        roomsData.forEach((room) => {
          room.roomCopies?.forEach((rc) => {
            rc.slots?.forEach((slot) => {
              const bookingInfo = slot.booking || {};

              calendarEvents.push({
                id: slot.slotId,
                resourceId: room.roomId,
                start: slot.startTime,
                end: slot.endTime,
                title: bookingInfo.userName || "Đã đặt",
                backgroundColor: roomColors[room.roomId] || "#6366f1",
                extendedProps: {
                  roomName: `${room.roomName} (${rc.roomCode})`,
                  roomId: room.roomId,
                  phone: bookingInfo.userPhone,
                  customerName: bookingInfo.userName,
                  note: bookingInfo.note,
                },
              });
            });
          });
        });

        setEvents(calendarEvents);
      } catch (err) {
        console.error(err);
      }
    };

    loadRooms();
  }, []);

  const isConflict = (roomId, start, end) => {
    return events.some((e) => {
      if (e.resourceId !== roomId) return false;

      const es = new Date(e.start);
      const ee = new Date(e.end);

      return start < ee && end > es;
    });
  };

  const mergeSlot = (slots) => {
    const map = {};

    slots.forEach((s) => {
      const key = s.roomId;
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });

    return Object.values(map).flat();
  };

  const handleSelect = (info) => {
    const roomId = info.resource?.id;

    if (!roomId) return;

    if (isConflict(roomId, info.start, info.end)) {
      alert("Khung giờ này đã được đặt");
      return;
    }

    const slot = {
      roomId,
      startTime: info.startStr,
      endTime: info.endStr,
    };

    setSelectedSlots((prev) => mergeSlot([...prev, slot]));
  };

  const previewEvents = selectedSlots.map((s, i) => ({
    id: "preview-" + i,
    resourceId: s.roomId,
    start: s.startTime,
    end: s.endTime,
    title: "Đã chọn",
    backgroundColor: "#60a5fa",
  }));

  const handleSubmitBooking = async () => {
    const payload = {
      userName: customerName,
      userPhone: phone,
      note: note,
      bookingType: "HOURLY",
      numberOfMonths: 0,
      slotRequests: selectedSlots.map((s) => ({
        roomId: s.roomId,
        quantity: 1,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
    };

    await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const newEvents = payload.slotRequests.map((s) => ({
      id: Date.now() + Math.random(),
      resourceId: s.roomId,
      start: s.startTime,
      end: s.endTime,
      title: payload.userName,
      backgroundColor: roomColors[s.roomId] || "#6366f1",
      extendedProps: {
        roomName: resources.find((r) => r.id === s.roomId)?.title,
        phone: payload.userPhone,
        customerName: payload.userName,
        note: payload.note,
      },
    }));

    setEvents((prev) => [...prev, ...newEvents]);

    setSelectedSlots([]);
    setCustomerName("");
    setPhone("");
    setNote("");
    setOpenModal(false);
  };

  const handleRemoveSlot = (index) => {
    setSelectedSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEventClick = (info) => {
    const event = info.event;

    setEventDetail({
      roomName: event.extendedProps.roomName,
      customerName: event.extendedProps.customerName,
      phone: event.extendedProps.phone,
      note: event.extendedProps.note,
      start: event.start,
      end: event.end,
    });

    setDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <PageHeader
        title="Quản lý lịch phòng"
        subtitle="Theo dõi lịch đặt, chọn khung giờ và tạo booking trực tiếp trên lịch"
        icon={<CalendarOutlined />}
        actionText="Tạo lịch đặt"
        onAction={() => setOpenModal(true)}
      />

      <div className="rounded-3xl bg-white shadow-sm border border-slate-100 p-4 md:p-5">
        <FullCalendar
          plugins={[
            resourceTimeGridPlugin,
            interactionPlugin,
            dayGridPlugin,
            timeGridPlugin,
          ]}
          initialView="resourceTimeGridDay"
          selectable
          selectMirror
          select={handleSelect}
          eventClick={handleEventClick}
          resources={resources}
          events={[...events, ...previewEvents]}
          height="auto"
          locale="vi"
          customButtons={{
            addBooking: {
              text: "Tạo lịch đặt",
              click: () => setOpenModal(true),
            },
          }}
          headerToolbar={{
            left: "prev,next today addBooking",
            center: "title",
            right: "dayGridMonth,timeGridWeek,resourceTimeGridDay",
          }}
          buttonText={{
            today: "Hôm nay",
            month: "Tháng",
            week: "Tuần",
            day: "Ngày",
          }}
        />
      </div>

      <Modal
        title={
          <span className="text-lg font-semibold">Tạo lịch đặt phòng</span>
        }
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={handleSubmitBooking}
        okText="Tạo lịch"
        cancelText="Hủy"
        width={720}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <Input
            className="!h-11 !rounded-xl"
            placeholder="Tên khách hàng"
            prefix={<UserOutlined className="text-slate-400" />}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />

          <Input
            className="!h-11 !rounded-xl"
            placeholder="Số điện thoại"
            prefix={<PhoneOutlined className="text-slate-400" />}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <Input.TextArea
          className="!mb-4 !rounded-xl"
          placeholder="Ghi chú"
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-3">
            Các khung giờ đã chọn
          </h3>

          {selectedSlots.length === 0 && (
            <div className="text-slate-400">Chưa có khung giờ nào</div>
          )}

          <div className="space-y-3">
            {selectedSlots.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-2xl bg-white border border-slate-100 px-4 py-3"
              >
                <div>
                  <Tag color="blue" className="!rounded-full !px-3 !py-1 !mb-2">
                    Phòng {s.roomId}
                  </Tag>
                  <div className="text-sm text-slate-600">
                    {s.startTime} → {s.endTime}
                  </div>
                </div>

                <Button
                  danger
                  icon={<DeleteOutlined />}
                  className="!rounded-xl"
                  onClick={() => handleRemoveSlot(i)}
                >
                  Xóa
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        title={<span className="text-lg font-semibold">Chi tiết lịch đặt</span>}
        open={detailModal}
        footer={null}
        onCancel={() => setDetailModal(false)}
      >
        {eventDetail && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p>
                <b>Phòng:</b> {eventDetail.roomName}
              </p>
              <p>
                <b>Khách hàng:</b> {eventDetail.customerName}
              </p>
              <p>
                <b>SĐT:</b> {eventDetail.phone}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 p-4">
              <p>
                <b>Bắt đầu:</b> {eventDetail.start?.toLocaleString()}
              </p>
              <p>
                <b>Kết thúc:</b> {eventDetail.end?.toLocaleString()}
              </p>
              <p>
                <b>Ghi chú:</b> {eventDetail.note}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
