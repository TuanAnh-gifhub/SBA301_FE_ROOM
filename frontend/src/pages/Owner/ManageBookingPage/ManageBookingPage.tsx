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
  message,
  Divider,
} from "antd";
import { MoreOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getBookingsByRentalId } from "../../../services/booking/bookingService";
import { useAuth } from "../../../context/AuthContext";
import SlotEditorModal from "./SlotEditorModal";
import UpdateBookingModal from "./UpdateBookingModal";

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

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("ALL");
  const [dates, setDates] = useState<any[]>([]);

  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);
  const [slotEditorOpen, setSlotEditorOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updatingBooking, setUpdatingBooking] = useState<any>(null);

  const pageSize = 5;

  const fetchBookings = async () => {
    if (!userId) return;
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
      message.error("Không thể tải danh sách đặt lịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, keyword, status, dates, userId]);

  const openSlotEditor = (record: any) => {
    const rId =
      record.rentalArea?.rentalAreaId || // <-- Đã được map từ BE thông qua bản vá ở trên
      record.rentalAreaId ||
      record.slots?.[0]?.roomCopy?.room?.rentalArea?.rentalAreaId;

    setEditingBooking({
      ...record,
      rentalAreaId: rId,
    });
    setSlotEditorOpen(true);
  };

  const columns = [
    {
      title: "STT",
      width: 60,
      render: (_: any, __: any, index: number) =>
        (page - 1) * pageSize + index + 1,
    },
    { title: "Mã đặt", dataIndex: "bookingId", ellipsis: true, width: 100 },
    { title: "Khách hàng", dataIndex: "userName" },
    { title: "SĐT", dataIndex: "phoneNumber" },
    {
      title: "Phòng",
      render: (_: any, record: any) => (
        <Space wrap>
          {record.slots?.map((s: any) => (
            <Tag color="cyan" key={s.slotId}>
              {s.roomCopy?.roomCode}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Bắt đầu",
      dataIndex: "startTime",
      render: (v: string) => dayjs(v).format("DD/MM HH:mm"),
    },
    {
      title: "Kết thúc",
      dataIndex: "endTime",
      render: (v: string) => dayjs(v).format("DD/MM HH:mm"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      render: (v: number) => <b>{v?.toLocaleString()} đ</b>,
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod", // Sửa lại đúng tên trường BE trả về (VD: paymentMethod, paymentType...)
      render: (pm: string) => <Tag color="purple">{pm || "Chưa rõ"}</Tag>,
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
      width: 80,
      render: (_: any, record: any) => {
        const isBooked = record.status === "BOOKED";
        const isHourly = record.bookingType === "HOURLY";

        const dropdownItems = [
          {
            key: "detail",
            label: "Xem chi tiết",
            icon: <EyeOutlined />,
            onClick: () => {
              setSelectedBooking(record);
              setOpenModal(true);
            },
          },
          {
            key: "updateStatus",
            label: "Đổi trạng thái",
            icon: <EditOutlined />,
            onClick: () => {
              setUpdatingBooking(record);
              setUpdateModalOpen(true);
            },
          },
          ...(isBooked && isHourly
            ? [
                {
                  key: "editSlot",
                  label: "Chỉnh sửa Slot (Đổi/Gia hạn)",
                  icon: <EditOutlined />,
                  onClick: () => openSlotEditor(record),
                },
              ]
            : []),
        ];

        return (
          <Dropdown menu={{ items: dropdownItems }} trigger={["click"]}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Quản lý đặt lịch</h1>

      <Space wrap style={{ marginBottom: 20 }}>
        <Input
          placeholder="Tìm khách hàng..."
          style={{ width: 200 }}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Select value={status} style={{ width: 150 }} onChange={setStatus}>
          <Option value="ALL">Tất cả trạng thái</Option>
          <Option value="BOOKED">Đã đặt</Option>
          <Option value="COMPLETED">Đã hoàn thành</Option>
          <Option value="CANCELLED">Đã hủy</Option>
        </Select>
        <RangePicker onChange={(v) => setDates(v || [])} />
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
          onChange: setPage,
        }}
      />

      {/* Chi tiết Booking Modal */}
      <Modal
        title="Thông tin chi tiết"
        open={openModal}
        footer={null}
        onCancel={() => setOpenModal(false)}
      >
        {selectedBooking && (
          <Space direction="vertical" style={{ width: "100%" }}>
            <p>
              <b>Khách hàng:</b> {selectedBooking.userName} (
              {selectedBooking.phoneNumber})
            </p>
            <p>
              <b>Loại:</b> {selectedBooking.bookingType}
            </p>
            <p>
              <b>Tổng tiền:</b> {selectedBooking.totalPrice?.toLocaleString()}{" "}
              VND
            </p>
            <Divider orientation="left">Danh sách Slot</Divider>
            {selectedBooking.slots?.map((slot: any) => (
              <div key={slot.slotId} style={{ marginBottom: 8 }}>
                <Tag color="blue">Phòng {slot.roomCopy?.roomCode}</Tag>
                {dayjs(slot.startTime).format("DD/MM HH:mm")} →{" "}
                {dayjs(slot.endTime).format("HH:mm")}
              </div>
            ))}
          </Space>
        )}
      </Modal>

      <SlotEditorModal
        open={slotEditorOpen}
        booking={editingBooking}
        onClose={() => {
          setSlotEditorOpen(false);
          setEditingBooking(null);
        }}
        onSuccess={fetchBookings}
      />

      <UpdateBookingModal
        open={updateModalOpen}
        booking={updatingBooking}
        onClose={() => {
          setUpdateModalOpen(false);
          setUpdatingBooking(null);
        }}
        onSuccess={fetchBookings}
      />
    </div>
  );
};

export default ManageBookingPage;
