import { useEffect, useState } from "react";
import {
  Table,
  Modal,
  Button,
  Tag,
  Input,
  Select,
  DatePicker,
  Space,
  Dropdown,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { getBookingsByRentalId } from "../../../services/booking/bookingService";
import { useAuth } from "../../../context/AuthContext";
import { MoreOutlined, EditOutlined } from "@ant-design/icons";
import SlotEditorModal from "./SlotEditorModal";

const BOOKING_STATUS: Record<string, { text: string; color: string }> = {
  BOOKED: { text: "Đã đặt", color: "orange" },
  COMPLETED: { text: "Hoàn thành", color: "green" },
  CANCELLED: { text: "Đã huỷ", color: "red" },
};

const { RangePicker } = DatePicker;
const { Option } = Select;

const ManageBookingPage = () => {
  const { user } = useAuth();
  const userId = user?.userId;
  if (!userId) return null;

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("ALL");
  const [dates, setDates] = useState<any[]>([]);

  // Detail modal
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);

  // Slot editor modal
  const [slotEditorOpen, setSlotEditorOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any>(null);

  const pageSize = 5;

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params: any = { userId, page, size: pageSize };
      if (keyword) params.keyword = keyword;
      if (status !== "ALL") params.bookingStatus = status;
      if (dates.length === 2) {
        params.from = dates[0].format("YYYY-MM-DD");
        params.to = dates[1].format("YYYY-MM-DD");
      }
      const res = await getBookingsByRentalId(params);
      setData(res.result.data || []);
      setTotal(res.result.totalElements || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, keyword, status, dates]);

  // Mở slot editor
  const openSlotEditor = (record: any) => {
    setEditingBooking(record);
    setSlotEditorOpen(true);
  };

  const columns = [
    {
      title: "STT",
      width: 60,
      render: (_: any, __: any, index: number) =>
        (page - 1) * pageSize + index + 1,
    },
    {
      title: "Mã đặt",
      dataIndex: "bookingId",
      ellipsis: true,
      width: 120,
    },
    {
      title: "Khách hàng",
      dataIndex: "userName",
    },
    {
      title: "SĐT",
      dataIndex: "phoneNumber",
    },
    {
      title: "Phòng",
      render: (_: any, record: any) => {
        const rooms = record.slots?.map((s: any) => s.roomCopy?.roomCode);
        return rooms?.join(", ");
      },
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "startTime",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thời gian kết thúc",
      dataIndex: "endTime",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      render: (v: number) => `${v?.toLocaleString()} VND`,
    },
    {
      title: "Phương thức",
      dataIndex: "paymentMethod",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s: string) => {
        const config = BOOKING_STATUS[s] || { text: s, color: "blue" };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Hành động",
      width: 140,
      render: (_: any, record: any) => {
        const isBooked = record.status === "BOOKED";
        const isHourly =
          record.bookingType === "HOURLY" && record.slots?.length > 0;

        const dropdownItems = [
          {
            key: "detail",
            label: "Xem chi tiết",
            onClick: () => {
              setSelectedBooking(record);
              setOpenModal(true);
            },
          },
          ...(isBooked && isHourly
            ? [
                {
                  key: "editSlot",
                  label: "Chỉnh sửa slot",
                  icon: <EditOutlined />,
                  onClick: () => openSlotEditor(record),
                },
              ]
            : []),
        ];

        return (
          <Space size={4}>
            <Dropdown menu={{ items: dropdownItems }} trigger={["click"]}>
              <Button
                type="text"
                icon={<MoreOutlined style={{ fontSize: 18 }} />}
              />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <h1 className="mb-2">Quản lý đặt lịch</h1>

      <Space style={{ marginBottom: 20 }}>
        <Input
          placeholder="Tìm khách hàng..."
          style={{ width: 200 }}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Select
          value={status}
          style={{ width: 160 }}
          onChange={(value) => setStatus(value)}
        >
          <Option value="ALL">Tất cả</Option>
          <Option value="BOOKED">Đã đặt</Option>
          <Option value="COMPLETED">Đã hoàn thành</Option>
          <Option value="CANCELLED">Đã hủy</Option>
        </Select>
        <RangePicker onChange={(value) => setDates(value || [])} />
      </Space>

      <Table
        rowKey="bookingId"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p) => setPage(p),
        }}
      />

      {/* Modal chi tiết booking */}
      <Modal
        title="Thông tin chi tiết"
        open={openModal}
        footer={null}
        onCancel={() => setOpenModal(false)}
      >
        {selectedBooking && (
          <>
            <p>
              <b>Khách hàng:</b> {selectedBooking.userName}
            </p>
            <p>
              <b>SĐT:</b> {selectedBooking.phoneNumber}
            </p>
            <p>
              <b>Loại đặt:</b> {selectedBooking.bookingType}
            </p>
            <p>
              <b>Tổng tiền:</b> {selectedBooking.totalPrice?.toLocaleString()}{" "}
              VND
            </p>
            <p>
              <b>Check-in:</b>{" "}
              {selectedBooking.checkIn
                ? dayjs(selectedBooking.checkIn).format("DD/MM/YYYY HH:mm")
                : "Chưa check-in"}
            </p>
            <p>
              <b>Check-out:</b>{" "}
              {selectedBooking.checkOut
                ? dayjs(selectedBooking.checkOut).format("DD/MM/YYYY HH:mm")
                : "Chưa check-out"}
            </p>
            <p>
              <b>Trạng thái:</b>{" "}
              <Tag color={BOOKING_STATUS[selectedBooking.status]?.color}>
                {BOOKING_STATUS[selectedBooking.status]?.text}
              </Tag>
            </p>
            <p>
              <b>Ghi chú:</b> {selectedBooking.note || "Không có"}
            </p>
            <p>
              <b>Ngày tạo đơn:</b>{" "}
              {dayjs(selectedBooking.createdAt).format("DD/MM/YYYY HH:mm")}
            </p>
            <hr />
            <p>
              <b>Danh sách phòng đã đặt:</b>
            </p>
            {selectedBooking.slots?.map((slot: any) => (
              <div key={slot.slotId} style={{ marginBottom: 8 }}>
                <Tag color="blue">Phòng {slot.roomCopy?.roomCode}</Tag>
                {dayjs(slot.startTime).format("DD/MM HH:mm")} →{" "}
                {dayjs(slot.endTime).format("HH:mm")}
              </div>
            ))}
          </>
        )}
      </Modal>

      {/* Modal chỉnh sửa slot */}
      <SlotEditorModal
        open={slotEditorOpen}
        booking={editingBooking}
        onClose={() => {
          setSlotEditorOpen(false);
          setEditingBooking(null);
        }}
        onSuccess={() => {
          fetchBookings();
        }}
      />
    </>
  );
};

export default ManageBookingPage;
