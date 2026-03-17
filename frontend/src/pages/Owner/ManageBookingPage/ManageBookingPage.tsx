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
} from "antd";
import dayjs from "dayjs";
import { getBookingsByRentalId } from "../../../services/booking/bookingService";
import { useAuth } from "../../../context/AuthContext";
import { MoreOutlined } from "@ant-design/icons";
const BOOKING_STATUS = {
  BOOKED: { text: "Đã đặt", color: "orange" },
  COMPLETED: { text: "Hoàn thành", color: "green" },
  CANCELLED: { text: "Đã huỷ", color: "red" },
};
const { RangePicker } = DatePicker;
const { Option } = Select;

const ManageBookingPage = () => {

  const {user} = useAuth();

  const userId = user?.userId;
if (!userId) return;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("ALL");
  const [dates, setDates] = useState([]);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const pageSize = 5;
  const fetchBookings = async () => {
    try {
      setLoading(true);

      const params = {
        userId: userId,
        page,
        size: pageSize,
      };

      if (keyword) params.keyword = keyword;

      if (status !== "ALL") {
        params.bookingStatus = status;
      }

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

  const columns = [
    {
      title: "STT",
      width: 70,
      render: (_, __, index) => (page - 1) * pageSize + index + 1,
    },
    {
      title: "Mã đặt",
      dataIndex: "bookingId",
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
      render: (_, record) => {
        const rooms = record.slots?.map((s) => s.roomCopy?.roomCode);

        return rooms?.join(", ");
      },
    },
    {
      title: "Thòi gian bắt đầu",
      dataIndex: "startTime",
      render: (v) => dayjs(v).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thời gian kết thúc",
      dataIndex: "endTime",
      render: (v) => dayjs(v).format("DD/MM/YYYY HH:mm"),
    },

    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      render: (v) => `${v?.toLocaleString()} VND`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => {
        const config = BOOKING_STATUS[status] || {
          text: status,
          color: "blue",
        };

        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Hành động",
      render: (_, record) => {
        const items = [
          {
            key: "detail",
            label: "Xem chi tiết",
            onClick: () => {
              setSelectedBooking(record);
              setOpenModal(true);
            },
          },
          {
            key: "edit",
            label: "Chỉnh sửa",
            onClick: () => {
              handleEdit(record);
            },
          },
        ];

        return (
          <Dropdown menu={{ items }} trigger={["click"]}>
            <Button
              type="text"
              icon={<MoreOutlined style={{ fontSize: 18 }} />}
            />
          </Dropdown>
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
          pageSize: pageSize,
          total: total,
          onChange: (p) => setPage(p),
        }}
      />

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

            {selectedBooking.slots?.map((slot) => (
              <div key={slot.slotId} style={{ marginBottom: 8 }}>
                <Tag color="blue">Phòng {slot.roomCopy?.roomCode}</Tag>
                {dayjs(slot.startTime).format("DD/MM HH:mm")} →{" "}
                {dayjs(slot.endTime).format("HH:mm")}
              </div>
            ))}
          </>
        )}
      </Modal>
    </>
  );
};

export default ManageBookingPage;
