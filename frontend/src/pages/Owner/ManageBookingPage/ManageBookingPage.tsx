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
import {
  MoreOutlined,
  EditOutlined,
  EyeOutlined,
  CalendarOutlined,
  SearchOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getBookingsByRentalId } from "../../../services/booking/bookingService";
import { useAuth } from "../../../context/AuthContext";
import SlotEditorModal from "./SlotEditorModal";
import UpdateBookingModal from "./UpdateBookingModal";
import PageHeader from "../../../components/Header/PageHeader";

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
      record.rentalArea?.rentalAreaId ||
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
      width: 70,
      render: (_: any, __: any, index: number) =>
        (page - 1) * pageSize + index + 1,
    },
    {
      title: "Mã đặt",
      dataIndex: "bookingId",
      ellipsis: true,
      width: 130,
      render: (value: string) => (
        <span className="font-medium text-slate-700">{value}</span>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "userName",
      render: (value: string) => (
        <span className="font-medium text-slate-800">{value}</span>
      ),
    },
    {
      title: "SĐT",
      dataIndex: "phoneNumber",
      render: (value: string) => (
        <span className="text-slate-600">{value}</span>
      ),
    },
    {
      title: "Phòng",
      render: (_: any, record: any) => (
        <Space wrap>
          {record.slots?.map((s: any) => (
            <Tag
              color="cyan"
              key={s.slotId}
              className="!rounded-full !px-3 !py-1 !font-medium"
            >
              {s.roomCopy?.roomCode}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Bắt đầu",
      dataIndex: "startTime",
      render: (v: string) => (
        <span className="text-slate-600">{dayjs(v).format("DD/MM HH:mm")}</span>
      ),
    },
    {
      title: "Kết thúc",
      dataIndex: "endTime",
      render: (v: string) => (
        <span className="text-slate-600">{dayjs(v).format("DD/MM HH:mm")}</span>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      render: (v: number) => (
        <span className="font-semibold text-emerald-600">
          {v?.toLocaleString()} đ
        </span>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      render: (pm: string) => (
        <Tag color="purple" className="!rounded-full !px-3 !py-1">
          {pm || "Chưa rõ"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s: string) => {
        const config = BOOKING_STATUS[s] || { text: s, color: "blue" };
        return (
          <Tag color={config.color} className="!rounded-full !px-3 !py-1">
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      width: 90,
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
            <Button
              type="text"
              icon={<MoreOutlined />}
              className="!flex !items-center !justify-center !rounded-xl !text-slate-600 hover:!bg-slate-100"
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <PageHeader
        title="Quản lý đặt lịch"
        subtitle="Theo dõi booking, cập nhật trạng thái và xử lý slot đặt phòng trực quan hơn"
        icon={<CalendarOutlined />}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
            <Input
              placeholder="Tìm khách hàng..."
              prefix={<SearchOutlined className="text-slate-400" />}
              className="!h-11 !rounded-xl !border-0"
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Select
              value={status}
              onChange={setStatus}
              className="w-full"
              size="large"
            >
              <Option value="ALL">Tất cả trạng thái</Option>
              <Option value="BOOKED">Đã đặt</Option>
              <Option value="COMPLETED">Đã hoàn thành</Option>
              <Option value="CANCELLED">Đã hủy</Option>
            </Select>
            <RangePicker
              className="!h-11 !w-full !rounded-xl !border-0"
              placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
              onChange={(v) => setDates(v || [])}
            />
          </div>
        </div>
      </PageHeader>

      <div className="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Danh sách booking
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Tổng cộng {total} lượt đặt lịch
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-slate-500 text-sm">
            <UnorderedListOutlined />
            Quản lý theo trang
          </div>
        </div>

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
            showSizeChanger: false,
          }}
          className="[&_.ant-table]:!rounded-none [&_.ant-table-thead>tr>th]:!bg-slate-50 [&_.ant-table-thead>tr>th]:!text-slate-600 [&_.ant-table-thead>tr>th]:!font-semibold"
        />
      </div>

      <Modal
        title={
          <span className="text-lg font-semibold">Thông tin chi tiết</span>
        }
        open={openModal}
        footer={null}
        onCancel={() => setOpenModal(false)}
      >
        {selectedBooking && (
          <Space direction="vertical" style={{ width: "100%" }}>
            <div className="rounded-2xl bg-slate-50 p-4">
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
            </div>

            <Divider orientation="left">Danh sách Slot</Divider>

            {selectedBooking.slots?.map((slot: any) => (
              <div
                key={slot.slotId}
                className="rounded-2xl border border-slate-100 bg-white p-3"
              >
                <Tag color="blue" className="!rounded-full !px-3 !py-1">
                  Phòng {slot.roomCopy?.roomCode}
                </Tag>
                <div className="mt-2 text-slate-600">
                  {dayjs(slot.startTime).format("DD/MM HH:mm")} →{" "}
                  {dayjs(slot.endTime).format("HH:mm")}
                </div>
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
