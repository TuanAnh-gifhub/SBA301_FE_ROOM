import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import rentalAreasService from "../../../services/rental-areas/rentalAreas";
import { toast } from "react-toastify";
import { Row, Col, Modal, Input, List, Typography, Divider } from "antd";
import BookingPanel from "../Booking/BookingPanel";
import { useAuth } from "../../../context/AuthContext";
import type { Room } from "../../../types/booking";
import RoomCardList from "./RoomListPage";
import BookingSearchBar from "../Booking/BookingSearchBar";
import {
  createBookingIntent,
  getBookingsByUserId,
} from "../../../services/booking/bookingService";
import RentalGallery from "../Rental/RentalGallery";
import { ReviewSection } from "../../../components/review/ReviewSection";
import HostCard from "../Rental/HostCard";
import RentalInfo from "../Rental/RentalInfo";

const { TextArea } = Input;
const { Text } = Typography;

interface BookingFilter {
  date: string;
  start: string;
  end: string;
}

type CartItem = {
  room: Room;
  date: string;
  startTime: string;
  endTime: string;
  quantity: number;
};

type Cart = CartItem[];

export default function RentalDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [rental, setRental] = useState<any>(null);
  const [cart, setCart] = useState<Cart>([]);
  const [completedBookingId, setCompletedBookingId] = useState<string>();

  const [filter, setFilter] = useState<BookingFilter>({
    date: "",
    start: "07:00",
    end: "09:00",
  });

  // ✅ modal state
  const [openConfirm, setOpenConfirm] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (!user?.userId || !id) return;
    fetchCompletedBooking();
  }, [user?.userId, id]);

  const fetchDetail = async () => {
    const res = await rentalAreasService.getDetail(id!);
    setRental(res.data.result);
  };

  const fetchCompletedBooking = async () => {
    try {
      const res = await getBookingsByUserId({
        userId: user?.userId,
        bookingStatus: "COMPLETED",
        page: 1,
        size: 5,
      });

      const bookings = res?.result?.data ?? res?.result ?? [];
      const first = Array.isArray(bookings) ? bookings[0] : null;

      if (first?.bookingId) {
        setCompletedBookingId(first.bookingId);
      }
    } catch (err) {
      console.error("Không thể kiểm tra booking COMPLETED:", err);
    }
  };

  const validateFilter = () => {
    if (!filter.date) {
      toast.error("Vui lòng chọn ngày");
      return false;
    }
    if (filter.start >= filter.end) {
      toast.error("Thời gian không hợp lệ");
      return false;
    }
    return true;
  };

  const getAvailableCopies = (room: Room) => {
    return room.roomCopies.filter((c) => c.roomCopyStatus === "AVAILABLE")
      .length;
  };

  const addRoom = (room: Room) => {
    if (!validateFilter()) return;

    const maxCopies = getAvailableCopies(room);

    setCart((prev) => {
      const index = prev.findIndex(
        (item) =>
          item.room.roomId === room.roomId &&
          item.date === filter.date &&
          item.startTime === filter.start &&
          item.endTime === filter.end,
      );

      if (index !== -1) {
        const copy = [...prev];
        copy[index].quantity = Math.min(copy[index].quantity + 1, maxCopies);
        return copy;
      }

      return [
        ...prev,
        {
          room,
          date: filter.date,
          startTime: filter.start,
          endTime: filter.end,
          quantity: 1,
        },
      ];
    });

    toast.success("Đã thêm phòng vào giỏ");
  };

  const increase = (index: number) => {
    setCart((prev) => {
      const copy = [...prev];
      const max = getAvailableCopies(copy[index].room);
      copy[index].quantity = Math.min(copy[index].quantity + 1, max);
      return copy;
    });
  };

  const decrease = (index: number) => {
    setCart((prev) => {
      const copy = [...prev];
      const qty = copy[index].quantity - 1;
      if (qty <= 0) copy.splice(index, 1);
      else copy[index].quantity = qty;
      return copy;
    });
  };

  // ✅ mở modal thay vì submit luôn
  const openBookingConfirm = () => {
    if (!cart.length) {
      toast.warning("Bạn chưa chọn phòng nào");
      return;
    }
    setOpenConfirm(true);
  };

  const submitBooking = async () => {
    // validate user
    if (!user?.userName) {
      toast.error("Thiếu tên người dùng");
      return;
    }

    if (!user?.phone) {
      toast.error("Vui lòng cập nhật số điện thoại trước khi đặt phòng");
      return;
    }

    try {
      const slotRequests = cart.map((item) => ({
        roomId: item.room.roomId,
        quantity: item.quantity,
        startTime: `${item.date}T${item.startTime}:00`,
        endTime: `${item.date}T${item.endTime}:00`,
      }));

      const payload = {
        userId: user?.userId,
        userName: user?.userName,
        userPhone: user?.phone,
        bookingType: "HOURLY",
        numberOfMonths: 0,
        note,
        slotRequests,
      };

      const res = await createBookingIntent(payload);

      if (res.code === 200) {
        toast.success(
          "Tạo booking thành công. Vui lòng thanh toán trong 15 phút",
        );
        navigate(`/customer/bookings/${res.result.bookingIntentId}`);
        setCart([]);
        setOpenConfirm(false);
        setNote("");
      } else {
        toast.error(res.message || "Đặt phòng thất bại");
      }
    } catch (err: any) {
      toast.error("Có lỗi xảy ra khi đặt phòng");
    }
  };

  if (!rental) return <p>Loading...</p>;

  const isOwner = user?.userId === rental?.ownerId;

  return (
    <div className="max-w-[1150px] mx-auto px-4 mt-3">
      <RentalGallery rental={rental} />

      <div className="grid grid-cols-12 gap-8 mt-6">
        <div className="col-span-8">
          <RentalInfo rental={rental} />
        </div>
        <div className="col-span-4">
          <HostCard rental={rental} />
        </div>
      </div>

      <Row gutter={24} style={{ marginTop: 32 }}>
        <Col span={24}>
          <BookingSearchBar filter={filter} setFilter={setFilter} />
        </Col>
      </Row>

      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col span={16}>
          <RoomCardList rooms={rental.rooms} onAddRoom={addRoom} />
        </Col>
        <Col span={8}>
          <BookingPanel
            cart={cart}
            increase={increase}
            decrease={decrease}
            onSubmit={openBookingConfirm} // ✅ đổi ở đây
          />
        </Col>
      </Row>

      <Modal
        title="Xác nhận đặt phòng"
        open={openConfirm}
        onCancel={() => setOpenConfirm(false)}
        onOk={submitBooking}
        okText="Xác nhận & thanh toán"
        cancelText="Hủy"
      >
        <Text strong>Danh sách phòng đã chọn:</Text>

        <List
          dataSource={cart}
          renderItem={(item) => (
            <List.Item>
              <div>
                <div>{item.room.name}</div>
                <div>
                  {item.date} | {item.startTime} - {item.endTime}
                </div>
                <div>Số lượng: {item.quantity}</div>
              </div>
            </List.Item>
          )}
        />

        <Divider />

        <Text strong>Ghi chú thêm:</Text>
        <TextArea
          rows={3}
          placeholder="Nhập yêu cầu thêm (nếu có)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Modal>

      <div className="mt-10">
        <ReviewSection
          rentalAreaId={rental.rentalAreaId}
          bookingId={completedBookingId}
          currentUserId={user?.userId}
          isOwner={isOwner}
        />
      </div>
    </div>
  );
}
